import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ContactState {
  section: 'direct' | 'contact';
}

const initialState: ContactState = {
  section: 'contact',
};

const contactSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    setSection: (state, action: PayloadAction<'direct' | 'contact'>) => {
      state.section = action.payload;
    },
  },
});

export const { setSection } = contactSlice.actions;
export default contactSlice.reducer;
