import {
  AllAcitvitiesRoom,
  ChatRequestList,
  ChatRooms,
  getAllActivites,
  ProjectRooms,
  TeamRooms,
  TikiAssitant,
} from '@/app/(main)/(user-panel)/user/chats/api';
import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import useShowNotification from '@/app/(main)/(user-panel)/user/chats/useNotification';
import { CHATTYPE } from '@/app/helpers/user/enums';
import { socket } from '@/app/helpers/user/socket.helper';
import useAxiosAuth from '@/hooks/AxiosAuth';
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from '@material-tailwind/react';
import { useEffect, useMemo, useState } from 'react';
import { AiOutlineAlignCenter } from 'react-icons/ai';
import { useQuery, useQueryClient } from 'react-query';
import { ChatRoom } from '../Direct/DirectChatRoom';
import { MiddleChatSidebar } from '../MiddleChatSidebar';
import { ProjectChatRoom } from '../Project/projectChatRoomComponent';
import {
  DefaultAccordionBody,
  ProjectRoomsActivityList,
  ProjectRoomsList,
} from '../Project/projectRoomComponent';
import { ReceiveChatRequestCard } from '../receiveChatRequestsList';
import RoomCard from '../RoomCard';
import { TeamChatRoom } from '../Teams/chatRoomComponent';
import { TeamRoomsActivityList, TeamRoomsList } from '../Teams/roomComponent';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { Search } from '@/components/Form/search';
import { showNewMessageModel } from '@/store/chatSlice';
import { AppDispatch } from '@/store';
import { useDispatch } from 'react-redux';
import Assistant from '../Assistant';
import { AssistantRoom } from '../Assistant/AssitantRoom';

