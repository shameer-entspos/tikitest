"use client";

import clsx from "clsx";
import { Field } from "formik";
import { TextareaHTMLAttributes, MouseEventHandler, useId } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
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
};

function Textarea({
  label,
  labelBold = true,
  labelCenter = false,
  isValid = null,
  errorMessage = null,
  inputTextCenter = false,
  isTouched,
  isSufficButtonClick,
  isSuffixButton = false,
  ...props
}: TextareaProps) {
  const id = useId();
  const hasLabel = label && (
    <label
      className={clsx(
        "block text-black font-normal leading-[21.97px] mb-2 text-base mt-1",
        {
          "text-center": labelCenter,
        }
      )}
      htmlFor={id}
    >
      {label}
      {props.required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  return (
    <div className="mb-4">
      {hasLabel}
      <div className="flex items-center">
        <Field
          as="textarea"
          id={id}
          {...props}
          className={clsx(
            "appearance-none border-2 border-gray-300 py-2.5 px-[15px] focus:outline-none text-sm focus:shadow-outline placeholder-text-black placeholder:font-normal font-normal leading-[22px] text-[#1E1E1E] resize-none h-24 rounded-xl",
            props.className?.includes("w-auto") ? "w-auto" : "w-full",
            isSuffixButton ? "rounded-l" : "rounded",
            errorMessage && isTouched ? "border-red-500" : "border-[#EEEEEE]",
            inputTextCenter && "text-center placeholder:text-center"
          )}
        />

        {isSuffixButton && (
          <button
            type="button"
            className="bg-primary-500 text-white py-2 px-4 rounded-r"
            onClick={isSufficButtonClick!}
          >
            Action
          </button>
        )}
      </div>

      {errorMessage && isTouched && (
        <span className="text-red-500 text-xs">{errorMessage}</span>
      )}
    </div>
  );
}

export { Textarea };
