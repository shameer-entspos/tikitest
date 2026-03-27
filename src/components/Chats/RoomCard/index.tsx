/* eslint-disable @next/next/no-img-element */
import {
  ChatRooms,
  formatTimeDifference,
} from '@/app/(main)/(user-panel)/user/chats/api';
import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import useShowNotification from '@/app/(main)/(user-panel)/user/chats/useNotification';
import useChat from '@/app/(main)/(user-panel)/user/chats/userChat';

import { CHATTYPE } from '@/app/helpers/user/enums';
import { chatSocket } from '@/app/helpers/user/socket.helper';
import { Avatar, Badge } from '@nextui-org/react';

import React from 'react';
import { useQueryClient } from 'react-query';
import { ShowMentionText } from '../MessageCard/ShowMentionText';

function RoomCard({ room }: { room: ChatRooms }) {
  const context = useChatCotnext();
  const queryClient = useQueryClient();
  return (
    <div className="px-2">
      <div
        // className="flex md:w-full p-2 border-r-gray-200 bg-[#E2F3FF]     "
        className={`flex md:w-full ${
          context.state.roomDetail?._id === room._id
            ? 'bg-[#E2F3FF]'
            : 'bg-white'
        } cursor-pointer items-center justify-center gap-2 overflow-hidden overflow-y-auto rounded-xl bg-[#E2F3FF] p-2 text-base transition duration-150 ease-in-out hover:bg-[#E2F3FF] focus:outline-none`}
        onClick={() => {
          chatSocket.emit('joinRoom', room.senderId, room._id, 'direct');
          queryClient.invalidateQueries('activitiesRoom');
          context.dispatch({
            type: CHATTYPE.CHATDETAIL,
            roomDetail: room as ChatRooms,
            chatTab: context.state.chatTab,
            chatMessageType: 'chat',
            filteredMessageIds: undefined,
            mentionUsers: room.participants.filter(
              (user) => user._id != room.senderId
            ),
          });
        }}
      >
        <div className="relative">
          <Badge
            content={room.seenCount > 0 && room.seenCount}
            className={'bg-primary-400 sm:hidden'}
            size="md"
            color="primary"
            shape="circle"
          >
            <Avatar
              radius="full"
              style={{
                boxShadow: '0px 0px 10px #006fee7d',
              }}
              className="h-10 w-10 rounded-full bg-primary-50/70 lg:h-[45px] lg:w-[45px]"
              src={
                (room.participants[0].photo ?? false)
                  ? room.participants[0].photo
                  : '/images/user.png'
              }
            />
          </Badge>

          <span
            className={`absolute bottom-0 left-7 h-3.5 w-3.5 ${
              room?.participants[0].isOnline ? 'bg-green-400' : 'bg-gray-500'
            } rounded-full border-2 border-white dark:border-gray-800`}
          />
        </div>

        {/* /// second section */}
        <div className="hidden w-[90%] flex-col justify-between md:block md:pr-2 lg:flex">
          <div className="text-md hidden justify-between truncate text-ellipsis pl-2 font-medium text-gray-800 sm:block md:flex">
            <div className="hidden truncate lg:block">{room.title ?? ''}</div>

            <div className="hidden text-xs text-gray-600 lg:block">
              <div className="flex text-end">
                <span className="hidden px-1 text-xs text-gray-600 lg:block">
                  <div className="flex">
                    {room.isPinned && (
                      <div className="pr-1">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 13 13"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8.43031 1.29215C8.27502 1.13643 8.08537 1.0193 7.87659 0.950178C7.66782 0.881053 7.44574 0.861858 7.2282 0.894133C7.01066 0.926408 6.80373 1.00925 6.62402 1.13602C6.44431 1.26278 6.29683 1.42992 6.19344 1.62402L4.29969 5.17715L1.66438 6.05559C1.58851 6.08079 1.52036 6.12497 1.46638 6.18393C1.41241 6.24289 1.37441 6.31467 1.35599 6.39246C1.33758 6.47025 1.33937 6.55145 1.36118 6.62836C1.38299 6.70526 1.42411 6.7753 1.48062 6.83184L3.49344 8.84371L1.01187 11.3253L0.875 12.125L1.67469 11.9881L4.15625 9.50652L6.16813 11.5193C6.22466 11.5759 6.2947 11.617 6.37161 11.6388C6.44851 11.6606 6.52971 11.6624 6.6075 11.644C6.68529 11.6256 6.75707 11.5876 6.81603 11.5336C6.875 11.4796 6.91918 11.4114 6.94438 11.3356L7.82281 8.70121L11.3656 6.80371C11.5587 6.70012 11.7249 6.55283 11.851 6.3736C11.9771 6.19437 12.0595 5.98816 12.0918 5.77141C12.124 5.55467 12.1052 5.33338 12.0367 5.12522C11.9682 4.91706 11.8521 4.72777 11.6975 4.57246L8.43125 1.29121L8.43031 1.29215Z"
                            fill="#616161"
                          />
                        </svg>
                      </div>
                    )}
                    {room.isMuted && (
                      <div className="pr-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="13"
                          width="13"
                          viewBox="0 0 576 512"
                        >
                          <path
                            d="M301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM425 167l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z"
                            fill="#616161"
                          />
                        </svg>
                      </div>
                    )}
                    {formatTimeDifference(new Date(room.updatedAt))}
                  </div>
                </span>
                {room.seenCount > 0 && (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-400">
                    <span className="text-center text-xs font-thin text-white">
                      {room.seenCount < 10 ? room.seenCount : '9+'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="ml-2 hidden truncate text-sm text-gray-600 md:w-20 lg:block">
              <ShowMentionText isClickable={false} text={room.lastMessage} />
            </span>

            <span className="hidden text-xs text-gray-600 lg:block">
              Direct
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomCard;
