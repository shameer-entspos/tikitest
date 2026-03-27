import {
  ProjectRooms,
  formatTimeDifference,
} from '@/app/(main)/(user-panel)/user/chats/api';
import { chatSocket } from '@/app/helpers/user/socket.helper';
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import { ShowMentionText } from '../MessageCard/ShowMentionText';
import { GroupedProjectRooms } from '.';
import { CHATTYPE } from '@/app/helpers/user/enums';
import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import { Badge } from '@nextui-org/react';
import { useQueryClient } from 'react-query';

export function DefaultAccordionBody({ room }: { room: ProjectRooms }) {
  const context = useChatCotnext();
  const queryClient = useQueryClient();
  return (
    <>
      <div className="px-2">
        <div
          className={`flex md:w-full ${
            context.state.roomDetail?._id === room._id
              ? 'bg-[#E2F3FF]'
              : 'bg-white'
          } cursor-pointer items-center justify-center gap-2 overflow-hidden overflow-y-auto rounded-xl bg-[#E2F3FF] p-2 text-base transition duration-150 ease-in-out hover:bg-[#E2F3FF] focus:outline-none`}
          onClick={() => {
            chatSocket.emit('joinRoom', room.senderId, room._id, 'projects');
            queryClient.invalidateQueries('activitiesRoom');
            context.dispatch({
              type: CHATTYPE.CHATDETAIL,
              roomDetail: room as ProjectRooms,
              chatTab: context.state.chatTab,
              chatMessageType: 'chat',
              filteredMessageIds: undefined,
              mentionUsers: room.participants.filter(
                (user) => user._id != room.senderId
              ),
            });
          }}
        >
          <div>
            <Badge
              content={room.seenCount > 0 && room.seenCount}
              className={'bg-primary-400 sm:hidden'}
              size="md"
              shape="circle"
            >
              <svg
                style={{
                  boxShadow: '0px 0px 10px #006fee7d',
                }}
                className="h-11 w-11 rounded-full bg-primary-50/70 lg:h-[45px] lg:w-[45px]"
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
            </Badge>
          </div>

          {/* /// second section */}
          <div className="hidden w-[90%] flex-col justify-between md:pr-2 lg:flex">
            <div className="text-md hidden justify-between truncate text-ellipsis pl-2 font-semibold text-gray-800 sm:block md:flex">
              <div className="truncate">{`#${room.title.toLowerCase()}`}</div>

              <div className="hidden text-xs text-gray-600 md:block">
                <div className="flex text-end">
                  <span className="block px-1 text-xs text-gray-600">
                    <div className="flex">
                      {(room.isPinned || room.isGeneral) && (
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
                        {room.seenCount > 9 ? '9+' : room.seenCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="ml-2 hidden truncate text-sm text-gray-600 sm:block md:w-20">
                <ShowMentionText isClickable={false} text={room.lastMessage} />
              </span>
              <span className="hidden text-xs text-gray-600 md:block">
                Projects
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function ProjectRoomsActivityList({
  groupedTeamRooms,
}: {
  groupedTeamRooms: GroupedProjectRooms;
}) {
  const [accordionState, setAccordionState] = useState<{
    [key: string]: boolean;
  }>({});
  const handleClick = (teamName: string) => {
    setAccordionState((prevState) => ({
      ...prevState,
      [teamName]: !prevState[teamName],
    }));
  };
  return (
    <>
      {Object.keys(groupedTeamRooms).map((teamName: string) => {
        return (
          <div key={teamName}>
            {(groupedTeamRooms[teamName] ?? [])?.map((room: ProjectRooms) => {
              return <DefaultAccordionBody key={room._id} room={room} />;
            })}
          </div>
        );
      })}
    </>
  );
}

export function ProjectRoomsList({
  groupedTeamRooms,
}: {
  groupedTeamRooms: GroupedProjectRooms;
}) {
  const [accordionState, setAccordionState] = useState<{
    [key: string]: boolean;
  }>({});
  useEffect(() => {
    const initialState: { [key: string]: boolean } = {};
    Object.keys(groupedTeamRooms).forEach((teamName) => {
      initialState[teamName] = true;
    });
    setAccordionState(initialState);
  }, [groupedTeamRooms]);
  const handleClick = (teamName: string) => {
    setAccordionState((prevState) => ({
      ...prevState,
      [teamName]: !prevState[teamName],
    }));
  };
  return (
    <>
      {Object.keys(groupedTeamRooms).map((id: string) => (
        <Accordion open={accordionState[id]} key={id}>
          <AccordionHeader
            onClick={() => handleClick(id)}
            className="flex w-full items-center justify-start border-none py-0"
          >
            <svg
              className={`ml-1 h-5 w-5 px-1 ${accordionState[id] ? '' : '-rotate-90'}`}
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

            <span className="text-base font-normal text-gray-600">
              {groupedTeamRooms[id][0].projectDetails.name}
            </span>
          </AccordionHeader>
          <AccordionBody>
            {(groupedTeamRooms[id] ?? [])?.map((room: ProjectRooms) => {
              return <DefaultAccordionBody room={room} key={room._id} />;
            })}{' '}
          </AccordionBody>
        </Accordion>
      ))}
    </>
  );
}

export function PinnedProjectChats({
  pinnedRooms,
}: {
  pinnedRooms: ProjectRooms[];
}) {
  const [openPinned, setOpen] = useState(true);
  const handleOpen = () => setOpen(!openPinned);
  return (
    <>
      <Accordion open={openPinned}>
        <AccordionHeader
          onClick={() => handleOpen()}
          className="mt-6 flex w-full items-center justify-start border-none py-0"
        >
          <svg
            className={`ml-1 h-5 w-5 px-1 ${openPinned ? '' : '-rotate-90'}`}
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

          <span className="text-base font-normal text-gray-600">Pinned</span>
        </AccordionHeader>
        <AccordionBody>
          {(pinnedRooms ?? [])?.map((room: ProjectRooms) => {
            return (
              <>
                <DefaultAccordionBody room={room} />
              </>
            );
          })}{' '}
        </AccordionBody>
      </Accordion>
    </>
  );
}
