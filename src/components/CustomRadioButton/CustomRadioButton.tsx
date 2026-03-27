import React from 'react';

type CustomRadioProps = {
  name: string;
  value: string;
  checkedValue: string;
  onChange: (value: string) => void;
  label: any;
  disabled?: boolean;
};

const CustomRadio: React.FC<CustomRadioProps> = ({
  name,
  value,
  checkedValue,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <label className="mt-2 inline-flex items-center !font-normal">
      <input
        type="radio"
        name={name}
        value={value}
        disabled={disabled}
        checked={checkedValue === value}
        onChange={() => onChange(value)}
        className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
      />
      <span className="ml-2">{label}</span>
    </label>
  );
};

export default CustomRadio;
