import {
  getAllAppProjects,
  getAllOrgUsers,
} from '@/app/(main)/(user-panel)/user/apps/api';

import { Search } from '@/components/Form/search';
import { SimpleInput } from '@/components/Form/simpleInput';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import useAxiosAuth from '@/hooks/AxiosAuth';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import * as Yup from 'yup';

import { useState } from 'react';

import { useMutation, useQuery, useQueryClient } from 'react-query';

import { Button } from '@/components/Buttons';
import { useFormik } from 'formik';
import { SAFETYHUBTYPE } from '@/app/helpers/user/enums';
import { useSafetyHubContext } from '@/app/(main)/(user-panel)/user/apps/sh/sh_context';
import SelectHazardImages from './Select_image_section';
import Loader from '@/components/DottedLoader/loader';
import {
  createLiveBoard,
  updateLiveBoard,
} from '@/app/(main)/(user-panel)/user/apps/sh/api';
import { uploadImageToApp } from '@/components/apps/shared/appImageUpload';
import { useStagedImageUploads } from '@/components/apps/shared/useStagedImageUploads';

const CreateSHHazards = ({
  handleCloseIfEdit,
}: {
  handleCloseIfEdit?: () => void;
}) => {
  const [signInAs, setSignInAs] = useState<'incident' | 'hazard'>('hazard');

  const [isOpen, setIsOpen] = useState(false);

  const handleOpenToggle = () => {
    setIsOpen(!isOpen);
  };

  const { state, dispatch } = useSafetyHubContext();
  const axiosAuth = useAxiosAuth();
  const stagedUploads = useStagedImageUploads({
    existingCount: state.selectedImages?.length ?? 0,
    maxFiles: 5,
  });
  const queryClient = useQueryClient();
  const { data: projects, isLoading: projectLoading } = useQuery({
    queryKey: 'listOfAppProjects',
    queryFn: () => getAllAppProjects(axiosAuth),
  });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const appFormValidatorSchema = Yup.object().shape({
    projects: Yup.array().required('Project is required'),
    title: Yup.string().required('Title is required'),
  });
  const createMutation = useMutation(createLiveBoard, {
    onSuccess: () => {
      dispatch({ type: SAFETYHUBTYPE.SHOW_HAZARD_INCIDENT_CREATE_MODEL });
      queryClient.invalidateQueries('liveBoards');
    },
  });
  const updateMutation = useMutation(updateLiveBoard, {
    onSuccess: () => {
      if (handleCloseIfEdit) {
        handleCloseIfEdit();
      }
      dispatch({ type: SAFETYHUBTYPE.SHOW_HAZARD_INCIDENT_CREATE_MODEL });
      queryClient.invalidateQueries('liveBoards');
    },
  });
  const organizationForm = useFormik({
    initialValues: {
      projects:
        (state.hazardAndIncidentModelForEdit?.projects ?? []).map(
          (p) => p._id
        ) ?? [],
      description: state.hazardAndIncidentModelForEdit?.description ?? '',
      address: state.hazardAndIncidentModelForEdit?.address ?? '',
      title: state.hazardAndIncidentModelForEdit?.title ?? '',
      addToTopicDisscussion:
        state.hazardAndIncidentModelForEdit?.isAddedTopicClose ?? false,
    },

    validationSchema: appFormValidatorSchema,
    onSubmit: async (values) => {
      let stagedImageUrls: string[] = [];

      try {
        stagedImageUrls = await stagedUploads.uploadPending<string>({
          onUploaded: async (fileUrl) => {
            dispatch({
              type: SAFETYHUBTYPE.SELECTED_IMAGES,
              selectedImages: fileUrl,
            });
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

      const data = {
        ...values,
        isHazardOrIncident: signInAs,
        images: [...(state.selectedImages ?? []), ...stagedImageUrls],
      };
      if (state.hazardAndIncidentModelForEdit) {
        updateMutation.mutate({
          axiosAuth,
          data,
          id: state.hazardAndIncidentModelForEdit._id,
        });
      } else {
        createMutation.mutate({ axiosAuth, data });
      }
    },
  });

  const { data: users, isLoading: userLoading } = useQuery({
    queryKey: 'listofUsersForManagers',
    queryFn: () => getAllOrgUsers(axiosAuth),
  });

  return (
    <Modal
      isOpen={true}
      onOpenChange={() => {
        dispatch({ type: SAFETYHUBTYPE.SHOW_HAZARD_INCIDENT_CREATE_MODEL });
      }}
      placement="top-center"
      size="xl"
      className="absolute h-[700px]"
    >
      <ModalContent className="max-w-[600px] rounded-3xl bg-white">
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-row items-start gap-2 border-b-1 px-5 py-2">
              <div className="flex w-full flex-row items-start gap-4 py-2">
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                  <g clipPath="url(#clip0_3018_3103)">
                    <path
                      d="M24.9397 11.0362C23.1537 11.0264 21.4815 12.3323 20.2796 14.6781C20.2752 14.6867 20.2693 14.6934 20.2649 14.7019L12.5232 28.1475L12.5104 28.1676C11.084 30.411 10.7838 32.5263 11.6682 34.0799C12.5518 35.6326 14.5174 36.4311 17.1467 36.3011H32.6795C35.3096 36.4316 37.2759 35.6329 38.1598 34.08C39.0439 32.5267 38.7431 30.4123 37.3175 28.1694L37.3046 28.1474L29.6453 14.746C29.6418 14.739 29.6381 14.7328 29.6344 14.7258C28.407 12.3667 26.7267 11.046 24.9396 11.0362H24.9397ZM24.9432 12.1403C25.7387 12.1479 26.4932 12.5464 27.1771 13.2151C27.8572 13.88 28.4987 14.8237 29.1345 16.0478C29.1382 16.0549 29.1418 16.0609 29.1455 16.068L35.8967 27.8783C35.8986 27.8814 35.9001 27.8843 35.9021 27.8875L35.9094 27.9003C36.6664 29.0883 37.163 30.1304 37.3908 31.0625C37.6199 32.0006 37.5703 32.8583 37.1655 33.5473C36.7607 34.2364 36.0392 34.6918 35.1276 34.9481C34.2227 35.2024 33.1056 35.2795 31.7639 35.2117H18.064C16.6082 35.2854 15.4431 35.193 14.5246 34.9114C13.6 34.6278 12.9028 34.1234 12.5489 33.4062C12.1949 32.6892 12.2054 31.836 12.461 30.9197C12.7148 30.0094 13.2118 29.0091 13.9185 27.9003L13.9314 27.8783L20.7556 16.0313C20.7603 16.0221 20.7656 16.0149 20.7703 16.0056C21.3971 14.78 22.0305 13.8399 22.7075 13.1822C23.3897 12.5197 24.1478 12.1327 24.9432 12.1404L24.9432 12.1403ZM27.7356 15.7786L26.0639 28.9055H23.6121L21.9788 16.0606C21.894 16.215 21.8116 16.3707 21.7315 16.5276L21.7261 16.5404L21.7188 16.5531L14.8669 28.4459L14.8615 28.4569L14.8541 28.4678C14.1766 29.5281 13.7265 30.4586 13.5156 31.2144C13.3048 31.9702 13.3335 32.5223 13.5303 32.921C13.7271 33.3196 14.1118 33.6405 14.8469 33.8658C15.5818 34.0911 16.644 34.1908 18.0347 34.1185L18.0493 34.1166H31.7786L31.7933 34.1184C33.0735 34.1851 34.0965 34.102 34.8328 33.8951C35.5691 33.6881 35.9943 33.3779 36.2207 32.9924C36.4472 32.6068 36.5124 32.0815 36.327 31.3225C36.1414 30.5632 35.6981 29.6013 34.9738 28.4678L34.9664 28.4568L34.9591 28.444L28.1822 16.5916L28.1768 16.5824L28.1731 16.5714C28.0266 16.2885 27.8807 16.025 27.7354 15.7785L27.7356 15.7786ZM23.5516 30.2037H26.1243V32.7763H23.5516V30.2037Z"
                      fill="#0063F7"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_3018_3103">
                      <rect
                        width="30"
                        height="30"
                        fill="white"
                        transform="translate(10 9)"
                      />
                    </clipPath>
                  </defs>
                </svg>

                <div>
                  <h1>
                    {state.hazardAndIncidentModelForEdit ? 'Edit' : 'Add'}{' '}
                    Hazard & Incident
                  </h1>
                  <span className="text-base font-normal text-[#616161]">
                    {state.hazardAndIncidentModelForEdit ? 'Edit' : 'Add'}{' '}
                    Hazard & Incident details below.
                  </span>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="my-0 overflow-y-scroll pb-32 pt-4 scrollbar-hide">
              <div className="w-full px-6">
                <div className="flex h-full flex-col gap-6 overflow-y-scroll scrollbar-hide">
                  {/* form part here  */}
                  {!state.hazardAndIncidentModelForEdit && (
                    <div className="flex flex-col gap-2">
                      <span>
                        Hazard or Incident?{' '}
                        <span className="text-red-500">*</span>
                      </span>

                      <div className="flex">
                        {/* myself */}
                        <div className="flex w-[150px] flex-col gap-2">
                          <div
                            className="relative h-32 w-32 cursor-pointer items-center rounded-lg border-1 border-blue-100 bg-[#FECD94] p-4 shadow-sm shadow-blue-gray-50"
                            onClick={() => {
                              setSignInAs('hazard');
                            }}
                          >
                            <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                              <span
                                className={`${
                                  signInAs === 'hazard'
                                    ? 'text-black'
                                    : 'text-[#616161]'
                                }`}
                              >
                                Hazard
                              </span>
                              <svg
                                width="50"
                                height="50"
                                viewBox="0 0 50 50"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M24.8994 3.39365C21.9228 3.37734 19.1357 5.5538 17.1326 9.46357C17.1253 9.47783 17.1154 9.48896 17.1082 9.50322L4.20537 31.9125L4.18388 31.946C1.80664 35.685 1.30634 39.2105 2.78027 41.7999C4.25293 44.3876 7.529 45.7185 11.9111 45.5019H37.7991C42.1826 45.7193 45.4598 44.3882 46.9329 41.8C48.4065 39.2111 47.9052 35.6872 45.5291 31.949L45.5076 31.9124L32.7422 9.57665C32.7363 9.56493 32.7301 9.55468 32.724 9.54306C30.6783 5.61113 27.8777 3.40995 24.8993 3.39365H24.8994ZM24.9053 5.23388C26.2311 5.24658 27.4886 5.91064 28.6285 7.02519C29.7619 8.13329 30.8311 9.70615 31.8908 11.7463C31.897 11.7582 31.903 11.7682 31.9092 11.78L43.1611 31.4639C43.1644 31.469 43.1668 31.4738 43.1701 31.4791L43.1823 31.5006C44.444 33.4805 45.2717 35.2174 45.6513 36.7708C46.0331 38.3343 45.9504 39.7638 45.2758 40.9122C44.6012 42.0606 43.3986 42.8197 41.8793 43.2468C40.3711 43.6706 38.5094 43.7991 36.273 43.6862H13.4399C11.0137 43.8091 9.07177 43.655 7.54101 43.1857C6 42.7131 4.83789 41.8723 4.24804 40.6769C3.6582 39.4819 3.67558 38.0601 4.10156 36.5328C4.5247 35.0157 5.35302 33.3484 6.53076 31.5006L6.55224 31.4638L17.926 11.7188C17.9338 11.7035 17.9426 11.6915 17.9504 11.6761C18.9951 9.63329 20.0508 8.0665 21.1792 6.9704C22.3161 5.8662 23.5796 5.22109 24.9054 5.23408L24.9053 5.23388ZM29.5593 11.2976L26.7731 33.1758H22.6868L19.9646 11.7677C19.8233 12.025 19.6859 12.2845 19.5525 12.546L19.5435 12.5673L19.5312 12.5886L8.11152 32.4099L8.10244 32.4281L8.09013 32.4464C6.96093 34.2136 6.21074 35.7644 5.85937 37.024C5.508 38.2837 5.55586 39.2039 5.88379 39.8683C6.21172 40.5326 6.85302 41.0675 8.07812 41.443C9.30293 41.8185 11.0732 41.9847 13.3911 41.8642L13.4155 41.861H36.2977L36.3221 41.864C38.4559 41.9751 40.1607 41.8366 41.388 41.4919C42.6151 41.1469 43.3237 40.6299 43.7012 39.9873C44.0786 39.3447 44.1873 38.4692 43.8782 37.2041C43.569 35.9387 42.8302 34.3355 41.6229 32.4463L41.6106 32.4279L41.5984 32.4066L30.3037 12.6527L30.2946 12.6373L30.2884 12.619C30.0442 12.1476 29.8011 11.7083 29.5589 11.2976L29.5593 11.2976ZM22.5859 35.3394H26.8737V39.6271H22.5859V35.3394Z"
                                  fill="#1E1E1E"
                                />
                              </svg>
                            </div>
                            {signInAs === 'hazard' && (
                              <div className="absolute bottom-2 right-2">
                                <CheckComponent />
                              </div>
                            )}
                          </div>
                          <span className="px-1 text-xs text-[#616161]">
                            Potential for damage or injury
                          </span>
                        </div>

                        {/* guest */}
                        <div className="flex w-[150px] flex-col gap-2">
                          <div
                            className="relative flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg bg-[#FFA8A8] p-4 shadow-sm shadow-pink-50"
                            onClick={() => {
                              setSignInAs('incident');
                            }}
                          >
                            <div className="flex flex-1 flex-col items-center justify-center gap-2">
                              <span
                                className={`${
                                  signInAs === 'incident'
                                    ? 'text-black'
                                    : 'text-[#616161]'
                                }`}
                              >
                                Incident
                              </span>
                              <svg
                                width="50"
                                height="50"
                                viewBox="0 0 50 50"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M45.5416 26.0002L39.8958 16.6668C39.5322 16.0371 39.0102 15.5135 38.3816 15.148C37.7529 14.7825 37.0396 14.5879 36.3125 14.5835H31.25V10.4168C31.25 9.8643 31.0305 9.33439 30.6398 8.94369C30.2491 8.55299 29.7192 8.3335 29.1666 8.3335H8.33329C7.22822 8.3335 6.16842 8.77248 5.38701 9.55388C4.60561 10.3353 4.16663 11.3951 4.16663 12.5002V33.3335C4.16738 34.0642 4.36026 34.7818 4.72592 35.4144C5.09158 36.047 5.61717 36.5723 6.24996 36.9377C6.17537 38.8715 6.87206 40.7558 8.18677 42.176C9.50147 43.5962 11.3265 44.436 13.2604 44.5106C15.1942 44.5852 17.0785 43.8885 18.4987 42.5738C19.9189 41.2591 20.7587 39.434 20.8333 37.5002H27.2916C27.522 39.2433 28.378 40.8433 29.7002 42.0023C31.0225 43.1613 32.7208 43.8002 34.4791 43.8002C36.2374 43.8002 37.9358 43.1613 39.258 42.0023C40.5803 40.8433 41.4363 39.2433 41.6666 37.5002C42.7717 37.5002 43.8315 37.0612 44.6129 36.2798C45.3943 35.4984 45.8333 34.4386 45.8333 33.3335V27.0835C45.83 26.7034 45.7296 26.3305 45.5416 26.0002ZM13.5416 39.5835C12.9236 39.5835 12.3194 39.4002 11.8055 39.0568C11.2916 38.7135 10.891 38.2254 10.6545 37.6544C10.418 37.0834 10.3561 36.455 10.4767 35.8488C10.5973 35.2426 10.8949 34.6858 11.3319 34.2488C11.769 33.8117 12.3258 33.5141 12.932 33.3935C13.5382 33.273 14.1665 33.3349 14.7375 33.5714C15.3085 33.8079 15.7966 34.2084 16.14 34.7223C16.4833 35.2362 16.6666 35.8404 16.6666 36.4585C16.6666 37.2873 16.3374 38.0822 15.7513 38.6682C15.1653 39.2543 14.3704 39.5835 13.5416 39.5835ZM25 22.9168H20.8333V27.0835H16.6666V22.9168H12.5V18.7502H16.6666V14.5835H20.8333V18.7502H25V22.9168ZM34.375 39.5835C33.7569 39.5835 33.1527 39.4002 32.6388 39.0568C32.1249 38.7135 31.7244 38.2254 31.4878 37.6544C31.2513 37.0834 31.1894 36.455 31.31 35.8488C31.4306 35.2426 31.7282 34.6858 32.1653 34.2488C32.6023 33.8117 33.1591 33.5141 33.7653 33.3935C34.3715 33.273 34.9998 33.3349 35.5708 33.5714C36.1419 33.8079 36.6299 34.2084 36.9733 34.7223C37.3167 35.2362 37.5 35.8404 37.5 36.4585C37.5 37.2873 37.1707 38.0822 36.5847 38.6682C35.9986 39.2543 35.2038 39.5835 34.375 39.5835ZM31.25 25.0002V18.7502H36.3125L40.0625 25.0002H31.25Z"
                                  fill="black"
                                />
                              </svg>
                            </div>

                            {signInAs === 'incident' && (
                              <div className="absolute bottom-2 right-2">
                                <CheckComponent />
                              </div>
                            )}
                          </div>{' '}
                          <span className="px-1 text-xs text-[#616161]">
                            Has caused damage or injury
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
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
                      onSelect={(selectedUsers) => {
                        // Ensure 'selectedUsers' is an array
                        organizationForm.setFieldValue(
                          'projects',
                          Array.isArray(selectedUsers)
                            ? selectedUsers
                            : [selectedUsers]
                        );
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

                  {state.hazardAndIncidentModelForEdit && (
                    <div className="relative">
                      <CustomSearchSelect
                        label="Hazard or Incident?"
                        data={[
                          {
                            label: `Hazard`,
                            value: 'hazard',
                          },
                          {
                            label: `Incident`,
                            value: 'incident',
                          },
                        ]}
                        onSelect={(selectedUsers) => {
                          if (typeof selectedUsers === 'string') {
                            if (selectedUsers === 'hazard') {
                              setSignInAs('hazard');
                            } else {
                              setSignInAs('incident');
                            }
                          }
                        }}
                        selected={[signInAs]}
                        returnSingleValueWithLabel={true}
                        searchPlaceholder="Select One"
                        showSearch={false}
                        // hasError={signInAs}
                        multiple={false}
                        showImage={false}
                        isRequired
                        isOpen={openDropdown === 'dropdown3'}
                        onToggle={() => handleToggle('dropdown3')}
                      />
                    </div>
                  )}
                  <SimpleInput
                    label="Hazards & Incident Title"
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
                  <div className="flex items-end justify-center gap-2">
                    <SimpleInput
                      label="Location (optional)"
                      type="text"
                      placeholder="Enter the address or location"
                      name="address"
                      className="w-full"
                      errorMessage={organizationForm.errors.address}
                      value={organizationForm.values.address}
                      isTouched={organizationForm.touched.address}
                      onChange={organizationForm.handleChange}
                      bottomPadding={false}
                    />
                    {/* <div className="flex h-[50px] w-[60px] cursor-pointer items-center justify-center rounded-md bg-[#E0E0E0]">
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 26 26"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M0.5 13C0.5 13.4812 0.89 13.8725 1.3725 13.8725H3.7375C3.94091 16.0289 4.8902 18.0467 6.42175 19.5783C7.95329 21.1098 9.97114 22.0591 12.1275 22.2625V24.6275C12.1275 24.8589 12.2194 25.0808 12.383 25.2445C12.5467 25.4081 12.7686 25.5 13 25.5C13.2314 25.5 13.4533 25.4081 13.617 25.2445C13.7806 25.0808 13.8725 24.8589 13.8725 24.6275V22.2625C16.0289 22.0591 18.0467 21.1098 19.5783 19.5783C21.1098 18.0467 22.0591 16.0289 22.2625 13.8725H24.6275C24.8589 13.8725 25.0808 13.7806 25.2445 13.617C25.4081 13.4533 25.5 13.2314 25.5 13C25.5 12.7686 25.4081 12.5467 25.2445 12.383C25.0808 12.2194 24.8589 12.1275 24.6275 12.1275H22.2625C22.0591 9.97114 21.1098 7.95329 19.5783 6.42175C18.0467 4.8902 16.0289 3.94091 13.8725 3.7375V1.3725C13.8725 1.1411 13.7806 0.919175 13.617 0.755549C13.4533 0.591924 13.2314 0.5 13 0.5C12.7686 0.5 12.5467 0.591924 12.383 0.755549C12.2194 0.919175 12.1275 1.1411 12.1275 1.3725V3.7375C9.97114 3.94091 7.95329 4.8902 6.42175 6.42175C4.8902 7.95329 3.94091 9.97114 3.7375 12.1275H1.3725C1.1411 12.1275 0.919175 12.2194 0.755549 12.383C0.591924 12.5467 0.5 12.7686 0.5 13ZM8.64 13C8.64 11.8437 9.09936 10.7347 9.91701 9.91701C10.7347 9.09936 11.8437 8.64 13 8.64C14.1563 8.64 15.2653 9.09936 16.083 9.91701C16.9006 10.7347 17.36 11.8437 17.36 13C17.36 14.1563 16.9006 15.2653 16.083 16.083C15.2653 16.9006 14.1563 17.36 13 17.36C11.8437 17.36 10.7347 16.9006 9.91701 16.083C9.09936 15.2653 8.64 14.1563 8.64 13Z"
                          fill="#616161"
                        />
                      </svg>
                    </div> */}
                  </div>
                  <div className="">
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
                  <SelectHazardImages stagedUploads={stagedUploads} />
                  <div
                    className="relative flex items-center justify-start gap-2"
                    onClick={() => {
                      organizationForm.setFieldValue(
                        'addToTopicDisscussion',
                        !organizationForm.values.addToTopicDisscussion
                      );
                    }}
                  >
                    <div className="relative flex cursor-pointer items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        name="addToTopicDisscussion"
                        checked={organizationForm.values.addToTopicDisscussion}
                        onChange={organizationForm.handleChange}
                        readOnly
                        id="some_id"
                        className="peer h-6 w-6 appearance-none rounded-md border-2 border-[#9E9E9E] bg-white checked:border-[#9E9E9E] checked:bg-white"
                      />
                      <svg
                        className="absolute inset-0 m-auto hidden h-4 w-4 text-[#9E9E9E] peer-checked:block"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <label
                      className="block cursor-pointer"
                      htmlFor="addToTopicDisscussion"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {" Add to 'Topic Discussion'"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {"Used for 'Safety Meetings'"}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-center gap-8 border-t-2 border-gray-200 bg-white">
              <>
                <Button
                  variant="primaryOutLine"
                  onClick={() => {
                    dispatch({
                      type: SAFETYHUBTYPE.SHOW_HAZARD_INCIDENT_CREATE_MODEL,
                    });
                  }}
                >
                  {'Cancel'}
                </Button>
                <Button
                  variant="primary"
                  disabled={!organizationForm.isValid}
                  onClick={() => {
                    organizationForm.submitForm();
                  }}
                >
                  {createMutation.isLoading || updateMutation.isLoading ? (
                    <>
                      <Loader />
                    </>
                  ) : (
                    <>{state.hazardAndIncidentModelForEdit ? 'Save' : 'Add'}</>
                  )}
                </Button>
              </>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CreateSHHazards;

function CheckComponent() {
  return (
    <div className="absolute bottom-0 right-0">
      <svg
        width="25"
        height="25"
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_1_50793)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 12.5C0 9.18479 1.31696 6.00537 3.66117 3.66117C6.00537 1.31696 9.18479 0 12.5 0C15.8152 0 18.9946 1.31696 21.3388 3.66117C23.683 6.00537 25 9.18479 25 12.5C25 15.8152 23.683 18.9946 21.3388 21.3388C18.9946 23.683 15.8152 25 12.5 25C9.18479 25 6.00537 23.683 3.66117 21.3388C1.31696 18.9946 0 15.8152 0 12.5ZM11.7867 17.85L18.9833 8.85333L17.6833 7.81333L11.5467 15.4817L7.2 11.86L6.13333 13.14L11.7867 17.85Z"
            fill="#0063F7"
          />
        </g>
        <defs>
          <clipPath id="clip0_1_50793">
            <rect width="25" height="25" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
