// components/Calendar.tsx
import React, { useState } from 'react';
import Calendar, { CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  subMonths,
} from 'date-fns';
import './calender_style.css';

export default function DateRangePicker({
  title,
  handleOnConfirm,
  selectedDate,
  isForFilter = false,
}: {
  title: string;
  isForFilter?: boolean;
  handleOnConfirm: any;
  selectedDate?: {
    from?: Date;
    to?: Date;
  };
}) {
  const [showDialog, setShowDialog] = useState(false);
  const handleConfirm = (from: Date, to: Date) => {
    handleOnConfirm(from, to);
    setShowDialog(false);
  };

  const handleCancel = () => {
    setShowDialog(false);
  };

  return (
    <>
      <label
        htmlFor=""
        className="text-black] flex max-h-[21.98px] justify-between font-normal"
      >
        {title}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.46021 2.08594C6.46021 1.92018 6.39436 1.76121 6.27715 1.644C6.15994 1.52679 6.00097 1.46094 5.83521 1.46094C5.66945 1.46094 5.51048 1.52679 5.39327 1.644C5.27606 1.76121 5.21021 1.92018 5.21021 2.08594V3.4026C4.01021 3.49844 3.22354 3.73344 2.64521 4.3126C2.06604 4.89094 1.83104 5.67844 1.73438 6.8776H18.2694C18.1727 5.6776 17.9377 4.89094 17.3585 4.3126C16.7802 3.73344 15.9927 3.49844 14.7935 3.40177V2.08594C14.7935 1.92018 14.7277 1.76121 14.6105 1.644C14.4933 1.52679 14.3343 1.46094 14.1685 1.46094C14.0028 1.46094 13.8438 1.52679 13.7266 1.644C13.6094 1.76121 13.5435 1.92018 13.5435 2.08594V3.34677C12.9894 3.33594 12.3677 3.33594 11.6685 3.33594H8.33521C7.63604 3.33594 7.01438 3.33594 6.46021 3.34677V2.08594Z"
            fill="#616161"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1.66406 10C1.66406 9.30083 1.66406 8.67917 1.6749 8.125H18.3199C18.3307 8.67917 18.3307 9.30083 18.3307 10V11.6667C18.3307 14.8092 18.3307 16.3808 17.3541 17.3567C16.3782 18.3333 14.8066 18.3333 11.6641 18.3333H8.33073C5.18823 18.3333 3.61656 18.3333 2.64073 17.3567C1.66406 16.3808 1.66406 14.8092 1.66406 11.6667V10ZM14.1641 11.6667C14.3851 11.6667 14.597 11.5789 14.7533 11.4226C14.9096 11.2663 14.9974 11.0543 14.9974 10.8333C14.9974 10.6123 14.9096 10.4004 14.7533 10.2441C14.597 10.0878 14.3851 10 14.1641 10C13.943 10 13.7311 10.0878 13.5748 10.2441C13.4185 10.4004 13.3307 10.6123 13.3307 10.8333C13.3307 11.0543 13.4185 11.2663 13.5748 11.4226C13.7311 11.5789 13.943 11.6667 14.1641 11.6667ZM14.1641 15C14.3851 15 14.597 14.9122 14.7533 14.7559C14.9096 14.5996 14.9974 14.3877 14.9974 14.1667C14.9974 13.9457 14.9096 13.7337 14.7533 13.5774C14.597 13.4211 14.3851 13.3333 14.1641 13.3333C13.943 13.3333 13.7311 13.4211 13.5748 13.5774C13.4185 13.7337 13.3307 13.9457 13.3307 14.1667C13.3307 14.3877 13.4185 14.5996 13.5748 14.7559C13.7311 14.9122 13.943 15 14.1641 15ZM10.8307 10.8333C10.8307 11.0543 10.7429 11.2663 10.5867 11.4226C10.4304 11.5789 10.2184 11.6667 9.9974 11.6667C9.77638 11.6667 9.56442 11.5789 9.40814 11.4226C9.25186 11.2663 9.16406 11.0543 9.16406 10.8333C9.16406 10.6123 9.25186 10.4004 9.40814 10.2441C9.56442 10.0878 9.77638 10 9.9974 10C10.2184 10 10.4304 10.0878 10.5867 10.2441C10.7429 10.4004 10.8307 10.6123 10.8307 10.8333ZM10.8307 14.1667C10.8307 14.3877 10.7429 14.5996 10.5867 14.7559C10.4304 14.9122 10.2184 15 9.9974 15C9.77638 15 9.56442 14.9122 9.40814 14.7559C9.25186 14.5996 9.16406 14.3877 9.16406 14.1667C9.16406 13.9457 9.25186 13.7337 9.40814 13.5774C9.56442 13.4211 9.77638 13.3333 9.9974 13.3333C10.2184 13.3333 10.4304 13.4211 10.5867 13.5774C10.7429 13.7337 10.8307 13.9457 10.8307 14.1667ZM5.83073 11.6667C6.05174 11.6667 6.2637 11.5789 6.41998 11.4226C6.57626 11.2663 6.66406 11.0543 6.66406 10.8333C6.66406 10.6123 6.57626 10.4004 6.41998 10.2441C6.2637 10.0878 6.05174 10 5.83073 10C5.60972 10 5.39775 10.0878 5.24147 10.2441C5.08519 10.4004 4.9974 10.6123 4.9974 10.8333C4.9974 11.0543 5.08519 11.2663 5.24147 11.4226C5.39775 11.5789 5.60972 11.6667 5.83073 11.6667ZM5.83073 15C6.05174 15 6.2637 14.9122 6.41998 14.7559C6.57626 14.5996 6.66406 14.3877 6.66406 14.1667C6.66406 13.9457 6.57626 13.7337 6.41998 13.5774C6.2637 13.4211 6.05174 13.3333 5.83073 13.3333C5.60972 13.3333 5.39775 13.4211 5.24147 13.5774C5.08519 13.7337 4.9974 13.9457 4.9974 14.1667C4.9974 14.3877 5.08519 14.5996 5.24147 14.7559C5.39775 14.9122 5.60972 15 5.83073 15Z"
            fill="#616161"
          />
        </svg>
      </label>

      <div
        className={`relative mt-2 flex h-12 w-full cursor-pointer items-center justify-between rounded-xl border-2 border-gray-300 px-3`}
        onClick={() => {
          setShowDialog(!showDialog);
        }}
      >
        <div className="text-sm">
          {selectedDate && selectedDate.from && selectedDate.to ? (
            <>
              {format(selectedDate.from ?? new Date(), 'dd MMM yyyy')} to{' '}
              {format(selectedDate.to ?? new Date(), 'dd MMM yyyy')}
            </>
          ) : (
            <>
              {isForFilter === false || selectedDate === undefined ? (
                <>-</>
              ) : (
                <>Select Date</>
              )}
            </>
          )}
        </div>
        <div>
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
      <div className="fit z-10 w-full">
        {showDialog && (
          <ul className="relative my-3 mt-1 overflow-hidden rounded-md border-2 bg-white shadow-xl">
            <CalendarComponent
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          </ul>
        )}
      </div>
    </>
  );
}

