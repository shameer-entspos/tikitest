import { useMemo, useReducer, useState } from 'react';

import { Switch } from '@material-tailwind/react';
import { SRTopBar } from '../SR_Top_Bar';
import { Search } from '@/components/Form/search';
import { Button } from '@/components/Buttons';
import {
  checkSRPermission,
  getAllSRList,
} from '@/app/(main)/(user-panel)/user/apps/sr/api';
import { useQuery } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { usePresignedUserPhoto } from '@/hooks/usePresignedUserPhoto';
import Loader from '@/components/DottedLoader/loader';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import SignOutModel from '../Models/Sign_Out_Model';
import { SignInRegisterSubmission } from '@/app/type/Sign_Register_Submission';
import AdminSwitch from '@/components/AdminSwitch/AdminSwitch';
import { useSession } from 'next-auth/react';
import FilterButton from '@/components/TimeSheetApp/CommonComponents/FilterButton/FilterButton';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react';
import { SR_APP_ACTION_TYPE } from '@/app/helpers/user/enums';
import {
  initialSRAppState,
  SRAppReducer,
  useSRAppCotnext,
} from '@/app/(main)/(user-panel)/user/apps/sr/sr_context';
import {
  getAllAppProjects,
  JSAAppModel,
} from '@/app/(main)/(user-panel)/user/apps/api';
import DateRangePicker from '@/components/JobSafetyAnalysis/CreateNewComponents/JSA_Calender';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { SimpleInput } from '@/components/Form/simpleInput';
import MultiSignOut from '../Models/Sign_Out_Model/SignOutMultiple';
import MultiSignOutModel from '../Models/Sign_Out_Model/SignOutMultiple';

function SRSubmittedByAvatar({ photo }: { photo?: string }) {
  const src = usePresignedUserPhoto(photo);
  return (
    <img
      src={src}
      alt="User"
      className="mr-2 h-8 w-8 rounded-full border border-gray-500 object-cover"
    />
  );
}

