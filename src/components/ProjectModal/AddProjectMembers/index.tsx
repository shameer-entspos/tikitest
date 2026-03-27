import { getTeams } from '@/app/(main)/(org-panel)/organization/teams/api';
import { getContactList } from '@/app/(main)/(user-panel)/user/chats/api';
import { useProjectCotnext } from '@/app/(main)/(user-panel)/user/projects/context';
import { PROJECTACTIONTYPE } from '@/app/helpers/user/enums';
import { UserWithRole } from '@/app/helpers/user/states';
import { ProjectDetail } from '@/app/type/projects';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';
import Loader from '@/components/DottedLoader/loader';
import { Search } from '@/components/Form/search';
import CustomHr from '@/components/Ui/CustomHr';
import useAxiosAuth from '@/hooks/AxiosAuth';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FaCaretDown } from 'react-icons/fa';
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md';
import { useQuery } from 'react-query';

const AddProjectMembers = ({
  project,
  hideNavigation = false,
}: {
  project?: ProjectDetail | undefined;
  hideNavigation?: boolean;
}) => {
  const context = useProjectCotnext();
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string>('View All');
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [openRoleDropdowns, setOpenRoleDropdowns] = useState<Record<string, boolean>>({});

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

  // Initialize edit mode: load users from projectDetail (teams removed from project)
  // Works for both create and edit - edit pre-loads users
  useEffect(() => {
    if (project && (hideNavigation || context.state.isProjectEditing)) {
      // Load users from projectDetail
      if (project.users && project.users.length > 0) {
        project.users.forEach((u: any) => {
          const userId = u.user?._id || u.user;
          if (
            userId &&
            !context.state.users?.some((cu) => cu.user === userId)
          ) {
            context.dispatch({
              type: PROJECTACTIONTYPE.SELECT_USER,
              user: { user: userId, role: u.role || 'Contributor' },
            });
          }
        });
      }
    }
  }, [hideNavigation, context.state.isProjectEditing, project?._id]);

  // Auto-expand first team (create & edit) so members and role section are visible
  useEffect(() => {
    if (expandedTeamId === null && data?.teams?.length) {
      const projectUserIds = new Set(
        (context.state.users ?? []).map((u) => u.user)
      );
      const firstTeamWithMembers = data.teams.find((t: any) => {
        const members = t?.members ?? [];
        const memberIds = members.map((m: any) => m._id || m).filter(Boolean);
        return memberIds.some((id: string) => projectUserIds.has(id));
      });
      const firstTeam = firstTeamWithMembers ?? data.teams[0];
      let firstTeamId: string | null = null;
      if (typeof firstTeam === 'string') {
        firstTeamId = firstTeam;
      } else if (firstTeam && typeof firstTeam === 'object') {
        const t = firstTeam as any;
        firstTeamId = t._id ?? (typeof t.team === 'string' ? t.team : t.team?._id) ?? null;
      }
      if (firstTeamId) setExpandedTeamId(firstTeamId);
    }
  }, [data?.teams, context.state.users, project?._id]);

  // Get selected user IDs from context (for checking if user is selected)
  const selectedUserIds = new Set(
    (context.state.users ?? []).map((u) => u.user)
  );

  // Teams already come with members populated from getTeams() API
  // No need for separate API call - use data.teams directly

  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
  };

  // Check if user is selected
  const isUserSelected = (userId: string) => selectedUserIds.has(userId);

  // Handle user select/deselect
  const handleUserSelect = (userId: string) => {
    if (isUserSelected(userId)) {
      context.dispatch({
        type: PROJECTACTIONTYPE.DESELECT_USER,
        user: { user: userId, role: 'Contributor' },
      });
    } else {
      context.dispatch({
        type: PROJECTACTIONTYPE.SELECT_USER,
        user: { user: userId, role: 'Contributor' },
      });
    }
  };

  // Check if team is selected - team is selected when ALL its members are selected (compare selectedUserIds with team members)
  const isTeamSelected = (teamId: string) => {
    const teamData = data?.teams?.find((t: any) => t._id === teamId);
    const teamMembers = teamData?.members ?? [];
    if (teamMembers.length === 0) return false;
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

    const allMembersSelected = memberIds.every((id) => selectedUserIds.has(id));

    if (allMembersSelected) {
      // Deselect team - remove all team members
      memberIds.forEach((memberId) => {
        if (selectedUserIds.has(memberId)) {
          context.dispatch({
            type: PROJECTACTIONTYPE.DESELECT_USER,
            user: { user: memberId, role: 'Contributor' },
          });
        }
      });
      if (expandedTeamId === teamId) setExpandedTeamId(null);
    } else {
      // Expand team and add all team members
      setExpandedTeamId(teamId);
      memberIds.forEach((memberId) => {
        if (!selectedUserIds.has(memberId)) {
          context.dispatch({
            type: PROJECTACTIONTYPE.SELECT_USER,
            user: { user: memberId, role: 'Contributor' },
          });
        }
      });
    }
  };

  // Get user role from context
  const getUserRole = (userId: string): 'Owner' | 'Contributor' => {
    const user = (context.state.users ?? []).find((u) => u.user === userId);
    return (user?.role as 'Owner' | 'Contributor') || 'Contributor';
  };

  // Handle user role change
  const handleUserRoleChange = (userId: string, role: 'Owner' | 'Contributor') => {
    context.dispatch({
      type: PROJECTACTIONTYPE.UPDATE_USER_ROLE,
      user: { user: userId, role },
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

    // Handle select all
    const handleSelectAll = () => {
      if (isAllSelected) {
        // Deselect all
        filteredUsers.forEach((user) => {
          if (isUserSelected(user._id ?? '')) {
            handleUserSelect(user._id ?? '');
          }
        });
        filteredTeams.forEach((team: any) => {
          if (isTeamSelected(team._id ?? '')) {
            handleTeamSelect(team._id ?? '');
          }
        });
        filteredOrg.forEach((org: any) => {
          if (isUserSelected(org._id ?? '')) {
            handleExternalUserSelect(org._id ?? '');
          }
        });
      } else {
        // Select all
        filteredUsers.forEach((user) => {
          if (!isUserSelected(user._id ?? '')) {
            handleUserSelect(user._id ?? '');
          }
        });
        filteredTeams.forEach((team: any) => {
          if (!isTeamSelected(team._id ?? '')) {
            handleTeamSelect(team._id ?? '');
          }
        });
        filteredOrg.forEach((org: any) => {
          if (!isUserSelected(org._id ?? '')) {
            handleExternalUserSelect(org._id ?? '');
          }
        });
      }
    };

    const showUsers =
      selected === 'View All' ||
      selected === 'Internal Users' ||
      selected === 'External Users';
    const showTeams = selected === 'View All' || selected === 'Teams';
    const showExternal =
      selected === 'View All' || selected === 'External Users';

    // Get expanded team data
    // Get expanded team with members from data.teams (already populated)
    const expandedTeamWithMembers =
      expandedTeamId && data?.teams
        ? data.teams.find((t: any) => t._id === expandedTeamId)
        : null;

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
                  // Get team members from data.teams (already populated, no API call needed)
                  const teamMembers = item?.members ?? [];

                  return (
                    <div key={item._id} className="mx-1">
                      {/* Team header - row click expands, checkbox selects */}
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

          {!hideNavigation && (
            <>
              <CustomHr className="mt-2" />

              <div className="my-4">
                <div className="flex justify-center gap-3 text-center">
                  <button
                    className="h-11 w-1/2 rounded-lg border-2 border-primary-500 text-sm text-primary-500 sm:w-36 sm:text-base"
                    type="button"
                    onClick={() =>
                      context.dispatch({
                        type: PROJECTACTIONTYPE.CURRENTMODAL,
                        currentSection: 'details',
                      })
                    }
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="h-11 w-1/2 rounded-lg bg-primary-500 text-sm text-white hover:bg-primary-600/80 sm:w-36 sm:text-base"
                    onClick={() =>
                      context.dispatch({
                        type: PROJECTACTIONTYPE.CURRENTMODAL,
                        currentSection: 'apps',
                      })
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </>
    );
  }
  return <></>;
};

export { AddProjectMembers };
