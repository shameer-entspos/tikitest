import {
  createTask,
  editTask,
  getTeamsWithMembers,
  TeamWithMembers,
} from '@/app/(main)/(user-panel)/user/tasks/api';
import { getContactList } from '@/app/(main)/(user-panel)/user/chats/api';
import { getTeams } from '@/app/(main)/(org-panel)/organization/teams/api';
import { useTaskCotnext } from '@/app/(main)/(user-panel)/user/tasks/context';
import { axiosAuth } from '@/app/axios';
import { TASKTYPE } from '@/app/helpers/user/enums';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';
import CustomModal from '@/components/Custom_Modal';
import { Search } from '@/components/Form/search';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import { useRef, useEffect, useState } from 'react';
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md';
import { useQueryClient, useMutation, useQuery } from 'react-query';
import Image from 'next/image';
import { handleAddTaskModel } from '@/store/taskSlice';
import { AppDispatch } from '@/store';
import { useDispatch } from 'react-redux';
import Loader from '@/components/DottedLoader/loader';

function aggregateFromProjects(selected: any[]) {
  const userMap = new Map<
    string,
    { _id: string; firstName?: string; lastName?: string; email?: string; role?: number }
  >();
  for (const p of selected) {
    for (const u of p?.users ?? []) {
      const ur = u?.user;
      if (ur?._id && !userMap.has(ur._id))
        userMap.set(ur._id, {
          _id: ur._id,
          firstName: ur.firstName,
          lastName: ur.lastName,
          email: ur.email,
          role: ur?.role as number,
        });
    }
  }
  const teamMap = new Map<string, { _id: string; name: string }>();
  for (const p of selected) {
    for (const t of p?.teams ?? []) {
      const tr = t?.team;
      if (tr?._id && !teamMap.has(tr._id))
        teamMap.set(tr._id, { _id: tr._id, name: tr?.name ?? '' });
    }
  }
  const role23 = (u: any) => u != null && [2, 3].includes(Number(u?.role));
  return {
    users: Array.from(userMap.values()).filter(role23),
    teams: Array.from(teamMap.values()),
    externalUser: [] as any[],
  };
}

