import { useAssetManagerAppsContext } from "@/app/(main)/(user-panel)/user/apps/am/am_context";
import { useSRAppCotnext } from "@/app/(main)/(user-panel)/user/apps/sr/sr_context";
import { AMAPPACTIONTYPE, SR_APP_ACTION_TYPE } from "@/app/helpers/user/enums";

export function AMSidebar() {
  const context = useAssetManagerAppsContext();

  const stepsList = ["Notifications", "Permissions"];

  return (
    <aside className="w-2/6 lg:w-1/6 border-r-2   border-[#EEEEEE] ">
      <h3 className="text-[#616161] font-semibold text-base pt-3 px-2 pb-2">
        App Settings
      </h3>
      <ul className="px-1">
        {stepsList.map((step, index) => (
          <li
            key={index}
            onClick={() => {
              context.dispatch({
                type: AMAPPACTIONTYPE.SELECTED_SETTING_TAB,
                selectedSettingTab: step,
              });
            }}
            className={`${
              context.state.selectedSettingTab == step
                ? "bg-[#E2F3FF] text-black"
                : "text-[#9E9E9E]"
            } rounded-full  px-6 cursor-pointer py-2 flex items-center   justify-start   text-xs font-normal`}
          >
            {step}
          </li>
        ))}
      </ul>
    </aside>
  );
}
