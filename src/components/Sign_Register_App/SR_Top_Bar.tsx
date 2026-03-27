import { useSRAppCotnext } from "@/app/(main)/(user-panel)/user/apps/sr/sr_context";
import { SR_APP_ACTION_TYPE } from "@/app/helpers/user/enums";

export function SRTopBar({
  backToPage,
}: {
  backToPage?: 'sign_in_out' | undefined;
} = {}) {
  const { dispatch } = useSRAppCotnext();

  const handleGoBack = () => {
    dispatch({
      type: SR_APP_ACTION_TYPE.SHOWPAGES,
      showPages: backToPage ?? undefined,
    });
  };



    return <>
        <div className="breadCrumbs p-2 flex justify-between">
            <img src="/svg/sr/bread_crumbs.svg" alt="show logo" />
            {/* <div className="bg-[#F1CD70] px-3 py-2 rounded font-semibold">JSA</div> */}
            {/* <Link href={'/use /apps'}> */}
            <button onClick={handleGoBack}>

                <img src="/svg/timesheet_app/go_back.svg" alt="show logo" />
            </button>
            {/* </Link> */}
        </div>

    </>
}