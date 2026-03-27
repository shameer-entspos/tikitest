import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import { CHATTYPE } from '@/app/helpers/user/enums';
import { chatSocket } from '@/app/helpers/user/socket.helper';

import { format, startOfDay } from 'date-fns';

import { useRef, useState, useEffect, Fragment } from 'react';

import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import Image from 'next/image';
import AppTextArea from '../suggestArea';
import * as Yup from 'yup';
import {
  Message,
  ProjectRooms,
  updateProjectRoom,
} from '@/app/(main)/(user-panel)/user/chats/api';
import useProjectChats from '@/app/(main)/(user-panel)/user/chats/userProjectChat';
import { SignleMessage } from '../CompleteMessage';
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import { Ellipsis } from 'lucide-react';
import { useSession } from 'next-auth/react';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useFormik } from 'formik';
import CustomModal from '@/components/Custom_Modal';
import { SimpleInput } from '@/components/Form/simpleInput';
import CustomRadio from '@/components/CustomRadioButton/CustomRadioButton';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { getAllProjectList } from '@/app/(main)/(user-panel)/user/projects/api';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';
import { FaCaretDown } from 'react-icons/fa';
import clsx from 'clsx';
import { ProjectDetail } from '@/app/type/projects';
import { Search } from '@/components/Form/search';
import { UserDetail } from '@/types/interfaces';

