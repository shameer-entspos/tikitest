import { StoragePlan } from '@/app/(main)/(org-panel)/organization/cloud-storage/api';

export interface User {
  user: UserDetail;
  teams: Team[] | null;
  message?: string | null | undefined;
  accessToken?: string;
  refreshToken?: string;
}
export interface UserDetail {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  userId: string;
  role: any;
  photo: string;
  phone: string;
  varifiedAt: Date | null;
  deletedAt: Date | null;
  active?: boolean;
  createdAt: Date;
  updatedAt: Date;
  customerName?: string;
  address?: string;
  reference?: string;
  setting: Setting | null;
  isOnline: boolean;
  organization: Organization | null;
}
export type Setting = {
  _id: string;
  language: string | null;
  date_format: string | null;
  time_zone: string | null;
};
export type Organization = {
  _id: string;
  orgId: string;
  name: string;
  email: string;
  phone: string | null;
  user: string;
  setting: Setting | null;
  storagePlan: {
    _id: string;
    paymentStatus: string;
    renewalAt: string;
    storagePlan: StoragePlan;
  };
  accountPaymentStatus: string;
  userLicense: {
    _id: string;
    quantity: number;
    pricePerLicense: number;
    deleteAt: string;
  };
  subscriptionId?: string;
  currentActiveSubscription?: SubscriptionId;
  stripeCustomerId: string;
  deletedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  __v: 0;
};
export interface SubscriptionId {
  _id: string;
  organization: string;
  nextRenewalAt: string;
  currentSubscriptionId: string;
  latestInvoice: string;
  currentPlanId: string;
  isCancelled: boolean;
  renewalAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
export type Team = {
  _id: string;
  name: string;
};
export type Teams = {
  _id: string;
};
