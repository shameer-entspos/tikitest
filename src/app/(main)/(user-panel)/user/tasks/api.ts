import { ErrorMessageHandler } from '@/app/helpers/error_handler';
import { AddedUserDetailModel } from '@/app/type/addedUserDetailModel';
import { UserDetail } from '@/types/interfaces';
import { AxiosInstance } from 'axios';
import { useQuery } from 'react-query';
import { AppModel } from '../apps/api';
import { ProjectDetail } from '@/app/type/projects';

export interface TaskModel {
  _id: string;
  name: string;
  description: string;
  taskId: string;
  dueDate: string;
  startDate?: string;
  endDate: string;
  repeatTask: string;
  repeatCount: number;
  sharing: string;
  dueDateStatus: string;
  customer: string | string[];
  monthCount: {
    type: string;
    weekNumber: number;
    weekDayNumber: number;
    dayNumber: number;
  };
  weekCount: {
    dayNumber: number[];
  };

  repeatTaskEndDate: string;
  isStarted: boolean;
  isAudit: boolean;
  userId: UserDetail;
  /** Single list of all assigned user IDs (internal + external). Task does not track source. */
  users?: string[];
  external?: string[];
  individualUsers?: string[];
  teamMembers?: string[];
  teams: string[];
  app: AppModel;
  projects: ProjectDetail[];
  createdAt: string;
  updatedAt: string;
  submitByMe?: {
    date: string;
  };
  isOrignal?: boolean;
  /** Task sharing mode: individual = all assignees must complete; shared = any one completes */
  shareAs?: 'individual' | 'shared' | string;
  /** Instance completion: "pending" | "completed". Set by backend when submitBy changes. */
  status?: 'pending' | 'completed';
  submitBy: { user: UserDetail; date: string }[];
}

/** Normalize user id from submitBy entry (handles populated user object or raw id). */
function submitByUserId(s: { user?: { _id?: string } | string; [key: string]: any }): string {
  const u = s?.user;
  if (u == null) return '';
  if (typeof u === 'string') return String(u);
  const id = (u as { _id?: string })?._id;
  return id != null ? String(id) : '';
}

/** Normalize assignee id (userId can be object with _id or string). */
function normalizeAssigneeId(v: { _id?: string } | string | null | undefined): string {
  if (v == null) return '';
  if (typeof v === 'string') return String(v);
  const id = (v as { _id?: string })?._id;
  return id != null ? String(id) : '';
}

/** All assignee user ids for this task (creator + users, or legacy individualUsers + teamMembers). */
export function getAssigneeIds(task: TaskModel | null | undefined): string[] {
  if (!task) return [];
  const ids: string[] = [];
  const add = (id: string) => id && ids.push(String(id));
  add(normalizeAssigneeId(task.userId));
  if (task.users?.length) {
    (task.users ?? []).forEach((id) => add(String(id)));
  } else {
    (task.individualUsers ?? []).forEach((id) => add(String(id)));
    (task.teamMembers ?? []).forEach((id) => add(String(id)));
  }
  return Array.from(new Set(ids));
}

/**
 * Task is completed: use status when present (backend sets it when submitBy changes).
 * Fallback to computed logic for tasks created before status existed.
 * - Shared: first submission = completed.
 * - Individual: all assignees submitted = completed.
 */
export function isTaskCompleted(task: TaskModel | null | undefined): boolean {
  if (!task) return false;
  if (task.status === 'completed') return true;
  if (task.status === 'pending') return false;
  // Fallback for tasks without status (legacy)
  if (!task?.submitBy) return false;
  const submittedIds = new Set(
    (task.submitBy ?? []).map((s: any) => submitByUserId(s)).filter(Boolean)
  );
  const shareAs = String(task.shareAs ?? 'individual').toLowerCase();
  if (shareAs === 'shared') return submittedIds.size > 0;
  const assigneeIds = getAssigneeIds(task);
  if (assigneeIds.length === 0) return submittedIds.size > 0;
  return assigneeIds.every((id) => submittedIds.has(id));
}

/** True if the given user has submitted/completed this task (user id exists in submitBy). */
export function hasCurrentUserSubmitted(
  task: TaskModel | null | undefined,
  currentUserId: string | undefined
): boolean {
  if (!task?.submitBy || !currentUserId) return false;
  const needle = String(currentUserId);
  return (task.submitBy ?? []).some(
    (s: any) => submitByUserId(s) === needle
  );
}

