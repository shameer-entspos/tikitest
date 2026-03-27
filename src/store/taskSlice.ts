// store/taskSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TaskState {
  sortType: 'text' | 'date';
  sortName: 'asc' | 'desc';
  sortDate: 'asc' | 'desc';
  addTaskModel?: 'detail' | 'members';
}

const initialState: TaskState = {
  sortType: 'date',
  sortName: 'desc',
  sortDate: 'desc',
  addTaskModel: undefined,
};

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    handleSorting: (
      state,
      action: PayloadAction<{
        sortType: 'text' | 'date';
        sortName: 'asc' | 'desc';
        sortDate: 'asc' | 'desc';
      }>
    ) => {
      state.sortType = action.payload.sortType;
      state.sortName = action.payload.sortName;
      state.sortDate = action.payload.sortDate;
    },
    handleAddTaskModel: (
      state,
      action: PayloadAction<'detail' | 'members' | undefined>
    ) => {
      state.addTaskModel = action.payload;
    },
  },
});

export const { handleSorting, handleAddTaskModel } = taskSlice.actions;
export default taskSlice.reducer;
