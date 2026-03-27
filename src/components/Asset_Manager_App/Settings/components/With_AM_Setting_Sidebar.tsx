import { AMSidebar } from "./AM_Setting_Sidbar";

export function WithAMSettingsSidebar({ children }: { children: any }) {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex justify-between h-full ">
        <AMSidebar />
        {children}
      </div>
    </div>
  );
}
