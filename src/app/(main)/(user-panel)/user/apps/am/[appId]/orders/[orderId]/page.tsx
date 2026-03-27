'use client';
import { AMAPPACTIONTYPE } from '@/app/helpers/user/enums';

import { usePathname, useRouter } from 'next/navigation';
import React, { use, useEffect, useReducer, useRef, useState } from 'react';

import { useMutation, useQuery } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import Loader from '@/components/DottedLoader/loader';

import {
  AssetManagerAppsReducer,
  initialAssetManagerAppState,
  AssetManagerAppContextProps,
  AssetManagerAppContext,
} from '../../../am_context';
import {
  deleteSingleAsset,
  getSingleAsset,
  getSingleOrderItinerary,
} from '../../../api';
import { WithAssetDetailSIdebar } from '@/components/Asset_Manager_App/04_ManageAssets/asset_components/Asset_Detail/With_Asset_Detail_Sidebar';
import CreateAsset from '@/components/Asset_Manager_App/04_ManageAssets/asset_components/Main_Create_Asset';
import { AM_Asset_Create_Bottom_Button } from '@/components/Asset_Manager_App/04_ManageAssets/asset_components/AM_Asset_Create_Bottom_Button';
import { Button } from '@/components/Buttons';
import { SingleAsset } from '@/app/type/single_asset';
import { ViewAssetCart } from '@/components/Asset_Manager_App/01_CheckInOut/components/View_Asset_Cart';
import { getLastSegment } from '@/components/JobSafetyAnalysis/CreateNewComponents/JSA_Upload_IMG';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import toast from 'react-hot-toast';
import { checkInOutStatus } from '@/components/Asset_Manager_App/04_ManageAssets/ManageAssetsScreen';
import { WithOrderDetailSIdebar } from '@/components/Asset_Manager_App/OrderItinerary/OrderDetail/WithOrderSidebar';
import { useSession } from 'next-auth/react';
import { CustomHoverPorjectShow } from '@/components/Custom_Project_Hover_Component';
import { PresignedUserAvatar } from '@/components/common/PresignedUserAvatar';
import { Search } from '@/components/Form/search';
import { PaginationComponent } from '@/components/pagination';
import { useTikiPagination } from '@/hooks/usePagination';
import { customSortFunction } from '@/app/helpers/re-use-func';
import { validateSecureToken } from '@/app/helpers/token_generator';

