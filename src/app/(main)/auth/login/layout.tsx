import { AuthNavbar } from '@/components/loginForm/AuthNavbar';
import { handleSideBar } from '../../(org-panel)/organization/handleSidebar';
import { LoginBodyBackground } from './LoginBodyBackground';
import type { Metadata } from 'next';
import { loginMetadata } from '@/app/metadata';

export const metadata: Metadata = {
  ...loginMetadata,
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  handleSideBar(false);

  return (
    <>
      <LoginBodyBackground />
      <section className="flex min-h-[118dvh] w-full flex-col">
        <AuthNavbar />
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-6">
          {children}
        </div>
      </section>
    </>
  );
}
