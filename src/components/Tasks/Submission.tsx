import {
  hasCurrentUserSubmitted,
  TaskModel,
} from '@/app/(main)/(user-panel)/user/tasks/api';
import { TASKTYPE } from '@/app/helpers/user/enums';
import { useTaskCotnext } from '@/app/(main)/(user-panel)/user/tasks/context';
import { useState } from 'react';
import { SingleValue } from 'react-select';
import { CustomBlueCheckBox } from '../Custom_Checkbox/Custom_Blue_Checkbox';
import { useSession } from 'next-auth/react';
import { dateFormat } from '@/app/helpers/dateFormat';
import { user } from '@nextui-org/react';
import { CustomHoverPorjectShow } from '../Custom_Project_Hover_Component';
import { getAppLogo, handleAppClick } from '../popupModal/appListinApp';
import { customSortFunction } from '@/app/helpers/re-use-func';
import CustomModal from '../Custom_Modal';
import UserCard from '../UserCard';
import { formatDateTime } from '@/utils';
import { Calendar, Clock } from 'lucide-react';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useMutation, useQueryClient } from 'react-query';
import { updateAppRecentStatus } from '@/app/(main)/(user-panel)/user/apps/api';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';

export function SubmissionTask({
  taskSubmitted,
}: {
  taskSubmitted: TaskModel[];
  open: boolean;
  setOpen: any;
}) {
  const [hoveredUser, setHoveredUser] = useState<number | null>(null);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const { data: session } = useSession();

  const handleCheckboxChange = (item: TaskModel) => {
    dispatch({
      type: TASKTYPE.CHECK_BOX_SELECTION,
      selectedCheckedModel: item,
    });
  };
  const [viewTaskModel, setViewTaskModel] = useState<TaskModel | undefined>(
    undefined
  );
  const axiosAuth = useAxiosAuth();

  const updateMutaion = useMutation(updateAppRecentStatus);
  // use taskSlice here

  const [appSelected, setAppSelected] = useState<
    { label: string; value: string }[]
  >([]);
  const [projectSelected, setProjectSelected] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedOption, setSelectedOption] = useState<
    SingleValue<{ label: string; value: string }>
  >({ value: 'Recently', label: 'Recently' });
  const { state, dispatch } = useTaskCotnext();
  const filteredTasks = (taskSubmitted ?? []).filter((task: TaskModel) => {
    const hasAppFilter = appSelected.length > 0;
    const hasProjectFilter = projectSelected.length > 0;

    if (hasAppFilter && hasProjectFilter) {
      // Filter when both app and project are selected
      return (
        appSelected.some(({ label }) => label === task.app?.name) &&
        task.projects?.some((project) =>
          projectSelected.some(({ label }) => label === project.name)
        )
      );
    } else if (hasAppFilter) {
      // Filter when only app is selected
      return appSelected.some(({ label }) => label === task.app?.name);
    } else if (hasProjectFilter) {
      // Filter when only project is selected
      return task.projects?.some((project) =>
        projectSelected.some(({ label }) => label === project.name)
      );
    }
    return true;
  });

  return (
    <>
      {/* tasks table */}

      <div className={`w-full lg:overflow-x-visible lg:px-0`}>
        <div className="w-full table-auto space-y-2">
          {' '}
          {/* table body */}
          {(filteredTasks ?? []).length > 0 && (
            <div className={'space-y-1'}>
              {(filteredTasks ?? []).map((task, index) => {
                return (
                  <div
                    key={task._id}
                    className={`grid grid-cols-12 items-center gap-4 rounded-2xl border-2 border-gray-200 px-3 py-1`}
                  >
                    {/* Task Name */}
                    <div className={'col-span-3 flex min-w-0'}>
                      <img
                        src={getAppLogo({ logoType: task.app?.type ?? '' })}
                        alt="app"
                        className={'h-12 flex-shrink-0'}
                      />
                      <div className="flex min-w-0 flex-col justify-center">
                        <p className="w-full truncate px-4 text-medium font-medium text-black">
                          {task.name}
                        </p>
                        <p className="truncate px-4 text-sm font-normal text-[#616161]">
                          {task.app?.name ?? 'No Linked App'}
                        </p>
                      </div>
                    </div>
                    {/* Assigned Project */}

                    <div className="relative col-span-2 flex items-center gap-2 text-sm text-gray-700">
                      <CustomHoverPorjectShow
                        projects={task.projects ?? []}
                        index={hoveredProject}
                        selectedIndex={index}
                        setHoveredProject={setHoveredProject}
                      />
                    </div>

                    <div className="col-span-2 flex items-center gap-2 truncate text-sm text-[#616161]">
                      <img
                        src={'/images/user.png'}
                        alt="avatar"
                        className="mr-2 h-8 w-8 rounded-full border border-gray-500 text-[#1E1E1E]"
                      />
                      <span className="text-[#616161]">
                        <>{`${task?.customer}`}</>
                      </span>
                    </div>

                    {/* Task Sharing */}
                    <p className="col-span-2 flex justify-center truncate px-4 py-3 text-sm text-gray-600">
                      {task.shareAs}
                    </p>
                    <p className="col-span-2 flex justify-center gap-1 text-sm text-gray-600">
                      {hasCurrentUserSubmitted(
                        task,
                        session?.user?.user?._id
                      ) &&
                        dateFormat(
                          (task.submitBy ?? []).find(
                            (user) =>
                              String(user?.user?._id ?? user?.user) ===
                              String(session?.user?.user?._id)
                          )?.date ?? ''
                        )}
                    </p>

                    {/* Select */}
                    <div className="flex justify-center">
                      <button
                        className={`flex w-max items-center justify-center gap-1 rounded-full bg-primary-500 px-6 py-[6px] !text-sm font-medium text-white hover:bg-primary-600/80 sm:text-base`}
                        onClick={() => {
                          // dispatch({
                          //   type: TASKTYPE.SHOWTASKMODAL,
                          //   showTaskModal: 'view',
                          //   taskModel: task,
                          // });\
                          setViewTaskModel(task);
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CustomModal
        isOpen={viewTaskModel != undefined}
        header={
          <>
            <div className="flex w-full items-center gap-3">
              <img src="/svg/task/logo-bg-circle.svg" alt="task logo" />

              <div>
                <h2 className="text-base font-semibold leading-7 text-[#1E1E1E] md:text-xl">
                  View Task
                </h2>
                <span className="font-normal text-[#616161] sm:text-sm">
                  View and start task details below
                </span>
              </div>
            </div>
          </>
        }
        body={
          <div className="flex h-[550px] flex-col space-y-4 overflow-auto px-3">
            <div className="">
              <p className="py-1 text-sm font-medium text-[#616161] md:py-2 md:text-sm">
                Linked App
              </p>
              {viewTaskModel?.app ? (
                <>
                  <div
                    className="flex w-fit cursor-pointer items-center gap-3 rounded-lg bg-white px-3 py-1 shadow-primary-shadow shadow-primary-400"
                    onClick={() =>
                      handleAppClick(
                        viewTaskModel?.app!,
                        axiosAuth,
                        updateMutaion
                      )
                    }
                  >
                    <img
                      src={getAppLogo({
                        logoType: viewTaskModel?.app?.type ?? '',
                      })}
                      alt="app"
                      className={'h-12'}
                    />
                    <span>{viewTaskModel?.app.name}</span>
                  </div>
                </>
              ) : (
                <>
                  <p className="line-clamp-3 font-Open-Sans text-base font-normal text-[#616161] md:text-base">
                    {'None'}
                  </p>
                </>
              )}
            </div>
            <div className="">
              <p className="py-1 text-xs font-medium text-[#616161] md:py-2 md:text-sm">
                Customer
              </p>
              <p className="text-xs font-normal capitalize text-[#616161] md:text-sm">
                <div className="flex items-center gap-2">
                  <img src="/user.svg" alt="user" />
                  <span>{viewTaskModel?.customer ?? ''}</span>
                </div>
              </p>
            </div>

            <div className="">
              <p className="py-1 text-xs font-medium text-[#616161] md:py-2 md:text-sm">
                Assigned Project
              </p>
              <CustomHoverPorjectShow
                projects={viewTaskModel?.projects ?? []}
                index={hoveredProject}
                setHoveredProject={setHoveredProject}
              />
            </div>

            <div className="">
              <p className="py-1 text-xs font-medium text-[#616161] md:py-2 md:text-sm">
                Task Name
              </p>
              <p className="text-base font-semibold text-[#1E1E1E]">
                {viewTaskModel?.name
                  ?.split(' ')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </p>
            </div>

            <div className="">
              <p className="py-1 text-xs font-medium text-[#616161] md:py-2 md:text-sm">
                Description
              </p>
              <p className="line-clamp-3 font-Open-Sans text-sm font-normal text-[#616161] md:text-base">
                {viewTaskModel?.description}
              </p>
            </div>

            <div className="">
              <p className="py-1 text-xs font-medium text-[#616161] md:py-2 md:text-sm">
                Due Date
              </p>
              <p className="line-clamp-3 font-Open-Sans text-sm font-normal text-[#616161] md:text-base">
                {dateFormat(viewTaskModel?.dueDate ?? '')}
              </p>
            </div>

            <div className="">
              <p className="py-1 text-xs font-medium text-[#616161] md:py-2 md:text-sm">
                Task Sharing
              </p>
              <p className="line-clamp-3 font-Open-Sans text-sm font-normal text-[#616161] md:text-base">
                {viewTaskModel?.shareAs}
              </p>
            </div>
            <div className="mt-1 md:mt-2">
              <p className="py-2 text-sm font-normal text-[#616161] md:text-sm">
                Completed By
              </p>
              <p className="text-xs font-normal capitalize text-[#616161] md:text-sm">
                <div className="flex items-center gap-2">
                  <img src="/user.svg" alt="user" />
                  <span>{`${viewTaskModel?.submitBy?.find((u) => u?.user?._id === session?.user.user._id)?.user?.firstName ?? ''} ${viewTaskModel?.submitBy?.find((u) => u?.user?._id === session?.user.user._id)?.user?.lastName ?? ''}`}</span>
                </div>
              </p>
            </div>
            <div className="flex gap-2">
              {/* Date Display */}
              <p className="flex items-center gap-1 text-xs font-normal text-[#616161] md:text-sm">
                <Calendar className="h-5 w-5" />
                <span>
                  {formatDateTime(
                    viewTaskModel?.submitBy?.find(
                      (u) => u?.user?._id === session?.user.user._id
                    )?.date ?? ''
                  )?.date || 'N/A'}
                </span>
              </p>
              {/* Time Display */}
              <p className="flex items-center gap-1 text-xs font-normal text-[#616161] md:text-sm">
                <Clock className="h-5 w-5" />
                <span>
                  {formatDateTime(
                    viewTaskModel?.submitBy?.find(
                      (u) => u?.user?._id === session?.user.user._id
                    )?.date ?? ''
                  )?.time || 'N/A'}
                </span>
              </p>
            </div>
            <div className="mt-1 md:mt-2">
              <p className="py-2 text-sm font-normal text-[#616161] md:text-sm">
                Created By
              </p>
              <UserCard submittedBy={viewTaskModel?.userId} index={0} />
            </div>

            <div className="flex gap-2">
              {/* Date Display */}
              <p className="flex items-center gap-1 text-xs font-normal text-[#616161] md:text-sm">
                <Calendar className="h-5 w-5" />
                <span>
                  {formatDateTime(viewTaskModel?.createdAt ?? '')?.date ||
                    'N/A'}
                </span>
              </p>
              {/* Time Display */}
              <p className="flex items-center gap-1 text-xs font-normal text-[#616161] md:text-sm">
                <Clock className="h-5 w-5" />
                <span>
                  {formatDateTime(viewTaskModel?.createdAt ?? '')?.time ||
                    'N/A'}
                </span>
              </p>
            </div>
          </div>
        }
        handleCancel={() => {
          setViewTaskModel(undefined);
        }}
        handleSubmit={undefined}
        submitValue={''}
        cancelButton="Close"
        showFooterSubmit={false}
      />
    </>
  );
}
