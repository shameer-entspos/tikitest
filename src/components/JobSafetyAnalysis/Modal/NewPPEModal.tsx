import React, { useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  createPPE,
  PPEModel,
  updatePPE,
} from '@/app/(main)/(user-panel)/user/apps/api';
import { useMutation, useQueryClient } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { SimpleInput } from '@/components/Form/simpleInput';
import Loader from '@/components/DottedLoader/loader';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { JSAAPPACTIONTYPE } from '@/app/helpers/user/enums';
import CustomModal from '@/components/Custom_Modal';
import CustomRadio from '@/components/CustomRadioButton/CustomRadioButton';
import ImageUploadWithProgress from '../CreateNewComponents/JSA_Upload_IMG';
import { uploadImageToApp } from '@/components/apps/shared/appImageUpload';
import { useStagedImageUploads } from '@/components/apps/shared/useStagedImageUploads';

const NewPPEModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const context = useJSAAppsCotnext();

  const item = context.state.selectedItem as PPEModel;
  const itemImages = useMemo(() => item?.images ?? [], [item?.images]);
  const itemSharing = item?.sharing === 2 ? 'sharedList' : 'myList';
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    itemImages
  );
  const [selectedSharing, setSelectedSharing] = useState<'myList' | 'sharedList'>(
    itemSharing
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const stagedUploads = useStagedImageUploads({
    existingCount: uploadedImages.length,
    maxFiles: 5,
  });
  const { clearStaged } = stagedUploads;

  useEffect(() => {
    if (!isOpen) return;

    setUploadedImages(itemImages);
    setSelectedSharing(itemSharing);
    clearStaged();
  }, [clearStaged, isOpen, itemImages, itemSharing]);

  const createPPEMutation = useMutation(createPPE, {
    onSuccess: () => {
      onClose();
      queryClient.invalidateQueries('ppeList');
    },
    onError: (error) => {
      onClose();
      console.error('Error creating PPE:', error);
    },
  });

  const updatePPEMutation = useMutation(updatePPE, {
    onSuccess: () => {
      onClose();
      queryClient.invalidateQueries('ppeList');
    },
    onError: (error) => {
      onClose();
      console.error('Error updating PPE:', error);
    },
  });

  const validationSchema = Yup.object({
    name: Yup.string().required('PPE & Safety Gear Name is required'),
    description: Yup.string().optional(),
  });

  const initialValues = {
    name: item?.name ?? '',
    description: item?.description ?? '',
  };

  const ppeForm = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await handleSubmit(values);
    },
  });

  const handleSubmit = async (values: typeof initialValues) => {
    setIsSubmitting(true);
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
      setIsSubmitting(false);
      return;
    }

    const data = {
      ...values,
      images: [...uploadedImages, ...stagedImageUrls],
      sharing: selectedSharing === 'sharedList' ? 2 : 1,
    };

    if (item) {
      if (context.state.showModal === 'editModal') {
        updatePPEMutation.mutate({ data, axiosAuth, itemId: item._id! });
      } else if (context.state.showModal === 'duplicateModel') {
        createPPEMutation.mutate({
          data: { ...data, copyFrom: item._id },
          axiosAuth,
        });
      }
      return;
    }

    createPPEMutation.mutate({ data, axiosAuth });
  };

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!createPPEMutation.isLoading && !updatePPEMutation.isLoading) {
      setIsSubmitting(false);
    }
  }, [createPPEMutation.isLoading, updatePPEMutation.isLoading]);

  const isBusy =
    isSubmitting || createPPEMutation.isLoading || updatePPEMutation.isLoading;

  return (
    <CustomModal
      isOpen={isOpen}
      header={
        <>
          <img src="/images/ppeLogo.svg" alt="" />
          <div>
            <h2 className="text-xl font-semibold">
              {context.state.showModal === 'NewModal'
                ? 'New'
                : context.state.showModal === 'editModal'
                  ? 'Edit'
                  : 'Duplicate'}{' '}
              PPE & Safety Gear
            </h2>
            <p className="mt-1 text-base font-normal text-[#616161]">
              {context.state.showModal === 'editModal' ? 'Edit' : 'Add'} PPE &
              Safety Gear details below.
            </p>
          </div>
        </>
      }
      body={
        <div className="flex max-h-[500px] flex-col overflow-auto p-4">
          <div className="mb-4">
            <SimpleInput
              type="text"
              label="PPE & Safety Gear Name"
              placeholder="Enter name of equipment"
              name="name"
              className="placeholder:text-xs md:placeholder:text-base"
              required
              errorMessage={ppeForm.errors.name}
              isTouched={ppeForm.touched.name}
              value={ppeForm.values.name}
              onChange={ppeForm.handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block" htmlFor="description">
              Description <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              placeholder="Give this equipment a clear description of what it does and how to use it."
              className="w-full resize-none rounded-xl border-2 border-[#EEEEEE] p-2 shadow-sm"
              value={ppeForm.values.description}
              onChange={ppeForm.handleChange}
            />
            {ppeForm.errors.description && ppeForm.touched.description && (
              <div className="text-sm text-red-500">{ppeForm.errors.description}</div>
            )}
          </div>

          <ImageUploadWithProgress
            appId={context.state.jsaAppId}
            helperText="Images stay local until you save this PPE item."
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
            <label className="mb-2 block text-sm font-medium text-[#1E1E1E]">
              Sharing
            </label>
            <div className="flex flex-col gap-2">
              <CustomRadio
                name="sharing"
                value="myList"
                checkedValue={selectedSharing === 'myList' ? 'myList' : ''}
                onChange={() => setSelectedSharing('myList')}
                label="My List"
              />
              <CustomRadio
                name="sharing"
                value="sharedList"
                checkedValue={
                  selectedSharing === 'sharedList' ? 'sharedList' : ''
                }
                onChange={() => setSelectedSharing('sharedList')}
                label="Shared List"
              />
            </div>
          </div>
          {context.state.showModal == 'editModal' && (
            <div className="m-5 flex items-center justify-center">
              <button
                type="button"
                className="border-2 border-red-600 bg-white px-10 font-semibold text-red-600"
                onClick={() =>
                  context.dispatch({
                    type: JSAAPPACTIONTYPE.SHOWMODAL,
                    showModal: 'deleteModal',
                  })
                }
              >
                Delete
              </button>
            </div>
          )}
        </div>
      }
      handleCancel={onClose}
      isLoading={isBusy}
      handleSubmit={() => ppeForm.submitForm()}
      submitValue="Save"
    />
  );
};

export default NewPPEModal;
