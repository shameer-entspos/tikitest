import { JSASidebar } from "./JSA_Settings_Sidebar";







export function WithSettingsSidebar({ children }: { children: any }) {
    return <div className="flex-1 overflow-visible">
        <div className="flex justify-between h-full ">
            {/* JSASidebar */}
            <JSASidebar />
            {children}

        </div>
    </div>
}