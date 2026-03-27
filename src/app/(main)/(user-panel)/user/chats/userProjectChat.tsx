// hooks/useChat.ts
import { CHATTYPE } from '@/app/helpers/user/enums';
import { chatSocket, socket } from '@/app/helpers/user/socket.helper';
import useAxiosAuth from '@/hooks/AxiosAuth';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { getProjectChat, getRoomChat, Message, sendMessage } from './api';
import { useChatCotnext } from './context';

const useProjectChats = () => {
  const context = useChatCotnext();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const session = useSession();

  useEffect(() => {
    //TODO private message
    chatSocket.on('ProjectMessage', (message) => {
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
    chatSocket.on('clearProjectChat', (response) => {
      queryClient.invalidateQueries(`messages${context.state.roomDetail?._id}`);
    });

    /// projectLeave leave
    chatSocket.on('projectLeave', (response) => {
      const { success, roomId } = response;
      if (success) {
        if (context.state.roomDetail?._id === roomId) {
          queryClient.invalidateQueries(`projectRooms`).then((v) => {
            context.dispatch({ type: CHATTYPE.UPDATEROOMDETAIL });
          });
        }
      }
    });

    chatSocket.on('deleteProjectMessage', (response) => {
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
      // queryClient.invalidateQueries(`messages${context.state.roomDetail?._id}`);
    });

    return () => {
      chatSocket.off('pinnedChatToggle');
      chatSocket.off('deleteProjectMessage');
      chatSocket.off('clearProjectChat');
      chatSocket.off('ProjectMessage');
      chatSocket.off('projectLeave');
    };
  }, [context, queryClient]);
  useEffect(() => {
    if (context.state.roomDetail != undefined) {
      socket.emit('check_seen_count', {
        userId: session.data?.user.user._id,
        organizationId: session.data?.user.user.organization?._id,
      });
      if (
        context.state.roomDetail &&
        'type' in context.state.roomDetail &&
        context.state.roomDetail.type === 'project' &&
        'senderId' in context.state.roomDetail
      ) {
        chatSocket.emit('seenProjectCountChange', {
          roomId: context.state.roomDetail?._id,
          userId: (context.state.roomDetail as any).senderId,
        });
      }
    }
    return () => {
      if (context.state.roomDetail != undefined) {
        if (context.state.roomDetail.type === 'project') {
          chatSocket.emit('seenProjectCountChange', {
            roomId: context.state.roomDetail?._id,
            userId: (context.state.roomDetail as any).senderId,
          });
        }
      }
    };
  }, [context.state.roomDetail]);
  //TODO get all messages
  const { data: messages } = useQuery<Message[]>({
    queryKey: `messages${context.state.roomDetail?._id}`,
    queryFn: () => getProjectChat(axiosAuth, context.state.roomDetail?._id!),
  });

  return { messages };
};

export default useProjectChats;
