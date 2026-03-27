'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSafetyHubContext } from '@/app/(main)/(user-panel)/user/apps/sh/sh_context';
import { getPresignedFileUrls } from '@/app/(main)/(user-panel)/user/file/api';
import { SAFETYHUBTYPE } from '@/app/helpers/user/enums';
import StagedImageUploadField from '@/components/apps/shared/StagedImageUploadField';
import { deleteUploadedAppImage } from '@/components/apps/shared/appImageUpload';
import {
  UseStagedImageUploadsReturn,
  getUploadedImageDisplayName,
  useStagedImageUploads,
} from '@/components/apps/shared/useStagedImageUploads';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useSession } from 'next-auth/react';

const SelectHazardImages = ({
  stagedUploads,
  uploadedImages,
  onRemoveUploadedImage,
}: {
  stagedUploads?: UseStagedImageUploadsReturn;
  uploadedImages?: string[];
  onRemoveUploadedImage?: (fileUrl: string) => void;
}) => {
  const { state, dispatch } = useSafetyHubContext();
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;
  const uploadedKeys = useMemo(
    () => uploadedImages ?? (state.selectedImages ?? []),
    [state.selectedImages, uploadedImages]
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
        type: SAFETYHUBTYPE.SELECTED_IMAGES,
        selectedImages: fileUrl,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  return (
    <StagedImageUploadField
      helperText="Images stay staged until you save the hazard or incident."
      onFilesSelected={(files) => uploadState.stageFiles(files)}
      onRemoveStaged={uploadState.removeStaged}
      onRemoveUploaded={(item) => handleRemoveUploaded(item.value)}
      stagedError={uploadState.errorMessage}
      stagedItems={uploadState.items}
      uploadedItems={uploadedItems}
    />
  );
};

export default SelectHazardImages;

function getLastSegment(url: string) {
  return getUploadedImageDisplayName(url);
}

export { getLastSegment };
