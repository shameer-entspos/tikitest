import { useMemo, useState } from 'react';
import { SRTopBar } from './SR_Top_Bar';
import { Switch } from '@material-tailwind/react';
import { Search } from '../Form/search';
import { Button } from '../Buttons';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react';
import RollCallSteps from './Roll_Call_Forms';
import { useSRAppCotnext } from '@/app/(main)/(user-panel)/user/apps/sr/sr_context';
import { SR_APP_ACTION_TYPE } from '@/app/helpers/user/enums';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  checkSRPermission,
  deleteRollCallSubmission,
  getAllSRList,
  listRollCall,
} from '@/app/(main)/(user-panel)/user/apps/sr/api';
import { useRouter } from 'next/navigation';
import { AxiosInstance } from 'axios';
import Loader from '../DottedLoader/loader';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import AdminSwitch from '../AdminSwitch/AdminSwitch';
import FilterButton from '../TimeSheetApp/CommonComponents/FilterButton/FilterButton';
import { useSession } from 'next-auth/react';
import { RollCall } from '@/app/type/roll_call';
import DateRangePicker from '../JobSafetyAnalysis/CreateNewComponents/JSA_Calender';
import { CustomSearchSelect } from '../TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { getAllAppProjects } from '@/app/(main)/(user-panel)/user/apps/api';
import { SimpleInput } from '../Form/simpleInput';
import MultiRollcallModel from './Models/SR_Detail/RollCallMultipleDelete';
import { pdf } from '@react-pdf/renderer';
import { ROLL_CALL_PDF } from '../pdfs/ROLL_CALL_PDF';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';
import ShareAsChatAppModel from '../Share_As_Chat_App';
import { PresignedUserAvatar } from '@/components/common/PresignedUserAvatar';
import { generateSecureToken } from '@/app/helpers/token_generator';

