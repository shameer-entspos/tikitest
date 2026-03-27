import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { usePresignedUserPhoto } from '@/hooks/usePresignedUserPhoto';
import { useSession } from 'next-auth/react';

interface CustomSelectProps {
  label: string;
  data: Array<{ label: string; value: any; photo?: string }>;
  onSelect: (selectedValues: any[], item?: any) => void; // Enforce an array for selectedValues
  showImage?: boolean;
  multiple?: boolean; // Optional prop to determine if multiple selections are allowed
  isOpen?: boolean; // Prop to control whether the dropdown is open
  onToggle?: () => void; // Callback to handle dropdown toggle
  isRequired?: boolean;
  hasError?: any;
  selected?: any;
  placeholder?: string;
  returnSingleValueWithLabel?: boolean;
  searchPlaceholder?: string;
  showSearch?: boolean;
  isTouched?: boolean | null | undefined;
  showIcon?: boolean;
  bg?: string;
  selectedInputText?: string;
}

function CustomSearchSelectItemPhoto({ photo, label }: { photo?: string; label?: string }) {
  const src = usePresignedUserPhoto(photo);
  return (
    <img
      src={src}
      alt={label || 'No Image'}
      className="h-6 w-6 rounded-full object-cover"
    />
  );
}

const CustomSearchSelect: React.FC<CustomSelectProps> = ({
  label,
  data,
  onSelect,
  showImage = true,
  multiple = true,
  isOpen = false,
  onToggle,
  isTouched,
  showSearch = true,
  returnSingleValueWithLabel = false,
  isRequired = false,
  hasError,
  searchPlaceholder = 'Search...',
  selected = [],
  showIcon = false,
  placeholder = 'Select...',
  bg = 'bg-transparent',
  selectedInputText,
}) => {
  const [search, setSearch] = useState('');
  const [selectedValues, setSelectedValues] = useState<Array<string>>(
    Array.isArray(selected) ? [...selected] : selected ? [selected] : []
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const next = Array.isArray(selected) ? [...selected] : selected != null ? [selected] : [];
    setSelectedValues(next);
  }, [selected]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        onToggle && onToggle(); // Close the dropdown if clicked outside
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onToggle]);
  const handleSelect = (value: any, item: any) => {
    let updatedSelectedValues = [...selectedValues];

    if (multiple) {
      if (selectedValues.includes(value)) {
        updatedSelectedValues = updatedSelectedValues.filter(
          (item) => item !== value
        );
      } else {
        updatedSelectedValues.push(value);
      }
      onSelect(updatedSelectedValues);
    } else {
      // If not multiple, simply toggle the selected value and close the dropdown

      if (returnSingleValueWithLabel) {
        // onToggle && onToggle(); // Close dropdown after selection
        // onSelect(selectedValues.includes(value)?'':value,item);
        const singleValue = selectedValues.includes(value) ? '' : value;
        updatedSelectedValues = selectedValues.includes(value) ? [] : [value];
        onToggle && onToggle(); // Close dropdown after selection
        onSelect(singleValue, item);
      } else {
        updatedSelectedValues = selectedValues.includes(value) ? [] : [value];
        onToggle && onToggle(); // Close dropdown after selection
        onSelect(updatedSelectedValues);
      }
    }

    setSelectedValues(updatedSelectedValues);
  };

  const filteredData = data.filter((item) =>
    item.label.toString().toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <div className="mx-1 mb-2 flex items-center justify-between">
        <label htmlFor="" className="cursor-pointer font-normal text-[#1E1E1E]">
          {label}
          {isRequired && <span className="text-red-500">{` *`}</span>}
        </label>
        {showIcon && (
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
        )}
      </div>
      <div
        className={`relative mb-2 flex h-[50px] w-full cursor-pointer items-center justify-between rounded-xl border-2 border-gray-300 px-3 ${bg} ${
          hasError ? 'border-red-500' : ''
        }`}
        onClick={() => onToggle && onToggle()}
      >
        <div className="truncate text-sm">
          {selectedValues.length > 0 ? (
            <>
              {selectedInputText ??
                selectedValues
                  .map((val) => data.find((item) => item.value === val)?.label)
                  .join(', ')}
            </>
          ) : (
            <>{placeholder}</>
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
      <div className="relative">
        {/* Make the parent container relative */}
        {isOpen && (
          <ul
            className={clsx(
              `absolute left-0 top-full z-50 mt-2 w-full max-h-64 overflow-hidden rounded-lg border-2 border-[#E0E0E0] bg-white shadow-lg`
            )}
          >
            {showSearch && (
              <div className="sticky top-0 z-10 flex flex-col bg-white py-2">
                <input
                  type="text"
                  onChange={(e) => setSearch(e.target.value)}
                  className={clsx(
                    `focus:shadow-outline h-[50px] appearance-none rounded-lg border-b-2 border-[#E0E0E0] px-[15px] py-2.5 text-medium font-normal leading-[22px] text-[#1E1E1E] placeholder:text-medium placeholder:text-[#616161] focus:outline-none`
                  )}
                  placeholder={searchPlaceholder}
                />
              </div>
            )}
            <div className="max-h-48 overflow-y-auto px-4 py-4">
              {filteredData.map((item, index) => (
                <li
                  key={index}
                  className="flex cursor-pointer justify-between py-2"
                  onClick={() => {
                    if (item.value == 'all') {
                      if (onToggle) {
                        onToggle();
                      }
                      const allData = (filteredData ?? [])
                        .filter((t) => t.value !== 'all')
                        .map((t) => t.value);
                      setSelectedValues(allData);
                      onSelect(allData);
                    } else {
                      handleSelect(item.value, item.label);
                    }
                  }}
                >
                  <div className="flex items-center gap-2 truncate text-medium md:text-sm">
                    {showImage && (
                      <CustomSearchSelectItemPhoto photo={item.photo} label={item.label} />
                    )}
                    {`${item.value === session?.user.user._id ? 'Me' : item.label}`}
                  </div>

                  {multiple && item.value !== 'all' && (
                    <div className="relative flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        name="user"
                        checked={selectedValues.includes(item.value)}
                        readOnly
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
                  )}
                </li>
              ))}
            </div>
          </ul>
        )}
      </div>
    </div>
  );
};

export { CustomSearchSelect };
