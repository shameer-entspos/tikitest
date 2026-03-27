import {
  deleteJSASubmission,
  deletePPE,
} from '@/app/(main)/(user-panel)/user/apps/api';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { JSAAPPACTIONTYPE } from '@/app/helpers/user/enums';
import Loader from '@/components/DottedLoader/loader';
import { Button } from '@/components/Buttons';
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
import CustomInfoModal from '@/components/CustomDeleteModel';
const PPEDeleteModal = () => {
  const { state, dispatch } = useJSAAppsCotnext();
  const queryClient = useQueryClient();
  const deleteSubmissionMutation = useMutation(deletePPE, {
    onSuccess: () => {
      handleClose();

      queryClient.invalidateQueries('ppeList');
    },
    onError: () => {
      toast.error('Deletion Failed');
    },
  });
  const handleClose = () => {
    dispatch({ type: JSAAPPACTIONTYPE.SHOW_PPE_DELTE_MODEL });
  };
  const axiosAuth = useAxiosAuth();
  return (
    <>
      <CustomInfoModal
        isOpen={true}
        title={'Delete PPE and Safety Gear'}
        handleClose={handleClose}
        onDeleteButton={() => {
          deleteSubmissionMutation.mutate({
            axiosAuth,
            id: state.showPPEDeleteModel?._id!,
          });
        }}
        doneValue={
          deleteSubmissionMutation.isLoading ? (
            <>
              <Loader />
            </>
          ) : (
            <>Delete</>
          )
        }
        subtitle={
          'Are you sure you want to delete this Delete PPE and Safety Gear. This action cannot be undone.'
        }
      />
    </>
  );
};

export default PPEDeleteModal;
