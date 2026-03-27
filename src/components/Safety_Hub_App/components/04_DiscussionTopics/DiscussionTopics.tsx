import { useState } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Pagination,
} from '@nextui-org/react';
import FilterButton from '@/components/TimeSheetApp/CommonComponents/FilterButton/FilterButton';
import { SAFETYHUBTYPE } from '@/app/helpers/user/enums';
import { Search } from '@/components/Form/search';
import { Button } from '@/components/Buttons';
import { useSafetyHubContext } from '@/app/(main)/(user-panel)/user/apps/sh/sh_context';
import {
  checkSHPermission,
  deleteDiscussionTopic,
  getDiscussionTopicList,
  updateDiscussionTopic,
  updateMultipleDiscussionTopic,
} from '@/app/(main)/(user-panel)/user/apps/sh/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useQueryClient, useQuery, useMutation } from 'react-query';
import Loader from '@/components/DottedLoader/loader';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import { useSession } from 'next-auth/react';
import CreateDiscussionModal from './Create_Discussion_Topic_Model';
import { DiscussionTopic } from '@/app/type/discussion_topic';
import CustomInfoModal from '@/components/CustomDeleteModel';
import { useRouter } from 'next/navigation';

import { CustomHoverPorjectShow } from '@/components/Custom_Project_Hover_Component';
import { generateSecureToken } from '@/app/helpers/token_generator';
import AdminSwitch from '@/components/AdminSwitch/AdminSwitch';
import { useFormik } from 'formik';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';
import {
  getAllAppProjects,
  getAllOrgUsers,
} from '@/app/(main)/(user-panel)/user/apps/api';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { set } from 'date-fns';
import { PaginationComponent } from '@/components/pagination';

