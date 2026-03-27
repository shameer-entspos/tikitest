import { AppStoreModel } from '@/app/(main)/(org-panel)/organization/app-store/api';
import {
  PaymentPendingApps,
  SelectedPlan,
} from '@/app/(main)/(org-panel)/organization/billing/api';
import { AddedTeamDetailModel } from '@/app/type/addedTeamDetailModel';
import { AddedUserDetailModel } from '@/app/type/addedUserDetailModel';

export interface UserState {
  showUserModel: boolean;
  selectedUser?: AddedUserDetailModel | undefined;
  isVisiting?: boolean;
}

export interface TeamState {
  showUserModel: boolean;
  selectedTeam?: AddedTeamDetailModel;
  searchText?: string | undefined;
  filters?: string[] | undefined;
  selectedUsers?: string[] | undefined;
}

export interface AppStoreState {
  showModel?: 'install' | 'all';
  showAppModel?: boolean;
  appStoreModel?: AppStoreModel;
}

export interface BillingState {
  appIds?: PaymentPendingApps[];
  plan?: SelectedPlan | undefined;
  license?: number;
  showInvoice?: boolean;
  section?: 'manage' | 'checkout';
}
