/* eslint-disable @next/next/no-img-element */
'use client';

import { FaFolderMinus, FaMapMarkerAlt } from 'react-icons/fa';
import { useState } from 'react';
import { useProjectCotnext } from '@/app/(main)/(user-panel)/user/projects/context';
import { PROJECTACTIONTYPE } from '@/app/helpers/user/enums';

import { Breadcrumbs, BreadcrumbItem } from '@nextui-org/react';
import { Tabs, Tab } from '@nextui-org/react';

import { TeamsWithRole, UserWithRole } from '@/app/helpers/user/states';
import { FilesSection } from './FilesSection';
// @ts-ignore
import { useSession } from 'next-auth/react';
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
import { useRouter } from 'next/navigation';
import { ChipDropDown } from '../ChipDropDown';
import CustomInfoModal from '../CustomDeleteModel';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useMutation, useQueryClient } from 'react-query';
import {
  deleteProject,
  updateProject,
} from '@/app/(main)/(user-panel)/user/projects/api';
import Loader from '../DottedLoader/loader';

const ProjectDetails = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const deleteMutation = useMutation(deleteProject, {
    onSuccess: () => {
      toggleDeleteModel(!showDelete);
      dispatch({ type: PROJECTACTIONTYPE.SHOWDETAIL });
      queryClient.invalidateQueries('projects');
    },
  });
  const updateProjectMutation = useMutation(updateProject, {
    onSuccess: () => {
      queryClient.invalidateQueries('projects');
      // Update the context state immediately for instant UI update
      if (state.projectDetail) {
        dispatch({
          type: PROJECTACTIONTYPE.UPDATE_DETAIL,
          projectDetail: {
            ...state.projectDetail,
            isOpen: !state.projectDetail.isOpen,
          },
        });
      }
    },
  });
  const [showDelete, toggleDeleteModel] = useState(false);
  const { state, dispatch } = useProjectCotnext();
  // @ts-ignore
  const { data: session } = useSession();

  // Helper functions for role-based permissions
  const currentUserId = session?.user?.user?._id;
  const isGlobalAdmin = (session?.user as any)?.role === 3;

  // Check if current user is Owner in this project
  const isProjectOwner = () => {
    if (!state.projectDetail || !currentUserId) return false;
    // Check if user is the project creator (always an owner)
    if (state.projectDetail.userId?._id === currentUserId) return true;
    // Check if user has Owner role in project members (case-insensitive check)
    const userMember = state.projectDetail.users?.find(
      (u) => String(u.user._id) === String(currentUserId)
    );
    if (userMember) {
      const role = String(userMember.role || '').toLowerCase();
      return role === 'owner';
    }
    return false;
  };

  // Check if user can perform owner actions (Owner OR admin/global admin)
  // Global admin always has access, otherwise only Owners can perform these actions
  const canPerformOwnerActions = () => {
    if (isGlobalAdmin) return true;
    return isProjectOwner();
  };

  return (
    <>
      <div className="mx-auto max-w-[1360px]">
        <div className="h-[calc(var(--app-vh)_-_72px)] flex-grow p-0">
          <section className="py-4">
            <div className="page-heading-edit mb-6 flex flex-col justify-between lg:flex-row lg:items-center">
              <div className="mb-5 text-2xl font-semibold leading-7 text-black lg:mb-0">
                {/* Project Details */}

                {/* breadcrumbs */}
                <Breadcrumbs>
                  <BreadcrumbItem
                    className="flex gap-2"
                    onClick={() => {
                      dispatch({ type: PROJECTACTIONTYPE.SHOWDETAIL });
                    }}
                  >
                    <h1 className="flex items-center gap-4 text-xl font-bold leading-7 text-gray-500">
                      <FaFolderMinus className="h-10 w-10 rounded-lg bg-primary-100/70 p-2 text-primary-500 md:h-11 md:w-11 lg:h-12 lg:w-12" />{' '}
                      Projects
                    </h1>
                  </BreadcrumbItem>
                  <BreadcrumbItem className="font-bold capitalize text-black">
                    <span className="text-xl">
                      {state.projectDetail?.name ?? ''}
                    </span>
                  </BreadcrumbItem>
                </Breadcrumbs>
              </div>

              <div className="team-actice flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  className="flex cursor-pointer gap-2 font-medium text-primary-500"
                  onClick={() => {
                    dispatch({ type: PROJECTACTIONTYPE.SHOWDETAIL });
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
                      return dispatch({
                        type: PROJECTACTIONTYPE.PROJECTDETAIlTAB,
                        projectDetailTab: 'overview',
                      });
                    case 'app':
                      return dispatch({
                        type: PROJECTACTIONTYPE.PROJECTDETAIlTAB,
                        projectDetailTab: 'app',
                      });
                    case 'task':
                      return dispatch({
                        type: PROJECTACTIONTYPE.PROJECTDETAIlTAB,
                        projectDetailTab: 'task',
                      });
                    case 'channel':
                      return dispatch({
                        type: PROJECTACTIONTYPE.PROJECTDETAIlTAB,
                        projectDetailTab: 'channel',
                      });
                    case 'file':
                      return dispatch({
                        type: PROJECTACTIONTYPE.PROJECTDETAIlTAB,
                        projectDetailTab: 'file',
                      });
                    case 'submission':
                      return dispatch({
                        type: PROJECTACTIONTYPE.PROJECTDETAIlTAB,
                        projectDetailTab: 'submission',
                      });
                    case 'member':
                      return dispatch({
                        type: PROJECTACTIONTYPE.PROJECTDETAIlTAB,
                        projectDetailTab: 'member',
                      });
                  }
                }}
              >
                <Tab
                  key="overview"
                  title={
                    <div className="flex items-center space-x-2 px-3 font-bold text-[#616161]">
                      <PanelsTopLeft />
                      <span>Overview</span>
                    </div>
                  }
                />
                <Tab
                  key="submission"
                  title={
                    <div className="flex items-center space-x-2 px-2 font-bold text-[#616161]">
                      <FileCheck />
                      <span>Submissions</span>
                    </div>
                  }
                />
                <Tab
                  key="channel"
                  title={
                    <div className="flex items-center space-x-2 px-2 font-bold text-[#616161]">
                      <MessageSquareDot />
                      <span>Channels</span>
                    </div>
                  }
                />
                <Tab
                  key="file"
                  title={
                    <div className="flex items-center space-x-2 px-2 font-bold text-[#616161]">
                      <FolderOpen />
                      <span>Files</span>
                    </div>
                  }
                />
                <Tab
                  key="task"
                  title={
                    <div className="flex items-center space-x-2 px-2 font-bold text-[#616161]">
                      <CalendarCheck2 />
                      <span>Tasks</span>
                    </div>
                  }
                />
                <Tab
                  key="app"
                  title={
                    <div className="flex items-center space-x-2 px-2 font-bold text-[#616161]">
                      <LayoutGrid />
                      <span>Apps</span>
                    </div>
                  }
                />
                <Tab
                  key="member"
                  title={
                    <div className="flex items-center space-x-2 px-2 font-bold text-[#616161]">
                      <Users />
                      <span>Members</span>
                    </div>
                  }
                />
              </Tabs>
              {/* Only show Open/Close and Edit/Delete controls if user is Owner or Global Admin */}
              {!state.projectDetail?.isGeneral && canPerformOwnerActions() && (
                <div className="flex">
                  <ChipDropDown
                    options={['Open', 'Closed']}
                    selectedValue={`${state.projectDetail?.isOpen ? 'Open' : 'Closed'}`}
                    bgColor={`${state.projectDetail?.isOpen ? 'bg-[#97F1BB]' : 'bg-red-500'}`}
                    onChange={(value) => {
                      // Double-check permission before allowing action
                      if (!canPerformOwnerActions()) {
                        console.warn(
                          'User does not have permission to change project status'
                        );
                        return;
                      }
                      updateProjectMutation.mutate({
                        axiosAuth,
                        id: state.projectDetail?._id!,
                        data: {
                          isOpen: !state.projectDetail?.isOpen,
                        },
                      });
                    }}
                  />
                  <ChipDropDown
                    options={['Edit Details', 'Delete']}
                    selectedValue="Edit Details"
                    bgColor="bg-[#EEEEEE]"
                    onChange={(value) => {
                      // Double-check permission before allowing action
                      if (!canPerformOwnerActions()) {
                        console.warn(
                          'User does not have permission to edit/delete project'
                        );
                        return;
                      }
                      if (value === 'Edit Details') {
                        dispatch({
                          type: PROJECTACTIONTYPE.EDITTOGGLE,
                          currentSection: 'details',
                          editApp: (state.projectDetail?.app ?? []).map((a) => {
                            return a._id;
                          }),
                          // editorganization: (
                          //   state.projectDetail?.organizations ?? []
                          // ).map((o) => {
                          //   return {
                          //     organization: o.organization?._id,
                          //     role: o.role,
                          //   };
                          // }) as OrganizationWithRole[],
                          editteam: [], // Teams removed from project - UI only in AddProjectMembers
                          // edituser: (
                          //   state.projectDetail?.individualUsers ?? []
                          // ).map((u) => {
                          //   return {
                          //     user: u.user?._id,
                          //     role: u.role,
                          //   };
                          // }) as UserWithRole[],
                          color: state.projectDetail?.color,
                          date: new Date(
                            state.projectDetail?.date?.toString() ?? Date.now()
                          ),
                          projectType:
                            state.projectDetail?.projectType ?? 'private',
                          payload: {
                            name: state.projectDetail?.name ?? '',
                            address: state.projectDetail?.address ?? '',
                            description: state.projectDetail?.description ?? '',
                            reference: state.projectDetail?.reference ?? '',
                            customer: {
                              label:
                                state.projectDetail?.customer ??
                                'My Organization',
                              value:
                                state.projectDetail?.customer ??
                                'My Organization',
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
          </section>
        </div>
      </div>
    </>
  );
};

export { ProjectDetails };
