import Image from "next/image";
import useAxiosAuth from "@/hooks/AxiosAuth";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Button } from "../Buttons";
import { installAppInOrg } from "@/app/(main)/(org-panel)/organization/app-store/api";
import Loader from "../DottedLoader/loader";
import { useAppStoreCotnext } from "@/app/(main)/(org-panel)/organization/app-store/context";
import { APPSTORETYPE } from "@/app/helpers/organization/enums";
import { useEffect } from "react";

const AddAppModel = () => {
  const context = useAppStoreCotnext();
  const queryClient = useQueryClient();

  const axiosAuth = useAxiosAuth();

  const createProjectMutation = useMutation(installAppInOrg, {

     onSuccess: () => {
      queryClient.invalidateQueries("installedApps");
    },
  });

  const handleSubmit = () => {
    createProjectMutation.mutate({
      axiosAuth: axiosAuth,
      body: {
        app: context.state.appStoreModel?._id ?? "",
      },
    });
  };

  useEffect(() => {
    if (createProjectMutation.isSuccess) {
      context.dispatch({ type: APPSTORETYPE.SHOWMODEL, showModel: "install" });
    }
  });
  return (
    <div className=" fixed inset-0 z-10 overflow-y-auto">
      <div className="fixed inset-0 w-full h-full bg-black opacity-40"></div>
      <div className="flex items-center min-h-screen px-4 py-8">
        <div className="relative w-full md:max-w-[600px]  md:min-h-[550px] mx-auto bg-white rounded-md shadow-lg">
          <div className="py-6 md:py-14 px-6 md:px-12">
            <button
              className="absolute top-16 right-8"
              onClick={() => {
                context.dispatch({ type: APPSTORETYPE.TOGGLE });
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.00005 8.3998L2.10005 13.2998C1.91672 13.4831 1.68338 13.5748 1.40005 13.5748C1.11672 13.5748 0.883382 13.4831 0.700048 13.2998C0.516715 13.1165 0.425049 12.8831 0.425049 12.5998C0.425049 12.3165 0.516715 12.0831 0.700048 11.8998L5.60005 6.9998L0.700048 2.0998C0.516715 1.91647 0.425049 1.68314 0.425049 1.3998C0.425049 1.11647 0.516715 0.883138 0.700048 0.699804C0.883382 0.516471 1.11672 0.424805 1.40005 0.424805C1.68338 0.424805 1.91672 0.516471 2.10005 0.699804L7.00005 5.5998L11.9 0.699804C12.0834 0.516471 12.3167 0.424805 12.6 0.424805C12.8834 0.424805 13.1167 0.516471 13.3 0.699804C13.4834 0.883138 13.575 1.11647 13.575 1.3998C13.575 1.68314 13.4834 1.91647 13.3 2.0998L8.40005 6.9998L13.3 11.8998C13.4834 12.0831 13.575 12.3165 13.575 12.5998C13.575 12.8831 13.4834 13.1165 13.3 13.2998C13.1167 13.4831 12.8834 13.5748 12.6 13.5748C12.3167 13.5748 12.0834 13.4831 11.9 13.2998L7.00005 8.3998Z"
                  fill="#616161"
                />
              </svg>
            </button>

            <div className=" w-full  flex items-center mb-3">
              <div className="min-w-[80px] w-20 h-20 px-3 pt-[19px] pb-5 bg-orange-300 rounded-xl shadow justify-center items-center inline-flex">
                <div className="text-center text-black text-xl font-semibold">
                  {context.state.appStoreModel?.name
                    .substring(0, 1)
                    .toString()
                    .toUpperCase()}
                </div>
              </div>

              <div className="ml-3">
                <div className="text-black text-2xl  font-semibold">
                  {context.state.appStoreModel?.name}
                </div>
                <div className="text-black text-base  font-semibold">Free</div>
              </div>
            </div>

            {/* ////// */}

            <div className="flex flex-wrap -mx-2">
              <div className="w-full px-2">
                <Image
                  src="/images/app.png"
                  alt="Image 1"
                  className="w-full h-auto"
                  width={100}
                  height={200}
                />
              </div>
            </div>

            {/* ****** */}
            <div>
              <div className="text-black text-2xl min-h-10 max-h-24   overflow-y-scroll scrollbar-hide   font-semibold">
                Description
              </div>
              <div className="text-black text-base font-normal">
                {context.state.appStoreModel?.description}
              </div>
            </div>
            <div className="text-center flex gap-7 justify-center">
              {context.state.appStoreModel?.isInstalled ? (
                <button
                  className="text-sm bg-[#0063F7] font-bold text-white leading-[22px]    max-w-[188px] min-w-[188px] py-[10px] px-[20px] h-[47px] rounded-lg mt-[80px]"
                  disabled
                >
                  Already Installed
                </button>
              ) : (
                <button
                  className="text-sm bg-[#0063F7] font-bold text-white leading-[22px]    max-w-[188px] min-w-[188px] py-[10px] px-[20px] h-[47px] rounded-lg mt-[80px]"
                  onClick={handleSubmit}
                >
                  {createProjectMutation.isLoading ? <Loader /> : "Add App"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { AddAppModel };
