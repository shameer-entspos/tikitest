/* eslint-disable @next/next/no-img-element */
import {
  AllAcitvitiesRoom,
  createTeamRoom,
  getAllTeams,
  getAllTeamsRooms,
  TeamDetails,
  TeamRooms,
} from '@/app/(main)/(user-panel)/user/chats/api';
import Image from 'next/image';
import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { MiddleChatSidebar } from '../MiddleChatSidebar';
import * as Yup from 'yup';
import { PinnedTeamChats, TeamRoomsList } from './roomComponent';
import { TeamChatRoom } from './chatRoomComponent';
import { Search } from '@/components/Form/search';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure,
} from '@nextui-org/react';
import { CHATTYPE } from '@/app/helpers/user/enums';
import useShowNotification from '@/app/(main)/(user-panel)/user/chats/useNotification';
import { IoMdArrowDropdown } from 'react-icons/io';
import { useSession } from 'next-auth/react';
import { Team } from '@/types/interfaces';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import CustomModal from '@/components/Custom_Modal';
import { useFormik } from 'formik';
import { SimpleInput } from '@/components/Form/simpleInput';
import CustomRadio from '@/components/CustomRadioButton/CustomRadioButton';
import { FaCaretDown } from 'react-icons/fa';
import clsx from 'clsx';
import { AppDispatch } from '@/store';
import { showNewMessageModel } from '@/store/chatSlice';
import { useDispatch } from 'react-redux';