export default function RollCallSubmissions() {
  const router = useRouter();
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const context = useSRAppCotnext();
  // Check if user is Root User from session (role 3 = Organization Admin)
  const isRootUser = (session?.user as any)?.role === 3;

  // Check app-level permission (backend already checks global apps permission and returns adminMode: true if user has it)
  const { data: permission } = useQuery('SRSettingPermission', () =>
    checkSRPermission(axiosAuth)
  );

  // User can use Admin Mode if Root User or has permission (which includes global apps permission)
  const canUseAdminMode = isRootUser || permission?.adminMode === true;
  const memoizedTopBar = useMemo(() => <SRTopBar />, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminMode, setAdminMode] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string>('');
  const [hoveredUser, setHoveredUser] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('View All');
  const { state, dispatch } = useSRAppCotnext();

  const [showModel, setShowModel] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [showChatModel, setShowChatModel] = useState(false);
  const [selectedRollCallForChat, setSelectedRollCallForChat] =
    useState<RollCall | null>(null);
  const queryClient = useQueryClient();
  const handleShowModel = (id: string) => {
    setDeleteItemId(id);
    setShowModel(!showModel);
  };
  const { data: users } = useQuery({
    queryKey: 'allSRList',
    queryFn: () => getAllSRList({ axiosAuth }),
  });
  const deleteRollCallMutation = useMutation(deleteRollCallSubmission, {
    onSuccess: () => {
      setShowModel(false);
      queryClient.invalidateQueries('rollcalls');
    },
  });
  const confirmDelete = async () => {
    if (deleteItemId) {
      deleteRollCallMutation.mutate({ id: deleteItemId, axiosAuth });
      // Close the modal after deleting
      // Add any necessary re-fetch or state updates here to reflect the deletion
    }
  };

  const handleToggleDropdown = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? '' : dropdownId);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['rollcalls', adminMode],
    queryFn: () => listRollCall({ axiosAuth, isAdmin: adminMode }),
    enabled: true,
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryFn: () => getAllAppProjects(axiosAuth),
    queryKey: ['allProjects'],
  });

  // multi selection handling

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showSelectedItemsModal, setShowSelectedItemsModal] = useState(false);
  const openSelectedItemsModal = () => {
    setShowSelectedItemsModal(true);
  };
  const [selectedSubmissions, setCheckedSubmissions] = useState<RollCall[]>([]);
  const handleCancel = () => {
    setCheckedSubmissions([]);
    setIsSelectMode(false); // Exit select mode
  };

  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
  };

  const handleSelectAllChange = () => {
    if ((filterData ?? []).length == (selectedSubmissions ?? []).length) {
      handleCancel();
    } else {
      setCheckedSubmissions([...(filterData ?? [])]);
    }
  };

  const handleCheckboxChange = (rc: RollCall) => {
    if (selectedSubmissions.some((selectedTs) => selectedTs._id === rc._id)) {
      setCheckedSubmissions([
        ...(selectedSubmissions ?? []).filter(
          (selectedTs) => selectedTs._id !== rc._id
        ),
      ]);
    } else {
      setCheckedSubmissions([...(selectedSubmissions ?? []), rc]);
    }
  };

  /** PDF generate API (express-tiki): pass Roll Call id, backend returns PDF from template */
  const PDF_ROLLCALL_GENERATE_PATH = 'user/pdf/rollcall/generate';

  const handleDownloadPDF = async (item: RollCall) => {
    if (!item) {
      toast.error('No data available to generate PDF');
      return;
    }

    try {
      toast.loading('Generating PDF...', { className: 'text-primary-500' });
      const params = new URLSearchParams({ id: item._id });
      const response = await axiosAuth.get(
        `${PDF_ROLLCALL_GENERATE_PATH}?${params.toString()}`,
        { responseType: 'blob' }
      );
      toast.remove();
      const blob = response.data as Blob;
      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
      const timeMs = response.headers['x-pdf-generation-time-ms'];
      toast.success(
        timeMs
          ? `PDF opened (generated in ${timeMs} ms)`
          : 'PDF opened in new tab'
      );
    } catch (error) {
      toast.remove();
      try {
        toast.loading('Generating PDF...', { className: 'text-primary-500' });
        const blob = await pdf(<ROLL_CALL_PDF data={item} />).toBlob();
        toast.remove();
        const fileName = `roll-call-${item.rollNumber || item._id}.pdf`;
        saveAs(blob, fileName);
        const pdfUrl = URL.createObjectURL(blob);
        window.open(pdfUrl, '_blank', 'noopener,noreferrer');
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
        toast.success('PDF generated successfully');
      } catch (fallbackError) {
        toast.remove();
        toast.error('Failed to generate PDF');
        console.error('Failed to generate PDF', error);
      }
    }
  };

  // Filter handling

  const [isApplyFilter, setApplyFilter] = useState(false);
  const [showFilterModel, setShowFilterModel] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [siteId, setSiteId] = useState('');
  const [siteName, setSiteName] = useState('');
  const [siteAddress, setSiteAddress] = useState('');

  const clearFilters = () => {
    context.state.srDetailDate = undefined;
    setSelectedProjects([]);
    setSiteId('');
    setSiteName('');
    setSiteAddress('');
    // setPersonalDetails({
    //   firstName: "",
    //   lastName: "",
    //   contactPhone: "",
    //   emailAddress: "",
    // });
    setApplyFilter(false);
  };

  const areFiltersApplied = () => {
    return (
      context.state.srDetailDate != null ||
      selectedProjects.length > 0 ||
      siteId != '' ||
      siteName != '' ||
      siteAddress != ''
      // personalDetails.firstName !== "" ||
      // personalDetails.lastName !== "" ||
      // personalDetails.contactPhone !== "" ||
      // personalDetails.emailAddress !== ""
    );
  };

  const handleApplyFilters = () => {
    setShowFilterModel(!showFilterModel);
    if (areFiltersApplied()) {
      setApplyFilter(true);
    }
  };

  const filterData = (data ?? [])
    .filter((app) => {
      if (searchQuery !== '') {
        return app._id.includes(searchQuery.toLowerCase());
      } else {
        return true;
      }
    })
    .filter((byRange) => {
      if (!isApplyFilter) {
        return true;
      }
      const isDateRangeApplied =
        context.state.srDetailDate?.from && context.state.srDetailDate?.to;
      if (!isDateRangeApplied) {
        return true;
      }
      const createdAtDate = new Date(byRange.createdAt);
      const fromDate = context.state.srDetailDate?.from || new Date(0);
      const toDate = context.state.srDetailDate?.to || new Date();
      const isWithinDateRange =
        isDateRangeApplied &&
        createdAtDate >= fromDate &&
        createdAtDate <= toDate;

      if (isWithinDateRange) {
        return true;
      } else {
        return false;
      }
    })
    .filter((forProject) => {
      if (!isApplyFilter || selectedProjects.length === 0) {
        return true;
      }

      return forProject.projects.some(
        (project) => project._id && selectedProjects.includes(project._id)
      );
    })
    .filter((bySiteId) => {
      if (!isApplyFilter || !siteId) {
        return true;
      }

      return bySiteId.sites.some((site) => site._id === siteId);
    })
    .filter((bySiteName) => {
      if (!isApplyFilter || !siteName) {
        return true;
      }
      return bySiteName.sites.some((site) => site.siteName == siteName.trim());
    })
    .filter((bySiteAddress) => {
      if (!isApplyFilter || !siteAddress) {
        return true; // Skip filtering if no filter is applied or siteAddress is empty
      }

      // Normalize and trim the `siteAddress` input
      const normalizedAddress = siteAddress.trim().toLowerCase();

      // Check if either `addressLineOne` or `addressLineTwo` matches the input
      return bySiteAddress.sites.some(
        (site) =>
          site.addressLineOne?.toLowerCase().includes(normalizedAddress) ||
          site.addressLineTwo?.toLowerCase().includes(normalizedAddress)
      );
    });

  return (
    <>
      <div className="absolute inset-0 z-10 flex h-[calc(var(--app-vh)-70px)] w-full max-w-[1360px] flex-col bg-white px-4 pt-4 font-Open-Sans">
        <div className="flex h-full flex-1 flex-col justify-start overflow-auto scrollbar-hide">
          {/* TopBar */}
          {memoizedTopBar}

          {/* ///////////////// Middle content ////////////////////// */}

          <div className="flex h-full flex-1 flex-col justify-start overflow-auto scrollbar-hide">
            <div className="sticky top-0 z-20 bg-white pb-2">
              <div className="mt-4 flex flex-col justify-between gap-2 lg:flex-row">
                {/* page logo and name */}
                <div className="flex items-center gap-2 text-2xl font-bold text-[#1E1E1E]">
                  <div className="relative h-[50px] w-[50px] rounded-lg shadow">
                    <img src="/svg/sr/logo.svg" alt="show logo" />
                  </div>
                  <h2 className="ml-2 text-2xl font-bold">
                    Roll Call Submissions
                  </h2>
                </div>

                {/* dropdown filter & search */}
                <div className="flex items-center gap-4">
                  {canUseAdminMode && (
                    <div className="hidden md:flex">
                      <AdminSwitch
                        adminMode={adminMode}
                        setAdminMode={setAdminMode}
                      />
                    </div>
                  )}

                  {/* DropDown Custom */}
                  <div className="DropDownn relative z-50 hidden text-left md:flex">
                    <div>
                      <button
                        type="button"
                        className="inline-flex w-full items-center justify-center gap-1 rounded-md border border-gray-300 bg-[#E2F3FF] px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-[#e1f0fa] focus:outline-none"
                        id="options-menu"
                        aria-expanded="true"
                        aria-haspopup="true"
                        onClick={handleToggle}
                      >
                        {selected}
                        <svg
                          width="12"
                          height="13"
                          viewBox="0 0 12 13"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2.50029 3.00166H11.5003C11.5914 3.00194 11.6807 3.02707 11.7586 3.07435C11.8365 3.12162 11.9001 3.18924 11.9424 3.26993C11.9847 3.35063 12.0042 3.44134 11.9988 3.5323C11.9934 3.62326 11.9634 3.71103 11.9118 3.78616L7.41179 10.2862C7.22529 10.5557 6.77629 10.5557 6.58929 10.2862L2.08929 3.78616C2.0372 3.71118 2.00665 3.62337 2.00097 3.53226C1.99528 3.44115 2.01468 3.35022 2.05704 3.26935C2.09941 3.18849 2.16312 3.12078 2.24127 3.07358C2.31941 3.02639 2.409 3.00151 2.50029 3.00166Z"
                            fill="#1E1E1E"
                          />
                        </svg>
                      </button>

                      {isOpen && (
                        <div
                          className="absolute left-0 z-50 mt-2 w-56 origin-top-left rounded-md bg-[#E2F3FF] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby="options-menu"
                        >
                          <div className="py-1" role="none">
                            <button
                              onClick={() => handleSelect('View All')}
                              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              role="menuitem"
                            >
                              View All
                            </button>
                            <button
                              onClick={() => handleSelect('Submitted By Me')}
                              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              role="menuitem"
                            >
                              Submitted By Me
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-grow gap-4">
                    <FilterButton
                      isApplyFilter={isApplyFilter}
                      setShowModel={setShowFilterModel}
                      showModel={showFilterModel}
                      setOpenDropdown={setOpenDropdown}
                      clearFilters={clearFilters}
                    />

                    <div className="Search team-actice flex w-full items-center justify-between">
                      <Search
                        inputRounded={true}
                        type="search"
                        className="rounded-md bg-[#eeeeee] placeholder:text-[#616161]"
                        name="search"
                        placeholder="Search"
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* /// table section  */}

            {
              <table className="mt-3 w-full border-collapse font-Open-Sans">
                <thead className="bg-[#F5F5F5] text-left text-sm font-semibold text-[#616161]">
                  <tr>
                    <th className="px-2 py-3">Roll Call No</th>
                    <th className="px-2 py-3">Title</th>
                    <th className="hidden px-2 py-3 md:table-cell">
                      Attendence
                    </th>

                    <th className="px-2 py-3"> Submitted By</th>
                    <th className="hidden px-2 py-3 md:flex">
                      Date & Time
                      <img
                        src="/images/fluent_arrow-sort-24-regular.svg"
                        className="cursor-pointer px-1"
                        alt="image"
                      />
                    </th>
                    <th className="w-[100px] rounded-r-lg bg-[#F5F5F5] px-4 py-3 text-right text-sm font-normal text-[#0063F7]">
                      {isSelectMode ? (
                        <div className="flex items-center justify-end gap-2">
                          <div
                            className="cursor-pointer"
                            onClick={handleCancel}
                          >
                            Cancel
                          </div>
                          <div className="relative flex items-center justify-center gap-2">
                            <input
                              type="checkbox"
                              className={`h-5 w-5 cursor-pointer appearance-none rounded-md border-2 ${
                                (filterData ?? []).length ==
                                (selectedSubmissions ?? []).length
                                  ? 'border-[#6990FF] bg-[#6990FF] checked:border-[#6990FF] checked:bg-[#6990FF]'
                                  : 'border-[#9E9E9E] bg-white'
                              } transition-colors duration-200 ease-in-out`}
                              onChange={handleSelectAllChange}
                            />
                            {(filterData ?? []).length ==
                              (selectedSubmissions ?? []).length && (
                              <svg
                                onClick={handleSelectAllChange}
                                className="z-21 absolute inset-0 m-auto h-4 w-4 cursor-pointer text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer"
                          onClick={() => setIsSelectMode(!isSelectMode)}
                        >
                          Select
                        </div>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm font-normal text-[#1E1E1E]">
                  {(filterData ?? []).map((item, index) => {
                    return (
                      <tr
                        key={item._id}
                        className="relative border-b even:bg-[#F5F5F5]"
                      >
                        <td
                          className="cursor-pointer px-4 py-2 text-base text-primary-500"
                          onClick={() => {
                            router.push(
                              `/user/apps/sr/${state.sr_app_id}/${item._id}`
                            );
                          }}
                        >
                          {item.rollNumber}
                        </td>
                        <td
                          className="w-72 cursor-pointer px-2 py-2 text-base text-primary-500"
                          onClick={() => {
                            router.push(
                              `/user/apps/sr/${state.sr_app_id}/${item._id}`
                            );
                          }}
                        >
                          {item.title}
                        </td>
                        <td className="px-4 py-2">
                          {item.users.length}/{(users ?? []).length}
                        </td>
                        <td
                          className="hidden items-center p-2 md:flex"
                          onMouseEnter={() => setHoveredUser(index)}
                          onMouseLeave={() => setHoveredUser(null)}
                        >
                          <PresignedUserAvatar
                            photo={item.submittedBy?.photo}
                            fallback="/images/user.png"
                            alt="avatar"
                            className="mr-2 h-8 w-8 rounded-full border border-gray-500 text-[#616161]"
                          />
                          {'My Organization'}
                          {/* {item.organizationId.name} */}
                          {hoveredUser === index && (
                            <div className="absolute top-8 z-20 mt-2 w-fit rounded-lg border bg-gray-50 p-4 text-xs text-[#616161] shadow-lg">
                              <div className="flex items-start">
                                <PresignedUserAvatar
                                  photo={item.submittedBy?.photo}
                                  fallback="/images/user.png"
                                  alt="Avatar"
                                  className="h-10 w-10 flex-shrink-0 rounded-full border border-gray-500 bg-gray-200"
                                />
                                <div className="ml-4 space-y-2">
                                  <p className="text-sm font-semibold text-[#605f5f]">
                                    {`${item.submittedBy.firstName} ${item.submittedBy.lastName}`}
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
                                    <p className="text-sm">
                                      {item.submittedBy.email}
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
                                    <p className="text-sm">
                                      {item.submittedBy.organization?.name}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex gap-12">
                            <div>{dateFormat(item.createdAt.toString())}</div>
                            <div>{timeFormat(item.createdAt.toString())}</div>
                          </div>
                        </td>
                        <td className="cursor-pointer pr-4">
                          <div className="flex items-center justify-end">
                            {isSelectMode ? (
                              <div
                                key={item._id}
                                className="relative flex items-center"
                              >
                                <input
                                  type="checkbox"
                                  className={`h-5 w-5 cursor-pointer appearance-none rounded-md border-2 ${
                                    selectedSubmissions.some(
                                      (sr) => item._id == sr._id
                                    )
                                      ? 'border-[#6990FF] bg-[#6990FF] checked:border-[#6990FF] checked:bg-[#6990FF]'
                                      : 'border-[#9E9E9E] bg-white'
                                  } transition-colors duration-200 ease-in-out`}
                                  checked={selectedSubmissions.some(
                                    (sr) => item._id == sr._id
                                  )}
                                  onChange={() => handleCheckboxChange(item)}
                                />
                                {selectedSubmissions.some(
                                  (sr) => item._id == sr._id
                                ) && (
                                  <svg
                                    onClick={() => handleCheckboxChange(item)}
                                    className="z-21 absolute inset-0 m-auto h-4 w-4 cursor-pointer text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </div>
                            ) : (
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
                                    key="View"
                                    onPress={() => {
                                      router.push(
                                        `/user/apps/sr/${state.sr_app_id}/${item._id}`
                                      );
                                    }}
                                  >
                                    {' '}
                                    View
                                  </DropdownItem>
                                  <DropdownItem
                                    key="pdf"
                                    onClick={() => handleDownloadPDF(item)}
                                  >
                                    Download PDF
                                  </DropdownItem>
                                  <DropdownItem
                                    key="chat"
                                    onClick={() => {
                                      setSelectedRollCallForChat(item);
                                      setShowChatModel(true);
                                    }}
                                  >
                                    Send via Chat
                                  </DropdownItem>
                                  <DropdownItem
                                    key="Edit"
                                    onClick={() => {
                                      dispatch({
                                        type: SR_APP_ACTION_TYPE.SHOW_ROLL_CALL_FORM_EDIT,
                                        roll_call_edit: item,
                                      });
                                    }}
                                  >
                                    Edit
                                  </DropdownItem>
                                  <DropdownItem
                                    key="Delete"
                                    color="danger"
                                    onClick={() => handleShowModel(item._id)}
                                  >
                                    Delete
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            }

            {isLoading && (
              <div className="flex h-full w-full place-content-center items-center justify-center">
                <Loader />
              </div>
            )}

            {(filterData ?? []).length < 1 && !isLoading && (
              <div className="flex h-full w-full place-content-center items-center justify-center">
                <div className="flex w-1/2 flex-col items-center justify-center">
                  <img
                    src="/images/empty-box.svg"
                    className="m-2 w-[20%]"
                    alt="image"
                  />
                  <p className="text-1xl m-2">Nothing to see here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-32 right-[20%] z-10">
          <Button
            variant="primaryRounded"
            onClick={() => {
              dispatch({
                type: SR_APP_ACTION_TYPE.SHOW_ROLL_CALL_FORM,
              });
            }}
          >
            {'+ Add'}
          </Button>
        </div>

        {/* Bottom bar */}
        <div className="h-16">
          <div className="flex h-full w-full items-center justify-between border-2 border-[#EEEEEE] p-2">
            <div className="flex-1 text-left text-sm font-normal text-[#616161]">
              Items per page: 50
            </div>
            <div className="absolute left-1/2 flex -translate-x-1/2 transform items-center gap-2">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.0364 13.4677C10.2121 13.2919 10.3108 13.0535 10.3108 12.8049C10.3108 12.5563 10.2121 12.3179 10.0364 12.1421L5.39574 7.50145L10.0364 2.86082C10.2071 2.68401 10.3016 2.4472 10.2995 2.20139C10.2974 1.95558 10.1988 1.72044 10.0249 1.54662C9.85112 1.3728 9.61598 1.2742 9.37018 1.27207C9.12437 1.26993 8.88755 1.36443 8.71074 1.5352L3.4073 6.83864C3.23155 7.01445 3.13281 7.25286 3.13281 7.50145C3.13281 7.75004 3.23155 7.98846 3.4073 8.16426L8.71074 13.4677C8.88654 13.6435 9.12496 13.7422 9.37355 13.7422C9.62214 13.7422 9.86055 13.6435 10.0364 13.4677Z"
                  fill="#616161"
                />
              </svg>
              <div className="flex items-center justify-center rounded-lg border-1 border-[#616161] px-3 py-1 text-[14px] text-[#1E1E1E]">
                1
              </div>
              <div className="text-[#616161]">of 1</div>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.96364 1.54011C4.78788 1.71592 4.68915 1.95433 4.68915 2.20292C4.68915 2.45152 4.78788 2.68993 4.96364 2.86574L9.60426 7.50636L4.96364 12.147C4.79286 12.3238 4.69837 12.5606 4.70051 12.8064C4.70264 13.0522 4.80124 13.2874 4.97506 13.4612C5.14888 13.635 5.38401 13.7336 5.62982 13.7357C5.87563 13.7379 6.11245 13.6434 6.28926 13.4726L11.5927 8.16918C11.7685 7.99337 11.8672 7.75495 11.8672 7.50636C11.8672 7.25777 11.7685 7.01936 11.5927 6.84355L6.28926 1.54011C6.11346 1.36436 5.87504 1.26563 5.62645 1.26563C5.37786 1.26563 5.13944 1.36436 4.96364 1.54011Z"
                  fill="#616161"
                />
              </svg>
            </div>
            {isSelectMode && (
              <div className="flex w-fit justify-end gap-4 text-right">
                <Button variant="text" onClick={handleCancel}>
                  <div className="">Cancel</div>
                </Button>
                <Button
                  variant="danger"
                  disabled={(selectedSubmissions ?? []).length === 0}
                  onClick={() => {
                    openSelectedItemsModal();
                  }}
                >
                  <div>Delete ({(selectedSubmissions ?? []).length})</div>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {(state.showRollCallForm || state.showEditRollCallForm) && (
        <RollCallSteps />
      )}
      {/* delete model I guess */}
      <Modal
        isOpen={showModel}
        onOpenChange={() => setShowModel(!showModel)}
        placement="top-center"
        size="lg"
      >
        <ModalContent className="max-w-[600px] rounded-3xl bg-white">
          {(onCloseModal) => (
            <>
              <ModalHeader className="flex flex-row items-center gap-2 border-b-2 border-gray-200 px-8 py-8 pb-8">
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="25" cy="25" r="25" fill="#FFDFDF" />
                  <path
                    d="M37.7513 31.0419L27.5032 13.2446C27.2471 12.8086 26.8815 12.4471 26.4427 12.1959C26.0038 11.9446 25.5069 11.8125 25.0013 11.8125C24.4956 11.8125 23.9987 11.9446 23.5598 12.1959C23.121 12.4471 22.7554 12.8086 22.4993 13.2446L12.2513 31.0419C12.0049 31.4636 11.875 31.9433 11.875 32.4317C11.875 32.9202 12.0049 33.3998 12.2513 33.8216C12.5041 34.2602 12.869 34.6237 13.3087 34.8748C13.7484 35.1258 14.2469 35.2553 14.7532 35.2501H35.2493C35.7552 35.2549 36.2532 35.1252 36.6925 34.8742C37.1317 34.6231 37.4963 34.2599 37.7489 33.8216C37.9957 33.4 38.1259 32.9205 38.1263 32.432C38.1268 31.9436 37.9973 31.4638 37.7513 31.0419ZM36.1259 32.8829C36.0365 33.0353 35.9083 33.1612 35.7542 33.2477C35.6002 33.3342 35.4259 33.3781 35.2493 33.3751H14.7532C14.5766 33.3781 14.4023 33.3342 14.2483 33.2477C14.0942 33.1612 13.966 33.0353 13.8766 32.8829C13.7957 32.7459 13.753 32.5897 13.753 32.4305C13.753 32.2714 13.7957 32.1152 13.8766 31.9782L24.1247 14.1809C24.2158 14.0293 24.3447 13.9038 24.4987 13.8166C24.6527 13.7295 24.8266 13.6837 25.0036 13.6837C25.1806 13.6837 25.3545 13.7295 25.5085 13.8166C25.6625 13.9038 25.7914 14.0293 25.8825 14.1809L36.1306 31.9782C36.2108 32.1156 36.2526 32.2721 36.2518 32.4312C36.251 32.5903 36.2075 32.7463 36.1259 32.8829ZM24.0638 25.8751V21.1876C24.0638 20.9389 24.1625 20.7005 24.3383 20.5247C24.5142 20.3488 24.7526 20.2501 25.0013 20.2501C25.2499 20.2501 25.4884 20.3488 25.6642 20.5247C25.84 20.7005 25.9388 20.9389 25.9388 21.1876V25.8751C25.9388 26.1237 25.84 26.3622 25.6642 26.538C25.4884 26.7138 25.2499 26.8126 25.0013 26.8126C24.7526 26.8126 24.5142 26.7138 24.3383 26.538C24.1625 26.3622 24.0638 26.1237 24.0638 25.8751ZM26.4075 30.0938C26.4075 30.372 26.325 30.6438 26.1705 30.8751C26.016 31.1064 25.7964 31.2866 25.5394 31.393C25.2824 31.4995 24.9997 31.5273 24.7269 31.4731C24.4541 31.4188 24.2036 31.2849 24.0069 31.0882C23.8102 30.8915 23.6763 30.641 23.622 30.3682C23.5678 30.0954 23.5956 29.8126 23.7021 29.5557C23.8085 29.2987 23.9887 29.0791 24.22 28.9246C24.4512 28.7701 24.7231 28.6876 25.0013 28.6876C25.3742 28.6876 25.7319 28.8357 25.9956 29.0995C26.2593 29.3632 26.4075 29.7209 26.4075 30.0938Z"
                    fill="#A81717"
                  />
                </svg>

                <div>
                  <h2 className="text-xl font-semibold">Delete Roll Call </h2>
                  <p className="mt-1 text-sm font-normal text-[#616161]">
                    Are you sure you want to delete this Roll Call. This action
                    cannot be undone.
                  </p>
                </div>
              </ModalHeader>
              {/* <ModalBody className=""></ModalBody> */}
              <ModalFooter>
                <div className="flex w-full justify-end gap-2">
                  {/* Cancel Button */}

                  <Button
                    variant="primaryOutLine"
                    className=""
                    onClick={onCloseModal}
                  >
                    Cancel
                  </Button>
                  {/* Delete Button */}
                  <Button variant="danger" onClick={confirmDelete}>
                    {deleteRollCallMutation.isLoading ? <Loader /> : 'Delete'}
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {showSelectedItemsModal && (
        <MultiRollcallModel
          handleShowModel={() => {
            setShowSelectedItemsModal(!showSelectedItemsModal);
            handleCancel();
          }}
          selectedSubmissions={selectedSubmissions}
        />
      )}

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
                <div className="w-full" onClick={() => setOpenDropdown('')}>
                  <DateRangePicker
                    title="Submitted Date Range"
                    handleOnConfirm={(from: Date, to: Date) => {
                      context.dispatch({
                        type: SR_APP_ACTION_TYPE.SR_DATE_RANGE,
                        srDetailDate: { from: from, to: to },
                      });
                    }}
                    selectedDate={context.state.srDetailDate ?? undefined}
                  />
                </div>

                <div className="w-full">
                  <CustomSearchSelect
                    isRequired={true}
                    label="Assigned Project"
                    data={(projects ?? []).map((project) => ({
                      label: project.name ?? '',
                      value: project._id ?? '',
                    }))}
                    showImage={false}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown1'}
                    onToggle={() => handleToggleDropdown('dropdown1')}
                    onSelect={(selected: string[]) =>
                      setSelectedProjects(selected)
                    }
                    placeholder="All"
                  />
                </div>

                <SimpleInput
                  type="text"
                  label="Site ID"
                  placeholder="Enter Site ID"
                  name="siteId"
                  className="w-full"
                  value={siteId}
                  onChange={(value) => {
                    setSiteId(value.target.value);
                  }}
                />

                <SimpleInput
                  type="text"
                  label="Site Name"
                  placeholder="Enter Site Name"
                  name="siteName"
                  className="w-full"
                  value={siteName}
                  onChange={(value) => {
                    setSiteName(value.target.value);
                  }}
                />

                <SimpleInput
                  type="text"
                  label="Site Address"
                  placeholder="Enter Site Address"
                  name="siteAddress"
                  className="w-full"
                  value={siteAddress}
                  onChange={(value) => {
                    setSiteAddress(value.target.value);
                  }}
                />
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

      {/* Send via Chat Modal */}
      {showChatModel && selectedRollCallForChat && (
        <ShareAsChatAppModel
          handleClose={() => {
            setShowChatModel(false);
            setSelectedRollCallForChat(null);
          }}
          pageUrl={() => {
            const token = generateSecureToken({
              userId: selectedRollCallForChat._id,
              readonly: false,
              expiresAt: Date.now() + 60 * 60 * 1000, // Expires in 1 hour
            });
            const pageUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/user/apps/sr/${state.sr_app_id}/${selectedRollCallForChat._id}?token=${token}`;
            return pageUrl;
          }}
        />
      )}
    </>
  );
}
