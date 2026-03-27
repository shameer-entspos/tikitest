import { useMemo, useState } from 'react';

import { AMAPPACTIONTYPE, SR_APP_ACTION_TYPE } from '@/app/helpers/user/enums';

import { Search } from '@/components/Form/search';

import { useAssetManagerAppsContext } from '@/app/(main)/(user-panel)/user/apps/am/am_context';
import * as Yup from 'yup';
import { Button } from '@/components/Buttons';
import CustomModal from '@/components/Custom_Modal';
import AddPendingServiceLog from './Add_Log_Pending_Service';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  createManyPendingServiceLog,
  createPendingServiceLog,
  getAllPendingService,
  getAssetList,
  updateManyServiceSchedule,
  getCustomersList,
} from '@/app/(main)/(user-panel)/user/apps/am/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { dateFormat } from '@/app/helpers/dateFormat';
import { ServiceSchedule } from '@/app/type/group_service_schedule';
import CustomDateRangePicker from '@/components/customDatePicker';
import { SimpleInput } from '@/components/Form/simpleInput';
import ServiceLogImageUpload from './service_log_image_upload';
import Loader from '@/components/DottedLoader/loader';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { getAllOrgUsers } from '@/app/(main)/(user-panel)/user/apps/api';
import { useFormik } from 'formik';
import FilterButton from '@/components/TimeSheetApp/CommonComponents/FilterButton/FilterButton';
import { useTikiPagination } from '@/hooks/usePagination';
import { PaginationComponent } from '@/components/pagination';
import { customSortFunction } from '@/app/helpers/re-use-func';
import UserCard from '@/components/UserCard';
import { ViewGroupServiceScheduleModel } from '../Group_Service_Schedule/View_Service_Schedule';
import { uploadImageToApp } from '@/components/apps/shared/appImageUpload';
import { useStagedImageUploads } from '@/components/apps/shared/useStagedImageUploads';

