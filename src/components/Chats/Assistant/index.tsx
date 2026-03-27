import {
  formatTimeDifference,
  TikiAssitant,
} from '@/app/(main)/(user-panel)/user/chats/api';
import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import { useQueryClient } from 'react-query';
import { ShowMentionText } from '../MessageCard/ShowMentionText';
import { Avatar, Badge } from '@nextui-org/react';
import { CHATTYPE } from '@/app/helpers/user/enums';

export default function Assistant({ assistant }: { assistant: TikiAssitant }) {
  const context = useChatCotnext();
  const queryClient = useQueryClient();
  return (
    <div className="px-2">
      <div
        // className="flex md:w-full p-2 border-r-gray-200 bg-[#E2F3FF]     "
        className={`flex md:w-full ${
          context.state.roomDetail?._id === assistant._id
            ? 'bg-[#E2F3FF]'
            : 'bg-white'
        } cursor-pointer items-center justify-center gap-2 overflow-hidden overflow-y-auto rounded-xl bg-[#E2F3FF] p-2 text-base transition duration-150 ease-in-out hover:bg-[#E2F3FF] focus:outline-none`}
        onClick={() => {
          //   chatSocket.emit('joinRoom', room.senderId, room._id, 'direct');
          queryClient.invalidateQueries('activitiesRoom');
          context.dispatch({
            type: CHATTYPE.CHATDETAIL,
            roomDetail: assistant as TikiAssitant,
            chatTab: context.state.chatTab,
            chatMessageType: 'chat',
            filteredMessageIds: undefined,
            mentionUsers: [],
          });
        }}
      >
        <div className="relative">
          <img src="/svg/assistant.svg" alt="Assistant" />

          {/* <span
            className={`absolute bottom-0 left-7 h-3.5 w-3.5 ${
              room?.participants[0].isOnline ? 'bg-green-400' : 'bg-gray-500'
            } rounded-full border-2 border-white dark:border-gray-800`}
          /> */}
        </div>

        {/* /// second section */}
        <div className="hidden w-[90%] flex-col justify-between md:block lg:flex">
          <div className="text-md hidden justify-between truncate text-ellipsis font-medium text-gray-800 sm:block md:flex">
            <div className="hidden truncate lg:block">Tiki Assistant</div>

            <div className="hidden text-xs text-gray-600 lg:block">
              <div className="flex text-end">
                <span className="hidden px-1 text-xs text-gray-600 lg:block">
                  <div className="flex">
                    {formatTimeDifference(new Date(assistant.updatedAt))}
                  </div>
                </span>
                {/* {room.seenCount > 0 && (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-400">
                    <span className="text-center text-xs font-thin text-white">
                      {room.seenCount < 10 ? room.seenCount : '9+'}
                    </span>
                  </div>
                )} */}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="hidden truncate text-sm text-gray-600 md:w-20 lg:block">
              <ShowMentionText isClickable={false} text={assistant.subtitle} />
            </span>

            {/* <span className="hidden text-xs text-gray-600 lg:block">
              Direct
            </span> */}
          </div>
        </div>
      </div>
    </div>
  );
}
