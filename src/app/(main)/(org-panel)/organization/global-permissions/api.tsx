import { AxiosInstance } from 'axios';

export interface GlobalPermission {
  _id: string;
  org: string;
  projects: string[];
  tasks: string[];
  apps: string[];
  contacts: string[];
  externalFriends: string[];
}

export const getGlobalPermission = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(
      'organization/user/getGlobalPermissions'
    );
    return response.data['data'] as GlobalPermission;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateGlobalPermission = async ({
  id,
  data,
  axiosAuth,
}: {
  id: string;
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.put(
      `organization/user/updateGlobalPermission/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
