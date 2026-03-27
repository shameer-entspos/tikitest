'use client';
import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import { CHATTYPE } from '@/app/helpers/user/enums';
import { chatSocket } from '@/app/helpers/user/socket.helper';
import { Menu, Transition } from '@headlessui/react';
import { format, set, startOfDay } from 'date-fns';
import { useRef, useState, useEffect, Fragment } from 'react';
import { HiDotsHorizontal } from 'react-icons/hi';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';

import AppTextArea from '../suggestArea';
import {
  getAllTeams,
  getSingleTeamMembers,
  Message,
  TeamDetails,
  TeamRooms,
  updateTeamRoom,
} from '@/app/(main)/(user-panel)/user/chats/api';
import * as Yup from 'yup';
import useTeamChats from '@/app/(main)/(user-panel)/user/chats/userTeamChat';
import { classNames, SignleMessage } from '../CompleteMessage';
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  user,
} from '@nextui-org/react';
import Image from 'next/image';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';
import CustomModal from '@/components/Custom_Modal';
import { FaCaretDown } from 'react-icons/fa';
import { Search } from '@/components/Form/search';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import CustomRadio from '@/components/CustomRadioButton/CustomRadioButton';
import { SimpleInput } from '@/components/Form/simpleInput';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { useFormik } from 'formik';
import { UserDetail } from '@/types/interfaces';

