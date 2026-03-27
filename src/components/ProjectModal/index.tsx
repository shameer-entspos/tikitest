'use client';

import { SelectOption } from '../Form/select';
import * as Yup from 'yup';
import { AddProjectMembers } from './AddProjectMembers';
import { PinAppModal } from './PinAppModal';
import { FormikProvider, useFormik } from 'formik';
import { Input } from '../Form/Input';
import { useProjectCotnext } from '@/app/(main)/(user-panel)/user/projects/context';
import { PROJECTACTIONTYPE } from '@/app/helpers/user/enums';
import 'react-datepicker/dist/react-datepicker.css';
import { useState } from 'react';

import { FolderMinus } from 'lucide-react';
import { Textarea } from '../Form/Textarea';
import CustomModal from '../Custom_Modal';

import { CustomSearchSelect } from '../TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { useQuery } from 'react-query';

import useAxiosAuth from '@/hooks/AxiosAuth';
import { getCustomerORSupplier } from '@/app/(main)/(user-panel)/user/projects/api';
import { ProjectDetail } from '@/app/type/projects';

const ProjectModal = ({
  projectId,
  project,
}: {
  projectId?: string;
  project?: ProjectDetail | undefined;
}) => {
  const context = useProjectCotnext();
  ///
  const initialValues = {
    name: context.state.payload?.name,
    reference: context.state.payload?.reference,
    description: context.state.payload?.description,
    address: context.state.payload?.address,
    customer: context.state.payload?.customer || {
      label: 'My Organization',
      value: 'My Organization',
    },
  };
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('name is required'),
  });

  const axiosAuth = useAxiosAuth();
  const { data } = useQuery({
    queryKey: 'customers',
    queryFn: () => getCustomerORSupplier({ axiosAuth }),
    refetchOnWindowFocus: false,
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const handleSubmit = async (values: any) => {
    context.dispatch({
      type: PROJECTACTIONTYPE.PAYLOAD,
      currentSection:
        context.state.projectType === 'private' ? 'members' : 'apps',
      payload: {
        name: values.name,
        reference: values.reference,
        description: values.description,
        address: values.address,
        customer: values.customer,
      },
    });
  };

  const handleSelectedOption = (color: any) => {
    context.dispatch({ type: PROJECTACTIONTYPE.COLOR, color: color });
  };
  const handleSelectedDate = (date: Date | null | number) => {
    // SelectOption datePicker calls handleSelectedOption with:
    // - null for "No Due Date"
    // - timestamp number for preset days (30, 60, 90)
    // - Date object for custom date selection
    if (!date || date === null) {
      context.dispatch({
        type: PROJECTACTIONTYPE.SELECT_DATE,
        date: undefined,
        dueDateMode: 'NO_DUE_DATE',
      });
    } else {
      // Convert timestamp to Date if needed
      const dateObj = date instanceof Date ? date : new Date(date);
      context.dispatch({
        type: PROJECTACTIONTYPE.SELECT_DATE,
        date: dateObj,
        dueDateMode: 'CUSTOM',
      });
    }
  };
  const handleSelectionChange = (e: any) => {
    context.dispatch({
      type: PROJECTACTIONTYPE.PROJECTTYPE,
      projectType: e.target.value,
    });
  };
  const projectForm = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: handleSubmit,
  });

  const [appsNavigation, setAppsNavigation] = useState<{
    onSubmit: () => void;
    isSubmitting: boolean;
    submitLabel: string;
  }>({
    onSubmit: () => {},
    isSubmitting: false,
    submitLabel: 'Create Project',
  });

  const currentStep = context.state.showCurrentModal;

  const footerCancelText =
    currentStep === 'details' ? 'Back' : currentStep === 'members' ? 'Back' : 'Back';
  const footerSubmitText =
    currentStep === 'details'
      ? 'Next'
      : currentStep === 'members'
        ? 'Next'
        : appsNavigation.submitLabel;

  const handleFooterCancel = () => {
    if (currentStep === 'details') {
      context.dispatch({ type: PROJECTACTIONTYPE.TOGGLE });
      return;
    }
    if (currentStep === 'members') {
      context.dispatch({
        type: PROJECTACTIONTYPE.CURRENTMODAL,
        currentSection: 'details',
      });
      return;
    }
    context.dispatch({
      type: PROJECTACTIONTYPE.CURRENTMODAL,
      currentSection: 'members',
    });
  };

  const handleFooterSubmit = () => {
    if (currentStep === 'details') {
      projectForm.submitForm();
      return;
    }
    if (currentStep === 'members') {
      context.dispatch({
        type: PROJECTACTIONTYPE.CURRENTMODAL,
        currentSection: 'apps',
      });
      return;
    }
    appsNavigation.onSubmit();
  };

  return (
    <>
      <CustomModal
        isOpen={true}
        showFooter={true}
        handleCancel={() => {
          context.dispatch({ type: PROJECTACTIONTYPE.TOGGLE });
        }}
        handleSubmit={handleFooterSubmit}
        isLoading={currentStep === 'apps' ? appsNavigation.isSubmitting : false}
        submitValue={footerSubmitText}
        cancelButton={footerCancelText}
        customCancelHandler={handleFooterCancel}
        cancelvariant="primaryOutLine"
        header={
          <div className="flex items-center gap-3">
            <FolderMinus className="h-11 w-11 rounded-full bg-primary-100/70 p-3 text-primary-500 lg:h-[55px] lg:w-[55px]" />
            <div>
              <h2 className="text-lg font-medium leading-7 text-[#1E1E1E] lg:text-xl">
                {context.state.showCurrentModal === 'details'
                  ? 'Add Project Details'
                  : context.state.showCurrentModal === 'members'
                    ? 'New Project Members'
                    : 'Pin Apps'}
              </h2>
              <span className="text-xs font-normal text-[#616161] sm:text-sm">
                {context.state.showCurrentModal === 'details'
                  ? 'Add project details below'
                  : context.state.showCurrentModal === 'members'
                    ? 'Add members to project'
                    : 'Search for apps you want to pin on this project.'}
              </span>
            </div>
          </div>
        }
        body={
          <>
            {/*  create new details */}
            {context.state.showCurrentModal === 'details' ? (
              <FormikProvider value={projectForm}>
                <form onSubmit={projectForm.handleSubmit}>
                  <div className="scrollbar h-[500px] overflow-y-auto pr-2">
                    <Input
                      type="text"
                      label="Project Name"
                      placeholder="Enter Project Name"
                      style={{
                        borderRadius: '10px',
                        height: '50px',
                      }}
                      name="name"
                      required={true}
                      errorMessage={projectForm.errors.name}
                      isTouched={projectForm.touched.name}
                    />
                    <Input
                      type="text"
                      label="Reference (Optional)"
                      placeholder="Enter Referencee "
                      style={{
                        borderRadius: '10px',
                        height: '50px',
                      }}
                      name="reference"
                      isTouched={projectForm.touched.reference}
                    />
                    <div className="mt-5 flex w-full gap-4">
                      <div className="relative mb-4 w-full">
                        <CustomSearchSelect
                          label="Customer"
                          data={[
                            {
                              label: 'My Organization',
                              value: 'My Organization',
                            },
                            ...(data ?? [])
                              .filter((user) => user.role === 4)
                              .map((user) => ({
                                label: `${user.customerName} - ${user.userId}`,
                                value: `${user.customerName}`,
                                photo: user.photo,
                              })),
                          ]}
                          onSelect={(value, item) => {
                            projectForm.setFieldValue('customer', {
                              label: item?.label || '',
                              value: value,
                            });
                          }}
                          searchPlaceholder="Search Contacts, Users, Customers"
                          returnSingleValueWithLabel={true}
                          selected={
                            projectForm.values.customer?.value
                              ? [projectForm.values.customer.value]
                              : []
                          }
                          hasError={!!projectForm.errors.customer}
                          showImage={true}
                          isRequired={true}
                          multiple={false}
                          placeholder="Select Customer"
                          isOpen={openDropdown === 'dropdown5'}
                          onToggle={() => handleToggle('dropdown5')}
                        />
                      </div>
                    </div>
                    <Textarea
                      className="min-h-24"
                      label="Address (Optional)"
                      placeholder="Enter Address"
                      name="address"
                      errorMessage={projectForm.errors.address}
                      isTouched={projectForm.touched.address}
                    />
                    <Textarea
                      className="min-h-56"
                      label="Short Description"
                      placeholder="Say something about this project"
                      name="description"
                      errorMessage={projectForm.errors.description}
                      isTouched={projectForm.touched.description}
                    />

                    <div className="semple-select-option relative">
                      <SelectOption
                        variant="simpleSlectColor"
                        label="Color"
                        name="Organisation_name"
                        selectedOption={context.state.color}
                        handleSelectedOption={(selectedColor: any) => {
                          handleSelectedOption(selectedColor);
                        }}
                      />
                    </div>

                    <div className="semple-select-option relative mt-4 w-full">
                      <SelectOption
                        variant="datePicker"
                        label="Due Date"
                        name="dueDate"
                        options={[
                          {
                            value: 'No Due Date',
                            label: 'No Due Date',
                          },
                          {
                            value: '30 Days',
                            label: '30 Days',
                          },
                          {
                            value: '60 Days',
                            label: '60 Days',
                          },
                          {
                            value: '90 Days',
                            label: '90 Days',
                          },
                          {
                            value: 'Custom Date',
                            label: 'Custom Date',
                          },
                        ]}
                        selectedOption={context.state.date?.toString()}
                        handleSelectedOption={handleSelectedDate}
                      />
                    </div>

                    <div className="mb-4 ml-2 mt-8">
                      <div className="space-y-4">
                        <label className="flex cursor-pointer items-center space-x-2">
                          <input
                            type="radio"
                            value="private"
                            checked={context.state.projectType === 'private'}
                            onChange={handleSelectionChange}
                            className="form-radio h-5 w-5 text-primary-600"
                          />
                          <span className="text-sm font-medium text-gray-800">
                            Private -{' '}
                            <span className="font-normal text-gray-500">
                              Only members added can view this project.
                            </span>
                          </span>
                        </label>

                        <label className="flex cursor-pointer items-center space-x-2">
                          <input
                            type="radio"
                            value="public"
                            checked={context.state.projectType === 'public'}
                            onChange={handleSelectionChange}
                            className="form-radio h-5 w-5 text-primary-600"
                          />
                          <span className="text-sm font-medium text-gray-800">
                            Public -{' '}
                            <span className="font-normal text-gray-500">
                              Anyone in your organization can view this project.
                            </span>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </form>
              </FormikProvider>
            ) : context.state.showCurrentModal === 'members' ? (
              <>
                <AddProjectMembers project={project} hideNavigation={true} />
              </>
            ) : context.state.showCurrentModal === 'apps' ? (
              <>
                <PinAppModal
                  projectId={projectId || project?._id}
                  hideNavigation={true}
                  onSyncNavigation={setAppsNavigation}
                />
              </>
            ) : null}
          </>
        }
      />
    </>
  );
};

export { ProjectModal };
