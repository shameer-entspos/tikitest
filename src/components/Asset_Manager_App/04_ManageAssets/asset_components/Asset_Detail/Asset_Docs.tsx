import { dateFormat } from '@/app/helpers/dateFormat';
import { SingleAsset } from '@/app/type/single_asset';
import { Button } from '@/components/Buttons';
import Loader from '@/components/DottedLoader/loader';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import UploadDocsAsset from './Upload_Docs_Asset';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useMutation } from 'react-query';
import { useState } from 'react';
import { updateAsset } from '@/app/(main)/(user-panel)/user/apps/am/api';
import { useAssetManagerAppsContext } from '@/app/(main)/(user-panel)/user/apps/am/am_context';
import { useSession } from 'next-auth/react';
import { getLastSegment } from '../Select_Asset_Images';
import UserCard from '@/components/UserCard';
import { PaginationComponent } from '@/components/pagination';
import { uploadImageToApp } from '@/components/apps/shared/appImageUpload';
import { useStagedImageUploads } from '@/components/apps/shared/useStagedImageUploads';

export default function AssetDocsList({
  data,
  refetch,
}: {
  data: SingleAsset | undefined;
  refetch: any;
}) {
  const { data: session } = useSession();
  const context = useAssetManagerAppsContext();
  const [hoveredUser, setHoveredUser] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('desc');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const stagedUploads = useStagedImageUploads({
    existingCount: uploadedImages.length,
    maxFiles: 5,
  });
  const axiosAuth = useAxiosAuth();
  const uploadImageMutation = useMutation(updateAsset, {
    onSuccess: () => {
      refetch();
      setIsOpen(false);
      setUploadedImages([]);
      stagedUploads.clearStaged();
    },
  });

  // create here logic for total pages for paginationo and current page data and provide also button for data manage
  const allDocs = data?.docs ?? [];
  const [currentPage, setCurrentPage] = useState<number>(
    allDocs.length > 0 ? 1 : 0
  );
  const projectsPerPage = 10;
  const totalPages = Math.ceil(allDocs.length / projectsPerPage);
  const paginatedDocs = allDocs.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <div className="mx-2 my-2 flex flex-col rounded-lg border-2 bg-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
        <div className="grid grid-cols-12 flex-wrap items-start px-4 py-2 text-sm font-semibold text-[#616161]">
          <span className="col-span-4 px-2 md:col-span-6">Full Name</span>
          <span className="col-span-2 px-2">Shared By</span>
          <span className="col-span-2 flex items-center gap-1">
            Upload Date
            <svg
              onClick={() => {
                setSortBy(sortBy === 'asc' ? 'desc' : 'asc');
              }}
              className="cursor-pointer"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.9373 3L12.8623 3.00525C12.7274 3.0234 12.6036 3.08988 12.5139 3.19236C12.4243 3.29483 12.3749 3.42635 12.3748 3.5625V13.0815L9.9598 10.668L9.8968 10.614C9.78265 10.5292 9.64059 10.4907 9.49922 10.5064C9.35786 10.5221 9.22768 10.5907 9.1349 10.6985C9.04212 10.8063 8.99362 10.9453 8.99917 11.0874C9.00471 11.2295 9.0639 11.3643 9.1648 11.4645L12.5428 14.8395L12.6058 14.8935C12.7142 14.9735 12.8476 15.012 12.982 15.002C13.1163 14.9919 13.2426 14.934 13.3378 14.8387L16.7106 11.4637L16.7646 11.4008C16.8448 11.2923 16.8834 11.1587 16.8734 11.0242C16.8633 10.8897 16.8053 10.7633 16.7098 10.668L16.6468 10.614C16.5384 10.5338 16.4048 10.4951 16.2703 10.5052C16.1357 10.5152 16.0093 10.5733 15.9141 10.6688L13.4998 13.0845V3.5625L13.4953 3.486C13.4768 3.35133 13.4102 3.22792 13.3077 3.13858C13.2053 3.04923 13.0732 3.00001 12.9373 3ZM4.66105 3.165L1.2898 6.53625L1.23505 6.59925C1.15501 6.7076 1.11652 6.84108 1.12657 6.97541C1.13661 7.10974 1.19454 7.23601 1.2898 7.33125L1.3528 7.386C1.46115 7.46603 1.59463 7.50453 1.72896 7.49448C1.86329 7.48443 1.98956 7.42651 2.0848 7.33125L4.49755 4.91775V14.4412L4.50355 14.5177C4.52204 14.6524 4.58866 14.7758 4.6911 14.8652C4.79354 14.9545 4.92487 15.0037 5.0608 15.0037L5.13655 14.9985C5.27135 14.9802 5.39495 14.9136 5.48444 14.8112C5.57394 14.7087 5.62327 14.5773 5.6233 14.4412L5.62255 4.91925L8.0398 7.332L8.1028 7.386C8.21703 7.46979 8.35867 7.50739 8.49942 7.49128C8.64016 7.47518 8.76965 7.40657 8.86201 7.29915C8.95437 7.19173 9.00279 7.05342 8.99761 6.91185C8.99243 6.77028 8.93402 6.63588 8.83405 6.5355L5.45605 3.165L5.3923 3.111C5.28395 3.03096 5.15047 2.99247 5.01614 3.00252C4.88181 3.01257 4.75554 3.07049 4.6603 3.16575"
                fill="#0063F7"
              />
            </svg>
          </span>
        </div>
      </div>
      <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
        {/* form top  */}

        <div className="h-[500px] overflow-y-auto">
          {paginatedDocs
            .sort((a, b) => {
              if (sortBy == 'asc') {
                return (
                  new Date(a.uploadedAt ?? 0).getTime() -
                  new Date(b.uploadedAt ?? 0).getTime()
                );
              } else {
                return (
                  new Date(b.uploadedAt ?? 0).getTime() -
                  new Date(a.uploadedAt ?? 0).getTime()
                );
              }
            })
            .map((item, index) => {
              return (
                <div
                  key={index}
                  className="grid w-full cursor-pointer grid-cols-12 flex-row items-center justify-between border-b text-sm font-normal text-[#1E1E1E] even:bg-[#F5F5F5]"
                >
                  <span className="col-span-4 w-64 px-2 py-2 text-primary-500 md:col-span-6">
                    {getLastSegment(item.image)}
                  </span>

                  <span className="col-span-2 flex cursor-pointer items-center px-2 py-2">
                    <UserCard submittedBy={item.sharedBy} index={0} />
                  </span>

                  <span className="col-span-2 px-2 py-2">
                    <div>{dateFormat(item.uploadedAt?.toString() ?? '')}</div>
                  </span>
                  <span className="col-span-1 flex cursor-pointer justify-end p-2">
                    <Dropdown placement="bottom-end">
                      <DropdownTrigger>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="24px"
                          fill="#616161"
                          className="hover:fill-[#8d8d8d]"
                        >
                          <path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z" />
                        </svg>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Dynamic Actions">
                        <DropdownItem
                          key="download"
                          onPress={() => {
                            window.open(item.image, '_blank');
                          }}
                        >
                          Download
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          onPress={() => {
                            uploadImageMutation.mutate({
                              axiosAuth,
                              id: data?._id,
                              data: {
                                docs: [
                                  ...(data?.docs ?? [])
                                    .filter((i: any, ind) => ind !== index)
                                    .map((item: any) => {
                                      return {
                                        sharedBy: item.sharedBy._id,
                                        image: item.image,
                                        uploadedAt: item.uploadedAt,
                                      };
                                    }),
                                ],
                              },
                            });
                          }}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </span>
                </div>
              );
            })}
        </div>

        <div className="flex items-center justify-between border-t-2 border-gray-200 px-3 py-2">
          <div className="font-Open-Sans text-sm font-normal text-[#616161]">
            Items per page: 10
          </div>
          <div>
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          </div>
          <div></div>
        </div>
        {/* todo add functionality later on */}
        <div className="relative flex-1">
          <div className="absolute bottom-2 right-6">
            <Button
              variant="primaryRounded"
              onClick={() => {
                setIsOpen(!isOpen);
              }}
            >
              {'+ Add'}
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={() => setIsOpen(false)}
        placement="top-center"
        size="xl"
      >
        <ModalContent className="max-w-[600px] rounded-3xl bg-white">
          {(onCloseModal) => (
            <>
              <ModalHeader className="flex flex-row items-start gap-2 px-5 py-5"></ModalHeader>
              <ModalBody className="my-4">
                <UploadDocsAsset
                  onRemoveUploadedImage={(fileUrl) => {
                    setUploadedImages((currentImages) =>
                      currentImages.filter((image) => image !== fileUrl)
                    );
                  }}
                  stagedUploads={stagedUploads}
                  uploadedImages={uploadedImages}
                />
              </ModalBody>
              <ModalFooter className="border-t-2 border-gray-200">
                <Button
                  variant="primaryOutLine"
                  onClick={() => {
                    setIsOpen(!isOpen);
                    setUploadedImages([]);
                    stagedUploads.clearStaged();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={async () => {
                    let stagedImageUrls: string[] = [];

                    try {
                      stagedImageUrls = await stagedUploads.uploadPending<string>({
                        onUploaded: async (fileUrl) => {
                          setUploadedImages((currentImages) => [
                            ...currentImages,
                            fileUrl,
                          ]);
                        },
                        uploadFile: async (file, onProgress) =>
                          uploadImageToApp({
                            appId: data?._id ?? '',
                            axiosAuth,
                            file,
                            onProgress,
                          }),
                      });
                    } catch {
                      return;
                    }

                    uploadImageMutation.mutate({
                      axiosAuth,
                      id: data?._id,
                      data: {
                        docs: [
                          ...(data?.docs ?? []).map((item: any) => {
                            return {
                              sharedBy: item.sharedBy._id,
                              image: item.image,
                              uploadedAt: item.uploadedAt,
                            };
                          }),
                          ...[...uploadedImages, ...stagedImageUrls].map(
                            (item: any) => {
                              return {
                                sharedBy: session?.user.user._id,
                                image: item,
                                uploadedAt: new Date(),
                              };
                            }
                          ),
                        ],
                      },
                    });
                  }}
                >
                  {uploadImageMutation.isLoading ? <Loader /> : 'Upload'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
