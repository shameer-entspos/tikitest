'use client';

import { AiFillStar, AiOutlineFieldTime } from 'react-icons/ai';
import { BsFillPersonFill } from 'react-icons/bs';
import { ProjectModal } from '@/components/ProjectModal';
import Select, { SingleValue } from 'react-select';
import { Dialog } from '@headlessui/react';
import { useReducer, useState } from 'react';
import {
  ProjectContext,
  ProjectContextProps,
  projectReducer,
  projectinitialState,
} from './context';
import { PROJECTACTIONTYPE } from '@/app/helpers/user/enums';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  getAllProjectList,
  getUserPermission,
  toggleFavoriteProject,
} from './api';

import { Button } from '@/components/Buttons';
import { AiOutlinePushpin } from 'react-icons/ai';
import { ProjectSideBar } from '@/components/ProjectSideBar';
import { useDisclosure } from '@nextui-org/react';
import Loader from '@/components/DottedLoader/loader';
import { useSession } from 'next-auth/react';
import { Search } from '@/components/Form/search';
import { FaAngleLeft, FaAngleRight, FaStar } from 'react-icons/fa';
import { Plus, X } from 'lucide-react';
import { FaFilter, FaList } from 'react-icons/fa';
import { BsGrid3X3GapFill } from 'react-icons/bs';
import CustomHr from '@/components/Ui/CustomHr';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import FilterButton from '@/components/TimeSheetApp/CommonComponents/FilterButton/FilterButton';
import { getAllOrgUsers } from '../apps/api';
import { SimpleInput } from '@/components/Form/simpleInput';
import { ChipDropDown } from '@/components/ChipDropDown';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDateTimeWithLabels } from '@/utils';
import { customSortFunction } from '@/app/helpers/re-use-func';
import { AppDispatch, RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { handleSorting } from '@/store/taskSlice';

import { isWithinRange } from '@/components/Asset_Manager_App/04_ManageAssets/ManageAssetsScreen';
import CustomModal from '@/components/Custom_Modal';
import { SpinnerLoader } from '@/components/SpinnerLoader';
import DateRangePicker from '@/components/JobSafetyAnalysis/CreateNewComponents/JSA_Calender';
import AdminSwitch from '@/components/AdminSwitch/AdminSwitch';

const borderColors = [
  'border-pink-700/80',
  'border-gray-700/80',
  'border-green-700/80',
  'border-orange-700/80',
  'border-purple-700/80',
];

const Projects = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const [showFilter, setShowFilter] = useState<boolean>(false);
  // pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const projectsPerPage = 20;

  function getProjectDueDays(arg0: string): any {
    if (arg0) {
      var date1 = new Date(Date.now());
      var date2 = new Date(arg0);
      var diff = Math.abs(date1.getTime() - date2.getTime());
      var diffDays = Math.ceil(diff / (1000 * 3600 * 24));

      return diffDays;
    }
    return '0';
  }
  const [state, dispatch] = useReducer(projectReducer, projectinitialState);
  const contextValue: ProjectContextProps = {
    state,
    dispatch,
  };
  const [ownership, setOwnerShipFilter] = useState<
    SingleValue<{ label: string; value: string }>
  >({ value: 'all', label: 'All' });
  // set here filter values
  const [filterValue, setFilterValue] = useState<
    | {
        status: 'all' | 'open' | 'close';
        name: string; // Use lowercase `string`
        projectId: string; // Use lowercase `string`
        ref: string; // Use lowercase `string`
        customerId: string[]; // Specify the array type
        projectVisibility: 'all' | 'private' | 'public';
        date: { from: Date; to: Date } | undefined;
        createdByUser: string[];
      }
    | undefined
  >(undefined);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'close'>(
    'all'
  );
  const [filterCustomer, setFilterCustomer] = useState(['all']);
  const [filterCreatedByUser, setFilterCreatedByUser] = useState(['all']);

  const [filterName, setFilterName] = useState('');
  const [filterID, setFilterID] = useState('');
  const [filterReference, setFilterReference] = useState('');
  const [filterVisibility, setFilterVisibility] = useState<
    'all' | 'public' | 'private'
  >('all');
  const [filterDueDateRange, setDueDateRange] = useState<
    { from: Date; to: Date } | undefined
  >(undefined);

  //////
  const [show, setShow] = useState<'grid' | 'list'>('grid');
  const [searchIndividual, setSearchIndividual] = useState('');
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const axiosAuth = useAxiosAuth();
  const { onOpenChange } = useDisclosure();

  /// open and close dropdown
  const [isOpen, setIsOpen] = useState(false);
  const handleToggleTopBar = () => {
    setIsOpen(!isOpen);
  };
  const [selected, setSelected] = useState('Open');

  const [selectedFavorite, setFavoriteSelected] = useState('Upcoming Due');

  const { data: session } = useSession();
  const { data: users, isLoading: userLoading } = useQuery({
    queryKey: 'allUsers',
    queryFn: () => getAllOrgUsers(axiosAuth),
  });
  const [adminMode, setAdminMode] = useState(false);

  // Check if user is Root User from session (role 3 = Organization Admin)
  const isRootUser = (session?.user as any)?.role === 3;

  const { data: hasProjectManagePermission } = useQuery({
    queryKey: 'userPermission',
    queryFn: () => getUserPermission(axiosAuth),
    refetchOnWindowFocus: false,
  });

  // Check if user has permission to see Admin Mode toggle
  // Root User (role 3) always has access, or user's team has permission
  const canUseAdminMode =
    isRootUser || hasProjectManagePermission?.projects || false;

  const { data, isLoading } = useQuery({
    queryKey: ['projects', adminMode],
    queryFn: () => getAllProjectList({ axiosAuth, isAdmin: adminMode }),
    enabled: true,
  });

  const queryClient = useQueryClient();
  const toggleProjectMutation = useMutation(toggleFavoriteProject, {
    onSuccess: () => {
      queryClient.invalidateQueries('projects');
    },
  });
  const reduxDispatch = useDispatch<AppDispatch>();
  const sortDate = useSelector((state: RootState) => state.task.sortDate);
  const sortName = useSelector((state: RootState) => state.task.sortName);
  const sortType = useSelector((state: RootState) => state.task.sortType);
  const handleSortChange = (sortType: 'text' | 'date') => {
    // make previous comment in one call
    reduxDispatch(
      handleSorting({
        sortType: sortType,
        sortName: sortName == 'desc' && sortType == 'text' ? 'asc' : 'desc',
        sortDate: sortDate == 'desc' && sortType == 'date' ? 'asc' : 'desc',
      })
    );
  };
  const router = useRouter();
  if (isLoading) {
    return <SpinnerLoader />;
  }
  const filterProjects = (data?.projects ?? [])
    .filter((e) =>
      `${e?.name}`.toLowerCase().includes(searchIndividual.toLowerCase())
    )

    .filter((p) => {
      if (filterValue) {
        if (
          filterDueDateRange &&
          !isWithinRange(new Date(p.date ?? ''), filterDueDateRange)
        )
          return false;

        if (filterValue.status === 'all') {
          return p;
        }
        if (filterValue.status === 'open') {
          return new Date(p.date ?? new Date()) >= new Date();
        }
        if (filterValue.status === 'close') {
          return new Date(p.date ?? new Date()) < new Date();
        }
      } else {
        return p;
      }
    })
    .filter((p) => {
      if (filterValue) {
        if (filterValue.projectId?.trim() != '') {
          return (
            p.projectId
              ?.toLowerCase()
              .includes((filterValue.projectId ?? '').toLowerCase()) ?? false
          );
        } else {
          return p;
        }
      } else {
        return p;
      }
    })
    .filter((p) => {
      if (filterValue) {
        if (filterValue.name?.trim() != '') {
          return (
            p.name
              ?.toLowerCase()
              .includes((filterValue.name ?? '').toLowerCase()) ?? false
          );
        } else {
          return p;
        }
      } else {
        return p;
      }
    })
    .filter((p) => {
      if (filterValue) {
        if (filterValue.projectVisibility === 'all') {
          return p;
        }
        if (filterValue.projectVisibility === 'public') {
          return p.projectType === 'public';
        }
        if (filterValue.projectVisibility === 'private') {
          return p.projectType === 'private';
        }
        return p;
      } else {
        return p;
      }
    })
    .filter((p) => {
      if (filterValue) {
        if ((filterValue.customerId ?? []).length > 0) {
          if (filterValue.customerId.includes('all')) {
            return p;
          } else {
            return (filterValue.customerId ?? []).some((id) => {
              return p.customer === id;
            });
          }
        } else {
          return p;
        }
      } else {
        return p;
      }
    })
    .filter((p) => {
      if (filterValue) {
        if ((filterValue.createdByUser ?? []).length > 0) {
          if (filterValue.createdByUser.includes('all')) {
            return p;
          } else {
            return (filterValue.createdByUser ?? []).some((id) => {
              return p.userId._id === id;
            });
          }
        } else {
          return p;
        }
      } else {
        return p;
      }
    })
    .filter((p) => {
      if (selected === 'Open') {
        return p.isOpen;
      }
      if (selected === 'Close') {
        return !p.isOpen;
      }
      return p;
    })
    .filter((p) => {
      if (show == 'grid') {
        if (selectedFavorite === 'Favorite') {
          return p.isFavorited || p.isGeneral;
        } else {
          return p;
        }
      } else {
        return p;
      }
    })

    .sort((a, b) => {
      if (show == 'grid') {
        if (selectedFavorite === 'A-Z') {
          return (a.name ?? '').localeCompare(b.name ?? '');
        }
        if (selectedFavorite === 'Z-A') {
          return (b.name ?? '').localeCompare(a.name ?? '');
        }
      } else if (show == 'list') {
        if (sortType === 'text') {
          return customSortFunction({
            a: a.name,
            b: b.name,
            sortBy: sortName,
            type: 'text',
          });
        } else {
          return customSortFunction({
            a: a.createdAt.toString(),
            b: b.createdAt.toString(),
            sortBy: sortDate,
            type: 'date',
          });
        }
      }
      return 0;
    });

  const totalPages = Math.ceil(filterProjects.length / projectsPerPage);
  const paginatedProjects = filterProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      <>
        <div className="mx-auto w-full max-w-[1360px]">
          {state.showProjectModal && <ProjectModal />}
          <section>
            <section className="relative h-[calc(var(--app-vh)_-_144px)] flex-grow space-y-4 overflow-y-auto px-4 scrollbar-hide md:px-6 lg:px-10">
              {/* first row  */}
              <div className="sticky top-0 z-10 w-full bg-white pt-5 backdrop-blur-md">
                <div className="page-heading-edit flex flex-wrap items-center justify-between md:flex-nowrap">
                  <h1 className="flex items-center gap-4 text-xl font-bold leading-7 text-[#1E1E1E] md:text-2xl">
                    <svg
                      width="58"
                      height="58"
                      viewBox="0 0 58 58"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g filter="url(#filter0_d_3349_73004)">
                        <rect
                          x="4"
                          y="4"
                          width="50"
                          height="50"
                          rx="8"
                          fill="#E2F3FF"
                        />
                      </g>
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M12.4502 18.7633C12.3335 19.3766 12.3335 20.1133 12.3335 21.5833V33.3333C12.3335 39.6183 12.3335 42.7616 14.2868 44.7132C16.2402 46.6649 19.3818 46.6666 25.6668 46.6666H32.3335C38.6185 46.6666 41.7618 46.6666 43.7135 44.7132C45.6652 42.7599 45.6668 39.6183 45.6668 33.3333V29.6633C45.6668 25.2766 45.6668 23.0816 44.3835 21.6566C44.2658 21.5251 44.1411 21.3999 44.0102 21.2816C42.5852 19.9999 40.3902 19.9999 36.0035 19.9999H35.3802C33.4585 19.9999 32.4968 19.9999 31.6002 19.7449C31.1081 19.6043 30.6339 19.4074 30.1868 19.1583C29.3735 18.7066 28.6935 18.0249 27.3335 16.6666L26.4168 15.7499C25.9602 15.2933 25.7335 15.0666 25.4935 14.8666C24.4613 14.011 23.1951 13.4865 21.8602 13.3616C21.5502 13.3333 21.2268 13.3333 20.5835 13.3333C19.1118 13.3333 18.3768 13.3333 17.7635 13.4499C16.4466 13.6986 15.2352 14.3385 14.2873 15.286C13.3395 16.2335 12.6993 17.4464 12.4502 18.7633ZM29.4168 26.6666C29.4168 26.3351 29.5485 26.0171 29.7829 25.7827C30.0174 25.5483 30.3353 25.4166 30.6668 25.4166H39.0002C39.3317 25.4166 39.6496 25.5483 39.884 25.7827C40.1185 26.0171 40.2502 26.3351 40.2502 26.6666C40.2502 26.9981 40.1185 27.316 39.884 27.5505C39.6496 27.7849 39.3317 27.9166 39.0002 27.9166H30.6668C30.3353 27.9166 30.0174 27.7849 29.7829 27.5505C29.5485 27.316 29.4168 26.9981 29.4168 26.6666Z"
                        fill="#0063F7"
                      />
                      <defs>
                        <filter
                          id="filter0_d_3349_73004"
                          x="0"
                          y="0"
                          width="58"
                          height="58"
                          filterUnits="userSpaceOnUse"
                          color-interpolation-filters="sRGB"
                        >
                          <feFlood
                            flood-opacity="0"
                            result="BackgroundImageFix"
                          />
                          <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                          />
                          <feOffset />
                          <feGaussianBlur stdDeviation="2" />
                          <feComposite in2="hardAlpha" operator="out" />
                          <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                          />
                          <feBlend
                            mode="normal"
                            in2="BackgroundImageFix"
                            result="effect1_dropShadow_3349_73004"
                          />
                          <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="effect1_dropShadow_3349_73004"
                            result="shape"
                          />
                        </filter>
                      </defs>
                    </svg>
                    Projects
                  </h1>

                  <div className="team-actice flex flex-col items-center justify-between gap-2 sm:flex-row">
                    <div className="flex items-center gap-2">
                      {/* Admin Mode Toggle - Only show if user has permission */}
                      {canUseAdminMode && (
                        <AdminSwitch
                          adminMode={adminMode}
                          setAdminMode={setAdminMode}
                        />
                      )}
                      {show == 'list' && (
                        <ChipDropDown
                          options={['Open', 'Close']}
                          selectedValue={selected}
                          bgColor={`${true ? 'bg-[#97F1BB]' : 'bg-[#97F1BB]'}`}
                          onChange={(value) => {
                            setSelected(value);
                          }}
                        />
                      )}
                      {/* view button */}
                      <div className="flex h-[44px] items-center gap-4 rounded-md bg-white px-3">
                        {/* grid icon */}
                        <button
                          onClick={() => setShow('grid')}
                          className={`${
                            show === 'grid'
                              ? 'text-primary-500'
                              : 'text-gray-700'
                          } text-2xl`}
                        >
                          <BsGrid3X3GapFill />
                        </button>

                        {/*list second icon */}
                        <button
                          onClick={() => setShow('list')}
                          className={`${
                            show === 'list'
                              ? 'text-primary-500'
                              : 'text-gray-700'
                          } text-2xl`}
                        >
                          <FaList />
                        </button>
                      </div>

                      {/* filter button */}
                      <div className="flex flex-grow gap-4">
                        <FilterButton
                          isApplyFilter={filterValue !== undefined}
                          setShowModel={setFilterOpen}
                          showModel={filterOpen}
                          setOpenDropdown={() => {
                            setOpenDropdown(null);
                          }}
                          clearFilters={() => {
                            setFilterName('');
                            setFilterID('');
                            setFilterReference('');
                            setFilterCustomer([]);
                            setFilterVisibility('all');
                            setFilterStatus('all');
                            setFilterValue(undefined);
                          }}
                        />
                      </div>
                    </div>

                    <div className="tema-heading hidden" />

                    {/* search bar */}
                    <div className="hidden sm:block">
                      <Search
                        className="h-[44px] min-w-[241px] bg-[#EEEEEE] placeholder:text-[#616161]"
                        key={'search'}
                        inputRounded={true}
                        type="text"
                        name="search"
                        onChange={(e) => setSearchIndividual(e.target.value)}
                        placeholder="Search Projects"
                      />
                    </div>
                  </div>
                </div>
                {/* search bar on mobile screen */}
                <div className="mt-4 block sm:hidden">
                  <Search
                    className="h-[44px] min-w-[241px] bg-[#EEEEEE] placeholder:text-[#616161]"
                    key={'search'}
                    inputRounded={true}
                    type="text"
                    name="search"
                    onChange={(e) => setSearchIndividual(e.target.value)}
                    placeholder="Search Projects"
                  />
                </div>
              </div>
              {/* second row  */}
              {showFilter && (
                <>
                  <div className="flex flex-wrap items-end justify-between gap-3 py-2 md:flex-nowrap">
                    <div className="flex w-full flex-col gap-3 sm:flex-row md:w-4/5">
                      <div className="w-full space-y-2 md:w-1/2">
                        <label
                          className="mt-0 block text-base font-normal leading-[21.97px] text-[#000000]"
                          htmlFor=":r1:"
                        >
                          Ownership
                        </label>
                        <div className="">
                          <Select
                            value={ownership}
                            onChange={setOwnerShipFilter}
                            options={[{ value: 'all', label: 'All' }]}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex h-max w-full items-center gap-3 md:w-1/5 md:justify-center">
                      <button
                        className="flex cursor-pointer items-center font-semibold text-[#0063F7]"
                        onClick={() => {
                          setOwnerShipFilter({ value: 'all', label: 'All' });
                        }}
                      >
                        Reset All
                      </button>
                      <Button variant="secondary" onClick={() => {}}>
                        Apply
                      </Button>
                    </div>
                  </div>
                  <CustomHr />
                </>
              )}
              {show == 'grid' && (
                <>
                  {(data?.projects ?? []).filter((project) => {
                    return new Date(project.date ?? 0) >= new Date();
                  }).length > 0 && (
                    <div className="py-4">
                      <h1 className="flex items-center gap-2 text-xl font-semibold leading-7 text-[#000000]">
                        Recently Viewed
                      </h1>
                    </div>
                  )}

                  <div
                    className={`${
                      show === 'grid'
                        ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                        : 'grid-cols-1'
                    } mt-6 grid gap-6`}
                  >
                    {(data?.projects ?? [])
                      .filter((project) => {
                        return new Date(project.date ?? 0) >= new Date();
                      })
                      .map((v, index) => (
                        <div
                          className={`max-h-[180px] max-w-full ${
                            show === 'grid' ? 'h-auto' : 'h-auto w-[300px]'
                          } cursor-pointer`}
                          key={v._id}
                        >
                          <a
                            href={`/user/projects/${v._id}${adminMode ? '?adminMode=true' : ''}`}
                          >
                            <div
                              className={`shadow-m rounded-2xl border-t-[18px] bg-white px-4 py-3`}
                              style={{
                                borderColor: `${v.color?.toString()}`,
                              }}
                            >
                              <div
                                className="flex items-start justify-between gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="min-w-0 flex-1 text-left">
                                  <h2
                                    className="w-full truncate text-base font-semibold capitalize text-black"
                                    title={v.name ?? ''}
                                  >
                                    {v.name}
                                  </h2>
                                </div>
                                <div
                                  className="text-right"
                                  onClick={() => {
                                    toggleProjectMutation.mutate({
                                      axiosAuth,
                                      id: v._id!,
                                    });
                                  }}
                                >
                                  <FaStar
                                    className={`text-2xl ${v.isFavorited ? 'text-primary-500' : 'text-gray-400'}`}
                                  />
                                </div>
                              </div>
                              <p
                                className={
                                  'mt-1 line-clamp-1 w-full text-xs font-bold text-[#616161]'
                                }
                              >
                                {v.userId.organization?.name}
                              </p>
                              <div className="w-full">
                                <p
                                  className={
                                    'mt-1 line-clamp-1 w-full text-sm text-[#616161]'
                                  }
                                >
                                  Reference : {v.reference}
                                </p>

                                <p className="mt-1 line-clamp-1 w-full truncate text-xs text-[#616161]">
                                  {v.description}
                                </p>
                              </div>

                              <div className="mr-1 mt-1 flex items-center justify-between pt-5">
                                <div className="flex items-center gap-1 text-left text-[14px] text-[#616161]">
                                  <svg
                                    width="21"
                                    height="18"
                                    className=" "
                                    viewBox="0 0 18 18"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <g clipPath="url(#clip0_2089_2070)">
                                      <path
                                        d="M12.75 2.50492C13.8812 3.15806 14.8222 4.09531 15.4799 5.22389C16.1375 6.35248 16.489 7.63325 16.4996 8.93942C16.5101 10.2456 16.1794 11.5319 15.54 12.6709C14.9007 13.81 13.9749 14.7623 12.8544 15.4337C11.7339 16.105 10.4575 16.472 9.15157 16.4985C7.84562 16.5249 6.55541 16.2098 5.40867 15.5844C4.26192 14.9589 3.2984 14.0448 2.6135 12.9326C1.9286 11.8203 1.54606 10.5485 1.50375 9.24292L1.5 8.99992L1.50375 8.75692C1.54575 7.46166 1.92266 6.19939 2.59773 5.09316C3.2728 3.98694 4.22299 3.07451 5.35567 2.44483C6.48835 1.81515 7.76486 1.48972 9.06075 1.50025C10.3566 1.51078 11.6277 1.85692 12.75 2.50492ZM9 4.49992C8.8163 4.49994 8.639 4.56739 8.50172 4.68946C8.36444 4.81153 8.27674 4.97973 8.25525 5.16217L8.25 5.24992V8.99992L8.25675 9.09817C8.27385 9.22829 8.3248 9.35165 8.4045 9.45592L8.46975 9.53092L10.7198 11.7809L10.7902 11.8424C10.9218 11.9445 11.0835 11.9999 11.25 11.9999C11.4165 11.9999 11.5782 11.9445 11.7098 11.8424L11.7802 11.7802L11.8425 11.7097C11.9445 11.5781 11.9999 11.4164 11.9999 11.2499C11.9999 11.0834 11.9445 10.9217 11.8425 10.7902L11.7802 10.7197L9.75 8.68867V5.24992L9.74475 5.16217C9.72326 4.97973 9.63556 4.81153 9.49828 4.68946C9.361 4.56739 9.1837 4.49994 9 4.49992Z"
                                        fill="#616161"
                                      />
                                    </g>
                                    <defs>
                                      <clipPath id="clip0_2089_2070">
                                        <rect
                                          width="18"
                                          height="18"
                                          fill="white"
                                        />
                                      </clipPath>
                                    </defs>
                                  </svg>

                                  <h1 className="text-[14px]">
                                    {/* {getProjectDueDays(v.date!)}  */}~ Days
                                  </h1>
                                </div>
                                <div className="flex items-center gap-1 text-right text-[14px] text-[#616161]">
                                  <BsFillPersonFill className="mr-1 mt-1 h-[18px] w-[21px]" />{' '}
                                  <h1 className="text-[14px]">
                                    {v.projectType}
                                  </h1>
                                </div>
                              </div>
                            </div>
                          </a>
                        </div>
                      ))}
                  </div>
                </>
              )}
              {show === 'grid' && (
                <div className="flex items-center py-4">
                  <h1 className="mr-6 flex items-center gap-2 text-xl font-semibold leading-7 text-[#000000]">
                    View All
                  </h1>
                  <ChipDropDown
                    options={['Favorite', 'Upcoming Due', 'A-Z', 'Z-A']}
                    selectedValue={selectedFavorite}
                    bgColor={`bg-[#E2F3FF]`}
                    onChange={(value) => {
                      setFavoriteSelected(value);
                    }}
                  />
                  <ChipDropDown
                    options={['Open', 'Close']}
                    selectedValue={selected}
                    bgColor={
                      selected === 'Open' ? 'bg-[#97F1BB]' : 'bg-red-400'
                    }
                    onChange={(value) => {
                      setSelected(value);
                    }}
                  />
                </div>
              )}
              {/* all projects */}
              <div className="scroll-bar w-full overflow-auto">
                <div
                  className={`${
                    show === 'grid'
                      ? 'grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                      : 'w-[800px] grid-cols-1 sm:w-full'
                  } grid`}
                >
                  {/* table header */}
                  {show === 'list' && (
                    <div className="grid grid-cols-7 rounded-lg border-b border-gray-400 bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700">
                      <div className="cols-span-1 flex gap-1 text-sm font-semibold text-[#616161]">
                        Project ID
                        {/* <img
                          src="/sort-icon.svg"
                          alt=""
                          className="cursor-pointer"
                          onClick={() => {}}
                        /> */}
                      </div>
                      <div className="col-span-2 flex gap-1 text-sm font-semibold text-[#616161]">
                        Project Name
                        <img
                          src="/sort-icon.svg"
                          alt=""
                          className="cursor-pointer"
                          onClick={() => {
                            handleSortChange('text');
                          }}
                        />
                      </div>
                      <div className="cols-span-1">Reference</div>
                      <div className="cols-span-2">Customer</div>
                      <div className="cols-span-1 text-center">Status</div>
                      <div className="cols-span-1 flex justify-center gap-1 text-sm font-semibold text-[#616161]">
                        Due Date
                        <img
                          src="/sort-icon.svg"
                          alt=""
                          className="cursor-pointer"
                          onClick={() => {
                            handleSortChange('date');
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {(paginatedProjects ?? []).map((v, index) => {
                    return (
                      <Link
                        href={`/user/projects/${v._id}${adminMode ? '?adminMode=true' : ''}`}
                        key={v._id}
                      >
                        <div>
                          {show === 'grid' ? (
                            <div
                              className={`shadow-m mb-1 max-h-[180px] max-w-full rounded-2xl border-t-[18px] bg-white px-4 py-3 ${
                                show === 'grid' ? 'h-auto' : 'h-auto w-[300px]'
                              } cursor-pointer`}
                              style={{
                                borderColor: `${v.color?.toString()}`,
                              }}
                            >
                              <div
                                className="flex items-start justify-between gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="min-w-0 flex-1 text-left">
                                  <h2
                                    className="w-full truncate text-base font-semibold capitalize text-black"
                                    title={v.name ?? ''}
                                  >
                                    {v.name}
                                  </h2>
                                </div>
                                <div
                                  className="text-right"
                                  onClick={() => {
                                    if (!v.isGeneral) {
                                      toggleProjectMutation.mutate({
                                        axiosAuth,
                                        id: v._id!,
                                      });
                                    }
                                  }}
                                >
                                  <FaStar
                                    className={`text-2xl ${v.isFavorited || v.isGeneral ? 'text-primary-500' : 'text-gray-400'} ${v.isGeneral && `cursor-not-allowed`}`}
                                  />
                                </div>
                              </div>
                              <p
                                className={
                                  'mt-1 line-clamp-1 w-full text-xs font-bold text-[#616161]'
                                }
                              >
                                {v.userId.organization?.name}
                              </p>
                              <p
                                className={
                                  'mt-1 line-clamp-1 w-full text-sm text-[#616161]'
                                }
                              >
                                Reference : {v.reference}
                              </p>
                              <p
                                className={
                                  'line-clamp-1 inline-block w-full truncate whitespace-nowrap text-xs text-[#616161]'
                                }
                              >
                                {v.description}
                              </p>

                              <div className="mr-1 flex items-center justify-between pt-2">
                                <div className="flex items-center gap-1 text-left text-[14px] text-[#616161]">
                                  <svg
                                    width="21"
                                    height="18"
                                    className=" "
                                    viewBox="0 0 18 18"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <g clipPath="url(#clip0_2089_2070)">
                                      <path
                                        d="M12.75 2.50492C13.8812 3.15806 14.8222 4.09531 15.4799 5.22389C16.1375 6.35248 16.489 7.63325 16.4996 8.93942C16.5101 10.2456 16.1794 11.5319 15.54 12.6709C14.9007 13.81 13.9749 14.7623 12.8544 15.4337C11.7339 16.105 10.4575 16.472 9.15157 16.4985C7.84562 16.5249 6.55541 16.2098 5.40867 15.5844C4.26192 14.9589 3.2984 14.0448 2.6135 12.9326C1.9286 11.8203 1.54606 10.5485 1.50375 9.24292L1.5 8.99992L1.50375 8.75692C1.54575 7.46166 1.92266 6.19939 2.59773 5.09316C3.2728 3.98694 4.22299 3.07451 5.35567 2.44483C6.48835 1.81515 7.76486 1.48972 9.06075 1.50025C10.3566 1.51078 11.6277 1.85692 12.75 2.50492ZM9 4.49992C8.8163 4.49994 8.639 4.56739 8.50172 4.68946C8.36444 4.81153 8.27674 4.97973 8.25525 5.16217L8.25 5.24992V8.99992L8.25675 9.09817C8.27385 9.22829 8.3248 9.35165 8.4045 9.45592L8.46975 9.53092L10.7198 11.7809L10.7902 11.8424C10.9218 11.9445 11.0835 11.9999 11.25 11.9999C11.4165 11.9999 11.5782 11.9445 11.7098 11.8424L11.7802 11.7802L11.8425 11.7097C11.9445 11.5781 11.9999 11.4164 11.9999 11.2499C11.9999 11.0834 11.9445 10.9217 11.8425 10.7902L11.7802 10.7197L9.75 8.68867V5.24992L9.74475 5.16217C9.72326 4.97973 9.63556 4.81153 9.49828 4.68946C9.361 4.56739 9.1837 4.49994 9 4.49992Z"
                                        fill="#616161"
                                      />
                                    </g>
                                    <defs>
                                      <clipPath id="clip0_2089_2070">
                                        <rect
                                          width="18"
                                          height="18"
                                          fill="white"
                                        />
                                      </clipPath>
                                    </defs>
                                  </svg>

                                  <h1 className="text-[14px]">
                                    {v.date!
                                      ? getProjectDueDays(v.date!) + ' Days'
                                      : '~'}{' '}
                                  </h1>
                                </div>
                                <div className="flex items-center gap-1 text-right text-[14px] text-[#616161]">
                                  <h1 className="text-[14px]">
                                    {(v.users ?? []).length}
                                  </h1>
                                  <BsFillPersonFill className="mr-1 mt-1 h-[18px] w-[21px]" />{' '}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div
                              key={index}
                              className={`grid w-full cursor-pointer grid-cols-7 items-center rounded-l-lg border-b-2 border-l-[8px] border-b-[#BDBDBD] px-4 py-2 ${
                                index % 2 == 0 ? 'bg-white' : 'bg-[#F5F5F5]'
                              }`}
                              style={{
                                borderLeftColor: `${v.color?.toString()}`,
                              }}
                            >
                              {/* Project ID */}
                              <div className="col-span-1 truncate text-sm font-medium text-gray-800 md:text-base">
                                {v.projectId}
                              </div>

                              {/* Project Name */}
                              <div className="col-span-2 truncate pr-3 text-sm capitalize text-gray-800 md:text-base">
                                {v.name}
                              </div>

                              {/* Reference */}
                              <div className="cols-span-1 truncate text-sm text-gray-600 md:text-base">
                                {v.reference || '-'}
                              </div>

                              {/* Customer */}
                              <div className="cols-span-2 flex items-center gap-2 truncate text-sm text-gray-700">
                                <img src="/user.svg" alt="" />
                                {v.customer}
                              </div>

                              {/* Status */}
                              <div className="cols-span-1 flex justify-center">
                                <span
                                  className={`rounded-md bg-[#97F1BB] px-3 py-1 text-sm text-[#1E1E1E]`}
                                >
                                  {v.isOpen ? 'Open' : 'Closed'}
                                </span>
                              </div>

                              {/* Due Date */}
                              <div className="text-center text-sm text-gray-500 md:text-base">
                                {v.date ? (
                                  <>{`${formatDateTimeWithLabels(v.date ?? '').date}`}</>
                                ) : (
                                  '~'
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
            <div className="fixed bottom-40 left-1/2 z-10 mx-auto w-full max-w-[1360px] -translate-x-1/2 transform">
              <div className="flex justify-end">
                <Button
                  variant="primaryRounded"
                  onClick={() => {
                    dispatch({
                      type: PROJECTACTIONTYPE.TOGGLE,
                      currentSection: 'details',
                    });
                  }}
                >
                  {'+ New Project'}
                </Button>
              </div>
            </div>
            {/* footer */}
            {/* projects pagination */}
            <div className="flex h-[72px] w-full items-center justify-between space-x-4 rounded-t-xl border-2 border-gray-300 border-b-transparent bg-white px-4">
              <span className="text-sm text-gray-700 md:w-1/3">
                Items per page: {projectsPerPage}
              </span>
              <div className="flex items-center justify-center space-x-2 md:w-1/3">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-md px-2 py-1 text-lg text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaAngleLeft />
                </button>

                {/* Current Page */}
                <div className="rounded-lg border border-gray-700 px-3 py-1 text-gray-700">
                  {currentPage}
                </div>

                {/* Total Pages */}
                <span className="text-sm text-gray-700">of {totalPages}</span>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-md px-2 py-1 text-lg text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaAngleRight />
                </button>
              </div>
              <div className="hidden w-1/3 md:block" />
            </div>

            {/* filter dialog */}
            <CustomModal
              isOpen={filterOpen}
              header={
                <div className="flex flex-col gap-3">
                  <h2 className="text-lg font-medium leading-7 text-[#1E1E1E] lg:text-xl">
                    Filter By
                  </h2>
                  <span className="text-sm text-[#616161]">
                    Filter by the following selections and options.
                  </span>
                </div>
              }
              handleCancel={() => {
                setFilterName('');
                setFilterID('');
                setFilterReference('');
                setFilterCustomer(['all']);
                setFilterVisibility('all');
                setFilterStatus('all');
                setFilterCreatedByUser(['all']);
                setDueDateRange(undefined);
                setFilterValue(undefined);
                setFilterOpen(false);
              }}
              body={
                <div className="mb-4 flex h-[520px] w-full flex-col overflow-y-scroll px-3">
                  <div className="relative w-full">
                    <CustomSearchSelect
                      label="Project Status"
                      data={[
                        {
                          value: 'all',
                          label: 'All',
                        },
                        {
                          value: 'open',
                          label: 'Open',
                        },
                        {
                          value: 'close',
                          label: 'Close',
                        },
                      ]}
                      onSelect={(value, item) => {
                        if (typeof value === 'string') {
                          setFilterStatus(value);
                        }
                      }}
                      searchPlaceholder="Search Contacts, Users, Customers"
                      returnSingleValueWithLabel={true}
                      selected={[filterStatus]}
                      showImage={false}
                      isRequired={false}
                      showSearch={false}
                      multiple={false}
                      placeholder=""
                      isOpen={openDropdown === 'dropdown1'}
                      onToggle={() => handleToggle('dropdown1')}
                    />
                  </div>
                  <div className="relative">
                    <DateRangePicker
                      title={'Due Date Range'}
                      isForFilter={true}
                      selectedDate={filterDueDateRange}
                      handleOnConfirm={(from: any, to: any) => {
                        setDueDateRange({ from, to });
                      }}
                    />
                  </div>
                  <SimpleInput
                    label="Project Name"
                    placeholder="Enter name"
                    type="text"
                    name={'filterName'}
                    className="w-full"
                    value={filterName}
                    onChange={(e) => {
                      setFilterName(e.target.value);
                    }}
                  />
                  <SimpleInput
                    label="Project ID"
                    placeholder="Enter  Project ID"
                    type="text"
                    name={'filterID'}
                    className="w-full"
                    value={filterID}
                    onChange={(e) => {
                      setFilterID(e.target.value);
                    }}
                  />
                  <SimpleInput
                    label="Reference"
                    placeholder="Enter Reference"
                    type="text"
                    name={'filterReference'}
                    className="w-full"
                    value={filterReference}
                    onChange={(e) => {
                      setFilterReference(e.target.value);
                    }}
                  />
                  <div className="relative w-full">
                    <CustomSearchSelect
                      label="Customer"
                      data={[
                        {
                          value: 'all',
                          label: 'All',
                        },
                        ...(users ?? [])
                          .filter((user) => user.role === 4)
                          .map((user) => ({
                            value: `${user.customerName}`,
                            label: `${user.customerName} - ${user.userId}`,
                            photo: user.photo,
                          })),
                      ]}
                      onSelect={(value: any) => {
                        setFilterCustomer(value);
                      }}
                      searchPlaceholder="Search Customers"
                      selected={filterCustomer}
                      showImage={true}
                      isRequired={false}
                      showSearch={false}
                      multiple={true}
                      placeholder=""
                      isOpen={openDropdown === 'dropdown2'}
                      onToggle={() => handleToggle('dropdown2')}
                    />
                  </div>
                  <div className="relative w-full">
                    <CustomSearchSelect
                      label="Project Visibility"
                      data={[
                        {
                          value: 'all',
                          label: 'All',
                        },
                        {
                          value: 'private',
                          label: 'Private',
                        },
                        {
                          value: 'public',
                          label: 'Public',
                        },
                      ]}
                      onSelect={(value, item) => {
                        if (typeof value === 'string') {
                          setFilterVisibility(value);
                        }
                      }}
                      searchPlaceholder="Search Contacts, Users, Customers"
                      returnSingleValueWithLabel={true}
                      selected={[filterVisibility]}
                      showImage={false}
                      isRequired={false}
                      showSearch={false}
                      multiple={false}
                      placeholder=""
                      isOpen={openDropdown === 'dropdown3'}
                      onToggle={() => handleToggle('dropdown3')}
                    />
                  </div>
                  <div className="relative w-full">
                    <CustomSearchSelect
                      label="Created By User"
                      data={[
                        {
                          value: 'all',
                          label: 'All',
                        },
                        ...(users ?? [])
                          .filter((user) => user.role == 2)
                          .map((user) => ({
                            value: user._id,
                            label: `${user.firstName + ' ' + user.lastName}`,
                            photo: user.photo,
                          })),
                      ]}
                      onSelect={(value: any) => {
                        setFilterCreatedByUser(value);
                      }}
                      // selectedInputText={`Selected ${filterCreatedByUser.length}`}
                      searchPlaceholder="Search Users"
                      selected={filterCreatedByUser}
                      showImage={true}
                      isRequired={false}
                      showSearch={false}
                      multiple={true}
                      placeholder=""
                      isOpen={openDropdown === 'dropdown5'}
                      onToggle={() => handleToggle('dropdown5')}
                    />
                  </div>
                </div>
              }
              cancelButton="Reset"
              handleSubmit={() => {
                setFilterValue({
                  status: filterStatus,
                  name: filterName as string,
                  projectId: filterID as string,
                  ref: filterReference as string,
                  customerId: filterCustomer as string[],
                  projectVisibility: filterVisibility,
                  date: filterDueDateRange,
                  createdByUser: filterCreatedByUser,
                });
                setFilterOpen(false);
              }}
              submitValue={'Apply'}
            />
          </section>
        </div>
      </>
    </ProjectContext.Provider>
  );
};

export default Projects;
