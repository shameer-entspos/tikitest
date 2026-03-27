import { useAssetManagerAppsContext } from '@/app/(main)/(user-panel)/user/apps/am/am_context';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { useSRAppCotnext } from '@/app/(main)/(user-panel)/user/apps/sr/sr_context';
import { AMAPPACTIONTYPE, SR_APP_ACTION_TYPE } from '@/app/helpers/user/enums';
import { useState } from 'react';

export function AM_Asset_Create_Sidebar() {
  const context = useAssetManagerAppsContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const stepsList = ['Details', 'Photos', 'Review & Submit'];

  const setSeelctedValueOfSection = ({ index }: { index: number }) => {
    switch (index) {
      case 0:
        context.dispatch({
          type: AMAPPACTIONTYPE.SHOW_ASSET_CREATE_MODEL,
          show_asset_create_model: 'detail',
        });
        break;

      case 1:
        context.dispatch({
          type: AMAPPACTIONTYPE.SHOW_ASSET_CREATE_MODEL,
          show_asset_create_model: 'photo',
        });
        break;

      case 2:
        context.dispatch({
          type: AMAPPACTIONTYPE.SHOW_ASSET_CREATE_MODEL,
          show_asset_create_model: 'review',
        });
        break;

      default:
        return null;
    }
  };

  const checkTheSelectedValue = ({ index }: { index: number }) => {
    switch (index) {
      case 0:
        return 'detail';
      case 1:
        return 'photo';
      case 2:
        return 'review';

      default:
        return null;
    }
  };

  const checkTheSeelctedSectionValue = ({ value }: { value: string }) => {
    switch (value) {
      case 'detail':
        return 0;
      case 'photo':
        return 1;
      case 'review':
        return 2;

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
        <h3 className="px-2 pt-3 text-base font-semibold text-[#616161]">
          Create New
        </h3>
        <ul className="px-1">
          {stepsList.map((step, index) => (
            <li
              key={index}
              onClick={() => {
                setSeelctedValueOfSection({ index });
              }}
              className={`${
                context.state.show_asset_create_model ==
                checkTheSelectedValue({ index })
                  ? 'bg-[#E2F3FF] font-semibold text-[#1E1E1E]'
                  : 'text-[#9E9E9E]'
              } flex items-center justify-between rounded-full px-4 py-2 text-base`}
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
                    value: context.state.show_asset_create_model!,
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
