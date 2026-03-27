// hooks/useChat.ts
import { CHATTYPE } from '@/app/helpers/user/enums';
import { chatSocket, socket } from '@/app/helpers/user/socket.helper';
import useAxiosAuth from '@/hooks/AxiosAuth';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { io } from 'socket.io-client';

import { ChatRooms, getRoomChat, Message, sendMessage } from './api';
import { useChatCotnext } from './context';
import useShowNotification from './useNotification';

const useChat = () => {
  const context = useChatCotnext();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const session = useSession();

  useEffect(() => {
    //TODO private message
    chatSocket.on('privateMessage', (message) => {
      const newData = message['message'] as Message;
      if (newData) {
        if (newData.roomId === context.state.roomDetail?._id) {
          // Update the messages list when a new message is received

          queryClient.setQueryData<Message[]>(
            `messages${context.state.roomDetail?._id}`,
            (prev) => {
              return prev ? [...prev, newData] : [newData];
            }
          );
        }
      }
    });
    //TODO clear private chat
    chatSocket.on('clearChat', (response) => {
      queryClient.invalidateQueries(`messages${context.state.roomDetail?._id}`);
    });

    chatSocket.on('deleteMessage', (response) => {
      const { id, userId } = response;

      if (
        context.state.roomDetail &&
        'senderId' in context.state.roomDetail &&
        (context.state.roomDetail as any).senderId === userId
      ) {
        const allMessages =
          queryClient.getQueryData<Message[]>(
            `messages${context.state.roomDetail?._id}`
          ) ?? [];
        const updatedMessages = allMessages.filter(
          (message) => message._id !== id
        );

        queryClient.setQueryData<Message[]>(
          `messages${context.state.roomDetail?._id}`,
          updatedMessages
        );
      }
    });

    return () => {
      chatSocket.off('deleteMessage');
      chatSocket.off('clearChat');
      chatSocket.off('privateMessage');
    };
  }, [context.state.roomDetail, queryClient, session.data?.user.user._id]);

  useEffect(() => {
    if (context.state.roomDetail != undefined) {
      socket.emit('check_seen_count', {
        userId: session.data?.user.user._id,
        organizationId: session.data?.user.user.organization?._id,
      });
      if (
        context.state.roomDetail &&
        'type' in context.state.roomDetail &&
        context.state.roomDetail.type === 'direct' &&
        'senderId' in context.state.roomDetail
      ) {
        chatSocket.emit('seenCountChange', {
          roomId: context.state.roomDetail?._id,
          userId: (context.state.roomDetail as any).senderId,
        });
      }
    }
    return () => {
      if (
        context.state.roomDetail != undefined &&
        'type' in context.state.roomDetail &&
        context.state.roomDetail.type === 'direct' &&
        'senderId' in context.state.roomDetail
      ) {
        chatSocket.emit('seenCountChange', {
          roomId: context.state.roomDetail?._id,
          userId: (context.state.roomDetail as any).senderId,
        });
      }
    };
  }, [context.state.roomDetail]);

  //TODO get all messages
  const { data: messages } = useQuery<Message[]>({
    queryKey: `messages${context.state.roomDetail?._id}`,
    queryFn: () => getRoomChat(axiosAuth, context.state.roomDetail?._id!),
  });

  return { messages };
};

export default useChat;
