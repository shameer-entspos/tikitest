import { UserActions } from "@/app/helpers/organization/actions";
import { ACTIONTYPE } from "@/app/helpers/organization/enums";
import { UserState } from "@/app/helpers/organization/states";

import { Dispatch, createContext, useContext } from "react";

export interface UserContextProps {
  state: UserState;
  dispatch: Dispatch<UserActions>;
}

export const initialState: UserState = {
  showUserModel: false,
  selectedUser: undefined,
  isVisiting: false,
};

const initialContext: UserContextProps = {
  state: { showUserModel: false, isVisiting: false },
  dispatch: () => {},
};
export const UserContext = createContext<UserContextProps>(initialContext);

export const usersReducer = (
  state: UserState,
  action: UserActions,
): UserState => {
  switch (action.type) {
    case ACTIONTYPE.TOGGLE:
      return { showUserModel: !state.showUserModel };
    case ACTIONTYPE.EDIT:
      return {
        showUserModel: !state.showUserModel,
        selectedUser: action.userPayload!,
      };
    case ACTIONTYPE.VISIBLE:
      return {
        ...state,
        isVisiting: action.isVisiting,
      };
    default:
      throw new Error("Unknown action type");
  }
};

export function useAppCotnext() {
  const context = useContext(UserContext);
  if (!context) {
    throw "error";
  }
  return context;
}
