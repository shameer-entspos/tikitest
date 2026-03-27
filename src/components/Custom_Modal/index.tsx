import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import { Button } from '../Buttons';
import CustomHr from '../Ui/CustomHr';
import Loader from '../DottedLoader/loader';

const CustomModal = ({
  header,
  body,
  handleCancel,
  submitDisabled,
  isOpen = false,
  isLoading = false,
  handleSubmit,
  variant = 'primary',
  cancelvariant = 'primaryOutLine',
  submitValue = 'Submit',
  cancelButton = 'Cancel',
  size = 'md',
  showTopBorder = true,
  justifyButton = 'justify-center ',
  showFooter = true,
  showHeader = true,
  showFooterSubmit = true,
  customCancelHandler,
}: {
  header: any;
  body?: any;
  isLoading?: boolean;
  submitDisabled?: boolean;
  isOpen?: boolean;
  handleCancel: any;
  handleSubmit: any;
  submitValue: any;
  showTopBorder?: boolean;
  justifyButton?: any;
  showFooter?: boolean;
  showHeader?: boolean;
  showFooterSubmit?: boolean;
  customCancelHandler?: () => void;
  variant?:
    | 'text'
    | 'primaryOutLine'
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'primaryRounded'
    | 'danger'
    | 'outlinePrimaryRounded'
    | 'simple'
    | undefined;
  cancelvariant?:
    | 'text'
    | 'primaryOutLine'
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'primaryRounded'
    | 'danger'
    | 'outlinePrimaryRounded'
    | 'simple'
    | undefined;
  cancelButton?: string;
  size?:
    | 'xl'
    | 'sm'
    | 'md'
    | 'lg'
    | '2xl'
    | 'xs'
    | '3xl'
    | '4xl'
    | '5xl'
    | 'full'
    | undefined;
}) => {
  const sizeToMaxWidth: Record<string, string> = {
    xs: '400px',
    sm: '480px',
    md: '560px',
    lg: '640px',
    xl: '720px',
    '2xl': '800px',
    '3xl': '896px',
    '4xl': '1024px',
    '5xl': '1152px',
    full: 'calc(100vw - 2rem)',
  };
  const maxW = sizeToMaxWidth[size ?? 'xl'] ?? '720px';

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleCancel}
      placement="auto"
      size={size}
      classNames={{
        wrapper: 'overflow-y-auto',
        base: 'max-h-[90vh] my-4',
      }}
    >
      <ModalContent
        className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-xl"
        style={{ maxWidth: `min(${maxW}, calc(100vw - 2rem))` }}
      >
        {(onCloseModal) => (
          <>
            {showHeader && (
              <ModalHeader className="flex shrink-0 flex-col px-4 py-4 sm:px-5 sm:py-5">
                <div className="flex flex-row items-start justify-between gap-3 px-2 pb-2 sm:px-4">
                  <div className="flex min-w-0 flex-1 flex-row items-start gap-3">
                    {header}
                  </div>
                  <button
                    type="button"
                    onClick={onCloseModal}
                    className="mt-1 shrink-0 cursor-pointer rounded p-1 transition-colors hover:bg-gray-100"
                    aria-label="Close"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.5875 0.423757C14.4834 0.319466 14.3598 0.236725 14.2237 0.180271C14.0876 0.123817 13.9417 0.0947577 13.7944 0.0947577C13.647 0.0947577 13.5011 0.123817 13.365 0.180271C13.229 0.236725 13.1053 0.319466 13.0012 0.423757L7.5 5.91376L1.99875 0.412507C1.8946 0.308353 1.77095 0.225733 1.63486 0.169364C1.49878 0.112996 1.35292 0.0839844 1.20563 0.0839844C1.05833 0.0839844 0.912473 0.112996 0.776388 0.169364C0.640304 0.225733 0.516654 0.308353 0.4125 0.412507C0.308345 0.516662 0.225725 0.640311 0.169357 0.776396C0.112989 0.912481 0.0839767 1.05834 0.0839767 1.20563C0.0839767 1.35293 0.112989 1.49878 0.169357 1.63487C0.225725 1.77095 0.308345 1.8946 0.4125 1.99876L5.91375 7.50001L0.4125 13.0013C0.308345 13.1054 0.225725 13.2291 0.169357 13.3651C0.112989 13.5012 0.0839767 13.6471 0.0839767 13.7944C0.0839767 13.9417 0.112989 14.0875 0.169357 14.2236C0.225725 14.3597 0.308345 14.4834 0.4125 14.5875C0.516654 14.6917 0.640304 14.7743 0.776388 14.8306C0.912473 14.887 1.05833 14.916 1.20563 14.916C1.35292 14.916 1.49878 14.887 1.63486 14.8306C1.77095 14.7743 1.8946 14.6917 1.99875 14.5875L7.5 9.08626L13.0012 14.5875C13.1054 14.6917 13.2291 14.7743 13.3651 14.8306C13.5012 14.887 13.6471 14.916 13.7944 14.916C13.9417 14.916 14.0875 14.887 14.2236 14.8306C14.3597 14.7743 14.4833 14.6917 14.5875 14.5875C14.6917 14.4834 14.7743 14.3597 14.8306 14.2236C14.887 14.0875 14.916 13.9417 14.916 13.7944C14.916 13.6471 14.887 13.5012 14.8306 13.3651C14.7743 13.2291 14.6917 13.1054 14.5875 13.0013L9.08625 7.50001L14.5875 1.99876C15.015 1.57126 15.015 0.851258 14.5875 0.423757Z"
                        fill="#616161"
                      />
                    </svg>
                  </button>
                </div>
                {showTopBorder && <CustomHr />}
              </ModalHeader>
            )}
            <ModalBody className="max-h-[550px] min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-3 sm:px-5">
              {body}
            </ModalBody>
            {showFooter && (
              <ModalFooter
                className={`mx-3 my-2 flex shrink-0 ${justifyButton} gap-5 border-t-2 border-gray-200`}
              >
                <Button
                  variant={cancelvariant}
                  onClick={customCancelHandler || onCloseModal}
                >
                  {cancelButton}
                </Button>
                {showFooterSubmit && (
                  <Button
                    disabled={submitDisabled}
                    variant={variant}
                    onClick={isLoading ? null : handleSubmit}
                  >
                    {isLoading ? <Loader /> : submitValue}
                  </Button>
                )}
              </ModalFooter>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CustomModal;
