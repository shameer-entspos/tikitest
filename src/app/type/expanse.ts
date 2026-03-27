import { UserDetail } from '@/types/interfaces';
import { ProjectDetail } from './projects';

export interface Expanse {
  _id: string;
  projects: ProjectDetail[];
  reference: string;
  invoiceValue: string;
  referenceId: string;
  description: string;
  status: string;
  createdBy: UserDetail;
  images: any[];
  customer: string;
  supplier: string;
  deletedAt: null;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
