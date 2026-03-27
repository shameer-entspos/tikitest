'use client';

import 'react-datepicker/dist/react-datepicker.css';
import { useTaskCotnext } from '@/app/(main)/(user-panel)/user/tasks/context';
import { TASKTYPE } from '@/app/helpers/user/enums';
import { useSession } from 'next-auth/react';
import { Calendar, CalendarCheck2, Clock } from 'lucide-react';
import { formatDateTime } from '@/utils';
import CustomModal from '../Custom_Modal';

const TaskView = ({ isOpen }: { isOpen: boolean }) => {
  const { state, dispatch } = useTaskCotnext();
  const session = useSession();

  const handleClose = () => {
    dispatch({
      type: TASKTYPE.SHOWTASKMODAL,
    });
  };

  const headerContent = (
    <>
      <CalendarCheck2 className="h-12 w-12 rounded-full bg-primary-100/70 p-2 text-primary-500" />
      <h2 className="text-lg font-medium leading-7 text-[#000000] lg:text-xl">
        View Task
      </h2>
    </>
  );

  const bodyContent = (
    <div className="space-y-5">
      <div className="">
        <p className="py-1 text-xs font-medium text-gray-700 md:py-2 md:text-sm">
          Customer
        </p>
        <p className="text-base font-normal capitalize text-gray-900 md:text-lg">
          -
        </p>
      </div>

      <div className="">
        <p className="py-1 text-xs font-medium text-gray-700 md:py-2 md:text-sm">
          Assigned Project
        </p>
        <p className="w-max rounded-lg bg-green-400/60 px-2 text-base font-normal capitalize text-gray-900 md:text-lg">
          {(state.taskModel?.projects?.length ?? 0) > 0
            ? (state.taskModel?.projects?.[0]?.name ?? 'N/A')
            : 'N/A'}
        </p>
      </div>

      <div className="">
        <p className="py-1 text-xs font-medium text-gray-700 md:py-2 md:text-sm">
          Task Name
        </p>
        <p className="text-base font-semibold capitalize text-gray-900 md:text-lg">
          {state.taskModel?.name}
        </p>
      </div>

      <div className="">
        <p className="py-1 text-xs font-medium text-gray-700 md:py-2 md:text-sm">
          Description
        </p>
        <p className="line-clamp-3 font-Open-Sans text-sm font-normal text-gray-900 md:text-base">
          {state.taskModel?.description}
        </p>
      </div>

      <div className="">
        <p className="py-1 text-xs font-medium text-gray-700 md:py-2 md:text-sm">
          Linked App
        </p>
        <p className="line-clamp-3 font-Open-Sans text-sm font-normal text-gray-900 md:text-base">
          {state.taskModel?.app?.name}
        </p>
      </div>

      <div className="">
        <p className="py-1 text-xs font-medium text-gray-700 md:py-2 md:text-sm">
          Due Date
        </p>
        <p className="line-clamp-3 font-Open-Sans text-sm font-normal text-gray-900 md:text-base">
          {state.taskModel?.dueDate || '-'}
        </p>
      </div>

      <div className="">
        <p className="py-1 text-xs font-medium text-gray-700 md:py-2 md:text-sm">
          Task Sharing
        </p>
        <p className="line-clamp-3 font-Open-Sans text-sm font-normal text-gray-900 md:text-base">
          {(state.taskModel?.users?.length ?? 0) > 0
            ? `${state.taskModel?.users?.length ?? 0} users`
            : 'Not Shared'}
        </p>
      </div>

      <div className="space-y-2">
        <div className="py-2">
          <p className="py-1 text-xs font-normal md:py-2 md:text-sm">
            Created By
          </p>
          <div className="flex items-center gap-2">
            <img
              src="/images/user.png"
              className="h-9 w-9 rounded-full bg-gray-300"
              alt="user image"
            />
            <p className="text-sm font-semibold md:text-base">
              {`${state.taskModel?.userId?.firstName ?? ''} ${state.taskModel?.userId?.lastName ?? ''}`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Date Display */}
          <p className="flex items-center gap-1 text-xs font-normal md:text-sm">
            <Calendar className="h-5 w-5 text-gray-800" />
            <span>
              {formatDateTime(state.taskModel?.createdAt ?? '')?.date || 'N/A'}
            </span>
          </p>
          {/* Time Display */}
          <p className="flex items-center gap-1 text-xs font-normal md:text-sm">
            <Clock className="h-5 w-5 text-gray-800" />
            <span>
              {formatDateTime(state.taskModel?.createdAt ?? '')?.time || 'N/A'}
            </span>
          </p>
        </div>
      </div>

      {state.taskModel?.submitBy?.[0]?.user && (
        <div className="space-y-2">
          <div className="py-2">
            <p className="py-1 text-xs font-normal md:py-2 md:text-sm">
              Submitted By
            </p>
            <div className="flex items-center gap-2">
              <img
                src="/images/user.png"
                className="h-9 w-9 rounded-full bg-gray-300"
                alt="user image"
              />
              <p className="text-sm font-semibold md:text-base">
                {`${state.taskModel?.submitBy[0]?.user}`}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Date Display */}
            <p className="flex items-center gap-1 text-xs font-normal md:text-sm">
              <Calendar className="h-5 w-5 text-gray-800" />
              <span>
                {formatDateTime(state.taskModel?.submitByMe?.date ?? '')
                  ?.date || 'N/A'}
              </span>
            </p>
            {/* Time Display */}
            <p className="flex items-center gap-1 text-xs font-normal md:text-sm">
              <Clock className="h-5 w-5 text-gray-800" />
              <span>
                {formatDateTime(state.taskModel?.submitByMe?.date ?? '')
                  ?.time || 'N/A'}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <CustomModal
      isOpen={isOpen}
      header={headerContent}
      body={bodyContent}
      handleCancel={handleClose}
      handleSubmit={() => {}} // Empty function since we only have Close button
      cancelButton="Close"
      cancelvariant="primaryOutLine"
      submitValue=""
      variant="primary"
      showFooter={true}
      showFooterSubmit={false}
      justifyButton="justify-center"
    />
  );
};

export { TaskView };
