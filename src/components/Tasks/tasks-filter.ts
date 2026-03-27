import {
  hasCurrentUserSubmitted,
  isTaskCompleted,
  TaskModel,
} from '@/app/(main)/(user-panel)/user/tasks/api';
import { customSortFunction } from '@/app/helpers/re-use-func';

type TaskTab = 'upcoming' | 'overdue' | 'submission' | 'edit' | 'task' | undefined;

type BuildFilteredTasksInput = {
  tasks: TaskModel[];
  currentTab: TaskTab;
  currentUserId?: string;
  canUseAdminMode: boolean;
  adminMode: boolean;
  search: string;
  isApplyFilter: boolean;
  selectedProjects: string[];
  selectedApps: string[];
  selectedSharedTask: string[];
  selectedUsers: string[];
  selectedCustomer: string[];
  taskName: string;
  sortType: 'text' | 'date';
  sortName: 'asc' | 'desc';
  sortDate: 'asc' | 'desc';
};

function isOverdue(task: TaskModel): boolean {
  if (isTaskCompleted(task)) return false;
  const dueDate = task?.dueDate ? new Date(task.dueDate) : null;
  if (!dueDate) return false;

  const dueDay = new Date(dueDate);
  dueDay.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today.getTime() > dueDay.getTime();
}

export function buildFilteredTasks({
  tasks,
  currentTab,
  currentUserId,
  canUseAdminMode,
  adminMode,
  search,
  isApplyFilter,
  selectedProjects,
  selectedApps,
  selectedSharedTask,
  selectedUsers,
  selectedCustomer,
  taskName,
  sortType,
  sortName,
  sortDate,
}: BuildFilteredTasksInput): TaskModel[] {
  return tasks
    .filter((task) => {
      const isInstance = task?.isOrignal === false;

      if (canUseAdminMode && adminMode) {
        if (currentTab === 'upcoming') return isInstance && !isTaskCompleted(task);
        if (currentTab === 'overdue') return isInstance && isOverdue(task);
        if (currentTab === 'submission') return isTaskCompleted(task);
        if (currentTab === 'edit') return task?.isOrignal !== false;
        return true;
      }

      if (currentTab === 'submission') {
        return (
          (isTaskCompleted(task) ||
            hasCurrentUserSubmitted(task, currentUserId)) &&
          isInstance
        );
      }

      if (currentTab === 'upcoming') {
        return isInstance && !isTaskCompleted(task);
      }

      if (currentTab === 'overdue') {
        return isInstance && isOverdue(task);
      }

      if (currentTab === 'edit') {
        return task?.isOrignal !== false && task?.userId?._id === currentUserId;
      }

      return true;
    })
    .filter((task) =>
      `${task?.name}`.toLowerCase().includes(search.toLowerCase())
    )
    .filter((task) => {
      if (!isApplyFilter || selectedProjects.length === 0) return true;
      return (task.projects ?? []).some((project) =>
        selectedProjects.includes(project._id!)
      );
    })
    .filter((task) => {
      if (!isApplyFilter || selectedCustomer.length === 0) return true;

      const customers = Array.isArray(task.customer)
        ? task.customer
        : task.customer
          ? [task.customer]
          : [];

      return customers.some((customer) => selectedCustomer.includes(customer));
    })
    .filter((task) => {
      if (!isApplyFilter || selectedSharedTask.length === 0) return true;

      if (
        selectedSharedTask.includes('individual') &&
        selectedSharedTask.includes('shared')
      ) {
        return true;
      }

      if (selectedSharedTask.includes('individual')) {
        return task.shareAs === 'individual';
      }

      if (selectedSharedTask.includes('shared')) {
        return task.shareAs === 'shared';
      }

      return true;
    })
    .filter((task) => {
      if (!isApplyFilter || selectedApps.length === 0) return true;
      return selectedApps.includes(task.app?._id);
    })
    .filter((task) => {
      if (!isApplyFilter || selectedUsers.length === 0) return true;
      return selectedUsers.includes(task?.userId?._id ?? '');
    })
    .filter((task) => {
      if (!isApplyFilter || taskName.length === 0) return true;
      return task.name.includes(taskName);
    })
    .sort((a, b) => {
      if (sortType === 'text') {
        return customSortFunction({
          a: a.name,
          b: b.name,
          sortBy: sortName,
          type: 'text',
        });
      }

      const dueDateSort = customSortFunction({
        a: (a.dueDate || a.createdAt || '').toString(),
        b: (b.dueDate || b.createdAt || '').toString(),
        sortBy: sortDate,
        type: 'date',
      });
      if (dueDateSort !== 0) return dueDateSort;

      const startDateSort = customSortFunction({
        a: (a.startDate || a.dueDate || a.createdAt || '').toString(),
        b: (b.startDate || b.dueDate || b.createdAt || '').toString(),
        sortBy: sortDate,
        type: 'date',
      });
      if (startDateSort !== 0) return startDateSort;

      const createdAtSort = customSortFunction({
        a: (a.createdAt || '').toString(),
        b: (b.createdAt || '').toString(),
        sortBy: sortDate,
        type: 'date',
      });
      if (createdAtSort !== 0) return createdAtSort;

      return (a._id || '').localeCompare(b._id || '');
    });
}
