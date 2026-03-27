import {
  deleteManyTask,
  deleteTask,
  getAllTasks,
  getUserPermission,
  hasCurrentUserSubmitted,
  isTaskCompleted,
  markAsCompleteManyTask,
  TaskModel,
} from '@/app/(main)/(user-panel)/user/tasks/api';
import { useTaskCotnext } from '@/app/(main)/(user-panel)/user/tasks/context';
import { TASKTYPE } from '@/app/helpers/user/enums';
import { Search } from '@/components/Form/search';
import useAxiosAuth from '@/hooks/AxiosAuth';
import CustomModal from '@/components/Custom_Modal';

import {
  Badge,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure,
  Spinner,
} from '@nextui-org/react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import Loader from '../DottedLoader/loader';
import { NewTaskModel } from './NewTaskModel';
import { OverdueTask } from './OverDue';
import { SubmissionTask } from './Submission';
import { TaskDetail } from './TaskDetail';
import TaskEditSection from './TaskEditSection';

import { TaskRemove } from './TaskRemove';
import { TaskView } from './TaskView';
import { UpcomingTask } from './UpComing_Task';
import { CalendarCheck2, Plus, TriangleAlert, X } from 'lucide-react';
import {
  FaAngleLeft,
  FaAngleRight,
  FaCaretDown,
  FaFilter,
} from 'react-icons/fa';
import React, { useEffect, useMemo, useState } from 'react';
import Switch from '@/components/Form/switch';
import CustomHr from '@/components/Ui/CustomHr';
import { useSession } from 'next-auth/react';
import AdminSwitch from '../AdminSwitch/AdminSwitch';
import {
  getAllAppProjects,
  getAllOrgUsers,
  getApps,
} from '@/app/(main)/(user-panel)/user/apps/api';
import { CustomSearchSelect } from '../TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { Button } from '../Buttons';
import FilterButton from '../TimeSheetApp/CommonComponents/FilterButton/FilterButton';
import { SimpleInput } from '../Form/simpleInput';
import CustomInfoModal from '../CustomDeleteModel';
import { CustomBlueCheckBox } from '../Custom_Checkbox/Custom_Blue_Checkbox';
import DateRangePicker from '../../components/JobSafetyAnalysis/CreateNewComponents/JSA_Calender';
import { useTikiPagination } from '@/hooks/usePagination';
import { SpinnerLoader } from '../SpinnerLoader';
import { AppDispatch, RootState } from '@/store';
import { handleAddTaskModel, handleSorting } from '@/store/taskSlice';
import { useDispatch, useSelector } from 'react-redux';
import { TasKMembers } from './NewTaskModel/Task_Members';
import { socket } from '@/app/helpers/user/socket.helper';
import { buildFilteredTasks } from './tasks-filter';

