import { useProjectCotnext } from '@/app/(main)/(user-panel)/user/projects/context';
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Pagination,
  useDisclosure,
} from '@nextui-org/react';
import { color } from 'framer-motion';
import {
  useState,
  ChangeEvent,
  DragEvent,
  FC,
  Key,
  useRef,
  useEffect,
} from 'react';
import { AiOutlineBorderHorizontal } from 'react-icons/ai';
import { Button } from '../Buttons';
import { Search } from '../Form/search';
import {
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@nextui-org/react';
import { useQuery, useQueryClient } from 'react-query';
import {
  getListOFProjectNames,
  getListOFProjectRooms,
} from '@/app/(main)/(user-panel)/user/projects/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { format } from 'date-fns';
import Loader from '../DottedLoader/loader';
import { PresignedUserAvatar } from '@/components/common/PresignedUserAvatar';
import { uploadMedia } from '@/app/(main)/(user-panel)/user/chats/api';
import { chatSocket } from '@/app/helpers/user/socket.helper';
import { useSession } from 'next-auth/react';
import { PROJECTACTIONTYPE } from '@/app/helpers/user/enums';
import CustomModal from '../Custom_Modal';
import { CustomSearchSelect } from '../TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import FilterButton from '../TimeSheetApp/CommonComponents/FilterButton/FilterButton';
import { ProjectDetail } from '@/app/type/projects';
import CustomInfoModal from '../CustomDeleteModel';
import { getPresignedFileUrl } from '@/app/(main)/(user-panel)/user/file/api';
import DateRangePicker from '@/components/JobSafetyAnalysis/CreateNewComponents/JSA_Calender';

export function FilesSection({
  projectDetail,
}: {
  projectDetail: ProjectDetail | undefined;
}) {
  const { state, dispatch } = useProjectCotnext();
  const { onOpenChange } = useDisclosure();
  const [showUploadModel, setShowUploadModal] = useState(false);
  const [showUploadSection, setShowUploadSetion] = useState(false);
  const [showLoader, setLoader] = useState(false);
  const [projects, setProjects] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const [selectedProjectChannel, setProjectChannel] = useState<
    string | undefined
  >(undefined);

  const [hoveredUser, setHoveredUser] = useState<number | null>(null);
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string>('');
  const [showFilterModel, setShowFilterModel] = useState(false);
  const [isApplyFilter, setIsApplyFilter] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [deleteFileModalOpen, setDeleteFileModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{
    roomId: string;
    messageId: string;
  } | null>(null);
  const handleDropdown = (dropdownId: string) => {
    setOpenFilterDropdown(openFilterDropdown === dropdownId ? '' : dropdownId);
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string[]>([
    'all',
  ]);
  const [uploadedByFilter, setUploadedByFilter] = useState<string[]>(['all']);
  const [fileNameFilter, setFileNameFilter] = useState('');
  const [uploadedDateRange, setUploadedDateRange] = useState<
    { from?: Date; to?: Date } | undefined
  >(undefined);
  const [draftSelectedChannelFilter, setDraftSelectedChannelFilter] = useState<
    string[]
  >(['all']);
  const [draftUploadedByFilter, setDraftUploadedByFilter] = useState<string[]>([
    'all',
  ]);
  const [draftFileNameFilter, setDraftFileNameFilter] = useState('');
  const [draftUploadedDateRange, setDraftUploadedDateRange] = useState<
    { from?: Date; to?: Date } | undefined
  >(undefined);
  const [selectedFiles, setFile] = useState<
    {
      fileName: string;
      file: File;
      size: number;
      uploadingStatus: 'pending' | '100%' | 'failed';
      media?: {
        name: string;
        url: string;
        mimetype: string;
      };
    }[]
  >([]);
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      handleFileSelect(files);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files) {
      handleFileSelect(files);
    }
    // allow selecting the same file again after remove/failure
    e.target.value = '';
  };

  const handleFileSelect = async (files: FileList) => {
    const incomingFiles = Array.from(files);
    const existing = new Set(
      selectedFiles.map((f) => `${f.file.name}-${f.file.size}`)
    );
    const availableSlots = Math.max(0, 5 - selectedFiles.length);

    if (availableSlots <= 0) {
      alert('you can select only max 5 files');
      return;
    }

    const filesToUpload = incomingFiles
      .filter((f) => !existing.has(`${f.name}-${f.size}`))
      .slice(0, availableSlots);

    if (filesToUpload.length < incomingFiles.length) {
      alert('Max 5 unique files can be uploaded at once.');
    }

    for (const file of filesToUpload) {
      setFile((prev) => [
        ...prev,
        {
          file,
          fileName: file.name,
          size: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
          uploadingStatus: 'pending',
        },
      ]);

      try {
        const data = await uploadMedia({ axiosAuth, file });
        const media = data?.media?.[0];
        if (!media) throw new Error('Upload response missing media payload');

        setFile((prevFiles) =>
          prevFiles.map((prevFile) =>
            prevFile.file === file
              ? {
                  ...prevFile,
                  uploadingStatus: '100%',
                  media: {
                    name: media.name,
                    url: media.file,
                    mimetype: media.mimetype,
                  },
                }
              : prevFile
          )
        );
      } catch (error) {
        console.error('Error uploading file:', error);
        setFile((prevFiles) =>
          prevFiles.map((prevFile) =>
            prevFile.file === file
              ? { ...prevFile, uploadingStatus: 'failed' }
              : prevFile
          )
        );
      }
    }
  };
  const isUserSelected = (userId: string) =>
    projects?.some((user) => user == userId);

  // add or delete seleted teams

  const handleUserSelect = (userId: string) => {
    if ((projects ?? []).findIndex((user) => user === userId) !== -1) {
      setProjects(projects.filter((p) => p !== userId));
    } else {
      setProjects([...projects, userId]);
    }
  };
  const [search, setSearch] = useState('');
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const { data, isLoading } = useQuery({
    queryKey: 'pRoomList',
    queryFn: () => getListOFProjectRooms(axiosAuth, projectDetail?._id ?? ''),
  });
  const { data: project } = useQuery({
    queryKey: 'pRoomNameList',
    queryFn: () => getListOFProjectNames(axiosAuth, projectDetail?._id ?? ''),
  });

  // Listen for ProjectMessage and deleteProjectMessage socket events to refresh files list
  useEffect(() => {
    const handleNewMessage = (message: any) => {
      const newData = message['message'];
      // If it's a file message, refresh the files list
      if (newData && newData.mimetype === 'file') {
        queryClient.invalidateQueries('pRoomList');
      }
    };

    const handleDeleteMessage = (response: { id: string; userId: string }) => {
      // Refresh the files list when a message is deleted
      queryClient.invalidateQueries('pRoomList');
    };

    chatSocket.on('ProjectMessage', handleNewMessage);
    chatSocket.on('deleteProjectMessage', handleDeleteMessage);

    return () => {
      chatSocket.off('ProjectMessage', handleNewMessage);
      chatSocket.off('deleteProjectMessage', handleDeleteMessage);
    };
  }, [queryClient]);
  const clearFilters = () => {
    setSelectedChannelFilter(['all']);
    setUploadedByFilter(['all']);
    setUploadedDateRange(undefined);
    setFileNameFilter('');
    setDraftSelectedChannelFilter(['all']);
    setDraftUploadedByFilter(['all']);
    setDraftUploadedDateRange(undefined);
    setDraftFileNameFilter('');
    setIsApplyFilter(false);
    setOpenFilterDropdown('');
  };

  const areFiltersApplied = () => {
    const hasChannel = !draftSelectedChannelFilter.includes('all');
    const hasUploader = !draftUploadedByFilter.includes('all');
    const hasDate =
      !!draftUploadedDateRange?.from || !!draftUploadedDateRange?.to;
    const hasName = draftFileNameFilter.trim().length > 0;
    return hasChannel || hasUploader || hasDate || hasName;
  };

  const applyFilters = () => {
    setSelectedChannelFilter(draftSelectedChannelFilter);
    setUploadedByFilter(draftUploadedByFilter);
    setUploadedDateRange(draftUploadedDateRange);
    setFileNameFilter(draftFileNameFilter);
    setIsApplyFilter(
      !draftSelectedChannelFilter.includes('all') ||
        !draftUploadedByFilter.includes('all') ||
        !!draftUploadedDateRange?.from ||
        !!draftUploadedDateRange?.to ||
        draftFileNameFilter.trim().length > 0
    );
    setShowFilterModel(false);
  };

  useEffect(() => {
    if (!showFilterModel) return;
    setDraftSelectedChannelFilter(selectedChannelFilter);
    setDraftUploadedByFilter(uploadedByFilter);
    setDraftUploadedDateRange(uploadedDateRange);
    setDraftFileNameFilter(fileNameFilter);
  }, [
    showFilterModel,
    selectedChannelFilter,
    uploadedByFilter,
    uploadedDateRange,
    fileNameFilter,
  ]);

  const filterFiles =
    (data ?? [])
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })
      .filter((e) =>
        `${e?.media?.name}`.toLowerCase().includes(search.toLowerCase())
      )
      .filter((e) => {
        if (!selectedChannelFilter.includes('all')) {
          if (!selectedChannelFilter.includes(e.roomId)) return false;
        }
        if (!uploadedByFilter.includes('all')) {
          const isMe = e.sender._id === session?.user.user._id;
          const includeMe = uploadedByFilter.includes('me');
          const includeOthers = uploadedByFilter.includes('others');
          if ((isMe && !includeMe) || (!isMe && !includeOthers)) return false;
        }
        if (fileNameFilter.trim()) {
          if (
            !`${e?.media?.name}`
              .toLowerCase()
              .includes(fileNameFilter.trim().toLowerCase())
          ) {
            return false;
          }
        }
        if (uploadedDateRange?.from || uploadedDateRange?.to) {
          const fileDate = new Date(e.createdAt).getTime();
          const from = uploadedDateRange?.from
            ? new Date(uploadedDateRange.from).setHours(0, 0, 0, 0)
            : undefined;
          const to = uploadedDateRange?.to
            ? new Date(uploadedDateRange.to).setHours(23, 59, 59, 999)
            : undefined;
          if (from && fileDate < from) return false;
          if (to && fileDate > to) return false;
        }
        return true;
      }) ?? [];
  if (isLoading) {
    return <Loader />;
  }
  return (
    <>
      <div
        className="flex h-full min-h-[550px] w-full flex-col rounded-xl bg-white px-4 py-0 pb-6 lg:px-8 lg:py-4"
        style={{ boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px' }}
      >
        <div className="flex-1 overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 text-sm font-normal text-[#616161]">
                <tr className="max-h-[40px] w-full">
                  <th className="w-[30%] rounded-lg bg-[#F5F5F5] px-4 text-left">
                    File Name
                  </th>
                  <th className="hidden w-[20%] bg-[#F5F5F5] text-left sm:table-cell">
                    Channel
                  </th>
                  <th className="hidden w-[30%] bg-[#F5F5F5] text-left sm:table-cell">
                    Shared By
                  </th>

                  <th className="w-[220px] rounded-r-lg pr-2">
                    <div className="mx-2 flex items-center justify-end gap-2">
                      <FilterButton
                        isApplyFilter={isApplyFilter}
                        setShowModel={setShowFilterModel}
                        showModel={showFilterModel}
                        setOpenDropdown={setOpenFilterDropdown}
                        clearFilters={clearFilters}
                      />
                      <div className="w-[250px]">
                        <Search
                          key="files-search"
                          inputRounded={true}
                          type="text"
                          name="search"
                          className="h-[46px] border-1 bg-white placeholder:text-[#616161]"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search"
                        />
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm font-normal text-[#1E1E1E]">
                {(filterFiles ?? []).map((e, index) => {
                  return (
                    <tr
                      className="relative cursor-pointer border-b pr-2 even:bg-[#F5F5F5]"
                      key={e._id}
                    >
                      <>
                        <th className="w-[30%] rounded-lg px-4 text-left">
                          {e.media?.mimetype?.startsWith('image') ? (
                            <button
                              onClick={async () => {
                                if (!e.media?.url || !axiosAuth) return;
                                const url = await getPresignedFileUrl(
                                  axiosAuth,
                                  e.media.url
                                );
                                if (url) {
                                  setSelectedImageUrl(url);
                                  setImageModalOpen(true);
                                }
                              }}
                              className="cursor-pointer text-left text-primary-400 hover:text-primary-600 hover:underline"
                            >
                              {e.media?.name}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={async () => {
                                if (
                                  !e.media?.url ||
                                  !e.media?.name ||
                                  !axiosAuth
                                )
                                  return;
                                const url = await getPresignedFileUrl(
                                  axiosAuth,
                                  e.media.url
                                );
                                if (url) {
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = e.media?.name ?? '';
                                  link.target = '_blank';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }
                              }}
                              className="cursor-pointer text-left text-primary-400 hover:text-primary-600 hover:underline"
                            >
                              {e.media?.name}
                            </button>
                          )}
                        </th>

                        <td className="text-gray-400-500 whitespace-nowrap px-2 py-4 text-sm">
                          {project?.find((p) => p._id === e.roomId)?.appearName
                            ? `#${project.find((p) => p._id === e.roomId)?.appearName}`
                            : e.roomId}
                        </td>
                        <td className="hidden px-4 py-2 md:table-cell">
                          <div
                            className="flex items-center"
                            onMouseEnter={() => setHoveredUser(index)}
                            onMouseLeave={() => setHoveredUser(null)}
                          >
                            <PresignedUserAvatar
                              photo={e.sender.photo}
                              fallback="/images/User-profile.png"
                              alt="avatar"
                              className="mr-2 h-8 w-8 rounded-full border border-gray-500 text-[#616161]"
                            />
                            <span className="text-[#616161]">
                              {session?.user.user._id == e.sender._id ? (
                                <>Me</>
                              ) : (
                                <>{`${e.sender.firstName} ${e.sender.lastName}`}</>
                              )}
                            </span>
                          </div>
                          {hoveredUser === index && (
                            <div className="absolute top-8 z-20 mt-2 w-[300px] rounded-lg border bg-gray-50 p-4 text-xs text-[#616161] shadow-lg">
                              <div className="flex items-start">
                                <PresignedUserAvatar
                                  photo={e.sender.photo}
                                  fallback="/images/User-profile.png"
                                  alt="Avatar"
                                  className="h-10 w-10 flex-shrink-0 rounded-full border border-gray-500 bg-gray-200"
                                />
                                <div className="ml-4 space-y-2">
                                  <p className="text-sm font-semibold text-[#605f5f]">
                                    {`${e.sender.firstName} ${e.sender.lastName}`}
                                  </p>
                                  <div className="flex items-center gap-1">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      height="20px"
                                      viewBox="0 -960 960 960"
                                      width="20px"
                                      fill="#616161"
                                    >
                                      <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280 320-200v-80L480-520 160-720v80l320 200Z" />
                                    </svg>
                                    <p className="text-xs">
                                      ${e.sender.firstName}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      height="20px"
                                      viewBox="0 -960 960 960"
                                      width="20px"
                                      fill="#616161"
                                    >
                                      <path d="M80-120v-720h400v160h400v560H80Zm80-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h320v-400H480v80h80v80h-80v80h80v80h-80v80Zm160-240v-80h80v80h-80Zm0 160v-80h80v80h-80Z" />
                                    </svg>
                                    <p className="text-xs">
                                      ${e.sender.firstName}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="mt-3 hidden whitespace-nowrap px-6 py-4 text-left text-sm text-gray-800 md:block">
                          {`${format(new Date(e.createdAt), 'yyyy-MM-dd HH:mm')}`}
                        </td>

                        <td className="pr-2 text-right">
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
                              {e.media?.mimetype?.startsWith('image') ? (
                                <DropdownItem
                                  key="View"
                                  onPress={async () => {
                                    if (!e.media?.url || !axiosAuth) return;
                                    const url = await getPresignedFileUrl(
                                      axiosAuth,
                                      e.media.url
                                    );
                                    if (url) {
                                      setSelectedImageUrl(url);
                                      setImageModalOpen(true);
                                    }
                                  }}
                                >
                                  View
                                </DropdownItem>
                              ) : null}
                              <DropdownItem
                                key="Download"
                                onPress={async () => {
                                  if (
                                    !e.media?.url ||
                                    !e.media?.name ||
                                    !axiosAuth
                                  )
                                    return;
                                  const url = await getPresignedFileUrl(
                                    axiosAuth,
                                    e.media.url
                                  );
                                  if (url) {
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = e.media.name;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }
                                }}
                              >
                                Download
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                className="text-danger"
                                color="danger"
                                isDisabled={
                                  e.sender._id !== session?.user.user._id
                                }
                                onPress={() => {
                                  if (e.sender._id === session?.user.user._id) {
                                    setFileToDelete({
                                      roomId: e.roomId,
                                      messageId: e._id,
                                    });
                                    setDeleteFileModalOpen(true);
                                  }
                                }}
                              >
                                Delete
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </td>
                      </>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end py-3">
          <Button
            className="flex items-center gap-2 bg-[#0063F7] hover:bg-[#0063F7]"
            variant="primaryRounded"
            onClick={() => {
              setShowUploadModal(true);
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.20117 5.91211H13.6699V8.3457H8.20117V13.8691H5.76758V8.3457H0.3125V5.91211H5.76758V0.333984H8.20117V5.91211Z"
                fill="white"
              />
            </svg>
            Upload
          </Button>
        </div>
      </div>
      <CustomModal
        isOpen={showFilterModel}
        handleCancel={(open: boolean) => {
          if (open === false) setShowFilterModel(false);
        }}
        customCancelHandler={() => setShowFilterModel(false)}
        handleSubmit={applyFilters}
        submitValue="Apply"
        cancelButton="Cancel"
        cancelvariant="primaryOutLine"
        submitDisabled={!areFiltersApplied()}
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Filter By</h2>
            <p className="text-sm font-normal text-[#616161]">
              Filter by the following selections and options.
            </p>
          </div>
        }
        body={
          <div className="flex h-[500px] flex-col gap-5 overflow-y-auto pr-1">
            <div className="w-full">
              <CustomSearchSelect
                label="Channels"
                data={[
                  { label: 'All Channels', value: 'all' },
                  ...((project ?? []).map((channel) => ({
                    label: `#${channel.appearName}`,
                    value: channel._id,
                  })) ?? []),
                ]}
                showImage={false}
                multiple={false}
                returnSingleValueWithLabel={true}
                isOpen={openFilterDropdown === 'files-filter-channels'}
                onToggle={() => handleDropdown('files-filter-channels')}
                onSelect={(selected: any, item: any) => {
                  const value =
                    typeof selected === 'string'
                      ? selected
                      : selected?.value || item?.value || 'all';
                  setDraftSelectedChannelFilter([value]);
                }}
                selected={draftSelectedChannelFilter}
                placeholder="All Channels"
                searchPlaceholder="Search Channels"
              />
            </div>
            <div className="w-full">
              <DateRangePicker
                title="Date Range Uploaded"
                isForFilter={true}
                selectedDate={draftUploadedDateRange}
                handleOnConfirm={(from: Date, to: Date) => {
                  setDraftUploadedDateRange({ from, to });
                }}
              />
            </div>
            <div className="w-full">
              <label className="mb-2 ml-1 block text-base font-normal leading-[21.97px] text-[#1E1E1E]">
                File Name
              </label>
              <input
                type="text"
                placeholder="Enter File Name"
                value={draftFileNameFilter}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setDraftFileNameFilter(e.target.value)
                }
                className="h-[50px] w-full appearance-none rounded-xl border-2 border-[#E0E0E0] px-[15px] py-2.5 text-base font-normal leading-[22px] text-[#1E1E1E] placeholder:font-normal placeholder:text-[#616161] focus:outline-none"
              />
            </div>
            <div className="w-full">
              <CustomSearchSelect
                label="Uploaded By"
                data={[
                  { label: 'All', value: 'all' },
                  { label: 'Me', value: 'me' },
                  { label: 'Others', value: 'others' },
                ]}
                showImage={false}
                multiple={false}
                isOpen={openFilterDropdown === 'files-filter-uploaded-by'}
                onToggle={() => handleDropdown('files-filter-uploaded-by')}
                onSelect={(selected: any, item: any) => {
                  const value =
                    typeof selected === 'string'
                      ? selected
                      : selected?.value || item?.value || 'all';
                  setDraftUploadedByFilter([value]);
                }}
                selected={draftUploadedByFilter}
                placeholder="All"
                searchPlaceholder="Search Users"
              />
            </div>
          </div>
        }
      />
      <CustomModal
        isOpen={showUploadModel}
        header={
          <>
            <img src="/svg/chats/project_channel.svg" alt="" />
            <div>
              <h2 className="text-xl font-semibold text-[#1E1E1E]">
                {'Upload File'}
              </h2>
              <span className="mt-1 text-base font-normal text-[#616161]">
                Upload files to the project channel.
              </span>
            </div>
          </>
        }
        handleCancel={() => {
          setShowUploadModal(false);
          setShowUploadSetion(false);
          setProjects([]);
          setProjectChannel(undefined);
          setFile([]);
        }}
        body={
          <div className="flex h-[500px] flex-col overflow-auto px-3">
            <div className="mb-4">
              <CustomSearchSelect
                label="Project Channel"
                data={
                  (project ?? []).map((channel) => ({
                    label: `#${channel.appearName}`,
                    value: channel._id,
                  })) ?? []
                }
                showImage={false}
                multiple={false}
                showSearch={true}
                returnSingleValueWithLabel={true}
                isOpen={openFilterDropdown === 'dropdown1'}
                onToggle={() => handleDropdown('dropdown1')}
                onSelect={(selected: any, item: any) => {
                  // When returnSingleValueWithLabel is true, selected is the value directly (string)
                  // item contains the full object with label and value
                  const channelId =
                    typeof selected === 'string'
                      ? selected
                      : selected?.value || item?.value;
                  if (channelId) {
                    setProjectChannel(channelId);
                  }
                }}
                selected={
                  selectedProjectChannel ? [selectedProjectChannel] : []
                }
                isRequired={true}
                placeholder="Select Project Channel"
                searchPlaceholder="Search Project Channel"
              />
            </div>
            <div className="w-full rounded-lg">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="flex h-48 cursor-pointer flex-col items-center justify-between rounded-lg border-1 border-dashed border-gray-400 bg-gray-200 p-4 hover:bg-gray-50"
              >
                <div
                  className="mb-2 flex flex-col items-center justify-center"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                >
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 34 34"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.9193 25.3359V8.35677L9.5026 13.7734L6.58594 10.7526L17.0026 0.335938L27.4193 10.7526L24.5026 13.7734L19.0859 8.35677V25.3359H14.9193ZM4.5026 33.6693C3.35677 33.6693 2.37621 33.2616 1.56094 32.4464C0.745659 31.6311 0.337326 30.6498 0.335938 29.5026V23.2526H4.5026V29.5026H29.5026V23.2526H33.6693V29.5026C33.6693 30.6484 33.2616 31.6297 32.4464 32.4464C31.6311 33.263 30.6498 33.6707 29.5026 33.6693H4.5026Z"
                      fill="#616161"
                    />
                  </svg>
                  <div className="mt-4 text-center text-sm text-gray-600">
                    <p>Drag and Drop Files</p>
                    <h6>or</h6>
                    <h5 className="text-primary-700">Browse</h5>
                  </div>
                  <input
                    type="file"
                    multiple
                    onClick={() => {}}
                    onChange={handleInputChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                </div>
              </div>
              <div className="mt-2 flex justify-end text-gray-600">
                <p className="font-Open-Sans text-xs">
                  Max 5 Files (20MB each)
                </p>
              </div>

              <div className="mt-2 h-[240px] overflow-y-auto md:h-[236px]">
                {(selectedFiles ?? []).map((f, index) => {
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between truncate"
                    >
                      <div
                        // htmlFor={`image-${index}`}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <img
                          src={URL.createObjectURL(f.file)}
                          alt={`Image ${index}`}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <span className="truncate text-xs text-primary-600">
                          {f.file.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-xs font-semibold text-gray-600">
                          {f.uploadingStatus === '100%'
                            ? '100%'
                            : f.uploadingStatus === 'failed'
                              ? 'Failed'
                              : 'Uploading'}
                        </p>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          onClick={() => {
                            setFile(
                              selectedFiles.filter(
                                (ff) => ff.fileName !== f.fileName
                              )
                            );
                          }}
                          className="cursor-pointer"
                        >
                          <path
                            d="M10 1.25C5.125 1.25 1.25 5.125 1.25 10C1.25 14.875 5.125 18.75 10 18.75C14.875 18.75 18.75 14.875 18.75 10C18.75 5.125 14.875 1.25 10 1.25ZM13.375 14.375L10 11L6.625 14.375L5.625 13.375L9 10L5.625 6.625L6.625 5.625L10 9L13.375 5.625L14.375 6.625L11 10L14.375 13.375L13.375 14.375Z"
                            fill="#6990FF"
                          />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        }
        handleSubmit={() => {
          if (!selectedProjectChannel) {
            alert('Please select a project channel');
            return;
          }
          setLoader(true);
          selectedFiles.forEach((file) => {
            if (file.media) {
              chatSocket.emit(
                'privateProjectMessage',
                selectedProjectChannel,
                session?.user.user._id,
                '',
                'project',
                'file',
                {
                  name: file.media.name,
                  url: file.media.url,
                  mimetype: file.media.mimetype,
                }
              );
            }
          });

          // Invalidate queries after a short delay to allow server to process
          // The socket listener will also refresh when ProjectMessage is received
          setTimeout(() => {
            queryClient.invalidateQueries('pRoomList');
            queryClient.invalidateQueries('projectRooms');
          }, 500);

          setLoader(false);
          setShowUploadModal(false);
          setShowUploadSetion(false);
          setProjects([]);
          setFile([]);
          setProjectChannel(undefined);

          dispatch({
            type: PROJECTACTIONTYPE.SHOWDETAIL,
          });
        }}
        submitDisabled={
          !selectedProjectChannel ||
          selectedFiles.length === 0 ||
          !selectedFiles.every((file) => file.uploadingStatus === '100%')
        }
        isLoading={false}
        submitValue={'Add'}
      />

      {/* Image Preview Modal */}
      <Modal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        placement="center"
        backdrop="blur"
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span>Image Preview</span>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-gray-100"
                    aria-label="Close"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#616161"
                    >
                      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                    </svg>
                  </button>
                </div>
              </ModalHeader>
              <ModalBody className="flex items-center justify-center p-4">
                <img
                  src={selectedImageUrl}
                  alt="Preview"
                  className="max-h-[80vh] w-auto object-contain"
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete File Confirmation Modal */}
      <CustomInfoModal
        isOpen={deleteFileModalOpen}
        title="Delete File"
        subtitle="Are you sure you want to delete this file? This action cannot be undone."
        handleClose={() => {
          setDeleteFileModalOpen(false);
          setFileToDelete(null);
        }}
        onDeleteButton={() => {
          if (fileToDelete) {
            chatSocket.emit('deleteProjectMessage', {
              roomId: fileToDelete.roomId,
              userId: session?.user.user._id,
              messageId: fileToDelete.messageId,
            });
            // Invalidate queries to refresh the list
            queryClient.invalidateQueries('pRoomList');
            setDeleteFileModalOpen(false);
            setFileToDelete(null);
          }
        }}
        doneValue="Delete"
        variant="danger"
      />
    </>
  );
}
