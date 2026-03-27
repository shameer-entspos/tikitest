import CustomModal from '@/components/Custom_Modal';
import CustomRadio from '@/components/CustomRadioButton/CustomRadioButton';
import { SimpleInput } from '@/components/Form/simpleInput';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Formik, Form, useFormik } from 'formik';
import * as Yup from 'yup';
import { Input } from '@/components/Form/Input';
import { useMutation, useQueryClient } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import {
  createCustomer,
  updateCustomer,
} from '@/app/(main)/(user-panel)/user/chats/api';
import Loader from '@/components/DottedLoader/loader';
import { UserDetail } from '@/types/interfaces';
import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';

const AddCustomerModel = ({
  isOpen,

  onCloseModal,
}: {
  isOpen: boolean;

  onCloseModal: any;
}) => {
  const { state, dispatch } = useChatCotnext();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const createMutation = useMutation(createCustomer, {
    onSuccess: () => {
      onCloseModal();
      queryClient.invalidateQueries('contacts');
    },
  });
  const updateMutation = useMutation(updateCustomer, {
    onSuccess: () => {
      onCloseModal();
      queryClient.invalidateQueries('contacts');
    },
  });
  const initialValues = {
    role: state.showContactDetail?.detail?.role?.toString() ?? '4',
    customerName: state.showContactDetail?.detail?.customerName ?? '',
    reference: state.showContactDetail?.detail?.reference ?? '',
    email: state.showContactDetail?.detail?.email ?? '',
    phone: state.showContactDetail?.detail?.phone ?? '',
    address: state.showContactDetail?.detail?.address ?? '',
    firstName: state.showContactDetail?.detail?.firstName ?? '',
    lastName: state.showContactDetail?.detail?.lastName ?? '',
  };

  const validationSchema = Yup.object({
    customerName: Yup.string().required('Required'),
    reference: Yup.string(),
    email: Yup.string().email('Invalid email').required('Required'),
    phone: Yup.string().required('Required'),
    address: Yup.string(),
    firstName: Yup.string().required('Required'),
    lastName: Yup.string().required('Required'),
  });

  const orgFormIk = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      console.log('Form values:', values);
      if (state.showContactDetail?.action == 'edit') {
        updateMutation.mutate({
          axiosAuth,
          data: {
            ...values,
          },
          id: state.showContactDetail?.detail?._id,
        });
      } else {
        createMutation.mutate({
          axiosAuth,
          data: {
            ...values,
          },
        });
      }
    },
  });

  return (
    <CustomModal
      size="md"
      isOpen={isOpen}
      header={
        <div className="flex gap-3">
          <svg
            width="50"
            height="50"
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
            <g clipPath="url(#clip0_444_104985)">
              <path
                d="M17.5278 25.278H33.4722V28.2724H35.0278V23.7224H26.2778V20.6113H24.7222V23.7224H15.9722V28.2724H17.5278V25.278Z"
                fill="#0063F7"
              />
              <path
                d="M21.6111 29.3613H11.8889C10.815 29.3613 9.94446 30.2319 9.94446 31.3058V37.1391C9.94446 38.213 10.815 39.0835 11.8889 39.0835H21.6111C22.685 39.0835 23.5556 38.213 23.5556 37.1391V31.3058C23.5556 30.2319 22.685 29.3613 21.6111 29.3613Z"
                fill="#0063F7"
              />
              <path
                d="M39.1111 29.3613H29.3889C28.315 29.3613 27.4445 30.2319 27.4445 31.3058V37.1391C27.4445 38.213 28.315 39.0835 29.3889 39.0835H39.1111C40.185 39.0835 41.0556 38.213 41.0556 37.1391V31.3058C41.0556 30.2319 40.185 29.3613 39.1111 29.3613Z"
                fill="#0063F7"
              />
              <path
                d="M30.361 9.91699H20.6388C19.5649 9.91699 18.6943 10.7875 18.6943 11.8614V17.6948C18.6943 18.7687 19.5649 19.6392 20.6388 19.6392H30.361C31.4349 19.6392 32.3054 18.7687 32.3054 17.6948V11.8614C32.3054 10.7875 31.4349 9.91699 30.361 9.91699Z"
                fill="#0063F7"
              />
            </g>
            <defs>
              <clipPath id="clip0_444_104985">
                <rect
                  width="35"
                  height="35"
                  fill="white"
                  transform="translate(8 7)"
                />
              </clipPath>
            </defs>
          </svg>

          <div className="w-[calc(100%_-_55px)]">
            <h2 className="text-xl font-semibold">Add Customer / Supplier</h2>
            <p className="mt-1 pr-1 text-base font-normal text-[#616161]">
              Enter details below{' '}
            </p>
          </div>
        </div>
      }
      body={
        <div className="flex h-[500px] flex-col gap-4 overflow-auto px-3">
          <div className="space-y-1">
            <div className="flex flex-col">
              <label className="mt-0 !font-normal">Customer or Supplier</label>
              <CustomRadio
                name="role"
                value={'4'}
                checkedValue={orgFormIk.values.role}
                onChange={(value) => orgFormIk.setFieldValue('role', '4')}
                label="Customer"
              />
              <CustomRadio
                name="role"
                value={'5'}
                checkedValue={orgFormIk.values.role}
                onChange={(value) => orgFormIk.setFieldValue('role', '5')}
                label="Supplier"
              />
            </div>
            <SimpleInput
              type="text"
              label="Customer / Supplier Name"
              placeholder="Enter name"
              name="customerName"
              className="w-full"
              required
              errorMessage={orgFormIk.errors.customerName}
              value={orgFormIk.values.customerName}
              isTouched={orgFormIk.touched.customerName}
              onChange={orgFormIk.handleChange}
            />
            <SimpleInput
              type="text"
              label="Reference / Account No"
              placeholder="Enter account number"
              name="reference"
              className="w-full"
              errorMessage={orgFormIk.errors.reference}
              value={orgFormIk.values.reference}
              isTouched={orgFormIk.touched.reference}
              onChange={orgFormIk.handleChange}
            />
            <SimpleInput
              type="email"
              label="Primary Email Address"
              placeholder="Enter email address"
              name="email"
              required
              className="w-full"
              errorMessage={orgFormIk.errors.email}
              value={orgFormIk.values.email}
              isTouched={orgFormIk.touched.email}
              onChange={orgFormIk.handleChange}
            />

            <SimpleInput
              type="text"
              label="Primary Phone Number"
              placeholder="Enter phone number"
              name="phone"
              required
              className="w-full"
              errorMessage={orgFormIk.errors.phone}
              value={orgFormIk.values.phone}
              isTouched={orgFormIk.touched.phone}
              onChange={orgFormIk.handleChange}
            />

            <SimpleInput
              type="text"
              label="Primary First Name"
              placeholder="Enter first name"
              name="firstName"
              required
              className="w-full"
              errorMessage={orgFormIk.errors.firstName}
              value={orgFormIk.values.firstName}
              isTouched={orgFormIk.touched.firstName}
              onChange={orgFormIk.handleChange}
            />

            <SimpleInput
              type="text"
              label="Primary Last Name"
              placeholder="Enter last name"
              name="lastName"
              required
              className="w-full"
              errorMessage={orgFormIk.errors.lastName}
              value={orgFormIk.values.lastName}
              isTouched={orgFormIk.touched.lastName}
              onChange={orgFormIk.handleChange}
            />

            <SimpleInput
              type="text"
              label="Address"
              placeholder="Enter address"
              name="address"
              className="w-full"
              errorMessage={orgFormIk.errors.address}
              value={orgFormIk.values.address}
              isTouched={orgFormIk.touched.address}
              onChange={orgFormIk.handleChange}
            />
          </div>
        </div>
      }
      handleCancel={() => {
        onCloseModal();
      }}
      handleSubmit={() => orgFormIk.submitForm()}
      variant={'primary'}
      isLoading={updateMutation.isLoading || createMutation.isLoading}
      submitValue={state.showContactDetail?.action == 'edit' ? 'Update' : 'Add'}
    />
  );
};

export default AddCustomerModel;
