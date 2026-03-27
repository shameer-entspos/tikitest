import { Button } from '@/components/Buttons';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';

const CustomInfoModal = ({
  handleClose,
  title,
  subtitle,
  onDeleteButton,
  doneValue,
  handleArrow,
  cancelButton = 'Cancel',
  imageValue = '/images/warningLogo.svg',
  variant = 'danger',
  cancelvariant = 'primaryOutLine',
  isCancelHide = false,
  isOpen = true,
  svg,
}: {
  title: any;
  handleArrow?: any;
  handleClose: any;
  onDeleteButton: any;
  cancelButton?: string;
  doneValue: any;
  subtitle: any;
  isOpen?: boolean;
  isCancelHide?: boolean;
  imageValue?: string;
  svg?: any;
  cancelvariant?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'primaryRounded'
    | 'primaryOutLine'
    | 'danger'
    | 'outlinePrimaryRounded'
    | 'simple'
    | 'text';
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
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => {
        if (handleArrow) {
          handleArrow();
        } else {
          handleClose();
        }
      }}
      placement="top-center"
      size="xl"
    >
      <ModalContent className="max-w-[600px] rounded-3xl bg-white">
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-row items-start justify-between gap-2 px-5 py-5">
              <div className="flex flex-row items-start gap-2">
                {svg ?? <img src={imageValue} alt="" />}
                <div>
                  <h2 className="text-xl font-semibold text-[#1E1E1E]">
                    {title}
                  </h2>
                  <span className="mt-1 text-base font-normal text-[#616161]">
                    {subtitle}
                  </span>
                </div>
              </div>
              <svg
                onClick={onCloseModal}
                className="cursor-pointer"
                width="18"
                height="18"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.5875 0.423757C14.4834 0.319466 14.3598 0.236725 14.2237 0.180271C14.0876 0.123817 13.9417 0.0947577 13.7944 0.0947577C13.647 0.0947577 13.5011 0.123817 13.365 0.180271C13.229 0.236725 13.1053 0.319466 13.0012 0.423757L7.5 5.91376L1.99875 0.412507C1.8946 0.308353 1.77095 0.225733 1.63486 0.169364C1.49878 0.112996 1.35292 0.0839844 1.20563 0.0839844C1.05833 0.0839844 0.912473 0.112996 0.776388 0.169364C0.640304 0.225733 0.516654 0.308353 0.4125 0.412507C0.308345 0.516662 0.225725 0.640311 0.169357 0.776396C0.112989 0.912481 0.0839767 1.05834 0.0839767 1.20563C0.0839767 1.35293 0.112989 1.49878 0.169357 1.63487C0.225725 1.77095 0.308345 1.8946 0.4125 1.99876L5.91375 7.50001L0.4125 13.0013C0.308345 13.1054 0.225725 13.2291 0.169357 13.3651C0.112989 13.5012 0.0839767 13.6471 0.0839767 13.7944C0.0839767 13.9417 0.112989 14.0875 0.169357 14.2236C0.225725 14.3597 0.308345 14.4834 0.4125 14.5875C0.516654 14.6917 0.640304 14.7743 0.776388 14.8306C0.912473 14.887 1.05833 14.916 1.20563 14.916C1.35292 14.916 1.49878 14.887 1.63486 14.8306C1.77095 14.7743 1.8946 14.6917 1.99875 14.5875L7.5 9.08626L13.0012 14.5875C13.1054 14.6917 13.2291 14.7743 13.3651 14.8306C13.5012 14.887 13.6471 14.916 13.7944 14.916C13.9417 14.916 14.0875 14.887 14.2236 14.8306C14.3597 14.7743 14.4833 14.6917 14.5875 14.5875C14.6917 14.4834 14.7743 14.3597 14.8306 14.2236C14.887 14.0875 14.916 13.9417 14.916 13.7944C14.916 13.6471 14.887 13.5012 14.8306 13.3651C14.7743 13.2291 14.6917 13.1054 14.5875 13.0013L9.08625 7.50001L14.5875 1.99876C15.015 1.57126 15.015 0.851258 14.5875 0.423757Z"
                  fill="#616161"
                />
              </svg>
            </ModalHeader>
            <ModalBody className="my-4"></ModalBody>
            <ModalFooter className="border-t-2 border-gray-200">
              {!isCancelHide && (
                <Button variant={cancelvariant} onClick={handleClose}>
                  {cancelButton}
                </Button>
              )}
              <Button variant={variant} onClick={onDeleteButton}>
                {doneValue}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CustomInfoModal;
