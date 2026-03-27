import {
  deleteHazard,
  deleteJSASubmission,
  deletePPE,
} from "@/app/(main)/(user-panel)/user/apps/api";
import { useJSAAppsCotnext } from "@/app/(main)/(user-panel)/user/apps/jsa/jsaContext";
import { JSAAPPACTIONTYPE } from "@/app/helpers/user/enums";
import Loader from "@/components/DottedLoader/loader";
import { Button } from "@/components/Buttons";
import useAxiosAuth from "@/hooks/AxiosAuth";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
const HazardsDeleteModal = () => {
  const { state, dispatch } = useJSAAppsCotnext();
  const queryClient = useQueryClient();
  const deleteHazardsMutation = useMutation(deleteHazard, {
    onSuccess: () => {
      handleClose();
      // if (state.showPPEDeleteModel?.isTemplate) {
      //   queryClient.invalidateQueries("JSATemplates");
      // } else if (state.showPPEDeleteModel?.saveAs == "Draft") {
      //   queryClient.invalidateQueries("JSADraft");
      // } else {
      //   queryClient.invalidateQueries("JSASubmissions");
      // }
    },
    onError: () => {
      toast.error("Deletion Failed");
    },
  });
  const handleClose = () => {
    dispatch({ type: JSAAPPACTIONTYPE.SHOW_HAZARDS_DELTE_MODEL });
  };
  const axiosAuth = useAxiosAuth();
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
                  Delete PPE and Safety Gear
                </h2>
                <span className="mt-1 text-base font-normal text-[#616161]">
                  {`Are you sure you want to delete this Delete PPE and Safety Gear. This action cannot be undone.`}
                </span>
              </div>
            </ModalHeader>
            <ModalBody className="my-4"></ModalBody>
            <ModalFooter className="border-t-2 border-gray-200">
              <Button
                className="border-2 border-[#0063F7] bg-white px-10 font-semibold text-[#0063F7]"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-700 px-10 font-semibold text-white"
                onClick={() => {
                  deleteHazardsMutation.mutate({
                    axiosAuth,
                    id: state.showHazardsDeleteModel?._id!,
                  });
                }}
              >
                {deleteHazardsMutation.isLoading ? <Loader /> : <>Delete</>}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default HazardsDeleteModal;
