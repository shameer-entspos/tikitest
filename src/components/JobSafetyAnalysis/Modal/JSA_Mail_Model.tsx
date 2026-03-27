import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { JSAAPPACTIONTYPE } from '@/app/helpers/user/enums';
import SubmissionMailModal from '@/components/CommonComponents/SubmissionMailModal';

const JSAMailModel = () => {
  const { state, dispatch } = useJSAAppsCotnext();

  const handleClose = () => {
    dispatch({
      type: JSAAPPACTIONTYPE.SHOW_MAIL_SUBMISSION_MODEL,
      showMailSubmissionModel: undefined,
    });
  };

  if (!state.showMailSubmissionModel) {
    return null;
  }

  return (
    <SubmissionMailModal
      isOpen={!!state.showMailSubmissionModel}
      onClose={handleClose}
      appType="jsa"
      submissionId={state.showMailSubmissionModel._id}
      message=""
    />
  );
};

export default JSAMailModel;
