import { useTaskCotnext } from "@/app/(main)/(user-panel)/user/tasks/context";
import { TASKTYPE } from "@/app/helpers/user/enums";
import { Button } from "../Buttons";
import CustomHr from "../Ui/CustomHr";

export function TastStartModel() {
  const { state, dispatch } = useTaskCotnext();

  return (
    <>
      <div className="h-full grid place-content-center">
        <div className="flex flex-col items-center justify-center gap-5 font-medium ">
          <button
            className="text-sm sm:text-base bg-primary-500 hover:bg-primary-600/80 text-white w-1/2 sm:w-36 h-11 sm:h-12 rounded-xl"
            onClick={() => {
              dispatch({
                type: TASKTYPE.SHOW_SIGN_IN_MODEL,
                showSignIn: "form",
              });
              dispatch({
                type: TASKTYPE.SIGN_IN_AS,
                signAs: "user",
              });
            }}
          >
            Sign in as User
          </button>

          <CustomHr className="my-2" />

          <button
            className="text-sm sm:text-base bg-primary-500 hover:bg-primary-600/80 text-white w-1/2 sm:w-36 h-11 sm:h-12 rounded-xl"
            onClick={() => {
              dispatch({
                type: TASKTYPE.SHOW_SIGN_IN_MODEL,
                showSignIn: "form",
              });
              dispatch({
                type: TASKTYPE.SIGN_IN_AS,
                signAs: "guest",
              });
            }}
          >
            Sign in as Guest
          </button>
        </div>
      </div>
    </>
  );
}
