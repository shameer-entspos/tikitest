'use client';
import { chatSocket, socket } from '@/app/helpers/user/socket.helper';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

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
export default function AppStoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user.user._id != undefined) {
      socketConnection(session?.user.user._id.toString());
    }
  }, [session?.user.user._id]);
  return (
    <section className="h-[calc(var(--app-vh)_-_64px)] overflow-y-auto p-5">
      {children}
    </section>
  );
}
