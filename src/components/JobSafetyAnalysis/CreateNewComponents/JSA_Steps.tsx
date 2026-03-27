import { HazardModel, PPEModel } from '@/app/(main)/(user-panel)/user/apps/api';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { JSAAPPACTIONTYPE } from '@/app/helpers/user/enums';
import { useFormik, FormikProps } from 'formik';
import { useState, useRef, SetStateAction, Dispatch, useEffect, useCallback } from 'react';
import { BottomButton } from './BottomButton';
import JSAAccordion from './JSA_Step_Accordian';
import { WithSidebar } from './WithSideBar';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import Loader from '@/components/DottedLoader/loader';
import { Button } from '@/components/Buttons';
import { CreateNewPPEINSteps } from './Create_PPE_Steps';
import { SelectPPEINSTEPS } from './Select_PPE';
import { SelectHazrdINSTEPS } from './Select_Hazard';
import { CreateNewHazardINSteps } from './Create_Hazard_Step';
import { Plus, X } from 'lucide-react';
// Define the type for the step form values
export interface StepFormValues {
  _id?: string;
  description: string;
  Hazards: HazardModel[];
  PPEs: PPEModel[];
}

export function JSASteps({
  uploadPendingImages,
}: {
  uploadPendingImages?: () => Promise<string[]>;
}) {
  const context = useJSAAppsCotnext();
  const formikRefs = useRef<Array<FormikProps<StepFormValues> | null>>([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [nextClicked, setNextClicked] = useState(false);

  const addStep = () => {
    if ((context.state.steps ?? []).length < 10) {
      context.dispatch({
        type: JSAAPPACTIONTYPE.ADD_JSA_STEP,
        steps: {
          description: '',
          Hazards: [],
          PPEs: [],
        },
      });
    }
  };

  const organizationFormValidator = (values: StepFormValues) => {
    const errors: Partial<StepFormValues> = {};
    if (!values.description) {
      errors.description = '*Required';
    }

    return errors;
  };

  const validateForms = useCallback(async () => {
    const steps = context.state.steps ?? [];
    if (steps.length === 0) {
      setIsButtonDisabled(true);
      return;
    }
    let allValid = true;
    for (let i = 0; i < steps.length; i++) {
      const formik = formikRefs.current[i];
      if (formik) {
        const errors = await formik.validateForm();
        const desc = String(formik.values.description ?? '').trim();
        if (Object.keys(errors ?? {}).length > 0 || desc === '') {
          allValid = false;
        }
      } else {
        allValid = false;
      }
    }
    setIsButtonDisabled(!allValid);
  }, [context.state.steps]);

  const handleSubmit = async () => {
    setNextClicked(true);
    const steps = context.state.steps ?? [];
    let allValid = true;
    const formValues: StepFormValues[] = [];
    for (let i = 0; i < steps.length; i++) {
      const formik = formikRefs.current[i];
      if (formik) {
        const errors = await formik.validateForm();
        const desc = (formik.values.description ?? '').trim();
        if (
          Object.keys(errors ?? {}).length === 0 &&
          desc !== ''
        ) {
          formValues.push(formik.values);
        } else {
          formik.submitForm();
          allValid = false;
        }
      } else {
        allValid = false;
      }
    }

    if (allValid && formValues.length === steps.length) {
      var allSteps: {
        description: string;
        Hazards: HazardModel[];
        PPEs: PPEModel[];
      }[] = [];

      for (let i = 0; i < steps.length; i++) {
        const formik = formikRefs.current[i];
        if (formik) {
          allSteps.push({
            description: formik.values.description,
            Hazards: formik.values.Hazards ?? [],
            PPEs: formik.values.PPEs ?? [],
          });
        }
      }

      // Dispatch the action with the collected steps
      context.dispatch({
        type: JSAAPPACTIONTYPE.JSA_STEP_PAYLOAD,
        jsaSteps: allSteps,
      });
      context.dispatch({
        type: JSAAPPACTIONTYPE.CREATENEWSECTION,
        createNewSection: 'emergency',
      });
    } else {
      // alert("Some forms have required Description");
    }
  };

  useEffect(() => {
    validateForms();
    // Re-run after refs are set by child StepForms
    const t = setTimeout(() => validateForms(), 50);
    return () => clearTimeout(t);
  }, [validateForms]);

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto scrollbar-hide">
          <WithSidebar>
            <div className="h-full w-11/12 overflow-auto scrollbar-hide md:w-[83%]">
          {(context.state.steps ?? []).map((step, index) => (
            <StepForm
              key={index}
              index={index}
              initialValues={step}
              validator={organizationFormValidator}
              formikRef={(el) => (formikRefs.current[index] = el)}
              onStepChange={() => setTimeout(() => validateForms(), 0)}
            />
          ))}

              {(context.state.steps ?? []).length < 10 && (
                <div className="mx-4 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow">
                  <div
                    className="mb-4 flex cursor-pointer justify-center px-4 pt-5"
                    onClick={addStep}
                  >
                    <div className="flex flex-col items-center">
                      <svg
                        width="68"
                        height="58"
                        viewBox="0 0 68 58"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.65625 54L8.25 50.375H3.67188L2.27344 54H0.929688L5.39844 42.5312H6.59375L11.0312 54H9.65625ZM7.85156 49.1953L6.51562 45.5938C6.48438 45.5 6.43229 45.3464 6.35938 45.1328C6.29167 44.9193 6.22135 44.6979 6.14844 44.4688C6.07552 44.2396 6.01562 44.0547 5.96875 43.9141C5.91667 44.1276 5.85938 44.3411 5.79688 44.5547C5.73958 44.763 5.68229 44.9583 5.625 45.1406C5.56771 45.3177 5.51823 45.4688 5.47656 45.5938L4.11719 49.1953H7.85156ZM15.4688 54.1562C14.3854 54.1562 13.526 53.7865 12.8906 53.0469C12.2604 52.3073 11.9453 51.2083 11.9453 49.75C11.9453 48.276 12.2682 47.1641 12.9141 46.4141C13.5599 45.6589 14.4193 45.2812 15.4922 45.2812C15.9453 45.2812 16.3411 45.3411 16.6797 45.4609C17.0182 45.5807 17.3099 45.7422 17.5547 45.9453C17.7995 46.1432 18.0052 46.3698 18.1719 46.625H18.2656C18.2448 46.4635 18.224 46.2422 18.2031 45.9609C18.1823 45.6797 18.1719 45.4505 18.1719 45.2734V41.8438H19.4688V54H18.4219L18.2266 52.7812H18.1719C18.0104 53.0365 17.8047 53.2682 17.5547 53.4766C17.3099 53.6849 17.0156 53.8516 16.6719 53.9766C16.3333 54.0964 15.9323 54.1562 15.4688 54.1562ZM15.6719 53.0781C16.5885 53.0781 17.237 52.8177 17.6172 52.2969C17.9974 51.776 18.1875 51.0026 18.1875 49.9766V49.7422C18.1875 48.6536 18.0052 47.8177 17.6406 47.2344C17.2812 46.651 16.625 46.3594 15.6719 46.3594C14.875 46.3594 14.2786 46.6667 13.8828 47.2812C13.487 47.8906 13.2891 48.724 13.2891 49.7812C13.2891 50.8333 13.4844 51.6458 13.875 52.2188C14.2708 52.7917 14.8698 53.0781 15.6719 53.0781ZM25.2656 54.1562C24.1823 54.1562 23.3229 53.7865 22.6875 53.0469C22.0573 52.3073 21.7422 51.2083 21.7422 49.75C21.7422 48.276 22.0651 47.1641 22.7109 46.4141C23.3568 45.6589 24.2161 45.2812 25.2891 45.2812C25.7422 45.2812 26.138 45.3411 26.4766 45.4609C26.8151 45.5807 27.1068 45.7422 27.3516 45.9453C27.5964 46.1432 27.8021 46.3698 27.9688 46.625H28.0625C28.0417 46.4635 28.0208 46.2422 28 45.9609C27.9792 45.6797 27.9688 45.4505 27.9688 45.2734V41.8438H29.2656V54H28.2188L28.0234 52.7812H27.9688C27.8073 53.0365 27.6016 53.2682 27.3516 53.4766C27.1068 53.6849 26.8125 53.8516 26.4688 53.9766C26.1302 54.0964 25.7292 54.1562 25.2656 54.1562ZM25.4688 53.0781C26.3854 53.0781 27.0339 52.8177 27.4141 52.2969C27.7943 51.776 27.9844 51.0026 27.9844 49.9766V49.7422C27.9844 48.6536 27.8021 47.8177 27.4375 47.2344C27.0781 46.651 26.4219 46.3594 25.4688 46.3594C24.6719 46.3594 24.0755 46.6667 23.6797 47.2812C23.2839 47.8906 23.0859 48.724 23.0859 49.7812C23.0859 50.8333 23.2812 51.6458 23.6719 52.2188C24.0677 52.7917 24.6667 53.0781 25.4688 53.0781ZM42.8125 50.9609C42.8125 51.638 42.6432 52.2161 42.3047 52.6953C41.9714 53.1693 41.5026 53.5312 40.8984 53.7812C40.2943 54.0312 39.5833 54.1562 38.7656 54.1562C38.3333 54.1562 37.9245 54.1354 37.5391 54.0938C37.1536 54.0521 36.7995 53.9922 36.4766 53.9141C36.1536 53.8359 35.8698 53.7396 35.625 53.625V52.3516C36.0156 52.513 36.4922 52.6641 37.0547 52.8047C37.6172 52.9401 38.2057 53.0078 38.8203 53.0078C39.3932 53.0078 39.8776 52.9323 40.2734 52.7812C40.6693 52.625 40.9688 52.4036 41.1719 52.1172C41.3802 51.8255 41.4844 51.4766 41.4844 51.0703C41.4844 50.6797 41.3984 50.3542 41.2266 50.0938C41.0547 49.8281 40.7682 49.5885 40.3672 49.375C39.9714 49.1562 39.4297 48.9245 38.7422 48.6797C38.2578 48.5078 37.8307 48.3203 37.4609 48.1172C37.0911 47.9089 36.7812 47.6745 36.5312 47.4141C36.2812 47.1536 36.0911 46.8516 35.9609 46.5078C35.8359 46.1641 35.7734 45.7708 35.7734 45.3281C35.7734 44.7188 35.9271 44.1979 36.2344 43.7656C36.5469 43.3281 36.9766 42.9948 37.5234 42.7656C38.0755 42.5312 38.7083 42.4141 39.4219 42.4141C40.0312 42.4141 40.5938 42.4714 41.1094 42.5859C41.6302 42.7005 42.1068 42.8542 42.5391 43.0469L42.125 44.1875C41.7135 44.0156 41.276 43.8724 40.8125 43.7578C40.3542 43.6432 39.8802 43.5859 39.3906 43.5859C38.901 43.5859 38.487 43.6589 38.1484 43.8047C37.8151 43.9453 37.5599 44.1458 37.3828 44.4062C37.2057 44.6667 37.1172 44.9766 37.1172 45.3359C37.1172 45.737 37.2005 46.0703 37.3672 46.3359C37.5391 46.6016 37.8099 46.8385 38.1797 47.0469C38.5547 47.25 39.0495 47.4635 39.6641 47.6875C40.3359 47.9323 40.9062 48.1927 41.375 48.4688C41.8438 48.7396 42.2005 49.0729 42.4453 49.4688C42.6901 49.8594 42.8125 50.3568 42.8125 50.9609ZM47.7188 53.0938C47.9323 53.0938 48.151 53.0755 48.375 53.0391C48.599 53.0026 48.7812 52.9583 48.9219 52.9062V53.9141C48.7708 53.9818 48.5599 54.0391 48.2891 54.0859C48.0234 54.1328 47.763 54.1562 47.5078 54.1562C47.0547 54.1562 46.6432 54.0781 46.2734 53.9219C45.9036 53.7604 45.6068 53.4896 45.3828 53.1094C45.1641 52.7292 45.0547 52.2031 45.0547 51.5312V46.4531H43.8359V45.8203L45.0625 45.3125L45.5781 43.4531H46.3594V45.4375H48.8672V46.4531H46.3594V51.4922C46.3594 52.0286 46.4818 52.4297 46.7266 52.6953C46.9766 52.9609 47.3073 53.0938 47.7188 53.0938ZM53.9531 45.2812C54.6823 45.2812 55.3073 45.4427 55.8281 45.7656C56.349 46.0885 56.7474 46.5417 57.0234 47.125C57.2995 47.7031 57.4375 48.3802 57.4375 49.1562V49.9609H51.5234C51.5391 50.9661 51.7891 51.7318 52.2734 52.2578C52.7578 52.7839 53.4401 53.0469 54.3203 53.0469C54.862 53.0469 55.3411 52.9974 55.7578 52.8984C56.1745 52.7995 56.6068 52.6536 57.0547 52.4609V53.6016C56.6224 53.7943 56.1927 53.9349 55.7656 54.0234C55.3438 54.112 54.8438 54.1562 54.2656 54.1562C53.4427 54.1562 52.724 53.9896 52.1094 53.6562C51.5 53.3177 51.026 52.8229 50.6875 52.1719C50.349 51.5208 50.1797 50.724 50.1797 49.7812C50.1797 48.8594 50.3333 48.0625 50.6406 47.3906C50.9531 46.7135 51.3906 46.1927 51.9531 45.8281C52.5208 45.4635 53.1875 45.2812 53.9531 45.2812ZM53.9375 46.3438C53.2448 46.3438 52.6927 46.5703 52.2812 47.0234C51.8698 47.4766 51.625 48.1094 51.5469 48.9219H56.0781C56.0729 48.4115 55.9922 47.9635 55.8359 47.5781C55.6849 47.1875 55.4531 46.8854 55.1406 46.6719C54.8281 46.4531 54.4271 46.3438 53.9375 46.3438ZM63.6641 45.2812C64.7318 45.2812 65.5833 45.6484 66.2188 46.3828C66.8542 47.1172 67.1719 48.2214 67.1719 49.6953C67.1719 50.6693 67.026 51.487 66.7344 52.1484C66.4427 52.8099 66.0312 53.3099 65.5 53.6484C64.974 53.987 64.3516 54.1562 63.6328 54.1562C63.1797 54.1562 62.7812 54.0964 62.4375 53.9766C62.0938 53.8568 61.7995 53.6953 61.5547 53.4922C61.3099 53.2891 61.1068 53.0677 60.9453 52.8281H60.8516C60.8672 53.0312 60.8854 53.276 60.9062 53.5625C60.9323 53.849 60.9453 54.099 60.9453 54.3125V57.8281H59.6406V45.4375H60.7109L60.8828 46.7031H60.9453C61.112 46.4427 61.3151 46.2057 61.5547 45.9922C61.7943 45.7734 62.0859 45.6016 62.4297 45.4766C62.7786 45.3464 63.1901 45.2812 63.6641 45.2812ZM63.4375 46.375C62.8438 46.375 62.3646 46.4896 62 46.7188C61.6406 46.9479 61.3776 47.2917 61.2109 47.75C61.0443 48.2031 60.9557 48.7734 60.9453 49.4609V49.7109C60.9453 50.4349 61.0234 51.0469 61.1797 51.5469C61.3411 52.0469 61.6042 52.4271 61.9688 52.6875C62.3385 52.9479 62.8333 53.0781 63.4531 53.0781C63.9844 53.0781 64.4271 52.9349 64.7812 52.6484C65.1354 52.362 65.3984 51.9635 65.5703 51.4531C65.7474 50.9375 65.8359 50.3464 65.8359 49.6797C65.8359 48.6693 65.638 47.8672 65.2422 47.2734C64.8516 46.6745 64.25 46.375 63.4375 46.375Z"
                          fill="#616161"
                        />
                        <path
                          d="M38 2C34.3009 2.04488 30.766 3.53429 28.1501 6.15013C25.5343 8.76597 24.0449 12.3009 24 16C24.0449 19.6991 25.5343 23.234 28.1501 25.8499C30.766 28.4657 34.3009 29.9551 38 30C41.6991 29.9551 45.234 28.4657 47.8499 25.8499C50.4657 23.234 51.9551 19.6991 52 16C51.9551 12.3009 50.4657 8.76597 47.8499 6.15013C45.234 3.53429 41.6991 2.04488 38 2ZM46 17H39V24H37V17H30V15H37V8H39V15H46V17Z"
                          fill="#616161"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </WithSidebar>
        </div>
        <div className="flex-shrink-0">
          <BottomButton
            uploadPendingImages={uploadPendingImages}
            isDisabled={isButtonDisabled}
            onCancel={() => {
              context.dispatch({
                type: JSAAPPACTIONTYPE.CREATENEWSECTION,
                createNewSection: 'jsaDetail',
              });
            }}
            onSavAs={() => {}}
            onNextClick={() => {
              handleSubmit();
            }}
          />
        </div>
      </div>
    </>
  );
}

interface StepFormProps {
  index: number;
  initialValues: StepFormValues;
  validator: (values: StepFormValues) => any;
  formikRef: (instance: FormikProps<StepFormValues> | null) => void;
  onStepChange?: () => void;
}

function StepForm({
  index,
  initialValues,
  validator,
  formikRef,
  onStepChange,
}: StepFormProps) {
  const context = useJSAAppsCotnext();
  const [showModel, setShowModel] = useState(false);
  const [showHazardModel, setShowHazardModel] = useState(false);

  const formik = useFormik<StepFormValues>({
    initialValues,
    validate: validator,
    onSubmit: (values) => {
      // no direct submission, handled externally
    },
  });
  // const [selectedPPE, setPPE] = useState<PPEModel[]>([...formik.values.PPEs]);
  const [showNewCreateModel, setShowNewCreateModel] = useState(true);
  const handleShowCreate = () => setShowNewCreateModel(!showNewCreateModel);

  const handlePPESelection = ({ PPEs }: { PPEs: PPEModel }) => {
    if (formik.values.PPEs.includes(PPEs)) {
      var changes = formik.values.PPEs?.filter((user) => user !== PPEs);
      formik.setFieldValue('PPEs', changes);
    } else {
      var changes = [...(formik.values.PPEs ?? []), PPEs];
      formik.setFieldValue('PPEs', changes);
    }
  };

  const isPPESelected = ({ PPEs }: { PPEs: PPEModel }) => {
    return formik.values.PPEs.some((ppe) => {
      return ppe._id === PPEs._id;
    });
  };
  const isHazardSelected = ({ hazard }: { hazard: HazardModel }) => {
    return formik.values.Hazards.some((selectedHazard) => {
      return hazard._id === selectedHazard._id;
    });
  };
  ///
  const handleHazardSelection = ({ hazard }: { hazard: HazardModel }) => {
    if (formik.values.Hazards.includes(hazard)) {
      var changes = formik.values.Hazards?.filter((user) => user !== hazard);
      formik.setFieldValue('Hazards', changes);

      // return formik.values.PPEs;
    } else {
      var changes = [...(formik.values.Hazards ?? []), hazard];
      formik.setFieldValue('Hazards', changes);
    }
  };

  // handleClickCancel
  const handleClickCancel = ({ hazard }: { hazard: HazardModel }) => {
    var changes = formik.values.Hazards?.filter((user) => user !== hazard);
    formik.setFieldValue('Hazards', changes);
  };
  // Pass the formik instance to the parent component through the ref
  formikRef(formik);

  return (
    <div className="flex">
      <div className="mx-2 my-4 flex flex-1 flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
        <div className="mb-4 flex justify-between px-4 pt-5">
          <div className="flex flex-col">
            <h2 className="mb-1 text-xl font-semibold">Step {index + 1}</h2>
            <p className="text-sm font-normal text-[#616161]">
              Break tasks into steps and identify potential Hazards & risks
              associated with each step. You can add a total of 10 steps.
            </p>
          </div>
        </div>
        <form onSubmit={formik.handleSubmit}>
          <div className="p-3 sm:p-5">
            <label className="mb-2 block" htmlFor={`description-${index}`}>
              Activity Description <span className="ml-1 text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              id={`description-${index}`}
              name="description"
              value={formik.values.description}
              onChange={(e) => {
                formik.handleChange(e);
                onStepChange?.();
              }}
              onBlur={formik.handleBlur}
              placeholder="Describe activities and outcomes taking place"
              className={`${
                formik.errors.description && formik.touched.description
                  ? 'border-red-500'
                  : 'border-[#EEEEEE]'
              } w-full resize-none rounded-xl border-2 border-gray-300 p-2 shadow-sm`}
            />
            {formik.errors.description && formik.touched.description && (
              <span className="text-xs text-red-500">
                {formik.errors.description}
              </span>
            )}
          </div>
          {/* first part of add  */}
          <div className="p-3 sm:p-5">
            <label className="mb-2 block" htmlFor="description">
              PPE & Safety Gear
            </label>
            <div className="flex flex-wrap items-center justify-start gap-2">
              {formik.values.PPEs.map((PPEs) => (
                <div
                  key={PPEs._id}
                  className="flex gap-2 rounded-xl bg-[#BCC7FF] px-3 py-1 text-black"
                >
                  <p>{PPEs.name}</p>
                  <span
                    className="cursor-pointer"
                    onClick={() => {
                      var changes = formik.values.PPEs?.filter(
                        (user) => user !== PPEs
                      );
                      formik.setFieldValue('PPEs', changes);
                    }}
                  >
                    X
                  </span>
                </div>
              ))}
              <div
                className="flex cursor-pointer items-center gap-2 px-6 py-3 text-base font-medium text-primary-500"
                onClick={() => setShowModel(true)}
              >
                <Plus className="size-5" /> Add
              </div>
            </div>
          </div>
          {/* second part  */}
          <div className="flex flex-col p-3 sm:p-5 lg:w-1/2">
            <div className="flex justify-between sm:pr-10">
              <label className="mb-2 block" htmlFor="description">
                Hazards & Risks Identified{' '}
              </label>
            </div>
            <JSAAccordion
              sections={formik.values.Hazards}
              handleClickCancel={handleClickCancel}
            />
            <div
              className="flex cursor-pointer items-center gap-2 px-6 py-3 text-base font-medium text-primary-500"
              onClick={() => {
                setShowHazardModel(true);
              }}
            >
              <Plus className="size-5" /> Add
            </div>
          </div>
        </form>
      </div>
      {(context.state.steps ?? []).length > 1 && (
        <div
          className="mt-4 cursor-pointer"
          onClick={() => {
            context.dispatch({
              type: JSAAPPACTIONTYPE.REMOVE_JSA_STEP,
              stepIndex: index,
            });
          }}
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
              fill="#616161"
            />
          </svg>
        </div>
      )}
      {/* Add PPE  */}
      <Modal
        isOpen={showModel}
        onOpenChange={() => setShowModel(!showModel)}
        placement="auto"
        size="lg"
        className="px-4"
      >
        <ModalContent className="max-w-[600px] rounded-3xl bg-white">
          {(onCloseModal) => (
            <>
              <ModalHeader className="flex flex-row items-center gap-2 border-b-2 border-gray-200 px-5 py-5">
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                  <path
                    d="M23.3333 11.875C22.4115 11.875 21.6667 12.7129 21.6667 13.75V19.7207C21.6667 20.0488 21.4323 20.3125 21.1406 20.3125C20.9531 20.3125 20.776 20.2012 20.6823 20.0137L18.1823 15.0977C14.3229 17.2363 11.6667 21.707 11.6667 26.875V30.625H38.3333V26.7344C38.2865 21.625 35.6406 17.2187 31.8177 15.0977L29.3177 20.0137C29.224 20.2012 29.0469 20.3125 28.8594 20.3125C28.5677 20.3125 28.3333 20.0488 28.3333 19.7207V13.75C28.3333 12.7129 27.5885 11.875 26.6667 11.875H23.3333ZM10.8646 32.5C10.3854 32.5 10 32.9336 10 33.4727C10 33.748 10.1042 34.0117 10.3021 34.1699C11.4323 35.1016 15.8229 38.125 25 38.125C34.1771 38.125 38.5677 35.1016 39.6979 34.1699C39.8958 34.0059 40 33.748 40 33.4727C40 32.9336 39.6146 32.5 39.1354 32.5H10.8646Z"
                    fill="#0063F7"
                  />
                </svg>

                <div className="flex w-full items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Select PPE & Safety Gear
                    </h2>
                    <p className="mt-1 text-sm font-normal text-[#616161]">
                      {!showNewCreateModel ? (
                        <>Add and save new PPE & Safety Gear.</>
                      ) : (
                        <>You can select and add up to 20 items.</>
                      )}
                    </p>
                  </div>

                  <button
                    className="rounded-md p-1 hover:bg-gray-100"
                    onClick={onCloseModal}
                  >
                    <X />
                  </button>
                </div>
              </ModalHeader>
              <ModalBody className="min-h-[500px]">
                {!showNewCreateModel ? (
                  <>
                    <CreateNewPPEINSteps
                      handleShowCreate={handleShowCreate}
                      onAdded={(ppe) => {
                        handlePPESelection({ PPEs: ppe });
                        handleShowCreate();
                      }}
                    />
                  </>
                ) : (
                  <>
                    <SelectPPEINSTEPS
                      handleShowCreate={handleShowCreate}
                      handlePPESelection={handlePPESelection}
                      isPPESelected={isPPESelected}
                    />
                  </>
                )}
              </ModalBody>
              {showNewCreateModel && (
                <ModalFooter className="flex justify-center gap-12 border-t-2 border-gray-200">
                  <Button
                    variant="simple"
                    className="cursor-pointer text-primary-600"
                    onClick={() => {
                      handleShowCreate();
                    }}
                  >
                    Not Listed
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      // formik.values.PPEs = selectedPPE;
                      setShowModel(!showModel);
                    }}
                  >
                    {false ? <Loader /> : 'Add'}
                  </Button>
                </ModalFooter>
              )}
            </>
          )}
        </ModalContent>
      </Modal>
      {/* Add Hazards  */}

      <Modal
        isOpen={showHazardModel}
        onOpenChange={() => setShowHazardModel(!showHazardModel)}
        placement="auto"
        size="lg"
        className="px-4"
      >
        <ModalContent className="max-w-[600px] rounded-3xl bg-white">
          {(onCloseModal) => (
            <>
              <ModalHeader className="flex flex-row items-center gap-2 border-b-2 border-gray-200 px-5 py-5">
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                  <path
                    d="M24.9416 12.0313C23.1557 12.0215 21.4834 13.3274 20.2815 15.6733C20.2772 15.6818 20.2712 15.6885 20.2669 15.697L12.5252 29.1426L12.5123 29.1627C11.086 31.4061 10.7858 33.5214 11.6701 35.0751C12.5537 36.6277 14.5194 37.4262 17.1487 37.2962H32.6814C35.3115 37.4267 37.2778 36.628 38.1617 35.0751C39.0459 33.5218 38.7451 31.4074 37.3194 29.1645L37.3065 29.1426L29.6473 15.7411C29.6438 15.7341 29.64 15.7279 29.6364 15.721C28.409 13.3618 26.7286 12.0411 24.9416 12.0313H24.9416ZM24.9451 13.1354C25.7406 13.1431 26.4951 13.5415 27.1791 14.2102C27.8591 14.8751 28.5006 15.8188 29.1365 17.0429C29.1402 17.05 29.1438 17.056 29.1475 17.0631L35.8987 28.8734C35.9006 28.8765 35.9021 28.8794 35.904 28.8826L35.9114 28.8955C36.6684 30.0834 37.165 31.1255 37.3927 32.0576C37.6218 32.9957 37.5722 33.8534 37.1674 34.5424C36.7627 35.2315 36.0412 35.687 35.1296 35.9432C34.2246 36.1975 33.1076 36.2746 31.7658 36.2069H18.0659C16.6102 36.2806 15.445 36.1881 14.5266 35.9066C13.602 35.623 12.9047 35.1185 12.5508 34.4013C12.1969 33.6843 12.2073 32.8312 12.4629 31.9148C12.7168 31.0045 13.2138 30.0042 13.9204 28.8955L13.9333 28.8734L20.7576 17.0264C20.7622 17.0172 20.7675 17.01 20.7722 17.0008C21.399 15.7751 22.0324 14.835 22.7095 14.1774C23.3916 13.5148 24.1497 13.1278 24.9452 13.1356L24.9451 13.1354ZM27.7375 16.7737L26.0659 29.9006H23.6141L21.9808 17.0557C21.896 17.2101 21.8135 17.3658 21.7335 17.5227L21.7281 17.5355L21.7207 17.5483L14.8689 29.441L14.8634 29.452L14.8561 29.4629C14.1785 30.5233 13.7284 31.4537 13.5176 32.2095C13.3068 32.9653 13.3355 33.5175 13.5322 33.9161C13.729 34.3147 14.1138 34.6356 14.8489 34.8609C15.5837 35.0862 16.6459 35.1859 18.0366 35.1136L18.0513 35.1117H31.7806L31.7952 35.1135C33.0755 35.1802 34.0984 35.0971 34.8348 34.8903C35.5711 34.6832 35.9962 34.373 36.2227 33.9875C36.4491 33.602 36.5144 33.0767 36.3289 32.3176C36.1434 31.5583 35.7001 30.5964 34.9757 29.4629L34.9684 29.4519L34.961 29.4391L28.1842 17.5868L28.1788 17.5775L28.175 17.5665C28.0285 17.2836 27.8826 17.0201 27.7373 16.7736L27.7375 16.7737ZM23.5535 31.1988H26.1262V33.7714H23.5535V31.1988Z"
                    fill="#0063F7"
                  />
                </svg>

                <div className="flex w-full items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Select Hazards & Risks
                    </h2>
                    <p className="mt-1 text-sm font-normal text-[#616161]">
                      {!showNewCreateModel ? (
                        <>Add and save new hazard & risk.</>
                      ) : (
                        <>You can select and add up to 10 items.</>
                      )}
                    </p>
                  </div>{' '}
                  <button
                    className="rounded-md p-1 hover:bg-gray-100"
                    onClick={onCloseModal}
                  >
                    <X />
                  </button>
                </div>
              </ModalHeader>
              <ModalBody className="h-[500px]">
                {!showNewCreateModel ? (
                  <>
                    <CreateNewHazardINSteps
                      handleShowCreate={handleShowCreate}
                      onAdded={(hazard) => {
                        handleHazardSelection({ hazard });
                        handleShowCreate();
                      }}
                    />
                  </>
                ) : (
                  <>
                    <SelectHazrdINSTEPS
                      handleShowCreate={handleShowCreate}
                      handleHazardSelection={handleHazardSelection}
                      isHazardSelected={isHazardSelected}
                    />
                  </>
                )}
              </ModalBody>
              {showNewCreateModel && (
                <ModalFooter className="flex justify-center gap-12 border-t-2 border-gray-200">
                  <Button
                    variant="simple"
                    className="cursor-pointer text-primary-600"
                    onClick={() => {
                      handleShowCreate();
                    }}
                  >
                    Not Listed
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      // formik.values.PPEs = selectedPPE;
                      setShowHazardModel(!showHazardModel);
                    }}
                  >
                    {false ? <Loader /> : 'Add'}
                  </Button>
                </ModalFooter>
              )}
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
