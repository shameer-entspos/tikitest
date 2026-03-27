'use client';
import { Button } from '@/components/Buttons';
import { Input } from '@/components/Form/Input';
import { FromHeading } from '@/components/FormHeading';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as Yup from 'yup';
import Loader from '../DottedLoader/loader';
import axios from '@/app/axios';

export default function CreateNewpassword({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const router = useRouter();
  const [loader, setLoader] = useState(false);

  const initialValues = {
    newpassword: '',
    repassword: '',
  };
  const validationSchema = Yup.object().shape({
    newpassword: Yup.string().min(6).max(50).required('Password is required'),
    repassword: Yup.string()
      .min(6)
      .max(50)
      .oneOf([Yup.ref('newpassword')], 'Passwords must match')
      .nonNullable()
      .required('Confirm Password is required'),
  });
  const handleSubmit = async (values: any) => {
    setLoader(true);
    const data = {
      email: email,
      newPassword: values.newpassword,
      token: token,
    };
    await axios
      .post(`organization/resetPassword`, data)
      .then((result) => {
        router.replace('/organization/login');
      })
      .catch((error) => {
        console.log(error.response.data);
      })
      .finally(() => {
        setLoader(false);
      });
  };
  return (
    <>
      {/* {true && (
        <button
          className="inline-flex gap-1 text-primary-600 text-base leading-5 font-normal"
          onClick={() => {
            router.back();
          }}
        >
          <HiArrowLeft className="self-center" />
          Go Back
        </button>
      )} */}
      <FromHeading>
        <h1 className="text-3xl">Create a new password</h1>
      </FromHeading>
      <div className="m-auto max-w-md">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, handleSubmit }) => (
            <>
              <Form onSubmit={handleSubmit}>
                <Input
                  type="password"
                  label="New Password"
                  placeholder="Enter your password"
                  name="newpassword"
                  errorMessage={errors.newpassword}
                  isTouched={touched.newpassword}
                />
                <Input
                  type="password"
                  label="Re enter new Password"
                  placeholder="Re Enter your password"
                  name="repassword"
                  errorMessage={errors.repassword}
                  isTouched={touched.repassword}
                />
                <div className="text-center">
                  <button
                    type="submit"
                    className="mb-[69px] mt-[24px] h-[47px] min-w-[188px] rounded-lg bg-[#9E9E9E] px-[20px] py-[ppx] text-sm font-bold leading-[22px] text-white hover:bg-[#9E9E9E]"
                  >
                    {loader ? (
                      <>
                        <Loader />
                      </>
                    ) : (
                      <>Change Password</>
                    )}
                  </button>
                </div>
              </Form>
            </>
          )}
        </Formik>
      </div>
    </>
  );
}
