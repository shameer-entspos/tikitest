import { UserWithRole } from '@/app/helpers/user/states';
import { UserDetail } from '@/types/interfaces';
import { AxiosInstance } from 'axios';
import toast from 'react-hot-toast';
export interface ChatRooms {
  _id: string;
  title: string;
  lastMessage: string;
  mimetype: string;
  senderId: string;
  seenCount: number;
  updatedAt: string;
  createdAt: string;
  organizationId: string;
  participants: UserDetail[];
  isPinned: boolean;
  isMuted: boolean;
  type: string;
  teamType: 'private' | 'public' | undefined;
  channelName: string;
  description: string;
  appearName: string;
}

export interface TikiAssitant {
  _id: string;
  title: string;
  subtitle: string;
  link: string;
  type?: string;
  appType?: string;
  redirectType?: string;
  isRead?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TikiAssistantResponse {
  notifications: TikiAssitant[];
  unreadCount: number;
}
export interface TeamRooms extends ChatRooms {
  teamDetails: TeamDetails;
}

export interface ProjectRooms extends ChatRooms {
  projectDetails: ProjectDetails;
  isGeneral: boolean;
}

interface Detail {
  _id: string;
  name: string;
}
export interface TeamDetails extends Detail {
  teamId: string;
  members: UserDetail[];
}
interface ProjectDetails extends Detail {
  projectId: string;
}
export interface Message {
  _id: string;
  roomId: string;
  // roomId: ProjectDetails;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    photo: string;
  };
  message: string;
  createdAt: string;
  mimetype: string;
  media?: {
    name: string;
    url: string;
    mimetype: string;
  };
}

export const getAllChatRooms = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/rooms/list?page=${1}`);
    return response.data['rooms'] as ChatRooms[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getRoomChat = async (axiosAuth: AxiosInstance, id: string) => {
  try {
    const response = await axiosAuth.get(`user/chats/list/${id}`);
    return response.data['messages'] as Message[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getWholeSeenCount = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/rooms/getCategoriesSeenCount`);
    return response.data['result'] as {
      activity: number;
      direct: number;
      project: number;
      team: number;
    };
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const clearChat = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.delete(`user/chats/clear/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const sendMessage = async ({
  axiosAuth,
  body,
}: {
  axiosAuth: AxiosInstance;
  body: { roomId: string; message: string };
}) => {
  try {
    const response = await axiosAuth.post(`user/chats/sendMessage`, body);
    return response.data.message;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export function formatTimeDifference(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000); // Calculate time difference in seconds

  if (diffInSeconds < 60) {
    return 'now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d`;
  }
}

export interface ChatRequestList {
  _id: string;
  receiver?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    photo: string;
    userId: string;
    organization: {
      name: string;
    };
  };
  sender?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    photo: string;
    userId: string;
    organization: {
      name: string;
    };
  };
  createdAt: Date;
}

