import { useState, useRef, useEffect } from 'react';
import { FaCaretDown } from 'react-icons/fa';
import { createPortal } from 'react-dom';

export function ChipDropDown({
  options,
  selectedValue,
  onChange,
  bgColor = 'bg-[#97F1BB]',
}: {
  options: string[];
  selectedValue: string;
  onChange?: (value: string) => void;
  bgColor?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string>(selectedValue);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Toggle dropdown visibility
  const handleToggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  // Handle option selection
  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false); // Close dropdown
    if (onChange) {
      onChange(option); // Call onChange only if defined
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Calculate dropdown position
  const dropdownStyle = () => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      return {
        top: buttonRect.bottom + window.scrollY,
        left: buttonRect.left + window.scrollX,
        // width: buttonRect.width, // Ensure the dropdown has the same width as the button
        minWidth: buttonRect.width, // Ensure the dropdown is at least as wide as the button
        whiteSpace: 'nowrap',
      };
    }
    return {};
  };

  return (
    <div className="relative px-2">
      {/* Dropdown Toggle Button */}
      <button
        type="button"
        ref={buttonRef}
        id="dropdown-button"
        className={`inline-flex w-full items-center justify-center rounded-md border border-gray-300 px-2 py-1 text-sm font-medium text-black shadow-sm hover:${bgColor} focus:outline-none ${bgColor}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={handleToggleDropdown}
      >
        {selected}
        <FaCaretDown
          className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Render dropdown outside the parent container using a portal */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            id="dropdown-menu"
            className={`absolute z-50 mt-1 rounded-md ${bgColor} shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="dropdown-button"
            style={dropdownStyle()}
          >
            <div className="py-1" role="none">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(option)}
                  className="block w-full whitespace-nowrap px-2 py-2 text-left text-sm text-gray-700 hover:bg-gray-200"
                  role="menuitem"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>,
          document.body // Render the dropdown in the body
        )}
    </div>
  );
}
