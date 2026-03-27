'use client';
import { chatSocket, socket } from '@/app/helpers/user/socket.helper';
import { UserNavbar } from '@/components/UserNavbar/UserNavbar';
import { RootState } from '@/store';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

async function socketConnection(id: string) {
  if (socket.connected) {
  } else {
    if (id !== undefined) {
      socket.connect();
      chatSocket.connect();
      await new Promise((resolve) => setTimeout(resolve, 2000));
      socket.emit('activeUser', id);
    }
  }
}
const UserPanelLayout = ({ children }: { children: React.ReactNode }) => {
  const isNavbarVisible = useSelector(
    (state: RootState) => state.navbar.isVisible
  );

  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user.user._id != undefined) {
      socketConnection(session?.user.user._id.toString());
    }
  }, [session?.user.user._id]);
  return (
    <section className="flex min-h-[118dvh] flex-col overflow-hidden">
      {isNavbarVisible && <UserNavbar />}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </section>
  );
};

export default UserPanelLayout;
