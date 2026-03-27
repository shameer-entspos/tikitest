import React, { useMemo } from 'react';
import CustomModal from '@/components/Custom_Modal';
import { SelectOption } from '@/components/Form/select';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  createCard,
  editCard,
  getCards,
  setDefaultCard as setDfCard,
} from './api';
import toast from 'react-hot-toast';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { SimpleInput } from '@/components/Form/simpleInput';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import countryList from 'react-select-country-list';
import { SingleValue } from 'react-select';
import { signOut, useSession } from 'next-auth/react';
import Stripe from 'stripe';

function isValidCardNumber(cardNumber: string): boolean {
  const cardNumberRegex = /^[0-9]{16}$/;
  return cardNumberRegex.test(cardNumber);
}
const SavedCards = ({ onClose }: { onClose: any }) => {
  const options = useMemo(() => countryList().getData(), []);
  const axiosAuth = useAxiosAuth();
  const { data: session, status } = useSession();
  // React Query setup
  const queryClient = useQueryClient();
  const { data: card } = useQuery('cards', () => getCards(axiosAuth), {
    enabled: status === 'authenticated' && !!session?.user?.accessToken,
  });
  const createCardMutation = useMutation(createCard, {
    onSuccess: () => {
      onClose();
      queryClient.invalidateQueries('cards');
      queryClient.invalidateQueries('billingDetails'); // Refresh billing details after adding card
      toast.success('Card added successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.message ||
          'Unable to add card due to some reasons. Please try later.'
      );
    },
  });

  const updateCardMutation = useMutation(editCard, {
    onSuccess: () => {
      onClose();
      queryClient.invalidateQueries('cards');
      toast.success('Information update successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.message ||
          'Unable to update card due to some reasons. Please try later.'
      );
    },
  });

  const validationSchema = Yup.object({
    cardNumber: Yup.string()
      .matches(/^\d{16}$/, 'Card number must be 16 digits')
      .required('Card number is required'),
    // expiryDate: Yup.string()
    //   .matches(/^(0[1-9]|1[0-2])\/(\d{2})$/, 'Expiry date must be MM/YY')
    //   .required('Expiry date is required'),
    expiryYear: Yup.string()

      .required('Expiry year is required'),
    expiryMonth: Yup.string()

      .required('Expiry month is required'),
    cvv: Yup.string()
      .matches(/^\d{3,4}$/, 'CVV must be 3 or 4 digits')
      .required('CVV is required'),
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    firstNameBillingAddress: Yup.string().required('First name is required'),
    lastNameBillingAddress: Yup.string().required('Last name is required'),
    addressLineOne: Yup.string().required('Address line 1 is required'),
    // addressLineTwo: Yup.string().required('Address line 2 is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    code: Yup.string().required('Code is required'),
    country: Yup.object().required('Country is required'),
    email: Yup.string().required('Email is required'),
  });
  const orgFormIk = useFormik({
    initialValues: {
      cardNumber: card?.cardNumber ?? '',
      expiryYear: card?.expiryYear ?? '',
      expiryMonth: card?.expiryMonth ?? '',
      cvv: card?.cvv ?? '',
      firstName: card?.firstName ?? '',
      lastName: card?.lastName ?? '',
      firstNameBillingAddress: card?.firstNameBillingAddress ?? '',
      lastNameBillingAddress: card?.lastNameBillingAddress ?? '',
      addressLineOne: card?.addressLineOne ?? '',
      addressLineTwo: card?.addressLineTwo ?? '',
      city: card?.city ?? '',
      state: card?.state ?? '',
      code: card?.code ?? '',
      country: card?.country ?? { value: 'NZ', label: 'New Zealand' },
      email: card?.email ?? '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      if (!isValidCardNumber(values.cardNumber)) {
        toast.error('Please enter a valid 16-digit card number');
        return;
      }

      try {
        const stripe = new Stripe(
          // 'pk_test_51OglqFEncIisiYhgaGBGzuQFKJOiza2XVMeA8Z8xFQYh9xCNrCCeFbocKoOpghikLYhleTHez5lGF3bLRndfnm6l008T65y3P9'
          'pk_test_51RfCsSGOZfLQ0EoCbFX5U66QMyYtNQbvVK9r3QpOWHm72XuT4rvmwm9NV1i02XKzTAzkHEMVqgKJpyv9bXbYzP8C00pKhvSWKN'
        );

        const paymentMethod = await stripe.paymentMethods.create({
          type: 'card',
          card: {
            number: values.cardNumber || '4242424242424242',
            exp_month: values.expiryMonth ? parseInt(values.expiryMonth) : 12,
            exp_year: values.expiryYear ? parseInt(values.expiryYear) : 2026,
            cvc: values.cvv || '123',
          },
          billing_details: {
            name: `${values.firstName} ${values.lastName}`,
            email: values.email,
            address: {
              line1: values.addressLineOne || '',
              line2: values.addressLineTwo || '',
              city: values.city || '',
              state: values.state || '',
              postal_code: values.code || '',
              country:
                typeof values.country === 'object'
                  ? values.country?.value || ''
                  : values.country || '',
            },
          },
        });

        if (!paymentMethod) {
          toast.error('Failed to create payment method');
          return;
        }

        if (card?._id) {
          updateCardMutation.mutate({
            axiosAuth,
            id: card?._id!,
            data: {
              ...values,
              paymentMethodId: paymentMethod.id,
              cardNumber: `**** **** **** ${paymentMethod?.card?.last4 || ''}`,
            },
          });
        } else {
          createCardMutation.mutate({
            axiosAuth,
            data: {
              ...values,
              paymentMethodId: paymentMethod.id,
              cardNumber: `**** **** **** ${paymentMethod?.card?.last4 || ''}`,
            },
          });
        }
      } catch (error: any) {
        console.error('Error creating payment method:', error);
        toast.error(
          error?.message ||
            'Failed to process payment method. Please try again.'
        );
      }
    },
  });

  // console.log(orgFormIk.errors);

  const submitLabel =
    session?.user.user.organization?.accountPaymentStatus == 'pending'
      ? 'Start 14 Days Trial'
      : 'Save';

  return (
    <CustomModal
      isOpen={true}
      size="md"
      justifyButton="justify-center "
      handleCancel={(open: boolean) => {
        if (open === false) onClose(false);
      }}
      customCancelHandler={() => onClose(false)}
      handleSubmit={() => {
        orgFormIk.submitForm();
      }}
      submitValue={submitLabel}
      isLoading={createCardMutation.isLoading || updateCardMutation.isLoading}
      cancelButton="Cancel"
      cancelvariant="primaryOutLine"
      header={
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:pr-2">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-content-center rounded-full bg-primary-100/70 p-3 text-primary-500 lg:h-[55px] lg:w-[55px]">
              <svg
                width="28"
                height="20"
                viewBox="0 0 28 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.5625 0.625C4.3193 0.625 3.12701 1.11886 2.24794 1.99794C1.36886 2.87701 0.875 4.0693 0.875 5.3125V6.25H27.125V5.3125C27.125 4.0693 26.6311 2.87701 25.7521 1.99794C24.873 1.11886 23.6807 0.625 22.4375 0.625H5.5625ZM27.125 8.125H0.875V14.6875C0.875 15.9307 1.36886 17.123 2.24794 18.0021C3.12701 18.8811 4.3193 19.375 5.5625 19.375H22.4375C23.6807 19.375 24.873 18.8811 25.7521 18.0021C26.6311 17.123 27.125 15.9307 27.125 14.6875V8.125ZM18.6875 13.75H22.4375C22.6861 13.75 22.9246 13.8488 23.1004 14.0246C23.2762 14.2004 23.375 14.4389 23.375 14.6875C23.375 14.9361 23.2762 15.1746 23.1004 15.3504C22.9246 15.5262 22.6861 15.625 22.4375 15.625H18.6875C18.4389 15.625 18.2004 15.5262 18.0246 15.3504C17.8488 15.1746 17.75 14.9361 17.75 14.6875C17.75 14.4389 17.8488 14.2004 18.0246 14.0246C18.2004 13.8488 18.4389 13.75 18.6875 13.75Z"
                  fill="#0063F7"
                />
              </svg>
            </span>

            <div className="min-w-0">
              <h2 className="text-lg font-semibold leading-7 text-[#1E1E1E] md:text-xl">
                Edit Payment Details
              </h2>

              <span className="text-xs font-normal text-[#616161] sm:text-sm">
                Please ensure your billing address and card payment address are
                the same.
              </span>
            </div>
          </div>

          {!card && (
            <button
              type="button"
              className="shrink-0 rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-300"
              onClick={() => {
                signOut({ callbackUrl: '/auth/login' });
              }}
            >
              Sign Out
            </button>
          )}
        </div>
      }
      body={
        <div className="mx-1 h-[540px] overflow-y-auto sm:mx-2 sm:max-h-[550px]">
          <div className="flex flex-col gap-2 py-2 text-sm sm:text-base">
            <p className="mb-3 text-base font-semibold text-black">
              Credit Card Payment Information
            </p>

            <SimpleInput
              name={'email'}
              label="Email Address"
              placeholder="Enter Email Adress"
              required
              type="email"
              errorMessage={orgFormIk.errors.email}
              value={orgFormIk.values.email}
              isTouched={orgFormIk.touched.email}
              onChange={(e) => {
                orgFormIk.setFieldValue('email', e.target.value);
              }}
            />
            <SimpleInput
              name={'fistName'}
              label="First name"
              placeholder="Enter First Name"
              required
              type="text"
              errorMessage={orgFormIk.errors.firstName}
              value={orgFormIk.values.firstName}
              isTouched={orgFormIk.touched.firstName}
              onChange={(e) => {
                orgFormIk.setFieldValue('firstName', e.target.value);
              }}
            />
            <SimpleInput
              name={'lastName'}
              label="Last Name"
              placeholder="Enter Last Name"
              required
              type="text"
              errorMessage={orgFormIk.errors.lastName}
              value={orgFormIk.values.lastName}
              isTouched={orgFormIk.touched.lastName}
              onChange={(e) => {
                orgFormIk.setFieldValue('lastName', e.target.value);
              }}
            />
            <SimpleInput
              name={'cardNumber'}
              label="Card Number"
              placeholder="Enter Card Number"
              required
              type="text"
              errorMessage={orgFormIk.errors.cardNumber}
              value={orgFormIk.values.cardNumber}
              isTouched={orgFormIk.touched.cardNumber}
              onChange={(e) => {
                orgFormIk.setFieldValue('cardNumber', e.target.value);
              }}
            />
            <div className="">
              <img src="/svg/card_stripe.svg" alt="stripe image" />
            </div>
            <div className="grid w-full grid-cols-3 gap-3">
              <div className="">
                <SelectOption
                  variant="simpleSlect"
                  name={'month'}
                  label="Month"
                  placeholder="Month"
                  selectedOption={orgFormIk.values.expiryMonth}
                  onChange={(
                    e: React.ChangeEvent<HTMLSelectElement> | SingleValue<any>
                  ) => {
                    orgFormIk.setFieldValue('expiryMonth', e.value);
                  }}
                  options={[
                    { label: 'January', value: '01' },
                    { label: 'February', value: '02' },
                    { label: 'March', value: '03' },
                    { label: 'April', value: '04' },
                    { label: 'May', value: '05' },
                    { label: 'June', value: '06' },
                    { label: 'July', value: '07' },
                    { label: 'August', value: '08' },
                    { label: 'September', value: '09' },
                    { label: 'October', value: '10' },
                    { label: 'November', value: '11' },
                    { label: 'December', value: '12' },
                  ]}
                />
              </div>
              <div className="">
                <SelectOption
                  variant="simpleSlect"
                  name={'year'}
                  label="Year"
                  placeholder="Year"
                  selectedOption={orgFormIk.values.expiryYear}
                  onChange={(
                    e: React.ChangeEvent<HTMLSelectElement> | SingleValue<any>
                  ) => {
                    orgFormIk.setFieldValue('expiryYear', e.value);
                  }}
                  options={[
                    {
                      label: '2026',
                      value: '2026',
                    },
                    {
                      label: '2027',
                      value: '2027',
                    },
                    {
                      label: '2028',
                      value: '2028',
                    },
                    {
                      label: '2029',
                      value: '2029',
                    },
                    {
                      label: '2030',
                      value: '2030',
                    },
                    {
                      label: '2031',
                      value: '2031',
                    },
                  ]}
                />
              </div>
              <div className="">
                <SimpleInput
                  name={'cvv'}
                  label="CVV"
                  required
                  type="number"
                  placeholder="Enter CVV"
                  errorMessage={orgFormIk.errors.cvv}
                  value={orgFormIk.values.cvv}
                  isTouched={orgFormIk.touched.cvv}
                  onChange={(e) => {
                    orgFormIk.setFieldValue('cvv', e.target.value);
                  }}
                />
              </div>
            </div>

            {/* /// second part  */}

            <p className="mb-3 text-base font-semibold text-black">
              Billing Address
            </p>

            <SimpleInput
              name={'firstNameBillingAddress'}
              label="First name"
              placeholder="Enter First Name"
              required
              type="text"
              errorMessage={orgFormIk.errors.firstNameBillingAddress}
              value={orgFormIk.values.firstNameBillingAddress}
              isTouched={orgFormIk.touched.firstNameBillingAddress}
              onChange={(e) => {
                orgFormIk.setFieldValue(
                  'firstNameBillingAddress',
                  e.target.value
                );
              }}
            />
            <SimpleInput
              name={'lastNameBillingAddress'}
              label="Last Name"
              required
              type="text"
              placeholder="Enter Last Name"
              errorMessage={orgFormIk.errors.lastNameBillingAddress}
              value={orgFormIk.values.lastNameBillingAddress}
              isTouched={orgFormIk.touched.lastNameBillingAddress}
              onChange={(e) => {
                orgFormIk.setFieldValue(
                  'lastNameBillingAddress',
                  e.target.value
                );
              }}
            />
            <SimpleInput
              name={'addressLineOne'}
              label="Address Line 1"
              placeholder="Enter Address Line 1"
              required
              type="text"
              errorMessage={orgFormIk.errors.addressLineOne}
              value={orgFormIk.values.addressLineOne}
              isTouched={orgFormIk.touched.addressLineOne}
              onChange={(e) => {
                orgFormIk.setFieldValue('addressLineOne', e.target.value);
              }}
            />
            <SimpleInput
              name={'addressLineTwo'}
              label="Address Line 2"
              placeholder="Enter Address Line 2"
              type="text"
              // errorMessage={orgFormIk.errors.addressLineTwo}
              value={orgFormIk.values.addressLineTwo}
              // isTouched={orgFormIk.touched.addressLineTwo}
              onChange={(e) => {
                orgFormIk.setFieldValue('addressLineTwo', e.target.value);
              }}
            />
            <SimpleInput
              name={'city'}
              label="City"
              placeholder="Enter City"
              required
              type="text"
              errorMessage={orgFormIk.errors.city}
              value={orgFormIk.values.city}
              isTouched={orgFormIk.touched.city}
              onChange={(e) => {
                orgFormIk.setFieldValue('city', e.target.value);
              }}
            />
            <SimpleInput
              name={'code'}
              label="Zip / Postal Code"
              placeholder="Enter Zip / Postal Code"
              required
              type="text"
              errorMessage={orgFormIk.errors.code}
              value={orgFormIk.values.code}
              isTouched={orgFormIk.touched.code}
              onChange={(e) => {
                orgFormIk.setFieldValue('code', e.target.value);
              }}
            />
            <SimpleInput
              name={'state'}
              label="State"
              placeholder="Enter State"
              required
              type="text"
              errorMessage={orgFormIk.errors.state}
              value={orgFormIk.values.state}
              isTouched={orgFormIk.touched.state}
              onChange={(e) => {
                orgFormIk.setFieldValue('state', e.target.value);
              }}
            />
            <SelectOption
              variant="simpleSlect"
              name={'country'}
              label="Select Country"
              options={options}
              selectedOption={orgFormIk.values.country.value}
              onChange={(
                e: React.ChangeEvent<HTMLSelectElement> | SingleValue<any>
              ) => {
                orgFormIk.setFieldValue('country', e);
              }}
            />
          </div>
        </div>
      }
    />
  );
};

export default SavedCards;
