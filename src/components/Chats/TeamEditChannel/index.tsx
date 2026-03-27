import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import { CHATTYPE } from '@/app/helpers/user/enums';
import {
  Avatar,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@nextui-org/react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';

import { Input } from '../../Form/Input';
import { Button } from '../../Buttons';

import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  createTeamRoom,
  getSingleTeamMembers,
  TeamRooms,
} from '@/app/(main)/(user-panel)/user/chats/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import Loader from '@/components/DottedLoader/loader';
import { useEffect } from 'react';
import { TeamRoomMembers } from '../AddFriend/teamMembers';
import { TeamForm } from '../AddFriend/teamForm';
export function TeamEditChannel({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
}) {
  const context = useChatCotnext();
  const axiosAuth = useAxiosAuth();
  const { data, isLoading, isSuccess } = useQuery(['singleTeamMembers'], {
    queryFn: () =>
      getSingleTeamMembers(
        axiosAuth,
        (context.state.roomDetail as TeamRooms)?.teamDetails._id
      ),
  });
  useEffect(() => {
    if (isSuccess) {
      context.dispatch({
        type: CHATTYPE.UPDATE_SELECTED_USERS,
        selectedUsers: data,
      });
    }
  }, [context, data, isSuccess]);
  return (
    <>
      <Modal
        isOpen={isOpen}
        placement={'center'}
        backdrop={'blur'}
        onOpenChange={onOpenChange}
        scrollBehavior={'outside'}
        onClose={() => {
          context.dispatch({ type: CHATTYPE.EDITCHANNEL });
        }}
      >
        <ModalContent className="max-w-[600px] rounded-3xl bg-white">
          {() => (
            <>
              <ModalHeader className="mt-3 flex flex-col gap-1 text-center text-lg">
                {`Edit Team Channel`}
              </ModalHeader>
              <ModalBody className="">
                {context.state.teamFormType === 'form' ? (
                  <>
                    <TeamForm />
                  </>
                ) : (
                  <>
                    <TeamRoomMembers />
                  </>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
