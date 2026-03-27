import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import * as Yup from 'yup';
import { SimpleInput } from '@/components/Form/simpleInput';
import { useFormik } from 'formik';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  getAssetList,
  updateServiceSchedule,
  createServiceSchedule,
} from '@/app/(main)/(user-panel)/user/apps/am/api';
import { getAllOrgUsers } from '@/app/(main)/(user-panel)/user/apps/api';
import { GroupService } from '@/app/type/service_group';
import { Search } from '@/components/Form/search';
import Loader from '@/components/DottedLoader/loader';
import CustomDateRangePicker from '@/components/customDatePicker';
import { ServiceSchedule } from '@/app/type/group_service_schedule';
import { SingleAsset } from '@/app/type/single_asset';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { Checkbox, Radio } from '@material-tailwind/react';

export const AddGroupServiceScheduleModel = ({
  model,
  handleClose,
  groupId,
  assets,
}: {
  handleClose: any;
  model: ServiceSchedule | undefined;
  groupId: string;
  assets: SingleAsset[];
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showRepeatFrequencyModal, setShowRepeatFrequencyModal] =
    useState(false);
  const [showCustomRepeatModal, setShowCustomRepeatModal] = useState(false);
  const [repeatFrequency, setRepeatFrequency] = useState<string>(
    model?.repeatFrequency ?? ''
  );
  const [customRepeat, setCustomRepeat] = useState({
    repeatEvery: model?.customRepeat?.repeatEvery ?? 1,
    repeatUnit: model?.customRepeat?.repeatUnit ?? 'Day', // Day, Week, Month, Year
    selectedDays: (model?.customRepeat?.selectedDays as string[]) ?? [], // For Week
    monthOption: model?.customRepeat?.monthOption ?? 'day', // "day" or "weekday"
    dayOfMonth: model?.customRepeat?.dayOfMonth ?? 1, // For Month - day option
    weekPosition: model?.customRepeat?.weekPosition ?? 'First', // First, Second, Third, Fourth, Last
    weekday: model?.customRepeat?.weekday ?? 'Monday', // For Month - weekday option
  });

  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  // createSeriveSchedule
  const createSeriveSchedule = useMutation(createServiceSchedule, {
    onSuccess: () => {
      handleClose();
      queryClient.invalidateQueries('serviceSchedule');
    },
  });

  ///updateSeriveSchedule
  const updateSeriveSchedule = useMutation(updateServiceSchedule, {
    onSuccess: () => {
      handleClose();
      queryClient.invalidateQueries('serviceSchedule');
    },
  });

  const appFormValidatorSchema = Yup.object().shape({
    // Email validation
    name: Yup.string().required('title is required'),
    description: Yup.string().required('description is required'),
    serviceDate: Yup.string().required('serviceDate is required'),
    assets: Yup.array()
      .min(1, 'Please select at least one asset')
      .required('Please select at least one asset'),
  });
  const organizationForm = useFormik({
    initialValues: {
      name: model?.name ?? '',
      description: model?.description ?? '',
      serviceDate: model?.serviceDate ?? null,
      assets: model?.assets ?? [],
      repeat: model?.repeat ?? 'No',
      repeatFrequency: model?.repeatFrequency ?? '',
      customRepeat: model?.customRepeat ?? null,
    },
    validationSchema: appFormValidatorSchema,
    onSubmit: (values) => {
      const submitData = {
        name: values.name,
        description: values.description,
        serviceDate: values.serviceDate,
        assets: values.assets,
        repeat: values.repeat,
        repeatFrequency: repeatFrequency || values.repeatFrequency || '',
        customRepeat:
          repeatFrequency === 'Custom' && customRepeat.repeatEvery > 0
            ? customRepeat
            : null,
      };
      if (model) {
        updateSeriveSchedule.mutate({
          axiosAuth,
          id: model._id,
          data: submitData,
        });
      } else {
        createSeriveSchedule.mutate({
          axiosAuth,
          data: { ...submitData, groupId },
        });
      }
    },
  });

  return (
    <Modal isOpen={true} onOpenChange={handleClose} placement="auto" size="lg">
      <ModalContent className="max-w-[600px] rounded-3xl bg-white">
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-row items-start gap-2 px-5 py-4">
              <div className="flex w-full flex-row items-start gap-4 py-2">
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                  <g clipPath="url(#clip0_4088_16397)">
                    <path
                      d="M29.6875 38.125C28.2041 38.125 26.7541 37.6851 25.5207 36.861C24.2874 36.0369 23.3261 34.8656 22.7584 33.4951C22.1907 32.1247 22.0422 30.6167 22.3316 29.1618C22.621 27.707 23.3353 26.3706 24.3842 25.3217C25.4331 24.2728 26.7695 23.5585 28.2243 23.2691C29.6792 22.9797 31.1872 23.1282 32.5576 23.6959C33.9281 24.2636 35.0994 25.2249 35.9235 26.4582C36.7476 27.6916 37.1875 29.1416 37.1875 30.625C37.1875 32.6141 36.3973 34.5218 34.9908 35.9283C33.5843 37.3348 31.6766 38.125 29.6875 38.125ZM29.6875 25C28.575 25 27.4874 25.3299 26.5624 25.948C25.6374 26.5661 24.9164 27.4446 24.4907 28.4724C24.0649 29.5002 23.9535 30.6312 24.1706 31.7224C24.3876 32.8135 24.9234 33.8158 25.71 34.6025C26.4967 35.3892 27.499 35.9249 28.5901 36.1419C29.6813 36.359 30.8123 36.2476 31.8401 35.8218C32.8679 35.3961 33.7464 34.6751 34.3645 33.7501C34.9826 32.8251 35.3125 31.7375 35.3125 30.625C35.3125 29.1332 34.7199 27.7024 33.665 26.6475C32.6101 25.5926 31.1793 25 29.6875 25Z"
                      fill="#0063F7"
                    />
                    <path
                      d="M31.1781 33.4375L28.75 31.0094V26.875H30.625V30.2406L32.5 32.1156L31.1781 33.4375Z"
                      fill="#0063F7"
                    />
                    <path
                      d="M36.25 15.625C36.25 15.1277 36.0525 14.6508 35.7008 14.2992C35.3492 13.9475 34.8723 13.75 34.375 13.75H30.625V11.875H28.75V13.75H21.25V11.875H19.375V13.75H15.625C15.1277 13.75 14.6508 13.9475 14.2992 14.2992C13.9475 14.6508 13.75 15.1277 13.75 15.625V34.375C13.75 34.8723 13.9475 35.3492 14.2992 35.7008C14.6508 36.0525 15.1277 36.25 15.625 36.25H19.375V34.375H15.625V15.625H19.375V17.5H21.25V15.625H28.75V17.5H30.625V15.625H34.375V21.25H36.25V15.625Z"
                      fill="#0063F7"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_4088_16397">
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
                  <h1>{'Add Service Schedule'}</h1>

                  <span className="text-base font-normal text-[#616161]">
                    {'Enter service schedule details below.'}
                  </span>
                </div>
                <div></div>
              </div>
            </ModalHeader>
            <ModalBody className="">
              <div className={`max-h-[480px] w-full`}>
                <div className="flex h-[480px] w-full flex-col overflow-y-scroll scrollbar-hide">
                  <div className="mb-2">
                    {/* Input for Category Name */}
                    <SimpleInput
                      type="text"
                      label="Service Schedule Name"
                      placeholder="Enter Name"
                      name="name"
                      value={organizationForm.values.name}
                      isTouched={organizationForm.touched.name}
                      errorMessage={organizationForm.errors.name}
                      required={true}
                      className="w-full"
                      onChange={organizationForm.handleChange}
                    />
                    <div className="pt-5">
                      <label className="mb-2 block" htmlFor="reasone">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        id="description"
                        name="description"
                        placeholder="Enter the description"
                        value={organizationForm.values.description}
                        className={` ${
                          organizationForm.errors.description &&
                          organizationForm.touched.description
                            ? 'border-red-500'
                            : 'border-[#EEEEEE]'
                        } w-full resize-none rounded-xl border-2 border-gray-300 p-2 shadow-sm`}
                        onChange={organizationForm.handleChange}
                      />
                      {organizationForm.errors.description &&
                        organizationForm.touched.description && (
                          <span className="text-xs text-red-500">
                            {organizationForm.errors.description}
                          </span>
                        )}
                    </div>
                    <div className="relative mb-4 w-full">
                      <CustomSearchSelect
                        label="Select Asset from Service Group"
                        data={[
                          {
                            label: 'All Asset',
                            value: 'all',
                          },
                          ...(assets ?? []).map((child) => ({
                            label: child.name,
                            value: child._id,
                          })),
                        ]}
                        onSelect={(values) => {
                          organizationForm.setFieldValue('assets', values);
                        }}
                        selected={organizationForm.values.assets}
                        hasError={false}
                        multiple={true}
                        showImage={false}
                        isOpen={openDropdown === 'dropdown4'}
                        onToggle={() => handleToggle('dropdown4')}
                      />
                      {organizationForm.errors.assets &&
                        organizationForm.touched.assets && (
                          <span className="text-xs text-red-500">
                            {organizationForm.errors.assets.toString()}
                          </span>
                        )}
                    </div>
                    <div className="relative mb-4 w-full">
                      <CustomDateRangePicker
                        title="Service Date"
                        handleOnConfirm={(date: Date) => {
                          organizationForm.setFieldValue('serviceDate', date);
                        }}
                        selectedDate={organizationForm.values.serviceDate}
                      />
                      {organizationForm.errors.serviceDate &&
                        organizationForm.touched.serviceDate && (
                          <span className="text-xs text-red-500">
                            {organizationForm.errors.serviceDate.toString()}
                          </span>
                        )}
                    </div>
                    <div className="mb-4">
                    <label className="inline-flex items-center px-1">
                      <div className="relative flex items-center justify-center gap-2">
                        <input
                          type="checkbox"
                          name="option"
                            checked={organizationForm.values.repeat === 'Yes'}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                            organizationForm.setFieldValue(
                                'repeat',
                                isChecked ? 'Yes' : 'No'
                              );
                              if (isChecked) {
                                setShowRepeatFrequencyModal(true);
                              } else {
                                setRepeatFrequency('');
                                setCustomRepeat({
                                  repeatEvery: 1,
                                  repeatUnit: 'Day',
                                  selectedDays: [],
                                  monthOption: 'day',
                                  dayOfMonth: 1,
                                  weekPosition: 'First',
                                  weekday: 'Monday',
                                });
                              }
                            }}
                          id="some_id"
                          className="peer h-6 w-6 appearance-none rounded-md border-2 border-[#9E9E9E] bg-white checked:border-[#9E9E9E] checked:bg-white"
                        />
                        <svg
                          className="absolute inset-0 m-auto hidden h-4 w-4 text-[#9E9E9E] peer-checked:block"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>

                      <span className="ml-2">Repeat Schedule</span>
                    </label>

                      {organizationForm.values.repeat === 'Yes' &&
                        repeatFrequency && (
                          <div className="mt-2">
                            <label className="mb-2 block text-sm font-medium">
                              Repeat Frequency
                            </label>
                            <div
                              onClick={() => setShowRepeatFrequencyModal(true)}
                              className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border-2 border-[#EEEEEE] bg-[#ffffff] px-3 py-2 transition-colors hover:bg-[#EEEEEE]"
                            >
                              <span className="text-sm text-[#616161]">
                                {repeatFrequency}
                              </span>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-end gap-2 border-t-2 border-gray-200">
              <Button
                className="border-2 border-[#0063F7] bg-white px-10 font-semibold text-[#0063F7]"
                onPress={onCloseModal}
              >
                Cancel
              </Button>
              <Button
                className="px-10 font-semibold text-white"
                color={`${organizationForm.isValid ? 'primary' : 'default'}`}
                onPress={() => {
                  organizationForm.submitForm();
                }}
              >
                {model ? (
                  <>{updateSeriveSchedule.isLoading ? <Loader /> : <>Save</>}</>
                ) : (
                  <>
                    {createSeriveSchedule.isLoading ? <Loader /> : <>Confirm</>}
                  </>
                )}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>

      {/* Repeat Frequency Selection Modal */}
      {showRepeatFrequencyModal && (
        <Modal
          isOpen={showRepeatFrequencyModal}
          placement="center"
          backdrop="opaque"
          onOpenChange={() => setShowRepeatFrequencyModal(false)}
          scrollBehavior="outside"
        >
          <ModalContent className="max-w-[600px] rounded-3xl bg-white">
            {() => (
              <>
                <ModalHeader className="mt-3 flex flex-col gap-1 text-left text-lg"></ModalHeader>
                <ModalBody className="pb-4">
                  <div className="flex flex-col gap-2">
                    {[
                      'Daily',
                      'Weekdays',
                      'Weekly',
                      'Monthly',
                      'Yearly',
                      'Custom',
                    ].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setRepeatFrequency(option);
                          organizationForm.setFieldValue(
                            'repeatFrequency',
                            option
                          );
                          if (option === 'Custom') {
                            setShowRepeatFrequencyModal(false);
                            setShowCustomRepeatModal(true);
                          } else {
                            setShowRepeatFrequencyModal(false);
                          }
                        }}
                        className="flex items-center justify-between rounded-lg border-2 border-[#EEEEEE] bg-white px-4 py-3 text-left transition-colors hover:bg-[#F5F5F5]"
                      >
                        <span className="text-sm font-medium text-[#1E1E1E]">
                          {option}
                        </span>
                        {repeatFrequency === option && (
                          <svg
                            className="h-5 w-5 text-[#616161]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <div className="flex">
                    <div
                      className="cursor-pointer pr-4 text-sm"
                      onClick={() => {
                        setShowRepeatFrequencyModal(false);
                        if (!repeatFrequency) {
                          organizationForm.setFieldValue('repeat', 'No');
                        }
                      }}
                    >
                      Cancel
                    </div>
                    <div
                      className="cursor-pointer text-sm text-primary-500"
                      onClick={() => {
                        if (repeatFrequency && repeatFrequency !== 'Custom') {
                          setShowRepeatFrequencyModal(false);
                        }
                      }}
                    >
                      Confirm
                    </div>
                  </div>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}

      {/* Custom Repeat Modal */}
      {showCustomRepeatModal && (
        <Modal
          isOpen={showCustomRepeatModal}
          placement="center"
          backdrop="opaque"
          onOpenChange={() => setShowCustomRepeatModal(false)}
          scrollBehavior="outside"
        >
          <ModalContent className="max-w-[600px] rounded-3xl bg-white">
            {() => (
              <>
                <ModalHeader className="mt-3 flex flex-col gap-1 text-left text-lg"></ModalHeader>
                <ModalBody className="pb-4">
                  <div>
                    <div className="py-1 text-lg font-semibold">
                      Custom Repeat
                    </div>
                    <div className="text-sm font-semibold">Repeats every</div>
                  </div>
                  <div className="flex">
                    <div className="w-20">
                      <input
                        name="count"
                        type="number"
                        value={
                          customRepeat.repeatEvery >= 0
                            ? customRepeat.repeatEvery
                            : ''
                        }
                        className="focus:shadow-outline mt-1 h-8 w-20 appearance-none rounded-md border border-gray-400 py-2 pl-2 leading-tight focus:outline-none"
                        onChange={(e) => {
                          const value =
                            parseInt(e.target.value) >= 0
                              ? parseInt(e.target.value)
                              : 0;
                          setCustomRepeat({
                            ...customRepeat,
                            repeatEvery: value,
                          });
                        }}
                      />
                    </div>
                    <div className="flex-1 px-3">
                      <Select
                        labelPlacement="outside"
                        className="max-w-xs rounded-xl border border-gray-300"
                        variant="flat"
                        placeholder="select day"
                        selectorIcon={<SelectorIcon />}
                        classNames={{
                          popoverContent: 'bg-white hover:bg-white',
                        }}
                        selectedKeys={
                          customRepeat.repeatUnit
                            ? [customRepeat.repeatUnit]
                            : undefined
                        }
                        onSelectionChange={(value) => {
                          const selectedValues = Array.from(value);
                          if (selectedValues.length > 0) {
                            setCustomRepeat({
                              ...customRepeat,
                              repeatUnit: selectedValues[0].toString(),
                            });
                          }
                        }}
                      >
                        {['Day', 'Week', 'Month', 'Year'].map(
                          (value: string) => (
                            <SelectItem key={value} value={value}>
                              {value}
                            </SelectItem>
                          )
                        )}
                      </Select>
                    </div>
                  </div>

                  {/* Days of Week (for Week) */}
                  {customRepeat.repeatUnit === 'Week' && (
                    <div className="flex w-max flex-col gap-1">
                      {[
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday',
                        'Friday',
                        'Saturday',
                        'Sunday',
                      ].map((day, index) => (
                        <Checkbox
                          key={day}
                          label={day}
                          crossOrigin={undefined}
                          checked={customRepeat.selectedDays.includes(day)}
                          onChange={(v) => {
                            if (customRepeat.selectedDays.includes(day)) {
                              setCustomRepeat({
                                ...customRepeat,
                                selectedDays: customRepeat.selectedDays.filter(
                                  (d) => d !== day
                                ),
                              });
                            } else {
                              setCustomRepeat({
                                ...customRepeat,
                                selectedDays: [
                                  ...customRepeat.selectedDays,
                                  day,
                                ],
                              });
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Month Options */}
                  {customRepeat.repeatUnit === 'Month' && (
                    <div className="flex flex-col gap-2">
                      <div className="flex">
                        <Radio
                          name="type"
                          checked={customRepeat.monthOption === 'day'}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCustomRepeat({
                                ...customRepeat,
                                monthOption: 'day',
                              });
                            }
                          }}
                          crossOrigin={undefined}
                        />
                        <div className="flex-1 px-3">
                          <Select
                            labelPlacement="outside"
                            className="max-w-xs rounded-xl border border-gray-300"
                            variant="flat"
                            placeholder="Select Day"
                            classNames={{
                              popoverContent: 'bg-white hover:bg-white',
                            }}
                            selectedKeys={
                              customRepeat.dayOfMonth
                                ? [customRepeat.dayOfMonth.toString()]
                                : undefined
                            }
                            selectorIcon={<SelectorIcon />}
                            onSelectionChange={(value) => {
                              const selectedValues = Array.from(value);
                              if (
                                selectedValues.length > 0 &&
                                customRepeat.monthOption === 'day'
                              ) {
                                setCustomRepeat({
                                  ...customRepeat,
                                  dayOfMonth: parseInt(
                                    selectedValues[0].toString()
                                  ),
                                });
                              }
                            }}
                          >
                            {Array.from({ length: 32 }, (_, index) =>
                              (index + 1).toString()
                            ).map((value, index) => (
                              <SelectItem key={value} value={value}>
                                {index < 31 ? `Day ${value}` : 'Last Day'}
                              </SelectItem>
                            ))}
                          </Select>
                        </div>
                      </div>
                      {/* second radio */}
                      <div className="flex">
                        <Radio
                          name="type"
                          checked={customRepeat.monthOption === 'weekday'}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCustomRepeat({
                                ...customRepeat,
                                monthOption: 'weekday',
                              });
                            }
                          }}
                          crossOrigin={undefined}
                        />
                        <div className="flex-1 px-3">
                          <Select
                            labelPlacement="outside"
                            className="max-w-xs rounded-xl border border-gray-300"
                            variant="flat"
                            placeholder="Select week"
                            selectedKeys={
                              customRepeat.weekPosition
                                ? [customRepeat.weekPosition]
                                : undefined
                            }
                            selectorIcon={<SelectorIcon />}
                            classNames={{
                              popoverContent: 'bg-white hover:bg-white',
                            }}
                            onSelectionChange={(value) => {
                              const selectedValues = Array.from(value);
                              if (
                                selectedValues.length > 0 &&
                                customRepeat.monthOption === 'weekday'
                              ) {
                                setCustomRepeat({
                                  ...customRepeat,
                                  weekPosition: selectedValues[0].toString(),
                                });
                              }
                            }}
                          >
                            {['First', 'Second', 'Third', 'Fourth', 'Last'].map(
                              (value) => (
                                <SelectItem key={value} value={value}>
                                  {value}
                                </SelectItem>
                              )
                            )}
                          </Select>
                        </div>
                        <div className="flex-1 px-3">
                          <Select
                            labelPlacement="outside"
                            className="max-w-xs rounded-xl border border-gray-300 hover:bg-white"
                            variant="flat"
                            placeholder="Select Day"
                            selectedKeys={
                              customRepeat.weekday
                                ? [customRepeat.weekday]
                                : undefined
                            }
                            classNames={{
                              popoverContent: 'bg-white hover:bg-white',
                            }}
                            selectorIcon={<SelectorIcon />}
                            onSelectionChange={(value) => {
                              const selectedValues = Array.from(value);
                              if (
                                selectedValues.length > 0 &&
                                customRepeat.monthOption === 'weekday'
                              ) {
                                setCustomRepeat({
                                  ...customRepeat,
                                  weekday: selectedValues[0].toString(),
                                });
                              }
                            }}
                          >
                            {[
                              'Monday',
                              'Tuesday',
                              'Wednesday',
                              'Thursday',
                              'Friday',
                              'Saturday',
                              'Sunday',
                            ].map((value) => (
                              <SelectItem key={value} value={value}>
                                {value}
                              </SelectItem>
                            ))}
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Year Options (similar to Month) */}
                  {customRepeat.repeatUnit === 'Year' && (
                    <div className="flex flex-col gap-2">
                      <div className="flex">
                        <Radio
                          name="type"
                          checked={customRepeat.monthOption === 'day'}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCustomRepeat({
                                ...customRepeat,
                                monthOption: 'day',
                              });
                            }
                          }}
                          crossOrigin={undefined}
                        />
                        <div className="flex-1 px-3">
                          <Select
                            labelPlacement="outside"
                            className="max-w-xs rounded-xl border border-gray-300"
                            variant="flat"
                            placeholder="Select Day"
                            classNames={{
                              popoverContent: 'bg-white hover:bg-white',
                            }}
                            selectedKeys={
                              customRepeat.dayOfMonth
                                ? [customRepeat.dayOfMonth.toString()]
                                : undefined
                            }
                            selectorIcon={<SelectorIcon />}
                            onSelectionChange={(value) => {
                              const selectedValues = Array.from(value);
                              if (
                                selectedValues.length > 0 &&
                                customRepeat.monthOption === 'day'
                              ) {
                                setCustomRepeat({
                                  ...customRepeat,
                                  dayOfMonth: parseInt(
                                    selectedValues[0].toString()
                                  ),
                                });
                              }
                            }}
                          >
                            {Array.from({ length: 32 }, (_, index) =>
                              (index + 1).toString()
                            ).map((value, index) => (
                              <SelectItem key={value} value={value}>
                                {index < 31 ? `Day ${value}` : 'Last Day'}
                              </SelectItem>
                            ))}
                          </Select>
                        </div>
                      </div>
                      {/* second radio */}
                      <div className="flex">
                        <Radio
                          name="type"
                          checked={customRepeat.monthOption === 'weekday'}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCustomRepeat({
                                ...customRepeat,
                                monthOption: 'weekday',
                              });
                            }
                          }}
                          crossOrigin={undefined}
                        />
                        <div className="flex-1 px-3">
                          <Select
                            labelPlacement="outside"
                            className="max-w-xs rounded-xl border border-gray-300"
                            variant="flat"
                            placeholder="Select week"
                            selectedKeys={
                              customRepeat.weekPosition
                                ? [customRepeat.weekPosition]
                                : undefined
                            }
                            selectorIcon={<SelectorIcon />}
                            classNames={{
                              popoverContent: 'bg-white hover:bg-white',
                            }}
                            onSelectionChange={(value) => {
                              const selectedValues = Array.from(value);
                              if (
                                selectedValues.length > 0 &&
                                customRepeat.monthOption === 'weekday'
                              ) {
                                setCustomRepeat({
                                  ...customRepeat,
                                  weekPosition: selectedValues[0].toString(),
                                });
                              }
                            }}
                          >
                            {['First', 'Second', 'Third', 'Fourth', 'Last'].map(
                              (value) => (
                                <SelectItem key={value} value={value}>
                                  {value}
                                </SelectItem>
                              )
                            )}
                          </Select>
                        </div>
                        <div className="flex-1 px-3">
                          <Select
                            labelPlacement="outside"
                            className="max-w-xs rounded-xl border border-gray-300 hover:bg-white"
                            variant="flat"
                            placeholder="Select Day"
                            selectedKeys={
                              customRepeat.weekday
                                ? [customRepeat.weekday]
                                : undefined
                            }
                            classNames={{
                              popoverContent: 'bg-white hover:bg-white',
                            }}
                            selectorIcon={<SelectorIcon />}
                            onSelectionChange={(value) => {
                              const selectedValues = Array.from(value);
                              if (
                                selectedValues.length > 0 &&
                                customRepeat.monthOption === 'weekday'
                              ) {
                                setCustomRepeat({
                                  ...customRepeat,
                                  weekday: selectedValues[0].toString(),
                                });
                              }
                            }}
                          >
                            {[
                              'Monday',
                              'Tuesday',
                              'Wednesday',
                              'Thursday',
                              'Friday',
                              'Saturday',
                              'Sunday',
                            ].map((value) => (
                              <SelectItem key={value} value={value}>
                                {value}
                              </SelectItem>
                            ))}
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <div className="flex">
                    <div
                      className="cursor-pointer pr-4 text-sm"
                      onClick={() => {
                        setShowCustomRepeatModal(false);
                        setShowRepeatFrequencyModal(true);
                      }}
                    >
                      Cancel
                    </div>
                    <div
                      className="cursor-pointer text-sm text-primary-500"
                      onClick={() => {
                        setShowCustomRepeatModal(false);
                        organizationForm.setFieldValue(
                          'repeatFrequency',
                          'Custom'
                        );
                      }}
                    >
                      Confirm
                    </div>
                  </div>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </Modal>
  );
};

function SelectorIcon() {
  return (
    <svg
      width="14"
      height="10"
      viewBox="0 0 14 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.5465 0.00109386L1.29618 0.00109386C1.18227 0.00145149 1.07063 0.0328655 0.973247 0.0919552C0.875869 0.151045 0.796451 0.235572 0.743541 0.336439C0.690631 0.437306 0.666232 0.550694 0.672972 0.664396C0.679711 0.778098 0.717334 0.887809 0.781789 0.981719L6.40695 9.10672C6.64008 9.44359 7.20135 9.44359 7.4351 9.10672L13.0603 0.981719C13.1254 0.888004 13.1636 0.778238 13.1707 0.664347C13.1778 0.550456 13.1535 0.436795 13.1006 0.335714C13.0476 0.234633 12.968 0.149998 12.8703 0.0910044C12.7726 0.0320101 12.6606 0.000914574 12.5465 0.00109386Z"
        fill="#616161"
      />
    </svg>
  );
}
