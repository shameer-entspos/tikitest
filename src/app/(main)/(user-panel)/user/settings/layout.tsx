'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { AppDispatch } from '@/store';
import { setOrgSidebarVisibility } from '@/store/sidebarSlice';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { UserSideBar } from './UserSidebar';
interface SidebarItem {
  label: string;
  href?: string;
}

const myAccount: SidebarItem[] = [
  { label: 'Details', href: '/user/settings' },
  { label: ' Password & Security', href: '/user/settings/password-security' },
];
function OrganizationLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const reduxDispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    if (session?.user.user._id != undefined) {
      reduxDispatch(setOrgSidebarVisibility(true));
    }
    return () => {
      reduxDispatch(setOrgSidebarVisibility(false));
    };
  }, [session?.user.user._id]);
  const isVisible = useSelector(
    (state: RootState) => state.orgSidebar.isVisible
  );
  return (
    <section className="bg- flex min-h-0 flex-col">
      <section className="flex">
        {isVisible && <UserSideBar myAccountItems={myAccount} />}
        <div
          className={`${isVisible ? 'h-[calc(var(--app-vh)_-_72px)] w-full px-8 py-6 pb-0' : 'h-full w-full'}`}
        >
          {children}
        </div>
      </section>
    </section>
  );
}
export default OrganizationLayout;
