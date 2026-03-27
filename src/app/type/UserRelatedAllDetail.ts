import { UserDetail } from '@/types/interfaces';

export interface UserRelatedAllDetail {
  users?: UserDetail[];
  teams?: Team[];
}

export interface Team {
  _id?: string;
  name?: string;
}
