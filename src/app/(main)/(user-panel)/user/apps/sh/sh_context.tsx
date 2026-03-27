import { SafetyHubActions } from '@/app/helpers/user/actions';
import { SAFETYHUBTYPE } from '@/app/helpers/user/enums';
import { SafetyHubState } from '@/app/helpers/user/states';
import { DiscussionTopic } from '@/app/type/discussion_topic';
import { Dispatch, createContext, useContext } from 'react';

// Define the context properties interface
export interface SafetyHubAppContextProps {
  state: SafetyHubState;
  dispatch: Dispatch<SafetyHubActions>;
}

// Initial state for the Asset Manager
export const initialSafetyHubAppState: SafetyHubState = {
  showPages: undefined,
  selectedSettingTab: 'Notifications',
  showNewHazardsIncident: false,
  reviewPublicStatusEditable: false,
  reviewStatus: 'public',
};

// Initial context value
const initialSafetyHubContext: SafetyHubAppContextProps = {
  state: initialSafetyHubAppState,
  dispatch: () => {}, // Placeholder for the dispatch function
};

// Create the context
export const SafetyHubAppContext = createContext<SafetyHubAppContextProps>(
  initialSafetyHubContext
);

// Define the reducer function
export const SafetyHubReducer = (
  state: SafetyHubState,
  action: SafetyHubActions
): SafetyHubState => {
  switch (action.type) {
    case SAFETYHUBTYPE.SHOWPAGES:
      return {
        ...state,
        showPages: action.showPages,
      };
    case SAFETYHUBTYPE.SHOW_HAZARD_INCIDENT_CREATE_MODEL:
      return {
        ...state,
        showNewHazardsIncident: !state.showNewHazardsIncident,
        hazardAndIncidentModelForEdit: action.hazardAndIncidentModelForEdit,
        selectedImages: action.hazardAndIncidentModelForEdit?.images ?? [],
      };
    case SAFETYHUBTYPE.SELECTED_IMAGES:
      if (state.selectedImages?.includes(action.selectedImages!)) {
        return {
          ...state,
          selectedImages: state.selectedImages?.filter(
            (url) => url !== action.selectedImages
          ),
        };
      } else {
        return {
          ...state,
          selectedImages: [
            ...(state.selectedImages ?? []),
            action.selectedImages!,
          ],
        };
      }
    case SAFETYHUBTYPE.SM_IMAGES:
      if (state.smImages?.includes(action.smImages!)) {
        return {
          ...state,
          smImages: state.smImages?.filter((url) => url !== action.smImages),
        };
      } else {
        return {
          ...state,
          smImages: [...(state.smImages ?? []), action.smImages!],
        };
      }
    case SAFETYHUBTYPE.ASSIGN_APP_ID:
      return { ...state, appId: action.appId };
    case SAFETYHUBTYPE.SHOW_SAFETY_MEETING_CREATE_MODEL:
      return {
        ...state,
        show_safety_meeting_create_model:
          action.show_safety_meeting_create_model,
      };
    case SAFETYHUBTYPE.CLEAR_SAFETY_MEETING_CREATE_MODEL:
      return {
        ...state,
        show_safety_meeting_create_model: undefined,
        SMSelectedProjects: undefined,
        selected_topic: undefined,
        selected_attendence: undefined,
        meeting_payload: undefined,
        reviewStatus: 'public',
        reviewPublicStatusEditable: false,
        selected_safety_meeting_model: undefined,
      };
    case SAFETYHUBTYPE.SHOW_SAFETY_MEETING_CREATE_MODEL_EDIT:
      return {
        ...state,
        show_safety_meeting_create_model: 'review',
        selected_safety_meeting_model: action.selected_safety_meeting_model,
        selected_topic: action.selected_safety_meeting_model?.topics ?? [],
        selected_attendence:
          action.selected_safety_meeting_model?.attendance ?? [],
        reviewStatus:
          action.selected_safety_meeting_model?.viewStatus == 'public'
            ? 'public'
            : 'private',
        reviewPublicStatusEditable:
          action.selected_safety_meeting_model?.allowPublicToEdit ?? false,
        meeting_payload: {
          name: action.selected_safety_meeting_model?.name ?? '',
          agenda: action.selected_safety_meeting_model?.agenda ?? '',

          leader: action.selected_safety_meeting_model?.leader,
        },
        SMSelectedProjects: (
          action.selected_safety_meeting_model?.projects ?? []
        ).flatMap((p) => {
          return {
            name: p.name ?? '',
            id: p._id ?? '',
          };
        }),
      };
    case SAFETYHUBTYPE.SELECT_VIA_CHAT:
      return { ...state, select_via_chat: action.select_via_chat };
    case SAFETYHUBTYPE.SELECT_VIA_EMAIL:
      return { ...state, select_via_email: action.select_via_email };
    case SAFETYHUBTYPE.SELECT_PROJECT:
      if (
        state.SMSelectedProjects?.some(
          (p) => p.id === action.SMSelectedProjects?.id
        )
      ) {
        return {
          ...state,
          SMSelectedProjects: state.SMSelectedProjects?.filter(
            (user) => user.id !== action.SMSelectedProjects?.id
          ),
        };
      } else {
        return {
          ...state,
          SMSelectedProjects: [
            ...(state.SMSelectedProjects ?? []),
            action.SMSelectedProjects!,
          ],
        };
      }

    case SAFETYHUBTYPE.SELECTED_SETTING_TAB:
      return { ...state, selectedSettingTab: action.selectedSettingTab };

    case SAFETYHUBTYPE.SELECT_TOPIC:
      if (
        state.selected_topic?.some((p) => p._id === action.selected_topic?._id)
      ) {
        return {
          ...state,
          selected_topic: state.selected_topic?.filter(
            (user) => user._id !== action.selected_topic?._id
          ),
        };
      } else {
        return {
          ...state,
          selected_topic: [
            ...(state.selected_topic ?? []),
            action.selected_topic!,
          ],
        };
      }
    case SAFETYHUBTYPE.SELECT_ATTENDENCE:
      if (
        state.selected_attendence?.some(
          (p) => p._id === action.selected_attendence?._id
        )
      ) {
        return {
          ...state,
          selected_attendence: state.selected_attendence?.filter(
            (user) => user._id !== action.selected_attendence?._id
          ),
        };
      } else {
        return {
          ...state,
          selected_attendence: [
            ...(state.selected_attendence ?? []),
            action.selected_attendence!,
          ],
        };
      }
    case SAFETYHUBTYPE.UPDATE_MEETING_PAYLOAD:
      return { ...state, meeting_payload: action.meeting_payload };
    case SAFETYHUBTYPE.UPDATE_RESOLUTION:
      return {
        ...state,
        selected_topic: (state.selected_topic as DiscussionTopic[]).map(
          (topic) =>
            topic._id === action.resolutionPayload?.id
              ? { ...topic, resolution: action.resolutionPayload.resolution }
              : topic
        ),
      };
    case SAFETYHUBTYPE.UPDATE_TOPIC_CLOSE:
      return {
        ...state,
        selected_topic: (state.selected_topic as DiscussionTopic[]).map(
          (topic) =>
            topic._id === action.topciStatusPayload?.id
              ? { ...topic, status: action.topciStatusPayload.status }
              : topic
        ),
      };
    case SAFETYHUBTYPE.REVIEW_STATUS_EDITABLE:
      return {
        ...state,
        reviewPublicStatusEditable: !state.reviewPublicStatusEditable,
      };
    case SAFETYHUBTYPE.REVIEW_STATUS_TOGGLE:
      return { ...state, reviewStatus: action.reviewStatus };
    default:
      throw new Error('Unknown action type: ' + action.type);
  }
};

// Custom hook to use the Asset Manager context
export function useSafetyHubContext() {
  const context = useContext(SafetyHubAppContext);
  if (!context) {
    throw new Error(
      'useSafetyHubAppContext must be used within an SafetyHubAppContextProvider'
    );
  }
  return context;
}
