import { button } from '@nextui-org/react';

interface ContainerProps {
  type: 'big' | 'small';
  heading: string;
  description?: string;
  iconSvg: React.ReactNode;
  onClick?: () => void;
  isDisabled?: boolean;
}

export const MainPageContainer: React.FC<ContainerProps> = ({
  type,
  heading,
  description,
  iconSvg,
  onClick,
  isDisabled = false,
}) => {
  return (
    <>
      {type === 'big' ? (
        <button
          onClick={onClick}
          disabled={isDisabled}
          className={`text-start disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <div className="inline-flex h-full w-full cursor-pointer flex-col items-start justify-start gap-2.5 rounded-2xl border border-[#e0e0e0] bg-white p-4 shadow-[0_0_8px_rgba(0,0,0,0.20)] sm:max-w-[290px] xl:px-5 xl:pb-[42px] xl:pt-[30px]">
            <div className="relative flex w-full items-center justify-between self-stretch">
              <div className="text-base font-semibold text-[#1e1e1e] xl:text-xl">
                {heading}
              </div>
              <div className="">{iconSvg}</div>
            </div>
            <div className="pr-2 text-sm font-normal text-[#616161]">
              {description}
            </div>
          </div>
        </button>
      ) : (
        <button
          onClick={onClick}
          disabled={isDisabled}
          className={`text-start disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <div
            aria-disabled
            className="inline-flex w-full cursor-pointer justify-between rounded-2xl border border-[#e0e0e0] px-5 py-[25px] shadow xl:max-w-[290px]"
          >
            <div className="text-base font-semibold text-[#1e1e1e]">
              {heading}
            </div>
            <div className="relative flex flex-col items-start justify-start">
              {iconSvg}
            </div>
          </div>
        </button>
      )}
    </>
  );
};
