import { UserDetail } from '@/types/interfaces';
import { ProjectDetail } from './projects';

export interface Site {
  _id: string;
  siteId: string;
  projects: ProjectDetail[];
  assignedCustomer: string;
  siteManagers: UserDetail[];
  siteName: string;
  addressLineOne: string;
  addressLineTwo: string;
  city: string;
  state: string;
  code: string;
  country: string;
  deleteCascade: boolean;
  deletedOn: null;
  createdBy: UserDetail;
  updatedBy: UserDetail;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
