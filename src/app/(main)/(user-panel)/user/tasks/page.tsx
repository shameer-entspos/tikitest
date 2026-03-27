'use client';
import { Tasks } from '@/components/Tasks';
import { useReducer } from 'react';
import {
  TaskContext,
  TaskContextProps,
  taskinitialState,
  taskReducer,
} from './context';
export default function Page() {
  const [state, dispatch] = useReducer(taskReducer, taskinitialState);

  const contextValue: TaskContextProps = {
    state,
    dispatch,
  };
  return (
    <TaskContext.Provider value={contextValue}>
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-start">
        <Tasks />
      </div>
    </TaskContext.Provider>
  );
}
