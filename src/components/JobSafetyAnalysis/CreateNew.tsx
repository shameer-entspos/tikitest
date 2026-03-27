import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import React, { useCallback, useMemo } from 'react';
import { JSATopBar } from './CreateNewComponents/TopBar';
import { JSASelectProject } from './CreateNewComponents/SelectProject';
import { JSADetails } from './CreateNewComponents/JSADetails';
import { EmergencyPlan } from './CreateNewComponents/EmergencyPlan';
import { JSASteps } from './CreateNewComponents/JSA_Steps';
import { JSAReview } from './CreateNewComponents/JSA_Review';
import { JSAAPPACTIONTYPE } from '@/app/helpers/user/enums';
import { uploadImageToApp } from '@/components/apps/shared/appImageUpload';
import { useStagedImageUploads } from '@/components/apps/shared/useStagedImageUploads';
import useAxiosAuth from '@/hooks/AxiosAuth';

function CreateNew() {
  const context = useJSAAppsCotnext();
  const axiosAuth = useAxiosAuth();
  const emergencyImageUploads = useStagedImageUploads({
    existingCount: context.state.jsaEmergencyPlanImages?.length ?? 0,
    maxFiles: 5,
  });

  const uploadPendingEmergencyImages = useCallback(async () => {
    if (!context.state.jsaAppId || !emergencyImageUploads.hasStagedFiles) {
      return [];
    }

    return emergencyImageUploads.uploadPending<string>({
      onUploaded: async (fileUrl) => {
        context.dispatch({
          type: JSAAPPACTIONTYPE.JSA_EMERGENCY_IMAGE,
          jsaEmergencyPlanImages: fileUrl,
        });
      },
      uploadFile: async (file, onProgress) =>
        uploadImageToApp({
          appId: context.state.jsaAppId!,
          axiosAuth,
          file,
          onProgress,
        }),
    });
  }, [axiosAuth, context, emergencyImageUploads]);

  const memoizedTopBar = useMemo(
    () => <JSATopBar uploadPendingImages={uploadPendingEmergencyImages} />,
    [uploadPendingEmergencyImages]
  );

  return (
    <div className="absolute inset-0 z-10 flex h-[calc(var(--app-vh)-70px)] w-full max-w-[1360px] flex-col bg-white px-4 pt-4 font-Open-Sans">
      {/* TopBar */}
      {memoizedTopBar}

      {/* Middle content — flows with page scroll, no internal overflow */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* SelectProject */}
        {context.state.createNewSection == 'project' && (
          <JSASelectProject
            uploadPendingImages={uploadPendingEmergencyImages}
          />
        )}

        {/* JSADetails */}
        {context.state.createNewSection == 'jsaDetail' && (
          <JSADetails uploadPendingImages={uploadPendingEmergencyImages} />
        )}

        {/* EmergencyPlan */}
        {context.state.createNewSection == 'emergency' && (
          <EmergencyPlan
            stagedUploads={emergencyImageUploads}
            uploadPendingImages={uploadPendingEmergencyImages}
          />
        )}

        {/* JSASteps */}
        {context.state.createNewSection === 'step' && (
          <JSASteps uploadPendingImages={uploadPendingEmergencyImages} />
        )}

        {/* JSAReview */}
        {context.state.createNewSection === 'review' && (
          <JSAReview
            stagedUploads={emergencyImageUploads}
            uploadPendingImages={uploadPendingEmergencyImages}
          />
        )}
      </div>
    </div>
  );
}

export default CreateNew;
