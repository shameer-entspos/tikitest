import {
  createTeamRoom,
  updateTeamRoom,
} from "@/app/(main)/(user-panel)/user/chats/api";
import { useChatCotnext } from "@/app/(main)/(user-panel)/user/chats/context";
import { CHATTYPE } from "@/app/helpers/user/enums";
import { UserWithRole } from "@/app/helpers/user/states";
import { Button } from "@/components/Buttons";
import Loader from "@/components/DottedLoader/loader";
import { Search } from "@/components/Form/search";
import useAxiosAuth from "@/hooks/AxiosAuth";
import { useEffect, useState } from "react";
import { MdArrowDropDown } from "react-icons/md";
import { useQueryClient, useMutation } from "react-query";

export function TeamRoomMembers() {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const context = useChatCotnext();
  const [searchIndividual, setSearchIndividual] = useState("");
  const createTeamRoomMutation = useMutation(createTeamRoom, {
    onSuccess: () => {
      queryClient.invalidateQueries("teamsRoom");
      context.dispatch({ type: CHATTYPE.TOGGLE });
    },
  });
  const updateTeamRoomMutation = useMutation(updateTeamRoom, {
    onSuccess: () => {
      queryClient.invalidateQueries("teamsRoom");
      context.dispatch({ type: CHATTYPE.EDITCHANNEL });
    },
  });

  /// check selected roles
  function checkUsereSelectRole(id: string) {
    const existingIndex = (context.state.users ?? []).findIndex(
      (user) => user.user === id,
    );
    if (existingIndex !== -1) {
      return context.state.users![existingIndex].role;
    } else {
      return "member";
    }
  }
  // change roles
  const handleUserRoleChange = (userId: string, selectedRole: string) => {
    const newRole: UserWithRole = {
      user: userId,
      role: selectedRole,
    };
    const existingRoleIndex = (context.state.users ?? []).findIndex(
      (user) => user.user === userId,
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
    (context.state.selectedUsers ?? []).filter((user) =>
      `${user?.firstName} ${user?.lastName}`
        .toLowerCase()
        .includes(searchIndividual.toLowerCase()),
    ) ?? [];
  return (
    <>
      <div className="overflow-y-scroll scrollbar-hide">
        {/* buutons */}
        <div className="mt-6">
          <div className="mt-8 h-72 max-h-72 overflow-y-scroll scrollbar-hide">
            <div className="mb-5 text-xs font-normal text-black">
              Search for members to be part of the channel.
            </div>
            <div className="mb-3">
              <Search
                key={"search"}
                inputRounded={false}
                className={
                  "rounded-lg border-2 border-[#505050ed] bg-[#FAFAFA]"
                }
                type="text"
                name="search"
                onChange={(e) => setSearchIndividual(e.target.value)}
                placeholder="Search User"
              />
            </div>
            {filteredUsers.map((user) => {
              return (
                <div key={user._id}>
                  <div className="flex items-center justify-between rounded-md bg-gray-100 px-4 py-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isUserSelected(user?._id)}
                        onChange={(e) => {
                          handleUserSelect(user._id, "member");
                        }}
                        className="mr-2 h-4 w-4 rounded-none border-[#616161]"
                      />
                      <div className="text-xs font-normal text-[#212121]">
                        {`${user.firstName}  ${user.lastName}`}
                      </div>
                    </div>
                    <div className="relative inline-flex rounded-2xl">
                      <select
                        className="appearance-none border-none bg-transparent px-2 py-1 pr-6 text-sm text-primary-500 focus:border-blue-500 focus:outline-none"
                        onChange={(e) => {
                          handleUserRoleChange(user._id, e.target.value);
                        }}
                        value={checkUsereSelectRole(user._id)}
                      >
                        <option
                          value="admin"
                          className="bg-primary-500 text-xs"
                        >
                          admin
                        </option>
                        <option
                          value="member"
                          className="bg-primary-500 text-xs"
                        >
                          member
                        </option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <MdArrowDropDown className="bg-transparent text-primary-500" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mb-5 mt-2 text-base font-normal text-black">
            {context.state.users?.length ?? 0} members added to channel.
          </div>
          <div className="flex justify-end gap-3 text-center">
            <button
              className="mt-[24px] h-[47px] min-w-[139px] rounded-lg border-3 border-[#0063F7] px-[20px] py-[8px] text-sm font-bold leading-[22px] text-[#0063F7]"
              type="button"
              onClick={() =>
                context.dispatch({
                  type: CHATTYPE.TEAMFORMTYPE,
                  teamFormType: "form",
                  selectedUsers: context.state.selectedUsers,
                })
              }
            >
              Back
            </button>
            <button
              className="mt-[24px] h-[47px] min-w-[139px] rounded-lg bg-[#0063F7] px-[20px] py-[8px] text-sm font-bold leading-[22px] text-white"
              onClick={() => {
                if (context.state.showEditformType === "team") {
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
                      teamId: context.state.selectedId ?? "",
                      channelName: context.state.payload?.channelName ?? "",
                      description: context.state.payload?.description ?? "",
                      appearName: context.state.payload?.appearName ?? "",
                      type: context.state.selectedType ?? "",
                      room: context.state.users ?? [],
                    },
                  });
                } else {
                  createTeamRoomMutation.mutate({
                    axiosAuth,
                    body: {
                      teamId: context.state.selectedId ?? "",
                      channelName: context.state.payload?.channelName ?? "",
                      description: context.state.payload?.description ?? "",
                      appearName: context.state.payload?.appearName ?? "",
                      type: context.state.selectedType ?? "",
                      room: context.state.users ?? [],
                    },
                  });
                }
              }}
            >
              {context.state.showEditformType === "team" ? (
                <>
                  {updateTeamRoomMutation.isLoading ? (
                    <Loader />
                  ) : (
                    <>Update Channel</>
                  )}
                </>
              ) : (
                <>
                  {createTeamRoomMutation.isLoading ? (
                    <Loader />
                  ) : (
                    <>Create Channel</>
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