export const getlistOfAppProjects = async (
  axiosAuth: AxiosInstance,
  id: string
) => {
  try {
    const response = await axiosAuth.post(`user/app/listOfAppProjects`, {
      appId: id,
    });
    return response.data['projects'] as { _id: string; name: string }[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const currentUserAssignedProjects = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(
      `user/app/currentUserAssignedProjects`
    );
    return response.data['projects'] as ProjectDetail[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getMembersListOfProejcts = async (
  axiosAuth: AxiosInstance,
  ids: string[]
) => {
  try {
    const response = await axiosAuth.post(`user/task/listOfMembers`, {
      ids,
    });

    return response.data as {
      users: { firstName: string; lastName: string; _id: string }[];
      teams: { name: string; _id: string }[];
      externalUser: { firstName: string; lastName: string; _id: string }[];
    };
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

/** Teams with members populated (for task assignment: expand team to select/deselect members). */
export interface TeamWithMembers {
  _id: string;
  name: string;
  members: { _id: string; firstName?: string; lastName?: string; email?: string }[];
}

export const getTeamsWithMembers = async (
  axiosAuth: AxiosInstance,
  teamIds: string[]
): Promise<TeamWithMembers[]> => {
  try {
    if (!Array.isArray(teamIds) || teamIds.length === 0) return [];
    const response = await axiosAuth.post<{ teams: TeamWithMembers[] }>(
      'user/task/teamsWithMembers',
      { teamIds }
    );
    return response.data?.teams ?? [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message ?? 'Failed to load teams');
  }
};

export const createTask = async ({
  data,
  axiosAuth,
}: {
  data: any;

  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post('user/task/create', data);

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getAllTasks = async ({
  axiosAuth,
  isAdmin = false,
}: {
  axiosAuth: AxiosInstance;
  isAdmin: boolean;
}) => {
  try {
    const response = await axiosAuth.get(`user/task/list/${isAdmin}`);

    return response.data['tasks'] as TaskModel[];
    // const data = response.data["tasks"] as TaskModel[];

    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // const tasksDueToday = data.filter((task) => {
    //   const taskDueDate = new Date(task.dueDate);
    //   taskDueDate.setHours(0, 0, 0, 0);
    //   return (
    //     taskDueDate.getTime() === today.getTime() && task.submitByMe === null
    //   );
    // });
    // const tasksDueLater = data.filter((task) => {
    //   const taskDueDate = new Date(task.dueDate);
    //   taskDueDate.setHours(0, 0, 0, 0);
    //   return (
    //     taskDueDate.getTime() > today.getTime() && task.submitByMe === null
    //   );
    // });
    // const tasksDueBeforeToday = data.filter((task) => {
    //   const taskDueDate = new Date(task.dueDate);
    //   taskDueDate.setHours(0, 0, 0, 0);
    //   return (
    //     taskDueDate.getTime() < today.getTime() && task.submitByMe === null
    //   );
    // });
    // const taskSumitted = data.filter((task) => {
    //   return task.submitByMe !== null;
    // });
    // return {
    //   tasksDueToday,
    //   tasksDueLater,
    //   tasksDueBeforeToday,
    //   taskSumitted,
    //   data,
    // };
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getUserPermission = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/projectPermission`);
    return response.data as {
      projects: boolean;
      tasks: boolean;
      apps: boolean;
      contacts: boolean;
      externalFriends: boolean;
    };
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getRecentlyTask = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/task/recentTasklist`);
    const data = response.data['tasks'] as TaskModel[];
    return data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteTask = async ({
  axiosAuth,
  body,
  adminMode = false,
}: {
  axiosAuth: AxiosInstance;
  body: { id: string; removeBy: string };
  adminMode?: boolean;
}) => {
  try {
    const response = await axiosAuth.post(
      `user/task/delete?adminMode=${adminMode}`,
      { ...body, adminMode }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteManyTask = async ({
  axiosAuth,
  body,
  adminMode = false,
}: {
  axiosAuth: AxiosInstance;
  body: { ids: string[] };
  adminMode?: boolean;
}) => {
  try {
    const response = await axiosAuth.post(
      `user/task/destoryManyTasks?adminMode=${adminMode}`,
      { ...body, adminMode }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const markAsCompleteManyTask = async ({
  axiosAuth,
  body,
  adminMode = false,
}: {
  axiosAuth: AxiosInstance;
  body: { ids: string[] };
  adminMode?: boolean;
}) => {
  try {
    const response = await axiosAuth.post(
      `user/task/markAsCompleteManyTasks?adminMode=${adminMode}`,
      { ...body, adminMode }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const submitSignInTask = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post('user/task/submitTask', data, {
      headers: {
        'Content-Type': 'multipart/form-data', // Important for form data
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const editTask = async ({
  data,
  id,
  axiosAuth,
  adminMode = false,
}: {
  data: any;
  adminMode?: boolean;
  // {
  //   name: string;
  //   description: string;
  //   isAudit: boolean;
  //   dueDate: Date;
  //   external: string[];
  //   individualUsers: string[];
  //   teams: string[];
  //   app: string;
  //   projects: string[];
  //   repeatTask: string;
  //   repeatTaskEndDate?: Date;
  //   repeatCount?: Number;
  //   weekCount?: { dayNumber?: number[] };
  //   monthCount?: {
  //     type: "Day" | "Week" | undefined;
  //     dayNumber?: number;
  //     weekNumber?: number;
  //     weekDayNumber?: number;
  //   };
  // };

  id: string;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.put(
      `user/task/update/${id}?adminMode=${adminMode}`,
      { ...data, adminMode }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const trashTask = async ({
  axiosAuth,
  ids,
}: {
  axiosAuth: AxiosInstance;
  ids: string[];
}) => {
  console.log(ids);
  try {
    const response = await axiosAuth.post('user/task/taskTrash', {
      ids: ids,
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const searchUser = async (param: string, axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/task/search?query=${param}`);
    return response.data as AddedUserDetailModel[];
  } catch (error: any) {
    ErrorMessageHandler(error);
  }
};

export const useExternalUserSearchResults = ({
  param,
  axiosAuth,
}: {
  param: string;
  axiosAuth: AxiosInstance;
}) => {
  return useQuery(['externalUserSearchResults', param], () =>
    searchUser(param, axiosAuth)
  );
};
