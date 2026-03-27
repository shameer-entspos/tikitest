import { UserDetail } from '@/types/interfaces';
import { ProjectDetail } from './projects';

export interface TimeSheet {
  timeTracker: {
    hours: string;
    minutes: string;
  };
  _id: string;
  reference: string;
  referenceId: string;
  projects: ProjectDetail[];
  description: string;
  status: string;
  createdBy: UserDetail;
  trackerStarted: boolean;
  customer: string;
  deletedAt: string;
  createdAt: string;
  updatedAt: string;
  submittedDate: Date;
}

export interface DateRange {
  from?: Date;
  to?: Date;
}