export function TeamChatRoom() {
  const context = useChatCotnext();
  const chatRef = useRef<HTMLDivElement | null>(null);
  const { messages } = useTeamChats();
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
          'privateTeamMessage',
          context.state.roomDetail._id,
          (context.state.roomDetail as any).senderId,
          message,
          'team',
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
  const { data: session } = useSession();
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

  return (
    <>
      <div className="h-[calc(var(--app-vh)-80px)] flex-1 flex-col justify-between bg-[#fafafa]">
        {' '}
        {/* <!-- User's Name --> */}
        <div className="relative flex h-20 w-full justify-between border-b-2 bg-white px-9 sm:items-center">
          <div className="flex items-center space-x-2">
            <div className="">
              <svg
                className="h-11 w-11"
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
                  d="M25 13.5039C24.5408 13.5039 24.0862 13.5943 23.6619 13.7701C23.2377 13.9458 22.8523 14.2033 22.5276 14.528C22.2029 14.8527 21.9454 15.2381 21.7697 15.6624C21.5939 16.0866 21.5035 16.5412 21.5035 17.0004C21.5035 17.4596 21.5939 17.9142 21.7697 18.3385C21.9454 18.7627 22.2029 19.1481 22.5276 19.4728C22.8523 19.7975 23.2377 20.055 23.6619 20.2308C24.0862 20.4065 24.5408 20.4969 25 20.4969C25.9273 20.4969 26.8167 20.1285 27.4724 19.4728C28.1281 18.8171 28.4965 17.9277 28.4965 17.0004C28.4965 16.0731 28.1281 15.1837 27.4724 14.528C26.8167 13.8723 25.9273 13.5039 25 13.5039ZM32.875 15.2504C32.1788 15.2504 31.5111 15.527 31.0188 16.0193C30.5266 16.5115 30.25 17.1792 30.25 17.8754C30.25 18.5716 30.5266 19.2393 31.0188 19.7316C31.5111 20.2238 32.1788 20.5004 32.875 20.5004C33.5712 20.5004 34.2389 20.2238 34.7312 19.7316C35.2234 19.2393 35.5 18.5716 35.5 17.8754C35.5 17.1792 35.2234 16.5115 34.7312 16.0193C34.2389 15.527 33.5712 15.2504 32.875 15.2504ZM17.125 15.2504C16.4288 15.2504 15.7611 15.527 15.2688 16.0193C14.7766 16.5115 14.5 17.1792 14.5 17.8754C14.5 18.5716 14.7766 19.2393 15.2688 19.7316C15.7611 20.2238 16.4288 20.5004 17.125 20.5004C17.8212 20.5004 18.4889 20.2238 18.9812 19.7316C19.4734 19.2393 19.75 18.5716 19.75 17.8754C19.75 17.1792 19.4734 16.5115 18.9812 16.0193C18.4889 15.527 17.8212 15.2504 17.125 15.2504ZM19.75 23.9882C19.7532 23.5262 19.939 23.0842 20.2669 22.7586C20.5947 22.4331 21.038 22.2504 21.5 22.2504H28.5C28.9641 22.2504 29.4092 22.4348 29.7374 22.763C30.0656 23.0912 30.25 23.5363 30.25 24.0004V29.2504C30.2499 29.8012 30.1637 30.3485 29.9945 30.8727C29.607 32.0604 28.8088 33.0711 27.7432 33.7232C26.6775 34.3754 25.4143 34.6263 24.1803 34.4309C22.9464 34.2355 21.8225 33.6066 21.0105 32.6571C20.1985 31.7076 19.7516 30.4997 19.75 29.2504V23.9882ZM18 24.0004C18 23.3617 18.1698 22.7649 18.469 22.2504H14.5C14.0359 22.2504 13.5908 22.4348 13.2626 22.763C12.9344 23.0912 12.75 23.5363 12.75 24.0004V28.3754C12.7498 29.0917 12.9254 29.7971 13.2615 30.4296C13.5976 31.0622 14.0838 31.6025 14.6775 32.0032C15.2712 32.4039 15.9543 32.6527 16.6666 32.7278C17.3789 32.8028 18.0988 32.7018 18.763 32.4337C18.2593 31.4477 17.9978 30.3559 18 29.2487V24.0004ZM32 24.0004V29.2504C32 30.3967 31.7253 31.4782 31.237 32.4337C31.9012 32.7018 32.6211 32.8028 33.3334 32.7278C34.0457 32.6527 34.7288 32.4039 35.3225 32.0032C35.9162 31.6025 36.4024 31.0622 36.7385 30.4296C37.0746 29.7971 37.2502 29.0917 37.25 28.3754V24.0004C37.25 23.5363 37.0656 23.0912 36.7374 22.763C36.4092 22.4348 35.9641 22.2504 35.5 22.2504H31.531C31.8285 22.7649 32 23.3617 32 24.0004Z"
                  fill="#0099FF"
                />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <div className="mt-1 flex items-center">
                <span className="mr-3 truncate text-sm font-semibold text-black">
                  {`#${(context.state.roomDetail as any).appearName.toLowerCase()}`}
                </span>
              </div>
              <span className="truncate text-xs text-gray-600 md:max-w-[200px]">
                {(session?.user.user as any).organization?.name}
              </span>
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

              {/* CHATMentionesdss */}

              <div
                className="mt-1 flex cursor-pointer flex-col justify-between"
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

                    <div className="absolute right-2 flex flex-col items-end py-1">
                      <div className="flex items-center justify-center rounded-md bg-[#EEEEEE] p-4 text-black">
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
                            className="border-none px-2 py-1 outline-none"
                          />
                        </div>
                        <div className="px-4 text-xs font-thin">
                          {(context.state.filteredMessageIds ?? [])?.length > 0
                            ? (context.state.currentIndex ?? 0) + 1
                            : 0}
                          /{(context.state.filteredMessageIds ?? []).length}
                        </div>

                        <div className="flex">
                          <div className="px-1" onClick={handleDecrement}>
                            <IoIosArrowUp />
                          </div>
                          <div className="px-1" onClick={handleIncrement}>
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
            </div>

            {/* Dropdown */}

            <div className="mt-1 flex items-center space-x-2">
              {/* option for chat setting  */}

              <div className="w-full max-w-4xl">
                <Dropdown>
                  <DropdownTrigger>
                    <svg
                      width="26"
                      height="6"
                      viewBox="0 0 26 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 cursor-pointer"
                    >
                      <path
                        d="M3.625 5.8125C2.87908 5.8125 2.16371 5.51618 1.63626 4.98874C1.10882 4.46129 0.8125 3.74592 0.8125 3C0.8125 2.25408 1.10882 1.53871 1.63626 1.01126C2.16371 0.483816 2.87908 0.1875 3.625 0.1875C4.37092 0.1875 5.08629 0.483816 5.61374 1.01126C6.14118 1.53871 6.4375 2.25408 6.4375 3C6.4375 3.74592 6.14118 4.46129 5.61374 4.98874C5.08629 5.51618 4.37092 5.8125 3.625 5.8125ZM13 5.8125C12.2541 5.8125 11.5387 5.51618 11.0113 4.98874C10.4838 4.46129 10.1875 3.74592 10.1875 3C10.1875 2.25408 10.4838 1.53871 11.0113 1.01126C11.5387 0.483816 12.2541 0.1875 13 0.1875C13.7459 0.1875 14.4613 0.483816 14.9887 1.01126C15.5162 1.53871 15.8125 2.25408 15.8125 3C15.8125 3.74592 15.5162 4.46129 14.9887 4.98874C14.4613 5.51618 13.7459 5.8125 13 5.8125ZM22.375 5.8125C21.6291 5.8125 20.9137 5.51618 20.3863 4.98874C19.8588 4.46129 19.5625 3.74592 19.5625 3C19.5625 2.25408 19.8588 1.53871 20.3863 1.01126C20.9137 0.483816 21.6291 0.1875 22.375 0.1875C23.1209 0.1875 23.8363 0.483816 24.3637 1.01126C24.8912 1.53871 25.1875 2.25408 25.1875 3C25.1875 3.74592 24.8912 4.46129 24.3637 4.98874C23.8363 5.51618 23.1209 5.8125 22.375 5.8125Z"
                        fill="#616161"
                      />
                    </svg>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Dropdown Variants"
                    color={'default'}
                    variant={'light'}
                  >
                    <DropdownItem
                      key="search"
                      onPress={() => {
                        setShowChatSearch(true);
                      }}
                    >
                      Search Chat
                    </DropdownItem>
                    <DropdownItem
                      key="profile"
                      onPress={() => {
                        // context.dispatch({
                        //   type: CHATTYPE.SHOWMEMBERS,
                        //   showMembers: 'team',
                        // });
                        setMemberModel(true);
                      }}
                    >
                      View Members
                    </DropdownItem>
                    <DropdownItem
                      key="search"
                      onPress={() => {
                        // chatSocket.emit("clearChat", {
                        //   roomId: context.state.roomDetail?._id,
                        //   userId: context.state.roomDetail?.senderId,
                        // });
                      }}
                    >
                      Search
                    </DropdownItem>
                    <DropdownItem
                      key="pin"
                      onPress={() => {
                        chatSocket.emit('pinnedTeamChatToggle', {
                          roomId: context.state.roomDetail?._id,
                          userId: (context.state.roomDetail as any).senderId,
                        });
                      }}
                    >
                      {(context.state.roomDetail as TeamRooms).isPinned
                        ? 'UnPin'
                        : 'Pin'}
                    </DropdownItem>
                    <DropdownItem
                      key="mute"
                      onPress={() => {
                        chatSocket.emit('teamChatMute', {
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
                            type: 'team',
                          },
                        });
                      }}
                    >
                      Clear Chat
                    </DropdownItem>
                    <DropdownItem
                      key="edit"
                      onPress={() => {
                        // context.dispatch({
                        //   type: CHATTYPE.EDITCHANNEL,
                        //   teamFormType: 'form',
                        //   selectedId: (context.state.roomDetail as TeamRooms)
                        //     ?._id,
                        //   selectedUsers: context.state.roomDetail?.participants,
                        //   selectedType: context.state.roomDetail?.teamType,
                        //   showEditformType: 'team',
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
                        //         user: item._id,
                        //         role: item.role.toString(),
                        //       };
                        //     }
                        //   ),
                        // });
                        setEditDetail(true);
                      }}
                    >
                      Edit Channel
                    </DropdownItem>
                    <DropdownItem
                      key="leave"
                      onPress={() => {
                        context.dispatch({
                          type: CHATTYPE.SHOWWARNINGDIALOG,
                          warningPayload: {
                            actiontype: 'leave',
                            type: 'team',
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
        </div>
        {/* <!-- Chat Messages (Scrollable) --> */}
        <div
          className="h-[calc(var(--app-vh)-220px)] overflow-y-scroll p-2"
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
                        whereToCome={'team'}
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
            whereToCome="team"
          />
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
                <div className="cursor-pointer px-1" onClick={handleDecrement}>
                  <IoIosArrowUp />
                </div>
                <div className="cursor-pointer px-1" onClick={handleIncrement}>
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

      {/* Show Members of team or update here */}
      {showMemberModel && (
        <ShowTeamMemberList
          onClose={() => {
            setMemberModel(false);
          }}
        />
      )}

      {/*  Show Detail of team update */}
      {showEditDetailModel && (
        <ShowTeamDetail onClose={() => setEditDetail(false)} />
      )}
    </>
  );
}

function ShowTeamDetail({ onClose }: { onClose: any }) {
  const queryClient = useQueryClient();
  const { state, dispatch } = useChatCotnext();
  const axiosAuth = useAxiosAuth();
  const {
    data: members,
    isLoading,
    isSuccess,
  } = useQuery(['singleTeamMembers'], {
    queryFn: () =>
      getSingleTeamMembers(
        axiosAuth,
        (state.roomDetail as TeamRooms)?.teamDetails._id
      ),
  });
  const { data: session } = useSession();
  const [selectedUser, setUserWithRole] = useState<
    { user: string; role: 'admin' | 'member' }[]
  >(
    session?.user?.user?._id
      ? [{ user: session.user.user._id, role: 'admin' }]
      : []
  );

  const organizationForm = useFormik({
    initialValues: {
      channelName: (state.roomDetail as any).channelName ?? '',
      description: (state.roomDetail as any).description ?? '',
      status: (state.roomDetail as any).teamType ?? 'private',
    },
    validationSchema: Yup.object().shape({
      // Adjust based on the type of `projects`

      // Validation for channelName (required)
      channelName: Yup.string().required('Channel Name is required'),

      // Validation for description (optional)
      description: Yup.string(),
    }),

    onSubmit: (values) => {
      if (organizationForm.values.status == 'public') {
        (members ?? [])?.map((user) => {
          if (user._id !== session?.user.user._id) {
            setUserWithRole([
              ...selectedUser,
              { user: user._id, role: 'member' },
            ]);
          }
        });
      }
      // appearName
      if (!state.roomDetail?._id) {
        return;
      }
      updateTeamRoomMutation.mutate({
        axiosAuth,
        body: {
          teamId: state.roomDetail._id,
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

  const updateTeamRoomMutation = useMutation(updateTeamRoom, {
    onSuccess: () => {
      queryClient.invalidateQueries('teamsRoom');
      if (state.roomDetail != null) {
        const updatedRoom = {
          ...state.roomDetail,
          channelName: organizationForm.values.channelName,
          appearName:
            organizationForm.values.channelName.replace(/\s+/g, '-') ?? '',
          description: organizationForm.values.description,
          teamType: organizationForm.values.status,
          participants:
            organizationForm.values.status == 'public'
              ? (members ?? [])
              : (state.roomDetail as any).participants,
        };
        dispatch({
          type: CHATTYPE.UPDATEROOMDETAIL,
          roomDetail: updatedRoom,
        });
      }
      onClose();
    },
  });
  return (
    <CustomModal
      isOpen={true}
      handleCancel={onClose}
      variant="primary"
      cancelvariant="primaryOutLine"
      size="md"
      submitValue={`Confirm `}
      header={
        <>
          <img src="/svg/chats/project_channel.svg" alt="" />
          <div>
            <h2 className="text-xl font-semibold text-[#1E1E1E]">
              {'Channel Members'}
            </h2>
            <span className="mt-1 text-base font-normal text-[#616161]">
              {'Add team members to team channel'}
            </span>
          </div>
        </>
      }
      body={
        <>
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
                organizationForm.errors.description &&
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
            label={'Accessible to everyone in this team'}
          />
        </>
      }
      isLoading={updateTeamRoomMutation.isLoading}
      handleSubmit={() => {
        organizationForm.submitForm();
      }}
    />
  );
}

function ShowTeamMemberList({ onClose }: { onClose: any }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { state, dispatch } = useChatCotnext();
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const { data: members } = useQuery(['singleTeamMembers'], {
    queryFn: () =>
      getSingleTeamMembers(
        axiosAuth,
        (state.roomDetail as TeamRooms)?.teamDetails._id
      ),
  });

  const [selectedUser, setUserWithRole] = useState<
    { user: string; role: string }[]
  >([
    ...((state.roomDetail as any)?.participants ?? []).map((user: any) => {
      return { user: user._id!, role: user.role.toString() };
    }),
  ]);

  const [selectedId, setId] = useState<string | undefined>(undefined);

  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string>('Recent');
  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
  };
  const handleToggleTopBar = () => {
    setIsOpen(!isOpen);
  };
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
  const isUserSelected = (userId: string) =>
    (selectedUser ?? [])?.some((user) => user.user == userId);
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
  const queryClient = useQueryClient();
  const updateTeamRoomMutation = useMutation(updateTeamRoom, {
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
      queryClient.invalidateQueries('teamsRoom');

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
              {'Add team members to team channel'}
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
                  placeholder="Search"
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
            {(members ?? []).map((user) => {
              return (
                <>
                  {user._id !== session?.user.user._id && (
                    <div
                      key={user._id}
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
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex">
                        <div className="DropDownn relative px-4 text-left">
                          <button
                            type="button"
                            id="dropdown-button"
                            className={`inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-[#EEEEEE] px-2 py-1 text-sm font-medium text-black shadow-sm hover:bg-[#EEEEEE] focus:outline-none`}
                            aria-expanded={selectedId === user._id}
                            aria-haspopup="true"
                            onClick={() => {
                              if (
                                selectedId === user._id ||
                                selectedId !== undefined
                              ) {
                                setId(undefined);
                              } else {
                                setId(user._id);
                              }
                            }}
                          >
                            {checkUsereSelectRole(user._id)}
                            <FaCaretDown
                              className={`ml-2 transition-transform ${selectedId === user._id ? 'rotate-180' : ''}`}
                            />
                          </button>

                          {selectedId === user._id && (
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
                                      user._id ?? '',
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
                                      user._id ?? '',
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
                            handleUserSelect(`${user._id}`, 'member');
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
      isLoading={updateTeamRoomMutation.isLoading}
      handleSubmit={() => {
        updateTeamRoomMutation.mutate({
          axiosAuth,
          body: {
            teamId: state.roomDetail?._id ?? '',
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
