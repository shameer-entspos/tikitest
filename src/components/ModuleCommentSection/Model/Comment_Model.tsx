import {
  createJSAComment,
  JSAComment,
  updateteJSAComment,
} from '@/app/(main)/(user-panel)/user/apps/api';
import { getPresignedFileUrls } from '@/app/(main)/(user-panel)/user/file/api';
import StagedImageUploadField from '@/components/apps/shared/StagedImageUploadField';
import {
  deleteUploadedAppImage,
  uploadImageToApp,
} from '@/components/apps/shared/appImageUpload';
import {
  getUploadedImageDisplayName,
  useStagedImageUploads,
} from '@/components/apps/shared/useStagedImageUploads';
import useAxiosAuth from '@/hooks/AxiosAuth';
import CustomModal from '@/components/Custom_Modal';
import { useSession } from 'next-auth/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

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

const CreateCommentModel = ({
  appId,
  handleClose,
  moduleId,
  selectedComment,
}: {
  appId: string;
  moduleId: string;
  handleClose: () => void;
  selectedComment: JSAComment | undefined;
}) => {
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;
  const queryClient = useQueryClient();
  const textArea = useRef<HTMLTextAreaElement | null>(null);

  const isEditing = Boolean(selectedComment?._id);
  const commentImagesFingerprint = (selectedComment?.images ?? []).join('\0');
  const [text, setText] = useState(selectedComment?.content ?? '');
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    () => selectedComment?.images ?? []
  );
  const [selectedSection, setSection] = useState<'comment' | 'media'>(
    'comment'
  );
  const [resolvedUploadedUrls, setResolvedUploadedUrls] = useState<
    string[] | null
  >(null);
  const stagedUploads = useStagedImageUploads({
    existingCount: uploadedImages.length,
    maxFiles: 5,
  });
  const { clearStaged } = stagedUploads;

  useEffect(() => {
    setText(selectedComment?.content ?? '');
    setUploadedImages([...(selectedComment?.images ?? [])]);
    clearStaged();
    const hasImages = (selectedComment?.images?.length ?? 0) > 0;
    setSection(selectedComment?._id && hasImages ? 'media' : 'comment');
  }, [
    clearStaged,
    selectedComment?._id,
    commentImagesFingerprint,
    selectedComment?.content,
  ]);

  const showMediaPanel =
    selectedSection === 'media' || (isEditing && uploadedImages.length > 0);

  useEffect(() => {
    if (!uploadedImages.length || !accessToken?.trim()) {
      setResolvedUploadedUrls(null);
      return;
    }

    let cancelled = false;
    getPresignedFileUrls(axiosAuth, uploadedImages, accessToken).then(
      (urls) => {
        if (!cancelled && urls && urls.length === uploadedImages.length) {
          setResolvedUploadedUrls(urls);
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [accessToken, axiosAuth, uploadedImages]);

  const createCommentMutation = useMutation(createJSAComment, {
    onSuccess: () => {
      handleClose();
      queryClient.invalidateQueries(`comment${moduleId}`);
    },
  });

  const updateCommentMutation = useMutation(updateteJSAComment, {
    onSuccess: () => {
      handleClose();
      queryClient.invalidateQueries(`comment${moduleId}`);
    },
  });

  const uploadedItems = useMemo(
    () =>
      uploadedImages.map((fileUrl, index) => ({
        label: getUploadedImageDisplayName(fileUrl),
        previewUrl: resolvedUploadedUrls?.[index] ?? fileUrl,
        value: fileUrl,
      })),
    [resolvedUploadedUrls, uploadedImages]
  );

  const handleSubmit = async () => {
    let stagedImageUrls: string[] = [];

    try {
      stagedImageUrls = await stagedUploads.uploadPending<string>({
        onUploaded: async (fileUrl) => {
          setUploadedImages((currentImages) => [...currentImages, fileUrl]);
        },
        uploadFile: async (file, onProgress) =>
          uploadImageToApp({
            appId,
            axiosAuth,
            file,
            onProgress,
          }),
      });
    } catch {
      return;
    }

    const data = {
      content: text ?? '',
      images: [...uploadedImages, ...stagedImageUrls],
      appId,
      moduleId,
    };

    if (selectedComment?._id) {
      updateCommentMutation.mutate({
        axiosAuth,
        data,
        id: selectedComment._id,
      });
      return;
    }

    createCommentMutation.mutate({
      axiosAuth,
      data,
    });
  };

  // Create API requires non-empty content; update allows images-only edits.
  const canSubmit = isEditing
    ? text.trim().length > 0 ||
      uploadedImages.length > 0 ||
      stagedUploads.items.length > 0
    : text.trim().length > 0;

  return (
    <CustomModal
      isOpen={true}
      size="md"
      justifyButton="justify-end"
      header={<></>}
      body={
        <>
          {showMediaPanel && (
            <div className="pt-2">
              <StagedImageUploadField
                label="Images"
                headerAction={
                  !(isEditing && uploadedImages.length > 0) ? (
                    <CloseButton
                      onClick={() => {
                        setSection('comment');
                      }}
                    />
                  ) : undefined
                }
                helperText="Images stay staged until you save this comment."
                onFilesSelected={(files) => stagedUploads.stageFiles(files)}
                onRemoveStaged={stagedUploads.removeStaged}
                onRemoveUploaded={async (item) => {
                  try {
                    const response = await deleteUploadedAppImage({
                      axiosAuth,
                      deleteEndpoint: 'user/app/jsa/deleteImage',
                      fileUrl: item.value,
                    });

                    if (response.status === 204) {
                      setUploadedImages((currentImages) =>
                        currentImages.filter((image) => image !== item.value)
                      );
                    }
                  } catch (error) {
                    console.error('Error deleting file:', error);
                  }
                }}
                stagedError={stagedUploads.errorMessage}
                stagedItems={stagedUploads.items}
                uploadedItems={uploadedItems}
              />
            </div>
          )}
          <div className="mx-2 mt-4 md:mt-8">
            <div className="mb-8 md:mb-10">
              <textarea
                className="w-full resize-none text-xl placeholder-gray-400 focus:outline-none"
                rows={6}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                }}
                ref={textArea}
                maxLength={1000}
                placeholder="Write a Comment here"
              />
            </div>
          </div>
          <div className="flex w-full justify-between">
            {selectedSection === 'comment' && !showMediaPanel ? (
              <button
                type="button"
                className="cursor-pointer border-0 bg-transparent p-0"
                onClick={() => {
                  setSection('media');
                }}
                aria-label="Add images"
              >
                <svg
                  width="109"
                  height="20"
                  viewBox="0 0 109 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M33.5781 16L32.4609 12.8281H28.0938L26.9766 16H25L29.25 4.53125H31.3281L35.5703 16H33.5781ZM31.9766 11.2188L30.8906 8.09375C30.849 7.95833 30.7891 7.76823 30.7109 7.52344C30.6328 7.27344 30.5547 7.02083 30.4766 6.76562C30.3984 6.50521 30.3333 6.28646 30.2812 6.10938C30.2292 6.32292 30.1641 6.5625 30.0859 6.82812C30.013 7.08854 29.9401 7.33333 29.8672 7.5625C29.7995 7.79167 29.7474 7.96875 29.7109 8.09375L28.6172 11.2188H31.9766ZM40.1094 14.6719C40.349 14.6719 40.5859 14.651 40.8203 14.6094C41.0547 14.5625 41.2682 14.5078 41.4609 14.4453V15.8359C41.2578 15.9245 40.9948 16 40.6719 16.0625C40.349 16.125 40.013 16.1562 39.6641 16.1562C39.1745 16.1562 38.7344 16.0755 38.3438 15.9141C37.9531 15.7474 37.6432 15.4635 37.4141 15.0625C37.1849 14.6615 37.0703 14.1068 37.0703 13.3984V8.75H35.8906V7.92969L37.1562 7.28125L37.7578 5.42969H38.9141V7.35156H41.3906V8.75H38.9141V13.375C38.9141 13.8125 39.0234 14.138 39.2422 14.3516C39.4609 14.5651 39.75 14.6719 40.1094 14.6719ZM46.4375 14.6719C46.6771 14.6719 46.9141 14.651 47.1484 14.6094C47.3828 14.5625 47.5964 14.5078 47.7891 14.4453V15.8359C47.5859 15.9245 47.3229 16 47 16.0625C46.6771 16.125 46.3411 16.1562 45.9922 16.1562C45.5026 16.1562 45.0625 16.0755 44.6719 15.9141C44.2812 15.7474 43.9714 15.4635 43.7422 15.0625C43.513 14.6615 43.3984 14.1068 43.3984 13.3984V8.75H42.2188V7.92969L43.4844 7.28125L44.0859 5.42969H45.2422V7.35156H47.7188V8.75H45.2422V13.375C45.2422 13.8125 45.3516 14.138 45.5703 14.3516C45.7891 14.5651 46.0781 14.6719 46.4375 14.6719ZM52.9375 7.1875C54.0312 7.1875 54.8568 7.42969 55.4141 7.91406C55.9766 8.39844 56.2578 9.15365 56.2578 10.1797V16H54.9531L54.6016 14.7734H54.5391C54.2943 15.0859 54.0417 15.3438 53.7812 15.5469C53.5208 15.75 53.2188 15.901 52.875 16C52.5365 16.1042 52.1224 16.1562 51.6328 16.1562C51.1172 16.1562 50.6562 16.0625 50.25 15.875C49.8438 15.6823 49.5234 15.3906 49.2891 15C49.0547 14.6094 48.9375 14.1146 48.9375 13.5156C48.9375 12.625 49.2682 11.9557 49.9297 11.5078C50.5964 11.0599 51.6016 10.8125 52.9453 10.7656L54.4453 10.7109V10.2578C54.4453 9.65885 54.3047 9.23177 54.0234 8.97656C53.7474 8.72135 53.3568 8.59375 52.8516 8.59375C52.4193 8.59375 52 8.65625 51.5938 8.78125C51.1875 8.90625 50.7917 9.0599 50.4062 9.24219L49.8125 7.94531C50.2344 7.72135 50.7135 7.53906 51.25 7.39844C51.7917 7.25781 52.3542 7.1875 52.9375 7.1875ZM54.4375 11.8672L53.3203 11.9062C52.4036 11.9375 51.7604 12.0938 51.3906 12.375C51.0208 12.6562 50.8359 13.0417 50.8359 13.5312C50.8359 13.9583 50.9635 14.2708 51.2188 14.4688C51.474 14.6615 51.8099 14.7578 52.2266 14.7578C52.862 14.7578 53.388 14.5781 53.8047 14.2188C54.2266 13.8542 54.4375 13.3203 54.4375 12.6172V11.8672ZM62.3125 16.1562C61.4948 16.1562 60.7865 15.9974 60.1875 15.6797C59.5885 15.362 59.1276 14.875 58.8047 14.2188C58.4818 13.5625 58.3203 12.7292 58.3203 11.7188C58.3203 10.6667 58.4974 9.80729 58.8516 9.14062C59.2057 8.47396 59.6953 7.98177 60.3203 7.66406C60.9505 7.34635 61.6719 7.1875 62.4844 7.1875C63 7.1875 63.4661 7.23958 63.8828 7.34375C64.3047 7.44271 64.6615 7.5651 64.9531 7.71094L64.4062 9.17969C64.0885 9.04948 63.763 8.9401 63.4297 8.85156C63.0964 8.76302 62.776 8.71875 62.4688 8.71875C61.9635 8.71875 61.5417 8.83073 61.2031 9.05469C60.8698 9.27865 60.6198 9.61198 60.4531 10.0547C60.2917 10.4974 60.2109 11.0469 60.2109 11.7031C60.2109 12.3385 60.2943 12.875 60.4609 13.3125C60.6276 13.7448 60.875 14.0729 61.2031 14.2969C61.5312 14.5156 61.9349 14.625 62.4141 14.625C62.888 14.625 63.3125 14.5677 63.6875 14.4531C64.0625 14.3385 64.4167 14.1901 64.75 14.0078V15.6016C64.4219 15.7891 64.0703 15.9271 63.6953 16.0156C63.3203 16.1094 62.8594 16.1562 62.3125 16.1562ZM68.6172 3.84375V6.89844C68.6172 7.21615 68.6068 7.52604 68.5859 7.82812C68.5703 8.13021 68.5521 8.36458 68.5312 8.53125H68.6328C68.8151 8.22917 69.0391 7.98177 69.3047 7.78906C69.5703 7.59115 69.8672 7.44271 70.1953 7.34375C70.5286 7.24479 70.8828 7.19531 71.2578 7.19531C71.9193 7.19531 72.4818 7.30729 72.9453 7.53125C73.4089 7.75 73.763 8.09115 74.0078 8.55469C74.2578 9.01823 74.3828 9.61979 74.3828 10.3594V16H72.5469V10.7031C72.5469 10.0312 72.4089 9.52865 72.1328 9.19531C71.8568 8.85677 71.4297 8.6875 70.8516 8.6875C70.2943 8.6875 69.8516 8.80469 69.5234 9.03906C69.2005 9.26823 68.9688 9.60938 68.8281 10.0625C68.6875 10.5104 68.6172 11.0573 68.6172 11.7031V16H66.7812V3.84375H68.6172ZM83.1562 16H81.2969V4.57812H87.75V6.15625H83.1562V9.71875H87.4531V11.2891H83.1562V16ZM91.4766 7.35156V16H89.6406V7.35156H91.4766ZM90.5703 4.03906C90.8516 4.03906 91.0938 4.11458 91.2969 4.26562C91.5052 4.41667 91.6094 4.67708 91.6094 5.04688C91.6094 5.41146 91.5052 5.67188 91.2969 5.82812C91.0938 5.97917 90.8516 6.05469 90.5703 6.05469C90.2786 6.05469 90.0312 5.97917 89.8281 5.82812C89.6302 5.67188 89.5312 5.41146 89.5312 5.04688C89.5312 4.67708 89.6302 4.41667 89.8281 4.26562C90.0312 4.11458 90.2786 4.03906 90.5703 4.03906ZM95.9531 16H94.1094V3.84375H95.9531V16ZM102.023 7.1875C102.794 7.1875 103.456 7.34635 104.008 7.66406C104.56 7.98177 104.984 8.43229 105.281 9.01562C105.578 9.59896 105.727 10.2969 105.727 11.1094V12.0938H99.9531C99.974 12.9323 100.198 13.5781 100.625 14.0312C101.057 14.4844 101.661 14.7109 102.438 14.7109C102.99 14.7109 103.484 14.6589 103.922 14.5547C104.365 14.4453 104.82 14.2865 105.289 14.0781V15.5703C104.857 15.7734 104.417 15.9219 103.969 16.0156C103.521 16.1094 102.984 16.1562 102.359 16.1562C101.51 16.1562 100.763 15.9922 100.117 15.6641C99.4766 15.3307 98.974 14.8359 98.6094 14.1797C98.25 13.5234 98.0703 12.7083 98.0703 11.7344C98.0703 10.7656 98.2344 9.94271 98.5625 9.26562C98.8906 8.58854 99.3516 8.07292 99.9453 7.71875C100.539 7.36458 101.232 7.1875 102.023 7.1875ZM102.023 8.57031C101.445 8.57031 100.977 8.75781 100.617 9.13281C100.263 9.50781 100.055 10.0573 99.9922 10.7812H103.93C103.924 10.349 103.852 9.96615 103.711 9.63281C103.576 9.29948 103.367 9.03906 103.086 8.85156C102.81 8.66406 102.456 8.57031 102.023 8.57031Z"
                    fill="#6990FF"
                  />
                  <path
                    d="M11.6654 1.66406H4.9987C4.55667 1.66406 4.13275 1.83966 3.82019 2.15222C3.50763 2.46478 3.33203 2.8887 3.33203 3.33073V16.6641C3.33203 17.1061 3.50763 17.53 3.82019 17.8426C4.13275 18.1551 4.55667 18.3307 4.9987 18.3307H14.9987C15.4407 18.3307 15.8646 18.1551 16.1772 17.8426C16.4898 17.53 16.6654 17.1061 16.6654 16.6641V6.66406L11.6654 1.66406ZM14.9987 16.6641H4.9987V3.33073H10.832V7.4974H14.9987V16.6641Z"
                    fill="#6990FF"
                  />
                </svg>
              </button>
            ) : (
              <div className="min-w-0 flex-1" />
            )}
            <div className="ml-4 md:ml-12">
              {`${1000 - text.length}`} Characters Left
            </div>
          </div>
        </>
      }
      showHeader={false}
      handleCancel={handleClose}
      handleSubmit={handleSubmit}
      submitValue={isEditing ? 'Update' : 'Create'}
      cancelButton="Cancel"
      submitDisabled={!canSubmit}
      isLoading={
        createCommentMutation.isLoading || updateCommentMutation.isLoading
      }
    />
  );
};

export default CreateCommentModel;
