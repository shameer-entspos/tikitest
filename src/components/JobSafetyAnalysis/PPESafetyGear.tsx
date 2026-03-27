// components/PPEList.js
import React, { useEffect, useReducer, useState } from 'react';
import { Search } from '../Form/search';
import { Breadcrumbs, BreadcrumbItem } from '@nextui-org/react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { JSAAPPACTIONTYPE } from '@/app/helpers/user/enums';
import NewPPEModal from './Modal/NewPPEModal';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  checkJSAPermission,
  deletePPE,
  getAllOrgUsers,
  getAllPPEs,
  PPEModel,
} from '@/app/(main)/(user-panel)/user/apps/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import DetailModal from './Modal/DetailModal';
import { formatDateWithDays } from '@/app/helpers/dateFormat';
import Loader from '../DottedLoader/loader';
import { PresignedUserAvatar } from '@/components/common/PresignedUserAvatar';
import { Button } from '../Buttons';
import AdminSwitch from '../AdminSwitch/AdminSwitch';
import { useSession } from 'next-auth/react';
import FilterButton from '../TimeSheetApp/CommonComponents/FilterButton/FilterButton';
import DateRangePicker from './CreateNewComponents/JSA_Calender';
import { CustomSearchSelect } from '../TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import CustomModal from '../Custom_Modal';
import PPEDeleteModal from './Modal/PPE_Delete_Modal';
import PPEMultiDeleteModal from './Modal/PPE_Delete_Modal_Multiple';

