/* eslint-disable @next/next/no-img-element */
import {
  AllAcitvitiesRoom,
  ChatRooms,
  getAllChatRooms,
} from '@/app/(main)/(user-panel)/user/chats/api';
import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import useShowNotification from '@/app/(main)/(user-panel)/user/chats/useNotification';
import { CHATTYPE } from '@/app/helpers/user/enums';
import { chatSocket, socket } from '@/app/helpers/user/socket.helper';

import { Search } from '@/components/Form/search';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useEffect, useState } from 'react';

import { useQuery, useQueryClient } from 'react-query';
import { MiddleChatSidebar } from '../MiddleChatSidebar';
import RoomCard from '../RoomCard';
import { ChatRoom } from './DirectChatRoom';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import { IoMdArrowDropdown } from 'react-icons/io';
import Loader from '@/components/DottedLoader/loader';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { showNewMessageModel } from '@/store/chatSlice';

export function Direct() {
  const context = useChatCotnext();
  const [filterValue, setFilter] = useState<string>('Newest');
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const { data: rooms, isLoading } = useQuery({
    queryKey: 'rooms',
    queryFn: () => getAllChatRooms(axiosAuth),
    onSuccess: (rooms) => {
      if (context.state.selectUserIdFormTeamOrProject) {
        const room = (rooms ?? []).find((r) =>
          r.participants.every(
            (par) => par._id === context.state.selectUserIdFormTeamOrProject
          )
        );

        if (room) {
          chatSocket.emit('joinRoom', room?.senderId, room?._id, 'direct');
          context.dispatch({
            type: CHATTYPE.CHATDETAIL,
            roomDetail: room,
            chatTab: 'direct',
            chatMessageType: 'chat',
            filteredMessageIds: undefined,
            selectUserIdFormTeamOrProject: undefined,
            mentionUsers: room?.participants,
          });
        }
      }
    },
  });
  useEffect(() => {
    chatSocket.on('roomExist', () => {
      // alert('helo');
      queryClient.invalidateQueries('rooms');
    });
  }, []);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = (rooms ?? []).filter((team) =>
    team?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const reduxDispatch = useDispatch<AppDispatch>();

  // useEffect(() => {
  // if (context.state.selectUserIdFormTeamOrProject) {
  //   const room = (rooms ?? []).find((r) =>
  //     r.participants.every(
  //       (par) => par._id === context.state.selectUserIdFormTeamOrProject
  //     )
  //   );
  //   console.log(room);
  //   chatSocket.emit('joinRoom', room?.senderId, room?._id, 'direct');
  //   context.dispatch({
  //     type: CHATTYPE.CHATDETAIL,
  //     roomDetail: room,
  //     chatTab: 'direct',
  //     chatMessageType: 'chat',
  //     filteredMessageIds: undefined,
  //     selectUserIdFormTeamOrProject: undefined,
  //     mentionUsers: room?.participants,
  //   });
  // }
  // }, [context, rooms]);
  if (isLoading) {
    return <Loader />;
  }

  return (
    <section className="flex w-[114vw]">
      <MiddleChatSidebar
        childrenTop={
          <>
            <div className="ml-0 px-3 text-center lg:ml-2 lg:px-5 lg:text-start">
              <div className="flex cursor-pointer items-center justify-between pt-8">
                <h1 className="w-full text-center font-semibold lg:w-auto lg:text-start lg:text-xl">
                  Direct
                </h1>

                <div className="hidden lg:block">
                  <Dropdown className="rounded-xl bg-primary-50 shadow-md">
                    <DropdownTrigger>
                      <Button className="h-auto rounded-lg border bg-primary-50 px-2 py-1">
                        {filterValue}{' '}
                        <IoMdArrowDropdown className="text-xl shadow-none" />
                      </Button>
                    </DropdownTrigger>

                    <DropdownMenu aria-label="Static Actions">
                      {['Unread', 'Newest', 'Oldest', 'Archived'].map(
                        (item, index) => (
                          <DropdownItem
                            key={index}
                            onPress={() => {
                              setFilter(item);
                            }}
                          >
                            {item}
                          </DropdownItem>
                        )
                      )}
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </div>

            <div className="mt-3 hidden px-3 py-2 md:block lg:px-6">
              <div className="flex items-center justify-between gap-2">
                <Search
                  key={'search'}
                  inputRounded={true}
                  type="text"
                  name="search"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Message"
                />

                <div
                  className=""
                  onClick={() => {
                    // context.dispatch({
                    //   type: CHATTYPE.SHOW_CREATE_NEW_MESSAGE,
                    // });

                    reduxDispatch(showNewMessageModel('direct'));
                  }}
                >
                  <svg
                    width="70"
                    height="46"
                    viewBox="0 0 70 46"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="70" height="46" rx="23" fill="#0063F7" />
                    <path
                      d="M29.167 17.167H28.0003C27.3815 17.167 26.788 17.4128 26.3504 17.8504C25.9128 18.288 25.667 18.8815 25.667 19.5003V30.0003C25.667 30.6192 25.9128 31.2127 26.3504 31.6502C26.788 32.0878 27.3815 32.3337 28.0003 32.3337H38.5003C39.1192 32.3337 39.7127 32.0878 40.1502 31.6502C40.5878 31.2127 40.8337 30.6192 40.8337 30.0003V28.8337"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M39.6667 14.8335L43.1667 18.3335M44.7825 16.6826C45.242 16.2231 45.5001 15.5999 45.5001 14.9501C45.5001 14.3003 45.242 13.6771 44.7825 13.2176C44.323 12.7581 43.6998 12.5 43.05 12.5C42.4002 12.5 41.777 12.7581 41.3175 13.2176L31.5 23.0001V26.5001H35L44.7825 16.6826Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </>
        }
        childrenBottom={
          <div>
            <div className="ml-2 h-[65vh] overflow-y-auto scrollbar-hide">
              {(filteredRooms ?? [])
                .filter((room) => {
                  if (filterValue === 'Unread') {
                    return room.seenCount > 0;
                  }

                  if (filterValue === 'Archived') {
                    return true;
                  }
                  return true;
                })
                .sort((a, b) => {
                  const dateA = new Date(a.updatedAt);
                  const dateB = new Date(b.updatedAt);
                  if (filterValue === 'Newest') {
                    // that mean convert rooms descending order

                    return dateB.getTime() - dateA.getTime();
                  }
                  if (filterValue === 'Oldest') {
                    return dateA.getTime() - dateB.getTime();
                  }
                  return 0;
                })
                ?.map((room: ChatRooms) => {
                  return <RoomCard key={room._id} room={room} />;
                })}
            </div>
          </div>
        }
      />

      {/* <!-- Chat Area --> */}

      {context.state.roomDetail ? (
        <ChatRoom />
      ) : (
        <div className="bg-[#FAFAFA]"></div>
      )}
    </section>
  );
}
