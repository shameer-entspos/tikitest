'use client';
import { OrganisationList } from '@/components/organisation-list';
import { Card } from '@/components/Cards';
import { ChangeEvent, useRef, useState } from 'react';
import MyDetailModal from '@/components/popupModal/myDetailEdit';
import { useSession } from 'next-auth/react';
import { languageList } from '@/app/constants';
import CustomModal from '@/components/Custom_Modal';
import { useFormik } from 'formik';
import { SelectOption } from '@/components/Form/select';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { User } from '@/types/interfaces';
import { useMutation } from 'react-query';

import Loader from '@/components/DottedLoader/loader';
import { SimpleInput } from '@/components/Form/simpleInput';
import {
  updateMyUser,
  updateMyUserProfile,
} from '@/app/(main)/(org-panel)/organization/my-Details/api';
import { usePresignedUserPhoto } from '@/hooks/usePresignedUserPhoto';

export default function Page() {
  const axiosAuth = useAxiosAuth();
  const { data: session, update } = useSession();
  const userPhotoDisplay = usePresignedUserPhoto(session?.user?.user?.photo);
  const [showDetailModel, setDetailModal] = useState(false);
  const [showImageModel, setImageModel] = useState(false);

  const [selectedImage, setSelectedImage] = useState<File | null>();
  const [userImage, setUserImage] = useState<string | null | undefined>(
    session?.user.user.photo
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string>('');
  const handleDropdown = (dropdownId: string) => {
    setOpenFilterDropdown(openFilterDropdown === dropdownId ? '' : dropdownId);
  };
  const updateMyUserMutation = useMutation(updateMyUser, {
    onSuccess: (response) => {
      const updatedUser = {
        ...session?.user,
        user: response,
      };

      const updatedSession = {
        ...session,
        user: updatedUser,
      };

      update(updatedSession);

      setDetailModal(!showDetailModel);
    },
  });
  const organizationForm = useFormik({
    initialValues: {
      firstName: session?.user?.user?.firstName ?? '',
      lastName: session?.user?.user?.lastName ?? '',
      language: session?.user?.user?.setting?.language ?? 'en',
      date_format: session?.user?.user?.setting?.date_format ?? 'DD MMM YYYY',
      time_zone:
        session?.user?.user?.setting?.time_zone ??
        Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    enableReinitialize: true,

    onSubmit: (values) => {
      updateMyUserMutation.mutate({
        axiosAuth,
        id: session?.user.user._id!,
        data: values,
      });
    },
  });
  const updateMyUserProfileMutation = useMutation(updateMyUserProfile, {
    onSuccess: (response) => {
      const updatedUser = {
        ...session?.user,
        user: response,
      };

      const updatedSession = {
        ...session,
        user: updatedUser,
      };

      update(updatedSession);
      setImageModel(!showImageModel);
    },
  });
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedImage(file || null);
  };
  if (!session) {
    return (
      <div className="fixed flex h-screen w-full items-center justify-center">
        <Loader />
      </div>
    );
  }
  return (
    <>
      <div className="w-full max-w-[700px]">
        <div className="page-heading-edit mb-[28px] space-y-4">
          <div className="text-lg font-semibold text-black md:text-2xl">
            My Details
          </div>
          <button
            className="text-base font-normal text-primary-500"
            onClick={() => {
              setDetailModal(true);
            }}
          >
            Edit My Details
          </button>
        </div>

        <>
          <OrganisationList
            data={{
              title: 'Register Email',
              details: session?.user.user.email,
              secondTitle: 'User ID',
              secondDetails: session?.user.user.userId,
              showCopyButton: true,
            }}
          />
          <OrganisationList
            data={{
              title: 'First Name',
              details: session?.user.user.firstName,
              secondTitle: 'Last Name',
              secondDetails: session?.user.user.lastName,
            }}
          />
          <OrganisationList
            data={{
              title: 'My System Language',
              // details: session?.user.user.setting?.language!,
              details: `${
                languageList?.find(
                  (language) =>
                    language.value === session?.user.user.setting?.language
                )?.label
              }`,
              secondTitle: 'My Date Format',
              secondDetails: session?.user.user.setting?.date_format!,
            }}
          />
          <OrganisationList
            data={{
              title: 'My Default Timezone',
              details: session?.user.user.setting?.time_zone!,
              secondTitle: '',
              secondDetails: '',
            }}
          />
          <div className="flex flex-col">
            <h3 className="py-3 text-xs font-normal text-gray-700 md:text-sm">
              Profile Photo
            </h3>
            <div className="flex w-max flex-col items-center">
              <img
                src={userPhotoDisplay}
                alt={`image `}
                className="h-28 w-28 rounded-full object-cover"
              />
              <button
                type="button"
                // onClick={() => inputRef.current?.click()}
                onClick={() => {
                  setImageModel(!showImageModel);
                  setUserImage(session?.user.user.photo);
                }}
                className="block whitespace-nowrap text-center text-xs font-normal text-primary-500 sm:text-base"
              >
                Change photo
              </button>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              ref={inputRef}
            />
          </div>
        </>

        <CustomModal
          size="md"
          isOpen={showDetailModel}
          header={
            <>
              <img src="/svg/language_timezone.svg" alt="language_timezone" />
              <div>
                <h2 className="text-xl font-semibold text-[#1E1E1E]">
                  {'Language & Timezone Preferences'}
                </h2>
                <span className="mt-1 text-base font-normal text-[#616161]">
                  {'Manage your language and timezone preferences.'}
                </span>
              </div>
            </>
          }
          body={
            <div className="flex h-[500px] flex-col overflow-auto px-3">
              <div className="mb-4">
                <SimpleInput
                  type="text"
                  label="First Name"
                  placeholder="Enter First Name"
                  name="firstName"
                  className="w-full"
                  required
                  errorMessage={organizationForm.errors.firstName}
                  value={organizationForm.values.firstName}
                  isTouched={organizationForm.touched.firstName}
                  onChange={(e) => {
                    organizationForm.setFieldValue('firstName', e.target.value);
                  }}
                />
              </div>
              <div className="mb-4">
                <SimpleInput
                  type="text"
                  label="Last Name"
                  placeholder="Enter Last Name"
                  name="lastName"
                  className="w-full"
                  required
                  errorMessage={organizationForm.errors.lastName}
                  value={organizationForm.values.lastName}
                  isTouched={organizationForm.touched.lastName}
                  onChange={(e) => {
                    organizationForm.setFieldValue('lastName', e.target.value);
                  }}
                />
              </div>
              <div className="mb-8">
                <SelectOption
                  variant="timeZone"
                  className="mt-2"
                  label="Default Timezone"
                  name="time_zone"
                  errorMessage={organizationForm.errors.time_zone}
                  selectedOption={organizationForm.values.time_zone}
                  onChange={(e: any) => {
                    if (e) {
                      organizationForm.setFieldValue('time_zone', e.value);
                    }
                  }}
                />
              </div>

              <div className="mb-8">
                <CustomSearchSelect
                  label="Default Date Format"
                  data={[
                    {
                      label: 'DD MMM YYYY',
                      value: 'DD MMM YYYY',
                    },
                    {
                      label: 'MM-DD-YYYY',
                      value: 'MM-DD-YYYY',
                    },
                    {
                      label: 'YYYY-MM-DD',
                      value: 'YYYY-MM-DD',
                    },
                  ]}
                  showIcon={true}
                  showImage={false}
                  multiple={false}
                  showSearch={true}
                  returnSingleValueWithLabel={true}
                  isOpen={openFilterDropdown === 'dropdown2'}
                  onToggle={() => handleDropdown('dropdown2')}
                  searchPlaceholder="Search Date Format"
                  onSelect={(selected: any, item: any) => {
                    organizationForm.setFieldValue('date_format', selected);
                  }}
                  selected={
                    organizationForm.values.date_format
                      ? [organizationForm.values.date_format]
                      : []
                  }
                  placeholder="Select"
                />
              </div>
              <div className="mb-8">
                <CustomSearchSelect
                  label="Default Language"
                  data={[
                    {
                      label: 'English',
                      value: 'en',
                    },
                  ]}
                  showImage={false}
                  multiple={false}
                  showSearch={false}
                  returnSingleValueWithLabel={true}
                  isOpen={openFilterDropdown === 'dropdown1'}
                  onToggle={() => handleDropdown('dropdown1')}
                  onSelect={(selected: any, item: any) => {
                    organizationForm.setFieldValue('language', selected);
                  }}
                  selected={
                    organizationForm.values.language
                      ? [organizationForm.values.language]
                      : []
                  }
                  placeholder="Select"
                />
              </div>
            </div>
          }
          handleCancel={() => {
            setDetailModal(!showDetailModel);
          }}
          handleSubmit={() => {
            organizationForm.submitForm();
          }}
          isLoading={updateMyUserMutation.isLoading}
          submitDisabled={!organizationForm.isValid}
          submitValue={'Apply'}
        />
        {/* // pick image model  */}
        <CustomModal
          size="md"
          isOpen={showImageModel}
          header={
            <>
              <img src="/svg/update_profile.svg" alt="update_profile" />
              <div>
                <h2 className="text-xl font-semibold text-[#1E1E1E]">
                  {'Profile Picture'}
                </h2>
                <span className="mt-1 text-base font-normal text-[#616161]">
                  {'Replace or remove your user profile picture.'}
                </span>
              </div>
            </>
          }
          body={
            <div className="flex h-[500px] flex-col items-center justify-center overflow-auto px-3">
              <img
                src={
                  selectedImage
                    ? URL.createObjectURL(selectedImage!)
                    : userImage
                      ? userPhotoDisplay
                      : '/images/user.png'
                }
                alt={`image `}
                className="my-4 h-36 w-36 rounded-full object-cover"
              />
              <div className="mt-4 flex gap-6">
                <span
                  className="cursor-pointer text-sm font-semibold text-primary-500"
                  onClick={() => inputRef.current?.click()}
                >
                  {session?.user.user.photo || selectedImage
                    ? 'Replace Photo'
                    : 'Add Photo'}
                </span>
                <span
                  className="cursor-pointer text-sm text-red-400"
                  onClick={() => {
                    setSelectedImage(null);
                    setUserImage(null);
                  }}
                >
                  Remove Photo
                </span>
              </div>
            </div>
          }
          handleCancel={() => {
            setImageModel(!showImageModel);
            setSelectedImage(null);
          }}
          handleSubmit={() => {
            updateMyUserProfileMutation.mutate({
              axiosAuth,
              id: session?.user.user._id!,
              selectedImage: selectedImage,
            });
          }}
          isLoading={updateMyUserProfileMutation.isLoading}
          submitValue={'Save'}
        />
      </div>
    </>
  );
}
