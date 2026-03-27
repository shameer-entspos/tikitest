

import { RefObject } from "react";
import { SingleAsset } from "@/app/type/single_asset";
import { AMAssetDetailSidebar } from "./AM_Asset_Detail_Sidebar";








export function WithAssetDetailSIdebar({ children, data, contentRef }: { children: any, data: SingleAsset|undefined, contentRef: RefObject<HTMLDivElement> }) {
    return <div className="flex-1 overflow-hidden">
        <div className="flex justify-between h-full ">

            {/* Sidebar */}
            <AMAssetDetailSidebar data={data} contentRef={contentRef} />
            {children}

        </div>




    </div>
}