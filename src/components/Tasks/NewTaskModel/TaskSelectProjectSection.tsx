import { getlistOfAppProjects } from '@/app/(main)/(user-panel)/user/tasks/api';
import { useTaskCotnext } from '@/app/(main)/(user-panel)/user/tasks/context';
import { TASKTYPE } from '@/app/helpers/user/enums';
import Loader from '@/components/DottedLoader/loader';
import { Search } from '@/components/Form/search';
import CustomHr from '@/components/Ui/CustomHr';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { Checkbox } from '@nextui-org/react';
import { useState } from 'react';
import { useQuery } from 'react-query';

export function TaskSelectProjectSection() {
  return <></>;
  //   const { state, dispatch } = useTaskCotnext();
  //   const axiosAuth = useAxiosAuth();
  //   const [searchIndividual, setSearchIndividual] = useState("");
  //   const { data, isLoading, isSuccess, isError, error } = useQuery({
  //     queryKey: "listOfAppProjects",
  //     queryFn: () => getlistOfAppProjects(axiosAuth, state.apps ?? ""),
  //   });

  //   const isAppSelected = (Id: string) =>
  //     (state.projects ?? [])?.some((id) => id == Id);

  //   const handlePinAppSelect = (projectId: string) => {
  //     if ((state.projects ?? []).findIndex((id) => id === projectId) !== -1) {
  //       dispatch({ type: TASKTYPE.DESELECT_PROJECT, projects: projectId });
  //     } else {
  //       dispatch({ type: TASKTYPE.SELECT_PROJECT, projects: projectId });
  //     }
  //   };
  //   if (isLoading) {
  //     return (
  //       <div className="flex h-80 items-center justify-center">
  //         <Loader />
  //       </div>
  //     );
  //   }
  //   var filteredUsers =
  //     (data ?? []).filter((e) =>
  //       `${e?.name}`.toLowerCase().includes(searchIndividual.toLowerCase()),
  //     ) ?? [];

  //   return (
  //     <div>
  //       <div className="h-[500px] overflow-y-auto text-sm font-semibold text-black">
  //         <div className="mb-5 mt-2 text-sm font-normal text-black">
  //           Assign this task to one or more projects.
  //         </div>
  //         <div className="mb-3">
  //           <Search
  //             className="inline-flex h-[49px] w-full items-center justify-start rounded-lg bg-gray-50 text-base font-normal text-gray-600"
  //             key={"search"}
  //             inputRounded={true}
  //             type="text"
  //             name="search"
  //             onChange={(e) => setSearchIndividual(e.target.value)}
  //             placeholder="E.g Toolbox Talks"
  //           />
  //         </div>
  //         <div className="ml-1 mt-4 text-sm font-medium text-black">
  //           {(state.projects ?? []).length > 0 && (state.projects ?? []).length}{" "}
  //           Projects assigned:{" "}
  //         </div>

  //         <div className="mt-4 overflow-y-auto scrollbar-hide">
  //           {filteredUsers.map((e) => {
  //             return (
  //               <div key={e._id}>
  //                 <div className="mb-3 flex items-center justify-between rounded-lg bg-[#F5F5F5] p-3">
  //                   <div className="flex items-center">
  //                     <input
  //                       type="checkbox"
  //                       checked={isAppSelected(e._id)}
  //                       onChange={(ee) => {
  //                         handlePinAppSelect(e._id);
  //                       }}
  //                       className="mr-2 h-4 w-4 rounded-none border-[#616161]"
  //                     />
  //                     <div className="text-xs font-normal text-[#212121]">
  //                       {e.name}
  //                     </div>
  //                   </div>
  //                 </div>
  //               </div>
  //             );
  //           })}
  //         </div>
  //       </div>

  //       <>
  //         <CustomHr className="my-4" />

  //         {/* buttons */}
  //         <div className="flex justify-center gap-6 text-center">
  //           <button
  //             className="h-11 w-1/2 rounded-lg border-2 border-primary-500 text-sm text-primary-500 sm:h-12 sm:w-36 sm:text-base"
  //             onClick={() => {
  //               dispatch({
  //                 type: TASKTYPE.CHANGEMODELTYPE,
  //                 currentModel: "app",
  //               });
  //             }}
  //           >
  //             Back
  //           </button>
  //           <button
  //             type="button"
  //             className="h-11 w-1/2 rounded-lg bg-primary-500 text-sm text-white hover:bg-primary-600/80 sm:h-12 sm:w-40 sm:text-base"
  //             onClick={() => {
  //               dispatch({
  //                 type: TASKTYPE.CHANGEMODELTYPE,
  //                 currentModel: "members",
  //               });
  //             }}
  //             disabled={(state.projects ?? []).length === 0}
  //           >
  //             Assign to People{" "}
  //           </button>
  //         </div>
  //       </>
  //     </div>
  //   );
}
