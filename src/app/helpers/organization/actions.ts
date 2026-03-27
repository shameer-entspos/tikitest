import { AddedUserDetailModel } from '@/app/type/addedUserDetailModel';
import { ACTIONTYPE, APPSTORETYPE, BILLINGTYPE } from './enums';
import { AddedTeamDetailModel } from '@/app/type/addedTeamDetailModel';
import { AppStoreModel } from '@/app/(main)/(org-panel)/organization/app-store/api';
import {
  PaymentPendingApps,
  SelectedPlan,
} from '@/app/(main)/(org-panel)/organization/billing/api';

export interface UserActions {
  type: ACTIONTYPE;
  userPayload?: AddedUserDetailModel | undefined;
  isVisiting?: boolean;
}

export interface TeamActions {
  type: ACTIONTYPE;
  teamPayload?: AddedTeamDetailModel | undefined;
  payload?: string | undefined;
  filters?: string[] | undefined;
  selectedUsers?: string[] | undefined;
}

export interface AppStoreActions {
  type: APPSTORETYPE;
  showModel?: 'install' | 'all';
  appStoreModel?: AppStoreModel;
}

export interface BillingActions {
  type: BILLINGTYPE;
  appIds?: PaymentPendingApps[];
  plan?: SelectedPlan | undefined;
  license?: number;
  showInvoice?: boolean;
  section?: 'manage' | 'checkout';
}
