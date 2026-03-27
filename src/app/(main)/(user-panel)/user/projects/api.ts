import {
  AppWithRole,
  UserWithRole,
} from '@/app/helpers/user/states';
import { UserRelatedAllDetail } from '@/app/type/UserRelatedAllDetail';
import { ProjectDetail, ProjectList } from '@/app/type/projects';
import { AxiosInstance } from 'axios';
import { Message, ProjectRooms } from '../chats/api';
import { AppModel, SubmitAppDetail } from '../apps/api';
import { UserDetail } from '@/types/interfaces';

export interface ProjectModel {
  name: string;
  reference: string;
  description: string;
  address: string;
  color: string;
  date: Date | undefined;
  userId: string;
  projectType: string;

  authorizedBy: string;
  users: UserWithRole[];
  apps: AppWithRole[];
}

export interface ProjectAppSubmission {
  _id: string;
  submissionName: string;
  appName: string;
  submissionId: string;
  submittedBy: UserDetail;
  createdAt: string;
  updatedAt: string;
}

export const createProject = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post('user/project/create', data);

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateProject = async ({
  id,
  data,
  axiosAuth,
}: {
  id: string;
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post(`user/project/update/${id}`, data);

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getAddedProjectApps = async (
  axiosAuth: AxiosInstance,
  id: string
) => {
  try {
    const response = await axiosAuth.get(
      `user/project/getAddedProjectApps/${id}`
    );
    return response.data['apps'] as AppModel[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getAllProjectList = async ({
  axiosAuth,
  isAdmin = false,
}: {
  axiosAuth: AxiosInstance;
  isAdmin?: boolean;
}) => {
  try {
    const response = await axiosAuth.get(`user/project/list/${isAdmin}`);
    return response.data as ProjectList;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getProjectDetail = async ({
  axiosAuth,
  projectId,
  adminMode = false,
}: {
  axiosAuth: AxiosInstance;
  projectId?: string;
  adminMode?: boolean;
}) => {
  try {
    const response = await axiosAuth.get(
      `user/project/getProjectDetail/${projectId}?adminMode=${adminMode}`
    );
    return response.data.project as ProjectDetail;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getUserPermission = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/projectPermission`);
    return response.data as {
      projects: boolean;
      apps: boolean;
    };
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const getRecentlyProjectList = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/project/recentlylist`);
    return response.data as ProjectList;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getListOFProjectRooms = async (
  axiosAuth: AxiosInstance,
  id: string
) => {
  try {
    const response = await axiosAuth.get(
      `user/project/getProjectRoomsMedia/${id}`
    );

    return response.data['allMedia'] as Message[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getListOFProjectNames = async (
  axiosAuth: AxiosInstance,
  id: string
) => {
  try {
    const response = await axiosAuth.get(
      `user/project/getProjectNameList/${id}`
    );

    return response.data['project'] as {
      _id: string;
      appearName: string;
    }[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getListOfSumbitApps = async (
  axiosAuth: AxiosInstance,
  id: string
) => {
  try {
    const response = await axiosAuth.get(
      `user/project/listofSubmitAppInPorjects/${id}`
    );

    return response.data['submissions'] as ProjectAppSubmission[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteProject = async ({
  id,
  axiosAuth,
}: {
  id: string;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.delete(`user/project/delete/${id}`);

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const toggleFavoriteProject = async ({
  id,
  axiosAuth,
}: {
  id: string;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.put(
      `user/project/toggleFavoriteProject/${id}`
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getCustomerORSupplier = async ({
  axiosAuth,
}: {
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.get(`user/customer/getCustomers`);

    return response.data['data'] as UserDetail[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

/**
 * Update project members only (separate API for member management)
 * Teams are handled in frontend and expanded to individual users before sending
 * @param id - Project ID
 * @param data - Update data with users only (teams are expanded in frontend)
 * @param axiosAuth - Axios instance with auth
 */
export const updateProjectMembers = async ({
  id,
  data,
  axiosAuth,
}: {
  id: string;
  data: {
    users?: Array<{ user: string; role: string }>;
  };
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post(`user/project/updateMembers/${id}`, data);

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
