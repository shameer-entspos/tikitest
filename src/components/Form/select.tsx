import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import Select, { SingleValue } from 'react-select';
import { SelectHTMLAttributes, useId } from 'react';
import { HexColorPicker } from 'react-colorful';
import DatePicker from 'react-datepicker';
import TimezoneSelect from 'react-timezone-select';
import { GetColorName } from 'hex-color-to-color-name';
import { CustomTaskDaysPicker } from '../Tasks/NewTaskModel/customPicker';
import { components } from 'react-select';

const defaultOptions = [{ value: '', label: '' }];
interface OptionType {
  value: string;
  label: string;
}
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  errorMessage?: string;
  selectedOption?: string;
  labelCenter?: boolean;
  labelBold?: boolean;
  name?: string;
  inputTextCenter?: boolean;
  isValid?: boolean | null;
  showColorFromTeam?: boolean;
  variant?:
    | 'simpleSlect'
    | 'simpleSlectColor'
    | 'primary'
    | 'timeZone'
    | 'datePicker'
    | 'taskDatePicker'
    | 'taskCustomdatePicker';
  className?: string;
  options?: { value: string; label: string }[];
  handleSelectedOption?: Function | undefined;
  onChange?: (newValue: SingleValue<OptionType>) => void;
};

function SelectOption({
  label,
  errorMessage,
  selectedOption,
  labelBold = true,
  labelCenter = false,
  isValid = null,
  inputTextCenter = false,
  variant = 'primary',
  name,
  showColorFromTeam = false,
  handleSelectedOption,
  options,
  onChange,
  ...props
}: SelectProps) {
  /* styles.css */

  const [color, setColor] = useState<string>('#4F46E5');
  const [savedColors, setSavedColors] = useState<string[]>([
    '#EB8357',
    '#57C7EB',
    '#EB5772',
    '#57EBB6',
    '#C555ED',
    '#1612B7',
    '#426CD7',
    '#4F9344',
    '#57EBE2',
    '#8C3C36',
    '#98EB57',
    '#AD96EC',
    '#CF7188',
    '#D213BF',
    '#EC96CA',
    '#F21010',
    '#F3DF23',
    '#FF7A00',
  ]);

  const addColorToSaved = () => {
    if (!savedColors.includes(color)) {
      setSavedColors((prev) => [...prev, color]);
    }
  };
  const handleChange = (event: SingleValue<OptionType>) => {
    setSelectedTimezone(event?.value!);

    if (onChange) {
      onChange(event);
    }
  };

  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [isCustomOpen, setCustomOpen] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState(selectedOption);
  const handleColorSelect = useCallback(
    (color: string) => {
      setSelectedColor(() => {
        return color;
      });
      setIsOpen(false);
      if (handleSelectedOption) {
        handleSelectedOption(color);
      }
      setCustomOpen(!isCustomOpen);
    },
    [handleSelectedOption, isCustomOpen]
  );

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  const handleColorPickerToggle = () => {
    setCustomOpen(!isCustomOpen);
  };
  /////
  const [selectedOptions, setSelectedOption] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDatePlaceHolder, setSelectedDatePlaceholder] = useState<
    string | null
  >(null);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTaskDialogOpen, setTaskDialogOpen] = useState(false);
  const handleTaskCloseChange = () => {
    setTaskDialogOpen(!isTaskDialogOpen);
  };
  const handleSelectChange = (event: any) => {
    setSelectedOption(null);
    if (event.value === 'No Due Date') {
      setSelectedOption(event.value);
      setIsCalendarOpen(false);
      return;
    }

    if (event.value === 'when project ends') {
      setSelectedOption(event.value);
      if (handleSelectedOption) {
        handleSelectedOption(null);
      }
      setIsCalendarOpen(false);
      return;
    }

    // If the selected option is "Custom Date", open the calendar
    if (event.value === 'Custom Date' || event.value === 'Custom') {
      setIsCalendarOpen(true);
    } else {
      const today = new Date();
      const nextDate = new Date(today);
      const newDate = nextDate.setDate(
        today.getDate() + parseInt(event.value, 10)
      );

      if (handleSelectedOption) {
        handleSelectedOption(newDate);
      }
      setSelectedOption(event.value);
      setIsCalendarOpen(false);
    }
  };

  const handleTaskSelectChange = (event: any) => {
    setSelectedOption(null);
    if (event.value === 'Does not repeat') {
      setSelectedOption(event.value);
      setTaskDialogOpen(false);
      if (handleSelectedOption) {
        handleSelectedOption(null);
      }
      return;
    }
    // If the selected option is "Custom Date", open the calendar
    if (handleSelectedOption) {
      setSelectedOption(event.value);
      handleSelectedOption(event.value);
    }
    if (event.value === 'Custom') {
      setTaskDialogOpen(true);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setIsCalendarOpen(false); // Close the calendar when a date is selected

    if (handleSelectedOption) {
      handleSelectedOption(date);
    }
  };
  const CustomDropdownIndicator = (props: any) => {
    return (
      <components.DropdownIndicator {...props}>
        <svg
          width="15"
          height="16"
          viewBox="0 0 15 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.87536 3.62609H13.1254C13.2393 3.62645 13.3509 3.65787 13.4483 3.71696C13.5457 3.77604 13.6251 3.86057 13.678 3.96144C13.7309 4.06231 13.7553 4.17569 13.7485 4.2894C13.7418 4.4031 13.7042 4.51281 13.6397 4.60672L8.01473 12.7317C7.78161 13.0686 7.22036 13.0686 6.98661 12.7317L1.36161 4.60672C1.2965 4.513 1.25832 4.40324 1.25121 4.28935C1.24411 4.17546 1.26835 4.0618 1.3213 3.96071C1.37426 3.85963 1.45391 3.775 1.55159 3.716C1.64927 3.65701 1.76125 3.62591 1.87536 3.62609Z"
            fill="#616161"
          />
        </svg>
      </components.DropdownIndicator>
    );
  };
  const convrtDateToDays = (date: Date) => {
    if (date) {
      const startDate = new Date(Date.now());

      // To calculate the time difference of two dates
      var Difference_In_Time = date.getTime() - startDate.getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      const daysDifference = Math.round(Difference_In_Time / oneDay);
      return `${daysDifference} Days`; // Set the selected date as the selected option
    }
    return undefined;
  };
  ////
  const { className, disabled } = props;
  const id = useId();
  const hasLabel = label && (
    <label
      className={clsx(
        'mb-2 mt-0 block text-base font-normal leading-[21.97px] text-black',
        {
          'text-center': labelCenter,
        }
      )}
      htmlFor={id}
    >
      {label}
    </label>
  );
  useEffect(() => {
    if (selectedOption && variant === 'simpleSlectColor') {
      setSelectedColor(selectedOption);
    }
  }, [selectedOption, variant, name]);
  switch (variant) {
    case 'simpleSlect':
      return (
        <div className="semple-select-option mb-4">
          {hasLabel}
          <Select
            value={
              (options ?? []).find(
                (option) => option.value == selectedOption
              ) ?? defaultOptions[0]
            }
            options={options ?? defaultOptions}
            onChange={handleChange}
            name={name}
            className={clsx(
              'appearance-none text-base font-normal leading-[22px] text-[#757575]',
              props.className?.includes('w-auto') ? 'w-auto' : 'w-full',
              // isValid == false ? 'border-red-500' : 'text-gray-700',
              errorMessage ? 'rounded-lg border-2 border-red-500' : '',
              inputTextCenter && 'text-center placeholder:text-center'
            )}
          />
          {errorMessage && (
            <span className="text-xs text-red-500">{errorMessage}</span>
          )}
        </div>
      );
    case 'timeZone':
      return (
        <div className={`w-full`}>
          <label
            className={clsx(
              `mb-2 ml-1 block text-base font-normal leading-[21.97px] text-black`,
              {
                'text-center': labelCenter,
                'text-gray-400': disabled,
              }
            )}
            htmlFor={id}
          >
            Default Timezone
          </label>
          <TimezoneSelect
            value={selectedTimezone!}
            name={name}
            classNames={{
              control: () =>
                'h-[50px] w-full rounded-xl border-2 border-[#E0E0E0] bg-white', // Change the border color to red (#FF0000)
              option: () =>
                'text-base font-normal leading-[22px] text-[#1E1E1E]',
            }}
            components={{
              DropdownIndicator: CustomDropdownIndicator, // Remove the vertical line
              IndicatorSeparator: () => null, // Remove the vertical line
            }}
            styles={{
              control: (base: any) => ({
                ...base,
                borderRadius: '0.7rem',
                border: '2px solid #E0E0E0',
                borderColor: '#E0E0E0', // Set border to red
                '&:hover': {
                  borderRadius: '0.5rem',
                  border: '2px solid #E0E0E0',
                  borderColor: '#E0E0E0', // Set hover border to red
                },
                boxShadow: 'none', // Remove default focus outline
              }),
              indicatorSeparator: (base: any) => ({
                ...base,
                display: 'none', // Remove the vertical line
              }),

              dropdownIndicator: (base: any) => ({
                ...base,

                borderLeft: 'none', // Remove the vertical line
              }),
            }}
            onChange={(e: any) => handleChange(e)}
          />
        </div>
      );
    case 'simpleSlectColor':
      return (
        <div className="semple-select-option relative w-full">
          <style>{`
        .react-colorful {
          width: ${showColorFromTeam ? '455px' : '410px'} !important;
        }
      `}</style>
          {hasLabel}
          <div
            className="relative top-0 flex h-[50px] w-full cursor-pointer appearance-none items-center justify-between rounded-xl border-2 border-gray-300 px-4 py-2"
            onClick={handleToggle}
          >
            <div className="inline-flex gap-1 text-primary-600">
              <span className="text-gray-700">
                {GetColorName(selectedColor.replace('#', '')) ||
                  'Select a color'}
              </span>
            </div>
            <div className="flex gap-6">
              <div
                className={`h-5 w-5 self-center rounded-full text-primary-600`}
                style={{ backgroundColor: selectedColor }}
              />
              <svg
                width="15"
                height="16"
                viewBox="0 0 15 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.87536 3.62609H13.1254C13.2393 3.62645 13.3509 3.65787 13.4483 3.71696C13.5457 3.77604 13.6251 3.86057 13.678 3.96144C13.7309 4.06231 13.7553 4.17569 13.7485 4.2894C13.7418 4.4031 13.7042 4.51281 13.6397 4.60672L8.01473 12.7317C7.78161 13.0686 7.22036 13.0686 6.98661 12.7317L1.36161 4.60672C1.2965 4.513 1.25832 4.40324 1.25121 4.28935C1.24411 4.17546 1.26835 4.0618 1.3213 3.96071C1.37426 3.85963 1.45391 3.775 1.55159 3.716C1.64927 3.65701 1.76125 3.62591 1.87536 3.62609Z"
                  fill="#616161"
                />
              </svg>
            </div>
          </div>
          {isOpen ? (
            <div className="absolute z-50 mt-2 flex w-full items-center justify-center rounded-xl border-2 border-gray-300 bg-white p-2">
              <div
                className={`${showColorFromTeam ? 'w-[455px]' : 'w-[410px]'}`}
              >
                <div className="">
                  {/* <HexColorPicker color={color} onChange={setColor} /> */}
                  <HexColorPicker
                    color={color}
                    onChange={(newColor) => {
                      setColor(newColor);
                      handleColorSelect(newColor);
                      setIsOpen(true);
                    }}
                  />
                </div>
                <input
                  className={clsx(
                    `${showColorFromTeam ? 'w-[455px]' : 'w-[410px]'} focus:shadow-outline showColorFromTeam ? 'w-[455px]' : 'w-[410px]' mt-4 h-[50px] appearance-none rounded-xl border-2 px-[15px] py-2.5 text-sm font-normal leading-[22px] text-[#1E1E1E] placeholder:font-normal placeholder:text-[#616161] focus:outline-none`
                  )}
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />

                <div className="mt-3 flex items-center justify-between px-1 text-center">
                  <span>Saved colors:</span>
                  <div
                    onClick={() => {
                      addColorToSaved();
                      handleColorSelect(color);
                    }}
                  >
                    + Add
                  </div>
                </div>

                <div className="grid w-full grid-cols-8 justify-between gap-4 px-1 py-2">
                  {savedColors.map((color) => (
                    <div
                      key={color}
                      className={`color-circle h-5 w-5 cursor-pointer rounded-full ${
                        selectedColor === color ? `bg-${color}` : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      );
    case 'datePicker':
      return (
        <div className="semple-select-option mb-4 bg-white">
          {hasLabel}
          <Select
            value={
              selectedOptions === null
                ? null
                : options?.find((option) => option.value === selectedOptions)
            }
            placeholder={
              selectedOption
                ? convrtDateToDays(new Date(selectedOption))
                : 'select Date'
            }
            options={options}
            onChange={handleSelectChange}
            name={name}
            className={clsx(
              'h-[50px] appearance-none rounded-xl bg-white text-base font-normal leading-[22px] text-[#757575]',
              props.className?.includes('w-auto') ? 'w-auto' : 'w-full',
              // isValid == false ? 'border-red-500' : 'text-gray-700',
              errorMessage ? 'rounded-lg border-2 border-red-500' : '',
              inputTextCenter && 'text-center placeholder:text-center'
            )}
          />
          {errorMessage && (
            <span className="text-xs text-red-500">{errorMessage}</span>
          )}
          {isCalendarOpen && (
            <div className="absolute left-0 top-10">
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                inline
              />
            </div>
          )}
        </div>
      );
    case 'taskCustomdatePicker':
      return (
        <div className="semple-select-option mb-4">
          {hasLabel}
          <Select
            value={
              selectedOptions === null
                ? null
                : options?.find((option) => option.value === selectedOptions)
            }
            placeholder={selectedOption ? selectedOption : 'select Date'}
            options={options}
            onChange={handleSelectChange}
            name={name}
            className={clsx(
              'appearance-none text-base font-normal leading-[22px] text-[#757575]',
              props.className?.includes('w-auto') ? 'w-auto' : 'w-full',
              // isValid == false ? 'border-red-500' : 'text-gray-700',
              errorMessage
                ? 'rounded-lg border-2 border-red-500'
                : 'border-[#EEEEEE]',
              inputTextCenter && 'text-center placeholder:text-center'
            )}
          />
          {errorMessage && (
            <span className="text-xs text-red-500">{errorMessage}</span>
          )}
          {isCalendarOpen && (
            <div className="absolute left-0 top-10">
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                inline
              />
            </div>
          )}
        </div>
      );
    case 'taskDatePicker':
      return (
        <div className="semple-select-option mb-4">
          {hasLabel}
          <Select
            value={
              selectedOptions === null
                ? null
                : options?.find((option) => option.value === selectedOptions)
            }
            placeholder={selectedOption ? selectedOption : 'select Date'}
            options={options}
            onChange={handleTaskSelectChange}
            name={name}
            className={clsx(
              'appearance-none text-base font-normal leading-[22px] text-[#757575]',
              props.className?.includes('w-auto') ? 'w-auto' : 'w-full',
              // isValid == false ? 'border-red-500' : 'text-gray-700',
              errorMessage
                ? 'rounded-lg border-2 border-red-500'
                : 'border-[#EEEEEE]',
              inputTextCenter && 'text-center placeholder:text-center'
            )}
          />
          {errorMessage && (
            <span className="text-xs text-red-500">{errorMessage}</span>
          )}
          {isTaskDialogOpen && (
            <CustomTaskDaysPicker
              handleTaskCloseChange={handleTaskCloseChange}
            />
          )}
        </div>
      );
  }
  return null;
}

export { SelectOption };
