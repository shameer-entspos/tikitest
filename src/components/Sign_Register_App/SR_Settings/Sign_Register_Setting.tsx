import { getTeams } from "@/app/(main)/(org-panel)/organization/teams/api";
import { useSRAppCotnext } from "@/app/(main)/(user-panel)/user/apps/sr/sr_context";
import { useTimeSheetAppsCotnext } from "@/app/(main)/(user-panel)/user/apps/timesheets/timesheet_context";
import { SR_APP_ACTION_TYPE } from "@/app/helpers/user/enums";
import useAxiosAuth from "@/hooks/AxiosAuth";
import { useMemo } from "react";
import { useQuery } from "react-query";
import { SRTopBar } from "../SR_Top_Bar";
import { SRPermissionSetting } from "./SR_Permission_Setting";
import { SRNotifictionSettings } from "./SR_Setting_Notification";
import { WithSRSettingsSidebar } from "./With_SR_Setting_Sidebar";

export function SRSetting() {
  const context = useSRAppCotnext();
  const memoizedTopBar = useMemo(
    () => (
      <>
        <div className="breadCrumbs p-2 flex justify-between border-b-2 border-gray-300">
          <div className="flex items-center gap-2 font-bold text-[#1E1E1E] text-2xl">
            <img src="/svg/sr/logo.svg" alt="show logo" />
            App Settings
          </div>
          <button
            onClick={() => {
              context.dispatch({
                type: SR_APP_ACTION_TYPE.SHOWPAGES,
              });
            }}
          >
            <img src="/svg/timesheet_app/go_back.svg" alt="show logo" />
          </button>
          {/* </Link> */}
        </div>
      </>
    ),
    []
  );

  const axiosAuth = useAxiosAuth();
  const { data: teams, isLoading: userLoading } = useQuery({
    queryKey: "teams",
    queryFn: () => getTeams(axiosAuth),
  });
  return (
    <>
      <div className="absolute inset-0 z-10 bg-white top-4 w-full p-4 pt-0  max-w-[1360px] h-full ">
        {memoizedTopBar}
        <WithSRSettingsSidebar>
          {context.state.selectedSettingTab === "Notifications" ? (
            <SRNotifictionSettings />
          ) : (
            <SRPermissionSetting teams={teams} />
          )}
        </WithSRSettingsSidebar>
      </div>
    </>
  );
}