export default function PendingServicesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredUser, setHoveredUser] = useState<number | null>(null);

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
    'View All' | 'Overdue' | 'Due Today' | 'Upcoming'
  >('View All');
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('desc');
  const { state, dispatch } = useAssetManagerAppsContext();
  const [showServiceLogModel, setServiceLogModel] = useState(false);
  const [selectedServiceSchedule, setSelectedServiceSchedule] = useState<
    ServiceSchedule | undefined
  >(undefined);
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: 'pendingserviceSchedule',
    queryFn: () =>
      getAllPendingService({
        axiosAuth,
      }),
  });

  // view dorpdown function - topbars
  const handleToggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleSelectOption = (
    option: 'View All' | 'Overdue' | 'Due Today' | 'Upcoming'
  ) => {
    setSelectedOption(option);
    setDropdownOpen(false);
  };

  const { data: assets } = useQuery({
    queryKey: 'checkInAssetList',
    queryFn: () => getAssetList({ axiosAuth, status: 'all' }),
  });
  const handleGoBack = () => {
    dispatch({
      type: AMAPPACTIONTYPE.SHOWPAGES,
      showPages: 'servicing',
    });
  };
  //// multiple selection ////
  const [selectedSubmissions, setCheckedSubmissions] = useState<
    ServiceSchedule[]
  >([]);

  const [showBulkModel, setBulkModel] = useState(false);
  const [multiAction, setMultiAction] = useState<'log' | 'complete'>('log');
  const handleSelectAllChange = () => {
    if ((filterservices ?? []).length == (selectedSubmissions ?? []).length) {
      handleCancel();
    } else {
      setCheckedSubmissions(filterservices ?? []);
    }
  };
  const handleCancel = () => {
    setCheckedSubmissions([]);
    setIsSelectMode(false); // Exit select mode
  };
  const handleCheckboxChange = (js: ServiceSchedule) => {
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
  ///////////////// Pending Service /////////////////////////
  const [opendown, setODropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setODropdown(opendown === dropdownId ? null : dropdownId);
  };
  const [selectedService, setSelectedService] = useState<
    ServiceSchedule | undefined
  >(undefined);
  // createSeriveSchedule
  const createSeriveSchedule = useMutation(createPendingServiceLog, {
    onSuccess: () => {
      setServiceLogModel(false);
      setSelectedService(undefined);
      queryClient.invalidateQueries('pendingserviceSchedule');
    },
  });
  const createManySeriveSchedule = useMutation(createManyPendingServiceLog, {
    onSuccess: () => {
      handleCancel();
      setServiceLogModel(false);
      setSelectedService(undefined);
      queryClient.invalidateQueries('pendingserviceSchedule');
    },
  });
  const updateManySchedule = useMutation(updateManyServiceSchedule, {
    onSuccess: () => {
      handleCancel();
      setServiceLogModel(false);
      setSelectedService(undefined);
      queryClient.invalidateQueries('pendingserviceSchedule');
    },
  });
  const [selectedVenderId, setSelectedVenderId] = useState<string | null>(null);
  const [selectedProjectStatus, setSelectedProjectStatus] =
    useState<string>('');
  // Validation schema
  const appFormValidatorSchema = Yup.object().shape({
    vendor: Yup.string().required('Vendor is required'), // Vendor validation
    serviceDate: Yup.date().nullable().required('Service date is required'), // Allow null until selected
  });

  /// filters /////////////

  const [isApplyFilter, setApplyFilter] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string>('');
  const [showFilterModel, setShowFilterModel] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string>('');
  const [selectedManager, setSelectedManagers] = useState<string[]>([]);
  const [selectedTagged, setSelectedTagged] = useState<string[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedServiceName, setServiceName] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const stagedUploads = useStagedImageUploads({
    existingCount: uploadedImages.length,
    maxFiles: 5,
  });

  const handleDropdown = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? '' : dropdownId);
  };
  // Filter handling
  const clearFilters = () => {
    setSelectedManagers([]),
      setSelectedTagged([]),
      setSelectedAssets([]),
      setServiceName('');
    setApplyFilter(false);
  };

  const areFiltersApplied = () => {
    return (
      selectedManager.length > 0 ||
      selectedTagged.length > 0 ||
      selectedAssets.length > 0 ||
      selectedServiceName.length > 0
    );
  };

  const handleApplyFilters = () => {
    setShowFilterModel(!showFilterModel);
    if (areFiltersApplied()) {
      setApplyFilter(true);
    }
  };
  // Formik configuration
  const organizationForm = useFormik({
    initialValues: {
      serviceCost: '',
      description: '',
      purchaseNote: '',
      vendor: '',
      serviceDate: null,
    },
    validationSchema: appFormValidatorSchema,
    onSubmit: async (values) => {
      let stagedImageUrls: string[] = [];

      try {
        stagedImageUrls = await stagedUploads.uploadPending<string>({
          onUploaded: async (fileUrl) => {
            setUploadedImages((currentImages) => [...currentImages, fileUrl]);
          },
          uploadFile: async (file, onProgress) =>
            uploadImageToApp({
              appId: state.appId!,
              axiosAuth,
              file,
              onProgress,
            }),
        });
      } catch {
        return;
      }

      const data = {
        ...values,
        assets: selectedService?.assets.map((asset: any) => asset._id),
        images: [...uploadedImages, ...stagedImageUrls],
      };
      if (selectedService) {
        createSeriveSchedule.mutate({
          axiosAuth,
          data,
          id: selectedService?._id ?? '',
        });
      } else {
        createManySeriveSchedule.mutate({
          axiosAuth,
          data: {
            ids: selectedSubmissions.map((e) => e._id),
            ...data,
          },
        });
      }
    },
  });

  const { data: users } = useQuery({
    queryKey: 'listofUsersForApp',
    queryFn: () => getAllOrgUsers(axiosAuth),
    refetchOnWindowFocus: false,
  });
  const { data: customers } = useQuery({
    queryKey: 'customersList',
    queryFn: () => getCustomersList(axiosAuth),
    refetchOnWindowFocus: false,
  });
  const filterservices =
    (data ?? [])
      .filter((p) => {
        if (isApplyFilter) {
          if (selectedServiceName) {
            return p.name
              .toLowerCase()
              .includes(selectedServiceName.toLowerCase());
          }
        }
        return p;
      })
      .filter((p) => {
        if (isApplyFilter) {
          if (selectedAssets.length > 0) {
            return p.assets.some((asset: any) =>
              selectedAssets.includes(asset._id)
            );
          }
        }
        return p;
      })
      .filter((p) => {
        if (isApplyFilter) {
          if (selectedTagged.length > 0) {
            return selectedTagged.includes(p.createdBy._id);
          }
        }
        return p;
      })
      .filter((p) => {
        if (isApplyFilter) {
          if (selectedManager.length > 0) {
            return selectedManager.includes(p.createdBy._id);
          }
        }
        return p;
      })
      .filter((e) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Filter by search query
        const matchesSearch = `${e?.name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        // Parse service date
        const serviceDate = new Date(e.serviceDate);
        serviceDate.setHours(0, 0, 0, 0);

        // Filter based on selected option
        const matchesFilter =
          selectedOption === 'View All' ||
          (selectedOption === 'Overdue' && serviceDate < today) ||
          (selectedOption === 'Due Today' &&
            serviceDate.getTime() === today.getTime()) ||
          (selectedOption === 'Upcoming' && serviceDate > today);

        return matchesSearch && matchesFilter;
      }) ?? [];

  const {
    currentPage,
    totalPages,
    paginatedItems,
    itemsPerPage,
    handlePageChange,
  } = useTikiPagination(filterservices ?? [], 10);
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
                Pending Service
              </div>

              <div className="flex items-center">
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
                          onClick={() => handleSelectOption('Overdue')}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          Overdue
                        </button>
                        <button
                          onClick={() => handleSelectOption('Due Today')}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          Due Today
                        </button>
                        <button
                          onClick={() => handleSelectOption('Upcoming')}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          Upcoming
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
          {
            <table className="mt-3 w-full border-collapse font-Open-Sans">
              <thead className="bg-[#F5F5F5] text-left text-sm font-semibold text-[#616161]">
                <tr>
                  <th className="hidden px-2 py-3 md:flex">
                    Schedule Name
                    <img
                      src="/images/fluent_arrow-sort-24-regular.svg"
                      className="cursor-pointer px-1"
                      alt="image"
                    />
                  </th>
                  <th className="px-2 py-3">Group Name</th>
                  <th className="hidden px-2 py-3 md:table-cell">
                    Assigned Customer
                  </th>

                  <th className="px-2 py-3">Service Status</th>
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
                  <th className="w-[100px] rounded-lg bg-[#F5F5F5] px-4 py-3 text-right text-sm font-normal text-[#0063F7]">
                    {isSelectMode ? (
                      <div className="flex items-center justify-end gap-2">
                        <div className="cursor-pointer" onClick={handleCancel}>
                          Cancel
                        </div>
                        <div className="relative flex items-center justify-center gap-2">
                          <input
                            type="checkbox"
                            className={`h-5 w-5 cursor-pointer appearance-none rounded-md border-2 ${
                              (filterservices ?? []).length ==
                              (selectedSubmissions ?? []).length
                                ? 'border-[#6990FF] bg-[#6990FF] checked:border-[#6990FF] checked:bg-[#6990FF]'
                                : 'border-[#9E9E9E] bg-white'
                            } transition-colors duration-200 ease-in-out`}
                            onChange={handleSelectAllChange}
                          />
                          {(filterservices ?? []).length ==
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
                {(paginatedItems ?? [])
                  .sort((a, b) => {
                    return customSortFunction({
                      a: a.serviceDate.toString(),
                      b: b.serviceDate.toString(),
                      sortBy,
                      type: 'date',
                    });
                  })
                  .map((item, index) => {
                    return (
                      <tr
                        key={item._id}
                        className="relative border-b even:bg-[#F5F5F5]"
                      >
                        <td
                          className="cursor-pointer px-4 py-2 font-medium text-primary-500"
                          onClick={() => {
                            setSelectedServiceSchedule(item);
                          }}
                        >
                          {item.name}
                        </td>
                        <td className="px-4 py-2">{item.groupId.name}</td>

                        <td className="cursor-pointer items-center px-2 py-2">
                          <UserCard submittedBy={item.createdBy} index={0} />
                        </td>

                        <td className="items-center p-2">
                          {getStatusBadge(item.serviceDate.toString())}
                        </td>

                        <td className="px-2 py-2">
                          <div>{dateFormat(item.serviceDate.toString())}</div>
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
                              <svg
                                onClick={() => {
                                  setServiceLogModel(true);
                                  setSelectedService(item);
                                }}
                                width="73"
                                height="30"
                                viewBox="0 0 73 30"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <rect
                                  width="73"
                                  height="30"
                                  rx="8"
                                  fill="#E2F3FF"
                                />
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M17.5712 7.2572C20.6651 6.91427 23.7874 6.91427 26.8812 7.2572C28.5942 7.4492 29.9762 8.7982 30.1772 10.5172C30.5442 13.6552 30.5442 16.8252 30.1772 19.9632C29.9762 21.6822 28.5942 23.0312 26.8812 23.2232C23.7874 23.5662 20.6651 23.5662 17.5712 23.2232C15.8582 23.0312 14.4762 21.6822 14.2752 19.9632C13.9083 16.8256 13.9083 13.6558 14.2752 10.5182C14.3769 9.68307 14.7576 8.90675 15.3557 8.31505C15.9537 7.72335 16.7341 7.35095 17.5702 7.2582M22.2262 10.2472C22.4251 10.2472 22.6159 10.3262 22.7566 10.4669C22.8972 10.6075 22.9762 10.7983 22.9762 10.9972V14.4902H26.4692C26.6681 14.4902 26.8589 14.5692 26.9996 14.7099C27.1402 14.8505 27.2192 15.0413 27.2192 15.2402C27.2192 15.4391 27.1402 15.6299 26.9996 15.7705C26.8589 15.9112 26.6681 15.9902 26.4692 15.9902H22.9762V19.4832C22.9762 19.6821 22.8972 19.8729 22.7566 20.0135C22.6159 20.1542 22.4251 20.2332 22.2262 20.2332C22.0273 20.2332 21.8366 20.1542 21.6959 20.0135C21.5553 19.8729 21.4762 19.6821 21.4762 19.4832V15.9902H17.9832C17.7843 15.9902 17.5936 15.9112 17.4529 15.7705C17.3123 15.6299 17.2332 15.4391 17.2332 15.2402C17.2332 15.0413 17.3123 14.8505 17.4529 14.7099C17.5936 14.5692 17.7843 14.4902 17.9832 14.4902H21.4762V10.9972C21.4762 10.7983 21.5553 10.6075 21.6959 10.4669C21.8366 10.3262 22.0273 10.2472 22.2262 10.2472Z"
                                  fill="#0063F7"
                                />
                                <path
                                  d="M40.3125 20.5V10.5059H41.9531V19.1055H46.1982V20.5H40.3125ZM54.4629 16.6992C54.4629 17.3281 54.3809 17.8864 54.2168 18.374C54.0527 18.8617 53.8135 19.2741 53.499 19.6113C53.1846 19.944 52.8063 20.1992 52.3643 20.377C51.9222 20.5501 51.4232 20.6367 50.8672 20.6367C50.3477 20.6367 49.8714 20.5501 49.4385 20.377C49.0055 20.1992 48.6296 19.944 48.3105 19.6113C47.9961 19.2741 47.7523 18.8617 47.5791 18.374C47.4059 17.8864 47.3193 17.3281 47.3193 16.6992C47.3193 15.8652 47.4629 15.1589 47.75 14.5801C48.0417 13.9967 48.4564 13.5524 48.9941 13.2471C49.5319 12.9417 50.1722 12.7891 50.915 12.7891C51.6123 12.7891 52.2275 12.9417 52.7607 13.2471C53.2939 13.5524 53.7109 13.9967 54.0117 14.5801C54.3125 15.1634 54.4629 15.8698 54.4629 16.6992ZM48.9736 16.6992C48.9736 17.2507 49.0397 17.7223 49.1719 18.1143C49.3086 18.5062 49.5182 18.807 49.8008 19.0166C50.0833 19.2217 50.4479 19.3242 50.8945 19.3242C51.3411 19.3242 51.7057 19.2217 51.9883 19.0166C52.2708 18.807 52.4782 18.5062 52.6104 18.1143C52.7425 17.7223 52.8086 17.2507 52.8086 16.6992C52.8086 16.1478 52.7425 15.6807 52.6104 15.2979C52.4782 14.9105 52.2708 14.6165 51.9883 14.416C51.7057 14.2109 51.3389 14.1084 50.8877 14.1084C50.2223 14.1084 49.737 14.3317 49.4316 14.7783C49.1263 15.2249 48.9736 15.8652 48.9736 16.6992ZM58.4688 23.8633C57.4434 23.8633 56.6572 23.6787 56.1104 23.3096C55.5635 22.9404 55.29 22.4232 55.29 21.7578C55.29 21.293 55.4359 20.8988 55.7275 20.5752C56.0192 20.2562 56.4362 20.0352 56.9785 19.9121C56.7734 19.821 56.5957 19.6797 56.4453 19.4883C56.2995 19.2923 56.2266 19.0758 56.2266 18.8389C56.2266 18.5563 56.3063 18.3148 56.4658 18.1143C56.6253 17.9137 56.8646 17.7201 57.1836 17.5332C56.7871 17.3646 56.4681 17.0911 56.2266 16.7129C55.9896 16.3301 55.8711 15.8812 55.8711 15.3662C55.8711 14.8193 55.9873 14.3545 56.2197 13.9717C56.4521 13.5843 56.7917 13.2904 57.2383 13.0898C57.6849 12.8848 58.2249 12.7822 58.8584 12.7822C58.9951 12.7822 59.1432 12.7913 59.3027 12.8096C59.4668 12.8232 59.6172 12.8415 59.7539 12.8643C59.8952 12.8825 60.0023 12.903 60.0752 12.9258H62.6934V13.8213L61.4082 14.0605C61.5312 14.2337 61.6292 14.432 61.7021 14.6553C61.7751 14.874 61.8115 15.1133 61.8115 15.373C61.8115 16.1569 61.5404 16.7744 60.998 17.2256C60.4603 17.6722 59.7174 17.8955 58.7695 17.8955C58.5417 17.8864 58.3206 17.8682 58.1064 17.8408C57.9424 17.9411 57.8171 18.0527 57.7305 18.1758C57.6439 18.2943 57.6006 18.4287 57.6006 18.5791C57.6006 18.7021 57.6439 18.8024 57.7305 18.8799C57.8171 18.9528 57.9447 19.0075 58.1133 19.0439C58.2865 19.0804 58.4961 19.0986 58.7422 19.0986H60.0479C60.8773 19.0986 61.5107 19.2741 61.9482 19.625C62.3857 19.9759 62.6045 20.4909 62.6045 21.1699C62.6045 22.0312 62.249 22.6943 61.5381 23.1592C60.8271 23.6286 59.804 23.8633 58.4688 23.8633ZM58.5303 22.7354C59.0908 22.7354 59.5625 22.6807 59.9453 22.5713C60.3281 22.4619 60.6175 22.3047 60.8135 22.0996C61.0094 21.8991 61.1074 21.6598 61.1074 21.3818C61.1074 21.1357 61.0459 20.9466 60.9229 20.8145C60.7998 20.6823 60.6152 20.5911 60.3691 20.541C60.123 20.4909 59.8177 20.4658 59.4531 20.4658H58.2637C57.9674 20.4658 57.7054 20.5114 57.4775 20.6025C57.2497 20.6982 57.0719 20.835 56.9443 21.0127C56.8213 21.1904 56.7598 21.4046 56.7598 21.6553C56.7598 22.0016 56.9124 22.2682 57.2178 22.4551C57.5277 22.6419 57.9652 22.7354 58.5303 22.7354ZM58.8447 16.8428C59.3141 16.8428 59.6628 16.7152 59.8906 16.46C60.1185 16.2002 60.2324 15.8356 60.2324 15.3662C60.2324 14.8558 60.1139 14.473 59.877 14.2178C59.6445 13.9626 59.2982 13.835 58.8379 13.835C58.3867 13.835 58.0426 13.9648 57.8057 14.2246C57.5732 14.4844 57.457 14.8695 57.457 15.3799C57.457 15.8402 57.5732 16.2002 57.8057 16.46C58.0426 16.7152 58.389 16.8428 58.8447 16.8428Z"
                                  fill="#0063F7"
                                />
                              </svg>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          }
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
                      setBulkModel(!showBulkModel);
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

      {/* ////////////// Add Pending Service Log Modal ///////////////////////// */}
      <CustomModal
        isOpen={showServiceLogModel}
        handleCancel={() => {
          setServiceLogModel(false);
          handleCancel();
          setODropdown(null);
          setSelectedProjectStatus('');
        }}
        handleSubmit={() => organizationForm.submitForm()}
        submitValue="Add"
        cancelButton="Cancel"
        submitDisabled={!organizationForm.isValid}
        isLoading={
          createSeriveSchedule.isLoading || createManySeriveSchedule.isLoading
        }
        header={
          <>
            <svg
              width="50"
              height="50"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
              <path
                d="M17.5 23.125H23.125V25H17.5V23.125ZM17.5 15.625H28.75V17.5H17.5V15.625ZM17.5 19.375H28.75V21.25H17.5V19.375ZM17.5 32.5H23.125V34.375H17.5V32.5ZM38.125 32.5V30.625H36.1553C36.0337 30.0384 35.8007 29.4805 35.4691 28.9816L36.8659 27.5847L35.5403 26.2591L34.1434 27.6559C33.6445 27.3243 33.0866 27.0913 32.5 26.9697V25H30.625V26.9697C30.0384 27.0913 29.4805 27.3243 28.9816 27.6559L27.5847 26.2591L26.2591 27.5847L27.6559 28.9816C27.3243 29.4805 27.0913 30.0384 26.9697 30.625H25V32.5H26.9697C27.0913 33.0866 27.3243 33.6445 27.6559 34.1434L26.2591 35.5403L27.5847 36.8659L28.9816 35.4691C29.4805 35.8007 30.0384 36.0337 30.625 36.1553V38.125H32.5V36.1553C33.0866 36.0337 33.6445 35.8007 34.1434 35.4691L35.5403 36.8659L36.8659 35.5403L35.4691 34.1434C35.8007 33.6445 36.0337 33.0866 36.1553 32.5H38.125ZM31.5625 34.375C31.0062 34.375 30.4625 34.2101 30 33.901C29.5374 33.592 29.177 33.1527 28.9641 32.6388C28.7512 32.1249 28.6955 31.5594 28.804 31.0138C28.9126 30.4682 29.1804 29.9671 29.5738 29.5738C29.9671 29.1804 30.4682 28.9126 31.0138 28.804C31.5594 28.6955 32.1249 28.7512 32.6388 28.9641C33.1527 29.177 33.592 29.5374 33.901 30C34.2101 30.4625 34.375 31.0062 34.375 31.5625C34.3743 32.3082 34.0777 33.0231 33.5504 33.5504C33.0231 34.0777 32.3082 34.3743 31.5625 34.375Z"
                fill="#0063F7"
              />
              <path
                d="M23.125 38.125H15.625C15.1277 38.125 14.6508 37.9275 14.2992 37.5758C13.9475 37.2242 13.75 36.7473 13.75 36.25V13.75C13.75 13.2527 13.9475 12.7758 14.2992 12.4242C14.6508 12.0725 15.1277 11.875 15.625 11.875H30.625C31.1223 11.875 31.5992 12.0725 31.9508 12.4242C32.3025 12.7758 32.5 13.2527 32.5 13.75V23.125H30.625V13.75H15.625V36.25H23.125V38.125Z"
                fill="#0063F7"
              />
            </svg>
            <div>
              <h2 className="text-xl font-semibold text-[#1E1E1E]">
                Add Service Log
              </h2>
              <span className="mt-1 text-base font-normal text-[#616161]">
                Add service log details below.
              </span>
            </div>
          </>
        }
        body={
          <div className="flex h-[520px] flex-col overflow-y-scroll px-4">
            <div className="relative mb-4 w-full">
              <CustomSearchSelect
                label="Supplier"
                data={[
                  {
                    label: 'My Organization',
                    value: 'all',
                  },
                  ...(users ?? []).map((user) => ({
                    label: `${user.firstName} ${user.lastName}`,
                    value: user._id,
                    photo: user.photo,
                  })),
                ]}
                onSelect={(values) => {
                  if (values.length > 0) {
                    organizationForm.setFieldValue('vendor', values[0]);
                    setSelectedVenderId(values[0]);
                  }
                }}
                selected={[selectedVenderId]}
                hasError={false}
                showImage={true}
                isRequired={true}
                multiple={false}
                placeholder="-"
                isOpen={opendown === 'serviceLog_supplier'}
                onToggle={() => handleToggle('serviceLog_supplier')}
              />
              {organizationForm.errors.vendor &&
                organizationForm.touched.vendor && (
                  <span className="text-xs text-red-500">
                    {organizationForm.errors.vendor.toString()}
                  </span>
                )}
            </div>
            <CustomSearchSelect
              label="Project Status"
              data={[
                { value: 'all', label: 'All' },
                { value: 'open', label: 'Open' },
                { value: 'close', label: 'Close' },
              ]}
              onSelect={(value) => {
                if (typeof value === 'string') {
                  setSelectedProjectStatus(value);
                }
              }}
              searchPlaceholder="Search Contacts, Users, Customers"
              returnSingleValueWithLabel={true}
              selected={selectedProjectStatus ? [selectedProjectStatus] : []}
              showImage={false}
              isRequired={false}
              showSearch={false}
              multiple={false}
              placeholder="Select"
              isOpen={opendown === 'serviceLog_projectStatus'}
              onToggle={() => handleToggle('serviceLog_projectStatus')}
            />
            <div className="relative mb-4 w-full">
              <CustomDateRangePicker
                title="Service Date"
                isRequired={true}
                handleOnConfirm={(date: Date) => {
                  organizationForm.setFieldValue('serviceDate', date);
                }}
                selectedDate={organizationForm.values.serviceDate}
              />
              {organizationForm.errors.serviceDate &&
                organizationForm.touched.serviceDate && (
                  <span className="text-xs text-red-500">
                    {organizationForm.errors.serviceDate.toString()}
                  </span>
                )}
            </div>
            <div className="pb-3">
              <SimpleInput
                label="Serviced Cost"
                type="text"
                placeholder="Enter Serviced Cost"
                name="serviceCost"
                className="w-full"
                errorMessage={organizationForm.errors.serviceCost}
                value={organizationForm.values.serviceCost}
                isTouched={organizationForm.touched.serviceCost}
                onChange={organizationForm.handleChange}
              />
            </div>
            <div className="pb-3">
              <SimpleInput
                label="Currency / Purchase Note"
                type="text"
                placeholder="Enter Currency / Purchase Note"
                name="purchaseNote"
                className="w-full"
                errorMessage={organizationForm.errors.purchaseNote}
                value={organizationForm.values.purchaseNote}
                isTouched={organizationForm.touched.purchaseNote}
                onChange={organizationForm.handleChange}
              />
            </div>
            <div className="pb-3">
              <label className="mb-2 block px-2" htmlFor="reasone">
                Description
              </label>
              <textarea
                rows={6}
                id="description"
                name="description"
                placeholder="Describe the service description"
                value={organizationForm.values.description}
                className={` ${
                  organizationForm.errors.description &&
                  organizationForm.touched.description
                    ? 'border-red-500'
                    : 'border-[#EEEEEE]'
                } w-full resize-none rounded-xl border-2 border-gray-300 p-2 shadow-sm`}
                onChange={organizationForm.handleChange}
              />
              {organizationForm.errors.description &&
                organizationForm.touched.description && (
                  <span className="text-xs text-red-500">
                    {organizationForm.errors.description}
                  </span>
                )}
              <ServiceLogImageUpload
                onRemoveUploadedImage={(fileUrl) => {
                  setUploadedImages((currentImages) =>
                    currentImages.filter((image) => image !== fileUrl)
                  );
                }}
                stagedUploads={stagedUploads}
                uploadedImages={uploadedImages}
              />
            </div>
          </div>
        }
        variant="primary"
        cancelvariant="primaryOutLine"
        justifyButton="justify-center"
      />
      {/* ///////////////////////// Bulk Edit Modal ///////////////////////// */}
      <CustomModal
        isOpen={showBulkModel}
        handleCancel={() => {
          setBulkModel(false);
          handleCancel();
        }}
        handleSubmit={() => {
          setBulkModel(false);
          if (multiAction === 'log') {
            setServiceLogModel(true);
          } else {
            updateManySchedule.mutate({
              axiosAuth,
              data: {
                ids: selectedSubmissions.map((row) => row._id),
                status: 'done',
              },
            });
          }
        }}
        submitValue={multiAction === 'log' ? 'Next' : 'Confirm'}
        cancelButton="Cancel"
        isLoading={updateManySchedule.isLoading}
        header={
          <>
            <img src="/svg/sh/edit.svg" alt="" />
            <div>
              <h2 className="text-xl font-semibold text-[#1E1E1E]">
                Bulk Edit Discussion Topic
              </h2>
              <span className="mt-1 text-base font-normal text-[#616161]">
                Select an option below to change.
              </span>
            </div>
          </>
        }
        body={
          <div className="mb-8 flex flex-col space-y-4 p-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="option"
                checked={multiAction === 'log'}
                onChange={() => setMultiAction('log')}
                className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
              />
              <span className="ml-2">Add Service Log</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="option"
                checked={multiAction === 'complete'}
                onChange={() => setMultiAction('complete')}
                className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
              />
              <span className="ml-2">Mark as complete</span>
            </label>
          </div>
        }
        variant="primary"
        cancelvariant="primaryOutLine"
        justifyButton="justify-center"
        size="lg"
      />
      {/* filter model */}
      <CustomModal
        isOpen={showFilterModel}
        handleCancel={() => setShowFilterModel(false)}
        handleSubmit={handleApplyFilters}
        submitValue="Apply"
        cancelButton="Reset"
        customCancelHandler={clearFilters}
        submitDisabled={!areFiltersApplied()}
        header={
          <div>
            <h2 className="text-xl font-semibold">Filter By</h2>
            <p className="mt-1 text-sm font-normal text-[#616161]">
              Filter by the following selections and options.
            </p>
          </div>
        }
        body={
          <div className="flex flex-col justify-start gap-4 overflow-y-scroll p-0 pb-4 pt-2 scrollbar-hide">
            <SimpleInput
              type="text"
              label="Service Group Name"
              placeholder="Enter Service Group Name"
              name="emailAddress"
              className="w-full"
              value={selectedServiceName}
              onChange={(e) => {
                setServiceName(e.target.value);
              }}
            />
            <div className="w-full">
              <CustomSearchSelect
                label="Service Manager"
                data={[
                  { label: 'All', value: 'all' },
                  ...(users ?? []).map((user) => ({
                    label: `${user.firstName} ${user.lastName}`,
                    value: user._id ?? '',
                  })),
                ]}
                showImage={false}
                multiple={true}
                isOpen={openDropdown === 'dropdown1'}
                onToggle={() => handleDropdown('dropdown1')}
                onSelect={(selected: string[]) => setSelectedManagers(selected)}
                placeholder="All"
                selected={selectedManager}
              />
            </div>
            <div className="w-full">
              <CustomSearchSelect
                label="Assigned Customer"
                data={[
                  { label: 'All', value: 'all' },
                  ...(customers ?? [])
                    .filter((c) => c.role === 4)
                    .map((customer) => ({
                      label: customer.customerName
                        ? `${customer.customerName} - ${customer.userId}`
                        : `${customer.firstName} ${customer.lastName}`,
                      value: customer._id ?? '',
                    })),
                ]}
                showImage={false}
                multiple={true}
                isOpen={openDropdown === 'dropdown2'}
                onToggle={() => handleDropdown('dropdown2')}
                onSelect={(selected: string[]) => setSelectedTagged(selected)}
                placeholder="All"
                selected={selectedTagged}
              />
            </div>
            <div className="w-full">
              <CustomSearchSelect
                label="Assigned Assets"
                data={[
                  { label: 'All', value: 'all' },
                  ...(assets ?? []).map((asset) => ({
                    label: `${asset.name} - ${asset.atnNum}`,
                    value: asset._id ?? '',
                  })),
                ]}
                showImage={false}
                multiple={true}
                isOpen={openDropdown === 'dropdown3'}
                onToggle={() => handleDropdown('dropdown3')}
                onSelect={(selected: string[]) => setSelectedAssets(selected)}
                selected={selectedAssets}
                placeholder="All"
              />
            </div>
          </div>
        }
        variant="primary"
        cancelvariant="primaryOutLine"
        justifyButton="justify-center"
        size="lg"
      />
      {selectedServiceSchedule && (
        <ViewGroupServiceScheduleModel
          group={selectedServiceSchedule.groupId}
          assets={selectedServiceSchedule.assets ?? []}
          model={selectedServiceSchedule}
          handleClose={() => {
            setSelectedServiceSchedule(undefined);
          }}
          showFooter={true}
          handleSubmit={() => {
            setSelectedServiceSchedule(selectedServiceSchedule);
            setServiceLogModel(true);
            setSelectedServiceSchedule(undefined);
          }}
        />
      )}
    </>
  );
}

const getStatusBadge = (date: string) => {
  const inputDate = new Date(date); // Convert input to a Date object
  const today = new Date();

  // Remove time portion for accurate comparison
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);

  if (inputDate < today) {
    return (
      <span className="rounded-md bg-[#EA4E4E] px-2 py-1 text-sm text-white">
        Overdue
      </span>
    );
  } else if (inputDate.getTime() === today.getTime()) {
    return (
      <span className="rounded-md bg-[#4CAF50] px-2 py-1 text-sm text-white">
        Due Today
      </span>
    );
  } else {
    return (
      <span className="rounded-md bg-[#2196F3] px-2 py-1 text-sm text-white">
        Upcoming
      </span>
    );
  }
};