export function TasKMembers({
  handleCancel,
  adminMode = false,
}: {
  handleCancel: any;
  adminMode?: boolean;
}) {
  const { state, dispatch } = useTaskCotnext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const prevTeamIdsRef = useRef<string[]>([]);

  const queryClient = useQueryClient();
  const reduxDispatch = useDispatch<AppDispatch>();
  const { data: session } = useSession();

  const [selected, setSelected] = useState<
    'View all' | 'Internal users' | 'External users' | 'Teams'
  >('View all');
  const handleSelect = (
    option: 'View all' | 'Internal users' | 'External users' | 'Teams'
  ) => {
    setSelected(option);
    setIsOpen(false);
  };

  const isGeneral = state.payload?.isGeneral ?? false;
  const selectedProjectsDetail = state.payload?.selectedProjectsDetail ?? [];
  const myOrgId = session?.user?.user?.organization?._id ?? null;
  const role23 = (u: any) => u != null && [2, 3].includes(Number(u?.role));

  const { data, isLoading } = useQuery({
    queryKey: [
      'listMembersListOfProejcts',
      isGeneral,
      selectedProjectsDetail,
      isGeneral ? myOrgId : null,
    ],
    queryFn: async () => {
      if (isGeneral) {
        const [teamList, contactList] = await Promise.all([
          getTeams(axiosAuth),
          getContactList(axiosAuth),
        ]);
        const myId = String(myOrgId ?? '');
        const users = (contactList ?? [])
          .filter((c: any) => String(c?.organization?._id ?? '') === myId)
          .map((c: any) => ({
            _id: c._id,
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
            role: c.role,
          }))
          .filter(role23);
        const externalUser = (contactList ?? [])
          .filter((c: any) => String(c?.organization?._id ?? '') !== myId)
          .map((c: any) => ({
            _id: c._id,
            firstName: c.firstName ?? '',
            lastName: c.lastName ?? '',
            name: `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim(),
            email: c.email ?? '',
          }));
        return {
          users,
          teams: (teamList ?? []).map((t: any) => ({
            _id: t._id,
            name: t.name ?? '',
          })),
          externalUser,
        };
      }
      return Promise.resolve(aggregateFromProjects(selectedProjectsDetail));
    },
    enabled: !isGeneral || !!session,
  });

  const selectedTeamIds = state.teams ?? [];

  // Fetch members for ALL selected teams (for sync checkmarks in Internal users + expanded view)
  const { data: teamsWithMembersData } = useQuery({
    queryKey: ['teamsWithMembers', selectedTeamIds],
    queryFn: () => getTeamsWithMembers(axiosAuth, selectedTeamIds),
    enabled: selectedTeamIds.length > 0,
  });

  const expandedTeamWithMembers: TeamWithMembers | null =
    expandedTeamId && (teamsWithMembersData?.length ?? 0) > 0
      ? teamsWithMembersData?.find((t) => t._id === expandedTeamId) ?? null
      : null;

  // When loading for edit, sync ref so we don't re-add all team members
  useEffect(() => {
    if (state.isShowForEdit && selectedTeamIds.length > 0) {
      prevTeamIdsRef.current = [...selectedTeamIds];
    }
  }, [state.isShowForEdit, state.taskModel?._id, selectedTeamIds.join(',')]);

  // When a team is newly selected and we have its members, add them to assignedUserIds
  useEffect(() => {
    if (!teamsWithMembersData?.length) return;
    const prev = prevTeamIdsRef.current;
    const added = selectedTeamIds.filter((id) => !prev.includes(id));
    prevTeamIdsRef.current = [...selectedTeamIds];
    if (added.length === 0) return;
    const idsToAdd: string[] = [];
    added.forEach((teamId) => {
      const team = teamsWithMembersData.find((t) => t._id === teamId);
      (team?.members ?? []).forEach((m) => m._id && idsToAdd.push(m._id));
    });
    if (idsToAdd.length) {
      dispatch({ type: TASKTYPE.ADD_ASSIGNED_USERS, assignedUserIds: idsToAdd });
    }
  }, [selectedTeamIds.join(','), teamsWithMembersData]);

  const userCreateTaskMutation = useMutation(createTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
      if (state.payload?.projects?.length) {
        state.payload.projects.forEach((projectId: string) => {
          queryClient.invalidateQueries(`projectDetail${projectId}`);
        });
      }
      dispatch({ type: TASKTYPE.SHOWNEWTASKMODAL });
      reduxDispatch(handleAddTaskModel(undefined));
    },
  });
  const userUpdateTaskMutation = useMutation(editTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
      dispatch({ type: TASKTYPE.SHOW_EDIT_SECTION });
      reduxDispatch(handleAddTaskModel(undefined));
    },
  });

  const assignedSet = new Set(state.assignedUserIds ?? []);
  const isUserSelected = (userId: string) => assignedSet.has(userId);
  const handleUserSelect = (userId: string) => {
    dispatch({ type: TASKTYPE.TOGGLE_ASSIGNED_USER, assignedUserIds: [userId] });
  };

  const isTeamSelected = (teamId: string) =>
    state.teams?.some((team) => team === teamId);
  const handleTeamSelect = (teamId: string) => {
    if ((state.teams ?? []).findIndex((team) => team === teamId) !== -1) {
      const teamData = teamsWithMembersData?.find((t) => t._id === teamId);
      const memberIds = (teamData?.members ?? []).map((m) => m._id).filter(Boolean) as string[];
      if (memberIds.length) {
        dispatch({ type: TASKTYPE.REMOVE_ASSIGNED_USERS, assignedUserIds: memberIds });
      }
      dispatch({ type: TASKTYPE.DESELECT_TEAM, teams: teamId });
      if (expandedTeamId === teamId) setExpandedTeamId(null);
    } else {
      dispatch({ type: TASKTYPE.SELECT_TEAM, teams: teamId });
      setExpandedTeamId(teamId);
    }
  };

  const isMemberIncluded = (userId: string) => assignedSet.has(userId);
  const handleMemberToggle = (userId: string) => {
    dispatch({ type: TASKTYPE.TOGGLE_ASSIGNED_USER, assignedUserIds: [userId] });
  };

  const isOrgSelected = (userId: string) => assignedSet.has(userId);
  const handleExternalUserSelect = (id: string) => {
    dispatch({ type: TASKTYPE.TOGGLE_ASSIGNED_USER, assignedUserIds: [id] });
  };

  const filteredUsers = (
    (data?.users ?? []) as Array<{
      _id: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: number;
    }>
  ).filter((user) =>
    `${user?.firstName} ${user?.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
  const filteredTeams =
    (data?.teams ?? [])?.filter((team) =>
      team?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? [];
  const filteredOrg =
    (data?.externalUser ?? [])?.filter((org: any) => {
      const full = `${org?.firstName ?? ''} ${org?.lastName ?? ''}`.trim();
      const byName = (org?.name ?? '').toLowerCase();
      const q = searchQuery.toLowerCase();
      return full.toLowerCase().includes(q) || byName.includes(q);
    }) ?? [];

  const isAllTeamsSelected =
    filteredTeams.length > 0 &&
    filteredTeams.every((t) => isTeamSelected(t._id));
  const handleSelectAllTeams = () => {
    if (isAllTeamsSelected) {
      const memberIdsToRemove: string[] = [];
      filteredTeams.forEach((t) => {
        const teamData = teamsWithMembersData?.find((tw) => tw._id === t._id);
        (teamData?.members ?? []).forEach((m) => m._id && memberIdsToRemove.push(m._id));
      });
      if (memberIdsToRemove.length) {
        dispatch({
          type: TASKTYPE.REMOVE_ASSIGNED_USERS,
          assignedUserIds: memberIdsToRemove,
        });
      }
      filteredTeams.forEach((t) =>
        dispatch({ type: TASKTYPE.DESELECT_TEAM, teams: t._id })
      );
    } else {
      filteredTeams.forEach((t) =>
        dispatch({ type: TASKTYPE.SELECT_TEAM, teams: t._id })
      );
    }
  };
  const isAllUsersSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((u) => isUserSelected(u._id));
  const handleSelectAllUsers = () => {
    if (isAllUsersSelected) {
      dispatch({
        type: TASKTYPE.REMOVE_ASSIGNED_USERS,
        assignedUserIds: filteredUsers.map((u) => u._id),
      });
    } else {
      dispatch({
        type: TASKTYPE.ADD_ASSIGNED_USERS,
        assignedUserIds: filteredUsers.map((u) => u._id),
      });
    }
  };
  const isAllExternalSelected =
    filteredOrg.length === 0 ||
    filteredOrg.every((org: any) => isOrgSelected(org._id ?? ''));
  const isAllSelected =
    selected === 'View all' &&
    (filteredUsers.length === 0 || isAllUsersSelected) &&
    (filteredTeams.length === 0 || isAllTeamsSelected) &&
    (filteredOrg.length === 0 || isAllExternalSelected);
  const handleSelectAll = () => {
    if (isAllSelected) {
      dispatch({
        type: TASKTYPE.REMOVE_ASSIGNED_USERS,
        assignedUserIds: filteredUsers.map((u) => u._id),
      });
      const teamMemberIdsToRemove: string[] = [];
      filteredTeams.forEach((t) => {
        const teamData = teamsWithMembersData?.find((tw) => tw._id === t._id);
        (teamData?.members ?? []).forEach((m) => m._id && teamMemberIdsToRemove.push(m._id));
      });
      if (teamMemberIdsToRemove.length) {
        dispatch({
          type: TASKTYPE.REMOVE_ASSIGNED_USERS,
          assignedUserIds: teamMemberIdsToRemove,
        });
      }
      filteredTeams.forEach((t) =>
        dispatch({ type: TASKTYPE.DESELECT_TEAM, teams: t._id })
      );
      dispatch({
        type: TASKTYPE.REMOVE_ASSIGNED_USERS,
        assignedUserIds: filteredOrg.map((org: any) => org._id).filter(Boolean),
      });
    } else {
      dispatch({
        type: TASKTYPE.ADD_ASSIGNED_USERS,
        assignedUserIds: filteredUsers.map((u) => u._id),
      });
      filteredTeams.forEach((t) =>
        dispatch({ type: TASKTYPE.SELECT_TEAM, teams: t._id })
      );
      dispatch({
        type: TASKTYPE.ADD_ASSIGNED_USERS,
        assignedUserIds: filteredOrg.map((org: any) => org._id).filter(Boolean),
      });
    }
  };

  const showUsers = selected === 'View all' || selected === 'Internal users';
  const showTeams = selected === 'View all' || selected === 'Teams';
  const showExternal = selected === 'View all' || selected === 'External users';

  const buildPayload = (extra: Record<string, any>) => ({
    endDate: state.payload?.endDate,
    name: state.payload?.name ?? '',
    description: state.payload?.description ?? '',
    dueDate: new Date(state.dueDate!),
    startDate: state.payload?.startDate
      ? new Date(state.payload.startDate)
      : new Date(state.dueDate!),
    users: state.assignedUserIds ?? [],
    teams: state.teams ?? [],
    app: state.payload?.app ?? '',
    shareAs:
      state.payload?.shareAs === 'shared' ? 'shared' : 'individual',
    projects: state?.payload?.projects ?? [],
    customer: state.payload?.customer ?? '',
    repeatTask:
      state.repeatTask === 'Custom'
        ? (state.selectValueOfCustomList ?? '')
        : (state.repeatTask ?? 'No'),
    repeatTaskEndDate:
      state.payload?.endDate === '0' ? null : state.repeatTaskDueDate ?? undefined,
    repeatCount:
      state.selectValueOfCustomList === 'Day' ||
      state.selectValueOfCustomList === 'Year' ||
      state.selectValueOfCustomList === 'Week' ||
      state.selectValueOfCustomList === 'Month'
        ? state.selectedCountOfRepeat
        : state.selectValueOfCustomList === 'Daily' ||
            state.selectValueOfCustomList === 'Yearly' ||
            state.selectValueOfCustomList === 'Weekdays' ||
            state.selectValueOfCustomList === 'Weekly' ||
            state.selectValueOfCustomList === 'Monthly'
          ? 1
          : undefined,
    weekCount:
      state.selectValueOfCustomList === 'Week'
        ? { dayNumber: state.selectDaysForWeek }
        : state.repeatTask === 'Weekly'
          ? { dayNumber: [new Date(Date.now()).getDay()] }
          : undefined,
    monthCount:
      state.selectValueOfCustomList === 'Month'
        ? {
            dayNumber: state.dayNumOfMonth,
            type: state.monthType,
            weekNumber: state.weekNumOfMonth,
            weekDayNumber: state.DayNumOfWeekOfMonth,
          }
        : state.repeatTask === 'Monthly'
          ? {
              dayNumber: new Date(Date.now()).getDay(),
              type: state.monthType,
            }
          : undefined,
    ...extra,
  });

  return (
    <CustomModal
      isOpen={true}
      header={
        <div className="flex w-full items-center gap-3">
          <svg
            width="50"
            height="50"
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
            <path
              d="M16.25 20H33.75V17.5H16.25V20ZM16.25 37.5C15.5625 37.5 14.9742 37.2554 14.485 36.7663C13.9958 36.2771 13.7508 35.6883 13.75 35V17.5C13.75 16.8125 13.995 16.2242 14.485 15.735C14.975 15.2458 15.5633 15.0008 16.25 15H17.5V12.5H20V15H30V12.5H32.5V15H33.75C34.4375 15 35.0263 15.245 35.5163 15.735C36.0063 16.225 36.2508 16.8133 36.25 17.5V24.5938C35.8542 24.4063 35.4479 24.25 35.0312 24.125C34.6146 24 34.1875 23.9063 33.75 23.8438V22.5H16.25V35H24.125C24.2708 35.4583 24.4429 35.8958 24.6413 36.3125C24.8396 36.7292 25.0737 37.125 25.3438 37.5H16.25ZM32.5 38.75C30.7708 38.75 29.2971 38.1404 28.0788 36.9213C26.8604 35.7021 26.2508 34.2283 26.25 32.5C26.2492 30.7717 26.8588 29.2979 28.0788 28.0788C29.2987 26.8596 30.7725 26.25 32.5 26.25C34.2275 26.25 35.7017 26.8596 36.9225 28.0788C38.1433 29.2979 38.7525 30.7717 38.75 32.5C38.7475 34.2283 38.1379 35.7025 36.9213 36.9225C35.7046 38.1425 34.2308 38.7517 32.5 38.75ZM34.5938 35.4688L35.4688 34.5938L33.125 32.25V28.75H31.875V32.75L34.5938 35.4688Z"
              fill="#0063F7"
            />
          </svg>
          <div className="flex flex-col">
            <h2 className="text-lg font-medium leading-7 text-[#000000] lg:text-xl">
              Assign Tasks to People
            </h2>
            <span className="text-sm font-normal text-[#616161]">
              Assign task to selected project members.
            </span>
          </div>
        </div>
      }
      handleCancel={handleCancel}
      cancelButton="Back"
      body={
        <>
          {isLoading ? (
            <div className="h-[500px] justify-center space-y-5 px-4">
              <Loader />
            </div>
          ) : (
            <div className="h-[500px] space-y-5 overflow-y-auto px-4">
              <div className="flex justify-between space-y-4">
                <div className="flex items-center">
                  <div className="Search team-actice flex items-center justify-between">
                    <Search
                      inputRounded={true}
                      type="search"
                      className="rounded-md bg-[#eeeeee] placeholder:text-[#616161]"
                      name="search"
                      placeholder="Search Requests"
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="DropDownn relative z-50 inline-block px-4 text-left">
                    <div>
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-[#E2F3FF] px-3 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-[#e1f0fa] focus:outline-none"
                        id="options-menu"
                        aria-expanded="true"
                        aria-haspopup="true"
                        onClick={() => setIsOpen(!isOpen)}
                      >
                        {selected}
                        <svg
                          className="-mr-1 ml-2 h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                    {isOpen && (
                      <div
                        className="absolute left-0 z-50 mt-2 w-56 origin-top-left rounded-md bg-[#E2F3FF] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="options-menu"
                      >
                        <div className="py-1" role="none">
                          <button
                            onClick={() => handleSelect('View all')}
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            role="menuitem"
                          >
                            View all
                          </button>
                          <button
                            onClick={() => handleSelect('Internal users')}
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            role="menuitem"
                          >
                            Internal users
                          </button>
                          <button
                            onClick={() => handleSelect('External users')}
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            role="menuitem"
                          >
                            External users
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
                {selected === 'View all' &&
                  (filteredUsers.length > 0 || filteredTeams.length > 0) && (
                    <div className="mb-2">
                      <CustomBlueCheckBox
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                      />
                    </div>
                  )}
                {selected === 'Internal users' && filteredUsers.length > 0 && (
                  <div className="mb-2">
                    <CustomBlueCheckBox
                      checked={isAllUsersSelected}
                      onChange={handleSelectAllUsers}
                    />
                  </div>
                )}
                {selected === 'Teams' && filteredTeams.length > 0 && (
                  <div className="mb-2">
                    <CustomBlueCheckBox
                      checked={isAllTeamsSelected}
                      onChange={handleSelectAllTeams}
                    />
                  </div>
                )}
              </div>
              <div className="h-[426px] overflow-y-auto">
                {showUsers &&
                  filteredUsers.map((item: any) => (
                    <div key={item._id}>
                      <div className="mb-2 flex items-center justify-between rounded-xl border-2 border-gray-300/80 p-2">
                        <div className="flex items-center">
                          <div className="flex items-center gap-2 text-xs font-normal text-[#212121]">
                            <Image
                              src="/images/user.png"
                              className={clsx('rounded-full border-2', {
                                'rounded-full border-none bg-primary-50 p-2':
                                  item.type === 'team',
                              })}
                              alt={`${item.type} pic`}
                              width={40}
                              height={40}
                            />
                            <div className="grid">
                              <span className="font-semibold">
                                {session?.user?.user?._id === item?._id
                                  ? 'Me'
                                  : `${item?.firstName ?? ''} ${item?.lastName ?? ''}`}
                              </span>
                              <span>{item?.email ?? ''}</span>
                            </div>
                          </div>
                        </div>
                        <div className="relative inline-flex">
                          <CustomBlueCheckBox
                            checked={isUserSelected(item?._id ?? '') ?? false}
                            onChange={() => handleUserSelect(item?._id ?? '')}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                {showTeams &&
                  filteredTeams.map((item: any) => (
                    <div key={item._id} className="mb-2">
                      <div
                        className="flex cursor-pointer items-center justify-between rounded-xl border-2 border-gray-300/80 p-2"
                        onClick={() =>
                          setExpandedTeamId((id) => (id === item._id ? null : item._id))
                        }
                      >
                        <div className="flex flex-1 items-center gap-2">
                          {expandedTeamId === item._id ? (
                            <MdArrowDropUp className="text-[#0063F7]" />
                          ) : (
                            <MdArrowDropDown className="text-[#0063F7]" />
                          )}
                          <Image
                            src="/images/team.png"
                            className="rounded-full border-none bg-primary-50 p-2"
                            alt="team"
                            width={40}
                            height={40}
                          />
                          <div className="grid">
                            <span className="font-semibold">{item?.name ?? ''}</span>
                            <span className="capitalize">{item?.type ?? ''}</span>
                          </div>
                        </div>
                        <div
                          className="relative inline-flex"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CustomBlueCheckBox
                            checked={isTeamSelected(item?._id ?? '') ?? false}
                            onChange={() => handleTeamSelect(item._id!)}
                          />
                        </div>
                      </div>
                      {expandedTeamId === item._id && isTeamSelected(item._id) && (
                        <div className="ml-6 mt-2 space-y-2 border-l-2 border-gray-200 pl-3">
                          {expandedTeamWithMembers?._id === item._id ? (
                            (expandedTeamWithMembers?.members ?? []).length === 0 ? (
                              <p className="text-xs text-[#616161]">
                                No members in this team.
                              </p>
                            ) : (
                              (expandedTeamWithMembers?.members ?? []).map((m) => (
                                <div
                                  key={m._id}
                                  className="mb-2 flex items-center justify-between rounded-xl border-2 border-gray-300/80 p-2"
                                >
                                  <div className="flex items-center">
                                    <div className="flex items-center gap-2 text-xs font-normal text-[#212121]">
                                      <Image
                                        src="/images/user.png"
                                        className="rounded-full border-2"
                                        alt="member"
                                        width={40}
                                        height={40}
                                      />
                                      <div className="grid">
                                        <span className="font-semibold">
                                          {session?.user?.user?._id === m._id
                                            ? 'Me'
                                            : `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || m.email}
                                        </span>
                                        <span>{m.email ?? ''}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <CustomBlueCheckBox
                                    checked={isMemberIncluded(m._id)}
                                    onChange={() => handleMemberToggle(m._id)}
                                  />
                                </div>
                              ))
                            )
                          ) : (
                            <div className="py-2">
                              <Loader />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                {showExternal &&
                  filteredOrg.map((item: any) => (
                    <div key={item._id}>
                      <div className="mb-2 flex items-center justify-between rounded-xl border-2 border-gray-300/80 p-2">
                        <div className="flex items-center">
                          <div className="flex items-center gap-2 text-xs font-normal text-[#212121]">
                            <Image
                              src="/images/user.png"
                              className="rounded-full border-none"
                              alt="org"
                              width={40}
                              height={40}
                            />
                            <div className="grid">
                              <span className="font-semibold">
                                {(item?.name ??
                                  `${item?.firstName ?? ''} ${item?.lastName ?? ''}`.trim()) ||
                                  '-'}
                              </span>
                              <span>{item?.email ?? '-'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="relative inline-flex">
                          <CustomBlueCheckBox
                            checked={isOrgSelected(item?._id ?? '') ?? false}
                            onChange={() => handleExternalUserSelect(item._id ?? '')}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      }
      handleSubmit={() => {
        if (state.isShowForEdit) {
          userUpdateTaskMutation.mutate({
            axiosAuth,
            data: buildPayload({}),
            id: state.taskModel?._id ?? '',
            adminMode,
          });
        } else {
          userCreateTaskMutation.mutate({
            axiosAuth,
            data: buildPayload({
              userId: session?.user?.user?._id ?? '',
            }),
          });
        }
      }}
      submitValue={
        userUpdateTaskMutation.isLoading || userCreateTaskMutation.isLoading ? (
          <Loader />
        ) : state.isShowForEdit ? (
          'Save'
        ) : (
          'Confirm'
        )
      }
    />
  );
}
