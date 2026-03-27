// store/navbarSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OrgSidebarState {
  isVisible: boolean;
}

const initialState: OrgSidebarState = {
  isVisible: false,
};

const orgSidebarSlice = createSlice({
  name: 'orgSidebar',
  initialState,
  reducers: {
    setOrgSidebarVisibility: (state, action: PayloadAction<boolean>) => {
      state.isVisible = action.payload;
    },
  },
});

export const { setOrgSidebarVisibility } = orgSidebarSlice.actions;
export default orgSidebarSlice.reducer;
