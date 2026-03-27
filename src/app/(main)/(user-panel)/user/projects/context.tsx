import { ProjectActions } from '@/app/helpers/user/actions';
import { PROJECTACTIONTYPE } from '@/app/helpers/user/enums';
import { ProjectState } from '@/app/helpers/user/states';
import { Dispatch, createContext, useContext } from 'react';

export interface ProjectContextProps {
  state: ProjectState;
  dispatch: Dispatch<ProjectActions>;
}
export const projectinitialState: ProjectState = {
  showCurrentModal: 'details',
  showProjectModal: false,

  projectType: 'private',
  color: '#EB8357',
};

const initialContext: ProjectContextProps = {
  state: {
    showCurrentModal: 'details',
    showProjectModal: false,
    projectType: 'private',
    color: '#EB8357',
  },
  dispatch: () => {},
};

export const ProjectContext =
  createContext<ProjectContextProps>(initialContext);

export const projectReducer = (
  state: ProjectState,
  action: ProjectActions
): ProjectState => {
  switch (action.type) {
    case PROJECTACTIONTYPE.TOGGLE:
      return {
        color: '#EB8357',
        projectType: 'private',
        showProjectModal: !state.showProjectModal,
        showCurrentModal: action.currentSection,

        isProjectEditing: false,
      };
    case PROJECTACTIONTYPE.EDITTOGGLE:
      return {
        ...state,
        isProjectEditing: !state.isProjectEditing,
        projectType: action.projectType,
        showProjectModal: !state.showProjectModal,
        showCurrentModal: action.currentSection,
        app: action.editApp,
        teams: action.editteam,
        users: action.edituser,
        payload: action.payload,
        color: action.color,
        date: action.date,
      };
    case PROJECTACTIONTYPE.SELECT_DATE:
      return { 
        ...state, 
        date: action.date,
        dueDateMode: action.dueDateMode || (action.date ? 'CUSTOM' : 'NO_DUE_DATE'),
      };
    case PROJECTACTIONTYPE.CURRENTMODAL:
      return { ...state, showCurrentModal: action.currentSection };
    case PROJECTACTIONTYPE.PROJECTTYPE:
      return { ...state, projectType: action.projectType };
    case PROJECTACTIONTYPE.COLOR:
      return { ...state, color: action.color };
    case PROJECTACTIONTYPE.PAYLOAD:
      return {
        ...state,
        payload: action.payload,
        showCurrentModal: action.currentSection,
      };
    case PROJECTACTIONTYPE.SHOWDETAIL:
      return {
        ...state,
        projectDetail: action.projectDetail,
      };
    case PROJECTACTIONTYPE.UPDATE_DETAIL:
      return {
        ...state,
        projectDetail: action.projectDetail,
      };
    // ORG

    /// TEAMS
    case PROJECTACTIONTYPE.SELECT_TEAM:
      return {
        ...state,
        teams: [...(state.teams ?? []), action.team!],
      };
    case PROJECTACTIONTYPE.UPDATE_TEAM_ROLE:
      const existingTeamsRoleIndex = (state.teams ?? []).findIndex(
        (team) => team.team === action.team?.team
      );
      const updatedTeamsRoles = [...state.teams!];
      if (existingTeamsRoleIndex !== -1) {
        updatedTeamsRoles[existingTeamsRoleIndex] = {
          ...updatedTeamsRoles[existingTeamsRoleIndex],
          role: action.team?.role!,
        };
      }
      return {
        ...state,
        teams: updatedTeamsRoles,
      };
    case PROJECTACTIONTYPE.DESELECT_TEAM:
      return {
        ...state,
        teams: state.teams?.filter((org) => org.team !== action.team?.team),
      };

    ///// User ////

    case PROJECTACTIONTYPE.SELECT_USER:
      return {
        ...state,
        users: [...(state.users ?? []), action.user!],
      };
    case PROJECTACTIONTYPE.UPDATE_USER_ROLE:
      const existingUsersRoleIndex = (state.users ?? []).findIndex(
        (user) => user.user === action.user?.user
      );
      const updatedUsersRoles = [...state.users!];
      if (existingUsersRoleIndex !== -1) {
        updatedUsersRoles[existingUsersRoleIndex] = {
          ...updatedUsersRoles[existingUsersRoleIndex],
          role: action.user?.role!,
        };
      }
      return {
        ...state,
        users: updatedUsersRoles,
      };
    case PROJECTACTIONTYPE.DESELECT_USER:
      return {
        ...state,
        users: state.users?.filter((user) => user.user !== action.user?.user),
      };

    /// pin apps

    case PROJECTACTIONTYPE.SELECT_APP:
      return {
        ...state,
        app: [...(state.app ?? []), action.app!],
      };
    case PROJECTACTIONTYPE.DESELECT_APP:
      return {
        ...state,
        app: state.app?.filter((app) => app !== action.app),
      };

    default:
      throw new Error('Unknown action type');
  }
};

export function useProjectCotnext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw 'error';
  }
  return context;
}
