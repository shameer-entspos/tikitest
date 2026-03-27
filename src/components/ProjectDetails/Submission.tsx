import { getListOfSumbitApps } from '@/app/(main)/(user-panel)/user/projects/api';
import { useProjectCotnext } from '@/app/(main)/(user-panel)/user/projects/context';
import useAxiosAuth from '@/hooks/AxiosAuth';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react';
import { format } from 'date-fns';
import { color } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { SetStateAction, useState } from 'react';
import { AiOutlineBorderHorizontal } from 'react-icons/ai';
import { useQuery } from 'react-query';
import { Button } from '../Buttons';
import Loader from '../DottedLoader/loader';
import { Search } from '../Form/search';
import FilterButton from '../TimeSheetApp/CommonComponents/FilterButton/FilterButton';
import { formatDateTime } from '@/utils';
import { CustomSearchSelect } from '../TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import {
  getAllOrgUsers,
  getApps,
} from '@/app/(main)/(user-panel)/user/apps/api';
import { ProjectDetail } from '@/app/type/projects';
import DateRangePicker from '../JobSafetyAnalysis/CreateNewComponents/JSA_Calender';
import { getAppLogo } from '../popupModal/appListinApp';

export function SubmissionTab({
  projectDetail,
}: {
  projectDetail: ProjectDetail | undefined;
}) {
  const { state, dispatch } = useProjectCotnext();
  const axiosAuth = useAxiosAuth();
  const [isApplyFilter, setApplyFilter] = useState(false);
  const [showFilterModel, setShowFilterModel] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string>('');
  const [hoveredUser, setHoveredUser] = useState<number | null>(null);
  const [selectedSubmitBy, setSelectedSubmitBy] = useState<string[]>([]);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<
    { from: Date; to: Date } | undefined
  >(undefined);
  const [search, setSearch] = useState('');
  const { data: session } = useSession();
  const { data: users } = useQuery({
    queryKey: 'listofUsersForApp',
    queryFn: () => getAllOrgUsers(axiosAuth),
    refetchOnWindowFocus: false,
  });
  const { data, isLoading } = useQuery({
    queryKey: 'appSubmitList',
    queryFn: () => getListOfSumbitApps(axiosAuth, projectDetail?._id ?? ''),
  });
  const handleDropdown = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? '' : dropdownId);
  };
  // Filter handling
  const clearFilters = () => {
    setShowFilterModel(false);
    setApplyFilter(false);
    setSelectedSubmitBy([]);
    setSelectedApps([]);
    setSelectedDateRange(undefined);
  };

  const areFiltersApplied = () => {
    return (
      (selectedSubmitBy?.length ?? 0) > 0 ||
      (selectedApps?.length ?? 0) > 0 ||
      !!selectedDateRange
    );
  };
  const { data: apps } = useQuery({
    queryKey: 'apps',
    queryFn: () => getApps(axiosAuth),
  });
  const handleApplyFilters = () => {
    setShowFilterModel(!showFilterModel);
    if (areFiltersApplied()) {
      setApplyFilter(true);
    }
  };
  if (isLoading) {
    return <Loader />;
  }

  var filterFiles =
    (data ?? [])
      .filter((e) =>
        `${e?.submissionName}`.toLowerCase().includes(search.toLowerCase())
      )
      .filter((e) => {
        if ((selectedSubmitBy ?? []).length === 0) return true;
        if (selectedSubmitBy.includes('all')) return true;
        const submittedById = e.submittedBy?._id ?? '';
        return (selectedSubmitBy ?? []).includes(submittedById);
      })
      .filter((e) => {
        if ((selectedApps ?? []).length === 0) return true;
        return (selectedApps ?? []).includes(e.appName ?? '');
      })
      .filter((e) => {
        if (!selectedDateRange?.from || !selectedDateRange?.to) return true;
        const createdAt = e.createdAt ? new Date(e.createdAt) : undefined;
        if (!createdAt) return false;
        return (
          createdAt >= selectedDateRange.from &&
          createdAt <= selectedDateRange.to
        );
      }) ?? [];
  return (
    <>
      <div
        className="min-h-[500px] w-full rounded-xl bg-white px-4 py-0 pb-4 lg:px-8 lg:py-4 2xl:pb-2"
        style={{ boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px' }}
      >
        <div className="w-[1400px] table-auto 2xl:w-full">
          <div className="flex w-full gap-2">
            <div className="grid flex-1 grid-cols-4 gap-6 rounded-sm bg-[#F5F5F5] px-2 py-1 text-sm font-semibold text-gray-700">
              <p className="py-2 text-left">Submission</p>
              <p className="py-2 text-left">App Name</p>
              <p className="py-2 text-left">Submitted By</p>
              <p className="py-2 text-left">Date & Time</p>
            </div>
            <FilterButton
              isApplyFilter={isApplyFilter}
              setShowModel={setShowFilterModel}
              showModel={showFilterModel}
              setOpenDropdown={setOpenDropdown}
              clearFilters={clearFilters}
            />
          </div>

          {filterFiles.map((item, index) => {
            return (
              <div
                key={item._id}
                className="w-[1400px] table-auto odd:bg-[#F5F5F5] 2xl:w-full"
              >
                <div className="relative flex w-full items-center px-2">
                  <div className="grid flex-1 grid-cols-4 items-center gap-6 text-sm font-semibold text-gray-700">
                    <p className="py-2 text-left">{item.submissionName}</p>
                    <p className="py-2 text-left">{item.appName}</p>
                    <p className="py-2 text-left">
                      {' '}
                      <div
                        className="flex items-center"
                        onMouseEnter={() => setHoveredUser(index)}
                        onMouseLeave={() => setHoveredUser(null)}
                      >
                        <img
                          src={'/images/User-profile.png'}
                          alt="avatar"
                          className="mr-2 h-8 w-8 rounded-full border border-gray-500 text-[#616161]"
                        />
                        <span className="text-[#616161]">
                          {session?.user.user._id == item.submittedBy?._id ? (
                            <>Me</>
                          ) : (
                            <>{`${item.submittedBy?.firstName} ${item.submittedBy?.lastName}`}</>
                          )}
                        </span>
                      </div>
                      {hoveredUser === index && (
                        <div className="absolute top-8 z-20 mt-2 w-[300px] rounded-lg border bg-gray-50 p-4 text-xs text-[#616161] shadow-lg">
                          <div className="flex items-start">
                            <img
                              src={'/images/User-profile.png'}
                              alt="Avatar"
                              className="h-10 w-10 flex-shrink-0 rounded-full border border-gray-500 bg-gray-200"
                            />
                            <div className="ml-4 space-y-2">
                              <p className="text-sm font-semibold text-[#605f5f]">
                                {`${item.submittedBy?.firstName} ${item.submittedBy?.lastName}`}
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
                                  {item.submittedBy?.email}
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
                                  {item.submittedBy?.organization?.name}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </p>
                    <p className="flex gap-6 py-2 text-left">
                      <span>
                        {`${formatDateTime(item.createdAt ?? '')?.date || 'N/A'}`}
                      </span>
                      <span>
                        {`${formatDateTime(item.createdAt ?? '')?.time || 'N/A'}`}
                      </span>
                    </p>
                  </div>
                  <div className="py-2">
                    <button
                      className="rounded-xl bg-[#E2F3FF] px-3 py-1 text-sm"
                      onClick={() => {}}
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* filter model */}
      <Modal
        isOpen={showFilterModel}
        onOpenChange={() => setShowFilterModel(!showFilterModel)}
        placement="auto"
        size="xl"
        className="absolute h-[700px] px-8 py-2"
      >
        <ModalContent className="max-w-[600px] rounded-3xl bg-white">
          {(onCloseModal) => (
            <>
              <ModalHeader className="flex flex-row items-center gap-2 border-b-2 border-gray-200 px-1 py-5">
                <div>
                  <h2 className="text-xl font-semibold">Filter By</h2>
                  <p className="mt-1 text-sm font-normal text-[#616161]">
                    Filter by the following selections and options.
                  </p>
                </div>
              </ModalHeader>
              <ModalBody className="flex flex-col justify-start gap-8 overflow-y-scroll p-0 pb-16 pt-8 scrollbar-hide">
                <div className="w-full">
                  <CustomSearchSelect
                    label="App"
                    data={[
                      ...(apps ?? []).map((app) => ({
                        label: app.app.name ?? '',
                        value: app.app.name ?? '',
                        photo: getAppLogo({ logoType: app.app.type ?? '' }),
                      })),
                    ]}
                    showImage={true}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown3'}
                    onToggle={() => handleDropdown('dropdown3')}
                    onSelect={(selected: string[]) => {
                      setSelectedApps(selected);
                    }}
                    placeholder="-"
                    selected={selectedApps}
                  />
                </div>
                <div className="relative">
                  <DateRangePicker
                    title={'Date Range'}
                    isForFilter={true}
                    selectedDate={selectedDateRange}
                    handleOnConfirm={(from: any, to: any) => {
                      setSelectedDateRange({ from, to });
                    }}
                  />
                </div>
                <div className="w-full">
                  <CustomSearchSelect
                    label="Submitted By"
                    data={[
                      {
                        label: 'All Users',
                        value: 'all',
                      },
                      ...(users ?? [])
                        .filter((u) => u.role == 2 || u.role == 3)
                        .map((user) => ({
                          label: `${user.firstName} ${user.lastName}`,
                          value: user._id ?? '',
                        })),
                    ]}
                    showImage={false}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown2'}
                    onToggle={() => handleDropdown('dropdown2')}
                    onSelect={(selected: string[]) => {
                      setSelectedSubmitBy(selected);
                    }}
                    placeholder="-"
                    selected={selectedSubmitBy}
                  />
                </div>
              </ModalBody>
              <ModalFooter className="pt-0">
                <div className="flex w-full justify-center border-t-1 pt-8">
                  <Button
                    variant="primaryOutLine"
                    className="mr-4 rounded-lg border-2 border-[#0063F7] bg-transparent px-8 py-1 text-[#0063F7] duration-200"
                    onClick={clearFilters}
                  >
                    Reset
                  </Button>

                  <Button
                    variant="primary"
                    onClick={handleApplyFilters}
                    disabled={!areFiltersApplied()}
                  >
                    Apply
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
