import React from 'react';

import { Dialog } from '@headlessui/react';
import CustomHr from '../Ui/CustomHr';
import { TriangleAlert, X } from 'lucide-react';
import { Input } from '../Form/Input';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMutation } from 'react-query';
import { signOut } from 'next-auth/react';
import { deleteAccount } from '@/app/(main)/(org-panel)/organization/users/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { Button } from '../Buttons';
import Loader from '../DottedLoader/loader';
import toast from 'react-hot-toast';

const CloseAccountModal = ({
  openDialog,
  setOpenDialog,
}: {
  openDialog: boolean;
  setOpenDialog: any;
}) => {
  const initialValues = {
    password: '', // Initial value for the password field
  };
  const deleteAccountMutation = useMutation(deleteAccount, {
    onSuccess: () => {
      setOpenDialog(false);
      toast.success('Account deleted successfully');
      signOut({ redirect: true, callbackUrl: '/organization' });
    },
  });
  const validationSchema = Yup.object({
    password: Yup.string()
      .min(6, 'Password must be at least 8 characters')
      .required('Password is required'),
  });
  const axiosAuth = useAxiosAuth();
  const handleSubmit = (values: any) => {
    deleteAccountMutation.mutate({
      axiosAuth: axiosAuth,
      data: {
        password: values.password,
      },
    });
  };
  return (
    <Dialog
      open={openDialog}
      onClose={() => setOpenDialog(false)}
      className="fixed inset-0 z-30 overflow-y-auto"
    >
      <div className="fixed inset-0 flex w-screen items-center justify-center bg-secondary-800/70">
        <Dialog.Panel className="w-[90%] rounded-3xl bg-white px-6 py-5 sm:w-11/12 sm:px-8 md:w-[596px]">
          <Dialog.Title className="flex w-full items-start justify-between">
            <div className="flex w-full items-start justify-between">
              <div className="flex w-full items-start gap-3">
                <TriangleAlert className="h-12 w-12 rounded-full bg-danger-100/70 p-2 text-danger-500" />

                <div className="w-[85%] sm:w-[90%]">
                  <h2 className="text-lg font-medium leading-7 text-[#000000] lg:text-xl">
                    Are you sure you want to close and delete your account?
                  </h2>
                  <span className="text-xs text-gray-600 sm:text-sm">
                    You will have 14 days to log back in and reactivate your
                    account. After 14 days your account and all data will be
                    permanently deleted. Your billing will be cancelled at the
                    end of the month.
                  </span>
                </div>
              </div>

              <button
                className="rounded-md p-1 outline-none hover:bg-gray-100"
                onClick={() => {
                  setOpenDialog(false);
                }}
              >
                <X />
              </button>
            </div>
          </Dialog.Title>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isValid }) => (
              <Form className="mt-4">
                <div className="h-[100px]">
                  <Input
                    type="password"
                    label="Enter password to confirm"
                    placeholder="Enter password"
                    name="password"
                    required
                    istoggleVisibility={true}
                    className="placeholder:text-xs md:placeholder:text-base"
                    errorMessage={errors.password}
                    isTouched={touched.password}
                  />
                </div>
                <CustomHr className="my-2" />
                <div className="flex justify-end gap-5 pt-1 font-medium">
                  <button
                    className="h-9 w-1/2 rounded-lg border-2 border-primary-500 text-sm text-primary-500 sm:h-10 sm:w-32 sm:text-base"
                    onClick={() => setOpenDialog(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="h-9 w-1/2 rounded-lg bg-danger-500 text-sm font-semibold text-white hover:bg-danger-600/80 disabled:opacity-disabled sm:h-10 sm:w-32 sm:text-base"
                  >
                    {deleteAccountMutation.isLoading ? <Loader /> : 'Delete'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CloseAccountModal;
