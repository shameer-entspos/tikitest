import { UserDetail } from '@/types/interfaces';
import { SingleAsset } from './single_asset';
import { ProjectDetail } from './projects';

export interface Orderitinreray {
  _id: string;
  status: string;
  orderNumber: string;
  checkedOutBy: string[];
  checkedOutProject: ProjectDetail[];
  createdBy: UserDetail;
  assets: SingleAsset[];
  createdAt: Date;
  updatedAt: Date;
  condition: string;
}
