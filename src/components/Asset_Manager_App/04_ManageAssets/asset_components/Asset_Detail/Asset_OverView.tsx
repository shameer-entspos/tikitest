import { SingleAsset } from '@/app/type/single_asset';
import { getLastSegment } from '../Select_Asset_Images';
import toast from 'react-hot-toast';
import { useRef, useState, useEffect } from 'react';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import { useSession } from 'next-auth/react';
import { checkAssetStatus, checkInOutStatus } from '../../ManageAssetsScreen';
import { CustomHoverPorjectShow } from '@/components/Custom_Project_Hover_Component';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getTeams } from '@/app/(main)/(org-panel)/organization/teams/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { updateAsset } from '@/app/(main)/(user-panel)/user/apps/am/api';
import { getAllAppProjects } from '@/app/(main)/(user-panel)/user/apps/api';
import { getPresignedFileUrls } from '@/app/(main)/(user-panel)/user/file/api';
import { PresignedUserAvatar } from '@/components/common/PresignedUserAvatar';

export default function AssetOverView({
  data,
}: {
  data: SingleAsset | undefined;
}) {
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };
  const { data: teams, isLoading: userLoading } = useQuery({
    queryKey: 'teams',
    queryFn: () => getTeams(axiosAuth),
  });
  const { data: allProjects } = useQuery({
    queryKey: 'allUserAssignedProjects',
    queryFn: () => getAllAppProjects(axiosAuth),
  });
  const queryClient = useQueryClient();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const accessToken = session?.user?.accessToken;
  const rawPhotos = (data?.photos ?? []).filter(Boolean) as string[];
  const [resolvedPhotos, setResolvedPhotos] = useState<string[] | null>(null);

  useEffect(() => {
    if (!rawPhotos.length || !accessToken?.trim()) {
      setResolvedPhotos(null);
      return;
    }
    let cancelled = false;
    getPresignedFileUrls(axiosAuth, rawPhotos, accessToken).then((urls) => {
      if (!cancelled && urls && urls.length === rawPhotos.length)
        setResolvedPhotos(urls);
    });
    return () => {
      cancelled = true;
    };
  }, [rawPhotos.join('|'), accessToken, axiosAuth]);

  const displayPhotos = (resolvedPhotos ?? rawPhotos) as string[];

  const updateAssetMutation = useMutation(updateAsset, {
    onSuccess: () => {
      toast.success('Status Update Successfully');

      queryClient.invalidateQueries('getSingleAsset');
    },
  });
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
  return (
    <>
      {/* first  */}
      <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
        <div className="flex flex-col p-4">
          <div className="flex justify-start">
            <h2 className="mb-1 text-xl font-semibold text-black">
              Asset Overview
            </h2>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col justify-start gap-2 py-6">
              <span className="text-sm text-[#616161]">{'Asset ID'}</span>

              <span
                className="flex cursor-pointer items-center gap-1"
                ref={textRef}
                onClick={() => {
                  copyText();
                }}
              >
                {data?.atnNum}
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
              <span className="text-sm text-[#616161]">{'Asset Status'}</span>

              <span className="cursor-pointer" onClick={() => {}}>
                {checkAssetStatus(data?.status ?? 'Healthy')}
              </span>
            </div>

            <div className="flex flex-col items-center justify-start gap-2 py-6">
              <span className="text-sm text-[#616161]">
                {'Checked in / out'}
              </span>

              <span className="cursor-pointer" onClick={() => {}}>
                {checkInOutStatus(data?.isCheckedOut ?? false)}
              </span>
            </div>
            <div className="flex flex-col items-center justify-start gap-2 py-6">
              <span className="text-sm text-[#616161]">{'Assign Project'}</span>

              <span className="rounded-lg bg-gray-200 px-2 py-1 text-sm text-black">
                {(data?.checkedOutProject ?? []).length > 0 && allProjects
                  ? (() => {
                      const projectId = data?.checkedOutProject![0];
                      const project = allProjects.find(
                        (p) => p._id === projectId
                      );
                      return project?.name || projectId || 'Not Assigned';
                    })()
                  : 'Not Assigned'}
              </span>
            </div>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col justify-start gap-2 py-6">
              <span className="text-sm text-[#616161]">{'Checked out to'}</span>

              <span className="flex cursor-pointer items-center gap-1">
                {data?.lastCheckedOutBy && (
                  <div className="flex items-center">
                    <PresignedUserAvatar
                      photo={data.lastCheckedOutBy.photo}
                      fallback="/images/User-profile.png"
                      alt="avatar"
                      className="mr-2 h-8 w-8 rounded-full border border-gray-500 text-[#616161]"
                    />
                    <span className="text-[#616161]">
                      {session?.user.user._id ===
                      data?.lastCheckedOutBy?._id ? (
                        'Me'
                      ) : (
                        <>
                          {data?.lastCheckedOutBy
                            ? `${data?.lastCheckedOutBy.firstName} ${data?.lastCheckedOutBy.lastName}`
                            : ''}
                        </>
                      )}
                    </span>
                  </div>
                )}
              </span>

              {data?.lastCheckedOutBy && (
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
                        data?.updatedAt.toString() ?? new Date().toString()
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
                        data?.updatedAt?.toString() ?? new Date().toString()
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-start gap-2 py-6">
              <span className="text-sm text-[#616161]">
                {'Last Checked in by'}
              </span>

              <span className="flex cursor-pointer items-center gap-1">
                {data?.lastCheckedInBy && (
                  <div className="flex items-center">
                    <PresignedUserAvatar
                      photo={data.lastCheckedInBy.photo}
                      fallback="/images/User-profile.png"
                      alt="avatar"
                      className="mr-2 h-8 w-8 rounded-full border border-gray-500 text-[#616161]"
                    />
                    <span className="text-[#616161]">
                      {session?.user.user._id === data?.lastCheckedInBy?._id ? (
                        'Me'
                      ) : (
                        <>
                          {data?.lastCheckedInBy
                            ? `${data?.lastCheckedInBy.firstName} ${data?.lastCheckedInBy.lastName}`
                            : ''}
                        </>
                      )}
                    </span>
                  </div>
                )}
              </span>

              {data?.lastCheckedInBy && (
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
                        data?.updatedAt.toString() ?? new Date().toString()
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
                        data?.updatedAt.toString() ?? new Date().toString()
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-start gap-2 py-6">
              <span className="text-sm text-[#616161]">{'Created by'}</span>

              <span className="flex cursor-pointer items-center gap-1">
                {data?.submittedBy && (
                  <div className="flex items-center">
                    <PresignedUserAvatar
                      photo={data.submittedBy.photo}
                      fallback="/images/User-profile.png"
                      alt="avatar"
                      className="mr-2 h-8 w-8 rounded-full border border-gray-500 text-[#616161]"
                    />
                    <span className="text-[#616161]">
                      {session?.user.user._id === data?.submittedBy?._id ? (
                        'Me'
                      ) : (
                        <>
                          {data?.submittedBy
                            ? `${data?.submittedBy.firstName} ${data?.submittedBy.lastName}`
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
                      data?.submittedBy?.createdAt.toString() ??
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
                      data?.submittedBy?.createdAt.toString() ??
                        new Date().toString()
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* // second  */}
      <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
        {/* form top  */}
        <div className="mb-4 flex justify-between px-6 pt-5">
          <div className="flex flex-col">
            <h2 className="mb-1 text-xl font-semibold">Asset Details</h2>
          </div>
          <div
            className="cursor-pointer text-[#0063F7]"
            onClick={() => {}}
          ></div>
        </div>
        <div className="mb-4 grid grid-cols-2 flex-wrap items-start px-6 pt-2">
          <h1 className="font-semibold">Main Details</h1>
          <div></div>
          {showAssetDetailWithLabel({
            label: 'Asset Name',
            value: data?.name ?? '',
          })}
          {showAssetDetailWithLabel({
            label: 'Reference',
            value: data?.reference ?? '',
          })}
          {showAssetDetailWithLabel({
            label: 'Asset Description',
            value: data?.description ?? '',
          })}
          <div></div>
          {showAssetDetailWithLabel({
            label: 'Parent Category',
            value: data?.category?.name ?? '',
          })}
          {showAssetDetailWithLabel({
            label: 'Child Category',
            value: data?.subcategory?.name ?? '',
          })}
          {showAssetDetailWithLabel({ label: 'Make', value: data?.make ?? '' })}
          {showAssetDetailWithLabel({
            label: 'Model',
            value: data?.model ?? '',
          })}
          {showAssetDetailWithLabel({
            label: 'Serial Number',
            value: data?.serialNumber ?? '',
          })}
          <div></div>
          <h1 className="font-semibold">Purchase Details</h1>
          <div></div>
          {showAssetDetailWithLabel({
            label: 'Vendor / Supplier',
            value: data?.vendor ?? '',
          })}
          {showAssetDetailWithLabel({
            label: 'OwnerShip Status',
            value: data?.ownerShipStatus ?? '',
          })}
          {showAssetDetailWithLabel({
            label: 'Purchase / Authorized By',
            value: data?.authorizedBy ?? '',
          })}
          {showAssetDetailWithLabel({
            label: 'Invoice / Purchase Number',
            value: data?.invoiceNumber ?? '',
          })}
          {showAssetDetailWithLabel({
            label: 'Purchase Date',
            value: dateFormat(data?.purchaseDate?.toString() || ''),
          })}
          {showAssetDetailWithLabel({
            label: 'Warranty / Expire Date',
            value: dateFormat(data?.expireDate?.toString() || ''),
          })}
          {showAssetDetailWithLabel({
            label: 'Purchase Price',
            value: data?.purchasePrice ?? '',
          })}
          {showAssetDetailWithLabel({
            label: 'Currency / Purchase Note',
            value: data?.purchaseNote ?? '',
          })}

          <h1 className="font-semibold">Location & Maintenance</h1>
          <div></div>
          {showAssetDetailWithLabel({
            label: 'Asset Location',
            value: data?.assetLocation ?? '',
          })}

          {showAssetDetailWithLabel({
            label: 'Retiretment Date',
            value: dateFormat(data?.retirementDate?.toString() || ''),
          })}
          {showAssetDetailWithLabel({
            label: 'Retiretment Method',
            value: data?.retirementMethod ?? '',
          })}
          {showAssetDetailWithLabel({
            label: 'Maintenance Service Provider',
            value: data?.serviceProvider ?? '',
          })}
        </div>
        <div className="mb-32 px-6 pt-5">
          <h3 className="mb-1 text-sm font-medium md:text-xl">
            Check in / out permissions
          </h3>
          <div className="mb-8 flex flex-col space-y-4 p-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="option"
                checked={data?.checkInpermission == '0'}
                onChange={
                  () => {
                    updateAssetMutation.mutate({
                      axiosAuth,
                      id: data?._id!,
                      data: {
                        checkInpermission: '0',
                        selectedTeams: [],
                      },
                    });
                  }
                  // organizationForm.setFieldValue('checkInpermission', '0')
                }
                className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
              />
              <span className="ml-2">All Organization Users</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="option"
                checked={data?.checkInpermission == '1'}
                onChange={
                  () => {
                    updateAssetMutation.mutate({
                      axiosAuth,
                      id: data?._id!,
                      data: {
                        checkInpermission: '1',
                        selectedTeams: data?.selectedTeams ?? [],
                      },
                    });
                  }
                  // organizationForm.setFieldValue('checkInpermission', '1')
                }
                className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
              />
              <span className="ml-2">Selected Teams</span>
            </label>
          </div>

          {data?.checkInpermission == '1' && (
            <div className="mb-4 w-1/2">
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
                  // organizationForm.setFieldValue('teams', values);
                  updateAssetMutation.mutate({
                    axiosAuth,
                    id: data?._id!,
                    data: {
                      checkInpermission: '1',
                      selectedTeams: [...values],
                    },
                  });
                }}
                selected={data?.selectedTeams ?? []}
                hasError={false}
                placeholder="- Select Teams -"
                showImage={false}
                multiple={true}
                isOpen={openDropdown === 'dropdown9'}
                onToggle={() => handleToggle('dropdown9')}
              />
            </div>
          )}
        </div>
      </div>

      {/* third section - Photos */}
      <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
        {/* form top  */}
        <div className="mb-4 flex justify-between px-4 pt-5">
          <div className="flex flex-col">
            <h2 className="mb-1 text-xl font-semibold">Photos</h2>
          </div>
          <div
            className="cursor-pointer text-[#0063F7]"
            onClick={() => {}}
          ></div>
        </div>
        {(data?.photos ?? []).length > 0 ? (
          <div className="mb-4 flex flex-row flex-wrap items-start gap-2 px-4 pt-3">
            {(data?.photos ?? []).map((val, index) => (
              <div className="pb-4 pt-2" key={index}>
                <img
                  src={displayPhotos[index] ?? val}
                  alt={getLastSegment(val)}
                  className="h-[177px] w-[177px] cursor-pointer rounded-md object-cover"
                  onClick={() => {
                    setActiveImageIndex(index);
                    setIsLightboxOpen(true);
                  }}
                />
                <span className="my-2 block text-sm text-[#0063F7]">
                  {getLastSegment(val)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-4 px-4 py-8 text-center">
            <p className="text-sm text-[#616161]">No photos available</p>
          </div>
        )}
      </div>

      {/* Lightbox for photos */}
      {isLightboxOpen && data && data.photos && data.photos.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-2 top-2 z-10 rounded-full bg-black/60 px-3 py-1 text-sm font-semibold text-white hover:bg-black/80"
              onClick={() => setIsLightboxOpen(false)}
            >
              ✕
            </button>
            {data.photos && data.photos.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) =>
                      prev === 0 ? data.photos!.length - 1 : prev - 1
                    );
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) =>
                      prev === data.photos!.length - 1 ? 0 : prev + 1
                    );
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
                  {activeImageIndex + 1} / {data.photos.length}
                </div>
              </>
            )}
                <img
                  src={displayPhotos[activeImageIndex] ?? data.photos[activeImageIndex]}
                  alt={getLastSegment(data.photos[activeImageIndex])}
                  className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                />
          </div>
        </div>
      )}
    </>
  );
}
const showAssetDetailWithLabel = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div className="flex flex-col justify-start py-6">
      <span className="text-sm text-[#616161]">{label}</span>
      <span>{value}</span>
    </div>
  );
};
