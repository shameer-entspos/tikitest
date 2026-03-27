import { AssetManagerActions } from "@/app/helpers/user/actions"; // Import your actions interface
import { AMAPPACTIONTYPE } from "@/app/helpers/user/enums"; // Import your action types enum
import { AssetManagerState } from "@/app/helpers/user/states"; // Import your state type
import { Dispatch, createContext, useContext } from "react";

// Define the context properties interface
export interface AssetManagerAppContextProps {
  state: AssetManagerState;
  dispatch: Dispatch<AssetManagerActions>;
}

// Initial state for the Asset Manager
export const initialAssetManagerAppState: AssetManagerState = {
  selectedSettingTab: "Notifications",
  amDetailSelectedTab: "overview",
};

// Initial context value
const initialAssetManagerContext: AssetManagerAppContextProps = {
  state: initialAssetManagerAppState,
  dispatch: () => {},
};

// Create the context
export const AssetManagerAppContext =
  createContext<AssetManagerAppContextProps>(initialAssetManagerContext);

// Define the reducer function
export const AssetManagerAppsReducer = (
  state: AssetManagerState,
  action: AssetManagerActions
): AssetManagerState => {
  switch (action.type) {
    case AMAPPACTIONTYPE.SHOWPAGES:
      return {
        ...state,
        showPages: action.showPages,
        checkinoutPages: undefined,
        servicingPages: undefined,
      };
    case AMAPPACTIONTYPE.ASSET_IMAGES:
      // If assetsImages is an array, set it directly
      if (Array.isArray(action.assetsImages)) {
        return {
          ...state,
          assetsImages: action.assetsImages,
        };
      }
      // If assetsImages is a string, use toggle logic
      if (typeof action.assetsImages === 'string') {
        if (state.assetsImages?.includes(action.assetsImages)) {
          return {
            ...state,
            assetsImages: state.assetsImages?.filter(
              (url) => url !== action.assetsImages
            ),
          };
        } else {
          return {
            ...state,
            assetsImages: [...(state.assetsImages ?? []), action.assetsImages],
          };
        }
      }
      return state;
    case AMAPPACTIONTYPE.BULK_CHECK_IN_OUT:
      return { ...state, bulkcheckInOut: action.bulkcheckInOut };
    case AMAPPACTIONTYPE.SELECT_IMAGE:
      // Clear all images if logImages is null or undefined
      if (action.logImages === null || action.logImages === undefined) {
        return {
          ...state,
          logImages: [],
        };
      }
      // Toggle individual image
      if (state.logImages?.includes(action.logImages)) {
        return {
          ...state,
          logImages: state.logImages?.filter((url) => url !== action.logImages),
        };
      } else {
        return {
          ...state,
          logImages: [...(state.logImages ?? []), action.logImages],
        };
      }
    case AMAPPACTIONTYPE.ASSIGN_APP_ID:
      return { ...state, appId: action.appId };
    case AMAPPACTIONTYPE.SR_DETAIL_SELECTED_TAB:
      return { ...state, amDetailSelectedTab: action.amDetailSelectedTab };
    case AMAPPACTIONTYPE.SHOW_ASSET_CREATE_MODEL:
      // If closing the modal (no show_asset_create_model value), clear form state
      if (!action.show_asset_create_model) {
        return {
          ...state,
          show_asset_create_model: undefined,
          create_asset_payload: undefined,
          assetsImages: [],
          is_asset_edit: undefined,
        };
      }
      // If opening the detail form (new asset), clear previous form data
      if (action.show_asset_create_model === 'detail' && !state.is_asset_edit) {
        return {
          ...state,
          show_asset_create_model: action.show_asset_create_model,
          create_asset_payload: undefined,
          assetsImages: [],
        };
      }
      return {
        ...state,
        show_asset_create_model: action.show_asset_create_model,
      };
    case AMAPPACTIONTYPE.CREATE_ASSET_PAYLOAD:
      return { ...state, create_asset_payload: action.create_asset_payload };
    case AMAPPACTIONTYPE.SHOW_ASSET_EDIT_MODEL:
      return {
        ...state,
        create_asset_payload: action.create_asset_payload,
        show_asset_create_model: "review",
        is_asset_edit: action.is_asset_edit,
        assetsImages: action.forEditassetsImages,
      };
    case AMAPPACTIONTYPE.SELECTED_SETTING_TAB:
      return { ...state, selectedSettingTab: action.selectedSettingTab };
    case AMAPPACTIONTYPE.SELECT_VIA_EMAIL:
      return { ...state, select_via_email: action.select_via_email };

    default:
      throw new Error("Unknown action type: " + action.type);
  }
};

// Custom hook to use the Asset Manager context
export function useAssetManagerAppsContext() {
  const context = useContext(AssetManagerAppContext);
  if (!context) {
    throw new Error(
      "useAssetManagerAppsContext must be used within an AssetManagerAppProvider"
    );
  }
  return context;
}
