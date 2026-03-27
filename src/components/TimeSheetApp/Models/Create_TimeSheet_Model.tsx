import {
  getAllAppProjects,
  getAllOrgUsers,
} from '@/app/(main)/(user-panel)/user/apps/api';
import {
  createTimeSheet,
  updateTimeSheet,
} from '@/app/(main)/(user-panel)/user/apps/timesheets/api';
import { useTimeSheetAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/timesheets/timesheet_context';
import { TIMESHEETTYPE } from '@/app/helpers/user/enums';
import { TimeSheet } from '@/app/type/timesheet';
import { SimpleInput } from '@/components/Form/simpleInput';
import useAxiosAuth from '@/hooks/AxiosAuth';
import CustomModal from '@/components/Custom_Modal';
import { useFormik } from 'formik';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { CustomSearchSelect } from '../CommonComponents/Custom_Select/Custom_Search_Select';
import { getCustomersList } from '@/app/(main)/(user-panel)/user/apps/am/api';

const CreateTimeSheetModel = ({
  timesheet,
}: {
  timesheet: TimeSheet | undefined;
}) => {
  const { state, dispatch } = useTimeSheetAppsCotnext();
  const [, setSeelctedProjects] = useState<
    Array<{ label: string; value: string }>
  >([]);

  const [trackerOn, setTracker] = useState(timesheet?.trackerStarted ?? false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const createMutation = useMutation(createTimeSheet, {
    onSuccess: () => {
      queryClient.invalidateQueries('timeSheets');
      handleClose();
    },
  });
  const updateMutation = useMutation(updateTimeSheet, {
    onSuccess: () => {
      queryClient.invalidateQueries('timeSheets');
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update timesheet');
    },
  });

  const handleClose = () => {
    dispatch({ type: TIMESHEETTYPE.SELECTED_TIMESHEET });
  };
  const appFormValidator = (values: any) => {
    const errors: any = {};

    // Time Tracker (Required)
    if (
      values.hours === '' ||
      values.hours === null ||
      values.hours === undefined
    ) {
      errors.hours = 'Hours is required';
    }
    if (
      values.minutes === '' ||
      values.minutes === null ||
      values.minutes === undefined
    ) {
      errors.minutes = 'Minutes is required';
    }

    // Assigned Project (Required)
    if (!values.selectedProject || values.selectedProject.length === 0) {
      errors.selectedProject = 'At least one project must be selected';
    }

    // Assigned Customer (Required)
    if (!values.customer || String(values.customer).trim() === '') {
      errors.customer = 'Customer is required';
    }

    return errors;
  };

  const organizationForm = useFormik({
    initialValues: {
      reference: timesheet?.reference ?? '',
      description: timesheet?.description ?? '',
      hours: timesheet?.timeTracker?.hours ?? '00',
      minutes: timesheet?.timeTracker?.minutes ?? '00',
      selectedProject: timesheet?.projects?.map((p) => p._id) ?? [],
      customer: timesheet?.customer ?? '',
    },
    validate: appFormValidator,
    validateOnMount: false,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  const handleSubmit = (values: any) => {
    const data = {
      reference: values.reference ?? '',
      description: values.description ?? '',
      projects: values.selectedProject ?? [], // Initialize with empty array
      customer: values.customer ?? '',
      trackerStarted: trackerOn,
      timeTracker: {
        hours: values.hours,
        minutes: values.minutes,
      },
    };

    if (timesheet) {
      updateMutation.mutate({ id: timesheet._id, data, axiosAuth });
    } else {
      createMutation.mutate({ data, axiosAuth });
    }
  };

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const { data: users, isLoading: userLoading } = useQuery({
    queryKey: 'customers',
    queryFn: () => getCustomersList(axiosAuth),
  });
  const { data: projects, isLoading: projectLoading } = useQuery({
    queryKey: 'allUserAssignedProjects',
    queryFn: () => getAllAppProjects(axiosAuth),
  });
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  // Timer functionality
  useEffect(() => {
    if (trackerOn) {
      // Initialize timer seconds from current hours and minutes
      const currentHours = parseInt(organizationForm.values.hours) || 0;
      const currentMinutes = parseInt(organizationForm.values.minutes) || 0;
      const initialSeconds = currentHours * 3600 + currentMinutes * 60;
      setTimerSeconds(initialSeconds);

      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          const newSeconds = prev + 1;
          const hours = Math.floor(newSeconds / 3600);
          const minutes = Math.floor((newSeconds % 3600) / 60);
          organizationForm.setFieldValue(
            'hours',
            hours.toString().padStart(2, '0')
          );
          organizationForm.setFieldValue(
            'minutes',
            minutes.toString().padStart(2, '0')
          );
          return newSeconds;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [trackerOn]);

  const handleResetTimer = () => {
    setTracker(false);
    setTimerSeconds(0);
    organizationForm.setFieldValue('hours', '00');
    organizationForm.setFieldValue('minutes', '00');
  };

  const modalHeader = (
    <>
      <svg
        width="50"
        height="50"
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
        <g clipPath="url(#clip0_1_33512)">
          <path
            d="M25 12.5C31.9037 12.5 37.5 18.0963 37.5 25C37.5 31.9037 31.9037 37.5 25 37.5C18.0963 37.5 12.5 31.9037 12.5 25C12.5 18.0963 18.0963 12.5 25 12.5ZM25 17.5C24.6685 17.5 24.3505 17.6317 24.1161 17.8661C23.8817 18.1005 23.75 18.4185 23.75 18.75V25C23.7501 25.3315 23.8818 25.6494 24.1163 25.8837L27.8663 29.6337C28.102 29.8614 28.4178 29.9874 28.7455 29.9846C29.0732 29.9817 29.3868 29.8503 29.6185 29.6185C29.8503 29.3868 29.9817 29.0732 29.9846 28.7455C29.9874 28.4178 29.8614 28.102 29.6337 27.8663L26.25 24.4825V18.75C26.25 18.4185 26.1183 18.1005 25.8839 17.8661C25.6495 17.6317 25.3315 17.5 25 17.5Z"
            fill="#0063F7"
          />
        </g>
        <defs>
          <clipPath id="clip0_1_33512">
            <rect
              width="30"
              height="30"
              fill="white"
              transform="translate(10 10)"
            />
          </clipPath>
        </defs>
      </svg>
      <div>
        <h1>{timesheet ? 'Edit Timesheet' : ' Add Timesheet'}</h1>
        <span className="text-base font-normal text-[#616161]">
          {timesheet
            ? 'Edit timesheet details below.'
            : 'Add timesheet details below.'}
        </span>
      </div>
    </>
  );

  const modalBody = (
    <div className="h-[60vh] max-h-[520px] w-full overflow-y-scroll px-4">
                <div className="">
                  <h2 className="mb-4 text-lg font-semibold">Time Tracker</h2>
                  <div className="flex w-full justify-between gap-2 pb-2">
                    <div className="w-full">
                      <SimpleInput
                        type="number"
                        label="Hours"
                        placeholder="HH"
                        name="hours"
                        inputTextCenter={true}
                        required={true}
                        className="mt-1 block w-full rounded-md border-2 border-[#EEEEEE] px-3 py-2 text-center shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        min="0"
                        max="23"
                        inputMode="numeric"
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          let value = Number(target.value);
                          if (isNaN(value) || value < 0) value = 0;
                          if (value > 23) value = 23;
                          const formattedValue = value
                            .toString()
                            .padStart(2, '0');
                          target.value = formattedValue;
                          organizationForm.setFieldValue(
                            'hours',
                            formattedValue
                          );
                        }}
                        errorMessage={organizationForm.errors.hours}
                        value={organizationForm.values.hours}
                        isTouched={organizationForm.touched.hours}
                        onChange={organizationForm.handleChange}
                      />
                    </div>
                    <div className="w-full">
                      <SimpleInput
                        type="number"
                        label="Minutes"
                        placeholder="MM"
                        name="minutes"
                        inputTextCenter={true}
                        required={true}
                        className="mt-1 block w-full rounded-md border-2 border-[#EEEEEE] px-3 py-2 text-center shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        min="0"
                        max="59"
                        inputMode="numeric"
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          let value = Number(target.value);
                          if (isNaN(value) || value < 0) value = 0;
                          if (value > 59) value = 59;
                          const formattedValue = value
                            .toString()
                            .padStart(2, '0');
                          target.value = formattedValue;
                          organizationForm.setFieldValue(
                            'minutes',
                            formattedValue
                          );
                        }}
                        errorMessage={organizationForm.errors.minutes}
                        value={organizationForm.values.minutes}
                        isTouched={organizationForm.touched.minutes}
                        onChange={organizationForm.handleChange}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {trackerOn ? (
                      <>
                        <span
                          className="flex cursor-pointer items-center gap-1"
                          onClick={() => setTracker(!trackerOn)}
                        >
                          <svg
                            width="100"
                            height="40"
                            viewBox="0 0 100 40"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              width="100"
                              height="40"
                              rx="8"
                              fill="#EA4E4E"
                            />
                            <path
                              d="M53.1641 22.8906C53.1641 23.5677 52.9974 24.151 52.6641 24.6406C52.3359 25.1302 51.862 25.5052 51.2422 25.7656C50.6276 26.026 49.8932 26.1562 49.0391 26.1562C48.6224 26.1562 48.224 26.1328 47.8438 26.0859C47.4635 26.0391 47.1042 25.9714 46.7656 25.8828C46.4323 25.7891 46.1276 25.6771 45.8516 25.5469V23.7812C46.3151 23.9844 46.8333 24.1693 47.4062 24.3359C47.9792 24.4974 48.5625 24.5781 49.1562 24.5781C49.6406 24.5781 50.0417 24.5156 50.3594 24.3906C50.6823 24.2604 50.9219 24.0781 51.0781 23.8438C51.2344 23.6042 51.3125 23.3255 51.3125 23.0078C51.3125 22.6693 51.2214 22.3828 51.0391 22.1484C50.8568 21.9141 50.5807 21.7005 50.2109 21.5078C49.8464 21.3099 49.388 21.099 48.8359 20.875C48.4609 20.724 48.1016 20.5521 47.7578 20.3594C47.4193 20.1667 47.1172 19.9401 46.8516 19.6797C46.5859 19.4193 46.375 19.112 46.2188 18.7578C46.0677 18.3984 45.9922 17.9766 45.9922 17.4922C45.9922 16.8464 46.1458 16.2943 46.4531 15.8359C46.7656 15.3776 47.2031 15.026 47.7656 14.7812C48.3333 14.5365 48.9948 14.4141 49.75 14.4141C50.349 14.4141 50.9115 14.4766 51.4375 14.6016C51.9688 14.7266 52.4896 14.9036 53 15.1328L52.4062 16.6406C51.9375 16.4479 51.4818 16.2943 51.0391 16.1797C50.6016 16.0651 50.1536 16.0078 49.6953 16.0078C49.2995 16.0078 48.9635 16.0677 48.6875 16.1875C48.4115 16.3073 48.2005 16.4766 48.0547 16.6953C47.9141 16.9089 47.8438 17.1641 47.8438 17.4609C47.8438 17.7943 47.9245 18.0755 48.0859 18.3047C48.2526 18.5286 48.5078 18.7344 48.8516 18.9219C49.2005 19.1094 49.6484 19.3177 50.1953 19.5469C50.8255 19.8073 51.3594 20.0807 51.7969 20.3672C52.2396 20.6536 52.5781 20.9974 52.8125 21.3984C53.0469 21.7943 53.1641 22.2917 53.1641 22.8906ZM58.3984 24.6719C58.638 24.6719 58.875 24.651 59.1094 24.6094C59.3438 24.5625 59.5573 24.5078 59.75 24.4453V25.8359C59.5469 25.9245 59.2839 26 58.9609 26.0625C58.638 26.125 58.3021 26.1562 57.9531 26.1562C57.4635 26.1562 57.0234 26.0755 56.6328 25.9141C56.2422 25.7474 55.9323 25.4635 55.7031 25.0625C55.474 24.6615 55.3594 24.1068 55.3594 23.3984V18.75H54.1797V17.9297L55.4453 17.2812L56.0469 15.4297H57.2031V17.3516H59.6797V18.75H57.2031V23.375C57.2031 23.8125 57.3125 24.138 57.5312 24.3516C57.75 24.5651 58.0391 24.6719 58.3984 24.6719ZM69.1641 21.6562C69.1641 22.375 69.0703 23.013 68.8828 23.5703C68.6953 24.1276 68.4219 24.599 68.0625 24.9844C67.7031 25.3646 67.2708 25.6562 66.7656 25.8594C66.2604 26.0573 65.6901 26.1562 65.0547 26.1562C64.4609 26.1562 63.9167 26.0573 63.4219 25.8594C62.9271 25.6562 62.4974 25.3646 62.1328 24.9844C61.7734 24.599 61.4948 24.1276 61.2969 23.5703C61.099 23.013 61 22.375 61 21.6562C61 20.7031 61.1641 19.8958 61.4922 19.2344C61.8255 18.5677 62.2995 18.0599 62.9141 17.7109C63.5286 17.362 64.2604 17.1875 65.1094 17.1875C65.9062 17.1875 66.6094 17.362 67.2188 17.7109C67.8281 18.0599 68.3047 18.5677 68.6484 19.2344C68.9922 19.901 69.1641 20.7083 69.1641 21.6562ZM62.8906 21.6562C62.8906 22.2865 62.9661 22.8255 63.1172 23.2734C63.2734 23.7214 63.513 24.0651 63.8359 24.3047C64.1589 24.5391 64.5755 24.6562 65.0859 24.6562C65.5964 24.6562 66.013 24.5391 66.3359 24.3047C66.6589 24.0651 66.8958 23.7214 67.0469 23.2734C67.1979 22.8255 67.2734 22.2865 67.2734 21.6562C67.2734 21.026 67.1979 20.4922 67.0469 20.0547C66.8958 19.612 66.6589 19.276 66.3359 19.0469C66.013 18.8125 65.5938 18.6953 65.0781 18.6953C64.3177 18.6953 63.763 18.9505 63.4141 19.4609C63.0651 19.9714 62.8906 20.7031 62.8906 21.6562ZM75.7109 17.1875C76.737 17.1875 77.5599 17.5625 78.1797 18.3125C78.8047 19.0625 79.1172 20.1771 79.1172 21.6562C79.1172 22.6354 78.9714 23.4609 78.6797 24.1328C78.3932 24.7995 77.9896 25.3047 77.4688 25.6484C76.9531 25.987 76.3516 26.1562 75.6641 26.1562C75.2266 26.1562 74.8464 26.099 74.5234 25.9844C74.2005 25.8698 73.9245 25.7214 73.6953 25.5391C73.4661 25.3516 73.2734 25.1484 73.1172 24.9297H73.0078C73.0339 25.138 73.0573 25.3698 73.0781 25.625C73.1042 25.875 73.1172 26.1042 73.1172 26.3125V29.8359H71.2734V17.3516H72.7734L73.0312 18.5469H73.1172C73.2786 18.3021 73.474 18.0755 73.7031 17.8672C73.9375 17.6589 74.2188 17.4948 74.5469 17.375C74.8802 17.25 75.2682 17.1875 75.7109 17.1875ZM75.2188 18.6875C74.7135 18.6875 74.3073 18.7891 74 18.9922C73.6979 19.1901 73.4766 19.4896 73.3359 19.8906C73.2005 20.2917 73.1276 20.7943 73.1172 21.3984V21.6562C73.1172 22.2969 73.1823 22.8411 73.3125 23.2891C73.4479 23.7318 73.6693 24.0703 73.9766 24.3047C74.2891 24.5339 74.7109 24.6484 75.2422 24.6484C75.6901 24.6484 76.0599 24.526 76.3516 24.2812C76.6484 24.0365 76.8698 23.6875 77.0156 23.2344C77.1615 22.7812 77.2344 22.2474 77.2344 21.6328C77.2344 20.7005 77.0677 19.9766 76.7344 19.4609C76.4062 18.9453 75.901 18.6875 75.2188 18.6875Z"
                              fill="white"
                            />
                            <path
                              d="M24.6667 12H35.3333C36.8 12 38 13.2 38 14.6667V25.3333C38 26.8 36.8 28 35.3333 28H24.6667C23.2 28 22 26.8 22 25.3333V14.6667C22 13.2 23.2 12 24.6667 12Z"
                              fill="white"
                            />
                          </svg>
                        </span>
                      </>
                    ) : (
                      <>
                        <span
                          className="flex cursor-pointer items-center gap-1"
                          onClick={() => setTracker(!trackerOn)}
                        >
                          <svg
                            width="100"
                            height="40"
                            viewBox="0 0 100 40"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              width="100"
                              height="40"
                              rx="8"
                              fill="#0063F7"
                            />
                            <path
                              d="M51.2734 22.8906C51.2734 23.5677 51.1068 24.151 50.7734 24.6406C50.4453 25.1302 49.9714 25.5052 49.3516 25.7656C48.737 26.026 48.0026 26.1562 47.1484 26.1562C46.7318 26.1562 46.3333 26.1328 45.9531 26.0859C45.5729 26.0391 45.2135 25.9714 44.875 25.8828C44.5417 25.7891 44.237 25.6771 43.9609 25.5469V23.7812C44.4245 23.9844 44.9427 24.1693 45.5156 24.3359C46.0885 24.4974 46.6719 24.5781 47.2656 24.5781C47.75 24.5781 48.151 24.5156 48.4688 24.3906C48.7917 24.2604 49.0312 24.0781 49.1875 23.8438C49.3438 23.6042 49.4219 23.3255 49.4219 23.0078C49.4219 22.6693 49.3307 22.3828 49.1484 22.1484C48.9661 21.9141 48.6901 21.7005 48.3203 21.5078C47.9557 21.3099 47.4974 21.099 46.9453 20.875C46.5703 20.724 46.2109 20.5521 45.8672 20.3594C45.5286 20.1667 45.2266 19.9401 44.9609 19.6797C44.6953 19.4193 44.4844 19.112 44.3281 18.7578C44.1771 18.3984 44.1016 17.9766 44.1016 17.4922C44.1016 16.8464 44.2552 16.2943 44.5625 15.8359C44.875 15.3776 45.3125 15.026 45.875 14.7812C46.4427 14.5365 47.1042 14.4141 47.8594 14.4141C48.4583 14.4141 49.0208 14.4766 49.5469 14.6016C50.0781 14.7266 50.599 14.9036 51.1094 15.1328L50.5156 16.6406C50.0469 16.4479 49.5911 16.2943 49.1484 16.1797C48.7109 16.0651 48.263 16.0078 47.8047 16.0078C47.4089 16.0078 47.0729 16.0677 46.7969 16.1875C46.5208 16.3073 46.3099 16.4766 46.1641 16.6953C46.0234 16.9089 45.9531 17.1641 45.9531 17.4609C45.9531 17.7943 46.0339 18.0755 46.1953 18.3047C46.362 18.5286 46.6172 18.7344 46.9609 18.9219C47.3099 19.1094 47.7578 19.3177 48.3047 19.5469C48.9349 19.8073 49.4688 20.0807 49.9062 20.3672C50.349 20.6536 50.6875 20.9974 50.9219 21.3984C51.1562 21.7943 51.2734 22.2917 51.2734 22.8906ZM56.5078 24.6719C56.7474 24.6719 56.9844 24.651 57.2188 24.6094C57.4531 24.5625 57.6667 24.5078 57.8594 24.4453V25.8359C57.6562 25.9245 57.3932 26 57.0703 26.0625C56.7474 26.125 56.4115 26.1562 56.0625 26.1562C55.5729 26.1562 55.1328 26.0755 54.7422 25.9141C54.3516 25.7474 54.0417 25.4635 53.8125 25.0625C53.5833 24.6615 53.4688 24.1068 53.4688 23.3984V18.75H52.2891V17.9297L53.5547 17.2812L54.1562 15.4297H55.3125V17.3516H57.7891V18.75H55.3125V23.375C55.3125 23.8125 55.4219 24.138 55.6406 24.3516C55.8594 24.5651 56.1484 24.6719 56.5078 24.6719ZM63.0078 17.1875C64.1016 17.1875 64.9271 17.4297 65.4844 17.9141C66.0469 18.3984 66.3281 19.1536 66.3281 20.1797V26H65.0234L64.6719 24.7734H64.6094C64.3646 25.0859 64.112 25.3438 63.8516 25.5469C63.5911 25.75 63.2891 25.901 62.9453 26C62.6068 26.1042 62.1927 26.1562 61.7031 26.1562C61.1875 26.1562 60.7266 26.0625 60.3203 25.875C59.9141 25.6823 59.5938 25.3906 59.3594 25C59.125 24.6094 59.0078 24.1146 59.0078 23.5156C59.0078 22.625 59.3385 21.9557 60 21.5078C60.6667 21.0599 61.6719 20.8125 63.0156 20.7656L64.5156 20.7109V20.2578C64.5156 19.6589 64.375 19.2318 64.0938 18.9766C63.8177 18.7214 63.4271 18.5938 62.9219 18.5938C62.4896 18.5938 62.0703 18.6562 61.6641 18.7812C61.2578 18.9062 60.862 19.0599 60.4766 19.2422L59.8828 17.9453C60.3047 17.7214 60.7839 17.5391 61.3203 17.3984C61.862 17.2578 62.4245 17.1875 63.0078 17.1875ZM64.5078 21.8672L63.3906 21.9062C62.474 21.9375 61.8307 22.0938 61.4609 22.375C61.0911 22.6562 60.9062 23.0417 60.9062 23.5312C60.9062 23.9583 61.0339 24.2708 61.2891 24.4688C61.5443 24.6615 61.8802 24.7578 62.2969 24.7578C62.9323 24.7578 63.4583 24.5781 63.875 24.2188C64.2969 23.8542 64.5078 23.3203 64.5078 22.6172V21.8672ZM73.2812 17.1875C73.4271 17.1875 73.5859 17.1953 73.7578 17.2109C73.9297 17.2266 74.0781 17.2474 74.2031 17.2734L74.0312 18.9922C73.9219 18.9609 73.7865 18.9375 73.625 18.9219C73.4688 18.9062 73.3281 18.8984 73.2031 18.8984C72.875 18.8984 72.5625 18.9531 72.2656 19.0625C71.9688 19.1667 71.7057 19.3281 71.4766 19.5469C71.2474 19.7604 71.0677 20.0286 70.9375 20.3516C70.8073 20.6745 70.7422 21.0495 70.7422 21.4766V26H68.8984V17.3516H70.3359L70.5859 18.875H70.6719C70.8438 18.5677 71.0573 18.2865 71.3125 18.0312C71.5677 17.776 71.8594 17.5729 72.1875 17.4219C72.5208 17.2656 72.8854 17.1875 73.2812 17.1875ZM79.0234 24.6719C79.263 24.6719 79.5 24.651 79.7344 24.6094C79.9688 24.5625 80.1823 24.5078 80.375 24.4453V25.8359C80.1719 25.9245 79.9089 26 79.5859 26.0625C79.263 26.125 78.9271 26.1562 78.5781 26.1562C78.0885 26.1562 77.6484 26.0755 77.2578 25.9141C76.8672 25.7474 76.5573 25.4635 76.3281 25.0625C76.099 24.6615 75.9844 24.1068 75.9844 23.3984V18.75H74.8047V17.9297L76.0703 17.2812L76.6719 15.4297H77.8281V17.3516H80.3047V18.75H77.8281V23.375C77.8281 23.8125 77.9375 24.138 78.1562 24.3516C78.375 24.5651 78.6641 24.6719 79.0234 24.6719Z"
                              fill="white"
                            />
                            <path
                              d="M36.875 20.0004C36.8755 20.1913 36.8265 20.3792 36.7329 20.5457C36.6392 20.7121 36.5041 20.8515 36.3406 20.9503L26.21 27.1476C26.0392 27.2522 25.8436 27.3093 25.6433 27.313C25.4431 27.3167 25.2455 27.2669 25.0709 27.1687C24.898 27.072 24.754 26.9311 24.6537 26.7603C24.5533 26.5895 24.5003 26.3951 24.5 26.197V13.8037C24.5003 13.6056 24.5533 13.4112 24.6537 13.2404C24.754 13.0696 24.898 12.9287 25.0709 12.832C25.2455 12.7338 25.4431 12.684 25.6433 12.6877C25.8436 12.6914 26.0392 12.7485 26.21 12.8531L36.3406 19.0504C36.5041 19.1492 36.6392 19.2886 36.7329 19.455C36.8265 19.6215 36.8755 19.8094 36.875 20.0004Z"
                              fill="white"
                            />
                          </svg>
                        </span>
                      </>
                    )}
                    <span onClick={handleResetTimer} className="cursor-pointer">
                      <svg
                        width="100"
                        height="40"
                        viewBox="0 0 100 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="1"
                          y="1"
                          width="98"
                          height="38"
                          rx="7"
                          fill="white"
                        />
                        <rect
                          x="1"
                          y="1"
                          width="98"
                          height="38"
                          rx="7"
                          stroke="#0063F7"
                          strokeWidth="2"
                        />
                        <path
                          d="M33.8203 14.5781C34.8047 14.5781 35.6172 14.6979 36.2578 14.9375C36.9036 15.1771 37.3828 15.5417 37.6953 16.0312C38.013 16.5208 38.1719 17.1432 38.1719 17.8984C38.1719 18.4609 38.0677 18.9401 37.8594 19.3359C37.651 19.7318 37.3776 20.0599 37.0391 20.3203C36.7005 20.5807 36.3385 20.7891 35.9531 20.9453L39.1953 26H37.0781L34.3203 21.4219H32.4844V26H30.6094V14.5781H33.8203ZM33.6953 16.1406H32.4844V19.875H33.7812C34.651 19.875 35.2812 19.7135 35.6719 19.3906C36.0677 19.0677 36.2656 18.5911 36.2656 17.9609C36.2656 17.2995 36.0547 16.8307 35.6328 16.5547C35.2161 16.2786 34.5703 16.1406 33.6953 16.1406ZM44.0859 17.1875C44.8568 17.1875 45.5182 17.3464 46.0703 17.6641C46.6224 17.9818 47.0469 18.4323 47.3438 19.0156C47.6406 19.599 47.7891 20.2969 47.7891 21.1094V22.0938H42.0156C42.0365 22.9323 42.2604 23.5781 42.6875 24.0312C43.1198 24.4844 43.724 24.7109 44.5 24.7109C45.0521 24.7109 45.5469 24.6589 45.9844 24.5547C46.4271 24.4453 46.8828 24.2865 47.3516 24.0781V25.5703C46.9193 25.7734 46.4792 25.9219 46.0312 26.0156C45.5833 26.1094 45.0469 26.1562 44.4219 26.1562C43.5729 26.1562 42.8255 25.9922 42.1797 25.6641C41.5391 25.3307 41.0365 24.8359 40.6719 24.1797C40.3125 23.5234 40.1328 22.7083 40.1328 21.7344C40.1328 20.7656 40.2969 19.9427 40.625 19.2656C40.9531 18.5885 41.4141 18.0729 42.0078 17.7188C42.6016 17.3646 43.2943 17.1875 44.0859 17.1875ZM44.0859 18.5703C43.5078 18.5703 43.0391 18.7578 42.6797 19.1328C42.3255 19.5078 42.1172 20.0573 42.0547 20.7812H45.9922C45.987 20.349 45.9141 19.9661 45.7734 19.6328C45.638 19.2995 45.4297 19.0391 45.1484 18.8516C44.8724 18.6641 44.5182 18.5703 44.0859 18.5703ZM55.6719 23.5312C55.6719 24.099 55.5339 24.5781 55.2578 24.9688C54.9818 25.3594 54.5781 25.6562 54.0469 25.8594C53.5208 26.0573 52.875 26.1562 52.1094 26.1562C51.5052 26.1562 50.9844 26.112 50.5469 26.0234C50.1146 25.9401 49.7057 25.8099 49.3203 25.6328V24.0469C49.7318 24.2396 50.1927 24.4062 50.7031 24.5469C51.2188 24.6875 51.7057 24.7578 52.1641 24.7578C52.7682 24.7578 53.2031 24.6641 53.4688 24.4766C53.7344 24.2839 53.8672 24.0286 53.8672 23.7109C53.8672 23.5234 53.8125 23.3568 53.7031 23.2109C53.599 23.0599 53.401 22.9062 53.1094 22.75C52.8229 22.5885 52.401 22.3958 51.8438 22.1719C51.2969 21.9531 50.8359 21.7344 50.4609 21.5156C50.0859 21.2969 49.8021 21.0339 49.6094 20.7266C49.4167 20.4141 49.3203 20.0156 49.3203 19.5312C49.3203 18.7656 49.6224 18.1849 50.2266 17.7891C50.8359 17.388 51.6406 17.1875 52.6406 17.1875C53.1719 17.1875 53.6719 17.2422 54.1406 17.3516C54.6146 17.4557 55.0781 17.6094 55.5312 17.8125L54.9531 19.1953C54.5625 19.0234 54.1693 18.8828 53.7734 18.7734C53.3828 18.6589 52.9844 18.6016 52.5781 18.6016C52.1042 18.6016 51.7422 18.6745 51.4922 18.8203C51.2474 18.9661 51.125 19.1745 51.125 19.4453C51.125 19.6484 51.1849 19.8203 51.3047 19.9609C51.4245 20.1016 51.6302 20.2422 51.9219 20.3828C52.2188 20.5234 52.6302 20.6979 53.1562 20.9062C53.6719 21.1042 54.1172 21.3125 54.4922 21.5312C54.8724 21.7448 55.1641 22.0078 55.3672 22.3203C55.5703 22.6328 55.6719 23.0365 55.6719 23.5312ZM61.1016 17.1875C61.8724 17.1875 62.5339 17.3464 63.0859 17.6641C63.638 17.9818 64.0625 18.4323 64.3594 19.0156C64.6562 19.599 64.8047 20.2969 64.8047 21.1094V22.0938H59.0312C59.0521 22.9323 59.276 23.5781 59.7031 24.0312C60.1354 24.4844 60.7396 24.7109 61.5156 24.7109C62.0677 24.7109 62.5625 24.6589 63 24.5547C63.4427 24.4453 63.8984 24.2865 64.3672 24.0781V25.5703C63.9349 25.7734 63.4948 25.9219 63.0469 26.0156C62.599 26.1094 62.0625 26.1562 61.4375 26.1562C60.5885 26.1562 59.8411 25.9922 59.1953 25.6641C58.5547 25.3307 58.0521 24.8359 57.6875 24.1797C57.3281 23.5234 57.1484 22.7083 57.1484 21.7344C57.1484 20.7656 57.3125 19.9427 57.6406 19.2656C57.9688 18.5885 58.4297 18.0729 59.0234 17.7188C59.6172 17.3646 60.3099 17.1875 61.1016 17.1875ZM61.1016 18.5703C60.5234 18.5703 60.0547 18.7578 59.6953 19.1328C59.3411 19.5078 59.1328 20.0573 59.0703 20.7812H63.0078C63.0026 20.349 62.9297 19.9661 62.7891 19.6328C62.6536 19.2995 62.4453 19.0391 62.1641 18.8516C61.888 18.6641 61.5339 18.5703 61.1016 18.5703ZM70.0938 24.6719C70.3333 24.6719 70.5703 24.651 70.8047 24.6094C71.0391 24.5625 71.2526 24.5078 71.4453 24.4453V25.8359C71.2422 25.9245 70.9792 26 70.6562 26.0625C70.3333 26.125 69.9974 26.1562 69.6484 26.1562C69.1589 26.1562 68.7188 26.0755 68.3281 25.9141C67.9375 25.7474 67.6276 25.4635 67.3984 25.0625C67.1693 24.6615 67.0547 24.1068 67.0547 23.3984V18.75H65.875V17.9297L67.1406 17.2812L67.7422 15.4297H68.8984V17.3516H71.375V18.75H68.8984V23.375C68.8984 23.8125 69.0078 24.138 69.2266 24.3516C69.4453 24.5651 69.7344 24.6719 70.0938 24.6719Z"
                          fill="#0063F7"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
                <h2 className="mb-4 mt-8 text-lg font-semibold">Details</h2>
                <div className="8 relative overflow-visible">
                  <CustomSearchSelect
                    label="Assigned Project"
                    isRequired={true}
                    data={(projects ?? []).flatMap((pro) => {
                      return [
                        {
                          label: pro.name ?? '',
                          value: pro._id,
                        },
                      ];
                    })}
                    showImage={false}
                    selected={organizationForm.values.selectedProject ?? []}
                    onSelect={(values) => {
                      const projectIds = Array.isArray(values)
                        ? values
                        : [values];
                      setSeelctedProjects(
                        projectIds.map((v) => ({ label: '', value: v }))
                      );
                      organizationForm.setFieldValue(
                        'selectedProject',
                        projectIds
                      );
                      organizationForm.setFieldTouched('selectedProject', true);
                    }}
                    hasError={
                      !!organizationForm.errors.selectedProject &&
                      (organizationForm.touched.selectedProject ||
                        organizationForm.submitCount > 0)
                    }
                    isOpen={openDropdown === 'dropdown1'}
                    onToggle={() => handleToggle('dropdown1')}
                  />
                </div>
                <div className="relative mb-8">
                  <CustomSearchSelect
                    label="Assigned Customer"
                    data={[
                      { label: 'My Organization', value: 'My Organization' },
                      ...(users ?? [])
                        .filter((c) => c.role == 4)
                        .flatMap((user) => {
                          return [
                            {
                              label: `${user.customerName} - ${user.userId}`,
                              value: `${user.customerName}`,
                              photo: user.photo,
                            },
                          ];
                        }),
                    ]}
                    selected={
                      organizationForm.values.customer
                        ? [organizationForm.values.customer]
                        : []
                    }
                    isRequired={true}
                    onSelect={(values) => {
                      const customerValue = Array.isArray(values)
                        ? (values[0] ?? '')
                        : (values ?? '');
                      organizationForm.setFieldValue('customer', customerValue);
                      organizationForm.setFieldTouched('customer', true);
                    }}
                    returnSingleValueWithLabel={true}
                    showImage={true}
                    multiple={false}
                    hasError={
                      !!organizationForm.errors.customer &&
                      (organizationForm.touched.customer ||
                        organizationForm.submitCount > 0)
                    }
                    isOpen={openDropdown === 'dropdown2'}
                    onToggle={() => handleToggle('dropdown2')}
                  />
                </div>
                <label className="mb-2 block" htmlFor={`description`}>
                  Reference
                  <span className="text-[14px] text-[#616161]">
                    {' (Optional)'}
                  </span>
                </label>
                <SimpleInput
                  type="text"
                  //   label="Reference (Optional)"
                  placeholder="Enter a reference here"
                  name="reference"
                  className="w-full"
                  errorMessage={organizationForm.errors.reference}
                  value={organizationForm.values.reference}
                  isTouched={organizationForm.touched.reference}
                  onChange={organizationForm.handleChange}
                />
                <div className="">
                  <label className="mb-2 block" htmlFor={`description`}>
                    Activity Description
                    <span className="text-[14px] text-[#616161]">
                      {' (Optional)'}
                    </span>
                  </label>
                  <textarea
                    rows={5}
                    id={`description`}
                    name="description"
                    value={organizationForm.values.description}
                    onChange={organizationForm.handleChange}
                    onBlur={organizationForm.handleBlur}
                    placeholder="Describe activities and outcomes taking place"
                    className={`${
                      organizationForm.errors.description &&
                      organizationForm.touched.description
                        ? 'border-red-500'
                        : 'border-[#EEEEEE]'
                    } w-full resize-none rounded-xl border-2 border-gray-300 p-2 shadow-sm`}
                  />
                </div>
              </div>
  );

  return (
    <CustomModal
      isOpen={true}
      header={modalHeader}
      body={modalBody}
      handleCancel={handleClose}
      handleSubmit={() => organizationForm.submitForm()}
      submitValue={timesheet ? 'Update' : 'Create'}
      submitDisabled={createMutation.isLoading || updateMutation.isLoading}
      isLoading={createMutation.isLoading || updateMutation.isLoading}
      cancelButton="Cancel"
      size="lg"
    />
  );
};

export default CreateTimeSheetModel;
