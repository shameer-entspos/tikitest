import { getTeams } from '@/app/(main)/(org-panel)/organization/teams/api';
import { useAssetManagerAppsContext } from '@/app/(main)/(user-panel)/user/apps/am/am_context';
import { useSRAppCotnext } from '@/app/(main)/(user-panel)/user/apps/sr/sr_context';
import { useTimeSheetAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/timesheets/timesheet_context';
import { AMAPPACTIONTYPE, SR_APP_ACTION_TYPE } from '@/app/helpers/user/enums';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { AMPermissionSetting } from './components/AM_Permission_Setting';
import { AMNotifictionSettings } from './components/AM_Setting_Notification';
import { WithAMSettingsSidebar } from './components/With_AM_Setting_Sidebar';

export function AMSettingsScreen() {
  const context = useAssetManagerAppsContext();
  const memoizedTopBar = useMemo(
    () => (
      <>
        <div className="breadCrumbs flex justify-between border-b-2 border-gray-300 p-2">
          <div className="flex items-center gap-2 text-2xl font-bold text-[#1E1E1E]">
            <img
              src="/svg/asset_manager/logo.svg"
              alt="show logo"
              className="h-[50px] w-[50px]"
            />
            App Settings
          </div>
          <button
            onClick={() => {
              context.dispatch({
                type: AMAPPACTIONTYPE.SHOWPAGES,
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
        <WithAMSettingsSidebar>
          {context.state.selectedSettingTab === 'Notifications' ? (
            <AMNotifictionSettings />
          ) : (
            <AMPermissionSetting teams={teams} />
          )}
        </WithAMSettingsSidebar>
      </div>
    </>
  );
}
