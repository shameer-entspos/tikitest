import { AxiosInstance } from 'axios';
import { getUploadedImageStorageKey } from './useStagedImageUploads';

type DeleteArgs = {
  axiosAuth: AxiosInstance;
  deleteEndpoint: string;
  fileUrl: string;
};

type UploadArgs = {
  appId: string;
  axiosAuth: AxiosInstance;
  file: File;
  onProgress?: (progress: number) => void;
};

export async function uploadImageToApp({
  appId,
  axiosAuth,
  file,
  onProgress,
}: UploadArgs) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('app_id', appId);

  const response = await axiosAuth.post('user/app/jsa/uploadImage', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const { loaded, total } = progressEvent;
      const percentCompleted = Math.floor((loaded * 100) / (total ?? 1));
      onProgress?.(percentCompleted);
    },
  });

  return response.data.file as string;
}

export async function deleteUploadedAppImage({
  axiosAuth,
  deleteEndpoint,
  fileUrl,
}: DeleteArgs) {
  return axiosAuth.delete(deleteEndpoint, {
    data: { fileName: getUploadedImageStorageKey(fileUrl) },
  });
}
