import { getTeams } from '@/app/(main)/(org-panel)/organization/teams/api';
import { useAssetManagerAppsContext } from '@/app/(main)/(user-panel)/user/apps/am/am_context';
import { useSRAppCotnext } from '@/app/(main)/(user-panel)/user/apps/sr/sr_context';
import { useTimeSheetAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/timesheets/timesheet_context';
import { AMAPPACTIONTYPE, SR_APP_ACTION_TYPE } from '@/app/helpers/user/enums';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { AMPermissionSetting } from '../../Settings/components/AM_Permission_Setting';
import { AMNotifictionSettings } from '../../Settings/components/AM_Setting_Notification';
import { WithAMSettingsSidebar } from '../../Settings/components/With_AM_Setting_Sidebar';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { SimpleInput } from '@/components/Form/simpleInput';
import {
  getAllChildCategoriesList,
  getAllParentCategoriesList,
  getAssetList,
} from '@/app/(main)/(user-panel)/user/apps/am/api';
import SingleAssetCheckCard from './SingleAssetCheckCard';
import { Search } from '@/components/Form/search';
import { Button } from '@/components/Buttons';
import Loader from '@/components/DottedLoader/loader';
import { SingleAsset } from '@/app/type/single_asset';
import { ShowAssetDetail } from './Show_Asset_Detail';
import { ViewAssetCart } from './View_Asset_Cart';
import { useTikiPagination } from '@/hooks/usePagination';
import { PaginationComponent } from '@/components/pagination';

export function CheckOutScreen() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [model, setModel] = useState<SingleAsset | undefined>(undefined);
  const [selectedAsset, setAsset] = useState<SingleAsset[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [makeSearchText, setMakeText] = useState('');
  const [modelSearchText, setModelText] = useState('');
  const [applyFilter, setFilterValue] = useState(false);
  const handleClose = () => {
    setShowCart(!showCart);
    if (showCart) {
      setAsset([]);
    }
  };
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  //   ParentCategories
  const { data: ParentCategories } = useQuery({
    queryKey: 'pCategoreis',
    queryFn: () => getAllParentCategoriesList({ axiosAuth }),
  });
  //   ChildCategories
  const { data: ChildCategories, isLoading: childLoading } = useQuery(
    ['pCategories', selectedParentId], // Unique key tied to selectedParentId
    () => getAllChildCategoriesList({ axiosAuth, id: selectedParentId }),
    {
      enabled: !!selectedParentId, // Only fetch if a parent category is selected
    }
  );
  const toggleSelectedAsset = (asset: SingleAsset) => {
    if (selectedAsset.some((a) => a._id === asset._id)) {
      setAsset(selectedAsset.filter((as) => as._id !== asset._id));
    } else {
      setAsset([...selectedAsset, asset]);
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const handleGoBack = () => {
    context.dispatch({
      type: AMAPPACTIONTYPE.SHOWPAGES,
      showPages: 'checkinout',
    });
  };

  const context = useAssetManagerAppsContext();
  const memoizedTopBar = useMemo(
    () => (
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
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: 'checkOutAssetList',
    queryFn: () => getAssetList({ axiosAuth, status: 'checkout' }),
  });
  const filteredAssets = (data ?? [])
    .filter((asset) => {
      return (
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.atnNum?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false
      );
    })
    .filter((a) => {
      if (applyFilter) {
        return a.make?.toLowerCase().includes(makeSearchText.toLowerCase());
      } else {
        return a;
      }
    })
    .filter((a) => {
      if (applyFilter) {
        return a.model?.toLowerCase().includes(modelSearchText.toLowerCase());
      } else {
        return a;
      }
    })
    .filter((a) => {
      if (applyFilter) {
      } else {
        return a;
      }
    })
    .filter((a) => {
      if (applyFilter) {
      } else {
        return a;
      }
    });
  const {
    currentPage,
    totalPages,
    paginatedItems,
    itemsPerPage,
    handlePageChange,
  } = useTikiPagination(filteredAssets ?? [], 10);
  return (
    <>
      <div className="absolute inset-0 z-10 h-[calc(var(--app-vh)-70px)] w-full max-w-[1360px] bg-white">
        <div className="sticky top-0 z-20 bg-white pb-4">
          {memoizedTopBar}
          <div className="mt-4 flex justify-between">
            <div className="flex items-center gap-2 text-2xl font-bold text-[#1E1E1E]">
              <img
                src="/svg/asset_manager/logo.svg"
                alt="show logo"
                className="h-12 w-12"
              />
              Check out
            </div>

            <div className="flex items-center gap-2">
              {/* search bar */}
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
              <div className="rounded-md bg-[#eeeeee] placeholder:text-[#616161]">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.74992 6.66634C7.59992 6.66634 6.66659 7.59967 6.66659 8.74967V13.333C6.66659 13.775 6.49099 14.199 6.17843 14.5115C5.86587 14.8241 5.44195 14.9997 4.99992 14.9997C4.55789 14.9997 4.13397 14.8241 3.82141 14.5115C3.50885 14.199 3.33325 13.775 3.33325 13.333V8.74967C3.33325 7.31309 3.90393 5.93533 4.91976 4.91951C5.93558 3.90369 7.31333 3.33301 8.74992 3.33301H13.3333C13.7753 3.33301 14.1992 3.5086 14.5118 3.82116C14.8243 4.13372 14.9999 4.55765 14.9999 4.99967C14.9999 5.4417 14.8243 5.86563 14.5118 6.17819C14.1992 6.49075 13.7753 6.66634 13.3333 6.66634H8.74992ZM8.74992 33.333C7.59992 33.333 6.66659 32.3997 6.66659 31.2497V26.6663C6.66659 26.2243 6.49099 25.8004 6.17843 25.4878C5.86587 25.1753 5.44195 24.9997 4.99992 24.9997C4.55789 24.9997 4.13397 25.1753 3.82141 25.4878C3.50885 25.8004 3.33325 26.2243 3.33325 26.6663V31.2497C3.33325 31.961 3.47336 32.6654 3.74557 33.3225C4.01778 33.9797 4.41677 34.5769 4.91976 35.0798C5.42274 35.5828 6.01987 35.9818 6.67705 36.254C7.33423 36.5262 8.03859 36.6663 8.74992 36.6663H13.3333C13.7753 36.6663 14.1992 36.4907 14.5118 36.1782C14.8243 35.8656 14.9999 35.4417 14.9999 34.9997C14.9999 34.5576 14.8243 34.1337 14.5118 33.8212C14.1992 33.5086 13.7753 33.333 13.3333 33.333H8.74992ZM33.3333 8.74967C33.3333 7.59967 32.3999 6.66634 31.2499 6.66634H26.6666C26.2246 6.66634 25.8006 6.49075 25.4881 6.17819C25.1755 5.86563 24.9999 5.4417 24.9999 4.99967C24.9999 4.55765 25.1755 4.13372 25.4881 3.82116C25.8006 3.5086 26.2246 3.33301 26.6666 3.33301H31.2499C31.9612 3.33301 32.6656 3.47311 33.3228 3.74533C33.98 4.01754 34.5771 4.41653 35.0801 4.91951C35.5831 5.4225 35.9821 6.01963 36.2543 6.67681C36.5265 7.33399 36.6666 8.03835 36.6666 8.74967V13.333C36.6666 13.775 36.491 14.199 36.1784 14.5115C35.8659 14.8241 35.4419 14.9997 34.9999 14.9997C34.5579 14.9997 34.134 14.8241 33.8214 14.5115C33.5088 14.199 33.3333 13.775 33.3333 13.333V8.74967ZM31.2499 33.333C32.3999 33.333 33.3333 32.3997 33.3333 31.2497V26.6663C33.3333 26.2243 33.5088 25.8004 33.8214 25.4878C34.134 25.1753 34.5579 24.9997 34.9999 24.9997C35.4419 24.9997 35.8659 25.1753 36.1784 25.4878C36.491 25.8004 36.6666 26.2243 36.6666 26.6663V31.2497C36.6666 31.961 36.5265 32.6654 36.2543 33.3225C35.9821 33.9797 35.5831 34.5769 35.0801 35.0798C34.5771 35.5828 33.98 35.9818 33.3228 36.254C32.6656 36.5262 31.9612 36.6663 31.2499 36.6663H26.6666C26.2246 36.6663 25.8006 36.4907 25.4881 36.1782C25.1755 35.8656 24.9999 35.4417 24.9999 34.9997C24.9999 34.5576 25.1755 34.1337 25.4881 33.8212C25.8006 33.5086 26.2246 33.333 26.6666 33.333H31.2499ZM11.6666 11.6663H16.6666V16.6663H11.6666V11.6663ZM23.3333 16.6663H16.6666V23.333H11.6666V28.333H16.6666V23.333H23.3333V28.333H28.3333V23.333H23.3333V16.6663ZM23.3333 16.6663V11.6663H28.3333V16.6663H23.3333Z"
                    fill="#0063F7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        {/* // body section  */}
        <div className="flex">
          <div className="w-1/4 max-w-[250px] border-r-1 border-l-secondary-200 p-4">
            {/* Parent Categories */}
            <div className="mb-4 w-full">
              <CustomSearchSelect
                label="Category"
                data={[
                  ...(ParentCategories ?? []).map((user) => ({
                    label: user.name,
                    value: user._id,
                  })),
                ]}
                onSelect={(values) => {
                  if (values.length > 0) {
                    setSelectedParentId(values[0]);
                  }
                }}
                selected={selectedParentId ? [selectedParentId] : []}
                hasError={false}
                showImage={false}
                multiple={false}
                isOpen={openDropdown === 'dropdown2'}
                onToggle={() => handleToggle('dropdown2')}
              />
            </div>

            {/* Child Categories */}
            <div className="mb-4 w-full">
              <CustomSearchSelect
                label="Subcategory"
                data={(ChildCategories ?? []).map((child) => ({
                  label: child.name,
                  value: child._id,
                }))}
                onSelect={(values) => {
                  if (values.length > 0) {
                    setSelectedChildId(values[0]);
                  }
                }}
                selected={childLoading ? [childLoading] : []}
                hasError={false}
                multiple={false}
                showImage={false}
                searchPlaceholder="Select subcategory"
                isOpen={openDropdown === 'dropdown3'}
                onToggle={() => handleToggle('dropdown3')}
              />
            </div>
            <SimpleInput
              type="text"
              label="Make"
              placeholder="Enter Make"
              name="make"
              value={makeSearchText}
              className="w-full"
              onChange={(value) => {
                setMakeText(value.target.value);
              }}
            />
            <SimpleInput
              type="text"
              label="Model"
              placeholder="Enter Make"
              name="model"
              value={modelSearchText}
              className="w-full"
              onChange={(value) => {
                setModelText(value.target.value);
              }}
            />
            {applyFilter ? (
              <Button
                variant="primaryOutLine"
                onClick={() => {
                  setMakeText('');
                  setModelText('');
                  setFilterValue(!applyFilter);
                }}
              >
                Clear
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  setFilterValue(!applyFilter);
                }}
              >
                Apply
              </Button>
            )}
          </div>
          <div className="h-[calc(var(--app-vh)-250px)] w-full">
            {isLoading ? (
              <div className="flex w-full items-center justify-center">
                <Loader />
              </div>
            ) : (
              <div className="grid h-[calc(var(--app-vh)-250px)] grid-cols-1 items-start justify-center gap-2 overflow-y-scroll p-4 sm:grid-cols-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4">
                {(filteredAssets ?? []).map((item, index) => (
                  <SingleAssetCheckCard
                    key={index}
                    data={item}
                    selectedAsset={selectedAsset}
                    onAdd={toggleSelectedAsset}
                    onClick={() => {
                      setModel(item);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
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

            <div className="flex">
              <Button
                variant="text"
                onClick={() => {
                  context.dispatch({
                    type: AMAPPACTIONTYPE.SHOWPAGES,
                    showPages: 'checkinout',
                  });
                }}
              >
                <div className="">Cancel</div>
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (selectedAsset.length > 0) {
                    handleClose();
                  }
                }}
                className=""
                disabled={!(selectedAsset.length > 0)}
              >
                {selectedAsset.length > 0 ? (
                  <span className="text-sm">
                    {' '}
                    View Cart ({selectedAsset.length})
                  </span>
                ) : (
                  <span className="text-sm"> View Cart </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* ShowAssetDetail */}
      {model && (
        <ShowAssetDetail
          model={model}
          handleClose={() => {
            setModel(undefined);
          }}
        />
      )}
      {showCart && (
        <ViewAssetCart
          selectedAsset={selectedAsset}
          from="checkout"
          handleClose={handleClose}
          onAdd={toggleSelectedAsset}
        />
      )}
    </>
  );
}