export function ProjectChatRoom({
  bgColor = '#fafafa',
  isFromProject = false,
}: {
  bgColor?: String;
  isFromProject?: boolean;
}) {
  const context = useChatCotnext();
  const chatRef = useRef<HTMLDivElement | null>(null);
  const { messages } = useProjectChats();
  const [showMemberModel, setMemberModel] = useState(false);
  const [showEditDetailModel, setEditDetail] = useState(false);
  const [prevMessagesLength, setPrevMessagesLength] = useState(
    (messages ?? []).length
  );
  useEffect(() => {
    if ((messages ?? []).length >= prevMessagesLength) {
      scrollToBottom();
    }
    setPrevMessagesLength((messages ?? []).length);
    // Update the previous messages length
  }, [messages, prevMessagesLength, context.state.currentIndex]);
  ///////////////=============================????????????????????????????

  const searchInputRef = useRef<HTMLInputElement>(null);

  const removeAtSymbol = (str: string): string => {
    // Check if the string starts with '@'
    if (str.startsWith('@')) {
      // Remove the '@' from the beginning
      return str.slice(1);
    }

    // If the string doesn't start with '@', return the original string
    return str;
  };
  const findMentionsAndIds = (searchTerm: string): string[] => {
    const result: string[] = [];
    const term = removeAtSymbol(searchTerm);

    (messages ?? []).forEach((message) => {
      if (message.message.includes(`@[${term}]`)) {
        result.push(message._id);
      }
    });

    return result;
  };

  const handleIncrement = () => {
    context.dispatch({
      type: CHATTYPE.CHANGECURRENTINDEX,
      currentIndex:
        (context.state.currentIndex ?? 0) + 1 <
        (context.state.filteredMessageIds ?? []).length
          ? (context.state.currentIndex ?? 0) + 1
          : (context.state.currentIndex ?? 0),
    });
  };

  const handleDecrement = () => {
    context.dispatch({
      type: CHATTYPE.CHANGECURRENTINDEX,
      currentIndex:
        (context.state.currentIndex ?? 0) > 0
          ? context.state.currentIndex! - 1
          : (context.state.currentIndex ?? 0),
    });
  };

  useEffect(() => {
    if (
      (context.state.filteredMessageIds ?? []).length > 0 &&
      chatRef.current
    ) {
      const firstMessageId = (context.state.filteredMessageIds ?? [])[
        context.state.currentIndex ?? 0
      ];
      const firstMessageElement = document.getElementById(firstMessageId);

      if (firstMessageElement) {
        chatRef.current.scrollTo({
          top: firstMessageElement.offsetTop - 80,
          behavior: 'smooth',
        });
      }
    }
  }, [context.state.currentIndex, context.state.filteredMessageIds]);

  // ========================>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<==============
  ///// handle send message
  const handleSendMessage = () => {
    if ((context.state.messageController ?? '').length > 0) {
      let message = context.state.messageController;
      context.dispatch({ type: CHATTYPE.CHAT, messageController: undefined });
      if (
        context.state.roomDetail?._id &&
        (context.state.roomDetail as any).senderId
      ) {
        chatSocket.emit(
          'privateProjectMessage',
          context.state.roomDetail._id,
          (context.state.roomDetail as any).senderId,
          message,
          'project',
          'text'
        );
      }
    }
  };
  ////// scroll after message
  function scrollToBottom() {
    const container = chatRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }

  /// message convert into groups with date pear
  const groupedMessages = (messages ?? []).reduce(
    (
      acc: {
        [key: string]: any;
      },
      message
    ) => {
      const dateKey = format(new Date(message.createdAt), 'yyyy-MM-dd'); // Format date as 'YYYY-MM-DD'
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      if (
        context.state.chatMessageType === 'chat' ||
        context.state.chatMessageType === 'mentioned'
      ) {
        acc[dateKey].push(message);
      }

      if (context.state.chatMessageType === 'files') {
        if (message.mimetype == 'file') {
          acc[dateKey].push(message);
        }
      }
      return acc;
    },
    {}
  );

  // ?????????????????????????////////////////////////?????????????????????????

  // after grouping convert into key with list
  const groupedMessagesArray = Object.entries(groupedMessages)
    .filter(([date, messages]) => messages.length > 0)
    .map(([date, messages]) => ({
      date,
      messages,
    }));

  const [showChatSearch, setShowChatSearch] = useState(false);
  const [chatSearchTerm, setChatSearchTerm] = useState('');

  const findTextMatches = (searchTerm: string): string[] => {
    const term = (searchTerm || '').toLowerCase();
    if (!term) return [];
    const ids: string[] = [];
    (messages ?? []).forEach((m) => {
      if ((m.message || '').toLowerCase().includes(term)) ids.push(m._id);
    });
    return ids;
  };

  return (
    <>
      <div
        className={`${isFromProject ? 'h-[600px]' : 'h-[calc(var(--app-vh)-80px)]'} flex-1 flex-col justify-between bg-[#fafafa]`}
      >
        {/* <!-- User's Name --> */}{' '}
        <div className="relative flex h-20 w-full justify-between border-b-2 bg-white px-9 sm:items-center">
          <div className="flex items-center space-x-4">
            {!isFromProject && (
              <div className="">
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 50 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <ellipse
                    cx="25"
                    cy="23.7403"
                    rx="25"
                    ry="23.7403"
                    fill="#E2F3FF"
                  />
                  <path
                    d="M16.8333 34.5C16.1917 34.5 15.6422 34.2713 15.1848 33.814C14.7275 33.3567 14.4992 32.8076 14.5 32.1667V24.875H22.6667V34.5H16.8333ZM25 34.5V24.875H35.5V32.1667C35.5 32.8083 35.2713 33.3578 34.814 33.8152C34.3567 34.2725 33.8076 34.5008 33.1667 34.5H25ZM14.5 22.5417V15.8333C14.5 15.1917 14.7287 14.6422 15.186 14.1848C15.6433 13.7275 16.1924 13.4992 16.8333 13.5H33.1667C33.8083 13.5 34.3578 13.7287 34.8152 14.186C35.2725 14.6433 35.5008 15.1924 35.5 15.8333V22.5417H14.5Z"
                    fill="#0099FF"
                  />
                </svg>
              </div>
            )}
            <div className="flex flex-col leading-tight">
              <div className="mt-1 flex items-center">
                <span className="mr-3 truncate text-sm font-semibold text-black">
                  {`#${context.state.roomDetail?.title.toLowerCase()}`}
                </span>
              </div>
              {!isFromProject && (
                <span className="truncate text-xs text-gray-600">
                  {
                    (context.state.roomDetail as any).participants[0]
                      .organization?.name
                  }
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-16">
            <div className="relative hidden h-full gap-8 md:flex">
              {/* CHAT */}

              <div
                className="mt-1 flex cursor-pointer flex-col justify-between"
                onClick={() => {
                  context.dispatch({
                    type: CHATTYPE.CHATMESSAGETYPE,
                    chatMessageType: 'chat',
                  });
                }}
              >
                <span className="mt-6 text-sm font-semibold text-gray-600">
                  Chat
                </span>
                {context.state.chatMessageType == 'chat' ? (
                  <div className="mt-4 h-0.5 w-full rounded-full bg-[#0063F7]" />
                ) : (
                  <div />
                )}
              </div>

              {/* Files */}

              <div
                className="mt-1 flex cursor-pointer flex-col justify-between px-6"
                onClick={() => {
                  context.dispatch({
                    type: CHATTYPE.CHATMESSAGETYPE,
                    chatMessageType: 'files',
                  });
                }}
              >
                <span className="mt-6 text-sm font-semibold text-gray-600">
                  Files
                </span>
                {context.state.chatMessageType == 'files' ? (
                  <div className="mt-4 h-0.5 w-full rounded-full bg-[#0063F7]" />
                ) : (
                  <div />
                )}
              </div>

              {/* MSentioned */}

              <div
                className="relative mt-1 flex cursor-pointer flex-col justify-between"
                onClick={() => {
                  context.dispatch({
                    type: CHATTYPE.CHATMESSAGETYPE,
                    chatMessageType: 'mentioned',
                  });
                }}
              >
                <span className="relative mt-6 text-sm font-semibold text-gray-600">
                  Mentioned
                </span>
                {context.state.chatMessageType == 'mentioned' ? (
                  <div>
                    <div className="mt-4 h-0.5 w-full rounded-full bg-[#0063F7]" />

                    <div className="absolute right-0 top-full z-50 mt-2 w-[260px] max-w-[90vw]">
                      <div className="flex w-full items-center justify-between rounded-md bg-[#EEEEEE] p-3 text-black shadow-lg">
                        <div>
                          <input
                            ref={searchInputRef}
                            value={searchInputRef.current?.value ?? ''}
                            onChange={(e) => {
                              context.dispatch({
                                type: CHATTYPE.SEARCHMENTIONS,
                                filteredMessageIds: findMentionsAndIds(
                                  e.target.value ?? ''
                                ),
                              });
                            }}
                            type="text"
                            placeholder="@mention"
                            className="w-[140px] border-none px-2 py-1 outline-none"
                          />
                        </div>
                        <div className="whitespace-nowrap px-2 text-xs font-thin">
                          {(context.state.filteredMessageIds ?? [])?.length > 0
                            ? (context.state.currentIndex ?? 0) + 1
                            : 0}
                          /{(context.state.filteredMessageIds ?? []).length}
                        </div>

                        <div className="flex items-center">
                          <div
                            className="cursor-pointer px-1"
                            onClick={handleIncrement}
                          >
                            <IoIosArrowUp />
                          </div>
                          <div
                            className="cursor-pointer px-1"
                            onClick={handleDecrement}
                          >
                            <IoIosArrowDown />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative" />
                )}
              </div>

              {/* DROPDOWN */}
            </div>

            <div className="mt-1 flex items-center space-x-2">
              {/* option for chat setting  */}

              <div className="w-full max-w-4xl">
                <Dropdown
                  className="rounded-xl bg-white"
                  style={{
                    boxShadow: '0px 0px 8px #0000001d',
                    borderRadius: '12px',
                  }}
                >
                  <DropdownTrigger className="cursor-pointer">
                    <Ellipsis />
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Dropdown Variants"
                    color={'default'}
                    variant={'light'}
                    disabledKeys={
                      (context.state.roomDetail as ProjectRooms).isGeneral
                        ? [
                            'members',

                            'leave',
                            'edit',

                            'delete',
                            'deleteChannel',
                          ]
                        : []
                    }
                  >
                    <DropdownItem
                      key="search"
                      onPress={() => {
                        setShowChatSearch(true);
                        setTimeout(() => searchInputRef.current?.focus(), 0);
                      }}
                    >
                      Search Chat
                    </DropdownItem>
                    <DropdownItem
                      key="members"
                      onPress={() => {
                        setMemberModel(true);
                        // context.dispatch({
                        //   type: CHATTYPE.SHOWMEMBERS,
                        //   showMembers: 'project',
                        // });
                      }}
                    >
                      View Members
                    </DropdownItem>

                    <DropdownItem
                      key="pin"
                      onPress={() => {
                        chatSocket.emit('pinnedChatToggle', {
                          roomId: context.state.roomDetail?._id,
                          userId: (context.state.roomDetail as any).senderId,
                        });
                      }}
                    >
                      {(context.state.roomDetail as any).isPinned
                        ? 'UnPin'
                        : 'Pin'}
                    </DropdownItem>
                    <DropdownItem
                      key="mute"
                      onPress={() => {
                        chatSocket.emit('projectChatMute', {
                          roomId: context.state.roomDetail?._id,
                          userId: (context.state.roomDetail as any).senderId,
                        });
                      }}
                    >
                      {(context.state.roomDetail as any).isMuted
                        ? 'unMute'
                        : 'Mute'}
                    </DropdownItem>
                    <DropdownItem
                      key="clear"
                      onPress={() => {
                        context.dispatch({
                          type: CHATTYPE.SHOWWARNINGDIALOG,
                          warningPayload: {
                            actiontype: 'delete',
                            type: 'project',
                          },
                        });
                      }}
                    >
                      Clear Chat
                    </DropdownItem>
                    <DropdownItem
                      key="edit"
                      onPress={() => {
                        setEditDetail(true);
                        // context.dispatch({
                        //   type: CHATTYPE.EDITCHANNEL,
                        //   projectFormType: 'form',
                        //   selectedUsers: context.state.roomDetail?.participants,
                        //   selectedId: (context.state.roomDetail as ProjectRooms)
                        //     ?._id,
                        //   selectedType: context.state.roomDetail?.teamType,
                        //   showEditformType: 'project',
                        //   payload: {
                        //     channelName:
                        //       context.state.roomDetail?.channelName ?? '',
                        //     appearName:
                        //       context.state.roomDetail?.appearName ?? '',
                        //     description:
                        //       context.state.roomDetail?.description ?? '',
                        //   },
                        //   saveUsers: context.state.roomDetail?.participants.map(
                        //     (item) => {
                        //       return {
                        //         user: item._id!,
                        //         role: item.role.toString(),
                        //       };
                        //     }
                        //   ),
                        // });
                      }}
                    >
                      Edit Channel
                    </DropdownItem>
                    <DropdownItem
                      key="deleteChannel"
                      onPress={() => {
                        context.dispatch({
                          type: CHATTYPE.SHOWWARNINGDIALOG,
                          warningPayload: {
                            actiontype: 'deleteChannel',
                            type: 'project',
                          },
                        });
                      }}
                    >
                      Delete Channel
                    </DropdownItem>
                    <DropdownItem
                      key="leave"
                      onPress={() => {
                        context.dispatch({
                          type: CHATTYPE.SHOWWARNINGDIALOG,
                          warningPayload: {
                            actiontype: 'leave',
                            type: 'project',
                          },
                        });
                      }}
                    >
                      Leave Channel
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </div>
          {showChatSearch && (
            <div className="absolute right-8 top-[64px] z-50 w-[320px] max-w-[90vw]">
              <div className="flex w-full items-center justify-between rounded-md bg-[#EEEEEE] p-3 text-black shadow-lg">
                <div>
                  <input
                    value={chatSearchTerm}
                    onChange={(e) => {
                      const val = e.target.value;
                      setChatSearchTerm(val);
                      const ids = findTextMatches(val);
                      context.dispatch({
                        type: CHATTYPE.SEARCHMENTIONS,
                        filteredMessageIds: ids,
                      });
                    }}
                    type="text"
                    placeholder="Search in chat"
                    className="w-[180px] border-none px-2 py-1 outline-none"
                  />
                </div>
                <div className="whitespace-nowrap px-2 text-xs font-thin">
                  {(context.state.filteredMessageIds ?? [])?.length > 0
                    ? (context.state.currentIndex ?? 0) + 1
                    : 0}
                  /{(context.state.filteredMessageIds ?? []).length}
                </div>
                <div className="flex items-center">
                  <div
                    className="cursor-pointer px-1"
                    onClick={handleIncrement}
                  >
                    <IoIosArrowUp />
                  </div>
                  <div
                    className="cursor-pointer px-1"
                    onClick={handleDecrement}
                  >
                    <IoIosArrowDown />
                  </div>
                  <div
                    className="cursor-pointer px-1 text-lg"
                    onClick={() => {
                      setShowChatSearch(false);
                      setChatSearchTerm('');
                      context.dispatch({
                        type: CHATTYPE.SEARCHMENTIONS,
                        filteredMessageIds: [],
                      });
                    }}
                  >
                    ×
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* <!-- Chat Messages (Scrollable) --> */}
        <div
          className={`w-full overflow-y-scroll ${isFromProject ? 'h-[425px]' : 'h-[calc(var(--app-vh)-220px)]'}`}
          ref={chatRef}
        >
          <div>
            {groupedMessagesArray.map(({ date, messages }) => (
              <div key={date}>
                <div className="flex justify-center py-2">
                  <div className="w-fit rounded-md bg-gray-600 px-2 py-1 text-sm text-gray-100">
                    {startOfDay(new Date(date)).toLocaleDateString()}
                  </div>
                </div>
                <ul>
                  {(messages ?? []).map((message: Message, index: number) => {
                    // Apply different classes for sender and receiver

                    return (
                      <SignleMessage
                        message={message}
                        key={message._id}
                        whereToCome={'project'}
                      />
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
        {/* <!-- Chat Input Field (Fixed at the Bottom) --> */}
        <div
          style={{
            boxShadow: '3px 0px 5px #0000001d',
          }}
          className="z-10 h-24 border-t-2 border-solid bg-white"
        >
          <AppTextArea
            handleSendMessage={handleSendMessage}
            whereToCome="project"
          />
        </div>
      </div>
      {/* Show Members of team or update here */}
      {showMemberModel && (
        <ShowProjectMemberList
          onClose={() => {
            setMemberModel(false);
          }}
        />
      )}

      {/*  Show Detail of team update */}
      {showEditDetailModel && (
        <ShowProjectDetail onClose={() => setEditDetail(false)} />
      )}
    </>
  );
}

function ShowProjectDetail({ onClose }: { onClose: any }) {
  const queryClient = useQueryClient();
  const { state, dispatch } = useChatCotnext();
  const axiosAuth = useAxiosAuth();
  const updateProjectRoomMutation = useMutation(updateProjectRoom, {
    onSuccess: (response) => {
      if (response.length > 0) {
        if (state.roomDetail != null) {
          const updatedRoom = {
            ...state.roomDetail,
            channelName: organizationForm.values.channelName,

            appearName:
              organizationForm.values.channelName.replace(/\s+/g, '-') ?? '',
            description: organizationForm.values.description,
            teamType: organizationForm.values.status,
            participants: response[0].participants as UserDetail[],
          };
          dispatch({
            type: CHATTYPE.UPDATEROOMDETAIL,
            roomDetail: updatedRoom,
          });
        }
      }

      queryClient.invalidateQueries('projectRooms');

      onClose();
    },
  });
  const [openDropdown, setOpenDropdown] = useState<string>('');
  const handleToggleDropdown = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? '' : dropdownId);
  };
  const { data: projects } = useQuery({
    queryKey: 'projects',
    queryFn: () => getAllProjectList({ axiosAuth }),
  });
  const [selectedProjectId, setProjectId] = useState(
    (state.roomDetail as ProjectRooms)?.projectDetails._id ?? undefined
  );
  const filterProjects = (projects?.projects ?? [])
    .filter((p) => p._id === selectedProjectId)
    .flatMap((p) => p.users);

  const { data: session } = useSession();
  const [selectedUser, setUserWithRole] = useState<
    { user: string; role: string }[]
  >(
    session?.user?.user?._id
      ? [{ user: session.user.user._id, role: 'admin' }]
      : []
  );
  const organizationForm = useFormik({
    initialValues: {
      projects: (state.roomDetail as ProjectRooms)?.projectDetails._id ?? '',
      channelName: (state.roomDetail as any).channelName ?? '',
      description: (state.roomDetail as any).description ?? '',
      status: (state.roomDetail as any).teamType ?? 'private',
      // appearName
    },
    validationSchema: Yup.object().shape({
      projects: Yup.mixed().required('Projects is required'), // Adjust based on the type of `projects`

      // Validation for channelName (required)
      channelName: Yup.string().required('Channel Name is required'),

      // Validation for description (optional)
      description: Yup.string(),
    }),

    onSubmit: (values) => {
      if (organizationForm.values.status == 'public') {
        (filterProjects ?? [])?.map((user) => {
          if (user?.user._id !== session?.user.user._id) {
            setUserWithRole([
              ...selectedUser,
              { user: user?.user._id!, role: 'member' },
            ]);
          }
        });
      }
      // appearName
      if (!state.roomDetail?._id) {
        return;
      }
      updateProjectRoomMutation.mutate({
        axiosAuth,
        body: {
          roomId: state.roomDetail._id,
          projectId: organizationForm.values.projects,
          channelName: organizationForm.values.channelName ?? '',
          description: organizationForm.values.description ?? '',
          appearName:
            organizationForm.values.channelName.replace(/\s+/g, '-') ?? '',
          type: organizationForm.values.status ?? 'public',
          room:
            organizationForm.values.status == 'public'
              ? selectedUser
              : ((state.roomDetail as any)?.participants ?? []).map(
                  (user: any) => {
                    return { user: user._id!, role: user.role.toString() };
                  }
                ),
        },
      });
    },
  });

  return (
    <CustomModal
      isOpen={true}
      handleCancel={onClose}
      variant="primary"
      cancelvariant="primaryOutLine"
      size="md"
      submitValue={`Save`}
      header={
        <>
          <img src="/svg/chats/project_channel.svg" alt="" />
          <div>
            <h2 className="text-xl font-semibold text-[#1E1E1E]">
              {'Channel Members'}
            </h2>
            <span className="mt-1 text-base font-normal text-[#616161]">
              {'Add project members to project channel'}
            </span>
          </div>
        </>
      }
      body={
        <div className="flex h-[550px] flex-col overflow-auto px-3">
          <div className="w-full">
            <CustomSearchSelect
              isRequired={true}
              label="Assigned Project"
              data={(projects?.projects ?? []).map((project) => ({
                label: project.name ?? '',
                value: project._id ?? '',
              }))}
              selected={[organizationForm.values.projects]}
              showImage={false}
              multiple={false}
              showSearch={false}
              isOpen={openDropdown === 'dropdown1'}
              onToggle={() => handleToggleDropdown('dropdown1')}
              returnSingleValueWithLabel={true}
              onSelect={(selected: any, item: any) => {
                organizationForm.setFieldValue('projects', selected);
              }}
              placeholder="All"
            />
          </div>
          <SimpleInput
            type="text"
            label="Channel Name"
            placeholder="Enter Site ID"
            name="channelName"
            className="w-full"
            required
            errorMessage={organizationForm.errors.channelName as string}
            value={organizationForm.values.channelName}
            isTouched={organizationForm.touched.channelName as boolean}
            onChange={organizationForm.handleChange}
          />
          <div className="pb-3">
            <label className="mb-2 block px-2 font-normal" htmlFor="reasone">
              Description
            </label>
            <textarea
              rows={3}
              id="description"
              name="description"
              placeholder="Short description"
              value={organizationForm.values.description}
              className={` ${
                (organizationForm.errors.description as string) &&
                organizationForm.touched.description
                  ? 'border-red-500'
                  : 'border-[#EEEEEE]'
              } w-full resize-none rounded-xl border-2 border-gray-300 p-2 shadow-sm`}
              onChange={organizationForm.handleChange}
            />
          </div>
          <div className="pb-3">
            <label className="mb-2 block px-2 font-normal" htmlFor="reasone">
              Your channel will appear as
            </label>
            <span className="px-2">
              {organizationForm.values.channelName.replace(/\s+/g, '-')}
            </span>
          </div>
          <CustomRadio
            name={'status'}
            value={organizationForm.values.status}
            checkedValue={organizationForm.values.status}
            onChange={function (value: string): void {
              organizationForm.setFieldValue('status', 'private');
            }}
            label={'Accessible to selected members'}
          />
          <CustomRadio
            name={'status'}
            value={'public'}
            checkedValue={organizationForm.values.status}
            onChange={function (value: string): void {
              organizationForm.setFieldValue('status', 'public');
            }}
            label={'Accessible to everyone in this projects'}
          />
        </div>
      }
      isLoading={updateProjectRoomMutation.isLoading}
      handleSubmit={() => {
        organizationForm.submitForm();
      }}
    />
  );
}

function ShowProjectMemberList({ onClose }: { onClose: any }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { state, dispatch } = useChatCotnext();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const [selected, setSelected] = useState<string>('Recent');
  const [selectedId, setId] = useState<string | undefined>(undefined);
  const [selectedProjectId, setProjectId] = useState(
    (state.roomDetail as ProjectRooms)?.projectDetails._id ?? undefined
  );
  const { data: projects, isLoading } = useQuery({
    queryKey: 'projects',
    queryFn: () => getAllProjectList({ axiosAuth }),
  });
  const [selectedUser, setUserWithRole] = useState<
    { user: string; role: string }[]
  >([
    ...(((state.roomDetail as ProjectRooms)?.participants ?? []).map((p) => {
      return {
        user: p._id,
        role: p.role.toString(),
      };
    }) ?? []),
  ]);
  console.log(
    'data value' + (state.roomDetail as ProjectRooms)?.participants.length
  );
  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
  };

  const [isOpen, setIsOpen] = useState(false);
  const handleToggleTopBar = () => {
    setIsOpen(!isOpen);
  };
  /// check selected roles
  function checkUsereSelectRole(id: string) {
    const existingIndex = (selectedUser ?? []).findIndex(
      (user) => user.user === id
    );
    if (existingIndex !== -1) {
      return selectedUser![existingIndex].role;
    } else {
      return 'member';
    }
  }
  // change roles
  const handleUserRoleChange = (
    userId: string,
    selectedRole: 'admin' | 'member'
  ) => {
    const newRole = {
      user: userId,
      role: selectedRole,
    };
    const existingRoleIndex = (selectedUser ?? []).findIndex(
      (user) => user.user === userId
    );

    if (existingRoleIndex !== -1) {
      const existingUsersRoleIndex = (selectedUser ?? []).findIndex(
        (user) => user.user === userId
      );
      const updatedUsersRoles = [...selectedUser];
      if (existingUsersRoleIndex !== -1) {
        updatedUsersRoles[existingUsersRoleIndex] = {
          ...updatedUsersRoles[existingUsersRoleIndex],
          role: selectedRole,
        };
      }
      setUserWithRole(updatedUsersRoles);
    } else {
      setUserWithRole([...selectedUser, newRole]);
    }
    setId(undefined);
  };
  // add or delete seleted teams

  const handleUserSelect = (
    userId: string,
    selectedRole: 'admin' | 'member'
  ) => {
    const newRole = {
      user: userId,
      role: selectedRole,
    };
    setId(undefined);
    if ((selectedUser ?? []).findIndex((user) => user.user === userId) !== -1) {
      // context.dispatch({ type: CHATTYPE.DESELECT_USER, users: newRole });
      setUserWithRole(selectedUser.filter((u) => u.user !== userId));
    } else {
      setUserWithRole([...selectedUser, newRole]);
    }
  };
  /// check team select or not
  const isUserSelected = (userId: string) =>
    (selectedUser ?? [])?.some((user) => user.user == userId);

  ///// update project room
  const filterProjects = (projects?.projects ?? [])
    .filter((p) => p._id === selectedProjectId)
    .flatMap((p) => p.users);
  const updateProjectRoomMutation = useMutation(updateProjectRoom, {
    onSuccess: (response) => {
      if (response.length > 0) {
        if (state.roomDetail != null) {
          const updatedRoom = {
            ...state.roomDetail,
            participants: response[0].participants as UserDetail[],
          };
          dispatch({
            type: CHATTYPE.UPDATEROOMDETAIL,
            roomDetail: updatedRoom,
          });
        }
      }
      queryClient.invalidateQueries('projectRooms');

      onClose();
    },
  });

  return (
    <CustomModal
      isOpen={true}
      handleCancel={onClose}
      variant="primary"
      cancelvariant="primaryOutLine"
      submitValue={`Confirm (${selectedUser.length ?? 0})`}
      header={
        <>
          <img src="/svg/chats/project_channel.svg" alt="" />
          <div>
            <h2 className="text-xl font-semibold text-[#1E1E1E]">
              {'Channel Members'}
            </h2>
            <span className="mt-1 text-base font-normal text-[#616161]">
              {'Add project members to project channel'}
            </span>
          </div>
        </>
      }
      body={
        <div className="flex h-[550px] flex-col overflow-auto px-3">
          <>
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
                  {selected}
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
                        onClick={() => handleSelect('Recent')}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        role="menuitem"
                      >
                        Recent
                      </button>
                      <button
                        onClick={() => handleSelect('Organization Members')}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        role="menuitem"
                      >
                        Organization Members
                      </button>

                      <button
                        onClick={() => handleSelect('External  Members')}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        role="menuitem"
                      >
                        External Members
                      </button>
                      <button
                        onClick={() => handleSelect('Teams Members')}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        role="menuitem"
                      >
                        Teams
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mb-2 flex cursor-not-allowed items-center justify-between rounded-xl border-2 border-gray-300/80 p-2 opacity-50">
              <div className="flex items-center">
                <div
                  className={clsx(
                    'flex items-center gap-2 text-xs font-normal text-[#212121]'
                  )}
                >
                  <Image
                    src={'/images/user.png'}
                    className={clsx('rounded-full border-2')}
                    alt={` pic`}
                    width={40}
                    height={40}
                  />

                  <div className="grid">
                    <span className="font-semibold">{`${session?.user.user.firstName} ${session?.user.user.lastName}`}</span>
                    <span>{session?.user.user.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex">
                <div className="DropDownn relative px-4 text-left">
                  <button
                    type="button"
                    id="dropdown-button"
                    className={`inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-[#EEEEEE] px-2 py-1 text-sm font-medium text-black shadow-sm hover:bg-[#EEEEEE] focus:outline-none`}
                    aria-haspopup="true"
                    onClick={() => {}}
                  >
                    {'admin'}
                    <FaCaretDown
                      className={`ml-2 transition-transform ${false ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>

                <CustomBlueCheckBox checked={true} onChange={() => {}} />
              </div>
            </div>
            {filterProjects.map((u) => {
              const user = u?.user;
              return (
                <>
                  {user?._id !== session?.user.user._id && (
                    <div
                      key={user?._id}
                      className="mb-2 flex items-center justify-between rounded-xl border-2 border-gray-300/80 p-2"
                    >
                      <div className="flex items-center">
                        <div
                          className={clsx(
                            'flex items-center gap-2 text-xs font-normal text-[#212121]'
                          )}
                        >
                          <Image
                            src={'/images/user.png'}
                            className={clsx('rounded-full border-2')}
                            alt={` pic`}
                            width={40}
                            height={40}
                          />

                          <div className="grid">
                            <span className="font-semibold">
                              {user?.firstName} {user?.lastName}
                            </span>
                            <span>{user?.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex">
                        <div className="DropDownn relative px-4 text-left">
                          <button
                            type="button"
                            id="dropdown-button"
                            className={`inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-[#EEEEEE] px-2 py-1 text-sm font-medium text-black shadow-sm hover:bg-[#EEEEEE] focus:outline-none`}
                            aria-expanded={selectedId === user?._id}
                            aria-haspopup="true"
                            onClick={() => {
                              if (
                                selectedId === user?._id ||
                                selectedId !== undefined
                              ) {
                                setId(undefined);
                              } else {
                                setId(user?._id);
                              }
                            }}
                          >
                            {checkUsereSelectRole(user?._id!)}
                            <FaCaretDown
                              className={`ml-2 transition-transform ${selectedId === user?._id ? 'rotate-180' : ''}`}
                            />
                          </button>

                          {selectedId === user?._id && (
                            <div
                              className="absolute left-0 z-50 mt-2 w-32 origin-top-left rounded-md bg-[#EEEEEE] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                              role="menu"
                              aria-orientation="vertical"
                              aria-labelledby="options-menu"
                            >
                              <div className="py-1" role="none">
                                <button
                                  onClick={() => {
                                    handleUserRoleChange(
                                      user?._id ?? '',
                                      'admin'
                                    );
                                  }}
                                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                  role="menuitem"
                                >
                                  admin
                                </button>
                                <button
                                  onClick={() => {
                                    handleUserRoleChange(
                                      user?._id ?? '',
                                      'member'
                                    );
                                  }}
                                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                  role="menuitem"
                                >
                                  member
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <CustomBlueCheckBox
                          checked={isUserSelected(`${user?._id}`) || false}
                          onChange={() => {
                            handleUserSelect(`${user?._id}`, 'member');
                          }}
                        />
                      </div>
                    </div>
                  )}
                </>
              );
            })}
          </>
        </div>
      }
      isLoading={updateProjectRoomMutation.isLoading}
      handleSubmit={() => {
        updateProjectRoomMutation.mutate({
          axiosAuth,
          body: {
            roomId: state.roomDetail?._id ?? '',
            projectId:
              (state.roomDetail as ProjectRooms)?.projectDetails._id ?? '',
            channelName: (state.roomDetail as any).channelName ?? '',
            description: (state.roomDetail as any).description ?? '',
            appearName: (state.roomDetail as any).appearName ?? '',
            type: state.selectedType ?? '',
            room: (selectedUser ?? []).map((u) => {
              return { user: u.user, role: u.role };
            }),
          },
        });
      }}
    />
  );
}
