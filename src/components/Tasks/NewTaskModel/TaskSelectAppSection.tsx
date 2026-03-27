import { AppModel, getApps } from "@/app/(main)/(user-panel)/user/apps/api";
import { useTaskCotnext } from "@/app/(main)/(user-panel)/user/tasks/context";
import { TASKTYPE } from "@/app/helpers/user/enums";
import Loader from "@/components/DottedLoader/loader";
import { Search } from "@/components/Form/search";
import CustomHr from "@/components/Ui/CustomHr";
import useAxiosAuth from "@/hooks/AxiosAuth";
import { Checkbox } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useQuery } from "react-query";

export function TaskSelectAppSection() {
    return <></>
//   const { state, dispatch } = useTaskCotnext();
//   const { data: sessioin } = useSession();
//   const axiosAuth = useAxiosAuth();
//   const { data, isLoading, isSuccess, isError, error } = useQuery({
//     queryKey: "appslist",
//     queryFn: () => getApps(axiosAuth),
//   });
//   const isAppSelected = (Id: string) => state.apps == Id;
//   const handlePinAppSelect = (appId: string) => {
//     dispatch({ type: TASKTYPE.SELECT_APP, apps: appId });
//     // if (state.apps === appId) {
//     //   dispatch({ type: TASKTYPE.DESELECT_APP, apps: appId });
//     // } else {
//     //   dispatch({ type: TASKTYPE.SELECT_APP, apps: appId });
//     // }
//   };
//   const [searchIndividual, setSearchIndividual] = useState("");
//   if (isLoading) {
//     return (
//       <div className="flex h-80 items-center justify-center">
//         <Loader />
//       </div>
//     );
//   }
//   if (isSuccess) {
//     var filteredUsers =
//       (data ?? []).filter((e: { app: AppModel }) =>
//         `${e?.app.name}`.toLowerCase().includes(searchIndividual.toLowerCase()),
//       ) ?? [];
//     return (
//       <div>
//         <div className="h-[500px] overflow-y-auto">
//           <div className="text-sm font-semibold text-black">
//             Select which app you want to create a task for.
//           </div>
//           <div className="mb-5 mt-2 text-sm font-normal text-black">
//             You can only select one app per task.
//           </div>
//           <div className="mb-3">
//             <Search
//               className="inline-flex h-[49px] w-full items-center justify-start rounded-lg bg-gray-50 p-3 text-base font-normal text-gray-600"
//               key={"search"}
//               inputRounded={true}
//               type="text"
//               name="search"
//               onChange={(e) => setSearchIndividual(e.target.value)}
//               placeholder="E.g Toolbox Talks"
//             />
//           </div>
//           <div className="mt-4 text-sm font-light text-black">
//             Selected:
//             <span className="font-bold">
//               {
//                 (data ?? []).find((item) => item.app._id === state.apps)?.app
//                   .name
//               }
//             </span>
//           </div>
//           <div className="mt-4 overflow-y-auto scrollbar-hide">
//             {filteredUsers!.map((e: { app: AppModel }) => {
//               return (
//                 <div key={e.app._id}>
//                   <div className="mb-3 flex items-center justify-between rounded-lg bg-[#F5F5F5] p-3">
//                     <div className="flex items-center">
//                       <input
//                         type="radio"
//                         checked={isAppSelected(e.app._id)}
//                         onChange={(ee) => {
//                           handlePinAppSelect(e.app._id);
//                         }}
//                         className="mr-2 h-4 w-4 rounded-none border-[#616161]"
//                       />
//                       <div className="text-sm font-normal text-[#212121]">
//                         {e.app.name}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         <CustomHr className="my-2" />

//         <div className=" ">
//           <div className="mt-4 flex justify-center gap-6 text-center">
//             <button
//               className="h-11 w-1/2 rounded-lg border-2 border-primary-500 text-sm text-primary-500 sm:h-12 sm:w-36 sm:text-base"
//               type="button"
//               onClick={() => {
//                 dispatch({
//                   type: TASKTYPE.CHANGEMODELTYPE,
//                   currentModel: "form",
//                 });
//               }}
//             >
//               Back
//             </button>
//             <button
//               type="button"
//               className="h-11 w-1/2 rounded-lg bg-primary-500 text-sm font-semibold text-white hover:bg-primary-600/80 sm:h-12 sm:w-36 sm:text-base"
//               onClick={() => {
//                 dispatch({
//                   type: TASKTYPE.CHANGEMODELTYPE,
//                   currentModel: "project",
//                 });
//               }}
//               disabled={state.apps === undefined}
//             >
//               Assign to Project
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return <></>;
}
