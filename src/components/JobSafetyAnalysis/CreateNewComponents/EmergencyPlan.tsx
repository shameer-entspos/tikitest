import { useState, ChangeEvent, DragEvent, useEffect } from 'react';
import { SimpleInput } from '@/components/Form/simpleInput';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { JSAAPPACTIONTYPE } from '@/app/helpers/user/enums';
import { WithSidebar } from './WithSideBar';
import { BottomButton } from './BottomButton';
import { ErrorMessage, useFormik } from 'formik';
import React from 'react';
import { Formik, Field, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import ImageUploadWithProgress from './JSA_Upload_IMG';
import { Plus } from 'lucide-react';
import { UseStagedImageUploadsReturn } from '@/components/apps/shared/useStagedImageUploads';

export function EmergencyPlan({
  stagedUploads,
  uploadPendingImages,
}: {
  stagedUploads?: UseStagedImageUploadsReturn;
  uploadPendingImages?: () => Promise<string[]>;
}) {
  const context = useJSAAppsCotnext();
  const [contacts, setContacts] = useState(
    context.state.jsaEmergencyPlanPayLoad?.jsaEmergencyPlanContacts ?? [
      { name: '', phone: '' },
    ]
  );
  const [errors, setErrors] = useState<{ name: ''; phone: '' }[]>([]);

  // Allow typical phone formats: +64 21 123 456, Ext 12, (09) 123-4567
  const PHONE_REGEX = /^[\d\s()\-+a-zA-Z.,\/]*$/;

  // Validation function
  const validateContacts = (contacts: { name: any; phone: any }[]) => {
    const errors: any = [];
    contacts.forEach(({ name, phone }, index) => {
      const errorsForContact: any = {};
      const nameStr = String(name ?? '').trim();
      const phoneStr = String(phone ?? '').trim();
      if (nameStr === '') {
        errorsForContact.name = 'Contact name is required';
      }

      if (phoneStr === '') {
        errorsForContact.phone = 'Phone number is required';
      } else if (!PHONE_REGEX.test(phoneStr)) {
        errorsForContact.phone =
          'Use digits, spaces, + - ( ) and letters. e.g. +64 21 123 456, Ext 12, (09) 123-4567';
      }
      errors[index] = errorsForContact;
    });
    return errors;
  };
  const handleChange = (index: number, field: string, value: string) => {
    const updatedContacts = [...contacts];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    setContacts(updatedContacts);
  };

  const addContact = () => {
    if (checkErrors()) {
      setContacts([...contacts, { name: '', phone: '' }]);
    }
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
    setErrors(errors.filter((_, i) => i !== index));
  };
  const organizationFormValidator = (values: any) => {
    const errors: any = {};
    if (!values.area) {
      errors.area = '*Required';
    }
    if (!values.procedure) {
      errors.procedure = '*Required';
    }
    if ((contacts ?? []).length > 1) {
      checkErrors();
    }

    return errors;
  };
  const checkErrors = () => {
    const validationErrors = validateContacts(contacts);
    if (validationErrors.some((error: {}) => Object.keys(error).length > 0)) {
      setErrors(validationErrors);
      return false;
    } else {
      setErrors([]);
      return true;
    }
  };

  const schema = Yup.object().shape({
    area: Yup.string().required('Area is required'),
    procedure: Yup.string().required('Procedure is required'),
  });

  const organizationForm = useFormik({
    initialValues: {
      area: context.state.jsaEmergencyPlanPayLoad?.area ?? '',
      procedure: context.state.jsaEmergencyPlanPayLoad?.procedure ?? '',
    },
    // validate: organizationFormValidator,
    validationSchema: schema,

    onSubmit: (values) => {
      if (checkErrors()) {
        console.log('Submitted values:', contacts);
        // Perform your submission logic here
        handleSubmit(values);
      }
    },
  });

  const handleSubmit = (values: any) => {
    context.dispatch({
      type: JSAAPPACTIONTYPE.JSA_EMERGENCY_PLAN,
      jsaEmergencyPlanPayLoad: {
        area: values.area,
        procedure: values.procedure,
        jsaEmergencyPlanContacts: contacts,
      },
    });
  };

  // useEffect(() => {
  //   console.log(checkErrors());
  //   console.log(errors);
  // }, []);

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto scrollbar-hide">
          <WithSidebar>
            <div className="h-full w-11/12 overflow-auto scrollbar-hide lg:w-[83%]">
              <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
                <div className="mb-4 flex justify-between px-4 pt-5">
                  <div className="flex flex-col">
                    <h2 className="mb-1 text-xl font-semibold">
                      Emergency Plan
                    </h2>
                    <p className="text-sm font-normal text-[#616161]">
                      Describe your emergency procedures and points of contact.
                    </p>
                  </div>
                </div>
                <div className="p-5">
                  <form onSubmit={organizationForm.handleSubmit}>
                    <SimpleInput
                      label="Evacuation Area"
                      type="text"
                      placeholder="Location of evacuation or meeting area"
                      name="area"
                      required
                      className="w-full"
                      errorMessage={organizationForm.errors.area}
                      value={organizationForm.values.area}
                      isTouched={organizationForm.touched.area}
                      onChange={organizationForm.handleChange}
                    />
                    <div className="pt-5">
                      <label className="mb-2 block" htmlFor="procedure">
                        Evacuation & Emergency Procedures{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        id="procedure"
                        name="procedure"
                        placeholder="Describe relevant emergency procedures"
                        value={organizationForm.values.procedure}
                        className={` ${
                          organizationForm.errors.procedure &&
                          organizationForm.touched.procedure
                            ? 'border-red-500'
                            : 'border-[#EEEEEE]'
                        } w-full resize-none rounded-xl border-2 border-gray-300 p-2 shadow-sm`}
                        onChange={organizationForm.handleChange}
                      />
                      {organizationForm.errors.procedure &&
                        organizationForm.touched.procedure && (
                          <span className="text-xs text-red-500">
                            {organizationForm.errors.procedure}
                          </span>
                        )}
                    </div>
                    <div className="">
                      <div className="grid items-center justify-between pb-3 pt-5 font-Open-Sans text-[#616161] md:grid-cols-2 lg:grid-cols-4">
                        <span>Emergency Contacts</span>
                        <span className="text-end">Max 10</span>
                      </div>
                      {contacts.map((contact, index) => (
                        <div
                          key={index}
                          className="grid items-center gap-4 pt-1 md:grid-cols-2 lg:grid-cols-4"
                        >
                          <SimpleInput
                            type="text"
                            placeholder="Enter Contact Name"
                            name="name"
                            className="w-full"
                            errorMessage={
                              errors[index] !== null &&
                              errors[index] !== undefined &&
                              errors.length > 0
                                ? errors[index].name
                                : ''
                            }
                            required
                            value={contact.name}
                            isTouched={
                              errors[index] !== null && errors.length > 0
                            }
                            onChange={(e) =>
                              handleChange(index, 'name', e.target.value)
                            }
                          />

                          <SimpleInput
                            type="text"
                            inputMode="tel"
                            placeholder="e.g. +64 21 123 456, Ext 12, (09) 123-4567"
                            name="phone"
                            className="w-full"
                            errorMessage={
                              errors[index] !== null &&
                              errors[index] !== undefined &&
                              errors.length > 0
                                ? errors[index].phone
                                : ''
                            }
                            required
                            value={contact.phone}
                            isTouched={
                              errors[index] !== null && errors.length > 0
                            }
                            onChange={(e) =>
                              handleChange(index, 'phone', e.target.value)
                            }
                          />

                          {(contacts ?? []).length > 1 && (
                            <div
                              className="mb-[32px]"
                              onClick={() => removeContact(index)}
                            >
                              <svg
                                width="30"
                                height="30"
                                viewBox="0 0 30 30"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M15 26.25C16.4774 26.25 17.9403 25.959 19.3052 25.3936C20.6701 24.8283 21.9103 23.9996 22.955 22.955C23.9996 21.9103 24.8283 20.6701 25.3936 19.3052C25.959 17.9403 26.25 16.4774 26.25 15C26.25 13.5226 25.959 12.0597 25.3936 10.6948C24.8283 9.3299 23.9996 8.08971 22.955 7.04505C21.9103 6.00039 20.6701 5.17172 19.3052 4.60636C17.9403 4.04099 16.4774 3.75 15 3.75C12.0163 3.75 9.15483 4.93526 7.04505 7.04505C4.93526 9.15483 3.75 12.0163 3.75 15C3.75 17.9837 4.93526 20.8452 7.04505 22.955C9.15483 25.0647 12.0163 26.25 15 26.25ZM8.75 16.25H21.25V13.75H8.75V16.25Z"
                                  fill="#6990FF"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}

                      <div
                        className="flex cursor-pointer items-center gap-2 px-8 py-3 text-base font-medium text-primary-500"
                        onClick={addContact}
                      >
                        <Plus className="size-5" /> Add
                      </div>
                    </div>
                    <ImageUploadWithProgress
                      helperText="Files stay on this device until you submit or save. Closing the tab will discard any unstaged images."
                      stagedUploads={stagedUploads}
                      type="steps"
                    />
                  </form>
                </div>
              </div>
            </div>
          </WithSidebar>
        </div>

        <div className="flex-shrink-0">
          <BottomButton
            isDisabled={!checkErrors}
            uploadPendingImages={uploadPendingImages}
            onNextClick={() => {
              organizationForm.submitForm();
            }}
            onCancel={() => {
              context.dispatch({
                type: JSAAPPACTIONTYPE.CREATENEWSECTION,
                createNewSection: 'step',
              });
            }}
            onSavAs={() => {}}
          />
        </div>
      </div>
    </>
  );
}
