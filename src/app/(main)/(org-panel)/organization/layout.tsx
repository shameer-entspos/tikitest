'use client';

import { usePathname } from 'next/navigation';
import CardDetailModel from '@/components/CardDetailModel';
import { OrgBodyBackground } from './OrgBodyBackground';

function OrganizationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSignup = pathname === '/organization/signup';

  return (
    <>
      {!isSignup && <OrgBodyBackground />}
      <section
        className={`flex min-h-0 flex-1 flex-col ${isSignup ? 'bg-[#fafafa]' : 'bg-[#fafafa]'}`}
      >
        <CardDetailModel>{children}</CardDetailModel>
      </section>
    </>
  );
}
export default OrganizationLayout;
