import { User } from '@/types/interfaces';
import { AxiosInstance } from 'axios';

export const updateMyUser = async ({
  axiosAuth,
  id,
  data,
}: {
  axiosAuth: AxiosInstance;
  id: string;
  data: any;
}) => {
  try {
    const response = await axiosAuth.post(
      `organization/updateMyUser/${id}`,
      data
    );
    return response.data.user as User;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateMyUserProfile = async ({
  id,
  selectedImage,
  axiosAuth,
}: {
  id: string;
  selectedImage: File | null | undefined;
  axiosAuth: AxiosInstance;
}) => {
  const formData = new FormData();

  if (selectedImage) {
    formData.append('photo', selectedImage!);
  }

  try {
    const response = await axiosAuth.post(
      `organization/updateMyUserPhoto/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data', // Override the Content-Type header for this request
        },
      }
    );
    return response.data.user as User;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
