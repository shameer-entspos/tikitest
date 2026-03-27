import { KioskLockGuard } from './apps/sr/KioskLockGuard';

function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex min-h-[118dvh] flex-1 flex-col justify-center bg-[#fff]">
      <KioskLockGuard />
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#fff]">
        {children}
      </div>
    </section>
  );
}
export default UserLayout;
