import { SRSidebar } from "./Roll_Call_Sidebar";

export function WithRollCallSidebar({ children }: { children: any }) {
    return <div className="flex-1 overflow-hidden">
        <div className="flex justify-start h-full ">

            {/* Sidebar */}
          
            <SRSidebar />
            {children}

        </div>
    </div>
}