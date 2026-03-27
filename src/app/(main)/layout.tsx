'use client';
import { socket } from '@/app/helpers/user/socket.helper';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
async function socketConnection(id: string) {
  if (socket.connected) {
    console.log('connected already');
  } else {
    console.log('called here');
    if (id !== undefined) {
      socket.connect();
    }
  }
}
const MainPanelLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user.user._id != undefined) {
      socketConnection(session?.user.user._id.toString());
    }
  }, [session?.user.user._id]);
  return <main className="min-h-screen">{children}</main>;
};

export default MainPanelLayout;
