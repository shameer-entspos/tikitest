import { JSAAppActions } from '@/app/helpers/user/actions';
import { JSAAPPACTIONTYPE } from '@/app/helpers/user/enums';
import { JSAAppState } from '@/app/helpers/user/states';
import { Dispatch, createContext, useContext } from 'react';

export interface JSAAppContextProps {
  state: JSAAppState;
  dispatch: Dispatch<JSAAppActions>;
}

export const initialJSAAppState: JSAAppState = {
  showPPESafetyGear: false,
  showHazard: false,
  showDraft: false,
  showProjects: 'AllProjects',
  showSubmission: false,
  showTemplate: false,
  showModal: undefined,
  selectedItem: undefined,
  createNewSection: 'project',
  jsaDetailSelectedTab: 'overview',
  steps: [
    {
      description: '',
      Hazards: [],
      PPEs: [],
    },
  ],
  reviewStatus: 'public',
  reviewPublicStatusEditable: false,
  saveAsDraft: false,
  saveAsTemplate: false,
  saveTemplateType: 'my',
  isTemplateEditable: false,
  selectLocationForDuplicate: 'Submission',
  selectedSettingTab: 'Notifications',
};

const initialJSAContext: JSAAppContextProps = {
  state: {
    showPPESafetyGear: false,
    showHazard: false,
    showDraft: false,
    showProjects: 'AllProjects',
    showSubmission: false,
    showTemplate: false,
    selectedItem: undefined,
    createNewSection: 'project',
    jsaDetailSelectedTab: 'overview',
    steps: [
      {
        description: '',
        Hazards: [],
        PPEs: [],
      },
    ],
    reviewStatus: 'public',
    reviewPublicStatusEditable: false,
    saveAsDraft: false,
    saveAsTemplate: false,
    isTemplateEditable: false,
    saveTemplateType: 'my',
    selectLocationForDuplicate: 'Submission',
    selectedSettingTab: 'Notifications',
  },
  dispatch: () => {},
};
export const JSAAppContext =
  createContext<JSAAppContextProps>(initialJSAContext);
