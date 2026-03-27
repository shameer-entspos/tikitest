import { getTeams } from '@/app/(main)/(org-panel)/organization/teams/api';
import { useAssetManagerAppsContext } from '@/app/(main)/(user-panel)/user/apps/am/am_context';
import { useSRAppCotnext } from '@/app/(main)/(user-panel)/user/apps/sr/sr_context';
import { useTimeSheetAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/timesheets/timesheet_context';
import { AMAPPACTIONTYPE, SR_APP_ACTION_TYPE } from '@/app/helpers/user/enums';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { WithKMSettingsSidebar } from './components/With_KM_Setting_Sidebar';
import { KMDefaultSettings } from './components/KM_Default_Settings';
import { KMPrinterSettings } from './components/KM_Printer_Settings';
import { getKioskSetting } from '@/app/(main)/(user-panel)/user/apps/sr/api';

export function KioskModeSettingsScreen() {
  const context = useSRAppCotnext();

  const memoizedTopBar = useMemo(
    () => (
      <>
        <div className="breadCrumbs flex justify-between border-b-2 border-gray-300 p-2">
          <div className="flex items-center gap-2 text-2xl font-bold text-[#1E1E1E]">
            <img
              src="/svg/sr/logo.svg"
              alt="show logo"
              className="h-[50px] w-[50px]"
            />
            Kiosk Settings
          </div>
          <button
            onClick={() => {
              context.dispatch({
                type: SR_APP_ACTION_TYPE.SHOWPAGES,
                showPages: 'kiosk_mode_second_section',
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

  return (
    <>
      <div className="absolute inset-0 top-4 z-10 h-full w-full max-w-[1360px] bg-white p-4 pt-0">
        {memoizedTopBar}
        <WithKMSettingsSidebar>
          {context.state.selectedSettingTabKioskMode === 'Default Settings' ? (
            <KMDefaultSettings />
          ) : (
            <KMPrinterSettings />
          )}
        </WithKMSettingsSidebar>
      </div>
    </>
  );
}
