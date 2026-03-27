import { useState, useMemo, useEffect } from 'react';
import { Switch } from '@material-tailwind/react';
import { X } from 'lucide-react';
import { PaginationComponent } from '@/components/pagination';
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
} from '@nextui-org/react';

import { SAFETYHUBTYPE } from '@/app/helpers/user/enums';
import { Search } from '@/components/Form/search';
import { Button } from '@/components/Buttons';

import { useSafetyHubContext } from '@/app/(main)/(user-panel)/user/apps/sh/sh_context';
import {
  checkSHPermission,
  deleteLiveBoard,
  getLiveBoardList,
  updateMultipleLiveBoard,
  updateMultipleSafetyMeeting,
} from '@/app/(main)/(user-panel)/user/apps/sh/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useQueryClient, useQuery, useMutation } from 'react-query';
import Loader from '@/components/DottedLoader/loader';
import {
  checkLiveBoardStatus,
  checkLiveBoardType,
} from '../01_LiveBoard/LiveBoard_Item';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LiveBoard } from '@/app/type/live_board';
import CustomInfoModal from '@/components/CustomDeleteModel';
import { generateSecureToken } from '@/app/helpers/token_generator';
import AdminSwitch from '@/components/AdminSwitch/AdminSwitch';
import { useFormik } from 'formik';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { HazardStatus } from '@/components/Asset_Manager_App/Enum';
import FilterButton from '@/components/TimeSheetApp/CommonComponents/FilterButton/FilterButton';
import {
  getAllAppProjects,
  getAllOrgUsers,
  createJSAComment,
} from '@/app/(main)/(user-panel)/user/apps/api';

