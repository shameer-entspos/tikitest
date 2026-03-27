import {
  createProjectRoom,
  createTeamRoom,
  updateProjectRoom,
} from '@/app/(main)/(user-panel)/user/chats/api';
import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import { CHATTYPE } from '@/app/helpers/user/enums';
import { UserWithRole } from '@/app/helpers/user/states';
import { Button } from '@/components/Buttons';
import Loader from '@/components/DottedLoader/loader';
import { Search } from '@/components/Form/search';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useEffect, useState } from 'react';
import { MdArrowDropDown } from 'react-icons/md';
import { useQueryClient, useMutation } from 'react-query';

export function ProjectRoomMembers() {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const context = useChatCotnext();
  const [searchIndividual, setSearchIndividual] = useState('');
  const createProjectRoomMutation = useMutation(createProjectRoom, {
    onSuccess: () => {
      queryClient.invalidateQueries('projectRooms');
      context.dispatch({ type: CHATTYPE.TOGGLE });
    },
  });
  const updateTeamRoomMutation = useMutation(updateProjectRoom, {
    onSuccess: () => {
      queryClient.invalidateQueries('projectRooms');
      context.dispatch({ type: CHATTYPE.EDITCHANNEL });
    },
  });

  /// check selected roles
  function checkUsereSelectRole(id: string) {
    const existingIndex = (context.state.users ?? []).findIndex(
      (user) => user.user === id
    );
    if (existingIndex !== -1) {
      return context.state.users![existingIndex].role;
    } else {
      return 'member';
    }
  }
  // change roles
  const handleUserRoleChange = (userId: string, selectedRole: string) => {
    const newRole: UserWithRole = {
      user: userId,
      role: selectedRole,
    };
    const existingRoleIndex = (context.state.users ?? []).findIndex(
      (user) => user.user === userId
    );

    if (existingRoleIndex !== -1) {
      context.dispatch({ type: CHATTYPE.UPDATE_USER_ROLE, users: newRole });
    } else {
      context.dispatch({ type: CHATTYPE.SELECT_USER, users: newRole });
    }
  };
  // add or delete seleted teams

  const handleUserSelect = (userId: string, selectedRole: string) => {
    const newRole: UserWithRole = {
      user: userId,
      role: selectedRole,
    };
    if (
      (context.state.users ?? []).findIndex((user) => user.user === userId) !==
      -1
    ) {
      context.dispatch({ type: CHATTYPE.DESELECT_USER, users: newRole });
    } else {
      context.dispatch({ type: CHATTYPE.SELECT_USER, users: newRole });
    }
  };
  /// check team select or not
  const isUserSelected = (userId: string) =>
    (context.state.users ?? [])?.some((user) => user.user == userId);
  const filteredUsers =
    (context.state.selectedProjectUsers ?? []).filter((user) =>
      `${user?.user.firstName} ${user?.user.lastName}`
        .toLowerCase()
        .includes(searchIndividual.toLowerCase())
    ) ?? [];
  return (
    <>
      <div className="overflow-y-scroll scrollbar-hide">
        {/* buutons */}
        <div className="mt-6">
          <div className="mt-8 h-[389px] overflow-y-scroll scrollbar-hide">
            <div className="mb-5 text-xs font-normal text-black">
              Search for members to be part of the channel.
            </div>
            <div className="mb-3">
              <Search
                className={
                  'rounded-lg border-2 border-[#505050ed] bg-[#FAFAFA]'
                }
                key={'search'}
                inputRounded={true}
                type="text"
                name="search"
                onChange={(e) => setSearchIndividual(e.target.value)}
                placeholder="Search User"
              />
            </div>
            {(filteredUsers ?? []).map((user) => {
              return (
                <div key={user.user._id}>
                  <div className="mb-3 flex items-center justify-between rounded-md bg-gray-100 px-2 py-[6px]">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isUserSelected(`${user.user._id}`.toString())}
                        onChange={(e) => {
                          handleUserSelect(user.user._id, 'member');
                        }}
                        className="mr-2 h-4 w-4 rounded-none border-[#616161]"
                      />
                      <div className="text-sm font-normal text-[#212121]">
                        {`${user.user.firstName}  ${user.user.lastName}`}
                      </div>
                    </div>
                    <div className="relative inline-flex">
                      <select
                        className="appearance-none border-none bg-transparent px-2 py-1 pr-6 text-xs text-[#0063F7] focus:border-[#0063F7] focus:outline-none"
                        onChange={(e) => {
                          handleUserRoleChange(
                            user.user._id ?? '',
                            e.target.value
                          );
                        }}
                        value={checkUsereSelectRole(user.user._id!)}
                      >
                        <option value="admin" className="text-xs">
                          admin
                        </option>
                        <option value="member" className="text-xs">
                          member
                        </option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <MdArrowDropDown className="bg-transparent text-[#0063F7]" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mb-5 mt-2 text-xs font-normal text-black">
            {context.state.users?.length ?? 0} members added to channel
          </div>
          <div className="flex justify-center gap-3 text-center">
            <button
              className="mt-[24px] h-[47px] w-[120px] rounded-lg border-3 border-[#0063F7] px-[20px] py-[8px] text-xs font-bold leading-[22px] text-[#0063F7] md:min-w-[188px] md:text-sm"
              type="button"
              onClick={() =>
                context.dispatch({
                  type: CHATTYPE.PROJECTFORMTYPE,
                  projectFormType: 'form',
                  selectedProjectUsers: context.state.selectedProjectUsers,
                })
              }
            >
              Back
            </button>
            <button
              className="mt-[24px] h-[47px] w-[120px] rounded-lg bg-[#0063F7] px-[10px] py-[8px] text-[12px] font-bold leading-[22px] text-white md:min-w-[188px] md:px-[20px] md:text-sm"
              onClick={() => {
                if (context.state.showEditformType === 'project') {
                  // if (context.state.roomDetail) {
                  //   const updatedRoom = {
                  //     ...context.state.roomDetail,
                  //     channelName: context.state.payload?.channelName ?? "",
                  //     description: context.state.payload?.description ?? "",
                  //     appearName: context.state.payload?.appearName ?? "",
                  //   };
                  //   context.dispatch({
                  //     type: CHATTYPE.UPDATEROOMDETAIL,
                  //     roomDetail: updatedRoom,
                  //   });
                  // }
                  updateTeamRoomMutation.mutate({
                    axiosAuth,
                    body: {
                      roomId: context.state.roomDetail?._id ?? '',
                      projectId: context.state.selectedId ?? '',
                      channelName: context.state.payload?.channelName ?? '',
                      description: context.state.payload?.description ?? '',
                      appearName: context.state.payload?.appearName ?? '',
                      type: context.state.selectedType ?? '',
                      room: context.state.users ?? [],
                    },
                  });
                } else {
                  createProjectRoomMutation.mutate({
                    axiosAuth,
                    body: {
                      projectId: context.state.selectedId ?? '',
                      channelName: context.state.payload?.channelName ?? '',
                      description: context.state.payload?.description ?? '',
                      appearName: context.state.payload?.appearName ?? '',
                      type: context.state.selectedType ?? '',
                      room: context.state.users ?? [],
                    },
                  });
                }
              }}
            >
              {context.state.showEditformType === 'project' ? (
                <>
                  {updateTeamRoomMutation.isLoading ? <Loader /> : <>Update </>}
                </>
              ) : (
                <>
                  {createProjectRoomMutation.isLoading ? (
                    <Loader />
                  ) : (
                    <>Create</>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
