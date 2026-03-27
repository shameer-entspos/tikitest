import { AM_Asset_Create_Sidebar } from "./Create_Asset_Sidebar";


export function WithCreateAssetSidebar({ children }: { children: any }) {
    return <div className="flex-1 overflow-hidden">
        <div className="flex justify-start h-full ">

            {/* Sidebar */}
          
           <AM_Asset_Create_Sidebar/>
            {children}

        </div>
    </div>
}