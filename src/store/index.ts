// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import navbarReducer from './navbarSlice';
import orgSidebarSlice from './sidebarSlice';
import authNavbarSlice from './authNavbarSlice';
import contactSlice from './contactSlice';
import taskSlice from './taskSlice';
import chatSlice from './chatSlice';
const store = configureStore({
  reducer: {
    navbar: navbarReducer,
    orgSidebar: orgSidebarSlice,
    authNavbar: authNavbarSlice,
    contactSection: contactSlice,
    task: taskSlice,
    chat: chatSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
