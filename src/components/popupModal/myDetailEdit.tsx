/* eslint-disable @next/next/no-img-element */
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Button } from '../Buttons';
import Image from 'next/image';
import { SelectOption } from '../Form/select';
import { Form, Formik } from 'formik';
import { Input } from '../Form/Input';
import { useSession } from 'next-auth/react';

import * as Yup from 'yup';
import { User } from '@/types/interfaces';
import { useMutation } from 'react-query';
import Loader from '../DottedLoader/loader';
import { dataFormatList, languageList } from '@/app/constants';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { X } from 'lucide-react';
import CustomHr from '../Ui/CustomHr';
interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  language: string;
  date_format: string;
  time_zone: string;
}

export default function MyDetailModal({
  setOpenDetailModal,
}: {
  setOpenDetailModal: any;
}) {
  const authAxios = useAxiosAuth();
  const editUser = async (usrData: IUser) => {
    const formData = new FormData();

    if (selectedImage) {
      formData.append('photo', selectedImage!);
    }

    formData.append('firstName', usrData.firstName);
    formData.append('lastName', usrData.lastName);
    formData.append('language', usrData.language);
    formData.append('date_format', usrData.date_format);
    formData.append('time_zone', usrData.time_zone);

    try {
      const response = await authAxios.post(
        `organization/updateMyUser/${usrData.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data', // Override the Content-Type header for this request
          },
        }
      );
      return response.data.user as User;
    } catch (error: any) {
      throw new Error(error.response.data.message);
    }
  };
  // const [image, setImage] = useState('/images/User-profile.png');
  const [selectedImage, setSelectedImage] = useState<File | null>();
  const inputRef = useRef<HTMLInputElement>(null);
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedImage(file || null);
  };

  const { data: session, update } = useSession();
  const initialValues = {
    id: session?.user?.user._id ?? '',
    firstName: session?.user?.user.firstName ?? '',
    lastName: session?.user?.user.lastName ?? '',
    language: session?.user?.user.setting?.language ?? 'en',
    date_format: session?.user?.user.setting?.date_format ?? 'dd/mm/yyyy',
    time_zone:
      session?.user?.user.setting?.time_zone! ??
      Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last Name is required'),
    language: Yup.string().required('Language is required'),
    date_format: Yup.string().required('Date format is required'),
    time_zone: Yup.string().required('Timezone is required'),
  });
  const updateMutation = useMutation(editUser);
  const handleSubmit = async (values: any) => {
    const _uData = {
      id: initialValues.id,
      firstName: values.firstName,
      lastName: values.lastName,
      language: initialValues.language,
      date_format: initialValues.date_format,
      time_zone: initialValues.time_zone,
    };

    updateMutation.mutate(_uData);
  };
  useEffect(() => {
    if (updateMutation.isSuccess) {
      const updatedUser = {
        ...session?.user,
        user: updateMutation.data,
      };

      const updatedSession = {
        ...session,
        user: updatedUser,
      };

      update(updatedSession);

      setOpenDetailModal(false);
    }
  }, [update, updateMutation, session, setOpenDetailModal]);
  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div
          className="fixed inset-0 h-full w-full bg-black opacity-40"
          onClick={() => setOpenDetailModal(false)}
        ></div>
        <div className="flex items-center px-4 py-8">
          <div className="relative mx-auto min-h-[650px] w-full max-w-[600px] rounded-3xl bg-white shadow-lg">
            <div className="p-8">
              <div className="flex w-full items-start justify-between">
                <div className="flex w-full items-center gap-3">
                  <div>
                    <h2 className="text-lg font-medium leading-7 text-[#000000] lg:text-xl">
                      Edit Details
                    </h2>
                    <span className="text-xs text-gray-600 sm:text-sm">
                      View and start task details below
                    </span>
                  </div>
                </div>

                <button
                  className="rounded-md p-1 outline-none hover:bg-gray-100"
                  onClick={() => {
                    setOpenDetailModal(false);
                  }}
                >
                  <X />
                </button>
              </div>

              <CustomHr className="my-4" />

              <div className="relative mx-auto mb-12 h-[132px] w-[132px]">
                <div className="absolute h-[132px] w-[132px] overflow-hidden rounded-full">
                  <img
                    // src={`${session?.user.user.photo ?? "/images/user.png"}`}
                    src={
                      selectedImage
                        ? URL.createObjectURL(selectedImage!)
                        : session?.user.user.photo!
                          ? session.user.user.photo
                          : '/images/user.png'
                    }
                    alt={`image `}
                    className="h-full w-full object-cover"
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  ref={inputRef}
                />

                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="absolute bottom-0 left-[85%] block whitespace-nowrap text-xs font-bold text-primary-500 sm:left-full sm:text-base"
                >
                  Change photo
                </button>
              </div>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, isValid, touched, handleSubmit }) => (
                  <Form onSubmit={handleSubmit}>
                    <>
                      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                        <Input
                          type="text"
                          label="First Name"
                          name="firstName"
                          placeholder="First name"
                          // className="mb-4"
                          // value="office@bobsburgers.com"
                          autoComplete="off"
                          errorMessage={errors.firstName}
                          isTouched={touched.firstName}
                        />
                        <Input
                          type="text"
                          label="Last Name"
                          name="lastName"
                          placeholder="Last name"
                          // className="mb-4"
                          autoComplete="off"
                          errorMessage={errors.lastName}
                          isTouched={touched.lastName}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                        <SelectOption
                          variant="simpleSlect"
                          label="Default Language"
                          name="language"
                          selectedOption={initialValues.language}
                          errorMessage={errors.language}
                          options={languageList}
                          onChange={(e: any) => {
                            if (e) {
                              initialValues.language = e.value;
                            }
                          }}
                        />
                        <SelectOption
                          variant="simpleSlect"
                          label="Date Format"
                          name="date_format"
                          options={dataFormatList}
                          selectedOption={initialValues.date_format}
                          errorMessage={errors.date_format}
                          onChange={(e: any) => {
                            if (e) {
                              initialValues.date_format = e.value;
                            }
                          }}
                        />
                      </div>
                      <SelectOption
                        variant="timeZone"
                        label="Default Timezone"
                        name="time_zone"
                        errorMessage={errors.time_zone}
                        selectedOption={initialValues.time_zone}
                        onChange={(e: any) => {
                          if (e) {
                            initialValues.time_zone = e.value;
                          }
                        }}
                      />

                      <CustomHr className="my-4" />

                      <div className="text-center">
                        <button
                          className="h-11 w-1/2 rounded-lg bg-primary-500 text-sm font-semibold text-white hover:bg-primary-600/80 sm:h-12 sm:w-36 sm:text-base"
                          type="submit"
                        >
                          {updateMutation.isLoading ? (
                            <>
                              <Loader />
                            </>
                          ) : (
                            <>Update Details</>
                          )}
                        </button>
                      </div>
                    </>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
