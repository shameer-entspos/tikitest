'use client';
import clsx from 'clsx';
import { FastField, Field } from 'formik';
import { InputHTMLAttributes, MouseEventHandler, useId, useState } from 'react';
import { BsEye, BsEyeFill } from 'react-icons/bs';
import { IoEyeOffSharp, IoEyeSharp } from 'react-icons/io5';
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label?: string;
  labelCenter?: boolean;
  labelBold?: boolean;
  inputTextCenter?: boolean;
  isValid?: boolean | null;
  errorMessage?: string | null;
  isTouched?: boolean | null | undefined;
  isSuffixButton?: boolean;
  isSufficButtonClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  istoggleVisibility?: boolean;
  bottomPadding?: boolean;
};

function SimpleInput({
  label,
  labelBold = true,
  labelCenter = false,
  isValid = null,
  errorMessage = null,
  inputTextCenter = false,
  isTouched,
  isSufficButtonClick,
  istoggleVisibility,
  isSuffixButton = false,
  bottomPadding = true,
  disabled = false,
  ...props
}: InputProps) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const id = useId();
  const hasLabel = label && (
    <label
      className={clsx(
        `mb-2 ml-1 block text-base font-normal leading-[21.97px] text-[#1E1E1E]`,
        {
          'text-center': labelCenter,
          'text-gray-400': disabled,
        }
      )}
      htmlFor={id}
    >
      {label}
      {props.required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
  return (
    <div className={`${bottomPadding ? 'mb-[12px]' : 'mb-0'} relative w-full`}>
      <div className="flex w-full items-end justify-between">
        <span>{hasLabel}</span>
        {isSuffixButton && (
          <span
            className="mb-2 cursor-pointer text-sm text-[#0063F7]"
            onClick={isSufficButtonClick}
          >
            Generate Password
          </span>
        )}
      </div>
      <div className="flex items-center">
        <input
          id={id}
          disabled={disabled}
          {...props}
          // type={isVisible? "text" : "password"}
          type={
            props.type?.includes('password')
              ? isVisible
                ? 'text'
                : 'password'
              : props.type
          }
          className={clsx(
            'focus:shadow-outline h-[50px] appearance-none rounded-xl border-2 px-[15px] py-2.5 text-base font-normal leading-[22px] text-[#000000] placeholder:font-normal placeholder:text-[#616161] focus:outline-none',
            // "appearance-none border-2  py-2.5 px-[15px] focus:outline-none text-sm focus:shadow-outline placeholder-text-black placeholder:font-normal leading-[22px] h-10",
            props.className?.includes('w-auto') ? 'w-auto' : 'w-full',
            isSuffixButton ? 'rounded-lg' : 'rounded',
            errorMessage && isTouched && !disabled
              ? 'border-red-500'
              : 'border-[#E0E0E0]',
            inputTextCenter && 'text-center placeholder:text-center',
            disabled && 'cursor-not-allowed bg-gray-100 text-gray-500' // Styling when disabled
          )}
        />

        <>
          {istoggleVisibility && (
            <div className={`${'right-4'} absolute`}>
              {isVisible ? (
                <IoEyeOffSharp className="h-6 w-6" onClick={toggleVisibility} />
              ) : (
                <IoEyeSharp className="h-6 w-6" onClick={toggleVisibility} />
              )}
            </div>
          )}
        </>
      </div>

      {errorMessage && isTouched && (
        <span className="text-xs text-red-500">{errorMessage}</span>
      )}
    </div>
  );
}

export { SimpleInput };
