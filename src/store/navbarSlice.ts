// store/navbarSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NavbarState {
  isVisible: boolean;
}

const initialState: NavbarState = {
  isVisible: true,
};

const navbarSlice = createSlice({
  name: 'navbar',
  initialState,
  reducers: {
    setNavbarVisibility: (state, action: PayloadAction<boolean>) => {
      state.isVisible = action.payload;
    },
  },
});

export const { setNavbarVisibility } = navbarSlice.actions;
export default navbarSlice.reducer;
