import { getTeams } from '@/app/(main)/(org-panel)/organization/teams/api';
import { getContactList } from '@/app/(main)/(user-panel)/user/chats/api';
import { UserWithRole } from '@/app/helpers/user/states';
import { ProjectDetail } from '@/app/type/projects';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';
import Loader from '@/components/DottedLoader/loader';
import { Search } from '@/components/Form/search';
import useAxiosAuth from '@/hooks/AxiosAuth';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FaCaretDown } from 'react-icons/fa';
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md';
import { useQuery } from 'react-query';

interface UpdateProjectMembersProps {
  project: ProjectDetail | undefined;
  selectedUsers: UserWithRole[];
  onUsersChange: (users: UserWithRole[]) => void;
}

const UpdateProjectMembers = ({
  project,
  selectedUsers,
  onUsersChange,
}: UpdateProjectMembersProps) => {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string>('View All');
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [localUsers, setLocalUsers] = useState<UserWithRole[]>(selectedUsers);
  const [openRoleDropdowns, setOpenRoleDropdowns] = useState<Record<string, boolean>>({});

  // Initialize from project when component mounts (teams removed from project - only users)
  useEffect(() => {
    if (project?.users && project.users.length > 0) {
      const initialUsers: UserWithRole[] = project.users.map((u: any) => {
        const userId = u.user?._id || u.user;
        return { user: userId, role: u.role || 'Contributor' };
      }).filter((u) => u.user);
      setLocalUsers(initialUsers);
      onUsersChange(initialUsers);
    }
  }, [project?._id]);

  // Sync local state with parent when selectedUsers change externally
  useEffect(() => {
    setLocalUsers(selectedUsers);
  }, [selectedUsers]);

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['getAllUsersAndTeams'],
    queryFn: async () => {
      const [teamList, contactList] = await Promise.all([
        getTeams(axiosAuth),
        getContactList(axiosAuth),
      ]);
      return {
        teams: teamList,
        users: contactList.filter((user) => user.role === 2 || user.role == 3),
        externalUser: contactList.filter(
          (user) =>
            user.organization?._id !== session?.user.user.organization?._id
        ),
      };
    },
  });

  // Get selected user IDs from local state (recalculated on each render)
  const selectedUserIds = new Set(localUsers.map((u) => u.user));

  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
  };

  // Check if user is selected
  const isUserSelected = (userId: string) => selectedUserIds.has(userId);

  // Get user role
  const getUserRole = (userId: string): 'Owner' | 'Contributor' => {
    const user = localUsers.find((u) => u.user === userId);
    return (user?.role as 'Owner' | 'Contributor') || 'Contributor';
  };

  // Handle user select/deselect - using functional updates to read latest state
  const handleUserSelect = (userId: string) => {
    setLocalUsers((prevUsers) => {
      const currentSelectedIds = new Set(prevUsers.map((u) => u.user));
      let updated: UserWithRole[];
      
      if (currentSelectedIds.has(userId)) {
        updated = prevUsers.filter((u) => u.user !== userId);
      } else {
        updated = [...prevUsers, { user: userId, role: 'Contributor' }];
      }
      
      onUsersChange(updated);
      return updated;
    });
  };

  // Handle user role change
  const handleUserRoleChange = (userId: string, newRole: 'Owner' | 'Contributor') => {
    const updated = localUsers.map((u) =>
      u.user === userId ? { ...u, role: newRole } : u
    );
    setLocalUsers(updated);
    onUsersChange(updated);
  };

  // Check if team is selected - team is selected when ALL its members are selected
  const isTeamSelected = (teamId: string) => {
    const teamData = data?.teams?.find((t: any) => t._id === teamId);
    const teamMembers = teamData?.members ?? [];
    if (teamMembers.length === 0) return false;
    
    // Team is selected if all its members are selected
    return teamMembers.every((member: any) => {
      const memberId = member._id || member;
      return selectedUserIds.has(memberId);
    });
  };

  // Toggle team expand (row click) - separate from selection
  const handleTeamExpand = (teamId: string) => {
    setExpandedTeamId((prev) => (prev === teamId ? null : teamId));
  };

  // Handle team select (checkbox) - select/deselect all members
  const handleTeamSelect = (teamId: string) => {
    const teamData = data?.teams?.find((t: any) => t._id === teamId);
    const teamMembers = teamData?.members ?? [];
    const memberIds = teamMembers
      .map((m: any) => m._id || m)
      .filter(Boolean) as string[];

    if (memberIds.length === 0) return;

    // Check current state to determine action
    const currentSelectedIds = new Set(localUsers.map((u) => u.user));
    const allMembersSelected = memberIds.every((id) => currentSelectedIds.has(id));

    // Update users
    setLocalUsers((prevUsers) => {
      const prevSelectedIds = new Set(prevUsers.map((u) => u.user));
      let updated: UserWithRole[];

      if (allMembersSelected) {
        // Deselect team - remove all team members
        updated = prevUsers.filter((u) => !memberIds.includes(u.user));
        
        // Collapse if expanded
        if (expandedTeamId === teamId) setExpandedTeamId(null);
      } else {
        // Expand team immediately
        setExpandedTeamId(teamId);

        // Add all team members that aren't already selected
        const newUsers: UserWithRole[] = [];
        memberIds.forEach((memberId) => {
          if (!prevSelectedIds.has(memberId)) {
            newUsers.push({ user: memberId, role: 'Contributor' });
          }
        });

        updated = [...prevUsers, ...newUsers];
      }

      onUsersChange(updated);
      return updated;
    });
  };

  // Check if team member is included
  const isMemberIncluded = (userId: string) => selectedUserIds.has(userId);

  // Handle team member toggle
  const handleMemberToggle = (userId: string) => {
    handleUserSelect(userId);
  };

  // Handle external user select
  const handleExternalUserSelect = (id: string) => {
    handleUserSelect(id);
  };

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isSuccess) {
    const filteredUsers =
      (data.users ?? [])
        .filter((user) => user._id != project?.userId._id)
        ?.filter((user) =>
          `${user?.firstName} ${user?.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
        .filter((user) => {
          if (selected == 'View All') {
            return user;
          } else if (selected == 'Internal Users') {
            return (
              user.organization?._id == session?.user.user.organization?._id
            );
          } else if (selected == 'External Users') {
            return (
              user.organization?._id != session?.user.user.organization?._id
            );
          } else {
            return false;
          }
        }) ?? [];

    const filteredTeams =
      (data.teams ?? [])
        ?.filter((team) =>
          team?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter((team) => {
          if (selected == 'View All' || selected == 'Teams') {
            return team;
          } else {
            return false;
          }
        }) ?? [];

    const filteredOrg =
      (data.externalUser ?? [])?.filter((org: any) => {
        const full = `${org?.firstName ?? ''} ${org?.lastName ?? ''}`.trim();
        const q = searchQuery.toLowerCase();
        return full.toLowerCase().includes(q);
      }) ?? [];

    // Check if all filtered items are selected
    const isAllUsersSelected =
      filteredUsers.length > 0
        ? filteredUsers.every((user) => isUserSelected(user._id ?? ''))
        : false;

    const isAllTeamsSelected =
      filteredTeams.length > 0
        ? filteredTeams.every((team) => isTeamSelected(team._id ?? ''))
        : false;

    const isAllExternalSelected =
      filteredOrg.length === 0 ||
      filteredOrg.every((org: any) => isUserSelected(org._id ?? ''));

    const isAllSelected =
      (filteredUsers.length > 0 ||
        filteredTeams.length > 0 ||
        filteredOrg.length > 0) &&
      (selected === 'View All'
        ? isAllUsersSelected && isAllTeamsSelected && isAllExternalSelected
        : selected === 'Internal Users'
          ? isAllUsersSelected
          : selected === 'External Users'
            ? isAllExternalSelected
            : selected === 'Teams'
              ? isAllTeamsSelected
              : false);

    // Handle select all - batch update to avoid stale state issues
    const handleSelectAll = () => {
      setLocalUsers((prevUsers) => {
        const currentSelectedIds = new Set(prevUsers.map((u) => u.user));
        
        // Helper to check if team is selected based on current state
        const isTeamSelectedInState = (teamId: string) => {
          const teamData = data?.teams?.find((t: any) => t._id === teamId);
          const teamMembers = teamData?.members ?? [];
          if (teamMembers.length === 0) return false;
          return teamMembers.every((member: any) => {
            const memberId = member._id || member;
            return currentSelectedIds.has(memberId);
          });
        };

        let updatedUsers = [...prevUsers];

        if (isAllSelected) {
          // Deselect all - collect IDs to remove
          const userIdsToRemove: string[] = [];
          
          filteredUsers.forEach((user) => {
            if (currentSelectedIds.has(user._id ?? '')) {
              userIdsToRemove.push(user._id ?? '');
            }
          });
          filteredOrg.forEach((org: any) => {
            if (currentSelectedIds.has(org._id ?? '')) {
              userIdsToRemove.push(org._id ?? '');
            }
          });

          // Remove collected users
          updatedUsers = updatedUsers.filter((u) => !userIdsToRemove.includes(u.user));

          // Handle teams - remove all team members
          filteredTeams.forEach((team: any) => {
            if (isTeamSelectedInState(team._id ?? '')) {
              const teamData = data?.teams?.find((t: any) => t._id === team._id);
              const memberIds = (teamData?.members ?? [])
                .map((m: any) => m._id || m)
                .filter(Boolean) as string[];
              updatedUsers = updatedUsers.filter((u) => !memberIds.includes(u.user));
            }
          });
        } else {
          // Select all - collect IDs to add
          const userIdsToAdd: string[] = [];
          
          filteredUsers.forEach((user) => {
            if (!currentSelectedIds.has(user._id ?? '')) {
              userIdsToAdd.push(user._id ?? '');
            }
          });
          filteredOrg.forEach((org: any) => {
            if (!currentSelectedIds.has(org._id ?? '')) {
              userIdsToAdd.push(org._id ?? '');
            }
          });

          // Add collected users
          const newUsers = userIdsToAdd.map((id) => ({ user: id, role: 'Contributor' as const }));
          updatedUsers = [...updatedUsers, ...newUsers];
          
          // Update currentSelectedIds for team processing
          userIdsToAdd.forEach((id) => currentSelectedIds.add(id));

          // Handle teams - add all team members
          filteredTeams.forEach((team: any) => {
            if (!isTeamSelectedInState(team._id ?? '')) {
              const teamData = data?.teams?.find((t: any) => t._id === team._id);
              const memberIds = (teamData?.members ?? [])
                .map((m: any) => m._id || m)
                .filter(Boolean) as string[];
              
              memberIds.forEach((memberId) => {
                if (!currentSelectedIds.has(memberId)) {
                  updatedUsers.push({ user: memberId, role: 'Contributor' });
                  currentSelectedIds.add(memberId);
                }
              });
            }
          });
        }

        onUsersChange(updatedUsers);
        return updatedUsers;
      });
    };

    const showUsers =
      selected === 'View All' ||
      selected === 'Internal Users' ||
      selected === 'External Users';
    const showTeams = selected === 'View All' || selected === 'Teams';
    const showExternal =
      selected === 'View All' || selected === 'External Users';

    return (
      <>
        <div>
          <div className="space-y-4">
            <div className="mr-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search
                  inputRounded={true}
                  type="search"
                  className="rounded-md bg-[#eeeeee] placeholder:text-[#616161]"
                  name="search"
                  placeholder="Search"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="DropDownn relative z-50 inline-block text-left">
                  <button
                    type="button"
                    id="dropdown-button"
                    className={`inline-flex w-full items-center justify-center whitespace-nowrap rounded-md border border-gray-300 bg-[#E2F3FF] px-3 py-1 text-sm font-medium text-black shadow-sm hover:bg-[#E2F3FF] focus:outline-none`}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    {selected}
                    <FaCaretDown
                      className={`ml-2 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
                          onClick={() => handleSelect('View All')}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          View All
                        </button>
                        <button
                          onClick={() => handleSelect('Internal Users')}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          Internal Users
                        </button>
                        <button
                          onClick={() => handleSelect('External Users')}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          External Users
                        </button>
                        <button
                          onClick={() => handleSelect('Teams')}
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
              {(showUsers || showTeams || showExternal) && (
                <CustomBlueCheckBox
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              )}
            </div>

            {/* Creator (always shown, disabled) */}
            <div className="mx-1 flex cursor-not-allowed items-center justify-between rounded-xl border-2 border-gray-300/80 p-2 opacity-50">
              <div className="flex items-center">
                <div className="flex items-center gap-2 text-xs font-normal text-[#212121]">
                  <Image
                    src={'/images/user.png'}
                    className={clsx('rounded-full border-2')}
                    alt={`pic`}
                    width={40}
                    height={40}
                  />
                  <div className="grid">
                    <span className="font-semibold">Me</span>
                    <span>{session?.user.user.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-md border border-gray-300 bg-[#EEEEEE] px-2 py-1 text-sm font-medium text-black">
                  Owner
                </div>
                <CustomBlueCheckBox
                  checked={true}
                  onChange={() => {}}
                  disabled
                />
              </div>
            </div>

            {/* Users */}
            <div className="h-[426px] overflow-y-auto">
              {showUsers &&
                filteredUsers.map((item) => {
                  const isSelected = isUserSelected(item._id ?? '');
                  const userRole = isSelected ? getUserRole(item._id ?? '') : 'Contributor';
                  const dropdownKey = `user-${item._id}`;
                  const showRoleDropdown = openRoleDropdowns[dropdownKey] || false;
                  
                  return (
                    <div key={item._id} className="mx-1">
                      <div className="mb-2 flex items-center justify-between rounded-xl border-2 border-gray-300/80 p-2">
                        <div className="flex items-center">
                          <div className="flex items-center gap-2 text-xs font-normal text-[#212121]">
                            <Image
                              src={'/images/user.png'}
                              className={clsx('rounded-full border-2')}
                              alt={`pic`}
                              width={40}
                              height={40}
                            />
                            <div className="grid">
                              <span className="font-semibold">
                                {item?.firstName} {item?.lastName}
                              </span>
                              <span>{item.email}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <div className="DropDownn relative text-left">
                              <button
                                type="button"
                                className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-[#EEEEEE] px-2 py-1 text-sm font-medium text-black shadow-sm hover:bg-[#EEEEEE] focus:outline-none"
                                onClick={() => setOpenRoleDropdowns(prev => ({ ...prev, [dropdownKey]: !prev[dropdownKey] }))}
                              >
                                {userRole}
                                <FaCaretDown
                                  className={`ml-2 shrink-0 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`}
                                />
                              </button>
                              {showRoleDropdown && (
                                <div
                                  className="absolute right-0 z-50 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                  role="menu"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="py-1" role="none">
                                    <button
                                      onClick={() => {
                                        handleUserRoleChange(item._id ?? '', 'Contributor');
                                        setOpenRoleDropdowns(prev => ({ ...prev, [dropdownKey]: false }));
                                      }}
                                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                      role="menuitem"
                                    >
                                      Contributor
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleUserRoleChange(item._id ?? '', 'Owner');
                                        setOpenRoleDropdowns(prev => ({ ...prev, [dropdownKey]: false }));
                                      }}
                                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                      role="menuitem"
                                    >
                                      Owner
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          <CustomBlueCheckBox
                            checked={isSelected}
                            onChange={() => handleUserSelect(item._id ?? '')}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

              {/* Teams with expandable members */}
              {showTeams &&
                filteredTeams.map((item: any) => {
                  const teamIsSelected = isTeamSelected(item._id ?? '');
                  const isExpanded = expandedTeamId === item._id;
                  const teamMembers = item?.members ?? [];

                  return (
                    <div key={item._id} className="mx-1">
                      <div
                        className="mb-2 flex cursor-pointer items-center justify-between rounded-xl border-2 border-gray-300/80 p-2"
                        onClick={() => handleTeamExpand(item._id ?? '')}
                      >
                        <div className="flex flex-1 items-center gap-2">
                          {isExpanded ? (
                            <MdArrowDropUp className="text-[#0063F7]" />
                          ) : (
                            <MdArrowDropDown className="text-[#0063F7]" />
                          )}
                          <Image
                            src={'/images/team.png'}
                            className={clsx(
                              'rounded-full border-2 border-none bg-primary-50 p-2'
                            )}
                            alt={`team pic`}
                            width={40}
                            height={40}
                          />
                          <div className="grid">
                            <span className="font-semibold">{item.name}</span>
                            <span className="capitalize">Team</span>
                          </div>
                        </div>
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="relative inline-flex"
                        >
                          <CustomBlueCheckBox
                            checked={teamIsSelected}
                            onChange={() => handleTeamSelect(item._id ?? '')}
                          />
                        </div>
                      </div>

                      {/* Expanded team members - shown when expanded (create & edit) */}
                      {isExpanded &&
                        teamMembers.length > 0 && (
                          <div className="mb-2 ml-8 space-y-2 border-l-2 border-gray-200 pl-3">
                            {teamMembers.map((member: any) => {
                              const isMemberSelected = isMemberIncluded(member._id);
                              const memberRole = isMemberSelected ? getUserRole(member._id) : 'Contributor';
                              const dropdownKey = `member-${member._id}`;
                              const showMemberRoleDropdown = openRoleDropdowns[dropdownKey] || false;
                              
                              return (
                                <div
                                  key={member._id}
                                  className="flex items-center justify-between rounded-xl border-2 border-gray-300/80 p-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex items-center">
                                    <div className="flex items-center gap-2 text-xs font-normal text-[#212121]">
                                      <Image
                                        src={'/images/user.png'}
                                        className={clsx('rounded-full border-2')}
                                        alt={`pic`}
                                        width={40}
                                        height={40}
                                      />
                                      <div className="grid">
                                        <span className="font-semibold">
                                          {member?.firstName} {member?.lastName}
                                        </span>
                                        <span>{member.email}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {isMemberSelected && (
                                      <div className="DropDownn relative text-left">
                                        <button
                                          type="button"
                                          className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-[#EEEEEE] px-2 py-1 text-sm font-medium text-black shadow-sm hover:bg-[#EEEEEE] focus:outline-none"
                                          onClick={() => setOpenRoleDropdowns(prev => ({ ...prev, [dropdownKey]: !prev[dropdownKey] }))}
                                        >
                                          {memberRole}
                                          <FaCaretDown
                                            className={`ml-2 shrink-0 transition-transform ${showMemberRoleDropdown ? 'rotate-180' : ''}`}
                                          />
                                        </button>
                                        {showMemberRoleDropdown && (
                                          <div
                                            className="absolute right-0 z-50 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                            role="menu"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <div className="py-1" role="none">
                                              <button
                                                onClick={() => {
                                                  handleUserRoleChange(member._id, 'Contributor');
                                                  setOpenRoleDropdowns(prev => ({ ...prev, [dropdownKey]: false }));
                                                }}
                                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                                role="menuitem"
                                              >
                                                Contributor
                                              </button>
                                              <button
                                                onClick={() => {
                                                  handleUserRoleChange(member._id, 'Owner');
                                                  setOpenRoleDropdowns(prev => ({ ...prev, [dropdownKey]: false }));
                                                }}
                                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                                role="menuitem"
                                              >
                                                Owner
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    <CustomBlueCheckBox
                                      checked={isMemberSelected}
                                      onChange={() => handleMemberToggle(member._id)}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                    </div>
                  );
                })}

              {/* External Users */}
              {showExternal &&
                filteredOrg.map((item: any) => {
                  const isSelected = isUserSelected(item._id ?? '');
                  const userRole = isSelected ? getUserRole(item._id ?? '') : 'Contributor';
                  const dropdownKey = `external-${item._id}`;
                  const showRoleDropdown = openRoleDropdowns[dropdownKey] || false;
                  
                  return (
                    <div key={item._id} className="mx-1">
                      <div className="mb-2 flex items-center justify-between rounded-xl border-2 border-gray-300/80 p-2">
                        <div className="flex items-center">
                          <div className="flex items-center gap-2 text-xs font-normal text-[#212121]">
                            <Image
                              src={'/images/user.png'}
                              className={clsx('rounded-full border-2')}
                              alt={`pic`}
                              width={40}
                              height={40}
                            />
                            <div className="grid">
                              <span className="font-semibold">
                                {item?.firstName} {item?.lastName}
                              </span>
                              <span>{item.email}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <div className="DropDownn relative text-left">
                              <button
                                type="button"
                                className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-[#EEEEEE] px-2 py-1 text-sm font-medium text-black shadow-sm hover:bg-[#EEEEEE] focus:outline-none"
                                onClick={() => setOpenRoleDropdowns(prev => ({ ...prev, [dropdownKey]: !prev[dropdownKey] }))}
                              >
                                {userRole}
                                <FaCaretDown
                                  className={`ml-2 shrink-0 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`}
                                />
                              </button>
                              {showRoleDropdown && (
                                <div
                                  className="absolute right-0 z-50 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                  role="menu"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="py-1" role="none">
                                    <button
                                      onClick={() => {
                                        handleUserRoleChange(item._id ?? '', 'Contributor');
                                        setOpenRoleDropdowns(prev => ({ ...prev, [dropdownKey]: false }));
                                      }}
                                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                      role="menuitem"
                                    >
                                      Contributor
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleUserRoleChange(item._id ?? '', 'Owner');
                                        setOpenRoleDropdowns(prev => ({ ...prev, [dropdownKey]: false }));
                                      }}
                                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                      role="menuitem"
                                    >
                                      Owner
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          <CustomBlueCheckBox
                            checked={isSelected}
                            onChange={() => handleExternalUserSelect(item._id ?? '')}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </>
    );
  }
  return <></>;
};

export { UpdateProjectMembers };
