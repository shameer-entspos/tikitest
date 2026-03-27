import { AxiosInstance } from 'axios';
import toast from 'react-hot-toast';

export interface Card {
  _id: string;
  email?: string;
  firstName: string;
  lastName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  organization: string;
  firstNameBillingAddress?: string;
  lastNameBillingAddress?: string;
  addressLineOne?: string;
  addressLineTwo?: string;
  city?: string;
  state?: string;
  code?: string;
  country?: any;
  isDefault: boolean;
}
export const createCard = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post('organization/card/create', data);
    return response.data;
  } catch (error: any) {
    console.log('Error in create ' + error.response.data.message);
    toast.error(error.response.data.message);
    throw new Error(error.response.data.message);
  }
};

export const deleteCard = async ({
  id,
  axiosAuth,
}: {
  id: string;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.delete(`organization/card/delete/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const editCard = async ({
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
      `organization/card/update/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    console.log(error.response.data.message);
    toast.error(error.response.data.message);
    throw new Error(error.response.data.message);
  }
};

export const getCards = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get('organization/card/list');

    return response.data['cards'] as Card;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

// export const getDefaultCard = async (axiosAuth: AxiosInstance) => {
//   try {
//     const response = await axiosAuth.get('organization/card/getDefaultCard');

//     return response.data['cards'] as Card;
//   } catch (error: any) {
//     throw new Error(error.response.data.message);
//   }
// };

export const setDefaultCard = async ({
  id,
  axiosAuth,
}: {
  id: string;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.get(`organization/card/default/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