const PPESafetyGear = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>('All Lists');
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const context = useJSAAppsCotnext();
  const [adminMode, setAdminMode] = useState(false);
  const { data: session } = useSession();

  // Check if user is Root User from session (role 3 = Organization Admin)
  const isRootUser = (session?.user as any)?.role === 3;

  // Check app-level permission (backend already checks global apps permission and returns adminTeams: true if user has it)
  const { data: permission } = useQuery('JSASettingPermission', () =>
    checkJSAPermission(axiosAuth)
  );

  // User can use Admin Mode if Root User or has permission (which includes global apps permission)
  const canUseAdminMode = isRootUser || permission?.adminTeams === true;

  // const { onOpenChange } = useDisclosure();
  const axiosAuth = useAxiosAuth();
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  const queryClient = useQueryClient();

  const { data: ppeList, isLoading } = useQuery({
    queryKey: ['ppeList', adminMode],
    queryFn: () =>
      getAllPPEs({
        axiosAuth,
        isAdmin: adminMode,
      }),
    enabled: true, // Always enabled
  });

  const handleGoBack = () => {
    context.dispatch({
      type: JSAAPPACTIONTYPE.SHOWPAGES,
    });
  };
  const selectOption = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
  };
  const handleRowClick = (item: PPEModel) => {
    context.dispatch({ type: JSAAPPACTIONTYPE.SETITEM, payLoad: item });
    context.dispatch({
      type: JSAAPPACTIONTYPE.SHOWMODAL,
      showModal: 'detailModal',
    });
  };

  const { data: users, isLoading: userLoading } = useQuery({
    queryKey: 'allOrgUsers',
    queryFn: () => getAllOrgUsers(axiosAuth),
  });

  // const item = context.state.selectedItem as PPEModel;
  const deletePPEMutation = useMutation(deletePPE, {
    onSuccess: () => {
      queryClient.invalidateQueries('ppeList');
      handleClose();
    },
    onError: (err: any) => {
      console.log(err.message);
    },
  });
  const onConfirm = () => {
    if (context.state.selectedItem) {
      deletePPEMutation.mutate({
        axiosAuth,
        id: context.state.selectedItem?._id!,
      });
    }
  };
  const handleClose = () => {
    context.dispatch({ type: JSAAPPACTIONTYPE.SHOW_PPE_DELTE_MODEL });
    context.dispatch({ type: JSAAPPACTIONTYPE.SHOW_MULTI_PPE_DELTE_MODEL });
    context.dispatch({
      type: JSAAPPACTIONTYPE.SETITEM,
      payLoad: undefined,
    });
    // context.dispatch({ type: JSAAPPACTIONTYPE.SETITEM, payLoad: undefined });
    context.dispatch({
      type: JSAAPPACTIONTYPE.SHOWMODAL,
      showModal: undefined,
    });
  };

  // Filtering and searching states
  const [isApplyFilter, setApplyFilter] = useState(false);
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
      jsaDetailDate: undefined,
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
    setShowModel(false);
    setApplyFilter(areFiltersApplied());
  };

  const filterData = ppeList
    ?.filter((item) => {
      if (selectedOption === 'Shared List') return item.sharing === 2;
      if (selectedOption === 'My List') return item.sharing === 1;
      return true; // All Lists
    })
    .filter((hazard) => {
      if (searchQuery.toLowerCase() === '') {
        return true;
      }
      return hazard.name.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .filter((item) => {
      if (!isApplyFilter) return true;

      // Created By filter
      if (
        (selectedSubmittedBy ?? []).length > 0 &&
        !selectedSubmittedBy.includes(item.createdBy?._id ?? '')
      ) {
        return false;
      }

      // Sharing filter
      if (submissionType === 'public' && item.sharing !== 2) return false;
      if (submissionType === 'private' && item.sharing !== 1) return false;

      // Date range filter
      const range = context.state.jsaDetailDate;
      if (range?.from && range?.to) {
        const created = new Date(item.createdAt).getTime();
        const from = new Date(range.from).getTime();
        const to = new Date(range.to).getTime();
        if (created < from || created > to) return false;
      }

      return true;
    });

  // Default sort: newest to oldest by createdAt
  const sortedData =
    filterData?.slice().sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }) ?? [];

  // CHECKBOX FUNCTIONALITY

  const [selectedSubmissions, setCheckedSubmissions] = useState<PPEModel[]>([]);

  // Handle "Select All" checkbox change
  const handleSelectAllChange = () => {
    if (sortedData.length == (selectedSubmissions ?? []).length) {
      handleCancel();
    } else {
      setCheckedSubmissions([...sortedData]);
    }
  };

  const handleCheckboxChange = (js: PPEModel) => {
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

  //------------------------------------------
  return (
    <>
      <div className="absolute inset-0 z-10 flex h-[calc(var(--app-vh)-70px)] w-full max-w-[1360px] flex-col bg-white px-4 pt-4 font-Open-Sans">
        <div className="flex h-full flex-1 flex-col justify-start overflow-auto scrollbar-hide">
          <div className="flex items-center justify-between">
            <div className="breadCrumbs font-semibold">
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

          <div className="flex h-full flex-1 flex-col justify-start overflow-auto scrollbar-hide">
            <div className="sticky top-0 z-20 bg-white pb-2">
              <div className="mt-4 flex flex-col justify-between gap-2 lg:flex-row">
                {/* page logo and name */}
                <div className="flex items-center gap-2 text-2xl font-bold text-[#1E1E1E]">
                  <div className="relative h-[50px] w-[50px] rounded-lg shadow">
                    <img src="/svg/jsa/logo.svg" alt="show logo" />
                  </div>
                  <h2 className="ml-2 text-2xl font-bold">PPE & Safety Gear</h2>
                </div>

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
                        className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-[#E2F3FF] p-2 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-[#e1f0fa] focus:outline-none"
                        id="options-menu"
                        aria-expanded="true"
                        aria-haspopup="true"
                        onClick={handleToggle}
                      >
                        {selectedOption}
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
                            onClick={() => selectOption('All Lists')}
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            role="menuitem"
                          >
                            All Lists
                          </button>
                          <button
                            onClick={() => selectOption('My List')}
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            role="menuitem"
                          >
                            My List
                          </button>
                          <button
                            onClick={() => selectOption('Shared List')}
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            role="menuitem"
                          >
                            Shared List
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-grow gap-4">
                    <FilterButton
                      isApplyFilter={isApplyFilter}
                      setShowModel={setShowModel}
                      showModel={showModel}
                      setOpenDropdown={setOpenDropdown}
                      clearFilters={clearFilters}
                    />

                    {/* search bar */}
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

            <table className="w-full border-collapse">
              <thead className="text-sm font-normal text-[#616161]">
                <tr className="max-h-[40px] w-full">
                  <th className="flex truncate rounded-l-lg bg-[#F5F5F5] py-3 pl-4 text-left">
                    <div className="max-w-lg truncate">
                      PPE & Safety Gear Name
                    </div>
                    <img
                      src="/images/fluent_arrow-sort-24-regular.svg"
                      className="px-2"
                      alt="image"
                    />
                  </th>
                  <th className="hidden bg-[#F5F5F5] px-2 py-3 text-left sm:table-cell">
                    Sharing
                  </th>
                  <th className="hidden bg-[#F5F5F5] px-2 py-3 text-left md:table-cell">
                    Created By
                  </th>
                  <th className="hidden bg-[#F5F5F5] px-2 py-3 text-left md:flex">
                    Date & Time
                    <img
                      src="/images/fluent_arrow-sort-24-regular.svg"
                      className="px-4"
                      alt="image"
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

              <tbody className="text-sm font-normal text-[#1E1E1E]">
                {isLoading ? (
                  <>
                    <tr>
                      <td className="flex justify-start pt-36">
                        <Loader />
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    {sortedData.length > 0 ? (
                      <>
                        {sortedData.map((item) => (
                          <tr
                            key={item._id}
                            className="relative cursor-pointer border-b even:bg-[#F5F5F5]"
                            onClick={() => handleRowClick(item)}
                          >
                            <td className="pl-4">
                              <span className="cursor-pointer font-medium text-[#0063F7] hover:underline">
                                {item.name}
                              </span>
                            </td>
                            <td className="hidden sm:table-cell">
                              <div
                                className={`flex w-fit items-center gap-1 rounded-md px-2 ${
                                  item.sharing === 1
                                    ? 'bg-[#ABEBFF]'
                                    : 'bg-[#97F1BB]'
                                }`}
                              >
                                {item.sharing == 1 ? (
                                  <>
                                    <svg
                                      width="79"
                                      height="31"
                                      viewBox="0 0 79 31"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <rect
                                        width="79"
                                        height="31"
                                        rx="8"
                                        fill="#ABEBFF"
                                      />
                                      <path
                                        d="M14 14.5C15.6569 14.5 17 13.1569 17 11.5C17 9.84315 15.6569 8.5 14 8.5C12.3431 8.5 11 9.84315 11 11.5C11 13.1569 12.3431 14.5 14 14.5Z"
                                        fill="#616161"
                                      />
                                      <path
                                        d="M20 20.125C20 21.9887 20 23.5 14 23.5C8 23.5 8 21.9887 8 20.125C8 18.2613 10.6865 16.75 14 16.75C17.3135 16.75 20 18.2613 20 20.125Z"
                                        fill="#616161"
                                      />
                                      <path
                                        d="M33.7627 21L30.4062 12.1543H30.3516C30.3698 12.3411 30.3857 12.569 30.3994 12.8379C30.4131 13.1068 30.4245 13.4007 30.4336 13.7197C30.4427 14.0342 30.4473 14.3555 30.4473 14.6836V21H29.3672V11.0059H31.0898L34.2549 19.3184H34.3027L37.5156 11.0059H39.2246V21H38.0762V14.6016C38.0762 14.3053 38.0807 14.0091 38.0898 13.7129C38.099 13.4121 38.1104 13.1296 38.124 12.8652C38.1377 12.5964 38.1514 12.3639 38.165 12.168H38.1104L34.7129 21H33.7627ZM40.6055 13.5078H41.8223L43.4766 17.8555C43.5723 18.1107 43.6611 18.3568 43.7432 18.5938C43.8252 18.8262 43.8981 19.0495 43.9619 19.2637C44.0257 19.4779 44.0758 19.6852 44.1123 19.8857H44.1602C44.224 19.6579 44.3151 19.3594 44.4336 18.9902C44.5521 18.6165 44.6797 18.236 44.8164 17.8486L46.3818 13.5078H47.6055L44.3447 22.1006C44.1715 22.5609 43.9688 22.9619 43.7363 23.3037C43.5085 23.6455 43.2305 23.9076 42.9023 24.0898C42.5742 24.2767 42.1777 24.3701 41.7129 24.3701C41.4987 24.3701 41.3096 24.3564 41.1455 24.3291C40.9814 24.3063 40.8402 24.279 40.7217 24.2471V23.3379C40.8219 23.3607 40.9427 23.3812 41.084 23.3994C41.2298 23.4176 41.3802 23.4268 41.5352 23.4268C41.8177 23.4268 42.0615 23.3721 42.2666 23.2627C42.4762 23.1579 42.6562 23.0029 42.8066 22.7979C42.957 22.5928 43.0869 22.349 43.1963 22.0664L43.6064 21.0137L40.6055 13.5078ZM52.6094 21V11.0059H53.7715V19.9609H58.208V21H52.6094ZM60.8877 13.5078V21H59.7529V13.5078H60.8877ZM60.334 10.7051C60.5208 10.7051 60.6803 10.7666 60.8125 10.8896C60.9492 11.0081 61.0176 11.195 61.0176 11.4502C61.0176 11.7008 60.9492 11.8877 60.8125 12.0107C60.6803 12.1338 60.5208 12.1953 60.334 12.1953C60.138 12.1953 59.974 12.1338 59.8418 12.0107C59.7142 11.8877 59.6504 11.7008 59.6504 11.4502C59.6504 11.195 59.7142 11.0081 59.8418 10.8896C59.974 10.7666 60.138 10.7051 60.334 10.7051ZM68.1406 18.9492C68.1406 19.4277 68.0199 19.8311 67.7783 20.1592C67.5413 20.4827 67.1995 20.7266 66.7529 20.8906C66.3109 21.0547 65.7822 21.1367 65.167 21.1367C64.6429 21.1367 64.1895 21.0957 63.8066 21.0137C63.4238 20.9316 63.0889 20.8154 62.8018 20.665V19.6191C63.1071 19.7695 63.4717 19.9062 63.8955 20.0293C64.3193 20.1523 64.7523 20.2139 65.1943 20.2139C65.8415 20.2139 66.3109 20.109 66.6025 19.8994C66.8942 19.6898 67.04 19.4049 67.04 19.0449C67.04 18.8398 66.9808 18.6598 66.8623 18.5049C66.7484 18.3454 66.5547 18.1927 66.2812 18.0469C66.0078 17.8965 65.6296 17.7324 65.1465 17.5547C64.668 17.3724 64.2533 17.1924 63.9023 17.0146C63.556 16.8324 63.2871 16.6113 63.0957 16.3516C62.9089 16.0918 62.8154 15.7546 62.8154 15.3398C62.8154 14.7064 63.0706 14.221 63.5811 13.8838C64.096 13.542 64.7705 13.3711 65.6045 13.3711C66.0557 13.3711 66.4772 13.4167 66.8691 13.5078C67.2656 13.5944 67.6348 13.7129 67.9766 13.8633L67.5938 14.7725C67.2839 14.6403 66.9535 14.5286 66.6025 14.4375C66.2516 14.3464 65.8939 14.3008 65.5293 14.3008C65.0052 14.3008 64.6019 14.3874 64.3193 14.5605C64.0413 14.7337 63.9023 14.9707 63.9023 15.2715C63.9023 15.5039 63.9661 15.6953 64.0938 15.8457C64.2259 15.9961 64.4355 16.1374 64.7227 16.2695C65.0098 16.4017 65.388 16.5566 65.8574 16.7344C66.3268 16.9076 66.7324 17.0876 67.0742 17.2744C67.416 17.4567 67.6781 17.68 67.8604 17.9443C68.0472 18.2041 68.1406 18.5391 68.1406 18.9492ZM72.3857 20.207C72.5726 20.207 72.764 20.1911 72.96 20.1592C73.1559 20.1273 73.3154 20.0885 73.4385 20.043V20.9248C73.3063 20.984 73.1217 21.0342 72.8848 21.0752C72.6523 21.1162 72.4245 21.1367 72.2012 21.1367C71.8047 21.1367 71.4447 21.0684 71.1211 20.9316C70.7975 20.7904 70.5378 20.5534 70.3418 20.2207C70.1504 19.888 70.0547 19.4277 70.0547 18.8398V14.3965H68.9883V13.8428L70.0615 13.3984L70.5127 11.7715H71.1963V13.5078H73.3906V14.3965H71.1963V18.8057C71.1963 19.2751 71.3034 19.626 71.5176 19.8584C71.7363 20.0908 72.0257 20.207 72.3857 20.207Z"
                                        fill="#616161"
                                      />
                                    </svg>
                                  </>
                                ) : (
                                  <>
                                    <svg
                                      width="106"
                                      height="31"
                                      viewBox="0 0 106 31"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <rect
                                        width="106"
                                        height="31"
                                        rx="8"
                                        fill="#97F1BB"
                                      />
                                      <path
                                        d="M13.9998 15.1031C14.7159 15.1031 15.4026 14.8187 15.909 14.3123C16.4153 13.806 16.6998 13.1192 16.6998 12.4031C16.6998 11.687 16.4153 11.0003 15.909 10.4939C15.4026 9.98759 14.7159 9.70312 13.9998 9.70312C13.2837 9.70312 12.597 9.98759 12.0906 10.4939C11.5843 11.0003 11.2998 11.687 11.2998 12.4031C11.2998 13.1192 11.5843 13.806 12.0906 14.3123C12.597 14.8187 13.2837 15.1031 13.9998 15.1031ZM10.3998 14.2031C10.3998 14.6805 10.2102 15.1384 9.87259 15.4759C9.53503 15.8135 9.07719 16.0031 8.5998 16.0031C8.12241 16.0031 7.66457 15.8135 7.32701 15.4759C6.98944 15.1384 6.7998 14.6805 6.7998 14.2031C6.7998 13.7257 6.98944 13.2679 7.32701 12.9303C7.66457 12.5928 8.12241 12.4031 8.5998 12.4031C9.07719 12.4031 9.53503 12.5928 9.87259 12.9303C10.2102 13.2679 10.3998 13.7257 10.3998 14.2031ZM6.3408 20.7965C6.18716 20.7092 6.0721 20.5672 6.0186 20.3987C5.86003 19.8851 5.85836 19.3359 6.01383 18.8213C6.16929 18.3068 6.4748 17.8503 6.89123 17.5104C7.30767 17.1706 7.81608 16.9627 8.35135 16.9135C8.88662 16.8643 9.42439 16.976 9.8958 17.2343C8.92682 18.1861 8.32045 19.4463 8.1813 20.7974C8.1609 20.9984 8.1684 21.1946 8.2038 21.386C7.54712 21.3284 6.91113 21.1271 6.3408 20.7965ZM19.7958 21.3851C20.4524 21.3277 21.0884 21.1268 21.6588 20.7965C21.8121 20.709 21.9268 20.567 21.9801 20.3987C22.1389 19.8851 22.1408 19.3357 21.9854 18.821C21.8301 18.3062 21.5246 17.8496 21.1081 17.5096C20.6916 17.1696 20.1831 16.9617 19.6477 16.9124C19.1123 16.8632 18.5744 16.975 18.1029 17.2334C19.0727 18.1852 19.6798 19.4458 19.8192 20.7974C19.8395 20.9937 19.8316 21.191 19.7958 21.3851ZM21.1998 14.2031C21.1998 14.6805 21.0102 15.1384 20.6726 15.4759C20.335 15.8135 19.8772 16.0031 19.3998 16.0031C18.9224 16.0031 18.4646 15.8135 18.127 15.4759C17.7894 15.1384 17.5998 14.6805 17.5998 14.2031C17.5998 13.7257 17.7894 13.2679 18.127 12.9303C18.4646 12.5928 18.9224 12.4031 19.3998 12.4031C19.8772 12.4031 20.335 12.5928 20.6726 12.9303C21.0102 13.2679 21.1998 13.7257 21.1998 14.2031ZM9.7734 21.5741C9.68441 21.4948 9.61544 21.3956 9.57211 21.2845C9.52879 21.1735 9.51233 21.0537 9.5241 20.9351C9.63858 19.8277 10.1595 18.8019 10.9863 18.0562C11.813 17.3106 12.8869 16.8978 14.0003 16.8978C15.1136 16.8978 16.1875 17.3106 17.0142 18.0562C17.841 18.8019 18.3619 19.8277 18.4764 20.9351C18.4882 21.0537 18.4717 21.1735 18.4284 21.2845C18.3851 21.3956 18.3161 21.4948 18.2271 21.5741C17.0697 22.624 15.5625 23.2048 13.9998 23.2031C12.4373 23.2054 10.9302 22.6245 9.7734 21.5741Z"
                                        fill="#616161"
                                      />
                                      <path
                                        d="M35.0068 18.3408C35.0068 18.9333 34.8587 19.4391 34.5625 19.8584C34.2708 20.2731 33.8607 20.5898 33.332 20.8086C32.8034 21.0273 32.1813 21.1367 31.4658 21.1367C31.0876 21.1367 30.7298 21.1185 30.3926 21.082C30.0553 21.0456 29.7454 20.9932 29.4629 20.9248C29.1803 20.8564 28.932 20.7721 28.7178 20.6719V19.5576C29.0596 19.6989 29.4766 19.8311 29.9688 19.9541C30.4609 20.0726 30.9759 20.1318 31.5137 20.1318C32.015 20.1318 32.4388 20.0658 32.7852 19.9336C33.1315 19.7969 33.3936 19.6032 33.5713 19.3525C33.7536 19.0973 33.8447 18.792 33.8447 18.4365C33.8447 18.0947 33.7695 17.8099 33.6191 17.582C33.4688 17.3496 33.2181 17.14 32.8672 16.9531C32.5208 16.7617 32.0469 16.5589 31.4453 16.3447C31.0215 16.1943 30.6478 16.0303 30.3242 15.8525C30.0007 15.6702 29.7295 15.4652 29.5107 15.2373C29.292 15.0094 29.1257 14.7451 29.0117 14.4443C28.9023 14.1436 28.8477 13.7995 28.8477 13.4121C28.8477 12.8789 28.9821 12.4232 29.251 12.0449C29.5244 11.6621 29.9004 11.3704 30.3789 11.1699C30.862 10.9648 31.4157 10.8623 32.04 10.8623C32.5732 10.8623 33.0654 10.9124 33.5166 11.0127C33.9723 11.113 34.3893 11.2474 34.7676 11.416L34.4053 12.4141C34.0452 12.2637 33.6624 12.1383 33.2568 12.0381C32.8558 11.9378 32.4411 11.8877 32.0127 11.8877C31.5843 11.8877 31.222 11.9515 30.9258 12.0791C30.6341 12.2021 30.4108 12.3776 30.2559 12.6055C30.1009 12.8333 30.0234 13.1045 30.0234 13.4189C30.0234 13.7699 30.0964 14.0615 30.2422 14.2939C30.3926 14.5264 30.6296 14.7337 30.9531 14.916C31.2812 15.0938 31.7142 15.2806 32.252 15.4766C32.8398 15.6908 33.3389 15.9186 33.749 16.1602C34.1592 16.3971 34.4714 16.6888 34.6855 17.0352C34.8997 17.377 35.0068 17.8122 35.0068 18.3408ZM38.0146 10.3633V13.542C38.0146 13.7243 38.0101 13.9089 38.001 14.0957C37.9919 14.278 37.9759 14.4466 37.9531 14.6016H38.0283C38.1833 14.3372 38.3792 14.1162 38.6162 13.9385C38.8577 13.7562 39.1312 13.6195 39.4365 13.5283C39.7419 13.4326 40.0654 13.3848 40.4072 13.3848C41.0088 13.3848 41.5101 13.4805 41.9111 13.6719C42.3167 13.8633 42.6198 14.1595 42.8203 14.5605C43.0254 14.9616 43.1279 15.4811 43.1279 16.1191V21H42.0068V16.1943C42.0068 15.57 41.8633 15.1029 41.5762 14.793C41.2936 14.4831 40.8584 14.3281 40.2705 14.3281C39.7145 14.3281 39.2702 14.4352 38.9375 14.6494C38.6094 14.859 38.3724 15.1689 38.2266 15.5791C38.0853 15.9893 38.0146 16.4906 38.0146 17.083V21H36.8799V10.3633H38.0146ZM48.2686 13.3848C49.1618 13.3848 49.8249 13.5853 50.2578 13.9863C50.6908 14.3874 50.9072 15.0277 50.9072 15.9072V21H50.0801L49.8613 19.8926H49.8066C49.597 20.166 49.3783 20.3962 49.1504 20.583C48.9225 20.7653 48.6582 20.9043 48.3574 21C48.0612 21.0911 47.6966 21.1367 47.2637 21.1367C46.8079 21.1367 46.4023 21.057 46.0469 20.8975C45.696 20.738 45.418 20.4964 45.2129 20.1729C45.0124 19.8493 44.9121 19.4391 44.9121 18.9424C44.9121 18.195 45.2083 17.6208 45.8008 17.2197C46.3932 16.8187 47.2956 16.5999 48.5078 16.5635L49.7998 16.5088V16.0508C49.7998 15.4036 49.6608 14.9502 49.3828 14.6904C49.1048 14.4307 48.7129 14.3008 48.207 14.3008C47.8151 14.3008 47.4414 14.3577 47.0859 14.4717C46.7305 14.5856 46.3932 14.7201 46.0742 14.875L45.7256 14.0137C46.0628 13.8405 46.4502 13.6924 46.8877 13.5693C47.3252 13.4463 47.7855 13.3848 48.2686 13.3848ZM49.7861 17.3086L48.6445 17.3564C47.7103 17.3929 47.0518 17.5456 46.6689 17.8145C46.2861 18.0833 46.0947 18.4639 46.0947 18.9561C46.0947 19.3844 46.2246 19.7012 46.4844 19.9062C46.7441 20.1113 47.0882 20.2139 47.5166 20.2139C48.182 20.2139 48.7266 20.0293 49.1504 19.6602C49.5742 19.291 49.7861 18.7373 49.7861 17.999V17.3086ZM56.6494 13.3711C56.7998 13.3711 56.957 13.3802 57.1211 13.3984C57.2852 13.4121 57.431 13.4326 57.5586 13.46L57.415 14.5127C57.292 14.4808 57.1553 14.4557 57.0049 14.4375C56.8545 14.4193 56.7132 14.4102 56.5811 14.4102C56.2803 14.4102 55.9954 14.4717 55.7266 14.5947C55.4622 14.7132 55.2298 14.8864 55.0293 15.1143C54.8288 15.3376 54.6715 15.6087 54.5576 15.9277C54.4437 16.2422 54.3867 16.5931 54.3867 16.9805V21H53.2451V13.5078H54.1885L54.3115 14.8887H54.3594C54.5143 14.6107 54.7012 14.3577 54.9199 14.1299C55.1387 13.8975 55.3916 13.7129 55.6787 13.5762C55.9704 13.4395 56.2939 13.3711 56.6494 13.3711ZM61.8584 13.3711C62.4964 13.3711 63.0433 13.5124 63.499 13.7949C63.9548 14.0775 64.3034 14.474 64.5449 14.9844C64.7865 15.4902 64.9072 16.0827 64.9072 16.7617V17.4658H59.7324C59.7461 18.3454 59.9648 19.0153 60.3887 19.4756C60.8125 19.9359 61.4095 20.166 62.1797 20.166C62.6536 20.166 63.0729 20.1227 63.4375 20.0361C63.8021 19.9495 64.1803 19.8219 64.5723 19.6533V20.6514C64.194 20.82 63.818 20.943 63.4443 21.0205C63.0752 21.098 62.6377 21.1367 62.1318 21.1367C61.4118 21.1367 60.7829 20.9909 60.2451 20.6992C59.7119 20.403 59.2972 19.9701 59.001 19.4004C58.7048 18.8307 58.5566 18.1335 58.5566 17.3086C58.5566 16.502 58.6911 15.8047 58.96 15.2168C59.2334 14.6243 59.6162 14.1686 60.1084 13.8496C60.6051 13.5306 61.1885 13.3711 61.8584 13.3711ZM61.8447 14.3008C61.2386 14.3008 60.7555 14.499 60.3955 14.8955C60.0355 15.292 59.8213 15.8457 59.7529 16.5566H63.7178C63.7132 16.11 63.6426 15.7181 63.5059 15.3809C63.3737 15.0391 63.1709 14.7747 62.8975 14.5879C62.624 14.3965 62.2731 14.3008 61.8447 14.3008ZM69.501 21.1367C68.5531 21.1367 67.8011 20.8132 67.2451 20.166C66.6937 19.5189 66.418 18.5573 66.418 17.2812C66.418 15.9915 66.7005 15.0186 67.2656 14.3623C67.8307 13.7015 68.5827 13.3711 69.5215 13.3711C69.918 13.3711 70.2643 13.4235 70.5605 13.5283C70.8568 13.6331 71.112 13.7744 71.3262 13.9521C71.5404 14.1253 71.7204 14.3236 71.8662 14.5469H71.9482C71.93 14.4056 71.9118 14.2119 71.8936 13.9658C71.8753 13.7197 71.8662 13.5192 71.8662 13.3643V10.3633H73.001V21H72.085L71.9141 19.9336H71.8662C71.7249 20.1569 71.5449 20.3597 71.3262 20.542C71.112 20.7243 70.8545 20.8701 70.5537 20.9795C70.2575 21.0843 69.9066 21.1367 69.501 21.1367ZM69.6787 20.1934C70.4808 20.1934 71.0482 19.9655 71.3809 19.5098C71.7135 19.054 71.8799 18.3773 71.8799 17.4795V17.2744C71.8799 16.3219 71.7204 15.5905 71.4014 15.0801C71.0869 14.5697 70.5127 14.3145 69.6787 14.3145C68.9814 14.3145 68.4596 14.5833 68.1133 15.1211C67.7669 15.6543 67.5938 16.3835 67.5938 17.3086C67.5938 18.2292 67.7646 18.9401 68.1064 19.4414C68.4528 19.9427 68.9769 20.1934 69.6787 20.1934ZM79.2148 21V11.0059H80.377V19.9609H84.8135V21H79.2148ZM87.4932 13.5078V21H86.3584V13.5078H87.4932ZM86.9395 10.7051C87.1263 10.7051 87.2858 10.7666 87.418 10.8896C87.5547 11.0081 87.623 11.195 87.623 11.4502C87.623 11.7008 87.5547 11.8877 87.418 12.0107C87.2858 12.1338 87.1263 12.1953 86.9395 12.1953C86.7435 12.1953 86.5794 12.1338 86.4473 12.0107C86.3197 11.8877 86.2559 11.7008 86.2559 11.4502C86.2559 11.195 86.3197 11.0081 86.4473 10.8896C86.5794 10.7666 86.7435 10.7051 86.9395 10.7051ZM94.7461 18.9492C94.7461 19.4277 94.6253 19.8311 94.3838 20.1592C94.1468 20.4827 93.805 20.7266 93.3584 20.8906C92.9163 21.0547 92.3877 21.1367 91.7725 21.1367C91.2484 21.1367 90.7949 21.0957 90.4121 21.0137C90.0293 20.9316 89.6943 20.8154 89.4072 20.665V19.6191C89.7126 19.7695 90.0771 19.9062 90.501 20.0293C90.9248 20.1523 91.3577 20.2139 91.7998 20.2139C92.4469 20.2139 92.9163 20.109 93.208 19.8994C93.4997 19.6898 93.6455 19.4049 93.6455 19.0449C93.6455 18.8398 93.5863 18.6598 93.4678 18.5049C93.3538 18.3454 93.1602 18.1927 92.8867 18.0469C92.6133 17.8965 92.235 17.7324 91.752 17.5547C91.2734 17.3724 90.8587 17.1924 90.5078 17.0146C90.1615 16.8324 89.8926 16.6113 89.7012 16.3516C89.5143 16.0918 89.4209 15.7546 89.4209 15.3398C89.4209 14.7064 89.6761 14.221 90.1865 13.8838C90.7015 13.542 91.376 13.3711 92.21 13.3711C92.6611 13.3711 93.0827 13.4167 93.4746 13.5078C93.8711 13.5944 94.2402 13.7129 94.582 13.8633L94.1992 14.7725C93.8893 14.6403 93.5589 14.5286 93.208 14.4375C92.8571 14.3464 92.4993 14.3008 92.1348 14.3008C91.6107 14.3008 91.2074 14.3874 90.9248 14.5605C90.6468 14.7337 90.5078 14.9707 90.5078 15.2715C90.5078 15.5039 90.5716 15.6953 90.6992 15.8457C90.8314 15.9961 91.041 16.1374 91.3281 16.2695C91.6152 16.4017 91.9935 16.5566 92.4629 16.7344C92.9323 16.9076 93.3379 17.0876 93.6797 17.2744C94.0215 17.4567 94.2835 17.68 94.4658 17.9443C94.6527 18.2041 94.7461 18.5391 94.7461 18.9492ZM98.9912 20.207C99.1781 20.207 99.3695 20.1911 99.5654 20.1592C99.7614 20.1273 99.9209 20.0885 100.044 20.043V20.9248C99.9118 20.984 99.7272 21.0342 99.4902 21.0752C99.2578 21.1162 99.0299 21.1367 98.8066 21.1367C98.4102 21.1367 98.0501 21.0684 97.7266 20.9316C97.403 20.7904 97.1432 20.5534 96.9473 20.2207C96.7559 19.888 96.6602 19.4277 96.6602 18.8398V14.3965H95.5938V13.8428L96.667 13.3984L97.1182 11.7715H97.8018V13.5078H99.9961V14.3965H97.8018V18.8057C97.8018 19.2751 97.9089 19.626 98.123 19.8584C98.3418 20.0908 98.6312 20.207 98.9912 20.207Z"
                                        fill="#616161"
                                      />
                                    </svg>
                                  </>
                                )}
                              </div>
                            </td>
                            <td
                              className="hidden items-center gap-2 p-2 md:flex"
                              onMouseEnter={() => setHoveredUser(item._id)}
                              onMouseLeave={() => setHoveredUser(null)}
                            >
                              <PresignedUserAvatar
                                photo={item?.createdBy?.photo}
                                fallback="/images/user.png"
                                alt="avatar"
                                className="h-8 w-8 rounded-full"
                              />
                              {item?.createdBy?.firstName +
                                ' ' +
                                item?.createdBy?.lastName}
                              {hoveredUser === item._id && (
                                <div className="w-128 pointer-events-none absolute top-2 z-20 rounded-lg border bg-gray-200 p-2 shadow-sm">
                                  <div className="flex items-start gap-2">
                                    <PresignedUserAvatar
                                      photo={item?.createdBy?.photo}
                                      fallback="/images/user.png"
                                      alt="Avatar"
                                      className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200"
                                    />

                                    <div className="space-y-2">
                                      <p className="text-sm font-semibold text-[#605f5f]">
                                        {item?.createdBy?.firstName +
                                          ' ' +
                                          item?.createdBy?.lastName}
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
                                        <p className="text-wrap text-sm">
                                          {item?.createdBy?.email}
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
                                        <p className="truncate break-words text-sm">
                                          {item?.organizationId?.name}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </td>
                            {/* </div> */}
                            <td className="hidden p-2 md:table-cell">
                              {`${formatDateWithDays({
                                date:
                                  new Date(item.createdAt.toString()) ??
                                  new Date(),
                              })}`}
                            </td>
                            <td
                              className="cursor-pointer pr-4"
                              onClick={(e) => e.stopPropagation()}
                            >
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
                                      onChange={() =>
                                        handleCheckboxChange(item)
                                      }
                                    />
                                    {selectedSubmissions.some(
                                      (ts) => item._id == ts._id
                                    ) && (
                                      <svg
                                        onClick={() =>
                                          handleCheckboxChange(item)
                                        }
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
                                          handleRowClick(item);
                                        }}
                                      >
                                        View
                                      </DropdownItem>
                                      <DropdownItem
                                        key="Duplicate"
                                        onPress={() => {
                                          context.dispatch({
                                            type: JSAAPPACTIONTYPE.SETITEM,
                                            payLoad: item,
                                          });
                                          context.dispatch({
                                            type: JSAAPPACTIONTYPE.SHOWMODAL,
                                            showModal: 'duplicateModel',
                                          });
                                        }}
                                      >
                                        Duplicate
                                      </DropdownItem>
                                      <DropdownItem
                                        key="Edit"
                                        isDisabled={
                                          !adminMode &&
                                          item.createdBy?._id !=
                                            session?.user.user._id
                                        }
                                        onPress={() => {
                                          context.dispatch({
                                            type: JSAAPPACTIONTYPE.SETITEM,
                                            payLoad: item,
                                          });
                                          context.dispatch({
                                            type: JSAAPPACTIONTYPE.SHOWMODAL,
                                            showModal: 'editModal',
                                          });
                                        }}
                                      >
                                        Edit
                                      </DropdownItem>
                                      <DropdownItem
                                        key="Delete"
                                        color="danger"
                                        isDisabled={
                                          !adminMode &&
                                          item.createdBy?._id !=
                                            session?.user.user._id
                                        }
                                        onPress={() => {
                                          context.dispatch({
                                            type: JSAAPPACTIONTYPE.SHOW_PPE_DELTE_MODEL,
                                            showPPEDeleteModel: item,
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
                      </>
                    ) : (
                      <>
                        <tr className="text-center">
                          <td colSpan={5}>
                            <div className="flex w-full justify-center">
                              <div className="flex w-1/2 flex-col items-center justify-center p-5">
                                <img
                                  src="/images/empty-box.svg"
                                  className="m-2 w-[20%]"
                                  alt="image"
                                />
                                <p className="text-1xl m-2">
                                  Nothing to see here
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="absolute bottom-24 left-0 flex w-full justify-end p-4">
          <button
            className="flex w-[40px] items-center justify-center gap-1 rounded-full bg-[#0063F7] py-3 text-sm font-semibold text-white hover:bg-blue-700 md:w-[118px] md:text-base"
            type="button"
            onClick={() =>
              context.dispatch({
                type: JSAAPPACTIONTYPE.SHOWMODAL,
                showModal: 'NewModal',
              })
            }
          >
            <div className="hidden px-1 text-medium md:block">+ Add</div>
          </button>
          {(context.state.showModal === 'NewModal' ||
            context.state.showModal === 'editModal' ||
            context.state.showModal === 'duplicateModel') && (
            <NewPPEModal isOpen={true} onClose={handleClose} />
          )}
          {context.state.showModal === 'deleteModal' && <PPEDeleteModal />}

          {context.state.showModal === 'detailModal' && (
            <DetailModal isOpen={true} onClose={handleClose} />
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
                  onClick={() => {
                    context.dispatch({
                      type: JSAAPPACTIONTYPE.SHOW_MULTI_PPE_DELTE_MODEL,
                      showMultiPPEDeleteModel: selectedSubmissions,
                    });
                  }}
                >
                  <div>Delete ({(selectedSubmissions ?? []).length})</div>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter modal */}
      <CustomModal
        isOpen={showModel}
        handleCancel={() => setShowModel(false)}
        handleSubmit={handleApplyFilters}
        submitValue="Apply"
        cancelButton="Close"
        submitDisabled={!areFiltersApplied()}
        header={
          <div className="flex flex-col gap-1 px-1 py-2">
            <h2 className="text-xl font-semibold text-[#1E1E1E]">Filter By</h2>
            <p className="text-sm font-normal text-[#616161]">
              Filter by the following selections and options.
            </p>
          </div>
        }
        body={
          <div className="flex max-h-[540px] flex-col gap-8 overflow-y-auto px-1 pb-4 scrollbar-hide">
            <div className="w-full" onClick={() => setOpenDropdown('')}>
              <DateRangePicker
                title="Created Date Range"
                handleOnConfirm={(from: Date, to: Date) => {
                  context.dispatch({
                    type: JSAAPPACTIONTYPE.JSA_DETAIL_DATE,
                    jsaDetailDate: { from: from, to: to },
                  });
                }}
                selectedDate={context.state.jsaDetailDate ?? undefined}
              />
            </div>

            <div className="w-full">
              <CustomSearchSelect
                label="Created By"
                data={(users ?? []).map((user) => ({
                  label: `${user.firstName} ${user.lastName}`,
                  value: user._id,
                }))}
                showImage={true}
                multiple={true}
                selected={selectedSubmittedBy}
                isOpen={openDropdown === 'dropdown3'}
                onToggle={() => handleToggleDropdown('dropdown3')}
                onSelect={(selected: string[]) =>
                  setSelectedSubmittedBy(selected)
                }
                placeholder="All Users"
              />
            </div>

            <div className="mb-6 flex flex-col space-y-3 p-2">
              <span className="text-sm font-semibold text-[#1E1E1E]">
                Sharing
              </span>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="sharingOption"
                  checked={submissionType === 'all'}
                  onChange={() => setSubmissionType('all')}
                  className="form-radio h-[20px] w-[20px] accent-[#0063F7]"
                />
                <span className="ml-2 text-sm text-[#1E1E1E]">All</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="sharingOption"
                  checked={submissionType === 'public'}
                  onChange={() => setSubmissionType('public')}
                  className="form-radio h-[20px] w-[20px] accent-[#0063F7]"
                />
                <span className="ml-2 text-sm text-[#1E1E1E]">Public</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="sharingOption"
                  checked={submissionType === 'private'}
                  onChange={() => setSubmissionType('private')}
                  className="form-radio h-[20px] w-[20px] accent-[#0063F7]"
                />
                <span className="ml-2 text-sm text-[#1E1E1E]">Private</span>
              </label>
            </div>
          </div>
        }
      />
      {context.state.showMultiPPEDeleteModal && (
        <PPEMultiDeleteModal
          handleClose={() => {
            context.dispatch({
              type: JSAAPPACTIONTYPE.SHOW_MULTI_PPE_DELTE_MODEL,
              // showMultiPPEDeleteModel: [],
            });
            handleCancel();
          }}
        />
      )}
    </>
  );
};

export default PPESafetyGear;
