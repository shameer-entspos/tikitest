import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { Button } from '@/components/Buttons';
import Loader from '@/components/DottedLoader/loader';
import { SaveAsModel } from './Save_As_Model';

export function BottomButton({
  onNextClick,
  onCancel,
  onSavAs,
  uploadPendingImages,
  isDisabled = false,
  loading = false,
  isTemplateEdit = false,
}: {
  onNextClick: any;
  onCancel: any;
  onSavAs: any;
  uploadPendingImages?: () => Promise<string[]>;
  isDisabled?: boolean;
  loading?: boolean;
  isTemplateEdit?: boolean;
}) {
  const context = useJSAAppsCotnext();
  if (isTemplateEdit) {
    return (
      <div className="flex justify-end border-2 border-[#EEEEEE] p-2">
        <div className="flex gap-5">
          <div></div>
          <Button variant="primary" onClick={onNextClick}>
            Use Template
          </Button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex justify-between border-2 border-[#EEEEEE] p-2">
        {context.state.createNewSection == 'project' ? (
          <>
            <Button variant="primaryOutLine" onClick={onCancel}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button variant="primaryOutLine" onClick={onCancel}>
              Back
            </Button>
          </>
        )}
        <div className="flex items-center gap-2">
          {context.state.editSubmission ? (
            <>
              {!context.state.editSubmission.isTemplate && (
                <SaveAsModel uploadPendingImages={uploadPendingImages} />
              )}
            </>
          ) : (
            <SaveAsModel uploadPendingImages={uploadPendingImages} />
          )}

          {context.state.createNewSection == 'review' ? (
            <>
              <Button variant="primary" onClick={onNextClick} disabled={loading}>
                {loading ? (
                  <Loader />
                ) : (
                  <>
                    {context.state.editSubmission ? (
                      context.state.editSubmission.saveAs == 'Draft' ? (
                        <>Publish</>
                      ) : (
                        <>Save</>
                      )
                    ) : (
                      'Submit'
                    )}
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                className={
                  isDisabled
                    ? '!bg-[#9E9E9E] hover:!bg-[#9E9E9E] !text-white'
                    : ''
                }
                disabled={isDisabled}
                onClick={onNextClick}
              >
                Next
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }
}
