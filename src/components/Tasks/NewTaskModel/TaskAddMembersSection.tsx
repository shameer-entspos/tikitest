import { useProjectCotnext } from '@/app/(main)/(user-panel)/user/projects/context';
import {
  createTask,
  editTask,
  getMembersListOfProejcts,
} from '@/app/(main)/(user-panel)/user/tasks/api';
import { useTaskCotnext } from '@/app/(main)/(user-panel)/user/tasks/context';

import { PROJECTACTIONTYPE, TASKTYPE } from '@/app/helpers/user/enums';
import {
  AppWithRole,
  TeamsWithRole,
  UserWithRole,
} from '@/app/helpers/user/states';
import Loader from '@/components/DottedLoader/loader';
import { Search } from '@/components/Form/search';
import CustomHr from '@/components/Ui/CustomHr';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { Checkbox } from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { MdArrowDropDown } from 'react-icons/md';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const TaskAddMembersSection = () => {
  const context = useTaskCotnext();
  const session = useSession();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: 'listMembersListOfProejcts',
    queryFn: () =>
      getMembersListOfProejcts(
        axiosAuth,
        context.state?.payload?.projects ?? []
      ),
  });

  const userCreateTaskMutation = useMutation(createTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
      context.dispatch({
        type: TASKTYPE.SHOWNEWTASKMODAL,
      });
    },
  });
  const userUpdateTaskMutation = useMutation(editTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
      context.dispatch({
        type: TASKTYPE.SHOW_EDIT_SECTION,
      });
      context.dispatch({
        type: TASKTYPE.SHOWTASKMODAL,
      });
    },
  });

  const [searchIndividual, setSearchIndividual] = useState('');
  const [searchTeams, setSearchTeams] = useState('');
  const [searchOrg, setSearchOrg] = useState('');
  const [members, setMembers] = useState('individual');

  /////// ORG section ////////
  const isOrgSelected = (userId: string) =>
    context.state.externalUser?.some((org) => org == userId);

  const handleOrgSelect = (id: string) => {
    if (
      (context.state.externalUser ?? []).findIndex((org) => org === id) !== -1
    ) {
      context.dispatch({
        type: TASKTYPE.DESELECT_ORG,
        externalUser: id,
      });
    } else {
      context.dispatch({
        type: TASKTYPE.SELECT_ORG,
        externalUser: id,
      });
    }
  };

  ///////// Teams Section   ///////////

  /// check team select or not
  const isTeamSelected = (teamId: string) =>
    context.state.teams?.some((team) => team == teamId);

  // add or delete seleted teams

  const handleTeamSelect = (teamId: string) => {
    if (
      (context.state.teams ?? []).findIndex((team) => team === teamId) !== -1
    ) {
      context.dispatch({
        type: TASKTYPE.DESELECT_TEAM,
        teams: teamId,
      });
    } else {
      context.dispatch({ type: TASKTYPE.SELECT_TEAM, teams: teamId });
    }
  };

  /////// User Section /////////////

  /// check team select or not
  const isUserSelected = (userId: string) =>
    context.state.individualUsers?.some((user) => user == userId);

  // add or delete seleted teams

  const handleUserSelect = (userId: string) => {
    if (
      (context.state.individualUsers ?? []).findIndex(
        (user) => user === userId
      ) !== -1
    ) {
      context.dispatch({
        type: TASKTYPE.DESELECT_USER,
        individualUsers: userId,
      });
    } else {
      context.dispatch({ type: TASKTYPE.SELECT_USER, individualUsers: userId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader />
      </div>
    );
  }

  const filteredUsers =
    data?.users?.filter((user) =>
      `${user?.firstName} ${user?.lastName}`
        .toLowerCase()
        .includes(searchIndividual.toLowerCase())
    ) ?? [];
  const filteredTeams =
    data?.teams?.filter((team) =>
      team?.name?.toLowerCase().includes(searchTeams.toLowerCase())
    ) ?? [];
  const filteredOrg =
    data?.externalUser?.filter((org) =>
      `${org?.firstName} ${org?.lastName}`
        .toLowerCase()
        .includes(searchOrg.toLowerCase())
    ) ?? [];
  return (
    <>
      <div className="h-[500px] overflow-y-auto">
        <div className="flex justify-center gap-3">
          <div className="w-[32%] md:w-[25%]">
            <h1 className="text-center">
              <span
                className={`inline-block cursor-pointer text-xs font-medium md:text-base ${
                  members === 'individual' &&
                  'border-b-[3px] border-[#0063F7] font-extrabold'
                } pb-2 pl-4 pr-4`}
                onClick={() => setMembers('individual')}
              >
                Individual
              </span>
            </h1>
          </div>
          <div className="w-[32%] md:w-[25%]">
            <h1 className="text-center">
              <span
                className={`inline-block cursor-pointer text-xs font-medium md:text-base ${
                  members === 'teams' &&
                  'border-b-[3px] border-[#0063F7] font-extrabold'
                } pb-2 pl-4 pr-4`}
                onClick={() => setMembers('teams')}
              >
                Teams
              </span>
            </h1>
          </div>
          <div className="w-[32%] md:w-[25%]">
            <h1 className="text-center">
              <span
                className={`inline-block cursor-pointer text-xs font-medium md:text-base ${
                  members === 'external' &&
                  'border-b-[3px] border-[#0063F7] font-extrabold'
                } pb-2 pl-4 pr-4`}
                onClick={() => setMembers('external')}
              >
                External
              </span>
            </h1>
          </div>
        </div>

        {isSuccess && (
          <>
            {members === 'individual' && (
              <div className="mt-8">
                <div className="mb-5 ml-1 text-sm font-medium text-black">
                  Search for members to be part of the project.
                </div>
                <div className="mb-3">
                  <Search
                    className="inline-flex h-[49px] w-full items-center justify-start rounded-lg bg-gray-50 text-base font-normal text-gray-600"
                    key={'search'}
                    inputRounded={true}
                    type="text"
                    name="search"
                    onChange={(e) => setSearchIndividual(e.target.value)}
                    placeholder="Enter User Full Name "
                  />
                </div>
                <h1 className="mb-5 ml-1 mt-4 text-sm font-semibold text-black">
                  Added Members:
                </h1>
                <div className="h-[242px] md:min-h-[451px]">
                  {filteredUsers.map((user) => {
                    return (
                      <div key={user?._id}>
                        <div className="mb-3 flex items-center justify-between rounded-lg bg-gray-100 p-3">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isUserSelected(`${user?._id ?? ''}`)}
                              onChange={(e) => {
                                handleUserSelect(`${user?._id ?? ''}`);
                              }}
                              className="mr-2 h-4 w-4 rounded-none border-[#616161]"
                            />
                            <div className="text-sm font-normal text-[#212121]">
                              {`${user?.firstName ?? ''}  ${user?.lastName ?? ''}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {members === 'teams' && (
              <div className="mt-8">
                <div className="mb-5 ml-1 text-sm font-medium text-black">
                  Select a team to be part of the project.
                </div>
                <div className="mb-3">
                  <Search
                    className="h-9 rounded-lg border border-[#505050ed] bg-[#FAFAFA] text-sm"
                    key={'search'}
                    inputRounded={true}
                    type="text"
                    name="search"
                    onChange={(e) => setSearchTeams(e.target.value)}
                    placeholder="Search Team by Name or Team ID"
                  />
                </div>
                <h1 className="mb-5 ml-1 mt-4 text-sm font-semibold text-black">
                  2 teams added to task
                </h1>

                <div className="] h-[242px] overflow-y-auto md:min-h-[451px]">
                  {filteredTeams.map((team) => {
                    return (
                      <div key={team?._id}>
                        <div className="mb-3 flex items-center justify-between rounded-lg bg-gray-100 p-3">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isTeamSelected(team?._id ?? '')}
                              onChange={(e) => {
                                handleTeamSelect(team?._id ?? '');
                              }}
                              className="mr-2 h-4 w-4 rounded-none border-[#616161]"
                            />
                            <div className="text-sm font-normal text-[#212121]">
                              {team?.name ?? ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {members === 'external' && (
              <div className="mt-8">
                <div className="mb-5 ml-1 text-sm font-medium text-black">
                  Search external users to add to the project.
                </div>
                <div className="mb-3">
                  <Search
                    className="h-9 rounded-lg border border-[#505050ed] bg-[#FAFAFA] text-sm"
                    key={'search'}
                    inputRounded={true}
                    type="text"
                    name="search"
                    onChange={(e) => setSearchOrg(e.target.value)}
                    placeholder="Enter User Email or User ID"
                  />
                </div>
                <h1 className="mb-5 ml-1 mt-4 text-sm font-semibold text-black">
                  1 external members added to task
                </h1>

                <div className="h-[242px] overflow-y-auto md:min-h-[451px]">
                  {filteredOrg.map((org) => {
                    return (
                      <div key={org?._id}>
                        <div className="mb-3 flex items-center justify-between rounded-lg bg-gray-100 p-3">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isOrgSelected(org?._id ?? '')}
                              onChange={(e) => {
                                handleOrgSelect(org?._id ?? '');
                              }}
                              className="mr-2 h-4 w-4 rounded-none border-[#616161]"
                            />
                            <div className="text-sm font-normal text-[#212121]">
                              {`${org?.firstName ?? ''} ${org?.lastName ?? ''}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <CustomHr />
      <div className="mb-2 mt-[29px] md:mt-[30px]">
        <div className="flex justify-center gap-6 text-center">
          <button
            className="h-11 w-1/2 rounded-lg border-2 border-primary-500 text-sm text-primary-500 sm:h-12 sm:w-36 sm:text-base"
            type="button"
            onClick={
              () => {}
              // context.dispatch({
              //   type: TASKTYPE.CHANGEMODELTYPE,
              //   currentModel: 'project',
              // })
            }
          >
            Back
          </button>
          <button
            type="button"
            className="h-11 w-1/2 rounded-lg bg-primary-500 text-sm font-semibold text-white hover:bg-primary-600/80 sm:h-12 sm:w-36 sm:text-base"
            onClick={() => {
              if (context.state.isShowForEdit) {
                userUpdateTaskMutation.mutate({
                  axiosAuth,
                  data: {
                    name: context.state.payload?.name ?? '',
                    description: context.state.payload?.description ?? '',
                    isAudit: context.state.audit ?? false,
                    dueDate: new Date(context.state.dueDate!),
                    external: context.state.externalUser ?? [],
                    individualUsers: context.state.individualUsers ?? [],
                    teams: context.state.teams ?? [],
                    app: context.state.payload?.app ?? '',
                    projects: context.state?.payload?.projects ?? [],
                    repeatTask:
                      context.state.repeatTask === 'Custom'
                        ? (context.state.selectValueOfCustomList ?? '')
                        : (context.state.repeatTask ?? ''),
                    repeatTaskEndDate:
                      context.state.payload?.endDate === '0'
                        ? null
                        : context.state.repeatTaskDueDate ?? undefined,
                    repeatCount:
                      context.state.selectValueOfCustomList === 'Day' ||
                      context.state.selectValueOfCustomList === 'Year' ||
                      context.state.selectValueOfCustomList === 'Week' ||
                      context.state.selectValueOfCustomList === 'Month'
                        ? context.state.selectedCountOfRepeat
                        : context.state.selectValueOfCustomList === 'Daily' ||
                            context.state.selectValueOfCustomList ===
                              'Yearly' ||
                            context.state.selectValueOfCustomList ===
                              'Weekdays' ||
                            context.state.selectValueOfCustomList ===
                              'Weekly' ||
                            context.state.selectValueOfCustomList === 'Monthly'
                          ? 1
                          : undefined,

                    weekCount:
                      context.state.selectValueOfCustomList === 'Week'
                        ? {
                            dayNumber: context.state.selectDaysForWeek,
                          }
                        : context.state.repeatTask === 'Weekly'
                          ? {
                              dayNumber: [new Date(Date.now()).getDay()],
                            }
                          : undefined,
                    monthCount:
                      context.state.selectValueOfCustomList === 'Month'
                        ? {
                            dayNumber: context.state.dayNumOfMonth,
                            type: context.state.monthType,
                            weekNumber: context.state.weekNumOfMonth,
                            weekDayNumber: context.state.DayNumOfWeekOfMonth,
                          }
                        : context.state.repeatTask === 'Monthly'
                          ? {
                              dayNumber: new Date(Date.now()).getDay(),
                              type: context.state.monthType,
                            }
                          : undefined,
                  },
                  id: context.state.taskModel?._id ?? '',
                  adminMode: false, // TaskAddMembersSection doesn't have access to adminMode, default to false
                });
              } else {
                userCreateTaskMutation.mutate({
                  axiosAuth,
                  data: {
                    name: context.state.payload?.name ?? '',
                    description: context.state.payload?.description ?? '',
                    isAudit: context.state.audit ?? false,
                    userId: session.data?.user.user._id ?? '',
                    dueDate: new Date(context.state.dueDate!),
                    startDate: context.state.payload?.startDate
                      ? new Date(context.state.payload.startDate)
                      : new Date(context.state.dueDate!),
                    endDate: context.state.payload?.endDate ?? undefined,
                    customer: context.state.payload?.customer ?? '',
                    shareAs:
                      context.state.payload?.shareAs === 'shared'
                        ? 'shared'
                        : 'individual',
                    external: context.state.externalUser ?? [],
                    individualUsers: context.state.individualUsers ?? [],
                    teams: context.state.teams ?? [],
                    app: context.state.payload?.app ?? '',
                    projects: context.state?.payload?.projects ?? [],
                    repeatTask:
                      context.state.repeatTask === 'Custom'
                        ? (context.state.selectValueOfCustomList ?? '')
                        : (context.state.repeatTask ?? ''),
                    repeatTaskEndDate:
                      context.state.payload?.endDate === '0'
                        ? null
                        : context.state.repeatTaskDueDate ?? undefined,
                    repeatCount:
                      context.state.selectValueOfCustomList === 'Day' ||
                      context.state.selectValueOfCustomList === 'Year' ||
                      context.state.selectValueOfCustomList === 'Week' ||
                      context.state.selectValueOfCustomList === 'Month'
                        ? context.state.selectedCountOfRepeat
                        : context.state.selectValueOfCustomList === 'Daily' ||
                            context.state.selectValueOfCustomList ===
                              'Yearly' ||
                            context.state.selectValueOfCustomList ===
                              'Weekdays' ||
                            context.state.selectValueOfCustomList ===
                              'Weekly' ||
                            context.state.selectValueOfCustomList === 'Monthly'
                          ? 1
                          : undefined,

                    weekCount:
                      context.state.selectValueOfCustomList === 'Week'
                        ? {
                            dayNumber: context.state.selectDaysForWeek,
                          }
                        : context.state.repeatTask === 'Weekly'
                          ? {
                              dayNumber: [new Date(Date.now()).getDay()],
                            }
                          : undefined,
                    monthCount:
                      context.state.selectValueOfCustomList === 'Month'
                        ? {
                            dayNumber: context.state.dayNumOfMonth,
                            type: context.state.monthType,
                            weekNumber: context.state.weekNumOfMonth,
                            weekDayNumber: context.state.DayNumOfWeekOfMonth,
                          }
                        : context.state.repeatTask === 'Monthly'
                          ? {
                              dayNumber: new Date(Date.now()).getDay(),
                              type: context.state.monthType,
                            }
                          : undefined,
                  },
                });
              }
            }}
            disabled={
              (context.state.individualUsers ?? []).length === 0 &&
              (context.state.teams ?? []).length === 0 &&
              (context.state.externalUser ?? []).length === 0
            }
          >
            {userCreateTaskMutation.isLoading ||
            userUpdateTaskMutation.isLoading ? (
              <Loader />
            ) : (
              <>Create Task</>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export { TaskAddMembersSection };
