import { getTeams } from '@/app/(main)/(org-panel)/organization/teams/api';
import { useSafetyHubContext } from '@/app/(main)/(user-panel)/user/apps/sh/sh_context';
import { SAFETYHUBTYPE } from '@/app/helpers/user/enums';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { SHPermissionSetting } from './components/SH_Permission_Setting';
import { SHNotifictionSettings } from './components/SH_Setting_Notification';
import { WithSHSettingsSidebar } from './components/With_SH_Setting_Sidebar';

export function SHSettingsScreen() {
  const context = useSafetyHubContext();
  const memoizedTopBar = useMemo(
    () => (
      <>
        <div className="breadCrumbs flex justify-between border-b-2 border-gray-300 p-2">
          <div className="flex items-center gap-2 text-2xl font-bold text-[#1E1E1E]">
            <img
              src="/svg/sh/logo.svg"
              alt="show logo"
              className="h-[50px] w-[50px]"
            />
            App Settings
          </div>
          <button
            onClick={() => {
              context.dispatch({
                type: SAFETYHUBTYPE.SHOWPAGES,
              });
            }}
          >
            <img src="/svg/timesheet_app/go_back.svg" alt="show logo" />
          </button>
          {/* </Link> */}
        </div>
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const axiosAuth = useAxiosAuth();
  const { data: teams, isLoading: userLoading } = useQuery({
    queryKey: 'teams',
    queryFn: () => getTeams(axiosAuth),
  });
  return (
    <>
      <div className="absolute inset-0 top-4 z-10 h-full w-full max-w-[1360px] bg-white p-4 pt-0">
        {memoizedTopBar}
        <WithSHSettingsSidebar>
          {context.state.selectedSettingTab === 'Notifications' ? (
            <SHNotifictionSettings />
          ) : (
            <SHPermissionSetting teams={teams} />
          )}
        </WithSHSettingsSidebar>
      </div>
    </>
  );
}
