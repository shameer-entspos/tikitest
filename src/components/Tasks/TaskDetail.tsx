'use client';

import 'react-datepicker/dist/react-datepicker.css';
import { useTaskCotnext } from '@/app/(main)/(user-panel)/user/tasks/context';
import { TASKTYPE } from '@/app/helpers/user/enums';

import { Calendar, Clock } from 'lucide-react';
import { formatDateTime } from '@/utils';
import UserCard from '../UserCard';
import { getAppLogo, handleAppClick } from '../popupModal/appListinApp';
import { useMutation, useQueryClient } from 'react-query';
import { updateAppRecentStatus } from '@/app/(main)/(user-panel)/user/apps/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { dateFormat } from '@/app/helpers/dateFormat';
import { CustomHoverPorjectShow } from '../Custom_Project_Hover_Component';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  hasCurrentUserSubmitted,
  markAsCompleteManyTask,
} from '@/app/(main)/(user-panel)/user/tasks/api';
import CustomModal from '../Custom_Modal';

const TaskDetail = ({ adminMode = false }: { adminMode?: boolean }) => {
  const { state, dispatch } = useTaskCotnext();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const updateMutaion = useMutation(updateAppRecentStatus);
  const { data: session } = useSession();
  const currentUserId = session?.user?.user?._id;
  const currentUserAlreadySubmitted = hasCurrentUserSubmitted(
    state.taskModel,
    currentUserId
  );

  // Determine button visibility based on current tab
  const isFromCompletedTab = state.currentTab === 'submission';
  // From overdue/upcoming: show Mark Complete only if current user has NOT submitted yet (can't submit again)
  const showCloseButton = isFromCompletedTab;
  const showMarkCompleteButton =
    !isFromCompletedTab && !currentUserAlreadySubmitted;

  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const markAsCompleteMutation = useMutation(markAsCompleteManyTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
      queryClient.invalidateQueries('recentTaskList');
      dispatch({
        type: TASKTYPE.SHOWTASKMODAL,
      });
    },
  });

  const handleClose = () => {
    dispatch({
      type: TASKTYPE.SHOWTASKMODAL,
    });
  };

  const handleMarkComplete = () => {
    if (state.taskModel?._id) {
      markAsCompleteMutation.mutate({
        axiosAuth,
        body: { ids: [state.taskModel._id] },
        adminMode,
      });
    }
  };

  const headerContent = (
    <>
      <img src="/svg/task/logo-bg-circle.svg" alt="task logo" />
      <div>
        <h2 className="text-base font-semibold leading-7 text-[#1E1E1E] md:text-xl">
          View Task
        </h2>
        <span className="font-normal text-[#616161] sm:text-sm">
          View and start task details below
        </span>
      </div>
    </>
  );

  const bodyContent = (
    <div className="flex flex-col gap-6">
      <section className="space-y-1">
        <p className="text-sm font-medium text-[#616161]">
          Linked App
        </p>
        {state.taskModel?.app ? (
          <div
            className="flex w-fit cursor-pointer items-center gap-3 rounded-lg bg-white px-3 py-2 shadow-primary-shadow shadow-primary-400"
            onClick={() =>
              handleAppClick(state.taskModel?.app!, axiosAuth, updateMutaion)
            }
          >
            <img
              src={getAppLogo({
                logoType: state.taskModel?.app?.type ?? '',
              })}
              alt="app"
              className="h-12"
            />
            <span>{state.taskModel?.app.name}</span>
          </div>
        ) : (
          <p className="font-Open-Sans text-sm font-normal text-[#616161]">
            None
          </p>
        )}
      </section>

      <section className="space-y-1">
        <p className="text-sm font-medium text-[#616161]">
          Customer
        </p>
        <div className="flex items-center gap-2 font-Open-Sans text-sm font-normal capitalize text-[#616161]">
          <img src="/user.svg" alt="user" />
          <span>{state.taskModel?.customer ?? ''}</span>
        </div>
      </section>

      <section className="space-y-1">
        <p className="text-sm font-medium text-[#616161]">
          Assigned Project
        </p>
        <CustomHoverPorjectShow
          projects={state.taskModel?.projects ?? []}
          index={hoveredProject}
          setHoveredProject={setHoveredProject}
        />
      </section>

      <section className="space-y-1">
        <p className="text-sm font-medium text-[#616161]">
          Task Name
        </p>
        <p className="font-Open-Sans text-base font-semibold text-[#1E1E1E]">
          {state.taskModel?.name
            ?.split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}
        </p>
      </section>

      <section className="space-y-1">
        <p className="text-sm font-medium text-[#616161]">
          Description
        </p>
        <p className="line-clamp-4 font-Open-Sans text-sm font-normal text-[#616161]">
          {state.taskModel?.description}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[#616161]">
            Due Date
          </p>
          <p className="font-Open-Sans text-sm font-normal text-[#616161]">
            {dateFormat(state.taskModel?.dueDate ?? '')}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-[#616161]">
            Task Sharing
          </p>
          <p className="font-Open-Sans text-sm font-normal capitalize text-[#616161]">
            {state.taskModel?.shareAs ?? '—'}
          </p>
        </div>
      </section>

      <section className="space-y-2 border-t border-gray-200 pt-4">
        <p className="text-sm font-medium text-[#616161]">
          Created By
        </p>
        <UserCard submittedBy={state.taskModel?.userId} index={0} />
      </section>

      <section className="flex flex-wrap gap-3 border-t border-gray-200 pt-4">
        <div className="flex items-center gap-1.5 text-sm font-normal text-[#616161]">
          <Calendar className="h-5 w-5 shrink-0" />
          <span>
            {formatDateTime(state.taskModel?.createdAt ?? '')?.date || 'N/A'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-normal text-[#616161]">
          <Clock className="h-5 w-5 shrink-0" />
          <span>
            {formatDateTime(state.taskModel?.createdAt ?? '')?.time || 'N/A'}
          </span>
        </div>
      </section>
    </div>
  );

  return (
    <CustomModal
      isOpen={true}
      header={headerContent}
      body={bodyContent}
      handleCancel={handleClose}
      handleSubmit={handleMarkComplete}
      cancelButton={showCloseButton ? 'Close' : 'Cancel'}
      cancelvariant="primaryOutLine"
      submitValue="Mark Complete"
      variant="primary"
      isLoading={markAsCompleteMutation.isLoading}
      showFooter={true}
      showFooterSubmit={showMarkCompleteButton}
      justifyButton="justify-center"
    />
  );
};

export { TaskDetail };
