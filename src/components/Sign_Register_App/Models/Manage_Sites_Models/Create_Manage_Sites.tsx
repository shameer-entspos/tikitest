import { getAllAppProjects } from '@/app/(main)/(user-panel)/user/apps/api';
import { getContactList } from '@/app/(main)/(user-panel)/user/chats/api';
import {
  submitSite,
  updateSite,
} from '@/app/(main)/(user-panel)/user/apps/sr/api';
import { Site } from '@/app/type/Sign_Register_Sites';
import Loader from '@/components/DottedLoader/loader';
import { SimpleInput } from '@/components/Form/simpleInput';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import useAxiosAuth from '@/hooks/AxiosAuth';
import CustomModal from '@/components/Custom_Modal';
import { useFormik } from 'formik';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const CreateManageSitesModel = ({
  handleClose,
  site,
}: {
  handleClose: () => void;
  site: Site | undefined;
}) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const [isFormValid, setIsFormValid] = useState(false);

  const createMutation = useMutation(submitSite, {
    onSuccess: () => {
      queryClient.invalidateQueries('appsites');
      handleClose();
    },
  });
  const updateMutation = useMutation(updateSite, {
    onSuccess: () => {
      queryClient.invalidateQueries('appsites');
      handleClose();
    },
  });
  // const appFormValidator = (values: any) => {
  //   const errors: any = {};

  //   // Selected Project validation
  // if (!values.projects || values.projects.length === 0) {
  //   errors.selectedProject = 'At least one project must be selected';
  // }

  //   // Customer validation
  //   if (!values.siteManagers || values.siteManagers.length === 0) {
  //     errors.siteManagers = 'Customer is required';
  //   }
  // // Customer validation
  // if (!values.assignedCustomer) {
  //   errors.customer = 'Customer is required';
  // }

  // // Site Name validation
  // if (!values.siteName) {
  //   errors.siteName = 'Site Name is required';
  // }

  //   // Address One validation
  //   if (!values.addressLineOne) {
  //     errors.addressLineOne = 'Address Line 1 is required';
  //   }
  //   if (!values.addressLineTwo) {
  //     errors.addressLineTwo = 'Address Line 2 is required';
  //   }

  //   // City validation
  //   if (!values.city) {
  //     errors.city = 'City is required';
  //   }

  //   // State validation
  //   if (!values.state) {
  //     errors.state = 'State is required';
  //   }

  //   // Postal Code validation
  //   if (!values.code) {
  //     errors.code = 'Postal Code is required';
  //   }

  //   // Country Name validation
  //   if (!values.country) {
  //     errors.country = 'Country Name is required';
  //   }

  //   return errors;
  // };

  const organizationForm = useFormik({
    initialValues: {
      projects: site?.projects.map((p) => p._id) ?? [], // Initialize with empty array
      assignedCustomer: site?.assignedCustomer ?? '',
      siteManagers: site?.siteManagers.map((v) => v._id) ?? [],
      siteName: site?.siteName ?? '',
      addressLineOne: site?.addressLineOne ?? '',
      addressLineTwo: site?.addressLineTwo ?? '',
      city: site?.city ?? '',
      state: site?.state ?? '',
      code: site?.code ?? '',
      country: site?.country ?? '',
      deleteCascade: site?.deleteCascade ?? false,
    },
    validateOnMount: true,
    validate: (values) => {
      const errors: any = {};
      // Required: Assigned Project, Assigned Customer, Site Name. All other fields optional.
      if (!values.projects || values.projects.length === 0) {
        errors.projects = 'At least one project must be selected';
      }
      if (!values.assignedCustomer) {
        errors.assignedCustomer = 'Assigned Customer is required';
      }
      if (!values.siteName || !String(values.siteName).trim()) {
        errors.siteName = 'Site Name is required';
      }
      return errors;
    },
    onSubmit: (values) => {
      if (site) {
        updateMutation.mutate({
          axiosAuth,
          data: values,
          id: site._id,
        });
      } else {
        createMutation.mutate({
          axiosAuth,
          data: values,
        });
      }
    },
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  // Contacts > Customers (Tiki Workplace > Contacts > Customers)
  const { data: contacts } = useQuery({
    queryKey: 'contacts',
    queryFn: () => getContactList(axiosAuth),
  });
  const customersFromContacts = useMemo(
    () => (contacts ?? []).filter((c: any) => c.role === 4),
    [contacts]
  );

  const { data: projects, isLoading: projectLoading } = useQuery({
    queryKey: 'allUserAssignedProjects',
    queryFn: () => getAllAppProjects(axiosAuth),
  });

  // Site Managers: users who are members of selected Assigned Project(s). Optional; include "Not Selected".
  const siteManagerOptions = useMemo(() => {
    const selectedProjectIds: string[] = organizationForm.values.projects ?? [];
    const projectList: any[] = projects ?? [];
    if (!selectedProjectIds.length || !projectList.length) {
      return [];
    }
    const projectIds = new Set(selectedProjectIds);
    const userIds = new Set<string>();
    projectList.forEach((p: any) => {
      if (p._id && projectIds.has(p._id) && p.users?.length) {
        (p.users as any[]).forEach((ue: any) => {
          const id = ue?.user?._id ?? ue?.user;
          if (id) userIds.add(String(id));
        });
      }
    });
    const projectMembers = (projects ?? []).flatMap((p: any) =>
      (p.users ?? []).map((ue: any) => ue?.user).filter(Boolean)
    );
    const uniqueById = new Map<string, any>();
    projectMembers.forEach((u: any) => {
      const id = u?._id ?? u;
      if (id && userIds.has(String(id))) uniqueById.set(String(id), u);
    });
    return Array.from(uniqueById.values());
  }, [projects, organizationForm.values.projects]);

  const isSubmitDisabled = organizationForm.dirty && organizationForm.isValid;
  const isEditMode = !!site;

  return (
    <CustomModal
      isOpen={true}
      handleCancel={handleClose}
      handleSubmit={() => {
        if (isSubmitDisabled) {
          organizationForm.submitForm();
        }
      }}
      submitDisabled={!isSubmitDisabled}
      isLoading={
        isEditMode ? updateMutation.isLoading : createMutation.isLoading
      }
      submitValue={isEditMode ? 'Update' : 'Add'}
      cancelButton="Cancel"
      variant="primary"
      cancelvariant="primaryOutLine"
      header={
        <>
          <svg
            width="50"
            height="50"
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
            <path
              d="M39.6985 17.7475L36.136 15.0025C35.8939 14.8471 35.6307 14.7274 35.3545 14.647C35.0794 14.558 34.793 14.5085 34.504 14.5H24.25L25.4515 22H34.504C34.75 22 35.0575 21.9445 35.353 21.853C35.6485 21.7615 35.9335 21.6355 36.1345 21.499L39.697 18.751C39.8995 18.6145 40 18.433 40 18.25C40 18.067 39.8995 17.8855 39.6985 17.7475ZM22.75 11.5H21.25C21.0511 11.5 20.8603 11.579 20.7197 11.7197C20.579 11.8603 20.5 12.0511 20.5 12.25V17.5H15.496C15.247 17.5 14.941 17.5555 14.6455 17.6485C14.3485 17.7385 14.065 17.863 13.864 18.0025L10.3015 20.7475C10.099 20.884 10 21.067 10 21.25C10 21.4315 10.099 21.613 10.3015 21.7525L13.864 24.5005C14.065 24.637 14.3485 24.763 14.6455 24.853C14.941 24.9445 15.247 25 15.496 25H20.5V37.75C20.5 37.9489 20.579 38.1397 20.7197 38.2803C20.8603 38.421 21.0511 38.5 21.25 38.5H22.75C22.9489 38.5 23.1397 38.421 23.2803 38.2803C23.421 38.1397 23.5 37.9489 23.5 37.75V12.25C23.5 12.0511 23.421 11.8603 23.2803 11.7197C23.1397 11.579 22.9489 11.5 22.75 11.5Z"
              fill="#0063F7"
            />
          </svg>
          <div>
            <h2 className="text-xl font-semibold text-[#1E1E1E]">
              {isEditMode ? 'Edit Site' : 'Add Site'}
            </h2>
            <span className="mt-1 text-base font-normal text-[#616161]">
              {isEditMode
                ? 'Edit site details below.'
                : 'Add site details below.'}
            </span>
          </div>
        </>
      }
      body={
        <div className="h-[60vh] max-h-[520px] w-full overflow-y-scroll px-6">
          <div className="relative mb-8 overflow-visible">
            <CustomSearchSelect
              label="Assigned Project (Required)"
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
              selected={organizationForm.values.projects}
              onSelect={(values) => {
                organizationForm.setFieldValue('projects', values);
              }}
              hasError={!!organizationForm.errors.projects}
              isOpen={openDropdown === 'dropdown1'}
              onToggle={() => handleToggle('dropdown1')}
            />
          </div>

          <div className="relative mb-8">
            <CustomSearchSelect
              label="Assigned Customer (Required)"
              data={[
                {
                  label: 'My Organization',
                  value: 'My Organization',
                },
                ...customersFromContacts.map((c: any) => ({
                  label: c.customerName
                    ? c.customerName
                    : `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() ||
                      c.email,
                  value: c._id,
                  photo: c.photo,
                })),
              ]}
              onSelect={(values) => {
                organizationForm.setFieldValue(
                  'assignedCustomer',
                  Array.isArray(values) ? values[0] : values
                );
              }}
              selected={
                organizationForm.values.assignedCustomer
                  ? [organizationForm.values.assignedCustomer]
                  : []
              }
              hasError={organizationForm.errors.assignedCustomer}
              returnSingleValueWithLabel={true}
              showImage={true}
              multiple={false}
              isOpen={openDropdown === 'dropdown2'}
              onToggle={() => handleToggle('dropdown2')}
            />
          </div>
          <div className="relative mb-8">
            <CustomSearchSelect
              label="Site Managers (optional)"
              placeholder="Not Selected"
              data={[
                ...siteManagerOptions.map((u: any) => ({
                  label:
                    `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() ||
                    u.email,
                  value: u._id ?? u,
                  photo: u.photo,
                })),
              ]}
              onSelect={(values) => {
                const filtered = (Array.isArray(values) ? values : []).filter(
                  (v) => v !== '__none__'
                );
                if (
                  filtered.length === 0 &&
                  (Array.isArray(values)
                    ? values.includes('__none__')
                    : values === '__none__')
                ) {
                  organizationForm.setFieldValue('siteManagers', []);
                  return;
                }
                organizationForm.setFieldValue('siteManagers', filtered);
              }}
              selected={organizationForm.values.siteManagers}
              hasError={organizationForm.errors.siteManagers}
              multiple={true}
              isOpen={openDropdown === 'dropdown3'}
              onToggle={() => handleToggle('dropdown3')}
            />
          </div>

          <SimpleInput
            type="text"
            label="Site Name (Required)"
            placeholder="Give it a unique site name"
            name="siteName"
            className="w-full"
            errorMessage={organizationForm.errors.siteName}
            value={organizationForm.values.siteName}
            isTouched={organizationForm.touched.siteName}
            onChange={organizationForm.handleChange}
          />
          <SimpleInput
            type="text"
            label="Address Line 1 (Optional)"
            placeholder="Enter address line 1"
            name="addressLineOne"
            className="w-full"
            errorMessage={organizationForm.errors.addressLineOne}
            value={organizationForm.values.addressLineOne}
            isTouched={organizationForm.touched.addressLineOne}
            onChange={organizationForm.handleChange}
          />

          <SimpleInput
            type="text"
            label="Address Line 2 (Optional)"
            placeholder="Enter address line 2"
            name="addressLineTwo"
            className="w-full"
            errorMessage={organizationForm.errors.addressLineTwo}
            value={organizationForm.values.addressLineTwo}
            isTouched={organizationForm.touched.addressLineTwo}
            onChange={organizationForm.handleChange}
          />
          <SimpleInput
            type="text"
            label="City (Optional)"
            placeholder="Enter city"
            name="city"
            className="w-full"
            errorMessage={organizationForm.errors.city}
            value={organizationForm.values.city}
            isTouched={organizationForm.touched.city}
            onChange={organizationForm.handleChange}
          />

          <SimpleInput
            type="text"
            label="State (Optional)"
            placeholder="Enter state"
            name="state"
            className="w-full"
            errorMessage={organizationForm.errors.state}
            value={organizationForm.values.state}
            isTouched={organizationForm.touched.state}
            onChange={organizationForm.handleChange}
          />
          <SimpleInput
            type="text"
            label="Postal Code (Optional)"
            placeholder="Enter postal code"
            name="code"
            className="w-full"
            errorMessage={organizationForm.errors.code}
            value={organizationForm.values.code}
            isTouched={organizationForm.touched.code}
            onChange={organizationForm.handleChange}
          />
          <SimpleInput
            type="text"
            label="Country (Optional)"
            placeholder="Enter country"
            name="country"
            className="w-full"
            errorMessage={organizationForm.errors.country}
            value={organizationForm.values.country}
            isTouched={organizationForm.touched.country}
            onChange={organizationForm.handleChange}
          />
          <div className="mt-2 grid grid-cols-[auto,1fr] items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
              name="deleteCascade"
              value="deleteCascade"
              checked={organizationForm.values.deleteCascade}
              onChange={() => {
                organizationForm.setFieldValue(
                  'deleteCascade',
                  !organizationForm.values.deleteCascade
                );
              }}
            />
            <span className="text-gray-700">
              Remove site when last assigned project is closed.
            </span>
          </div>
        </div>
      }
    />
  );
};

export default CreateManageSitesModel;