export const getAllRooms = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/rooms/list?page=${1}`);
    return response.data['rooms'] as ChatRooms[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const searchPeoples = async (
  axiosAuth: AxiosInstance,
  query: string
) => {
  try {
    const response = await axiosAuth.get(`user/rooms/search/${query}`);
    return response.data as {
      _id: string;
      email: string;
      status: string;
      firstName: string;
      lastName: string;
      photo: string;
    }[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const sendRequestToUsers = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.post(`user/rooms/sendChatRequest`, {
      id: id,
    });
    return response.data as { message: string };
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getChatRequests = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/rooms/chatRequestList`);
    console.log(response.data);
    return response.data['requestList'] as ChatRequestList[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const sentChatRequests = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/rooms/sentRequestList`);
    return response.data['requestList'] as ChatRequestList[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const responedChatRequests = async ({
  axiosAuth,
  body,
}: {
  axiosAuth: AxiosInstance;
  body: {
    id: string;
    action: 'accept' | 'reject';
  };
}) => {
  try {
    const response = await axiosAuth.post(
      `user/rooms/respondChatRequest`,
      body
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const removeFriend = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.delete(`user/rooms/removeFriend/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export interface ChatMedia {
  media: { file: string; mimetype: string; name: string }[];
}
export const uploadMedia = async ({
  axiosAuth,
  file,
}: {
  axiosAuth: AxiosInstance;
  file: File;
}) => {
  try {
    const _formData = new FormData();

    if (file != undefined) {
      _formData.append('file', file);
      const response = await axiosAuth.post(`user/upload`, _formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data as ChatMedia;
    }
    return;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getAllTeamsRooms = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/teamsRooms/list?page=${1}`);
    return response.data['rooms'] as TeamRooms[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getAllTeams = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/teamsRooms/teams`);
    return response.data['teams'] as TeamDetails[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const getSingleTeamMembers = async (
  axiosAuth: AxiosInstance,
  id: string
) => {
  try {
    const response = await axiosAuth.get(`user/teamsRooms/singleTeam/${id}`);
    return response.data['teams']['members'] as UserDetail[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

/// single project members
export const getSingleProjectMembers = async (
  axiosAuth: AxiosInstance,
  id: string
) => {
  try {
    const response = await axiosAuth.get(
      `user/projectRooms/singleProject/${id}`
    );
    console.log(response);
    return response.data['projects']['users'] as {
      user: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
    }[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const createTeamRoom = async ({
  axiosAuth,
  body,
}: {
  axiosAuth: AxiosInstance;
  body: {
    teamId: string;
    channelName: string;
    description: string;
    appearName: string;
    type: string;
    room: string[] | UserWithRole[];
  };
}) => {
  try {
    const response = await axiosAuth.post(`user/teamsRooms/create`, body);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

///update team
export const updateTeamRoom = async ({
  axiosAuth,
  body,
}: {
  axiosAuth: AxiosInstance;
  body: {
    teamId: string;
    channelName: string;
    description: string;
    appearName: string;
    type: string;
    room: string[] | UserWithRole[];
  };
}) => {
  try {
    const response = await axiosAuth.put(
      `user/teamsRooms/editTeamChannel`,
      body
    );

    return response.data['teamRoom'] as TeamRooms[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateProjectRoom = async ({
  axiosAuth,
  body,
}: {
  axiosAuth: AxiosInstance;
  body: {
    roomId: string;
    projectId: string;
    channelName: string;
    description: string;
    appearName: string;
    type: string;
    room: string[] | UserWithRole[];
  };
}) => {
  try {
    const response = await axiosAuth.put(
      `user/projectRooms/editProjectChannel`,
      body
    );
    return response.data['projectRoom'] as ProjectRooms[];
  } catch (error: any) {
    console.log(error.response.data.message);
    throw new Error(error.response.data.message);
  }
};

export const deleteProjectChannel = async ({
  axiosAuth,
  roomId,
}: {
  axiosAuth: AxiosInstance;
  roomId: string;
}) => {
  try {
    const response = await axiosAuth.delete(
      `user/projectRooms/delete/${roomId}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getTeamsChat = async (axiosAuth: AxiosInstance, id: string) => {
  try {
    const response = await axiosAuth.get(`user/teams/list/${id}`);
    return response.data['messages'] as Message[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

///// projects chat

export const getAllProjectRooms = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/projectRooms/list?page=${1}`);
    return response.data['rooms'] as ProjectRooms[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getProjectChat = async (axiosAuth: AxiosInstance, id: string) => {
  try {
    const response = await axiosAuth.get(`user/projectChats/list/${id}`);
    return response.data['messages'] as Message[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getAllProjectsInChat = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/projectRooms/projects`);
    return response.data['projects'] as {
      _id: string;
      name: string;
      projectId: string;
      users: {
        user: {
          _id: string;
          firstName: string;
          lastName: string;
          email: string;
        };
      }[];
    }[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const createProjectRoom = async ({
  axiosAuth,
  body,
}: {
  axiosAuth: AxiosInstance;
  body: any;
}) => {
  try {
    const response = await axiosAuth.post(`user/projectRooms/create`, body);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export interface AllAcitvitiesRoom {
  rooms: ChatRooms[];
  teamRooms: TeamRooms[];
  projectRoom: ProjectRooms[];
  requestList: ChatRequestList[];
  notifications: TikiAssitant;
}
// activities apis

export const getAllActivites = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/activity/list`);
    return response.data as AllAcitvitiesRoom;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

/// create customer
export const createCustomer = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.post(`user/customer/create`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const updateCustomer = async ({
  axiosAuth,
  data,
  id,
}: {
  axiosAuth: AxiosInstance;
  data: any;
  id: any;
}) => {
  try {
    const response = await axiosAuth.put(`user/customer/update/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteCustomer = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.delete(`user/customer/delete/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getAllFrineds = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/rooms/list?page=${1}`);
    return response.data['result'] as UserDetail[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getContactList = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/rooms/contactlist`);
    return response.data['result'] as UserDetail[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const searchFriendByEmail = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.post(
      `user/rooms/searchFriendByEmail`,
      data
    );
    return response.data as UserDetail;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const addExternalUser = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: any;
}) => {
  try {
    const response = await axiosAuth.post(`user/rooms/addExternalUser/${id}`);
    return response.data as UserDetail;
  } catch (error: any) {
    toast.error(error.response.data.message);
    throw new Error(error.response.data.message);
  }
};

export const getAssistantNotification = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get('user/getAssistantNotification');

    return {
      notifications: response.data['notifications'] as TikiAssitant[],
      unreadCount: response.data['unreadCount'] as number,
    } as TikiAssistantResponse;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const markNotificationAsRead = async (
  axiosAuth: AxiosInstance,
  notificationId: string
) => {
  try {
    const response = await axiosAuth.post(
      `user/markNotificationAsRead/${notificationId}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
