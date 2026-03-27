import { KMSidebar } from "./KM_Setting_Sidbar";

export function WithKMSettingsSidebar({ children }: { children: any }) {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex justify-between h-full ">
        <KMSidebar />
        {children}
      </div>
    </div>
  );
}
