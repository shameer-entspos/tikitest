import { getRecentlyTask } from '@/app/(main)/(user-panel)/user/tasks/api';
import useAxiosAuth from '@/hooks/AxiosAuth';

import { useQuery, useQueryClient } from 'react-query';
import Loader from '../DottedLoader/loader';
import {
  taskReducer,
  taskinitialState,
  TaskContextProps,
  TaskContext,
} from '@/app/(main)/(user-panel)/user/tasks/context';
import { useReducer } from 'react';
import { TASKTYPE } from '@/app/helpers/user/enums';
import { TaskDetail } from '../Tasks/TaskDetail';
import {
  checkDateIsDue,
  formatDateTime,
  formatDateTimeWithLabels,
} from '@/utils';
function Upcoming() {
  const axiosAuth = useAxiosAuth();
  const [state, dispatch] = useReducer(taskReducer, taskinitialState);

  const contextValue: TaskContextProps = {
    state,
    dispatch,
  };

  const { data, isLoading } = useQuery({
    queryKey: 'recentTaskList',
    queryFn: () => getRecentlyTask(axiosAuth),
  });
  if (isLoading) {
    return (
      <div className="grid h-60 w-full place-content-center">
        <Loader />
      </div>
    );
  }
  return (
    <TaskContext.Provider value={contextValue}>
      <div className="w-full flex-col">
        <div className="flex items-center justify-between">
          <h1 className="w-[170px] text-center text-[20px] font-semibold text-black sm:text-start lg:w-[290px]">
            Pending Tasks
          </h1>
          <h2 className="text-[#616161]">Due</h2>
        </div>
        <div className="mt-2 space-y-4">
          {(data ?? []).map((p) => {
            return (
              <div
                key={p._id}
                className="flex min-h-[80px] cursor-pointer justify-between rounded-lg bg-white px-2 py-3 xl:px-6 xl:py-3"
                style={{ boxShadow: '0px 2px 8px 0px #00000033' }}
                onClick={() => {
                  dispatch({
                    type: TASKTYPE.SHOWTASKMODAL,
                    showTaskModal: 'detail',
                    taskModel: p,
                  });
                }}
              >
                <div className="flex flex-col justify-between">
                  <p className="text-sm font-medium text-black xl:text-[14px]">
                    {p.name}
                  </p>
                  <span className="text-xs text-gray-700 xl:text-[14px]">
                    {p.description}
                  </span>
                </div>
                <div className="flex flex-col items-end justify-between font-normal">
                  <p
                    className={`text-sm ${checkDateIsDue(p.dueDate) ? 'text-red-400' : formatDateTimeWithLabels(p.dueDate ?? '')?.date == 'Today' ? 'text-primary-500' : 'text-[#616161]'}`}
                  >
                    {checkDateIsDue(p.dueDate)
                      ? 'Overdue'
                      : formatDateTimeWithLabels(p.dueDate ?? '')?.date || ''}
                  </p>

                  <span className="text-sm font-normal text-gray-700">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.90684 1.00904C8.85614 0.96026 8.79633 0.921947 8.73083 0.896286C8.66532 0.870624 8.5954 0.858115 8.52506 0.859475C8.383 0.862221 8.24785 0.921288 8.14934 1.02368C8.05083 1.12607 7.99704 1.2634 7.99978 1.40546C8.00253 1.54752 8.06159 1.68267 8.16399 1.78118L14.0747 7.46689L0.6797 7.46689C0.53762 7.46689 0.401358 7.52334 0.300892 7.6238C0.200426 7.72427 0.143986 7.86053 0.143986 8.00261C0.143986 8.14469 0.200426 8.28095 0.300892 8.38142C0.401358 8.48188 0.53762 8.53832 0.6797 8.53832H14.0733L8.16327 14.2226C8.11257 14.2714 8.07198 14.3297 8.0438 14.3941C8.01563 14.4586 8.00043 14.528 7.99907 14.5983C7.99771 14.6687 8.01021 14.7386 8.03588 14.8041C8.06154 14.8696 8.09985 14.9294 8.14863 14.9801C8.1974 15.0308 8.25569 15.0714 8.32016 15.0996C8.38462 15.1278 8.45401 15.143 8.52435 15.1443C8.59469 15.1457 8.66461 15.1332 8.73011 15.1075C8.79562 15.0818 8.85543 15.0435 8.90613 14.9948L15.6404 8.51689C15.7097 8.45025 15.7647 8.37032 15.8024 8.28189C15.84 8.19346 15.8594 8.09835 15.8594 8.00225C15.8594 7.90615 15.84 7.81104 15.8024 7.72261C15.7647 7.63418 15.7097 7.55425 15.6404 7.48761L8.90684 1.00904Z"
                        fill="#0063F7"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {state.showTaskModal === 'detail' && <TaskDetail />}
    </TaskContext.Provider>
  );
}

export default Upcoming;
