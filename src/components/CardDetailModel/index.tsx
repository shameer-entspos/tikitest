import {
  BillingContext,
  BillingContextProps,
  billingReducer,
  initialState,
} from '@/app/(main)/(org-panel)/organization/billing/context';
import { useEffect, useReducer } from 'react';
import SavedCards from '../Organization/Billing/Cards/SavedCards';
import { getCards } from '../Organization/Billing/Cards/api';
import { useQuery } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useSession } from 'next-auth/react';
import { AppDispatch, RootState } from '@/store';
import { setOrgSidebarVisibility } from '@/store/sidebarSlice';
import { useDispatch, useSelector } from 'react-redux';
import { OrgSideBar } from '../SideBar';
import { SpinnerLoader } from '../SpinnerLoader';
interface SidebarItem {
  label: string;
  href?: string;
}

const sidebarItems: SidebarItem[] = [
  { label: 'Details', href: '/organization/organization-details' },
  { label: 'Users', href: '/organization/users' },
  { label: 'Teams', href: '/organization/teams' },
  { label: 'Global Permissions', href: '/organization/global-permissions' },
  { label: 'App Store', href: '/organization/app-store' },
  { label: 'Cloud Storage', href: '/organization/cloud-storage' },
  { label: 'Billing', href: '/organization/billing' },
];
const myAccount: SidebarItem[] = [
  { label: 'Details', href: '/organization/my-Details' },
  { label: ' Password & Security', href: '/organization/password-security' },
];
export default function CardDetailModel({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const reduxDispatch = useDispatch<AppDispatch>();
  const [state, dispatch] = useReducer(billingReducer, initialState);
  const contextValue: BillingContextProps = {
    state,
    dispatch,
  };
  const isVisible = useSelector(
    (state: RootState) => state.orgSidebar.isVisible
  );
  const axiosAuth = useAxiosAuth();
  const {
    data: card,
    isLoading,
    refetch,
  } = useQuery(
    'cards', // Match the query key used in SavedCards for proper invalidation
    () => getCards(axiosAuth),
    {
      enabled:
        status === 'authenticated' && !!session?.user?.accessToken && isVisible, // Only fetch if session is loaded, has access token, and sidebar is visible
      retry: false, // Don't retry on error - just show the card modal
    }
  );
  useEffect(() => {
    if (session?.user.user._id != undefined) {
      reduxDispatch(setOrgSidebarVisibility(true));
    }
    return () => {
      reduxDispatch(setOrgSidebarVisibility(false));
    };
  }, [session?.user.user._id]);

  if (!isVisible) {
    return (
      <section className="flex min-h-0 flex-1">
        <div className="h-full w-full">{children}</div>
      </section>
    );
  }

  if (isLoading) {
    return <SpinnerLoader />;
  }

  // Only show payment dialog if user is authenticated AND has no card
  // If user is not logged in (like on signup page), don't show payment dialog
  if (status === 'authenticated' && !!session?.user?.accessToken && !card) {
    return (
      <BillingContext.Provider value={contextValue}>
        <SavedCards
          onClose={async () => {
            // Refetch cards after closing to check if card was added
            await refetch();
          }}
        />
      </BillingContext.Provider>
    );
  }

  // Card exists - show normal layout. Use 118dvh so when scaled 0.75 we fill 100vh.
  return (
    <section className="flex min-h-0 flex-1">
      {isVisible && (
        <OrgSideBar
          organizationItems={sidebarItems}
          myAccountItems={myAccount}
        />
      )}
      <div
        className={`flex min-h-0 flex-1 flex-col ${isVisible ? 'w-full max-w-[1360px] custom:w-[calc(100%_-_250px)]' : 'w-full'}`}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-8 py-6 pb-0">
          <div className="flex min-h-full flex-1 flex-col">{children}</div>
        </div>
      </div>
    </section>
  );
}
