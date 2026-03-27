import { UserDetail } from '@/types/interfaces';
import { DiscussionTopic } from './discussion_topic';
import { ProjectDetail } from './projects';

export interface SafetyMeetings {
  _id: string;
  entryId: string;
  projects: ProjectDetail[];
  topics: DiscussionTopic[];
  attendance: UserDetail[];
  name: string;
  leader: string;
  agenda: string;
  allowPublicToEdit: boolean;
  viewStatus: string;
  submittedBy: UserDetail;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
