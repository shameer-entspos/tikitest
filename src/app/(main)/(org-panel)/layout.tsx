import { ConditionalOrgNavbar } from '@/components/OrgNavbar/ConditionalOrgNavbar';
import type { Metadata, Viewport } from 'next';
import { orgPanelMetadata } from '@/app/metadata';

export const metadata: Metadata = {
  ...orgPanelMetadata,
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};
function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex min-h-[118dvh] flex-col">
      <ConditionalOrgNavbar />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}
export default AdminPanelLayout;
