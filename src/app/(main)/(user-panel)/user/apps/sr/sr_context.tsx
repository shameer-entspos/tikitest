import { SRAppAction } from "@/app/helpers/user/actions";
import { APPACTIONTYPE, SR_APP_ACTION_TYPE } from "@/app/helpers/user/enums";
import { SRAppState } from "@/app/helpers/user/states";
import { Dispatch, createContext, useContext } from "react";

export interface SRAppContextProps {
  state: SRAppState;
  dispatch: Dispatch<SRAppAction>;
}

export const initialSRAppState: SRAppState = {
  selectedSettingTab: "Notifications",
  selectedSettingTabKioskMode: "Default Settings",
  createNewRollCall: "project",
  showRollCallForm: false,
  reviewPublicStatusEditable: false,
  reviewStatus: "public",
  showEditRollCallForm:false,
  srDetailSelectedTab: "overview",
};

const initialSRContext: SRAppContextProps = {
  state: {
    selectedSettingTab: "Notifications",
    selectedSettingTabKioskMode: "Default Settings",
    createNewRollCall: "project",
    showRollCallForm: false,
    reviewPublicStatusEditable: false,
    reviewStatus: "public",
  showEditRollCallForm:false,

    srDetailSelectedTab: "overview",
  },
  dispatch: () => {},
};
export const SRAppContext = createContext<SRAppContextProps>(initialSRContext);
export const SRAppReducer = (
  state: SRAppState,
  action: SRAppAction
): SRAppState => {
  switch (action.type) {
    case SR_APP_ACTION_TYPE.SHOWPAGES:
      return { ...state, showPages: action.showPages };

    case SR_APP_ACTION_TYPE.APP_ID:
      return { ...state, sr_app_id: action.sr_app_id };
    case SR_APP_ACTION_TYPE.SETTING_TAB:
      return { ...state, selectedSettingTab: action.selectedSettingTab };
      case SR_APP_ACTION_TYPE.SR_DATE_RANGE:
        return { ...state, srDetailDate: action.srDetailDate };
    
    case SR_APP_ACTION_TYPE.SR_DETAIL_SELECTED_TAB:
      return { ...state, srDetailSelectedTab: action.srDetailSelectedTab };
    case SR_APP_ACTION_TYPE.SETTING_TAB_KIOSK_MODE:
      return {
        ...state,
        selectedSettingTabKioskMode: action.selectedSettingTabKioskMode,
      };
      
    case SR_APP_ACTION_TYPE.ROLL_CALL_DETAIL:
      return { ...state, roll_call_detail: action.roll_call_detail };
    case SR_APP_ACTION_TYPE.SHOW_ROLL_CALL_FORM:
      return {
        ...state,
        showRollCallForm: !state.showRollCallForm,
        createNewRollCall: "project",
      };
      case SR_APP_ACTION_TYPE.SHOW_ROLL_CALL_FORM_EDIT:
      return {
        ...state,
        showEditRollCallForm: !state.showEditRollCallForm,
        createNewRollCall: "review",
        SRSelectedProjects:(action.roll_call_edit?.projects??[]).map((pr)=>{
          return {
              id:pr._id??'',
              name:pr.name??""
          }
        }),
        SRSelectedSites:(action.roll_call_edit?.sites??[]).map((pr)=>{
          return {
              id:pr._id??'',
              siteName:pr.siteName
          }
        }),
        roll_call_detail:{
          id:action.roll_call_edit?._id,
          title:action.roll_call_edit?.title??"",
          description:action.roll_call_edit?.description??''
        },
        selected_roll_call_user:(action.roll_call_edit?.users??[]).map((u)=>{
          return {
            id:u._id,
            email:u.email,
            firstName:u.firstName,
            lastName:u.lastName,
            phone:u.phone
          }
        }),
        reviewPublicStatusEditable:action.roll_call_edit?.publicReviewEditable,
        reviewStatus:action.roll_call_edit?.reviewStatus

      };
    case SR_APP_ACTION_TYPE.CREATE_NEW_ROLL:
      return { ...state, createNewRollCall: action.createNewRollCall };
    case SR_APP_ACTION_TYPE.REVIEW_STATUS_EDITABLE:
      return {
        ...state,
        reviewPublicStatusEditable: !state.reviewPublicStatusEditable,
      };
    case SR_APP_ACTION_TYPE.REVIEW_STATUS_TOGGLE:
      return { ...state, reviewStatus: action.reviewStatus };
    case SR_APP_ACTION_TYPE.SELECT_PROJECT:
      if (
        state.SRSelectedProjects?.some(
          (p) => p.id === action.SRSelectedProjects?.id
        )
      ) {
        return {
          ...state,
          SRSelectedProjects: state.SRSelectedProjects?.filter(
            (user) => user.id !== action.SRSelectedProjects?.id
          ),
        };
      } else {
        return {
          ...state,
          SRSelectedProjects: [
            ...(state.SRSelectedProjects ?? []),
            action.SRSelectedProjects!,
          ],
        };
      }
    case SR_APP_ACTION_TYPE.SELECT_SITE:
      if (
        state.SRSelectedSites?.some((p) => p.id === action.SRSelectedSites?.id)
      ) {
        return {
          ...state,
          SRSelectedSites: state.SRSelectedSites?.filter(
            (user) => user.id !== action.SRSelectedSites?.id
          ),
        };
      } else {
        return {
          ...state,
          SRSelectedSites: [
            ...(state.SRSelectedSites ?? []),
            action.SRSelectedSites!,
          ],
        };
      }

    case SR_APP_ACTION_TYPE.SELECT_ROLL_CALL_USER:
      if (
        state.selected_roll_call_user?.some(
          (p) => p.email === action.selected_roll_call_user?.email
        )
      ) {
        return {
          ...state,
          selected_roll_call_user: state.selected_roll_call_user?.filter(
            (user) => user.email !== action.selected_roll_call_user?.email
          ),
        };
      } else {
        return {
          ...state,
          selected_roll_call_user: [
            ...(state.selected_roll_call_user ?? []),
            action.selected_roll_call_user!,
          ],
        };
      }
    default:
      throw new Error(`Unknown action type ${action.type}`);
  }
};

export function useSRAppCotnext() {
  const context = useContext(SRAppContext);
  if (!context) {
    throw "error";
  }
  return context;
}
