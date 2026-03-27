import React, { useState } from 'react';

import { Formik, Form, Field, ErrorMessage, useFormik } from 'formik';
import * as Yup from 'yup';

import {
  createHazards,
  HazardModel,
  PPEModel,
} from '@/app/(main)/(user-panel)/user/apps/api';
import { QueryClient, useMutation, useQueryClient } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { Input } from '@/components/Form/Input';
import Loader from '@/components/DottedLoader/loader';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { JSAAPPACTIONTYPE } from '@/app/helpers/user/enums';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import { generateRandomId } from '@/app/helpers/dateFormat';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { SimpleInput } from '@/components/Form/simpleInput';
import CustomRadio from '@/components/CustomRadioButton/CustomRadioButton';
import { Button } from '@/components/Buttons';

export function CreateNewHazardINSteps({
  handleShowCreate,
  onAdded,
}: {
  handleShowCreate: () => void;
  onAdded?: (hazard: HazardModel) => void;
}) {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const context = useJSAAppsCotnext();
  const item = context.state.selectedItem as PPEModel;
  const [openDropdown, setOpenDropdown] = useState<string>('');
  const handleToggleDropdown = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? '' : dropdownId);
  };
  const [selectedSharing, setSelectedSharing] = useState<
    'justOne' | 'myList' | 'sharedList'
  >('justOne');
  const initialValues = {
    name: '',
    initialRiskAssessment: null,
    controlMethod: '',
    residualRiskAssessment: null,
    sharing: selectedSharing,
  };

  const createHazardsMutation = useMutation(createHazards, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('hazards');
      console.log('Hazards created successfully');
      handleShowCreate();
    },
    onError: (error: any) => {
      console.error('Error creating hazards:', error.message);
    },
  });

  const validationSchema = Yup.object({
    name: Yup.string().required('Hazards & Safety Name is required'),
    initialRiskAssessment: Yup.string().required('Initial Risk is required'),
    controlMethod: Yup.string().required('Control Method is required'),
    residualRiskAssessment: Yup.string().required('Residual Risk is required'),
  });

  const formIk = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });
  const handleSubmit = async (values: any) => {
    const sharedValues =
      selectedSharing === 'sharedList'
        ? 2
        : selectedSharing == 'myList'
          ? 1
          : 3;
    const data = { ...values, sharing: sharedValues, _id: generateRandomId() };

    queryClient.setQueryData('hazards', (old: any) => {
      // Ensure that old is an array before adding the new item
      return old ? [...old, data] : [data];
    });
    onAdded?.(data as HazardModel);
    handleShowCreate();
  };
  return (
    <>
      <div className="flex h-[630px] flex-col overflow-auto p-4">
        <div className="mb-2">
          <SimpleInput
            type="text"
            label="Hazards & Risks Name"
            placeholder="Enter name of equipment"
            name="name"
            className="mb-0 text-base font-normal text-gray-700 placeholder:text-xs md:placeholder:text-base"
            errorMessage={formIk.errors.name}
            value={formIk.values.name}
            isTouched={formIk.touched.name}
            onChange={formIk.handleChange}
          />
        </div>
        <div className="w-full">
          <CustomSearchSelect
            isRequired={true}
            label="Initial Risk Assessment"
            data={[
              'Negligible',
              'Minor',
              'Moderate',
              'Significant',
              'Severe',
            ].map((item) => ({
              label: item ?? '',
              value: item ?? '',
            }))}
            showImage={false}
            multiple={false}
            showSearch={false}
            isOpen={openDropdown === 'dropdown2'}
            onToggle={() => handleToggleDropdown('dropdown2')}
            returnSingleValueWithLabel={true}
            onSelect={(selected: any, item: any) => {
              formIk.setFieldValue('initialRiskAssessment', selected);
            }}
            selected={
              formIk.values.initialRiskAssessment
                ? [formIk.values.initialRiskAssessment]
                : ''
            }
            placeholder="Select"
          />
        </div>
        <div className="py-8">
          <label className="mb-2 block" htmlFor="reasone">
            Control Method
          </label>
          <textarea
            rows={5}
            id="controlMethod"
            name="controlMethod"
            placeholder="Describe in details the measures and actions that will be taken to minimize or isolate this hazard or risk."
            value={formIk.values.controlMethod}
            className={` ${
              formIk.errors.controlMethod && formIk.touched.controlMethod
                ? 'border-red-500'
                : 'border-[#EEEEEE]'
            } w-full resize-none rounded-xl border-2 border-gray-300 p-2 shadow-sm`}
            onChange={formIk.handleChange}
          />
          {formIk.errors.controlMethod && formIk.touched.controlMethod && (
            <span className="text-xs text-red-500">
              {formIk.errors.controlMethod}
            </span>
          )}
        </div>

        {/* ////////////////////////// */}
        <div className="mb-8 w-full">
          <CustomSearchSelect
            isRequired={true}
            label="Residual Risk Assessment"
            data={[
              'Negligible',
              'Minor',
              'Moderate',
              'Significant',
              'Severe',
            ].map((item) => ({
              label: item ?? '',
              value: item ?? '',
            }))}
            showImage={false}
            multiple={false}
            showSearch={false}
            isOpen={openDropdown === 'dropdown1'}
            onToggle={() => handleToggleDropdown('dropdown1')}
            returnSingleValueWithLabel={true}
            onSelect={(selected: any, item: any) => {
              formIk.setFieldValue('residualRiskAssessment', selected);
            }}
            selected={
              formIk.values.residualRiskAssessment
                ? [formIk.values.residualRiskAssessment]
                : ''
            }
            placeholder="Select"
          />
        </div>

        <div className="mb-3">
          <label className="mb-2 block">Sharing</label>
          <div className="flex flex-col">
            <CustomRadio
              name={'sharing'}
              value={'justOne'}
              checkedValue={selectedSharing === 'justOne' ? 'justOne' : ''}
              onChange={() => setSelectedSharing('justOne')}
              label={
                <>
                  <div>Just this Submission</div>
                </>
              }
            />
            <CustomRadio
              name={'sharing'}
              value={'myList'}
              checkedValue={selectedSharing === 'myList' ? 'myList' : ''}
              onChange={() => setSelectedSharing('myList')}
              label={
                <>
                  <div>
                    Save to
                    <span className="font-bold">{` 'My List'`}</span>
                  </div>
                </>
              }
            />
            <CustomRadio
              name={'sharing'}
              value={'sharedList'}
              checkedValue={
                selectedSharing === 'sharedList' ? 'sharedList' : ''
              }
              onChange={() => setSelectedSharing('sharedList')}
              label={
                <>
                  <div>
                    Save to
                    <span className="font-bold">{` 'Shared List'`}</span>
                  </div>
                </>
              }
            />
          </div>
        </div>
        {context.state.showModal == 'editModal' && (
          <div className="m-5 flex items-center justify-center">
            <Button
              className="border-2 border-red-600 bg-white px-10 font-semibold text-red-600"
              onClick={() =>
                context.dispatch({
                  type: JSAAPPACTIONTYPE.SHOWMODAL,
                  showModal: 'deleteModal',
                })
              }
            >
              Delete
            </Button>
          </div>
        )}
        <div className="mt-4 flex justify-center gap-16 border-t-2 border-gray-200 py-6">
          <Button
            variant="simple"
            className="cursor-pointer text-primary-700"
            onClick={() => {
              handleShowCreate();
            }}
          >
            Back
          </Button>
          <Button
            variant="simple"
            onClick={() => {
              formIk.submitForm();
            }}
            className={'cursor-pointer text-primary-700'}
          >
            {createHazardsMutation.isLoading ? <Loader /> : 'Add To List'}
          </Button>
        </div>
      </div>
      {/* <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, handleSubmit, values, handleChange, isValid }) => (
          <Form onSubmit={handleSubmit}>
            <div className="mb-2">
              <Input
                type="text"
                label="Hazards & Risks Name"
                placeholder="Enter name of equipment"
                name="name"
                className="mb-0 text-base font-normal text-gray-700 placeholder:text-xs md:placeholder:text-base"
                errorMessage={errors.name}
                isTouched={touched.name}
              />
            </div>

            <div className="mb-3">
              <label
                htmlFor="initialRiskAssessment"
                className="block text-base font-normal text-gray-700"
              >
                Initial Risk Assessment
                <span className="text-red-500">*</span>
              </label>
              <Field
                as="select"
                id="initialRiskAssessment"
                name="initialRiskAssessment"
                className="mt-1 block w-full rounded-md border-2 border-gray-300 py-2 pl-3 pr-12 text-base shadow-sm sm:text-sm"
                placeholder="Select"
              >
                <option value="" hidden>
                  Select
                </option>
                <option value="1">Negligible</option>
                <option value="2">Minor</option>
                <option value="3">Moderate</option>
                <option value="4">Significant</option>
                <option value="5">Severe</option>
              </Field>
              <ErrorMessage
                name="initialRiskAssessment"
                component="div"
                className="text-sm text-red-500"
              />
            </div>

            <div className="mb-2">
              <label
                className="mb-2 block text-base font-normal text-gray-700"
                htmlFor="controlMethod"
              >
                Control Method
                <span className="text-red-500">*</span>
              </label>
              <Field
                as="textarea"
                id="controlMethod"
                name="controlMethod"
                rows={5}
                placeholder="Describe in details the measures and actions that will be taken to minimize or isolate this hazard or risk."
                className="w-full resize-none rounded-xl border-2 border-gray-300 p-2 shadow-sm"
              />
              <ErrorMessage
                name="controlMethod"
                component="div"
                className="text-sm text-red-500"
              />
            </div>

            <div className="mb-3">
              <label
                htmlFor="residualRiskAssessment"
                className="block text-base font-normal text-gray-700"
              >
                Residual Risk Assessment
                <span className="text-red-500">*</span>
              </label>
              <Field
                as="select"
                id="residualRiskAssessment"
                name="residualRiskAssessment"
                className="mt-1 block w-full rounded-md border-2 border-gray-300 py-2 pl-3 pr-12 text-base shadow-sm sm:text-sm"
              >
                <option value="" hidden>
                  Select
                </option>
                <option value="1">Negligible</option>
                <option value="2">Minor</option>
                <option value="3">Moderate</option>
                <option value="4">Significant</option>
                <option value="5">Severe</option>
              </Field>
              <ErrorMessage
                name="residualRiskAssessment"
                component="div"
                className="text-sm text-red-500"
              />
            </div>
            <div className="mb-2">
              <label className="mb-2 block font-semibold">
                Add this entry to
              </label>
              <div className="ml-2 flex flex-col">
                <label className="mb-3 flex items-center">
                  <Field
                    type="radio"
                    name="justOne"
                    value="justOne"
                    className="mr-2"
                    checked={selectedSharing === 'justOne'}
                    onChange={() => setSelectedSharing('justOne')}
                  />
                  Just this submission
                </label>
                <label className="mb-3 flex items-center">
                  <Field
                    type="radio"
                    name="myList"
                    value="myList"
                    className="mr-2"
                    checked={selectedSharing === 'myList'}
                    onChange={() => setSelectedSharing('myList')}
                  />
                  Saved to <span className="font-bold">&nbsp;My List</span>
                </label>
                <label className="flex items-center">
                  <Field
                    type="radio"
                    name="sharing"
                    value="sharedList"
                    className="mr-2"
                    checked={selectedSharing === 'sharedList'}
                    onChange={() => setSelectedSharing('sharedList')}
                  />
                  Saved to <span className="font-bold">&nbsp;Shared List</span>
                </label>
              </div>
            </div>
            {(context.state.showModal === 'duplicateModel' ||
              context.state.showModal == 'editModal') && (
              <div className="m-5 flex items-center justify-center">
                <Button
                  className="border-2 border-red-600 bg-white px-10 font-semibold text-red-600"
                  onClick={() =>
                    context.dispatch({
                      type: JSAAPPACTIONTYPE.SHOWMODAL,
                      showModal: 'deleteModal',
                    })
                  }
                >
                  Delete
                </Button>
              </div>
            )}

            <div className="mt-4 flex justify-center gap-16 py-6">
              <Button
                variant="simple"
                className="cursor-pointer text-primary-700"
                onClick={() => {
                  handleShowCreate();
                }}
              >
                Back
              </Button>
              <Button
                variant="simple"
                className={'cursor-pointer text-primary-700'}
                disabled={!isValid}
              >
                {createHazardsMutation.isLoading ? <Loader /> : 'Add To List'}
              </Button>
            </div>
          </Form>
        )}
      </Formik> */}
    </>
  );
}
