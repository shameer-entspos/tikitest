import { SingleAsset } from '@/app/type/single_asset';

import toast from 'react-hot-toast';
import { useRef, useState, useMemo, useEffect } from 'react';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import { useSession } from 'next-auth/react';
import { LiveBoard } from '@/app/type/live_board';
import { getLastSegment } from '../Create_SafetyMeeting/Select_SM_Image';
import { SafetyMeetings } from '@/app/type/safety_meeting';
import { Search } from '@/components/Form/search';
import { PaginationComponent } from '@/components/pagination';
import { useTikiPagination } from '@/hooks/usePagination';
import { CustomHoverPorjectShow } from '@/components/Custom_Project_Hover_Component';
import { getPresignedFileUrls } from '@/app/(main)/(user-panel)/user/file/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { PresignedUserAvatar } from '@/components/common/PresignedUserAvatar';

export default function SafetyMeetingDetailOverView({
  data,
}: {
  data: SafetyMeetings | undefined;
}) {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const accessToken = session?.user?.accessToken;
  const allTopicImages = useMemo(
    () =>
      (data?.topics ?? []).flatMap((t) => (t.images ?? []).filter(Boolean)) as string[],
    [data?.topics]
  );
  const [resolvedAllUrls, setResolvedAllUrls] = useState<string[] | null>(null);

  useEffect(() => {
    if (!allTopicImages.length || !accessToken?.trim()) {
      setResolvedAllUrls(null);
      return;
    }
    let cancelled = false;
    getPresignedFileUrls(axiosAuth, allTopicImages, accessToken).then((urls) => {
      if (!cancelled && urls && urls.length === allTopicImages.length)
        setResolvedAllUrls(urls);
    });
    return () => {
      cancelled = true;
    };
  }, [allTopicImages.join('|'), accessToken, axiosAuth]);

  const getTopicOffset = (topicIndex: number) =>
    (data?.topics ?? [])
      .slice(0, topicIndex)
      .reduce((sum, t) => sum + (t.images?.length ?? 0), 0);

  const entryIdRef = useRef<HTMLSpanElement>(null);
  const entryNameRef = useRef<HTMLSpanElement>(null);
  const submissionNameRef = useRef<HTMLSpanElement>(null);
  const meetingNameRef = useRef<HTMLSpanElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [activeTopicImages, setActiveTopicImages] = useState<string[]>([]);
  const [activeTopicResolvedUrls, setActiveTopicResolvedUrls] = useState<string[] | null>(null);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  useEffect(() => {
    if (!activeTopicImages.length || !accessToken?.trim()) {
      setActiveTopicResolvedUrls(null);
      return;
    }
    let cancelled = false;
    getPresignedFileUrls(axiosAuth, activeTopicImages, accessToken).then((urls) => {
      if (!cancelled && urls && urls.length === activeTopicImages.length)
        setActiveTopicResolvedUrls(urls);
    });
    return () => {
      cancelled = true;
    };
  }, [activeTopicImages.join('|'), accessToken, axiosAuth]);

  const copyText = (textRef: React.RefObject<HTMLSpanElement>) => {
    if (textRef.current) {
      const textToCopy = textRef.current.innerText;
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          toast.success('Copied successfully');
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
        });
    }
  };

  // Filter attendance based on search
  const filteredAttendance = useMemo(() => {
    if (!data?.attendance) return [];
    return data.attendance.filter((person) => {
      const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
      const email = person.email?.toLowerCase() ?? '';
      const orgName = person.organization?.name?.toLowerCase() ?? '';
      const searchLower = searchQuery.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        email.includes(searchLower) ||
        orgName.includes(searchLower)
      );
    });
  }, [data?.attendance, searchQuery]);

  // Pagination for attendance
  const itemsPerPage = 20;
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedAttendance,
    handlePageChange,
  } = useTikiPagination(filteredAttendance, itemsPerPage);

  // Extract leader email from leader string (format: "Name - email@example.com")
  const getLeaderName = () => {
    if (!data?.leader) return '';
    const parts = data.leader.split(' - ');
    return parts[0] || data.leader;
  };

  const getLeaderEmail = () => {
    if (!data?.leader) return '';
    const parts = data.leader.split(' - ');
    return parts[1] || '';
  };

  const openLightbox = (images: string[], index: number) => {
    setActiveTopicImages(images);
    setActiveImageIndex(index);
    setActiveTopicResolvedUrls(null);
    setIsLightboxOpen(true);
  };

  return (
    <>
      {/* Top three information cards */}
      <div className="mx-2 my-4 grid gap-4 lg:mx-0 lg:ml-2 lg:grid-cols-3">
        {/* Left Card: Entry Details */}
        <div className="flex flex-col rounded-lg border-2 border-[#EEEEEE] bg-white p-4 shadow-sm">
          <div className="mb-3">
            <span className="text-sm font-normal text-[#616161]">Entry ID</span>
            <div
              className="mt-1 flex cursor-pointer items-center gap-1 text-sm font-semibold text-[#1E1E1E]"
              onClick={() => copyText(entryIdRef)}
            >
              <span ref={entryIdRef}>{data?.entryId}</span>
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

          <div className="mb-3">
            <span className="text-sm font-normal text-[#616161]">
              Entry Name
            </span>
            <div
              className="mt-1 flex cursor-pointer items-center gap-1 text-sm font-semibold text-[#1E1E1E]"
              onClick={() => copyText(entryNameRef)}
            >
              <span ref={entryNameRef}>{data?.name}</span>
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

          <div>
            <span className="text-sm font-normal text-[#616161]">
              Submission Name
            </span>
            <div
              className="mt-1 flex cursor-pointer items-center gap-1 text-sm font-semibold text-[#1E1E1E]"
              onClick={() => copyText(submissionNameRef)}
            >
              <span ref={submissionNameRef}>Safety Meeting</span>
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

        {/* Middle Card: Assigned Project */}
        <div className="flex flex-col rounded-lg border-2 border-[#EEEEEE] bg-white p-4 shadow-sm">
          <div>
            <span className="text-sm font-normal text-[#616161]">
              Assigned Project
            </span>
            <div className="mt-2">
              {(data?.projects ?? []).length > 0 ? (
                CustomHoverPorjectShow({
                  projects: data?.projects,
                  index: hoveredProject,
                  selectedIndex: 0,
                  setHoveredProject: setHoveredProject,
                })
              ) : (
                <span className="rounded-lg bg-gray-200 px-2 py-1 text-sm text-black">
                  Not Assigned
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Card: Submitted By / Last Edited By */}
        <div className="flex flex-col rounded-lg border-2 border-[#EEEEEE] bg-white p-4 shadow-sm">
          <div className="mb-4">
            <span className="text-sm font-normal text-[#616161]">
              Submitted By
            </span>
            <div className="mt-2 flex items-center gap-2">
              {data?.submittedBy && (
                <>
                  <PresignedUserAvatar
                    photo={data.submittedBy.photo}
                    fallback="/images/User-profile.png"
                    alt="avatar"
                    className="h-8 w-8 rounded-full border border-gray-300"
                  />
                  <span className="text-sm text-[#1E1E1E]">
                    {session?.user.user._id === data?.submittedBy?._id
                      ? 'Me'
                      : `${data.submittedBy.firstName} ${data.submittedBy.lastName}`}
                  </span>
                </>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-[#616161]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.9151 3.336H15.6929V5.00267C15.6929 5.16317 15.6612 5.32211 15.5998 5.47039C15.5384 5.61868 15.4484 5.75342 15.3349 5.86691C15.2214 5.9804 15.0866 6.07043 14.9384 6.13185C14.7901 6.19328 14.6311 6.22489 14.4706 6.22489C14.3101 6.22489 14.1512 6.19328 14.0029 6.13185C13.8546 6.07043 13.7199 5.9804 13.6064 5.86691C13.4929 5.75342 13.4029 5.61868 13.3414 5.47039C13.28 5.32211 13.2484 5.16317 13.2484 5.00267V3.336H6.77619V5.00267C6.77619 5.32682 6.64742 5.6377 6.4182 5.86691C6.18899 6.09612 5.87812 6.22489 5.55396 6.22489C5.22981 6.22489 4.91893 6.09612 4.68972 5.86691C4.46051 5.6377 4.33174 5.32682 4.33174 5.00267V3.336H2.10952C1.97731 3.3345 1.84614 3.35952 1.72377 3.40959C1.6014 3.45966 1.49031 3.53377 1.39708 3.62752C1.30385 3.72127 1.23036 3.83276 1.18097 3.95541C1.13158 4.07805 1.10728 4.20936 1.10952 4.34156V16.7749C1.10731 16.9048 1.13071 17.0338 1.17838 17.1546C1.22604 17.2754 1.29705 17.3857 1.38733 17.4791C1.47761 17.5724 1.58541 17.6471 1.70455 17.6988C1.8237 17.7505 1.95187 17.7783 2.08174 17.7804H17.9151C18.0449 17.7783 18.1731 17.7505 18.2923 17.6988C18.4114 17.6471 18.5192 17.5724 18.6095 17.4791C18.6998 17.3857 18.7708 17.2754 18.8184 17.1546C18.8661 17.0338 18.8895 16.9048 18.8873 16.7749V4.34156C18.8895 4.21169 18.8661 4.08266 18.8184 3.96184C18.7708 3.84101 18.6998 3.73076 18.6095 3.63739C18.5192 3.54401 18.4114 3.46933 18.2923 3.41762C18.1731 3.3659 18.0449 3.33817 17.9151 3.336Z"
                  fill="#616161"
                />
              </svg>
              <span>
                {dateFormat(
                  data?.createdAt?.toString() ?? new Date().toString()
                )}{' '}
                {timeFormat(
                  data?.createdAt?.toString() ?? new Date().toString()
                )}
              </span>
            </div>
          </div>

          <div>
            <span className="text-sm font-normal text-[#616161]">
              Last Edited By
            </span>
            <div className="mt-2 flex items-center gap-2">
              {data?.submittedBy && (
                <>
                  <PresignedUserAvatar
                    photo={data.submittedBy.photo}
                    fallback="/images/User-profile.png"
                    alt="avatar"
                    className="h-8 w-8 rounded-full border border-gray-300"
                  />
                  <span className="text-sm text-[#1E1E1E]">
                    {session?.user.user._id === data?.submittedBy?._id
                      ? 'Me'
                      : `${data.submittedBy.firstName} ${data.submittedBy.lastName}`}
                  </span>
                </>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-[#616161]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.9151 3.336H15.6929V5.00267C15.6929 5.16317 15.6612 5.32211 15.5998 5.47039C15.5384 5.61868 15.4484 5.75342 15.3349 5.86691C15.2214 5.9804 15.0866 6.07043 14.9384 6.13185C14.7901 6.19328 14.6311 6.22489 14.4706 6.22489C14.3101 6.22489 14.1512 6.19328 14.0029 6.13185C13.8546 6.07043 13.7199 5.9804 13.6064 5.86691C13.4929 5.75342 13.4029 5.61868 13.3414 5.47039C13.28 5.32211 13.2484 5.16317 13.2484 5.00267V3.336H6.77619V5.00267C6.77619 5.32682 6.64742 5.6377 6.4182 5.86691C6.18899 6.09612 5.87812 6.22489 5.55396 6.22489C5.22981 6.22489 4.91893 6.09612 4.68972 5.86691C4.46051 5.6377 4.33174 5.32682 4.33174 5.00267V3.336H2.10952C1.97731 3.3345 1.84614 3.35952 1.72377 3.40959C1.6014 3.45966 1.49031 3.53377 1.39708 3.62752C1.30385 3.72127 1.23036 3.83276 1.18097 3.95541C1.13158 4.07805 1.10728 4.20936 1.10952 4.34156V16.7749C1.10731 16.9048 1.13071 17.0338 1.17838 17.1546C1.22604 17.2754 1.29705 17.3857 1.38733 17.4791C1.47761 17.5724 1.58541 17.6471 1.70455 17.6988C1.8237 17.7505 1.95187 17.7783 2.08174 17.7804H17.9151C18.0449 17.7783 18.1731 17.7505 18.2923 17.6988C18.4114 17.6471 18.5192 17.5724 18.6095 17.4791C18.6998 17.3857 18.7708 17.2754 18.8184 17.1546C18.8661 17.0338 18.8895 16.9048 18.8873 16.7749V4.34156C18.8895 4.21169 18.8661 4.08266 18.8184 3.96184C18.7708 3.84101 18.6998 3.73076 18.6095 3.63739C18.5192 3.54401 18.4114 3.46933 18.2923 3.41762C18.1731 3.3659 18.0449 3.33817 17.9151 3.336Z"
                  fill="#616161"
                />
              </svg>
              <svg
                width="16"
                height="16"
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
                {dateFormat(
                  data?.updatedAt?.toString() ?? new Date().toString()
                )}{' '}
                {timeFormat(
                  data?.updatedAt?.toString() ?? new Date().toString()
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Section */}
      <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
        <div className="flex flex-col gap-4 border-b-2 border-gray-200 p-5 sm:flex-row sm:justify-between">
          <div className="flex flex-col">
            <h2 className="mb-1 text-xl font-semibold">Attendance</h2>
            <p className="text-sm font-normal text-[#616161]">
              View people who attended this safety meeting.
            </p>
          </div>
          <div className="flex items-center justify-end">
            <Search
              inputRounded={true}
              type="search"
              className="rounded-md bg-[#eeeeee] text-sm placeholder:text-[#616161]"
              name="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F5F5F5]">
                <th className="p-2 text-left text-sm font-normal text-[#616161]">
                  <span className="flex items-center gap-1">
                    Full Name
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
                <th className="p-2 text-left text-sm font-normal text-[#616161]">
                  Email Address
                </th>
                <th className="hidden p-2 text-left text-sm font-normal text-[#616161] md:table-cell">
                  Organization
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedAttendance.map((person, index) => (
                <tr
                  key={person._id}
                  className={`border-b ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F5]'
                  }`}
                >
                  <td className="p-2 text-sm text-[#1E1E1E]">
                    {person.firstName} {person.lastName}
                  </td>
                  <td className="p-2 text-sm text-[#1E1E1E]">{person.email}</td>
                  <td className="hidden p-2 text-sm text-[#616161] md:table-cell">
                    {person?.organization?.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t-2 border-gray-200 px-3 py-2">
          <div className="text-sm font-normal text-[#616161]">
            Items per page: {itemsPerPage}
          </div>
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Meeting Overview Section */}
      <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
        <div className="mb-4 px-6 pt-5">
          <h2 className="text-xl font-semibold">Meeting Overview</h2>
        </div>
        <div className="flex flex-col gap-4 px-6 pb-5">
          <div>
            <span className="text-sm font-normal text-[#616161]">
              Meeting Name
            </span>
            <div
              className="mt-1 flex cursor-pointer items-center gap-2 text-sm text-[#1E1E1E]"
              onClick={() => copyText(meetingNameRef)}
            >
              <span ref={meetingNameRef}>{data?.name ?? ''}</span>
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
          <div>
            <span className="text-sm font-normal text-[#616161]">
              Safety Leader
            </span>
            <p className="mt-1 text-sm text-[#1E1E1E]">
              {getLeaderName()}
              {getLeaderEmail() && ` - ${getLeaderEmail()}`}
            </p>
          </div>
          <div>
            <span className="text-sm font-normal text-[#616161]">Agenda</span>
            <p className="mt-1 text-sm text-[#1E1E1E]">{data?.agenda ?? ''}</p>
          </div>
        </div>
      </div>

      {/* Discussion Topics */}
      {(data?.topics ?? []).map((topic, i) => {
        return (
          <div
            key={topic._id || i}
            className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] px-4 shadow lg:mx-0 lg:ml-2"
          >
            <div className="mb-4 flex justify-between gap-4 pt-5">
              <div className="flex-1">
                <h2 className="mb-1 text-sm font-normal text-[#616161]">
                  Discussion Topic
                </h2>
                <span className="text-sm text-[#1E1E1E]">{topic.title}</span>
              </div>
              <div className="flex-1">
                <h2 className="mb-1 text-sm font-normal text-[#616161]">
                  Category
                </h2>
                <span className="text-sm text-[#1E1E1E]">{topic.category}</span>
              </div>
            </div>

            <div className="mb-4">
              <h2 className="mb-1 text-sm font-normal text-[#616161]">
                Description
              </h2>
              <p className="text-sm text-[#1E1E1E]">{topic.description}</p>
            </div>

            {(topic.images ?? []).length > 0 && (
              <div className="mb-4">
                <h2 className="mb-2 text-lg font-normal text-[#616161]">
                  Photos
                </h2>
                <div className="flex gap-4">
                  {topic.images.map((url, index) => {
                    const offset = getTopicOffset(i);
                    const resolved =
                      resolvedAllUrls?.[offset + index] ?? url;
                    return (
                      <img
                        key={index}
                        src={resolved}
                        alt={`Photo ${index + 1}`}
                        className="h-[100px] w-[100px] cursor-pointer rounded object-cover"
                        onClick={() => openLightbox(topic.images, index)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {topic.resolution && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-normal text-[#616161]">
                  Resolution
                </label>
                <p className="text-sm text-[#1E1E1E]">{topic.resolution}</p>
              </div>
            )}

            <div className="mb-4">
              <span className="text-sm font-normal text-[#616161]">
                Submitted By
              </span>
              <div className="mt-2 flex items-center gap-2">
                {topic?.submittedBy && (
                  <>
                    <PresignedUserAvatar
                      photo={topic.submittedBy.photo}
                      fallback="/images/User-profile.png"
                      alt="avatar"
                      className="h-8 w-8 rounded-full border border-gray-300"
                    />
                    <span className="text-sm text-[#1E1E1E]">
                      {session?.user.user._id === topic?.submittedBy._id
                        ? 'Me'
                        : `${topic.submittedBy.firstName} ${topic.submittedBy.lastName}`}
                    </span>
                  </>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-[#616161]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.9151 3.336H15.6929V5.00267C15.6929 5.16317 15.6612 5.32211 15.5998 5.47039C15.5384 5.61868 15.4484 5.75342 15.3349 5.86691C15.2214 5.9804 15.0866 6.07043 14.9384 6.13185C14.7901 6.19328 14.6311 6.22489 14.4706 6.22489C14.3101 6.22489 14.1512 6.19328 14.0029 6.13185C13.8546 6.07043 13.7199 5.9804 13.6064 5.86691C13.4929 5.75342 13.4029 5.61868 13.3414 5.47039C13.28 5.32211 13.2484 5.16317 13.2484 5.00267V3.336H6.77619V5.00267C6.77619 5.32682 6.64742 5.6377 6.4182 5.86691C6.18899 6.09612 5.87812 6.22489 5.55396 6.22489C5.22981 6.22489 4.91893 6.09612 4.68972 5.86691C4.46051 5.6377 4.33174 5.32682 4.33174 5.00267V3.336H2.10952C1.97731 3.3345 1.84614 3.35952 1.72377 3.40959C1.6014 3.45966 1.49031 3.53377 1.39708 3.62752C1.30385 3.72127 1.23036 3.83276 1.18097 3.95541C1.13158 4.07805 1.10728 4.20936 1.10952 4.34156V16.7749C1.10731 16.9048 1.13071 17.0338 1.17838 17.1546C1.22604 17.2754 1.29705 17.3857 1.38733 17.4791C1.47761 17.5724 1.58541 17.6471 1.70455 17.6988C1.8237 17.7505 1.95187 17.7783 2.08174 17.7804H17.9151C18.0449 17.7783 18.1731 17.7505 18.2923 17.6988C18.4114 17.6471 18.5192 17.5724 18.6095 17.4791C18.6998 17.3857 18.7708 17.2754 18.8184 17.1546C18.8661 17.0338 18.8895 16.9048 18.8873 16.7749V4.34156C18.8895 4.21169 18.8661 4.08266 18.8184 3.96184C18.7708 3.84101 18.6998 3.73076 18.6095 3.63739C18.5192 3.54401 18.4114 3.46933 18.2923 3.41762C18.1731 3.3659 18.0449 3.33817 17.9151 3.336Z"
                    fill="#616161"
                  />
                </svg>
                <svg
                  width="16"
                  height="16"
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
                  {dateFormat(
                    topic?.createdAt?.toString() ?? new Date().toString()
                  )}{' '}
                  {timeFormat(
                    topic?.createdAt?.toString() ?? new Date().toString()
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pb-5">
              <input
                type="checkbox"
                checked={topic.status !== 'open'}
                onChange={() => {}}
                className="h-4 w-4 cursor-pointer"
                disabled
              />
              <span className="text-sm text-[#1E1E1E]">
                Mark 'Topic' as closed
              </span>
            </div>
          </div>
        );
      })}

      {/* Lightbox for photos */}
      {isLightboxOpen && activeTopicImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -right-12 top-0 text-white hover:text-gray-300"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <img
              src={
                activeTopicResolvedUrls?.[activeImageIndex] ??
                activeTopicImages[activeImageIndex]
              }
              alt={`Photo ${activeImageIndex + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {activeTopicImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {activeTopicImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(index);
                    }}
                    className={`h-2 w-2 rounded-full ${
                      index === activeImageIndex ? 'bg-white' : 'bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
