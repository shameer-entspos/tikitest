import { TaskActions } from '@/app/helpers/user/actions';
import { TASKTYPE } from '@/app/helpers/user/enums';
import { TaskState } from '@/app/helpers/user/states';
import { Dispatch, createContext, useContext } from 'react';
import { format } from 'date-fns';
export interface TaskContextProps {
  state: TaskState;
  dispatch: Dispatch<TaskActions>;
}
export const taskinitialState: TaskState = {
  currentTab: 'upcoming',

  curretnSection: 'task',
  selectBulk: false,

  showRemove: false,
  audit: false,
  formType: 'visitor',
  showProject: 'all',
  isShowForEdit: false,
};

const initialContext: TaskContextProps = {
  state: {
    currentTab: 'upcoming',

    isShowForEdit: false,
    curretnSection: 'task',
    selectBulk: false,
    showRemove: false,
    audit: false,
    formType: 'visitor',
    showProject: 'all',
  },
  dispatch: () => {},
};

export const TaskContext = createContext<TaskContextProps>(initialContext);

export const taskReducer = (
  state: TaskState,
  action: TaskActions
): TaskState => {
  switch (action.type) {
    case TASKTYPE.TABCHANGE:
      return {
        ...state,
        currentTab: action.currentTab,
        selectedCheckedModel: [],
        isMultiSelectEnabled: false,
      };
    case TASKTYPE.SHOWREMOVE:
      return {
        ...state,
        showRemove: !state.showRemove,
        removeid: action.removeid,
        showTaskModal: undefined,
      };
    case TASKTYPE.SHOWTASKMODAL:
      return {
        ...state,
        showTaskModal: action.showTaskModal,
        taskModel: action.taskModel,
        formType: 'visitor',
        showProject: 'all',
        projectId: undefined,

        showSignIn: undefined,
        userId: undefined,
        formPayload: undefined,
      };
    case TASKTYPE.SELECT_IMAGE:
      return { ...state, selectedSelfie: action.selectedSelfie };
    case TASKTYPE.SHOW_SIGN_IN_MODEL:
      return { ...state, showSignIn: action.showSignIn };
    case TASKTYPE.CHAGNEFORMTYPE:
      return { ...state, formType: action.formType };
    case TASKTYPE.SIGN_IN_AS:
      return { ...state, signAs: action.signAs };
    case TASKTYPE.FORMPAYLOAD:
      return {
        ...state,
        formPayload: action.formPayload,
        showSignIn: action.showSignIn,
      };
    case TASKTYPE.CHANGE_PROJECT_TAB:
      return { ...state, showProject: action.showProject };

    case TASKTYPE.SHOW_EDIT_SECTION:
      return {
        ...state,
        isShowForEdit: true,
        taskModel: action.taskModel,
        selectValueOfCustomList: action.taskModel?.repeatTask,
        selectedCountOfRepeat: action.taskModel?.repeatCount,
        monthType: action.taskModel?.monthCount?.type as 'Day' | 'Week',
        selectDaysForWeek: action.taskModel?.weekCount.dayNumber,
        weekNumOfMonth: action.taskModel?.monthCount?.weekNumber,
        DayNumOfWeekOfMonth: action.taskModel?.monthCount?.weekDayNumber,
        dayNumOfMonth: action.taskModel?.monthCount?.dayNumber,
        payload: {
          name: action.taskModel?.name ?? '',
          description: action.taskModel?.description ?? '',
          projects: (action.taskModel?.projects ?? []).map(
            (project) => project._id ?? ''
          ),
          isGeneral:
            (action.taskModel?.projects ?? []).some(
              (p: { isGeneral?: boolean }) => p.isGeneral
            ) ?? false,
          selectedProjectsDetail: action.taskModel?.projects ?? [],
          endDate: action.taskModel?.endDate ?? '',
          shareAs: action.taskModel?.shareAs ?? 'individual',
          app: action.taskModel?.app?._id,
          customer: Array.isArray(action.taskModel?.customer)
            ? (action.taskModel?.customer[0] ?? '')
            : (action.taskModel?.customer ?? ''),
          startDate: action.taskModel?.startDate
            ? new Date(action.taskModel.startDate)
            : undefined,
          repeatTaskCheckbox:
            action.taskModel?.repeatTask == 'No' ? false : true,
        },
        repeatTaskDueDate: action.taskModel?.repeatTaskEndDate
          ? new Date(action.taskModel?.repeatTaskEndDate)
          : undefined,
        repeatTask: action.taskModel?.repeatTask,

        // apps: action.taskModel?.app[0]._id,
        // projects: (action.taskModel?.projects ?? []).map(
        //   (project) => project._id
        // ),
        teams: action.taskModel?.teams,
        assignedUserIds: (() => {
          const t = action.taskModel as any;
          if (t?.users?.length) {
            return (t.users ?? []).map((id: any) =>
              typeof id === 'string' ? id : id?._id ?? ''
            ).filter(Boolean);
          }
          const ids = new Set<string>();
          [...(t?.individualUsers ?? []).map(String), ...(t?.teamMembers ?? []).map((id: any) => typeof id === 'string' ? id : id?._id ?? ''), ...(t?.external ?? []).map(String)].forEach((id) => id && ids.add(id));
          return Array.from(ids);
        })(),
        externalUser: undefined,
        audit: action.taskModel?.isAudit,
        // dueDate: format(new Date(action.taskModel?.dueDate ?? 0), "yyyy-MM-dd"),
        dueDate: new Date(action.taskModel?.dueDate ?? new Date()),

        repeatTaskHasDueDate: action.taskModel?.repeatTaskEndDate
          ? 'Custom'
          : 'when project ends',
      };

    case TASKTYPE.SHOWNEWTASKMODAL:
      return {
        ...state,

        isShowForEdit: false,

        selectValueOfCustomList: 'Day',
        selectedCountOfRepeat: 1,
        monthType: 'Day',

        dayNumOfMonth: 1,
        payload: undefined,
        repeatTaskDueDate: undefined,
        repeatTask: undefined,

        assignedUserIds: undefined,
        individualUsers: undefined,
        teams: undefined,
        excludedUserIds: undefined,
        externalUser: undefined,
        audit: false,
        repeatTaskHasDueDate: undefined,
      };

    case TASKTYPE.FORMUPDATE:
      return { ...state, payload: action.payload };
    case TASKTYPE.SELECTDUEDATE:
      return { ...state, dueDate: action.dueDate, payload: action.payload };
    case TASKTYPE.SELECTREPEATDATE:
      return { ...state, repeatTask: action.repeatTask };
    case TASKTYPE.SELECTREPEATTASKDATE:
      return {
        ...state,
        repeatTaskDueDate: action.repeatTaskDueDate,
        repeatTaskHasDueDate: action.repeatTaskHasDueDate,
      };
    case TASKTYPE.AUDITCHANGE:
      return { ...state, audit: !state.audit };

    case TASKTYPE.CURRETNSECTION:
      return {
        ...state,
        curretnSection: action.curretnSection,
      };
    case TASKTYPE.BULKTOGGLE:
      return { ...state, selectBulk: !state.selectBulk };
    // extenal
    case TASKTYPE.SELECT_ORG:
      return {
        ...state,
        externalUser: [...(state.externalUser ?? []), action.externalUser!],
      };
    case TASKTYPE.DESELECT_ORG:
      return {
        ...state,
        externalUser: state.externalUser?.filter(
          (eu) => eu !== action.externalUser
        ),
      };
    // team
    case TASKTYPE.SELECT_TEAM:
      return {
        ...state,
        teams: [...(state.teams ?? []), action.teams!],
      };
    case TASKTYPE.DESELECT_TEAM:
      return {
        ...state,
        teams: state.teams?.filter((t) => t !== action.teams),
      };
    //individual user
    case TASKTYPE.SELECT_USER:
      return {
        ...state,
        individualUsers: [
          ...(state.individualUsers ?? []),
          action.individualUsers!,
        ],
      };
    case TASKTYPE.DESELECT_USER:
      return {
        ...state,
        individualUsers: state.individualUsers?.filter(
          (iu) => iu !== action.individualUsers
        ),
      };
    case TASKTYPE.TOGGLE_EXCLUDED_USER:
      if (!action.excludedUserIds) return state;
      const uid = action.excludedUserIds[0];
      if (!uid) return state;
      const excluded = state.excludedUserIds ?? [];
      const has = excluded.includes(uid);
      return {
        ...state,
        excludedUserIds: has
          ? excluded.filter((id) => id !== uid)
          : [...excluded, uid],
      };
    case TASKTYPE.SET_EXCLUDED_USERS:
      return {
        ...state,
        excludedUserIds: action.excludedUserIds ?? [],
      };
    case TASKTYPE.SET_ASSIGNED_USERS:
      return {
        ...state,
        assignedUserIds: action.assignedUserIds ?? [],
      };
    case TASKTYPE.TOGGLE_ASSIGNED_USER:
      if (!action.assignedUserIds?.length) return state;
      const aid = action.assignedUserIds[0];
      const assigned = state.assignedUserIds ?? [];
      const hasA = assigned.includes(aid);
      return {
        ...state,
        assignedUserIds: hasA
          ? assigned.filter((id) => id !== aid)
          : [...assigned, aid],
      };
    case TASKTYPE.ADD_ASSIGNED_USERS:
      if (!action.assignedUserIds?.length) return state;
      const addSet = new Set(state.assignedUserIds ?? []);
      action.assignedUserIds.forEach((id) => addSet.add(id));
      return { ...state, assignedUserIds: Array.from(addSet) };
    case TASKTYPE.REMOVE_ASSIGNED_USERS:
      if (!action.assignedUserIds?.length) return state;
      const removeSet = new Set(action.assignedUserIds);
      return {
        ...state,
        assignedUserIds: (state.assignedUserIds ?? []).filter((id) => !removeSet.has(id)),
      };
    case TASKTYPE.SHOW_CUSTOM_PICKER:
      return { ...state, showCustomPicker: !state.showCustomPicker };

    ///TASK DETAILS
    case TASKTYPE.SELECTED_DAY:
      return {
        ...state,
        selectValueOfCustomList: action.selectValueOfCustomList,
      };
    case TASKTYPE.SET_COUNT:
      return {
        ...state,
        selectedCountOfRepeat: action.selectedCountOfRepeat,
      };
    case TASKTYPE.SELECT_MONTH_TYPE:
      return {
        ...state,
        monthType: action.monthType,
      };
    case TASKTYPE.SELECT_MONTH_DAY:
      return {
        ...state,
        dayNumOfMonth: action.dayNumOfMonth,
      };
    case TASKTYPE.SELECT_MONTH_WEEK:
      return {
        ...state,
        weekNumOfMonth: action.weekNumOfMonth,
      };
    case TASKTYPE.SELECT_MONTH_WEEK_DAY:
      return {
        ...state,
        DayNumOfWeekOfMonth: action.DayNumOfWeekOfMonth,
      };
    case TASKTYPE.SELECT_WEEK_DAY:
      return {
        ...state,
        selectDaysForWeek: [
          ...(state.selectDaysForWeek ?? []),
          action.selectDaysForWeek!,
        ],
      };
    case TASKTYPE.DESELECT_WEEK_DAY:
      const newList = (state.selectDaysForWeek ?? []).filter(
        (day) => day != action.selectDaysForWeek
      );
      return {
        ...state,
        selectDaysForWeek: newList,
      };
    // task project list
    // project
    case TASKTYPE.SELECT_TASK_PROJECT:
      return {
        ...state,
        projectId: [...(state.projectId ?? []), action.projectId!],
      };
    case TASKTYPE.DESELECT_TASK_PROJECT:
      return {
        ...state,
        projectId: state.projectId?.filter((org) => org !== action.projectId),
      };
    // task users sign in section
    case TASKTYPE.SELECT_TASK_USER:
      return {
        ...state,
        userId: [...(state.userId ?? []), action.userId!],
      };
    case TASKTYPE.DESELECT_TASK_USER:
      return {
        ...state,
        userId: state.userId?.filter((u) => u !== action.userId),
      };
    case TASKTYPE.SELECT_BULK_TASK:
      return {
        ...state,
        buikId: [...(state.buikId ?? []), action.buikId!],
      };
    case TASKTYPE.DESELECT_BULK_TASK:
      return {
        ...state,
        buikId: state.buikId?.filter((b) => b !== action.buikId),
      };
    case TASKTYPE.UPDATE_SELECTED_DATE:
      return {
        ...state,
        dueDate: action.dueDate,
      };
    case TASKTYPE.CHECK_BOX_SELECT_ALL:
      return {
        ...state,
        selectedCheckedModel: [
          ...(state.selectedCheckedModel ?? []),
          action.selectedCheckedModel!,
        ],
      };

    case TASKTYPE.CHECK_BOX_SELECTION:
      if (
        (state.selectedCheckedModel ?? []).some(
          (selectedTs) => selectedTs._id === action.selectedCheckedModel?._id
        )
      ) {
        return {
          ...state,
          selectedCheckedModel: (state.selectedCheckedModel ?? []).filter(
            (selectedTs) => selectedTs._id !== action.selectedCheckedModel?._id
          ),
        };
      } else {
        return {
          ...state,
          selectedCheckedModel: [
            ...(state.selectedCheckedModel ?? []),
            action.selectedCheckedModel!,
          ],
        };
      }

    case TASKTYPE.CLEAR_CHECK_BOX_SELEECTION:
      return {
        ...state,
        selectedCheckedModel: [],
        isMultiSelectEnabled: false,
      };

    case TASKTYPE.IS_MULTI_SELECT_ENABLED:
      return {
        ...state,
        isMultiSelectEnabled: !state.isMultiSelectEnabled,
      };
    default:
      throw new Error('Unknown action type');
  }
};

export function useTaskCotnext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw 'error';
  }
  return context;
}
