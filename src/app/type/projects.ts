import { UserDetail } from '@/types/interfaces';
import { AppModel } from '../(main)/(user-panel)/user/apps/api';
import { TaskModel } from '../(main)/(user-panel)/user/tasks/api';

export interface ProjectList {
  projects?: ProjectDetail[];
}

export interface ProjectDetail {
  _id: string;
  name: string;
  reference?: string;
  isGeneral?: boolean;
  isFavorited?: boolean;
  description?: string;
  address?: string;
  color?: string;
  date?: string;
  customer?: string;
  isOpen: boolean;
  projectType?: 'private' | 'public';
  // organizations?: Organization[];
  userId: UserDetail;
  users: UserElement[];

  projectId?: string;
  // individualUsers?: UserElement[];
  app: AppModel[];
  isStarred?: boolean;
  // app?: {
  //   user: {
  //     role: string;
  //   };
  //   app: {
  //     _id: string;
  //     name: string;
  //     description: string;
  //     type:string;
  //   };
  // }[];
  tasks: TaskModel[];
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  organization?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  role?: string;
}

export interface TeamElement {
  team?: TeamTeam;
  role?: string; // Role is optional and only used for UI state, not stored in DB
  // Teams can also be just the team object directly (when populated from DB)
  _id?: string; // For when team is just an ID or populated object
}

export interface TeamTeam {
  _id?: string;
  name?: string;
  description?: string;
  teamId?: string;
  color?: number;
}

export interface UserElement {
  user: UserDetail;
  role: string;
}
