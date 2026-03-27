import { deleteMultipleHazards } from '@/app/(main)/(user-panel)/user/apps/api';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { Button } from '@/components/Buttons';
import Loader from '@/components/DottedLoader/loader';
import useAxiosAuth from '@/hooks/AxiosAuth';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from 'react-query';
const HazardsMultiDeleteModal = ({ handleClose }: { handleClose: any }) => {
  const { state, dispatch } = useJSAAppsCotnext();
  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth();

  const deleteMultipleHazardsMutation = useMutation(deleteMultipleHazards, {
    onSuccess: () => {
      handleClose();
      queryClient.invalidateQueries('hazards');
    },
    onError: () => {
      toast.error('Deletion Failed');
    },
  });

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
                    state.showMultiHazardsDeleteModal?.length || 0
                  }) Hazards`}
                </h2>
                <span className="mt-1 text-base font-normal text-[#616161]">
                  Are you sure you want to delete this Hazards. This action
                  cannot be undone.
                </span>
              </div>
            </ModalHeader>
            <ModalBody className="my-4"></ModalBody>
            <ModalFooter className="border-t-2 border-gray-200">
              <Button
                variant="primaryOutLine"
                className="text-blue"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                variant={'danger'}
                onClick={() => {
                  console.log(state.showMultiHazardsDeleteModal);

                  deleteMultipleHazardsMutation.mutate({
                    axiosAuth,
                    data: {
                      ids: state.showMultiHazardsDeleteModal!.map(
                        (submission) => submission._id
                      ),
                    },
                  });
                }}
              >
                {deleteMultipleHazardsMutation.isLoading ? (
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

export default HazardsMultiDeleteModal;
