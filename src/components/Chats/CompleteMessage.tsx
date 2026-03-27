import { Message } from '@/app/(main)/(user-panel)/user/chats/api';
import { useSession } from 'next-auth/react';
import MessageCard from './MessageCard';

export function SignleMessage({
  message,
  whereToCome,
}: {
  message: Message;
  whereToCome: 'direct' | 'team' | 'project';
}) {
  const session = useSession();
  const isSender = message.sender._id === session.data?.user.user._id; // Adjust this condition based on your sender identification logic
  const messageClass = isSender ? 'justify-end' : 'justify-start';

  return (
    <div
      key={message._id}
      className={`flex flex-col p-2 px-6`}
      id={message._id}
    >
      <MessageCard
        message={message}
        isSender={isSender}
        messageClass={messageClass}
        whereToCome={whereToCome}
      />
    </div>
  );
}
export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