export default function DiscussionTopicsScreen() {
  // const memoizedTopBar = useMemo(() => <SafetyHubTopBar />, []);
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [adminMode, setAdminMode] = useState(false);
  const [action, setAction] = useState<'add' | 'edit' | 'delete' | undefined>(
    undefined
  );

  const [selectedModel, setSelectedModel] = useState<
    DiscussionTopic | undefined
  >(undefined);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [hoveredUser, setHoveredUser] = useState<number | null>(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Open');
  const { state, dispatch } = useSafetyHubContext();
  // view dorpdown function - topbar
  const handleToggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };
  const [selectedSubmissions, setCheckedSubmissions] = useState<
    DiscussionTopic[]
  >([]);
  const [showMultiModel, setShowMultiModel] = useState(false);
  const [showSingleResolutionModal, setShowSingleResolutionModal] =
    useState(false);
  const [selectedTopicForResolution, setSelectedTopicForResolution] = useState<
    DiscussionTopic | undefined
  >(undefined);
  const deleteMutation = useMutation(deleteDiscussionTopic, {
    onSuccess: () => {
      queryClient.invalidateQueries('discussionTopics');
      setAction(undefined);
    },
  });
  const updateMutation = useMutation(updateMultipleDiscussionTopic, {
    onSuccess: () => {
      handleCancel();
      setMultiAction('topic');
      setShowMultiDelete(undefined);
      setAction(undefined);
      queryClient.invalidateQueries('discussionTopics');
    },
  });
  const updateSingleTopicMutation = useMutation(updateDiscussionTopic, {
    onSuccess: () => {
      setShowSingleResolutionModal(false);
      setSelectedTopicForResolution(undefined);
      queryClient.invalidateQueries('discussionTopics');
    },
  });
  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
    setDropdownOpen(false);
  };
  /// filters /////////////

  const [isApplyFilter, setApplyFilter] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string>('');
  const [showFilterModel, setShowFilterModel] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [selectedSubmitBy, setSelectedSubmitBy] = useState<string[]>([]);

  const { data: projects } = useQuery({
    queryFn: () => getAllAppProjects(axiosAuth),
    queryKey: ['allProjects'],
  });
  const { data: users } = useQuery({
    queryKey: 'listofUsersForApp',
    queryFn: () => getAllOrgUsers(axiosAuth),
    refetchOnWindowFocus: false,
  });
  const handleDropdown = (dropdownId: string) => {
    setOpenFilterDropdown(openFilterDropdown === dropdownId ? '' : dropdownId);
  };
  // Filter handling
  const clearFilters = () => {
    setSelectedProjects([]);
    setSelectedCategory(undefined);
    setSelectedSubmitBy([]);
    setApplyFilter(false);
    setOpenFilterDropdown('');
  };

  const areFiltersApplied = () => {
    return (
      selectedProjects.length > 0 ||
      selectedCategory !== undefined ||
      selectedSubmitBy.length > 0
    );
  };

  const handleApplyFilters = () => {
    setShowFilterModel(!showFilterModel);
    if (areFiltersApplied()) {
      setApplyFilter(true);
    }
  };
  ////////======//////////

  const handleSelectAllChange = () => {
    if ((filterData ?? []).length == (selectedSubmissions ?? []).length) {
      handleCancel();
    } else {
      setCheckedSubmissions(
        (filterData ?? []).filter(
          (item) => item.submittedBy._id === session?.user.user._id
        )
      );
    }
  };
  const handleCancel = () => {
    setCheckedSubmissions([]);
    setIsSelectMode(false); // Exit select mode
  };
  const handleCheckboxChange = (js: DiscussionTopic) => {
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
  const [isSelectMode, setIsSelectMode] = useState(false);

  ////////======//////////
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['discussionTopics', adminMode],
    queryFn: () => getDiscussionTopicList({ axiosAuth, isAdmin: adminMode }),
    enabled: true,
  });
  const handleGoBack = () => {
    dispatch({
      type: SAFETYHUBTYPE.SHOWPAGES,
    });
  };
  const [multiAction, setMultiAction] = useState<'delete' | 'topic'>('topic');
  const [showMultiDelete, setShowMultiDelete] = useState<
    'delete' | 'topic' | undefined
  >(undefined);
  const [sortOrder, setSortOrder] = useState('asc'); // "asc" for A-Z, "desc" for Z-A
  const [sortDateOrder, setSortDateOrder] = useState('desc'); // "asc" for ascending, "desc" for descending (default: newest first)

  // Function to toggle sorting order
  const toggleSortDateOrder = () => {
    setSortDateOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  // Check if user is Root User from session (role 3 = Organization Admin)
  const isRootUser = (session?.user as any)?.role === 3;

  // Check app-level permission (backend already checks global apps permission and returns adminMode: true if user has it)
  const { data: permissions } = useQuery('SHSettingPermission', () =>
    checkSHPermission(axiosAuth)
  );

  // User can use Admin Mode if Root User or has permission (which includes global apps permission)
  const canUseAdminMode = isRootUser || permissions?.adminMode === true;

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };
  const organizationForm = useFormik({
    initialValues: {
      description: '',
      topic: false,
    },

    onSubmit: (values) => {
      console.log(values); // Handle form submission
      updateMutation.mutate({
        axiosAuth,
        data: {
          ids: selectedSubmissions?.map((item: any) => item._id),
          status: 'close',
          resolution: values.description || '',
        },
      });
    },
  });
  const singleResolutionForm = useFormik({
    initialValues: {
      resolution: selectedTopicForResolution?.resolution ?? '',
      markAsClosed:
        selectedTopicForResolution?.status?.toLowerCase() === 'close',
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      if (!selectedTopicForResolution) return;
      updateSingleTopicMutation.mutate({
        axiosAuth,
        id: selectedTopicForResolution._id,
        data: {
          resolution: values.resolution,
          status: values.markAsClosed ? 'close' : 'open',
        },
      });
    },
  });
  const filterData = (data ?? [])
    .filter((search) => {
      return search.title.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .filter((p) => {
      if (isApplyFilter) {
        // Filter by projects: check if topic has any project in selectedProjects
        if (selectedProjects.length > 0) {
          const topicProjectIds = (p.projects ?? []).map((proj) => proj._id);
          const hasMatchingProject = selectedProjects.some((selectedProjId) =>
            topicProjectIds.includes(selectedProjId)
          );
          if (!hasMatchingProject) return false;
        }
        // Filter by submitted by
        if (selectedSubmitBy.length > 0) {
          if (!selectedSubmitBy.includes(p.submittedBy._id)) return false;
        }
      }
      return true;
    })
    .filter((categorycheck) => {
      if (isApplyFilter && selectedCategory) {
        return categorycheck.category === selectedCategory;
      }
      return true;
    })
    .filter((status) => {
      if (selectedOption === 'Open') {
        return status.status === 'open';
      } else if (selectedOption === 'Close') {
        return status.status === 'close';
      } else {
        return true;
      }
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.title.localeCompare(b.title); // A-Z sorting
      } else {
        return b.title.localeCompare(a.title); // Z-A sorting
      }
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime(); // Convert to timestamp
      const dateB = new Date(b.createdAt).getTime(); // Convert to timestamp
      if (sortDateOrder === 'asc') {
        return dateA - dateB; // Earliest date first
      } else {
        return dateB - dateA; // Latest date first
      }
    });
  return (
    <>
      <div className="absolute inset-0 z-10 flex h-[calc(var(--app-vh)-70px)] w-full max-w-[1346px] flex-col bg-white px-4 pt-4 font-Open-Sans">
        {/* TopBar */}
        {/* {memoizedTopBar} */}

        {/* ///////////////// Middle content ////////////////////// */}

        <div className="relative flex h-full flex-1 flex-col justify-start overflow-auto scrollbar-hide">
          <div className="sticky top-0 z-20 bg-white pb-2">
            <div className="breadCrumbs flex justify-between p-2">
              <div className="flex justify-start gap-5">
                <ul className="breadcurmb flex items-center gap-[10px]">
                  <li className="text-base text-[#757575]">Tiki Apps</li>
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      fill="none"
                    >
                      <path
                        d="M8.25 5.5L13.75 11L8.25 16.5"
                        stroke="#757575"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </li>
                  <li className="text-base text-[#757575]">Safety Hub</li>
                </ul>
              </div>
              <button onClick={handleGoBack}>
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
              {/* </Link> */}
            </div>
            <div className="mt-4 flex flex-col justify-between gap-2 lg:flex-row">
              <div className="flex items-center gap-2 text-2xl font-bold text-[#1E1E1E]">
                <img
                  src="/svg/sh/logo.svg"
                  alt="show logo"
                  className="h-12 w-12"
                />
                Discussion Topics
              </div>
              <div className="flex flex-wrap items-end justify-center gap-2">
                <div className="flex items-center gap-2">
                  {/* AdminSwitch */}
                  {canUseAdminMode && (
                    <div className="hidden md:flex">
                      <AdminSwitch
                        adminMode={adminMode}
                        setAdminMode={setAdminMode}
                      />
                    </div>
                  )}

                  {/* DropDown Custom | CheckInOut */}
                  <div className="DropDownn relative z-50 inline-block w-fit text-left">
                    <div>
                      <button
                        type="button"
                        className="inline-flex w-full items-center justify-center gap-1 rounded-md border border-gray-300 bg-[#E2F3FF] px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-[#e1f0fa] focus:outline-none"
                        id="options-menu"
                        aria-expanded="true"
                        aria-haspopup="true"
                        onClick={handleToggleDropdown}
                      >
                        {selectedOption}
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
                    {isDropdownOpen && (
                      <div
                        className="absolute left-0 z-50 mt-2 w-fit min-w-[76px] origin-top-left rounded-md bg-[#E2F3FF] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="options-menu"
                      >
                        <div className="py-1" role="none">
                          <button
                            onClick={() => handleSelectOption('Open')}
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            role="menuitem"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => handleSelectOption('Close')}
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            role="menuitem"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-grow gap-3">
                  {/* filter button */}
                  <FilterButton
                    isApplyFilter={isApplyFilter}
                    setShowModel={setShowFilterModel}
                    showModel={showFilterModel}
                    setOpenDropdown={setOpenFilterDropdown}
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
          {/* /// table section  */}
          <div className="relative flex-1">
            {isLoading ? (
              <>
                <Loader />
              </>
            ) : (
              <table className="mt-3 w-full border-collapse font-Open-Sans">
                <thead className="bg-[#F5F5F5] text-left text-sm font-semibold text-[#616161]">
                  <tr>
                    <th
                      className="w-200 hidden px-2 py-3 text-center md:flex"
                      onClick={toggleSortOrder}
                    >
                      <span className="flex items-center justify-center gap-1">
                        Topic Name
                        <img
                          src="/images/fluent_arrow-sort-24-regular.svg"
                          className="cursor-pointer"
                          alt="image"
                        />
                      </span>
                    </th>
                    <th className="px-2 py-3">Assigned Projects</th>
                    <th className="px-2 py-3">Submitted By</th>
                    <th
                      className="hidden px-2 py-3 md:flex"
                      onClick={toggleSortDateOrder}
                    >
                      Date
                      <img
                        src="/images/fluent_arrow-sort-24-regular.svg"
                        className="cursor-pointer px-1"
                        alt="image"
                      />
                    </th>
                    <th className="px-2 py-3">Status</th>
                    {/* probabbly it's status */}
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
                                (filterData ?? []).filter(
                                  (item) =>
                                    item.submittedBy._id ===
                                    session?.user.user._id
                                ).length == (selectedSubmissions ?? []).length
                                  ? 'border-[#6990FF] bg-[#6990FF] checked:border-[#6990FF] checked:bg-[#6990FF]'
                                  : 'border-[#9E9E9E] bg-white'
                              } transition-colors duration-200 ease-in-out`}
                              onChange={handleSelectAllChange}
                            />
                            {(filterData ?? []).filter(
                              (item) =>
                                item.submittedBy._id === session?.user.user._id
                            ).length == (selectedSubmissions ?? []).length && (
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
                    const token = generateSecureToken({
                      userId: item._id,
                      readonly: false,
                      expiresAt: Date.now() + 60 * 60 * 1000, // Expires in 1 hour
                    });
                    return (
                      <tr
                        key={item._id}
                        className="relative border-b even:bg-[#F5F5F5]"
                      >
                        <td
                          className="w-400 hidden cursor-pointer px-2 py-2 text-primary-500 md:flex"
                          onClick={() => {
                            router.push(
                              `/user/apps/sh/${state.appId}/discussiontopic/${item._id}?token=${token}&from=discussionTopics`
                            );
                          }}
                        >
                          {item.title}
                        </td>

                        <td className="relative px-2 py-2 text-primary-400">
                          {(item?.projects ?? []).length > 0 && (
                            <>
                              {CustomHoverPorjectShow({
                                projects: item?.projects,
                                index: hoveredProject,
                                setHoveredProject: setHoveredProject,
                                selectedIndex: 0,
                              })}
                            </>
                          )}
                        </td>

                        <td
                          className="flex cursor-pointer items-center px-2 py-2"
                          onMouseEnter={() => setHoveredUser(index)}
                          onMouseLeave={() => setHoveredUser(null)}
                        >
                          <img
                            src={'/images/User-profile.png'}
                            alt="avatar"
                            className="mr-2 h-8 w-8 rounded-full border border-gray-500 text-[#1E1E1E]"
                          />
                          <span className="text-[#616161]">
                            {session?.user.user?._id ==
                            item.submittedBy?._id ? (
                              <>Me</>
                            ) : (
                              <>{`${item.submittedBy.firstName} ${item.submittedBy.lastName}`}</>
                            )}
                          </span>
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
                                    <p className="text-xs">
                                      {item.submittedBy.organization?.name}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="hidden px-2 py-2 lg:table-cell">
                          <div className="space-x-3">
                            <span>{dateFormat(item.createdAt.toString())}</span>

                            <span>{timeFormat(item.createdAt.toString())}</span>
                          </div>
                        </td>
                        <td className="relative px-2 py-2 text-primary-400">
                          {checkStatusOfTopic(item.status)}
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
                                  disabled={
                                    session?.user.user._id !==
                                    item.submittedBy._id
                                  }
                                  className={`h-5 w-5 cursor-pointer appearance-none rounded-md border-2 ${
                                    selectedSubmissions.some(
                                      (ts) => item._id == ts._id
                                    )
                                      ? 'border-[#6990FF] bg-[#6990FF] checked:border-[#6990FF] checked:bg-[#6990FF]'
                                      : 'border-[#9E9E9E] bg-white'
                                  } transition-colors duration-200 ease-in-out disabled:cursor-not-allowed`}
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
                                    onPress={() => {
                                      router.push(
                                        '/user/apps/sh/' +
                                          `${state.appId}/discussiontopic/${item._id}?token=${token}&from=discussionTopics`
                                      );
                                    }}
                                  >
                                    View
                                  </DropdownItem>
                                  <DropdownItem
                                    key="resolution"
                                    onPress={() => {
                                      setSelectedTopicForResolution(item);
                                      setShowSingleResolutionModal(true);
                                    }}
                                  >
                                    Resolution
                                  </DropdownItem>
                                  <DropdownItem
                                    key="edit"
                                    isDisabled={
                                      session?.user.user._id !==
                                      item.submittedBy._id
                                    }
                                    onPress={() => {
                                      setAction('edit');
                                      setSelectedModel(item);
                                      if ((item?.images ?? []).length > 0) {
                                        for (
                                          let index = 0;
                                          index < (item?.images ?? []).length;
                                          index++
                                        ) {
                                          const element = item?.images[index];
                                          dispatch({
                                            type: SAFETYHUBTYPE.SM_IMAGES,
                                            smImages: element,
                                          });
                                        }
                                      }
                                    }}
                                  >
                                    Edit
                                  </DropdownItem>
                                  <DropdownItem
                                    key="delete"
                                    isDisabled={
                                      session?.user.user._id !==
                                      item.submittedBy._id
                                    }
                                    onClick={() => {
                                      setAction('delete');
                                      setSelectedModel(item);
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
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* todo add functionality later on */}
            <div className="absolute bottom-6 right-6 z-10">
              <Button
                variant="primaryRounded"
                onClick={() => {
                  setAction('add');
                }}
              >
                {'+ Add'}
              </Button>
            </div>
          </div>
        </div>
        <div className="h-16">
          <div className="flex h-full items-center justify-between border-2 border-[#EEEEEE] p-2">
            <div className="text-sm font-normal text-[#616161]">
              Items per page: 50
            </div>
            <div>
              <PaginationComponent
                totalPages={1}
                currentPage={1}
                handlePageChange={(page: number) => {}}
              />
            </div>
            <div>
              {isSelectMode && (
                <div className="flex w-fit justify-end gap-4 text-right">
                  <Button variant="text" onClick={handleCancel}>
                    <div className="">Cancel</div>
                  </Button>
                  <Button
                    variant="primary"
                    disabled={(selectedSubmissions ?? []).length == 0}
                    onClick={() => {
                      setShowMultiModel(!showMultiModel);
                    }}
                  >
                    <div>Select ({(selectedSubmissions ?? []).length})</div>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {(action == 'add' || action == 'edit') && (
        <CreateDiscussionModal
          handleClose={() => {
            setAction(undefined), setSelectedModel(undefined);
          }}
          model={selectedModel}
        />
      )}
      {action == 'delete' && (
        <CustomInfoModal
          doneValue={
            deleteMutation.isLoading ? (
              <>
                <Loader />
              </>
            ) : (
              <>Delete</>
            )
          }
          handleClose={() => {
            setAction(undefined);
            setSelectedModel(undefined);
          }}
          onDeleteButton={() => {
            deleteMutation.mutate({ axiosAuth, id: selectedModel?._id ?? '' });
          }}
          subtitle="Are you sure you want to delete this Discussion Topic. This action cannot be undone."
          title={'Delete (1) Discussion Topic'}
        />
      )}
      <Modal
        isOpen={showMultiModel}
        onOpenChange={() => setShowMultiModel(!showMultiModel)}
        placement="top-center"
        size="xl"
      >
        <ModalContent className="max-w-[600px] rounded-3xl bg-white">
          {(onCloseModal) => (
            <>
              <ModalHeader className="flex flex-row items-start gap-2 px-5 py-5">
                <img src="/svg/sh/edit.svg" alt="" />
                <div>
                  <h2 className="text-xl font-semibold text-[#1E1E1E]">
                    {'Bulk Edit Discussion Topic'}
                  </h2>
                  <span className="mt-1 text-base font-normal text-[#616161]">
                    {'Select an option below to change.'}
                  </span>
                </div>
              </ModalHeader>
              <ModalBody className="my-4">
                <div className="mb-8 flex flex-col space-y-4 p-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="option"
                      checked={multiAction == 'topic'}
                      onChange={() => setMultiAction('topic')}
                      className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                    />
                    <span className="ml-2">Mark 'Topic' as closed</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="option"
                      checked={multiAction == 'delete'}
                      onChange={() => setMultiAction('delete')}
                      className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                    />
                    <span className="ml-2">Delete</span>
                  </label>
                </div>
              </ModalBody>
              <ModalFooter className="border-t-2 border-gray-200">
                <Button variant="primaryOutLine" onClick={onCloseModal}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowMultiDelete(multiAction);
                    setShowMultiModel(!showMultiModel);
                  }}
                >
                  Next
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {showMultiDelete === 'delete' && (
        <CustomInfoModal
          doneValue={
            updateMutation.isLoading ? (
              <>
                <Loader />
              </>
            ) : (
              <>Delete</>
            )
          }
          handleClose={() => {
            setMultiAction('topic');
            setShowMultiDelete(undefined);
          }}
          onDeleteButton={() => {
            updateMutation.mutate({
              axiosAuth,
              data: {
                ids: selectedSubmissions?.map((item: any) => item._id),
                deletedAt: new Date(),
              },
            });
          }}
          subtitle="Are you sure you want to delete this Discussion Topic. This action cannot be undone."
          title={`Delete (${selectedSubmissions.length}) Discussion Topics`}
        />
      )}

      {showMultiDelete === 'topic' && (
        <Modal
          isOpen={true}
          onOpenChange={() => setShowMultiDelete(undefined)}
          placement="top-center"
          size="xl"
        >
          <ModalContent className="max-w-[600px] rounded-3xl bg-white">
            {(onCloseModal) => (
              <>
                <ModalHeader className="flex flex-row items-start justify-between gap-2 px-5 py-5">
                  <div className="flex flex-row items-start gap-2">
                    <svg
                      width="50"
                      height="50"
                      viewBox="0 0 50 50"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                      <g clipPath="url(#clip0_resolution)">
                        <path
                          d="M25 15C19.48 15 15 19.48 15 25C15 30.52 19.48 35 25 35C30.52 35 35 30.52 35 25C35 19.48 30.52 15 25 15ZM25 32.5C21.41 32.5 18.5 29.59 18.5 26C18.5 22.41 21.41 19.5 25 19.5C28.59 19.5 31.5 22.41 31.5 26C31.5 29.59 28.59 32.5 25 32.5ZM25 22C23.62 22 22.5 23.12 22.5 24.5C22.5 25.88 23.62 27 25 27C26.38 27 27.5 25.88 27.5 24.5C27.5 23.12 26.38 22 25 22Z"
                          fill="#0063F7"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_resolution">
                          <rect
                            width="30"
                            height="30"
                            fill="white"
                            transform="translate(10 10)"
                          />
                        </clipPath>
                      </defs>
                    </svg>
                    <div>
                      <h2 className="text-xl font-semibold text-[#1E1E1E]">
                        {'Discussion Topic Resolution'}
                      </h2>
                      <span className="mt-1 text-base font-normal text-[#616161]">
                        {'Add or modify resolution details below.'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={onCloseModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18 6L6 18M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </ModalHeader>
                <ModalBody className="my-4">
                  <div className="mb-8 flex flex-col space-y-2 p-2">
                    <label
                      className="block text-sm font-medium text-[#1E1E1E]"
                      htmlFor="resolution"
                    >
                      Resolution (optional)
                    </label>
                    <textarea
                      rows={6}
                      id="description"
                      name="description"
                      placeholder="Add comments on this resolution."
                      value={organizationForm.values.description}
                      className={` ${
                        organizationForm.errors.description &&
                        organizationForm.touched.description
                          ? 'border-red-500'
                          : 'border-[#EEEEEE]'
                      } w-full resize-none rounded-xl border-2 border-gray-300 p-3 shadow-sm focus:border-[#0063F7] focus:outline-none`}
                      onChange={organizationForm.handleChange}
                    />
                    <div className="mt-4 flex flex-row items-center gap-2">
                      <CustomBlueCheckBox
                        checked={!!organizationForm.values.topic}
                        onChange={() => {
                          organizationForm.setFieldValue(
                            'topic',
                            !organizationForm.values.topic
                          );
                        }}
                      />
                      <span className="text-sm text-[#616161]">
                        Mark 'Topic' as closed
                      </span>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter className="border-t-2 border-gray-200">
                  <Button variant="primaryOutLine" onClick={onCloseModal}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!organizationForm.values.topic}
                    onClick={() => {
                      organizationForm.submitForm();
                    }}
                  >
                    {updateMutation.isLoading ? (
                      <>
                        <Loader />
                      </>
                    ) : (
                      <>Save</>
                    )}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
      {/* Single Resolution Modal */}
      {showSingleResolutionModal && selectedTopicForResolution && (
        <Modal
          isOpen={true}
          onOpenChange={() => {
            setShowSingleResolutionModal(false);
            setSelectedTopicForResolution(undefined);
          }}
          placement="top-center"
          size="xl"
        >
          <ModalContent className="max-w-[600px] rounded-3xl bg-white">
            {(onCloseModal) => (
              <>
                <ModalHeader className="flex flex-row items-start justify-between gap-2 px-5 py-5">
                  <div className="flex flex-row items-start gap-2">
                    <svg
                      width="50"
                      height="50"
                      viewBox="0 0 50 50"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                      <g clipPath="url(#clip0_single_resolution)">
                        <path
                          d="M25 15C19.48 15 15 19.48 15 25C15 30.52 19.48 35 25 35C30.52 35 35 30.52 35 25C35 19.48 30.52 15 25 15ZM25 32.5C21.41 32.5 18.5 29.59 18.5 26C18.5 22.41 21.41 19.5 25 19.5C28.59 19.5 31.5 22.41 31.5 26C31.5 29.59 28.59 32.5 25 32.5ZM25 22C23.62 22 22.5 23.12 22.5 24.5C22.5 25.88 23.62 27 25 27C26.38 27 27.5 25.88 27.5 24.5C27.5 23.12 26.38 22 25 22Z"
                          fill="#0063F7"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_single_resolution">
                          <rect
                            width="30"
                            height="30"
                            fill="white"
                            transform="translate(10 10)"
                          />
                        </clipPath>
                      </defs>
                    </svg>
                    <div>
                      <h2 className="text-xl font-semibold text-[#1E1E1E]">
                        {'Discussion Topic Resolution'}
                      </h2>
                      <span className="mt-1 text-base font-normal text-[#616161]">
                        {'Add or modify resolution details below.'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={onCloseModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18 6L6 18M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </ModalHeader>
                <ModalBody className="my-4">
                  <div className="mb-8 flex flex-col space-y-2 p-2">
                    <label
                      className="block text-sm font-medium text-[#1E1E1E]"
                      htmlFor="resolution"
                    >
                      Resolution (optional)
                    </label>
                    <textarea
                      rows={6}
                      id="resolution"
                      name="resolution"
                      placeholder="Add comments on this resolution."
                      value={singleResolutionForm.values.resolution}
                      className={` ${
                        singleResolutionForm.errors.resolution &&
                        singleResolutionForm.touched.resolution
                          ? 'border-red-500'
                          : 'border-[#EEEEEE]'
                      } w-full resize-none rounded-xl border-2 border-gray-300 p-3 shadow-sm focus:border-[#0063F7] focus:outline-none`}
                      onChange={singleResolutionForm.handleChange}
                    />
                    <div className="mt-4 flex flex-row items-center gap-2">
                      <CustomBlueCheckBox
                        checked={singleResolutionForm.values.markAsClosed}
                        onChange={() => {
                          singleResolutionForm.setFieldValue(
                            'markAsClosed',
                            !singleResolutionForm.values.markAsClosed
                          );
                        }}
                      />
                      <span className="text-sm text-[#616161]">
                        Mark 'Topic' as closed
                      </span>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter className="border-t-2 border-gray-200">
                  <Button variant="primaryOutLine" onClick={onCloseModal}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      singleResolutionForm.submitForm();
                    }}
                  >
                    {updateSingleTopicMutation.isLoading ? (
                      <>
                        <Loader />
                      </>
                    ) : (
                      <>Save</>
                    )}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
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
                <div className="w-full">
                  <CustomSearchSelect
                    label="Filter By Project"
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
                    isOpen={openFilterDropdown === 'dropdown1'}
                    onToggle={() => handleDropdown('dropdown1')}
                    searchPlaceholder="Search Projects"
                    onSelect={(selected: string[]) => {
                      // Remove 'all' if other options are selected, or select only 'all' if it's chosen
                      const filtered = selected.filter((s) => s !== 'all');
                      setSelectedProjects(
                        filtered.length > 0
                          ? filtered
                          : selected.includes('all')
                            ? []
                            : selected
                      );
                    }}
                    selected={selectedProjects}
                    placeholder="-"
                  />
                </div>
                <div className="w-full">
                  <CustomSearchSelect
                    label="Submitted By"
                    data={[
                      {
                        label: 'All',
                        value: 'all',
                      },
                      ...(users ?? []).map((user) => ({
                        label: `${user.firstName} ${user.lastName}`,
                        value: user._id ?? '',
                      })),
                    ]}
                    showImage={false}
                    multiple={true}
                    isOpen={openFilterDropdown === 'dropdown2'}
                    onToggle={() => handleDropdown('dropdown2')}
                    onSelect={(selected: string[]) => {
                      // Remove 'all' if other options are selected, or select only 'all' if it's chosen
                      const filtered = selected.filter((s) => s !== 'all');
                      setSelectedSubmitBy(
                        filtered.length > 0
                          ? filtered
                          : selected.includes('all')
                            ? []
                            : selected
                      );
                    }}
                    placeholder="-"
                    searchPlaceholder="Search Users"
                    selected={selectedSubmitBy}
                  />
                </div>
                <h2 className="text-xl font-semibold">Category</h2>
                <div className="flex flex-col gap-2">
                  <div
                    className="flex gap-2"
                    onClick={() => setSelectedCategory('General Safety')}
                  >
                    <div className="relative flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        name="user"
                        checked={selectedCategory === 'General Safety'}
                        readOnly
                        id="some_id"
                        className="peer h-6 w-6 appearance-none rounded-md border-2 border-[#9E9E9E] bg-white checked:border-[#9E9E9E] checked:bg-white"
                      />
                      <svg
                        className="absolute inset-0 m-auto hidden h-4 w-4 text-[#9E9E9E] peer-checked:block"
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
                    </div>
                    <span>General Safety</span>
                  </div>
                  <div
                    className="flex gap-2"
                    onClick={() => setSelectedCategory('Hazard & Incident')}
                  >
                    <div className="relative flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        name="user"
                        checked={selectedCategory === 'Hazard & Incident'}
                        readOnly
                        id="some_id"
                        className="peer h-6 w-6 appearance-none rounded-md border-2 border-[#9E9E9E] bg-white checked:border-[#9E9E9E] checked:bg-white"
                      />
                      <svg
                        className="absolute inset-0 m-auto hidden h-4 w-4 text-[#9E9E9E] peer-checked:block"
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
                    </div>
                    <span>Hazard & Incident</span>
                  </div>
                  <div
                    className="flex gap-2"
                    onClick={() => setSelectedCategory('Training & Education')}
                  >
                    <div className="relative flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        name="user"
                        checked={selectedCategory === 'Training & Education'}
                        readOnly
                        id="some_id"
                        className="peer h-6 w-6 appearance-none rounded-md border-2 border-[#9E9E9E] bg-white checked:border-[#9E9E9E] checked:bg-white"
                      />
                      <svg
                        className="absolute inset-0 m-auto hidden h-4 w-4 text-[#9E9E9E] peer-checked:block"
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
                    </div>
                    <span>Training & Education</span>
                  </div>
                  <div
                    className="flex gap-2"
                    onClick={() => setSelectedCategory('Behavioural')}
                  >
                    <div className="relative flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        name="user"
                        checked={selectedCategory === 'Behavioural'}
                        readOnly
                        id="some_id"
                        className="peer h-6 w-6 appearance-none rounded-md border-2 border-[#9E9E9E] bg-white checked:border-[#9E9E9E] checked:bg-white"
                      />
                      <svg
                        className="absolute inset-0 m-auto hidden h-4 w-4 text-[#9E9E9E] peer-checked:block"
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
                    </div>
                    <span>Behavioural</span>
                  </div>
                  <div
                    className="flex gap-2"
                    onClick={() => setSelectedCategory('Environmental')}
                  >
                    <div className="relative flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        name="user"
                        checked={selectedCategory === 'Environmental'}
                        readOnly
                        id="some_id"
                        className="peer h-6 w-6 appearance-none rounded-md border-2 border-[#9E9E9E] bg-white checked:border-[#9E9E9E] checked:bg-white"
                      />
                      <svg
                        className="absolute inset-0 m-auto hidden h-4 w-4 text-[#9E9E9E] peer-checked:block"
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
                    </div>
                    <span>Environmental</span>
                  </div>
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

function checkStatusOfTopic(status: string) {
  if (status == 'open') {
    return (
      <span className="rounded-md bg-[#97F1BB] px-2 py-1 text-[#616161]">
        Open
      </span>
    );
  } else {
    return (
      <span className="rounded-md bg-blue-200 px-2 py-1 text-[#616161]">
        Close
      </span>
    );
  }
}
