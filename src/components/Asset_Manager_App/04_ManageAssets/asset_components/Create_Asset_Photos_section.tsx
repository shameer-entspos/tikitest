



import { useAssetManagerAppsContext } from "@/app/(main)/(user-panel)/user/apps/am/am_context";
import { AMAPPACTIONTYPE } from "@/app/helpers/user/enums";
import { useMemo } from "react";
import { WithCreateAssetSidebar } from "./With_Create_Asset_Sidebar";
import { AM_Asset_Create_Bottom_Button } from "./AM_Asset_Create_Bottom_Button";
import ImageUploadWithProgress from "@/components/JobSafetyAnalysis/CreateNewComponents/JSA_Upload_IMG";
import Select_Asset_Images from "./Select_Asset_Images";
import { UseStagedImageUploadsReturn } from "@/components/apps/shared/useStagedImageUploads";





export default function CreateAssetPhotos({
  stagedUploads,
}: {
  stagedUploads?: UseStagedImageUploadsReturn;
}){
  const {state,dispatch} =useAssetManagerAppsContext();
   
    return   <>
    <WithCreateAssetSidebar>

    <div className="w-11/12 lg:w-[83%] flex flex-col border-2 border-[#EEEEEE] rounded-lg shadow mx-2 lg:mx-0 lg:ml-2 my-4 ">
          <div className="flex flex-col md:flex md:flex-row md:justify-between   sm:p-5 sm:pb-0">
            <div className="flex flex-col  ">
              <h2 className="text-sm font-semibold mb-1 md:text-xl">
                Photos
              </h2>
              <p className="text-[#616161] font-normal text-[10px] md:text-sm">
                Optional: Add Photos / Images of the assets
              </p>
            </div>
            
          </div> 

      {/* other body  */}
    <div className="px-4">
    <Select_Asset_Images stagedUploads={stagedUploads} />
    </div>
          </div>
    </WithCreateAssetSidebar>
    <div className="h-16">
      <AM_Asset_Create_Bottom_Button
        //   isDisabled={(context.state.SRSelectedProjects ?? []).length < 1}
        onCancel={() => {
          dispatch({type:AMAPPACTIONTYPE.SHOW_ASSET_CREATE_MODEL,show_asset_create_model:'detail'})
        }}
        onNextClick={() => {
          dispatch({type:AMAPPACTIONTYPE.SHOW_ASSET_CREATE_MODEL,show_asset_create_model:'review'})
        }}
      />
    </div>
  </>
}