export function Activity({ data }: { data: AllAcitvitiesRoom | undefined }) {
  const context = useChatCotnext();
  const reduxDispatch = useDispatch<AppDispatch>();

  const [activityFilter, setActivityFilter] = useState<string>('Unread');

  ///////////////////////////////////////////////

  const chatRooms = (data?.rooms ?? []).filter((room) => {
    if (activityFilter == 'Unread') {
      return room.seenCount > 0;
    } else if (activityFilter === 'Direct Messages') {
      return true;
    } else {
      return false;
    }
  });
  const teamRooms = (data?.teamRooms ?? []).filter((room) => {
    if (activityFilter == 'Unread') {
      return room.seenCount > 0;
    } else if (activityFilter === 'Teams') {
      return true;
    } else {
      return false;
    }
  });
  const projectRooms = (data?.projectRoom ?? []).filter((room) => {
    if (activityFilter == 'Unread') {
      return room.seenCount > 0;
    } else if (activityFilter === 'Project') {
      return true;
    } else {
      return false;
    }
  });
  const chatRequestList = data?.requestList ?? [];
  const notification =
    activityFilter == 'Unread' ? data?.notifications : undefined;
  return (
    <>
      <MiddleChatSidebar
        childrenTop={
          <>
            <div className="ml-0 px-3 text-center lg:ml-2 lg:px-5 lg:text-start">
              <div className="flex cursor-pointer items-center justify-between pt-8">
                <h1 className="w-full text-center font-semibold lg:w-auto lg:text-start lg:text-xl">
                  Activity
                </h1>

                <div className="hidden lg:block">
                  <Dropdown className="rounded-xl bg-primary-50 shadow-md">
                    <DropdownTrigger>
                      <Button className="h-auto rounded-lg border bg-primary-50 px-2 py-1">
                        {activityFilter}
                        <IoMdArrowDropdown className="text-xl shadow-none" />
                      </Button>
                    </DropdownTrigger>

                    <DropdownMenu aria-label="Static Actions">
                      {['Unread', 'Direct Messages', 'Teams', 'Project'].map(
                        (item, index) => (
                          <DropdownItem
                            key={index}
                            onPress={() => {
                              setActivityFilter(item);
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
            {/* /// second */}
            <div className="mt-3 hidden px-3 py-2 md:block lg:px-6">
              <div className="flex items-center justify-between gap-2">
                <Search
                  key={'search'}
                  inputRounded={true}
                  type="text"
                  name="search"
                  onChange={(e) => {}}
                  placeholder="Search"
                />

                <div
                  className=""
                  onClick={() => {
                    // context.dispatch({
                    //   type: CHATTYPE.SHOW_CREATE_NEW_MESSAGE,
                    // });

                    reduxDispatch(showNewMessageModel('activity'));
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
          <div className="mx-2 h-[85vh] overflow-y-scroll py-2">
            {notification && <Assistant assistant={notification} />}
            {(chatRequestList ?? []).length > 0 && (
              <ChatRequestListAccrodian requestList={chatRequestList ?? []} />
            )}
            {(chatRooms ?? []).length > 0 && (
              <DirectChats pinnedRooms={chatRooms ?? []} />
            )}
            {(projectRooms ?? []).length > 0 && (
              <ProjectRoomsActivityList
                groupedTeamRooms={{ Projects: projectRooms ?? [] }}
              />
            )}
            {(teamRooms ?? []).length > 0 && (
              <TeamRoomsActivityList
                groupedTeamRooms={{ Teams: teamRooms ?? [] }}
              />
            )}
          </div>
        }
      />

      {context.state.roomDetail && (
        <>
          {context.state.roomDetail.type === 'team' ? (
            <TeamChatRoom />
          ) : context.state.roomDetail.type === 'project' ? (
            <ProjectChatRoom />
          ) : context.state.roomDetail.type === 'direct' ? (
            <ChatRoom />
          ) : (
            <AssistantRoom />
          )}
        </>
      )}
    </>
  );
}

function DirectChats({ pinnedRooms }: { pinnedRooms: ChatRooms[] }) {
  return (
    // eslint-disable-next-line react/jsx-no-undef
    <div className="w-full">
      {(pinnedRooms ?? [])?.map((room: ChatRooms) => {
        return <RoomCard key={room._id} room={room} />;
      })}
    </div>
  );
}

function ChatRequestListAccrodian({
  requestList,
}: {
  requestList: ChatRequestList[];
}) {
  const [openPinned, setOpen] = useState(true);
  const handleOpen = () => setOpen(!openPinned);

  return (
    // eslint-disable-next-line react/jsx-no-undef
    <Accordion open={openPinned}>
      <AccordionHeader
        onClick={() => handleOpen()}
        className="ml-2 flex w-full items-center justify-start border-none py-0 lg:ml-[24px]"
      >
        <svg
          className={`h-5 w-5 px-1 ${openPinned ? '' : '-rotate-90'}`}
          viewBox="0 0 15 15"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.1246 3.12609L1.87464 3.12609C1.76074 3.12645 1.64909 3.15787 1.55172 3.21696C1.45434 3.27604 1.37493 3.36057 1.32202 3.46144C1.26911 3.56231 1.24471 3.67569 1.25145 3.7894C1.25819 3.9031 1.29581 4.01281 1.36027 4.10672L6.98527 12.2317C7.21839 12.5686 7.77964 12.5686 8.01339 12.2317L13.6384 4.10672C13.7035 4.013 13.7417 3.90324 13.7488 3.78935C13.7559 3.67546 13.7317 3.5618 13.6787 3.46071C13.6257 3.35963 13.5461 3.275 13.4484 3.216C13.3507 3.15701 13.2388 3.12591 13.1246 3.12609Z"
            fill="#616161"
            clipRule="evenodd"
          />
        </svg>

        <span className="text-xs font-normal text-gray-600"> Direct</span>
      </AccordionHeader>
      <AccordionBody className="">
        {(requestList ?? []).map((e: ChatRequestList) => {
          return (
            <div key={e._id} className="px-2">
              <ReceiveChatRequestCard e={e} />
            </div>
          );
        })}
      </AccordionBody>
    </Accordion>
  );
}
