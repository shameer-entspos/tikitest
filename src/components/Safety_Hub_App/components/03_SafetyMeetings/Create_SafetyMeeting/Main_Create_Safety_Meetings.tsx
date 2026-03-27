import { useMemo, useState } from 'react';
import { useSafetyHubContext } from '@/app/(main)/(user-panel)/user/apps/sh/sh_context';
import { SMSelectProject } from './Select_SM_Project';
import { SAFETYHUBTYPE } from '@/app/helpers/user/enums';
import { SM_Select__Topic } from './Select_SM_Topic';
import { SM_Select__Attendance } from './Select_SM_Attendance';
import { SM_Meeting_Create_Section } from './SM_Meeting_Create_Section';
import { SM_Review_Section } from './SM_Review_Section';
import CloseWithoutSubmit from '../close_without_submit';

export default function MainCreateSafetyMeetings() {
  const { state, dispatch } = useSafetyHubContext();
  const [close, setClose] = useState(false);

  const memoizedTopBar = useMemo(
    () => (
      <div className="breadCrumbs flex justify-between border-b-2 border-[#EEEEEE] p-2">
        <span className="flex items-center gap-2 text-xl font-bold">
          {' '}
          <img
            src="/svg/sh/logo.svg"
            alt="show logo"
            className="h-[50px] w-[50px]"
          />
          {<>New Safety Meeting</>}
        </span>

        <button
          onClick={() => {
            setClose(true);
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
    <>
      <div className="absolute inset-0 z-10 flex h-[calc(var(--app-vh)-70px)] w-full max-w-[1360px] flex-col bg-white px-4 pt-4 font-Open-Sans">
        {/* TopBar */}
        {memoizedTopBar}

        {/* SMSelectProject */}
        {state.show_safety_meeting_create_model == 'project' && (
          <SMSelectProject />
        )}

        {/* SM_Select__Topic */}
        {state.show_safety_meeting_create_model == 'topic' && (
          <SM_Select__Topic />
        )}

        {/* SM_Select__Attendance */}
        {state.show_safety_meeting_create_model == 'attendence' && (
          <SM_Select__Attendance />
        )}

        {/* SM_Meeting_Create_Section */}
        {state.show_safety_meeting_create_model == 'meeting' && (
          <SM_Meeting_Create_Section />
        )}

        {/* SM_Review_Section */}
        {state.show_safety_meeting_create_model == 'review' && (
          <SM_Review_Section />
        )}
      </div>
      {close && (
        <CloseWithoutSubmit
          handleClose={() => {
            setClose(!close);
          }}
          onDeleteButton={() => {
            dispatch({
              type: SAFETYHUBTYPE.CLEAR_SAFETY_MEETING_CREATE_MODEL,
            });
          }}
        />
      )}
    </>
  );
}
