// store/navbarSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  show_create_new_message?:
    | 'activity'
    | 'direct'
    | 'team'
    | 'project'
    | undefined;
  select_new_chat_filter: 'Projects' | 'Teams' | 'My Contacts';
}

const initialState: ChatState = {
  show_create_new_message: undefined,
  select_new_chat_filter: 'My Contacts',
};

const chatSlice = createSlice({
  name: 'chatSlice',
  initialState,
  reducers: {
    handleChatFilter: (
      state,
      action: PayloadAction<'Projects' | 'Teams' | 'My Contacts'>
    ) => {
      state.select_new_chat_filter = action.payload;
    },
    showNewMessageModel: (
      state,
      action: PayloadAction<
        'activity' | 'direct' | 'team' | 'project' | undefined
      >
    ) => {
      state.show_create_new_message = action.payload;
      state.select_new_chat_filter =
        action.payload == 'project'
          ? 'Projects'
          : action.payload == 'team'
            ? 'Teams'
            : 'My Contacts';
    },
  },
});

export const { showNewMessageModel, handleChatFilter } = chatSlice.actions;
export default chatSlice.reducer;
