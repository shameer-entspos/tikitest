import { useMemo, useState } from 'react';
import { Switch } from '@material-tailwind/react';
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
import { useSRAppCotnext } from '@/app/(main)/(user-panel)/user/apps/sr/sr_context';
import { AMAPPACTIONTYPE, SR_APP_ACTION_TYPE } from '@/app/helpers/user/enums';
import { SRTopBar } from '@/components/Sign_Register_App/SR_Top_Bar';
import { AssetManagerTopBar } from '../Settings/components/AssetManager_Top_Bar';
import { Search } from '@/components/Form/search';
import { Button } from '@/components/Buttons';
import FilterButton from '@/components/TimeSheetApp/CommonComponents/FilterButton/FilterButton';

import { useAssetManagerAppsContext } from '@/app/(main)/(user-panel)/user/apps/am/am_context';
import {
  getAssetList,
  getOrderItinrerayList,
} from '@/app/(main)/(user-panel)/user/apps/am/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useQueryClient, useQuery } from 'react-query';
import Loader from '@/components/DottedLoader/loader';
import { useSession } from 'next-auth/react';
import { dateFormat } from '@/app/helpers/dateFormat';
import { useRouter } from 'next/navigation';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import {
  getAllAppProjects,
  getAllOrgUsers,
} from '@/app/(main)/(user-panel)/user/apps/api';
import { customSortFunction } from '@/app/helpers/re-use-func';
import { CustomHoverPorjectShow } from '@/components/Custom_Project_Hover_Component';
import UserCard from '@/components/UserCard';
import { useTikiPagination } from '@/hooks/usePagination';
import { PaginationComponent } from '@/components/pagination';

