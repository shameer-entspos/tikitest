import React, { useState, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  createHazards,
  HazardModel,
  updateHazards,
} from '@/app/(main)/(user-panel)/user/apps/api';
import { useMutation, useQueryClient } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import Loader from '@/components/DottedLoader/loader';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { JSAAPPACTIONTYPE } from '@/app/helpers/user/enums';
import CustomModal from '@/components/Custom_Modal';
import CustomRadio from '@/components/CustomRadioButton/CustomRadioButton';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { SimpleInput } from '@/components/Form/simpleInput';
const NewHazardsModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const context = useJSAAppsCotnext();
  const item = context.state.selectedItem as HazardModel;

  const initialSharing = item?.sharing === 2 ? 'sharedList' : 'myList';
  const [selectedSharing, setSelectedSharing] = useState(initialSharing);
  const [openDropdown, setOpenDropdown] = useState<string>('');
  useEffect(() => {
    if (isOpen && item) {
      setSelectedSharing(item?.sharing === 2 ? 'sharedList' : 'myList');
    }
  }, [isOpen, item?._id]);
  const handleToggleDropdown = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? '' : dropdownId);
  };

  const createHazardsMutation = useMutation(createHazards, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('hazards');
      console.log('Hazards created successfully');
      // context.dispatch({type: JSAAPPACTIONTYPE.SETITEM, payLoad: data.Hazard});
      // context.dispatch({type: JSAAPPACTIONTYPE.SHOWMODAL, showModal: 'detailModal'});
      onClose();
    },
    onError: (error: any) => {
      console.error('Error creating hazards:', error.message);
    },
  });

  const updateHazardsMutation = useMutation(updateHazards, {
    onSuccess: (data) => {
      console.log('Data', data);
      queryClient.invalidateQueries('hazards');
      console.log('Hazards created successfully');
      // context.dispatch({type: JSAAPPACTIONTYPE.SETITEM, payLoad: data});
      // context.dispatch({type: JSAAPPACTIONTYPE.SHOWMODAL, showModal: 'detailModal'});
      onClose();
    },
    onError: (error) => {
      // Handle mutation error
      console.error('Error updating Hazards:', error);
    },
  });
  const initialValues = {
    name: item?.name ?? '',
    initialRiskAssessment: item?.initialRiskAssessment ?? '',
    controlMethod: item?.controlMethod ?? '',
    residualRiskAssessment: item?.residualRiskAssessment ?? '',
  };

  const riskAssessmentOptions = [
    'Negligible',
    'Minor',
    'Moderate',
    'Significant',
    'Severe',
  ];

  const validationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .required('Hazard & Risk Name is required'),
    initialRiskAssessment: Yup.string().required(
      'Initial Risk Assessment is required'
    ),
    controlMethod: Yup.string().nullable().optional(),
    residualRiskAssessment: Yup.string().required(
      'Residual Risk Assessment is required'
    ),
  });
  const formIk = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  const handleSubmit = async (values: any) => {
    const sharedValues = selectedSharing === 'sharedList' ? 2 : 1;
    const data = { ...values, sharing: sharedValues };

    if (item) {
      if (context.state.showModal == 'editModal') {
        updateHazardsMutation.mutate({ data, axiosAuth, itemId: item?._id! });
      }
      if (context.state.showModal == 'duplicateModel') {
        createHazardsMutation.mutate({
          data: { ...data, copyFrom: item._id },
          axiosAuth,
        });
      }
    } else {
      createHazardsMutation.mutate({ data, axiosAuth });
    }
  };
  return (
    <>
      <CustomModal
        isOpen={isOpen}
        header={
          <>
            <img src="/images/ppeLogo.svg" alt="" />
            <div>
              <h2 className="text-xl font-semibold">
                {context.state.showModal === 'NewModal'
                  ? 'New'
                  : context.state.showModal === 'editModal'
                    ? 'Edit'
                    : 'Duplicate'}{' '}
                Hazards & Risks
              </h2>
              <p className="mt-1 text-base font-normal text-[#616161]">
                {context.state.showModal === 'editModal' ? 'Edit' : 'Add'}{' '}
                Hazards & Risks details below.
              </p>
            </div>
          </>
        }
        body={
          <div className="flex max-h-[500px] flex-col overflow-auto p-4">
            <div className="mb-2">
              <SimpleInput
                type="text"
                label="Hazard & Risk Name"
                required
                placeholder="Enter hazard or risk name"
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
                data={riskAssessmentOptions.map((item) => ({
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
                  formIk.setFieldTouched('initialRiskAssessment', true, true);
                }}
                selected={
                  formIk.values.initialRiskAssessment
                    ? [formIk.values.initialRiskAssessment]
                    : ''
                }
                placeholder="Select"
                hasError={
                  !!(
                    formIk.touched.initialRiskAssessment &&
                    formIk.errors.initialRiskAssessment
                  )
                }
              />
              {formIk.touched.initialRiskAssessment &&
                formIk.errors.initialRiskAssessment && (
                  <div className="mt-1 text-xs text-red-500">
                    {formIk.errors.initialRiskAssessment}
                  </div>
                )}
            </div>
            <div className="py-8">
              <label className="mb-2 block" htmlFor="controlMethod">
                Control Method <span className="text-gray-500">(Optional)</span>
              </label>
              <textarea
                rows={5}
                id="controlMethod"
                name="controlMethod"
                placeholder="Describe in details the measures and actions that will be taken to minimize or isolate this hazard or risk."
                value={formIk.values.controlMethod}
                className="w-full resize-none rounded-xl border-2 border-[#EEEEEE] p-2 shadow-sm"
                onChange={formIk.handleChange}
              />
            </div>

            {/* ////////////////////////// */}
            <div className="mb-8 w-full">
              <CustomSearchSelect
                isRequired={true}
                label="Residual Risk Assessment"
                data={riskAssessmentOptions.map((item) => ({
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
                  formIk.setFieldTouched('residualRiskAssessment', true, true);
                }}
                selected={
                  formIk.values.residualRiskAssessment
                    ? [formIk.values.residualRiskAssessment]
                    : ''
                }
                placeholder="Select"
                hasError={
                  !!(
                    formIk.touched.residualRiskAssessment &&
                    formIk.errors.residualRiskAssessment
                  )
                }
              />
              {formIk.touched.residualRiskAssessment &&
                formIk.errors.residualRiskAssessment && (
                  <div className="mt-1 text-xs text-red-500">
                    {formIk.errors.residualRiskAssessment}
                  </div>
                )}
            </div>

            <div className="mb-3">
              <label className="mb-2 block text-sm font-medium text-[#1E1E1E]">
                Sharing
              </label>
              <div className="flex flex-col gap-2">
                <CustomRadio
                  name="sharing"
                  value="myList"
                  checkedValue={selectedSharing === 'myList' ? 'myList' : ''}
                  onChange={() => setSelectedSharing('myList')}
                  label="My List"
                />
                <CustomRadio
                  name="sharing"
                  value="sharedList"
                  checkedValue={
                    selectedSharing === 'sharedList' ? 'sharedList' : ''
                  }
                  onChange={() => setSelectedSharing('sharedList')}
                  label="Shared List"
                />
              </div>
            </div>
            {context.state.showModal == 'editModal' && (
              <div className="m-5 flex items-center justify-center">
                <Button
                  className="border-2 border-red-600 bg-white px-10 font-semibold text-red-600"
                  onPress={() =>
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
          </div>
        }
        handleCancel={onClose}
        handleSubmit={() => {
          formIk.setTouched(
            {
              name: true,
              initialRiskAssessment: true,
              controlMethod: true,
              residualRiskAssessment: true,
            },
            true
          );
          formIk.submitForm();
        }}
        submitDisabled={!formIk.isValid}
        submitValue={
          updateHazardsMutation.isLoading || createHazardsMutation.isLoading ? (
            <Loader />
          ) : (
            'Save'
          )
        }
      />
    </>
  );
};

export default NewHazardsModal;
