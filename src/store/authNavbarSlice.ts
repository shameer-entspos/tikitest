// store/navbarSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthNavbarState {
  loginType: string;
}

const initialState: AuthNavbarState = {
  loginType: 'user',
};

const authNavbarSlice = createSlice({
  name: 'authNavbar',
  initialState,
  reducers: {
    setLoginType: (state, action: PayloadAction<string>) => {
      console.log(action.payload);
      state.loginType = action.payload;
    },
  },
});

export const { setLoginType } = authNavbarSlice.actions;
export default authNavbarSlice.reducer;
