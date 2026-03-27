import { TimeSheetSidebar } from "./TimeSheet_Sidebar";

export function WithTimeSheetSettingsSidebar({ children }: { children: any }) {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex h-full justify-between">
        {/* TimeSheetSidebar */}
        <TimeSheetSidebar />
        {children}
      </div>
    </div>
  );
}