export default function OrderItineraryScreen() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [hoveredUser, setHoveredUser] = useState<number | null>(null);
  const [isCheckInOutOpen, setIsCheckInOutOpen] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState('Check in & out');
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState('My Orders');
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('desc');
  const { state, dispatch } = useAssetManagerAppsContext();
  // check function - topbar
  const handleToggleCheckInOut = () => {
    setIsCheckInOutOpen(!isCheckInOutOpen);
  };
  const handleSelectCheckInOut = (option: string) => {
    setSelectedCheck(option);
    setIsCheckInOutOpen(false);
  };
  // order functions - topbar
  const handleToggleOrders = () => {
    setIsOrdersOpen(!isOrdersOpen);
  };
  const handleSelectOrders = (option: string) => {
    setSelectedOrder(option);
    setIsOrdersOpen(false);
  };
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: 'orderItinrerayListx',
    queryFn: () => getOrderItinrerayList({ axiosAuth }),
  });
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryFn: () => getAllAppProjects(axiosAuth),
    queryKey: ['allProjects'],
  });
  const { data: assets } = useQuery({
    queryKey: 'checkInAssetList',
    queryFn: () => getAssetList({ axiosAuth, status: 'all' }),
  });
  const { data: users } = useQuery({
    queryKey: 'orgUsers',
    queryFn: () => getAllOrgUsers(axiosAuth),
  });
  const [openDropdown, setOpenDropdown] = useState<string>('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string[]>([]);
  const [selectedChecked, setSelectedChecked] = useState<string[]>([]);
  const [selectedOrderBy, setSelectedOrderBy] = useState<string[]>([]);

  const handleToggleDropdown = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? '' : dropdownId);
  };
  const handleGoBack = () => {
    dispatch({
      type: AMAPPACTIONTYPE.SHOWPAGES,
    });
  };
  /// filters /////////////

  const [isApplyFilter, setApplyFilter] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string>('');
  const [showFilterModel, setShowFilterModel] = useState(false);
  // Filter handling
  const clearFilters = () => {
    setOpenFilterDropdown('');
    setSelectedProjects([]);
    setSelectedAsset([]);
    setSelectedChecked([]);
    setSelectedOrderBy([]);
    setApplyFilter(false);
    setShowFilterModel(false);
  };

  const areFiltersApplied = () => {
    return (
      selectedProjects.length > 0 ||
      selectedAsset.length > 0 ||
      selectedChecked.length > 0 ||
      selectedOrderBy.length > 0
    );
  };

  const handleApplyFilters = () => {
    setShowFilterModel(!showFilterModel);
    if (areFiltersApplied()) {
      setApplyFilter(true);
    }
  };
  const filterData = (data ?? [])
    .filter((p) => {
      if (isApplyFilter) {
        if (selectedProjects.length > 0) {
          return (p.checkedOutProject ?? []).some((project) =>
            selectedProjects.includes(project._id)
          );
        }
      }
      return p;
    })
    .filter((p) => {
      if (isApplyFilter) {
        if (selectedAsset.length > 0) {
          return p.assets.some((asset: any) =>
            selectedAsset.includes(asset._id)
          );
        }
      }
      return p;
    })
    .filter((p) => {
      if (isApplyFilter) {
        if (selectedOrderBy.length > 0) {
          return selectedOrderBy.includes(p.createdBy._id);
        }
      }
      return p;
    })
    .filter((p) => {
      if (isApplyFilter) {
        if (selectedChecked.length > 0) {
          // make condition here ,,, variable selectedChecked has all , checkin and checkout status
          if (
            selectedChecked.includes('in') &&
            selectedChecked.includes('out')
          ) {
            return p;
          } else if (selectedChecked.includes('in')) {
            return p.status === 'in';
          } else if (selectedChecked.includes('out')) {
            return p.status === 'out';
          } else {
            return p;
          }
        }
      }
      return p;
    })
    .sort((a, b) => {
      return customSortFunction({
        a: a.updatedAt.toString(),
        b: b.updatedAt.toString(),
        sortBy,
        type: 'date',
      });
    });

  const {
    currentPage,
    totalPages,
    paginatedItems,
    itemsPerPage,
    handlePageChange,
  } = useTikiPagination(filterData ?? [], 10);

  return (
    <>
      <div className="absolute inset-0 z-10 flex h-[calc(var(--app-vh)-70px)] w-full max-w-[1360px] flex-col bg-white px-4 pt-4 font-Open-Sans">
        {/* TopBar */}
        {/* {memoizedTopBar} */}

        {/* ///////////////// Middle content ////////////////////// */}

        <div className="flex h-full flex-1 flex-col justify-start overflow-auto scrollbar-hide">
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
                  <li className="text-base text-[#757575]">Asset Manager</li>
                </ul>
              </div>
              {/* <div className="bg-[#F1CD70] px-3 py-2 rounded font-semibold">JSA</div> */}
              {/* <Link href={'/use /apps'}> */}
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
            <div className="mt-4 flex justify-between">
              <div className="flex items-center gap-2 text-2xl font-bold text-[#1E1E1E]">
                <img
                  src="/svg/asset_manager/logo.svg"
                  alt="show logo"
                  className="h-12 w-12"
                />
                Asset Orders
              </div>

              <div className="flex items-center">
                {/* DropDown Custom | Orders */}
                <div className="DropDownn relative z-50 mx-3 inline-block text-left">
                  <div>
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center gap-1 rounded-md border border-gray-300 bg-[#E2F3FF] px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-[#e1f0fa] focus:outline-none"
                      id="options-menu"
                      aria-expanded="true"
                      aria-haspopup="true"
                      onClick={handleToggleOrders}
                    >
                      {selectedOrder}
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

                  {isOrdersOpen && (
                    <div
                      className="absolute left-0 z-50 mt-2 w-56 origin-top-left rounded-md bg-[#E2F3FF] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="options-menu"
                    >
                      <div className="py-1" role="none">
                        <button
                          onClick={() => handleSelectOrders('My Orders')}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          My Orders
                        </button>
                        <button
                          onClick={() => handleSelectOrders('All Orders')}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          All Orders
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* filter button */}
                {/* filter button */}
                <FilterButton
                  isApplyFilter={isApplyFilter}
                  setShowModel={setShowFilterModel}
                  showModel={showFilterModel}
                  setOpenDropdown={setOpenFilterDropdown}
                  clearFilters={clearFilters}
                />

                {/* search bar */}
                <div className="Search team-actice ml-3 flex items-center justify-between">
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
          {/* /// table section  */}
          {isLoading ? (
            <Loader />
          ) : (
            <table className="mt-3 w-full border-collapse font-Open-Sans">
              <thead className="bg-[#F5F5F5] text-left text-sm font-semibold text-[#616161]">
                <tr>
                  <th className="px-2 py-3">Order No</th>
                  <th className="px-2 py-3">Assigned Project</th>
                  <th className="px-2 py-3">Ordered By</th>

                  <th className="hidden px-2 py-3 md:table-cell">
                    Check in / out
                  </th>
                  <th className="hidden px-2 py-3 md:flex">
                    Date
                    <img
                      src="/images/fluent_arrow-sort-24-regular.svg"
                      className="cursor-pointer px-1"
                      alt="image"
                      onClick={() => {
                        setSortBy(sortBy === 'asc' ? 'desc' : 'asc');
                      }}
                    />
                  </th>

                  <th className="px-2 py-3 text-center"></th>
                </tr>
              </thead>

              <tbody className="text-sm font-normal text-[#1E1E1E]">
                {(paginatedItems ?? []).map((item, index) => {
                  return (
                    <tr
                      key={item._id}
                      className="relative cursor-pointer border-b even:bg-[#F5F5F5]"
                    >
                      <td
                        className="cursor-pointer px-4 text-primary-400"
                        onClick={() => {
                          router.push(
                            `/user/apps/am/${state.appId}/orders/${item._id}`
                          );
                        }}
                      >
                        {item.orderNumber}
                      </td>

                      <td className="relative px-2 text-primary-400">
                        <CustomHoverPorjectShow
                          projects={item.checkedOutProject ?? []}
                          index={hoveredProject}
                          setHoveredProject={setHoveredProject}
                        />
                      </td>

                      <td className="hidden px-4 md:table-cell">
                        <UserCard submittedBy={item.createdBy} index={0} />
                      </td>

                      <td className="hidden items-center md:table-cell">
                        {checkInOutStatus(item.status)}
                      </td>

                      <td className="hidden px-2 md:table-cell">
                        <div>{dateFormat(item.updatedAt.toString())}</div>
                      </td>
                      <td className="flex cursor-pointer justify-center pt-4 text-center">
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
                                  `/user/apps/am/${state.appId}/orders/${item._id}`
                                );
                              }}
                            >
                              View Order
                            </DropdownItem>
                            <DropdownItem key="pdf">View PDF</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="h-16">
          <div className="flex h-full items-center justify-between border-2 border-[#EEEEEE] p-2">
            <div className="font-Open-Sans text-sm font-normal text-[#616161]">
              Items per page: {itemsPerPage}
            </div>
            <div>
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
              />
            </div>
            <div></div>
          </div>
        </div>
      </div>
      {/* {state.showRollCallForm && <RollCallSteps />} */}
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
                <div>
                  <svg
                    onClick={onCloseModal}
                    className="cursor-pointer"
                    width="18"
                    height="18"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.5875 0.423757C14.4834 0.319466 14.3598 0.236725 14.2237 0.180271C14.0876 0.123817 13.9417 0.0947577 13.7944 0.0947577C13.647 0.0947577 13.5011 0.123817 13.365 0.180271C13.229 0.236725 13.1053 0.319466 13.0012 0.423757L7.5 5.91376L1.99875 0.412507C1.8946 0.308353 1.77095 0.225733 1.63486 0.169364C1.49878 0.112996 1.35292 0.0839844 1.20563 0.0839844C1.05833 0.0839844 0.912473 0.112996 0.776388 0.169364C0.640304 0.225733 0.516654 0.308353 0.4125 0.412507C0.308345 0.516662 0.225725 0.640311 0.169357 0.776396C0.112989 0.912481 0.0839767 1.05834 0.0839767 1.20563C0.0839767 1.35293 0.112989 1.49878 0.169357 1.63487C0.225725 1.77095 0.308345 1.8946 0.4125 1.99876L5.91375 7.50001L0.4125 13.0013C0.308345 13.1054 0.225725 13.2291 0.169357 13.3651C0.112989 13.5012 0.0839767 13.6471 0.0839767 13.7944C0.0839767 13.9417 0.112989 14.0875 0.169357 14.2236C0.225725 14.3597 0.308345 14.4834 0.4125 14.5875C0.516654 14.6917 0.640304 14.7743 0.776388 14.8306C0.912473 14.887 1.05833 14.916 1.20563 14.916C1.35292 14.916 1.49878 14.887 1.63486 14.8306C1.77095 14.7743 1.8946 14.6917 1.99875 14.5875L7.5 9.08626L13.0012 14.5875C13.1054 14.6917 13.2291 14.7743 13.3651 14.8306C13.5012 14.887 13.6471 14.916 13.7944 14.916C13.9417 14.916 14.0875 14.887 14.2236 14.8306C14.3597 14.7743 14.4833 14.6917 14.5875 14.5875C14.6917 14.4834 14.7743 14.3597 14.8306 14.2236C14.887 14.0875 14.916 13.9417 14.916 13.7944C14.916 13.6471 14.887 13.5012 14.8306 13.3651C14.7743 13.2291 14.6917 13.1054 14.5875 13.0013L9.08625 7.50001L14.5875 1.99876C15.015 1.57126 15.015 0.851258 14.5875 0.423757Z"
                      fill="#616161"
                    />
                  </svg>
                </div>
              </ModalHeader>
              <ModalBody className="flex flex-col justify-start gap-8 overflow-y-scroll p-0 pb-16 pt-8 scrollbar-hide">
                <div className="w-full">
                  <CustomSearchSelect
                    label="Checked in / out"
                    data={[
                      {
                        label: 'Checked in',
                        value: 'in',
                      },
                      {
                        label: 'Checked out',
                        value: 'out',
                      },
                    ]}
                    showImage={false}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown4'}
                    onToggle={() => handleToggleDropdown('dropdown4')}
                    onSelect={(selected: string[]) =>
                      setSelectedChecked(selected)
                    }
                    selected={selectedChecked}
                    placeholder="-"
                  />
                </div>

                <div className="w-full">
                  <CustomSearchSelect
                    label="Order By"
                    data={[
                      ...(users ?? []).map((user) => ({
                        label: `${user.firstName} ${user.lastName}`,
                        value: user._id ?? '',
                      })),
                    ]}
                    showImage={false}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown1'}
                    onToggle={() => handleToggleDropdown('dropdown1')}
                    onSelect={(selected: string[]) =>
                      setSelectedOrderBy(selected)
                    }
                    selected={selectedOrderBy}
                    placeholder="-"
                  />
                </div>

                <div className="w-full">
                  <CustomSearchSelect
                    label="Filter By - Project"
                    data={[
                      ...(projects ?? []).map((project) => ({
                        label: project.name ?? '',
                        value: project._id ?? '',
                      })),
                    ]}
                    showImage={false}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown2'}
                    onToggle={() => handleToggleDropdown('dropdown2')}
                    onSelect={(selected: string[]) =>
                      setSelectedProjects(selected)
                    }
                    selected={selectedProjects}
                    placeholder="-"
                  />
                </div>
                <div className="w-full">
                  <CustomSearchSelect
                    label="Filter By -  Assets"
                    data={[
                      {
                        label: 'All',
                        value: 'all',
                      },
                      ...(assets ?? []).map((asset) => ({
                        label: `${asset.name} - ${asset.atnNum}`,
                        value: asset._id ?? '',
                      })),
                    ]}
                    showImage={false}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown3'}
                    onToggle={() => handleToggleDropdown('dropdown3')}
                    onSelect={(selected: string[]) =>
                      setSelectedAsset(selected)
                    }
                    selected={selectedAsset}
                    placeholder="-"
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
function checkInOutStatus(status: string) {
  if (status == 'in') {
    return (
      <span className="rounded-md border-2 border-primary-500 px-2 py-1 text-sm text-primary-400">
        Checked in
      </span>
    );
  } else {
    return (
      <span className="rounded-md border-2 border-[#EA4E4E] px-2 py-1 text-sm text-[#EA4E4E]">
        Checked out
      </span>
    );
  }
}
