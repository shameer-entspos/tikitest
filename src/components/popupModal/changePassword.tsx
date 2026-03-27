import React, { useReducer, useState } from 'react';

import { Input } from '../Form/Input';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { CustomToast } from '../CustomToast';
import Loader from '../DottedLoader/loader';
import useAxiosAuth from '@/hooks/AxiosAuth';
import toast from 'react-hot-toast';
import { SimpleInput } from '../Form/simpleInput';
// Define the interface for the state
interface State {
  showModal: boolean;
  oldPassword: string;
  showLoader: boolean;
}

// Define the action types
type Action = {
  type: 'TOGGLE_MODAL' | 'Old_Pass' | 'Loader';
  oldPassword?: '';
};

// Define the initial state
const initialState: State = {
  showModal: true,
  oldPassword: '',
  showLoader: false,
};

// Define the reducer function
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'TOGGLE_MODAL':
      return {
        ...state,
        showModal: !state.showModal,
      };
    case 'Loader':
      return {
        ...state,
        showLoader: !state.showLoader,
      };
    case 'Old_Pass':
      return {
        ...state,
        oldPassword: action.oldPassword!,
      };
    default:
      return state;
  }
};

const generateRandomPassword = () => {
  const length = 10;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialCharacters = '!@#$%^&*()_+-=[]{}|;:<>?';

  // Ensure at least one character from each category
  let password = '';
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += specialCharacters.charAt(
    Math.floor(Math.random() * specialCharacters.length)
  );

  // Fill the remaining length with random characters from all categories
  const allCharacters = uppercase + lowercase + numbers + specialCharacters;
  for (let i = 4; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allCharacters.length);
    password += allCharacters.charAt(randomIndex);
  }

  // Shuffle the password to avoid predictable patterns
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};

export default function ChangePasswordModal() {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const initialValues = {
    password: '',
    newpassword: '',
    repassword: '',
  };

  const newPassModelSchema = Yup.object().shape({
    newpassword: Yup.string().min(6).max(50).required('Password is required'),
    repassword: Yup.string()
      .min(6)
      .max(50)
      .oneOf([Yup.ref('newpassword')], 'Passwords must match')
      .nonNullable()
      .required('Confirm Password is required'),
  });

  const axiosAuth = useAxiosAuth();
  const handleSubmitNewModel = async (values: any) => {
    dispatch({ type: 'Loader' });
    const data = {
      newPassword: values.newpassword,
      oldPassword: values.password,
    };
    await axiosAuth
      .post(`organization/user/changepassword`, data)
      .then((result) => {
        toast.success('Password changed successfully');
      })
      .catch((error) => {
        setError(error.response.data.message);
      })
      .finally(() => {
        dispatch({ type: 'Loader' });
      });
  };
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div className="max-w-[450px]">
      {/* <CreateNewpassword email='shah' token='helo'/> */}
      <Formik
        initialValues={initialValues}
        validationSchema={newPassModelSchema}
        onSubmit={handleSubmitNewModel}
      >
        {({ errors, touched, handleSubmit, setFieldValue }) => (
          <>
            <Form onSubmit={handleSubmit} className="">
              <div className="mt-10 space-y-2">
                <label className="text-base font-normal leading-[21.97px] text-[#1E1E1E]">
                  Enter current password{' '}
                  <span className="text-danger-500">*</span>
                </label>
                <Input
                  type="password"
                  name="password"
                  placeholder="Your current password"
                  errorMessage={errors.password}
                  isTouched={touched.password}
                />
              </div>
              {error === '' ? (
                <></>
              ) : (
                <CustomToast type={'error'} message={error} />
              )}

              <div className="mt-10 space-y-2">
                <label className={'flex items-center justify-between'}>
                  <span>
                    Enter <b> new</b> password{' '}
                    <span className="text-danger-500">*</span>
                  </span>
                  <span
                    className="cursor-pointer text-primary-400"
                    onClick={() => {
                      const generatedPassword = generateRandomPassword();
                      setFieldValue('newpassword', generatedPassword);
                      setShowPassword(true);
                    }}
                  >
                    Generate Password
                  </span>
                </label>

                <div className="relative">
                  <Input
                    type="password"
                    istoggleVisibility={true}
                    name="newpassword"
                    placeholder="Please enter a strong password"
                    errorMessage={errors.newpassword}
                    isTouched={touched.newpassword}
                  />
                </div>

                <p className="text-sm text-gray-700">
                  Minimum 8 characters with combination of uppercase, lowercase
                  and numbers.
                </p>
              </div>

              <div className="mt-10 space-y-2">
                <label>
                  Confirm <b> new</b> password{' '}
                  <span className="text-danger-500">*</span>
                </label>
                <Input
                  type="password"
                  name="repassword"
                  placeholder="Please enter a strong password"
                  errorMessage={errors.repassword}
                  isTouched={touched.repassword}
                />
              </div>
              <div className="mt-4 text-end">
                <button
                  className="mt-[24px] h-[47px] min-w-[97px] rounded-lg bg-[#0063F7] px-[20px] py-[10px] text-base font-bold leading-[22px] text-white"
                  type="submit"
                >
                  {state.showLoader ? <Loader /> : <>Confirm</>}
                </button>
              </div>
            </Form>
          </>
        )}
      </Formik>
    </div>
  );
}
