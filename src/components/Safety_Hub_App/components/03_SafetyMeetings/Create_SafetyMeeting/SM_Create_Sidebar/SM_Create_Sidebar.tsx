import { useSafetyHubContext } from '@/app/(main)/(user-panel)/user/apps/sh/sh_context';
import {
  AMAPPACTIONTYPE,
  SAFETYHUBTYPE,
  SR_APP_ACTION_TYPE,
} from '@/app/helpers/user/enums';
import { useState } from 'react';

export function SM_Create_Sidebar() {
  const context = useSafetyHubContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const stepsList = [
    'Assign to Project',
    'Select Topics',
    'Attendance',
    'Meeting',
    'Review & Submit',
  ];

  const setSeelctedValueOfSection = ({ index }: { index: number }) => {
    switch (index) {
      case 0:
        context.dispatch({
          type: SAFETYHUBTYPE.SHOW_SAFETY_MEETING_CREATE_MODEL,
          show_safety_meeting_create_model: 'project',
        });
        break;

      case 1:
        context.dispatch({
          type: SAFETYHUBTYPE.SHOW_SAFETY_MEETING_CREATE_MODEL,
          show_safety_meeting_create_model: 'topic',
        });
        break;

      case 2:
        context.dispatch({
          type: SAFETYHUBTYPE.SHOW_SAFETY_MEETING_CREATE_MODEL,
          show_safety_meeting_create_model: 'attendence',
        });
        break;
      case 3:
        context.dispatch({
          type: SAFETYHUBTYPE.SHOW_SAFETY_MEETING_CREATE_MODEL,
          show_safety_meeting_create_model: 'meeting',
        });
        break;
      case 4:
        context.dispatch({
          type: SAFETYHUBTYPE.SHOW_SAFETY_MEETING_CREATE_MODEL,
          show_safety_meeting_create_model: 'review',
        });

      default:
        return null;
    }
  };
  // "project" |"topic"|"attendence"|'meeting'|"review";

  const checkTheSelectedValue = ({ index }: { index: number }) => {
    switch (index) {
      case 0:
        return 'project';
      case 1:
        return 'topic';
      case 2:
        return 'attendence';
      case 3:
        return 'meeting';
      case 4:
        return 'review';

      default:
        return null;
    }
  };

  const checkTheSeelctedSectionValue = ({ value }: { value: string }) => {
    switch (value) {
      case 'project':
        return 0;
      case 'topic':
        return 1;
      case 'attendence':
        return 2;
      case 'meeting':
        return 3;
      case 'review':
        return 4;

      default:
        return 0;
    }
  };

  const checkListValue = ({
    stepIndex,
    value,
  }: {
    stepIndex: number;
    value: string;
  }) => {
    const selectedValueIndex = checkTheSeelctedSectionValue({ value });

    if (stepIndex < selectedValueIndex) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <>
      <button
        className="flex p-2 lg:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 0 24 24"
          width="24px"
          fill="#000000"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
        </svg>
      </button>

      <aside
        className={`${
          isSidebarOpen ? 'block' : 'hidden'
        } fixed left-0 top-14 z-50 h-full w-[50%] border-r-2 border-[#EEEEEE] bg-white sm:w-[40%] lg:static lg:block lg:w-1/6`}
      >
        <h3 className="mb-2 px-2 pt-3 text-base font-semibold text-[#616161]">
          New Meeting
        </h3>
        <ul className="px-1">
          {stepsList.map((step, index) => (
            <li
              key={index}
              onClick={() => {
                setSeelctedValueOfSection({ index });
              }}
              className={`${
                context.state.show_safety_meeting_create_model ==
                checkTheSelectedValue({ index })
                  ? 'bg-[#E2F3FF] text-base font-semibold text-[#1E1E1E]'
                  : 'text-sm font-normal text-[#9E9E9E]'
              } flex items-center justify-between rounded-full px-4 py-2`}
            >
              {step}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill={`${
                  checkListValue({
                    stepIndex: index,
                    value: context.state.show_safety_meeting_create_model!,
                  })
                    ? '#0063F7'
                    : '#9E9E9E'
                }`}
              >
                <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
              </svg>
            </li>
          ))}
        </ul>
      </aside>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}