export function Tasks() {
  const { data: session } = useSession();
  const [adminMode, setAdminMode] = useState(false);
  const [open, setOpen] = useState<boolean>(false);
  const [search, setSearch] = useState('');
  const { state, dispatch } = useTaskCotnext();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  // Live update: refetch tasks when backend emits task:update (create/update/delete/complete)
  useEffect(() => {
    const onTaskUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['recentTaskList'] });
    };
    socket.on('task:update', onTaskUpdate);
    return () => {
      socket.off('task:update', onTaskUpdate);
    };
  }, [queryClient]);

  // Check if user is Root User from session (role 3 = Organization Admin)
  const isRootUser = (session?.user as any)?.role === 3;

  // Check if user has Admin Mode permission
  const { data: hasTaskManagePermission } = useQuery({
    queryKey: 'userTaskPermission',
    queryFn: () => getUserPermission(axiosAuth),
    refetchOnWindowFocus: false,
  });

  // User can use Admin Mode if Root User or team has permission
  const canUseAdminMode = isRootUser || hasTaskManagePermission?.tasks || false;
  const deleteManyTaskMutation = useMutation(deleteManyTask, {
    onSuccess: () => {
      handleCancel();
      toggleDeleteModel(false);
      queryClient.invalidateQueries('tasks');
    },
  });
  const markAsCompleteMutation = useMutation(markAsCompleteManyTask, {
    onSuccess: () => {
      handleCancel();
      toggleMarkCompleteModel(false);
      queryClient.invalidateQueries('tasks');
    },
  });
  // filter project
  const [isApplyFilter, setApplyFilter] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string>('');
  const [showFilterModel, setShowFilterModel] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [selectedSharedTask, setSelectedSharedTask] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showDeleteModel, toggleDeleteModel] = useState(false);
  const [showMarkCompleteModel, toggleMarkCompleteModel] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string[]>([]);

  const reduxDispatch = useDispatch<AppDispatch>();
  const sortDate = useSelector((state: RootState) => state.task.sortDate);
  const sortName = useSelector((state: RootState) => state.task.sortName);
  const sortType = useSelector((state: RootState) => state.task.sortType);
  const modelType = useSelector((state: RootState) => state.task.addTaskModel);

  const handleSortChange = (sortType: 'text' | 'date') => {
    // make previous comment in one call
    reduxDispatch(
      handleSorting({
        sortType: sortType,
        sortName: sortName == 'desc' && sortType == 'text' ? 'asc' : 'desc',
        sortDate: sortDate == 'desc' && sortType == 'date' ? 'asc' : 'desc',
      })
    );
  };

  const handleDropdown = (dropdownId: string) => {
    setOpenFilterDropdown(openFilterDropdown === dropdownId ? '' : dropdownId);
  };
  // Filter handling
  const clearFilters = () => {
    setSelectedProjects([]);
    setSelectedApps([]);
    setSelectedSharedTask([]);
    setSelectedUsers([]);
    setSelectedCustomer([]);
    setTaskName('');
    setApplyFilter(false);
    setOpenFilterDropdown('');
    setShowFilterModel(false);
  };

  const areFiltersApplied = () => {
    return (
      selectedProjects.length > 0 ||
      selectedApps.length > 0 ||
      selectedSharedTask.length > 0 ||
      selectedUsers.length > 0 ||
      selectedCustomer.length > 0 ||
      taskName !== ''
    );
  };

  const handleApplyFilters = () => {
    setShowFilterModel(!showFilterModel);
    if (areFiltersApplied()) {
      setApplyFilter(true);
    }
  };
  const handleCancel = () => {
    dispatch({ type: TASKTYPE.CLEAR_CHECK_BOX_SELEECTION });
  };

  // pagination

  const { data: projects } = useQuery({
    queryFn: () => getAllAppProjects(axiosAuth),
    queryKey: ['allProjects'],
  });
  const { data: users } = useQuery({
    queryKey: 'listofUsersForApp',
    queryFn: () => getAllOrgUsers(axiosAuth),
    refetchOnWindowFocus: false,
  });
  const { data: apps } = useQuery({
    queryKey: 'apps',
    queryFn: () => getApps(axiosAuth),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', adminMode],
    queryFn: () => getAllTasks({ axiosAuth, isAdmin: adminMode }),
    enabled: true,
  });

  const filterTasks = useMemo(
    () =>
      buildFilteredTasks({
        tasks: data ?? [],
        currentTab: state.currentTab,
        currentUserId: session?.user.user._id,
        canUseAdminMode,
        adminMode,
        search,
        isApplyFilter,
        selectedProjects,
        selectedApps,
        selectedSharedTask,
        selectedUsers,
        selectedCustomer,
        taskName,
        sortType,
        sortName,
        sortDate,
      }),
    [
      data,
      state.currentTab,
      session?.user.user._id,
      canUseAdminMode,
      adminMode,
      search,
      isApplyFilter,
      selectedProjects,
      selectedApps,
      selectedSharedTask,
      selectedUsers,
      selectedCustomer,
      taskName,
      sortType,
      sortName,
      sortDate,
    ]
  );

  const {
    currentPage,
    totalPages,
    paginatedItems,
    itemsPerPage,
    handlePageChange,
  } = useTikiPagination(filterTasks ?? [], 20);
  const handleSelectAllChange = () => {
    // Check if all items on current page are selected
    const currentPageSelected = paginatedItems.filter((item) =>
      (state.selectedCheckedModel ?? []).some(
        (selected) => selected._id === item._id
      )
    );

    if (currentPageSelected.length === paginatedItems.length) {
      // Deselect all items on current page
      paginatedItems.forEach((item) => {
        dispatch({
          type: TASKTYPE.CHECK_BOX_SELECTION,
          selectedCheckedModel: item,
        });
      });
    } else {
      // Select all items on current page
      paginatedItems.forEach((item) => {
        // Only add if not already selected
        if (
          !(state.selectedCheckedModel ?? []).some(
            (selected) => selected._id === item._id
          )
        ) {
          dispatch({
            type: TASKTYPE.CHECK_BOX_SELECT_ALL,
            selectedCheckedModel: item,
          });
        }
      });
    }
  };
  if (isLoading) return <SpinnerLoader />;
  return (
    <section className="min-h-0 w-full max-w-[1360px] scrollbar-hide">
      <div className="relative h-[calc(var(--app-vh)_-_144px)] flex-grow space-y-4 overflow-y-auto scrollbar-hide">
        {/* // first row   */}

        <div className="sticky top-0 z-10 w-full bg-white pt-5 backdrop-blur-md">
          <div className="page-heading-edit flex flex-wrap items-center justify-between md:flex-nowrap">
            <h1 className="flex items-center gap-2 text-xl font-bold capitalize leading-7 text-[#000000] lg:text-2xl">
              <img src="/task_logo.svg" alt="task logo" />
              {/* <CalendarCheck2 className="h-10 w-10 rounded-lg bg-primary-100/70 p-2 text-primary-500 md:h-11 md:w-11 lg:h-12 lg:w-12" /> */}
              {state.currentTab === 'upcoming'
                ? 'pending'
                : state.currentTab === 'submission'
                  ? 'completed'
                  : state.currentTab === 'edit'
                    ? 'manage'
                    : state.currentTab}
              {' Tasks'}
            </h1>

            <div className="team-actice flex flex-col items-center justify-between gap-2 sm:flex-row">
              <div className="flex items-center gap-2">
                {/* Admin Mode Toggle - Only show if user has permission */}
                {canUseAdminMode && (
                  <AdminSwitch
                    adminMode={adminMode}
                    setAdminMode={setAdminMode}
                  />
                )}
                <Dropdown
                  placement="bottom-end"
                  className="rounded-xl bg-[#E2F3FF] p-2 shadow-lg"
                >
                  <DropdownTrigger>
                    <button className="flex h-max items-center gap-2 rounded-lg bg-[#E2F3FF] px-2 py-1 text-sm capitalize outline-none">
                      {state.currentTab === 'upcoming'
                        ? 'pending'
                        : state.currentTab === 'submission'
                          ? 'completed'
                          : state.currentTab === 'edit'
                            ? 'manage tasks'
                            : state.currentTab}
                      <FaCaretDown />
                    </button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Filters"
                    className="p-0"
                    variant="flat"
                  >
                    <DropdownItem
                      key="pending"
                      onPress={() =>
                        dispatch({
                          type: TASKTYPE.TABCHANGE,
                          currentTab: 'upcoming',
                        })
                      }
                    >
                      Pending
                    </DropdownItem>
                    <DropdownItem
                      key="overdue"
                      onPress={() =>
                        dispatch({
                          type: TASKTYPE.TABCHANGE,
                          currentTab: 'overdue',
                        })
                      }
                    >
                      Overdue
                    </DropdownItem>
                    <DropdownItem
                      onPress={() =>
                        dispatch({
                          type: TASKTYPE.TABCHANGE,
                          currentTab: 'submission',
                        })
                      }
                      key="completed"
                    >
                      Completed
                    </DropdownItem>
                    <DropdownItem
                      onPress={() =>
                        dispatch({
                          type: TASKTYPE.TABCHANGE,
                          currentTab: 'edit',
                        })
                      }
                      key="manage"
                    >
                      Manage Tasks
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>

                {/* filter button */}
                <FilterButton
                  isApplyFilter={isApplyFilter}
                  setShowModel={setShowFilterModel}
                  showModel={showFilterModel}
                  setOpenDropdown={setOpenFilterDropdown}
                  clearFilters={clearFilters}
                />
              </div>

              <div className="tema-heading hidden" />

              {/* search bar */}
              <div className="hidden sm:block">
                <Search
                  className="h-[44px] min-w-[241px] bg-[#EEEEEE] placeholder:text-[#616161]"
                  key={'search'}
                  inputRounded={true}
                  type="text"
                  name="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Tasks"
                />
              </div>
            </div>
          </div>
          {/* search bar on mobile screen */}
          <div className="mt-4 block sm:hidden">
            <Search
              className="h-[44px] min-w-[241px] bg-[#EEEEEE] placeholder:text-[#616161]"
              key={'search'}
              inputRounded={true}
              type="text"
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Project"
            />
          </div>
        </div>
        <div className="auto w-full">
          <div className="w-full overflow-x-auto px-2 scrollbar-hide lg:px-0">
            {/* table header */}
            <div className="grid min-w-[1024px] grid-cols-12 items-center justify-between gap-4 rounded-xl bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
              <p className="col-span-3 flex gap-1 text-left">
                Task Name
                <img
                  src="/sort-icon.svg"
                  className="cursor-pointer"
                  alt=""
                  onClick={() => {
                    handleSortChange('text');
                  }}
                />
              </p>
              <p className="col-span-2 py-2 text-left">Assigned Project</p>
              <p className="col-span-2 text-left">Customer</p>
              <p className="col-span-2 text-center">Task Sharing</p>
              <p className="col-span-2 flex justify-center gap-1">
                {state.currentTab === 'submission' ? (
                  <span>Completed Date</span>
                ) : (
                  'Due Date'
                )}
                <img
                  src="/sort-icon.svg"
                  alt=""
                  className="cursor-pointer"
                  onClick={() => {
                    handleSortChange('date');
                  }}
                />
              </p>
              <div className="rounded-r-lg bg-[#F5F5F5] text-right text-sm font-normal text-[#0063F7]">
                {state.isMultiSelectEnabled ? (
                  <div className="flex items-center justify-end gap-2 pr-2">
                    <div className="cursor-pointer" onClick={handleCancel}>
                      Cancel
                    </div>

                    <CustomBlueCheckBox
                      checked={
                        paginatedItems.length > 0 &&
                        paginatedItems.every((item) =>
                          (state.selectedCheckedModel ?? []).some(
                            (selected) => selected._id === item._id
                          )
                        )
                      }
                      onChange={handleSelectAllChange}
                    />
                  </div>
                ) : (
                  state.currentTab !== 'submission' && (
                    <div
                      className="cursor-pointer text-center"
                      onClick={() =>
                        dispatch({ type: TASKTYPE.IS_MULTI_SELECT_ENABLED })
                      }
                    >
                      Select
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="min-w-[1024px]">
              {/* third section */}
              {state.currentTab === 'upcoming' && (
                <>
                  {isLoading ? (
                    <>
                      <div className="flex h-80 items-center justify-center">
                        <Loader />
                      </div>
                    </>
                  ) : (
                    <UpcomingTask data={paginatedItems} />
                  )}
                </>
              )}
              {state.currentTab === 'overdue' && (
                <OverdueTask
                  open={open}
                  setOpen={setOpen}
                  data={paginatedItems}
                />
              )}
              {state.currentTab === 'submission' && (
                <SubmissionTask
                  open={open}
                  setOpen={setOpen}
                  taskSubmitted={paginatedItems ?? []}
                />
              )}
              {state.currentTab === 'edit' && (
                <TaskEditSection
                  open={open}
                  setOpen={setOpen}
                  data={paginatedItems}
                  adminMode={adminMode}
                  canUseAdminMode={canUseAdminMode}
                />
              )}
              {modelType == 'detail' && <NewTaskModel adminMode={adminMode} />}
              {modelType == 'members' && (
                <TasKMembers
                  handleCancel={() => {
                    // If TaskDetail is already open, just close Task Members without opening detail again
                    // Otherwise, open detail modal (for NewTaskModel flow)
                    if (state.showTaskModal === 'detail') {
                      reduxDispatch(handleAddTaskModel(undefined));
                    } else {
                      reduxDispatch(handleAddTaskModel('detail'));
                    }
                  }}
                  adminMode={adminMode}
                />
              )}
              {state.showTaskModal === 'detail' && (
                <TaskDetail adminMode={adminMode} />
              )}
              {state.showTaskModal === 'view' && <TaskView isOpen={true} />}
              {state.showRemove && <TaskRemove adminMode={adminMode} />}
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-40 left-1/2 z-10 mx-auto w-full max-w-[1360px] -translate-x-1/2 transform">
        <div className="flex justify-end">
          <Button
            variant="primaryRounded"
            onClick={() => {
              dispatch({
                type: TASKTYPE.SHOWNEWTASKMODAL,
              });
              reduxDispatch(handleAddTaskModel('detail'));
            }}
          >
            {'+ Add'}
          </Button>
        </div>
      </div>
      {/* footer */}
      <div className="flex h-[72px] w-full items-center justify-between space-x-4 rounded-t-xl border-2 border-gray-300 border-b-transparent bg-white px-4">
        <span className="text-sm text-gray-700">
          Items per page: {itemsPerPage}
        </span>
        <div className="flex items-center justify-center space-x-2">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-md px-2 py-1 text-lg text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaAngleLeft />
          </button>

          {/* Current Page */}
          <div className="rounded-lg border border-gray-700 px-3 py-1 text-gray-700">
            {currentPage}
          </div>

          {/* Total Pages */}
          <span className="text-sm text-gray-700">of {totalPages}</span>

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-md px-2 py-1 text-lg text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaAngleRight />
          </button>
        </div>
        <div className="hidden md:block">
          {state.isMultiSelectEnabled && state.currentTab !== 'submission' && (
            <div className="flex w-fit justify-end gap-4 text-right">
              <Button
                variant="text"
                onClick={() => {
                  dispatch({
                    type: TASKTYPE.CLEAR_CHECK_BOX_SELEECTION,
                  });
                }}
              >
                <div className="">Cancel</div>
              </Button>
              {state.currentTab === 'upcoming' ||
              state.currentTab === 'overdue' ? (
                <Button
                  variant="primary"
                  disabled={(state.selectedCheckedModel ?? []).length == 0}
                  onClick={() => {
                    toggleMarkCompleteModel(!showMarkCompleteModel);
                  }}
                >
                  <div>
                    Complete ({(state.selectedCheckedModel ?? []).length})
                  </div>
                </Button>
              ) : (
                <Button
                  variant="danger"
                  disabled={(state.selectedCheckedModel ?? []).length == 0}
                  onClick={() => {
                    toggleDeleteModel(!showDeleteModel);
                  }}
                >
                  <div>
                    Delete ({(state.selectedCheckedModel ?? []).length})
                  </div>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      {showDeleteModel && (
        <CustomInfoModal
          doneValue={
            deleteManyTaskMutation.isLoading ? (
              <>
                <Loader />
              </>
            ) : (
              <>Delete</>
            )
          }
          handleClose={() => {
            toggleDeleteModel(!showDeleteModel);
          }}
          onDeleteButton={() => {
            deleteManyTaskMutation.mutate({
              axiosAuth,
              body: {
                ids:
                  (state.selectedCheckedModel ?? []).map((item) => item._id) ??
                  [],
              },
              adminMode,
            });
          }}
          subtitle="All pending tasks and upcoming tasks will be removed. This action cannot be undone."
          title={`Delete Task (${(state.selectedCheckedModel ?? []).length})`}
        />
      )}

      {showMarkCompleteModel && (
        <CustomModal
          isOpen={true}
          size="xl"
          handleCancel={(open: boolean) => {
            if (open === false) toggleMarkCompleteModel(false);
          }}
          customCancelHandler={() => toggleMarkCompleteModel(false)}
          handleSubmit={() => {
            // Only instances can be completed; exclude already submitted by current user and already completed tasks
            const currentUserId = session?.user?.user?._id;
            const ids = (state.selectedCheckedModel ?? [])
              .filter((t) => t?.isOrignal === false)
              .filter((t) => !hasCurrentUserSubmitted(t, currentUserId))
              .filter((t) => !isTaskCompleted(t))
              .map((t) => t._id);
            markAsCompleteMutation.mutate({
              axiosAuth,
              body: { ids },
              adminMode,
            });
          }}
          submitValue="Confirm"
          cancelButton="Cancel"
          cancelvariant="primaryOutLine"
          isLoading={markAsCompleteMutation.isLoading}
          header={
            <div className="flex min-w-0 items-start gap-3">
              <svg
                width="50"
                height="50"
                viewBox="0 0 50 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                <path
                  d="M37.7513 31.0419L27.5032 13.2446C27.2471 12.8086 26.8815 12.4471 26.4427 12.1959C26.0038 11.9446 25.5069 11.8125 25.0013 11.8125C24.4956 11.8125 23.9987 11.9446 23.5598 12.1959C23.121 12.4471 22.7554 12.8086 22.4993 13.2446L12.2513 31.0419C12.0049 31.4636 11.875 31.9433 11.875 32.4317C11.875 32.9202 12.0049 33.3998 12.2513 33.8216C12.5041 34.2602 12.869 34.6237 13.3087 34.8748C13.7484 35.1258 14.2469 35.2553 14.7532 35.2501H35.2493C35.7552 35.2549 36.2532 35.1252 36.6925 34.8742C37.1317 34.6231 37.4963 34.2599 37.7489 33.8216C37.9957 33.4 38.1259 32.9205 38.1263 32.432C38.1268 31.9436 37.9973 31.4638 37.7513 31.0419ZM36.1259 32.8829C36.0365 33.0353 35.9083 33.1612 35.7542 33.2477C35.6002 33.3342 35.4259 33.3781 35.2493 33.3751H14.7532C14.5766 33.3781 14.4023 33.3342 14.2483 33.2477C14.0942 33.1612 13.966 33.0353 13.8766 32.8829C13.7957 32.7459 13.753 32.5897 13.753 32.4305C13.753 32.2714 13.7957 32.1152 13.8766 31.9782L24.1247 14.1809C24.2158 14.0293 24.3447 13.9038 24.4987 13.8166C24.6527 13.7295 24.8266 13.6837 25.0036 13.6837C25.1806 13.6837 25.3545 13.7295 25.5085 13.8166C25.6625 13.9038 25.7914 14.0293 25.8825 14.1809L36.1306 31.9782C36.2108 32.1156 36.2526 32.2721 36.2518 32.4312C36.251 32.5903 36.2075 32.7463 36.1259 32.8829ZM24.0638 25.8751V21.1876C24.0638 20.9389 24.1625 20.7005 24.3383 20.5247C24.5142 20.3488 24.7526 20.2501 25.0013 20.2501C25.2499 20.2501 25.4884 20.3488 25.6642 20.5247C25.84 20.7005 25.9388 20.9389 25.9388 21.1876V25.8751C25.9388 26.1237 25.84 26.3622 25.6642 26.538C25.4884 26.7138 25.2499 26.8126 25.0013 26.8126C24.7526 26.8126 24.5142 26.7138 24.3383 26.538C24.1625 26.3622 24.0638 26.1237 24.0638 25.8751ZM26.4075 30.0938C26.4075 30.372 26.325 30.6438 26.1705 30.8751C26.016 31.1064 25.7964 31.2866 25.5394 31.393C25.2824 31.4995 24.9997 31.5273 24.7269 31.4731C24.4541 31.4188 24.2036 31.2849 24.0069 31.0882C23.8102 30.8915 23.6763 30.641 23.622 30.3682C23.5678 30.0954 23.5956 29.8126 23.7021 29.5557C23.8085 29.2987 23.9887 29.0791 24.22 28.9246C24.4512 28.7701 24.7231 28.6876 25.0013 28.6876C25.3742 28.6876 25.7319 28.8357 25.9956 29.0995C26.2593 29.3632 26.4075 29.7209 26.4075 30.0938Z"
                  fill="#0063F7"
                />
              </svg>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-[#1E1E1E]">
                  {`Mark (${(state.selectedCheckedModel ?? []).length}) Tasks as Complete`}
                </h2>
                <span className="mt-1 block text-base font-normal text-[#616161]">
                  {'Selected tasks will be marked as complete.'}
                </span>
              </div>
            </div>
          }
          body={<div className="py-2" />}
        />
      )}
      {/* filter model */}

      <CustomModal
        isOpen={showFilterModel}
        handleCancel={clearFilters}
        handleSubmit={handleApplyFilters}
        submitDisabled={!areFiltersApplied()}
        submitValue={'Apply'}
        cancelButton={'Reset'}
        cancelvariant={'primaryOutLine'}
        header={
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">Filter By</h2>
            <p className="mt-1 text-sm font-normal text-[#616161]">
              Filter by the following selections and options.
            </p>
          </div>
        }
        body={
          <div className="flex flex-col justify-start gap-8 pb-16 pt-5">
            <div className="w-full">
              <CustomSearchSelect
                label="Assigned Projects"
                data={[
                  {
                    label: 'All',
                    value: 'all',
                  },
                  ...(projects ?? []).map((project) => ({
                    label: project.name ?? '',
                    value: project._id ?? '',
                  })),
                ]}
                showImage={false}
                multiple={true}
                isOpen={openFilterDropdown === 'dropdown1'}
                onToggle={() => handleDropdown('dropdown1')}
                searchPlaceholder="Search Projects"
                onSelect={(selected: string[]) => setSelectedProjects(selected)}
                selected={selectedProjects}
                placeholder="-"
              />
            </div>
            <div className="w-full">
              <CustomSearchSelect
                label="Customer"
                data={[
                  {
                    label: 'My Organization',
                    value: 'My Organization',
                  },
                  ...(users ?? [])
                    .filter((user) => user.role === 4)
                    .map((user) => ({
                      label: `${user.firstName} ${user.lastName}`,
                      value: `${user.firstName} ${user.lastName}`,
                    })),
                ]}
                showImage={false}
                multiple={true}
                isOpen={openFilterDropdown === 'dropdown2'}
                onToggle={() => handleDropdown('dropdown2')}
                onSelect={(selected: string[]) => {
                  setSelectedCustomer(selected);
                }}
                placeholder="-"
                searchPlaceholder="Search Customers"
                selected={selectedCustomer}
              />
            </div>
            <div className="w-full">
              <DateRangePicker
                title="Date Created"
                handleOnConfirm={(from: Date, to: Date) => {}}
                selectedDate={undefined}
              />
            </div>
            <div className="w-full">
              <DateRangePicker
                title="Next Due Date Range"
                handleOnConfirm={(from: Date, to: Date) => {}}
                selectedDate={undefined}
              />
            </div>
            <div className="w-full">
              <CustomSearchSelect
                label="Filter By App"
                data={[
                  {
                    label: 'All',
                    value: 'all',
                  },
                  ...(apps ?? []).map((user) => ({
                    label: `${user.app.name}`,
                    value: user.app._id ?? '',
                  })),
                ]}
                showImage={false}
                multiple={true}
                isOpen={openFilterDropdown === 'dropdown3'}
                onToggle={() => handleDropdown('dropdown3')}
                onSelect={(selected: string[]) => {
                  setSelectedApps(selected);
                }}
                placeholder="-"
                searchPlaceholder="Search Users"
                selected={selectedApps}
              />
            </div>
            <div className="w-full">
              <CustomSearchSelect
                label="Task Sharing"
                data={[
                  {
                    label: 'All',
                    value: 'all',
                  },
                  {
                    label: 'Individual',
                    value: 'individual',
                  },
                  {
                    label: 'Shared',
                    value: 'shared',
                  },
                ]}
                showImage={false}
                multiple={true}
                isOpen={openFilterDropdown === 'dropdown4'}
                onToggle={() => handleDropdown('dropdown4')}
                onSelect={(selected: string[]) => {
                  setSelectedSharedTask(selected);
                }}
                placeholder="-"
                searchPlaceholder="Search Users"
                selected={selectedSharedTask}
              />
            </div>
            <div className="w-full">
              <CustomSearchSelect
                label="Created By User"
                data={[
                  {
                    label: 'All',
                    value: 'all',
                  },
                  ...(users ?? [])
                    .filter((us) => us.role === 2)
                    .map((user) => ({
                      label: `${user.firstName} ${user.lastName}`,
                      value: user._id ?? '',
                    })),
                ]}
                showImage={false}
                multiple={true}
                isOpen={openFilterDropdown === 'dropdown5'}
                onToggle={() => handleDropdown('dropdown5')}
                onSelect={(selected: string[]) => {
                  setSelectedUsers(selected);
                }}
                placeholder="-"
                searchPlaceholder="Search Users"
                selected={selectedUsers}
              />
            </div>
            <SimpleInput
              type="text"
              label="Task Name"
              placeholder="Enter Task Name"
              name="name"
              className="w-full"
              value={taskName}
              onChange={(e) => {
                setTaskName(e.target.value);
              }}
            />
          </div>
        }
      />
    </section>
  );
}
