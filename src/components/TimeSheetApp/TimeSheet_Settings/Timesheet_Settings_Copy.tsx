import { getTeams } from '@/app/(main)/(org-panel)/organization/teams/api';
import { useTimeSheetAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/timesheets/timesheet_context';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { TimeSheetNotifictionSettings } from './TimeSeet_Notification_Settings';
import { TimeSheetAutoApprovedSettings } from './TImeSheet_AutoApprove_Settings';
import { TimeSheetPermissionSetting } from './TimeSheet_Permission_Settings';
import { WithTimeSheetSettingsSidebar } from './With_Timesheet_Sidbar';
import { TIMESHEETTYPE } from '@/app/helpers/user/enums';

export function TimesheetSettingCopy() {
  const memoizedTopBar = useMemo(
    () => (
      <>
        <div className="breadCrumbs flex justify-between border-b-2 border-gray-300 p-2">
          <div className="flex items-center gap-2 text-2xl font-bold text-[#1E1E1E]">
            <img src="/svg/sr/logo.svg" alt="show logo" />
            App Settings
          </div>
          <button
            onClick={() => {
              context.dispatch({
                type: TIMESHEETTYPE.SHOWPAGES,
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
  const context = useTimeSheetAppsCotnext();
  const axiosAuth = useAxiosAuth();
  const { data: teams, isLoading: userLoading } = useQuery({
    queryKey: 'teams',
    queryFn: () => getTeams(axiosAuth),
  });
  return (
    <>
      <div className="absolute inset-0 top-4 z-10 h-full w-full max-w-[1360px] bg-white p-4 pt-0">
        {memoizedTopBar}
        <WithTimeSheetSettingsSidebar>
          {context.state.selectedSettingTab === 'Notifications' ? (
            <TimeSheetNotifictionSettings />
          ) : context.state.selectedSettingTab === 'Permissions' ? (
            <TimeSheetPermissionSetting teams={teams} />
          ) : (
            <TimeSheetAutoApprovedSettings teams={teams} />
          )}
        </WithTimeSheetSettingsSidebar>
      </div>
    </>
  );
}
