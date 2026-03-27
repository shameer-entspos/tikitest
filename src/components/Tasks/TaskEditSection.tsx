import {
  TaskModel,
  isTaskCompleted,
} from '@/app/(main)/(user-panel)/user/tasks/api';
import { useTaskCotnext } from '@/app/(main)/(user-panel)/user/tasks/context';
import { TASKTYPE } from '@/app/helpers/user/enums';

import {
  Avatar,
  Badge,
  Tab,
  Tabs,
  Pagination,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure,
} from '@nextui-org/react';
import { useState } from 'react';
import { Search } from '../Form/search';
import Select, { SingleValue } from 'react-select';
import { MultiSelect } from 'react-multi-select-component';
import { useSession } from 'next-auth/react';
import CustomHr from '../Ui/CustomHr';
import { Dialog } from '@headlessui/react';
import { Ellipsis, X } from 'lucide-react';
import { CustomBlueCheckBox } from '../Custom_Checkbox/Custom_Blue_Checkbox';
import { formatDateTime } from '@/utils';
import { getAppLogo } from '../popupModal/appListinApp';
import { CustomHoverPorjectShow } from '../Custom_Project_Hover_Component';
import { TasKMembers } from './NewTaskModel/Task_Members';
import { AppDispatch, RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { handleAddTaskModel } from '@/store/taskSlice';

function TaskEditSection({
  data,
  open,
  setOpen,
  adminMode = false,
  canUseAdminMode = false,
}: {
  data?: TaskModel[];
  open: boolean;
  setOpen: any;
  adminMode?: boolean;
  canUseAdminMode?: boolean;
}) {
  const { state, dispatch } = useTaskCotnext();

  const session = useSession();
  const reduxDispatch = useDispatch<AppDispatch>();
  const modelType = useSelector((state: RootState) => state.task.addTaskModel);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  const handleCheckboxChange = (item: TaskModel) => {
    dispatch({
      type: TASKTYPE.CHECK_BOX_SELECTION,
      selectedCheckedModel: item,
    });
  };

  if (data) {
    return (
      <>
        <div className={`w-full lg:overflow-x-visible lg:px-0`}>
          <div className="w-full table-auto space-y-2">
            {/* table head */}

            {/* table body */}
            {(data ?? []).length > 0 && (
              <div className={'space-y-1'}>
                {(data ?? []).map((task, index) => {
                  const completed = isTaskCompleted(task);
                  return (
                    <div
                      key={task._id}
                      className={`grid cursor-pointer grid-cols-12 items-center gap-4 rounded-2xl border-2 border-gray-300 px-2 py-1`}
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

                      {/* Due Date */}
                      <p className="col-span-2 flex justify-center truncate px-4 py-3 text-center text-sm text-[#616161]">
                        {task.dueDate
                          ? formatDateTime(task.dueDate ?? '')?.date || 'N/A'
                          : 'No Due Date'}
                      </p>

                      {/* Select */}
                      <div className="flex justify-center text-center">
                        {state.isMultiSelectEnabled ? (
                          <CustomBlueCheckBox
                            disabled={
                              completed ||
                              // In Admin Mode, allow selecting any task
                              // Otherwise, only allow selecting own tasks
                              (!(canUseAdminMode && adminMode) &&
                                task?.userId?._id !==
                                  session?.data?.user.user?._id)
                            }
                            checked={(state.selectedCheckedModel ?? []).some(
                              (ts) => task._id == ts._id
                            )}
                            onChange={() => handleCheckboxChange(task)}
                          />
                        ) : (
                          <Dropdown className="">
                            <DropdownTrigger>
                              <Ellipsis />
                            </DropdownTrigger>
                            <DropdownMenu
                              aria-label="Dropdown Variants"
                              color={'default'}
                              variant={'light'}
                              className="shadow-m !max-w-[130px] !rounded-xl bg-white"
                            >
                              <DropdownItem
                                key="view"
                                onPress={() => {
                                  dispatch({
                                    type: TASKTYPE.SHOWTASKMODAL,
                                    showTaskModal: 'view',
                                    taskModel: task,
                                  });
                                }}
                                className=""
                              >
                                View
                              </DropdownItem>
                              <DropdownItem
                                key="edit"
                                isDisabled={completed}
                                className={` ${
                                  completed
                                    ? 'cursor-not-allowed opacity-60'
                                    : ''
                                }`}
                                onPress={() => {
                                  if (completed) return;
                                  dispatch({
                                    type: TASKTYPE.SHOW_EDIT_SECTION,
                                    taskModel: task,
                                  });
                                  reduxDispatch(handleAddTaskModel('detail'));
                                }}
                              >
                                Edit
                              </DropdownItem>
                              <DropdownItem
                                key="manage"
                                onPress={() => {
                                  dispatch({
                                    type: TASKTYPE.SHOW_EDIT_SECTION,
                                    taskModel: task,
                                  });
                                  reduxDispatch(handleAddTaskModel('members'));
                                }}
                                className=""
                              >
                                Task Members
                              </DropdownItem>
                              <DropdownItem
                                key="remove"
                                isDisabled={completed}
                                className={` ${
                                  completed
                                    ? 'cursor-not-allowed opacity-60'
                                    : ''
                                }`}
                                onPress={() => {
                                  if (completed) return;
                                  dispatch({
                                    type: TASKTYPE.SHOWREMOVE,
                                    removeid: task._id,
                                  });
                                }}
                              >
                                Remove
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {modelType == 'members' && (
          <TasKMembers
            handleCancel={() => {
              reduxDispatch(handleAddTaskModel(undefined));
            }}
          />
        )}
      </>
    );
  }
  return <></>;
}

export default TaskEditSection;
