import {
  deleteJSASubmission,
  deleteMultipleJSASubmissions,
} from "@/app/(main)/(user-panel)/user/apps/api";
import { useJSAAppsCotnext } from "@/app/(main)/(user-panel)/user/apps/jsa/jsaContext";
import { JSAAPPACTIONTYPE } from "@/app/helpers/user/enums";
import { Button } from "@/components/Buttons";
import Loader from "@/components/DottedLoader/loader";
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
const JSAMultiDeleteModal = () => {
  const { state, dispatch } = useJSAAppsCotnext();
  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth();

  const deleteMultipleSubmissionsMutation = useMutation(
    deleteMultipleJSASubmissions,
    {
      onSuccess: () => {
        handleClose();
        if (
          Array.isArray(state.showMultiSubmissionDeleteModal) &&
          state.showMultiSubmissionDeleteModal.length > 0
        ) {
          // Iterate over each item in the array and invalidate corresponding queries
          state.showMultiSubmissionDeleteModal.forEach((item) => {
            if (item.isTemplate) {
              queryClient.invalidateQueries("JSATemplates");
            } else if (item.saveAs === "Draft") {
              queryClient.invalidateQueries("JSADraft");
            } else {
              queryClient.invalidateQueries("JSASubmissions");
            }
          });
        } else if (state.showSubmissionDeleteModel) {
          // Handle single deletion case
          if (state.showSubmissionDeleteModel?.isTemplate) {
            queryClient.invalidateQueries("JSATemplates");
          } else if (state.showSubmissionDeleteModel?.saveAs === "Draft") {
            queryClient.invalidateQueries("JSADraft");
          } else {
            queryClient.invalidateQueries("JSASubmissions");
          }
        }
      },
      onError: () => {
        toast.error("Deletion Failed");
      },
    },
  );

  const handleClose = () => {
    dispatch({
      type: JSAAPPACTIONTYPE.SHOW_MULTI_SUBMISSION_DELTE_MODEL,
      showMultiSubmissionDeleteModel: undefined,
    });
  };

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
                  {`Delete (${
                    state.showMultiSubmissionDeleteModal?.length || 0
                  }) ${
                    state.showMultiSubmissionDeleteModal?.length === 1
                      ? state.showMultiSubmissionDeleteModal[0]?.isTemplate
                        ? "Template"
                        : state.showMultiSubmissionDeleteModal[0]?.saveAs ===
                            "Draft"
                          ? "Draft"
                          : "Submission"
                      : "Submissions"
                  }`}
                </h2>
                <span className="mt-1 text-base font-normal text-[#616161]">
                  {`Are you sure you want to delete ${
                    state.showMultiSubmissionDeleteModal?.length === 1
                      ? state.showMultiSubmissionDeleteModal[0]?.isTemplate
                        ? "this Template"
                        : state.showMultiSubmissionDeleteModal[0]?.saveAs ===
                            "Draft"
                          ? "this Draft"
                          : "this Submission"
                      : `${
                          state.showMultiSubmissionDeleteModal?.length || 0
                        } Submissions`
                  }. This action cannot be undone.`}
                </span>
              </div>
            </ModalHeader>
            <ModalBody className="my-4"></ModalBody>
            <ModalFooter className="border-t-2 border-gray-200">
              <Button variant="primaryOutLine" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                className="bg-red-700 px-10 font-semibold text-white"
                onClick={() => {
                  console.log(state.showMultiSubmissionDeleteModal);

                  deleteMultipleSubmissionsMutation.mutate({
                    axiosAuth,
                    data: {
                      ids: state.showMultiSubmissionDeleteModal!.map(
                        (submission) => submission._id,
                      ),
                    },
                  });
                }}
              >
                {deleteMultipleSubmissionsMutation.isLoading ? (
                  <Loader />
                ) : (
                  <>Delete</>
                )}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default JSAMultiDeleteModal;
