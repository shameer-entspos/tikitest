import { AppActions } from "@/app/helpers/user/actions";
import { APPACTIONTYPE } from "@/app/helpers/user/enums";
import { AppState } from "@/app/helpers/user/states";
import { Dispatch, createContext, useContext } from "react";

export interface AppContextProps {
    state: AppState;
    dispatch: Dispatch<AppActions>;
}

export const initialAppState: AppState = {
    showSignInModel: false,
    formType: 'contractor',
    showProject: 'starred'
};

const initialContext: AppContextProps = {
    state: {
        showSignInModel: false,
        formType: 'contractor',
        showProject: 'starred',
        showJsaPage: false,
    },
    dispatch: () => { },
};
export const AppContext = createContext<AppContextProps>(initialContext);
export const appsReducer = (
    state: AppState,
    action: AppActions
): AppState => {

    switch (action.type) {

        /// old data
        case APPACTIONTYPE.TOGGLE_JSAPAGE:
            return { ...state, showJsaPage: !state.showJsaPage, appModel: action.appModel };
        case APPACTIONTYPE.TOGGLE:
            return { showSignInModel: !state.showSignInModel, appModel: action.appModel };
        case APPACTIONTYPE.SIGNAS:
            return { ...state, signAs: action.signAs };
        case APPACTIONTYPE.CHANGESHOWMODEL:
            return { ...state, showForm: action.showForm };
        case APPACTIONTYPE.PAYLOAD:
            return { ...state, payload: action.payload, showForm: action.showForm }
        case APPACTIONTYPE.CHAGNEFORMTYPE:
            return { ...state, formType: action.formType };
        case APPACTIONTYPE.SELECT_IMAGE:
            return { ...state, selectedSelfie: action.selectedSelfie };
        case APPACTIONTYPE.SHOW_PROJECT:
            return { ...state, showProject: action.showProject };
        case APPACTIONTYPE.SELECT_PROJECT:
            return {
                ...state,
                projectId: [...(state.projectId ?? []), action.projectId!],
            };
        case APPACTIONTYPE.DESELECT_PROJECT:
            return {
                ...state,
                projectId: state.projectId?.filter(
                    (project) => project !== action.projectId
                ),
            };


        case APPACTIONTYPE.SELECT_USER:
            return {
                ...state,
                userId: [...(state.userId ?? []), action.userid!],
            };
        case APPACTIONTYPE.DESELECT_USER:

            return {
                ...state,
                userId: state.userId?.filter(
                    (id) => id !== action.userid
                ),
            };



        ///signout section
        case APPACTIONTYPE.SELECT_SIGNOUT_USER:
            return {
                ...state,
                signoutUsers: [...(state.signoutUsers ?? []), action.signoutUsers!],
            };
        case APPACTIONTYPE.DESELECT_SIGNOUT_USER:

            return {
                ...state,
                signoutUsers: state.signoutUsers?.filter(
                    (id) => id !== action.signoutUsers
                ),
            };

        case APPACTIONTYPE.TOGGLE_SUBMITSUBMISSION:
            return { ...state, showSubmitAppDetail: !state.showSubmitAppDetail, submitAppDetail: action.submitAppDetail }

        default:

            throw new Error(`Unknown action type ${action.type}`);
    }
};

export function useAppsCotnext() {
    const context = useContext(AppContext);
    if (!context) {
        throw 'error';
    }
    return context;
}