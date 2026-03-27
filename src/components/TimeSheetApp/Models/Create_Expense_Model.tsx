import {
  getAllAppProjects,
  getAllOrgUsers,
} from '@/app/(main)/(user-panel)/user/apps/api';
import {
  createExpanse,
  updateExpanse,
} from '@/app/(main)/(user-panel)/user/apps/timesheets/api';
import { useTimeSheetAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/timesheets/timesheet_context';
import { getAllProjectList } from '@/app/(main)/(user-panel)/user/projects/api';
import { TIMESHEETTYPE } from '@/app/helpers/user/enums';
import { Expanse } from '@/app/type/expanse';
import Loader from '@/components/DottedLoader/loader';
import { SimpleInput } from '@/components/Form/simpleInput';
import useAxiosAuth from '@/hooks/AxiosAuth';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import { useFormik } from 'formik';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { CustomSearchSelect } from '../CommonComponents/Custom_Select/Custom_Search_Select';
import ImageExpenseUploadWithProgress from './Time_Sheet_Image_Picker';
import { getCustomersList } from '@/app/(main)/(user-panel)/user/apps/am/api';
import { Button } from '@/components/Buttons';
import { uploadImageToApp } from '@/components/apps/shared/appImageUpload';
import { useStagedImageUploads } from '@/components/apps/shared/useStagedImageUploads';

const CreateExpenseModel = ({ expanse }: { expanse: Expanse | undefined }) => {
  const { state, dispatch } = useTimeSheetAppsCotnext();
  const [selectedProject, setSeelctedProjects] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [submittedBy, setSelectedUsers] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [submissionStatus, setStatus] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    expanse?.images ?? []
  );

  const axiosAuth = useAxiosAuth();
  const stagedUploads = useStagedImageUploads({
    existingCount: uploadedImages.length,
    maxFiles: 5,
  });
  const expenseImages = useMemo(() => expanse?.images ?? [], [expanse?.images]);
  const { clearStaged } = stagedUploads;
  const queryClient = useQueryClient();
  const createMutation = useMutation(createExpanse, {
    onSuccess: () => {
      queryClient.invalidateQueries('expenses');
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create expense');
    },
  });
  const updateMutation = useMutation(updateExpanse, {
    onSuccess: () => {
      queryClient.invalidateQueries('expenses');
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update expense');
    },
  });
  const handleClose = () => {
    dispatch({ type: TIMESHEETTYPE.SELECTED_EXPANSE });
  };
  useEffect(() => {
    setUploadedImages(expenseImages);
    clearStaged();
  }, [clearStaged, expenseImages]);
  const appFormValidator = (values: any) => {
    const errors: any = {};

    // Required: Assigned Project
    if (!values.selectedProject || values.selectedProject.length === 0) {
      errors.selectedProject = 'At least one project must be selected';
    }

    // Required: Assigned Customer
    if (!values.customer || String(values.customer).trim() === '') {
      errors.customer = 'Customer is required';
    }

    // Required: Assigned Supplier
    if (!values.supplier || String(values.supplier).trim() === '') {
      errors.supplier = 'Supplier is required';
    }

    // Optional: Invoice Value, Reference, Description, Attach Files - no validation

    return errors;
  };

  const organizationForm = useFormik({
    initialValues: {
      reference: expanse?.reference ?? '',
      selectedProject: expanse?.projects?.map((p) => p._id) ?? [],
      customer: expanse?.customer ?? '',
      supplier: expanse?.supplier ?? '',
      invoiceValue: expanse?.invoiceValue ?? '',
      description: expanse?.description ?? '',
      images: expanse?.images ?? state.expenseImages ?? [],
    },
    validate: appFormValidator,
    validateOnMount: false,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  const handleSubmit = async (values: any) => {
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

    const data = {
      reference: values.reference ?? '',
      projects: values.selectedProject ?? [], // Initialize with empty array
      supplier: values.supplier ?? '',
      customer: values.customer ?? '',
      invoiceValue: values.invoiceValue ?? '',
      description: values.description ?? '',
      images: [...uploadedImages, ...stagedImageUrls],
    };

    if (expanse) {
      updateMutation.mutate({ id: expanse._id, data, axiosAuth });
    } else {
      createMutation.mutate({ data, axiosAuth });
    }
  };

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const { data: users, isLoading: userLoading } = useQuery({
    queryKey: 'customers',
    queryFn: () => getCustomersList(axiosAuth),
  });
  const { data: projects, isLoading: projectLoading } = useQuery({
    queryKey: 'allUserAssignedProjects',
    queryFn: () => getAllAppProjects(axiosAuth),
  });

  return (
    <Modal
      isOpen={true}
      onOpenChange={handleClose}
      placement="top-center"
      size="xl"
      backdrop="blur"
    >
      <ModalContent className="max-w-[600px] rounded-3xl bg-white">
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-row items-start gap-2 px-5 py-4">
              <div className="flex w-full flex-row items-start gap-4 border-b-2 py-2">
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                  <path
                    d="M13.75 37.5V12.5L15.625 14.375L17.5 12.5L19.375 14.375L21.25 12.5L23.125 14.375L25 12.5L26.875 14.375L28.75 12.5L30.625 14.375L32.5 12.5L34.375 14.375L36.25 12.5V37.5L34.375 35.625L32.5 37.5L30.625 35.625L28.75 37.5L26.875 35.625L25 37.5L23.125 35.625L21.25 37.5L19.375 35.625L17.5 37.5L15.625 35.625L13.75 37.5ZM17.5 31.25H32.5V28.75H17.5V31.25ZM17.5 26.25H32.5V23.75H17.5V26.25ZM17.5 21.25H32.5V18.75H17.5V21.25Z"
                    fill="#0063F7"
                  />
                </svg>

                <div>
                  <h1>{expanse ? 'Edit Expense' : 'Add Expense'}</h1>
                  {expanse ? (
                    <span className="text-base font-normal text-[#616161]">
                      Edit expense details below.
                    </span>
                  ) : (
                    <span className="text-base font-normal text-[#616161]">
                      Add expense details below.
                    </span>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="ml-auto cursor-pointer text-gray-500 hover:text-gray-700"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </ModalHeader>
            <ModalBody className="mt-4">
              <div className="h-[60vh] max-h-[520px] w-full overflow-y-scroll px-6">
                <div className="relative mb-8 overflow-visible">
                  <CustomSearchSelect
                    label="Assigned Project"
                    isRequired={true}
                    data={(projects ?? []).flatMap((pro) => {
                      return [
                        {
                          label: pro.name ?? '',
                          value: pro._id,
                        },
                      ];
                    })}
                    showImage={false}
                    selected={organizationForm.values.selectedProject ?? []}
                    onSelect={(values) => {
                      const projectIds = Array.isArray(values)
                        ? values
                        : [values];
                      setSeelctedProjects(
                        projectIds.map((v) => ({ label: '', value: v }))
                      );
                      organizationForm.setFieldValue(
                        'selectedProject',
                        projectIds
                      );
                      organizationForm.setFieldTouched('selectedProject', true);
                    }}
                    hasError={
                      !!organizationForm.errors.selectedProject &&
                      (organizationForm.touched.selectedProject ||
                        organizationForm.submitCount > 0)
                    }
                    isOpen={openDropdown === 'dropdown1'}
                    onToggle={() => handleToggle('dropdown1')}
                  />
                </div>

                <div className="relative mb-8">
                  <CustomSearchSelect
                    label="Assigned Customer"
                    isRequired={true}
                    data={[
                      { label: 'My Organization', value: 'My Organization' },
                      ...(users ?? [])
                        .filter((c) => c.role == 4)
                        .flatMap((user) => {
                          return [
                            {
                              label: `${user.customerName} - ${user.userId}`,
                              value: `${user.customerName}`,
                              photo: user.photo,
                            },
                          ];
                        }),
                    ]}
                    onSelect={(values) => {
                      const customerValue = Array.isArray(values)
                        ? (values[0] ?? '')
                        : (values ?? '');
                      organizationForm.setFieldValue('customer', customerValue);
                      organizationForm.setFieldTouched('customer', true);
                    }}
                    selected={
                      organizationForm.values.customer
                        ? [organizationForm.values.customer]
                        : []
                    }
                    returnSingleValueWithLabel={true}
                    showImage={true}
                    hasError={
                      !!organizationForm.errors.customer &&
                      (organizationForm.touched.customer ||
                        organizationForm.submitCount > 0)
                    }
                    multiple={false}
                    isOpen={openDropdown === 'dropdown2'}
                    onToggle={() => handleToggle('dropdown2')}
                  />
                </div>
                <div className="relative mb-8">
                  <CustomSearchSelect
                    label="Assigned Supplier"
                    isRequired={true}
                    data={[
                      { label: 'My Organization', value: 'My Organization' },
                      ...(users ?? [])
                        .filter((c) => c.role == 5)
                        .flatMap((user) => {
                          return [
                            {
                              label: `${user.customerName} - ${user.userId}`,
                              value: `${user.customerName}`,
                              photo: user.photo,
                            },
                          ];
                        }),
                    ]}
                    onSelect={(values) => {
                      const supplierValue = Array.isArray(values)
                        ? (values[0] ?? '')
                        : (values ?? '');
                      organizationForm.setFieldValue('supplier', supplierValue);
                      organizationForm.setFieldTouched('supplier', true);
                    }}
                    selected={
                      organizationForm.values.supplier
                        ? [organizationForm.values.supplier]
                        : []
                    }
                    returnSingleValueWithLabel={true}
                    showImage={true}
                    hasError={
                      !!organizationForm.errors.supplier &&
                      (organizationForm.touched.supplier ||
                        organizationForm.submitCount > 0)
                    }
                    multiple={false}
                    isOpen={openDropdown === 'dropdown3'}
                    onToggle={() => handleToggle('dropdown3')}
                  />
                </div>
                <SimpleInput
                  type="number"
                  step="0.01"
                  label="Invoice Value (Optional)"
                  placeholder="Enter invoice value"
                  name="invoiceValue"
                  className="w-full"
                  value={organizationForm.values.invoiceValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only numbers and decimal point
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      organizationForm.setFieldValue('invoiceValue', value);
                    }
                  }}
                />
                <label className="mb-2 block" htmlFor="reference">
                  Reference
                  <span className="text-[14px] text-[#616161]">
                    {' (Optional)'}
                  </span>
                </label>
                <SimpleInput
                  type="text"
                  placeholder="Enter a reference here"
                  name="reference"
                  className="w-full"
                  value={organizationForm.values.reference}
                  onChange={organizationForm.handleChange}
                />

                <div className="">
                  <label className="mb-2 block" htmlFor={`description`}>
                    Description
                    <span className="text-[14px] text-[#616161]">
                      {' (Optional)'}
                    </span>
                  </label>
                  <textarea
                    rows={5}
                    id={`description`}
                    name="description"
                    value={organizationForm.values.description}
                    onChange={organizationForm.handleChange}
                    onBlur={organizationForm.handleBlur}
                    placeholder="Describe activities and outcomes taking place"
                    className="w-full resize-none rounded-xl border-2 border-[#EEEEEE] p-2 shadow-sm"
                  />
                </div>
                <ImageExpenseUploadWithProgress
                  onRemoveUploadedImage={(fileUrl) => {
                    setUploadedImages((currentImages) =>
                      currentImages.filter((image) => image !== fileUrl)
                    );
                  }}
                  stagedUploads={stagedUploads}
                  uploadedImages={uploadedImages}
                />
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-center gap-5 border-t-2 border-gray-200">
              <Button variant="primaryOutLine" onClick={onCloseModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={createMutation.isLoading || updateMutation.isLoading}
                onClick={() => {
                  organizationForm.submitForm();
                }}
              >
                {expanse ? (
                  <>{updateMutation.isLoading ? <Loader /> : <>Update</>}</>
                ) : (
                  <>{createMutation.isLoading ? <Loader /> : <>Create</>}</>
                )}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CreateExpenseModel;
