import React, { useState } from 'react';
import { Search } from '../Form/search';
import { Switch } from '@material-tailwind/react';
import {
  Breadcrumbs,
  BreadcrumbItem,
  ModalBody,
  ModalFooter,
  ModalContent,
  Modal,
  ModalHeader,
} from '@nextui-org/react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { JSAAPPACTIONTYPE } from '@/app/helpers/user/enums';
import { useQuery } from 'react-query';
import {
  checkJSAPermission,
  getAllOrgUsers,
  getJSASubmissionList,
  JSAAppModel,
} from '@/app/(main)/(user-panel)/user/apps/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import Loader from '../DottedLoader/loader';
import { useSession } from 'next-auth/react';

import { useRouter } from 'next/navigation';
import AdminSwitch from '../AdminSwitch/AdminSwitch';
import FilterButton from '../TimeSheetApp/CommonComponents/FilterButton/FilterButton';
import { Button } from '../Buttons';
import { CustomSearchSelect } from '../TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import DateRangePicker from './CreateNewComponents/JSA_Calender';
const TemplateListing = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selected, setSelected] = useState('All Templates');
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const router = useRouter();
  const context = useJSAAppsCotnext();
  const axiosAuth = useAxiosAuth();
  const [adminMode, setAdminMode] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const { data: session } = useSession();

  // Check if user is Root User from session (role 3 = Organization Admin)
  const isRootUser = (session?.user as any)?.role === 3;

  const handleGoBack = () => {
    context.dispatch({
      type: JSAAPPACTIONTYPE.SHOWPAGES,
    });
  };
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['JSATemplates', adminMode],
    queryFn: () =>
      getJSASubmissionList({
        axiosAuth,
        isAdmin: adminMode,
        saveAs: 'Template',
      }),
    enabled: true, // Always enabled
  });

  const { data: users, isLoading: userLoading } = useQuery({
    queryKey: 'allOrgUsers',
    queryFn: () => getAllOrgUsers(axiosAuth),
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedSubmittedBy, setSelectedSubmittedBy] = useState<string[]>([]);
  const [referenceQuery, setReferenceQuery] = useState<string>('');
  const [submissionType, setSubmissionType] = useState<
    'all' | 'private' | 'public'
  >('all');

  const handleOptionChange = (option: 'all' | 'private' | 'public') => {
    setSubmissionType(option);
  };

  // Filter Modal
  const [isApplyFilter, setApplyFilter] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string>('');
  const handleToggleDropdown = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? '' : dropdownId);
  };

  // Filter handling
  const clearFilters = () => {
    setSelectedProjects([]);
    setSelectedCustomers([]);
    setSelectedSubmittedBy([]);
    context.dispatch({
      type: JSAAPPACTIONTYPE.JSA_DETAIL_DATE,
      jsaDetailDate: { from: undefined, to: undefined },
    });
    setReferenceQuery('');
    setSubmissionType('all');

    setApplyFilter(false);
  };

  const areFiltersApplied = () => {
    return (
      selectedProjects.length > 0 ||
      selectedCustomers.length > 0 ||
      selectedSubmittedBy.length > 0 ||
      context.state.jsaDetailDate != null ||
      referenceQuery.trim() !== '' ||
      submissionType != 'all'
    );
  };

  const handleApplyFilters = () => {
    setShowModel(!showModel);
    if (areFiltersApplied()) {
      setApplyFilter(true);
    }
  };
  // Check app-level permission (backend already checks global apps permission and returns adminTeams: true if user has it)
  const { data: permission } = useQuery('JSASettingPermission', () =>
    checkJSAPermission(axiosAuth)
  );

  // User can use Admin Mode if Root User or has permission (which includes global apps permission)
  const canUseAdminMode = isRootUser || permission?.adminTeams === true;
  const filterData = data
    ?.filter((app: JSAAppModel) => {
      if (selected === 'Shared Templates') {
        return app.templateSharing === 2;
      }
      if (selected === 'My Templates') {
        return app.templateSharing === 1;
      } else {
        return true;
      }
    })
    .filter((app: JSAAppModel) => {
      if (searchQuery.toLowerCase() === '') {
        return true;
      }
      return app.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

  // Default sort: newest to oldest by createdAt
  const sortedData =
    filterData?.slice().sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }) ?? [];

  const [selectedSubmissions, setCheckedSubmissions] = useState<JSAAppModel[]>(
    []
  );

  // Handle "Select All" checkbox change
  const handleSelectAllChange = () => {
    if (sortedData.length == (selectedSubmissions ?? []).length) {
      handleCancel();
    } else {
      setCheckedSubmissions([...sortedData]);
    }
  };

  const handleCheckboxChange = (js: JSAAppModel) => {
    if (selectedSubmissions.some((selectedTs) => selectedTs._id === js._id)) {
      setCheckedSubmissions([
        ...(selectedSubmissions ?? []).filter(
          (selectedTs) => selectedTs._id !== js._id
        ),
      ]);
    } else {
      setCheckedSubmissions([...(selectedSubmissions ?? []), js]);
    }
  };

  // Handle Cancel button click (uncheck all checkboxes)
  const handleCancel = () => {
    setCheckedSubmissions([]);
    setIsSelectMode(false); // Exit select mode
  };
  const [isSelectMode, setIsSelectMode] = useState(false);

  return (
    <>
      <div className="absolute inset-0 z-10 flex h-[calc(var(--app-vh)-70px)] w-full max-w-[1360px] flex-col bg-white px-4 pt-4 font-Open-Sans">
        <div className="flex h-full flex-1 flex-col justify-start overflow-auto scrollbar-hide">
          <div className="flex items-center justify-between">
            <div className="breadCrumbs">
              <Breadcrumbs className="font-semibold">
                <BreadcrumbItem>Tiki Apps</BreadcrumbItem>
                <BreadcrumbItem>Job Safety Analysis</BreadcrumbItem>
              </Breadcrumbs>
            </div>
            <button
              className="text-sm font-semibold text-[#0063F7]"
              onClick={handleGoBack}
            >
              <svg
                width="80"
                height="24"
                viewBox="0 0 80 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M30.3457 11.5723H34.0781V16.5898C33.554 16.763 33.0117 16.8975 32.4512 16.9932C31.8906 17.0889 31.2617 17.1367 30.5645 17.1367C29.5482 17.1367 28.6868 16.9362 27.9805 16.5352C27.2786 16.1296 26.7454 15.5439 26.3809 14.7783C26.0163 14.0081 25.834 13.0807 25.834 11.9961C25.834 10.9525 26.0368 10.0479 26.4424 9.28223C26.848 8.51204 27.4382 7.91732 28.2129 7.49805C28.9876 7.07422 29.9264 6.8623 31.0293 6.8623C31.5716 6.8623 32.0957 6.91699 32.6016 7.02637C33.112 7.13118 33.5791 7.27702 34.0029 7.46387L33.4287 8.81738C33.0915 8.65788 32.7132 8.52344 32.2939 8.41406C31.8747 8.30469 31.4395 8.25 30.9883 8.25C30.2728 8.25 29.6553 8.40495 29.1357 8.71484C28.6208 9.02474 28.2243 9.46224 27.9463 10.0273C27.6683 10.5879 27.5293 11.251 27.5293 12.0166C27.5293 12.7594 27.641 13.4111 27.8643 13.9717C28.0876 14.5322 28.4362 14.9697 28.9102 15.2842C29.3887 15.5941 30.0062 15.749 30.7627 15.749C31.141 15.749 31.4622 15.7285 31.7266 15.6875C31.9909 15.6465 32.2347 15.6009 32.458 15.5508V12.9736H30.3457V11.5723ZM43.0059 13.1992C43.0059 13.8281 42.9238 14.3864 42.7598 14.874C42.5957 15.3617 42.3564 15.7741 42.042 16.1113C41.7275 16.444 41.3493 16.6992 40.9072 16.877C40.4652 17.0501 39.9661 17.1367 39.4102 17.1367C38.8906 17.1367 38.4144 17.0501 37.9814 16.877C37.5485 16.6992 37.1725 16.444 36.8535 16.1113C36.5391 15.7741 36.2952 15.3617 36.1221 14.874C35.9489 14.3864 35.8623 13.8281 35.8623 13.1992C35.8623 12.3652 36.0059 11.6589 36.293 11.0801C36.5846 10.4967 36.9993 10.0524 37.5371 9.74707C38.0749 9.44173 38.7152 9.28906 39.458 9.28906C40.1553 9.28906 40.7705 9.44173 41.3037 9.74707C41.8369 10.0524 42.2539 10.4967 42.5547 11.0801C42.8555 11.6634 43.0059 12.3698 43.0059 13.1992ZM37.5166 13.1992C37.5166 13.7507 37.5827 14.2223 37.7148 14.6143C37.8516 15.0062 38.0612 15.307 38.3438 15.5166C38.6263 15.7217 38.9909 15.8242 39.4375 15.8242C39.8841 15.8242 40.2487 15.7217 40.5312 15.5166C40.8138 15.307 41.0212 15.0062 41.1533 14.6143C41.2855 14.2223 41.3516 13.7507 41.3516 13.1992C41.3516 12.6478 41.2855 12.1807 41.1533 11.7979C41.0212 11.4105 40.8138 11.1165 40.5312 10.916C40.2487 10.7109 39.8818 10.6084 39.4307 10.6084C38.7653 10.6084 38.2799 10.8317 37.9746 11.2783C37.6693 11.7249 37.5166 12.3652 37.5166 13.1992ZM48.6523 7.00586H51.626C52.9157 7.00586 53.8887 7.19271 54.5449 7.56641C55.2012 7.9401 55.5293 8.58496 55.5293 9.50098C55.5293 9.88379 55.4609 10.2301 55.3242 10.54C55.1921 10.8454 54.9984 11.0983 54.7432 11.2988C54.488 11.4948 54.1735 11.627 53.7998 11.6953V11.7637C54.1872 11.832 54.5312 11.9528 54.832 12.126C55.1374 12.2992 55.3766 12.5475 55.5498 12.8711C55.7275 13.1947 55.8164 13.6139 55.8164 14.1289C55.8164 14.7396 55.6706 15.2591 55.3789 15.6875C55.0918 16.1159 54.6794 16.4417 54.1416 16.665C53.6084 16.8883 52.9749 17 52.2412 17H48.6523V7.00586ZM50.293 11.1279H51.8652C52.6081 11.1279 53.123 11.0072 53.4102 10.7656C53.6973 10.5241 53.8408 10.1709 53.8408 9.70605C53.8408 9.2321 53.6699 8.8903 53.3281 8.68066C52.9909 8.47103 52.4531 8.36621 51.7148 8.36621H50.293V11.1279ZM50.293 12.4541V15.626H52.0225C52.7881 15.626 53.3258 15.4779 53.6357 15.1816C53.9456 14.8854 54.1006 14.4844 54.1006 13.9785C54.1006 13.6686 54.0299 13.3997 53.8887 13.1719C53.752 12.944 53.5264 12.7686 53.2119 12.6455C52.8975 12.5179 52.4736 12.4541 51.9404 12.4541H50.293ZM60.6836 9.28906C61.6406 9.28906 62.363 9.50098 62.8506 9.9248C63.3428 10.3486 63.5889 11.0094 63.5889 11.9072V17H62.4473L62.1396 15.9268H62.085C61.8708 16.2002 61.6497 16.4258 61.4219 16.6035C61.194 16.7812 60.9297 16.9134 60.6289 17C60.3327 17.0911 59.9704 17.1367 59.542 17.1367C59.0908 17.1367 58.6875 17.0547 58.332 16.8906C57.9766 16.722 57.6963 16.4668 57.4912 16.125C57.2861 15.7832 57.1836 15.3503 57.1836 14.8262C57.1836 14.0469 57.473 13.4613 58.0518 13.0693C58.6351 12.6774 59.5146 12.4609 60.6904 12.4199L62.0029 12.3721V11.9756C62.0029 11.4515 61.8799 11.0778 61.6338 10.8545C61.3923 10.6312 61.0505 10.5195 60.6084 10.5195C60.2301 10.5195 59.8633 10.5742 59.5078 10.6836C59.1523 10.793 58.806 10.9274 58.4688 11.0869L57.9492 9.95215C58.3184 9.75618 58.7376 9.59668 59.207 9.47363C59.681 9.35059 60.1732 9.28906 60.6836 9.28906ZM61.9961 13.3838L61.0186 13.418C60.2165 13.4453 59.6536 13.582 59.3301 13.8281C59.0065 14.0742 58.8447 14.4115 58.8447 14.8398C58.8447 15.2135 58.9564 15.487 59.1797 15.6602C59.403 15.8288 59.6969 15.9131 60.0615 15.9131C60.6175 15.9131 61.0778 15.7559 61.4424 15.4414C61.8115 15.1224 61.9961 14.6553 61.9961 14.04V13.3838ZM68.8867 17.1367C68.1712 17.1367 67.5514 16.9977 67.0273 16.7197C66.5033 16.4417 66.0999 16.0156 65.8174 15.4414C65.5348 14.8672 65.3936 14.138 65.3936 13.2539C65.3936 12.3333 65.5485 11.5814 65.8584 10.998C66.1683 10.4147 66.5967 9.98405 67.1436 9.70605C67.695 9.42806 68.3262 9.28906 69.0371 9.28906C69.4883 9.28906 69.8962 9.33464 70.2607 9.42578C70.6299 9.51237 70.9421 9.61947 71.1973 9.74707L70.7188 11.0322C70.4408 10.9183 70.1559 10.8226 69.8643 10.7451C69.5726 10.6676 69.2923 10.6289 69.0234 10.6289C68.5814 10.6289 68.2122 10.7269 67.916 10.9229C67.6243 11.1188 67.4056 11.4105 67.2598 11.7979C67.1185 12.1852 67.0479 12.666 67.0479 13.2402C67.0479 13.7962 67.1208 14.2656 67.2666 14.6484C67.4124 15.0267 67.6289 15.3138 67.916 15.5098C68.2031 15.7012 68.5563 15.7969 68.9756 15.7969C69.3903 15.7969 69.7617 15.7467 70.0898 15.6465C70.418 15.5462 70.7279 15.4163 71.0195 15.2568V16.6514C70.7324 16.8154 70.4248 16.9362 70.0967 17.0137C69.7686 17.0957 69.3652 17.1367 68.8867 17.1367ZM74.4033 6.36328V11.5039C74.4033 11.7363 74.3942 11.9915 74.376 12.2695C74.3577 12.543 74.3395 12.8005 74.3213 13.042H74.3555C74.474 12.8825 74.6152 12.6956 74.7793 12.4814C74.9479 12.2673 75.1074 12.0804 75.2578 11.9209L77.5684 9.43262H79.4141L76.3857 12.6865L79.6123 17H77.7256L75.3057 13.6777L74.4033 14.4502V17H72.7969V6.36328H74.4033Z"
                  fill="#0063F7"
                />
                <path
                  d="M15 18L9 12L15 6"
                  stroke="#0063F7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="mb-4 mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative h-[50px] w-[50px] rounded-lg shadow">
                <img src="/svg/jsa/logo.svg" alt="show logo" />
              </div>
              <h2 className="ml-2 text-2xl font-bold">Templates</h2>
            </div>
            <div className="flex items-center lg:hidden">
              <Dropdown className="lg:hidden">
                <DropdownTrigger>
                  <button
                    className="rounded-md bg-gray-200 px-2 py-2"
                    onClick={toggleMenu}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#616161"
                    >
                      <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
                    </svg>
                  </button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="DropdownItems"
                  className="bg-[#fff] lg:hidden"
                >
                  <DropdownItem key="adminMode">
                    <label className="mx-2 flex items-center space-x-2">
                      <span>Admin Mode</span>
                      <Switch
                        id="custom-switch-component"
                        ripple={false}
                        className="h-full w-full bg-red-300 checked:bg-green-300"
                        containerProps={{
                          className: 'w-11 h-6',
                        }}
                        circleProps={{
                          className: 'before:hidden left-0.5 border-none',
                        }}
                        crossOrigin={undefined}
                      />
                    </label>
                  </DropdownItem>
                  <DropdownItem key="selector">
                    <div className="DropDownn relative z-50 inline-block text-left">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-[#E2F3FF] px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-[#e1f0fa] focus:outline-none"
                        id="options-menu"
                        aria-expanded="true"
                        aria-haspopup="true"
                        onClick={handleToggle}
                      >
                        {selected}
                        <svg
                          className="-mr-1 ml-2 h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
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
                              onClick={() => handleSelect('All Templates')}
                              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              role="menuitem"
                            >
                              All Templates
                            </button>
                            <button
                              onClick={() => handleSelect('My Templates')}
                              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              role="menuitem"
                            >
                              My Templates
                            </button>
                            <button
                              onClick={() => handleSelect('Shared Templates')}
                              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              role="menuitem"
                            >
                              Shared Templates
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </DropdownItem>

                  <DropdownItem key="search">
                    <div className="Search team-actice flex items-center justify-between">
                      <Search
                        inputRounded={true}
                        type="search"
                        className="rounded-md bg-[#eeeeee] placeholder:text-[#616161]"
                        name="search"
                        placeholder="Search Requests"
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>

            <div className="hidden gap-2 lg:flex lg:items-center">
              {/* <label className="flex items-center space-x-2 mx-2">
            <span>Admin Mode</span>
            <Switch
              id="custom-switch-component"
              ripple={false}
              className="h-full w-full bg-red-300 checked:bg-red-300"
              containerProps={{
                className: "w-11 h-6",
              }}
              circleProps={{
                className: "before:hidden left-0.5 border-none",
              }}
              crossOrigin={undefined}
            />
          </label> */}
              {canUseAdminMode && (
                <div className="hidden md:flex">
                  <AdminSwitch
                    adminMode={adminMode}
                    setAdminMode={setAdminMode}
                  />
                </div>
              )}

              {/* DropDown Custom */}
              <div className="DropDownn relative z-50 inline-block text-left">
                <div>
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-[#E2F3FF] p-2 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-[#e1f0fa] focus:outline-none"
                    id="options-menu"
                    aria-expanded="true"
                    aria-haspopup="true"
                    onClick={handleToggle}
                  >
                    {selected}
                    <svg
                      className="-mr-1 ml-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
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
                        onClick={() => handleSelect('All Templates')}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        role="menuitem"
                      >
                        All Templates
                      </button>
                      <button
                        onClick={() => handleSelect('My Templates')}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        role="menuitem"
                      >
                        My Templates
                      </button>
                      <button
                        onClick={() => handleSelect('Shared Templates')}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        role="menuitem"
                      >
                        Shared Templates
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* <button className="filterButton p-2 bg-gray-200 rounded mx-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#616161"
            >
              <path d="M440-160q-17 0-28.5-11.5T400-200v-240L168-736q-15-20-4.5-42t36.5-22h560q26 0 36.5 22t-4.5 42L560-440v240q0 17-11.5 28.5T520-160h-80Z" />
            </svg>
          </button> */}

              <FilterButton
                isApplyFilter={isApplyFilter}
                setShowModel={setShowModel}
                showModel={showModel}
                setOpenDropdown={setOpenDropdown}
                clearFilters={clearFilters}
              />

              <div className="Search team-actice flex items-center justify-between">
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

          <table className="w-full border-collapse">
            <thead className="text-sm font-normal text-[#616161]">
              <tr className="max-h-[40px] w-full">
                <th className="flex rounded-l-lg bg-[#F5F5F5] py-3 pl-4 text-left">
                  PPE & Safety Gear Name{' '}
                  <img
                    src="/images/fluent_arrow-sort-24-regular.svg"
                    className="px-2"
                    alt="image"
                  />{' '}
                </th>
                <th className="hidden bg-[#F5F5F5] py-3 text-left sm:table-cell">
                  Sharing
                </th>
                <th className="hidden bg-[#F5F5F5] py-3 text-left md:table-cell">
                  Customer / Contact
                </th>
                <th className="hidden bg-[#F5F5F5] py-3 text-left md:flex">
                  Date & Time{' '}
                  <img
                    src="/images/fluent_arrow-sort-24-regular.svg"
                    className="px-4"
                    alt="image"
                  />
                </th>
                <th className="w-[100px] rounded-r-lg bg-[#F5F5F5] py-3 pr-4 text-right text-sm font-normal text-[#0063F7]">
                  {isSelectMode ? (
                    <div className="flex items-center justify-end gap-2">
                      <div className="cursor-pointer" onClick={handleCancel}>
                        Cancel
                      </div>
                      <div className="relative flex items-center justify-center gap-2">
                        <input
                          type="checkbox"
                          className={`h-5 w-5 cursor-pointer appearance-none rounded-md border-2 ${
                            sortedData.length ==
                            (selectedSubmissions ?? []).length
                              ? 'border-[#6990FF] bg-[#6990FF] checked:border-[#6990FF] checked:bg-[#6990FF]'
                              : 'border-[#9E9E9E] bg-white'
                          } transition-colors duration-200 ease-in-out`}
                          onChange={handleSelectAllChange}
                        />
                        {sortedData.length ==
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
            {!isLoading && (
              <tbody className="text-sm font-normal text-[#1E1E1E]">
                {sortedData.map((item: JSAAppModel) => (
                  <tr
                    key={item._id}
                    className="relative border-b even:bg-[#F5F5F5]"
                    // onClick={() => {
                    //   router.push(
                    //     `/user/apps/jsa/${context.state.jsaAppId}/${item?._id}/Template`
                    //   );
                    //   // context.dispatch({
                    //   //   type: JSAAPPACTIONTYPE.SHOWPAGES,
                    //   //   showPages: "showDetail",
                    //   //   showDetailPayload: {
                    //   //     id: item._id,
                    //   //     type: "Template"
                    //   //   }
                    //   // });
                    // }}
                  >
                    <td
                      className="cursor-pointer pl-4 text-primary-500"
                      onClick={() => {
                        router.push(
                          `/user/apps/jsa/${context.state.jsaAppId}/${item?._id}/Template`
                        );
                        // context.dispatch({
                        //   type: JSAAPPACTIONTYPE.SHOWPAGES,
                        //   showPages: "showDetail",
                        //   showDetailPayload: {
                        //     id: item._id,
                        //     type: "Template"
                        //   }
                        // });
                      }}
                    >
                      {item.name}
                    </td>
                    <td className="hidden py-2 sm:table-cell">
                      <div
                        className={`flex w-fit items-center gap-1 rounded-md px-2 py-1 ${
                          item.sharing === 1 ? 'bg-[#ABEBFF]' : 'bg-[#97F1BB]'
                        }`}
                      >
                        <img
                          src={
                            item.templateSharing === 1
                              ? '/images/person_24dp_FILL1_wght400_GRAD0_opsz24.svg'
                              : '/images/groups_24dp_FILL1_wght400_GRAD0_opsz24.svg'
                          }
                          alt={
                            item.templateSharing === 1
                              ? 'user icon'
                              : 'people icon'
                          }
                        />
                        {item.templateSharing === 1
                          ? 'My Templates'
                          : 'Shared Templates'}
                      </div>
                    </td>
                    {/* <div className="relative"> */}
                    <td
                      className="hidden items-center py-2 md:flex"
                      onMouseEnter={() => setHoveredUser(item._id)}
                      onMouseLeave={() => setHoveredUser(null)}
                    >
                      <img
                        src={'/images/user.png'}
                        alt="avatar"
                        className="mr-2 h-8 w-8 rounded-full"
                      />
                      {item.organizationId._id ===
                      session?.user.user.organization?._id
                        ? 'My Organization'
                        : item.organizationId.name}
                      {hoveredUser === item._id && (
                        <div className="absolute top-8 z-20 mt-2 w-fit rounded-lg border bg-gray-200 p-4 shadow-lg">
                          <div className="flex items-start">
                            <img
                              src={'/images/user.png'}
                              alt="Avatar"
                              className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200"
                            />
                            <div className="ml-4 space-y-2">
                              <p className="text-sm font-semibold text-[#605f5f]">
                                {item.organizationId.name}
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
                                  {item.organizationId.email}
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
                                  {item.organizationId.name}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                    {/* </div> */}
                    <td className="hidden py-2 md:table-cell">{`${dateFormat(
                      item.createdAt.toString()
                    )}   ${timeFormat(item.createdAt.toString())}`}</td>

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
                                  (ts) => item._id == ts._id
                                )
                                  ? 'border-[#6990FF] bg-[#6990FF] checked:border-[#6990FF] checked:bg-[#6990FF]'
                                  : 'border-[#9E9E9E] bg-white'
                              } transition-colors duration-200 ease-in-out`}
                              checked={selectedSubmissions.some(
                                (ts) => item._id == ts._id
                              )}
                              onChange={() => handleCheckboxChange(item)}
                            />
                            {selectedSubmissions.some(
                              (ts) => item._id == ts._id
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
                                onClick={() => {
                                  router.push(
                                    `/user/apps/jsa/${context.state.jsaAppId}/${item?._id}/Template`
                                  );
                                  // context.dispatch({
                                  //   type: JSAAPPACTIONTYPE.SHOWPAGES,
                                  //   showPages: "showDetail",
                                  //   showDetailPayload: {
                                  //     id: item._id,
                                  //     type: "Submission"
                                  //   }
                                  // });
                                }}
                              >
                                View
                              </DropdownItem>
                              <DropdownItem
                                key="Duplicate"
                                onClick={() => {
                                  context.dispatch({
                                    type: JSAAPPACTIONTYPE.SHOW_DUPLICATE_MODEL,
                                    showDuplicateModel: item,
                                  });
                                }}
                              >
                                Duplicate
                              </DropdownItem>
                              <DropdownItem
                                key="Edit"
                                onClick={() => {
                                  context.dispatch({
                                    type: JSAAPPACTIONTYPE.SHOW_SUBMISSION_EDIT,
                                    editSubmission: item,
                                  });
                                }}
                              >
                                Edit
                              </DropdownItem>
                              <DropdownItem
                                key="Delete"
                                color="danger"
                                onClick={() => {
                                  context.dispatch({
                                    type: JSAAPPACTIONTYPE.SHOW_SUBMISSION_DELTE_MODEL,
                                    showSubmissionDeleteModel: item,
                                  });
                                }}
                              >
                                Delete
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
          {isLoading && <Loader />}
          {sortedData.length < 1 && !isLoading && (
            <div className="flex w-full justify-center">
              <div className="flex w-1/2 flex-col items-center justify-center p-5">
                <img
                  src="/images/empty-box.svg"
                  className="m-2 w-[20%]"
                  alt="img"
                />
                <p className="text-1xl m-2">Nothing to see here</p>
              </div>
            </div>
          )}
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
                  disabled={(selectedSubmissions ?? []).length == 0}
                  onClick={() => {}}
                >
                  <div>Delete ({(selectedSubmissions ?? []).length})</div>

                  {/* {updateMultipleTimeSheetMutation.isLoading ? (
                      <>
                        <Loader />
                      </>
                    ) : (
                      <>Delete</>
                    )} */}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* filter model */}
      <Modal
        isOpen={showModel}
        onOpenChange={() => setShowModel(!showModel)}
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
                        type: JSAAPPACTIONTYPE.JSA_DETAIL_DATE,
                        jsaDetailDate: { from: from, to: to },
                      });
                    }}
                    selectedDate={context.state.jsaDetailDate ?? undefined}
                  />
                </div>

                <div className="w-full" onClick={() => setOpenDropdown('')}>
                  <DateRangePicker
                    title="Last Modified Date Range"
                    handleOnConfirm={(from: Date, to: Date) => {
                      context.dispatch({
                        type: JSAAPPACTIONTYPE.JSA_LAST_MODIFIED_DATE,
                        jsaLastModifiedDate: { from: from, to: to },
                      });
                    }}
                    selectedDate={
                      context.state.jsaLastModifiedDate ?? undefined
                    }
                  />
                </div>

                <div className="mb-4 w-full">
                  <CustomSearchSelect
                    label="Created By"
                    data={(users ?? []).map((createdBy) => ({
                      label: createdBy.email,
                      value: createdBy._id,
                    }))}
                    selected={selectedSubmittedBy}
                    showImage={false}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown2'}
                    onToggle={() => handleToggleDropdown('dropdown2')}
                    onSelect={(selected: any) => {
                      setSelectedSubmittedBy(selected);
                    }}
                  />
                </div>
                {`${selectedCustomers}\t`}

                <div className="mb-24 flex flex-col space-y-4 p-2">
                  <span className="">Sharing</span>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="option"
                      checked={submissionType == 'all'}
                      onClick={() => setSubmissionType('all')}
                      className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                    />
                    <span className="ml-2">All Submissions</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="option"
                      checked={submissionType == 'public'}
                      onClick={() => setSubmissionType('public')}
                      className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                    />
                    <span className="ml-2">Private Submissions</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="option"
                      checked={submissionType == 'private'}
                      onClick={() => setSubmissionType('private')}
                      className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                    />
                    <span className="ml-2">Public Submissions</span>
                  </label>
                </div>

                {/* <div className="w-full">
                  <CustomSearchSelect
                    label="Created By"
                    data={(Array.isArray(users?.data) ? users.data : []).map(
                      ({ user }) => ({
                        label: `${user.firstName} ${user.lastName}`,
                        value: user._id,
                      })
                    )}
                    showImage={true}
                    multiple={true}
                    isOpen={openDropdown === "dropdown3"}
                    onToggle={() => handleToggle("dropdown3")}
                    onSelect={(selected: string[]) =>
                      setSelectedCustomers(selected)
                    }
                    placeholder="All"
                  />
                </div> */}

                {/* <div className="w-full mb-16">
                  <CustomSearchSelect
                    label="Submitted By"
                    data={(users ?? []).map((user) => ({
                      label: `${user.firstName} ${user.lastName}`,
                      value: user._id,
                    }))}
                    showImage={true}
                    multiple={true}
                    isOpen={openDropdown === "dropdown3"}
                    onToggle={() => handleToggle("dropdown3")}
                    onSelect={(selected: string[]) =>
                      setSelectedSubmittedBy(selected)
                    }
                    placeholder="All Users"
                  />
                </div> */}
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
};

export default TemplateListing;
