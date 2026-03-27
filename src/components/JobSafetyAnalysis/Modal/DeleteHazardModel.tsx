import {
  deleteHazard,
  HazardModel,
} from "@/app/(main)/(user-panel)/user/apps/api";
import { useJSAAppsCotnext } from "@/app/(main)/(user-panel)/user/apps/jsa/jsaContext";
import Loader from "@/components/DottedLoader/loader";
import useAxiosAuth from "@/hooks/AxiosAuth";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { useMutation, useQueryClient } from "react-query";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const DeleteHazardModel = ({ isOpen, onClose }: Props) => {
  const context = useJSAAppsCotnext();
  const item = context.state.selectedItem as HazardModel;
  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth();
  const deleteHazardMutation = useMutation(deleteHazard, {
    onSuccess: () => {
      console.log("Done");
      queryClient.invalidateQueries("hazards");
      onClose();
    },
    onError: (err: any) => {
      onClose();
      console.log(err.message);
    },
  });
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      placement="top-center"
      className="w-[60%]"
    >
      <ModalContent className="max-w-[600px] rounded-3xl bg-white">
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex h-[50%] flex-row items-center gap-2 px-5 py-5 md:h-[30%]">
              <img src="/images/warningLogo.svg" alt="" />
              <div>
                <h2 className="text-xl font-semibold">
                  Delete Hazards & Risk?
                </h2>
                <p className="mt-1 text-base font-normal text-[#616161]">
                  Are you sure you want to delete this Hazards and Risk. This
                  action cannot be undone.
                </p>
              </div>
            </ModalHeader>
            <ModalBody className="w-[40%]"></ModalBody>
            <ModalFooter className="h-[30%] border-t-2 border-gray-200">
              <Button
                className="border-2 border-[#0063F7] bg-white px-10 font-semibold text-[#0063F7]"
                onPress={onClose}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-700 px-10 font-semibold text-white"
                onPress={() =>
                  deleteHazardMutation.mutate({ axiosAuth, id: item?._id! })
                }
              >
                {deleteHazardMutation.isLoading ? <Loader /> : "Delete"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DeleteHazardModel;
