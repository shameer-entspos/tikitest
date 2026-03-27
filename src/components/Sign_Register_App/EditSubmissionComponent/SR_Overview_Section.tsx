import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import Loader from '@/components/DottedLoader/loader';
import useAxiosAuth from '@/hooks/AxiosAuth';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import { RefObject, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useQuery } from 'react-query';

import React from 'react';
import { getLastSegment } from '@/components/JobSafetyAnalysis/CreateNewComponents/JSA_Upload_IMG';
import { useSRAppCotnext } from '@/app/(main)/(user-panel)/user/apps/sr/sr_context';
import { RollCall } from '@/app/type/roll_call';
import { SR_APP_ACTION_TYPE } from '@/app/helpers/user/enums';
import { Search } from '@/components/Form/search';
import { getAllSRList } from '@/app/(main)/(user-panel)/user/apps/sr/api';
import { user } from '@nextui-org/react';
import { PresignedUserAvatar } from '@/components/common/PresignedUserAvatar';

export function SROverviewSection({
  data,
  contentRef,
}: {
  data: RollCall | undefined;
  contentRef: RefObject<HTMLDivElement>;
}) {
  const [hoveredSubmittedBy, setHoveredSubmittedBy] = useState<any | null>(
    null
  );
  const [hoveredEditedBy, setHoveredEditedBy] = useState<any | null>(null);

  const textRef = useRef<HTMLParagraphElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { state, dispatch } = useSRAppCotnext();

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
  const nameRef = useRef<HTMLParagraphElement>(null);

  const copyNameText = () => {
    if (textRef.current) {
      const textToCopy = textRef.current.innerText;
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          toast.success('Name copied successfully');
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
        });
    }
  };

  const axiosAuth = useAxiosAuth();

  var filterUsers =
    (data?.users ?? []).filter((e) =>
      `${e?.firstName} ${e.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) ?? [];

  return (
    <>
      <div className="h-full overflow-auto scrollbar-hide" ref={contentRef}>
        {/* Step 1  */}
        <div className="mb-4 flex w-full flex-row gap-4 px-4 pt-5">
          {/* 1st Box */}
          <div
            className="flex min-h-[240px] w-full flex-col gap-4 rounded-lg p-4"
            style={{ boxShadow: '0px 3px 8px rgba(108, 141, 255, 0.42)' }}
          >
            {/* Entry ID */}
            <div className="entryID">
              <div className="text-[#616161]">Entry ID</div>
              <div className="flex items-center gap-2 text-[14px] text-[#1E1E1E]">
                {data?.rollNumber}
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
              </div>
            </div>

            {/* Entry Name */}
            <div className="entryName">
              <div className="text-[#616161]">Entry Name</div>
              <div className="flex items-center gap-2 text-[14px] text-[#1E1E1E]">
                {data?.title}
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
              </div>
            </div>

            {/* Submission Name */}
            <div className="submissionName">
              <div className="text-[#616161]">Submission Name</div>
              <div className="flex items-center gap-2 text-[14px] text-[#1E1E1E]">
                {'Roll Call'}
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
              </div>
            </div>
          </div>

          {/* 2nd Box */}
          <div
            className="flex min-h-[240px] w-full flex-col gap-4 rounded-lg p-4"
            style={{ boxShadow: '0px 3px 8px rgba(108, 141, 255, 0.42)' }}
          >
            {/* Assigned Project */}
            <div className="assignedProjects flex flex-col gap-1">
              <div className="text-[#616161]">Assigned Project</div>
              <div className="w-fit rounded-lg bg-[#97F1BB] px-4 py-1 text-[16px]">
                projects
              </div>
            </div>

            {/* Attendance Count */}
            <div className="assignedProjects flex flex-col gap-1">
              <div className="text-[#616161]">Attendance Count</div>
              <div className="w-fit rounded-lg bg-[#87CEFF] px-4 py-1 text-[16px]">
                {
                  (data?.users ?? []).filter((u) => u.status === 'present')
                    .length
                }
                /{(data?.users ?? []).length}
              </div>
            </div>
          </div>

          {/* 3rd Box */}
          <div
            className="flex min-h-[240px] w-full flex-col gap-4 rounded-lg p-4"
            style={{ boxShadow: '0px 3px 8px rgba(108, 141, 255, 0.42)' }}
          >
            {/* Submitted by */}
            <div className="entryID relative flex flex-col gap-1">
              <div className="text-[#616161]">Submitted by</div>
              <div
                className="flex items-center gap-2 text-[14px] text-[#1E1E1E]"
                onMouseEnter={() =>
                  setHoveredSubmittedBy(data?.submittedBy?._id)
                }
                onMouseLeave={() => setHoveredSubmittedBy(null)}
              >
                {/* Avatar */}
                <div className="flex items-center">
                  <PresignedUserAvatar
                    photo={data?.submittedBy?.photo}
                    fallback="/images/User-profile.png"
                    alt="avatar"
                    className="mr-2 h-8 w-8 rounded-full border border-gray-500 text-[#616161]"
                  />
                  <span className="text-[#616161]">{'Me'}</span>
                </div>

                {/* Hover Effect */}
                {hoveredSubmittedBy === data?.submittedBy?._id && (
                  <div className="absolute top-8 z-20 mt-2 w-[300px] rounded-lg border bg-gray-50 p-4 text-xs text-[#616161] shadow-lg">
                    <div className="flex items-start">
                      <PresignedUserAvatar
                        photo={data?.submittedBy?.photo}
                        fallback="/images/User-profile.png"
                        alt="Avatar"
                        className="h-10 w-10 flex-shrink-0 rounded-full border border-gray-500 bg-gray-200"
                      />
                      <div className="ml-4 space-y-2">
                        <p className="text-sm font-semibold text-[#605f5f]">
                          {`${data?.submittedBy?.firstName ?? ''} ${data?.submittedBy?.lastName ?? ''}`}
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
                          <p className="text-xs"> {data?.submittedBy?.email} </p>
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
                          <p className="text-sm">
                            {' '}
                            {data?.submittedBy?.organization?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="calander flex gap-2 text-[14px] text-[#616161]">
                {/* Date */}
                <div className="date flex gap-1">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_4303_26920)">
                      <path
                        d="M17.9151 3.33405H15.6929V5.00071C15.6929 5.16122 15.6612 5.32015 15.5998 5.46844C15.5384 5.61673 15.4484 5.75146 15.3349 5.86496C15.2214 5.97845 15.0866 6.06848 14.9384 6.1299C14.7901 6.19132 14.6311 6.22294 14.4706 6.22294C14.3101 6.22294 14.1512 6.19132 14.0029 6.1299C13.8546 6.06848 13.7199 5.97845 13.6064 5.86496C13.4929 5.75146 13.4029 5.61673 13.3414 5.46844C13.28 5.32015 13.2484 5.16122 13.2484 5.00071V3.33405H6.77619V5.00071C6.77619 5.32487 6.64742 5.63575 6.4182 5.86496C6.18899 6.09417 5.87812 6.22294 5.55396 6.22294C5.22981 6.22294 4.91893 6.09417 4.68972 5.86496C4.46051 5.63575 4.33174 5.32487 4.33174 5.00071V3.33405H2.10952C1.97731 3.33254 1.84614 3.35757 1.72377 3.40764C1.6014 3.45771 1.49031 3.53181 1.39708 3.62556C1.30385 3.71931 1.23036 3.83081 1.18097 3.95345C1.13158 4.0761 1.10728 4.20741 1.10952 4.3396V16.7729C1.10731 16.9028 1.13071 17.0318 1.17838 17.1527C1.22604 17.2735 1.29705 17.3837 1.38733 17.4771C1.47761 17.5705 1.58541 17.6452 1.70455 17.6969C1.8237 17.7486 1.95187 17.7763 2.08174 17.7785H17.9151C18.0449 17.7763 18.1731 17.7486 18.2923 17.6969C18.4114 17.6452 18.5192 17.5705 18.6095 17.4771C18.6998 17.3837 18.7708 17.2735 18.8184 17.1527C18.8661 17.0318 18.8895 16.9028 18.8873 16.7729V4.3396C18.8895 4.20974 18.8661 4.08071 18.8184 3.95988C18.7708 3.83906 18.6998 3.72881 18.6095 3.63543C18.5192 3.54205 18.4114 3.46738 18.2923 3.41566C18.1731 3.36395 18.0449 3.33622 17.9151 3.33405ZM5.55396 14.4452H4.44285V13.334H5.55396V14.4452ZM5.55396 11.6674H4.44285V10.5563H5.55396V11.6674ZM5.55396 8.8896H4.44285V7.77849H5.55396V8.8896ZM8.8873 14.4452H7.77619V13.334H8.8873V14.4452ZM8.8873 11.6674H7.77619V10.5563H8.8873V11.6674ZM8.8873 8.8896H7.77619V7.77849H8.8873V8.8896ZM12.2206 14.4452H11.1095V13.334H12.2206V14.4452ZM12.2206 11.6674H11.1095V10.5563H12.2206V11.6674ZM12.2206 8.8896H11.1095V7.77849H12.2206V8.8896ZM15.554 14.4452H14.4429V13.334H15.554V14.4452ZM15.554 11.6674H14.4429V10.5563H15.554V11.6674ZM15.554 8.8896H14.4429V7.77849H15.554V8.8896Z"
                        fill="#616161"
                      />
                      <path
                        d="M5.55556 5.55577C5.7029 5.55577 5.84421 5.49724 5.94839 5.39305C6.05258 5.28887 6.11111 5.14756 6.11111 5.00022V1.66688C6.11111 1.51954 6.05258 1.37823 5.94839 1.27405C5.84421 1.16986 5.7029 1.11133 5.55556 1.11133C5.40821 1.11133 5.26691 1.16986 5.16272 1.27405C5.05853 1.37823 5 1.51954 5 1.66688V5.00022C5 5.14756 5.05853 5.28887 5.16272 5.39305C5.26691 5.49724 5.40821 5.55577 5.55556 5.55577Z"
                        fill="#616161"
                      />
                      <path
                        d="M14.4462 5.55577C14.5935 5.55577 14.7348 5.49724 14.839 5.39305C14.9432 5.28887 15.0017 5.14756 15.0017 5.00022V1.66688C15.0017 1.51954 14.9432 1.37823 14.839 1.27405C14.7348 1.16986 14.5935 1.11133 14.4462 1.11133C14.2988 1.11133 14.1575 1.16986 14.0533 1.27405C13.9492 1.37823 13.8906 1.51954 13.8906 1.66688V5.00022C13.8906 5.14756 13.9492 5.28887 14.0533 5.39305C14.1575 5.49724 14.2988 5.55577 14.4462 5.55577Z"
                        fill="#616161"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_4303_26920">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  {dateFormat(
                    data?.createdAt.toString() ?? new Date().toString()
                  )}
                </div>

                {/* Time */}
                <div className="date flex gap-1">
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
                  {timeFormat(
                    data?.createdAt.toString() ?? new Date().toString()
                  )}
                </div>
              </div>
            </div>

            {/* Last Edited By */}
            <div className="entryID relative flex flex-col gap-1">
              <div className="text-[#616161]">Last Edited By</div>
              <div className="flex items-center gap-2 text-[14px] text-[#1E1E1E]">
                {/* Avatar */}
                <div
                  className="items-cente flex"
                  onMouseEnter={() => setHoveredEditedBy(data?.updatedBy._id)}
                  onMouseLeave={() => setHoveredEditedBy(null)}
                >
                  <PresignedUserAvatar
                    photo={data?.updatedBy?.photo}
                    fallback="/images/User-profile.png"
                    alt="avatar"
                    className="mr-2 h-8 w-8 rounded-full border border-gray-500 text-[#616161]"
                  />
                  <span className="text-[#616161]">{'Me'}</span>
                </div>

                {/* Hover Effect */}
                {hoveredEditedBy === data?.updatedBy._id && (
                  <div className="absolute top-8 z-20 mt-2 w-[300px] rounded-lg border bg-gray-50 p-4 text-xs text-[#616161] shadow-lg">
                    <div className="flex items-start">
                      <PresignedUserAvatar
                        photo={data?.updatedBy?.photo}
                        fallback="/images/User-profile.png"
                        alt="Avatar"
                        className="h-10 w-10 flex-shrink-0 rounded-full border border-gray-500 bg-gray-200"
                      />
                      <div className="ml-4 space-y-2">
                        <p className="text-sm font-semibold text-[#605f5f]">
                          {`${data?.updatedBy.firstName} ${data?.updatedBy.lastName}`}
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
                          <p className="text-xs"> {data?.updatedBy.email} </p>
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
                          <p className="text-sm">
                            {' '}
                            {data?.updatedBy.organization?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="calander flex gap-2 text-[14px] text-[#616161]">
                {/* Date */}
                <div className="date flex gap-1">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_4303_26920)">
                      <path
                        d="M17.9151 3.33405H15.6929V5.00071C15.6929 5.16122 15.6612 5.32015 15.5998 5.46844C15.5384 5.61673 15.4484 5.75146 15.3349 5.86496C15.2214 5.97845 15.0866 6.06848 14.9384 6.1299C14.7901 6.19132 14.6311 6.22294 14.4706 6.22294C14.3101 6.22294 14.1512 6.19132 14.0029 6.1299C13.8546 6.06848 13.7199 5.97845 13.6064 5.86496C13.4929 5.75146 13.4029 5.61673 13.3414 5.46844C13.28 5.32015 13.2484 5.16122 13.2484 5.00071V3.33405H6.77619V5.00071C6.77619 5.32487 6.64742 5.63575 6.4182 5.86496C6.18899 6.09417 5.87812 6.22294 5.55396 6.22294C5.22981 6.22294 4.91893 6.09417 4.68972 5.86496C4.46051 5.63575 4.33174 5.32487 4.33174 5.00071V3.33405H2.10952C1.97731 3.33254 1.84614 3.35757 1.72377 3.40764C1.6014 3.45771 1.49031 3.53181 1.39708 3.62556C1.30385 3.71931 1.23036 3.83081 1.18097 3.95345C1.13158 4.0761 1.10728 4.20741 1.10952 4.3396V16.7729C1.10731 16.9028 1.13071 17.0318 1.17838 17.1527C1.22604 17.2735 1.29705 17.3837 1.38733 17.4771C1.47761 17.5705 1.58541 17.6452 1.70455 17.6969C1.8237 17.7486 1.95187 17.7763 2.08174 17.7785H17.9151C18.0449 17.7763 18.1731 17.7486 18.2923 17.6969C18.4114 17.6452 18.5192 17.5705 18.6095 17.4771C18.6998 17.3837 18.7708 17.2735 18.8184 17.1527C18.8661 17.0318 18.8895 16.9028 18.8873 16.7729V4.3396C18.8895 4.20974 18.8661 4.08071 18.8184 3.95988C18.7708 3.83906 18.6998 3.72881 18.6095 3.63543C18.5192 3.54205 18.4114 3.46738 18.2923 3.41566C18.1731 3.36395 18.0449 3.33622 17.9151 3.33405ZM5.55396 14.4452H4.44285V13.334H5.55396V14.4452ZM5.55396 11.6674H4.44285V10.5563H5.55396V11.6674ZM5.55396 8.8896H4.44285V7.77849H5.55396V8.8896ZM8.8873 14.4452H7.77619V13.334H8.8873V14.4452ZM8.8873 11.6674H7.77619V10.5563H8.8873V11.6674ZM8.8873 8.8896H7.77619V7.77849H8.8873V8.8896ZM12.2206 14.4452H11.1095V13.334H12.2206V14.4452ZM12.2206 11.6674H11.1095V10.5563H12.2206V11.6674ZM12.2206 8.8896H11.1095V7.77849H12.2206V8.8896ZM15.554 14.4452H14.4429V13.334H15.554V14.4452ZM15.554 11.6674H14.4429V10.5563H15.554V11.6674ZM15.554 8.8896H14.4429V7.77849H15.554V8.8896Z"
                        fill="#616161"
                      />
                      <path
                        d="M5.55556 5.55577C5.7029 5.55577 5.84421 5.49724 5.94839 5.39305C6.05258 5.28887 6.11111 5.14756 6.11111 5.00022V1.66688C6.11111 1.51954 6.05258 1.37823 5.94839 1.27405C5.84421 1.16986 5.7029 1.11133 5.55556 1.11133C5.40821 1.11133 5.26691 1.16986 5.16272 1.27405C5.05853 1.37823 5 1.51954 5 1.66688V5.00022C5 5.14756 5.05853 5.28887 5.16272 5.39305C5.26691 5.49724 5.40821 5.55577 5.55556 5.55577Z"
                        fill="#616161"
                      />
                      <path
                        d="M14.4462 5.55577C14.5935 5.55577 14.7348 5.49724 14.839 5.39305C14.9432 5.28887 15.0017 5.14756 15.0017 5.00022V1.66688C15.0017 1.51954 14.9432 1.37823 14.839 1.27405C14.7348 1.16986 14.5935 1.11133 14.4462 1.11133C14.2988 1.11133 14.1575 1.16986 14.0533 1.27405C13.9492 1.37823 13.8906 1.51954 13.8906 1.66688V5.00022C13.8906 5.14756 13.9492 5.28887 14.0533 5.39305C14.1575 5.49724 14.2988 5.55577 14.4462 5.55577Z"
                        fill="#616161"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_4303_26920">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  {dateFormat(
                    data?.updatedAt.toString() ?? new Date().toString()
                  )}
                </div>

                {/* Time */}
                <div className="date flex gap-1">
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
                  {timeFormat(
                    data?.updatedAt.toString() ?? new Date().toString()
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2  */}
        <div className="mx-4 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow">
          <div className="mb-4 flex justify-between px-4 pt-5">
            <div className="flex flex-col">
              <h2 className="mb-1 text-xl font-semibold">Selected Site</h2>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap items-center justify-start gap-2 px-4 pt-2">
            {(data?.sites ?? []).map((site) => {
              return (
                <div
                  key={site._id}
                  className="group relative flex gap-2 rounded-xl bg-[#CFC7FF] px-3 py-1 text-black"
                >
                  <p>{site.siteName}</p>
                  {/* Tooltip */}
                  <div className="absolute left-1 top-0 -mb-1 hidden w-[320px] max-w-[320px] -translate-x-1 transform flex-col items-start rounded-md bg-[#CFC7FF] p-2 pr-8 text-xs text-[#1E1E1E] shadow-lg group-hover:flex">
                    <div className="heading mb-1 flex flex-row items-center gap-2">
                      <div className="img">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_4256_33139)">
                            <path
                              d="M17.8191 4.6484L15.6816 3.0014C15.5363 2.90819 15.3784 2.83635 15.2127 2.7881C15.0477 2.73426 14.8759 2.70455 14.7024 2.6999H8.55L9.2709 7.1999H14.7024C14.85 7.1999 15.0345 7.1666 15.2118 7.1117C15.3891 7.0568 15.5601 6.9812 15.6807 6.8993L17.8182 5.2505C17.9397 5.1686 18 5.0597 18 4.9499C18 4.8401 17.9397 4.7312 17.8191 4.6484ZM7.65 0.899902H6.75C6.63065 0.899902 6.51619 0.947313 6.4318 1.0317C6.34741 1.1161 6.3 1.23055 6.3 1.3499V4.4999H3.2976C3.1482 4.4999 2.9646 4.5332 2.7873 4.589C2.6091 4.643 2.439 4.7177 2.3184 4.8014L0.1809 6.4484C0.0594 6.5303 0 6.6401 0 6.7499C0 6.8588 0.0594 6.9677 0.1809 7.0514L2.3184 8.7002C2.439 8.7821 2.6091 8.8577 2.7873 8.9117C2.9646 8.9666 3.1482 8.9999 3.2976 8.9999H6.3V16.6499C6.3 16.7693 6.34741 16.8837 6.4318 16.9681C6.51619 17.0525 6.63065 17.0999 6.75 17.0999H7.65C7.76935 17.0999 7.88381 17.0525 7.9682 16.9681C8.05259 16.8837 8.1 16.7693 8.1 16.6499V1.3499C8.1 1.23055 8.05259 1.1161 7.9682 1.0317C7.88381 0.947313 7.76935 0.899902 7.65 0.899902Z"
                              fill="black"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_4256_33139">
                              <rect width="18" height="18" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                      <div className="text-sm font-semibold">
                        {site.siteName}
                      </div>
                    </div>
                    <div className="desc text-xs">{site.addressLineOne}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-4 my-2 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow">
          <div className="mb-4 flex justify-between px-4 pt-5">
            <div className="flex flex-col">
              <h2 className="mb-1 text-xl font-semibold">Roll Call Details</h2>
            </div>
          </div>
          <div className="mb-4 grid grid-cols-2 flex-wrap items-center px-4 pt-2">
            <div className="pb-4 pt-2">
              <h3 className="text-sm text-gray-700">Topic Title</h3>
              <div className="title flex items-center gap-2">
                <p className="font-bold">{data?.title}</p>
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
              </div>
            </div>

            <div className="col-span-2 pb-4 pt-2">
              <h3 className="text-sm text-gray-700">Description</h3>
              <p>{data?.description}</p>
            </div>
          </div>
        </div>

        <div className="mx-4 my-2 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow">
          <div className="flex flex-col sm:p-5 sm:pb-0 md:flex md:flex-row md:justify-between">
            <div className="flex flex-col">
              <h2 className="mb-1 text-sm font-semibold md:text-xl">
                Attendance
              </h2>
              <p className="text-[10px] font-normal text-[#616161] md:text-sm">
                Select people who are in attendance
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
                  placeholder="Search Requests"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {/* <div
                className="cursor-pointer text-[#0063F7]"
                onClick={() => {
                  dispatch({
                    type: SR_APP_ACTION_TYPE.CREATE_NEW_ROLL,
                    createNewRollCall: 'attendance',
                  });
                }}
              >
                Edit Section
              </div> */}
            </div>
          </div>

          <div className="flex-1 overflow-y-scroll p-5 pt-2">
            {
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left text-xs font-semibold text-gray-600 md:text-sm">
                      <span className="flex gap-1">
                        First Name{' '}
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
                      <span className="flex gap-1">
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
                      Phone
                    </th>
                    <th className="hidden p-2 text-left text-xs font-semibold text-gray-600 md:table-cell md:text-sm">
                      Email
                    </th>
                    <th className="p-2 text-xs font-semibold text-gray-600 md:text-sm">
                      <span className="flex gap-1 text-center">
                        Status
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
                  </tr>
                </thead>
                <tbody>
                  {(filterUsers ?? []).map((user, index) => (
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
                        {user.phone || '-'}
                      </td>
                      <td className="hidden p-2 text-xs text-gray-500 md:table-cell md:text-sm">
                        {user.email}
                      </td>
                      <td className="flex justify-center p-2">
                        {user.status === 'present' ? (
                          <button
                            type="button"
                            className="rounded-lg bg-[#97F1BB] px-3 py-1.5 text-xs font-medium text-gray-800 transition-colors hover:bg-[#7FE5A8] md:text-sm"
                          >
                            Present
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="rounded-lg bg-[#FFA8A8] px-3 py-1.5 text-xs font-medium text-gray-800 transition-colors hover:bg-[#FF8F8F] md:text-sm"
                          >
                            Absent
                          </button>
                        )}
                      </td>
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
            <div></div>
            <div className="font-Open-Sans text-base font-semibold text-[#616161]"></div>
          </div>
        </div>
      </div>
    </>
  );
}
