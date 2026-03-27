import { AuthNavbar } from '@/components/loginForm/AuthNavbar';
import { handleSideBar } from '../handleSidebar';
import { SignupBodyBackground } from './SignupBodyBackground';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a new Tiki organization account',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  handleSideBar(false);

  return (
    <>
      <SignupBodyBackground />
      <section className="flex min-h-[118dvh] w-full flex-col">
        <AuthNavbar />
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-scroll">
          {children}
        </div>
      </section>
    </>
  );
}
