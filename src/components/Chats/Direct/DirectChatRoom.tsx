/* eslint-disable @next/next/no-img-element */
import { Message } from '@/app/(main)/(user-panel)/user/chats/api';
import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import useChat from '@/app/(main)/(user-panel)/user/chats/userChat';
import { CHATTYPE } from '@/app/helpers/user/enums';
import { chatSocket } from '@/app/helpers/user/socket.helper';
import { Menu, Transition } from '@headlessui/react';
import { format, startOfDay } from 'date-fns';
import { useRef, useState, useEffect, Fragment } from 'react';
import { HiDotsHorizontal } from 'react-icons/hi';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { MdOutlineDeleteForever } from 'react-icons/md';
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import { classNames, SignleMessage } from '../CompleteMessage';
import AppTextArea from '../suggestArea';
import { color } from 'framer-motion';
import { Ellipsis } from 'lucide-react';
import { usePresignedUserPhoto } from '@/hooks/usePresignedUserPhoto';

export function ChatRoom() {
  const context = useChatCotnext();
  const participantPhoto = usePresignedUserPhoto(
    (context.state.roomDetail as any)?.participants?.[0]?.photo
  );
  const chatRef = useRef<HTMLDivElement | null>(null);
  const { messages } = useChat();
  const [prevMessagesLength, setPrevMessagesLength] = useState(
    (messages ?? []).length
  );

  useEffect(() => {
    if ((messages ?? []).length >= prevMessagesLength) {
      scrollToBottom();
    }
    setPrevMessagesLength((messages ?? []).length);
    // Update the previous messages length
  }, [messages, prevMessagesLength, context.state.chatMessageType]);

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
          'sendPrivateMessage',
          context.state.roomDetail._id,
          (context.state.roomDetail as any).senderId,
          message,
          'direct',
          (context.state.roomDetail as any).participants[0]?._id,
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
    <div className="h-[calc(var(--app-vh)-80px)] flex-1 flex-col justify-between bg-[#fafafa]">
      {/* <!-- User's Name --> */}
      <div className="relative flex h-20 w-full justify-between border-b-2 bg-white px-9 sm:items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar src={participantPhoto} className="h-11 w-11" />
            <span
              className={`absolute bottom-0 left-7 h-3.5 w-3.5 ${
                (context.state.roomDetail as any).participants[0].isOnline
                  ? 'bg-green-400'
                  : 'bg-gray-500'
              } rounded-full border-2 border-white dark:border-gray-800`}
            />
          </div>
          <div className="flex flex-col leading-tight">
            <div className="mt-1 flex items-center">
              <span className="mr-3 truncate text-sm font-semibold text-black">
                {context.state.roomDetail?.title}
              </span>
            </div>
            <span className="truncate text-xs text-gray-600">
              {
                (context.state.roomDetail as any).participants[0]?.organization
                  ?.name
              }
            </span>
          </div>
        </div>

        {/* LIST AND SEARCH */}
        <div className="flex items-center gap-16">
          <div className="hidden h-full gap-8 md:flex">
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

            {/* Mentioned */}

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
          {/* DROPDOWN */}

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
                >
                  <DropdownItem
                    key="profile"
                    onClick={() => {
                      context.dispatch({
                        type: CHATTYPE.SHOWPROFILE,
                        roomViewProfile: {
                          // room: context.state.roomDetail,
                          participant: (context.state.roomDetail as any)
                            .participants[0],
                          showFrom: 'direct',
                        },
                      });
                    }}
                  >
                    View Profile
                  </DropdownItem>
                  <DropdownItem
                    key="search"
                    onClick={() => {
                      setShowChatSearch(true);
                      setTimeout(() => searchInputRef.current?.focus(), 0);
                    }}
                  >
                    Search Chat
                  </DropdownItem>
                  <DropdownItem
                    key="pin"
                    onClick={() => {
                      // chatSocket.emit("clearChat", {
                      //   roomId: context.state.roomDetail?._id,
                      //   userId: context.state.roomDetail?.senderId,
                      // });
                    }}
                  >
                    Pin
                  </DropdownItem>
                  <DropdownItem
                    key="mute"
                    onClick={() => {
                      chatSocket.emit('directChatMute', {
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
                    onClick={() => {
                      chatSocket.emit('clearChat', {
                        roomId: context.state.roomDetail?._id,
                        userId: (context.state.roomDetail as any).senderId,
                      });
                    }}
                  >
                    Clear Chat
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
                  ref={searchInputRef}
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

      {/* <!-- Chat Messages (Scrollable) --> */}
      <div
        className="h-[calc(var(--app-vh)-220px)] overflow-y-scroll p-2"
        ref={chatRef}
      >
        <div>
          {groupedMessagesArray.map(({ date, messages }) => (
            <div key={date}>
              <div className="flex justify-center py-2">
                <div className="w-fit rounded-md bg-gray-700 px-2 py-1 text-sm text-gray-100">
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
                      whereToCome={'direct'}
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
          whereToCome="direct"
        />
      </div>
    </div>
  );
}
