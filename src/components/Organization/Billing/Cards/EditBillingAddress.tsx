import React, { useState } from 'react';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react';
import * as Yup from 'yup';
import { X } from 'lucide-react';
import CustomHr from '@/components/Ui/CustomHr';
import { Input } from '@/components/Form/Input';
import { Textarea } from '@/components/Form/Textarea';
import { countries } from 'countries-list';
import { Form, Formik } from 'formik';
import { SelectOption } from '@/components/Form/select';

const BillingAddress = ({ onClose }: { onClose: any }) => {
  const { onOpenChange } = useDisclosure();
  const [defaultCard, setDefaultCard] = useState('**** **** **** 4895');
  const countryList = Object.values(countries).map((country) => ({
    value: country.name.toLocaleLowerCase(),
    label: country.name,
  }));
  const handleCardSelect = (selected: string) => {
    setDefaultCard(selected);
  };

  // Initial form values
  const initialValues = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    zipCode: '',
    state: '',
    country: '',
    repeatTask: '',
  };

  // Validation schema
  const validationSchema = Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    phoneNumber: Yup.string()
      .matches(/^\d+$/, 'Phone number must be numeric')
      .required('Phone number is required'),
    addressLine1: Yup.string().required('Address Line 1 is required'),
    addressLine2: Yup.string(),
    city: Yup.string().required('City is required'),
    zipCode: Yup.string().required('Zip/Postal Code is required'),
    state: Yup.string().required('State is required'),
    country: Yup.string().required('Country is required'),
    repeatTask: Yup.string().required('Payment card selection is required'),
  });

  const handleSubmit = (values: any) => {
    console.log(values);
    onClose(false);
  };

  return (
    <Modal
      onOpenChange={onOpenChange}
      onClose={() => onClose(false)}
      isOpen={true}
      backdrop="blur"
      placement="center"
      size="lg"
      className={'w-full md:min-w-[550px]'}
    >
      <ModalContent className="mx-auto w-[94%] rounded-3xl bg-white py-2">
        {() => (
          <div className="px-0 md:px-5">
            <ModalHeader className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                {/* Icon */}
                <span className="grid h-11 w-11 place-content-center rounded-full bg-primary-100/70 p-3 text-primary-500 lg:h-[55px] lg:w-[55px]">
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

                <div>
                  <h2 className="text-lg font-medium leading-7 text-[#000000] lg:text-xl">
                    Edit Billing Address
                  </h2>
                  <span className="text-xs font-normal text-gray-600 sm:text-sm">
                    Please ensure your billing addresses and card payment
                    addresses are the same.
                  </span>
                </div>
              </div>

              <button
                className="rounded-md p-1 hover:bg-gray-100"
                onClick={() => onClose(false)}
              >
                <X />
              </button>
            </ModalHeader>

            <ModalBody className={'overflow-y-auto'}>
              <CustomHr />
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, handleSubmit }) => (
                  <Form onSubmit={handleSubmit}>
                    <div className="flex h-[500px] flex-col gap-4 overflow-y-auto pr-2">
                      <>
                        <Input
                          type="text"
                          label="First Name"
                          placeholder="Enter your first name"
                          name="firstName"
                          errorMessage={errors.firstName}
                          isTouched={touched.firstName}
                        />
                      </>
                      <>
                        <Input
                          type="text"
                          label="Last Name"
                          placeholder="Enter your last name"
                          name="lastName"
                          errorMessage={errors.lastName}
                          isTouched={touched.lastName}
                        />
                      </>
                      <>
                        <Input
                          type="text"
                          label="Phone Number"
                          placeholder="Enter your phone number"
                          name="phoneNumber"
                          errorMessage={errors.phoneNumber}
                          isTouched={touched.phoneNumber}
                        />
                      </>
                      <>
                        <Input
                          type="text"
                          label="Address Line 1"
                          placeholder="Enter address line 1"
                          name="addressLine1"
                          errorMessage={errors.addressLine1}
                          isTouched={touched.addressLine1}
                        />
                      </>
                      <>
                        <Textarea
                          label="Address Line 2"
                          placeholder="Enter address line 2"
                          name="addressLine2"
                          errorMessage={errors.addressLine2}
                          isTouched={touched.addressLine2}
                        />
                      </>
                      <>
                        <Input
                          type="text"
                          label="City"
                          placeholder="Enter your city"
                          name="city"
                          errorMessage={errors.city}
                          isTouched={touched.city}
                        />
                      </>
                      <>
                        <Input
                          type="text"
                          label="Zip/Postal Code"
                          placeholder="Enter your zip/postal code"
                          name="zipCode"
                          errorMessage={errors.zipCode}
                          isTouched={touched.zipCode}
                        />
                      </>
                      <>
                        <Input
                          type="text"
                          label="State"
                          placeholder="Enter your state"
                          name="state"
                          errorMessage={errors.state}
                          isTouched={touched.state}
                        />
                      </>
                      <>
                        <SelectOption
                          variant="simpleSlect"
                          label="Country"
                          className="overflow-y-auto border border-gray-300 bg-gray-300"
                          name="country"
                          options={countryList}
                          selectedOption="Select a country"
                          handleSelectedOption={handleCardSelect}
                        />
                      </>
                    </div>
                    <CustomHr className="mt-5" />
                    <div className="mt-4 flex justify-center gap-5">
                      <button
                        className="h-11 w-1/2 rounded-lg border-2 border-primary-500 text-sm text-primary-500 sm:w-36 sm:text-base"
                        type="button"
                        onClick={() => onClose(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="h-11 w-1/2 rounded-lg bg-primary-500 text-sm text-white hover:bg-primary-600/80 sm:w-36 sm:text-base"
                      >
                        Save
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

export default BillingAddress;
