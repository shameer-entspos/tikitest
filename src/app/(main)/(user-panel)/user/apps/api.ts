import { AddedTeamDetailModel } from '@/app/type/addedTeamDetailModel';
import { ProjectDetail } from '@/app/type/projects';
import { RecentAppActivity } from '@/app/type/recent_app_activity';
import { StepFormValues } from '@/components/JobSafetyAnalysis/CreateNewComponents/JSA_Steps';
import { Organization, Team, User, UserDetail } from '@/types/interfaces';
import { AxiosInstance } from 'axios';
import { toast } from 'react-hot-toast';
import { ProjectRooms, TeamRooms } from '../chats/api';

export interface JSARoomList {
  message: string;
  rooms: {
    _id: string;
    title: string;
    participants: UserDetail;
  }[];
  teamRooms: {
    _id: string;
    channelName: string;
    appearName: string;
  }[];
  projectRooms: {
    _id: string;
    channelName: string;
    appearName: string;
  }[];
}

export interface ContactsProjectChannelsResponse {
  message: string;
  data: {
    contacts: UserDetail[];
    teamRooms: TeamRooms[];
    projectChannels: ProjectRooms[];
    externalFriends: UserDetail[];
  };
}
export interface JSAComment {
  _id: string;
  content: string;
  user: UserDetail;
  appId: string;
  images: string[];
  likedBy: UserDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface AppModel {
  _id: string;
  name: string;
  description: string;
  type: string;
  price: string;
  appId: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface JSAAppActivityList {
  _id: string;
  title: string;
  entry: string;
  userId: UserDetail;
  action: string;
  appId?: string;
  createdAt: string;
  updatedAt: string;
}
export interface PPEModel {
  _id: string;
  name: string;
  description: string;
  sharing: number;
  createdBy: UserDetail;
  organizationId: Organization;
  deleted: boolean;
  images: string[];
  saveForSubmission: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HazardModel {
  _id: string;
  name: string;
  initialRiskAssessment: number;
  controlMethod: string;
  residualRiskAssessment: number;
  sharing: number;
  createdBy: UserDetail;
  organizationId: Organization;
  deleted: boolean;
  saveForSubmission: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmitAppDetail {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  type: string;
  photo: string;
  app_id: {
    name: string;
    type: string;
  };
  user_id: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  projects?: {
    name: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectId {
  _id: string;
  name: string;
  reference: string;
  description: string;
  address: string;
  color: string;
  projectId: string;
  date: string;
  isStarred: boolean;
  projectType: string;
  userId: string;
  organizations: Organization[];
  users: User[];
  individualUsers: {
    user: string;
  }[];
  teams: any[];
  // app: App[]
  tasks: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface JSAAppModel {
  _id: string;
  projectIds: ProjectId[];
  selectedContact: string;
  reference: string;
  name: string;
  scopeDescription: string;
  contactName: string;
  phone: number;
  submissionId: string;
  managers: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }[];
  steps: StepFormValues[];
  evacuationArea: string;
  evacuationProcedure: string;
  emergencyContact: {
    phone: string;
    name: string;
  }[];
  images: string[];
  sharing: number;
  templateSharing: number;
  allowEdit: boolean;
  rangeDate: {
    startDate: string;
    endDate: string;
  };
  createdBy: UserDetail;
  updatedBy: UserDetail;
  organizationId: Organization;
  saveAs: string;
  deletedAt: boolean;
  isTemplate: boolean;
  templateName: string;
  isTemplateEditable: boolean;
  createdAt: string;
  updatedAt: string;
}

// export interface SRAppModel {
//   _id: string;
//   projectIds: ProjectId[];
//   selectedContact: UserDetail;
//   reference: string;
//   name: string;
//   scopeDescription: string;
//   contactName: string;
//   phone: number;
//   submissionId: string;
//   managers: {
//     firstName: string;
//     lastName: string;
//     email: string;
//     phone: string;
//   }[];
//   steps: StepFormValues[];
//   evacuationArea: string;
//   evacuationProcedure: string;
//   emergencyContact: {
//     phone: string;
//     name: string;
//   }[];
//   images: string[];
//   sharing: number;
//   templateSharing: number;
//   allowEdit: boolean;
//   rangeDate: {
//     startDate: string;
//     endDate: string;
//   };

//   createdBy: UserDetail;
//   updatedBy: UserDetail;
//   organizationId: OrganizationId;
//   saveAs: string;
//   deletedAt: boolean;
//   isTemplate: boolean;
//   templateName: string;
//   isTemplateEditable: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

export const getApps = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/app/list/`);
    console.log(response.data);
    return response.data['apps'] as {
      app: AppModel;
      updatedAt: Date;
      isFavorited?: boolean;
    }[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateAppRecentStatus = async ({
  axiosAuth,
  appId,
}: {
  axiosAuth: AxiosInstance;
  appId: string;
}) => {
  try {
    const response = await axiosAuth.put(`user/app/updateAppRecentStatus`, {
      appId,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const toggleAppFavorite = async ({
  axiosAuth,
  appId,
}: {
  axiosAuth: AxiosInstance;
  appId: string;
}) => {
  try {
    const response = await axiosAuth.put(`user/app/toggleFavorite/${appId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getAllAppProjects = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/app/listofProjects`);
    return response.data['projects'] as ProjectDetail[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getAllOrgUsers = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/app/listofUsers`);
    return response.data['users'] as UserDetail[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getAllSubmittedApps = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/app/listofSubmitApps`);
    return response.data['apps'] as SubmitAppDetail[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const submitApp = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post('user/app/submitApp', data, {
      headers: {
        'Content-Type': 'multipart/form-data', // Important for form data
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const signOutApp = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post('user/app/appSignOut', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getSingleAppSubmission = async (
  axiosAuth: AxiosInstance,
  appId: string
) => {
  try {
    const response = await axiosAuth.get(
      `user/app/singleAppSubmission/${appId}`
    );

    return response.data['apps'] as SubmitAppDetail[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteAppSumbission = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.delete(
      `user/app/deleteAppSubmission/${id}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getAllPPEs = async ({
  axiosAuth,
  isAdmin = false,
}: {
  axiosAuth: AxiosInstance;
  isAdmin?: boolean;
}) => {
  try {
    const response = await axiosAuth.get(`user/app/ppe/list/${isAdmin}`);
    console.log(response.data);

    return response.data['PPEs'] as PPEModel[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const getAllHazards = async ({
  axiosAuth,
  isAdmin,
}: {
  axiosAuth: AxiosInstance;
  isAdmin?: boolean;
}) => {
  try {
    const response = await axiosAuth.get(`user/app/hazards/list/${isAdmin}`);
    console.log(response.data);

    return response.data['hazards'] as HazardModel[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const createPPE = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    console.log('post', data);
    const response = await axiosAuth.post('user/app/ppe/create', data);

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const updatePPE = async ({
  data,
  axiosAuth,
  itemId,
}: {
  data: any;
  axiosAuth: AxiosInstance;
  itemId: string;
}) => {
  try {
    console.log('post', data);
    const response = await axiosAuth.put(`user/app/ppe/update/${itemId}`, data);

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deletePPE = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.delete(`user/app/ppe/delete/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteMultiplePPE = async ({
  data,
  axiosAuth,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.post(`user/app/ppe/delete`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const duplicatePPE = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.post(`user/app/ppe/duplicate/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

//hazards

export const createHazards = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post('user/app/hazards/create', data);
    console.log(response);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const createjSASubmision = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post('user/app/jsa/create', data);

    return response.data;
  } catch (error: any) {
    toast.error(error.response.data.message);
    throw new Error(error.response.data.message);
  }
};

export const updatejSASubmision = async ({
  data,
  id,
  axiosAuth,
}: {
  data: any;
  id: string;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.put(`user/app/jsa/update/${id}`, data);

    return response.data;
  } catch (error: any) {
    toast.error(error.response.data.message);
    throw new Error(error.response.data.message);
  }
};

export const updateHazards = async ({
  data,
  axiosAuth,
  itemId,
}: {
  data: any;
  axiosAuth: AxiosInstance;
  itemId: string;
}) => {
  try {
    console.log('post hazards', data);
    const response = await axiosAuth.put(
      `user/app/hazards/update/${itemId}`,
      data
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteHazard = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.delete(`user/app/hazards/delete/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteMultipleHazards = async ({
  data,
  axiosAuth,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.post(`user/app/hazards/delete`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const duplicateHazard = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.post(`user/app/hazards/duplicate/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const activitiesList = async ({
  axiosAuth,
  appType,
  body,
}: {
  axiosAuth: AxiosInstance;
  appType: 'JSA' | 'TS' | 'AM' | 'SH' | 'SR';
  body?: any;
}) => {
  try {
    const response = await axiosAuth.get(
      `/user/app/activity/list/${appType}`,
      body
    );
    return response.data['activities'] as RecentAppActivity[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getOneSubmissionactivitiesList = async ({
  id,
  axiosAuth,
}: {
  id: string;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.get(`/user/app/activity/get/${id}`);
    return response.data.activities as JSAAppActivityList[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const getJSASubmissionList = async ({
  axiosAuth,
  saveAs,
  isAdmin = false,
}: {
  axiosAuth: AxiosInstance;
  saveAs: 'Template' | 'Draft' | 'Submission';
  isAdmin: boolean;
}) => {
  try {
    const response = await axiosAuth.get(
      `/user/app/jsa/list?saveAs=${saveAs}&isAdmin=${isAdmin}`
    );
    return response.data as JSAAppModel[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getJSASingleSubmissionDetail = async ({
  id,
  type,
  axiosAuth,
}: {
  id: string;
  type: string;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.get(
      `/user/app/jsa/get/${id}?saveAs=${type}`
    );

    return response.data as JSAAppModel;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteJSASubmission = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.delete(`user/app/jsa/delete/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteMultipleJSASubmissions = async ({
  data,
  axiosAuth,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    console.log('data going to api', data);
    const response = await axiosAuth.put(`user/app/jsa/delete`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error details:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Deletion failed');
  }
};

export const createDuplicateOfSubmission = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post(
      'user/app/jsa/duplicateSubmission',
      data
    );

    return response.data;
  } catch (error: any) {
    toast.error(error.response.data.message);
    throw new Error(error.response.data.message);
  }
};

export const getAllRoomsForJSA = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/app/jsa/getrooms`);
    return response.data as JSARoomList;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export interface JSAContactList {
  message: string;
  data: { type: string; user: UserDetail }[];
}

export const getAllContactsForJSA = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/app/jsa/getcontacts`);
    return response.data as JSAContactList;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getContactsProjectChannels = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/app/getContactsProjectChannels`);
    return response.data as ContactsProjectChannelsResponse;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const createJSAComment = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post(`user/app/comment/create`, data);

    return response.data;
  } catch (error: any) {
    toast.error(error.response.data.message);
    throw new Error(error.response.data.message);
  }
};
export const updateteJSAComment = async ({
  data,
  id,
  axiosAuth,
}: {
  data: any;
  id: string;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.put(`user/app/comment/edit/${id}`, data);

    return response.data;
  } catch (error: any) {
    toast.error(error.response.data.message);
    throw new Error(error.response.data.message);
  }
};
export const JSACommentList = async (id: string, axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/app/comment/list/${id}`);

    return response.data.comments as JSAComment[];
  } catch (error: any) {
    toast.error(error.response.data.message);
    throw new Error(error.response.data.message);
  }
};

export const deleteteJSAComment = async ({
  id,
  axiosAuth,
}: {
  id: string;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.delete(`user/app/comment/delete/${id}`);
    return response.data;
  } catch (error: any) {
    toast.error(error.response.data.message);
    throw new Error(error.response.data.message);
  }
};

export const toggleJSALikedComment = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.post(`user/app/comment/toggleLike/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const sendJsaMail = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post('user/app/jsa/submissionmail', data, {
      headers: {
        'Content-Type': 'multipart/form-data', // Important for form data
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getJSAAppSetting = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/app/jsa/JSASetting`);
    return response.data['setting'] as {
      _id: string;
      recipients: UserDetail[];
      notifyMeWhenCreated: boolean;
      notifyMeWhenDeleted: boolean;
      tikiAIAssistant: boolean;
      emailNotification: boolean;
      forceSubmission: string;
      adminTeams: string[];
    };
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const sendSubmissionEmail = async ({
  data,
  axiosAuth,
}: {
    data: {
    appType: 'timesheet' | 'safetyhub' | 'signregister' | 'jsa' | 'assetmanager' | 'rollcall' | 'safetymeeting' | 'orderitinerary';
    submissionId: string;
    emails: string[];
    message?: string;
  };
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post('user/app/sendSubmissionEmail', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateJSAAppSetting = async ({
  axiosAuth,
  data,
  id,
}: {
  axiosAuth: AxiosInstance;
  data: any;
  id: string;
}) => {
  try {
    const response = await axiosAuth.put(
      `user/app/jsa/updateJSAAppSettings/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

// getAllOrgUsers
export const getAllTeamsForJSA = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/app/jsa/getTeamsForJSA`);
    return response.data['teams'] as AddedTeamDetailModel[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const checkJSAPermission = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/app/jsa/checkJSAUserPermission`);
    return response.data as {
      adminTeams: boolean;
    };
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
