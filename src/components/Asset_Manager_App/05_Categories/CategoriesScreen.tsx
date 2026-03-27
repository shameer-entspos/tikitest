import { useMemo, useState } from 'react';
import { Switch } from '@material-tailwind/react';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import {
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

import { SafetyHubTopBar } from '@/components/Safety_Hub_App/components/SafetyHub_Top_Bar';
import { ClassNames } from '@emotion/react';
import { useAssetManagerAppsContext } from '@/app/(main)/(user-panel)/user/apps/am/am_context';
import { Site } from '@/app/type/Sign_Register_Sites';
import AddCategoryModel from './components/Add_Categories_Model';
import {
  deleteCategory,
  getAllCategoriesList,
  getAllChildCategoriesList,
  getAllParentCategoriesList,
  updateAssetCategory,
  updateAssetTransferCategory,
} from '@/app/(main)/(user-panel)/user/apps/am/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useQueryClient, useQuery, useMutation } from 'react-query';
import { Category } from '@/app/type/asset_category';
import React from 'react';

import Loader from '@/components/DottedLoader/loader';
import CustomInfoModal from '@/components/CustomDeleteModel';
import { SimpleInput } from '@/components/Form/simpleInput';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { id, tr } from 'date-fns/locale';

export default function CategoriesScreen() {
  // const memoizedTopBar = useMemo(() => <SafetyHubTopBar />, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [isCheckInOutOpen, setIsCheckInOutOpen] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState('Check in & out');
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState('My Orders');
  const { state, dispatch } = useAssetManagerAppsContext();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };
  const [renameModel, setRenameModel] = useState<Category | undefined>(
    undefined
  );
  const [transferAssetCategory, setTransferAssetCategory] = useState<
    Category | undefined
  >(undefined);
  const [renameText, setRenameText] = useState('');
  const [isOpenManageSite, setIsOpenManageSite] = useState(false);
  const [childModel, setChildModel] = useState<Category | undefined>();
  const [parentModel, setParentModel] = useState<Category | undefined>();
  const [selectedParentId, setSelectedParentId] = useState<string | null>('');
  const [selectedChildId, setSelectedChildId] = useState<string | null>();
  //   ParentCategories
  const { data: ParentCategories } = useQuery({
    queryKey: 'pCategoreis',
    queryFn: () => getAllParentCategoriesList({ axiosAuth }),
    refetchOnWindowFocus: true,
  });
  //   ChildCategories
  const { data: ChildCategories, isLoading: childLoading } = useQuery(
    ['childCategories', selectedParentId], // Unique key tied to selectedParentId
    () => getAllChildCategoriesList({ axiosAuth, id: selectedParentId! }),

    {
      refetchOnWindowFocus: true,
      enabled: !!selectedParentId, // Only fetch if a parent category is selected
    }
  );
  const deleteCategoryMutation = useMutation(deleteCategory, {
    onSuccess: () => {
      if (childModel) {
        setChildModel(undefined);
      }
      if (parentModel) {
        setParentModel(undefined);
      }
      queryClient.invalidateQueries('categoreis');
    },
  });
  const updateCategoryMutation = useMutation(updateAssetCategory, {
    onSuccess: () => {
      setRenameModel(undefined);
      queryClient.invalidateQueries('categoreis');
    },
  });
  const transferCategoryAssetMutation = useMutation(
    updateAssetTransferCategory,
    {
      onSuccess: () => {
        setTransferAssetCategory(undefined);
        setSelectedParentId('');
        setSelectedChildId(undefined);
        queryClient.invalidateQueries('categoreis');
      },
    }
  );
  const handleClose = () => {
    setIsOpenManageSite(!isOpenManageSite);
  };

  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: 'categoreis',
    queryFn: () => getAllCategoriesList({ axiosAuth }),
  });

  // Sort categories by newest date to oldest
  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  }, [data]);
  const handleGoBack = () => {
    dispatch({
      type: AMAPPACTIONTYPE.SHOWPAGES,
    });
  };

  const groupedCategories = (data ?? []).reduce<Record<string, Category[]>>(
    (acc, category) => {
      if (category.isSubCategory && category.parentCategory) {
        // If it's a subcategory, add it under its parent category
        if (!acc[category.parentCategory]) {
          acc[category.parentCategory] = [];
        }
        acc[category.parentCategory].push(category);
      } else {
        // If it's a parent category, initialize it in the accumulator
        acc[category._id] = acc[category._id] || [];
      }
      return acc;
    },
    {}
  );

  const grouped = groupCategories(sortedData ?? []);

  console.log('Uncategorized:', grouped.uncategorized);
  return (
    <>
      <div className="absolute inset-0 z-10 flex h-[calc(var(--app-vh)-70px)] w-full max-w-[1360px] flex-col bg-white px-4 pt-4 font-Open-Sans">
        {/* TopBar */}
        {/* {memoizedTopBar} */}

        {/* ///////////////// Middle content ////////////////////// */}

        <div className="flex h-full flex-1 flex-col justify-start overflow-auto scrollbar-hide">
          <div className="sticky top-0 z-10 bg-white">
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
                Asset Categories
              </div>

              <div className="flex items-center">
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
              </div>
            </div>
          </div>
          {/* /// table section  */}
          {
            <table className="mt-3 w-full border-collapse overflow-y-auto font-Open-Sans">
              <thead className="bg-[#F5F5F5] text-left text-sm font-semibold text-[#616161]">
                <tr className="overflow-hidden rounded-md border-1">
                  <th className="justify-start px-2 py-3 md:flex">
                    Categories
                    <img
                      src="/images/fluent_arrow-sort-24-regular.svg"
                      className="cursor-pointer px-2"
                      alt="image"
                    />
                  </th>
                  <th className="px- py-3">Asset Count</th>
                  <th className="px- py-3 text-center font-normal text-[#0063F7]"></th>
                </tr>
              </thead>
              <tbody className="text-sm font-normal text-[#1E1E1E]">
                {/* Render Grouped Categories */}
                {(grouped.groupedCategories ?? [])
                  // add search filter here
                  .filter((search) => {
                    if (searchQuery) {
                      return (
                        search.parent?.name
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        (search.subcategories ?? []).some((s: any) =>
                          s?.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        )
                      );
                    } else {
                      return search;
                    }
                  })
                  .map((group) => (
                    <React.Fragment key={group.parent?._id}>
                      {/* Render Parent Category */}
                      <tr className="w-full bg-[#F5F5F5]">
                        <td className="px-4 py-2 font-semibold">
                          {group.parent?.name}
                        </td>
                        <td className="px-4 py-2">
                          {group.parent.assets.length}
                        </td>
                        {!group.parent?.isUnCategorized ? (
                          <td className="flex justify-center py-2">
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
                                  key="rename"
                                  onClick={() => {
                                    setRenameModel(group.parent);
                                    setRenameText(group.parent.name);
                                  }}
                                >
                                  Rename
                                </DropdownItem>
                                <DropdownItem
                                  key="Transfer"
                                  onClick={() => {
                                    setTransferAssetCategory(group.parent);
                                  }}
                                >
                                  Transfer Asset
                                </DropdownItem>
                                <DropdownItem
                                  key="Delete"
                                  onClick={() => setParentModel(group.parent)}
                                >
                                  Delete
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          </td>
                        ) : (
                          <td />
                        )}
                      </tr>

                      {/* Render Subcategories */}
                      {(group.subcategories ?? [])
                        .filter((s: any) => {
                          if (searchQuery) {
                            return s.name
                              ?.toLowerCase()
                              .includes(searchQuery.toLowerCase());
                          } else {
                            return s;
                          }
                        })
                        .map((subcategory: any) => (
                          <tr
                            key={subcategory._id}
                            className="w-full even:bg-[#F5F5F5]"
                          >
                            <td className="px-4 py-2 pl-8">
                              <ul className="list-none">
                                <li className="flex items-center">
                                  <span className="mr-2 h-2 w-2 rounded-full bg-black"></span>
                                  {subcategory.name}
                                </li>
                              </ul>
                            </td>
                            <td className="px-4 py-2">
                              {subcategory.assets.length}
                            </td>
                            <td className="flex justify-center px-4 py-2">
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
                                    key="rename"
                                    onClick={() => {
                                      setRenameModel(subcategory);
                                      setRenameText(subcategory.name);
                                    }}
                                  >
                                    Rename
                                  </DropdownItem>
                                  <DropdownItem
                                    key="Transfer"
                                    onClick={() => {
                                      setTransferAssetCategory(subcategory);
                                    }}
                                  >
                                    Transfer Asset
                                  </DropdownItem>
                                  <DropdownItem
                                    key="Delete"
                                    onClick={() => setChildModel(subcategory)}
                                  >
                                    Delete
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          }

          {/* Add Button */}
          <div className="relative flex-1">
            <div className="absolute bottom-6 right-6">
              <Button
                variant="primaryRounded"
                onClick={() => {
                  handleClose();
                }}
              >
                {'+ Add'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {isOpenManageSite && (
        <AddCategoryModel
          handleClose={handleClose}
          listOfParentCategories={(data ?? []).filter((c) => !c.isSubCategory)}
        />
      )}
      {childModel && (
        <CustomInfoModal
          doneValue={
            deleteCategoryMutation.isLoading ? (
              <>
                <Loader />
              </>
            ) : (
              <>Delete</>
            )
          }
          handleClose={() => {
            setChildModel(undefined);
          }}
          onDeleteButton={() => {
            deleteCategoryMutation.mutate({ axiosAuth, id: childModel._id });
          }}
          subtitle="Are you sure you want to delete this child category. All assets will be moved to the ‘Parent’ category."
          title={'Delete Child Category'}
        />
      )}
      {parentModel && (
        <CustomInfoModal
          doneValue={
            deleteCategoryMutation.isLoading ? (
              <>
                <Loader />
              </>
            ) : (
              <>Delete</>
            )
          }
          handleClose={() => {
            setParentModel(undefined);
          }}
          onDeleteButton={() => {
            deleteCategoryMutation.mutate({ axiosAuth, id: parentModel._id });
          }}
          subtitle="Are you sure you want to delete this category. All child categories and assets will be moved to  ‘Uncategorized’."
          title={'Delete Parent Category'}
        />
      )}

      {renameModel && (
        <Modal
          isOpen={true}
          onOpenChange={() => {
            setRenameModel(undefined);
          }}
          placement="top-center"
          size="xl"
        >
          <ModalContent>
            {(onCloseModal) => (
              <>
                <ModalHeader className="flex flex-row items-start justify-between gap-2 px-5 py-5">
                  <div className="flex gap-3">
                    <svg
                      width="50"
                      height="50"
                      viewBox="0 0 50 50"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                      <path
                        d="M11 13C11 12.4696 11.2107 11.9609 11.5858 11.5858C11.9609 11.2107 12.4696 11 13 11H37C37.5304 11 38.0391 11.2107 38.4142 11.5858C38.7893 11.9609 39 12.4696 39 13V17C39 17.5304 38.7893 18.0391 38.4142 18.4142C38.0391 18.7893 37.5304 19 37 19H13C12.4696 19 11.9609 18.7893 11.5858 18.4142C11.2107 18.0391 11 17.5304 11 17V13ZM11 25C11 24.4696 11.2107 23.9609 11.5858 23.5858C11.9609 23.2107 12.4696 23 13 23H25C25.5304 23 26.0391 23.2107 26.4142 23.5858C26.7893 23.9609 27 24.4696 27 25V37C27 37.5304 26.7893 38.0391 26.4142 38.4142C26.0391 38.7893 25.5304 39 25 39H13C12.4696 39 11.9609 38.7893 11.5858 38.4142C11.2107 38.0391 11 37.5304 11 37V25ZM33 23C32.4696 23 31.9609 23.2107 31.5858 23.5858C31.2107 23.9609 31 24.4696 31 25V37C31 37.5304 31.2107 38.0391 31.5858 38.4142C31.9609 38.7893 32.4696 39 33 39H37C37.5304 39 38.0391 38.7893 38.4142 38.4142C38.7893 38.0391 39 37.5304 39 37V25C39 24.4696 38.7893 23.9609 38.4142 23.5858C38.0391 23.2107 37.5304 23 37 23H33Z"
                        fill="#0063F7"
                      />
                    </svg>

                    <div>
                      <h2 className="text-xl font-semibold text-[#1E1E1E]">
                        {'Rename Category'}
                      </h2>
                      <span className="mt-1 text-base font-normal text-[#616161]">
                        {'You can rename your category below.'}
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      onCloseModal();
                    }}
                    className="cursor-pointer"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.5875 0.423757C14.4834 0.319466 14.3598 0.236725 14.2237 0.180271C14.0876 0.123817 13.9417 0.0947577 13.7944 0.0947577C13.647 0.0947577 13.5011 0.123817 13.3651 0.180271C13.229 0.236725 13.1053 0.319466 13.0013 0.423757L7.50001 5.91376L1.99876 0.412507C1.8946 0.308353 1.77095 0.225733 1.63487 0.169364C1.49878 0.112996 1.35293 0.0839844 1.20563 0.0839844C1.05834 0.0839844 0.912481 0.112996 0.776396 0.169364C0.640311 0.225733 0.516662 0.308353 0.412507 0.412507C0.308353 0.516662 0.225733 0.640311 0.169364 0.776396C0.112996 0.912481 0.0839844 1.05834 0.0839844 1.20563C0.0839844 1.35293 0.112996 1.49878 0.169364 1.63487C0.225733 1.77095 0.308353 1.8946 0.412507 1.99876L5.91376 7.50001L0.412507 13.0013C0.308353 13.1054 0.225733 13.2291 0.169364 13.3651C0.112996 13.5012 0.0839844 13.6471 0.0839844 13.7944C0.0839844 13.9417 0.112996 14.0875 0.169364 14.2236C0.225733 14.3597 0.308353 14.4834 0.412507 14.5875C0.516662 14.6917 0.640311 14.7743 0.776396 14.8306C0.912481 14.887 1.05834 14.916 1.20563 14.916C1.35293 14.916 1.49878 14.887 1.63487 14.8306C1.77095 14.7743 1.8946 14.6917 1.99876 14.5875L7.50001 9.08626L13.0013 14.5875C13.1054 14.6917 13.2291 14.7743 13.3651 14.8306C13.5012 14.887 13.6471 14.916 13.7944 14.916C13.9417 14.916 14.0875 14.887 14.2236 14.8306C14.3597 14.7743 14.4834 14.6917 14.5875 14.5875C14.6917 14.4834 14.7743 14.3597 14.8306 14.2236C14.887 14.0875 14.916 13.9417 14.916 13.7944C14.916 13.6471 14.887 13.5012 14.8306 13.3651C14.7743 13.2291 14.6917 13.1054 14.5875 13.0013L9.08626 7.50001L14.5875 1.99876C15.015 1.57126 15.015 0.851258 14.5875 0.423757Z"
                        fill="#616161"
                      />
                    </svg>
                  </div>
                </ModalHeader>
                <ModalBody className="my-4">
                  <SimpleInput
                    type="text"
                    label="Category Name"
                    placeholder="Give your category a name"
                    name="categoryName"
                    className="w-full"
                    required={true}
                    value={renameText}
                    onChange={(e) => {
                      setRenameText(e.target.value);
                    }}
                  />
                </ModalBody>
                <ModalFooter className="border-t-2 border-gray-200">
                  <Button variant="primaryOutLine" onClick={onCloseModal}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    disabled={renameText.length === 0}
                    onClick={() => {
                      updateCategoryMutation.mutate({
                        axiosAuth,
                        id: renameModel._id,
                        data: { name: renameText },
                      });
                    }}
                  >
                    {'Save'}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
      {transferAssetCategory && (
        <Modal
          isOpen={true}
          onOpenChange={() => {
            setTransferAssetCategory(undefined);
          }}
          placement="top-center"
          size="lg"
        >
          <ModalContent>
            {(onCloseModal) => (
              <>
                <ModalHeader className="flex flex-row items-start justify-between gap-2 px-5 py-5">
                  <div className="flex gap-3">
                    <svg
                      width="50"
                      height="50"
                      viewBox="0 0 50 50"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                      <path
                        d="M11 13C11 12.4696 11.2107 11.9609 11.5858 11.5858C11.9609 11.2107 12.4696 11 13 11H37C37.5304 11 38.0391 11.2107 38.4142 11.5858C38.7893 11.9609 39 12.4696 39 13V17C39 17.5304 38.7893 18.0391 38.4142 18.4142C38.0391 18.7893 37.5304 19 37 19H13C12.4696 19 11.9609 18.7893 11.5858 18.4142C11.2107 18.0391 11 17.5304 11 17V13ZM11 25C11 24.4696 11.2107 23.9609 11.5858 23.5858C11.9609 23.2107 12.4696 23 13 23H25C25.5304 23 26.0391 23.2107 26.4142 23.5858C26.7893 23.9609 27 24.4696 27 25V37C27 37.5304 26.7893 38.0391 26.4142 38.4142C26.0391 38.7893 25.5304 39 25 39H13C12.4696 39 11.9609 38.7893 11.5858 38.4142C11.2107 38.0391 11 37.5304 11 37V25ZM33 23C32.4696 23 31.9609 23.2107 31.5858 23.5858C31.2107 23.9609 31 24.4696 31 25V37C31 37.5304 31.2107 38.0391 31.5858 38.4142C31.9609 38.7893 32.4696 39 33 39H37C37.5304 39 38.0391 38.7893 38.4142 38.4142C38.7893 38.0391 39 37.5304 39 37V25C39 24.4696 38.7893 23.9609 38.4142 23.5858C38.0391 23.2107 37.5304 23 37 23H33Z"
                        fill="#0063F7"
                      />
                    </svg>

                    <div>
                      <h2 className="text-xl font-semibold text-[#1E1E1E]">
                        {'Transfer Category'}
                      </h2>
                      <span className="mt-1 text-base font-normal text-[#616161]">
                        {'Move assets to another category.'}
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      onCloseModal();
                    }}
                    className="cursor-pointer"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.5875 0.423757C14.4834 0.319466 14.3598 0.236725 14.2237 0.180271C14.0876 0.123817 13.9417 0.0947577 13.7944 0.0947577C13.647 0.0947577 13.5011 0.123817 13.3651 0.180271C13.229 0.236725 13.1053 0.319466 13.0013 0.423757L7.50001 5.91376L1.99876 0.412507C1.8946 0.308353 1.77095 0.225733 1.63487 0.169364C1.49878 0.112996 1.35293 0.0839844 1.20563 0.0839844C1.05834 0.0839844 0.912481 0.112996 0.776396 0.169364C0.640311 0.225733 0.516662 0.308353 0.412507 0.412507C0.308353 0.516662 0.225733 0.640311 0.169364 0.776396C0.112996 0.912481 0.0839844 1.05834 0.0839844 1.20563C0.0839844 1.35293 0.112996 1.49878 0.169364 1.63487C0.225733 1.77095 0.308353 1.8946 0.412507 1.99876L5.91376 7.50001L0.412507 13.0013C0.308353 13.1054 0.225733 13.2291 0.169364 13.3651C0.112996 13.5012 0.0839844 13.6471 0.0839844 13.7944C0.0839844 13.9417 0.112996 14.0875 0.169364 14.2236C0.225733 14.3597 0.308353 14.4834 0.412507 14.5875C0.516662 14.6917 0.640311 14.7743 0.776396 14.8306C0.912481 14.887 1.05834 14.916 1.20563 14.916C1.35293 14.916 1.49878 14.887 1.63487 14.8306C1.77095 14.7743 1.8946 14.6917 1.99876 14.5875L7.50001 9.08626L13.0013 14.5875C13.1054 14.6917 13.2291 14.7743 13.3651 14.8306C13.5012 14.887 13.6471 14.916 13.7944 14.916C13.9417 14.916 14.0875 14.887 14.2236 14.8306C14.3597 14.7743 14.4834 14.6917 14.5875 14.5875C14.6917 14.4834 14.7743 14.3597 14.8306 14.2236C14.887 14.0875 14.916 13.9417 14.916 13.7944C14.916 13.6471 14.887 13.5012 14.8306 13.3651C14.7743 13.2291 14.6917 13.1054 14.5875 13.0013L9.08626 7.50001L14.5875 1.99876C15.015 1.57126 15.015 0.851258 14.5875 0.423757Z"
                        fill="#616161"
                      />
                    </svg>
                  </div>
                </ModalHeader>
                <ModalBody className="mx-3">
                  <div className="flex w-full flex-col gap-1">
                    {/* Parent Categories */}
                    <div className="mb-1 w-full">
                      <CustomSearchSelect
                        label="Category"
                        data={[
                          ...(ParentCategories ?? []).map((user) => ({
                            label: user.name,
                            value: user._id,
                          })),
                        ]}
                        onSelect={(value: string | any[], item: any) => {
                          if (typeof value === 'string') {
                            setSelectedParentId(value);
                          }
                        }}
                        searchPlaceholder="Search Category"
                        returnSingleValueWithLabel={true}
                        selected={[selectedParentId]}
                        hasError={false}
                        isRequired={true}
                        showImage={false}
                        multiple={false}
                        isOpen={openDropdown === 'dropdown1'}
                        onToggle={() => handleToggle('dropdown1')}
                      />
                    </div>

                    {/* Child Categories */}
                    <div className="mb-4 w-full">
                      <CustomSearchSelect
                        label="SubCategory (Optional)"
                        data={(ChildCategories ?? []).map((child) => ({
                          label: child.name,
                          value: child._id,
                        }))}
                        onSelect={(value: string | any[], item: any) => {
                          if (typeof value === 'string') {
                            setSelectedChildId(value);
                          }
                        }}
                        returnSingleValueWithLabel={true}
                        searchPlaceholder="Search subcategory"
                        selected={[selectedChildId]}
                        hasError={false}
                        multiple={false}
                        showImage={false}
                        isOpen={openDropdown === 'dropdown2'}
                        onToggle={() => handleToggle('dropdown2')}
                      />
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter className="border-t-2 border-gray-200">
                  <Button variant="primaryOutLine" onClick={onCloseModal}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    // disabled={!selectedParentId}
                    onClick={() => {
                      transferCategoryAssetMutation.mutate({
                        axiosAuth,
                        data: {
                          id: transferAssetCategory._id,
                          parentCategory: selectedParentId,
                          subCategory: selectedChildId,
                        },
                      });
                    }}
                  >
                    {transferCategoryAssetMutation.isLoading ? (
                      <Loader />
                    ) : (
                      'Transfer'
                    )}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

function groupCategories(categories: Category[]) {
  // Initialize a map for parent categories
  const grouped: Record<string, any> = {};
  const uncategorized: { assetsCount: number; categories: Category[] } = {
    assetsCount: 0,
    categories: [],
  };

  categories.forEach((category) => {
    if (category.isSubCategory) {
      // Handle subcategories
      if (category.parentCategory) {
        // If it has a parent, add it under the corresponding parent
        if (!grouped[category.parentCategory]) {
          grouped[category.parentCategory] = {
            parent: null,
            subcategories: [],
          };
        }
        grouped[category.parentCategory].subcategories.push(category);
      } else {
        // If no parent, add to uncategorized
        uncategorized.categories.push(category);
        uncategorized.assetsCount += category.assets.length;
      }
    } else {
      // Handle parent categories
      if (!grouped[category._id]) {
        grouped[category._id] = { parent: null, subcategories: [] };
      }
      grouped[category._id].parent = category;
    }
  });

  // Convert grouped data into a structured array
  const result = Object.values(grouped).map((group) => ({
    parent: group.parent,
    subcategories: group.subcategories,
  }));

  return { groupedCategories: result, uncategorized };
}
