import { Organization } from '@/types/interfaces';
import { AxiosInstance } from 'axios';

export const updateOrganizationDetail = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post(`organization/update`, data);
    return response.data.organization as Organization;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
