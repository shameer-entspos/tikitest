// teams

import { getAllTeams } from "@/app/(main)/(user-panel)/user/chats/api";
import { useChatCotnext } from "@/app/(main)/(user-panel)/user/chats/context";
import { CHATTYPE } from "@/app/helpers/user/enums";
import Loader from "@/components/DottedLoader/loader";
import { Search } from "@/components/Form/search";
import useAxiosAuth from "@/hooks/AxiosAuth";
import { useQuery } from "react-query";
import { TeamForm } from "./teamForm";
import { TeamRoomMembers } from "./teamMembers";

export function TeamFriendRequest() {
  const axiosAuth = useAxiosAuth();
  const context = useChatCotnext();
  /// hit search api
  const { data, isLoading, isSuccess } = useQuery(["searchTeamRequest"], () =>
    getAllTeams(axiosAuth),
  );
  return (
    <>
      {context.state.teamFormType === "select" && (
        <div className="mt-8">
          <div className="mb-4 text-xs text-black">
            Select a team you want to create a channel for
          </div>

          <div className="mb-2">
            <Search
              type="text"
              name="search"
              className="h-9 rounded-lg border border-[#505050ed] bg-[#FAFAFA] text-sm"
              inputRounded={false}
              inputFullWidth={false}
              value={context.state.searchText}
              onChange={(event) => {
                context.dispatch({
                  type: CHATTYPE.SEARCH,
                  searchText: event.target.value,
                });
              }}
              placeholder="Search teams"
            />
          </div>

          <div className={`${"max-h-72 overflow-y-scroll scrollbar-hide"}`}>
            {isLoading ? (
              <>
                <Loader />
              </>
            ) : (
              <>
                {isSuccess ? (
                  <>
                    {(data ?? [])?.map((team) => {
                      return (
                        <div
                          key={team._id}
                          className="py-1 text-sm font-normal text-gray-800"
                        >
                          <div className="flex items-center justify-between rounded-md bg-gray-100 px-4 py-3">
                            <div className="w-1/2 truncate">
                              {`${team.name}`}
                            </div>
                            <div className="w-1/3 overflow-hidden truncate text-end text-gray-500">
                              {`${team.teamId}`}
                            </div>

                            <div
                              className="w-1/3 cursor-pointer text-end text-xs text-primary-400"
                              onClick={() => {
                                context.dispatch({
                                  type: CHATTYPE.TEAMFORMTYPE,
                                  teamFormType: "form",
                                  selectedId: team._id,
                                  selectedUsers: team.members,
                                });
                              }}
                            >
                              Select
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <></>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {context.state.teamFormType === "form" && <TeamForm />}
      {context.state.teamFormType === "members" && <TeamRoomMembers />}
    </>
  );
}