export interface GroupedRooms {
  [key: string]: TeamRooms[];
}
export function Teams() {
  const [newModel, setNewModel] = useState<'channel' | undefined>(undefined);
  const context = useChatCotnext();
  const [filterValue, setFilter] = useState<string>('Newest');
  const axiosAuth = useAxiosAuth();
  const { data } = useQuery({
    queryKey: 'teamsRoom',
    queryFn: () => getAllTeamsRooms(axiosAuth),
  });
  const { data: teams } = useQuery({
    queryKey: 'teams',
    queryFn: () => getAllTeams(axiosAuth),
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const handleToggleTopBar = () => {
    setIsOpen(!isOpen);
  };
  const [selected, setSelected] = useState<string>('Recent');
  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
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
  const { data: session } = useSession();
  const [selectedId, setId] = useState<string | undefined>(undefined);
  const [selectedTeam, setTeam] = useState<TeamDetails | undefined>();
  const [section, setSection] = useState<'detail' | 'member'>('detail');
  const [selectedUser, setUserWithRole] = useState<
    { user: string; role: 'admin' | 'member' }[]
  >(
    session?.user?.user?._id
      ? [{ user: session.user.user._id, role: 'admin' }]
      : []
  );

  const [openDropdown, setOpenDropdown] = useState<string>('');
  const queryClient = useQueryClient();
  const createTeamRoomMutation = useMutation(createTeamRoom, {
    onSuccess: () => {
      setNewModel(undefined);
      setSection('detail');
      // organizationForm.resetForm();
      queryClient.invalidateQueries('teamsRoom');
    },
  });
  const organizationForm = useFormik({
    initialValues: {
      team: undefined,
      channelName: '',
      description: '',
      status: 'private',
    },
    validationSchema: Yup.object().shape({
      team: Yup.mixed().required('Projects is required'), // Adjust based on the type of `projects`

      // Validation for channelName (required)
      channelName: Yup.string().required('Channel Name is required'),

      // Validation for description (optional)
      description: Yup.string(),
    }),

    onSubmit: (values) => {
      if (organizationForm.values.status == 'public') {
        selectedTeam?.members.map((user) => {
          setUserWithRole([
            ...selectedUser,
            { user: user._id, role: 'member' },
          ]);
        });
      }
      // appearName
      createTeamRoomMutation.mutate({
        axiosAuth,
        body: {
          teamId: organizationForm.values.team ?? '',
          channelName: organizationForm.values.channelName ?? '',
          description: organizationForm.values.description ?? '',
          appearName:
            organizationForm.values.channelName.replace(/\s+/g, '-') ?? '',
          type: organizationForm.values.status ?? 'public',
          room: selectedUser,
        },
      });
    },
  });
  const handleToggleDropdown = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? '' : dropdownId);
  };
  const reduxDispatch = useDispatch<AppDispatch>();

  //////
  /// other component
  const groupedTeamRooms: GroupedRooms = {};
  const pinnedRooms: TeamRooms[] = [];
  (data ?? [])
    .filter((room) => {
      if (filterValue === 'Unread') {
        return room.seenCount > 0;
      }

      if (filterValue === 'Archived') {
        return true;
      }
      return true;
    })
    .filter((room) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        room.channelName?.toLowerCase().includes(query) ||
        room.description?.toLowerCase().includes(query) ||
        room.teamDetails?.name?.toLowerCase().includes(query)
      );
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
    .forEach((item) => {
      // Add to pinned if it's pinned
      if (item?.isPinned) {
        pinnedRooms.push(item);
      }
      // Add to grouped rooms regardless of pinned status (so it shows in team dropdown too)
      const teamId = item.teamDetails?._id || '';
      if (!groupedTeamRooms[teamId]) {
        groupedTeamRooms[teamId] = [];
      }
      groupedTeamRooms[teamId].push(item);
    });

  return (
    <>
      <section className="flex w-[114vw]">
        <MiddleChatSidebar
          childrenTop={
            <>
              <div className="ml-0 px-3 text-center lg:ml-2 lg:px-5 lg:text-start">
                <div className="flex cursor-pointer items-center justify-between pt-8">
                  <h1 className="w-full text-center font-semibold lg:w-auto lg:text-start lg:text-xl">
                    Teams
                  </h1>

                  <div className="hidden lg:block">
                    <Dropdown className="rounded-xl bg-primary-50 shadow-md">
                      <DropdownTrigger>
                        <Button className="h-auto rounded-lg border bg-primary-50 px-2 py-1">
                          {filterValue}
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
              <div className="mt-3 px-3 py-2 lg:px-6">
                <div className="flex items-center justify-between gap-2">
                  <Search
                    key={'search'}
                    inputRounded={true}
                    type="text"
                    name="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                  />
                  <Dropdown className="mb-4 rounded-xl bg-primary-50 shadow-md">
                    <DropdownTrigger>
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
                    </DropdownTrigger>

                    <DropdownMenu aria-label="Static Actions">
                      {['+ New Message', '+ New Channel'].map((item, index) => (
                        <DropdownItem
                          key={index}
                          onPress={() => {
                            if (index == 0) {
                              // context.dispatch({
                              //   type: CHATTYPE.SHOW_CREATE_NEW_MESSAGE,
                              // });

                              reduxDispatch(showNewMessageModel('team'));
                            }
                            if (index == 1) {
                              organizationForm.resetForm();
                              setNewModel('channel');
                            }
                          }}
                        >
                          {item}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </>
          }
          childrenBottom={
            <>
              <div className="mx-2 h-[85vh] overflow-y-auto">
                {/* first section */}
                {pinnedRooms.length > 0 && (
                  <PinnedTeamChats pinnedRooms={pinnedRooms} />
                )}
                {/* second section */}
                <div className="">
                  <TeamRoomsList groupedTeamRooms={groupedTeamRooms} />
                </div>
              </div>
            </>
          }
        />
        {context.state.roomDetail ? (
          <TeamChatRoom />
        ) : (
          <div className="bg-[#FAFAFA]" />
        )}
      </section>

      <CustomModal
        isOpen={newModel == 'channel'}
        handleCancel={() => {
          setNewModel(undefined);
          setSection('detail');
        }}
        variant="primary"
        cancelvariant="primaryOutLine"
        submitValue={
          organizationForm.values.status == 'public'
            ? 'Create'
            : section == 'detail'
              ? 'Next'
              : `Confirm`
        }
        header={
          <>
            <img src="/svg/chats/project_channel.svg" alt="" />
            <div>
              <h2 className="text-xl font-semibold text-[#1E1E1E]">
                {section == 'detail' ? 'New Team Channel' : 'Channel Members'}
              </h2>
              <span className="mt-1 text-base font-normal text-[#616161]">
                {section == 'detail'
                  ? 'Add team details below.'
                  : 'Add members to team channel.'}
              </span>
            </div>
          </>
        }
        body={
          <div className="flex h-[550px] flex-col overflow-auto px-3">
            {section == 'detail' ? (
              <>
                <div className="w-full">
                  <CustomSearchSelect
                    isRequired={true}
                    label="Assigned Team"
                    data={(teams ?? []).map((t) => ({
                      label: t.name ?? '',
                      value: t._id ?? '',
                    }))}
                    selected={
                      organizationForm.values.team
                        ? [organizationForm.values.team]
                        : []
                    }
                    showImage={false}
                    multiple={false}
                    showSearch={false}
                    isOpen={openDropdown === 'dropdown1'}
                    onToggle={() => handleToggleDropdown('dropdown1')}
                    returnSingleValueWithLabel={true}
                    onSelect={(selected: any, item: any) => {
                      setTeam((teams ?? []).find((v) => v._id === selected));
                      organizationForm.setFieldValue('team', selected);
                    }}
                    placeholder="Select Team"
                  />
                </div>
                <SimpleInput
                  type="text"
                  label="Channel Name"
                  placeholder="Enter Channel Name"
                  name="channelName"
                  className="w-full"
                  required={true}
                  errorMessage={organizationForm.errors.channelName}
                  value={organizationForm.values.channelName}
                  isTouched={organizationForm.touched.channelName}
                  onChange={organizationForm.handleChange}
                />
                <div className="pb-3">
                  <label
                    className="mb-2 block px-2 font-normal"
                    htmlFor="reasone"
                  >
                    Description
                  </label>
                  <textarea
                    rows={3}
                    id="description"
                    name="description"
                    placeholder="Enter channel description"
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
                  <label
                    className="mb-2 block px-2 font-normal"
                    htmlFor="reasone"
                  >
                    Your channel will appear as
                  </label>

                  {organizationForm.values.channelName && (
                    <span className="px-2">
                      {`#${organizationForm.values.channelName.replace(/\s+/g, '-')}`}
                    </span>
                  )}
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
            ) : (
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
                {(selectedTeam?.members ?? []).map((user) => {
                  return (
                    user._id !== session?.user.user._id && (
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
                    )
                  );
                })}
              </>
            )}
          </div>
        }
        isLoading={createTeamRoomMutation.isLoading}
        handleSubmit={() => {
          if (
            organizationForm.values.status == 'public' ||
            section === 'member'
          ) {
            organizationForm.submitForm();
          } else {
            setSection('member');
          }
        }}
      />
    </>
  );
}
