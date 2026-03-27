/* eslint-disable @next/next/no-img-element */
'use client';

import { FaFolderMinus, FaMapMarkerAlt } from 'react-icons/fa';
import { useReducer, useState } from 'react';
import {
  ProjectContext,
  ProjectContextProps,
  projectinitialState,
  projectReducer,
} from '@/app/(main)/(user-panel)/user/projects/context';
import { PROJECTACTIONTYPE } from '@/app/helpers/user/enums';

import { Breadcrumbs, BreadcrumbItem, useDisclosure } from '@nextui-org/react';
import { Tabs, Tab } from '@nextui-org/react';

import { TeamsWithRole, UserWithRole } from '@/app/helpers/user/states';
import {
  CalendarCheck2,
  ChevronLeft,
  FileCheck,
  FolderOpen,
  LayoutGrid,
  MessageSquareDot,
  PanelsTopLeft,
  Users,
} from 'lucide-react';

import useAxiosAuth from '@/hooks/AxiosAuth';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteProject,
  getProjectDetail,
  getUserPermission,
  updateProject,
} from '@/app/(main)/(user-panel)/user/projects/api';
import { ChipDropDown } from '@/components/ChipDropDown';
import CustomInfoModal from '@/components/CustomDeleteModel';
import { AppsTab } from '@/components/ProjectDetails/Apps';
import { ProjectChannelTab } from '@/components/ProjectDetails/Channel';
import { FilesSection } from '@/components/ProjectDetails/FilesSection';
import { MembersTab } from '@/components/ProjectDetails/Members';
import { OverView } from '@/components/ProjectDetails/OverView';
import { SubmissionTab } from '@/components/ProjectDetails/Submission';
import { TasksTab } from '@/components/ProjectDetails/Tasks';
import { useRouter, useSearchParams } from 'next/navigation';
import Loader from '@/components/DottedLoader/loader';
import { useSession } from 'next-auth/react';
import { ProjectModal } from '@/components/ProjectModal';

