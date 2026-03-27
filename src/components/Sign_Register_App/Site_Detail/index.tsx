import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';

import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import { RefObject, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

import React from 'react';
import { Site } from '@/app/type/Sign_Register_Sites';
import UserCard from '@/components/UserCard';
import { Search } from '@/components/Form/search';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { listOfSiteSignIn } from '@/app/(main)/(user-panel)/user/apps/sr/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { CustomHoverPorjectShow } from '@/components/Custom_Project_Hover_Component';

export function SiteDetailOverviewSection({
  data,
  contentRef,
}: {
  data: Site | undefined;
  contentRef: RefObject<HTMLDivElement>;
}) {
  const context = useJSAAppsCotnext();
  const { data: session } = useSession();
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const axiosAuth = useAxiosAuth();
  const { data: signInList } = useQuery({
    queryKey: ['sitesignIn'],
    queryFn: () =>
      listOfSiteSignIn({
        axiosAuth,
        siteId: data?._id!,
      }),
  });
  const [sorting, setSorting] = useState<{
    field: 'firstName' | 'lastName';
    direction: 'asc' | 'desc';
  }>();

  // Top of component (before return)
  // Helpers to get start and end of a day
  const getDayRange = (offset = 0) => {
    const now = new Date();
    now.setDate(now.getDate() + offset);
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return [start, end];
  };

  const [todayStart, todayEnd] = getDayRange(0);
  const [yesterdayStart, yesterdayEnd] = getDayRange(-1);

  // Replace `entry.signInAt` with your actual field if needed (like `createdAt`)
  const todayData = (signInList ?? []).filter((entry) => {
    const time = new Date(entry.signInAt ?? entry.createdAt);
    return time >= todayStart && time <= todayEnd;
  });

  const yesterdayData = (signInList ?? []).filter((entry) => {
    const time = new Date(entry.signInAt ?? entry.createdAt);
    return time >= yesterdayStart && time <= yesterdayEnd;
  });

  const todaySignIns = todayData.filter((s) => s.signOutAt == null).length;
  const todaySignOuts = todayData.filter((s) => s.signOutAt != null).length;

  const yesterdaySignIns = yesterdayData.filter(
    (s) => s.signOutAt == null
  ).length;
  const yesterdaySignOuts = yesterdayData.filter(
    (s) => s.signOutAt != null
  ).length;

  const textRef = useRef<HTMLParagraphElement>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const copyText = (text: string) => {
    if (textRef.current) {
      //   const textToCopy = textRef.current.innerText;
      navigator.clipboard
        .writeText(text)
        .then(() => {
          toast.success('Copied successfully');
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
        });
    }
  };
  const nameRef = useRef<HTMLParagraphElement>(null);

  return (
    <>
      <div
        className="h-full overflow-auto pb-5 scrollbar-hide"
        ref={contentRef}
      >
        {/* First Container  */}
        <div className="mx-4 my-1 grid grid-cols-3 justify-between gap-3">
          {/* form top  */}
          {/* 1st */}
          <div
            className="mb-4 flex flex-col gap-4 rounded-[10px] border border-[#0063F74d] p-3"
            style={{
              boxShadow: '0px 0px 8px #0063F74d',
            }}
          >
            <div className="flex flex-col">
              <span className="text-sm text-[#616161]">Site ID</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#1E1E1E]" ref={textRef}>
                  {data?.siteId ?? ''}
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => {
                    copyText(data?._id ?? '');
                  }}
                >
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
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-[#616161]">Site Name</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#1E1E1E]" ref={textRef}>
                  {data?.siteName}
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => {
                    copyText(data?.siteName ?? '');
                  }}
                >
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
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-[#616161]">Site Address</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#1E1E1E]" ref={textRef}>
                  {data?.addressLineOne}
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => {
                    copyText(data?.addressLineOne ?? '');
                  }}
                >
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
            </div>
          </div>
          {/* 2nd */}{' '}
          <div
            className="mb-4 flex flex-col gap-4 rounded-[10px] border border-[#0063F74d] p-3"
            style={{
              boxShadow: '0px 0px 8px #0063F74d',
            }}
          >
            <div className="flex flex-col items-start justify-start gap-2">
              <span className="text-gray-600">{'Assigned Project'}</span>
              {(data?.projects ?? []).length > 0 && (
                <>
                  {CustomHoverPorjectShow({
                    projects: data?.projects,
                    index: hoveredProject,
                    setHoveredProject: setHoveredProject,
                    selectedIndex: 0,
                  })}
                </>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-[#616161]">Assigned Customer</p>
              <div className="flex items-center">
                <img
                  src={'/user.svg'}
                  alt="avatar"
                  className="mr-2 h-8 w-8 rounded-full border border-gray-500"
                />
                <span className="text-sm text-gray-700">{`${
                  data?.assignedCustomer
                }`}</span>
              </div>
              {/* <UserCard submittedBy={data?.assignedCustomer} index={1} /> */}
            </div>
          </div>
          {/* 3rd */}
          <div
            className="mb-4 flex flex-col gap-4 rounded-[10px] border border-[#0063F74d] p-3"
            style={{
              boxShadow: '0px 0px 8px #0063F74d',
            }}
          >
            <h2 className="text-sm text-[#616161]">Submitted By</h2>
            <UserCard submittedBy={data?.createdBy} index={0} />

            <div className="flex w-full gap-2">
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
                <span className="text-sm text-[#616161]">
                  {dateFormat(
                    data?.createdAt.toString() ?? new Date().toString()
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
                <span className="text-sm text-[#616161]">
                  {timeFormat(
                    data?.createdAt.toString() ?? new Date().toString()
                  )}
                </span>
              </div>
            </div>

            {/* ----------- */}
            <div className="flex flex-col">
              <span className="text-sm text-[#616161]">Last Edited by</span>
              <UserCard submittedBy={data?.updatedBy} index={1} />

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
                  <span className="text-sm text-[#616161]">
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
                  <span className="text-sm text-[#616161]">
                    {timeFormat(
                      data?.updatedAt.toString() ?? new Date().toString()
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-6" />
          </div>
        </div>

        {/* Second Container  */}
        <div
          className="mx-4 flex h-[656px] flex-col overflow-y-auto rounded-lg p-4"
          style={{
            boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div className="flex flex-col items-start">
            <span className="text-[20px] font-semibold text-[#000000]">
              Sign-in Data
            </span>

            <span className="text-sm text-[#616161]" ref={textRef}>
              View current and historic sign in data and stats.
            </span>
          </div>

          {/* calculation  */}
          {/* Today Sign-ins and Sign-outs  */}
          <div className="mt-4 text-base font-semibold text-black">Today</div>
          <div className="mt-2 flex gap-2">
            <div className="flex h-[100px] w-[150px] flex-col items-center justify-center rounded-lg bg-[#A2FF8B]">
              <span className="text-[32px] font-semibold text-[#000000]">
                {0}
              </span>
              <span className="text-sm">Active On-site</span>
            </div>
            <div className="flex h-[100px] w-[150px] flex-col items-center justify-center rounded-lg bg-[#B9E0FF]">
              <span className="text-[32px] font-semibold text-[#000000]">
                {todaySignIns ?? 0}
              </span>
              <span className="text-sm">Total Sign-ins</span>
            </div>
            <div className="flex h-[100px] w-[150px] flex-col items-center justify-center rounded-lg bg-[#E2F3FF]">
              <span className="text-[32px] font-semibold text-[#000000]">
                {todaySignOuts ?? 0}
              </span>
              <span className="text-sm">Total Sign-outs</span>
            </div>
          </div>
          {/* Yesterday Sign-ins and Sign-outs */}
          <div className="mt-4 text-base font-semibold text-black">
            Yesterday
          </div>
          <div className="mt-2 flex gap-2">
            <div className="flex h-[100px] w-[150px] flex-col items-center justify-center rounded-lg bg-[#B9E0FF]">
              <span className="text-[32px] font-semibold text-[#000000]">
                {yesterdaySignIns ?? 0}
              </span>
              <span className="text-sm">Total Sign-ins</span>
            </div>
            <div className="flex h-[100px] w-[150px] flex-col items-center justify-center rounded-lg bg-[#E2F3FF]">
              <span className="text-[32px] font-semibold text-[#000000]">
                {yesterdaySignOuts ?? 0}
              </span>
              <span className="text-sm">Total Sign-outs</span>
            </div>
          </div>

          {/* // Lifetime Total Sign-ins and Sign-outs */}
          <div className="mt-4 text-base font-semibold text-black">
            Lifetime Total
          </div>
          <div className="mt-2 flex gap-2">
            <div className="flex h-[100px] w-[150px] flex-col items-center justify-center rounded-lg bg-[#E0E0E0]">
              <span className="text-[32px] font-semibold text-[#000000]">
                {(signInList ?? []).filter((s) => s.signOutAt == null).length ??
                  0}
              </span>
              <span className="text-sm">Total Sign-ins</span>
            </div>
            <div className="flex h-[100px] w-[150px] flex-col items-center justify-center rounded-lg bg-[#EEEEEE]">
              <span className="text-[32px] font-semibold text-[#000000]">
                {(signInList ?? []).filter((s) => s.signOutAt != null).length ??
                  0}
              </span>
              <span className="text-sm">Total Sign-outs</span>
            </div>
          </div>
        </div>
        {/* Third Container  */}
        <div
          className="mx-4 mt-6 flex h-[656px] flex-col overflow-y-auto rounded-lg"
          style={{
            boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div className="flex flex-col sm:p-5 sm:pb-0 md:flex md:flex-row md:justify-between">
            <div className="flex flex-col">
              <h2 className="mb-1 text-sm font-semibold md:text-xl">
                Site Managers
              </h2>
              <p className="text-[10px] font-normal text-[#616161] md:text-sm">
                Select ‘Edit’ to add or remove Site Managers.
              </p>
            </div>
            <div className="flex flex-row items-center gap-2">
              {/* SearchBox */}
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
          </div>

          <div className="flex-1 overflow-y-scroll p-5 pt-2">
            {
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left text-xs font-semibold text-gray-600 md:text-sm">
                      <span
                        className="flex gap-1"
                        onClick={() => {
                          if (sorting?.direction == 'asc') {
                            setSorting({
                              field: 'firstName',
                              direction: 'desc',
                            });
                          } else {
                            setSorting({
                              field: 'firstName',
                              direction: 'asc',
                            });
                          }
                        }}
                      >
                        First Name
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12.9373 3L12.8623 3.00525C12.7274 3.0234 12.6036 3.08988 12.5139 3.19236C12.4243 3.29483 12.3749 3.42635 12.3748 3.5625V13.0815L9.9598 10.668L9.8968 10.614C9.78265 10.5292 9.64059 10.4907 9.49922 10.5064C9.35786 10.5221 9.22768 10.5907 9.1349 10.6985C9.04212 10.8063 8.99362 10.9453 8.99917 11.0874C9.00471 11.2295 9.0639 11.3643 9.1648 11.4645L12.5428 14.8395L12.6058 14.8935C12.7142 14.9735 12.8476 15.012 12.982 15.002C13.1163 14.9919 13.2426 14.934 13.3378 14.8387L16.7106 11.4637L16.7646 11.4008C16.8448 11.2923 16.8834 11.1587 16.8734 11.0242C16.8633 10.8897 16.8053 10.7633 16.7098 10.668L16.6468 10.614C16.5384 10.5338 16.4048 10.4951 16.2703 10.5052C16.1357 10.5152 16.0093 10.5733 15.9141 10.6688L13.4998 13.0845V3.5625L13.4953 3.486C13.4768 3.35133 13.4102 3.22792 13.3077 3.13858C13.2053 3.04923 13.0732 3.00001 12.9373 3ZM4.66105 3.165L1.2898 6.53625L1.23505 6.59925C1.15501 6.7076 1.11652 6.84108 1.12657 6.97541C1.13661 7.10974 1.19454 7.23601 1.2898 7.33125L1.3528 7.386C1.46115 7.46603 1.59463 7.50453 1.72896 7.49448C1.86329 7.48443 1.98956 7.42651 2.0848 7.33125L4.49755 4.91775V14.4412L4.50355 14.5177C4.52204 14.6524 4.58866 14.7758 4.6911 14.8652C4.79354 14.9545 4.92487 15.0037 5.0608 15.0037L5.13655 14.9985C5.27135 14.9802 5.39495 14.9136 5.48444 14.8112C5.57394 14.7087 5.62327 14.5773 5.6233 14.4412L5.62255 4.91925L8.0398 7.332L8.1028 7.386C8.21703 7.46979 8.35867 7.50739 8.49942 7.49128C8.64016 7.47518 8.76965 7.40657 8.86201 7.29915C8.95437 7.19173 9.00279 7.05342 8.99761 6.91185C8.99243 6.77028 8.93402 6.63588 8.83405 6.5355L5.45605 3.165L5.3923 3.111C5.28395 3.03096 5.15047 2.99247 5.01614 3.00252C4.88181 3.01257 4.75554 3.07049 4.6603 3.16575"
                            fill="#0063F7"
                          />
                        </svg>
                      </span>
                    </th>
                    <th className="p-2 text-left text-xs font-semibold text-gray-600 md:text-sm">
                      <span
                        className="flex gap-1"
                        onClick={() => {
                          if (sorting?.direction == 'asc') {
                            setSorting({
                              field: 'lastName',
                              direction: 'desc',
                            });
                          } else {
                            setSorting({
                              field: 'lastName',
                              direction: 'asc',
                            });
                          }
                        }}
                      >
                        {' '}
                        Last Name
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12.9373 3L12.8623 3.00525C12.7274 3.0234 12.6036 3.08988 12.5139 3.19236C12.4243 3.29483 12.3749 3.42635 12.3748 3.5625V13.0815L9.9598 10.668L9.8968 10.614C9.78265 10.5292 9.64059 10.4907 9.49922 10.5064C9.35786 10.5221 9.22768 10.5907 9.1349 10.6985C9.04212 10.8063 8.99362 10.9453 8.99917 11.0874C9.00471 11.2295 9.0639 11.3643 9.1648 11.4645L12.5428 14.8395L12.6058 14.8935C12.7142 14.9735 12.8476 15.012 12.982 15.002C13.1163 14.9919 13.2426 14.934 13.3378 14.8387L16.7106 11.4637L16.7646 11.4008C16.8448 11.2923 16.8834 11.1587 16.8734 11.0242C16.8633 10.8897 16.8053 10.7633 16.7098 10.668L16.6468 10.614C16.5384 10.5338 16.4048 10.4951 16.2703 10.5052C16.1357 10.5152 16.0093 10.5733 15.9141 10.6688L13.4998 13.0845V3.5625L13.4953 3.486C13.4768 3.35133 13.4102 3.22792 13.3077 3.13858C13.2053 3.04923 13.0732 3.00001 12.9373 3ZM4.66105 3.165L1.2898 6.53625L1.23505 6.59925C1.15501 6.7076 1.11652 6.84108 1.12657 6.97541C1.13661 7.10974 1.19454 7.23601 1.2898 7.33125L1.3528 7.386C1.46115 7.46603 1.59463 7.50453 1.72896 7.49448C1.86329 7.48443 1.98956 7.42651 2.0848 7.33125L4.49755 4.91775V14.4412L4.50355 14.5177C4.52204 14.6524 4.58866 14.7758 4.6911 14.8652C4.79354 14.9545 4.92487 15.0037 5.0608 15.0037L5.13655 14.9985C5.27135 14.9802 5.39495 14.9136 5.48444 14.8112C5.57394 14.7087 5.62327 14.5773 5.6233 14.4412L5.62255 4.91925L8.0398 7.332L8.1028 7.386C8.21703 7.46979 8.35867 7.50739 8.49942 7.49128C8.64016 7.47518 8.76965 7.40657 8.86201 7.29915C8.95437 7.19173 9.00279 7.05342 8.99761 6.91185C8.99243 6.77028 8.93402 6.63588 8.83405 6.5355L5.45605 3.165L5.3923 3.111C5.28395 3.03096 5.15047 2.99247 5.01614 3.00252C4.88181 3.01257 4.75554 3.07049 4.6603 3.16575"
                            fill="#0063F7"
                          />
                        </svg>
                      </span>
                    </th>

                    <th className="hidden p-2 text-left text-xs font-semibold text-gray-600 md:table-cell md:text-sm">
                      Email
                    </th>
                    <th className="p-2 text-xs font-semibold text-gray-600 md:text-sm"></th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.siteManagers ?? [])
                    .sort((a, b) => {
                      const nameA =
                        `${a.firstName} ${a.lastName}`.toLowerCase();
                      const nameB =
                        `${b.firstName} ${b.lastName}`.toLowerCase();
                      const firstNameA = a.firstName.toLowerCase();
                      const firstNameB = b.firstName.toLowerCase();
                      if (
                        sorting?.field === 'firstName' &&
                        sorting?.direction === 'desc'
                      ) {
                        return firstNameA.localeCompare(firstNameB);
                      }
                      if (
                        sorting?.field === 'lastName' &&
                        sorting?.direction === 'desc'
                      ) {
                        return nameA.localeCompare(nameB);
                      }
                      if (
                        sorting?.field === 'firstName' &&
                        sorting?.direction === 'asc'
                      ) {
                        return firstNameB.localeCompare(firstNameA);
                      }

                      if (
                        sorting?.field === 'lastName' &&
                        sorting?.direction === 'asc'
                      ) {
                        return firstNameB.localeCompare(firstNameA);
                      }

                      return 0;
                    })
                    .map((user, index) => (
                      <tr
                        key={user._id}
                        className={`border-b border-gray-200 hover:bg-gray-100 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="truncate p-2 text-xs text-gray-700 md:text-sm">
                          {user.firstName}
                        </td>
                        <td className="truncate p-2 text-xs text-gray-700 md:text-sm">
                          {user.lastName}
                        </td>

                        <td className="hidden p-2 text-xs text-gray-500 md:table-cell md:text-sm">
                          {user.email}
                        </td>
                        <td></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            }
          </div>

          <div className="flex justify-between border-t-2 border-gray-200 px-3 py-2">
            <div className="font-Open-Sans text-sm font-normal text-[#616161]">
              Items per page: 0
            </div>

            <div className="flex items-center justify-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => {}}
                //   disabled={currentPage === 1}
                className="rounded-md px-2 py-1 text-lg text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaAngleLeft />
              </button>

              {/* Current Page */}
              <div className="rounded-lg border border-gray-700 px-3 py-1 text-gray-700">
                1
              </div>

              {/* Total Pages */}
              <span className="text-sm text-gray-700">of {1}</span>

              {/* Next Button */}
              <button
                //   onClick={() => handlePageChange(currentPage + 1)}
                //   disabled={currentPage === totalPages}
                className="rounded-md px-2 py-1 text-lg text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaAngleRight />
              </button>
            </div>

            <div className="font-Open-Sans text-base font-semibold text-[#616161]"></div>
          </div>
        </div>
      </div>
    </>
  );
}
