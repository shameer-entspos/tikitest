import { AxiosInstance } from 'axios';
import { StoragePlan } from '../cloud-storage/api';
import { AppStoreModel } from '../app-store/api';
import { UserDetail } from '@/types/interfaces';
import toast from 'react-hot-toast';

export interface SelectedPlan {
  _id: string;
  organization: string;
  storagePlan: StoragePlan;
  paymentStatus: string;
  paymentPaidAt: string;
  renewalAt: string;
  createdAt: string;
}

export interface PaymentPendingApps {
  _id: string;
  app: AppStoreModel;
  paymentStatus?: string;
  renwalAt?: string;

  paymentPaidAt?: string;
}

export const getSelectedStoragePlanPending = async (
  axiosAuth: AxiosInstance
) => {
  try {
    const response = await axiosAuth.get(
      `organization/organizationStoragePlan/list`
    );

    return response.data['organizationStoragePlan'] as SelectedPlan;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getInstalledAppPaymentPending = async (
  axiosAuth: AxiosInstance
) => {
  try {
    const response = await axiosAuth.get(`organization/app/paymentPendingApps`);

    return response.data['apps'] as PaymentPendingApps[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateLicenses = async ({
  axiosAuth,
  count,
}: {
  axiosAuth: AxiosInstance;
  count: String;
}) => {
  try {
    const response = await axiosAuth.post(
      `organization/updateUserLicenseValue/${count}`
    );

    return response.data['apps'] as PaymentPendingApps[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const processBilling = async ({
  axiosAuth,
  body,
}: {
  axiosAuth: AxiosInstance;
  body?: {
    appIds?: string[] | undefined;
    licenses?: number;
  };
}) => {
  try {
    const response = await axiosAuth.post(`organization/processPurchase`, body);

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getSubscriptionDetails = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`organization/subscriptionDetails/`);

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const cancelSubscription = async ({
  axiosAuth,
}: {
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post(`organization/cancelSubscription`);

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

// export const getCards = async (axiosAuth: AxiosInstance) => {
//   try {
//     const response = await axiosAuth.get('organization/card/list');

//     return response.data['cards'] as Card[];
//   } catch (error: any) {
//     throw new Error(error.response.data.message);
//   }
// };

export const getUserDetail = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get('organization/getUserDetail');

    return response.data['user'] as UserDetail;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getInvoices = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get('organization/card/getInvoices');

    return response.data['invoices'] as {
      id: string;
      total: number;
      invoice_pdf: string;
      hosted_invoice_url: string;
      created: string;
      period_start: string;
    }[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export interface BillingDetails {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    organization: {
      _id: string;
      name: string;
      email: string;
      accountPaymentStatus: string;
      subscriptionId: string | null;
      storagePlan?: {
        _id: string;
        storagePlan: {
          _id: string;
          totalStorageInGB: number;
          price: number;
        };
        paymentStatus: string;
        renewalAt?: string;
      };
      userLicense?: {
        _id: string;
        quantity: number;
        pricePerLicense: number;
      };
      currentActiveSubscription?: {
        _id: string;
        currentSubscriptionId: string;
        isCancelled: boolean;
        nextRenewalAt: string;
        latestInvoice: string | null;
      };
    };
  };
  card: {
    cardNumber: string;
    isDefault: boolean;
  } | null;
}

export const getBillingDetails = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get('organization/billing-details');

    return response.data['data'] as BillingDetails;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch billing details');
  }
};
