


import { JSAAppModel } from "@/app/(main)/(user-panel)/user/apps/api";
import { RefObject } from "react";
import { SRDetailSidebar } from "./SR_Detail_Sidebar";
import { RollCall } from "@/app/type/roll_call";








export function WithSRDetailSidebar({ children, data, contentRef }: { children: any, data: RollCall
     | undefined, contentRef: RefObject<HTMLDivElement> }) {
    return <div className="flex-1 overflow-hidden">
        <div className="flex justify-between h-full ">

            {/* Sidebar */}
            <SRDetailSidebar data={data} contentRef={contentRef} />
            {children}

        </div>




    </div>
}