// ALREADY DONE
export default function SRSignOut() {
  const memoizedTopBar = useMemo(
    () => <SRTopBar backToPage="sign_in_out" />,
    []
  );
  const context = useSRAppCotnext();

  const { data: session } = useSession();

  const [showModel, setShowModel] = useState(false);

  const [openDropdown, setOpenDropdown] = useState<string>('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedVisitorType, setSelectedVisitorType] = useState<string[]>([]);
  const [siteId, setSiteId] = useState('');
  const [personalDetails, setPersonalDetails] = useState({
    firstName: '',
    lastName: '',
    contactPhone: '',
    emailAddress: '',
  });
  const visitorTypes = [
    { id: 1, name: 'Customer' },
    { id: 2, name: 'Supplier' },
    { id: 3, name: 'Employee' },
    { id: 4, name: 'Contractor' },
    { id: 5, name: 'Courier / Delivery Person' },
    { id: 6, name: 'Family member' },
    { id: 7, name: 'Friend' },
  ];
  const [showSelectedItemsModal, setShowSelectedItemsModal] = useState(false);
  const openSelectedItemsModal = () => {
    setShowSelectedItemsModal(true);
  };
  const [state, dispatch] = useReducer(SRAppReducer, initialSRAppState);

  const handlePersonalDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPersonalDetails((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleToggleDropdown = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? '' : dropdownId);
  };
  const [isApplyFilter, setApplyFilter] = useState(false);
  const [showFilterModel, setShowFilterModel] = useState(false);
  // Filter handling
  const clearFilters = () => {
    setSelectedProjects([]);
    setSiteId('');
    context.state.srDetailDate = undefined;
    setPersonalDetails({
      firstName: '',
      lastName: '',
      contactPhone: '',
      emailAddress: '',
    });
    setApplyFilter(false);
  };

  const areFiltersApplied = () => {
    return (
      selectedProjects.length > 0 ||
      context.state.srDetailDate != null ||
      siteId != '' ||
      personalDetails.firstName !== '' ||
      personalDetails.lastName !== '' ||
      personalDetails.contactPhone !== '' ||
      personalDetails.emailAddress !== '' ||
      selectedVisitorType.length > 0
    );
  };

  const handleApplyFilters = () => {
    setShowFilterModel(!showFilterModel);
    if (areFiltersApplied()) {
      setApplyFilter(true);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [adminMode, setAdminMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // const [selected, setSelected] = useState("View All");
  const [selected, setSelected] = useState<'User' | 'Guest' | 'View All'>(
    'View All'
  );

  const [details, setDetails] = useState<
    SignInRegisterSubmission | undefined
  >();

  // Sorting state
  const [sortFirstName, setSortFirstName] = useState<'asc' | 'desc'>('asc');
  const [sortLastName, setSortLastName] = useState<'asc' | 'desc'>('asc');
  const [sortDate, setSortDate] = useState<'asc' | 'desc'>('desc');
  const [activeSort, setActiveSort] = useState<
    'firstName' | 'lastName' | 'date'
  >('date');

  const handleSort = (column: typeof activeSort) => {
    setActiveSort(column);
    if (column === 'firstName') {
      setSortFirstName((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else if (column === 'lastName') {
      setSortLastName((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortDate((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  const handleSelect = (option: 'User' | 'Guest' | 'View All') => {
    setSelected(option);
    setIsOpen(false);
  };

  const axiosAuth = useAxiosAuth();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['allSRList', adminMode],
    queryFn: () => getAllSRList({ axiosAuth, isAdmin: adminMode }),
    enabled: true,
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryFn: () => getAllAppProjects(axiosAuth),
    queryKey: ['allProjects'],
  });

  const filterData = (data ?? [])
    // Only show records where the person is currently signed in
    .filter((app: SignInRegisterSubmission) => app.signOutAt == null)
    .filter((app: SignInRegisterSubmission) => {
      if (searchQuery !== '') {
        const query = searchQuery.toLowerCase();
        const firstName = (app.firstName || '').toLowerCase();
        const lastName = (app.lastName || '').toLowerCase();
        const email = (app.email || '').toLowerCase();
        const contact = (app.contact || '').toLowerCase();
        return (
          firstName.includes(query) ||
          lastName.includes(query) ||
          email.includes(query) ||
          contact.includes(query)
        );
      } else {
        return true;
      }
    })
    .filter((app) => {
      if (!isApplyFilter) {
        return true;
      } else {
        if (siteId == '') {
          return true;
        } else {
          return siteId === app.site._id;
        }
      }
    })
    .filter((detailsFName) => {
      if (!isApplyFilter || personalDetails.firstName == '') {
        return true;
      } else {
        return (
          personalDetails.firstName.trim() == detailsFName.firstName.trim()
        );
      }
    })
    .filter((forProject) => {
      if (!isApplyFilter || selectedProjects.length === 0) {
        return true;
      }
      return selectedProjects.includes(forProject.project!._id!);
    })
    .filter((detailsLName) => {
      if (!isApplyFilter && personalDetails.lastName == '') {
        return true;
      } else if (!isApplyFilter) {
        return true;
      } else {
        return personalDetails.lastName == detailsLName.lastName;
      }
    })
    .filter((visitorType) => {
      if (!isApplyFilter || selectedVisitorType.length == 0) {
        return true;
      } else {
        return selectedVisitorType.includes(visitorType.visitorType.toString());
      }
    })
    .filter((selectedType) => {
      // No filters applied or "View All" selected: Include all items
      if (selected === 'View All') {
        return true;
      }

      // Filters for Guest and User
      const isGuest = selectedType.userType === 3 && selected === 'Guest';
      const isUser = selectedType.userType !== 3 && selected === 'User';

      if (selected === 'Guest' && selectedType.userType == 3) {
        return true;
      } else if (
        selected === 'User' &&
        (selectedType.userType == 2 || selectedType.userType == 1)
      ) {
        return true;
      }
    })
    .filter((detailsContact) => {
      if (!isApplyFilter) {
        return true;
      } else {
        return (
          personalDetails.contactPhone.trim() == detailsContact.contact.trim()
        );
      }
    })
    .filter((detailsEmail) => {
      if (!isApplyFilter) {
        return true;
      } else {
        return personalDetails.emailAddress == detailsEmail.email;
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
    // Sort by selected column
    .sort((a, b) => {
      switch (activeSort) {
        case 'firstName': {
          const aFirstName = (a.firstName || '').toLowerCase();
          const bFirstName = (b.firstName || '').toLowerCase();
          if (aFirstName < bFirstName) return sortFirstName === 'asc' ? -1 : 1;
          if (aFirstName > bFirstName) return sortFirstName === 'asc' ? 1 : -1;
          return 0;
        }
        case 'lastName': {
          const aLastName = (a.lastName || '').toLowerCase();
          const bLastName = (b.lastName || '').toLowerCase();
          if (aLastName < bLastName) return sortLastName === 'asc' ? -1 : 1;
          if (aLastName > bLastName) return sortLastName === 'asc' ? 1 : -1;
          return 0;
        }
        case 'date': {
          const aDate = a.signInAt
            ? new Date(a.signInAt).getTime()
            : new Date(a.createdAt).getTime();
          const bDate = b.signInAt
            ? new Date(b.signInAt).getTime()
            : new Date(b.createdAt).getTime();
          return sortDate === 'asc' ? aDate - bDate : bDate - aDate;
        }
        default:
          return 0;
      }
    });

  // Handle "Select All" checkbox change
  const handleSelectAllChange = () => {
    if ((filterData ?? []).length == (selectedSubmissions ?? []).length) {
      handleCancel();
    } else {
      setCheckedSubmissions([...(filterData ?? [])]);
    }
  };

  const handleCheckboxChange = (sr: SignInRegisterSubmission) => {
    if (selectedSubmissions.some((selectedTs) => selectedTs._id === sr._id)) {
      setCheckedSubmissions([
        ...(selectedSubmissions ?? []).filter(
          (selectedTs) => selectedTs._id !== sr._id
        ),
      ]);
    } else {
      setCheckedSubmissions([...(selectedSubmissions ?? []), sr]);
    }
  };

  // Handle Cancel button click (uncheck all checkboxes)
  const handleCancel = () => {
    setCheckedSubmissions([]);
    setIsSelectMode(false); // Exit select mode
  };

  // Check if user is Root User from session (role 3 = Organization Admin)
  const isRootUser = (session?.user as any)?.role === 3;

  // Check app-level permission (backend already checks global apps permission and returns adminMode: true if user has it)
  const { data: permission } = useQuery('SRSettingPermission', () =>
    checkSRPermission(axiosAuth)
  );

  // User can use Admin Mode if Root User or has permission (which includes global apps permission)
  const canUseAdminMode = isRootUser || permission?.adminMode === true;

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedSubmissions, setCheckedSubmissions] = useState<
    SignInRegisterSubmission[]
  >([]);

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
                  <h2 className="ml-2 text-2xl font-bold"> Sign out</h2>
                </div>

                {/* dropdown filter & search */}
                <div className="flex items-center gap-4">
                  {/* {session?.user.user.type === 1 && (
                    <div className="hidden md:flex">
                      <AdminSwitch
                        adminMode={adminMode}
                        setAdminMode={setAdminMode}
                      />
                    </div>
                  )} */}
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
                        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-[#E2F3FF] p-2 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-[#e1f0fa] focus:outline-none"
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
                          className="absolute left-0 z-50 mt-2 w-36 origin-top-left whitespace-nowrap rounded-md bg-[#E2F3FF] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
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
                              onClick={() => handleSelect('User')}
                              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              role="menuitem"
                            >
                              User
                            </button>
                            <button
                              onClick={() => handleSelect('Guest')}
                              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              role="menuitem"
                            >
                              Guest
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

            <table className="mt-3 w-full border-collapse font-Open-Sans">
              <thead className="bg-[#F5F5F5] text-left text-sm font-semibold text-[#616161]">
                <tr>
                  <th className="px-2 py-3">
                    <div className="flex">
                      First Name
                      <img
                        src="/images/fluent_arrow-sort-24-regular.svg"
                        className="cursor-pointer px-1"
                        alt="image"
                        onClick={() => handleSort('firstName')}
                      />
                    </div>
                  </th>
                  <th className="hidden px-2 py-3 sm:table-cell">
                    <div className="flex">
                      Last Name
                      <img
                        src="/images/fluent_arrow-sort-24-regular.svg"
                        className="cursor-pointer px-1"
                        alt="image"
                        onClick={() => handleSort('lastName')}
                      />
                    </div>
                  </th>
                  <th className="hidden px-2 py-3 md:table-cell">Site Name</th>

                  <th className="px-2 py-3"> Submitted By</th>
                  <th className="hidden px-2 py-3 md:flex">
                    Date & Time
                    <img
                      src="/images/fluent_arrow-sort-24-regular.svg"
                      className="cursor-pointer px-1"
                      alt="image"
                      onClick={() => handleSort('date')}
                    />
                  </th>
                  <th className="w-[100px] rounded-r-lg bg-[#F5F5F5] px-4 py-3 text-right text-sm font-normal text-[#0063F7]">
                    {isSelectMode ? (
                      <div className="flex items-center justify-end gap-2">
                        <div className="cursor-pointer" onClick={handleCancel}>
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
              {/* {siteId} */}
              {/* {selectedProjects.map((project) => project).join(", ")} */}
              <tbody className="text-sm font-normal text-[#1E1E1E]">
                {(filterData ?? []).map((item) => {
                  return (
                    <tr
                      key={item._id}
                      className="relative border-b even:bg-[#F5F5F5]"
                    >
                      <td className="px-4 py-2">{item.firstName || '-'}</td>
                      <td className="hidden px-4 py-2 sm:table-cell">
                        {item.lastName || '-'}
                      </td>
                      <td className="hidden px-4 py-2 md:table-cell">
                        <span className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-800">
                          {item.site?.siteName || '-'}
                        </span>
                      </td>
                      <td className="flex items-center px-4 py-2">
                        <SRSubmittedByAvatar photo={item.submittedBy?.photo} />
                        {item.submittedBy
                          ? `${item.submittedBy.firstName || ''} ${
                              item.submittedBy.lastName || ''
                            }`.trim() || '-'
                          : '-'}
                      </td>
                      <td className="hidden px-4 py-2 md:table-cell">
                        <div className="flex flex-col gap-1">
                          <span>
                            {item.signInAt
                              ? dateFormat(item.signInAt.toString())
                              : dateFormat(item.createdAt.toString())}
                          </span>
                          <span>
                            {item.signInAt
                              ? timeFormat(item.signInAt.toString())
                              : timeFormat(item.createdAt.toString())}
                          </span>
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
                            <div
                              onClick={() => {
                                setShowModel(!showModel), setDetails(item);
                              }}
                            >
                              <svg
                                width="104"
                                height="30"
                                viewBox="0 0 104 30"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <rect
                                  width="104"
                                  height="30"
                                  rx="8"
                                  fill="#E2F3FF"
                                />
                                <path
                                  d="M17.082 17.7793C17.082 18.3717 16.9362 18.8822 16.6445 19.3105C16.3574 19.7389 15.9427 20.0671 15.4004 20.2949C14.8626 20.5228 14.2201 20.6367 13.4727 20.6367C13.1081 20.6367 12.7594 20.6162 12.4268 20.5752C12.0941 20.5342 11.7796 20.4749 11.4834 20.3975C11.1917 20.3154 10.9251 20.2174 10.6836 20.1035V18.5586C11.0892 18.7363 11.5426 18.8981 12.0439 19.0439C12.5452 19.1852 13.0557 19.2559 13.5752 19.2559C13.999 19.2559 14.3499 19.2012 14.6279 19.0918C14.9105 18.9779 15.1201 18.8184 15.2568 18.6133C15.3936 18.4036 15.4619 18.1598 15.4619 17.8818C15.4619 17.5856 15.3822 17.335 15.2227 17.1299C15.0632 16.9248 14.8216 16.738 14.498 16.5693C14.179 16.3962 13.778 16.2116 13.2949 16.0156C12.9668 15.8835 12.6523 15.7331 12.3516 15.5645C12.0553 15.3958 11.791 15.1976 11.5586 14.9697C11.3262 14.7419 11.1416 14.473 11.0049 14.1631C10.8727 13.8486 10.8066 13.4795 10.8066 13.0557C10.8066 12.4906 10.9411 12.0075 11.21 11.6064C11.4834 11.2054 11.8662 10.8978 12.3584 10.6836C12.8551 10.4694 13.4339 10.3623 14.0947 10.3623C14.6188 10.3623 15.111 10.417 15.5713 10.5264C16.0361 10.6357 16.4919 10.7907 16.9385 10.9912L16.4189 12.3105C16.0088 12.1419 15.61 12.0075 15.2227 11.9072C14.8398 11.807 14.4479 11.7568 14.0469 11.7568C13.7005 11.7568 13.4066 11.8092 13.165 11.9141C12.9235 12.0189 12.7389 12.167 12.6113 12.3584C12.4883 12.5452 12.4268 12.7686 12.4268 13.0283C12.4268 13.32 12.4974 13.5661 12.6387 13.7666C12.7845 13.9626 13.0078 14.1426 13.3086 14.3066C13.6139 14.4707 14.0059 14.653 14.4844 14.8535C15.0358 15.0814 15.5029 15.3206 15.8857 15.5713C16.2731 15.8219 16.5693 16.1227 16.7744 16.4736C16.9795 16.82 17.082 17.2552 17.082 17.7793ZM20.4521 12.9326V20.5H18.8457V12.9326H20.4521ZM19.6592 10.0342C19.9053 10.0342 20.1172 10.1003 20.2949 10.2324C20.4772 10.3646 20.5684 10.5924 20.5684 10.916C20.5684 11.235 20.4772 11.4629 20.2949 11.5996C20.1172 11.7318 19.9053 11.7979 19.6592 11.7979C19.404 11.7979 19.1875 11.7318 19.0098 11.5996C18.8366 11.4629 18.75 11.235 18.75 10.916C18.75 10.5924 18.8366 10.3646 19.0098 10.2324C19.1875 10.1003 19.404 10.0342 19.6592 10.0342ZM24.916 23.8633C23.8906 23.8633 23.1045 23.6787 22.5576 23.3096C22.0107 22.9404 21.7373 22.4232 21.7373 21.7578C21.7373 21.293 21.8831 20.8988 22.1748 20.5752C22.4665 20.2562 22.8835 20.0352 23.4258 19.9121C23.2207 19.821 23.043 19.6797 22.8926 19.4883C22.7467 19.2923 22.6738 19.0758 22.6738 18.8389C22.6738 18.5563 22.7536 18.3148 22.9131 18.1143C23.0726 17.9137 23.3118 17.7201 23.6309 17.5332C23.2344 17.3646 22.9154 17.0911 22.6738 16.7129C22.4368 16.3301 22.3184 15.8812 22.3184 15.3662C22.3184 14.8193 22.4346 14.3545 22.667 13.9717C22.8994 13.5843 23.2389 13.2904 23.6855 13.0898C24.1322 12.8848 24.6722 12.7822 25.3057 12.7822C25.4424 12.7822 25.5905 12.7913 25.75 12.8096C25.9141 12.8232 26.0645 12.8415 26.2012 12.8643C26.3424 12.8825 26.4495 12.903 26.5225 12.9258H29.1406V13.8213L27.8555 14.0605C27.9785 14.2337 28.0765 14.432 28.1494 14.6553C28.2223 14.874 28.2588 15.1133 28.2588 15.373C28.2588 16.1569 27.9876 16.7744 27.4453 17.2256C26.9076 17.6722 26.1647 17.8955 25.2168 17.8955C24.9889 17.8864 24.7679 17.8682 24.5537 17.8408C24.3896 17.9411 24.2643 18.0527 24.1777 18.1758C24.0911 18.2943 24.0479 18.4287 24.0479 18.5791C24.0479 18.7021 24.0911 18.8024 24.1777 18.8799C24.2643 18.9528 24.3919 19.0075 24.5605 19.0439C24.7337 19.0804 24.9434 19.0986 25.1895 19.0986H26.4951C27.3245 19.0986 27.958 19.2741 28.3955 19.625C28.833 19.9759 29.0518 20.4909 29.0518 21.1699C29.0518 22.0312 28.6963 22.6943 27.9854 23.1592C27.2744 23.6286 26.2513 23.8633 24.916 23.8633ZM24.9775 22.7354C25.5381 22.7354 26.0098 22.6807 26.3926 22.5713C26.7754 22.4619 27.0648 22.3047 27.2607 22.0996C27.4567 21.8991 27.5547 21.6598 27.5547 21.3818C27.5547 21.1357 27.4932 20.9466 27.3701 20.8145C27.2471 20.6823 27.0625 20.5911 26.8164 20.541C26.5703 20.4909 26.265 20.4658 25.9004 20.4658H24.7109C24.4147 20.4658 24.1527 20.5114 23.9248 20.6025C23.6969 20.6982 23.5192 20.835 23.3916 21.0127C23.2686 21.1904 23.207 21.4046 23.207 21.6553C23.207 22.0016 23.3597 22.2682 23.665 22.4551C23.9749 22.6419 24.4124 22.7354 24.9775 22.7354ZM25.292 16.8428C25.7614 16.8428 26.11 16.7152 26.3379 16.46C26.5658 16.2002 26.6797 15.8356 26.6797 15.3662C26.6797 14.8558 26.5612 14.473 26.3242 14.2178C26.0918 13.9626 25.7454 13.835 25.2852 13.835C24.834 13.835 24.4899 13.9648 24.2529 14.2246C24.0205 14.4844 23.9043 14.8695 23.9043 15.3799C23.9043 15.8402 24.0205 16.2002 24.2529 16.46C24.4899 16.7152 24.8363 16.8428 25.292 16.8428ZM34.4658 12.7891C35.318 12.7891 35.9811 13.0101 36.4551 13.4521C36.9336 13.8896 37.1729 14.5938 37.1729 15.5645V20.5H35.5664V15.8652C35.5664 15.2773 35.4456 14.8376 35.2041 14.5459C34.9626 14.2497 34.5889 14.1016 34.083 14.1016C33.3493 14.1016 32.8389 14.3271 32.5518 14.7783C32.2692 15.2295 32.1279 15.8835 32.1279 16.7402V20.5H30.5215V12.9326H31.7725L31.998 13.958H32.0869C32.251 13.6937 32.4538 13.4772 32.6953 13.3086C32.9414 13.1354 33.2148 13.0055 33.5156 12.9189C33.821 12.8324 34.1377 12.7891 34.4658 12.7891ZM49.7578 16.6992C49.7578 17.3281 49.6758 17.8864 49.5117 18.374C49.3477 18.8617 49.1084 19.2741 48.7939 19.6113C48.4795 19.944 48.1012 20.1992 47.6592 20.377C47.2171 20.5501 46.7181 20.6367 46.1621 20.6367C45.6426 20.6367 45.1663 20.5501 44.7334 20.377C44.3005 20.1992 43.9245 19.944 43.6055 19.6113C43.291 19.2741 43.0472 18.8617 42.874 18.374C42.7008 17.8864 42.6143 17.3281 42.6143 16.6992C42.6143 15.8652 42.7578 15.1589 43.0449 14.5801C43.3366 13.9967 43.7513 13.5524 44.2891 13.2471C44.8268 12.9417 45.4671 12.7891 46.21 12.7891C46.9072 12.7891 47.5225 12.9417 48.0557 13.2471C48.5889 13.5524 49.0059 13.9967 49.3066 14.5801C49.6074 15.1634 49.7578 15.8698 49.7578 16.6992ZM44.2686 16.6992C44.2686 17.2507 44.3346 17.7223 44.4668 18.1143C44.6035 18.5062 44.8132 18.807 45.0957 19.0166C45.3783 19.2217 45.7428 19.3242 46.1895 19.3242C46.6361 19.3242 47.0007 19.2217 47.2832 19.0166C47.5658 18.807 47.7731 18.5062 47.9053 18.1143C48.0374 17.7223 48.1035 17.2507 48.1035 16.6992C48.1035 16.1478 48.0374 15.6807 47.9053 15.2979C47.7731 14.9105 47.5658 14.6165 47.2832 14.416C47.0007 14.2109 46.6338 14.1084 46.1826 14.1084C45.5173 14.1084 45.0319 14.3317 44.7266 14.7783C44.4212 15.2249 44.2686 15.8652 44.2686 16.6992ZM58.2002 12.9326V20.5H56.9355L56.7168 19.4814H56.6279C56.4684 19.7412 56.2656 19.9577 56.0195 20.1309C55.7734 20.2995 55.5 20.4248 55.1992 20.5068C54.8984 20.5934 54.5817 20.6367 54.249 20.6367C53.6794 20.6367 53.1917 20.541 52.7861 20.3496C52.3851 20.1536 52.0775 19.8529 51.8633 19.4473C51.6491 19.0417 51.542 18.5176 51.542 17.875V12.9326H53.1553V17.5742C53.1553 18.1621 53.2738 18.6019 53.5107 18.8936C53.7523 19.1852 54.126 19.3311 54.6318 19.3311C55.1195 19.3311 55.5068 19.2308 55.7939 19.0303C56.0811 18.8298 56.2839 18.5335 56.4023 18.1416C56.5254 17.7497 56.5869 17.2689 56.5869 16.6992V12.9326H58.2002ZM63.3203 19.3379C63.5299 19.3379 63.7373 19.3197 63.9424 19.2832C64.1475 19.2422 64.3343 19.1943 64.5029 19.1396V20.3564C64.3252 20.4339 64.0951 20.5 63.8125 20.5547C63.5299 20.6094 63.236 20.6367 62.9307 20.6367C62.5023 20.6367 62.1172 20.5661 61.7754 20.4248C61.4336 20.279 61.1624 20.0306 60.9619 19.6797C60.7614 19.3288 60.6611 18.8434 60.6611 18.2236V14.1562H59.6289V13.4385L60.7363 12.8711L61.2627 11.251H62.2744V12.9326H64.4414V14.1562H62.2744V18.2031C62.2744 18.5859 62.3701 18.8708 62.5615 19.0576C62.7529 19.2445 63.0059 19.3379 63.3203 19.3379Z"
                                  fill="#0063F7"
                                />
                                <path
                                  d="M87 5H77C75.3 5 74 6.3 74 8V14H82.6L80.3 11.7C79.9 11.3 79.9 10.7 80.3 10.3C80.7 9.9 81.3 9.9 81.7 10.3L85.7 14.3C86.1 14.7 86.1 15.3 85.7 15.7L81.7 19.7C81.3 20.1 80.7 20.1 80.3 19.7C79.9 19.3 79.9 18.7 80.3 18.3L82.6 16H74V22C74 23.7 75.3 25 77 25H87C88.7 25 90 23.7 90 22V8C90 6.3 88.7 5 87 5Z"
                                  fill="#0063F7"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

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
                  variant="primary"
                  disabled={(selectedSubmissions ?? []).length === 0}
                  onClick={() => {
                    openSelectedItemsModal();
                  }}
                >
                  <div>Sign out ({(selectedSubmissions ?? []).length})</div>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSelectedItemsModal && (
        <MultiSignOutModel
          handleShowModel={() => {
            setShowSelectedItemsModal(!showSelectedItemsModal);
            handleCancel();
          }}
          selectedSubmissions={selectedSubmissions}
        />
      )}

      {showModel && (
        <SignOutModel
          handleClose={() => {
            setShowModel(!showModel);
          }}
          details={details}
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
              <ModalBody className="flex flex-col justify-start overflow-y-scroll px-2 scrollbar-hide">
                <div
                  className="my-2 w-full"
                  onClick={() => setOpenDropdown('')}
                >
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
                  name="siteName"
                  className="w-full"
                  value={siteId}
                  onChange={(value) => {
                    setSiteId(value.target.value);
                  }}
                />

                <div className="w-full">
                  <CustomSearchSelect
                    label="Visitor Type"
                    data={(visitorTypes ?? []).flatMap((visitor) => {
                      return [
                        {
                          label: `${visitor.name}`,
                          value: String(visitor.id),
                        },
                      ];
                    })}
                    showImage={false}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown3'}
                    onToggle={() => handleToggleDropdown('dropdown3')}
                    onSelect={(selected: string[]) =>
                      setSelectedVisitorType(selected)
                    }
                    placeholder="All"
                  />
                </div>

                <SimpleInput
                  type="text"
                  label="First Name"
                  placeholder="Enter First Name"
                  name="firstName"
                  className="w-full"
                  value={personalDetails.firstName}
                  onChange={handlePersonalDetailsChange}
                />
                <SimpleInput
                  type="text"
                  label="Last Name"
                  placeholder="Enter Last Name"
                  name="lastName"
                  className="w-full"
                  value={personalDetails.lastName}
                  onChange={handlePersonalDetailsChange}
                />
                <SimpleInput
                  type="text"
                  label="Contact Phone"
                  placeholder="Enter Contact Phone"
                  name="contactPhone"
                  className="w-full"
                  value={personalDetails.contactPhone}
                  onChange={handlePersonalDetailsChange}
                />
                <SimpleInput
                  type="text"
                  label="Email Address"
                  placeholder="Enter Email Address"
                  name="emailAddress"
                  className="w-full"
                  value={personalDetails.emailAddress}
                  onChange={handlePersonalDetailsChange}
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
    </>
  );
}
