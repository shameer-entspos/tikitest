import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { PPEModel } from '@/app/(main)/(user-panel)/user/apps/api';
import { useQueryClient } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { Input } from '@/components/Form/Input';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { Button } from '@/components/Buttons';
import { generateRandomId } from '@/app/helpers/dateFormat';
import ImageUploadWithProgress from './JSA_Upload_IMG';
import { uploadImageToApp } from '@/components/apps/shared/appImageUpload';
import { useStagedImageUploads } from '@/components/apps/shared/useStagedImageUploads';

export function CreateNewPPEINSteps({
  handleShowCreate,
  onAdded,
}: {
  handleShowCreate: () => void;
  onAdded?: (ppe: PPEModel) => void;
}) {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const context = useJSAAppsCotnext();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedSharing, setSelectedSharing] = useState<
    'justOne' | 'myList' | 'sharedList'
  >('justOne');
  const stagedUploads = useStagedImageUploads({
    existingCount: uploadedImages.length,
    maxFiles: 5,
  });

  const initialValues = {
    name: '',
    description: '',
    sharing: selectedSharing,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('PPE & Safety Gear Name is required'),
    description: Yup.string().optional(),
  });

  const handleSubmit = async (values: typeof initialValues) => {
    let stagedImageUrls: string[] = [];

    try {
      stagedImageUrls = await stagedUploads.uploadPending<string>({
        onUploaded: async (fileUrl) => {
          setUploadedImages((currentImages) => [...currentImages, fileUrl]);
        },
        uploadFile: async (file, onProgress) =>
          uploadImageToApp({
            appId: context.state.jsaAppId!,
            axiosAuth,
            file,
            onProgress,
          }),
      });
    } catch {
      return;
    }

    const sharedValues =
      selectedSharing === 'sharedList'
        ? 2
        : selectedSharing === 'myList'
          ? 1
          : 3;
    const imageUrls = [...uploadedImages, ...stagedImageUrls];
    const data = {
      ...values,
      _id: generateRandomId(),
      images: imageUrls,
      sharing: sharedValues,
    };

    queryClient.setQueryData('PPEsList', (old: PPEModel[] | undefined) => {
      return old ? [...old, data as PPEModel] : [data as PPEModel];
    });

    onAdded?.(data as PPEModel);
    handleShowCreate();
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, handleSubmit, isValid }) => (
        <Form onSubmit={handleSubmit}>
          <div className="flex h-[545px] flex-col overflow-auto p-4">
            <div className="mb-4">
              <Input
                type="text"
                label=" PPE & Safety Gear Name"
                placeholder="Enter name of equipment"
                name="name"
                className="placeholder:text-xs md:placeholder:text-base"
                errorMessage={errors.name}
                isTouched={touched.name}
              />
            </div>
            <div className="mb-4">
              <label className="mb-2 block" htmlFor="description">
                Description <span className="text-gray-500">(optional)</span>
              </label>
              <Field
                as="textarea"
                id="description"
                name="description"
                rows={5}
                placeholder="Give this equipment a clear description of what it does and how to use it."
                className="w-full resize-none rounded-xl border-2 border-gray-300 p-2 shadow-sm"
              />
              <ErrorMessage
                name="description"
                component="div"
                className="text-sm text-red-500"
              />
            </div>

            <ImageUploadWithProgress
              appId={context.state.jsaAppId}
              helperText="Images stay local until you add this PPE item."
              label="Upload Photos"
              onRemoveUploadedImage={(fileUrl) => {
                setUploadedImages((currentImages) =>
                  currentImages.filter((image) => image !== fileUrl)
                );
              }}
              stagedUploads={stagedUploads}
              type="steps"
              uploadedImages={uploadedImages}
            />

            <div className="mb-4 mt-6">
              <label className="mb-2 block">Add this entry to</label>
              <div className="flex flex-col">
                <label className="mb-3 flex items-center">
                  <input
                    type="radio"
                    name="sharing"
                    value="justOne"
                    className="mr-2"
                    checked={selectedSharing === 'justOne'}
                    onChange={() => setSelectedSharing('justOne')}
                  />
                  Just this submission
                </label>
                <label className="mb-3 flex items-center">
                  <input
                    type="radio"
                    name="sharing"
                    value="myList"
                    className="mr-2"
                    checked={selectedSharing === 'myList'}
                    onChange={() => setSelectedSharing('myList')}
                  />
                  Saved to
                  <span className="font-bold">&nbsp;My List</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sharing"
                    value="sharedList"
                    className="mr-2"
                    checked={selectedSharing === 'sharedList'}
                    onChange={() => setSelectedSharing('sharedList')}
                  />
                  Saved to
                  <span className="font-bold">&nbsp;Shared List</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-center gap-16 py-6">
            <Button
              variant="simple"
              className="cursor-pointer text-primary-700"
              onClick={() => {
                handleShowCreate();
              }}
            >
              Back
            </Button>
            <Button
              variant="simple"
              className="cursor-pointer text-primary-700"
              disabled={!isValid}
            >
              Add To List
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
