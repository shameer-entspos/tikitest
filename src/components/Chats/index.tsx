import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import { chatSocket, socket } from '@/app/helpers/user/socket.helper';
import { useDisclosure } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Activity } from './Activity';
import { AddFriend } from './AddFriend';
import { ChatSidebar } from './ChatSidebar';
import { Contact } from './Contact';
import { Direct } from './Direct';
import { TeamEditChannel } from './TeamEditChannel';
import { Project } from './Project';
import { Teams } from './Teams';
import { ShowTeamMembers } from './Teams/TeamMembers';
import { ViewChatUserProfile } from './ViewChatUserProfile';
import { TeamWarningDialog } from './WrningDIalog';
import Image from 'next/image';
import { ProjectEditChannel } from './ProjectEditChannel';
import useAllRoomSocket from '@/app/(main)/(user-panel)/user/chats/useAllRoomSocket';
import {
  getAllActivites,
  AllAcitvitiesRoom,
  getAllProjectRooms,
  getAllTeamsRooms,
  getAllChatRooms,
  ProjectRooms,
  TeamRooms,
  removeFriend,
  deleteCustomer,
} from '@/app/(main)/(user-panel)/user/chats/api';
import { CHATTYPE } from '@/app/helpers/user/enums';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { usePresignedUserPhoto } from '@/hooks/usePresignedUserPhoto';
import { useQueryClient, useQuery, useQueries, useMutation } from 'react-query';
import CustomInfoModal from '../CustomDeleteModel';
import toast from 'react-hot-toast';
import CustomModal from '../Custom_Modal';
import CustomRadio from '../CustomRadioButton/CustomRadioButton';
import AddCustomerModel from './AddContact';
import { Search } from '../Form/search';
import { ChipDropDown } from '../ChipDropDown';
import { FaCaretDown } from 'react-icons/fa';
import clsx from 'clsx';
import { AppDispatch, RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { handleChatFilter, showNewMessageModel } from '@/store/chatSlice';
import Loader from '../DottedLoader/loader';
import { getUserPermission } from '@/app/(main)/(user-panel)/user/tasks/api';

function NewMessageParticipantPhoto({ photo }: { photo?: string }) {
  const src = usePresignedUserPhoto(photo);
  return (
    <Image
      src={src}
      className={clsx('rounded-full border-2')}
      alt=" pic"
      width={40}
      height={40}
    />
  );
}

function Chats() {
  const context = useChatCotnext();
  const { onOpenChange } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState('');
  const session = useSession();
  const searchParams = useSearchParams();
  const axiosAuth = useAxiosAuth();

  // Check if user is Root User from session (role 3 = Organization Admin)
  const isRootUser = (session?.data?.user as any)?.role === 3;

  // Check if user has Contacts permission (can add/edit Customers/Suppliers)
  const { data: hasContactsPermission } = useQuery({
    queryKey: 'userContactsPermission',
    queryFn: () => getUserPermission(axiosAuth),
    refetchOnWindowFocus: false,
  });

  // User can add/edit Customers/Suppliers if Root User or has permission
  const canAddEditCustomers =
    isRootUser || hasContactsPermission?.contacts === true;

  const [isOpen, setIsOpen] = useState(false);
  const reduxDispatch = useDispatch<AppDispatch>();
  const section = useSelector(
    (state: RootState) => state.contactSection.section
  );
  const SHOW_CREATE_NEW_MESSAGE = useSelector(
    (state: RootState) => state.chat.show_create_new_message
  );
  const SHOW_NEW_MESSAGE_FILTER = useSelector(
    (state: RootState) => state.chat.select_new_chat_filter
  );
  const friendsMutation = useMutation(removeFriend, {
    onSuccess: () => {
      context.dispatch({ type: CHATTYPE.SHOW_CONTACT_DETAIL });

      queryClient.invalidateQueries('contacts');
    },
  });

  const deleteCustomerMutation = useMutation(deleteCustomer, {
    onSuccess: () => {
      context.dispatch({ type: CHATTYPE.SHOW_CONTACT_DETAIL });
      queryClient.invalidateQueries('contacts');
      toast.success('Customer / Supplier deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleToggleTopBar = () => {
    setIsOpen(!isOpen);
  };
  const queryResults = useQueries([
    {
      queryKey: ['projectRooms'],
      queryFn: () => getAllProjectRooms(axiosAuth),
    },
    {
      queryKey: ['teamsRoom'],
      queryFn: () => getAllTeamsRooms(axiosAuth),
    },
    {
      queryKey: ['rooms'],
      queryFn: () => getAllChatRooms(axiosAuth),
    },
  ]);

  const [projectsQuery, teamsQuery, roomsQuery] = queryResults;

  // Access data
  const projects = projectsQuery.data;
  const teams = teamsQuery.data;
  const rooms = roomsQuery.data;
  const handleSelect = (option: 'Projects' | 'Teams' | 'My Contacts') => {
    // setSelected(option);
    reduxDispatch(handleChatFilter(option));
    setIsOpen(false);
  };
  const allSockets = useAllRoomSocket();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: 'activitiesRoom',
    queryFn: () => getAllActivites(axiosAuth),

    onSuccess: () => {
      socket.emit('check_seen_count', {
        userId: session.data?.user.user._id,
        organizationId: session.data?.user.user.organization?._id,
      });
      const allChatRooms =
        queryClient.getQueryData<AllAcitvitiesRoom>(`activitiesRoom`) ?? [];
      if (allChatRooms) {
        const teamCount = (
          queryClient
            .getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
            ?.teamRooms.filter((room) => room.seenCount > 0) ?? []
        ).length;
        const directCount = (
          queryClient
            .getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
            ?.rooms.filter((room) => room.seenCount > 0) ?? []
        ).length;
        const projectCount = (
          queryClient
            .getQueryData<AllAcitvitiesRoom>(`activitiesRoom`)
            ?.projectRoom.filter((room) => room.seenCount > 0) ?? []
        ).length;
        const activityCount = teamCount + directCount + projectCount;
        context.dispatch({
          type: CHATTYPE.ACTIVITY_COUNT,
          activityCount,
          teamCount,
          directCount,
          projectCount,
        });
      }
    },
  });

  useEffect(() => {
    if (section == 'direct') {
      context.dispatch({ type: CHATTYPE.CHANGETAB, chatTab: 'direct' });
    }
  }, []);

  // Handle deep links: ?tab=activity&assistant=1
  useEffect(() => {
    const tab = searchParams?.get('tab');
    const assistant = searchParams?.get('assistant');
    if (tab === 'activity') {
      context.dispatch({ type: CHATTYPE.CHANGETAB, chatTab: 'activity' });
      if (assistant === '1') {
        // Open assistant room view if available
        context.dispatch({
          type: CHATTYPE.CHATDETAIL,
          // @ts-ignore minimal payload to trigger AssistantRoom view
          roomDetail: { type: 'assistant' },
          chatTab: 'activity',
          chatMessageType: 'chat',
          filteredMessageIds: undefined,
          selectUserIdFormTeamOrProject: undefined,
          mentionUsers: undefined,
        });
      }
    }
  }, [searchParams]);
  return (
    <>
      <div>
        <div className="fixed flex h-[calc(var(--app-vh)_-_72px)] w-full">
          <ChatSidebar />

          {context.state.chatTab == 'activity' && <Activity data={data} />}
          {context.state.chatTab == 'direct' && <Direct />}
          {context.state.chatTab == 'team' && <Teams />}
          {context.state.chatTab == 'project' && <Project />}
          {context.state.chatTab == 'contact' && <Contact />}
          {/* {context.state.showModel && <AddFriend />} */}

          {context.state.roomViewProfile && (
            <ViewChatUserProfile isOpen={true} onOpenChange={onOpenChange} />
          )}

          {context.state.showMembers === 'team' && (
            <ShowTeamMembers isOpen={true} onOpenChange={onOpenChange} />
          )}
          {context.state.showMembers === 'project' && (
            <ShowTeamMembers isOpen={true} onOpenChange={onOpenChange} />
          )}
          {context.state.warningPayload && (
            <TeamWarningDialog isOpen={true} onOpenChange={onOpenChange} />
          )}
          {context.state.showEditformType === 'team' && (
            <TeamEditChannel isOpen={true} onOpenChange={onOpenChange} />
          )}
          {context.state.showEditformType === 'project' && (
            <ProjectEditChannel isOpen={true} onOpenChange={onOpenChange} />
          )}

          {/* /// add Customer  */}
          <AddCustomerModel
            isOpen={
              context.state?.showContactDetail?.action == 'add' ||
              context.state?.showContactDetail?.action == 'edit'
            }
            onCloseModal={() => {
              context.dispatch({ type: CHATTYPE.SHOW_CONTACT_DETAIL });
            }}
          />
          {/* /// Show Customer Detail Model */}

          <CustomModal
            isOpen={context.state?.showContactDetail?.action == 'view'}
            handleCancel={() =>
              context.dispatch({ type: CHATTYPE.SHOW_CONTACT_DETAIL })
            }
            variant="text"
            cancelvariant="text"
            submitValue={canAddEditCustomers ? 'Edit' : 'Edit'}
            showFooterSubmit={canAddEditCustomers}
            header={
              <>
                <img src="/svg/chats/customer_dialog.svg" alt="" />
                <div>
                  <h2 className="text-xl font-semibold text-[#1E1E1E]">
                    {'View Customer / Supplier'}
                  </h2>
                  <span className="mt-1 text-base font-normal text-[#616161]">
                    {'View detail below'}
                  </span>
                </div>
              </>
            }
            body={
              <div className="flex h-[500px] flex-col gap-4 overflow-auto px-3">
                <div className="flex flex-col">
                  <label className="mt-0 !font-normal">
                    Customer or Supplier
                  </label>
                  <CustomRadio
                    name="type"
                    value={'4'}
                    disabled={true}
                    checkedValue={'4'}
                    onChange={(value) => {}}
                    label="Customer"
                  />
                  <CustomRadio
                    name="type"
                    value={'5'}
                    disabled={true}
                    checkedValue={'4'}
                    onChange={(value) => {}}
                    label="Supplier"
                  />
                </div>
                <CustomColumn
                  value={`${context.state.showContactDetail?.detail?.customerName}`}
                  label="Customer / Supplier Name"
                />
                <CustomColumn
                  value={`${context.state.showContactDetail?.detail?.reference}`}
                  label="Reference / Account No"
                />
                <CustomColumn
                  value={`${context.state.showContactDetail?.detail?.email}`}
                  label="Primary Email Address"
                />
                <CustomColumn
                  value={`${context.state.showContactDetail?.detail?.phone}`}
                  label="Primary Phone Number"
                />
                <CustomColumn
                  value={`${context.state.showContactDetail?.detail?.firstName}`}
                  label="Primary Contact - First Name"
                />
                <CustomColumn
                  value={`${context.state.showContactDetail?.detail?.lastName}`}
                  label="Primary Contact - Last Name"
                />
                <CustomColumn
                  value={`${context.state.showContactDetail?.detail?.address}`}
                  label="Address"
                />
              </div>
            }
            handleSubmit={() => {
              if (canAddEditCustomers) {
                context.dispatch({
                  type: CHATTYPE.SHOW_CONTACT_DETAIL,
                  showContactDetail: {
                    detail: context.state.showContactDetail?.detail,
                    action: 'edit',
                  },
                });
              }
            }}
          />

          {/* Remove Friend */}
          <CustomInfoModal
            isOpen={context.state?.showContactDetail?.action === 'removeFriend'}
            title={'Remove Friend'}
            handleClose={() =>
              context.dispatch({ type: CHATTYPE.SHOW_CONTACT_DETAIL })
            }
            onDeleteButton={() => {
              friendsMutation.mutate({
                axiosAuth,
                id: context.state.showContactDetail?.detail?._id ?? '',
              });
            }}
            doneValue={friendsMutation.isLoading ? <Loader /> : <>Delete</>}
            subtitle={
              'Are you sure you want to leave this channel? A channel admin will need to add you back in.'
            }
          />
          {/* ??Delete Customer  */}
          <CustomInfoModal
            title={'Delete Customer / Supplier'}
            isOpen={
              context.state?.showContactDetail?.action === 'customerDelete'
            }
            handleClose={() =>
              context.dispatch({ type: CHATTYPE.SHOW_CONTACT_DETAIL })
            }
            onDeleteButton={() => {
              deleteCustomerMutation.mutate({
                axiosAuth,
                id: context.state.showContactDetail?.detail?._id ?? '',
              });
            }}
            doneValue={
              deleteCustomerMutation.isLoading ? <Loader /> : <>Delete</>
            }
            subtitle={
              'Are you sure you want to delete this customer / supplier?'
            }
          />

          {/* //// new message  */}
          <CustomModal
            isOpen={SHOW_CREATE_NEW_MESSAGE != undefined}
            handleCancel={() => {
              reduxDispatch(showNewMessageModel(undefined));
            }}
            variant="text"
            cancelvariant="text"
            cancelButton=""
            submitValue={''}
            header={
              <>
                <img src="/svg/chats/new_message.svg" alt="" />
                <div>
                  <h2 className="text-xl font-semibold text-[#1E1E1E]">
                    {'New Message'}
                  </h2>
                  <span className="mt-1 text-base font-normal text-[#616161]">
                    {'Send a new message to a contact, team or project.'}
                  </span>
                </div>
              </>
            }
            body={
              <div className="flex h-[500px] flex-col gap-4 overflow-auto px-3">
                <div className="mb-2 flex items-center">
                  <div className="Search team-actice flex items-center justify-between">
                    <Search
                      inputRounded={true}
                      type="search"
                      className="rounded-md bg-[#eeeeee] placeholder:text-[#616161]"
                      name="search"
                      placeholder="Search "
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="DropDownn relative z-50 inline-block px-4 text-left">
                    <button
                      type="button"
                      id="dropdown-button"
                      className={`inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-[#E2F3FF] px-2 py-1 text-sm font-medium text-black shadow-sm hover:bg-[#E2F3FF] focus:outline-none`}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      onClick={handleToggleTopBar}
                    >
                      {SHOW_NEW_MESSAGE_FILTER}
                      <FaCaretDown
                        className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isOpen && (
                      <div
                        className="absolute left-0 z-50 mt-2 w-56 origin-top-left rounded-md bg-[#E2F3FF] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="options-menu"
                      >
                        <div className="py-1" role="none">
                          <button
                            onClick={() => handleSelect('My Contacts')}
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            role="menuitem"
                          >
                            My Contacts
                          </button>

                          <button
                            onClick={() => handleSelect('Teams')}
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            role="menuitem"
                          >
                            Teams
                          </button>
                          <button
                            onClick={() => handleSelect('Projects')}
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            role="menuitem"
                          >
                            Projects
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* // My Contacts */}
                {SHOW_NEW_MESSAGE_FILTER == 'My Contacts' &&
                  (rooms ?? []).map((room) => {
                    return (
                      <div
                        key={room._id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg p-2 shadow-primary-shadow"
                        onClick={() => {
                          chatSocket.emit(
                            'joinRoom',
                            room?.senderId,
                            room?._id,
                            'direct'
                          );
                          context.dispatch({
                            type: CHATTYPE.CHATDETAIL,
                            roomDetail: room,
                            chatTab: 'direct',
                            chatMessageType: 'chat',
                            filteredMessageIds: undefined,
                            selectUserIdFormTeamOrProject: undefined,
                            mentionUsers: room?.participants,
                          });
                          reduxDispatch(showNewMessageModel(undefined));
                          // context.dispatch({
                          //   type: CHATTYPE.SHOW_CREATE_NEW_MESSAGE,
                          // });
                        }}
                      >
                        <NewMessageParticipantPhoto
                          photo={room.participants[0].photo}
                        />
                        <span>{`${room.participants[0].firstName} ${room.participants[0].lastName}`}</span>
                        <span>{` - ${room.participants[0].email} `}</span>
                      </div>
                    );
                  })}

                {/* // Projects  */}
                {SHOW_NEW_MESSAGE_FILTER == 'Projects' &&
                  (projects ?? []).map((room) => {
                    return (
                      <div
                        key={room._id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg p-2 shadow-primary-shadow"
                        onClick={() => {
                          chatSocket.emit(
                            'joinRoom',
                            room.senderId,
                            room._id,
                            'projects'
                          );
                          queryClient.invalidateQueries('activitiesRoom');
                          context.dispatch({
                            type: CHATTYPE.CHATDETAIL,
                            roomDetail: room as ProjectRooms,
                            chatTab: 'project',
                            chatMessageType: 'chat',
                            filteredMessageIds: undefined,
                            mentionUsers: room.participants.filter(
                              (user) => user._id != room.senderId
                            ),
                          });
                          reduxDispatch(showNewMessageModel(undefined));
                          // context.dispatch({
                          //   type: CHATTYPE.SHOW_CREATE_NEW_MESSAGE,
                          // });
                        }}
                      >
                        <Image
                          src={'/project.svg'}
                          className={clsx('rounded-full border-2')}
                          alt={` pic`}
                          width={40}
                          height={40}
                        />
                        <span>{`#${room.appearName} `}</span>
                        {/* <span>{` - ${room.projectDetails.length} `}</span> */}
                      </div>
                    );
                  })}
                {/* // Projects  */}
                {SHOW_NEW_MESSAGE_FILTER == 'Teams' &&
                  (teams ?? []).map((room) => {
                    return (
                      <div
                        key={room._id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg p-2 shadow-primary-shadow"
                        onClick={() => {
                          chatSocket.emit(
                            'joinRoom',
                            room.senderId,
                            room._id,
                            'teams'
                          );
                          queryClient.invalidateQueries('activitiesRoom');
                          context.dispatch({
                            type: CHATTYPE.CHATDETAIL,
                            roomDetail: room as TeamRooms,
                            chatTab: 'team',
                            chatMessageType: 'chat',
                            filteredMessageIds: undefined,
                            mentionUsers: room.participants.filter(
                              (user) => user._id != room.senderId
                            ),
                          });
                          reduxDispatch(showNewMessageModel(undefined));
                          // context.dispatch({
                          //   type: CHATTYPE.SHOW_CREATE_NEW_MESSAGE,
                          // });
                        }}
                      >
                        <Image
                          src={'/team.svg'}
                          className={clsx('rounded-full border-2')}
                          alt={` pic`}
                          width={40}
                          height={40}
                        />
                        <span>{`${room.appearName} `}</span>
                        <span>{` - ${room.teamDetails?.name} `}</span>
                      </div>
                    );
                  })}
              </div>
            }
            handleSubmit={() => {}}
          />
        </div>
      </div>
    </>
  );
}

export default Chats;

const CustomColumn = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-[#616161]">{label}</span>
      <span className="text-medium text-[#1E1E1E]">{value}</span>
    </div>
  );
};
