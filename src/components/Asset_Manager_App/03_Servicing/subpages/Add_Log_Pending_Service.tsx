import { Button } from '@/components/Buttons';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { SimpleInput } from '@/components/Form/simpleInput';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { getAllOrgUsers } from '@/app/(main)/(user-panel)/user/apps/api';
import CustomDateRangePicker from '@/components/customDatePicker';
import ServiceLogImageUpload from './service_log_image_upload';
import {
  createPendingServiceLog,
  createServiceSchedule,
} from '@/app/(main)/(user-panel)/user/apps/am/api';
import Loader from '@/components/DottedLoader/loader';
import { ServiceSchedule } from '@/app/type/group_service_schedule';
import { useAssetManagerAppsContext } from '@/app/(main)/(user-panel)/user/apps/am/am_context';
import { uploadImageToApp } from '@/components/apps/shared/appImageUpload';
import { useStagedImageUploads } from '@/components/apps/shared/useStagedImageUploads';
const AddPendingServiceLog = ({
  model,
  handleClose,
}: {
  handleClose: any;
  model: ServiceSchedule | undefined;
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const queryClient = useQueryClient();
  // createSeriveSchedule
  const createSeriveSchedule = useMutation(createPendingServiceLog, {
    onSuccess: () => {
      handleClose();
      queryClient.invalidateQueries('pendingserviceSchedule');
    },
  });
  const [selectedVenderId, setSelectedVenderId] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const stagedUploads = useStagedImageUploads({
    existingCount: uploadedImages.length,
    maxFiles: 5,
  });
  // Validation schema
  const appFormValidatorSchema = Yup.object().shape({
    vendor: Yup.string().required('Vendor is required'), // Vendor validation
    serviceDate: Yup.date().nullable().required('Service date is required'), // Allow null until selected
  });

  const { state, dispatch } = useAssetManagerAppsContext();
  // Formik configuration
  const organizationForm = useFormik({
    initialValues: {
      serviceCost: '',
      description: '',
      purchaseNote: '',
      vendor: '',
      serviceDate: null,
    },
    validationSchema: appFormValidatorSchema,
    onSubmit: async (values) => {
      let stagedImageUrls: string[] = [];

      try {
        stagedImageUrls = await stagedUploads.uploadPending<string>({
          onUploaded: async (fileUrl) => {
            setUploadedImages((currentImages) => [...currentImages, fileUrl]);
          },
          uploadFile: async (file, onProgress) =>
            uploadImageToApp({
              appId: state.appId!,
              axiosAuth,
              file,
              onProgress,
            }),
        });
      } catch {
        return;
      }

      console.log(values); // Handle form submission
      const data = {
        ...values,
        assets: model?.assets.map((asset: any) => asset._id),
        images: [...uploadedImages, ...stagedImageUrls],
      };
      createSeriveSchedule.mutate({
        axiosAuth,
        data,
        id: model?._id ?? '',
      });
    },
  });
  const axiosAuth = useAxiosAuth();
  const { data } = useQuery({
    queryKey: 'listofUsersForApp',
    queryFn: () => getAllOrgUsers(axiosAuth),
    refetchOnWindowFocus: false,
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
            <ModalHeader className="flex flex-row items-start gap-2 border-b-2 border-gray-200 px-5 py-5">
              <svg
                width="50"
                height="50"
                viewBox="0 0 50 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                <path
                  d="M17.5 23.125H23.125V25H17.5V23.125ZM17.5 15.625H28.75V17.5H17.5V15.625ZM17.5 19.375H28.75V21.25H17.5V19.375ZM17.5 32.5H23.125V34.375H17.5V32.5ZM38.125 32.5V30.625H36.1553C36.0337 30.0384 35.8007 29.4805 35.4691 28.9816L36.8659 27.5847L35.5403 26.2591L34.1434 27.6559C33.6445 27.3243 33.0866 27.0913 32.5 26.9697V25H30.625V26.9697C30.0384 27.0913 29.4805 27.3243 28.9816 27.6559L27.5847 26.2591L26.2591 27.5847L27.6559 28.9816C27.3243 29.4805 27.0913 30.0384 26.9697 30.625H25V32.5H26.9697C27.0913 33.0866 27.3243 33.6445 27.6559 34.1434L26.2591 35.5403L27.5847 36.8659L28.9816 35.4691C29.4805 35.8007 30.0384 36.0337 30.625 36.1553V38.125H32.5V36.1553C33.0866 36.0337 33.6445 35.8007 34.1434 35.4691L35.5403 36.8659L36.8659 35.5403L35.4691 34.1434C35.8007 33.6445 36.0337 33.0866 36.1553 32.5H38.125ZM31.5625 34.375C31.0062 34.375 30.4625 34.2101 30 33.901C29.5374 33.592 29.177 33.1527 28.9641 32.6388C28.7512 32.1249 28.6955 31.5594 28.804 31.0138C28.9126 30.4682 29.1804 29.9671 29.5738 29.5738C29.9671 29.1804 30.4682 28.9126 31.0138 28.804C31.5594 28.6955 32.1249 28.7512 32.6388 28.9641C33.1527 29.177 33.592 29.5374 33.901 30C34.2101 30.4625 34.375 31.0062 34.375 31.5625C34.3743 32.3082 34.0777 33.0231 33.5504 33.5504C33.0231 34.0777 32.3082 34.3743 31.5625 34.375Z"
                  fill="#0063F7"
                />
                <path
                  d="M23.125 38.125H15.625C15.1277 38.125 14.6508 37.9275 14.2992 37.5758C13.9475 37.2242 13.75 36.7473 13.75 36.25V13.75C13.75 13.2527 13.9475 12.7758 14.2992 12.4242C14.6508 12.0725 15.1277 11.875 15.625 11.875H30.625C31.1223 11.875 31.5992 12.0725 31.9508 12.4242C32.3025 12.7758 32.5 13.2527 32.5 13.75V23.125H30.625V13.75H15.625V36.25H23.125V38.125Z"
                  fill="#0063F7"
                />
              </svg>

              <div>
                <h2 className="text-xl font-semibold text-[#1E1E1E]">
                  Add Service Log
                </h2>
                <span className="mt-1 text-base font-normal text-[#616161]">
                  Add service log details below.
                </span>
              </div>
            </ModalHeader>
            <ModalBody className="my-4">
              <div className="flex h-[520px] flex-col overflow-y-scroll px-4">
                <div className="relative mb-4 w-full">
                  <CustomSearchSelect
                    label="Vendor / Supplier"
                    data={[
                      {
                        label: 'My Organization',
                        value: 'all',
                      },
                      ...(data ?? []).map((user) => ({
                        label: `${user.firstName} ${user.lastName}`,
                        value: user._id,
                        photo: user.photo,
                      })),
                    ]}
                    onSelect={(values) => {
                      if (values.length > 0) {
                        organizationForm.setFieldValue('vendor', values[0]);
                        setSelectedVenderId(values[0]);
                      }
                    }}
                    selected={[selectedVenderId]}
                    hasError={false}
                    showImage={true}
                    isRequired={true}
                    multiple={false}
                    isOpen={openDropdown === 'dropdown3'}
                    onToggle={() => handleToggle('dropdown3')}
                  />
                  {organizationForm.errors.vendor &&
                    organizationForm.touched.vendor && (
                      <span className="text-xs text-red-500">
                        {organizationForm.errors.vendor.toString()}
                      </span>
                    )}
                </div>
                <div className="relative mb-4 w-full">
                  <CustomDateRangePicker
                    title="Service Date"
                    isRequired={true}
                    handleOnConfirm={(date: Date) => {
                      organizationForm.setFieldValue('serviceDate', date);
                    }}
                    selectedDate={organizationForm.values.serviceDate}
                  />
                  {organizationForm.errors.serviceDate &&
                    organizationForm.touched.serviceDate && (
                      <span className="text-xs text-red-500">
                        {organizationForm.errors.serviceDate.toString()}
                      </span>
                    )}
                </div>
                <div className="pb-3">
                  <SimpleInput
                    label="Serviced Cost"
                    type="text"
                    placeholder="Give your roll call title"
                    name="serviceCost"
                    className="w-full"
                    errorMessage={organizationForm.errors.serviceCost}
                    value={organizationForm.values.serviceCost}
                    isTouched={organizationForm.touched.serviceCost}
                    onChange={organizationForm.handleChange}
                  />
                </div>
                <div className="pb-3">
                  <SimpleInput
                    label="Currency / Purchase Note"
                    type="text"
                    placeholder="Give your roll call title"
                    name="purchaseNote"
                    className="w-full"
                    errorMessage={organizationForm.errors.purchaseNote}
                    value={organizationForm.values.purchaseNote}
                    isTouched={organizationForm.touched.purchaseNote}
                    onChange={organizationForm.handleChange}
                  />
                </div>
                <div className="pb-3">
                  <label className="mb-2 block px-2" htmlFor="reasone">
                    Description
                  </label>
                  <textarea
                    rows={6}
                    id="description"
                    name="description"
                    placeholder="Describe the service description"
                    value={organizationForm.values.description}
                    className={` ${
                      organizationForm.errors.description &&
                      organizationForm.touched.description
                        ? 'border-red-500'
                        : 'border-[#EEEEEE]'
                    } w-full resize-none rounded-xl border-2 border-gray-300 p-2 shadow-sm`}
                    onChange={organizationForm.handleChange}
                  />
                  {organizationForm.errors.description &&
                    organizationForm.touched.description && (
                      <span className="text-xs text-red-500">
                        {organizationForm.errors.description}
                      </span>
                    )}
                  <ServiceLogImageUpload
                    onRemoveUploadedImage={(fileUrl) => {
                      setUploadedImages((currentImages) =>
                        currentImages.filter((image) => image !== fileUrl)
                      );
                    }}
                    stagedUploads={stagedUploads}
                    uploadedImages={uploadedImages}
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-center gap-10 border-t-2 border-gray-200">
              <Button variant="primaryOutLine" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={!organizationForm.isValid}
                onClick={() => {
                  organizationForm.submitForm();
                }}
              >
                {createSeriveSchedule.isLoading ? <Loader /> : <>Add</>}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddPendingServiceLog;
