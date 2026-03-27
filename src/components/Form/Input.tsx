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
};

function Input({
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
        }
      )}
      htmlFor={id}
    >
      {label}
      {props.required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
  return (
    <div className="mb-4">
      {hasLabel}
      <div className="flex items-center">
        <Field
          id={id}
          {...props}
          // type={isVisible? "text" : "password"}
          type={
            props.type?.includes('password')
              ? isVisible
                ? 'text'
                : 'password'
              : 'text'
          }
          className={clsx(
            'focus:shadow-outline h-[50px] appearance-none rounded-xl border-2 px-[15px] py-2.5 text-base font-normal leading-[22px] text-[#1E1E1E] placeholder:font-normal placeholder:text-[#616161] focus:outline-none',
            props.className?.includes('w-auto') ? 'w-auto' : 'w-full',
            isSuffixButton ? 'rounded-xl' : 'rounded',
            errorMessage && isTouched ? 'border-red-500' : 'border-[#E0E0E0]',
            inputTextCenter && 'text-center placeholder:text-center'
          )}
        />

        <>
          {istoggleVisibility && (
            <div
              className={`${
                isSuffixButton ? 'right-32 md:right-40' : 'right-4'
              } absolute`}
            >
              {isVisible ? (
                <IoEyeOffSharp className="h-6 w-6" onClick={toggleVisibility} />
              ) : (
                <IoEyeSharp className="h-6 w-6" onClick={toggleVisibility} />
              )}
            </div>
          )}

          {isSuffixButton && (
            <button
              type="button"
              className="ml-1 h-[49px] rounded-xl bg-primary-500 px-4 py-2 text-white"
              onClick={isSufficButtonClick!}
            >
              Generate
            </button>
          )}
        </>
      </div>

      {errorMessage && isTouched && (
        <span className="text-xs text-red-500">{errorMessage}</span>
      )}
    </div>
  );
}

export { Input };
