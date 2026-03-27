/* eslint-disable @next/next/no-img-element */
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { Button } from "../Buttons";
import Image from "next/image";
import { SelectOption } from "../Form/select";
import { Form, Formik } from "formik";
import { Input } from "../Form/Input";
import { useSession } from "next-auth/react";

import * as Yup from "yup";
import { User } from "@/types/interfaces";
import { useMutation } from "react-query";
import Loader from "../DottedLoader/loader";
import { dataFormatList, languageList } from "@/app/constants";
import useAxiosAuth from "@/hooks/AxiosAuth";
interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  language: string;
  date_format: string;
  time_zone: string;
}

export default function ShowUserProfile({
  setOpenDetailModal,
}: {
  setOpenDetailModal: any;
}) {
  const authAxios = useAxiosAuth();
  const editUser = async (usrData: IUser) => {
    const formData = new FormData();

    if (selectedImage) {
      formData.append("photo", selectedImage!);
    }

    formData.append("firstName", usrData.firstName);
    formData.append("lastName", usrData.lastName);
    formData.append("language", usrData.language);
    formData.append("date_format", usrData.date_format);
    formData.append("time_zone", usrData.time_zone);

    try {
      const response = await authAxios.post(
        `organization/updateMyUser/${usrData.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Override the Content-Type header for this request
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
    id: session?.user?.user._id ?? "",
    firstName: session?.user?.user.firstName ?? "",
    lastName: session?.user?.user.lastName ?? "",
    language: session?.user?.user.setting?.language ?? "en",
    date_format: session?.user?.user.setting?.date_format ?? "dd/mm/yyyy",
    time_zone:
      session?.user?.user.setting?.time_zone! ??
      Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last Name is required"),
    language: Yup.string().required("Language is required"),
    date_format: Yup.string().required("Date format is required"),
    time_zone: Yup.string().required("Timezone is required"),
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
          className="fixed inset-0 w-full h-full bg-black opacity-40"
          onClick={() => setOpenDetailModal(false)}
        ></div>
        <div className="flex items-center min-h-screen px-4 py-8">
          <div className="relative w-full max-w-[600px] mx-auto bg-white rounded-md shadow-lg">
            <div className="py-3 md:py-14 px-3 md:px-12">
              <button
                className="absolute top-16 right-8"
                onClick={() => setOpenDetailModal(false)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.00005 8.3998L2.10005 13.2998C1.91672 13.4831 1.68338 13.5748 1.40005 13.5748C1.11672 13.5748 0.883382 13.4831 0.700048 13.2998C0.516715 13.1165 0.425049 12.8831 0.425049 12.5998C0.425049 12.3165 0.516715 12.0831 0.700048 11.8998L5.60005 6.9998L0.700048 2.0998C0.516715 1.91647 0.425049 1.68314 0.425049 1.3998C0.425049 1.11647 0.516715 0.883138 0.700048 0.699804C0.883382 0.516471 1.11672 0.424805 1.40005 0.424805C1.68338 0.424805 1.91672 0.516471 2.10005 0.699804L7.00005 5.5998L11.9 0.699804C12.0834 0.516471 12.3167 0.424805 12.6 0.424805C12.8834 0.424805 13.1167 0.516471 13.3 0.699804C13.4834 0.883138 13.575 1.11647 13.575 1.3998C13.575 1.68314 13.4834 1.91647 13.3 2.0998L8.40005 6.9998L13.3 11.8998C13.4834 12.0831 13.575 12.3165 13.575 12.5998C13.575 12.8831 13.4834 13.1165 13.3 13.2998C13.1167 13.4831 12.8834 13.5748 12.6 13.5748C12.3167 13.5748 12.0834 13.4831 11.9 13.2998L7.00005 8.3998Z"
                    fill="#616161"
                  />
                </svg>
              </button>
              <div className="text-2xl font-semibold text-black mb-10 text-center">
                My Details
              </div>

              <div className="mx-auto mb-12  h-[132px] w-[132px] relative ">
                <div className="h-[132px] w-[132px] rounded-full overflow-hidden absolute">
                  <img
                    src={
                      selectedImage
                        ? URL.createObjectURL(selectedImage!)
                        : session?.user.user.photo!
                        ? session.user.user.photo
                        : "/images/user.png"
                    }
                    alt={`image `}
                    className=" object-cover w-full h-full"
                  />
                  {/* <Image
                    src={
                      selectedImage
                        ? URL.createObjectURL(selectedImage!)
                        : 
                        
                        session?.user.user.photo!


                        ? session.user.user.photo
                        : "/images/user.png"
                    }
                    alt="Vercel Logo"
                    className="rounded-full "
                    priority
                    fill
                    sizes="(max-width: 132px), (max-width: 100px)"
                  /> */}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                  ref={inputRef}
                />

                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-primary-500 text-base font-bold absolute bottom-0 left-full block whitespace-nowrap"
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
                      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4">
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
                      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4">
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
                      <div className="text-center">
                        <Button className="mt-[24px]" type="submit">
                          {updateMutation.isLoading ? (
                            <>
                              <Loader />
                            </>
                          ) : (
                            <>Update Details</>
                          )}
                        </Button>
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
