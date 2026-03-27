import { GroupService } from '@/app/type/service_group';
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
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  createGroupService,
  updateGroupService,
} from '@/app/(main)/(user-panel)/user/apps/am/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import Loader from '@/components/DottedLoader/loader';
import { getAllOrgUsers } from '@/app/(main)/(user-panel)/user/apps/api';
import { getCustomersList } from '@/app/(main)/(user-panel)/user/apps/am/api';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { useState } from 'react';
import CustomModal from '@/components/Custom_Modal';
const AddGroupServiceModel = ({
  model,
  handleClose,
}: {
  model: GroupService | undefined;
  handleClose: any;
}) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };
  const createGroupServiceMutation = useMutation(createGroupService, {
    onSuccess: () => {
      handleClose();
      queryClient.invalidateQueries('groupServices');
    },
  });
  const { data: users } = useQuery({
    queryKey: 'allOrgUsers',
    queryFn: () => getAllOrgUsers(axiosAuth),
    refetchOnWindowFocus: false,
  });
  const { data: customers } = useQuery({
    queryKey: 'customersList',
    queryFn: () => getCustomersList(axiosAuth),
    refetchOnWindowFocus: false,
  });

  const updateGroupServiceMutation = useMutation(updateGroupService, {
    onSuccess: () => {
      queryClient.invalidateQueries('groupServices');
      // Close the modal after successful update, but stay on detail page
      handleClose();
    },
  });

  const appFormValidatorSchema = Yup.object().shape({
    // Email validation
    name: Yup.string().required('title is required'),
    description: Yup.string().required('description is required'),
    customer: Yup.string().required('customer is required'),
    managers: Yup.array().required('managers is required'),
  });
  const organizationForm = useFormik({
    initialValues: {
      name: model?.name ?? '',
      description: model?.description ?? '',
      managers: (model?.managers ?? [])?.map((manager) => manager._id) ?? [],
      customer: model?.customer ?? 'My Organization',
    },

    validationSchema: appFormValidatorSchema,
    onSubmit: (values) => {
      if (model) {
        updateGroupServiceMutation.mutate({
          axiosAuth,
          id: model._id,
          data: values,
        });
      } else {
        createGroupServiceMutation.mutate({
          axiosAuth,
          data: values,
        });
      }
    },
  });
  return (
    <CustomModal
      isOpen={true}
      header={
        <div className="flex gap-3">
          <svg
            width="50"
            height="50"
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
            <path
              d="M33.75 21.25C32.5625 21.25 31.5312 20.8958 30.6562 20.1875C29.7812 19.4792 29.1979 18.5833 28.9062 17.5H21.0625C20.8333 18.375 20.4012 19.1304 19.7663 19.7663C19.1313 20.4021 18.3758 20.8342 17.5 21.0625V28.9062C18.5833 29.1979 19.4792 29.7812 20.1875 30.6562C20.8958 31.5312 21.25 32.5625 21.25 33.75C21.25 35.125 20.7604 36.3021 19.7812 37.2812C18.8021 38.2604 17.625 38.75 16.25 38.75C14.875 38.75 13.6979 38.2604 12.7188 37.2812C11.7396 36.3021 11.25 35.125 11.25 33.75C11.25 32.5625 11.6042 31.5312 12.3125 30.6562C13.0208 29.7812 13.9167 29.1979 15 28.9062V21.0625C13.9167 20.7708 13.0208 20.1875 12.3125 19.3125C11.6042 18.4375 11.25 17.4167 11.25 16.25C11.25 14.875 11.7396 13.6979 12.7188 12.7188C13.6979 11.7396 14.875 11.25 16.25 11.25C17.4167 11.25 18.4375 11.6042 19.3125 12.3125C20.1875 13.0208 20.7708 13.9167 21.0625 15H28.9062C29.1979 13.9167 29.7812 13.0208 30.6562 12.3125C31.5312 11.6042 32.5625 11.25 33.75 11.25C35.125 11.25 36.3021 11.7396 37.2812 12.7188C38.2604 13.6979 38.75 14.875 38.75 16.25C38.75 17.625 38.2604 18.8021 37.2812 19.7812C36.3021 20.7604 35.125 21.25 33.75 21.25ZM33.75 38.75C32.375 38.75 31.1979 38.2604 30.2188 37.2812C29.2396 36.3021 28.75 35.125 28.75 33.75C28.75 32.375 29.2396 31.1979 30.2188 30.2188C31.1979 29.2396 32.375 28.75 33.75 28.75C35.125 28.75 36.3021 29.2396 37.2812 30.2188C38.2604 31.1979 38.75 32.375 38.75 33.75C38.75 35.125 38.2604 36.3021 37.2812 37.2812C36.3021 38.2604 35.125 38.75 33.75 38.75Z"
              fill="#0063F7"
            />
          </svg>

          <div>
            <h2 className="text-xl font-semibold text-[#1E1E1E]">
              {model ? 'Edit Service Group' : 'Add Service Group'}
            </h2>
            <span className="mt-1 text-base font-normal text-[#616161]">
              {model
                ? 'Edit Service Group detail below.'
                : 'Add Service Group detail below.'}
            </span>
          </div>
        </div>
      }
      body={
        <div className="flex flex-col gap-4 pt-2">
          <SimpleInput
            label="Service Group Name"
            type="text"
            placeholder="Enter Name"
            name="name"
            required
            className="w-full"
            errorMessage={organizationForm.errors.name}
            value={organizationForm.values.name}
            isTouched={organizationForm.touched.name}
            onChange={organizationForm.handleChange}
          />
          <div className="pt-5">
            <label className="mb-2 block" htmlFor="reasone">
              Description
            </label>
            <textarea
              rows={3}
              id="description"
              name="description"
              placeholder="Enter Description"
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
          </div>
          <div className="relative mb-4 w-full">
            <CustomSearchSelect
              label="Service Manager"
              data={[
                { label: 'All', value: 'all' },
                ...(users ?? [])
                  .filter((user) => user.role == 2 || user.role == 1)
                  .map((user) => ({
                    label: `${user.firstName} ${user.lastName}`,
                    value: user._id,
                    photo: user.photo,
                  })),
              ]}
              onSelect={(value) => {
                organizationForm.setFieldValue('managers', value);
              }}
              searchPlaceholder="Search Users"
              selected={organizationForm.values.managers}
              hasError={
                !organizationForm.errors.managers && !organizationForm.isValid
              }
              showImage={true}
              multiple={true}
              isRequired={true}
              placeholder="-"
              isOpen={openDropdown === 'dropdown1'}
              onToggle={() => handleToggle('dropdown1')}
            />
          </div>
          <div className="relative mb-4 w-full">
            <CustomSearchSelect
              label="Select Customers"
              data={[
                { label: 'My Organization', value: 'My Organization' },
                ...(customers ?? [])
                  .filter((c) => c.role === 4)
                  .map((customer) => ({
                    label: customer.customerName
                      ? `${customer.customerName} - ${customer.userId}`
                      : `${customer.firstName} ${customer.lastName}`,
                    value:
                      customer.customerName ||
                      `${customer.firstName} ${customer.lastName}`,
                    photo: customer.photo,
                  })),
              ]}
              isRequired={true}
              onSelect={(value, item) => {
                organizationForm.setFieldValue('customer', value);
              }}
              returnSingleValueWithLabel={true}
              searchPlaceholder="Search Customers"
              selected={
                organizationForm.values.customer
                  ? [organizationForm.values.customer]
                  : []
              }
              hasError={
                !organizationForm.errors.customer && !organizationForm.isValid
              }
              showImage={true}
              multiple={false}
              placeholder="-"
              isOpen={openDropdown === 'dropdown2'}
              onToggle={() => handleToggle('dropdown2')}
            />
          </div>
        </div>
      }
      handleCancel={handleClose}
      submitDisabled={!organizationForm.isValid}
      handleSubmit={() => {
        organizationForm.submitForm();
      }}
      submitValue={
        model ? (
          <>{updateGroupServiceMutation.isLoading ? <Loader /> : 'Update'}</>
        ) : (
          <>{createGroupServiceMutation.isLoading ? <Loader /> : 'Add'}</>
        )
      }
    />
  );
};

export default AddGroupServiceModel;
