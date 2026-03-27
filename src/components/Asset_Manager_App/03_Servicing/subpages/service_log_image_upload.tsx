'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAssetManagerAppsContext } from '@/app/(main)/(user-panel)/user/apps/am/am_context';
import { getPresignedFileUrls } from '@/app/(main)/(user-panel)/user/file/api';
import { AMAPPACTIONTYPE } from '@/app/helpers/user/enums';
import StagedImageUploadField from '@/components/apps/shared/StagedImageUploadField';
import { deleteUploadedAppImage } from '@/components/apps/shared/appImageUpload';
import {
  UseStagedImageUploadsReturn,
  getUploadedImageDisplayName,
  useStagedImageUploads,
} from '@/components/apps/shared/useStagedImageUploads';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useSession } from 'next-auth/react';

const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <button type="button" className="h-6 w-6" onClick={onClick}>
    <svg
      width="23"
      height="23"
      viewBox="0 0 23 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.5 0.5625C5.40625 0.5625 0.5625 5.40625 0.5625 11.5C0.5625 17.5938 5.40625 22.4375 11.5 22.4375C17.5938 22.4375 22.4375 17.5938 22.4375 11.5C22.4375 5.40625 17.5938 0.5625 11.5 0.5625ZM15.7188 16.9688L11.5 12.75L7.28125 16.9688L6.03125 15.7188L10.25 11.5L6.03125 7.28125L7.28125 6.03125L11.5 10.25L15.7188 6.03125L16.9688 7.28125L12.75 11.5L16.9688 15.7188L15.7188 16.9688Z"
        fill="#6990FF"
      />
    </svg>
  </button>
);

const ServiceLogImageUpload = ({
  handleCloseButton,
  stagedUploads,
  type = 'steps',
  uploadedImages,
  onRemoveUploadedImage,
}: {
  handleCloseButton?: () => void;
  stagedUploads?: UseStagedImageUploadsReturn;
  type?: 'steps' | 'comment';
  uploadedImages?: string[];
  onRemoveUploadedImage?: (fileUrl: string) => void;
}) => {
  const { state, dispatch } = useAssetManagerAppsContext();
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;
  const uploadedKeys = useMemo(
    () => uploadedImages ?? (state.logImages ?? []),
    [state.logImages, uploadedImages]
  );
  const localStagedUploads = useStagedImageUploads({
    existingCount: uploadedKeys.length,
    maxFiles: 5,
  });
  const uploadState = stagedUploads ?? localStagedUploads;
  const [resolvedUrls, setResolvedUrls] = useState<string[] | null>(null);

  useEffect(() => {
    if (!uploadedKeys.length || !accessToken?.trim()) {
      setResolvedUrls(null);
      return;
    }

    let cancelled = false;
    getPresignedFileUrls(axiosAuth, uploadedKeys, accessToken).then((urls) => {
      if (!cancelled && urls && urls.length === uploadedKeys.length) {
        setResolvedUrls(urls);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [accessToken, axiosAuth, uploadedKeys]);

  const uploadedItems = useMemo(
    () =>
      uploadedKeys.map((fileUrl, index) => ({
        label: getUploadedImageDisplayName(fileUrl),
        previewUrl: resolvedUrls?.[index] ?? fileUrl,
        value: fileUrl,
      })),
    [resolvedUrls, uploadedKeys]
  );

  const handleRemoveUploaded = async (fileUrl: string) => {
    try {
      const response = await deleteUploadedAppImage({
        axiosAuth,
        deleteEndpoint: 'user/app/jsa/deleteImage',
        fileUrl,
      });

      if (response.status !== 204) {
        return;
      }

      if (onRemoveUploadedImage) {
        onRemoveUploadedImage(fileUrl);
        return;
      }

      dispatch({
        type: AMAPPACTIONTYPE.SELECT_IMAGE,
        logImages: fileUrl,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  return (
    <StagedImageUploadField
      headerAction={
        type === 'comment' && handleCloseButton ? (
          <CloseButton onClick={handleCloseButton} />
        ) : undefined
      }
      helperText={
        type === 'comment'
          ? undefined
          : 'Selected images stay staged until this form is submitted.'
      }
      onFilesSelected={(files) => uploadState.stageFiles(files)}
      onRemoveStaged={uploadState.removeStaged}
      onRemoveUploaded={(item) => handleRemoveUploaded(item.value)}
      stagedError={uploadState.errorMessage}
      stagedItems={uploadState.items}
      uploadedItems={uploadedItems}
    />
  );
};

export default ServiceLogImageUpload;
