import { useTaskCotnext } from '@/app/(main)/(user-panel)/user/tasks/context';
import { TASKTYPE } from '@/app/helpers/user/enums';
import { Input } from '@/components/Form/Input';
import { Checkbox, Radio } from '@material-tailwind/react';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
  Select,
  SelectItem,
  ModalFooter,
} from '@nextui-org/react';

export function CustomTaskDaysPicker({
  handleTaskCloseChange,
}: {
  handleTaskCloseChange: () => void;
}) {
  const { state, dispatch } = useTaskCotnext();
  const { onOpenChange } = useDisclosure();

  function convertSelectedType(selectValueOfCustomList: string | undefined) {
    switch (selectValueOfCustomList) {
      case 'Day':
        return 1;
      case 'Week':
        return 2;
      case 'Month':
        return 3;
      case 'Year':
        return 4;
      default:
        break;
    }
  }

  return (
    <>
      <Modal
        isOpen={true}
        placement={'center'}
        backdrop={'opaque'}
        onOpenChange={onOpenChange}
        scrollBehavior={'outside'}
        onClose={handleTaskCloseChange}
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
                      name={'count'}
                      type="number"
                      value={
                        (state.selectedCountOfRepeat ?? 0 >= 0)
                          ? state.selectedCountOfRepeat
                          : ''
                      }
                      className={
                        'focus:shadow-outline mt-1 h-8 w-20 appearance-none rounded-md border border-gray-400 py-2 pl-2 leading-tight focus:outline-none'
                      }
                      onChange={(e) => {
                        const value =
                          parseInt(e.target.value) >= 0
                            ? parseInt(e.target.value)
                            : 0;
                        dispatch({
                          type: TASKTYPE.SET_COUNT,
                          selectedCountOfRepeat: value,
                        });
                      }}
                    />
                  </div>{' '}
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
                        state.selectValueOfCustomList
                          ? [state.selectValueOfCustomList]
                          : undefined
                      }
                      onSelectionChange={(value) => {
                        // Convert the Set to an array
                        const selectedValues = Array.from(value);

                        // Now you can access the selected values
                        dispatch({
                          type: TASKTYPE.SELECTED_DAY,
                          selectValueOfCustomList: selectedValues[0].toString(),
                        });
                      }}
                    >
                      {['Day', 'Week', 'Month', 'Year'].map((value: string) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* further body parts  */}
                {state.selectValueOfCustomList === 'Week' && (
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
                        checked={(state.selectDaysForWeek ?? []).includes(
                          index + 1
                        )}
                        onChange={(v) => {
                          if (state.selectDaysForWeek?.includes(index + 1)) {
                            dispatch({
                              type: TASKTYPE.DESELECT_WEEK_DAY,
                              selectDaysForWeek: index + 1,
                            });
                          } else {
                            dispatch({
                              type: TASKTYPE.SELECT_WEEK_DAY,
                              selectDaysForWeek: index + 1,
                            });
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
                {state.selectValueOfCustomList === 'Month' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex">
                      <Radio
                        name="type"
                        checked={state.monthType === 'Day'}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // Handle the change when the radio button is selected
                            dispatch({
                              type: TASKTYPE.SELECT_MONTH_TYPE,
                              monthType: 'Day',
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
                            state.dayNumOfMonth
                              ? [state.dayNumOfMonth.toString()]
                              : undefined
                          }
                          selectorIcon={<SelectorIcon />}
                          onSelectionChange={(value) => {
                            // Convert the Set to an array
                            const selectedValues = Array.from(value);

                            // Now you can access the selected values
                            if (
                              selectedValues.length > 0 &&
                              state.monthType === 'Day'
                            ) {
                              dispatch({
                                type: TASKTYPE.SELECT_MONTH_DAY,
                                dayNumOfMonth: parseInt(
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
                    {/* second radio  */}

                    <div className="flex">
                      <Radio
                        name="type"
                        checked={state.monthType === 'Week'}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // Handle the change when the radio button is selected
                            dispatch({
                              type: TASKTYPE.SELECT_MONTH_TYPE,
                              monthType: 'Week',
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
                            state.weekNumOfMonth
                              ? [
                                  `${convertToMonthWeek(
                                    state.weekNumOfMonth ?? 0
                                  )}`,
                                ]
                              : undefined
                          }
                          selectorIcon={<SelectorIcon />}
                          classNames={{
                            popoverContent: 'bg-white hover:bg-white',
                          }}
                          onSelectionChange={(value) => {
                            // Convert the Set to an array
                            const selectedValues = Array.from(value);

                            // Now you can access the selected values
                            if (
                              selectedValues.length > 0 &&
                              state.monthType === 'Week'
                            ) {
                              switch (selectedValues[0]) {
                                case 'First':
                                  return dispatch({
                                    type: TASKTYPE.SELECT_MONTH_WEEK,
                                    weekNumOfMonth: 1,
                                  });
                                case 'Second':
                                  return dispatch({
                                    type: TASKTYPE.SELECT_MONTH_WEEK,
                                    weekNumOfMonth: 2,
                                  });
                                case 'Third':
                                  return dispatch({
                                    type: TASKTYPE.SELECT_MONTH_WEEK,
                                    weekNumOfMonth: 3,
                                  });
                                case 'Fourth':
                                  return dispatch({
                                    type: TASKTYPE.SELECT_MONTH_WEEK,
                                    weekNumOfMonth: 4,
                                  });
                                case 'Last':
                                  return dispatch({
                                    type: TASKTYPE.SELECT_MONTH_WEEK,
                                    weekNumOfMonth: 5,
                                  });
                                default:
                                  break;
                              }
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
                            state.weekNumOfMonth
                              ? [
                                  `${convertToMonthWeekDays(
                                    state.DayNumOfWeekOfMonth ?? 0
                                  )}`,
                                ]
                              : undefined
                          }
                          classNames={{
                            popoverContent: 'bg-white hover:bg-white',
                          }}
                          selectorIcon={<SelectorIcon />}
                          onSelectionChange={(value) => {
                            // Convert the Set to an array
                            const selectedValues = Array.from(value);

                            // Now you can access the selected values
                            if (
                              selectedValues.length > 0 &&
                              state.monthType === 'Week'
                            ) {
                              switch (selectedValues[0]) {
                                case 'Monday':
                                  dispatch({
                                    type: TASKTYPE.SELECT_MONTH_WEEK_DAY,
                                    DayNumOfWeekOfMonth: 1,
                                  });
                                  break;
                                case 'Tuesday':
                                  dispatch({
                                    type: TASKTYPE.SELECT_MONTH_WEEK_DAY,
                                    DayNumOfWeekOfMonth: 2,
                                  });
                                  break;
                                case 'Wednesday':
                                  dispatch({
                                    type: TASKTYPE.SELECT_MONTH_WEEK_DAY,
                                    DayNumOfWeekOfMonth: 3,
                                  });
                                  break;
                                case 'Thursday':
                                  dispatch({
                                    type: TASKTYPE.SELECT_MONTH_WEEK_DAY,
                                    DayNumOfWeekOfMonth: 4,
                                  });
                                  break;
                                case 'Friday':
                                  dispatch({
                                    type: TASKTYPE.SELECT_MONTH_WEEK_DAY,
                                    DayNumOfWeekOfMonth: 5,
                                  });
                                  break;
                                case 'Saturday':
                                  dispatch({
                                    type: TASKTYPE.SELECT_MONTH_WEEK_DAY,
                                    DayNumOfWeekOfMonth: 6,
                                  });
                                  break;
                                case 'Sunday':
                                  dispatch({
                                    type: TASKTYPE.SELECT_MONTH_WEEK_DAY,
                                    DayNumOfWeekOfMonth: 7,
                                  });
                                  break;
                                default:
                                  break;
                              }
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
                    onClick={handleTaskCloseChange}
                  >
                    Cancel
                  </div>
                  <div
                    className="cursor-pointer text-sm text-primary-500"
                    onClick={handleTaskCloseChange}
                  >
                    Confirm
                  </div>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

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

function convertToMonthWeek(value: number) {
  switch (value) {
    case 1:
      return 'First';
    case 2:
      return 'Second';
    case 3:
      return 'Third';
    case 4:
      return 'Fourth';
    case 5:
      return 'Last';

    default:
      break;
  }
}

function convertToMonthWeekDays(value: number) {
  switch (value) {
    case 1:
      return 'Monday';
    case 2:
      return 'Tuesday';
    case 3:
      return 'Wednesday';
    case 4:
      return 'Thursday';
    case 5:
      return 'Friday';
    case 6:
      return 'Saturday';
    case 7:
      return 'Sunday';
    default:
      break;
  }
}
