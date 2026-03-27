import React, { useState } from 'react';
import {
  Modal,
  ModalBody,
  ModalContent,
  useDisclosure,
} from '@nextui-org/react';
import * as Yup from 'yup';
import { X } from 'lucide-react';
import CustomHr from '@/components/Ui/CustomHr';
import { Input } from '@/components/Form/Input';
import { Form, Formik } from 'formik';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';
import { useMutation, useQueryClient } from 'react-query';
import { createCard } from './api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Loader from '@/components/DottedLoader/loader';
import { Button } from '@/components/Buttons';

const AddNewCard = ({ onClose }: { onClose: any }) => {
  const { onOpenChange } = useDisclosure();

  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();

  const initialValues = {
    cardNumber: '',
    nameOnCard: '',
    expiryDate: '',
    cvv: '',
    isDefault: true,
  };

  const validationSchema = Yup.object({
    cardNumber: Yup.string()
      .matches(/^\d{16}$/, 'Card number must be 16 digits')
      .required('Card number is required'),
    nameOnCard: Yup.string().required('Name on card is required'),
    expiryDate: Yup.string()
      .matches(/^(0[1-9]|1[0-2])\/(\d{2})$/, 'Expiry date must be MM/YY')
      .required('Expiry date is required'),
    cvv: Yup.string()
      .matches(/^\d{3,4}$/, 'CVV must be 3 or 4 digits')
      .required('CVV is required'),
  });
  const queryClient = useQueryClient();
  const createCardMutation = useMutation(createCard, {
    onSuccess: () => {
      onClose();
      queryClient.invalidateQueries('cards');
      toast.success('Card added successfully');
    },
    onError: () => {
      toast.error('Unable to add card due to some reasons. Please try later.');
    },
  });

  const handleSubmit = async (values: any) => {
    let expiryMonth = values.expiryDate.split('/')[0];
    let expiryYear = values.expiryDate.split('/')[1];

    // month should be 1 to 12  show error that should be beetween 1 - 12
    if (expiryMonth > 12 || expiryMonth < 1)
      return toast.error('Month should be between 1 - 12');

    // year also should be 2 digits and betweeen today's year to next 5 years
    if (
      expiryYear < new Date().getFullYear() ||
      expiryYear > new Date().getFullYear() + 6
    )
      return toast.error(
        'Year should be between ' +
          new Date().getFullYear() +
          ' - ' +
          (new Date().getFullYear() + 6)
      );
    if (expiryYear.length == 2) expiryYear = '20' + expiryYear;
    if (expiryMonth.length < 2) expiryMonth = '0' + expiryMonth;
    createCardMutation.mutate({
      axiosAuth,
      data: {
        cardNumber: values.cardNumber,
        firstName: values.nameOnCard,
        expiryDate: values.expiryDate,
        cvv: values.cvv,
        isDefault: values.isDefault,
        expiryMonth,
        expiryYear,
      },
    });
  };

  return (
    <Modal
      onOpenChange={onOpenChange}
      onClose={() => onClose(false)}
      isOpen={true}
      backdrop="opaque"
      placement="center"
      size="lg"
      className={'w-full md:min-w-[500px]'}
    >
      <ModalContent className="mx-auto w-[94%] rounded-3xl bg-white py-2">
        {() => (
          <div className="px-0 md:px-5">
            <ModalBody className={'overflow-y-auto'}>
              {/* Header  */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-[#000000] lg:text-xl">
                  New Payment Card
                </h2>
                <img src="/svg/card_stripe.svg" alt="" />
              </div>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({
                  errors,
                  touched,
                  handleSubmit,
                  setFieldValue,
                  values,
                  isValid,
                }) => (
                  <Form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <Input
                        type="text"
                        label="Card Number"
                        placeholder="1234 5678 9012 3456"
                        name="cardNumber"
                        errorMessage={errors.cardNumber}
                        isTouched={touched.cardNumber}
                      />
                      <Input
                        type="text"
                        label="Name on Card"
                        placeholder="John Smith"
                        name="nameOnCard"
                        required
                        errorMessage={errors.nameOnCard}
                        isTouched={touched.nameOnCard}
                      />
                      <div className="flex gap-4">
                        <Input
                          type="text"
                          label="Expiry Date"
                          placeholder="01 / 19"
                          name="expiryDate"
                          required
                          errorMessage={errors.expiryDate}
                          isTouched={touched.expiryDate}
                        />
                        <Input
                          type="text"
                          label="Security Code"
                          placeholder="123"
                          name="cvv"
                          required
                          errorMessage={errors.cvv}
                          isTouched={touched.cvv}
                        />
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={values.isDefault}
                          onChange={(e) => {
                            console.log('Checkbox checked:', e.target.checked);
                            setFieldValue('isDefault', e.target.checked);
                          }}
                        />
                        <span>Save as default payment method</span>
                      </label>
                    </div>

                    <div className="mt-12 flex justify-center gap-12">
                      <button
                        className="text-sm text-primary-500 sm:text-base"
                        type="button"
                        onClick={() => onClose(false)}
                      >
                        Cancel
                      </button>

                      <button
                        className="text-sm text-primary-500 disabled:text-gray-500 sm:text-base"
                        disabled={!isValid}
                        type="submit"
                      >
                        {createCardMutation.isLoading ? <Loader /> : 'Confirm'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </ModalBody>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddNewCard;
