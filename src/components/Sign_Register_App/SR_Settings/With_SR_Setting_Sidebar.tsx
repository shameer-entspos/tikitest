import { SRSidebar } from "./SR_Setting_Sidbar";





export function WithSRSettingsSidebar({ children }: { children: any }) {
    return <div className="flex-1 overflow-hidden">
        <div className="flex justify-between h-full ">
            <SRSidebar />
            {children}

        </div>
    </div>
}