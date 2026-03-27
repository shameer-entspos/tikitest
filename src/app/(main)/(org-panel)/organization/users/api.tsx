'use client';
import { ErrorMessageHandler } from '@/app/helpers/error_handler';
import { AddedUserDetailModel } from '@/app/type/addedUserDetailModel';

import { AxiosInstance } from 'axios';
import toast from 'react-hot-toast';

export const createUser = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post('organization/user/create', data);
    return response.data['user'];
  } catch (error: any) {
    console.log('Error in create ==>' + error.response.data.message);
    toast.error(error.response.data.message);
    throw new Error(error.response.data.message);
  }
};

export const deleteUser = async ({
  id,
  axiosAuth,
}: {
  id: string;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.delete(`organization/user/delete/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const editUser = async ({
  data,
  id,
  axiosAuth,
}: {
  data: any;
  id: string;
  axiosAuth: AxiosInstance;
}) => {
  console.log(data);
  try {
    const response = await axiosAuth.put(
      `organization/user/update/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateAddedUserPassword = async ({
  data,
  axiosAuth,
}: {
  data: any;

  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post(
      `organization/user/updateAddedUserPassword`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateMultiStatusPassword = async ({
  data,
  axiosAuth,
}: {
  data: any;

  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post(
      `organization/user/changeActiveStatusManyUser`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const deleteMultiUserPassword = async ({
  data,
  axiosAuth,
}: {
  data: any;

  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post(`organization/user/deleteMany`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteAccount = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.put(`organization/deleteAccount`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const toggleUserActiveStatus = async ({
  id,
  active,
  axiosAuth,
}: {
  id: string;
  active: boolean;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.put(
      `organization/user/toggleActiveStatus/${id}`,
      { active }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getUsers = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`organization/user/list`);
    return response.data['users'] as AddedUserDetailModel[];
  } catch (error: any) {
    console.log('error ' + error.response.data.message);
    ErrorMessageHandler(error);
  }
};
