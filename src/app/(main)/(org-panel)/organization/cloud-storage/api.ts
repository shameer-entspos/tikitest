import { AxiosInstance } from 'axios';

export interface StorageModel {
  totalSizeBytes: number;
  totalSizeKB: number;
  totalSizeMB: number;
}

export interface AppStorage {
  totalSize: number;
  _id: string;
  name: string;
  appId: string;
  type: string;
}
export interface StoragePlan {
  _id: string;
  price: number;
  planDuration: string;
  totalStorageInGB: string;
  deleteAt: string;
  createdAt: string;
}

export interface SelectedPlan {
  _id: string;
  organization: string;
  storagePlan: StoragePlan;
  paymentStatus: string;
  createdAt: string;
}

export const getSizeofStorage = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`organization/user/checkUserDataSize`);
    return response.data as StorageModel;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getAppsStorage = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`organization/app/getAppStorage`);

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const purgeAppData = async ({
  axiosAuth,
  body,
}: {
  axiosAuth: AxiosInstance;
  body: {
    start: Date | null;
    end: Date | null;
    appIds?: string[] | undefined;
  };
}) => {
  try {
    const response = await axiosAuth.post(`organization/app/purgeAppData`, {
      ...body,
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const purgeProjectData = async ({
  axiosAuth,
  body,
}: {
  axiosAuth: AxiosInstance;
  body: {
    start: Date | null;
    end: Date | null;
    type?: string[] | undefined;
  };
}) => {
  try {
    const response = await axiosAuth.post(`organization/app/purgeProjectData`, {
      ...body,
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getSelectedStorage = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`organization/app/getSelectedStorage`);

    return response.data['orgStorage'] as SelectedPlan;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getStoragePlans = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(
      `organization/organizationStoragePlan/listOfPlan`
    );
    return response.data['storagePlans'] as StoragePlan[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const upgradeStoragePlan = async ({
  axiosAuth,
  storagePlanId,
}: {
  axiosAuth: AxiosInstance;
  storagePlanId: string;
}) => {
  try {
    const response = await axiosAuth.post(
      `organization/organizationStoragePlan/upgradePlan`,
      {
        storagePlanId,
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
