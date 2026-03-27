import React from 'react';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  color?: string;
  tickColor?: string;
  borderColor?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  labelPosition?: 'left' | 'right';
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  label,
  color = 'transparent',
  tickColor = 'transparent',
  borderColor = 'transparent',
  size = 'medium',
  disabled = false,
  labelPosition = 'right',
}) => {
  const handleCustomCheckboxClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const sizeStyles = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  return (
    <div
      className={`flex cursor-pointer items-center ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      }`}
      onClick={handleCustomCheckboxClick}
    >
      {label && labelPosition === 'left' && (
        <span className="mr-2 text-sm">{label}</span>
      )}
      <div
        className={`relative inline-flex h-full w-full ${sizeStyles[size]}`}
        style={{
          borderColor: borderColor,
          borderWidth: '2px',
          borderStyle: 'solid',
          borderRadius: '4px',
        }}
      >
        <div
          className={`relative ${sizeStyles[size]}`}
          style={{
            backgroundColor: checked ? color : 'transparent',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            className="absolute m-auto"
            style={{ backgroundColor: checked ? color : 'transparent' }}
          >
            {checked && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke={tickColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            <input
              type="CustomCheckbox"
              checked={checked}
              onChange={() => {}}
              className="absolute inset-0 border-2 border-red-500 opacity-0"
              disabled={disabled}
            />
          </div>
        </div>
      </div>
      {label && labelPosition === 'right' && (
        <span className="ml-2 text-sm">{label}</span>
      )}
    </div>
  );
};

export default CustomCheckbox;
