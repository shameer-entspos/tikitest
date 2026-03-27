import { TimeSheetActions } from "@/app/helpers/user/actions";
import { TIMESHEETTYPE } from "@/app/helpers/user/enums";
import { TimeSheetState } from "@/app/helpers/user/states";
import { Dispatch, createContext, useContext } from "react";

export interface TimeSheetAppContextProps {
  state: TimeSheetState;
  dispatch: Dispatch<TimeSheetActions>;
}

export const initialTimeSheetAppState: TimeSheetState = {
  showNewExpense: false,
  selectedSettingTab: "Notifications",
};

const initialTimeSheetContext: TimeSheetAppContextProps = {
  state: {
    showNewExpense: false,
    selectedSettingTab: "Notifications",
  },
  dispatch: () => {},
};
export const TimeSheetAppContext = createContext<TimeSheetAppContextProps>(
  initialTimeSheetContext
);
export const TimeSheetAppsReducer = (
  state: TimeSheetState,
  action: TimeSheetActions
): TimeSheetState => {
  switch (action.type) {
    case TIMESHEETTYPE.SHOWPAGES:
      return {
        ...state,
        showPages: action.showPages,
        reportPages: undefined,
        reviewPages: undefined,
      };
    case TIMESHEETTYPE.REPORT_PAGES:
      return { ...state, reportPages: action.reportPages };
    case TIMESHEETTYPE.REVIEW_PAGES:
      return { ...state, reviewPages: action.reviewPages };
    case TIMESHEETTYPE.ASSIGN_APP_ID:
      return { ...state, appId: action.appId };
    case TIMESHEETTYPE.NEW_EXPENSE:
      return { ...state, showNewExpense: !state.showNewExpense };

    case TIMESHEETTYPE.SELECTED_TIMESHEET:
      return { ...state, selectedTimeSheet: action.selectedTimeSheet };
    case TIMESHEETTYPE.SELECTED_SETTING_TAB:
      return { ...state, selectedSettingTab: action.selectedSettingTab };
    case TIMESHEETTYPE.TIMESHEET_REPORTS:
      return { ...state, timesheetReports: action.timesheetReports };
    case TIMESHEETTYPE.EXPENSE_REPORTS:
      return { ...state, expenseReports: action.expenseReports };
    case TIMESHEETTYPE.SELECTED_EXPANSE:
      return {
        ...state,
        selectedExpanse: action.selectedExpanse,
        expenseImages: action.selectedExpanse?.model?.images ?? [],
      };
    case TIMESHEETTYPE.SELECT_IMAGE:
      if (state.expenseImages?.includes(action.expenseImages!)) {
        return {
          ...state,
          expenseImages: state.expenseImages?.filter(
            (url) => url !== action.expenseImages
          ),
        };
      } else {
        return {
          ...state,
          expenseImages: [
            ...(state.expenseImages ?? []),
            action.expenseImages!,
          ],
        };
      }
    case TIMESHEETTYPE.TS_DETAIL_DATE:
      return { ...state, timesheetDetailDate: action.timesheetDetailDate };

    default:
      // console.log(state,action);
      throw new Error("Unknown action type" + action.type);
  }
};

export function useTimeSheetAppsCotnext() {
  const context = useContext(TimeSheetAppContext);
  if (!context) {
    throw "error";
  }
  return context;
}