function Page({ params }: any) {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [state, dispatch] = useReducer(
    AssetManagerAppsReducer,
    initialAssetManagerAppState
  );

  const contextAssetManagerValue: AssetManagerAppContextProps = {
    state,
    dispatch,
  };

  const handleGoBack = () => {
    if (appid) {
      router.push(`/user/apps/am/${appid}?open=order`);
    } else {
      router.back();
    }
  };

  const contentRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const [tokenParam, setTokenParam] = useState<string | null>(null);

  useEffect(() => {
    // Ensure this code runs only in the browser (client-side)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href); // Get the full URL
      const token = url.searchParams.get('token'); // Get the "token" query parameter
      setTokenParam(token); // Save token in state
    }
  }, []);
  const [isReadOnly, setReadOnly] = useState(false);
  useEffect(() => {
    if (tokenParam) {
      const validateToken = validateSecureToken(tokenParam ?? '');
      if (!validateToken) {
        router.push('/not-found');
      }
      setReadOnly(validateToken?.readonly ?? false);
      console.log(validateToken!['userId'], 'validateToken');
    }
  }, [tokenParam, router]);

  // Assuming your path is something like '/[jsappid]/[jsadetail]/[jsatype]/page'
  const segments = pathname?.split('/').filter(Boolean); // Split the path into segments

  // Extract parameters based on their positions
  const appid = segments![3]; // Assuming [jsappid] is the first segment
  const amdetailID = segments![5]; // Assuming [jsadetail] is the second segment
  // all done then store appid
  useEffect(() => {
    if (appid) {
      dispatch({
        type: AMAPPACTIONTYPE.ASSIGN_APP_ID,
        appId: appid,
      });
    }
  }, [appid]);
  const axiosAuth = useAxiosAuth();
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('desc');
  const [sortByName, setSortByName] = useState<'asc' | 'desc'>('desc');
  const [selectedSort, setSelectedSort] = useState<'date' | 'text'>('date');

  const {
    data,
    isLoading: isLoading,
    refetch,
  } = useQuery({
    queryKey: 'orderItineraryDetail',
    queryFn: () =>
      getSingleOrderItinerary({
        id: amdetailID,
        axiosAuth,
      }),
  });
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const copyText = () => {
    if (textRef.current) {
      const textToCopy = textRef.current.innerText;
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          toast.success('Submission ID copied successfully');
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
        });
    }
  };
  var filterAsset =
    (data?.assets ?? [])
      .filter(
        (e) =>
          `${e?.name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${e?.atnNum}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (selectedSort == 'date') {
          return customSortFunction({
            a: a.createdAt.toString(),
            b: b.createdAt.toString(),
            sortBy,
            type: 'date',
          });
        } else {
          return customSortFunction({
            a: a.name,
            b: b.name,
            sortBy: sortByName,
            type: 'text',
          });
        }
      }) ?? [];
  const {
    currentPage,
    totalPages,
    paginatedItems,
    itemsPerPage,
    handlePageChange,
  } = useTikiPagination(filterAsset ?? [], 10);
  if (isLoading) {
    return (
      <>
        <Loader />
      </>
    );
  }

  return (
    <>
      <AssetManagerAppContext.Provider value={contextAssetManagerValue}>
        <div className="absolute inset-0 top-16 z-10 mx-auto h-[calc(var(--app-vh)-70px)] w-full max-w-[1360px] overflow-y-hidden bg-white p-4">
          <div className="absolute inset-0 z-10 flex h-[calc(var(--app-vh)-70px)] w-full max-w-[1360px] flex-col bg-white px-4 pt-4">
            <div className="breadCrumbs flex justify-between border-b border-[#E0E0E0] p-2">
              {/* </Link> */}
              <div className="flex justify-start gap-5">
                <img src="/svg/am/logo.svg" alt="show logo" />
                {/* <img src="/svg/timesheet_app/breadcrumbs.svg" alt="show logo" /> */}
                <ul className="breadcurmb flex items-center gap-[10px]">
                  <li className="text-lg font-semibold text-[#1e1e1e]">
                    View Asset Order
                  </li>
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
            </div>

            <WithOrderDetailSIdebar
              data={data}
              contentRef={contentRef}
              appId={appid}
            >
              <div className="h-full w-4/5 overflow-y-scroll scrollbar-hide">
                <>
                  {/* first  */}
                  <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
                    <div className="flex flex-col p-4">
                      <div className="flex justify-start">
                        <h2 className="mb-1 text-xl font-semibold">
                          Asset Details
                        </h2>
                      </div>
                      <div className="flex gap-12">
                        <div className="flex flex-col justify-start gap-2 py-6">
                          <span className="text-[#616161]">{'Asset ID'}</span>

                          <span
                            className="flex cursor-pointer items-center gap-1"
                            ref={textRef}
                            onClick={() => {
                              copyText();
                            }}
                          >
                            {data?.orderNumber}
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M9.525 1.25H7.09125C5.98875 1.25 5.115 1.25 4.43187 1.3425C3.72812 1.4375 3.15875 1.6375 2.71 2.08813C2.26062 2.53875 2.06125 3.11062 1.96688 3.81687C1.875 4.50312 1.875 5.38 1.875 6.48687V10.1356C1.875 11.0781 2.45 11.8856 3.26688 12.2244C3.225 11.6556 3.225 10.8588 3.225 10.195V7.06375C3.225 6.26312 3.225 5.5725 3.29875 5.02C3.37812 4.4275 3.55687 3.86 4.01562 3.39937C4.47437 2.93875 5.04 2.75938 5.63 2.67938C6.18 2.60563 6.8675 2.60563 7.66562 2.60563H9.58437C10.3819 2.60563 11.0681 2.60563 11.6187 2.67938C11.4537 2.25836 11.1657 1.89681 10.7923 1.64185C10.4188 1.38689 9.9772 1.25034 9.525 1.25Z"
                                fill="#616161"
                              />
                              <path
                                d="M4.125 7.12219C4.125 5.41844 4.125 4.56656 4.6525 4.03719C5.17937 3.50781 6.0275 3.50781 7.725 3.50781H9.525C11.2219 3.50781 12.0706 3.50781 12.5981 4.03719C13.125 4.56656 13.125 5.41844 13.125 7.12219V10.1347C13.125 11.8384 13.125 12.6903 12.5981 13.2197C12.0706 13.7491 11.2219 13.7491 9.525 13.7491H7.725C6.02812 13.7491 5.17937 13.7491 4.6525 13.2197C4.125 12.6903 4.125 11.8384 4.125 10.1347V7.12219Z"
                                fill="#616161"
                              />
                            </svg>
                          </span>
                        </div>

                        <div className="flex flex-col items-center justify-start gap-2 py-6">
                          <span className="text-[#616161]">
                            {'Checked in / out'}
                          </span>

                          <span className="cursor-pointer" onClick={() => {}}>
                            {checkInOutStatus(
                              data?.status == 'out' ? true : false
                            )}
                          </span>
                        </div>
                        <div className="flex flex-col items-center justify-start gap-2 py-6">
                          <span className="text-[#616161]">
                            {'Assign Project'}
                          </span>

                          <CustomHoverPorjectShow
                            projects={data?.checkedOutProject ?? []}
                            index={hoveredProject}
                            setHoveredProject={setHoveredProject}
                          />
                        </div>
                      </div>
                      <div className="flex gap-12">
                        <div className="flex flex-col justify-start gap-2 py-6">
                          <span className="text-[#616161]">Ordered By</span>

                          <span className="flex cursor-pointer items-center gap-1">
                            {data?.createdBy && (
                              <div className="flex items-center">
                                <PresignedUserAvatar
                                  photo={data.createdBy.photo}
                                  fallback="/images/User-profile.png"
                                  alt="avatar"
                                  className="mr-2 h-8 w-8 rounded-full border border-gray-500 text-[#616161]"
                                />
                                <span className="text-[#616161]">
                                  {session?.user.user._id ===
                                  data?.createdBy?._id ? (
                                    'Me'
                                  ) : (
                                    <>
                                      {data?.createdBy
                                        ? `${data?.createdBy.firstName} ${data?.createdBy.lastName}`
                                        : ''}
                                    </>
                                  )}
                                </span>
                              </div>
                            )}
                          </span>

                          <div className="mt-4 flex items-center gap-2">
                            <div className="flex gap-1">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g clipPath="url(#clip0_3381_22010)">
                                  <path
                                    d="M17.9151 3.336H15.6929V5.00267C15.6929 5.16317 15.6612 5.32211 15.5998 5.47039C15.5384 5.61868 15.4484 5.75342 15.3349 5.86691C15.2214 5.9804 15.0866 6.07043 14.9384 6.13185C14.7901 6.19328 14.6311 6.22489 14.4706 6.22489C14.3101 6.22489 14.1512 6.19328 14.0029 6.13185C13.8546 6.07043 13.7199 5.9804 13.6064 5.86691C13.4929 5.75342 13.4029 5.61868 13.3414 5.47039C13.28 5.32211 13.2484 5.16317 13.2484 5.00267V3.336H6.77619V5.00267C6.77619 5.32682 6.64742 5.6377 6.4182 5.86691C6.18899 6.09612 5.87812 6.22489 5.55396 6.22489C5.22981 6.22489 4.91893 6.09612 4.68972 5.86691C4.46051 5.6377 4.33174 5.32682 4.33174 5.00267V3.336H2.10952C1.97731 3.3345 1.84614 3.35952 1.72377 3.40959C1.6014 3.45966 1.49031 3.53377 1.39708 3.62752C1.30385 3.72127 1.23036 3.83276 1.18097 3.95541C1.13158 4.07805 1.10728 4.20936 1.10952 4.34156V16.7749C1.10731 16.9048 1.13071 17.0338 1.17838 17.1546C1.22604 17.2754 1.29705 17.3857 1.38733 17.4791C1.47761 17.5724 1.58541 17.6471 1.70455 17.6988C1.8237 17.7505 1.95187 17.7783 2.08174 17.7804H17.9151C18.0449 17.7783 18.1731 17.7505 18.2923 17.6988C18.4114 17.6471 18.5192 17.5724 18.6095 17.4791C18.6998 17.3857 18.7708 17.2754 18.8184 17.1546C18.8661 17.0338 18.8895 16.9048 18.8873 16.7749V4.34156C18.8895 4.21169 18.8661 4.08266 18.8184 3.96184C18.7708 3.84101 18.6998 3.73076 18.6095 3.63739C18.5192 3.54401 18.4114 3.46933 18.2923 3.41762C18.1731 3.3659 18.0449 3.33817 17.9151 3.336ZM5.55396 14.4471H4.44285V13.336H5.55396V14.4471ZM5.55396 11.6693H4.44285V10.5582H5.55396V11.6693ZM5.55396 8.89156H4.44285V7.78045H5.55396V8.89156ZM8.8873 14.4471H7.77619V13.336H8.8873V14.4471ZM8.8873 11.6693H7.77619V10.5582H8.8873V11.6693ZM8.8873 8.89156H7.77619V7.78045H8.8873V8.89156ZM12.2206 14.4471H11.1095V13.336H12.2206V14.4471ZM12.2206 11.6693H11.1095V10.5582H12.2206V11.6693ZM12.2206 8.89156H11.1095V7.78045H12.2206V8.89156ZM15.554 14.4471H14.4429V13.336H15.554V14.4471ZM15.554 11.6693H14.4429V10.5582H15.554V11.6693ZM15.554 8.89156H14.4429V7.78045H15.554V8.89156Z"
                                    fill="#616161"
                                  />
                                  <path
                                    d="M5.55556 5.55382C5.7029 5.55382 5.84421 5.49529 5.94839 5.3911C6.05258 5.28691 6.11111 5.14561 6.11111 4.99826V1.66493C6.11111 1.51759 6.05258 1.37628 5.94839 1.27209C5.84421 1.16791 5.7029 1.10938 5.55556 1.10938C5.40821 1.10938 5.26691 1.16791 5.16272 1.27209C5.05853 1.37628 5 1.51759 5 1.66493V4.99826C5 5.14561 5.05853 5.28691 5.16272 5.3911C5.26691 5.49529 5.40821 5.55382 5.55556 5.55382Z"
                                    fill="#616161"
                                  />
                                  <path
                                    d="M14.4462 5.55382C14.5935 5.55382 14.7348 5.49529 14.839 5.3911C14.9432 5.28691 15.0017 5.14561 15.0017 4.99826V1.66493C15.0017 1.51759 14.9432 1.37628 14.839 1.27209C14.7348 1.16791 14.5935 1.10938 14.4462 1.10938C14.2988 1.10938 14.1575 1.16791 14.0533 1.27209C13.9492 1.37628 13.8906 1.51759 13.8906 1.66493V4.99826C13.8906 5.14561 13.9492 5.28691 14.0533 5.3911C14.1575 5.49529 14.2988 5.55382 14.4462 5.55382Z"
                                    fill="#616161"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_3381_22010">
                                    <rect width="20" height="20" fill="white" />
                                  </clipPath>
                                </defs>
                              </svg>
                              <span>
                                {dateFormat(
                                  data?.updatedAt.toString() ??
                                    new Date().toString()
                                )}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10 1.875C8.39303 1.875 6.82214 2.35152 5.486 3.24431C4.14985 4.1371 3.10844 5.40605 2.49348 6.8907C1.87852 8.37535 1.71762 10.009 2.03112 11.5851C2.34463 13.1612 3.11846 14.6089 4.25476 15.7452C5.39106 16.8815 6.8388 17.6554 8.4149 17.9689C9.99099 18.2824 11.6247 18.1215 13.1093 17.5065C14.594 16.8916 15.8629 15.8502 16.7557 14.514C17.6485 13.1779 18.125 11.607 18.125 10C18.1227 7.84581 17.266 5.78051 15.7427 4.25727C14.2195 2.73403 12.1542 1.87727 10 1.875ZM14.375 10.625H10C9.83424 10.625 9.67527 10.5592 9.55806 10.4419C9.44085 10.3247 9.375 10.1658 9.375 10V5.625C9.375 5.45924 9.44085 5.30027 9.55806 5.18306C9.67527 5.06585 9.83424 5 10 5C10.1658 5 10.3247 5.06585 10.4419 5.18306C10.5592 5.30027 10.625 5.45924 10.625 5.625V9.375H14.375C14.5408 9.375 14.6997 9.44085 14.8169 9.55806C14.9342 9.67527 15 9.83424 15 10C15 10.1658 14.9342 10.3247 14.8169 10.4419C14.6997 10.5592 14.5408 10.625 14.375 10.625Z"
                                  fill="#616161"
                                />
                              </svg>

                              <span>
                                {timeFormat(
                                  data?.updatedAt?.toString() ??
                                    new Date().toString()
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* second Asset Itinerary */}
                  {(paginatedItems ?? []).length > 0 && (
                    <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
                      {/* form top  */}
                      <div className="flex flex-col items-center sm:p-5 sm:pb-0 md:flex md:flex-row md:justify-between">
                        <div className="text-xl font-semibold">Asset List</div>
                        <div className="Search team-actice flex items-center justify-between">
                          <Search
                            inputRounded={true}
                            type="search"
                            className="rounded-md bg-[#eeeeee] text-xs placeholder:text-[#616161] md:text-sm"
                            name="search"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                      {/* form bottom  */}
                      {isLoading ? (
                        <Loader />
                      ) : (
                        <div className="mx-4 h-[400px]">
                          <table className="mt-3 w-full border-collapse font-Open-Sans">
                            <thead className="mx-20 rounded-lg bg-[#F5F5F5] text-left text-sm font-semibold text-[#616161]">
                              <tr>
                                <th className="px-2 py-3">Asset Tag No</th>
                                <th className="w-1/2 px-2 py-3">
                                  <div className="flex">
                                    <span>Asset Name</span>
                                    <img
                                      src="/images/fluent_arrow-sort-24-regular.svg"
                                      className="cursor-pointer px-1"
                                      alt="image"
                                      onClick={() => {
                                        setSelectedSort('text');
                                        setSortByName(
                                          sortByName === 'asc' ? 'desc' : 'asc'
                                        );
                                      }}
                                    />
                                  </div>
                                </th>

                                <th className="flex justify-end px-2 py-3">
                                  <span>Date Created</span>
                                  <img
                                    src="/images/fluent_arrow-sort-24-regular.svg"
                                    className="cursor-pointer px-1"
                                    alt="image"
                                    onClick={() => {
                                      setSelectedSort('date');
                                      setSortBy(
                                        sortBy === 'asc' ? 'desc' : 'asc'
                                      );
                                    }}
                                  />
                                </th>
                              </tr>
                            </thead>

                            <tbody className="text-sm font-normal text-[#1E1E1E]">
                              {(filterAsset ?? []).map((item, index) => {
                                return (
                                  <tr
                                    key={item._id}
                                    className="relative cursor-pointer border-b even:bg-[#F5F5F5]"
                                    onAbort={() => {
                                      router.push(
                                        `/user/apps/am/${state.appId}/orders/${item._id}`
                                      );
                                    }}
                                  >
                                    <td className="px-4 py-2 text-primary-400">
                                      {item.atnNum}
                                    </td>

                                    <td className="items-start p-2">
                                      {item.name}
                                    </td>

                                    <td className="px-6 py-2 text-end">
                                      <div>
                                        {dateFormat(item.updatedAt.toString())}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                      <div className="flex items-center justify-between border-t-2 border-gray-200 px-3 py-2">
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
                  )}
                </>
              </div>
            </WithOrderDetailSIdebar>
          </div>
        </div>
      </AssetManagerAppContext.Provider>
    </>
  );
}

export default Page;
