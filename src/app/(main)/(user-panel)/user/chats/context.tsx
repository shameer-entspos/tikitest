import { ChatActions } from '@/app/helpers/user/actions';
import { CHATTYPE } from '@/app/helpers/user/enums';
import { ChatState } from '@/app/helpers/user/states';
import { createContext, Dispatch, useContext } from 'react';
import { UserDetail } from '@/types/interfaces';
import {
  ChatRooms,
  ProjectRooms,
  TeamRooms,
} from '@/app/(main)/(user-panel)/user/chats/api';

export interface ChatContextProps {
  state: ChatState;
  dispatch: Dispatch<ChatActions>;
}

export const initialChatState: ChatState = {
  chatTab: 'contact',
  currentIndex: 0,
  sidebarOpen: false,
  showModel: false,
  showChat: false,
  showChatRequest: 'receive',
  chatMessageType: 'chat',
  teamFormType: 'select',
  projectFormType: 'select',
  selectedType: 'private',
  recorderStop: false,
  micTap: false,
  show_create_new_message: false,
};

export const ChatContext = createContext<ChatContextProps | null>(null);

function hasParticipants(
  room: ChatState['roomDetail']
): room is ChatRooms | TeamRooms | ProjectRooms {
  return !!room && 'participants' in room;
}

export const chatReducer = (
  state: ChatState,
  action: ChatActions
): ChatState => {
  switch (action.type) {
    case CHATTYPE.CHATDETAIL:
      return {
        ...state,
        roomDetail: action.roomDetail,
        chatTab: action.chatTab,
        chatMessageType: action.chatMessageType,
        filteredMessageIds: action.filteredMessageIds,
        messageController: undefined,
        mentionUsers: action.mentionUsers,
        selectUserIdFormTeamOrProject: action.selectUserIdFormTeamOrProject,
        recorderStop: true,
        micTap: false,
        roomViewProfile: undefined,
        showMembers: undefined,
      };
    // case CHATTYPE.SHOW_CREATE_NEW_MESSAGE:
    //   return {
    //     ...state,
    //     show_create_new_message: !state.show_create_new_message,
    //   };
    case CHATTYPE.CHANGETAB:
      return {
        ...state,
        chatTab: action.chatTab,
        roomDetail: undefined,
        messageController: undefined,
        mentionUsers: undefined,
      };
    case CHATTYPE.CHAT:
      return { ...state, messageController: action.messageController };
    case CHATTYPE.SIDEBARTOGGLE:
      return { ...state, sidebarOpen: !state.sidebarOpen };

    // people
    case CHATTYPE.TOGGLE:
      return {
        ...state,
        showModel: !state.showModel,
        addFriendTab: 'direct',
        teamFormType: 'select',
        projectFormType: 'select',
        users: [],
      };
    case CHATTYPE.SEARCH:
      return { ...state, searchText: action.searchText };

    case CHATTYPE.SHOWREQUEST:
      return { ...state, showChatRequest: action.showChatRequest };
    case CHATTYPE.SHOWDETAIL:
      return {
        ...state,
        showChatRequestDetail: action.showChatRequestDetail,
        showChatRequestDetailOf: action.showChatRequestDetailOf,
      };
    case CHATTYPE.CHATMESSAGETYPE:
      return { ...state, chatMessageType: action.chatMessageType };
    case CHATTYPE.SEARCHMENTIONS:
      return {
        ...state,
        filteredMessageIds: action.filteredMessageIds,
        currentIndex: 0,
      };
    case CHATTYPE.CHANGECURRENTINDEX:
      return { ...state, currentIndex: action.currentIndex };

    case CHATTYPE.ADDFRIENDTAB:
      return {
        ...state,
        addFriendTab: action.addFriendTab,
        payload: undefined,
        teamFormType: action.teamFormType,
        users: [],
      };
    case CHATTYPE.SHOWPROFILE:
      return { ...state, roomViewProfile: action.roomViewProfile };
    case CHATTYPE.SHOW_CONTACT_DETAIL:
      return { ...state, showContactDetail: action.showContactDetail };
    case CHATTYPE.TEAMPAYLOAD:
      return {
        ...state,
        payload: action.payload,
        selectedType: action.selectedType,
        teamFormType: action.teamFormType,
      };
    case CHATTYPE.SELECTEDTYPE:
      return { ...state, selectedType: action.selectedType };
    case CHATTYPE.TEAMFORMTYPE:
      return {
        ...state,
        teamFormType: action.teamFormType,
        selectedId: action.selectedId,
        selectedUsers: action.selectedUsers,
      };

    //project
    case CHATTYPE.PROJECTPAYLOAD:
      return {
        ...state,
        payload: action.payload,
        selectedType: action.selectedType,
        projectFormType: action.projectFormType,
      };

    case CHATTYPE.PROJECTFORMTYPE:
      return {
        ...state,
        projectFormType: action.projectFormType,
        selectedId: action.selectedId,
        selectedProjectUsers: action.selectedProjectUsers,
      };
    case CHATTYPE.SELECT_USER:
      return {
        ...state,
        users: [...(state.users ?? []), action.users!],
      };
    case CHATTYPE.UPDATE_USER_ROLE:
      const existingUsersRoleIndex = (state.users ?? []).findIndex(
        (user) => user.user === action.users?.user
      );
      const updatedUsersRoles = [...state.users!];
      if (existingUsersRoleIndex !== -1) {
        updatedUsersRoles[existingUsersRoleIndex] = {
          ...updatedUsersRoles[existingUsersRoleIndex],
          role: action.users?.role!,
        };
      }
      return {
        ...state,
        users: updatedUsersRoles,
      };
    case CHATTYPE.DESELECT_USER:
      return {
        ...state,
        users: state.users?.filter((user) => user.user !== action.users?.user),
      };
    case CHATTYPE.MICTAP:
      return { ...state, micTap: !state.micTap };
    case CHATTYPE.UPDATEROOMDETAIL:
      // Chat/team/project rooms expose participants; assistant payloads do not.
      const roomDetail = action.roomDetail;
      const roomHasParticipants = hasParticipants(roomDetail);
      return {
        ...state,
        roomDetail,
        mentionUsers: roomHasParticipants
          ? roomDetail.participants.filter(
              (participant: UserDetail) =>
                participant._id !== roomDetail.senderId
            )
          : [],
      };
    case CHATTYPE.RECORDERSTOP:
      return { ...state, recorderStop: !state.recorderStop };
    case CHATTYPE.SHOWMEMBERS:
      return { ...state, showMembers: action.showMembers };
    case CHATTYPE.SHOWWARNINGDIALOG:
      return { ...state, warningPayload: action.warningPayload };
    case CHATTYPE.EDITCHANNEL:
      return {
        ...state,
        teamFormType: action.teamFormType,
        projectFormType: action.projectFormType,
        selectedId: action.selectedId,
        showEditformType: action.showEditformType,
        selectedType: action.selectedType,
        payload: action.payload,
        users: action.saveUsers,
      };
    case CHATTYPE.UPDATE_SELECTED_USERS:
      return {
        ...state,
        selectedUsers: action.selectedUsers,
        selectedProjectUsers: action.selectedProjectUsers,
      };
    case CHATTYPE.ACTIVITY_COUNT:
      return {
        ...state,
        activityCount: action.activityCount,
        teamCount: action.teamCount,
        projectCount: action.projectCount,
        directCount: action.directCount,
      };

    default:
      throw new Error('Unknown action type');
  }
};

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatContext.Provider');
  }
  return context;
}

export const useChatCotnext = useChatContext;