export const JSAappsReducer = (
  state: JSAAppState,
  action: JSAAppActions
): JSAAppState => {
  switch (action.type) {
    case JSAAPPACTIONTYPE.SHOWPPESAFETY:
      return { ...state, showPPESafetyGear: !state.showPPESafetyGear };
    case JSAAPPACTIONTYPE.SHOWHAZARD:
      return { ...state, showHazard: !state.showHazard };
    case JSAAPPACTIONTYPE.SHOW_SUBMISSION_DELTE_MODEL:
      return {
        ...state,
        showSubmissionDeleteModel: action.showSubmissionDeleteModel,
      };
    case JSAAPPACTIONTYPE.SHOW_MULTI_SUBMISSION_DELTE_MODEL:
      return {
        ...state,
        showMultiSubmissionDeleteModal: action.showMultiSubmissionDeleteModel,
      };

    case JSAAPPACTIONTYPE.SHOW_PPE_DELTE_MODEL:
      return {
        ...state,
        showPPEDeleteModel: action.showPPEDeleteModel,
      };
    case JSAAPPACTIONTYPE.SHOW_MULTI_PPE_DELTE_MODEL:
      return {
        ...state,
        showMultiPPEDeleteModal: action.showMultiPPEDeleteModel,
      };

    case JSAAPPACTIONTYPE.SHOW_HAZARDS_DELTE_MODEL:
      return {
        ...state,
        showHazardsDeleteModel: action.showHazardsDeleteModel,
      };
    case JSAAPPACTIONTYPE.SHOW_MULTI_HAZARDS_DELTE_MODEL:
      return {
        ...state,
        showMultiHazardsDeleteModal: action.showMultiHazardsDeleteModal,
      };

    case JSAAPPACTIONTYPE.SHOW_DUPLICATE_MODEL:
      return {
        ...state,
        showDuplicateModel: action.showDuplicateModel,
        selectLocationForDuplicate: 'Submission',
      };
    case JSAAPPACTIONTYPE.SET_APPID:
      return {
        ...state,
        jsaAppId: action.jsaAppId, // Update state with the new appid
      };
    case JSAAPPACTIONTYPE.SHOW_CAHT_MODEL:
      return { ...state, showChatModel: action.showChatModel };
    case JSAAPPACTIONTYPE.SHOW_MAIL_SUBMISSION_MODEL:
      return {
        ...state,
        showMailSubmissionModel: action.showMailSubmissionModel,
        contentRef: action.contentRef,
      };
    case JSAAPPACTIONTYPE.SHOWDRAFT:
      return { ...state, showDraft: !state.showDraft };
    case JSAAPPACTIONTYPE.SAVE_AS_DRAFT:
      return { ...state, saveAsDraft: !state.saveAsDraft };
    case JSAAPPACTIONTYPE.SAVE_AS_TEMPLATE:
      return { ...state, saveAsTemplate: !state.saveAsTemplate };
    case JSAAPPACTIONTYPE.SAVE_TEMPLATE_TYPE:
      return { ...state, saveTemplateType: action.saveTemplateType };
    case JSAAPPACTIONTYPE.SAVE_TEMPLATE_NAME:
      return { ...state, saveTemplateName: action.saveTemplateName };
    case JSAAPPACTIONTYPE.TOGGLE_DUPLICATE_LOCATION:
      return {
        ...state,
        selectLocationForDuplicate: action.selectLocationForDuplicate,
      };
    case JSAAPPACTIONTYPE.SHOWSUBMISSION:
      return { ...state, showSubmission: !state.showSubmission };
    case JSAAPPACTIONTYPE.SHOWTEMPLATE:
      return { ...state, showTemplate: !state.showTemplate };
    case JSAAPPACTIONTYPE.IS_TEMPALTE_EDITABLE:
      return { ...state, isTemplateEditable: !state.isTemplateEditable };
    case JSAAPPACTIONTYPE.SHOWPAGES:
      return {
        ...state,
        showPages: action.showPages,
        showDetailPayload: action.showDetailPayload,
      };
    case JSAAPPACTIONTYPE.CLOSE_PAGES:
      return {
        ...state,
        showPages: action.showPages,
        jsaSelectedProjects: [],
        hazards: [],
        ppe: [],
        steps: [
          {
            description: '',
            Hazards: [],
            PPEs: [],
          },
        ],
        jsaCreateDetailPayload: undefined,
        createNewSection: 'project',
        jsaDetailSelectedTab: 'overview',
        reviewStatus: 'public',
        reviewPublicStatusEditable: false,
        jsaEmergencyPlanPayLoad: undefined,
        editSubmission: undefined,
        jsaEmergencyPlanImages: [],
        jsaDetailSelectedManagers: [],
        saveAsDraft: false,
        saveAsTemplate: false,
        saveTemplateType: 'my',
        saveTemplateName: undefined,
      };

    case JSAAPPACTIONTYPE.SHOW_SUBMISSION_EDIT:
      const app = action.editSubmission;

      return {
        ...state,
        editSubmission: action.editSubmission,
        jsaCreateDetailPayload: {
          contactName: app?.contactName ?? '',
          description: app?.scopeDescription ?? '',
          jsaName: app?.name ?? '',
          phone: app?.phone.toString() ?? '',
          reference: app?.reference ?? '',
          customer: app?.selectedContact ?? '',
        },
        jsaSelectedProjects: (app?.projectIds ?? []).map((proj) => {
          return {
            id: proj._id,
            name: proj.name,
          };
        }),
        jsaDetailDate: {
          from: new Date(app?.rangeDate.startDate ?? new Date()) ?? new Date(),
          to: new Date(app?.rangeDate.endDate ?? new Date()) ?? new Date(),
        },
        jsaEmergencyPlanPayLoad: {
          area: app?.evacuationArea ?? '',
          jsaEmergencyPlanContacts: app?.emergencyContact ?? [],
          procedure: app?.evacuationProcedure ?? '',
        },
        // jsaDetailContact: {
        //   _id: app?.selectedContact._id ?? '',
        //   email: app?.selectedContact.email ?? '',
        //   firstName: app?.selectedContact.firstName ?? '',
        //   lastName: app?.selectedContact.lastName ?? '',
        //   photo: app?.selectedContact.photo ?? '',
        // },
        jsaDetailSelectedManagers: app?.managers ?? [],
        jsaEmergencyPlanImages: app?.images ?? [],
        reviewStatus: app?.sharing == 2 ? 'public' : 'private',
        reviewPublicStatusEditable: app?.allowEdit ?? false,
        steps: app?.steps ?? [],
        showPages: 'createNew',
        createNewSection: 'review',
        isTemplateEditable: app?.isTemplateEditable,
        saveTemplateName: app?.templateName,
        saveTemplateType: app?.templateSharing == 1 ? 'my' : 'shared',
        saveAsTemplate: app?.isTemplate,
      };

    case JSAAPPACTIONTYPE.USE_TEMPLATE:
      const templateDetail = action.editSubmission;
      return {
        ...state,
        usingTemplateId: templateDetail?._id,
        jsaCreateDetailPayload: {
          contactName: templateDetail?.contactName ?? '',
          description: templateDetail?.scopeDescription ?? '',
          jsaName: templateDetail?.name ?? '',
          phone: templateDetail?.phone.toString() ?? '',
          reference: templateDetail?.reference ?? '',
          customer: templateDetail?.contactName ?? '',
        },
        jsaSelectedProjects: (templateDetail?.projectIds ?? []).map((proj) => {
          return {
            id: proj._id,
            name: proj.name,
          };
        }),
        jsaDetailDate: {
          from:
            new Date(templateDetail?.rangeDate.startDate ?? new Date()) ??
            new Date(),
          to:
            new Date(templateDetail?.rangeDate.endDate ?? new Date()) ??
            new Date(),
        },
        jsaEmergencyPlanPayLoad: {
          area: templateDetail?.evacuationArea ?? '',
          jsaEmergencyPlanContacts: templateDetail?.emergencyContact ?? [],
          procedure: templateDetail?.evacuationProcedure ?? '',
        },
        // jsaDetailContact: {
        //   _id: templateDetail?.selectedContact._id ?? '',
        //   email: templateDetail?.selectedContact.email ?? '',
        //   firstName: templateDetail?.selectedContact.firstName ?? '',
        //   lastName: templateDetail?.selectedContact.lastName ?? '',
        //   photo: templateDetail?.selectedContact.photo ?? '',
        // },
        jsaDetailSelectedManagers: templateDetail?.managers ?? [],
        jsaEmergencyPlanImages: templateDetail?.images ?? [],
        reviewStatus: templateDetail?.sharing == 2 ? 'public' : 'private',
        reviewPublicStatusEditable: templateDetail?.allowEdit ?? false,
        steps: templateDetail?.steps ?? [],
        showPages: 'createNew',
        createNewSection: 'review',
      };
    case JSAAPPACTIONTYPE.SHOWMODAL:
      return { ...state, showModal: action.showModal };
    case JSAAPPACTIONTYPE.SETITEM:
      return { ...state, selectedItem: action.payLoad };
    case JSAAPPACTIONTYPE.CREATENEWSECTION:
      return { ...state, createNewSection: action.createNewSection };
    case JSAAPPACTIONTYPE.JSADETAILSELECTEDTAB:
      return { ...state, jsaDetailSelectedTab: action.jsaDetailSelectedTab };

    case JSAAPPACTIONTYPE.TOGGLE_JSA_PROJECT_SELECTION:
      if (!action.jsaSelectedProjects) {
        return state;
      }

      const selectedIndex = state.jsaSelectedProjects?.findIndex(
        (project) => project.id === action.jsaSelectedProjects?.id
      );

      if (selectedIndex! >= 0) {
        return {
          ...state,
          jsaSelectedProjects: state.jsaSelectedProjects?.filter(
            (project) => project.id !== action.jsaSelectedProjects?.id
          ),
        };
      } else {
        return {
          ...state,
          jsaSelectedProjects: [
            ...(state.jsaSelectedProjects ?? []),
            action.jsaSelectedProjects!,
          ],
        };
      }

    case JSAAPPACTIONTYPE.JSA_CREATE_DETAIL:
      return {
        ...state,
        jsaCreateDetailPayload: action.jsaCreateDetailPayload,
        createNewSection: 'step',
      };
    case JSAAPPACTIONTYPE.JSA_DETAIL_DATE:
      return { ...state, jsaDetailDate: action.jsaDetailDate };
    case JSAAPPACTIONTYPE.JSA_LAST_MODIFIED_DATE:
      return { ...state, jsaLastModifiedDate: action.jsaLastModifiedDate };
    // case JSAAPPACTIONTYPE.JSA_DETAIL_CONTACT:
    //   return { ...state, jsaDetailContact: action.jsaDetailContact };
    case JSAAPPACTIONTYPE.TOGGLE_JSA_CREATE_DETAIL_MANAGER_SELECTION:
      // Type guard: ensure jsaDetailSelectedManagers is a single object, not an array
      if (!action.jsaDetailSelectedManagers || Array.isArray(action.jsaDetailSelectedManagers)) {
        return state;
      }
      const managerToToggle = action.jsaDetailSelectedManagers;
      if (
        state.jsaDetailSelectedManagers?.some(
          (u) => u.email === managerToToggle.email
        )
      ) {
        return {
          ...state,
          jsaDetailSelectedManagers: state.jsaDetailSelectedManagers?.filter(
            (user) => user.email !== managerToToggle.email
          ),
        };
      } else {
        return {
          ...state,
          jsaDetailSelectedManagers: [
            ...(state.jsaDetailSelectedManagers ?? []),
            managerToToggle,
          ],
        };
      }
    case JSAAPPACTIONTYPE.JSA_EMERGENCY_IMAGE:
      if (
        state.jsaEmergencyPlanImages?.includes(action.jsaEmergencyPlanImages!)
      ) {
        return {
          ...state,
          jsaEmergencyPlanImages: state.jsaEmergencyPlanImages?.filter(
            (url) => url !== action.jsaEmergencyPlanImages
          ),
        };
      } else {
        return {
          ...state,
          jsaEmergencyPlanImages: [
            ...(state.jsaEmergencyPlanImages ?? []),
            action.jsaEmergencyPlanImages!,
          ],
        };
      }
    case JSAAPPACTIONTYPE.JSA_STEP_PAYLOAD:
      return {
        ...state,
        steps: action.jsaSteps,
        createNewSection: 'emergency',
      };
    case JSAAPPACTIONTYPE.ADD_JSA_STEP:
      return { ...state, steps: [...(state.steps ?? []), action.steps!] };
    case JSAAPPACTIONTYPE.REMOVE_JSA_STEP:
      const filterList = (state.steps ?? []).filter((_, index) => {
        console.log('Checking index:', index);
        return index !== action.stepIndex!;
      });
      return { ...state, steps: filterList };
    case JSAAPPACTIONTYPE.JSA_EMERGENCY_PLAN:
      return {
        ...state,
        jsaEmergencyPlanPayLoad: action.jsaEmergencyPlanPayLoad,
        createNewSection: 'review',
      };

    case JSAAPPACTIONTYPE.REVIEW_STATUS_EDITABLE:
      return {
        ...state,
        reviewPublicStatusEditable: !state.reviewPublicStatusEditable,
      };
    case JSAAPPACTIONTYPE.REVIEW_STATUS_TOGGLE:
      return { ...state, reviewStatus: action.reviewStatus };
    case JSAAPPACTIONTYPE.SELECTED_SETTING_TAB:
      return { ...state, selectedSettingTab: action.selectedSettingTab };
    case JSAAPPACTIONTYPE.SET_JSA_DETAIL_MANAGERS:
      // Normalize to array: if it's already an array, use it; if it's a single object, wrap it in an array
      const managersArray = Array.isArray(action.jsaDetailSelectedManagers)
        ? action.jsaDetailSelectedManagers
        : action.jsaDetailSelectedManagers
          ? [action.jsaDetailSelectedManagers]
          : [];
      return {
        ...state,
        jsaDetailSelectedManagers: managersArray,
      };
    default:
      // console.log(state,action);
      throw new Error('Unknown action type' + action.type);
  }
};

export function useJSAAppsCotnext() {
  const context = useContext(JSAAppContext);
  if (!context) {
    throw 'error';
  }
  return context;
}
