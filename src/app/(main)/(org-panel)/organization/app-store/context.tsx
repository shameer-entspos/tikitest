import { AppStoreActions } from "@/app/helpers/organization/actions";
import { APPSTORETYPE } from "@/app/helpers/organization/enums";
import { AppStoreState } from "@/app/helpers/organization/states";
import { Dispatch, createContext, useContext } from "react";





export interface AppStoreContextProps {
    state: AppStoreState;
    dispatch: Dispatch<AppStoreActions>;
}

export const initialAppStoretate: AppStoreState = {
    showModel: 'install',
    showAppModel: false
};


const initialContext: AppStoreContextProps = {
    state: {
        showModel: 'install',
        showAppModel: false

    },
    dispatch: () => { },
};

export const AppStoreContext = createContext<AppStoreContextProps>(initialContext);
export const appStoreReducer = (
    state: AppStoreState,
    action: AppStoreActions
): AppStoreState => {

    switch (action.type) {
        case APPSTORETYPE.TOGGLE:
            return { showAppModel: !state.showAppModel, appStoreModel: action.appStoreModel };
        case APPSTORETYPE.SHOWMODEL:
            return { showModel: action.showModel };
        case APPSTORETYPE.AFTERADDINGAPP:
            return { showAppModel: !state.showAppModel, showModel: 'install' };
        default:
            throw new Error('Unknown action type');
    }
};

export function useAppStoreCotnext() {
    const context = useContext(AppStoreContext);
    if (!context) {
        throw 'error';
    }
    return context;
}