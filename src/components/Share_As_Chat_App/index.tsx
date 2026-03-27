import {
  createDuplicateOfSubmission,
  getAllRoomsForJSA,
} from '@/app/(main)/(user-panel)/user/apps/api';
import { generateSecureToken } from '@/app/helpers/token_generator';

import { chatSocket } from '@/app/helpers/user/socket.helper';

import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';
import CustomModal from '@/components/Custom_Modal';
import { Search } from '@/components/Form/search';
import useAxiosAuth from '@/hooks/AxiosAuth';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery } from 'react-query';

const ShareAsChatAppModel = ({
  handleClose,
  pageUrl,
}: {
  handleClose: () => void;
  pageUrl: () => string;
}) => {
  const [description, setDescription] = useState<string>('');
  const { data: session } = useSession();
  // Handle change event for the textarea
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  };
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSection, setSection] = useState<'rooms' | 'message'>('rooms');
  // State to manage selected room IDs
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [selectedTeamRoomIds, setSelectedTeamRoomIds] = useState<string[]>([]);
  const [selectedProjectRoomIds, setSelectedProjectRoomIds] = useState<
    string[]
  >([]);

  const checkLength = () => {
    return (
      selectedRoomIds.length +
      selectedTeamRoomIds.length +
      selectedProjectRoomIds.length
    );
  };

  // Handle ChatRoom checkbox change
  const handleCheckboxChange = (roomId: string) => {
    setSelectedRoomIds((prevState) => {
      // Check if the roomId is already selected
      const isSelected = prevState.includes(roomId);

      // If roomId is selected, remove it
      if (isSelected) {
        return prevState.filter((id) => id !== roomId);
      }

      // If not selected, check length and add if less than 3
      if (checkLength() < 3) {
        return [...prevState, roomId];
      }

      // If the limit is reached, do not add
      return prevState;
    });
  };
  // Handle TeamRoom checkbox change
  const handleTeamRoomCheckboxChange = (roomId: string) => {
    setSelectedTeamRoomIds((prevState) => {
      // Check if the roomId is already selected
      const isSelected = prevState.includes(roomId);

      // If roomId is selected, remove it
      if (isSelected) {
        return prevState.filter((id) => id !== roomId);
      }

      // If not selected, check length and add if less than 3
      if (checkLength() < 3) {
        return [...prevState, roomId];
      }

      // If the limit is reached, do not add
      return prevState;
    });
  };

  // Handle Project Rooms checkbox change
  const handleProjectRoomCheckboxChange = (roomId: string) => {
    setSelectedProjectRoomIds((prevState) => {
      // Check if the roomId is already selected
      const isSelected = prevState.includes(roomId);

      // If roomId is selected, remove it
      if (isSelected) {
        return prevState.filter((id) => id !== roomId);
      }

      // If not selected, check length and add if less than 3
      if (checkLength() < 3) {
        return [...prevState, roomId];
      }

      // If the limit is reached, do not add
      return prevState;
    });
  };

  const [selected, setSelected] = useState('Recent Chats');
  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
  };
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  //   const { state, dispatch } = useJSAAppsCotnext();
  const axiosAuth = useAxiosAuth();

  const { data, isLoading } = useQuery({
    queryKey: 'jsaRoomsList',
    queryFn: () => getAllRoomsForJSA(axiosAuth),
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Filter each room type based on the search query
  const filteredChatRooms = (data?.rooms ?? []).filter(
    (room) =>
      room.participants.firstName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      room.participants.lastName
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const filteredTeamRooms = (data?.teamRooms ?? []).filter((room) =>
    room.channelName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjectRooms = (data?.projectRooms ?? []).filter((room) =>
    room.channelName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    // Example message content
    // const pageUrl = `${window.location.origin}/user/apps/jsa/${
    //   state.jsaAppId
    // }/${state.showChatModel?._id}/${
    //   state.showChatModel?.isTemplate
    //     ? 'Template'
    //     : `${state.showChatModel?.saveAs}`
    // }`;

    // Combine the link with the description
    const messageContent = `${
      description ?? ''
    }\nCheck out this link: ${pageUrl()}`;

    // Send message to selected individual chat rooms
    if (selectedRoomIds.length > 0) {
      const selectedRooms = filteredChatRooms.filter((room) =>
        selectedRoomIds.includes(room._id)
      );
      selectedRooms.forEach((room) => {
        if (chatSocket.connected) {
          // toast.success(room._id);
          chatSocket.emit(
            'sendPrivateMessage',
            room._id!,
            session?.user.user._id!,
            messageContent,
            'direct',
            room.participants._id,
            'text'
          );
        }
      });
    }

    // Send message to selected team rooms
    if (selectedTeamRoomIds.length > 0) {
      const selectedTeamRooms = filteredTeamRooms.filter((room) =>
        selectedTeamRoomIds.includes(room._id)
      );
      selectedTeamRooms.forEach((room) => {
        if (chatSocket.connected) {
          chatSocket.emit(
            'privateTeamMessage',
            room._id,
            session?.user.user._id,
            messageContent,
            'team',
            'text'
          );
        }
      });
    }

    // Send message to selected project rooms
    if (selectedProjectRoomIds.length > 0) {
      const selectedProjectRooms = filteredProjectRooms.filter((room) =>
        selectedProjectRoomIds.includes(room._id)
      );
      selectedProjectRooms.forEach((room) => {
        if (chatSocket.connected) {
          toast.success(room.appearName);
          chatSocket.emit(
            'privateProjectMessage',
            room._id,
            session?.user.user._id,
            messageContent,
            'project',
            'text'
          );
        }
      });
    }
    // dispatch({ type: JSAAPPACTIONTYPE.SHOW_CAHT_MODEL });
    handleClose();
  };

  return (
    <CustomModal
      isOpen={true}
      header={
        <div className="flex flex-row items-start gap-2">
          <svg
            width="50"
            height="50"
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
            <path
              d="M18.3333 19.9974H31.6667M18.3333 26.6641H28.3333M35 11.6641C36.3261 11.6641 37.5979 12.1908 38.5355 13.1285C39.4732 14.0662 40 15.338 40 16.6641V29.9974C40 31.3235 39.4732 32.5952 38.5355 33.5329C37.5979 34.4706 36.3261 34.9974 35 34.9974H26.6667L18.3333 39.9974V34.9974H15C13.6739 34.9974 12.4021 34.4706 11.4645 33.5329C10.5268 32.5952 10 31.3235 10 29.9974V16.6641C10 15.338 10.5268 14.0662 11.4645 13.1285C12.4021 12.1908 13.6739 11.6641 15 11.6641H35Z"
              stroke="#0063F7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div>
            <h2 className="text-xl font-semibold text-[#1E1E1E]">
              {'Send as chat message'}
            </h2>
            <span className="mt-1 text-sm font-normal text-[#616161]">
              {selectedSection == 'rooms' ? (
                <>
                  {
                    'Share a read only link to your chat groups. 3 recipients max.'
                  }
                </>
              ) : (
                <>{'Add a message for your recipients.'}</>
              )}
            </span>
          </div>
        </div>
      }
      body={
        <div className="mx-6 max-h-[600px] bg-white">
          {selectedSection == 'rooms' ? (
            <>
              <div className="flex max-w-[400px] items-center gap-2">
                <Search
                  inputRounded={true}
                  type="search"
                  name="search"
                  placeholder="Search"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {/* DropDown Custom */}
                <div className="relative z-50 mx-2 inline-block text-left">
                  <button
                    type="button"
                    className="inline-flex h-[28px] w-[120px] items-center justify-center gap-2 rounded-md border border-gray-300 bg-[#E2F3FF] py-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-[#e1f0fa] focus:outline-none"
                    id="options-menu"
                    aria-expanded="true"
                    aria-haspopup="true"
                    onClick={handleToggle}
                  >
                    {selected}
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0.500287 -0.00224972H9.50029C9.59141 -0.00196409 9.68073 0.0231676 9.75863 0.0704393C9.83652 0.117711 9.90006 0.185333 9.94238 0.266026C9.98471 0.34672 10.0042 0.43743 9.99884 0.528392C9.99345 0.619353 9.96335 0.707122 9.91179 0.78225L5.41179 7.28225C5.22529 7.55175 4.77629 7.55175 4.58929 7.28225L0.0892869 0.78225C0.0371993 0.707279 0.00665394 0.619466 0.000969462 0.528353C-0.00471502 0.43724 0.0146788 0.346311 0.0570438 0.265447C0.0994089 0.184582 0.163125 0.116873 0.241269 0.0696783C0.319413 0.0224833 0.408997 -0.00239372 0.500287 -0.00224972Z"
                        fill="#1E1E1E"
                      />
                    </svg>
                  </button>

                  {isOpen && (
                    <div
                      className="absolute left-0 z-50 mt-2 w-48 origin-top-left rounded-md bg-[#E2F3FF] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="options-menu"
                    >
                      <div className="py-1" role="none">
                        <button
                          onClick={() => handleSelect('Recent Chats')}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          Recent Chats
                        </button>
                        <button
                          onClick={() => handleSelect('My Contacts')}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          My Contacts
                        </button>
                        <button
                          onClick={() => handleSelect('Team Chats')}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          Team Chats
                        </button>
                        <button
                          onClick={() => handleSelect('Project Chats')}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          Project Chats
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="my-3 h-[430px]">
                {/* // ChatROom  */}
                {(selected == 'Recent Chats' || selected == 'My Contacts') && (
                  <>
                    {(filteredChatRooms ?? []).map((room) => {
                      return (
                        <div
                          key={room._id}
                          className={
                            'my-2 flex items-center justify-between rounded-md border border-gray-300 px-3 py-1'
                          }
                        >
                          <div className="flex items-center justify-start gap-2">
                            <img
                              src={`${
                                room.participants.photo
                                  ? room.participants.photo
                                  : '/images/user.png'
                              }`}
                              className="h-10 w-10"
                              alt="room img"
                            />
                            <span className="truncate text-base font-normal text-[#1E1E1E]">
                              {room.title}
                            </span>
                            <span className="truncate text-sm font-normal text-[#616161]">
                              {`- ${room.participants.email}`}
                            </span>
                          </div>
                          <CustomBlueCheckBox
                            checked={selectedRoomIds.includes(room._id)}
                            onChange={() => handleCheckboxChange(room._id)}
                            disabled={
                              checkLength() == 3 &&
                              !selectedRoomIds.includes(room._id)
                            }
                          />
                        </div>
                      );
                    })}
                  </>
                )}
                {/* Team Rooms  */}
                {(selected == 'Recent Chats' || selected == 'Team Chats') && (
                  <>
                    {(filteredTeamRooms ?? []).map((room) => {
                      return (
                        <div
                          key={room._id}
                          className={
                            'my-2 flex items-center justify-between rounded-md border border-gray-300 px-3 py-1'
                          }
                        >
                          <div className="flex items-center justify-start gap-2">
                            <svg
                              width="40"
                              height="40"
                              viewBox="0 0 40 40"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle cx="20" cy="20" r="20" fill="#E2F3FF" />
                              <path
                                d="M20 9.5C19.5408 9.5 19.0862 9.59044 18.6619 9.76616C18.2377 9.94187 17.8523 10.1994 17.5276 10.5241C17.2029 10.8488 16.9454 11.2342 16.7697 11.6584C16.5939 12.0827 16.5035 12.5373 16.5035 12.9965C16.5035 13.4557 16.5939 13.9103 16.7697 14.3346C16.9454 14.7588 17.2029 15.1442 17.5276 15.4689C17.8523 15.7936 18.2377 16.0511 18.6619 16.2268C19.0862 16.4026 19.5408 16.493 20 16.493C20.9273 16.493 21.8167 16.1246 22.4724 15.4689C23.1281 14.8132 23.4965 13.9238 23.4965 12.9965C23.4965 12.0692 23.1281 11.1798 22.4724 10.5241C21.8167 9.86838 20.9273 9.5 20 9.5ZM27.875 11.2465C27.1788 11.2465 26.5111 11.5231 26.0188 12.0153C25.5266 12.5076 25.25 13.1753 25.25 13.8715C25.25 14.5677 25.5266 15.2354 26.0188 15.7277C26.5111 16.2199 27.1788 16.4965 27.875 16.4965C28.5712 16.4965 29.2389 16.2199 29.7312 15.7277C30.2234 15.2354 30.5 14.5677 30.5 13.8715C30.5 13.1753 30.2234 12.5076 29.7312 12.0153C29.2389 11.5231 28.5712 11.2465 27.875 11.2465ZM12.125 11.2465C11.4288 11.2465 10.7611 11.5231 10.2688 12.0153C9.77656 12.5076 9.5 13.1753 9.5 13.8715C9.5 14.5677 9.77656 15.2354 10.2688 15.7277C10.7611 16.2199 11.4288 16.4965 12.125 16.4965C12.8212 16.4965 13.4889 16.2199 13.9812 15.7277C14.4734 15.2354 14.75 14.5677 14.75 13.8715C14.75 13.1753 14.4734 12.5076 13.9812 12.0153C13.4889 11.5231 12.8212 11.2465 12.125 11.2465ZM14.75 19.9843C14.7532 19.5222 14.939 19.0803 15.2669 18.7547C15.5947 18.4292 16.038 18.2465 16.5 18.2465H23.5C23.9641 18.2465 24.4092 18.4309 24.7374 18.7591C25.0656 19.0873 25.25 19.5324 25.25 19.9965V25.2465C25.2499 25.7973 25.1637 26.3446 24.9945 26.8687C24.607 28.0565 23.8088 29.0672 22.7432 29.7193C21.6775 30.3715 20.4143 30.6224 19.1803 30.427C17.9464 30.2316 16.8225 29.6027 16.0105 28.6532C15.1985 27.7037 14.7516 26.4958 14.75 25.2465V19.9843ZM13 19.9965C13 19.3577 13.1698 18.761 13.469 18.2465H9.5C9.03587 18.2465 8.59075 18.4309 8.26256 18.7591C7.93437 19.0873 7.75 19.5324 7.75 19.9965V24.3715C7.74976 25.0878 7.9254 25.7932 8.26148 26.4257C8.59756 27.0583 9.08381 27.5986 9.67752 27.9993C10.2712 28.4 10.9543 28.6488 11.6666 28.7239C12.3789 28.7989 13.0988 28.6979 13.763 28.4297C13.2593 27.4438 12.9978 26.3519 13 25.2447V19.9965ZM27 19.9965V25.2465C27 26.3927 26.7253 27.4742 26.237 28.4297C26.9012 28.6979 27.6211 28.7989 28.3334 28.7239C29.0457 28.6488 29.7288 28.4 30.3225 27.9993C30.9162 27.5986 31.4024 27.0583 31.7385 26.4257C32.0746 25.7932 32.2502 25.0878 32.25 24.3715V19.9965C32.25 19.5324 32.0656 19.0873 31.7374 18.7591C31.4092 18.4309 30.9641 18.2465 30.5 18.2465H26.531C26.8285 18.761 27 19.3577 27 19.9965Z"
                                fill="#0099FF"
                              />
                            </svg>

                            <span className="truncate text-base font-normal text-[#1E1E1E]">
                              {room.appearName}
                            </span>
                            <span className="truncate text-sm font-normal text-[#616161]">
                              {`- ${room.channelName}`}
                            </span>
                          </div>
                          <CustomBlueCheckBox
                            disabled={
                              checkLength() == 3 &&
                              !selectedTeamRoomIds.includes(room._id)
                            }
                            checked={selectedTeamRoomIds.includes(room._id)} // Check the state for this room's ID
                            onChange={() =>
                              handleTeamRoomCheckboxChange(room._id)
                            }
                          />
                        </div>
                      );
                    })}
                  </>
                )}
                {/* Project Rooms  */}
                {(selected == 'Recent Chats' ||
                  selected == 'Project Chats') && (
                  <>
                    {(filteredProjectRooms ?? []).map((room) => {
                      return (
                        <div
                          key={room._id}
                          className={
                            'my-2 flex items-center justify-between rounded-md border border-gray-300 px-3 py-1'
                          }
                        >
                          <div className="flex items-center justify-start gap-2">
                            <svg
                              width="40"
                              height="40"
                              viewBox="0 0 40 40"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle cx="20" cy="20" r="20" fill="#E2F3FF" />
                              <path
                                d="M11.8333 30.5C11.1917 30.5 10.6422 30.2713 10.1848 29.814C9.7275 29.3567 9.49922 28.8076 9.5 28.1667V20.875H17.6667V30.5H11.8333ZM20 30.5V20.875H30.5V28.1667C30.5 28.8083 30.2713 29.3578 29.814 29.8152C29.3567 30.2725 28.8076 30.5008 28.1667 30.5H20ZM9.5 18.5417V11.8333C9.5 11.1917 9.72867 10.6422 10.186 10.1848C10.6433 9.7275 11.1924 9.49922 11.8333 9.5H28.1667C28.8083 9.5 29.3578 9.72867 29.8152 10.186C30.2725 10.6433 30.5008 11.1924 30.5 11.8333V18.5417H9.5Z"
                                fill="#0099FF"
                              />
                            </svg>

                            <span className="truncate text-base font-normal text-[#1E1E1E]">
                              {`#${room.appearName}`}
                            </span>
                            <span className="truncate text-sm font-normal text-[#616161]">
                              {`- ${room.channelName}`}
                            </span>
                          </div>
                          <CustomBlueCheckBox
                            checked={selectedProjectRoomIds.includes(room._id)}
                            onChange={() =>
                              handleProjectRoomCheckboxChange(room._id)
                            }
                            disabled={
                              checkLength() == 3 &&
                              !selectedProjectRoomIds.includes(room._id)
                            }
                          />
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="h-[460px]">
                {/* // ChatROom  */}
                {(selected == 'Recent Chats' || selected == 'My Contacts') && (
                  <>
                    {(filteredChatRooms ?? []).map((room) => {
                      return (
                        <div
                          key={room._id}
                          className={'flex items-center justify-between'}
                        >
                          {selectedRoomIds.includes(room._id) && (
                            <div className="mb-1 flex items-center justify-start gap-2">
                              <span className="truncate text-base font-normal text-[#616161]">
                                {room.title}
                              </span>
                              <span className="truncate text-xs font-normal text-[#616161]">
                                {`- ${room.participants.email}`}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
                {/* Team Rooms  */}
                {(selected == 'Recent Chats' || selected == 'Team Chats') && (
                  <>
                    {(filteredTeamRooms ?? []).map((room) => {
                      return (
                        <div
                          key={room._id}
                          className={'flex items-center justify-between'}
                        >
                          {selectedTeamRoomIds.includes(room._id) && (
                            <div className="mb-1 flex items-center justify-start gap-2">
                              <span className="truncate text-base font-normal text-[#616161]">
                                {`#${room.appearName}`}
                              </span>
                              <span className="truncate text-xs font-normal text-[#616161]">
                                {`- ${room.channelName}`}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
                {/* Project Rooms  */}
                {(selected == 'Recent Chats' ||
                  selected == 'Project Chats') && (
                  <>
                    {(filteredProjectRooms ?? []).map((room) => {
                      return (
                        <div
                          key={room._id}
                          className={'flex items-center justify-between'}
                        >
                          {selectedProjectRoomIds.includes(room._id) && (
                            <div className="flex items-center justify-start gap-2">
                              <span className="truncate text-base font-normal text-[#616161]">
                                {`#${room.appearName}`}
                              </span>
                              <span className="truncate text-sm font-normal text-[#616161]">
                                {`- ${room.channelName}`}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}

                <div className="my-8">
                  <label className="mb-2 block" htmlFor="description">
                    Your Message
                  </label>
                  <textarea
                    rows={6}
                    id="description"
                    name="description"
                    placeholder="Enter a message"
                    className={` ${'border-[#EEEEEE]'} w-full resize-none rounded-xl border-1 border-gray-300 p-2 shadow-sm`}
                    onChange={handleChange}
                    value={description}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      }
      cancelButton={selectedSection == 'rooms' ? 'Cancel' : 'Back'}
      handleSubmit={() => {
        if (selectedSection == 'rooms') {
          setSection('message');
        } else {
          handleSendMessage();
        }
      }}
      handleCancel={() => {
        if (selectedSection == 'rooms') {
          //   dispatch({ type: JSAAPPACTIONTYPE.SHOW_CAHT_MODEL });
          handleClose();
        } else {
          setSection('rooms');
        }
      }}
      submitValue={
        selectedSection == 'rooms'
          ? `${`Select ${
              selectedRoomIds.length +
                selectedTeamRoomIds.length +
                selectedProjectRoomIds.length >
              0
                ? `(${
                    selectedRoomIds.length +
                    selectedTeamRoomIds.length +
                    selectedProjectRoomIds.length
                  })`
                : ''
            }`}`
          : 'Send'
      }
    />
  );
};

export default ShareAsChatAppModel;
