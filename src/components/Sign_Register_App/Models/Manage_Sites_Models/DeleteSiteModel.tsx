import {
  deleteHazard,
  HazardModel,
} from "@/app/(main)/(user-panel)/user/apps/api";
import { useJSAAppsCotnext } from "@/app/(main)/(user-panel)/user/apps/jsa/jsaContext";
import { deleteSite } from "@/app/(main)/(user-panel)/user/apps/sr/api";
import { Site } from "@/app/type/Sign_Register_Sites";
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
  site: Site | undefined;
};

const DeleteSiteModel = ({ isOpen, onClose, site }: Props) => {
  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth();
  const deleteMutation = useMutation(deleteSite, {
    onSuccess: () => {
      queryClient.invalidateQueries("appsites");
      onClose();
    },
    onError: (err: any) => {
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
                <h2 className="text-xl font-semibold">Delete Site?</h2>
                <p className="mt-1 text-base font-normal text-[#616161]">
                  Are you sure you want to delete ?
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
                  deleteMutation.mutate({ axiosAuth, id: site?._id! })
                }
              >
                {deleteMutation.isLoading ? <Loader /> : "Delete"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DeleteSiteModel;
