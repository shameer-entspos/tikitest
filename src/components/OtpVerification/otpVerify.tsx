'use client';
import { Button } from '@/components/Buttons';
import { Input } from '@/components/Form/Input';
import { FromHeading } from '@/components/FormHeading';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import { useRouter } from 'next/navigation';

import { useEffect, useState } from 'react';
import Loader from '../DottedLoader/loader';
import { CustomToast } from '../CustomToast';
import CreateNewpassword from '../CreateNewPassword';
import axios from '@/app/axios';

function OtpVerify({
  email,
  type,
}: {
  email: string;
  type: 'register' | 'password';
}) {
  const router = useRouter();

  const [loader, setLoader] = useState(false);
  const [error, setError] = useState('');
  const [seconds, setSeconds] = useState(60);
  const [passwordPage, setPasswrodPage] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [seconds]);

  const initialValues = {
    otp: '',
  };

  const validationSchema = Yup.object().shape({
    otp: Yup.string().length(4).required('otp is required'),
  });
  const handleSubmit = async (values: any) => {
    console.log('moon' + values);
    setLoader(true);

    if (type == 'register') {
      const data = {
        email,
        code: values.otp,
      };
      await axios
        .post(`organization/verifyOtp`, data)
        .then((result) => {
          setLoader(false);
          router.replace('/organization/login');
        })
        .catch((error) => {
          setError(error.response.data.message);
        })
        .finally(() => {
          setLoader(false);
        });
    }

    if (type == 'password') {
      const data = {
        email,
        code: values.otp,
      };
      await axios
        .post(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/organization/verifyOtp`,
          data
        )
        .then((result) => {
          console.log(result.data);
          setToken(result.data.token);
          setPasswrodPage(true);
          setLoader(false);
        })
        .catch((error) => {
          setError(error.response.data.message);
        })
        .finally(() => {
          setLoader(false);
        });
    }
  };
  const resendOtp = async () => {
    if (type == 'register') {
      const data = {
        email,
      };
      await axios
        .post(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/organization/resendOtp`,
          data
        )
        .then((result) => {
          setSeconds(60);
        })
        .catch((error) => {
          setError(error.response.data.message);
        });
    }
  };
  return (
    <>
      {passwordPage ? (
        <>
          <CreateNewpassword token={token} email={email} />
        </>
      ) : (
        <>
          <div className="m-auto mt-5 max-w-md">
            <FromHeading>Check your inbox</FromHeading>

            <p className="mb-6 text-center text-base font-normal leading-5 text-black">
              An email verification code has been sent to{' '}
              <p className="text-sm"> {email} </p>
            </p>
            <div className="text-center">
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
                        type="number"
                        className=""
                        label="Verification Code"
                        placeholder="Enter 4 Digit Code"
                        name="otp"
                        errorMessage={errors.otp}
                        isTouched={touched.otp}
                        maxLength={4}
                      />

                      <Button
                        variant="primary"
                        type="submit"
                        disabled={errors.otp ? true : false}
                        className="px-12"
                      >
                        {loader ? (
                          <>
                            <Loader />
                          </>
                        ) : (
                          <>Verify Otp</>
                        )}
                      </Button>
                    </Form>
                  </>
                )}
              </Formik>

              <p className="mt-7 text-center text-base font-normal leading-5 text-black">
                {seconds === 0 ? (
                  <button onClick={resendOtp}>Resend code</button>
                ) : (
                  <p>Resend code: ({seconds})</p>
                )}
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default OtpVerify;