interface CustomCalendarProps {
  onConfirm: (from: Date, to: Date) => void;
  onCancel: () => void;
}

const CalendarComponent: React.FC<CustomCalendarProps> = ({
  onConfirm,
  onCancel,
}) => {
  const [value, setValue] = useState<[Date, Date] | null>([
    new Date(),
    new Date(),
  ]);
  const [activeStartDate, setActiveStartDate] = useState<Date | null>(
    new Date()
  );
  const handleChange = (value1: any) => {
    if (Array.isArray(value1)) {
      setValue([value1[0], value1[1]]);
      setActiveStartDate(value1[0]);
      // onConfirm(value1[0], value1[1]);
    } else if (value1) {
      setValue([value1[0], value1[1]]);
      setActiveStartDate(value1[0]);
      // onConfirm(value1[0], value1[1]);
    } else {
      setValue(null);
    }
  };

  const handleOptionClick = (option: string) => {
    const today = new Date();
    let from: Date;
    let to: Date;
    console.log(option);
    switch (option.toLowerCase()) {
      case 'this day':
        from = today;
        to = today;
        break;
      case 'tomorrow':
        from = addDays(today, 1);
        to = addDays(today, 1);
        break;
      case 'this week':
        from = startOfWeek(today);
        to = endOfWeek(today);
        break;
      case 'next week':
        from = startOfWeek(addWeeks(today, 1));
        to = endOfWeek(addWeeks(today, 1));
        break;
      case 'this month':
        from = startOfMonth(today);
        to = endOfMonth(today);
        break;
      case 'next month':
        from = startOfMonth(addMonths(today, 1));
        to = endOfMonth(addMonths(today, 1));
        break;
      default:
        from = today;
        to = today;
    }
    console.log(from);
    console.log(to);
    setValue([from, to]);
    setActiveStartDate(from);
  };

  const formatShortWeekday: (
    locale: string | undefined,
    date: Date
  ) => string = (locale, date) => {
    if (!date) {
      return '';
    }
    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return weekdays[date.getDay()];
  };

  return (
    <div className="flex">
      <ul className="mt-3 px-3 text-start text-xs">
        {[
          'Today',
          'Tomorrow',
          'This Week',
          'Next Week',
          'This Month',
          'Next Month',
          'Reset',
        ].map((option) => (
          <li
            key={option}
            onClick={() => handleOptionClick(option)}
            className={`cursor-pointer py-2 ${
              option == 'Reset' ? 'mt-1 text-[#0063F7]' : 'text-[#1E1E1E]'
            }`}
          >
            {option}
          </li>
        ))}
      </ul>

      <div className="w-2/3">
        <div className="calendar-container relative">
          <Calendar
            selectRange
            onChange={handleChange}
            value={value}
            className="calender-body"
            nextLabel=">" // Hide default next button
            prevLabel="<" // Hide default previous button
            // next2Label=""
            // prev2Label=""
            formatShortWeekday={formatShortWeekday}
            showFixedNumberOfWeeks={true}
            activeStartDate={activeStartDate ?? new Date()}
            onActiveStartDateChange={({ activeStartDate }) =>
              setActiveStartDate(activeStartDate as Date)
            }
          />
        </div>
        <div className="flex gap-5 px-2 py-4 font-Open-Sans text-[#0063F7]">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              Array.isArray(value) &&
              value[0] &&
              value[1] &&
              onConfirm(value[0], value[1])
            }
            className="font-Open-Sans text-[#0063F7]"
          >
            Confirm
          </button>
        </div>
      </div>
      {/* <style jsx>{`

      `}</style> */}
    </div>
  );
};
