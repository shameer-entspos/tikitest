import { deleteJSASubmission } from '@/app/(main)/(user-panel)/user/apps/api';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { JSAAPPACTIONTYPE } from '@/app/helpers/user/enums';
import Loader from '@/components/DottedLoader/loader';
import CustomInfoModal from '@/components/CustomDeleteModel';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/navigation';

const JSADeleteModal = () => {
  const { state, dispatch } = useJSAAppsCotnext();
  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth();
  const router = useRouter();

  const deleteSubmissionMutation = useMutation(deleteJSASubmission, {
    onSuccess: () => {
      handleClose();
      if (state.showSubmissionDeleteModel?.isTemplate) {
        queryClient.invalidateQueries('JSATemplates');
      } else if (state.showSubmissionDeleteModel?.saveAs == 'Draft') {
        queryClient.invalidateQueries('JSADraft');
      } else {
        queryClient.invalidateQueries('JSASubmissions');
      }
      toast.success('Deleted successfully');
      
      // Navigate to submission list after successful deletion
      if (state.jsaAppId) {
        router.push(`/user/apps/jsa/${state.jsaAppId}`);
      }
    },
    onError: () => {
      toast.error('Deletion Failed');
    },
  });

  const handleClose = () => {
    dispatch({ type: JSAAPPACTIONTYPE.SHOW_SUBMISSION_DELTE_MODEL });
  };

  const getItemType = () => {
    if (state.showSubmissionDeleteModel?.isTemplate) {
      return 'Template';
    } else if (state.showSubmissionDeleteModel?.saveAs == 'Draft') {
      return 'Draft';
    } else {
      return 'Submission';
    }
  };

  return (
    <CustomInfoModal
      isOpen={!!state.showSubmissionDeleteModel}
      title={`Delete ${getItemType()}`}
      subtitle={`Are you sure you want to delete this ${getItemType()}. This action cannot be undone.`}
      handleClose={handleClose}
      onDeleteButton={() => {
        deleteSubmissionMutation.mutate({
          axiosAuth,
          id: state.showSubmissionDeleteModel?._id!,
        });
      }}
      doneValue={
        deleteSubmissionMutation.isLoading ? <Loader /> : <>Delete</>
      }
      variant="danger"
      cancelvariant="primaryOutLine"
    />
  );
};

export default JSADeleteModal;
