import { Button } from '../Buttons';
import { useEffect, useReducer, useState } from 'react';
import {
  TaskContext,
  TaskContextProps,
  taskinitialState,
  taskReducer,
} from '@/app/(main)/(user-panel)/user/tasks/context';
import { TaskView } from '../Tasks/TaskView';
import { useSession } from 'next-auth/react';
import {
  hasCurrentUserSubmitted,
  isTaskCompleted,
  TaskModel,
} from '@/app/(main)/(user-panel)/user/tasks/api';
import { TASKTYPE } from '@/app/helpers/user/enums';
import { TaskDetail } from '../Tasks/TaskDetail';
import { TaskRemove } from '../Tasks/TaskRemove';
import { NewTaskModel } from '../Tasks/NewTaskModel';
import { TasKMembers } from '../Tasks/NewTaskModel/Task_Members';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { ProjectDetail } from '@/app/type/projects';
import { AppDispatch, RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { checkDateIsDue, formatDateTimeWithLabels } from '@/utils';
import { useTikiPagination } from '@/hooks/usePagination';
import { handleAddTaskModel } from '@/store/taskSlice';
import { CustomSearchSelect } from '../TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import DateRangePicker from '../JobSafetyAnalysis/CreateNewComponents/JSA_Calender';
import FilterButton from '../TimeSheetApp/CommonComponents/FilterButton/FilterButton';
import CustomModal from '../Custom_Modal';
import { SimpleInput } from '../Form/simpleInput';
const getAppLogo = ({ logoType }: { logoType: string }) => {
  switch (logoType) {
    case 'SR':
      return '/svg/sr/logo.svg';

    case 'JSA':
      return '/svg/jsa/logo.svg';

    case 'TS':
      return '/svg/timesheet_app/logo.svg';

    case 'AM':
      return '/svg/asset_manager/logo.svg';

    case 'SH':
      return '/svg/sh/logo.svg';

    default:
      return '/task_logo.svg';
  }
};

export function TasksTab({
  overview,
  projectDetail,
}: {
  overview: boolean;
  projectDetail: ProjectDetail | undefined;
}) {
  const modelType = useSelector((state: RootState) => state.task.addTaskModel);
  const { data: session } = useSession();
  const [state, dispatch] = useReducer(taskReducer, taskinitialState);

  const contextValue: TaskContextProps = {
    state,
    dispatch,
  };
  const reduxDispatch = useDispatch<AppDispatch>();
  const [searchIndividual, setSearchIndividual] = useState('');
  const [showFilterModel, setShowFilterModel] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string>('');
  const [filterTaskName, setFilterTaskName] = useState<string>('');
  const [filterShareAs, setFilterShareAs] = useState<string>('all');
  const [filterCreatedBy, setFilterCreatedBy] = useState<string[]>([]);
  const [filterApps, setFilterApps] = useState<string[]>([]);
  const [filterDueRange, setFilterDueRange] = useState<
    { from: Date; to: Date } | undefined
  >(undefined);
  // Applied filter values (used for actual filtering) – only update when user clicks Apply
  const [appliedFilterTaskName, setAppliedFilterTaskName] =
    useState<string>('');
  const [appliedFilterShareAs, setAppliedFilterShareAs] =
    useState<string>('all');
  const [appliedFilterCreatedBy, setAppliedFilterCreatedBy] = useState<
    string[]
  >([]);
  const [appliedFilterApps, setAppliedFilterApps] = useState<string[]>([]);
  const [appliedFilterDueRange, setAppliedFilterDueRange] = useState<
    { from: Date; to: Date } | undefined
  >(undefined);
  const handleDropdown = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? '' : dropdownId);
  };
  // When opening the filter modal, sync draft form values from currently applied filters
  useEffect(() => {
    if (showFilterModel) {
      setFilterTaskName(appliedFilterTaskName);
      setFilterShareAs(appliedFilterShareAs);
      setFilterCreatedBy(
        (appliedFilterCreatedBy?.length ?? 0) > 0
          ? appliedFilterCreatedBy
          : ['all']
      );
      setFilterApps(
        (appliedFilterApps?.length ?? 0) > 0 ? appliedFilterApps : ['all']
      );
      setFilterDueRange(appliedFilterDueRange ?? undefined);
    }
  }, [showFilterModel]);
  const allTasks = projectDetail?.tasks ?? [];
  const createdByOptions = Array.from(
    new Set(allTasks.map((t) => t.userId?._id).filter(Boolean))
  ).map((id) => {
    const u = allTasks.find((t) => t.userId?._id === id)?.userId;
    return {
      value: id as string,
      label: `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim(),
    };
  });
  const appOptions = Array.from(
    new Set(allTasks.map((t) => t.app?.name).filter(Boolean))
  ).map((name) => ({ value: name as string, label: name as string }));

  const currentUserId = (session?.user as any)?.user?._id;
  // Use applied filter values (only updated when user clicks Apply); show only pending tasks (per shareAs completion)
  var filterTasks =
    (allTasks ?? [])
      .filter((e: TaskModel) => !isTaskCompleted(e))
      .filter((e: TaskModel) => !hasCurrentUserSubmitted(e, currentUserId))
      .filter((e: TaskModel) =>
        `${e?.name}`.toLowerCase().includes(searchIndividual.toLowerCase())
      )
      .filter((t: TaskModel) => {
        if (!appliedFilterTaskName.trim()) return true;
        return (t.name ?? '')
          .toLowerCase()
          .includes(appliedFilterTaskName.toLowerCase());
      })
      .filter((t: TaskModel) => {
        if (appliedFilterShareAs === 'all') return true;
        return (
          (t.shareAs ?? '').toLowerCase() === appliedFilterShareAs.toLowerCase()
        );
      })
      .filter((t: TaskModel) => {
        if (
          (appliedFilterCreatedBy ?? []).length === 0 ||
          appliedFilterCreatedBy.includes('all')
        )
          return true;
        const uid = t.userId?._id ?? '';
        return (appliedFilterCreatedBy ?? []).includes(uid);
      })
      .filter((t: TaskModel) => {
        if (
          (appliedFilterApps ?? []).length === 0 ||
          appliedFilterApps.includes('all')
        )
          return true;
        const name = t.app?.name ?? '';
        return (appliedFilterApps ?? []).includes(name);
      })
      .filter((t: TaskModel) => {
        if (!appliedFilterDueRange?.from || !appliedFilterDueRange?.to)
          return true;
        const due = t.dueDate ? new Date(t.dueDate) : undefined;
        if (!due) return false;
        return (
          due >= appliedFilterDueRange.from && due <= appliedFilterDueRange.to
        );
      }) ?? [];
  const {
    currentPage,
    totalPages,
    paginatedItems,
    itemsPerPage,
    handlePageChange,
  } = useTikiPagination(filterTasks ?? [], 50);
  return (
    <>
      <TaskContext.Provider value={contextValue}>
        {state.showTaskModal === 'detail' && <TaskDetail />}
        {state.showTaskModal === 'view' && <TaskView isOpen={true} />}
        {state.showRemove && <TaskRemove />}
        {modelType == 'detail' && (
          <NewTaskModel projectDetail={projectDetail} />
        )}
        {modelType == 'members' && (
          <TasKMembers
            handleCancel={() => {
              reduxDispatch(handleAddTaskModel('detail'));
            }}
          />
        )}
        <div
          className={`my-2 ${overview ? 'h-[550px] px-8 py-4' : 'h-[calc(var(--app-vh)_-_402px)] overflow-y-scroll'} rounded-2xl scrollbar-hide`}
          style={{
            boxShadow: `${overview ? '0px 2px 8px 0px #00000033' : ''}`,
          }}
        >
          {overview && <h1 className="mt-3 font-semibold">Pending Tasks</h1>}

          <table className="mt-0 min-w-full md:mt-4">
            <thead className="flex h-[44px] space-x-2">
              <tr className="grid w-full grid-cols-8 items-center justify-between rounded-md bg-gray-100 px-4">
                <th className="col-span-5 text-left text-sm font-semibold text-gray-600">
                  Task Name
                </th>
                <th className="text-center text-sm font-semibold text-gray-600">
                  Task Sharing
                </th>
                <th className="text-center text-sm font-semibold text-gray-600">
                  Due Date
                </th>
                <th className="text-right text-sm font-semibold text-gray-600">
                  {/* Empty space for the "Action" buttons */}
                </th>
              </tr>
              <FilterButton
                isApplyFilter={
                  !!appliedFilterTaskName ||
                  appliedFilterShareAs !== 'all' ||
                  (appliedFilterCreatedBy?.length ?? 0) > 0 ||
                  (appliedFilterApps?.length ?? 0) > 0 ||
                  !!appliedFilterDueRange
                }
                setShowModel={setShowFilterModel}
                showModel={showFilterModel}
                setOpenDropdown={setOpenDropdown}
                clearFilters={() => {
                  setFilterTaskName('');
                  setFilterShareAs('all');
                  setFilterCreatedBy(['all']);
                  setFilterApps(['all']);
                  setFilterDueRange(undefined);
                  setAppliedFilterTaskName('');
                  setAppliedFilterShareAs('all');
                  setAppliedFilterCreatedBy([]);
                  setAppliedFilterApps([]);
                  setAppliedFilterDueRange(undefined);
                }}
              />
            </thead>

            <div className="py-1" />
            <tbody
              className={`${overview ? 'max-h-[520px] space-y-2 overflow-auto' : 'max-h-[500px] space-y-2 overflow-auto'}`}
            >
              {(!overview
                ? (paginatedItems ?? [])
                : ((paginatedItems ?? []).slice(0, 5) ?? [])
              ).map((task) => {
                const isOverdue = checkDateIsDue(task.dueDate);
                const isToday =
                  formatDateTimeWithLabels(task.dueDate ?? '')?.date ===
                  'Today';
                return (
                  <tr
                    key={task._id}
                    className="grid grid-cols-7 items-center justify-between rounded-xl border-2 bg-white px-3 py-2"
                  >
                    <td className="col-span-4 flex items-center gap-4">
                      <img
                        src={getAppLogo({ logoType: task.app?.type })}
                        alt="logo"
                        className="h-11 w-11 sm:h-12 sm:w-12"
                      />
                      <div className="truncate">
                        <h1 className="text-sm font-semibold md:text-base">
                          {task.name}
                        </h1>
                        <p className="text-xs text-gray-500 md:text-sm">
                          {task.description}
                        </p>
                      </div>
                    </td>

                    <td className="text-center text-sm font-semibold text-gray-500">
                      {task.shareAs}
                    </td>

                    <td className="text-center">
                      <p
                        className={`text-sm ${isOverdue ? 'text-red-400' : isToday ? 'text-primary-500' : 'text-[#616161]'}`}
                      >
                        {isOverdue
                          ? 'Overdue'
                          : formatDateTimeWithLabels(task.dueDate ?? '')
                              ?.date || ''}
                      </p>
                    </td>

                    <td className="text-right">
                      <button
                        onClick={() => {
                          dispatch({
                            type: TASKTYPE.SHOWTASKMODAL,
                            showTaskModal: 'detail',
                            taskModel: task,
                          });
                        }}
                        className={`h-[30px] w-[78px] rounded-full text-sm ${
                          isOverdue || isToday
                            ? 'bg-primary-500'
                            : 'bg-gray-600'
                        } text-white`}
                      >
                        Start
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* projects pagination */}
        </div>
        {!overview && (
          <>
            <div className="flex h-[105px] items-center justify-end">
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
          </>
        )}
        {/* Filter Modal */}
        <CustomModal
          isOpen={showFilterModel}
          header={
            <div className="flex flex-col gap-1 px-1 py-2">
              <h2 className="text-xl font-semibold text-[#1E1E1E]">
                Filter By
              </h2>
              <span className="text-sm font-normal text-[#616161]">
                Filter by the following selections and options
              </span>
            </div>
          }
          handleCancel={() => {
            setShowFilterModel(false);
          }}
          handleSubmit={() => {
            setAppliedFilterTaskName(filterTaskName);
            setAppliedFilterShareAs(filterShareAs);
            setAppliedFilterCreatedBy(filterCreatedBy ?? []);
            setAppliedFilterApps(filterApps ?? []);
            setAppliedFilterDueRange(filterDueRange ?? undefined);
            setShowFilterModel(false);
          }}
          submitValue={'Apply'}
          body={
            <>
              <CustomSearchSelect
                label="Task Sharing"
                data={[
                  { value: 'all', label: 'All' },
                  { value: 'Public', label: 'Public' },
                  { value: 'Private', label: 'Private' },
                ]}
                showImage={false}
                multiple={false}
                isOpen={openDropdown === 'dropdownShare'}
                onToggle={() => handleDropdown('dropdownShare')}
                onSelect={(selected: string[]) => setFilterShareAs(selected[0])}
                selected={[filterShareAs]}
                showSearch={false}
              />

              <CustomSearchSelect
                label="Created By"
                data={[{ value: 'all', label: 'All' }, ...createdByOptions]}
                showImage={false}
                multiple={true}
                isOpen={openDropdown === 'dropdownCreated'}
                onToggle={() => handleDropdown('dropdownCreated')}
                onSelect={(selected: string[]) => setFilterCreatedBy(selected)}
                selected={
                  (filterCreatedBy?.length ?? 0) > 0 ? filterCreatedBy : ['all']
                }
                showSearch={false}
              />

              <CustomSearchSelect
                label="Filter By App"
                data={[{ value: 'all', label: 'All Apps' }, ...appOptions]}
                showImage={false}
                multiple={true}
                isOpen={openDropdown === 'dropdownApp'}
                onToggle={() => handleDropdown('dropdownApp')}
                onSelect={(selected: string[]) => setFilterApps(selected)}
                selected={(filterApps?.length ?? 0) > 0 ? filterApps : ['all']}
                showSearch={false}
              />

              <div className="relative">
                <DateRangePicker
                  title={'Due Date Range'}
                  isForFilter={true}
                  selectedDate={filterDueRange}
                  handleOnConfirm={(from: any, to: any) =>
                    setFilterDueRange({ from, to })
                  }
                />
              </div>
              <div className="relative">
                <SimpleInput
                  label="Task Name"
                  placeholder="Enter name"
                  type="text"
                  name={'filterTaskName'}
                  className="w-full"
                  value={filterTaskName}
                  onChange={(e: any) => setFilterTaskName(e.target.value)}
                />
              </div>
            </>
          }
        />

        {!overview && (
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
            <div className="hidden md:block"></div>
          </div>
        )}
      </TaskContext.Provider>
    </>
  );
}
