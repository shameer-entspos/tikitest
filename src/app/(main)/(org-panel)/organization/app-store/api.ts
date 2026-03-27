import { AxiosInstance } from 'axios';

export interface AppStoreModel {
  _id: string;
  name: string;
  description: string;
  isInstalled: boolean;
  appId: string;
  price: number;
  type: string;
}

export const getAllAppList = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`organization/app/allApps`);

    return response.data['apps'] as AppStoreModel[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const installAppInOrg = async ({
  axiosAuth,
  body,
}: {
  axiosAuth: AxiosInstance;
  body: { app: string };
}) => {
  try {
    const response = await axiosAuth.post(`organization/app/create`, body);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getInstalledApps = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`organization/app/listofInstallApp`);
    console.log(response.data['apps']);
    return response.data['apps'] as {
      paymentStatus: string;
      app: AppStoreModel;
    }[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteInstalledApp = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.delete(
      `organization/app/deleteInstalledApp/${id}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
