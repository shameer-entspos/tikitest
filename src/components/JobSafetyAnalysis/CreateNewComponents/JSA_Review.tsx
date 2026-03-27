import { getPresignedFileUrls } from '@/app/(main)/(user-panel)/user/file/api';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { JSAAPPACTIONTYPE } from '@/app/helpers/user/enums';
import { BottomButton } from './BottomButton';
import { WithSidebar } from './WithSideBar';
import clsx from 'clsx';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSession } from 'next-auth/react';
import {
  createjSASubmision,
  updatejSASubmision,
  getJSAAppSetting,
} from '@/app/(main)/(user-panel)/user/apps/api';
import { getLastSegment } from './JSA_Upload_IMG';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Modal, ModalContent, ModalBody } from '@nextui-org/react';
import { UseStagedImageUploadsReturn } from '@/components/apps/shared/useStagedImageUploads';

export function JSAReview({
  stagedUploads,
  uploadPendingImages,
}: {
  stagedUploads?: UseStagedImageUploadsReturn;
  uploadPendingImages?: () => Promise<string[]>;
}) {
  const { state, dispatch } = useJSAAppsCotnext();
  const [loading, setLoading] = useState(false);
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;
  const rawEmergencyImages = useMemo(
    () => (state.jsaEmergencyPlanImages ?? []) as string[],
    [state.jsaEmergencyPlanImages]
  );
  const [resolvedEmergencyUrls, setResolvedEmergencyUrls] = useState<
    string[] | null
  >(null);

  useEffect(() => {
    if (!rawEmergencyImages.length || !accessToken?.trim()) {
      setResolvedEmergencyUrls(null);
      return;
    }
    let cancelled = false;
    getPresignedFileUrls(axiosAuth, rawEmergencyImages, accessToken).then(
      (urls) => {
        if (
          !cancelled &&
          urls &&
          urls.length === rawEmergencyImages.length
        )
          setResolvedEmergencyUrls(urls);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [rawEmergencyImages, accessToken, axiosAuth]);

  const uploadedReviewImages = rawEmergencyImages.map((image, index) => ({
    label: getLastSegment(image) || 'Attachment',
    src: resolvedEmergencyUrls?.[index] ?? image,
  }));
  const stagedReviewImages = (stagedUploads?.items ?? []).map((item) => ({
    label: item.file.name,
    src: item.previewUrl,
  }));
  const reviewImages = [...uploadedReviewImages, ...stagedReviewImages];

  // Lightbox for attached images
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const currentImage =
    lightboxIndex !== null ? reviewImages[lightboxIndex] : null;
  const hasMultiple = reviewImages.length > 1;
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const goPrev = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? Math.max(0, i - 1) : null));
  }, []);
  const goNext = useCallback(() => {
    setLightboxIndex((i) =>
      i !== null ? Math.min(reviewImages.length - 1, i + 1) : null
    );
  }, [reviewImages.length]);
  const [zoom, setZoom] = useState(100);
  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(200, z + 25)),
    []
  );
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(50, z - 25)),
    []
  );
  useEffect(() => {
    if (lightboxIndex === null) return;
    setZoom(100);
  }, [lightboxIndex]);
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (hasMultiple && e.key === 'ArrowLeft') goPrev();
      if (hasMultiple && e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, hasMultiple, closeLightbox, goPrev, goNext]);

  // Fetch JSA app settings to check forceSubmission
  const { data: jsaSettings } = useQuery({
    queryKey: 'JSASetting',
    queryFn: () => getJSAAppSetting(axiosAuth),
  });

  const forceSubmission = jsaSettings?.forceSubmission || 'no';
  const hasNoRestrictions = forceSubmission === 'no';

  // Auto-set reviewStatus based on forceSubmission when settings are loaded
  useEffect(() => {
    if (jsaSettings && !state.editSubmission?.isTemplate) {
      if (forceSubmission === 'public' && state.reviewStatus !== 'public') {
        dispatch({
          type: JSAAPPACTIONTYPE.REVIEW_STATUS_TOGGLE,
          reviewStatus: 'public',
        });
      } else if (
        forceSubmission === 'private' &&
        state.reviewStatus !== 'private'
      ) {
        dispatch({
          type: JSAAPPACTIONTYPE.REVIEW_STATUS_TOGGLE,
          reviewStatus: 'private',
        });
      }
    }
  }, [
    jsaSettings,
    forceSubmission,
    state.reviewStatus,
    state.editSubmission?.isTemplate,
    dispatch,
  ]);

  const createSubmissionMutation = useMutation(createjSASubmision, {
    onSuccess: () => {
      setLoading(false);
      queryClient.invalidateQueries('JSASubmissions');
      queryClient.invalidateQueries('JSADraft');
      toast.success('Submission created successfully');
      dispatch({ type: JSAAPPACTIONTYPE.CLOSE_PAGES });
    },
    onError: () => {
      setLoading(false);
      toast.error('Failed to create submission');
    },
  });
  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);
  const updateSubmissionMutation = useMutation(updatejSASubmision, {
    onSuccess: (_, variables) => {
      setLoading(false);
      const saveAs = state.editSubmission?.saveAs;
      queryClient.invalidateQueries('getJSASingleSubmissionDetail');
      queryClient.invalidateQueries('JSASubmissions');
      if (saveAs === 'Draft') queryClient.invalidateQueries('JSADraft');
      queryClient.invalidateQueries('JSATemplates');
      toast.success('Submission saved successfully');
      dispatch({ type: JSAAPPACTIONTYPE.CLOSE_PAGES });
    },
    onError: () => {
      setLoading(false);
      toast.error('Failed to save submission');
    },
  });

  const handleSubmit = async () => {
    setLoading(true);

    let stagedImageUrls: string[] = [];

    try {
      stagedImageUrls = (await uploadPendingImages?.()) ?? [];
    } catch {
      setLoading(false);
      return;
    }

    // Determine sharing value based on forceSubmission or user selection
    let sharingValue: number;
    if (!state.editSubmission?.isTemplate && forceSubmission !== 'no') {
      // Force the sharing value based on admin settings
      sharingValue = forceSubmission === 'public' ? 2 : 1;
    } else {
      // Use user's selection (for templates or when no restrictions)
      sharingValue = state.reviewStatus == 'private' ? 1 : 2;
    }

    const submissionImages = [
      ...(state.jsaEmergencyPlanImages ?? []),
      ...stagedImageUrls,
    ];

    if (state.editSubmission && state.editSubmission.isTemplate) {
      const data = {
        projectIds:
          (state.jsaSelectedProjects ?? []).map((pro) => pro.id) ?? [],
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
        images: submissionImages,
        sharing: state.saveTemplateType === 'my' ? 1 : 2, // Template sharing is independent
        allowEdit: state.reviewPublicStatusEditable ?? false,
        saveAs: '',
        templateName: state.saveTemplateName,
        templateSharing: state.saveTemplateType === 'my' ? 1 : 2,
        isTemplateEditable: state.isTemplateEditable,
      };
      updateSubmissionMutation.mutate({
        axiosAuth,
        id: state.editSubmission._id,
        data,
      });
      console.log('creating with data: ', data);
    } else {
      if (state.editSubmission && state.editSubmission.saveAs != '') {
        const data = {
          projectIds:
            (state.jsaSelectedProjects ?? []).map((pro) => pro.id) ?? [],
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
          images: submissionImages,
          sharing: sharingValue,
          allowEdit: state.reviewPublicStatusEditable ?? false,
          saveAs: 'Submission',
        };
        updateSubmissionMutation.mutate({
          axiosAuth,
          id: state.editSubmission._id,
          data,
        });
        console.log('creating with data: ', data);
      } else {
        const data = {
          projectIds:
            (state.jsaSelectedProjects ?? []).map((pro) => pro.id) ?? [],
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
          images: submissionImages,
          sharing: sharingValue,
          allowEdit: state.reviewPublicStatusEditable ?? false,
          saveAs: state.saveAsDraft ? 'Draft' : 'Submission',
        };
        console.log(data);
        createSubmissionMutation.mutate({
          axiosAuth,
          data,
        });
        console.log('creating with data: ', data);
      }
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto scrollbar-hide">
        <WithSidebar>
          <div className="h-full w-11/12 overflow-auto scrollbar-hide lg:w-[83%]">
            {/* First Container  */}
            <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
              {/* form top  */}
              <div className="mb-2 flex justify-between px-4 pt-5">
                <div className="flex flex-col font-semibold">
                  <div className="mb-2">
                    {state.editSubmission ? (
                      <>
                        {state.editSubmission.isTemplate ? (
                          <> Review & Save Tempate</>
                        ) : (
                          <>
                            {state.editSubmission.saveAs === 'Draft' ? (
                              <>Review & Publish Draft</>
                            ) : (
                              <>Review & Save Submission</>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <>Review & Submit</>
                    )}
                  </div>
                  <p className="text-sm font-normal text-[#616161]">
                    Take a look and review your JSA before you submit it.
                  </p>
                </div>
              </div>
              {state.editSubmission && state.editSubmission.isTemplate ? (
                <>
                  <label className="mb-2 inline-flex flex-col justify-center px-4 pt-2">
                    <div>
                      <input
                        type="radio"
                        className="h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
                        name="option"
                        value="2"
                        checked={state.saveTemplateType == 'shared'}
                        onChange={() => {
                          dispatch({
                            type: JSAAPPACTIONTYPE.SAVE_TEMPLATE_TYPE,
                            saveTemplateType: 'shared',
                          });
                        }}
                      />
                      <span className="ml-2 text-gray-700">
                        Shared Template
                      </span>
                      <span className="mx-2 text-sm text-gray-500">
                        Accessible and visible to the all project members.
                      </span>
                    </div>
                    <div className="ml-6 pt-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
                        name="editable"
                        value="1"
                        checked={state.isTemplateEditable}
                        onChange={() => {
                          dispatch({
                            type: JSAAPPACTIONTYPE.IS_TEMPALTE_EDITABLE,
                          });
                        }}
                      />
                      <span className="ml-2 text-gray-600">
                        Allow other users to edit this entry.
                      </span>
                    </div>
                  </label>
                  <label className="mb-2 inline-flex items-center px-4">
                    <input
                      type="radio"
                      className="h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
                      name="option"
                      value="1"
                      checked={state.saveTemplateType == 'my'}
                      onChange={() => {
                        dispatch({
                          type: JSAAPPACTIONTYPE.SAVE_TEMPLATE_TYPE,
                          saveTemplateType: 'my',
                        });
                      }}
                    />
                    <span className="ml-2 text-gray-700">My Template</span>
                    <span className="mx-2 text-sm text-gray-500">
                      Only accessible and visible to you.
                    </span>
                  </label>
                </>
              ) : (
                <>
                  {hasNoRestrictions ? (
                    <>
                      <label className="mb-2 inline-flex flex-col justify-center px-4 pt-2">
                        <div>
                          <input
                            type="radio"
                            className="h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
                            name="option"
                            value="1"
                            checked={state.reviewStatus == 'public'}
                            onChange={() => {
                              dispatch({
                                type: JSAAPPACTIONTYPE.REVIEW_STATUS_TOGGLE,
                                reviewStatus: 'public',
                              });
                            }}
                          />
                          <span className="ml-2 text-gray-700">Public</span>
                          <span className="mx-2 text-sm text-gray-500">
                            Accessible and visible to the all project members.
                          </span>
                        </div>
                        <div className="ml-6">
                          <input
                            type="checkbox"
                            className="h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
                            name="editable"
                            value="1"
                            checked={state.reviewPublicStatusEditable}
                            onChange={() => {
                              dispatch({
                                type: JSAAPPACTIONTYPE.REVIEW_STATUS_EDITABLE,
                              });
                            }}
                          />
                          <span className="ml-2 text-gray-600">
                            Allow other users to edit this entry.
                          </span>
                        </div>
                      </label>
                      <label className="mb-2 inline-flex items-center px-4 pt-2">
                        <input
                          type="radio"
                          className="h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
                          name="option"
                          value="1"
                          checked={state.reviewStatus == 'private'}
                          onChange={() => {
                            dispatch({
                              type: JSAAPPACTIONTYPE.REVIEW_STATUS_TOGGLE,
                              reviewStatus: 'private',
                            });
                          }}
                        />
                        <span className="ml-2 text-gray-700">Private</span>
                        <span className="mx-2 text-sm text-gray-500">
                          Only accessible and visible to you.
                        </span>
                      </label>
                    </>
                  ) : forceSubmission === 'public' ? (
                    <div className="px-4 pb-4 pt-2">
                      <div className="mb-2">
                        <span className="font-semibold text-gray-700">
                          Public
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          (Forced by admin settings)
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        All submissions are automatically Public. Any project
                        member can view them.
                      </p>
                      <div className="ml-6 mt-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
                          name="editable"
                          value="1"
                          checked={state.reviewPublicStatusEditable}
                          onChange={() => {
                            dispatch({
                              type: JSAAPPACTIONTYPE.REVIEW_STATUS_EDITABLE,
                            });
                          }}
                        />
                        <span className="ml-2 text-gray-600">
                          Allow other users to edit this entry.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 pb-4 pt-2">
                      <div className="mb-2">
                        <span className="font-semibold text-gray-700">
                          Private
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          (Forced by admin settings)
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        All submissions are automatically Private. They are only
                        visible to the creator and users with Admin Mode access;
                        project members cannot view them.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            {/* Second Container  */}
            <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
              {/* form top  */}
              <div className="mb-4 flex justify-between px-4 pt-5">
                <div className="flex flex-col">
                  <h2 className="mb-1 text-xl font-semibold">
                    Assigned Projects
                  </h2>
                </div>
                <div
                  className="cursor-pointer text-[#0063F7]"
                  onClick={() => {
                    dispatch({
                      type: JSAAPPACTIONTYPE.CREATENEWSECTION,
                      createNewSection: 'project',
                    });
                  }}
                >
                  Edit Section
                </div>
              </div>
              <div className="mb-4 flex flex-wrap items-center justify-start gap-2 px-4 pt-2">
                {(state.jsaSelectedProjects ?? []).map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="flex gap-2 rounded-xl bg-[#E2E2E2] px-3 py-1 text-black"
                    >
                      <span>{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Third Container  */}
            <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
              {/* form top  */}
              <div className="mb-4 flex justify-between px-4 pt-5">
                <div className="flex flex-col">
                  <h2 className="mb-1 text-xl font-semibold">JSA Details</h2>
                </div>
                <div
                  className="cursor-pointer text-[#0063F7]"
                  onClick={() => {
                    dispatch({
                      type: JSAAPPACTIONTYPE.CREATENEWSECTION,
                      createNewSection: 'jsaDetail',
                    });
                  }}
                >
                  Edit Section
                </div>
              </div>
              <div className="mb-4 grid grid-cols-2 flex-wrap items-center px-4 pt-2">
                <div className="pb-4 pt-2">
                  <h3 className="text-sm text-gray-700">JSA Name</h3>
                  <p className="font-bold">
                    {state.jsaCreateDetailPayload?.jsaName}
                  </p>
                </div>
                <div className="pb-4 pt-2">
                  <h3 className="text-sm text-gray-700">
                    Date Range of Activities
                  </h3>
                  <p className="font-bold">27-09-2034 to 29-02-2036</p>
                </div>
                <div className="col-span-2 pb-4 pt-2">
                  <h3 className="text-sm text-gray-700">
                    Scope of works taking place
                  </h3>
                  <span>{state.jsaCreateDetailPayload?.description}</span>
                </div>
                <div className="col-span-2 flex pb-4 pt-2">
                  <span className="w-1/4">
                    <h3 className="text-sm text-gray-700">Contact Name</h3>
                    <div className="font-bold">
                      {state.jsaCreateDetailPayload?.contactName}
                    </div>
                  </span>
                  <span className="w-1/4">
                    <h3 className="text-sm text-gray-700">Phone Number</h3>
                    <div>{state.jsaCreateDetailPayload?.phone}</div>
                  </span>
                </div>
                <div className="pb-4 pt-2">
                  <h3 className="text-sm text-gray-700">
                    Managers and Supervisors
                  </h3>
                  {(state.jsaDetailSelectedManagers ?? []).map(
                    (user, index) => {
                      return (
                        <div className="flex" key={index}>
                          <span className="w-1/2 font-bold">
                            {`${user.firstName} ${user.lastName}`}
                          </span>
                          <span className="w-1/2">{user.email}</span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
            {/* Steps Container  */}
            {(state.steps ?? []).map((value, index) => (
              <div
                className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2"
                key={index}
              >
                {/* form top  */}
                <div className="mb-4 flex justify-between px-4 pt-5">
                  <div className="flex flex-col">
                    <h2 className="mb-1 text-xl font-semibold">
                      Step {index + 1}
                    </h2>
                  </div>
                  <div
                    className="cursor-pointer text-[#0063F7]"
                    onClick={() => {
                      dispatch({
                        type: JSAAPPACTIONTYPE.CREATENEWSECTION,
                        createNewSection: 'step',
                      });
                    }}
                  >
                    Edit Section
                  </div>
                </div>
                <div className="mb-4 grid grid-cols-1 flex-wrap items-center justify-start pt-2">
                  <div className="px-4 pb-4 pt-2">
                    <h3 className="text-sm text-gray-700">
                      Activity Description
                    </h3>
                    <p className="font-bold">{value.description}</p>
                  </div>
                  <div className="px-4 pb-4 pt-2">
                    <h3 className="text-sm text-gray-700">
                      PPE's and Safety Gear
                    </h3>
                    <div className="mb-4 flex flex-wrap items-center justify-start gap-2 pt-2">
                      {value.PPEs.map((item) => {
                        return (
                          <div
                            key={item._id}
                            className="flex gap-2 rounded-xl bg-[#BCC7FF] px-3 py-1 text-black"
                          >
                            <span>{item.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="pb-4 pt-2">
                    {value.Hazards.map((hazard, index) => (
                      <div
                        key={index}
                        className={clsx(
                          'px-4 pb-6 pt-2',
                          index % 2 === 0 ? 'bg-[#FFF3E1]' : 'bg-[#efefef]'
                        )}
                      >
                        <div className="pb-4 pt-2">
                          <h3 className="text-gray-700">
                            Hazard and Risk Name
                          </h3>
                          <p className="font-bold">{hazard.name}</p>
                        </div>
                        <div className="pb-4 pt-2">
                          <h3 className="text-sm text-gray-700">
                            Hazard Initial Risk Assessment
                          </h3>
                          <span>{hazard.initialRiskAssessment}</span>
                        </div>
                        <div className="pb-4 pt-2">
                          <h3 className="text-sm text-gray-700">
                            Hazard Control
                          </h3>
                          <span>{hazard.controlMethod}</span>
                        </div>
                        <div className="pb-4 pt-2">
                          <h3 className="text-sm text-gray-700">
                            Hazard Residual Risk Assessment
                          </h3>
                          <span>{hazard.residualRiskAssessment}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {/* last Container  */}

            <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
              {/* form top  */}
              <div className="mb-4 flex justify-between px-4 pt-5">
                <div className="flex flex-col">
                  <h2 className="mb-1 text-xl font-semibold">Emergency Plan</h2>
                </div>
                <div
                  className="cursor-pointer text-[#0063F7]"
                  onClick={() => {
                    dispatch({
                      type: JSAAPPACTIONTYPE.CREATENEWSECTION,
                      createNewSection: 'emergency',
                    });
                  }}
                >
                  Edit Section
                </div>
              </div>
              <div className="mb-4 grid grid-cols-1 flex-wrap items-start px-4 pt-2">
                <div className="pb-4 pt-2">
                  <h3 className="text-sm text-gray-700">Evacuation Area</h3>
                  <p className="font-bold">
                    {state.jsaEmergencyPlanPayLoad?.area}
                  </p>
                </div>
                <div className="pb-4 pt-2">
                  <h3 className="text-sm text-gray-700">
                    Evacuation and Emergency Procedures
                  </h3>
                  <p className="font-bold">
                    {state.jsaEmergencyPlanPayLoad?.procedure}
                  </p>
                </div>
                {(
                  state.jsaEmergencyPlanPayLoad?.jsaEmergencyPlanContacts ?? []
                ).map((contacts, index) => {
                  return (
                    <div className="flex pb-4 pt-2" key={index}>
                      <span className="w-1/4">
                        <h3 className="text-sm text-gray-700">
                          Emergency Contact Name
                        </h3>
                        <p className="font-bold">{contacts.name}</p>
                      </span>
                      <span className="w-1/4">
                        <h3 className="text-sm text-gray-700">Phone Number</h3>

                        <div>{contacts.phone}</div>
                      </span>
                    </div>
                  );
                })}

                {reviewImages.map((val, index) => (
                  <div className="pb-4 pt-2" key={index}>
                    <img
                      src={val.src}
                      alt={val.label}
                      className="max-h-48 cursor-pointer rounded border object-contain hover:opacity-90"
                      onClick={() => setLightboxIndex(index)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && setLightboxIndex(index)
                      }
                    />
                    <span className="my-2 block text-sm text-[#0063F7]">
                      {val.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </WithSidebar>
      </div>

      {/* Image lightbox modal */}
      <Modal
        isOpen={lightboxIndex !== null}
        onOpenChange={(open) => !open && closeLightbox()}
        size="5xl"
        classNames={{ base: 'max-h-[90vh]' }}
      >
        <ModalContent>
          {(onClose) => (
            <div ref={lightboxRef} className="outline-none">
              <ModalBody className="relative overflow-hidden p-0">
                <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2">
                  <span className="text-sm text-gray-600">
                    {hasMultiple && lightboxIndex !== null
                      ? `Image ${lightboxIndex + 1} of ${reviewImages.length}`
                      : 'Image'}
                  </span>
                  <div className="flex items-center gap-2">
                    {hasMultiple && (
                      <span className="text-xs text-gray-500">
                        ← → to navigate
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={zoomOut}
                      disabled={zoom <= 50}
                      className="rounded p-1.5 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                      title="Zoom out"
                      aria-label="Zoom out"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 10h6"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={zoomIn}
                      disabled={zoom >= 200}
                      className="rounded p-1.5 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                      title="Zoom in"
                      aria-label="Zoom in"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                        />
                      </svg>
                    </button>
                    <span className="min-w-[3rem] text-xs text-gray-600">
                      {zoom}%
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (lightboxRef.current) {
                          if (!document.fullscreenElement) {
                            lightboxRef.current.requestFullscreen?.();
                          } else {
                            document.exitFullscreen?.();
                          }
                        }
                      }}
                      className="rounded p-1.5 text-gray-600 hover:bg-gray-200"
                      title="Fullscreen"
                      aria-label="Fullscreen"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded p-1.5 text-gray-600 hover:bg-gray-200"
                      title="Close"
                      aria-label="Close"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="relative flex min-h-[50vh] items-center justify-center overflow-auto bg-black/5 p-4">
                  {currentImage && (
                    <img
                      src={currentImage.src}
                      alt={currentImage.label}
                      className="max-h-[75vh] w-full object-contain transition-transform"
                      style={{ transform: `scale(${zoom / 100})` }}
                    />
                  )}
                  {hasMultiple && (
                    <>
                      <button
                        type="button"
                        onClick={goPrev}
                        disabled={lightboxIndex === 0}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white disabled:opacity-40"
                        aria-label="Previous image"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        disabled={lightboxIndex === reviewImages.length - 1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white disabled:opacity-40"
                        aria-label="Next image"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </ModalBody>
            </div>
          )}
        </ModalContent>
      </Modal>
      <div className="flex-shrink-0">
        <BottomButton
          uploadPendingImages={uploadPendingImages}
          onCancel={() => {
            dispatch({
              type: JSAAPPACTIONTYPE.CREATENEWSECTION,
              createNewSection: 'emergency',
            });
          }}
          onSavAs={() => {}}
          loading={loading}
          onNextClick={() => {
            handleSubmit();
          }}
        />
      </div>
    </div>
  );
}
