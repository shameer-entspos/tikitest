import { UserDetail } from '@/types/interfaces';
import { SingleAsset } from './single_asset';

export interface GroupService {
  _id: string;
  name: string;
  description: string;
  createdBy?: UserDetail;
  customer?: string;
  managers?: UserDetail[];
  assets: SingleAsset[];
  createdAt: Date;
  updatedAt: Date;
}
