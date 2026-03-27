import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface CustomCheckboxProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  label,
  description,
  checked,
  onChange,
}) => {
  return (
    <div className={`flex items-center justify-between gap-2 rounded-md py-3`}>
      <div className="flex flex-col">
        <span className="font-medium text-gray-800">{label}</span>
        {description && (
          <span className="text-sm text-gray-500">{description}</span>
        )}
      </div>
      <div
        onClick={onChange}
        className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border-2 md:h-6 md:w-6 ${
          checked
            ? 'border-primary-500 bg-primary-500'
            : 'border-gray-400 bg-white'
        }`}
      >
        {checked && <Check className="h-4 w-4 text-white" />}
      </div>
    </div>
  );
};

export default CustomCheckbox;
