import { CHATTYPE } from '@/app/helpers/user/enums';
import { chatSocket, socket } from '@/app/helpers/user/socket.helper';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useQueryClient, useQuery } from 'react-query';

import { Message, getTeamsChat } from './api';
import { useChatCotnext } from './context';

const useTeamChats = () => {
  const context = useChatCotnext();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const session = useSession();

  useEffect(() => {
    //TODO private team message
    chatSocket.on('privateTeamMessage', (message) => {
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
    chatSocket.on('clearTeamChat', (response) => {
      const { roomId } = response;
      queryClient.invalidateQueries(`messages${context.state.roomDetail?._id}`);
    });

    /// team leave
    chatSocket.on('teamLeave', (response) => {
      const { success, roomId } = response;
      if (success) {
        if (context.state.roomDetail?._id === roomId) {
          queryClient.invalidateQueries(`teamsRoom`).then((v) => {
            context.dispatch({ type: CHATTYPE.UPDATEROOMDETAIL });
          });
        }
      }
    });

    chatSocket.on('deleteTeamMessage', (response) => {
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
      chatSocket.off('deleteTeamMessage');
      chatSocket.off('clearTeamChat');
      chatSocket.off('privateTeamMessage');

      chatSocket.off('teamLeave');
    };
  }, [context, queryClient, session.data?.user.user._id]);

  useEffect(() => {
    if (context.state.roomDetail) {
      socket.emit('check_seen_count', {
        userId: session.data?.user.user._id,
        organizationId: session.data?.user.user.organization?._id,
      });
      if (context.state.roomDetail.type === 'team') {
        chatSocket.emit('seenTeamCountChange', {
          roomId: context.state.roomDetail?._id,
          userId: (context.state.roomDetail as any).senderId,
        });
      }
    }
    return () => {
      if (context.state.roomDetail) {
        if (context.state.roomDetail.type === 'team') {
          chatSocket.emit('seenTeamCountChange', {
            roomId: context.state.roomDetail?._id,
            userId: (context.state.roomDetail as any).senderId,
          });
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //TODO get all messages
  const { data: messages } = useQuery<Message[]>({
    queryKey: `messages${context.state.roomDetail?._id}`,
    queryFn: () => getTeamsChat(axiosAuth, context.state.roomDetail?._id!),
  });

  return { messages };
};

export default useTeamChats;
