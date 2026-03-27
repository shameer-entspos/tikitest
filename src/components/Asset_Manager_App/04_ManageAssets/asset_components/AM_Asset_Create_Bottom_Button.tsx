


import { useAssetManagerAppsContext } from "@/app/(main)/(user-panel)/user/apps/am/am_context";
import { useSRAppCotnext } from "@/app/(main)/(user-panel)/user/apps/sr/sr_context";
import { Button } from "@/components/Buttons";
import Loader from "@/components/DottedLoader/loader";




export function AM_Asset_Create_Bottom_Button({ onNextClick, onCancel, isDisabled = false, loading  = false }: { onNextClick: any, onCancel: any, isDisabled?: boolean, loading?: boolean }) {
    const context = useAssetManagerAppsContext()
   
 
        return <div className="flex justify-between border-2 p-2 border-[#EEEEEE]">
            {
                context.state.show_asset_create_model == 'detail' ? <>
                    <Button variant="primaryOutLine" onClick={onCancel}>
                        Cancel
                    </Button>
                </> :
                    <>
                        <Button variant="primaryOutLine" onClick={onCancel}>
                            Back
                        </Button></>
            }
            <div className="flex gap-5">
              
            {
                context.state.is_asset_edit ? <>
                {
                    context.state.show_asset_create_model == 'review' ? <>
                        <Button variant="primary" onClick={onNextClick}>
                       {
                        loading?<Loader/>:"Save"
                       }

                             
                        </Button>
                    </> : <>
                        <Button variant="primary" className={`${isDisabled ? "bg-gray-500" : "bg-primary-700"}`} disabled={isDisabled} onClick={onNextClick}>
                            Next
                        </Button></>
                }
                </>:<>
                {
                    context.state.show_asset_create_model == 'review' ? <>
                        <Button variant="primary" onClick={onNextClick}>
                       {
                        loading?<Loader/>:"Submit"
                       }

                             
                        </Button>
                    </> : <>
                        <Button variant="primary" className={`${isDisabled ? "bg-gray-500" : "bg-primary-700"}`} disabled={isDisabled} onClick={onNextClick}>
                            Next
                        </Button></>
                }
                </>
            }

               {/* {
                context.state.showEditRollCallForm?<>
                
                {
                    context.state.createNewRollCall == 'review' ? <>
                        <Button variant="primary" onClick={onNextClick}>
                       {
                        loading?<Loader/>:"Save"
                       }

                             
                        </Button>
                    </> : <>
                        <Button variant="primary" className={`${isDisabled ? "bg-gray-500" : "bg-primary-700"}`} disabled={isDisabled} onClick={onNextClick}>
                            Next
                        </Button></>
                }
                
                </>:<>
                 {
                    context.state.createNewRollCall == 'review' ? <>
                        <Button variant="primary" onClick={onNextClick}>
                       {
                        loading?<Loader/>:"Submit"
                       }

                             
                        </Button>
                    </> : <>
                        <Button variant="primary" className={`${isDisabled ? "bg-gray-500" : "bg-primary-700"}`} disabled={isDisabled} onClick={onNextClick}>
                            Next
                        </Button></>
                }
                </>
               } */}
            </div>
        </div>
    
}