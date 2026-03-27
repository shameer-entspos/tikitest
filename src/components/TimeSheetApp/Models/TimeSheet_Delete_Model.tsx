import { Button } from "@/components/Buttons";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";

const TimeSheetDeleteModal = ({
  handleClose,
  title,
  subtitle,
  onDeleteButton,
  doneValue,
}: {
  title: any;
  handleClose: any;
  onDeleteButton: any;
  doneValue: any;
  subtitle: string;
}) => {
  return (
    <Modal
      isOpen={true}
      onOpenChange={handleClose}
      placement="top-center"
      size="xl"
    >
      <ModalContent className="max-w-[600px] rounded-3xl bg-white">
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-row items-start gap-2 px-5 py-5">
              <img src="/images/warningLogo.svg" alt="" />
              <div>
                <h2 className="text-xl font-semibold text-[#1E1E1E]">
                  {title}
                </h2>
                <span className="mt-1 text-base font-normal text-[#616161]">
                  {subtitle}
                </span>
              </div>
            </ModalHeader>
            <ModalBody className="my-4"></ModalBody>
            <ModalFooter className="border-t-2 border-gray-200">
              <Button variant="primaryOutLine" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="danger" onClick={onDeleteButton}>
                {doneValue}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TimeSheetDeleteModal;
