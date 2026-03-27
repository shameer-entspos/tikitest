import { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'primaryRounded'
    | 'primaryOutLine'
    | 'danger'
    | 'outlinePrimaryRounded'
    | 'simple'
    | 'text';
  className?: string;
};

function Button({ children, variant = 'primary', ...props }: ButtonProps) {
  const { className, disabled } = props;
  const commonStyle =
    'text-sm md:text-base disabled:bg-gray-600 font-normal text-white leading-[20px] min-w-[100px] md:min-w-[120px] py-[8px] px-[14px] h-[40px] rounded-lg';

  const RoundedStyle =
    'text-sm xl:text-base disabled:bg-gray-600 font-normal leading-[20px] min-w-[100px] md:min-w-[120px] xl:min-w-[100px] py-[8px] px-[14px] h-[40px] rounded-full';

  const OutLineStyle =
    'text-sm md:text-base disabled:bg-gray-600 font-normal text-[#0063F7] border border-solid border-[#0063F7] leading-[20px] min-w-[100px] md:min-w-[120px] py-[8px] px-[12px] h-[40px] rounded-lg';

  switch (variant) {
    case 'primary':
      return (
        <button
          {...props}
          className={clsx(
            `bg-[#0063F7] hover:bg-[#213ED8]`,
            commonStyle,
            className,
            disabled && 'cursor-not-allowed bg-[#9E9E9E]'
          )}
        >
          {children}
        </button>
      );
    case 'primaryOutLine':
      return (
        <button
          {...props}
          type="button"
          className={clsx(
            `hover:bg-[#213ED8] hover:text-white`,
            OutLineStyle,
            className,
            disabled && 'cursor-not-allowed bg-[#9E9E9E]'
          )}
        >
          {children}
        </button>
      );
    case 'primaryRounded':
      return (
        <button
          {...props}
          type="button"
          className={clsx(
            `bg-[#0063F7] text-white hover:bg-[#213ED8]`,
            RoundedStyle,
            className,
            disabled && 'cursor-not-allowed bg-[#9E9E9E]'
          )}
        >
          {children}
        </button>
      );
    case 'outlinePrimaryRounded':
      return (
        <button
          {...props}
          type="button"
          className={clsx(
            `bg-white text-primary-500 outline outline-1 outline-primary-500`,
            RoundedStyle,
            className,
            disabled && 'cursor-not-allowed bg-[#9E9E9E]'
          )}
        >
          {children}
        </button>
      );
    case 'secondary':
      return (
        <button
          {...props}
          type="button"
          className={clsx(
            `bg-[#616161] hover:bg-secondary-700`,
            commonStyle,
            className,
            disabled && 'cursor-not-allowed bg-[#9E9E9E]'
          )}
        >
          {children}
        </button>
      );
    case 'danger':
      return (
        <button
          {...props}
          type="button"
          className={clsx(
            `bg-red-600 hover:bg-red-700`,
            commonStyle,
            className,
            disabled && 'cursor-not-allowed bg-[#9E9E9E]'
          )}
        >
          {children}
        </button>
      );

    case 'simple':
      return (
        <button
          {...props}
          className={clsx(
            `bg-white text-black`,

            className,
            disabled && 'cursor-not-allowed bg-[#9E9E9E]'
          )}
        >
          {children}
        </button>
      );
    case 'text':
      return (
        <button
          {...props}
          type="button"
          className={clsx(
            `text-[#0063F7]`,
            'px-2 py-1 font-bold',
            className,
            disabled && 'cursor-not-allowed bg-[#9E9E9E]'
          )}
        >
          {children}
        </button>
      );
    default:
      return (
        <button
          {...props}
          type="button"
          className={clsx(
            `bg-[#0063F7] hover:bg-[#213ED8]`,
            commonStyle,
            className,
            disabled && 'cursor-not-allowed bg-[#9E9E9E]'
          )}
        >
          {children}
        </button>
      );
  }
}

export { Button };
