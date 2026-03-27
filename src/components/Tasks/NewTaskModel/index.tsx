'use client';

import { useFormik } from 'formik';
import 'react-datepicker/dist/react-datepicker.css';
import { useTaskCotnext } from '@/app/(main)/(user-panel)/user/tasks/context';
import { TASKTYPE } from '@/app/helpers/user/enums';
import CustomHr from '@/components/Ui/CustomHr';
import * as Yup from 'yup';
import { SimpleInput } from '@/components/Form/simpleInput';
import { useState } from 'react';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import clsx from 'clsx';
import { editTask } from '@/app/(main)/(user-panel)/user/tasks/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getAllProjectList } from '@/app/(main)/(user-panel)/user/projects/api';
import {
  getAllOrgUsers,
  getApps,
} from '@/app/(main)/(user-panel)/user/apps/api';
import { getAppLogo } from '@/components/popupModal/appListinApp';
import { SelectOption } from '@/components/Form/select';
import CustomDateRangePicker, {
  CalendarComponent,
} from '@/components/customDatePicker';

import { useSession } from 'next-auth/react';
import { MdArrowDropDown } from 'react-icons/md';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';

import Loader from '@/components/DottedLoader/loader';
import CustomModal from '@/components/Custom_Modal';
import toast from 'react-hot-toast';
import { TasKMembers } from './Task_Members';
import { AppDispatch, RootState } from '@/store';
import { handleAddTaskModel } from '@/store/taskSlice';
import { useDispatch, useSelector } from 'react-redux';
import { ProjectDetail } from '@/app/type/projects';
import { CustomWhiteCheckBox } from '@/components/Custom_Checkbox/Custom_White_Checkbox';
import CustomRadio from '@/components/CustomRadioButton/CustomRadioButton';
const NewTaskModel = ({
  adminMode = false,
  projectDetail,
}: {
  adminMode?: boolean;
  projectDetail?: ProjectDetail;
}) => {
  const { state, dispatch } = useTaskCotnext();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };
  const [showEndDate, setEndDate] = useState(false);
  const axiosAuth = useAxiosAuth();
  // projects handle
  const { data: projects } = useQuery({
    queryKey: 'project',
    queryFn: () => getAllProjectList({ axiosAuth }),
  });

  // customer handle
  const { data: users } = useQuery({
    queryKey: 'users',
    queryFn: () => getAllOrgUsers(axiosAuth),
  });

  // apps handle
  const { data: apps } = useQuery({
    queryKey: 'apps',
    queryFn: () => getApps(axiosAuth),
  });
  const queryClient = useQueryClient();
  const userUpdateTaskMutation = useMutation(editTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
      dispatch({
        type: TASKTYPE.SHOW_EDIT_SECTION,
      });
      reduxDispatch(handleAddTaskModel(undefined));
    },
  });

  //////
  const handleRepeatSelectedDate = (value: string) => {
    if (value) {
      dispatch({
        type: TASKTYPE.SELECTREPEATDATE,
        repeatTask: value,
      });
    }
  };
  const reduxDispatch = useDispatch<AppDispatch>();
  const modelType = useSelector((state: RootState) => state.task.addTaskModel);
  ///// projects handle

  //////////////////////////////////////
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Task name is required'),
    description: Yup.string()
      .required('Task description is required')
      .min(1, 'Task description is required'),
    startDate: Yup.date().required('Start date is required'),
    dueDate: Yup.date().required('Due date is required'),
    customer: Yup.string()
      .required('Customer is required')
      .min(1, 'Customer is required'),
    projects: Yup.array()
      .min(1, 'Select at least one project')
      .required('Select at least one project'),
  });
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const organizationForm = useFormik({
    initialValues: {
      name: state.payload?.name ?? '',
      dueDate: state?.dueDate ?? new Date(),
      startDate: state?.payload?.startDate
        ? new Date(state.payload.startDate)
        : new Date(),
      endDate: state?.payload?.endDate ?? '',
      projects: projectDetail
        ? [projectDetail._id]
        : (state?.payload?.projects ?? []),
      customer:
        (Array.isArray(state?.payload?.customer)
          ? state?.payload?.customer[0]
          : state?.payload?.customer) ?? '',
      description: state?.payload?.description ?? '',
      app: state?.payload?.app ?? '',
      shareAs: state?.payload?.shareAs ?? 'individual',
      repeatTaskCheckbox: state?.payload?.repeatTaskCheckbox ?? false,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (state.isShowForEdit) {
        dispatch({
          type: TASKTYPE.SELECTDUEDATE,
          dueDate: values.dueDate,
          payload: {
            name: values.name,
            description: values.description,
            projects: projectDetail ? [projectDetail._id] : values.projects,
            isGeneral: projectDetail
              ? (projectDetail.isGeneral ?? false)
              : (projects?.projects ?? []).some(
                  (p) => values.projects?.includes(p._id) && p.isGeneral
                ),
            selectedProjectsDetail: projectDetail
              ? [projectDetail]
              : (projects?.projects ?? []).filter((p) =>
                  (values.projects ?? []).includes(p._id)
                ),
            customer: values.customer ?? '',
            app: values.app,
            shareAs: values.shareAs,
            repeatTaskCheckbox: values.repeatTaskCheckbox,
            endDate: values.endDate,
            startDate: values.startDate,
          },
        });

        userUpdateTaskMutation.mutate({
          axiosAuth,
          data: {
            endDate: values.endDate,
            name: values.name,
            description: values.description,
            dueDate: values.dueDate,
            startDate: values.startDate,
            external: state.externalUser ?? [],
            individualUsers: state.individualUsers ?? [],
            teams: state.teams ?? [],
            app: values.app,
            shareAs: values.shareAs ?? 'individual',
            projects: projectDetail ? [projectDetail._id] : values.projects,
            customer: values.customer ?? '',
            repeatTask:
              state.repeatTask === 'Custom'
                ? (state.selectValueOfCustomList ?? '')
                : (state.repeatTask ?? 'No'),
            repeatTaskEndDate: state.repeatTaskDueDate,

            repeatCount:
              state.selectValueOfCustomList === 'Day' ||
              state.selectValueOfCustomList === 'Year' ||
              state.selectValueOfCustomList === 'Week' ||
              state.selectValueOfCustomList === 'Month'
                ? state.selectedCountOfRepeat
                : state.selectValueOfCustomList === 'Daily' ||
                    state.selectValueOfCustomList === 'Yearly' ||
                    state.selectValueOfCustomList === 'Weekdays' ||
                    state.selectValueOfCustomList === 'Weekly' ||
                    state.selectValueOfCustomList === 'Monthly'
                  ? 1
                  : undefined,

            weekCount:
              state.selectValueOfCustomList === 'Week'
                ? {
                    dayNumber: state.selectDaysForWeek,
                  }
                : state.repeatTask === 'Weekly'
                  ? {
                      dayNumber: [new Date(Date.now()).getDay()],
                    }
                  : undefined,
            monthCount:
              state.selectValueOfCustomList === 'Month'
                ? {
                    dayNumber: state.dayNumOfMonth,
                    type: state.monthType,
                    weekNumber: state.weekNumOfMonth,
                    weekDayNumber: state.DayNumOfWeekOfMonth,
                  }
                : state.repeatTask === 'Monthly'
                  ? {
                      dayNumber: new Date(Date.now()).getDay(),
                      type: state.monthType,
                    }
                  : undefined,
          },
          id: state.taskModel?._id ?? '',
          adminMode,
        });
      } else {
        // Series end: if "When Project Ends" is selected, at least one selected project must have an end date
        if (values.repeatTaskCheckbox && values.endDate === '0') {
          const selectedProjectsDetail = projectDetail
            ? [projectDetail]
            : (projects?.projects ?? []).filter((p) =>
                (values.projects ?? []).includes(p._id)
              );
          const hasAnyProjectWithEndDate = selectedProjectsDetail.some(
            (p) => p?.date != null && String(p.date).trim() !== ''
          );
          if (!hasAnyProjectWithEndDate) {
            toast.error(
              'When using "When Project Ends", at least one selected project must have an end date, or choose "Custom Date" and enter an end date.'
            );
            return;
          }
        }
        dispatch({
          type: TASKTYPE.SELECTDUEDATE,
          dueDate: values.dueDate,
          payload: {
            name: values.name,
            description: values.description,
            projects: projectDetail ? [projectDetail._id] : values.projects,
            isGeneral: projectDetail
              ? (projectDetail.isGeneral ?? false)
              : (projects?.projects ?? []).some(
                  (p) => values.projects?.includes(p._id) && p.isGeneral
                ),
            selectedProjectsDetail: projectDetail
              ? [projectDetail]
              : (projects?.projects ?? []).filter((p) =>
                  (values.projects ?? []).includes(p._id)
                ),
            customer: values.customer ?? '',
            app: values.app,
            shareAs: values.shareAs === 'shared' ? 'shared' : 'individual',
            repeatTaskCheckbox: values.repeatTaskCheckbox,
            endDate: values.endDate,
            startDate: values.startDate,
          },
        });
        reduxDispatch(handleAddTaskModel('members'));
      }
    },
  });

  const handleClose = () => {
    dispatch({
      type: TASKTYPE.SHOWNEWTASKMODAL,
    });
    reduxDispatch(handleAddTaskModel(undefined));
  };

  return (
    <>
      <CustomModal
        isOpen={true}
        handleCancel={handleClose}
        handleSubmit={() => organizationForm.submitForm()}
        submitDisabled={!organizationForm.isValid}
        isLoading={state.isShowForEdit && userUpdateTaskMutation.isLoading}
        submitValue={state.isShowForEdit ? 'Update' : 'Next'}
        cancelButton="Cancel"
        variant="primary"
        cancelvariant="primaryOutLine"
        justifyButton="justify-center"
        header={
          <div className="flex w-full items-center gap-3">
            <svg
              width="50"
              height="50"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
              <path
                d="M16.25 20H33.75V17.5H16.25V20ZM16.25 37.5C15.5625 37.5 14.9742 37.2554 14.485 36.7663C13.9958 36.2771 13.7508 35.6883 13.75 35V17.5C13.75 16.8125 13.995 16.2242 14.485 15.735C14.975 15.2458 15.5633 15.0008 16.25 15H17.5V12.5H20V15H30V12.5H32.5V15H33.75C34.4375 15 35.0263 15.245 35.5163 15.735C36.0063 16.225 36.2508 16.8133 36.25 17.5V24.5938C35.8542 24.4063 35.4479 24.25 35.0312 24.125C34.6146 24 34.1875 23.9063 33.75 23.8438V22.5H16.25V35H24.125C24.2708 35.4583 24.4429 35.8958 24.6413 36.3125C24.8396 36.7292 25.0737 37.125 25.3438 37.5H16.25ZM32.5 38.75C30.7708 38.75 29.2971 38.1404 28.0788 36.9213C26.8604 35.7021 26.2508 34.2283 26.25 32.5C26.2492 30.7717 26.8588 29.2979 28.0788 28.0788C29.2987 26.8596 30.7725 26.25 32.5 26.25C34.2275 26.25 35.7017 26.8596 36.9225 28.0788C38.1433 29.2979 38.7525 30.7717 38.75 32.5C38.7475 34.2283 38.1379 35.7025 36.9213 36.9225C35.7046 38.1425 34.2308 38.7517 32.5 38.75ZM34.5938 35.4688L35.4688 34.5938L33.125 32.25V28.75H31.875V32.75L34.5938 35.4688Z"
                fill="#0063F7"
              />
            </svg>

            <div className="flex flex-col">
              <h2 className="text-lg font-medium leading-7 text-[#000000] lg:text-xl">
                {state.isShowForEdit ? <>Edit Task</> : <>Add Task</>}
              </h2>
              <span className="text-sm font-normal text-[#616161]">
                Add and schedule new task to project.
              </span>
            </div>
          </div>
        }
        body={
          <div className="h-[500px] overflow-y-auto px-4">
            <h3 className="font-semibold">Task Details</h3>
            {projectDetail ? (
              <div className="mb-4 w-full opacity-90">
                <label className="mb-2 text-sm font-normal leading-[21.97px] text-black">
                  Assigned Project <span className="text-red-500">*</span>
                </label>
                <div className="rounded-md border border-gray-300 p-2 text-sm font-normal leading-[24.97px] text-black">
                  {projectDetail.name}
                </div>
              </div>
            ) : (
              <div className="mb-4 w-full">
                <CustomSearchSelect
                  label="Assigned Project"
                  data={(projects?.projects ?? []).map((p) => ({
                    label: p.name!,
                    value: p._id!,
                  }))}
                  onSelect={(value: string | string[]) => {
                    const arr = Array.isArray(value) ? value : value ? [value] : [];
                    organizationForm.setFieldValue('projects', arr);
                  }}
                  searchPlaceholder="Search projects"
                  selected={organizationForm.values.projects ?? []}
                  hasError={!!organizationForm.errors.projects}
                  multiple={true}
                  showImage={false}
                  isRequired={true}
                  isOpen={openDropdown === 'dropdown1'}
                  onToggle={() => handleToggle('dropdown1')}
                />
                {organizationForm.errors.projects && (
                  <p className="mt-1 text-red-500">
                    {String(organizationForm.errors.projects)}
                  </p>
                )}
              </div>
            )}
            <div className="mb-4 w-full">
              <CustomSearchSelect
                label="Customer"
                data={[
                  {
                    value: 'My Organization',
                    label: 'My Organization',
                  },
                  ...(users ?? [])
                    .filter((user) => user.role == 4)
                    .map((item) => ({
                      label: item.customerName + ' ' + item.userId,
                      value: item.customerName,
                      photo: item.photo,
                    })),
                ]}
                onSelect={(value: string | any[], item: any) => {
                  organizationForm.setFieldValue(
                    'customer',
                    (Array.isArray(value) ? value[0] : value) ?? ''
                  );
                }}
                searchPlaceholder="Search Customers"
                selected={(() => {
                  const c = organizationForm.values.customer;
                  const v = Array.isArray(c) ? c[0] : c;
                  return v ? [v] : [];
                })()}
                isRequired={true}
                hasError={false}
                multiple={false}
                showImage={true}
                isOpen={openDropdown === 'dropdown2'}
                onToggle={() => handleToggle('dropdown2')}
              />
            </div>

            <div className="mb-4 w-full">
              <SimpleInput
                className="placeholder:text-sm"
                type="text"
                label="Task Name"
                placeholder="Give your task a name"
                name="name"
                required={true}
                value={organizationForm.values.name}
                errorMessage={organizationForm.errors.name}
                isTouched={organizationForm.touched.name}
                onChange={organizationForm.handleChange}
              />
            </div>
            <div className="mb-4 w-full">
              <label
                className={clsx(
                  'mb-2 mt-0 block text-base font-normal leading-[21.97px] text-black'
                )}
              >
                Task Description
              </label>

              <textarea
                className="w-full resize-none rounded-xl border-2 border-gray-300 p-3 outline-none placeholder:text-sm"
                rows={4}
                placeholder="Describe the task."
                name="description"
                value={organizationForm.values.description}
                onChange={organizationForm.handleChange}
              />
              {organizationForm.errors.description && (
                <p className="text-red-500">
                  {organizationForm.errors.description}
                </p>
              )}
            </div>
            <div className="mb-4 w-full">
              <CustomSearchSelect
                label="Link App (Optional)"
                data={[
                  ...(apps ?? []).map((child) => ({
                    label: child.app.name!,
                    value: child.app._id!,
                    photo: `${getAppLogo({ logoType: child.app.type })}`,
                  })),
                ]}
                onSelect={(value: any, item: any) => {
                  organizationForm.setFieldValue('app', value);
                }}
                searchPlaceholder="Search Apps"
                selected={
                  organizationForm.values.app == ''
                    ? []
                    : [organizationForm.values.app]
                }
                returnSingleValueWithLabel={true}
                hasError={false}
                multiple={false}
                showImage={true}
                isRequired={false}
                isOpen={openDropdown === 'dropdown3'}
                onToggle={() => handleToggle('dropdown3')}
              />
            </div>

            <div className="relative w-full">
              <CustomDateRangePicker
                title="Start Date"
                isRequired={true}
                handleOnConfirm={(date: Date) => {
                  organizationForm.setFieldValue(
                    'startDate',
                    date ? new Date(date) : new Date()
                  );
                }}
                selectedDate={
                  organizationForm.values.startDate
                    ? new Date(organizationForm.values.startDate)
                    : null
                }
              />
              {organizationForm.errors.startDate && (
                <p className="mt-1 text-red-500">
                  {String(organizationForm.errors.startDate)}
                </p>
              )}
            </div>
            <div className="relative w-full">
              <CustomDateRangePicker
                title="Due Date"
                isRequired={true}
                handleOnConfirm={(date: Date) => {
                  organizationForm.setFieldValue('dueDate', date);
                }}
                selectedDate={organizationForm.values.dueDate}
              />
            </div>

            <div>
              {/* ////// */}

              <div className="mb-6 mt-10 w-full">
                <CustomWhiteCheckBox
                  label="Repeat Task"
                  checked={organizationForm.values.repeatTaskCheckbox}
                  onChange={() => {
                    organizationForm.setFieldValue(
                      'repeatTaskCheckbox',
                      !organizationForm.values.repeatTaskCheckbox
                    );
                  }}
                />
              </div>
              {organizationForm.values.repeatTaskCheckbox && (
                <>
                  <div className="semple-select-option relative my-4 w-full placeholder:text-black">
                    <label className="mb-2 text-sm font-normal leading-[21.97px] text-black">
                      Repeat Frequency
                    </label>
                    <SelectOption
                      variant="taskDatePicker"
                      label=""
                      className="overflow-y-auto border border-gray-300"
                      name="repeatTask"
                      options={[
                        {
                          value: 'No',
                          label: 'Does not repeat',
                        },

                        {
                          value: 'Daily',
                          label: 'Daily',
                        },
                        {
                          value: 'Weekdays',
                          label: 'Weekdays',
                        },
                        {
                          value: 'Weekly',
                          label: 'Weekly',
                        },
                        {
                          value: 'Monthly',
                          label: 'Monthly',
                        },
                        {
                          value: 'Yearly',
                          label: 'Yearly',
                        },
                        {
                          value: 'Custom',
                          label: 'Custom',
                        },
                      ]}
                      selectedOption={state?.repeatTask?.toString() ?? ''}
                      handleSelectedOption={handleRepeatSelectedDate}
                    />
                  </div>
                </>
              )}
            </div>
            {organizationForm.values.repeatTaskCheckbox && (
              <div className="mb-4 w-full">
                <CustomSearchSelect
                  label={`End Date`}
                  data={[
                    {
                      value: '0',
                      label: 'When Project Ends',
                    },
                    {
                      value: 'custom',
                      label: 'Custom Date',
                    },
                  ]}
                  onSelect={(value: any, item: any) => {
                    if (value == 'custom') {
                      setEndDate(!showEndDate);
                    } else {
                      organizationForm.setFieldValue('endDate', value);
                    }
                  }}
                  searchPlaceholder="End Date"
                  selected={
                    organizationForm.values.endDate
                      ? organizationForm.values.endDate != '0'
                        ? ['custom']
                        : ['0']
                      : []
                  }
                  returnSingleValueWithLabel={true}
                  isRequired={false}
                  hasError={false}
                  multiple={false}
                  showImage={false}
                  showSearch={false}
                  isOpen={openDropdown === 'dropdown4'}
                  onToggle={() => handleToggle('dropdown4')}
                />
              </div>
            )}
            <div className="mb-4">
              <span className="my-12 text-sm font-semibold text-black">
                Task Sharing
              </span>
              <div className="mb-2 mt-4">
                <div className="flex items-center gap-2">
                  <CustomRadio
                    name="shareAs"
                    value="individual"
                    checkedValue={organizationForm.values.shareAs ?? 'individual'}
                    onChange={() => {
                      organizationForm.setFieldValue('shareAs', 'individual');
                    }}
                    label={
                      <>
                        Individual
                        <span className="ml-1 text-xs text-gray-500">
                          {` - to be completed individual by everyone selected.`}
                        </span>
                      </>
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CustomRadio
                  name="shareAs"
                  value="shared"
                  checkedValue={organizationForm.values.shareAs ?? 'individual'}
                  onChange={() => {
                    organizationForm.setFieldValue('shareAs', 'shared');
                  }}
                  label={
                    <>
                      Shared
                      <span className="text-xs text-gray-500">
                        {` - to be completed by anyone that is selected.`}
                      </span>
                    </>
                  }
                />
              </div>
            </div>
          </div>
        }
      />
      <CustomModal
        isOpen={showEndDate}
        header={null}
        handleCancel={() => setEndDate(false)}
        handleSubmit={() => {}}
        submitValue=""
        showFooter={false}
        showHeader={false}
        body={
          <CalendarComponent
            onConfirm={function (date: Date): void {
              setEndDate(!showEndDate);
              organizationForm.setFieldValue('endDate', date);
            }}
            onCancel={function (): void {
              setEndDate(!showEndDate);
            }}
            selectedDate={
              organizationForm.values.endDate
                ? organizationForm.values.endDate == '0'
                  ? null
                  : new Date(organizationForm.values.endDate)
                : null
            }
            handleClear={function (): void {
              organizationForm.setFieldValue('endDate', undefined);
            }}
          />
        }
      />
    </>
  );
};

export { NewTaskModel };
