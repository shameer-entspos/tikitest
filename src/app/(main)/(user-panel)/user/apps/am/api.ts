import { Category } from '@/app/type/asset_category';
import { ServiceSchedule } from '@/app/type/group_service_schedule';
import { Orderitinreray } from '@/app/type/order_itinreray';
import { GroupService } from '@/app/type/service_group';
import { ServiceLog } from '@/app/type/service_log';
import { SingleAsset } from '@/app/type/single_asset';
import { UserDetail } from '@/types/interfaces';
import { AxiosInstance } from 'axios';

export interface AssetComment {
  _id: string;
  content: string;
  user: UserDetail;
  appId: string;
  images: string[];
  likedBy: UserDetail[];
  createdAt: string;
  updatedAt: string;
}
export const getAMAppSetting = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/app/am/AMSetting`);
    return response.data['setting'] as {
      notifyMeWhenCheckIn: boolean;
      notifyMeWhenCheckOut: boolean;
      tikiAIAssistant: boolean;
      emailNotification: boolean;
      _id: string;
      orgId: string;
      checkInOut: string[];
      manageServices: string[];
      manageAssets: string[];
      categories: string[];
      createdAt: Date;
      updatedAt: Date;
      recipients: UserDetail[];
    };
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateAMSetting = async ({
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
      `user/app/am/updateAMAppSettings/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const createAsset = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.post(`user/app/am/create`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const updateManyAsset = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.post(`user/app/am/updateMany`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateAsset = async ({
  axiosAuth,
  data,
  id,
}: {
  axiosAuth: AxiosInstance;
  data: any;
  id: any;
}) => {
  try {
    const response = await axiosAuth.put(`user/app/am/update/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getAssetList = async ({
  axiosAuth,
  status,
}: {
  axiosAuth: AxiosInstance;
  status: 'checkout' | 'checkin' | 'all';
}) => {
  try {
    const response = await axiosAuth.get(`user/app/am/list/${status}`);
    return response.data.data as SingleAsset[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getFilterAssetList = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.post(`user/app/am/filterList`, data);
    return response.data.data as SingleAsset[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
// checkInAsset
export const checkInAsset = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.post(`user/app/am/checkInAsset`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
// checkInAsset
export const checkOutAsset = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.post(`user/app/am/checkOutAsset`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const getSingleAsset = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.get(`user/app/am/getOne/${id}`);

    return response.data['data'] as SingleAsset;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getSingleOrderItinerary = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.get(
      `user/app/am/orderItinreray/getOne/${id}`
    );
    return response.data['data'] as Orderitinreray;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getAssetLogs = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.get(`user/app/am/service-log/list/${id}`);
    return response.data['data'] as ServiceLog[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getAssetCommentList = async (
  id: string,
  axiosAuth: AxiosInstance
) => {
  try {
    if (id == '') {
      return [];
    }
    const response = await axiosAuth.get(`user/app/am/asset/getComments/${id}`);

    return response.data.comments as AssetComment[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteteAssetComment = async ({
  id,
  axiosAuth,
}: {
  id: string;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.delete(
      `user/app/am/asset/deleteComment/${id}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const createAssetComment = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post(
      `user/app/am/asset/createComment`,
      data
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const toggleAssetLikedComment = async ({
  axiosAuth,
  Id,
}: {
  axiosAuth: AxiosInstance;
  Id: string;
}) => {
  try {
    const response = await axiosAuth.post(
      `user/app/am/asset/toggleCommentLike/${Id}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const deleteSingleAsset = async ({
  id,
  axiosAuth,
}: {
  id: string;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.delete(`user/app/am/delete/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

////TODO Categories
export const createCategory = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.post(`user/app/am/category/create`, data);
    return response.data.orders as Orderitinreray[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteCategory = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: any;
}) => {
  try {
    const response = await axiosAuth.delete(
      `user/app/am/category/delete/${id}`
    );
    return response.data.orders as Orderitinreray[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const updateAssetCategory = async ({
  axiosAuth,
  id,
  data,
}: {
  axiosAuth: AxiosInstance;
  id: any;
  data: any;
}) => {
  try {
    const response = await axiosAuth.put(
      `user/app/am/category/update/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const updateAssetTransferCategory = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.put(`user/app/am/category/transfer`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const getAllCategoriesList = async ({
  axiosAuth,
}: {
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.get(`user/app/am/category/list`);
    return response.data.categories as Category[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const getAllParentCategoriesList = async ({
  axiosAuth,
}: {
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.get(
      `user/app/am/category/listOfParentCategory`
    );
    return response.data.categories as Category[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const getAllChildCategoriesList = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: String | null;
}) => {
  if (id == null) {
    return;
  }
  try {
    const response = await axiosAuth.get(
      `user/app/am/category/listOfSubcategory/${id}`
    );
    return response.data.categories as Category[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

////// TODO Order Itinreray
export const getOrderItinrerayList = async ({
  axiosAuth,
}: {
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.get(`user/app/am/orderItinreray/list`);
    return response.data.orders as Orderitinreray[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

///// Group Service
export const createServiceSchedule = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.post(
      `user/app/am/service-schedule/create`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const createPendingServiceLog = async ({
  axiosAuth,
  data,
  id,
}: {
  axiosAuth: AxiosInstance;
  data: any;
  id: string;
}) => {
  try {
    const response = await axiosAuth.post(
      `user/app/am/service-log/create/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const createManyPendingServiceLog = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.post(
      `user/app/am/service-log/createMany`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const createAssetServiceLog = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.post(
      `user/app/am/asset-service-log/create`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const updateAssetServiceLog = async ({
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
      `user/app/am/service-log/update/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteAssetServiceLog = async ({
  axiosAuth,

  id,
}: {
  axiosAuth: AxiosInstance;

  id: string;
}) => {
  try {
    const response = await axiosAuth.delete(
      `user/app/am/service-log/delete/${id}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteServiceSchedule = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: any;
}) => {
  try {
    const response = await axiosAuth.delete(
      `user/app/am/service-schedule/${id}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getAllServiceSchedules = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.get(
      `user/app/am/service-schedule/list/${id}`
    );
    return response.data.data as ServiceSchedule[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getAllPendingService = async ({
  axiosAuth,
}: {
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.get(`user/app/am/service-schedule/list`);
    return response.data.data as ServiceSchedule[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateServiceSchedule = async ({
  axiosAuth,
  data,
  id,
}: {
  axiosAuth: AxiosInstance;
  data: any;
  id: any;
}) => {
  try {
    const response = await axiosAuth.put(
      `user/app/am/service-schedule/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const updateManyServiceSchedule = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.post(
      `user/app/am/service-schedule/updateMany`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const createGroupService = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.post(`user/app/am/group/create`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const deleteGroupService = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: any;
}) => {
  try {
    const response = await axiosAuth.delete(`user/app/am/group/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteManyGroupService = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.post(`user/app/am/group/deleteMany`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const getGroupServiceList = async ({
  axiosAuth,
}: {
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.get(`user/app/am/group/list`);

    return response.data.data as GroupService[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const updateGroupService = async ({
  axiosAuth,
  data,
  id,
}: {
  axiosAuth: AxiosInstance;
  data: any;
  id: any;
}) => {
  try {
    const response = await axiosAuth.put(`user/app/am/group/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const checkAMPermission = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/app/am/checkAMUserPermission`);
    return response.data as {
      checkInOut: boolean;
      manageServices: boolean;
      manageAssets: boolean;
      categories: boolean;
    };
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getCustomersList = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/customer/getCustomers`);
    return response.data['data'] as UserDetail[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const removeAssetFromServiceGroup = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.post(
      `user/app/am/asset/removeAssetFromServiceGroup`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
