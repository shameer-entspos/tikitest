import { useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSRAppCotnext } from '@/app/(main)/(user-panel)/user/apps/sr/sr_context';
import { getAllOrgUsers } from '@/app/(main)/(user-panel)/user/apps/api';
import { useMutation, useQuery } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import {
  getKioskSetting,
  signInSR,
} from '@/app/(main)/(user-panel)/user/apps/sr/api';
import { SimpleInput } from '@/components/Form/simpleInput';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { Button } from '@/components/Buttons';
import CameraPageSR from '../../Models/Sign_In_Out_Models/Camera_Section_SR';
import Loader from '@/components/DottedLoader/loader';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react';
import { useStagedImageUploads } from '@/components/apps/shared/useStagedImageUploads';

const visitorTypes = [
  { id: 1, name: 'Customer' },
  { id: 2, name: 'Supplier' },
  { id: 3, name: 'Employee' },
  { id: 4, name: 'Contractor' },
  { id: 5, name: 'Courier / Delivery Person' },
  { id: 6, name: 'Family member' },
  { id: 7, name: 'Friend' },
];

export default function KioskSignIn({ handleClose }: { handleClose: any }) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };
  const axiosAuth = useAxiosAuth();
  const { state } = useSRAppCotnext();
  const selfieUploads = useStagedImageUploads({
    accept: 'image/*',
    maxFiles: 1,
    multiple: false,
  });
  const selectedSelfie = selfieUploads.items[0]?.file ?? null;
  const { data: kioskSetting } = useQuery({
    queryKey: 'kioskSetting',
    queryFn: () => getKioskSetting(axiosAuth),
  });
  // If no site selected: use Home if it exists; otherwise user must select in Kiosk Settings
  const effectiveSiteId =
    kioskSetting?.selectedSite ||
    kioskSetting?.effectiveSiteId ||
    kioskSetting?.defaultHomeSiteId;
  const effectiveProjectId =
    kioskSetting?.effectiveProjectId || kioskSetting?.defaultHomeProjectId;
  const hasNoSite = !effectiveSiteId;

  const appFormValidatorSchema = Yup.object().shape({
    users: Yup.array()
      .min(1, 'Who are you here to see is required')
      .required('Who are you here to see is required'),
    visitorType: Yup.array()
      .min(1, 'Visitor Type is required')
      .required('Visitor Type is required'),
    reasone: Yup.string(),
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    phone: Yup.string()
      .required('Phone is required')
      .matches(/^[0-9]+$/, 'Phone must contain numbers only'),
  });

  const organizationForm = useFormik({
    initialValues: {
      users: [] as string[],
      visitorType: [] as (string | number)[],
      reasone: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },

    validationSchema: appFormValidatorSchema,
    onSubmit: (values) => {
      if (hasNoSite) return;
      const data = new FormData();

      if (effectiveSiteId) data.append('site', effectiveSiteId);
      if (effectiveProjectId) data.append('project', effectiveProjectId);

      data.append('userType', '2');
      const vt = Array.isArray(values.visitorType)
        ? values.visitorType[0]
        : values.visitorType;
      data.append('visitorType', vt != null ? String(vt) : '');

      data.append('reason', values.reasone ?? '');
      data.append('firstName', values.firstName);
      data.append('lastName', values.lastName);
      data.append('contact', values.phone);
      data.append('email', values.email);
      data.append('isKioskMode', 'true');
      if (state.sr_app_id) {
        data.append('appId', state.sr_app_id);
      }
      // Append each user._id from the values.users array
      (values.users ?? []).forEach((user) => {
        data.append('toSee[]', user); // Use an array notation for multiple values
      });

      setFormData(data);

      setSection('selfie');
    },
  });
  const [selectedSection, setSection] = useState<'details' | 'selfie'>(
    'details'
  );
  const { data: users, isLoading: userLoading } = useQuery({
    queryKey: 'listofUsersForManagers',
    queryFn: () => getAllOrgUsers(axiosAuth),
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const forceSelfie = kioskSetting?.forceSelfie ?? false;

  const createMutation = useMutation(signInSR, {
    onSuccess: () => {
      setShowSuccessModal(true);
    },
  });
  const handleSubmitForm = () => {
    if (!formData) return;
    const updatedFormData = new FormData();
    formData.forEach((value, key) => updatedFormData.append(key, value));
    if (selectedSelfie) {
      updatedFormData.append('file', selectedSelfie);
    }
    createMutation.mutate({
      axiosAuth,
      data: updatedFormData,
    });
  };
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    handleClose();
  };

  return (
    <>
      {/* <div className=" absolute inset-0 z-10 bg-white px-4 pt-4 w-full flex flex-col max-w-[1360px]  font-Open-Sans h-[calc(var(--app-vh)-70px)]">  */}
      <div className="absolute inset-0 z-10 flex h-[calc(var(--app-vh)-10px)] w-full max-w-[1360px] flex-col bg-white px-4 pt-4">
        {/* TopBar */}
        <div className="breadCrumbs flex justify-between border-b-2 border-[#EEEEEE] p-2">
          <span className="flex items-center gap-2 text-xl font-bold">
            {' '}
            <img
              src="/svg/sr/logo.svg"
              alt="show logo"
              className="h-[50px] w-[50px]"
            />
            Guest Sign in
          </span>

          {/* <div className="bg-[#F1CD70] px-3 py-2 rounded font-semibold">JSA</div> */}
          {/* <Link href={'/use /apps'}> */}
          <button onClick={handleClose}>
            <img src="/svg/timesheet_app/go_back.svg" alt="show logo" />
          </button>
          {/* </Link> */}
        </div>

        {/* ///////////////// Middle content ////////////////////// */}

        {selectedSection == 'details' ? (
          <div className="flex h-full flex-1 flex-col items-center justify-start overflow-auto scrollbar-hide">
            <div className="mt-4 flex w-full max-w-[1080px] flex-col items-start justify-start rounded-md p-6 shadow-md">
              {hasNoSite && (
                <div className="mb-4 w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  You must select a site in Kiosk Settings.
                </div>
              )}
              <div className="mb-5 flex flex-col">
                <h2 className="mb-1 text-lg font-medium">Your Details</h2>
                <p className="text-[10px] font-normal text-[#616161] md:text-sm">
                  You must fill this section out before you can submit it.
                </p>
              </div>
              <div className="flex h-full w-full flex-col overflow-y-scroll scrollbar-hide">
                {/* form part here  */}
                <div className="flex gap-3">
                  <div className="relative mb-4 w-full">
                    <CustomSearchSelect
                      label="Visitor Type"
                      data={(visitorTypes ?? []).flatMap((visitor) => {
                        return [
                          {
                            label: `${visitor.name}`,
                            value: visitor.id,
                          },
                        ];
                      })}
                      onSelect={(selectedUsers) => {
                        // Ensure 'selectedUsers' is an array
                        organizationForm.setFieldValue(
                          'visitorType',
                          Array.isArray(selectedUsers)
                            ? selectedUsers
                            : [selectedUsers]
                        );
                      }}
                      selected={
                        Array.isArray(organizationForm.values.visitorType)
                          ? organizationForm.values.visitorType
                          : organizationForm.values.visitorType
                            ? [organizationForm.values.visitorType]
                            : []
                      }
                      hasError={organizationForm.errors.visitorType}
                      multiple={false}
                      isOpen={openDropdown === 'dropdown1'}
                      onToggle={() => handleToggle('dropdown1')}
                    />
                  </div>
                  <div className="relative mb-4 w-full">
                    <CustomSearchSelect
                      label="Who are you here to see?"
                      data={(users ?? [])
                        // .filter((user) => user.role !== 4 && user.role !== 5)
                        .flatMap((user) => {
                          return [
                            {
                              label: `${user.firstName} ${user.lastName}`,
                              value: user._id,
                              photo: user.photo,
                            },
                          ];
                        })}
                      onSelect={(selectedUsers) => {
                        // Ensure 'selectedUsers' is an array
                        organizationForm.setFieldValue(
                          'users',
                          Array.isArray(selectedUsers)
                            ? selectedUsers
                            : [selectedUsers]
                        );
                      }}
                      selected={organizationForm.values.users ?? []}
                      hasError={organizationForm.errors.users}
                      multiple={true}
                      isOpen={openDropdown === 'dropdown2'}
                      onToggle={() => handleToggle('dropdown2')}
                    />
                  </div>
                </div>
                <div className="mb-2">
                  <label className="mb-2 block" htmlFor="reasone">
                    Reason for visit (optional)
                  </label>
                  <textarea
                    rows={3}
                    id="reasone"
                    name="reasone"
                    placeholder="What is your reason for visiting?"
                    value={organizationForm.values.reasone}
                    className={` ${
                      organizationForm.errors.reasone &&
                      organizationForm.touched.reasone
                        ? 'border-red-500'
                        : 'border-[#EEEEEE]'
                    } w-full resize-none rounded-xl border-2 border-gray-300 p-2 shadow-sm`}
                    onChange={organizationForm.handleChange}
                  />
                  {organizationForm.errors.reasone &&
                    organizationForm.touched.reasone && (
                      <span className="text-xs text-red-500">
                        {organizationForm.errors.reasone}
                      </span>
                    )}
                </div>

                <div className="mb-2 flex w-full gap-3">
                  <SimpleInput
                    label="First Name"
                    type="text"
                    placeholder="First name"
                    name="firstName"
                    className="w-full"
                    errorMessage={organizationForm.errors.firstName}
                    value={organizationForm.values.firstName}
                    isTouched={organizationForm.touched.firstName}
                    onChange={organizationForm.handleChange}
                  />
                  <SimpleInput
                    label="Last Name"
                    type="text"
                    placeholder="Last name"
                    name="lastName"
                    className="w-full"
                    errorMessage={organizationForm.errors.lastName}
                    value={organizationForm.values.lastName}
                    isTouched={organizationForm.touched.lastName}
                    onChange={organizationForm.handleChange}
                  />
                </div>
                <div className="flex w-full gap-3">
                  <SimpleInput
                    label="Contact Phone (numbers only)"
                    type="tel"
                    inputMode="numeric"
                    placeholder="Contact phone"
                    name="phone"
                    className="w-full"
                    errorMessage={organizationForm.errors.phone}
                    value={organizationForm.values.phone}
                    isTouched={organizationForm.touched.phone}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '');
                      organizationForm.setFieldValue('phone', v);
                    }}
                  />
                  <SimpleInput
                    label="Email Address"
                    required
                    type="text"
                    placeholder="Email address"
                    name="email"
                    className="w-full"
                    errorMessage={organizationForm.errors.email}
                    value={organizationForm.values.email}
                    isTouched={organizationForm.touched.email}
                    onChange={organizationForm.handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-1 flex-col items-center justify-start overflow-auto scrollbar-hide">
            <div className="mt-4 flex h-full max-h-[500px] w-full max-w-[1000px] flex-col items-start justify-start rounded-md p-6 shadow-md">
              <div className="mb-5 flex flex-col">
                <h2 className="mb-1 text-lg font-medium">Take a photo</h2>
                <p className="text-[10px] font-normal text-[#616161] md:text-sm">
                  {forceSelfie
                    ? 'Select a camera to take a selfie photograph.'
                    : 'Photo is optional. You can skip and sign in without a photo.'}
                </p>
              </div>
              <div className="flex h-full max-h-[700px] w-full flex-col overflow-y-scroll scrollbar-hide">
                <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                  <CameraPageSR selfieUploads={selfieUploads} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="h-16">
          <div className="flex h-full items-center justify-between border-2 border-[#EEEEEE] p-2">
            <Button
              variant="primaryOutLine"
              onClick={() => {
                if (selectedSection == 'selfie') {
                  setSection('details');
                } else {
                  handleClose();
                }
              }}
            >
              Back
            </Button>
            <Button
              variant="primary"
              disabled={
                selectedSection == 'details'
                  ? hasNoSite || !organizationForm.isValid
                  : forceSelfie && selectedSelfie == null
              }
              onClick={() => {
                if (selectedSection == 'details') {
                  organizationForm.submitForm();
                } else {
                  handleSubmitForm();
                }
              }}
            >
              {createMutation.isLoading ? (
                <Loader />
              ) : selectedSection === 'selfie' && !forceSelfie ? (
                <>Sign in {selectedSelfie ? '' : '(skip photo)'}</>
              ) : (
                <>Sign in</>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showSuccessModal}
        onOpenChange={() => {}}
        isDismissable={false}
        placement="center"
        size="md"
      >
        <ModalContent className="rounded-2xl bg-white">
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-lg font-semibold">
                Sign in successful
              </ModalHeader>
              <ModalBody>
                <p className="text-[#616161]">
                  You have been signed in successfully.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="primary" onClick={handleSuccessModalClose}>
                  OK
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
