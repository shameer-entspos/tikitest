'use client';
import { Button } from '@/components/Buttons';
import { Input } from '@/components/Form/Input';
import { Form, Formik } from 'formik';
import Link from 'next/link';
import * as Yup from 'yup';

import { useState } from 'react';

import OtpVerify from '@/components/OtpVerification/otpVerify';
import { HiArrowLeft } from 'react-icons/hi2';
import { FromHeading } from '@/components/FormHeading';
import Loader from '@/components/DottedLoader/loader';
import { CustomToast } from '@/components/CustomToast';
import axios from '@/app/axios';

const Register = () => {
  const [register, setRegister] = useState(true);
  const [registeremail, setRegisterEmail] = useState('');
  const [loader, setLoader] = useState(false);
  const [errorEmailExist, setEmailExist] = useState('');
  const [error, setError] = useState('');
  const initialValues = {
    firstName: '',
    lastName: '',
    name: '',
    email: '',
    password: '',
    confirm_password: '',
  };
  const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
  const SignupSchema = Yup.object().shape({
    firstName: Yup.string().min(2).max(50).required('First Name is required'),
    lastName: Yup.string().min(2).max(50).required('Last Name is required'),
    name: Yup.string().min(2).max(50).required('Organization Name is required'),
    email: Yup.string().email().required('Email is required'),
    password: Yup.string()
      .min(6)
      .max(50)
      .required('Password is required')
      .matches(passwordRules, {
        message:
          'password must contain 6 or more characters with at least one of each: uppercase, lowercase, number and special',
      }),
    confirm_password: Yup.string()
      .min(6)
      .max(50)
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .nonNullable()
      .required('Confirm Password is required'),
  });
  const handleSubmit = async (values: any) => {
    setLoader(true);
    const data = {
      email: `${values.email}`.toLowerCase(),
      ...values,
    };
    await axios
      .post(`organization/register`, data)
      .then((_response) => {
        console.log('resonse' + _response.data);
        setRegisterEmail(values.email);
        setRegister(false);
      })
      .catch((error) => {
        setError(error.response.data.message);
      })
      .finally(() => {
        setLoader(false);
      });
  };
  return (
    <div className="h-max w-full overflow-auto rounded-2xl bg-white p-6 scrollbar-hide">
      {register ? (
        <div className="h-full w-full">
          <Link
            href="/organization/login"
            className="inline-flex gap-1 text-[#0063F7]"
          >
            <HiArrowLeft className="self-center text-[#0063F7]" />
            Go Back
          </Link>

          <FromHeading>Sign Up</FromHeading>

          <div className="m-auto h-auto overflow-auto px-4">
            <Formik
              initialValues={initialValues}
              validationSchema={SignupSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, handleSubmit }) => (
                <Form onSubmit={handleSubmit}>
                  {error === '' ? (
                    <></>
                  ) : (
                    <CustomToast type={'error'} message={error} />
                  )}
                  <div className="grid gap-2 md:grid-cols-1 lg:grid-cols-2">
                    <Input
                      name="firstName"
                      type="text"
                      placeholder="First Name"
                      label="First Name"
                      errorMessage={errors?.firstName}
                      isTouched={touched?.firstName}
                    />
                    <Input
                      name="lastName"
                      type="text"
                      placeholder="Last Name"
                      label="Last Name"
                      errorMessage={errors?.lastName}
                      isTouched={touched?.lastName}
                    />
                  </div>
                  <Input
                    type="text"
                    label="Organization Name"
                    name="name"
                    placeholder="Organization Name"
                    errorMessage={errors?.name}
                    isTouched={touched?.name}
                  />
                  <Input
                    type="email"
                    label="Email"
                    name="email"
                    placeholder="Email"
                    // className="mb-4"
                    autoComplete="off"
                    errorMessage={
                      errorEmailExist == '' ? errors?.email : errorEmailExist
                    }
                    isTouched={touched?.email}
                  />
                  <div className="relative">
                    <Input
                      type="password"
                      label="Password"
                      name="password"
                      istoggleVisibility={true}
                      placeholder="Password"
                      // className="mb-4"
                      autoComplete="off"
                      errorMessage={errors?.password}
                      isTouched={touched?.password}
                    />
                  </div>
                  <Input
                    type="password"
                    label="Confirm Password"
                    name="confirm_password"
                    placeholder="Confirm Password"
                    // className="mb-4"
                    autoComplete="off"
                    errorMessage={errors?.confirm_password}
                    isTouched={touched?.confirm_password}
                  />
                  <div className="mt-6 flex flex-col items-center gap-2 text-center">
                    <button
                      type="submit"
                      className="h-[47px] min-w-[188px] rounded-lg bg-[#0063F7] px-[20px] py-[ppx] font-bold leading-[22px] text-white"
                    >
                      {loader ? (
                        <>
                          <Loader />
                        </>
                      ) : (
                        <>Create Acount</>
                      )}
                    </button>

                    <div className="text-center text-lg font-normal text-black">
                      Already have an account?
                      <Link
                        href="/organization/login"
                        className="ml-2 inline-block cursor-pointer align-baseline font-bold text-primary-500 hover:text-primary-500"
                      >
                        Sign In
                      </Link>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      ) : (
        <div className="">
          <Link
            href="/organization/signup"
            onClick={() => setRegister(true)}
            className="inline-flex gap-1 text-[#0063F7]"
          >
            <HiArrowLeft className="self-center text-[#0063F7]" />
            Go Back
          </Link>
          <div className="m-auto max-w-lg">
            <OtpVerify email={registeremail} type="register" />
          </div>
        </div>
      )}
    </div>
  );
};

export { Register as OrganizationRegister };
