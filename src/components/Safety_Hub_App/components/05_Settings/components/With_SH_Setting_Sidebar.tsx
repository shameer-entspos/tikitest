import { SHSidebar } from "./SH_Setting_Sidbar";

export function WithSHSettingsSidebar({ children }: { children: any }) {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex justify-between h-full ">
        <SHSidebar />
        {children}
      </div>
    </div>
  );
}
