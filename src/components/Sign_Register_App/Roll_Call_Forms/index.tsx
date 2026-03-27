import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import React, { useMemo } from 'react';
import { SRTopBar } from '../SR_Top_Bar';
import { useSRAppCotnext } from '@/app/(main)/(user-panel)/user/apps/sr/sr_context';
import { SRSelectProject } from './SelectProject';
import { SR_APP_ACTION_TYPE } from '@/app/helpers/user/enums';
import { SRSelectSite } from './Select_Site';
import { SRRollCallDetail } from './SR_ROll_Call_Details';
import { SRAttendance } from './Attendance';
import { SRReview } from './SR_ROll_CALL_Review_Submit';

function RollCallSteps() {
  const context = useSRAppCotnext();
  const memoizedTopBar = useMemo(
    () => (
      <div className="breadCrumbs flex justify-between border-b-2 border-[#EEEEEE] p-2">
        <span className="flex items-center gap-2 text-xl font-bold">
          {' '}
          <img
            src="/svg/sr/logo.svg"
            alt="show logo"
            className="h-[50px] w-[50px]"
          />
          {context.state.showEditRollCallForm ? (
            <>Edit Roll Call</>
          ) : (
            <>New Roll Call</>
          )}
        </span>

        <button
          onClick={() => {
            if (context.state.showEditRollCallForm) {
              context.dispatch({
                type: SR_APP_ACTION_TYPE.SHOW_ROLL_CALL_FORM_EDIT,
              });
            } else {
              context.dispatch({
                type: SR_APP_ACTION_TYPE.SHOW_ROLL_CALL_FORM,
              });
            }
          }}
        >
          <img src="/svg/timesheet_app/go_back.svg" alt="show logo" />
        </button>
        {/* </Link> */}
      </div>
    ),
    []
  );

  return (
    <div className="absolute inset-0 z-10 flex h-[calc(var(--app-vh)-70px)] w-full max-w-[1360px] flex-col bg-white px-4 pt-4 font-Open-Sans">
      {/* TopBar */}
      {memoizedTopBar}

      {/* SelectProject */}
      {context.state.createNewRollCall == 'project' && <SRSelectProject />}

      {/* SelectProject */}
      {context.state.createNewRollCall == 'site' && <SRSelectSite />}

      {/* SRRollCallDetail */}
      {context.state.createNewRollCall == 'details' && <SRRollCallDetail />}

      {/* SRAttendance */}
      {context.state.createNewRollCall == 'attendance' && <SRAttendance />}

      {/* SRAttendance */}
      {context.state.createNewRollCall == 'review' && <SRReview />}
    </div>
  );
}

export default RollCallSteps;
