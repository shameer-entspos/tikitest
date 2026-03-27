/* eslint-disable @next/next/no-img-element */
import {
  getAssistantNotification,
  Message,
} from '@/app/(main)/(user-panel)/user/chats/api';
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
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useQuery } from 'react-query';
import { ShowMentionText } from '../MessageCard/ShowMentionText';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import { HighlightQuotedText } from '@/components/UserNavbar/UserNavbar';

export function AssistantRoom() {
  const context = useChatCotnext();
  const chatRef = useRef<HTMLDivElement | null>(null);
  //   const { messages } = useChat();
  const axiosAuth = useAxiosAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['assitant'],
    queryFn: () => getAssistantNotification(axiosAuth),
  });
  const messages = data?.notifications ?? [];
  const [prevMessagesLength, setPrevMessagesLength] = useState(messages.length);

  useEffect(() => {
    if (messages.length >= prevMessagesLength) {
      scrollToBottom();
    }
    setPrevMessagesLength(messages.length);
    // Update the previous messages length
  }, [messages, prevMessagesLength, context.state.chatMessageType]);

  ///////////////=============================????????????????????????????

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
      message: any
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
    <div className="h-[calc(var(--app-vh)-80px)] w-[calc(117vw-500px)] flex-1 flex-col justify-between bg-[#fafafa]">
      {/* <!-- User's Name --> */}
      <div className="flex h-20 w-full justify-between border-b-2 bg-white px-9 sm:items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img src="/svg/assistant.svg" alt="Assistant" />
          </div>
          <div className="flex flex-col leading-tight">
            <div className="mt-1 flex items-center">
              <span className="mr-3 truncate text-sm font-semibold text-black">
                {'Tiki Assistant'}
              </span>
            </div>
            <span className="truncate text-xs text-gray-600">
              {'Your personal assistant'}
            </span>
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
                <div className="w-fit rounded-md bg-gray-700 px-2 py-1 text-sm text-gray-100">
                  {startOfDay(new Date(date)).toLocaleDateString()}
                </div>
              </div>
              <ul>
                {(messages ?? []).map((message: any, index: number) => {
                  // Apply different classes for sender and receiver
                  return (
                    <div
                      className="flex w-full max-w-[52%] items-center justify-start p-2"
                      key={message._id}
                    >
                      <img src="/svg/assistant.svg" alt="Assistant" />
                      <div className="ml-2 flex w-full flex-col rounded-lg bg-[#E0E0E0] p-3">
                        <div className="flex w-full justify-between">
                          <span className="text-sm font-semibold text-[#1E1E1E]">
                            Tiki Assistant
                          </span>
                          <span className="text-sm text-[#616161]">
                            {timeFormat(message.createdAt)}
                          </span>
                        </div>

                        <span className="mt-2 text-sm text-[#616161]">
                          <HighlightQuotedText text={message.subtitle} />
                        </span>
                        <span className="mt-2 cursor-pointer text-sm font-semibold text-primary-500">
                          View
                        </span>
                      </div>
                    </div>
                    // <SignleMessage
                    //   message={message}
                    //   key={message._id}
                    //   whereToCome={'direct'}
                    // />
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
