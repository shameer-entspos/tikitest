import { DiscussionTopic } from '@/app/type/discussion_topic';
import { Button } from '@/components/Buttons';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { useMemo, useState } from 'react';
import {
  getAllAppProjects,
  getAllOrgUsers,
} from '@/app/(main)/(user-panel)/user/apps/api';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { SimpleInput } from '@/components/Form/simpleInput';
import Select_SM_Images from '../03_SafetyMeetings/Create_SafetyMeeting/Select_SM_Image';
import {
  createDiscussionTopic,
  updateDiscussionTopic,
} from '@/app/(main)/(user-panel)/user/apps/sh/api';
import { useSafetyHubContext } from '@/app/(main)/(user-panel)/user/apps/sh/sh_context';
import { useEffect } from 'react';
import { uploadImageToApp } from '@/components/apps/shared/appImageUpload';
import { useStagedImageUploads } from '@/components/apps/shared/useStagedImageUploads';
const CreateDiscussionModal = ({
  handleClose,
  model,
}: {
  handleClose: any;
  model: DiscussionTopic | undefined;
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const appFormValidatorSchema = Yup.object().shape({
    projects: Yup.array().required('Project is required'),
    category: Yup.string().required('category is required'),
    title: Yup.string().required('title is required'),
    // description: Yup.string().required("description is required"),
  });
  const { state, dispatch } = useSafetyHubContext();
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    model?.images ?? []
  );
  const discussionImages = useMemo(() => model?.images ?? [], [model?.images]);
  const stagedUploads = useStagedImageUploads({
    existingCount: uploadedImages.length,
    maxFiles: 5,
  });
  const { clearStaged } = stagedUploads;
  const organizationForm = useFormik({
    initialValues: {
      title: model?.title ?? '',
      projects: (model?.projects ?? []).map((proj) => proj._id) ?? [],
      description: model?.description ?? '',
      category: model?.category ?? undefined,
    },

    validationSchema: appFormValidatorSchema,
    onSubmit: async (values) => {
      let stagedImageUrls: string[] = [];

      try {
        stagedImageUrls = await stagedUploads.uploadPending<string>({
          onUploaded: async (fileUrl) => {
            setUploadedImages((currentImages) => [...currentImages, fileUrl]);
          },
          uploadFile: async (file, onProgress) =>
            uploadImageToApp({
              appId: state.appId!,
              axiosAuth,
              file,
              onProgress,
            }),
        });
      } catch {
        return;
      }

      // "title": "Hazard Report2",
      // "description": "Detailed description of the hazard",
      // "projects": [],
      // "category": "hazards & incidents",
      // "images": []

      if (model) {
        updateMutation.mutate({
          axiosAuth,
          id: model._id,
          data: {
            title: values.title,
            description: values.description,
            category: values.category,
            projects: values.projects,
            images: [...uploadedImages, ...stagedImageUrls],
          },
        });
      } else {
        createMutation.mutate({
          axiosAuth,
          data: {
            title: values.title,
            description: values.description,
            category: values.category,
            projects: values.projects,
            images: [...uploadedImages, ...stagedImageUrls],
          },
        });
      }
    },
  });
  const axiosAuth = useAxiosAuth();
  const { data: projects, isLoading: projectLoading } = useQuery({
    queryKey: 'listOfAppProjects',
    queryFn: () => getAllAppProjects(axiosAuth),
  });
  const queryClient = useQueryClient();
  const createMutation = useMutation(createDiscussionTopic, {
    onSuccess: () => {
      queryClient.invalidateQueries('discussionTopics');
      handleClose();
    },
  });

  const updateMutation = useMutation(updateDiscussionTopic, {
    onSuccess: () => {
      queryClient.invalidateQueries('discussionTopics');
      handleClose();
    },
  });

  useEffect(() => {
    setUploadedImages(discussionImages);
    clearStaged();
  }, [clearStaged, discussionImages]);

  return (
    <Modal
      isOpen={true}
      onOpenChange={handleClose}
      placement="top-center"
      size="xl"
    >
      <ModalContent className="max-w-[600px] rounded-3xl bg-white">
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-row items-start gap-2 px-5 py-5">
              <svg
                width="50"
                height="50"
                viewBox="0 0 50 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                <path
                  d="M20.4167 26.6673C20.4167 28.509 18.925 30.0007 17.0833 30.0007C15.2417 30.0007 13.75 28.509 13.75 26.6673C13.75 24.8257 15.2417 23.334 17.0833 23.334C18.925 23.334 20.4167 24.8257 20.4167 26.6673Z"
                  fill="#0063F7"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M17.0833 28.334C17.5254 28.334 17.9493 28.1584 18.2618 27.8458C18.5744 27.5333 18.75 27.1093 18.75 26.6673C18.75 26.2253 18.5744 25.8014 18.2618 25.4888C17.9493 25.1762 17.5254 25.0007 17.0833 25.0007C16.6413 25.0007 16.2174 25.1762 15.9048 25.4888C15.5923 25.8014 15.4167 26.2253 15.4167 26.6673C15.4167 27.1093 15.5923 27.5333 15.9048 27.8458C16.2174 28.1584 16.6413 28.334 17.0833 28.334ZM17.0833 30.0007C18.925 30.0007 20.4167 28.509 20.4167 26.6673C20.4167 24.8257 18.925 23.334 17.0833 23.334C15.2417 23.334 13.75 24.8257 13.75 26.6673C13.75 28.509 15.2417 30.0007 17.0833 30.0007Z"
                  fill="#0063F7"
                />
                <path
                  d="M10 35.4544C10 32.9344 14.7192 31.666 17.0833 31.666C19.4475 31.666 24.1667 32.9352 24.1667 35.4535V39.9993H10V35.4544Z"
                  fill="#0063F7"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M11.945 34.9852C11.6817 35.2452 11.6667 35.3944 11.6667 35.4544V38.3327H22.5V35.4535C22.5 35.3952 22.485 35.2452 22.2217 34.9852C21.9433 34.711 21.4842 34.4168 20.855 34.1477C19.5883 33.6052 18.0417 33.3327 17.0833 33.3327C16.125 33.3327 14.5775 33.6052 13.3117 34.1477C12.6825 34.4168 12.2233 34.711 11.945 34.9852ZM17.0833 31.666C14.7192 31.666 10 32.9352 10 35.4535V39.9993H24.1667V35.4535C24.1667 32.936 19.4475 31.666 17.0833 31.666Z"
                  fill="#0063F7"
                />
                <path
                  d="M36.2507 26.6673C36.2507 28.509 34.759 30.0007 32.9173 30.0007C31.0757 30.0007 29.584 28.509 29.584 26.6673C29.584 24.8257 31.0757 23.334 32.9173 23.334C34.759 23.334 36.2507 24.8257 36.2507 26.6673Z"
                  fill="#0063F7"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M32.9173 28.334C33.3593 28.334 33.7833 28.1584 34.0958 27.8458C34.4084 27.5333 34.584 27.1093 34.584 26.6673C34.584 26.2253 34.4084 25.8014 34.0958 25.4888C33.7833 25.1762 33.3593 25.0007 32.9173 25.0007C32.4753 25.0007 32.0514 25.1762 31.7388 25.4888C31.4262 25.8014 31.2507 26.2253 31.2507 26.6673C31.2507 27.1093 31.4262 27.5333 31.7388 27.8458C32.0514 28.1584 32.4753 28.334 32.9173 28.334ZM32.9173 30.0007C34.759 30.0007 36.2507 28.509 36.2507 26.6673C36.2507 24.8257 34.759 23.334 32.9173 23.334C31.0757 23.334 29.584 24.8257 29.584 26.6673C29.584 28.509 31.0757 30.0007 32.9173 30.0007Z"
                  fill="#0063F7"
                />
                <path
                  d="M28.3327 24.9993C28.3327 26.841 26.841 28.3327 24.9993 28.3327C23.1577 28.3327 21.666 26.841 21.666 24.9993C21.666 23.1577 23.1577 21.666 24.9993 21.666C26.841 21.666 28.3327 23.1577 28.3327 24.9993Z"
                  fill="#0063F7"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M24.9993 26.666C25.4414 26.666 25.8653 26.4904 26.1779 26.1779C26.4904 25.8653 26.666 25.4414 26.666 24.9993C26.666 24.5573 26.4904 24.1334 26.1779 23.8208C25.8653 23.5083 25.4414 23.3327 24.9993 23.3327C24.5573 23.3327 24.1334 23.5083 23.8208 23.8208C23.5083 24.1334 23.3327 24.5573 23.3327 24.9993C23.3327 25.4414 23.5083 25.8653 23.8208 26.1779C24.1334 26.4904 24.5573 26.666 24.9993 26.666ZM24.9993 28.3327C26.841 28.3327 28.3327 26.841 28.3327 24.9993C28.3327 23.1577 26.841 21.666 24.9993 21.666C23.1577 21.666 21.666 23.1577 21.666 24.9993C21.666 26.841 23.1577 28.3327 24.9993 28.3327Z"
                  fill="#0063F7"
                />
                <path
                  d="M24.1662 15.6942C24.1662 14.626 23.7419 13.6016 22.9866 12.8463C22.2313 12.091 21.2069 11.6667 20.1387 11.6667H17.4979C16.4052 11.6649 15.3555 12.0927 14.5753 12.8577C13.795 13.6227 13.3466 14.6637 13.3269 15.7562C13.3071 16.8488 13.7174 17.9053 14.4695 18.6981C15.2215 19.4909 16.255 19.9564 17.347 19.9942L17.4995 20V21.6667C17.4995 21.6667 24.1662 20.6942 24.1662 15.6942ZM26.6662 14.3633C26.6662 13.2061 27.1259 12.0963 27.9442 11.278C28.7625 10.4597 29.8723 10 31.0295 10H35.8329C36.9379 10 37.9978 10.439 38.7792 11.2204C39.5606 12.0018 39.9995 13.0616 39.9995 14.1667C39.9995 15.2717 39.5606 16.3315 38.7792 17.1129C37.9978 17.8943 36.9379 18.3333 35.8329 18.3333H34.1662V20.8333C34.1662 20.8333 26.6662 19.78 26.6662 14.3633ZM25.8329 35.455C25.8329 32.935 30.552 31.6667 32.9162 31.6667C35.2804 31.6667 39.9995 32.9358 39.9995 35.4542V40H25.8329V35.455Z"
                  fill="#0063F7"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M27.7779 34.9858C27.5146 35.2458 27.4996 35.395 27.4996 35.455V38.3333H38.3329V35.4542C38.3329 35.3958 38.3179 35.2458 38.0546 34.9858C37.7763 34.7117 37.3171 34.4175 36.6879 34.1483C35.4213 33.6058 33.8746 33.3333 32.9163 33.3333C31.9579 33.3333 30.4104 33.6058 29.1446 34.1483C28.5154 34.4175 28.0563 34.7117 27.7779 34.9858ZM32.9163 31.6667C30.5521 31.6667 25.8329 32.9358 25.8329 35.4542V40H39.9996V35.4542C39.9996 32.9367 35.2804 31.6667 32.9163 31.6667ZM24.9996 33.7875C24.9996 32.39 23.4604 31.3767 21.6621 30.7517C22.7056 30.2583 23.8453 30.0016 24.9996 30C26.1539 30.0016 27.2936 30.2583 28.3371 30.7517C26.5388 31.3767 24.9996 32.39 24.9996 33.7875Z"
                  fill="#0063F7"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M24.9996 33.7875C24.9996 33.0433 25.4363 32.4075 26.1163 31.8817L26.2338 31.7942C26.8146 31.3725 27.5504 31.025 28.3371 30.7525C27.5566 30.3845 26.7211 30.1467 25.8638 30.0483C25.2895 29.9839 24.7098 29.9839 24.1354 30.0483C23.2782 30.1464 22.4427 30.384 21.6621 30.7517C22.4479 31.025 23.1846 31.3725 23.7646 31.7933C23.8046 31.8222 23.8438 31.8517 23.8821 31.8817C24.5629 32.4067 24.9996 33.0433 24.9996 33.7875Z"
                  fill="#0063F7"
                />
              </svg>

              <div>
                <h2 className="text-xl font-semibold text-[#1E1E1E]">
                  {model ? 'Edit Discussion Topic' : 'Add Discussion Topic'}
                </h2>
                <span className="mt-1 text-base font-normal text-[#616161]">
                  {model
                    ? 'Edit discussion topic details below.'
                    : 'Add discussion topic details below.'}
                </span>
              </div>
            </ModalHeader>
            <ModalBody className="my-4">
              <div className="flex h-[520px] flex-col gap-4 overflow-y-scroll px-4">
                <div className="mb-4 w-full">
                  <CustomSearchSelect
                    label="Category"
                    data={[
                      {
                        label: 'General Safety',
                        value: 'General Safety',
                      },
                      {
                        label: 'Hazard & Incident',
                        value: 'Hazard & Incident',
                      },
                      {
                        label: 'Training & Education',
                        value: 'Training & Education',
                      },
                      {
                        label: 'Behavior',
                        value: 'Behavior',
                      },
                      {
                        label: 'Environmental',
                        value: 'Environmental',
                      },
                    ]}
                    onSelect={(value: string | any[], item: any) => {
                      if (typeof value === 'string') {
                        organizationForm.setFieldValue('category', value);
                      }
                    }}
                    searchPlaceholder="Search Category"
                    returnSingleValueWithLabel={true}
                    showSearch={false}
                    selected={[organizationForm.values.category]}
                    hasError={false}
                    isRequired={true}
                    showImage={false}
                    multiple={false}
                    isOpen={openDropdown === 'dropdown1'}
                    onToggle={() => handleToggle('dropdown1')}
                  />
                </div>
                <div className="relative">
                  <CustomSearchSelect
                    label="Assign to Project"
                    data={(projects ?? []).flatMap((proj) => {
                      return [
                        {
                          label: `${proj.name}`,
                          value: proj._id,
                        },
                      ];
                    })}
                    onSelect={(selected) => {
                      // Ensure 'selected' is an array
                      organizationForm.setFieldValue('projects', selected);
                    }}
                    selected={organizationForm.values.projects ?? []}
                    isRequired
                    searchPlaceholder="Search Current Project"
                    hasError={organizationForm.errors.projects}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown2'}
                    onToggle={() => handleToggle('dropdown2')}
                  />
                  {(organizationForm.values.projects ?? []).length == 0 &&
                    organizationForm.touched.projects && (
                      <span className="text-xs text-red-500">{`At least one project is required`}</span>
                    )}
                </div>
                <div className="my-4">
                  <SimpleInput
                    label="Topic Title"
                    type="text"
                    placeholder="Enter a descriptive title"
                    name="title"
                    className="w-full"
                    required
                    errorMessage={organizationForm.errors.title}
                    value={organizationForm.values.title}
                    isTouched={organizationForm.touched.title}
                    onChange={organizationForm.handleChange}
                    bottomPadding={false}
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-2 block" htmlFor="description">
                    Description (optional)
                  </label>
                  <textarea
                    rows={8}
                    id="description"
                    name="description"
                    placeholder="Give this equipment a clear description of what it does and how to use it."
                    value={organizationForm.values.description}
                    className={` ${
                      organizationForm.errors.description &&
                      organizationForm.touched.description
                        ? 'border-red-500'
                        : 'border-[#EEEEEE]'
                    } w-full resize-none rounded-xl border-2 border-gray-300 p-2 shadow-sm`}
                    onChange={organizationForm.handleChange}
                  />
                </div>
                <Select_SM_Images
                  onRemoveUploadedImage={(fileUrl) => {
                    setUploadedImages((currentImages) =>
                      currentImages.filter((image) => image !== fileUrl)
                    );
                  }}
                  stagedUploads={stagedUploads}
                  uploadedImages={uploadedImages}
                />
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-center gap-12 border-t-2 border-gray-200">
              <Button variant="primaryOutLine" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={!organizationForm.isValid}
                onClick={() => {
                  organizationForm.submitForm();
                }}
              >
                {model ? (
                  <>{updateMutation.isLoading ? 'Updating...' : 'Update'}</>
                ) : (
                  <> {createMutation.isLoading ? 'Creating...' : 'Add'} </>
                )}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CreateDiscussionModal;
