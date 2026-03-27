/* eslint-disable @next/next/no-img-element */
import {
  ProjectRooms,
  TeamRooms,
} from '@/app/(main)/(user-panel)/user/chats/api';
import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import { CHATTYPE } from '@/app/helpers/user/enums';
import { chatSocket } from '@/app/helpers/user/socket.helper';
import { Search } from '@/components/Form/search';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import { useState } from 'react';
import { usePresignedUserPhoto } from '@/hooks/usePresignedUserPhoto';

function TeamMemberAvatar({ photo }: { photo?: string }) {
  const src = usePresignedUserPhoto(photo);
  return <Avatar color="success" radius="full" src={src || undefined} />;
}

export function ShowTeamMembers({
  isOpen,

  onOpenChange,
}: {
  isOpen: boolean;

  onOpenChange: () => void;
}) {
  const { state, dispatch } = useChatCotnext();
  const [searchTerm, setSearchTerm] = useState('');
  const filteredTeams = ((state.roomDetail as any)?.participants ?? []).filter(
    (team: any) =>
      team?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      team._id !== (state.roomDetail as any).senderId
  );
  return (
    <>
      <Modal
        isOpen={isOpen}
        placement={'center'}
        backdrop={'blur'}
        onOpenChange={onOpenChange}
        scrollBehavior={'outside'}
        onClose={() => {
          dispatch({ type: CHATTYPE.SHOWMEMBERS });
        }}
      >
        <ModalContent className="w-[90%] rounded-3xl bg-white md:min-w-[600px]">
          {() => (
            <div className="px-8 py-2">
              <ModalHeader>
                <h1 className="mx-auto text-center text-lg font-semibold leading-7 text-[#000000] lg:text-2xl">
                  {state.showMembers === 'team'
                    ? ' Team Members'
                    : ' Project Members'}
                </h1>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-1 text-center text-sm">
                  {state.showMembers === 'team' ? (
                    <div>
                      <strong className="font-semibold">Team Name:</strong>
                      {` ${(state.roomDetail as TeamRooms)?.teamDetails?.name}`}
                    </div>
                  ) : (
                    <div>
                      <strong className="max-w-full truncate font-semibold">
                        Project Name:
                      </strong>
                      {` ${
                        (state.roomDetail as ProjectRooms)?.projectDetails.name
                      }`}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 text-center text-sm">
                  <div>
                    <strong className="max-w-full truncate font-semibold">
                      Channel Name:
                    </strong>
                    {` #${state.roomDetail?.title}`}
                  </div>
                </div>

                <Search
                  key={'search'}
                  inputRounded={false}
                  className={'h-[50px] rounded-xl text-sm'}
                  type="text"
                  name="search"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Members"
                />
                <div className="h-80 overflow-y-auto scrollbar-hide">
                  {(filteredTeams ?? []).map((user: any) => (
                    <div
                      key={user._id}
                      className={`my-2 flex h-14 w-full flex-wrap items-center rounded-lg bg-gray-200 p-2 md:flex-nowrap`}
                    >
                      <div>
                        <TeamMemberAvatar photo={user.photo} />
                      </div>
                      <div className="flex w-full items-center justify-between">
                        <div className="px-5">
                          <h1 className="truncate text-sm font-semibold">{`${user.firstName} ${user.lastName}`}</h1>
                          <p className="w-32 text-xs">{user.email}</p>
                        </div>

                        <Dropdown>
                          <DropdownTrigger>
                            <svg
                              width="26"
                              height="6"
                              viewBox="0 0 26 6"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="cursor-pointer"
                            >
                              <path
                                d="M3.625 5.8125C2.87908 5.8125 2.16371 5.51618 1.63626 4.98874C1.10882 4.46129 0.8125 3.74592 0.8125 3C0.8125 2.25408 1.10882 1.53871 1.63626 1.01126C2.16371 0.483816 2.87908 0.1875 3.625 0.1875C4.37092 0.1875 5.08629 0.483816 5.61374 1.01126C6.14118 1.53871 6.4375 2.25408 6.4375 3C6.4375 3.74592 6.14118 4.46129 5.61374 4.98874C5.08629 5.51618 4.37092 5.8125 3.625 5.8125ZM13 5.8125C12.2541 5.8125 11.5387 5.51618 11.0113 4.98874C10.4838 4.46129 10.1875 3.74592 10.1875 3C10.1875 2.25408 10.4838 1.53871 11.0113 1.01126C11.5387 0.483816 12.2541 0.1875 13 0.1875C13.7459 0.1875 14.4613 0.483816 14.9887 1.01126C15.5162 1.53871 15.8125 2.25408 15.8125 3C15.8125 3.74592 15.5162 4.46129 14.9887 4.98874C14.4613 5.51618 13.7459 5.8125 13 5.8125ZM22.375 5.8125C21.6291 5.8125 20.9137 5.51618 20.3863 4.98874C19.8588 4.46129 19.5625 3.74592 19.5625 3C19.5625 2.25408 19.8588 1.53871 20.3863 1.01126C20.9137 0.483816 21.6291 0.1875 22.375 0.1875C23.1209 0.1875 23.8363 0.483816 24.3637 1.01126C24.8912 1.53871 25.1875 2.25408 25.1875 3C25.1875 3.74592 24.8912 4.46129 24.3637 4.98874C23.8363 5.51618 23.1209 5.8125 22.375 5.8125Z"
                                fill="#616161"
                              />
                            </svg>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="Dropdown Variants"
                            variant={'shadow'}
                          >
                            <DropdownItem
                              key="view"
                              onClick={() => {
                                dispatch({
                                  type: CHATTYPE.SHOWPROFILE,
                                  roomViewProfile: {
                                    room: state.roomDetail as any,
                                    participant: user,
                                    showFrom: state.showMembers,
                                  },
                                });
                              }}
                            >
                              View Profile
                            </DropdownItem>
                            <DropdownItem key="change">
                              Change Member Type
                            </DropdownItem>
                            <DropdownItem
                              key="remvoe"
                              onClick={() => {
                                {
                                  state.showMembers == 'team'
                                    ? chatSocket.emit('removeTeamMember', {
                                        roomId: state.roomDetail?._id,
                                        userId: user._id,
                                      })
                                    : chatSocket.emit('removeProjectMember', {
                                        roomId: state.roomDetail?._id,
                                        userId: user._id,
                                      });
                                }

                                if (state.roomDetail != null) {
                                  const updatedRoom = {
                                    ...state.roomDetail,
                                    participants: (
                                      state.roomDetail as any
                                    )?.participants.filter(
                                      (p: any) => p._id !== user._id
                                    ),
                                  };
                                  dispatch({
                                    type: CHATTYPE.UPDATEROOMDETAIL,
                                    roomDetail: updatedRoom,
                                  });
                                }
                              }}
                            >
                              Remove Member
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </div>
                  ))}
                </div>
              </ModalBody>
            </div>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
