import { SM_Create_Sidebar } from "./SM_Create_Sidebar";

export function WithCreateSafetyMeetingSidebar({ children }: { children: any }) {
    return <div className="flex-1 overflow-hidden">
        <div className="flex justify-start h-full ">

            {/* Sidebar */}
          
        <SM_Create_Sidebar/>
            {children}

        </div>
    </div>
}