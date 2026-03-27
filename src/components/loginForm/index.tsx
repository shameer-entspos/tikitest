'use client';

import { Formik } from 'formik';
import * as Yup from 'yup';

import { Button } from '../Buttons';
import { Input } from '../Form/Input';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Loader from '../DottedLoader/loader';
import { useRouter } from 'next/navigation';
import { CustomToast } from '../CustomToast';
import { FromHeading } from '../FormHeading';
import { AppDispatch, RootState } from '@/store';
import { setLoginType } from '@/store/authNavbarSlice';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const LoginForm = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const reduxDispatch = useDispatch<AppDispatch>();
  const loginType = useSelector(
    (state: RootState) => state.authNavbar.loginType
  );

  // 1. First, handle URL-based detection (runs once on mount)
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const callbackUrlParam = queryParams.get('callbackUrl');

    if (callbackUrlParam?.includes('/organization')) {
      reduxDispatch(setLoginType('admin'));
    } else {
      // Default to user if no organization path found
      reduxDispatch(setLoginType('user'));
    }
  }, []); // Empty dependency array = runs once on mount

  // 2. Handle session-based role detection
  useEffect(() => {
    if (session && !loginType) {
      if (session.user.user.role === 3) {
        // Assuming 3 is organization role
        reduxDispatch(setLoginType('admin'));
      } else {
        reduxDispatch(setLoginType('user'));
      }
    }
  }, [session, loginType]);

  const [error, setError] = useState('');

  const [loader, setLoader] = useState(true);
  const initialValues = {
    email: '',
    password: '',
  };

  ////////////////////////
  const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .matches(passwordRules, {
        message:
          'password must contain 6 or more characters with at least one of each: uppercase, lowercase, number and special',
      })
      .min(6, 'Password must be at least 6 characters'),
  });
  const handleSubmit = async (values: any) => {
    setLoader(false);
    setError('');

    try {
      let result;

      switch (loginType) {
        case 'user':
          result = await signIn('user', {
            id: 'user',
            email: `${values.email}`.toLowerCase(),
            password: `${values.password}`,
            redirect: false,
          });

          if (result?.ok) {
            toast.success('Login successful!');
            router.replace(`${process.env.NEXT_PUBLIC_APP_URL}/user/feeds`);
          } else {
            const errorMessage = result?.error || 'Invalid credentials';
            setError(errorMessage);
            toast.error(errorMessage);
          }
          break;

        case 'admin':
          result = await signIn('organization', {
            id: 'organization',
            email: `${values.email}`.toLowerCase(),
            password: `${values.password}`,
            redirect: false,
          });
          console.log('result', result);
          if (result?.ok) {
            toast.success('Login successful!');
            router.push(
              `${process.env.NEXT_PUBLIC_APP_URL}/organization/organization-details`
            );
          } else {
            const errorMessage = result?.error || 'Invalid credentials';
            setError(errorMessage);
            toast.error(errorMessage);
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoader(true);
    }
  };

  return (
    <>
      <div className="p-4">
        <FromHeading>
          <div className="">
            Log In as {loginType.charAt(0).toUpperCase() + loginType.slice(1)}
          </div>
        </FromHeading>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, handleSubmit }) => (
            <>
              <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
                {error === '' ? (
                  <></>
                ) : (
                  <CustomToast type={'error'} message={error} />
                )}

                {/* <label>{loginType}</label> */}
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="Enter your Email Address"
                  name="email"
                  required
                  errorMessage={errors.email}
                  isTouched={touched.email}
                />

                <div className="relative">
                  <Input
                    type="password"
                    istoggleVisibility={true}
                    label="Password"
                    placeholder=" Enter your Password"
                    name="password"
                    required
                    errorMessage={errors.password}
                    isTouched={touched.password}
                  />
                </div>

                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="flex w-full justify-end">
                    <a
                      className="inline-block align-baseline text-[16px] text-[#0063F7]"
                      href="/organization/password-reset"
                    >
                      Forgot Your Password ?
                    </a>
                  </div>

                  <button
                    className="mt-6 h-[47px] min-w-[188px] rounded-lg bg-[#0063F7] font-bold leading-[22px] text-white"
                    type="submit"
                  >
                    {loader ? <>Log In</> : <Loader />}
                  </button>
                </div>
              </form>

              <div className="mt-2 text-center text-lg font-normal text-black">
                Don&apos;t You have an account?
                <div
                  onClick={() => {
                    router.push(
                      `${process.env.NEXT_PUBLIC_APP_URL}/organization/signup`
                    );
                  }}
                  className="ml-2 inline-block cursor-pointer align-baseline font-bold text-primary-500 hover:text-primary-500"
                >
                  Sign Up
                </div>
              </div>
            </>
          )}
        </Formik>
      </div>
    </>
  );
};

export { LoginForm };
