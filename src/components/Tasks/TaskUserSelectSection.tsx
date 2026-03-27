import { getAllOrgUsers } from "@/app/(main)/(user-panel)/user/apps/api";
import { submitSignInTask } from "@/app/(main)/(user-panel)/user/tasks/api";
import { useTaskCotnext } from "@/app/(main)/(user-panel)/user/tasks/context";
import { TASKTYPE } from "@/app/helpers/user/enums";
import useAxiosAuth from "@/hooks/AxiosAuth";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Button } from "../Buttons";
import Loader from "../DottedLoader/loader";
import { Search } from "../Form/search";
import { CustomBlueCheckBox } from "../Custom_Checkbox/Custom_Blue_Checkbox";

function TaskUserSelectSectionPage() {
  const context = useTaskCotnext();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const createSubmitAppMutation = useMutation(submitSignInTask, {
    onSuccess: () => {
      queryClient.invalidateQueries("tasks");
      context.dispatch({
        type: TASKTYPE.SHOWTASKMODAL,
      });
    },
  });
  const sumbitTask = () => {
    const formData = new FormData();
    (context.state.userId ?? []).forEach((userId) => {
      formData.append("users[]", userId);
    });

    (context.state.projectId ?? []).forEach((projectId) => {
      formData.append("projects[]", projectId);
    });
    // Add the values to the FormData object
    formData.append("firstName", context.state.formPayload?.firstName ?? "");
    formData.append("lastName", context.state.formPayload?.lastName ?? "");
    formData.append("email", context.state.formPayload?.email ?? "");
    formData.append("type", context.state.formType ?? "visitor");
    formData.append("user_id", session?.user.user._id ?? "");
    formData.append("task_id", context.state.taskModel?._id ?? "");
    formData.append("company", context.state.formPayload?.company ?? "");
    formData.append("formType", context.state.signAs ?? "");
    formData.append("reason", context.state.formPayload?.reason ?? "");
    formData.append("phone", context.state.formPayload?.phone ?? "");
    if (context.state.selectedSelfie) {
      formData.append("photo", context.state.selectedSelfie);
    }

    createSubmitAppMutation.mutate({
      data: formData,
      axiosAuth: axiosAuth,
    });
  };
  return (
    <div className=" p-0 md:p-1 px-0 md:px-5 ">
      <div className="text-base text-black font-normal  pb-3">
        Who are you here to see?
      </div>
      <SelectUser />
      <div className="flex justify-center mt-[6px] md:mt-[72px] gap-6 ">
        <button
          className="text-sm sm:text-base text-primary-500 border-2 border-primary-500 w-1/2 sm:w-36 h-11 sm:h-12 rounded-lg"
          onClick={() => {
            context.dispatch({
              type: TASKTYPE.SHOW_SIGN_IN_MODEL,
              showSignIn: "projects",
            });
          }}
        >
          Back
        </button>
        <button
          className="text-sm sm:text-base bg-primary-500 hover:bg-primary-600/80 text-white w-1/2 sm:w-36 h-11 sm:h-12 font-semibold rounded-lg"
          onClick={sumbitTask}
        >
          {createSubmitAppMutation.isLoading ? <Loader /> : <>Submit</>}
        </button>
      </div>
    </div>
  );
}
export { TaskUserSelectSectionPage };

function SelectUser() {
  const axiosAuth = useAxiosAuth();

  const sessioin = useSession();
  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: "listofUsers",
    queryFn: () => getAllOrgUsers(axiosAuth),
  });
  const context = useTaskCotnext();
  const [searchStarred, setSearchStarred] = useState("");
  ///////////////////////////////////
  const isUserSelected = (Id: string) =>
    context.state.userId?.some((id) => id == Id);
  const handleUserSelect = (id: string) => {
    if ((context.state.userId ?? []).findIndex((user) => user === id) !== -1) {
      context.dispatch({ type: TASKTYPE.DESELECT_TASK_USER, userId: id });
    } else {
      context.dispatch({ type: TASKTYPE.SELECT_TASK_USER, userId: id });
    }
  };
  ///////////////////////////////////////////////////////
  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  if (isSuccess) {
    const filteredData =
      data.filter((e) =>
        `${e.firstName} ${e.lastName}`
          .toLowerCase()
          .includes(searchStarred.toLowerCase())
      ) ?? [];
    return (
      <div className="h-full">
        <div className="mb-4">
          <Search
            className="bg-gray-50 border-2 border-gray-300 placeholder:text-[#616161] h-[44px] rounded-lg"
            type="text"
            name="search"
            inputRounded={true}
            value={searchStarred}
            onChange={(event) => {
              setSearchStarred(event.target.value);
            }}
            placeholder="Search by Name or Email"
          />
        </div>
        <div>
          {filteredData?.map((e) => {
            return (
              <div key={e._id} className={"py-1 "}>
                <div className="flex items-center gap-4 py-1 md:py-3 bg-[#F5F5F5] rounded-lg px-3 ">
                  <CustomBlueCheckBox
                    checked={isUserSelected(e._id)}
                    onChange={() => {
                      handleUserSelect(e._id);
                    }}
                  />
                  <div className="text-xs md:text-sm text-[#616161] font-Open-Sans">
                    {`${e.firstName} ${e.lastName} `}
                    <span className="text-[10px]">({e.email})</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return <></>;
}
