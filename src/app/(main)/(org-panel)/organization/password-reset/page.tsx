'use client';
import { Button } from '@/components/Buttons';
import { Input } from '@/components/Form/Input';
import { FromHeading } from '@/components/FormHeading';
import Link from 'next/link';
import * as Yup from 'yup';

import { HiArrowLeft } from 'react-icons/hi2';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import OtpVerify from '@/components/OtpVerification/otpVerify';
import axios from 'axios';
import { CustomToast } from '@/components/CustomToast';
import Loader from '@/components/DottedLoader/loader';
export default function Page() {
  const [passwordPage, setPasswrodPage] = useState(true);
  const [forgotemail, setRegisterEmail] = useState('');
  const [error, setError] = useState('');
  const [loader, setLoader] = useState(false);

  const initialValues = {
    email: '',
  };
  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
  });
  const handleSubmit = async (values: any) => {
    setLoader(true);
    await axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/organization/forgotPassword`,
        values
      )
      .then((result) => {
        setRegisterEmail(values.email);
        setPasswrodPage(false);
      })
      .catch((error) => {
        if (typeof error.response.data.errors === 'object') {
          setError(error.response.data.errors[0].msg);
        }
        if (typeof error.response.data.message === 'string') {
          console.log(error.response.data.message);
        }
      })
      .finally(() => {
        setLoader(false);
      });
  };

  return (
    <div className="grid h-[calc(var(--app-vh)_-_90px)] w-full place-content-center">
      <div className="mb-4 h-max rounded-2xl bg-white p-6">
        {passwordPage ? (
          <div className="flex flex-col gap-4">
            {true && (
              <Link
                href="/organization/login"
                className="inline-flex gap-1 text-base font-normal leading-5 text-primary-600"
              >
                <HiArrowLeft className="self-center" />
                Go Back
              </Link>
            )}
            <div className="m-auto max-w-md">
              <FromHeading>Password Reset</FromHeading>

              <p className="text-center text-sm font-normal leading-5 text-black">
                Please enter your user email address below and submit. You will
                receive a 4 digit verification code.
              </p>
              <div className="mt-4 text-center">
                <div className="text-left">
                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ errors, touched, handleSubmit }) => (
                      <>
                        <Form onSubmit={handleSubmit}>
                          {error === '' ? (
                            <></>
                          ) : (
                            <CustomToast type={'error'} message={error} />
                          )}

                          <Input
                            type="email"
                            label="Email Address"
                            placeholder="Enter your email address"
                            name="email"
                            errorMessage={errors.email}
                            isTouched={touched.email}
                          />
                          <div className="flex items-center justify-center">
                            <button
                              className="mb-[12px] mt-[16px] h-[47px] min-w-[188px] rounded-lg bg-[#0063F7] px-[20px] py-[ppx] font-bold leading-[22px] text-white"
                              type="submit"
                            >
                              {loader ? (
                                <>
                                  <Loader />
                                </>
                              ) : (
                                <>Reset Password</>
                              )}
                            </button>
                          </div>
                        </Form>
                      </>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <Link
              href="/organization/password-reset"
              onClick={() => setPasswrodPage(true)}
              className="inline-flex gap-1 text-primary-600"
            >
              <HiArrowLeft className="self-center text-primary-600" />
              Go Back
            </Link>
            <div className="m-auto max-w-lg">
              <OtpVerify email={forgotemail} type="password" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
