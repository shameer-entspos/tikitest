import {
  TaskModel,
  hasCurrentUserSubmitted,
} from '@/app/(main)/(user-panel)/user/tasks/api';
import { useTaskCotnext } from '@/app/(main)/(user-panel)/user/tasks/context';
import { TASKTYPE } from '@/app/helpers/user/enums';
import { CustomBlueCheckBox } from '../Custom_Checkbox/Custom_Blue_Checkbox';
import { checkDateIsDue, formatDateTime, getDueDateLabel } from '@/utils';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { getAppLogo } from '../popupModal/appListinApp';
import { CustomHoverPorjectShow } from '../Custom_Project_Hover_Component';
import { Button } from '../Buttons';

export function UpcomingTask({ data }: { data?: TaskModel[] }) {
  const { state, dispatch } = useTaskCotnext();
  const [hoveredUser, setHoveredUser] = useState<number | null>(null);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const { data: session } = useSession();
  const currentUserId = session?.user?.user?._id;

  const handleCheckboxChange = (item: TaskModel) => {
    dispatch({
      type: TASKTYPE.CHECK_BOX_SELECTION,
      selectedCheckedModel: item,
    });
  };

  return (
    <div className={`w-full lg:overflow-x-visible lg:px-0`}>
      <>
        <div className="w-full table-auto space-y-2">
          {/* Table Body — grid must match Tasks/index.tsx header: grid-cols-10 md:grid-cols-11 */}
          {(data ?? []).length > 0 && (
            <div className={'space-y-1'}>
              {(data ?? []).map((task, index) => {
                const alreadySubmitted = hasCurrentUserSubmitted(
                  task,
                  currentUserId
                );
                return (
                  <div
                    key={task._id}
                    className={`grid grid-cols-12 items-center gap-4 rounded-2xl border-2 border-gray-200 px-3 py-1 ${
                      alreadySubmitted
                        ? 'cursor-default opacity-60'
                        : 'cursor-pointer'
                    }`}
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
                    <div className="relative z-30 col-span-2 flex items-center gap-2 text-sm text-gray-700">
                      <CustomHoverPorjectShow
                        projects={task.projects ?? []}
                        index={hoveredProject}
                        selectedIndex={index}
                        setHoveredProject={setHoveredProject}
                      />
                    </div>
                    {/* Customer  */}
                    <div className="col-span-2 flex items-center gap-2 text-sm text-gray-700">
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
                    <p className="col-span-2 min-w-0 truncate text-center text-sm text-gray-600">
                      {task.shareAs}
                    </p>

                    {/* Due Date */}
                    <p
                      className={`col-span-2 flex min-w-0 justify-center text-sm ${checkDateIsDue(task.dueDate) ? 'text-red-400' : 'text-[#616161]'}`}
                    >
                      {getDueDateLabel(task.dueDate)}
                    </p>

                    {/* Select */}
                    <div className="flex min-w-0 justify-center">
                      {state.isMultiSelectEnabled ? (
                        <div className="flex w-full justify-end pr-1">
                          <CustomBlueCheckBox
                            disabled={
                              task?.userId?._id !== session?.user.user?._id ||
                              alreadySubmitted
                            }
                            checked={(state.selectedCheckedModel ?? []).some(
                              (ts) => task?._id == ts?._id
                            )}
                            onChange={() => handleCheckboxChange(task)}
                          />
                        </div>
                      ) : (
                        <button
                          className={`flex w-max items-center justify-center gap-1 rounded-full px-6 py-[6px] !text-sm font-medium sm:text-base ${
                            alreadySubmitted
                              ? 'cursor-not-allowed bg-gray-400 text-gray-700'
                              : 'bg-primary-500 text-white hover:bg-primary-600/80'
                          }`}
                          disabled={alreadySubmitted}
                          onClick={() => {
                            if (alreadySubmitted) return;
                            dispatch({
                              type: TASKTYPE.SHOWTASKMODAL,
                              showTaskModal: 'detail',
                              taskModel: task,
                            });
                          }}
                        >
                          Start
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    </div>
  );
}