export default function HazardsIncidentsScreen() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

  const [hoveredUser, setHoveredUser] = useState<number | null>(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('View All');
  const [model, setModel] = useState<LiveBoard | undefined>(undefined);
  const [modelForResolution, setResolutionModel] = useState<
    LiveBoard | undefined
  >(undefined);
  /// filters /////////////

  const [isApplyFilter, setApplyFilter] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string>('');
  const [showFilterModel, setShowFilterModel] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedSubmitBy, setSelectedSubmitBy] = useState<string[]>([]);
  const [selectedResolvedBy, setSelectedResolvedBy] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const [selectedType, setSelectedType] = useState<string | undefined>(
    undefined
  );

  // Sorting state
  const [sortColumn, setSortColumn] = useState<
    'title' | 'type' | 'status' | 'submittedBy' | 'date'
  >('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 50;

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryFn: () => getAllAppProjects(axiosAuth),
    queryKey: ['allProjects'],
  });
  const { data: users } = useQuery({
    queryKey: 'listofUsersForApp',
    queryFn: () => getAllOrgUsers(axiosAuth),
    refetchOnWindowFocus: false,
  });

  // Filter users to exclude roles 4 and 5 (show roles 1, 2, and all other roles)
  const filteredUsers = useMemo(() => {
    return (users ?? []).filter((user) => user.role !== 4 && user.role !== 5);
  }, [users]);

  // Check if user is Root User from session (role 3 = Organization Admin)
  const isRootUser = (session?.user as any)?.role === 3;

  // Check app-level permission (backend already checks global apps permission and returns adminMode: true if user has it)
  const { data: permissions } = useQuery('SHSettingPermission', () =>
    checkSHPermission(axiosAuth)
  );

  // User can use Admin Mode if Root User or has permission (which includes global apps permission)
  const canUseAdminMode = isRootUser || permissions?.adminMode === true;
  const handleDropdown = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? '' : dropdownId);
  };
  // Filter handling
  const clearFilters = () => {
    setSelectedProjects([]);
    setSelectedSubmitBy([]);
    setSelectedResolvedBy([]);
    setSelectedStatus(undefined);
    setSelectedType(undefined);
    setShowFilterModel(false);
    setApplyFilter(false);
  };

  const areFiltersApplied = () => {
    const validProjects = selectedProjects.filter((id) => id !== 'all');
    const validSubmitBy = selectedSubmitBy.filter((id) => id !== 'all');
    const validResolvedBy = selectedResolvedBy.filter((id) => id !== 'all');
    return (
      validProjects.length > 0 ||
      validSubmitBy.length > 0 ||
      validResolvedBy.length > 0 ||
      selectedStatus !== undefined ||
      selectedType !== undefined
    );
  };

  const handleApplyFilters = () => {
    setShowFilterModel(!showFilterModel);
    if (areFiltersApplied()) {
      setApplyFilter(true);
    }
  };
  const deleteMutation = useMutation(deleteLiveBoard, {
    onSuccess: () => {
      // Navigate back to Hazards & Incidents list
      dispatch({
        type: SAFETYHUBTYPE.SHOWPAGES,
        showPages: 'hazardsIncidents',
      });
    },
  });
  const { state, dispatch } = useSafetyHubContext();
  // view dorpdown function - topbar
  const handleToggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const router = useRouter();

  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
    setDropdownOpen(false);
  };
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const [adminMode, setAdminMode] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ['liveBoards', adminMode], // Include `adminMode` in queryKey
    queryFn: () => getLiveBoardList({ axiosAuth, isAdmin: adminMode }),
    enabled: true, // Always enabled
  });
  const handleGoBack = () => {
    dispatch({
      type: SAFETYHUBTYPE.SHOWPAGES,
      showPages: undefined,
    });
  };
  ////////======//////////
  const [selectedSubmissions, setCheckedSubmissions] = useState<LiveBoard[]>(
    []
  );
  const handleCancel = () => {
    setCheckedSubmissions([]);
    setIsSelectMode(false); // Exit select mode
  };
  const handleCheckboxChange = (js: LiveBoard) => {
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
  const [multiAction, setMultiAction] = useState<'delete' | 'resolution'>(
    'resolution'
  );

  const [selectedAction, setSelectedAction] = useState<
    'delete' | 'resolution' | undefined
  >(undefined);
  const [showMultiModel, setShowMultiModel] = useState(false);
  const createCommentMutation = useMutation(createJSAComment, {
    onSuccess: () => {
      // Comments are created, invalidate queries for each module
      const ids = modelForResolution
        ? [modelForResolution._id]
        : (selectedSubmissions?.map((item: any) => item._id) ?? []);
      ids.forEach((id) => {
        queryClient.invalidateQueries(`comment${id}`);
      });
    },
  });
  const updateMutation = useMutation(updateMultipleLiveBoard, {
    onSuccess: async (_, variables) => {
      // After successful update, create comments if comment text is provided
      const commentText = organizationForm.values.comment?.trim();
      if (commentText) {
        const ids = modelForResolution
          ? [modelForResolution._id]
          : (selectedSubmissions?.map((item: any) => item._id) ?? []);

        // Create comment for each hazard/incident
        const commentPromises = ids.map((id) =>
          createCommentMutation.mutateAsync({
            axiosAuth,
            data: {
              content: commentText,
              images: [],
              appId: state.appId,
              moduleId: id,
            },
          })
        );

        try {
          await Promise.all(commentPromises);
        } catch (error) {
          console.error('Failed to create comments:', error);
        }
      }

      handleCancel();
      setMultiAction('resolution');
      setResolutionModel(undefined);
      setSelectedAction(undefined);
      queryClient.invalidateQueries('liveBoards');
    },
  });
  const organizationForm = useFormik({
    initialValues: {
      comment: '',
      status: 'Unresolved',
    },

    onSubmit: (values) => {
      updateMutation.mutate({
        axiosAuth,
        data: {
          ids: modelForResolution
            ? [modelForResolution._id]
            : selectedSubmissions?.map((item: any) => item._id),
          status: values.status,
          comment: values.comment,
        },
      });
    },
  });
  ////////======//////////
  const filterData = useMemo(() => {
    return (data ?? [])
      .filter((p) => {
        // Filter by "View All" vs "My Submissions" dropdown
        if (selectedOption === 'My Submissions') {
          if (!session?.user?.user?._id || !p.submittedBy?._id) {
            return false;
          }
          if (p.submittedBy._id !== session.user.user._id) {
            return false;
          }
        }

        // Apply other filters if filter modal is used
        if (isApplyFilter) {
          // Filter by projects (exclude 'all' from selection)
          const validProjects = selectedProjects.filter((id) => id !== 'all');
          if (validProjects.length > 0) {
            const projectMatches = p.projects?.some((project) =>
              validProjects.includes(project._id)
            );
            if (!projectMatches) {
              return false;
            }
          }

          // Filter by submitted by (exclude 'all' from selection)
          const validSubmitBy = selectedSubmitBy.filter((id) => id !== 'all');
          if (validSubmitBy.length > 0) {
            if (
              !p.submittedBy?._id ||
              !validSubmitBy.includes(p.submittedBy._id)
            ) {
              return false;
            }
          }

          // Filter by status
          if (selectedStatus) {
            if (selectedStatus.toLowerCase() !== p.status.toLowerCase()) {
              return false;
            }
          }

          // Filter by type
          if (selectedType) {
            if (
              selectedType.toLowerCase() !== p.isHazardOrIncident.toLowerCase()
            ) {
              return false;
            }
          }
        }

        return true;
      })
      .filter((search) => {
        return search.title.toLowerCase().includes(searchQuery.toLowerCase());
      });
  }, [
    data,
    selectedOption,
    session?.user?.user?._id,
    isApplyFilter,
    selectedProjects,
    selectedSubmitBy,
    selectedStatus,
    selectedType,
    searchQuery,
  ]);

  // Sorting function
  const sortedData = useMemo(() => {
    return [...filterData].sort((a, b) => {
      let fieldA: any;
      let fieldB: any;

      switch (sortColumn) {
        case 'title':
          fieldA = a.title?.toLowerCase() ?? '';
          fieldB = b.title?.toLowerCase() ?? '';
          break;
        case 'type':
          fieldA = a.isHazardOrIncident?.toLowerCase() ?? '';
          fieldB = b.isHazardOrIncident?.toLowerCase() ?? '';
          break;
        case 'status':
          fieldA = a.status?.toLowerCase() ?? '';
          fieldB = b.status?.toLowerCase() ?? '';
          break;
        case 'submittedBy':
          fieldA =
            `${a.submittedBy?.firstName ?? ''} ${a.submittedBy?.lastName ?? ''}`.toLowerCase();
          fieldB =
            `${b.submittedBy?.firstName ?? ''} ${b.submittedBy?.lastName ?? ''}`.toLowerCase();
          break;
        case 'date':
        default:
          fieldA = new Date(a.createdAt ?? 0);
          fieldB = new Date(b.createdAt ?? 0);
          break;
      }

      if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filterData, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSort = (
    column: 'title' | 'type' | 'status' | 'submittedBy' | 'date'
  ) => {
    if (sortColumn === column) {
      // Toggle sort direction if the same column is clicked
      setSortDirection((prevDirection) =>
        prevDirection === 'asc' ? 'desc' : 'asc'
      );
    } else {
      // Change sort column and reset to descending for date, ascending for others
      setSortColumn(column);
      setSortDirection(column === 'date' ? 'desc' : 'asc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handleSelectAllChange = () => {
    if ((sortedData ?? []).length == (selectedSubmissions ?? []).length) {
      handleCancel();
    } else {
      setCheckedSubmissions([...(sortedData ?? [])]);
    }
  };

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedOption,
    isApplyFilter,
    selectedProjects,
    selectedSubmitBy,
    selectedResolvedBy,
    selectedStatus,
    selectedType,
    searchQuery,
  ]);

  const assetStatuses = Object.entries(HazardStatus).map(([key, value]) => ({
    label: value, // Label from Enum value
    value: value, // Key as unique identifier
  }));
  return (
    <>
      <div className="absolute inset-0 z-10 flex h-[calc(var(--app-vh)-70px)] w-full max-w-[1360px] flex-col bg-white px-4 pt-4 font-Open-Sans">
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
              <div className="flex items-center gap-2 text-2xl font-bold text-[#1E1E1E] sm:text-xl">
                <img
                  src="/svg/sh/logo.svg"
                  alt="show logo"
                  className="h-12 w-12"
                />
                <span className="text-sm sm:text-xl">Hazard & Incidents</span>
              </div>

              <div className="flex items-center">
                <div className="hidden md:flex">
                  {/* AdminSwitch */}
                  {canUseAdminMode && (
                    <div className="hidden md:flex">
                      <AdminSwitch
                        adminMode={adminMode}
                        setAdminMode={setAdminMode}
                      />
                    </div>
                  )}

                  {/* DropDown Custom | View All */}
                  <div className="DropDownn relative z-50 mx-3 inline-block text-left">
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
                        className="absolute left-0 z-50 mt-2 w-56 origin-top-left rounded-md bg-[#E2F3FF] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="options-menu"
                      >
                        <div className="py-1" role="none">
                          <button
                            onClick={() => handleSelectOption('View All')}
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            role="menuitem"
                          >
                            View All
                          </button>
                          <button
                            onClick={() => handleSelectOption('My Submissions')}
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            role="menuitem"
                          >
                            My Submissions
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-grow gap-4">
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
              <>
                <table className="mt-3 w-full border-collapse font-Open-Sans">
                  <thead className="bg-[#F5F5F5] text-left text-sm font-normal text-[#616161]">
                    <tr>
                      <th className="w-200 px-2 py-3">
                        <div
                          className="flex cursor-pointer items-center gap-1 font-normal text-[#1E1E1E]"
                          onClick={() => handleSort('title')}
                        >
                          Title
                          <img
                            src="/images/fluent_arrow-sort-24-regular.svg"
                            className="h-4 w-4"
                            alt="sort"
                          />
                        </div>
                      </th>
                      <th className="hidden px-2 py-3 font-normal text-[#1E1E1E] md:table-cell">
                        Type
                      </th>
                      <th className="px-4 py-3 font-normal text-[#1E1E1E]">
                        Status
                      </th>
                      <th className="hidden px-2 py-3 font-normal text-[#1E1E1E] md:table-cell">
                        Submitted By
                      </th>
                      <th className="hidden py-3 lg:table-cell">
                        <div
                          className="flex cursor-pointer items-center gap-1 font-normal text-[#1E1E1E]"
                          onClick={() => handleSort('date')}
                        >
                          Date & Time
                          <img
                            src="/images/fluent_arrow-sort-24-regular.svg"
                            className="h-4 w-4"
                            alt="sort"
                          />
                        </div>
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
                                  (sortedData ?? []).length ==
                                  (selectedSubmissions ?? []).length
                                    ? 'border-[#6990FF] bg-[#6990FF] checked:border-[#6990FF] checked:bg-[#6990FF]'
                                    : 'border-[#9E9E9E] bg-white'
                                } transition-colors duration-200 ease-in-out`}
                                onChange={handleSelectAllChange}
                              />
                              {(sortedData ?? []).length ==
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
                    {(paginatedData ?? []).map((item, index) => {
                      return (
                        <tr
                          key={item._id}
                          className="relative border-b even:bg-[#F5F5F5]"
                        >
                          <td
                            className="w-[300px] px-2 py-2 md:w-[500px]"
                            onClick={() => {
                              const token = generateSecureToken({
                                userId: item._id,
                                readonly: false,
                                expiresAt: Date.now() + 60 * 60 * 1000, // Expires in 1 hour
                              });
                              router.push(
                                `/user/apps/sh/${state.appId}/hazard/${item._id}?token=${token}&from=hazardsIncidents`
                              );
                            }}
                          >
                            <span className="cursor-pointer text-[#0063F7] hover:text-[#0052CC] hover:underline">
                              {item.title}
                            </span>
                          </td>
                          <td className="relative hidden px-2 py-2 text-primary-400 md:table-cell">
                            {checkLiveBoardType(item.isHazardOrIncident)}
                          </td>
                          <td className="px-4 py-2">
                            {checkLiveBoardStatus(item.status)}
                          </td>
                          <td className="hidden px-4 py-2 md:table-cell">
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
                                {session?.user.user._id ==
                                item.submittedBy._id ? (
                                  <>Me</>
                                ) : (
                                  <>{`${item.submittedBy.firstName} ${item.submittedBy.lastName}`}</>
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
                              <span>
                                {dateFormat(item.createdAt.toString())}
                              </span>

                              <span>
                                {timeFormat(item.createdAt.toString())}
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
                                        const token = generateSecureToken({
                                          userId: item._id,
                                          readonly: false,
                                          expiresAt:
                                            Date.now() + 60 * 60 * 1000, // Expires in 1 hour
                                        });
                                        router.push(
                                          `/user/apps/sh/${state.appId}/hazard/${item._id}?token=${token}&from=hazardsIncidents`
                                        );
                                      }}
                                    >
                                      View
                                    </DropdownItem>
                                    <DropdownItem
                                      key="resolution"
                                      onClick={() => {
                                        setResolutionModel(item);
                                        setSelectedAction('resolution');
                                      }}
                                    >
                                      Resolution
                                    </DropdownItem>
                                    <DropdownItem
                                      key="edit"
                                      isDisabled={
                                        item.submittedBy?._id !==
                                        session?.user?.user?._id
                                      }
                                      onClick={() => {
                                        if (
                                          item.submittedBy?._id ===
                                          session?.user?.user?._id
                                        ) {
                                          dispatch({
                                            type: SAFETYHUBTYPE.SHOW_HAZARD_INCIDENT_CREATE_MODEL,
                                            hazardAndIncidentModelForEdit: item,
                                          });
                                        }
                                      }}
                                    >
                                      Edit
                                    </DropdownItem>
                                    <DropdownItem
                                      key="delete"
                                      isDisabled={
                                        item.submittedBy?._id !==
                                        session?.user?.user?._id
                                      }
                                      onClick={() => {
                                        if (
                                          item.submittedBy?._id ===
                                          session?.user?.user?._id
                                        ) {
                                          setModel(item);
                                        }
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
                {/* todo add functionality later on */}
                <div className="absolute bottom-6 right-6 z-10">
                  <Button
                    variant="primaryRounded"
                    onClick={() => {
                      dispatch({
                        type: SAFETYHUBTYPE.SHOW_HAZARD_INCIDENT_CREATE_MODEL,
                      });
                    }}
                  >
                    {'+ Add'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="h-16">
          <div className="flex h-full items-center justify-between border-2 border-[#EEEEEE] p-2">
            <div className="text-sm font-normal text-[#616161]">
              Items per page: {itemsPerPage}
            </div>
            <div>
              {totalPages > 0 && (
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handlePageChange={handlePageChange}
                />
              )}
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
      {model && (
        <CustomInfoModal
          title={'Delete Hazard & Incident'}
          handleClose={() => setModel(undefined)}
          onDeleteButton={() => {
            deleteMutation.mutate({ axiosAuth, id: model._id ?? '' });
          }}
          doneValue={
            deleteMutation.isLoading ? (
              <>
                <Loader />
              </>
            ) : (
              <>Delete</>
            )
          }
          subtitle={
            'Are you sure you want to delete this Hazard & Incident. This action  cannot be undone.'
          }
        />
      )}
      {/* ////// multiple action sectin  */}
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
                    {'Bulk Edit Hazards & Incidents'}
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
                      checked={multiAction == 'resolution'}
                      onChange={() => setMultiAction('resolution')}
                      className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                    />
                    <span className="ml-2">Add Resolution</span>
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
                    setSelectedAction(multiAction);
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

      {selectedAction === 'delete' && (
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
            setMultiAction('resolution');
            setSelectedAction(undefined);
          }}
          onDeleteButton={() => {
            // Filter to only include items created by the current user
            const userCreatedItems = (selectedSubmissions ?? []).filter(
              (item: LiveBoard) =>
                item.submittedBy?._id === session?.user?.user?._id
            );

            if (userCreatedItems.length === 0) {
              return;
            }

            updateMutation.mutate({
              axiosAuth,
              data: {
                ids: userCreatedItems.map((item: LiveBoard) => item._id),
                deletedAt: new Date(),
              },
            });
          }}
          subtitle="Are you sure you want to delete this Hazard & Incident. This action cannot be undone."
          title={`Delete (${selectedSubmissions.length}) Hazards & Incidents`}
        />
      )}

      {selectedAction === 'resolution' && (
        <Modal
          isOpen={true}
          onOpenChange={() => {
            setSelectedAction(undefined), setResolutionModel(undefined);
          }}
          placement="top-center"
          size="xl"
        >
          <ModalContent className="max-w-[600px] rounded-3xl bg-white">
            {(onCloseModal) => (
              <>
                <ModalHeader className="flex flex-row items-start gap-2 px-5 py-5">
                  <svg
                    width="50"
                    height="50"
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                    <g clipPath="url(#clip0_3044_18585)">
                      <path
                        d="M24.9397 11.0362C23.1537 11.0264 21.4815 12.3323 20.2796 14.6781C20.2752 14.6867 20.2693 14.6934 20.2649 14.7019L12.5232 28.1475L12.5104 28.1676C11.084 30.411 10.7838 32.5263 11.6682 34.0799C12.5518 35.6326 14.5174 36.4311 17.1467 36.3011H32.6795C35.3096 36.4316 37.2759 35.6329 38.1598 34.08C39.0439 32.5267 38.7431 30.4123 37.3175 28.1694L37.3046 28.1474L29.6453 14.746C29.6418 14.739 29.6381 14.7328 29.6344 14.7258C28.407 12.3667 26.7267 11.046 24.9396 11.0362H24.9397ZM24.9432 12.1403C25.7387 12.1479 26.4932 12.5464 27.1771 13.2151C27.8572 13.88 28.4987 14.8237 29.1345 16.0478C29.1382 16.0549 29.1418 16.0609 29.1455 16.068L35.8967 27.8783C35.8986 27.8814 35.9001 27.8843 35.9021 27.8875L35.9094 27.9003C36.6664 29.0883 37.163 30.1304 37.3908 31.0625C37.6199 32.0006 37.5703 32.8583 37.1655 33.5473C36.7607 34.2364 36.0392 34.6918 35.1276 34.9481C34.2227 35.2024 33.1056 35.2795 31.7639 35.2117H18.064C16.6082 35.2854 15.4431 35.193 14.5246 34.9114C13.6 34.6278 12.9028 34.1234 12.5489 33.4062C12.1949 32.6892 12.2054 31.836 12.461 30.9197C12.7148 30.0094 13.2118 29.0091 13.9185 27.9003L13.9314 27.8783L20.7556 16.0313C20.7603 16.0221 20.7656 16.0149 20.7703 16.0056C21.3971 14.78 22.0305 13.8399 22.7075 13.1822C23.3897 12.5197 24.1478 12.1327 24.9432 12.1404L24.9432 12.1403ZM27.7356 15.7786L26.0639 28.9055H23.6121L21.9788 16.0606C21.894 16.215 21.8116 16.3707 21.7315 16.5276L21.7261 16.5404L21.7188 16.5531L14.8669 28.4459L14.8615 28.4569L14.8541 28.4678C14.1766 29.5281 13.7265 30.4586 13.5156 31.2144C13.3048 31.9702 13.3335 32.5223 13.5303 32.921C13.7271 33.3196 14.1118 33.6405 14.8469 33.8658C15.5818 34.0911 16.644 34.1908 18.0347 34.1185L18.0493 34.1166H31.7786L31.7933 34.1184C33.0735 34.1851 34.0965 34.102 34.8328 33.8951C35.5691 33.6881 35.9943 33.3779 36.2207 32.9924C36.4472 32.6068 36.5124 32.0815 36.327 31.3225C36.1414 30.5632 35.6981 29.6013 34.9738 28.4678L34.9664 28.4568L34.9591 28.444L28.1822 16.5916L28.1768 16.5824L28.1731 16.5714C28.0266 16.2885 27.8807 16.025 27.7354 15.7785L27.7356 15.7786ZM23.5516 30.2037H26.1243V32.7763H23.5516V30.2037Z"
                        fill="#0063F7"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_3044_18585">
                        <rect
                          width="30"
                          height="30"
                          fill="white"
                          transform="translate(10 9)"
                        />
                      </clipPath>
                    </defs>
                  </svg>

                  <div>
                    <h2 className="text-xl font-semibold text-[#1E1E1E]">
                      {'Hazard & Incident Resolution'}
                    </h2>
                    <span className="mt-1 text-base font-normal text-[#616161]">
                      {'Add or modify resolution details below.'}
                    </span>
                  </div>
                </ModalHeader>
                <ModalBody className="my-4">
                  <div className="mb-8 flex flex-col space-y-2 p-2">
                    <div className="relative mb-4 w-full">
                      <CustomSearchSelect
                        label="Status"
                        data={assetStatuses}
                        onSelect={(value, label) => {
                          if (typeof value === 'string') {
                            organizationForm.setFieldValue('status', value);
                          }
                        }}
                        returnSingleValueWithLabel={true}
                        selected={[organizationForm.values.status]}
                        hasError={false}
                        placeholder="- Select Status -"
                        showSearch={false}
                        isRequired
                        multiple={false}
                        showImage={false}
                        isOpen={openDropdown === 'dropdown7'}
                        onToggle={() => handleToggle('dropdown7')}
                      />
                    </div>
                    <label className="block" htmlFor="reasone">
                      <span className="text-sm text-[#1E1E1E]">Commnets</span>{' '}
                      (optional)
                    </label>
                    <textarea
                      rows={6}
                      id="comment"
                      name="comment"
                      placeholder="Add comments on this resolution"
                      value={organizationForm.values.comment}
                      className={` ${
                        organizationForm.errors.comment &&
                        organizationForm.touched.comment
                          ? 'border-red-500'
                          : 'border-[#EEEEEE]'
                      } w-full resize-none rounded-xl border-2 border-gray-300 p-2 shadow-sm`}
                      onChange={organizationForm.handleChange}
                    />
                  </div>
                </ModalBody>
                <ModalFooter className="border-t-2 border-gray-200">
                  <Button variant="primaryOutLine" onClick={onCloseModal}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!organizationForm.values.status}
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
              <ModalHeader className="flex flex-row items-center justify-between gap-2 border-b-2 border-gray-200 px-1 py-5">
                <div>
                  <h2 className="text-xl font-semibold">Filter By</h2>
                  <p className="mt-1 text-sm font-normal text-[#616161]">
                    Filter by the following selections and options.
                  </p>
                </div>
                <button
                  className="rounded-md p-1 outline-none hover:bg-gray-100"
                  onClick={onCloseModal}
                >
                  <X className="h-5 w-5" />
                </button>
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
                    isOpen={openDropdown === 'dropdown1'}
                    onToggle={() => handleDropdown('dropdown1')}
                    onSelect={(selected: string[]) =>
                      setSelectedProjects(selected)
                    }
                    placeholder="-"
                    selected={selectedProjects}
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
                      ...(filteredUsers ?? []).map((user) => ({
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
                <div className="w-full">
                  <CustomSearchSelect
                    label="Resolved By"
                    data={[
                      {
                        label: 'All',
                        value: 'all',
                      },
                      ...(filteredUsers ?? []).map((user) => ({
                        label: `${user.firstName} ${user.lastName}`,
                        value: user._id ?? '',
                      })),
                    ]}
                    showImage={false}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown3'}
                    onToggle={() => handleDropdown('dropdown3')}
                    onSelect={(selected: string[]) => {
                      setSelectedResolvedBy(selected);
                    }}
                    placeholder="-"
                    selected={selectedResolvedBy}
                  />
                </div>
                <h2 className="text-xl font-semibold">Type</h2>
                <div className="flex flex-col gap-2">
                  <div
                    className="flex cursor-pointer gap-2"
                    onClick={() =>
                      setSelectedType(
                        selectedType === 'Hazard' ? undefined : 'Hazard'
                      )
                    }
                  >
                    <div className="relative flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        name="type-hazard"
                        checked={selectedType === 'Hazard'}
                        readOnly
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
                    <span>Hazard</span>
                  </div>
                  <div
                    className="flex cursor-pointer gap-2"
                    onClick={() =>
                      setSelectedType(
                        selectedType === 'Incident' ? undefined : 'Incident'
                      )
                    }
                  >
                    <div className="relative flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        name="type-incident"
                        checked={selectedType === 'Incident'}
                        readOnly
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
                    <span>Incident</span>
                  </div>
                </div>
                <h2 className="text-xl font-semibold">Status</h2>
                <div className="flex flex-col gap-2">
                  <div
                    className="flex cursor-pointer gap-2"
                    onClick={() =>
                      setSelectedStatus(
                        selectedStatus === 'Under Review'
                          ? undefined
                          : 'Under Review'
                      )
                    }
                  >
                    <div className="relative flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        name="status-under-review"
                        checked={selectedStatus === 'Under Review'}
                        readOnly
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
                    <span>Under Review</span>
                  </div>
                  <div
                    className="flex cursor-pointer gap-2"
                    onClick={() =>
                      setSelectedStatus(
                        selectedStatus === 'Unresolved'
                          ? undefined
                          : 'Unresolved'
                      )
                    }
                  >
                    <div className="relative flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        name="status-unresolved"
                        checked={selectedStatus === 'Unresolved'}
                        readOnly
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
                    <span>Unresolved</span>
                  </div>
                  <div
                    className="flex cursor-pointer gap-2"
                    onClick={() =>
                      setSelectedStatus(
                        selectedStatus === 'Resolved' ? undefined : 'Resolved'
                      )
                    }
                  >
                    <div className="relative flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        name="status-resolved"
                        checked={selectedStatus === 'Resolved'}
                        readOnly
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
                    <span>Resolved</span>
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
