import { UserDetail } from '@/types/interfaces';
import { ProjectDetail } from './projects';
import { Site } from './Sign_Register_Sites';

export interface RollCall {
  _id: string;
  reviewStatus: 'public' | 'private';
  publicReviewEditable: boolean;
  projects: ProjectDetail[];
  sites: Site[];
  title: string;
  description: string;
  submittedBy: UserDetail;
  updatedBy: UserDetail;
  users: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    status: 'present' | 'absent';
  }[];
  rollNumber: number;
  createdAt: Date;
  updatedAt: Date;
}
