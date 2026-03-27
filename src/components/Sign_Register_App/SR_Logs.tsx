import { useMemo, useState } from 'react';

import { Switch } from '@material-tailwind/react';

import { Search } from '@/components/Form/search';
import { Button } from '@/components/Buttons';
import { SRTopBar } from './SR_Top_Bar';
import useAxiosAuth from '@/hooks/AxiosAuth';

import { useQuery } from 'react-query';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import ShowSRDetail from './Models/SR_Detail';
import { SignInRegisterSubmission } from '@/app/type/Sign_Register_Submission';
import type { SRLogs } from '@/app/(main)/(user-panel)/user/apps/sr/api';
import Loader from '../DottedLoader/loader';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react';
import DateRangePicker from '@/components/JobSafetyAnalysis/CreateNewComponents/JSA_Calender';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { SimpleInput } from '@/components/Form/simpleInput';
import { SR_APP_ACTION_TYPE } from '@/app/helpers/user/enums';
import { useSRAppCotnext } from '@/app/(main)/(user-panel)/user/apps/sr/sr_context';
import { getAllAppProjects } from '@/app/(main)/(user-panel)/user/apps/api';
import FilterButton from '../TimeSheetApp/CommonComponents/FilterButton/FilterButton';
import { CustomBlueCheckBox } from '../Custom_Checkbox/Custom_Blue_Checkbox';
import CustomModal from '../Custom_Modal';
import { downloadCSV } from '../../utils/generateCsv';
import { getAllSRLogs } from '@/app/(main)/(user-panel)/user/apps/sr/api';
import { PresignedUserAvatar } from '@/components/common/PresignedUserAvatar';
export default function SRLogsPage() {
  const memoizedTopBar = useMemo(() => <SRTopBar />, []);
  const [confirmOption, setConfirmOption] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'csv'>('csv');
  const [showSelectedItemsModal, setShowSelectedItemsModal] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedSubmissions, setCheckedSubmissions] = useState<SRLogs[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminMode, setAdminMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('View All');
  const [showDetailModel, toggleDetailModel] = useState(false);
  const [model, setModel] = useState<SignInRegisterSubmission | undefined>();
  const context = useSRAppCotnext();
  // Filter Values
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryFn: () => getAllAppProjects(axiosAuth),
    queryKey: ['allProjects'],
  });
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
  const visitorTypes = [
    { id: 1, name: 'Customer' },
    { id: 2, name: 'Supplier' },
    { id: 3, name: 'Employee' },
    { id: 4, name: 'Contractor' },
    { id: 5, name: 'Courier / Delivery Person' },
    { id: 6, name: 'Family member' },
    { id: 7, name: 'Friend' },
  ];
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
  const [signInStatus, setSignInStatus] = useState('');
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
    setSignInStatus('');
    setSelectedVisitorType([]);
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
      selectedVisitorType.length > 0 ||
      signInStatus !== ''
    );
  };

  const handleApplyFilters = () => {
    setShowFilterModel(!showFilterModel);
    if (areFiltersApplied()) {
      setApplyFilter(true);
    }
  };
  /////// ENd //////
  const handleClose = () => {
    toggleDetailModel(!showDetailModel);
    setModel(undefined);
  };
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
  };
  const axiosAuth = useAxiosAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['SRLogs', adminMode],
    queryFn: () => getAllSRLogs({ axiosAuth, isAdmin: adminMode }),
  });

  if (isLoading) return <Loader />;

  const filteredData = data
    ?.filter((item) => {
      if (!item.signinId) {
        return true;
      }

      if (searchQuery === '') {
        return true;
      }

      const query = searchQuery.toLowerCase();
      const firstName = (item.signinId.firstName || '').toLowerCase();
      const lastName = (item.signinId.lastName || '').toLowerCase();
      const email = (item.signinId.email || '').toLowerCase();
      const contact = (item.signinId.contact || '').toLowerCase();
      const submittedByFirstName = (
        item.signinId.submittedBy?.firstName || ''
      ).toLowerCase();
      const submittedByLastName = (
        item.signinId.submittedBy?.lastName || ''
      ).toLowerCase();
      const submittedByEmail = (
        item.signinId.submittedBy?.email || ''
      ).toLowerCase();

      return (
        firstName.includes(query) ||
        lastName.includes(query) ||
        email.includes(query) ||
        contact.includes(query) ||
        submittedByFirstName.includes(query) ||
        submittedByLastName.includes(query) ||
        submittedByEmail.includes(query)
      );
    })
    // .filter((item) => {
    //   if (!isApplyFilter) {
    //     return true;
    //   } else {
    //     if (siteId == '') {
    //       return true;
    //     } else {
    //       return siteId == item.signinId.site._id;
    //     }
    //   }
    // })
    .filter((item) => {
      if (selected === 'Guest') {
        return item.signinId?.userType == 2;
      } else if (selected === 'User') {
        return item.signinId?.userType == 1;
      } else {
        return item;
      }
    })
    .filter((detailsFName) => {
      if (!isApplyFilter || personalDetails.firstName == '') {
        return true;
      } else {
        return (
          personalDetails.firstName.trim() ==
          detailsFName.signinId?.firstName.trim()
        );
      }
    })
    .filter((forProject) => {
      if (!isApplyFilter || selectedProjects.length === 0) {
        return forProject;
      }
      return selectedProjects.includes(forProject?.signinId?.project?._id!);
    })
    .filter((detailsLName) => {
      if (!isApplyFilter || personalDetails.lastName == '') {
        return true;
      } else {
        return personalDetails.lastName == detailsLName?.signinId?.lastName;
      }
    })

    .filter((detailsContact) => {
      if (!isApplyFilter || personalDetails.contactPhone == '') {
        return true;
      } else {
        return (
          personalDetails.contactPhone.trim() ==
          detailsContact?.signinId?.contact.trim()
        );
      }
    })
    .filter((value) => {
      if (!isApplyFilter || signInStatus == '') {
        return true;
      } else {
        return value.logType == signInStatus;
      }
    })
    .filter((detailsEmail) => {
      if (!isApplyFilter || personalDetails.emailAddress == '') {
        return true;
      } else {
        return personalDetails.emailAddress == detailsEmail.signinId?.email;
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
    });

  const sortedUsers = [...(filteredData ?? [])]
    .filter((user) => user != null) // Filter out null/undefined entries
    .sort((a, b) => {
      // Handle null values in firstName
      const aFirstName = a?.signinId?.firstName?.toLowerCase() || '';
      const bFirstName = b?.signinId?.firstName?.toLowerCase() || '';

      // Handle null values in lastName
      const aLastName = a?.signinId?.lastName?.toLowerCase() || '';
      const bLastName = b?.signinId?.lastName?.toLowerCase() || '';

      // Handle null dates (fallback to epoch if null)
      const aDate = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b?.createdAt ? new Date(b.createdAt).getTime() : 0;

      switch (activeSort) {
        case 'firstName':
          if (aFirstName < bFirstName) return sortFirstName === 'asc' ? -1 : 1;
          if (aFirstName > bFirstName) return sortFirstName === 'asc' ? 1 : -1;
          return 0;

        case 'lastName':
          if (aLastName < bLastName) return sortLastName === 'asc' ? -1 : 1;
          if (aLastName > bLastName) return sortLastName === 'asc' ? 1 : -1;
          return 0;

        case 'date':
          return sortDate === 'asc' ? aDate - bDate : bDate - aDate;

        default:
          return 0;
      }
    });

  ////multi selection here

  const handleCancel = () => {
    setCheckedSubmissions([]);
    setIsSelectMode(false); // Exit select mode
  };

  const handleSelectAllChange = () => {
    if ((sortedUsers ?? []).length == (selectedSubmissions ?? []).length) {
      handleCancel();
    } else {
      setCheckedSubmissions([...(sortedUsers ?? [])]);
    }
  };
  const handleCheckboxChange = (rc: SRLogs) => {
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

  const handleOptionChange = (option: 'csv') => {
    setSelectedOption(option);
  };

  ////////////=========////////////
  return (
    <>
      <div className="absolute inset-0 z-10 flex h-[calc(var(--app-vh)-70px)] w-full max-w-[1360px] flex-col bg-white px-4 pt-4 font-Open-Sans">
        <div className="flex h-full flex-1 flex-col justify-start overflow-auto scrollbar-hide">
          {/* TopBar */}
          {memoizedTopBar}

          {/* ///////////////// Middle content ////////////////////// */}

          <div className="flex h-full flex-1 flex-col justify-start overflow-auto scrollbar-hide">
            <div className="mt-4 flex justify-between">
              <div className="flex items-center gap-2 text-2xl font-bold text-[#1E1E1E]">
                <img src="/svg/sr/logo.svg" alt="show logo" />
                Sign in Log
              </div>
              <div className="flex items-center">
                <label className="mx-2 flex items-center space-x-2">
                  <span>Admin Mode</span>
                  <Switch
                    id="custom-switch-component"
                    // ripple={!adminMode}
                    checked={adminMode}
                    className="h-full w-full bg-red-300 checked:bg-green-300"
                    containerProps={{
                      className: 'w-11 h-6',
                    }}
                    circleProps={{
                      className: 'before:hidden left-0.5 border-none',
                    }}
                    onChange={() => {
                      setAdminMode(!adminMode);
                    }}
                    crossOrigin={undefined}
                  />
                </label>
                {/* DropDown Custom */}
                <div className="DropDownn relative z-50 mx-3 inline-block text-left">
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
                  </div>

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

                <div className="Search team-actice flex items-center justify-between gap-2">
                  <FilterButton
                    isApplyFilter={isApplyFilter}
                    setShowModel={setShowFilterModel}
                    showModel={showFilterModel}
                    setOpenDropdown={setOpenDropdown}
                    clearFilters={clearFilters}
                  />
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

            {/* /// table section  */}

            <div className="w-full">
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
                    <th className="hidden px-2 py-3 md:table-cell">
                      Site Name
                    </th>

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
                    <th className="w-[140px] rounded-r-lg bg-[#F5F5F5] px-4 py-3 text-right text-sm font-normal text-[#0063F7]">
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
                                (sortedUsers ?? []).length ==
                                (selectedSubmissions ?? []).length
                                  ? 'border-[#6990FF] bg-[#6990FF] checked:border-[#6990FF] checked:bg-[#6990FF]'
                                  : 'border-[#9E9E9E] bg-white'
                              } transition-colors duration-200 ease-in-out`}
                              onChange={handleSelectAllChange}
                            />
                            {(sortedUsers ?? []).length ==
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
                <tbody className="overflow-auto text-sm font-normal text-[#1E1E1E]">
                  {(sortedUsers ?? []).map((item) => {
                    return (
                      <tr
                        key={item._id}
                        className="relative cursor-pointer border-b even:bg-[#F5F5F5]"
                        onClick={() => {
                          toggleDetailModel(!showDetailModel),
                            setModel(item.signinId);
                        }}
                      >
                        <td className="px-4 py-2">
                          {item.signinId?.firstName || '-'}
                        </td>
                        <td className="px-4 py-2">
                          {item.signinId?.lastName || '-'}
                        </td>
                        <td className="hidden w-96 px-4 py-2 md:table-cell">
                          <span className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-800">
                            {item.signinId?.site?.siteName || '-'}
                          </span>
                        </td>
                        <td className="flex items-center px-4 py-2">
                          <PresignedUserAvatar
                            photo={item.signinId?.submittedBy?.photo}
                            fallback="/images/user.png"
                            alt="User"
                            className="mr-2 h-8 w-8 rounded-full border border-gray-500 object-cover"
                          />
                          {item.signinId?.submittedBy
                            ? `${item.signinId.submittedBy.firstName ?? ''} ${
                                item.signinId.submittedBy.lastName ?? ''
                              }`.trim() || '-'
                            : '-'}
                        </td>
                        <td className="hidden px-4 py-2 md:flex">
                          <div className="flex flex-col gap-1">
                            <div>
                              {item.signinId?.signInAt
                                ? dateFormat(item.signinId.signInAt.toString())
                                : dateFormat(item.createdAt.toString())}
                            </div>
                            <div>
                              {item.signinId?.signInAt
                                ? timeFormat(item.signinId.signInAt.toString())
                                : timeFormat(item.createdAt.toString())}
                            </div>
                          </div>
                        </td>
                        {/* make td also not clickable by parents  */}
                        <td
                          className="flex cursor-pointer justify-end px-4 py-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isSelectMode ? (
                            <>
                              <CustomBlueCheckBox
                                label={''}
                                checked={selectedSubmissions.some(
                                  (sr) => item._id == sr._id
                                )}
                                onChange={function (): void {
                                  handleCheckboxChange(item);
                                }}
                              />
                            </>
                          ) : (
                            <StatusButton type={item.logType ?? ''} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
                    setShowSelectedItemsModal(true);
                  }}
                >
                  <div>Select ({(selectedSubmissions ?? []).length})</div>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showDetailModel && (
        <ShowSRDetail
          details={model}
          handleClose={() => {
            handleClose();
          }}
        />
      )}

      {/* // show model for export  */}
      <CustomModal
        isOpen={showSelectedItemsModal}
        handleCancel={() => {
          if (!confirmOption) {
            setShowSelectedItemsModal(false);
          } else {
            setConfirmOption(false);
            setSelectedOption('csv');
          }
        }}
        cancelButton={confirmOption ? 'Back' : 'Cancel'}
        header={
          <div className="flex w-fit gap-4">
            <svg
              width="50"
              height="50"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
              <path
                d="M16.25 33.75H18.0312L30.25 21.5313L28.4688 19.75L16.25 31.9688V33.75ZM13.75 36.25V30.9375L30.25 14.4688C30.5 14.2396 30.7763 14.0625 31.0788 13.9375C31.3813 13.8125 31.6987 13.75 32.0312 13.75C32.3638 13.75 32.6867 13.8125 33 13.9375C33.3133 14.0625 33.5842 14.25 33.8125 14.5L35.5312 16.25C35.7812 16.4792 35.9638 16.75 36.0788 17.0625C36.1938 17.375 36.2508 17.6875 36.25 18C36.25 18.3333 36.1929 18.6513 36.0788 18.9538C35.9646 19.2562 35.7821 19.5321 35.5312 19.7812L19.0625 36.25H13.75ZM29.3438 20.6562L28.4688 19.75L30.25 21.5313L29.3438 20.6562Z"
                fill="#0063F7"
              />
            </svg>{' '}
            <div>
              <h2 className="text-xl font-semibold">Bulk Select Options</h2>
              <p className="mt-1 text-sm font-normal text-[#616161]">
                Select an option below.
              </p>
            </div>
          </div>
        }
        body={
          <div className="flex h-[300px] flex-col space-y-4 overflow-y-auto">
            {!confirmOption && (
              <div className="mb-24 flex flex-col space-y-4 p-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="option"
                    checked={selectedOption == 'csv'}
                    onClick={() => handleOptionChange('csv')}
                    className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                  />
                  <span className="ml-2">Export to CSV</span>
                </label>
              </div>
            )}
            {selectedOption === 'csv' && confirmOption && (
              <div className="flex items-center justify-between">
                <div className="max-w-[350px] truncate text-[20px] text-[#0063F7]">
                  export.csv
                </div>
                <div
                  className="text-[20px] font-bold text-[#0063F7]"
                  onClick={() => {
                    const flattenedData = (selectedSubmissions ?? []).map(
                      (item) => ({
                        // Top-level fields

                        // logType: item.logType,

                        // Flatten signinId
                        firstName: item.signinId?.firstName || '',
                        lastName: item.signinId?.lastName || '',
                        email: item.signinId?.email || '',
                        contact: item.signinId?.contact || '',

                        visitorType:
                          item.signinId?.visitorType === 1 ? 'MySelf' : 'Guest',
                        siteName: item.signinId?.site?.siteName || '',
                        address: item.signinId?.site.addressLineOne || '',
                        dateTime: `${dateFormat(item.createdAt.toString())} ${timeFormat(item.createdAt.toString())}`,
                        // Add any other fields you need
                      })
                    );
                    downloadCSV(flattenedData, 'export.csv');
                  }}
                >
                  Download
                </div>
              </div>
            )}
          </div>
        }
        justifyButton={'justify-end'}
        handleSubmit={() => {
          if (!confirmOption) {
            // Handle CSV export logic here
            console.log('Exporting to CSV...');
            setConfirmOption(true);
          } else {
            setShowSelectedItemsModal(!showSelectedItemsModal);
          }
        }}
        submitValue={confirmOption ? 'Close' : 'Next'}
      />
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
                    label="Sign in Status"
                    data={[
                      {
                        label: 'All',
                        value: 'All',
                      },
                      {
                        label: 'Signed In',
                        value: 'Signed in',
                      },

                      {
                        label: 'Signed Out',
                        value: 'Signed out',
                      },
                    ]}
                    showImage={false}
                    multiple={false}
                    isOpen={openDropdown === 'dropdown4'}
                    returnSingleValueWithLabel={true}
                    onToggle={() => handleToggleDropdown('dropdown4')}
                    onSelect={(selected: any) => setSignInStatus(selected)}
                    selected={[signInStatus]}
                    placeholder="All"
                  />
                </div>
                <div className="w-full">
                  <CustomSearchSelect
                    isRequired={true}
                    label="Assigned Project"
                    data={[
                      {
                        label: 'All',
                        value: 'all',
                      },
                      ...(projects ?? []).map((project) => ({
                        label: project.name ?? '',
                        value: project._id ?? '',
                      })),
                    ]}
                    showImage={false}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown1'}
                    onToggle={() => handleToggleDropdown('dropdown1')}
                    onSelect={(selected: string[]) =>
                      setSelectedProjects(selected)
                    }
                    selected={selectedProjects}
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
                    data={[
                      {
                        label: 'All',
                        value: 'all',
                      },
                      ...(visitorTypes ?? []).map((visitorType) => ({
                        label: visitorType.name ?? '',
                        value: visitorType.id ?? '',
                      })),
                    ]}
                    showImage={false}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown3'}
                    onToggle={() => handleToggleDropdown('dropdown3')}
                    onSelect={(selected: string[]) =>
                      setSelectedVisitorType(selected)
                    }
                    selected={selectedVisitorType}
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

const StatusButton = ({ type }: { type: string }) => {
  if (type == 'Signed out') {
    return (
      <div className="rounded-lg border-2 border-[#5A5A5A] px-2 py-1 text-[#5A5A5A]">
        Signed Out
      </div>
    );
  } else {
    return (
      <div className="rounded-lg border-2 border-[#3BB66C] px-2 py-1 text-[#3BB66C]">
        Signed in
      </div>
    );
  }
};