function Page({ params }: { params: { projectId: string } }) {
  const [state, dispatch] = useReducer(projectReducer, projectinitialState);
  const contextValue: ProjectContextProps = {
    state,
    dispatch,
  };
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<
    'overview' | 'task' | 'app' | 'channel' | 'file' | 'submission' | 'member'
  >('overview');
  const { onOpenChange } = useDisclosure();
  const { projectId } = params;
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const session = useSession();
  const searchParams = useSearchParams();

  // Get adminMode from URL search params
  const adminMode = searchParams?.get('adminMode') === 'true';

  // Check if user is Root User from session (role 3 = Organization Admin)
  const isRootUser = (session.data?.user as any)?.role === 3;

  // Check if user has Admin Mode permission
  const { data: hasProjectManagePermission } = useQuery({
    queryKey: 'userPermission',
    queryFn: () => getUserPermission(axiosAuth),
    refetchOnWindowFocus: false,
  });

  // User can use Admin Mode if Root User or team has permission
  const canUseAdminMode =
    isRootUser || hasProjectManagePermission?.projects || false;

  const { data, isLoading } = useQuery({
    queryKey: [`projectDetail${projectId}`, projectId, adminMode],
    queryFn: () =>
      getProjectDetail({ axiosAuth, projectId: projectId!, adminMode }),
  });
  const deleteMutation = useMutation(deleteProject, {
    onSuccess: () => {
      queryClient.invalidateQueries('projects');
      toggleDeleteModel(!showDelete);
      router.back();
    },
  });
  const updateProjectMutation = useMutation(updateProject, {
    onSuccess: () => {
      // Update the query cache immediately for instant UI update
      queryClient.setQueryData(
        [`projectDetail${projectId}`, projectId],
        (oldData: any) => {
          if (oldData) {
            return {
              ...oldData,
              isOpen: !oldData.isOpen,
            };
          }
          return oldData;
        }
      );
      queryClient.invalidateQueries('projects');
      queryClient.invalidateQueries('assitant');
      queryClient.invalidateQueries([`projectDetail${projectId}`, projectId]);
    },
  });
  const [showDelete, toggleDeleteModel] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-[calc(var(--app-vh)_-_72px)] items-center justify-center">
        <Loader />
      </div>
    );
  }
  // Visibility guard: Step-by-step access control
  // Step 1: User must be logged in (required for all projects)
  const isLoggedIn = !!session.data;
  if (!isLoggedIn) {
    return (
      <div className="flex h-[calc(var(--app-vh)_-_72px)] items-center justify-center">
        <div className="rounded-md border border-gray-300 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-[#1E1E1E]">
            You must be logged in to view this Project
          </h2>
          <button
            className="mt-4 rounded-md bg-primary-500 px-4 py-2 text-white"
            onClick={() => router.back()}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Get user and project information
  const currentUserId = session.data?.user?.user?._id ?? '';
  const viewerOrgId = session.data?.user?.user?.organization?._id ?? '';
  const isGeneral = !!data?.isGeneral;
  const isPublic = data?.projectType === 'public';
  const isMember = (data?.users ?? []).some(
    (u) => u.user?._id === currentUserId
  );

  const creatorOrgId = data?.userId?.organization?._id ?? null;

  // Step 3: Check access based on project type and Admin Mode
  let canView = false;

  // If user has Admin Mode permission AND Admin Mode is ON, allow viewing any project
  if (canUseAdminMode && adminMode) {
    canView = true;
  } else {
    // Otherwise, check normal access rules
    if (isGeneral || isPublic) {
      // General/Public projects: User must be a member OR in same organization as creator
      const inSameOrganizationAsCreator =
        !!viewerOrgId && !!creatorOrgId && viewerOrgId === creatorOrgId;

      canView = isMember || inSameOrganizationAsCreator;
    } else {
      // Other projects: User must be a member of the project
      canView = isMember;
    }
  }

  if (!canView) {
    return (
      <div className="flex h-[calc(var(--app-vh)_-_144px)] max-w-[1360px] items-center justify-center">
        <div className="rounded-md border border-gray-300 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-[#1E1E1E]">
            You do not have permission to view this Project
          </h2>
          <p className="mt-2 text-sm text-[#616161]">
            Ask a project admin to add you as a member.
          </p>
          <button
            className="mt-4 rounded-md bg-primary-500 px-4 py-2 text-white"
            onClick={() => router.back()}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  // Open/Close + Edit/Delete chips: never for General; otherwise show only if
  // user has global project permission (priority) OR is project owner (member with Owner role).
  // Contributors (member, not owner) must not see this section.
  const hasGlobalProjectPermission =
    isRootUser || !!hasProjectManagePermission?.projects;
  const isProjectOwner = (() => {
    if (!data || !currentUserId) return false;
    if (data.userId?._id === currentUserId) return true;
    const userMember = (data.users ?? []).find(
      (u) => String(u.user?._id) === String(currentUserId)
    );
    if (!userMember) return false;
    return String(userMember.role ?? '').toLowerCase() === 'owner';
  })();
  const showOpenCloseEditDeleteChips =
    !isGeneral && (hasGlobalProjectPermission || isProjectOwner);

  return (
    <ProjectContext.Provider value={contextValue}>
      <div className="mx-auto min-h-0 w-full max-w-[1360px] px-2">
        <div className="h-[calc(var(--app-vh)_-_144px)] flex-grow p-0">
          <section className="w-full py-4">
            <div className="page-heading-edit sticky top-0 z-10 mb-6 flex flex-col justify-between lg:flex-row lg:items-center">
              <div className="mb-5 text-2xl font-semibold leading-7 text-black lg:mb-0">
                {/* Project Details */}

                {/* breadcrumbs */}
                <Breadcrumbs>
                  <BreadcrumbItem
                    className="flex gap-2"
                    onClick={() => {
                      router.push('/user/projects');
                    }}
                  >
                    <h1 className="flex items-center gap-4 text-xl font-bold leading-7 text-gray-500">
                      <FaFolderMinus className="h-10 w-10 rounded-lg bg-primary-100/70 p-2 text-primary-500 md:h-11 md:w-11 lg:h-12 lg:w-12" />
                      <span className="text-lg font-semibold text-[#616161]">
                        Projects
                      </span>
                    </h1>
                  </BreadcrumbItem>
                  <BreadcrumbItem className="capitalize">
                    <span className="text-lg font-semibold text-[#1E1E1E]">
                      {data?.name ?? ''}
                    </span>
                  </BreadcrumbItem>
                </Breadcrumbs>
              </div>

              <div className="team-actice flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  className="flex cursor-pointer gap-2 font-medium text-primary-500"
                  onClick={() => {
                    router.push('/user/projects');
                  }}
                >
                  <ChevronLeft /> <span>Go back</span>
                </button>
              </div>
            </div>

            {/* tabs */}
            <div className="shadow-m relative my-4 flex w-full items-center justify-between gap-5 overflow-x-auto rounded-sm">
              <Tabs
                aria-label="Options"
                color="primary"
                variant="underlined"
                classNames={{
                  tabList:
                    'flex gap-5 w-full relative  justify-between xl:justify-start overflow-x-auto rounded-none p-0 border-b  ',
                  cursor: 'w-full  bg-[#0063F7] ',
                  tab: 'max-w-fit px-0 h-12 ',
                  tabContent: 'group-data-[selected=true]:text-[#0063F7]',
                }}
                onSelectionChange={(e) => {
                  switch (e) {
                    case 'overview':
                      return setSelectedTab('overview');
                    case 'app':
                      return setSelectedTab('app');
                    case 'task':
                      return setSelectedTab('task');
                    case 'channel':
                      return setSelectedTab('channel');
                    case 'file':
                      return setSelectedTab('file');
                    case 'submission':
                      return setSelectedTab('submission');
                    case 'member':
                      return setSelectedTab('member');
                    default:
                      return setSelectedTab('overview');
                  }
                }}
              >
                <Tab
                  key="overview"
                  title={
                    <div className="flex items-center space-x-2 px-3 font-bold text-[#616161]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 19C2.45 19 1.97933 18.8043 1.588 18.413C1.19667 18.0217 1.00067 17.5507 1 17V7C1 6.45 1.196 5.97934 1.588 5.588C1.98 5.19667 2.45067 5.00067 3 5H13C13.55 5 14.021 5.196 14.413 5.588C14.805 5.98 15.0007 6.45067 15 7V17C15 17.55 14.8043 18.021 14.413 18.413C14.0217 18.805 13.5507 19.0007 13 19H3ZM3 17H13V7H3V17ZM18 19C17.7167 19 17.4793 18.904 17.288 18.712C17.0967 18.52 17.0007 18.2827 17 18V6C17 5.71667 17.096 5.47934 17.288 5.288C17.48 5.09667 17.7173 5.00067 18 5C18.2827 4.99934 18.5203 5.09534 18.713 5.288C18.9057 5.48067 19.0013 5.718 19 6V18C19 18.2833 18.904 18.521 18.712 18.713C18.52 18.905 18.2827 19.0007 18 19ZM22 19C21.7167 19 21.4793 18.904 21.288 18.712C21.0967 18.52 21.0007 18.2827 21 18V6C21 5.71667 21.096 5.47934 21.288 5.288C21.48 5.09667 21.7173 5.00067 22 5C22.2827 4.99934 22.5203 5.09534 22.713 5.288C22.9057 5.48067 23.0013 5.718 23 6V18C23 18.2833 22.904 18.521 22.712 18.713C22.52 18.905 22.2827 19.0007 22 19Z"
                          fill="#616161"
                        />
                      </svg>

                      <span>Overview</span>
                    </div>
                  }
                />
                <Tab
                  key="submission"
                  title={
                    <div className="flex items-center space-x-2 px-2 font-bold text-[#616161]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <mask
                          id="mask0_3405_34848"
                          // style="mask-type:alpha"
                          maskUnits="userSpaceOnUse"
                          x="0"
                          y="0"
                          width="24"
                          height="24"
                        >
                          <rect width="24" height="24" fill="#D9D9D9" />
                        </mask>
                        <g mask="url(#mask0_3405_34848)">
                          <path
                            d="M10.925 15.125L9.525 13.725C9.425 13.625 9.31667 13.55 9.2 13.5C9.08333 13.45 8.9625 13.425 8.8375 13.425C8.7125 13.425 8.5875 13.45 8.4625 13.5C8.3375 13.55 8.225 13.625 8.125 13.725C7.925 13.925 7.825 14.1625 7.825 14.4375C7.825 14.7125 7.925 14.95 8.125 15.15L10.25 17.3C10.35 17.4 10.4583 17.4708 10.575 17.5125C10.6917 17.5542 10.8167 17.575 10.95 17.575C11.0833 17.575 11.2083 17.5542 11.325 17.5125C11.4417 17.4708 11.55 17.4 11.65 17.3L15.875 13.075C16.075 12.875 16.175 12.6333 16.175 12.35C16.175 12.0667 16.075 11.825 15.875 11.625C15.675 11.425 15.4333 11.325 15.15 11.325C14.8667 11.325 14.625 11.425 14.425 11.625L10.925 15.125ZM6 22C5.45 22 4.97917 21.8042 4.5875 21.4125C4.19583 21.0208 4 20.55 4 20V4C4 3.45 4.19583 2.97917 4.5875 2.5875C4.97917 2.19583 5.45 2 6 2H13.175C13.4417 2 13.6958 2.05 13.9375 2.15C14.1792 2.25 14.3917 2.39167 14.575 2.575L19.425 7.425C19.6083 7.60833 19.75 7.82083 19.85 8.0625C19.95 8.30417 20 8.55833 20 8.825V20C20 20.55 19.8042 21.0208 19.4125 21.4125C19.0208 21.8042 18.55 22 18 22H6ZM13 8V4H6V20H18V9H14C13.7167 9 13.4792 8.90417 13.2875 8.7125C13.0958 8.52083 13 8.28333 13 8Z"
                            fill="#616161"
                          />
                        </g>
                      </svg>

                      <span>Submissions</span>
                    </div>
                  }
                />
                <Tab
                  key="channel"
                  title={
                    <div className="flex items-center space-x-2 px-2 font-bold text-[#616161]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <mask
                          id="mask0_3405_34856"
                          // style="mask-type:alpha"
                          maskUnits="userSpaceOnUse"
                          x="0"
                          y="0"
                          width="24"
                          height="24"
                        >
                          <rect width="24" height="24" fill="#D9D9D9" />
                        </mask>
                        <g mask="url(#mask0_3405_34856)">
                          <path
                            d="M7 14H13C13.2833 14 13.5208 13.9042 13.7125 13.7125C13.9042 13.5208 14 13.2833 14 13C14 12.7167 13.9042 12.4792 13.7125 12.2875C13.5208 12.0958 13.2833 12 13 12H7C6.71667 12 6.47917 12.0958 6.2875 12.2875C6.09583 12.4792 6 12.7167 6 13C6 13.2833 6.09583 13.5208 6.2875 13.7125C6.47917 13.9042 6.71667 14 7 14ZM7 11H17C17.2833 11 17.5208 10.9042 17.7125 10.7125C17.9042 10.5208 18 10.2833 18 10C18 9.71667 17.9042 9.47917 17.7125 9.2875C17.5208 9.09583 17.2833 9 17 9H7C6.71667 9 6.47917 9.09583 6.2875 9.2875C6.09583 9.47917 6 9.71667 6 10C6 10.2833 6.09583 10.5208 6.2875 10.7125C6.47917 10.9042 6.71667 11 7 11ZM7 8H15C15.2833 8 15.5208 7.90417 15.7125 7.7125C15.9042 7.52083 16 7.28333 16 7C16 6.71667 15.9042 6.47917 15.7125 6.2875C15.5208 6.09583 15.2833 6 15 6H7C6.71667 6 6.47917 6.09583 6.2875 6.2875C6.09583 6.47917 6 6.71667 6 7C6 7.28333 6.09583 7.52083 6.2875 7.7125C6.47917 7.90417 6.71667 8 7 8ZM6 18L3.7 20.3C3.38333 20.6167 3.02083 20.6875 2.6125 20.5125C2.20417 20.3375 2 20.025 2 19.575V4C2 3.45 2.19583 2.97917 2.5875 2.5875C2.97917 2.19583 3.45 2 4 2H13C13.2833 2 13.5208 2.09583 13.7125 2.2875C13.9042 2.47917 14 2.71667 14 3C14 3.28333 13.9042 3.52083 13.7125 3.7125C13.5208 3.90417 13.2833 4 13 4H4V17.125L5.15 16H20V9C20 8.71667 20.0958 8.47917 20.2875 8.2875C20.4792 8.09583 20.7167 8 21 8C21.2833 8 21.5208 8.09583 21.7125 8.2875C21.9042 8.47917 22 8.71667 22 9V16C22 16.55 21.8042 17.0208 21.4125 17.4125C21.0208 17.8042 20.55 18 20 18H6ZM19 6C18.1667 6 17.4583 5.70833 16.875 5.125C16.2917 4.54167 16 3.83333 16 3C16 2.16667 16.2917 1.45833 16.875 0.875C17.4583 0.291667 18.1667 0 19 0C19.8333 0 20.5417 0.291667 21.125 0.875C21.7083 1.45833 22 2.16667 22 3C22 3.83333 21.7083 4.54167 21.125 5.125C20.5417 5.70833 19.8333 6 19 6Z"
                            fill="#616161"
                          />
                        </g>
                      </svg>

                      <span>Channels</span>
                    </div>
                  }
                />
                <Tab
                  key="file"
                  title={
                    <div className="flex items-center space-x-2 px-2 font-bold text-[#616161]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <mask
                          id="mask0_3405_34864"
                          // style="mask-type:alpha"
                          maskUnits="userSpaceOnUse"
                          x="0"
                          y="0"
                          width="24"
                          height="24"
                        >
                          <rect width="24" height="24" fill="#D9D9D9" />
                        </mask>
                        <g mask="url(#mask0_3405_34864)">
                          <path
                            d="M4 20C3.45 20 2.97917 19.8042 2.5875 19.4125C2.19583 19.0208 2 18.55 2 18V6C2 5.45 2.19583 4.97917 2.5875 4.5875C2.97917 4.19583 3.45 4 4 4H9.175C9.44167 4 9.69583 4.05 9.9375 4.15C10.1792 4.25 10.3917 4.39167 10.575 4.575L12 6H21C21.2833 6 21.5208 6.09583 21.7125 6.2875C21.9042 6.47917 22 6.71667 22 7C22 7.28333 21.9042 7.52083 21.7125 7.7125C21.5208 7.90417 21.2833 8 21 8H11.175L9.175 6H4V18L5.975 11.425C6.10833 10.9917 6.35417 10.6458 6.7125 10.3875C7.07083 10.1292 7.46667 10 7.9 10H20.8C21.4833 10 22.0208 10.2708 22.4125 10.8125C22.8042 11.3542 22.9083 11.9417 22.725 12.575L20.925 18.575C20.7917 19.0083 20.5458 19.3542 20.1875 19.6125C19.8292 19.8708 19.4333 20 19 20H4ZM6.1 18H19L20.8 12H7.9L6.1 18Z"
                            fill="#616161"
                          />
                        </g>
                      </svg>

                      <span>Files</span>
                    </div>
                  }
                />
                <Tab
                  key="task"
                  title={
                    <div className="flex items-center space-x-2 px-2 font-bold text-[#616161]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <mask
                          id="mask0_3405_34872"
                          // style="mask-type:alpha"
                          maskUnits="userSpaceOnUse"
                          x="0"
                          y="0"
                          width="24"
                          height="24"
                        >
                          <rect width="24" height="24" fill="#D9D9D9" />
                        </mask>
                        <g mask="url(#mask0_3405_34872)">
                          <path
                            d="M5 8H19V6H5V8ZM5 22C4.45 22 3.97917 21.8042 3.5875 21.4125C3.19583 21.0208 3 20.55 3 20V6C3 5.45 3.19583 4.97917 3.5875 4.5875C3.97917 4.19583 4.45 4 5 4H6V3C6 2.71667 6.09583 2.47917 6.2875 2.2875C6.47917 2.09583 6.71667 2 7 2C7.28333 2 7.52083 2.09583 7.7125 2.2875C7.90417 2.47917 8 2.71667 8 3V4H16V3C16 2.71667 16.0958 2.47917 16.2875 2.2875C16.4792 2.09583 16.7167 2 17 2C17.2833 2 17.5208 2.09583 17.7125 2.2875C17.9042 2.47917 18 2.71667 18 3V4H19C19.55 4 20.0208 4.19583 20.4125 4.5875C20.8042 4.97917 21 5.45 21 6V10.675C21 10.9583 20.9042 11.1958 20.7125 11.3875C20.5208 11.5792 20.2833 11.675 20 11.675C19.7167 11.675 19.4792 11.5792 19.2875 11.3875C19.0958 11.1958 19 10.9583 19 10.675V10H5V20H10.8C11.0833 20 11.3208 20.0958 11.5125 20.2875C11.7042 20.4792 11.8 20.7167 11.8 21C11.8 21.2833 11.7042 21.5208 11.5125 21.7125C11.3208 21.9042 11.0833 22 10.8 22H5ZM18 23C16.6167 23 15.4375 22.5125 14.4625 21.5375C13.4875 20.5625 13 19.3833 13 18C13 16.6167 13.4875 15.4375 14.4625 14.4625C15.4375 13.4875 16.6167 13 18 13C19.3833 13 20.5625 13.4875 21.5375 14.4625C22.5125 15.4375 23 16.6167 23 18C23 19.3833 22.5125 20.5625 21.5375 21.5375C20.5625 22.5125 19.3833 23 18 23ZM18.5 17.8V15.5C18.5 15.3667 18.45 15.25 18.35 15.15C18.25 15.05 18.1333 15 18 15C17.8667 15 17.75 15.05 17.65 15.15C17.55 15.25 17.5 15.3667 17.5 15.5V17.775C17.5 17.9083 17.525 18.0375 17.575 18.1625C17.625 18.2875 17.7 18.4 17.8 18.5L19.325 20.025C19.425 20.125 19.5417 20.175 19.675 20.175C19.8083 20.175 19.925 20.125 20.025 20.025C20.125 19.925 20.175 19.8083 20.175 19.675C20.175 19.5417 20.125 19.425 20.025 19.325L18.5 17.8Z"
                            fill="#616161"
                          />
                        </g>
                      </svg>

                      <span>Tasks</span>
                    </div>
                  }
                />
                <Tab
                  key="app"
                  title={
                    <div className="flex items-center space-x-2 px-2 font-bold text-[#616161]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.75 2.5C7.30812 2.5 7.86077 2.60993 8.37641 2.82351C8.89204 3.03709 9.36056 3.35015 9.75521 3.7448C10.1499 4.13945 10.4629 4.60796 10.6765 5.1236C10.8901 5.63923 11 6.19188 11 6.75V11H6.75C5.62283 11 4.54183 10.5522 3.7448 9.7552C2.94777 8.95817 2.5 7.87717 2.5 6.75C2.5 5.62283 2.94777 4.54183 3.7448 3.7448C4.54183 2.94777 5.62283 2.5 6.75 2.5ZM9 9V6.75C9 6.30499 8.86804 5.86998 8.62081 5.49997C8.37358 5.12996 8.02217 4.84157 7.61104 4.67127C7.19991 4.50097 6.74751 4.45642 6.31105 4.54323C5.87459 4.63005 5.47368 4.84434 5.15901 5.15901C4.84434 5.47368 4.63005 5.87459 4.54323 6.31105C4.45642 6.7475 4.50098 7.1999 4.67127 7.61104C4.84157 8.02217 5.12996 8.37357 5.49997 8.62081C5.86998 8.86804 6.30499 9 6.75 9H9ZM6.75 13H11V17.25C11 18.0906 10.7507 18.9123 10.2837 19.6112C9.81675 20.3101 9.15299 20.8548 8.37641 21.1765C7.59982 21.4982 6.74529 21.5823 5.92087 21.4183C5.09645 21.2543 4.33917 20.8496 3.7448 20.2552C3.15042 19.6608 2.74565 18.9036 2.58166 18.0791C2.41768 17.2547 2.50184 16.4002 2.82351 15.6236C3.14519 14.847 3.68992 14.1833 4.38883 13.7163C5.08774 13.2493 5.90943 13 6.75 13ZM6.75 15C6.30499 15 5.86998 15.132 5.49997 15.3792C5.12996 15.6264 4.84157 15.9778 4.67127 16.389C4.50098 16.8001 4.45642 17.2525 4.54323 17.689C4.63005 18.1254 4.84434 18.5263 5.15901 18.841C5.47368 19.1557 5.87459 19.3699 6.31105 19.4568C6.74751 19.5436 7.19991 19.499 7.61104 19.3287C8.02217 19.1584 8.37358 18.87 8.62081 18.5C8.86804 18.13 9 17.695 9 17.25V15H6.75ZM17.25 2.5C18.3772 2.5 19.4582 2.94777 20.2552 3.7448C21.0522 4.54183 21.5 5.62283 21.5 6.75C21.5 7.87717 21.0522 8.95817 20.2552 9.7552C19.4582 10.5522 18.3772 11 17.25 11H13V6.75C13 5.62283 13.4478 4.54183 14.2448 3.7448C15.0418 2.94777 16.1228 2.5 17.25 2.5ZM17.25 9C17.695 9 18.13 8.86804 18.5 8.62081C18.87 8.37357 19.1584 8.02217 19.3287 7.61104C19.499 7.1999 19.5436 6.7475 19.4568 6.31105C19.37 5.87459 19.1557 5.47368 18.841 5.15901C18.5263 4.84434 18.1254 4.63005 17.689 4.54323C17.2525 4.45642 16.8001 4.50097 16.389 4.67127C15.9778 4.84157 15.6264 5.12996 15.3792 5.49997C15.132 5.86998 15 6.30499 15 6.75V9H17.25ZM13 13H17.25C18.0906 13 18.9123 13.2493 19.6112 13.7163C20.3101 14.1833 20.8548 14.847 21.1765 15.6236C21.4982 16.4002 21.5823 17.2547 21.4183 18.0791C21.2544 18.9036 20.8496 19.6608 20.2552 20.2552C19.6608 20.8496 18.9036 21.2543 18.0791 21.4183C17.2547 21.5823 16.4002 21.4982 15.6236 21.1765C14.847 20.8548 14.1833 20.3101 13.7163 19.6112C13.2493 18.9123 13 18.0906 13 17.25V13ZM15 15V17.25C15 17.695 15.132 18.13 15.3792 18.5C15.6264 18.87 15.9778 19.1584 16.389 19.3287C16.8001 19.499 17.2525 19.5436 17.689 19.4568C18.1254 19.3699 18.5263 19.1557 18.841 18.841C19.1557 18.5263 19.37 18.1254 19.4568 17.689C19.5436 17.2525 19.499 16.8001 19.3287 16.389C19.1584 15.9778 18.87 15.6264 18.5 15.3792C18.13 15.132 17.695 15 17.25 15H15Z"
                          fill="#616161"
                        />
                      </svg>

                      <span>Apps</span>
                    </div>
                  }
                />
                {!data?.isGeneral && (
                  <Tab
                    key="member"
                    title={
                      <div className="flex items-center space-x-2 px-2 font-bold text-[#616161]">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask
                            id="mask0_3420_66055"
                            // style="mask-type:alpha"
                            maskUnits="userSpaceOnUse"
                            x="0"
                            y="0"
                            width="24"
                            height="24"
                          >
                            <rect width="24" height="24" fill="#D9D9D9" />
                          </mask>
                          <g mask="url(#mask0_3420_66055)">
                            <path
                              d="M1 18C0.716667 18 0.479167 17.9042 0.2875 17.7125C0.0958333 17.5208 0 17.2833 0 17V16.425C0 15.7083 0.366667 15.125 1.1 14.675C1.83333 14.225 2.8 14 4 14C4.21667 14 4.425 14.0042 4.625 14.0125C4.825 14.0208 5.01667 14.0417 5.2 14.075C4.96667 14.425 4.79167 14.7917 4.675 15.175C4.55833 15.5583 4.5 15.9583 4.5 16.375V18H1ZM7 18C6.71667 18 6.47917 17.9042 6.2875 17.7125C6.09583 17.5208 6 17.2833 6 17V16.375C6 15.8417 6.14583 15.3542 6.4375 14.9125C6.72917 14.4708 7.14167 14.0833 7.675 13.75C8.20833 13.4167 8.84583 13.1667 9.5875 13C10.3292 12.8333 11.1333 12.75 12 12.75C12.8833 12.75 13.6958 12.8333 14.4375 13C15.1792 13.1667 15.8167 13.4167 16.35 13.75C16.8833 14.0833 17.2917 14.4708 17.575 14.9125C17.8583 15.3542 18 15.8417 18 16.375V17C18 17.2833 17.9042 17.5208 17.7125 17.7125C17.5208 17.9042 17.2833 18 17 18H7ZM19.5 18V16.375C19.5 15.9417 19.4458 15.5333 19.3375 15.15C19.2292 14.7667 19.0667 14.4083 18.85 14.075C19.0333 14.0417 19.2208 14.0208 19.4125 14.0125C19.6042 14.0042 19.8 14 20 14C21.2 14 22.1667 14.2208 22.9 14.6625C23.6333 15.1042 24 15.6917 24 16.425V17C24 17.2833 23.9042 17.5208 23.7125 17.7125C23.5208 17.9042 23.2833 18 23 18H19.5ZM8.125 16H15.9C15.7333 15.6667 15.2708 15.375 14.5125 15.125C13.7542 14.875 12.9167 14.75 12 14.75C11.0833 14.75 10.2458 14.875 9.4875 15.125C8.72917 15.375 8.275 15.6667 8.125 16ZM4 13C3.45 13 2.97917 12.8042 2.5875 12.4125C2.19583 12.0208 2 11.55 2 11C2 10.4333 2.19583 9.95833 2.5875 9.575C2.97917 9.19167 3.45 9 4 9C4.56667 9 5.04167 9.19167 5.425 9.575C5.80833 9.95833 6 10.4333 6 11C6 11.55 5.80833 12.0208 5.425 12.4125C5.04167 12.8042 4.56667 13 4 13ZM20 13C19.45 13 18.9792 12.8042 18.5875 12.4125C18.1958 12.0208 18 11.55 18 11C18 10.4333 18.1958 9.95833 18.5875 9.575C18.9792 9.19167 19.45 9 20 9C20.5667 9 21.0417 9.19167 21.425 9.575C21.8083 9.95833 22 10.4333 22 11C22 11.55 21.8083 12.0208 21.425 12.4125C21.0417 12.8042 20.5667 13 20 13ZM12 12C11.1667 12 10.4583 11.7083 9.875 11.125C9.29167 10.5417 9 9.83333 9 9C9 8.15 9.29167 7.4375 9.875 6.8625C10.4583 6.2875 11.1667 6 12 6C12.85 6 13.5625 6.2875 14.1375 6.8625C14.7125 7.4375 15 8.15 15 9C15 9.83333 14.7125 10.5417 14.1375 11.125C13.5625 11.7083 12.85 12 12 12ZM12 10C12.2833 10 12.5208 9.90417 12.7125 9.7125C12.9042 9.52083 13 9.28333 13 9C13 8.71667 12.9042 8.47917 12.7125 8.2875C12.5208 8.09583 12.2833 8 12 8C11.7167 8 11.4792 8.09583 11.2875 8.2875C11.0958 8.47917 11 8.71667 11 9C11 9.28333 11.0958 9.52083 11.2875 9.7125C11.4792 9.90417 11.7167 10 12 10Z"
                              fill="#616161"
                            />
                          </g>
                        </svg>

                        <span>Members</span>
                      </div>
                    }
                  />
                )}
              </Tabs>
              {showOpenCloseEditDeleteChips && (
                <div className="flex">
                  <ChipDropDown
                    options={['Open', 'Closed']}
                    selectedValue={`${data?.isOpen ? 'Open' : 'Closed'}`}
                    bgColor={`${data?.isOpen ? 'bg-[#97F1BB]' : 'bg-red-500'}`}
                    onChange={(value) => {
                      updateProjectMutation.mutate({
                        axiosAuth,
                        id: projectId!,
                        data: {
                          isOpen: !data?.isOpen,
                        },
                      });
                    }}
                  />
                  <ChipDropDown
                    options={['Edit Details', 'Delete']}
                    selectedValue="Edit Details"
                    bgColor="bg-[#EEEEEE]"
                    onChange={(value) => {
                      if (value === 'Edit Details') {
                        dispatch({
                          type: PROJECTACTIONTYPE.EDITTOGGLE,
                          currentSection: 'details',
                          editApp: (data?.app ?? []).map((a) => {
                            return a._id;
                          }),
                          editteam: [], // Teams removed from project - UI only in AddProjectMembers
                          edituser: (data?.users ?? []).map((u) => {
                            return {
                              user: u.user?._id,
                              role: u.role,
                            };
                          }) as UserWithRole[],
                          color: data?.color,
                          date: new Date(data?.date?.toString() ?? Date.now()),
                          projectType: data?.projectType ?? 'private',
                          payload: {
                            name: data?.name ?? '',
                            address: data?.address ?? '',
                            description: data?.description ?? '',
                            reference: data?.reference ?? '',
                            customer: {
                              label: data?.customer ?? 'My Organization',
                              value: data?.customer ?? 'My Organization',
                            },
                          },
                        });
                      }
                      if (value == 'Delete') {
                        toggleDeleteModel(!showDelete);
                      }
                    }}
                  />
                </div>
              )}
            </div>
            {/* /////////////////////body//////////////////////////////// */}
            {selectedTab === 'overview' && <OverView projectDetail={data} />}
            {selectedTab === 'task' && (
              <TasksTab overview={false} projectDetail={data} />
            )}
            {selectedTab === 'app' && <AppsTab projectDetail={data} />}
            {selectedTab === 'member' && <MembersTab projectDetail={data} />}
            {selectedTab === 'submission' && (
              <SubmissionTab projectDetail={data} />
            )}
            {selectedTab === 'file' && <FilesSection projectDetail={data} />}
            {selectedTab === 'channel' && (
              <ProjectChannelTab projectDetail={data} />
            )}
          </section>
        </div>
      </div>
      {showDelete && (
        <CustomInfoModal
          title={'Delete Project'}
          handleClose={() => {
            toggleDeleteModel(!showDelete);
          }}
          onDeleteButton={() => {
            deleteMutation.mutate({
              axiosAuth,
              id: projectId!,
            });
          }}
          doneValue={deleteMutation.isLoading ? <Loader /> : 'Delete'}
          subtitle={
            'Are you sure you want to delete this project. This action cannot be undone.'
          }
        />
      )}
      {state.showProjectModal && <ProjectModal project={data} />}
    </ProjectContext.Provider>
  );
}

export default Page;
