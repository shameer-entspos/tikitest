import { ErrorMessageHandler } from '@/app/helpers/error_handler';
import { AddedTeamDetailModel } from '@/app/type/addedTeamDetailModel';
import { AddedUserDetailModel } from '@/app/type/addedUserDetailModel';
import { AxiosInstance } from 'axios';
import toast from 'react-hot-toast';

import { useQuery } from 'react-query';

export const createTeam = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post('organization/team/create', data);
    return response.data;
  } catch (error: any) {
    console.log('Error in create ' + error.response.data.message);
    toast.error(error.response.data.message);
    throw new Error(error.response.data.message);
  }
};

export const deleteTeam = async ({
  id,
  axiosAuth,
}: {
  id: string;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.delete(`organization/team/delete/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const editTeam = async ({
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
      `organization/team/update/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    console.log(error.response.data.message);
    toast.error(error.response.data.message);
    throw new Error(error.response.data.message);
  }
};

export const getTeams = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get('organization/team/list');

    return response.data['teams'] as AddedTeamDetailModel[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const searchUser = async (param: string, axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(
      `organization/team/search?search=${param}`
    );
    return response.data as AddedUserDetailModel[];
  } catch (error: any) {
    ErrorMessageHandler(error);
  }
};

export function useSearchResults(searchTerm: string, axiosAuth: AxiosInstance) {
  return useQuery(['search', searchTerm], () =>
    searchUser(searchTerm, axiosAuth)
  );
}
