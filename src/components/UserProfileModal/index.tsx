/* eslint-disable @next/next/no-img-element */
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { SelectOption } from "../Form/select";
import { Form, Formik } from "formik";
import { Input } from "../Form/Input";
import { Button } from "../Buttons";
import * as Yup from "yup";
import { User } from "@/types/interfaces";
import { useMutation } from "react-query";
import Loader from "../DottedLoader/loader";
import { dataFormatList, languageList } from "@/app/constants";
import useAxiosAuth from "@/hooks/AxiosAuth";
import { usePresignedUserPhoto } from "@/hooks/usePresignedUserPhoto";
import { useSession } from "next-auth/react";
interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  language: string;
  date_format: string;
  time_zone: string;
}
export default function TikiUserProfile({
  isOpen,
  onOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onOpenChange: () => void;
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
  const userPhotoDisplay = usePresignedUserPhoto(session?.user?.user?.photo);
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

      onOpenChange();
    }
  }, [update, updateMutation, session, onOpenChange]);
  return (
    <Modal
      isOpen={isOpen}
      placement={"center"}
      backdrop={"blur"}
      onOpenChange={onOpenChange}
      scrollBehavior={"outside"}
    >
      <ModalContent className="    w-[90%] md:min-w-[600px] min-h-[650px]">
        {() => (
          <>
            <ModalHeader className="flex flex-col mt-6  text-center gap-1">
              My Details
            </ModalHeader>
            <ModalBody>
              <div className="mx-auto mb-8  h-[132px] w-[132px] relative mt-5">
                <div className="h-[132px] w-[132px] rounded-full overflow-hidden ">
                  <img
                    src={
                      selectedImage
                        ? URL.createObjectURL(selectedImage!)
                        : userPhotoDisplay
                    }
                    alt={`image `}
                    className=" object-cover w-full h-full "
                  />
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
                  className="text-primary-500 text-xs md:text-base font-bold absolute bottom-0 left-[82%] md:left-full block whitespace-nowrap "
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
                      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4 ">
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

                      <ModalFooter className="justify-center">
                        <div className="text-center">
                          <button className="text-[12px] md:text-sm bg-[#0063F7] font-bold text-white leading-[22px] w-[120px]  md:min-w-[188px] py-[8px] px-[10px] md:px-[20px] h-[47px] rounded-lg mt-[12px]">
                            {updateMutation.isLoading ? (
                              <>
                                <Loader />
                              </>
                            ) : (
                              <>Update Details</>
                            )}
                          </button>
                        </div>
                      </ModalFooter>
                    </>
                  </Form>
                )}
              </Formik>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
