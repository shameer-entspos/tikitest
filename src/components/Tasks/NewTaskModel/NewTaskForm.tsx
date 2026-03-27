import { useTaskCotnext } from '@/app/(main)/(user-panel)/user/tasks/context';
import { TASKTYPE } from '@/app/helpers/user/enums';
import { Button } from '@/components/Buttons';
import { Input } from '@/components/Form/Input';
import { SelectOption } from '@/components/Form/select';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import React, { useState } from 'react';
import { format } from 'date-fns';
import DatePIcker from 'react-datepicker';
import clsx from 'clsx';
import CustomHr from '@/components/Ui/CustomHr';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useQueries, useQuery } from 'react-query';
import { AppModel, getApps } from '@/app/(main)/(user-panel)/user/apps/api';
import { MultiSelect } from 'react-multi-select-component';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import { getAppLogo } from '@/components/popupModal/appListinApp';
import CustomCheckbox from '@/components/Ui/CustomCheckbox';
import { ChevronDown } from 'lucide-react';
import { getlistOfAppProjects } from '@/app/(main)/(user-panel)/user/tasks/api';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';

export function NewTaskForm() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };
  const { state, dispatch } = useTaskCotnext();
  const axiosAuth = useAxiosAuth();
  //   const queries = useQueries([
  //     {
  //       queryKey: ["appslist"],
  //       queryFn: () => getApps(axiosAuth),
  //     },
  //     {
  //       queryKey: ["listOfAppProjects", state.app],
  //       queryFn: () => getlistOfAppProjects(axiosAuth, state.apps ?? ""),
  //       // enabled: !!state.apps,
  //     },
  //   ]);

  //   const appsQuery = queries[0];
  //   const appProjectsQuery = queries[1];

  // Access data
  //   const appsData = appsQuery.data;
  //   const appProjectsData = appProjectsQuery.data;

  //   // Handle loading/error states
  //   const isSuccess = appsQuery.isSuccess;
  //   const isLoading = appsQuery.isLoading || appProjectsQuery.isLoading;

  //   const isAppSelected = (Id: string) => state.apps == Id;
  //   const handlePinAppSelect = (appId: string) => {
  //     dispatch({ type: TASKTYPE.SELECT_APP, apps: appId });
  //     // if (state.apps === appId) {
  //     //   dispatch({ type: TASKTYPE.DESELECT_APP, apps: appId });
  //     // } else {
  //     //   dispatch({ type: TASKTYPE.SELECT_APP, apps: appId });
  //     // }
  //   };
  const [searchIndividual, setSearchIndividual] = useState('');
  const initialValues = {
    name: state.payload?.name,
    dueDate: state?.dueDate ?? new Date(Date.now()),
    description: state.payload?.description,
  };
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('name is required'),
    dueDate: Yup.date().required('dueDate is required'),
    description: Yup.string().required('description is required'),
    // repeatTask: Yup.string().required("address is required"),
  });

  const handleSubmit = async (values: any) => {
    dispatch({
      type: TASKTYPE.SELECTDUEDATE,
      dueDate: state.dueDate,
      payload: {
        name: values.name,
        description: values.description,
      },
    });

    // dispatch({
    //   type: TASKTYPE.CHANGEMODELTYPE,
    //   currentModel: "app",
    // });
  };

  const handleRepeatSelectedDate = (value: string) => {
    if (value) {
      dispatch({
        type: TASKTYPE.SELECTREPEATDATE,
        repeatTask: value,
      });
    }
  };
  const handleRepeatEndTaskSelectedDate = (date: Date) => {
    if (date) {
      dispatch({
        type: TASKTYPE.SELECTREPEATTASKDATE,
        repeatTaskDueDate: date,
        repeatTaskHasDueDate: 'Custom',
      });
    } else {
      dispatch({
        type: TASKTYPE.SELECTREPEATTASKDATE,
        repeatTaskHasDueDate: 'when project ends',
      });
    }
  };
  const handleSelectionChange = (_e: any) => {
    dispatch({ type: TASKTYPE.AUDITCHANGE });
  };

  //   if (isSuccess) {
  //     var filteredUsers =
  //       (appsData ?? []).filter((e: { app: AppModel }) =>
  //         `${e?.app.name}`.toLowerCase().includes(searchIndividual.toLowerCase()),
  //       ) ?? [];
  //   }
  return (
    <></>
    // <div className="overflow-y-scroll scrollbar-hide">
    //   <Formik
    //     initialValues={initialValues}
    //     validationSchema={validationSchema}
    //     onSubmit={handleSubmit}
    //   >
    //     {({ errors, touched, handleSubmit, values }) => (
    //       <>
    //         <Form onSubmit={handleSubmit}>
    //           <div className="h-[500px] space-y-5 overflow-y-auto">
    //             <h3 className="font-semibold">Task Details</h3>
    //             <div className=" mb-4 w-full">
    //             <CustomSearchSelect
    //               label="Assigned Project"
    //               data={( []).map((child) => ({
    //                 label: child,
    //                 value: child,
    //               }))}
    //               onSelect={(value: string | any[], item: any) => {

    //               }}

    //               searchPlaceholder="Search projects"
    //               selected={[]}
    //               hasError={false}
    //               multiple={false}
    //               showImage={false}
    //               isRequired={true}
    //               isOpen={openDropdown === "dropdown1"}
    //               onToggle={() => handleToggle("dropdown1")}
    //             />
    //           </div>
    //           <div className=" mb-4 w-full">
    //             <CustomSearchSelect
    //               label="Customer"
    //               data={[
    //                 {
    //                   value: "all",
    //                   label: "My Organization",
    //                 },
    //                 ...( []).map((item) => ({
    //                 label: item,
    //                 value: item,
    //               }))]}
    //               onSelect={(value: string | any[], item: any) => {

    //               }}

    //               searchPlaceholder="Search customers"
    //               selected={[]}
    //               isRequired={true}
    //               hasError={false}
    //               multiple={false}
    //               showImage={false}
    //               isOpen={openDropdown === "dropdown2"}
    //               onToggle={() => handleToggle("dropdown2")}
    //             />
    //           </div>
    //             {/* <div className="semple-select-option relative mb-10 w-full">
    //               <SelectOption
    //                 variant="taskCustomdatePicker"
    //                 label="Select Customer"
    //                 name="repeatTaskHasDueDate"
    //                 options={[
    //                   {
    //                     value: "org",
    //                     label: "My Organization",
    //                   },
    //                 ]}
    //                 selectedOption={
    //                   state?.repeatTaskHasDueDate?.toString() ?? ""
    //                 }
    //                 handleSelectedOption={handleRepeatEndTaskSelectedDate}
    //               />
    //             </div> */}

    //             <div>
    //               <label
    //                 className={clsx(
    //                   "mb-2 mt-0 block text-base font-normal leading-[21.97px] text-black",
    //                 )}
    //               >
    //                 Task name
    //               </label>
    //               <Input
    //                 className="placeholder:text-sm"
    //                 type="text"
    //                 placeholder="Give your task a name"
    //                 name="name"
    //                 required={true}
    //                 value={values.name}
    //                 errorMessage={errors.name}
    //                 isTouched={touched.name}
    //               />
    //             </div>
    //             <div>
    //               <label
    //                 className={clsx(
    //                   "mb-2 mt-0 block text-base font-normal leading-[21.97px] text-black",
    //                 )}
    //               >
    //                 Task Description
    //               </label>

    //               <textarea
    //                 className="w-full resize-none rounded-xl border-2 border-gray-300 p-3 outline-none placeholder:text-sm"
    //                 rows={4}
    //                 placeholder="Give your task a description to provide context to the user."
    //                 name="description"
    //                 value={values.description}
    //               />
    //             </div>

    //             <div className="semple-select-option relative mb-8 w-full placeholder:text-black">
    //               <label
    //                 className={clsx(
    //                   "mb-2 mt-0 block text-base font-normal leading-[21.97px] text-black",
    //                 )}
    //               >
    //                 Link App (optional)
    //               </label>
    //               <Dropdown className="shadow-m rounded-lg bg-white">
    //                 <DropdownTrigger className="w-full">
    //                   <button className="flex h-[49px] w-full items-center justify-between overflow-y-auto rounded-xl border-2 border-gray-300 px-3">
    //                     {(appsData ?? []).find(
    //                       (item) => item.app._id === state.apps,
    //                     )?.app.name || "App"}
    //                     <ChevronDown className="w-5 text-gray-700" />
    //                   </button>
    //                 </DropdownTrigger>
    //                 <DropdownMenu className="w-full min-w-[300px] max-w-[400px] p-0 sm:w-[480px]">
    //                   <DropdownItem key={1}>
    //                     {filteredUsers?.map((e: { app: AppModel }) => {
    //                       return (
    //                         <div key={e.app._id}>
    //                           <div
    //                             onClick={() => handlePinAppSelect(e.app._id)}
    //                             className="mb-3 flex items-center justify-between"
    //                           >
    //                             <div className="flex items-center">
    //                               <img
    //                                 src={getAppLogo({ logoType: e.app.type })}
    //                                 alt="logo"
    //                                 className="h-[50px] w-[50px] rounded-md"
    //                               />
    //                               <p className="ml-2 text-sm font-normal text-[#212121]">
    //                                 {e.app.name}
    //                               </p>
    //                             </div>
    //                             <CustomCheckbox
    //                               label=""
    //                               checked={isAppSelected(e.app._id)}
    //                               size="small"
    //                               onChange={() => {
    //                                 handlePinAppSelect(e.app._id);
    //                               }}
    //                             />
    //                           </div>
    //                         </div>
    //                       );
    //                     })}
    //                   </DropdownItem>
    //                 </DropdownMenu>
    //               </Dropdown>
    //             </div>

    //             <div className="relative w-full">
    //               <label
    //                 className={clsx(
    //                   "mb-2 block text-base font-medium leading-[21.97px] text-black",
    //                 )}
    //               >
    //                 {"Due Date"}
    //               </label>
    //               <div
    //                 className={`relative flex h-[50px] w-full items-center border-2 border-gray-300 px-4 ${
    //                   errors.dueDate
    //                     ? "border-danger focus:border-danger"
    //                     : "focus:border-primary"
    //                 } focus:shadow-outline rounded-xl focus:border-primary focus:outline-none`}
    //               >
    //                 <DatePIcker
    //                   selected={state.dueDate ?? new Date(Date.now())}
    //                   className="border-none outline-none"
    //                   onChange={(val) => {
    //                     dispatch({
    //                       type: TASKTYPE.UPDATE_SELECTED_DATE,
    //                       dueDate: val ?? new Date(Date.now()),
    //                     });
    //                   }}
    //                 />
    //               </div>
    //               {/* <Input
    //               type="date"
    //               label="Due Date"
    //               placeholder={`${values.dueDate}`}
    //               name="dueDate"
    //               value={`${values.dueDate}`}
    //               readOnly

    //               errorMessage={errors.dueDate}
    //               isTouched={touched.dueDate}
    //             /> */}
    //             </div>
    //             <div className="semple-select-option relative mb-8 w-full placeholder:text-black">
    //               <SelectOption
    //                 variant="taskDatePicker"
    //                 label="Repeat Task"
    //                 className="overflow-y-auto border border-gray-300"
    //                 name="repeatTask"
    //                 options={[
    //                   {
    //                     value: "No",
    //                     label: "Does not repeat",
    //                   },

    //                   {
    //                     value: "Daily",
    //                     label: "Daily",
    //                   },
    //                   {
    //                     value: "Weekdays",
    //                     label: "Weekdays",
    //                   },
    //                   {
    //                     value: "Weekly",
    //                     label: "Weekly",
    //                   },
    //                   {
    //                     value: "Monthly",
    //                     label: "Monthly",
    //                   },
    //                   {
    //                     value: "Yearly",
    //                     label: "Yearly",
    //                   },
    //                   {
    //                     value: "Custom",
    //                     label: "Custom",
    //                   },
    //                 ]}
    //                 selectedOption={state?.repeatTask?.toString() ?? ""}
    //                 handleSelectedOption={handleRepeatSelectedDate}
    //               />
    //             </div>
    //             <div className="semple-select-option relative mb-10 w-full">
    //               <SelectOption
    //                 variant="taskCustomdatePicker"
    //                 label="Repeat Task - End Date"
    //                 name="repeatTaskHasDueDate"
    //                 options={[
    //                   {
    //                     value: "when project ends",
    //                     label: "when project ends",
    //                   },

    //                   {
    //                     value: "Custom",
    //                     label: "Custom",
    //                   },
    //                 ]}
    //                 selectedOption={
    //                   state?.repeatTaskHasDueDate?.toString() ?? ""
    //                 }
    //                 handleSelectedOption={handleRepeatEndTaskSelectedDate}
    //               />
    //             </div>
    //             <span className="text-sm font-semibold text-black">
    //               Required Audit?
    //             </span>
    //             <div className="mb-4">
    //               <div className="mb-4 mt-4">
    //                 <div className="flex items-center">
    //                   <input
    //                     type="radio"
    //                     value="no"
    //                     checked={!state.audit}
    //                     onChange={handleSelectionChange}
    //                   />
    //                   <b className="ml-2 text-sm">Not required</b>
    //                 </div>
    //               </div>

    //               <div className="flex items-center">
    //                 <input
    //                   type="radio"
    //                   value="yes"
    //                   checked={state.audit}
    //                   onChange={handleSelectionChange}
    //                 />
    //                 <b className="ml-2 text-sm">Yes</b>
    //               </div>
    //             </div>
    //           </div>

    //           <CustomHr className="my-4" />

    //           {/* Button  */}
    //           <div className="flex justify-center gap-6 text-center">
    //             <button
    //               className="h-11 w-1/2 rounded-lg border-2 border-primary-500 text-sm text-primary-500 sm:h-12 sm:w-36 sm:text-base"
    //               type="button"
    //               onClick={() => {
    //                 dispatch({ type: TASKTYPE.SHOWNEWTASKMODAL });
    //               }}
    //             >
    //               Back
    //             </button>
    //             <button
    //               className="h-11 w-1/2 rounded-lg bg-primary-500 text-sm font-semibold text-white hover:bg-primary-600/80 sm:h-12 sm:w-36 sm:text-base"
    //               type="submit"
    //             >
    //               Create Task
    //             </button>
    //           </div>
    //         </Form>
    //       </>
    //     )}
    //   </Formik>
    // </div>
  );
}
