import {
  ProjectRooms,
  TeamRooms,
  deleteProjectChannel,
} from '@/app/(main)/(user-panel)/user/chats/api';
import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import { CHATTYPE } from '@/app/helpers/user/enums';
import { chatSocket } from '@/app/helpers/user/socket.helper';
import {
  Avatar,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@nextui-org/react';
import { Button } from '../Buttons';
import CustomInfoModal from '../CustomDeleteModel';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import Loader from '../DottedLoader/loader';

export function TeamWarningDialog({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
}) {
  const context = useChatCotnext();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deleteProjectChannelMutation = useMutation(deleteProjectChannel, {
    onSuccess: () => {
      context.dispatch({ type: CHATTYPE.SHOWWARNINGDIALOG });
      context.dispatch({ type: CHATTYPE.CHANGETAB });
      queryClient.invalidateQueries('projectRooms');
      toast.success('Channel deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const actionType = context.state.warningPayload?.actiontype;
  const payloadType = context.state.warningPayload?.type;

  const handleDeleteAction = () => {
    if (actionType === 'deleteChannel' && payloadType === 'project') {
      // Delete project channel
      deleteProjectChannelMutation.mutate({
        axiosAuth,
        roomId: context.state.roomDetail?._id ?? '',
      });
    } else if (actionType === 'delete') {
      // Clear chat - emit socket event
      chatSocket.emit('clearProjectChat', {
        roomId: context.state.roomDetail?._id,
        userId: (context.state.roomDetail as any).senderId,
      });
      context.dispatch({ type: CHATTYPE.SHOWWARNINGDIALOG });
    } else if (actionType === 'leave') {
      // Leave channel - emit socket event
      chatSocket.emit('projectLeave', {
        roomId: context.state.roomDetail?._id,
        userId: (context.state.roomDetail as any).senderId,
      });
      context.dispatch({ type: CHATTYPE.SHOWWARNINGDIALOG });
    }
  };

  const getTitle = () => {
    if (actionType === 'leave') return 'Leave Channel';
    if (actionType === 'deleteChannel') return 'Delete Channel';
    return 'Clear Chat';
  };

  const getSubtitle = () => {
    const isProject = payloadType === 'project';
    const channelType = isProject ? "Project's" : "Team's";

    if (actionType === 'leave')
      return `Are you sure you want to leave this ${channelType} Channel?`;
    if (actionType === 'deleteChannel')
      return `Are you sure you want to DELETE this ${channelType} Channel? This action cannot be undone.`;
    return 'Are you sure want to DELETE all messages in this channel?';
  };

  const getDoneValue = () => {
    if (actionType === 'deleteChannel') {
      return deleteProjectChannelMutation.isLoading ? <Loader /> : 'Delete';
    }
    if (actionType === 'leave') return 'Leave';
    return 'Clear';
  };

  const getVariant = () => {
    if (actionType === 'leave') return 'primary';
    return 'danger';
  };

  return (
    <>
      <CustomInfoModal
        handleClose={() => {
          context.dispatch({ type: CHATTYPE.SHOWWARNINGDIALOG });
        }}
        imageValue={
          context.state.warningPayload?.actiontype === 'leave'
            ? '/svg/info_warn.svg'
            : undefined
        }
        title={getTitle()}
        isOpen={isOpen}
        subtitle={getSubtitle()}
        onDeleteButton={handleDeleteAction}
        variant={getVariant()}
        doneValue={getDoneValue()}
      />
    </>
  );
}
