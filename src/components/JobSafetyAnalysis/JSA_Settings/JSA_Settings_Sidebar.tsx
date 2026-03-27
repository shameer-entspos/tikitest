import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { JSAAPPACTIONTYPE } from '@/app/helpers/user/enums';
import { useState } from 'react';

export function JSASidebar() {
  const context = useJSAAppsCotnext();

  const stepsList = ['Notifications', 'Permissions'];

  return (
    <aside className="w-2/6 border-r-2 border-[#EEEEEE] lg:w-1/6">
      <h3 className="px-2 pb-2 pt-3 text-base font-semibold text-[#616161]">
        App Settings
      </h3>
      <ul className="px-1">
        {stepsList.map((step, index) => (
          <li
            key={index}
            onClick={() => {
              context.dispatch({
                type: JSAAPPACTIONTYPE.SELECTED_SETTING_TAB,
                selectedSettingTab: step,
              });
            }}
            className={`${
              context.state.selectedSettingTab == step
                ? 'bg-[#E2F3FF] text-black'
                : 'text-[#9E9E9E]'
            } flex cursor-pointer items-center justify-start rounded-full px-6 py-2 text-base font-normal`}
          >
            {step}
          </li>
        ))}
      </ul>
    </aside>
  );
}
