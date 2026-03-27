import { AddedUserDetailModel } from './addedUserDetailModel';

export interface AddedTeamDetailModelRoot {
  message: string;
  teams: AddedTeamDetailModel[];
}

export interface AddedTeamDetailModel {
  _id: string;
  name?: string | null;
  description?: string | null;
  teamId?: string | null;
  color?: string;

  members?: AddedUserDetailModel[];
  createdAt?: string | null;
  updatedAt?: string | null;
  __v?: number | null;
}
