import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { JSAAPPACTIONTYPE } from '@/app/helpers/user/enums';
import { useState } from 'react';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { SimpleInput } from '@/components/Form/simpleInput';
import { useMutation } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import {
  createjSASubmision,
  updatejSASubmision,
} from '@/app/(main)/(user-panel)/user/apps/api';
import { JSAAppState } from '@/app/helpers/user/states';
import Loader from '@/components/DottedLoader/loader';

export function JSATopBar({
  uploadPendingImages,
}: {
  uploadPendingImages?: () => Promise<string[]>;
}) {
  const { state, dispatch } = useJSAAppsCotnext();
  const axiosAuth = useAxiosAuth();
  const createSubmissionMutation = useMutation(createjSASubmision, {
    onSuccess: () => {
      setSaveAs('finish');
    },
  });
  const updateSubmissionMutation = useMutation(updatejSASubmision, {
    onSuccess: () => {
      setSaveAs('finish');
    },
  });
  const handleSaveAs = async () => {
    let stagedImageUrls: string[] = [];

    try {
      stagedImageUrls = (await uploadPendingImages?.()) ?? [];
    } catch {
      return;
    }

    const data = {
      projectIds: (state.jsaSelectedProjects ?? []).map((pro) => pro.id) ?? [],
      selectedContact: state.jsaCreateDetailPayload?.customer ?? '',
      reference: state.jsaCreateDetailPayload?.reference ?? '',
      name: state.jsaCreateDetailPayload?.jsaName,
      rangeDate: {
        startDate: state.jsaDetailDate?.from ?? new Date(),
        endDate: state.jsaDetailDate?.to ?? new Date(),
      },
      scopeDescription: state.jsaCreateDetailPayload?.description,
      contactName: state.jsaCreateDetailPayload?.contactName,
      phone: state.jsaCreateDetailPayload?.phone,
      managers:
        (state.jsaDetailSelectedManagers ?? []).map((user) => {
          return {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone ?? '',
          };
        }) ?? [],
      steps:
        state.steps?.map((step) => ({
          description: step.description,
          Hazards: (step.Hazards ?? []).map((hazard) => {
            return {
              name: hazard.name,
              initialRiskAssessment: hazard.initialRiskAssessment,
              controlMethod: hazard.controlMethod,
              residualRiskAssessment: hazard.residualRiskAssessment,
              sharing: hazard.sharing,
            };
          }), // Extracting _id from hazards
          PPEs: (step.PPEs ?? []).map((ppeItem) => {
            return {
              name: ppeItem.name,
              description: ppeItem.description,
              sharing: ppeItem.sharing,
              images: ppeItem.images ?? [],
            };
          }), // Extracting _id from ppe
        })) ?? [],
      evacuationArea: state.jsaEmergencyPlanPayLoad?.area ?? '',
      evacuationProcedure: state.jsaEmergencyPlanPayLoad?.procedure ?? '',
      emergencyContact:
        state.jsaEmergencyPlanPayLoad?.jsaEmergencyPlanContacts ?? [],
      images: [...(state.jsaEmergencyPlanImages ?? []), ...stagedImageUrls],
      sharing: state.reviewStatus == 'private' ? 1 : 2,
      allowEdit: state.reviewPublicStatusEditable ?? false,
      // "copyFrom": null,
      saveAs: state.saveAsDraft ? 'Draft' : '',
      templateName: state.saveTemplateName ?? '',
      templateSharing: state.saveTemplateType == 'my' ? 1 : 2,
      isTemplate: state.saveAsTemplate ?? false,
      isTemplateEditable: state.isTemplateEditable,
    };
    if (state.editSubmission && state.editSubmission.isTemplate) {
      updateSubmissionMutation.mutate({
        axiosAuth,
        data,
        id: state.editSubmission._id,
      });
    } else {
      createSubmissionMutation.mutate({
        axiosAuth,
        data,
      });
    }
  };

  const [showPopUp, setPopUp] = useState(false);
  const [saveAs, setSaveAs] = useState<'finish' | 'saveAs' | 'close'>('close');
  const handleGoBack = () => {
    dispatch({
      type: JSAAPPACTIONTYPE.CLOSE_PAGES,
    });
  };
  function checkDisable(state: JSAAppState): boolean {
    // If saving as draft but not as template, always enable
    if (state.saveAsDraft && !state.saveAsTemplate) {
      return false;
    }

    // If saving as template, check for template name
    if (state.saveAsTemplate) {
      return (
        state.saveTemplateName === undefined || state.saveTemplateName === ''
      );
    }

    // Default to disabled if neither condition is met
    return true;
  }

  const hasValidJsaDetails = !!(
    state.jsaCreateDetailPayload?.customer?.trim() &&
    state.jsaCreateDetailPayload?.jsaName?.trim() &&
    state.jsaCreateDetailPayload?.description?.trim() &&
    state.jsaCreateDetailPayload?.contactName?.trim() &&
    state.jsaCreateDetailPayload?.phone?.trim() &&
    (state.jsaDetailSelectedManagers ?? []).length > 0
  );

  const disableSaveAsEntry =
    (state.jsaSelectedProjects ?? []).length === 0 || !hasValidJsaDetails;

  return (
    <>
      <div className="flex items-center justify-between border-b-2 border-[#EEEEEE] pb-2">
        <div className="flex items-center">
          <div className="relative h-[50px] w-[50px] rounded-lg shadow">
            <img src="/svg/jsa/logo.svg" alt="show logo" />
          </div>
          <h2 className="ml-2 text-xl font-bold">
            {state.editSubmission ? (
              <>
                {`Edit ${
                  state.editSubmission.isTemplate
                    ? 'Template'
                    : state.editSubmission.saveAs == 'Draft'
                      ? 'Draft'
                      : 'Submission'
                }`}
              </>
            ) : (
              <>Create New</>
            )}
          </h2>
        </div>
        <button
          className="text-sm font-semibold text-[#0063F7]"
          onClick={() => {
            if (
              (state.jsaSelectedProjects ?? []).length > 0 &&
              state.jsaCreateDetailPayload
            ) {
              setPopUp(!showPopUp);
            } else {
              handleGoBack();
            }
          }}
        >
          &lt; Close
        </button>
      </div>
      <Modal
        isOpen={showPopUp}
        onOpenChange={() => setPopUp(!showPopUp)}
        placement="top-center"
        size="lg"
        className="px-4"
      >
        <ModalContent className="max-w-[600px] rounded-3xl bg-white">
          {(onCloseModal) => (
            <>
              <ModalBody className="mb-5 flex flex-row items-center gap-2 px-1 py-5">
                {
                  // first dialog when user click on close
                  saveAs == 'close' ? (
                    <div className="flex items-start gap-2 px-3">
                      <svg
                        width="50"
                        height="50"
                        viewBox="0 0 50 50"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                        <path
                          d="M37.7513 31.0419L27.5032 13.2446C27.2471 12.8086 26.8815 12.4471 26.4427 12.1959C26.0038 11.9446 25.5069 11.8125 25.0013 11.8125C24.4956 11.8125 23.9987 11.9446 23.5598 12.1959C23.121 12.4471 22.7554 12.8086 22.4993 13.2446L12.2513 31.0419C12.0049 31.4636 11.875 31.9433 11.875 32.4317C11.875 32.9202 12.0049 33.3998 12.2513 33.8216C12.5041 34.2602 12.869 34.6237 13.3087 34.8748C13.7484 35.1258 14.2469 35.2553 14.7532 35.2501H35.2493C35.7552 35.2549 36.2532 35.1252 36.6925 34.8742C37.1317 34.6231 37.4963 34.2599 37.7489 33.8216C37.9957 33.4 38.1259 32.9205 38.1263 32.432C38.1268 31.9436 37.9973 31.4638 37.7513 31.0419ZM36.1259 32.8829C36.0365 33.0353 35.9083 33.1612 35.7542 33.2477C35.6002 33.3342 35.4259 33.3781 35.2493 33.3751H14.7532C14.5766 33.3781 14.4023 33.3342 14.2483 33.2477C14.0942 33.1612 13.966 33.0353 13.8766 32.8829C13.7957 32.7459 13.753 32.5897 13.753 32.4305C13.753 32.2714 13.7957 32.1152 13.8766 31.9782L24.1247 14.1809C24.2158 14.0293 24.3447 13.9038 24.4987 13.8166C24.6527 13.7295 24.8266 13.6837 25.0036 13.6837C25.1806 13.6837 25.3545 13.7295 25.5085 13.8166C25.6625 13.9038 25.7914 14.0293 25.8825 14.1809L36.1306 31.9782C36.2108 32.1156 36.2526 32.2721 36.2518 32.4312C36.251 32.5903 36.2075 32.7463 36.1259 32.8829ZM24.0638 25.8751V21.1876C24.0638 20.9389 24.1625 20.7005 24.3383 20.5247C24.5142 20.3488 24.7526 20.2501 25.0013 20.2501C25.2499 20.2501 25.4884 20.3488 25.6642 20.5247C25.84 20.7005 25.9388 20.9389 25.9388 21.1876V25.8751C25.9388 26.1237 25.84 26.3622 25.6642 26.538C25.4884 26.7138 25.2499 26.8126 25.0013 26.8126C24.7526 26.8126 24.5142 26.7138 24.3383 26.538C24.1625 26.3622 24.0638 26.1237 24.0638 25.8751ZM26.4075 30.0938C26.4075 30.372 26.325 30.6438 26.1705 30.8751C26.016 31.1064 25.7964 31.2866 25.5394 31.393C25.2824 31.4995 24.9997 31.5273 24.7269 31.4731C24.4541 31.4188 24.2036 31.2849 24.0069 31.0882C23.8102 30.8915 23.6763 30.641 23.622 30.3682C23.5678 30.0954 23.5956 29.8126 23.7021 29.5557C23.8085 29.2987 23.9887 29.0791 24.22 28.9246C24.4512 28.7701 24.7231 28.6876 25.0013 28.6876C25.3742 28.6876 25.7319 28.8357 25.9956 29.0995C26.2593 29.3632 26.4075 29.7209 26.4075 30.0938Z"
                          fill="#0063F7"
                        />
                      </svg>

                      <div>
                        <h2 className="text-xl font-semibold">
                          Close without saving?
                        </h2>
                        <p className="mt-1 text-sm font-normal text-[#616161]">
                          Are you sure you want to close without saving. Your
                          changes will be discarded.
                        </p>
                      </div>
                    </div>
                  ) : // when user click on save as or save
                  saveAs == 'saveAs' ? (
                    <>
                      <div className="w-full">
                        <div className="mb-8 flex items-start gap-2">
                          <svg
                            width="50"
                            height="50"
                            viewBox="0 0 50 50"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                            <path
                              d="M15 12.5C14.337 12.5 13.7011 12.7634 13.2322 13.2322C12.7634 13.7011 12.5 14.337 12.5 15V35C12.5 35.663 12.7634 36.2989 13.2322 36.7678C13.7011 37.2366 14.337 37.5 15 37.5V28.75C15 27.7554 15.3951 26.8016 16.0983 26.0983C16.8016 25.3951 17.7554 25 18.75 25H31.25C32.2446 25 33.1984 25.3951 33.9017 26.0983C34.6049 26.8016 35 27.7554 35 28.75V37.5C35.663 37.5 36.2989 37.2366 36.7678 36.7678C37.2366 36.2989 37.5 35.663 37.5 35V19.0525C37.4999 18.3895 37.2364 17.7537 36.7675 17.285L32.715 13.2325C32.2463 12.7636 31.6105 12.5001 30.9475 12.5H30V16.25C30 17.2446 29.6049 18.1984 28.9017 18.9017C28.1984 19.6049 27.2446 20 26.25 20H21.25C20.2554 20 19.3016 19.6049 18.5983 18.9017C17.8951 18.1984 17.5 17.2446 17.5 16.25V12.5H15ZM20 12.5V16.25C20 16.5815 20.1317 16.8995 20.3661 17.1339C20.6005 17.3683 20.9185 17.5 21.25 17.5H26.25C26.5815 17.5 26.8995 17.3683 27.1339 17.1339C27.3683 16.8995 27.5 16.5815 27.5 16.25V12.5H20ZM32.5 37.5V28.75C32.5 28.4185 32.3683 28.1005 32.1339 27.8661C31.8995 27.6317 31.5815 27.5 31.25 27.5H18.75C18.4185 27.5 18.1005 27.6317 17.8661 27.8661C17.6317 28.1005 17.5 28.4185 17.5 28.75V37.5H32.5ZM10 15C10 13.6739 10.5268 12.4021 11.4645 11.4645C12.4021 10.5268 13.6739 10 15 10H30.9475C32.2735 10.0003 33.545 10.5273 34.4825 11.465L38.535 15.5175C39.4727 16.455 39.9997 17.7265 40 19.0525V35C40 36.3261 39.4732 37.5979 38.5355 38.5355C37.5979 39.4732 36.3261 40 35 40H15C13.6739 40 12.4021 39.4732 11.4645 38.5355C10.5268 37.5979 10 36.3261 10 35V15Z"
                              fill="#0063F7"
                            />
                          </svg>

                          <div>
                            <h2 className="text-xl font-semibold">Save as</h2>
                            <p className="mt-1 text-sm font-normal text-[#616161]">
                              {state.editSubmission ? (
                                <>This will overwrite the current submission.</>
                              ) : (
                                <>
                                  {' '}
                                  Save as a draft to finish off later or as a
                                  template to use on future submissions.
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        <div>
                          {state.editSubmission &&
                          state.editSubmission.saveAs == 'Submission' ? (
                            <></>
                          ) : (
                            <div className="ml-6 flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                className="h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
                                name="editable"
                                value="1"
                                checked={state.saveAsDraft}
                                onChange={() => {
                                  dispatch({
                                    type: JSAAPPACTIONTYPE.SAVE_AS_DRAFT,
                                  });
                                }}
                              />
                              <span className="ml-2 text-gray-600">
                                Save as <strong>‘Drafts’</strong>
                              </span>
                            </div>
                          )}
                          <div className="ml-6 mt-3 flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              className="h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
                              name="editable"
                              value="1"
                              checked={state.saveAsTemplate}
                              onChange={() => {
                                dispatch({
                                  type: JSAAPPACTIONTYPE.SAVE_AS_TEMPLATE,
                                });
                              }}
                            />
                            <span className="ml-2 text-gray-600">
                              Save as <strong>‘Template’</strong>
                            </span>
                          </div>

                          {state.saveAsTemplate && (
                            <div className="mt-2 w-full px-4">
                              <SimpleInput
                                type="text"
                                label="Template Name"
                                placeholder="Give your template a name"
                                name="customer"
                                className="w-full"
                                errorMessage={'template name required'}
                                value={state.saveTemplateName}
                                isTouched={
                                  (state.saveTemplateName ?? '').length > 0
                                    ? false
                                    : true
                                }
                                onChange={(value) => {
                                  dispatch({
                                    type: JSAAPPACTIONTYPE.SAVE_TEMPLATE_NAME,
                                    saveTemplateName: value.target.value,
                                  });
                                }}
                              />
                              <div className="ml-3 mt-3 flex items-center gap-2 text-sm">
                                <input
                                  type="radio"
                                  className="h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
                                  name="editable"
                                  value="1"
                                  checked={state.saveTemplateType == 'my'}
                                  onChange={() => {
                                    dispatch({
                                      type: JSAAPPACTIONTYPE.SAVE_TEMPLATE_TYPE,
                                      saveTemplateType: 'my',
                                    });
                                  }}
                                />
                                <span className="ml-2 text-gray-600">
                                  My Templates
                                </span>
                              </div>
                              <div className="ml-3 mt-3 flex items-center gap-2 text-sm">
                                <input
                                  type="radio"
                                  className="h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
                                  name="editable"
                                  value="1"
                                  checked={state.saveTemplateType == 'shared'}
                                  onChange={() => {
                                    dispatch({
                                      type: JSAAPPACTIONTYPE.SAVE_TEMPLATE_TYPE,
                                      saveTemplateType: 'shared',
                                    });
                                  }}
                                />
                                <span className="ml-2 text-gray-600">
                                  Shared Templates
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    // after submitting  here u show celebrate message dialog
                    <>
                      <svg
                        width="50"
                        height="50"
                        viewBox="0 0 50 50"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                        <g clipPath="url(#clip0_3381_17018)">
                          <path
                            d="M25.0034 7.19677C15.1684 7.19677 7.19677 15.1684 7.19677 25.0034C7.19677 34.8384 15.1684 42.8101 25.0034 42.8101C34.8384 42.8101 42.8101 34.8384 42.8101 25.0034C42.7901 15.1768 34.8301 7.21677 25.0051 7.19677H25.0034ZM25.0034 44.3584C14.3134 44.3584 5.64844 35.6934 5.64844 25.0034C5.64844 14.3134 14.3134 5.64844 25.0034 5.64844C35.6934 5.64844 44.3584 14.3134 44.3584 25.0034V25.0284C44.3584 35.7034 35.7051 44.3568 25.0301 44.3568L25.0034 44.3584Z"
                            fill="#0063F7"
                          />
                          <path
                            d="M25 45C13.9767 44.9433 5.05667 36.0233 5 25.005V25C5 13.955 13.955 5 25 5C36.045 5 45 13.955 45 25C44.9433 36.0233 36.0233 44.9433 25.005 45H25ZM25 6.29C14.6667 6.29 6.29 14.6667 6.29 25C6.29 35.3333 14.6667 43.71 25 43.71C35.3333 43.71 43.71 35.3333 43.71 25C43.7033 14.67 35.33 6.29833 25.0017 6.29H25ZM25 43.4517C14.81 43.4517 6.54833 35.19 6.54833 25C6.54833 14.81 14.81 6.54833 25 6.54833C35.19 6.54833 43.4517 14.81 43.4517 25C43.4517 35.19 35.19 43.4517 25 43.4517ZM25 7.83833C15.5217 7.83833 7.83833 15.5217 7.83833 25C7.83833 34.4783 15.5217 42.1617 25 42.1617C34.4783 42.1617 42.1617 34.4783 42.1617 25V24.9917C42.1617 15.5183 34.4817 7.83833 25.0083 7.83833H25Z"
                            fill="#0063F7"
                          />
                          <path
                            d="M21.1246 21.5129V21.5279C21.1246 23.4446 19.5713 24.9979 17.6546 24.9979H17.6396C16.9506 24.9979 16.2772 24.7936 15.7043 24.4109C15.1315 24.0281 14.6851 23.4841 14.4214 22.8476C14.1578 22.2111 14.0888 21.5107 14.2232 20.835C14.3576 20.1593 14.6893 19.5386 15.1765 19.0515C15.6636 18.5643 16.2843 18.2326 16.96 18.0982C17.6357 17.9638 18.3361 18.0328 18.9726 18.2964C19.6091 18.56 20.1531 19.0065 20.5359 19.5793C20.9186 20.1522 21.1229 20.8256 21.1229 21.5146L21.1246 21.5129ZM24.9963 37.7713C24.7907 37.7713 24.5936 37.6896 24.4482 37.5443C24.3029 37.3989 24.2213 37.2018 24.2213 36.9963C24.2213 36.7907 24.3029 36.5936 24.4482 36.4482C24.5936 36.3029 24.7907 36.2213 24.9963 36.2213H25.0146C27.4199 36.2214 29.7652 35.4709 31.7236 34.0745C33.682 32.678 35.1559 30.7053 35.9396 28.4313L35.9646 28.3496C35.99 28.2559 36.0338 28.1682 36.0933 28.0916C36.1529 28.015 36.227 27.9509 36.3115 27.9032C36.396 27.8554 36.4891 27.8249 36.5855 27.8134C36.6819 27.802 36.7796 27.8097 36.8729 27.8363L36.8679 27.8346C36.9617 27.8598 37.0496 27.9034 37.1264 27.9629C37.2032 28.0224 37.2675 28.0965 37.3154 28.1811C37.3633 28.2656 37.3939 28.3588 37.4055 28.4552C37.4171 28.5517 37.4094 28.6495 37.3829 28.7429L37.3846 28.7379C35.6496 34.0213 30.7613 37.7696 24.9979 37.7696L24.9963 37.7713Z"
                            fill="#0063F7"
                          />
                          <path
                            d="M24.9981 38.4226C24.6229 38.4192 24.264 38.2687 23.9985 38.0035C23.733 37.7383 23.582 37.3795 23.5781 37.0043C23.6033 36.637 23.7604 36.2912 24.0204 36.0306C24.2804 35.7699 24.6259 35.612 24.9931 35.586H25.1248C27.3863 35.586 29.5896 34.8688 31.4179 33.5377C33.2462 32.2065 34.6053 30.3299 35.2998 28.1776L35.3215 28.1026C35.4255 27.7724 35.6546 27.4961 35.9598 27.3326L35.9665 27.3293C36.2856 27.1562 36.6585 27.1109 37.0098 27.2026L36.9998 27.201C37.1811 27.2568 37.3492 27.349 37.4938 27.4719C37.6383 27.5947 37.7564 27.7457 37.8407 27.9157C37.9251 28.0856 37.974 28.271 37.9844 28.4604C37.9949 28.6499 37.9666 28.8394 37.9015 29.0176L37.9048 29.0076C36.1415 34.5126 31.0698 38.4276 25.0848 38.4276H24.9981H25.0031L24.9981 38.4226ZM24.9981 37.0026C24.9648 37.036 24.9431 37.081 24.9431 37.131C24.9431 37.181 24.9648 37.2276 24.9981 37.2593H25.0265C27.6133 37.2591 30.1344 36.4448 32.2325 34.9317C34.3307 33.4187 35.8994 31.2837 36.7165 28.8293L36.7415 28.7426V28.6143H36.6131C34.9598 33.526 30.3981 37.001 25.0231 37.001L24.9981 37.0026ZM34.9331 21.906H32.0948L33.2565 21.0026C33.3673 20.9209 33.4603 20.8174 33.5297 20.6984C33.599 20.5794 33.6433 20.4475 33.6598 20.3107C33.6763 20.174 33.6647 20.0353 33.6256 19.9032C33.5866 19.7711 33.5209 19.6485 33.4327 19.5427C33.3444 19.4369 33.2355 19.3503 33.1126 19.2882C32.9896 19.2261 32.8553 19.1898 32.7178 19.1815C32.5803 19.1732 32.4426 19.1932 32.3131 19.2401C32.1836 19.287 32.0651 19.3599 31.9648 19.4543L31.9665 19.4526L28.6115 22.0326C28.4615 22.2193 28.3315 22.431 28.2315 22.6593L28.2248 22.6776V22.936C28.2748 23.446 28.6998 23.8393 29.2181 23.8393H29.2598H29.2581H34.9498C35.0836 23.8395 35.2161 23.8133 35.3398 23.7622C35.4634 23.7111 35.5757 23.6361 35.6704 23.5415C35.765 23.4469 35.84 23.3346 35.8911 23.2109C35.9422 23.0873 35.9683 22.9548 35.9681 22.821V22.806C35.9445 22.5589 35.8297 22.3294 35.646 22.1624C35.4623 21.9954 35.223 21.9028 34.9748 21.9026H34.9331V21.906Z"
                            fill="#0063F7"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_3381_17018">
                            <rect
                              width="40"
                              height="40"
                              fill="white"
                              transform="translate(5 5)"
                            />
                          </clipPath>
                        </defs>
                      </svg>

                      <div>
                        <h2 className="text-xl font-semibold">
                          Successfully Saved
                        </h2>
                        <p className="mt-1 text-sm font-normal text-[#616161]">
                          Successfully duplicate to Drafts.
                        </p>
                      </div>
                    </>
                  )
                }
              </ModalBody>
              {
                <ModalFooter className="flex justify-end gap-4 border-t-2 border-gray-200 p-3">
                  {saveAs == 'close' ? (
                    <>
                      <Button
                        variant="light"
                        className="cursor-pointer text-primary-600"
                        onClick={() => {
                          setPopUp(!showPopUp);
                        }}
                      >
                        Cancel
                      </Button>
                      {state.editSubmission &&
                      state.editSubmission.isTemplate ? (
                        <Button
                          // variant="primaryOutLine"
                          variant="bordered"
                          color="primary"
                          onClick={() => {
                            handleSaveAs();
                          }}
                        >
                          {updateSubmissionMutation.isLoading ? (
                            <Loader />
                          ) : (
                            <> Save </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          // variant="primaryOutLine"
                          variant="bordered"
                          color="primary"
                          isDisabled={disableSaveAsEntry}
                          onClick={() => {
                            setSaveAs('saveAs');
                          }}
                        >
                          Save as
                        </Button>
                      )}

                      <Button
                        // variant="primary"
                        color="primary"
                        onClick={() => {
                          dispatch({ type: JSAAPPACTIONTYPE.CLOSE_PAGES });
                        }}
                      >
                        Confirm
                      </Button>
                    </>
                  ) : saveAs == 'saveAs' ? (
                    <>
                      <Button
                        // variant="primaryOutLine"
                        variant="bordered"
                        color="primary"
                        onClick={() => {
                          setSaveAs('close');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        // variant="primary"
                        color="primary"
                        onClick={() => {
                          handleSaveAs();
                        }}
                        isDisabled={checkDisable(state)}
                      >
                        {createSubmissionMutation.isLoading ? (
                          <Loader />
                        ) : (
                          <> Save </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        // variant="primaryOutLine"
                        variant="light"
                        color="primary"
                        onClick={() => {
                          setPopUp(!showPopUp);
                          setSaveAs('close');
                        }}
                      >
                        Continue Editing
                      </Button>
                      <Button
                        // variant="primary"
                        color="primary"
                        onClick={() => {
                          dispatch({ type: JSAAPPACTIONTYPE.CLOSE_PAGES });
                        }}
                      >
                        Finish
                      </Button>
                    </>
                  )}
                </ModalFooter>
              }
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
