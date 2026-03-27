import { useEffect, useMemo, useState } from 'react';
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
import { AMAPPACTIONTYPE, SR_APP_ACTION_TYPE } from '@/app/helpers/user/enums';

import { Search } from '@/components/Form/search';
import { Button } from '@/components/Buttons';

import { useAssetManagerAppsContext } from '@/app/(main)/(user-panel)/user/apps/am/am_context';
import {
  getAllChildCategoriesList,
  getAllParentCategoriesList,
  getAssetList,
  updateManyAsset,
} from '@/app/(main)/(user-panel)/user/apps/am/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useQueryClient, useQuery, useMutation } from 'react-query';
import Loader from '@/components/DottedLoader/loader';
import { useSession } from 'next-auth/react';
import { dateFormat } from '@/app/helpers/dateFormat';
import CreateAsset from './asset_components/Main_Create_Asset';
import { useRouter } from 'next/navigation';
import { is } from 'date-fns/locale';
import CustomInfoModal from '@/components/CustomDeleteModel';
import { SingleAsset } from '@/app/type/single_asset';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { set } from 'date-fns';
import { getTeams } from '@/app/(main)/(org-panel)/organization/teams/api';
import FilterButton from '@/components/TimeSheetApp/CommonComponents/FilterButton/FilterButton';
import { SimpleInput } from '@/components/Form/simpleInput';
import CustomModal from '@/components/Custom_Modal';
import { AssetStatus, OwnerShipStatus, RetirementMethod } from '../Enum';
import { getAllOrgUsers } from '@/app/(main)/(user-panel)/user/apps/api';
import DateRangePicker from '@/components/JobSafetyAnalysis/CreateNewComponents/JSA_Calender';
import UserCard from '@/components/UserCard';
import { PaginationComponent } from '@/components/pagination';
import { useTikiPagination } from '@/hooks/usePagination';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';
import AssetPDF from '@/components/pdfs/AssetPDF';
export function isWithinRange(date: Date, range: { from: Date; to: Date }) {
  return date >= range.from && date <= range.to;
}
export default function ManageAssetsScreen() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [hoveredUser, setHoveredUser] = useState<number | null>(null);
  const [isCheckInOutOpen, setIsCheckInOutOpen] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState('Last Modified');

  const { state, dispatch } = useAssetManagerAppsContext();
  const [isDeleteOpen, setIsDeleteOpen] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const deleteAssetMutation = useMutation(
    ({ id }: { id: string }) => axiosAuth.delete(`user/app/am/delete/${id}`),
    {
      onSuccess: (data) => {
        setIsDeleteOpen(null);
        queryClient.invalidateQueries('assetList');
      },
    }
  );
  // check function - topbar
  const handleToggleCheckInOut = () => {
    setIsCheckInOutOpen(!isCheckInOutOpen);
  };
  const handleSelectCheckInOut = (option: string) => {
    setSelectedCheck(option);
    setIsCheckInOutOpen(false);
  };

  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: 'assetList',
    queryFn: () => getAssetList({ axiosAuth, status: 'all' }),
  });
  const handleGoBack = () => {
    dispatch({
      type: AMAPPACTIONTYPE.SHOWPAGES,
    });
  };

  const handleDownloadPDF = async (item: SingleAsset) => {
    if (!item) {
      toast.error('No data available to generate PDF');
      return;
    }

    try {
      toast.loading('Generating PDF...', {
        className: 'text-primary-500',
      });

      const blob = await pdf(<AssetPDF data={item} />).toBlob();
      const fileName = `asset-${item.atnNum || item._id}.pdf`;

      saveAs(blob, fileName);

      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank');

      toast.remove();
      toast.success('PDF generated successfully');

      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 1000);
    } catch (error) {
      toast.remove();
      toast.error('Failed to generate PDF');
      console.error('Failed to generate PDF', error);
    }
  };

  ////////////// multiple selection section //////////////////////
  const [selectedSubmissions, setCheckedSubmissions] = useState<SingleAsset[]>(
    []
  );
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showBulkEditModel, setBulkEditModel] = useState(false);
  const [selectedBulkEditAction, setSelectedBulkEditAction] = useState<
    'inOut' | 'status' | 'category' | 'permission' | 'delete'
  >('inOut');
  const [applyBulkAction, setSelectedBulkAction] = useState<
    'inOut' | 'status' | 'category' | 'permission' | 'delete' | undefined
  >(undefined);
  const [checkInpermission, setCheckInPermission] = useState<'0' | '1'>('0');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  // seelcted section
  const [checkInOut, setCheckInOut] = useState<'in' | 'out' | undefined>(
    undefined
  );
  const { data: teams } = useQuery({
    queryKey: 'teams',
    queryFn: () => getTeams(axiosAuth),
  });
  const [selectedParentId, setSelectedParentId] = useState<string | null>();

  const [selectedChildId, setSelectedChildId] = useState<string | null>();
  const { data: ParentCategories } = useQuery({
    queryKey: 'pCategoreis',
    queryFn: () => getAllParentCategoriesList({ axiosAuth }),
    refetchOnWindowFocus: false,
  });

  //   ChildCategories
  const { data: ChildCategories } = useQuery(
    ['childCategories', selectedParentId], // Unique key tied to selectedParentId
    () => getAllChildCategoriesList({ axiosAuth, id: selectedParentId ?? '' }),

    {
      refetchOnWindowFocus: false,
      enabled: !!selectedParentId, // Only fetch if a parent category is selected
    }
  );
  const updateManyMutation = useMutation(updateManyAsset, {
    onSuccess: () => {
      setBulkEditModel(false), setSelectedBulkAction(undefined);
      handleCancel();
      queryClient.invalidateQueries('assetList');
    },
  });
  const handeleBulkAction = ({ data }: { data: any }) => {
    updateManyMutation.mutate({
      axiosAuth,
      data: {
        ids: selectedSubmissions.map((item: any) => item._id),
        ...data,
      },
    });
  };

  // healthy, out of order,maintainance / repair , lost / stolen, retired
  const [selectedBulkStatus, setSelectedBulkStatus] = useState<
    | 'healthy'
    | 'outOfOrder'
    | 'maintainance'
    | 'repair'
    | 'lost'
    | 'stolen'
    | 'retired'
    | undefined
  >(undefined);

  ////////
  const handleSelectAllChange = () => {
    if ((paginatedItems ?? []).length == (selectedSubmissions ?? []).length) {
      handleCancel();
    } else {
      setCheckedSubmissions([...(paginatedItems ?? [])]);
    }
  };
  const handleCancel = () => {
    setCheckedSubmissions([]);
    setIsSelectMode(false); // Exit select mode
  };
  const handleCheckboxChange = (js: SingleAsset) => {
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

  function checkDisable(): boolean | undefined {
    if (selectedBulkEditAction === 'inOut') {
      return !checkInOut;
    } else if (selectedBulkEditAction === 'status') {
      return !selectedBulkStatus;
    }
    if (!applyBulkAction) {
      return false;
    }
  }

  ///TODO filter Data /////////////

  const [isApplyFilter, setApplyFilter] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string>('');
  const [showFilterModel, setShowFilterModel] = useState(false);
  const [selectedAssetCheckInOut, setSelectedAssetCheckInOut] = useState<
    string[]
  >([]);
  const [selectedAssetStatus, setSelectedAssetStatus] = useState<string[]>([]);
  const [selectedAssetRef, setSelectedAssetRef] = useState('');
  const [filterParentCategory, setFilterParentCategory] = useState('');
  const [filterChildCategory, setFilterChildCategory] = useState('');
  const [filterOwenerShipStatus, setOwnerShipStatus] = useState('');
  const [filterRetirementMethod, setRetirementMethod] = useState('');
  const [filterCheckoutTo, setFilterCheckoutTo] = useState('');
  const [filterCheckinBy, setFilterCheckInBy] = useState('');

  const [filterCreatedDateRange, setCreatedDateRange] = useState<
    { from: Date; to: Date } | undefined
  >(undefined);
  const [filterLastModifiedDateRange, setLastModifiedDateRange] = useState<
    { from: Date; to: Date } | undefined
  >(undefined);
  const [filterPurchasedDateRange, setPurchasedDateRange] = useState<
    { from: Date; to: Date } | undefined
  >(undefined);
  const [filterWarrantyDateRange, setWarrantyDateRange] = useState<
    { from: Date; to: Date } | undefined
  >(undefined);
  const [filterRetirementDateRange, setRetirementDateRange] = useState<
    { from: Date; to: Date } | undefined
  >(undefined);
  const [filterTeam, setFilterTeams] = useState<string[]>([]);

  const [filterAssetName, setAssetName] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const { data: users } = useQuery({
    queryKey: 'listofUsersForApp',
    queryFn: () => getAllOrgUsers(axiosAuth),
    refetchOnWindowFocus: false,
  });
  const { data: assets } = useQuery({
    queryKey: 'checkInAssetList',
    queryFn: () => getAssetList({ axiosAuth, status: 'all' }),
  });

  const ownerShipStatus = Object.entries(OwnerShipStatus).map(
    ([key, value]) => ({
      label: value, // Label from Enum value
      value: value, // Key as unique identifier
    })
  );

  const asseetStatus = Object.entries(AssetStatus).map(([key, value]) => ({
    label: value, // Label from Enum value
    value: value, // Key as unique identifier
  }));

  const retirementMethod = Object.entries(RetirementMethod).map(
    ([key, value]) => ({
      label: value, // Label from Enum value
      value: value, // Key as unique identifier
    })
  );
  // Filter handling
  const clearFilters = () => {
    setSelectedAssetCheckInOut([]);
    setSelectedAssetStatus([]);
    setSearchQuery('');
    setSelectedAssetRef('');
    setAssetName('');
    setFilterParentCategory('');
    setFilterChildCategory('');
    setOwnerShipStatus('');
    setRetirementMethod('');
    setFilterCheckoutTo('');
    setCreatedDateRange(undefined);
    setLastModifiedDateRange(undefined);
    setPurchasedDateRange(undefined);
    setWarrantyDateRange(undefined);
    setRetirementDateRange(undefined);
    setFilterTeams([]);
    setFilterSupplier('');
    setApplyFilter(false);
    setOpenFilterDropdown('');
    setShowFilterModel(false);
    setFilterCheckInBy('');
  };

  const areFiltersApplied = () => {
    return (
      selectedAssetStatus.length > 0 ||
      selectedAssetCheckInOut.length > 0 ||
      selectedAssetRef.length > 0 ||
      filterAssetName.length > 0 ||
      filterParentCategory.length > 0 ||
      filterChildCategory.length > 0 ||
      filterOwenerShipStatus.length > 0 ||
      filterRetirementMethod.length > 0 ||
      filterCheckoutTo.length > 0 ||
      filterCreatedDateRange !== undefined ||
      filterLastModifiedDateRange !== undefined ||
      filterPurchasedDateRange !== undefined ||
      filterWarrantyDateRange !== undefined ||
      filterRetirementDateRange !== undefined ||
      filterTeam.length > 0 ||
      filterSupplier.length > 0 ||
      filterCheckinBy.length > 0
    );
  };

  const handleApplyFilters = () => {
    setShowFilterModel(!showFilterModel);
    if (areFiltersApplied()) {
      setApplyFilter(true);
    }
  };

  // Sort and filter data - newest to oldest
  const sortedAndFilteredData = useMemo(() => {
    const filtered = (data ?? []).filter((asset) => {
      const nameMatches = asset.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (!nameMatches) return false;

      if (isApplyFilter) {
        if (
          filterTeam.length > 0 &&
          !(asset.selectedTeams ?? []).some((t) => filterTeam.includes(t))
        )
          return false;

        if (
          selectedAssetStatus.length > 0 &&
          !selectedAssetStatus.includes(asset.status?.toLowerCase() ?? '')
        )
          return false;

        if (
          selectedAssetCheckInOut.length > 0 &&
          !selectedAssetCheckInOut.includes(
            asset.isCheckedOut ? 'Checked Out' : 'Checked In'
          )
        )
          return false;

        if (
          selectedAssetRef &&
          !asset.reference
            ?.toLowerCase()
            .includes(selectedAssetRef.toLowerCase())
        )
          return false;

        if (
          filterOwenerShipStatus &&
          asset.ownerShipStatus !== filterOwenerShipStatus
        )
          return false;

        if (
          filterRetirementMethod &&
          asset.retirementMethod !== filterRetirementMethod
        )
          return false;

        if (
          filterCheckoutTo &&
          !(asset.checkedOutBy ?? []).includes(filterCheckoutTo)
        )
          return false;

        if (filterCheckinBy && asset.lastCheckedInBy?._id !== filterCheckinBy)
          return false;

        if (
          filterParentCategory &&
          asset.category?._id !== filterParentCategory
        )
          return false;

        if (
          filterChildCategory &&
          asset.subcategory?._id !== filterChildCategory
        )
          return false;

        if (
          filterAssetName &&
          !asset.name.toLowerCase().includes(filterAssetName.toLowerCase())
        )
          return false;

        if (
          filterSupplier &&
          !(asset.vendor ?? '')
            .toLowerCase()
            .includes(filterSupplier.toLowerCase())
        )
          return false;

        if (
          filterCreatedDateRange &&
          !isWithinRange(new Date(asset.createdAt), filterCreatedDateRange)
        )
          return false;

        if (
          filterLastModifiedDateRange &&
          !isWithinRange(new Date(asset.updatedAt), filterLastModifiedDateRange)
        )
          return false;

        if (
          filterPurchasedDateRange &&
          !isWithinRange(new Date(asset.purchaseDate), filterPurchasedDateRange)
        )
          return false;

        if (
          filterWarrantyDateRange &&
          asset.expireDate &&
          !isWithinRange(new Date(asset.expireDate), filterWarrantyDateRange)
        )
          return false;

        if (
          filterRetirementDateRange &&
          asset.retirementDate &&
          !isWithinRange(
            new Date(asset.retirementDate),
            filterRetirementDateRange
          )
        )
          return false;
      }

      return true;
    });

    // Sort by createdAt descending (newest first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  }, [
    data,
    searchQuery,
    isApplyFilter,
    filterTeam,
    selectedAssetStatus,
    selectedAssetCheckInOut,
    selectedAssetRef,
    filterOwenerShipStatus,
    filterRetirementMethod,
    filterCheckoutTo,
    filterCheckinBy,
    filterParentCategory,
    filterChildCategory,
    filterAssetName,
    filterSupplier,
    filterCreatedDateRange,
    filterLastModifiedDateRange,
    filterPurchasedDateRange,
    filterWarrantyDateRange,
    filterRetirementDateRange,
  ]);

  const {
    currentPage,
    totalPages,
    paginatedItems,
    itemsPerPage,
    handlePageChange,
  } = useTikiPagination(sortedAndFilteredData ?? [], 10);
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
                Manage Assets
              </div>

              <div className="flex items-center">
                {/* DropDown Custom | CheckInOut */}
                <div className="DropDownn relative z-50 mx-3 inline-block text-left">
                  <div>
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center gap-1 rounded-md border border-gray-300 bg-[#E2F3FF] px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-[#e1f0fa] focus:outline-none"
                      id="options-menu"
                      aria-expanded="true"
                      aria-haspopup="true"
                      onClick={handleToggleCheckInOut}
                    >
                      {selectedCheck}
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
                  {isCheckInOutOpen && (
                    <div
                      className="absolute left-0 z-50 mt-2 w-56 origin-top-left rounded-md bg-[#E2F3FF] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="options-menu"
                    >
                      <div className="py-1" role="none">
                        <button
                          onClick={() => handleSelectCheckInOut('Last Modifed')}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          Last Modified
                        </button>
                        <button
                          onClick={() => handleSelectCheckInOut('Create Date')}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          Create Date
                        </button>
                        <button
                          onClick={() =>
                            handleSelectCheckInOut('Purchase Date')
                          }
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          Purchase Date
                        </button>
                        <button
                          onClick={() =>
                            handleSelectCheckInOut('Warrantry Expire')
                          }
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          Warrantry Expire
                        </button>
                      </div>
                    </div>
                  )}
                </div>

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
            <>
              <Loader />
            </>
          ) : (
            <table className="mt-3 w-full border-collapse font-Open-Sans">
              <thead className="bg-[#F5F5F5] text-left text-sm font-semibold text-[#616161]">
                <tr>
                  <th className="px-2 py-3">Asset Tag No.</th>
                  <th className="px-2 py-3 md:flex">
                    Asset Name
                    <img
                      src="/images/fluent_arrow-sort-24-regular.svg"
                      className="cursor-pointer px-1"
                      alt="image"
                    />
                  </th>
                  <th className="hidden px-2 py-3 md:table-cell">
                    Check out to
                  </th>

                  <th className="px-2 py-3">Check in / out</th>
                  <th className="px-2 py-3">Asset Status</th>

                  <th className="hidden px-2 py-3 md:flex">
                    {'Date'}
                    <img
                      src="/images/fluent_arrow-sort-24-regular.svg"
                      className="cursor-pointer px-1"
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
                              (paginatedItems ?? []).length ==
                              (selectedSubmissions ?? []).length
                                ? 'border-[#6990FF] bg-[#6990FF] checked:border-[#6990FF] checked:bg-[#6990FF]'
                                : 'border-[#9E9E9E] bg-white'
                            } transition-colors duration-200 ease-in-out`}
                            onChange={handleSelectAllChange}
                          />
                          {(paginatedItems ?? []).filter(
                            (item) =>
                              item.submittedBy?._id === session?.user.user._id
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
                {(paginatedItems ?? []).map((item, index) => {
                  return (
                    <tr
                      key={item._id}
                      className="relative cursor-pointer border-b even:bg-[#F5F5F5]"
                    >
                      <td
                        className="cursor-pointer px-4 py-2 text-primary-400"
                        onClick={() => {
                          router.push(
                            `/user/apps/am/${state.appId}/${item._id}`
                          );
                        }}
                      >
                        {item.atnNum}
                      </td>

                      <td className="text-[#616161 w-72 px-2 py-2">
                        {item.name}
                      </td>

                      <td className="hidden px-4 py-2 md:table-cell">
                        {item.lastCheckedOutBy && item.isCheckedOut && (
                          <UserCard
                            submittedBy={item.lastCheckedOutBy}
                            index={0}
                          />
                        )}
                      </td>
                      <td className="hidden items-center p-2 md:flex">
                        {checkInOutStatus(item?.isCheckedOut ?? false)}
                      </td>

                      <td className="items-center p-2">
                        {checkAssetStatus(item?.status ?? 'Healthy')}
                      </td>

                      <td className="px-2 py-2">
                        <div>
                          {dateFormat(item.createdAt?.toString() ?? '')}
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
                                  key="edit"
                                  onClick={() => {
                                    dispatch({
                                      type: AMAPPACTIONTYPE.SHOW_ASSET_EDIT_MODEL,
                                      is_asset_edit: item._id,
                                      create_asset_payload: {
                                        name: item.name,
                                        reference: item.reference,
                                        description: item.description,
                                        category: {
                                          label: item.category?.name,
                                          value: item.category?._id,
                                        },
                                        subcategory: {
                                          label: item.subcategory?.name,
                                          value: item.subcategory?._id,
                                        },
                                        invoiceNumber: item.invoiceNumber,
                                        make: item.make,
                                        model: item.model,
                                        serialNumber: item.serialNumber,
                                        vendor: item.vendor,
                                        ownerShipStatus: item.ownerShipStatus,
                                        authorizedBy: item.authorizedBy,
                                        purchaseDate: item.purchaseDate,
                                        expireDate: item.expireDate,
                                        purchasePrice: item.purchasePrice,
                                        purchaseNote: item.purchaseNote,
                                        assetLocation: item.assetLocation,
                                        retirementDate: item.retirementDate,
                                        retirementMethod: {
                                          label: item.retirementMethod,
                                          value: item.retirementMethod,
                                        },
                                        serviceProvider: item.serviceProvider,
                                        checkInpermission:
                                          item.checkInpermission,
                                      },
                                      forEditassetsImages: item.photos,
                                      show_asset_create_model: 'detail',
                                    });
                                  }}
                                >
                                  Edit
                                </DropdownItem>
                                <DropdownItem
                                  key="pdf"
                                  onClick={() => {
                                    handleDownloadPDF(item);
                                  }}
                                >
                                  View PDF
                                </DropdownItem>
                                <DropdownItem
                                  key="delete"
                                  onClick={() => {
                                    setIsDeleteOpen(item._id);
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

          <div className="fixed bottom-40 left-1/2 z-10 mx-auto w-full max-w-[1360px] -translate-x-1/2 transform">
            <div className="flex justify-end">
              <Button
                variant="primaryRounded"
                onClick={() => {
                  dispatch({
                    type: AMAPPACTIONTYPE.SHOW_ASSET_CREATE_MODEL,
                    show_asset_create_model: 'detail',
                  });
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
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={function (page: number): void {
                  handlePageChange(page);
                }}
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
                      setBulkEditModel(!showBulkEditModel);
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
      {state.show_asset_create_model && <CreateAsset />}
      {isDeleteOpen && (
        <CustomInfoModal
          title={'Delete Asset'}
          subtitle="Are you sure you want to delete this asset? This action cannot be undone."
          handleClose={() => {
            setIsDeleteOpen(null);
          }}
          onDeleteButton={() => {
            deleteAssetMutation.mutate({ id: isDeleteOpen });
          }}
          doneValue={
            <>{deleteAssetMutation.isLoading ? <Loader /> : 'Delete'}</>
          }
        />
      )}
      {/* ///////////// Bulk Edit Setting Modal ///////////// */}

      <Modal
        isOpen={showBulkEditModel}
        onOpenChange={() => {
          setBulkEditModel(!showBulkEditModel),
            setSelectedBulkAction(undefined);
          handleCancel();
        }}
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
                {/* "inOut" | "status" | "category" | "permission" | "delete" */}
                {applyBulkAction === undefined && (
                  <>
                    <div className="mb-8 flex flex-col space-y-4 p-2">
                      {/* inOut */}
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="option"
                          checked={selectedBulkEditAction == 'inOut'}
                          onChange={() => setSelectedBulkEditAction('inOut')}
                          className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                        />
                        <span className="ml-2">Check in / out</span>
                      </label>
                      {/* ///// Asset Status //// */}
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="option"
                          checked={selectedBulkEditAction == 'status'}
                          onChange={() => setSelectedBulkEditAction('status')}
                          className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                        />
                        <span className="ml-2">Asset Status</span>
                      </label>
                      {/* ///// Asset Category //// */}
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="option"
                          checked={selectedBulkEditAction == 'category'}
                          onChange={() => setSelectedBulkEditAction('category')}
                          className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                        />
                        <span className="ml-2">Asset Category</span>
                      </label>
                      {/* check in out permission  */}
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="option"
                          checked={selectedBulkEditAction == 'permission'}
                          onChange={() =>
                            setSelectedBulkEditAction('permission')
                          }
                          className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                        />
                        <span className="ml-2">Check in / out permission</span>
                      </label>
                      {/* delete */}
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="option"
                          checked={selectedBulkEditAction == 'delete'}
                          onChange={() => setSelectedBulkEditAction('delete')}
                          className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                        />
                        <span className="ml-2">Delete Assets</span>
                      </label>
                    </div>
                  </>
                )}

                {applyBulkAction == 'inOut' && (
                  <div className="mb-8 flex flex-col space-y-4 p-2">
                    <div className="relative">
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
                        onSelect={(selected) => {
                          if (selected.length > 0) {
                            setCheckInOut(selected[0]); // Ensure 'selected[0].value' is "in" or "out"
                          } else {
                            setCheckInOut(undefined); // Reset to undefined if no selection
                          }
                        }}
                        selected={checkInOut ? [checkInOut] : []}
                        isRequired
                        searchPlaceholder="Search Current Project"
                        multiple={false}
                        showImage={false}
                        showSearch={false}
                        isOpen={openDropdown === 'dropdown1'}
                        onToggle={() => handleToggle('dropdown1')}
                      />
                    </div>
                  </div>
                )}
                {applyBulkAction == 'status' && (
                  <>
                    <div className="mb-8 flex flex-col space-y-4 p-2">
                      <div className="relative">
                        <CustomSearchSelect
                          label="Asset Status"
                          data={[
                            /// healthy, out of order,maintainance / repair , lost / stolen, retired
                            {
                              label: 'Healthy',
                              value: 'Healthy',
                            },
                            {
                              label: 'Out of Order',
                              value: 'Out of Order',
                            },
                            {
                              label: 'Maintainance / Repair',
                              value: 'Maintainance / Repair',
                            },
                            {
                              label: 'Lost / Stolen',
                              value: 'Lost / Stolen',
                            },
                            {
                              label: 'Retired',
                              value: 'Retired',
                            },
                          ]}
                          onSelect={(selected) => {
                            if (selected.length > 0) {
                              setSelectedBulkStatus(selected[0]); // Ensure 'selected[0].value' is "in" or "out"
                            } else {
                              setSelectedBulkStatus(undefined); // Reset to undefined if no selection
                            }
                          }}
                          selected={
                            selectedBulkStatus ? [selectedBulkStatus] : []
                          }
                          isRequired
                          searchPlaceholder="Search Current Project"
                          multiple={false}
                          showImage={false}
                          showSearch={false}
                          isOpen={openDropdown === 'dropdown1'}
                          onToggle={() => handleToggle('dropdown1')}
                        />
                      </div>
                    </div>
                  </>
                )}
                {applyBulkAction == 'category' && (
                  <>
                    <div className="my-4 flex w-full flex-col gap-2 overflow-y-scroll pb-24">
                      {/* Parent Categories */}
                      <div className="w-full">
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
                          isRequired={true} // Set isRequired to true
                          showImage={false}
                          multiple={false}
                          isOpen={openDropdown === 'dropdown1'}
                          onToggle={() => handleToggle('dropdown1')}
                        />
                      </div>

                      {/* Child Categories */}
                      <div className="w-full">
                        <CustomSearchSelect
                          label="Select subCategory (optional)"
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
                  </>
                )}
                {applyBulkAction == 'permission' && (
                  <>
                    <div className="px-3">
                      <div className="mb-4 flex flex-col space-y-4 p-2">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="option"
                            checked={checkInpermission == '0'}
                            onChange={() => setCheckInPermission('0')}
                            className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                          />
                          <span className="ml-2">All Organization Users</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="option"
                            checked={checkInpermission == '1'}
                            onChange={() => setCheckInPermission('1')}
                            className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                          />
                          <span className="ml-2">Selected Teams</span>
                        </label>
                      </div>

                      {checkInpermission == '1' && (
                        <div className="mb-4">
                          <CustomSearchSelect
                            label="Select Organization Team(s)"
                            data={[
                              {
                                label: 'Everyone',
                                value: 'all',
                              },
                              ...(teams ?? []).map((team) => ({
                                label: team.name ?? '',
                                value: team._id,
                              })),
                            ]}
                            onSelect={(values) => {
                              if (values.length > 0) {
                                setSelectedTeams(values);
                              } else {
                                setSelectedTeams([]);
                              }
                            }}
                            selected={selectedTeams}
                            hasError={false}
                            placeholder="Search Organization Teams"
                            showImage={false}
                            multiple={true}
                            isOpen={openDropdown === 'dropdown9'}
                            onToggle={() => handleToggle('dropdown9')}
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </ModalBody>
              <ModalFooter className="border-t-2 border-gray-200">
                {applyBulkAction == undefined && (
                  <div className="flex flex-row gap-4">
                    <Button variant="primaryOutLine" onClick={onCloseModal}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        if (selectedBulkEditAction == 'delete') {
                          setBulkEditModel(!showBulkEditModel);
                        }
                        setSelectedBulkAction(selectedBulkEditAction);
                      }}
                    >
                      Next
                    </Button>
                  </div>
                )}
                {applyBulkAction && (
                  <div className="flex flex-row gap-4">
                    <Button
                      variant="primaryOutLine"
                      onClick={() => setSelectedBulkAction(undefined)}
                    >
                      Back
                    </Button>
                    <Button
                      disabled={checkDisable()}
                      variant="primary"
                      onClick={() => {
                        if (applyBulkAction == 'inOut') {
                          if (checkInOut == 'in') {
                            handeleBulkAction({
                              data: {
                                isCheckedOut: false,
                                lastCheckedInBy: session?.user.user._id,
                              },
                            });
                          } else {
                            handeleBulkAction({
                              data: {
                                isCheckedOut: true,
                                lastCheckedOutBy: session?.user.user._id,
                              },
                            });
                          }
                        } else if (applyBulkAction == 'permission') {
                          handeleBulkAction({
                            data: {
                              checkInpermission: checkInpermission, // 0 = No, 1 = Yes
                              teams: selectedTeams ?? [],
                            },
                          });
                        } else if (applyBulkAction == 'status') {
                          handeleBulkAction({
                            data: {
                              status: selectedBulkStatus,
                            },
                          });
                        } else if (applyBulkAction == 'category') {
                          handeleBulkAction({
                            data: selectedChildId
                              ? {
                                  category: selectedParentId, // Replace with the actual category ObjectId
                                  subcategory: selectedChildId,
                                }
                              : {
                                  category: selectedParentId, // Replace with the actual category ObjectId
                                },
                          });
                        }
                      }}
                    >
                      {updateManyMutation.isLoading ? <Loader /> : <>Confirm</>}
                    </Button>
                  </div>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* ////// selected Model /////// */}
      {/* applyBulkAction */}
      {applyBulkAction === 'delete' && (
        <CustomInfoModal
          doneValue={updateManyMutation.isLoading ? <Loader /> : <>Delete</>}
          handleClose={() => {
            setBulkEditModel(!showBulkEditModel),
              setSelectedBulkAction(undefined);
            handleCancel();
          }}
          onDeleteButton={() => {
            handeleBulkAction({
              data: {
                deletedAt: new Date(),
              },
            });
          }}
          subtitle="Are you sure you want to delete this Discussion Topic. This action cannot be undone."
          title={`Delete (${selectedSubmissions.length}) Discussion Topics`}
        />
      )}

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
              <ModalHeader className="flex flex-row items-start justify-between gap-2 border-b-2 border-gray-200 px-1 py-5">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-semibold">Filter By</h2>
                  <p className="mt-1 text-sm font-normal text-[#616161]">
                    Filter by the following selections and options.
                  </p>
                </div>
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
              </ModalHeader>
              <ModalBody className="flex flex-col justify-start gap-3 overflow-y-scroll p-0 pb-16 pt-8 scrollbar-hide">
                <h2 className="text-lg font-semibold">Status</h2>
                <div className="w-full">
                  <CustomSearchSelect
                    label="Asset Status"
                    data={[
                      {
                        label: 'All Statuses',
                        value: 'all',
                      },
                      ...asseetStatus,
                    ]}
                    showImage={false}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown1'}
                    onToggle={() => handleToggle('dropdown1')}
                    onSelect={(selected: string[]) => {
                      setSelectedAssetStatus(selected);
                    }}
                    selected={selectedAssetStatus}
                    placeholder="-"
                  />
                </div>
                <div className="w-full">
                  <CustomSearchSelect
                    label="Check in / out"
                    data={[
                      {
                        label: 'All',
                        value: 'all',
                      },
                      {
                        label: 'Check in',
                        value: 'in',
                      },
                      {
                        label: 'Check out',
                        value: 'out',
                      },
                    ]}
                    showImage={false}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown2'}
                    onToggle={() => handleToggle('dropdown2')}
                    onSelect={(selected: string[]) =>
                      setSelectedAssetCheckInOut(selected)
                    }
                    selected={selectedAssetCheckInOut}
                    placeholder="-"
                  />
                </div>
                <h2 className="text-lg font-semibold">Asset Detail</h2>
                <SimpleInput
                  type="text"
                  label="Asset Name"
                  placeholder="Enter Asset Name"
                  name="emailAddress"
                  className="w-full"
                  value={filterAssetName}
                  onChange={(e) => {
                    setAssetName(e.target.value);
                  }}
                />
                <SimpleInput
                  type="text"
                  label="Reference"
                  placeholder="Enter Reference"
                  name="emailAddress"
                  className="w-full"
                  value={selectedAssetRef}
                  onChange={(e) => {
                    setSelectedAssetRef(e.target.value);
                  }}
                />
                <div className="w-full">
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
                        setFilterParentCategory(value);
                      }
                    }}
                    searchPlaceholder="Search Category"
                    returnSingleValueWithLabel={true}
                    selected={
                      filterParentCategory ? [filterParentCategory] : []
                    }
                    hasError={false}
                    isRequired={true} // Set isRequired to true
                    showImage={false}
                    multiple={false}
                    isOpen={openDropdown === 'dropdown3'}
                    onToggle={() => handleToggle('dropdown3')}
                  />
                </div>
                <div className="w-full">
                  <CustomSearchSelect
                    label="Select subCategory (optional)"
                    data={(ChildCategories ?? []).map((child) => ({
                      label: child.name,
                      value: child._id,
                    }))}
                    onSelect={(value: string | any[], item: any) => {
                      if (typeof value === 'string') {
                        setFilterChildCategory(value);
                      }
                    }}
                    returnSingleValueWithLabel={true}
                    searchPlaceholder="Search subcategory"
                    selected={filterChildCategory ? [filterChildCategory] : []}
                    hasError={false}
                    multiple={false}
                    showImage={false}
                    isOpen={openDropdown === 'dropdown4'}
                    onToggle={() => handleToggle('dropdown4')}
                  />
                </div>
                <div className="relative mb-4 w-full">
                  <CustomSearchSelect
                    label="OwnerShip Status"
                    data={ownerShipStatus}
                    onSelect={(value) => {
                      if (typeof value === 'string') {
                        setOwnerShipStatus(value);
                      }
                    }}
                    returnSingleValueWithLabel={true}
                    selected={
                      filterOwenerShipStatus ? [filterOwenerShipStatus] : []
                    }
                    hasError={false}
                    multiple={false}
                    showImage={false}
                    searchPlaceholder="Select OwnerShip Status"
                    placeholder="-Select OwnerShip Status-"
                    isOpen={openDropdown === 'dropdown5'}
                    onToggle={() => handleToggle('dropdown5')}
                  />
                </div>
                <h2 className="text-lg font-semibold">People</h2>
                <div className="relative mb-4 w-full">
                  <CustomSearchSelect
                    label="Checked out to"
                    data={[
                      {
                        label: 'All',
                        value: 'all',
                      },
                      ...(users ?? []).map((user) => ({
                        label:
                          user._id === session?.user.user._id
                            ? 'Me'
                            : `${user.firstName} ${user.lastName}`,
                        value: user._id,
                        photo: user.photo,
                      })),
                    ]}
                    onSelect={(value) => {
                      if (typeof value === 'string') {
                        setFilterCheckoutTo(value);
                      }
                    }}
                    returnSingleValueWithLabel={true}
                    selected={filterCheckoutTo ? [filterCheckoutTo] : []}
                    hasError={false}
                    multiple={false}
                    showImage={false}
                    searchPlaceholder="Search Users, Customers, Suppliers"
                    placeholder="-"
                    isOpen={openDropdown === 'dropdown6'}
                    onToggle={() => handleToggle('dropdown6')}
                  />
                </div>
                <div className="relative mb-4 w-full">
                  <CustomSearchSelect
                    label="Last Checked in by"
                    data={[
                      {
                        label: 'All',
                        value: 'all',
                      },
                      ...(users ?? []).map((user) => ({
                        label:
                          user._id === session?.user.user._id
                            ? 'Me'
                            : `${user.firstName} ${user.lastName}`,
                        value: user._id,
                        photo: user.photo,
                      })),
                    ]}
                    onSelect={(value) => {
                      if (typeof value === 'string') {
                        setFilterCheckInBy(value);
                      }
                    }}
                    returnSingleValueWithLabel={true}
                    selected={filterCheckinBy ? [filterCheckinBy] : []}
                    hasError={false}
                    multiple={false}
                    showImage={false}
                    searchPlaceholder="Search Users, Customers, Suppliers"
                    placeholder="-"
                    isOpen={openDropdown === 'dropdown7'}
                    onToggle={() => handleToggle('dropdown7')}
                  />
                </div>
                <h2 className="text-lg font-semibold">Dates</h2>
                <div className="relative mb-6">
                  <DateRangePicker
                    title={'Created Date Range'}
                    isForFilter={true}
                    selectedDate={filterCreatedDateRange}
                    handleOnConfirm={(from: any, to: any) => {
                      setCreatedDateRange({ from, to });
                    }}
                  />
                </div>
                <div className="relative mb-6">
                  <DateRangePicker
                    title={'Last Modified Date Range'}
                    isForFilter={true}
                    selectedDate={filterLastModifiedDateRange}
                    handleOnConfirm={(from: any, to: any) => {
                      setLastModifiedDateRange({ from, to });
                    }}
                  />
                </div>
                <div className="relative mb-6">
                  <DateRangePicker
                    title={'Purchase Date'}
                    isForFilter={true}
                    selectedDate={filterPurchasedDateRange}
                    handleOnConfirm={(from: any, to: any) => {
                      setPurchasedDateRange({ from, to });
                    }}
                  />
                </div>
                <div className="relative mb-6">
                  <DateRangePicker
                    title={'Warranty Expiry Date'}
                    isForFilter={true}
                    selectedDate={filterWarrantyDateRange}
                    handleOnConfirm={(from: any, to: any) => {
                      setWarrantyDateRange({ from, to });
                    }}
                  />
                </div>
                <div className="relative mb-6">
                  <DateRangePicker
                    title={'Retirement Date'}
                    isForFilter={true}
                    selectedDate={filterRetirementDateRange}
                    handleOnConfirm={(from: any, to: any) => {
                      setRetirementDateRange({ from, to });
                    }}
                  />
                </div>
                <h2 className="text-lg font-semibold">
                  Check in / out permissions
                </h2>
                <div className="relative mb-4 w-full">
                  <CustomSearchSelect
                    label="Select Team (s)"
                    data={[
                      {
                        label: 'Everyone',
                        value: 'all',
                      },
                      ...(teams ?? []).map((team) => ({
                        label: team.name ?? '',
                        value: team._id,
                      })),
                    ]}
                    onSelect={(value: any) => {
                      setFilterTeams(value);
                    }}
                    selected={filterTeam}
                    hasError={false}
                    multiple={true}
                    showImage={false}
                    searchPlaceholder="Search Users, Customers, Suppliers"
                    placeholder="-"
                    isOpen={openDropdown === 'dropdown8'}
                    onToggle={() => handleToggle('dropdown8')}
                  />
                </div>
                <h2 className="text-lg font-semibold">
                  Maintenance Service Provider
                </h2>
                <div className="relative mb-4 w-full">
                  <CustomSearchSelect
                    label="Select Supplier"
                    data={[
                      {
                        label: 'All',
                        value: 'all',
                      },
                      ...(users ?? [])
                        .filter((u) => u.role === 5)
                        .map((user) => ({
                          label: `${user.firstName} ${user.lastName}`,
                          value: user._id,
                          photo: user.photo,
                        })),
                    ]}
                    onSelect={(value) => {
                      if (typeof value === 'string') {
                        setFilterSupplier(value);
                      }
                    }}
                    returnSingleValueWithLabel={true}
                    selected={filterSupplier ? [filterSupplier] : []}
                    hasError={false}
                    multiple={false}
                    showImage={false}
                    searchPlaceholder="Search Users, Customers, Suppliers"
                    placeholder="-"
                    isOpen={openDropdown === 'dropdown7'}
                    onToggle={() => handleToggle('dropdown7')}
                  />
                </div>
                <h2 className="text-lg. font-semibold">Retirement Method</h2>
                <CustomSearchSelect
                  label="Retirement Method"
                  data={retirementMethod}
                  onSelect={(value, label) => {
                    if (typeof value === 'string') {
                      setRetirementDateRange(value);
                    }
                  }}
                  returnSingleValueWithLabel={true}
                  selected={
                    filterRetirementMethod ? [filterRetirementMethod] : []
                  }
                  hasError={false}
                  placeholder="-"
                  searchPlaceholder="Search Retirement Method"
                  multiple={false}
                  showImage={false}
                  isOpen={openDropdown === 'dropdown7'}
                  onToggle={() => handleToggle('dropdown7')}
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
export function checkInOutStatus(isCheckedOut: boolean) {
  if (!isCheckedOut) {
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
export function checkAssetStatus(status: string) {
  const statusMap: Record<string, { label: string; color: string }> = {
    Healthy: { label: 'Healthy', color: '#28A745' },
    'Out of Order': { label: 'Out of Order', color: '#DC3545' },
    'Maintenance / Repair': { label: 'Maintenance / Repair', color: '#DFAC13' },
    'Lost / Stolen': { label: 'Lost / Stolen', color: '#4E7496' },
    Retired: { label: 'Retired', color: '#656565' },
  };

  const current = statusMap[status] ?? {
    label: status,
    color: '#6c757d', // default gray
  };

  return (
    <span
      className="rounded-md px-2 py-1 text-sm text-white"
      style={{ backgroundColor: current.color }}
    >
      {current.label}
    </span>
  );
}
