import { UserDetail } from '@/types/interfaces';

export interface ServiceLog {
  _id: string;
  assets: string[];
  serviceCost: string;
  logId: string;
  description: string;
  purchaseNote: string;
  images: string[];
  vendor: UserDetail;
  createdBy: UserDetail;
  serviceDate: Date;

  createdAt: Date;
  updatedAt: Date;
}
