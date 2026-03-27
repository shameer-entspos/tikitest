'use client';

import ServiceLogImageUpload from '@/components/Asset_Manager_App/03_Servicing/subpages/service_log_image_upload';
import { UseStagedImageUploadsReturn } from '@/components/apps/shared/useStagedImageUploads';

export default function UploadDocsAsset({
  stagedUploads,
  uploadedImages,
  onRemoveUploadedImage,
}: {
  stagedUploads?: UseStagedImageUploadsReturn;
  uploadedImages?: string[];
  onRemoveUploadedImage?: (fileUrl: string) => void;
}) {
  return (
    <ServiceLogImageUpload
      onRemoveUploadedImage={onRemoveUploadedImage}
      stagedUploads={stagedUploads}
      uploadedImages={uploadedImages}
    />
  );
}
