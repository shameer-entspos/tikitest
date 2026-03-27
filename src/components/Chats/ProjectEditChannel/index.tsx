import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import { CHATTYPE } from '@/app/helpers/user/enums';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';

import { useQuery, useQueryClient } from 'react-query';
import {
  getSingleProjectMembers,
  getSingleTeamMembers,
  ProjectRooms,
} from '@/app/(main)/(user-panel)/user/chats/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useEffect } from 'react';

import { ProjectRoomForm } from '../AddFriend/projectForm';
import { ProjectRoomMembers } from '../AddFriend/projectMembers';
export function ProjectEditChannel({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
}) {
  const context = useChatCotnext();
  const axiosAuth = useAxiosAuth();
  const { data, isLoading, isSuccess } = useQuery(['singleProjectMemers'], {
    queryFn: () =>
      getSingleProjectMembers(
        axiosAuth,
        (context.state.roomDetail as ProjectRooms)?.projectDetails._id
      ),
    onSuccess: () => {},
  });
  useEffect(() => {
    if (isSuccess) {
      context.dispatch({
        type: CHATTYPE.UPDATE_SELECTED_USERS,
        selectedProjectUsers: data,
      });
    }
  }, [context, data, isSuccess]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        className="min-h-[650px] w-[90%] md:min-w-[600px]"
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
                {`Edit  Project Channel`}
              </ModalHeader>
              <ModalBody className="">
                {context.state.projectFormType === 'form' ? (
                  <>
                    <ProjectRoomForm />
                  </>
                ) : (
                  <ProjectRoomMembers />
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
