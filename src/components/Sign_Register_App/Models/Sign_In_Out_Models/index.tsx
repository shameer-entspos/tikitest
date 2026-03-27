import {
  getAllAppProjects,
  getAllOrgUsers,
} from '@/app/(main)/(user-panel)/user/apps/api';

import { Search } from '@/components/Form/search';
import { SimpleInput } from '@/components/Form/simpleInput';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import useAxiosAuth from '@/hooks/AxiosAuth';
import CustomModal from '@/components/Custom_Modal';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import CameraPageSR from './Camera_Section_SR';
import SignInQRScanner from './Sign_In_QR_Scanner';

import { useSRAppCotnext } from '@/app/(main)/(user-panel)/user/apps/sr/sr_context';
import {
  getAllSitesByProjectId,
  getSiteDetail,
  listOfSiteSignIn,
  signInSR,
} from '@/app/(main)/(user-panel)/user/apps/sr/api';
import { SignInRegisterSubmission } from '@/app/type/Sign_Register_Submission';
import ShowSRDetail from '../SR_Detail';
import { Button } from '@/components/Buttons';
import { useSession } from 'next-auth/react';
import CustomHr from '@/components/Ui/CustomHr';
import { useStagedImageUploads } from '@/components/apps/shared/useStagedImageUploads';

const SignInModel = ({ handleClose }: { handleClose: () => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: session } = useSession();
  const [signInAs, setSignInAs] = useState<'myself' | 'guest'>('myself');
  const [selectedProject, setProjectId] = useState('');
  const [selectedSite, setSiteId] = useState('');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('Recent');
  const [selectedSection, setSection] = useState<
    'project' | 'site' | 'details' | 'selfie' | 'sumbitted'
  >('project');
  const handleOpenToggle = () => {
    setIsOpen(!isOpen);
  };

  const visitorTypes = [
    { id: 1, name: 'Customer' },
    { id: 2, name: 'Supplier' },
    { id: 3, name: 'Employee' },
    { id: 4, name: 'Contractor' },
    { id: 5, name: 'Courier / Delivery Person' },
    { id: 6, name: 'Family member' },
    { id: 7, name: 'Friend' },
  ];

  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
  };
  const { state } = useSRAppCotnext();
  const axiosAuth = useAxiosAuth();
  const selfieUploads = useStagedImageUploads({
    accept: 'image/*',
    maxFiles: 1,
    multiple: false,
  });
  const selectedSelfie = selfieUploads.items[0]?.file ?? null;
  const { data: projects, isLoading: projectLoading } = useQuery({
    queryKey: 'allUserAssignedProjects',
    queryFn: () => getAllAppProjects(axiosAuth),
  });
  const sessionUser = session?.user?.user as any;
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const appFormValidatorSchema = Yup.object().shape({
    // Users is optional
    users: Yup.array().optional(),

    // Visitor Type validation
    visitorType: Yup.array()
      .min(1, 'At least one type must be selected')
      .required('At least one type must be selected'),

    // Reason validation - optional
    reasone: Yup.string().optional(),

    // First Name validation
    firstName: Yup.string().required('First Name is required'),

    // Last Name validation
    lastName: Yup.string().required('Last Name is required'),

    // Email validation
    email: Yup.string()
      .email('Invalid email format')
      .required('Email Address is required'),

    // Phone validation (string so session/input values pass; backend accepts contact as string)
    phone: Yup.string(),
  });

  const organizationForm = useFormik({
    initialValues: {
      users: [], // Initialize with empty array
      visitorType: '',
      reasone: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },

    validationSchema: appFormValidatorSchema,
    onSubmit: async (values) => {
      // Duplicate sign-in: only for "Myself" – Guest sign-ins allowed (unique email)
      if (signInAs === 'myself' && userId && selectedSite) {
        try {
          const siteSignIns = await listOfSiteSignIn({
            axiosAuth,
            siteId: selectedSite,
          });
          const alreadySignedIn = (siteSignIns ?? []).some(
            (entry) =>
              (entry.submittedBy as any)?._id === userId &&
              entry.signOutAt == null
          );
          if (alreadySignedIn) {
            setShowAlreadySignedInModal(true);
            return;
          }
        } catch {
          // proceed on error (e.g. network)
        }
      }

      const data = new FormData();
      data.append('project', selectedProject);
      data.append('site', selectedSite);
      data.append('userType', signInAs === 'myself' ? '1' : '2');
      data.append('visitorType', values.visitorType);
      data.append('reason', values.reasone);
      data.append('firstName', values.firstName);
      data.append('lastName', values.lastName);
      data.append('contact', values.phone?.toString().trim() || '-');
      data.append('email', values.email);
      if (state.sr_app_id) {
        data.append('appId', state.sr_app_id);
      }
      (values.users ?? []).forEach((user) => {
        data.append('toSee[]', user);
      });

      setFormData(data);
      setSection('selfie');
    },
  });
  const { setFieldValue, validateForm } = organizationForm;

  useEffect(() => {
    if (signInAs === 'myself') {
      if (sessionUser) {
        setFieldValue('firstName', sessionUser.firstName ?? '');
        setFieldValue('lastName', sessionUser.lastName ?? '');
        setFieldValue('email', sessionUser.email ?? '');
        setFieldValue(
          'phone',
          sessionUser.phone != null ? String(sessionUser.phone) : ''
        );
      }
      // Re-validate after setting values so Next button enables (disabled inputs don't trigger validation)
      const t = setTimeout(() => {
        validateForm();
      }, 0);
      return () => clearTimeout(t);
    } else {
      setFieldValue('firstName', '');
      setFieldValue('lastName', '');
      setFieldValue('email', '');
      setFieldValue('phone', '');
    }
  }, [signInAs, sessionUser, setFieldValue, validateForm]);

  const { data: users, isLoading: userLoading } = useQuery({
    queryKey: 'listofUsersForManagers',
    queryFn: () => getAllOrgUsers(axiosAuth),
  });
  const [details, setDetails] = useState<
    SignInRegisterSubmission | undefined
  >();
  const [showAlreadySignedInModal, setShowAlreadySignedInModal] =
    useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const userId = (session?.user?.user as any)?._id;
  const createMutation = useMutation(signInSR, {
    onSuccess: (res) => {
      console.log(res);
      setDetails(res.signin as SignInRegisterSubmission);

      setSection('sumbitted');
    },
  });

  const handleSubmitForm = () => {
    if (formData) {
      // Create a new FormData if it exists, and append the image
      const updatedFormData = formData; // Retrieve the current FormData from state

      // Append the image to the existing FormData
      if (selectedSelfie) {
        updatedFormData.append('file', selectedSelfie);
      }

      // Update the formData in state with the new image
      setFormData(updatedFormData);

      if (formData) {
        createMutation.mutate({
          axiosAuth,
          data: formData,
        });
      }
    }
  };

  const signInModalHeader = (
    <div className="flex w-full flex-row items-start gap-4 py-2">
      <svg
        width="50"
        height="50"
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
        <g clipPath="url(#clip0_1_50713)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M22.5 9.48895C22.5001 9.35698 22.5315 9.22692 22.5917 9.10947C22.6519 8.99203 22.7392 8.89056 22.8463 8.81342C22.9533 8.73628 23.0772 8.68568 23.2077 8.66578C23.3381 8.64588 23.4715 8.65725 23.5967 8.69895L34.43 12.3098C34.596 12.3651 34.7404 12.4712 34.8427 12.6132C34.945 12.7551 35 12.9256 35 13.1006V36.8989C35 37.0739 34.945 37.2445 34.8427 37.3864C34.7404 37.5284 34.596 37.6345 34.43 37.6898L23.5967 41.3006C23.4715 41.3423 23.3381 41.3537 23.2077 41.3338C23.0772 41.3139 22.9533 41.2633 22.8463 41.1861C22.7392 41.109 22.6519 41.0075 22.5917 40.8901C22.5315 40.7727 22.5001 40.6426 22.5 40.5106V37.4998H15V11.6665H22.5V9.48895ZM27.5 24.1665C27.5 25.0873 27.1267 25.8331 26.6667 25.8331C26.2067 25.8331 25.8333 25.0873 25.8333 24.1665C25.8333 23.2456 26.2067 22.4998 26.6667 22.4998C27.1267 22.4998 27.5 23.2456 27.5 24.1665ZM22.5 13.3331H16.6667V35.8331H22.5V13.3331Z"
            fill="#0063F7"
          />
        </g>
        <defs>
          <clipPath id="clip0_1_50713">
            <rect
              width="40"
              height="40"
              fill="white"
              transform="translate(5 5)"
            />
          </clipPath>
        </defs>
      </svg>
      {selectedSection == 'project' ? (
        <div>
          <h1>Sign in - Select Project</h1>
          <span className="text-base font-normal text-[#616161]">
            Please select the project you are signing into.
          </span>
        </div>
      ) : selectedSection == 'site' ? (
        <div>
          <h1>Sign in - Select Site</h1>
          <span className="text-base font-normal text-[#616161]">
            Please select the site you are signing into.
          </span>
        </div>
      ) : selectedSection == 'details' ? (
        <div>
          <h1>Sign in - Details</h1>
          <span className="text-base font-normal text-[#616161]">
            Please select the site you are signing into.
          </span>
        </div>
      ) : selectedSection == 'selfie' ? (
        <div>
          <h1>Sign in - Take a selfie</h1>
          <span className="text-base font-normal text-[#616161]">
            This section may be required depending on the site.
          </span>
        </div>
      ) : (
        <div>
          <h1>Sign in Badge</h1>
          <span className="text-base font-normal text-[#616161]">
            view sign in details below.
          </span>
        </div>
      )}
    </div>
  );

  return (
    <>
      <CustomModal
        isOpen={selectedSection != 'sumbitted'}
        handleCancel={handleClose}
        header={signInModalHeader}
        body={
          <div className="my-0 h-[600px] overflow-y-scroll pt-4 scrollbar-hide">
            <div className="w-full">
              {selectedSection == 'project' ? (
                <>
                  <div className="flex items-center justify-start">
                    <div className="w-[300px]">
                      <Search
                        inputRounded={true}
                        type="search"
                        name="search"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="DropDownn relative z-50 mx-3 inline-block text-left">
                      <div>
                        <button
                          type="button"
                          className="inline-flex w-full items-center justify-center gap-1 rounded-md border border-gray-300 bg-[#E2F3FF] px-3 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-[#e1f0fa] focus:outline-none"
                          id="options-menu"
                          aria-expanded="true"
                          aria-haspopup="true"
                          onClick={handleOpenToggle}
                        >
                          {selected}
                          <svg
                            width="12"
                            height="13"
                            viewBox="0 0 12 13"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1.50029 3.00166H10.5003C10.5914 3.00194 10.6807 3.02707 10.7586 3.07435C10.8365 3.12162 10.9001 3.18924 10.9424 3.26993C10.9847 3.35063 11.0042 3.44134 10.9988 3.5323C10.9934 3.62326 10.9634 3.71103 10.9118 3.78616L6.41179 10.2862C6.22529 10.5557 5.77629 10.5557 5.58929 10.2862L1.08929 3.78616C1.0372 3.71118 1.00665 3.62337 1.00097 3.53226C0.995285 3.44115 1.01468 3.35022 1.05704 3.26935C1.09941 3.18849 1.16312 3.12078 1.24127 3.07358C1.31941 3.02639 1.409 3.00151 1.50029 3.00166Z"
                              fill="#1E1E1E"
                            />
                          </svg>
                        </button>
                      </div>

                      {isOpen && (
                        <div
                          className="absolute left-0 z-50 mt-2 w-56 origin-top-left rounded-md bg-[#E2F3FF] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby="options-menu"
                        >
                          <div className="py-1" role="none">
                            <button
                              onClick={() => handleSelect('Recent')}
                              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              role="menuitem"
                            >
                              Recent
                            </button>
                            <button
                              onClick={() => handleSelect('Started')}
                              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              role="menuitem"
                            >
                              Started
                            </button>
                            <button
                              onClick={() => handleSelect('All Assigned')}
                              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              role="menuitem"
                            >
                              All Assign
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="h-full overflow-y-scroll px-4 py-4 scrollbar-hide">
                    {(projects ?? []).map((item, index) => {
                      return (
                        <div
                          key={item._id}
                          className={`my-3 flex h-[50px] cursor-pointer items-center justify-between rounded-lg border border-gray-50 px-2 py-1`}
                          style={{
                            boxShadow: '0px 0px 4px rgba(0,0,0,0.2)',
                          }}
                          onClick={() => {
                            setProjectId(item._id!);
                            setSection('site');
                          }}
                        >
                          <span>{item.name}</span>
                          <svg
                            width="30"
                            height="30"
                            viewBox="0 0 30 30"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12.5 21.25L18.75 15L12.5 8.75"
                              stroke="#1E1E1E"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : // second section of sit here //
              selectedSection == 'site' ? (
                <SiteSection
                  setSection={setSection}
                  projectId={selectedProject}
                  setSiteId={setSiteId}
                />
              ) : selectedSection == 'details' ? (
                <div className="flex h-full flex-col gap-6 overflow-y-scroll scrollbar-hide">
                  <div className="flex flex-col gap-2">
                    <span>Who are you signing in?</span>

                    <div className="ml-1 flex gap-2">
                      {/* myself */}
                      <div
                        className="relative h-32 w-32 cursor-pointer items-center rounded-lg border-1 border-blue-100 bg-[#B9E0FF] p-4 shadow-sm shadow-blue-gray-50"
                        onClick={() => {
                          setSignInAs('myself');
                        }}
                      >
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                          <span
                            className={`${
                              signInAs === 'myself'
                                ? 'text-black'
                                : 'text-[#616161]'
                            }`}
                          >
                            Myself
                          </span>
                          <svg
                            width="50"
                            height="50"
                            viewBox="0 0 50 50"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M24.9974 4.16602C27.0576 4.16602 29.0716 4.77694 30.7846 5.92154C32.4976 7.06614 33.8327 8.693 34.6211 10.5964C35.4096 12.4998 35.6158 14.5942 35.2139 16.6149C34.812 18.6355 33.8199 20.4916 32.3631 21.9484C30.9063 23.4052 29.0502 24.3973 27.0296 24.7992C25.009 25.2011 22.9145 24.9948 21.0111 24.2064C19.1077 23.418 17.4809 22.0829 16.3363 20.3699C15.1917 18.6569 14.5807 16.6429 14.5807 14.5827L14.5911 14.1306C14.7076 11.4488 15.8549 8.91555 17.7937 7.05906C19.7325 5.20256 22.3131 4.16617 24.9974 4.16602ZM29.1641 29.166C31.9267 29.166 34.5763 30.2635 36.5298 32.217C38.4833 34.1705 39.5807 36.82 39.5807 39.5827V41.666C39.5807 42.7711 39.1417 43.8309 38.3603 44.6123C37.5789 45.3937 36.5191 45.8327 35.4141 45.8327H14.5807C13.4757 45.8327 12.4159 45.3937 11.6345 44.6123C10.853 43.8309 10.4141 42.7711 10.4141 41.666V39.5827C10.4141 36.82 11.5115 34.1705 13.465 32.217C15.4185 30.2635 18.0681 29.166 20.8307 29.166H29.1641Z"
                              fill={`${
                                signInAs === 'myself' ? 'black' : '#616161'
                              }`}
                            />
                          </svg>
                        </div>
                        {signInAs === 'myself' && (
                          <div className="absolute bottom-2 right-2">
                            <CheckComponent />
                          </div>
                        )}
                      </div>

                      {/* guest */}
                      <div
                        className="relative flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg bg-[#E2A6FF] p-4 shadow-sm shadow-pink-50"
                        onClick={() => {
                          setSignInAs('guest');
                        }}
                      >
                        <div className="flex flex-1 flex-col items-center justify-center gap-2">
                          <span
                            className={`${
                              signInAs === 'guest'
                                ? 'text-black'
                                : 'text-[#616161]'
                            }`}
                          >
                            Guest
                          </span>
                          <svg
                            width="50"
                            height="50"
                            viewBox="0 0 50 50"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M24.9974 4.16602C27.0576 4.16602 29.0716 4.77694 30.7846 5.92154C32.4976 7.06614 33.8327 8.693 34.6211 10.5964C35.4096 12.4998 35.6158 14.5942 35.2139 16.6149C34.812 18.6355 33.8199 20.4916 32.3631 21.9484C30.9063 23.4052 29.0502 24.3973 27.0296 24.7992C25.009 25.2011 22.9145 24.9948 21.0111 24.2064C19.1077 23.418 17.4809 22.0829 16.3363 20.3699C15.1917 18.6569 14.5807 16.6429 14.5807 14.5827L14.5911 14.1306C14.7076 11.4488 15.8549 8.91555 17.7937 7.05906C19.7325 5.20256 22.3131 4.16617 24.9974 4.16602ZM29.1641 29.166C31.9267 29.166 34.5763 30.2635 36.5298 32.217C38.4833 34.1705 39.5807 36.82 39.5807 39.5827V41.666C39.5807 42.7711 39.1417 43.8309 38.3603 44.6123C37.5789 45.3937 36.5191 45.8327 35.4141 45.8327H14.5807C13.4757 45.8327 12.4159 45.3937 11.6345 44.6123C10.853 43.8309 10.4141 42.7711 10.4141 41.666V39.5827C10.4141 36.82 11.5115 34.1705 13.465 32.217C15.4185 30.2635 18.0681 29.166 20.8307 29.166H29.1641Z"
                              fill={`${
                                signInAs === 'guest' ? 'black' : '#616161'
                              }`}
                            />
                          </svg>
                        </div>

                        {signInAs === 'guest' && (
                          <div className="absolute bottom-2 right-2">
                            <CheckComponent />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* form part here  */}
                  <div className="relative">
                    <CustomSearchSelect
                      label="Visitor Type"
                      data={(visitorTypes ?? []).flatMap((visitor) => {
                        return [
                          {
                            label: `${visitor.name}`,
                            value: visitor.id,
                          },
                        ];
                      })}
                      onSelect={(selectedUsers) => {
                        // Ensure 'selectedUsers' is an array
                        organizationForm.setFieldValue(
                          'visitorType',
                          Array.isArray(selectedUsers)
                            ? selectedUsers
                            : [selectedUsers]
                        );
                      }}
                      selected={
                        organizationForm.values.visitorType
                          ? Array.isArray(organizationForm.values.visitorType)
                            ? organizationForm.values.visitorType
                            : [organizationForm.values.visitorType]
                          : []
                      }
                      // hasError={organizationForm.errors.visitorType}
                      multiple={false}
                      isOpen={openDropdown === 'dropdown1'}
                      onToggle={() => handleToggle('dropdown1')}
                    />
                  </div>
                  <div className="relative">
                    <CustomSearchSelect
                      label="Who are you here to see?"
                      data={(() => {
                        // Find the selected project
                        const selectedProjectData = (projects ?? []).find(
                          (p) => p._id === selectedProject
                        );

                        // Filter users based on project
                        let filteredUsers = users ?? [];

                        if (selectedProjectData) {
                          if (
                            selectedProjectData.isGeneral ||
                            selectedProjectData.projectType === 'public'
                          ) {
                            // If project is general or public, show all users where role is not 4 and not 5
                            filteredUsers = (users ?? []).filter(
                              (user) => user.role !== 4 && user.role !== 5
                            );
                          } else {
                            // If project is not general and not public, show only users that are members of the project
                            const projectUserIds = (
                              selectedProjectData.users ?? []
                            ).map((userElement) => userElement.user._id);

                            filteredUsers = (users ?? []).filter((user) =>
                              projectUserIds.includes(user._id)
                            );
                          }
                        }

                        return filteredUsers.flatMap((user) => {
                          return [
                            {
                              label: `${user.firstName} ${user.lastName}`,
                              value: user._id,
                              photo: user.photo,
                            },
                          ];
                        });
                      })()}
                      onSelect={(selectedUsers) => {
                        // Ensure 'selectedUsers' is an array
                        organizationForm.setFieldValue(
                          'users',
                          Array.isArray(selectedUsers)
                            ? selectedUsers
                            : [selectedUsers]
                        );
                      }}
                      selected={organizationForm.values.users ?? []}
                      // hasError={organizationForm.errors.users}
                      multiple={true}
                      isOpen={openDropdown === 'dropdown2'}
                      onToggle={() => handleToggle('dropdown2')}
                    />
                  </div>
                  <div className="">
                    <label className="mb-2 block" htmlFor="reasone">
                      Reason for visit
                    </label>
                    <textarea
                      rows={6}
                      id="reasone"
                      name="reasone"
                      placeholder="Describe relevant emergency reasones"
                      value={organizationForm.values.reasone}
                      className={` ${
                        organizationForm.errors.reasone &&
                        organizationForm.touched.reasone
                          ? 'border-red-500'
                          : 'border-[#EEEEEE]'
                      } w-full resize-none rounded-xl border-2 border-gray-300 p-2 shadow-sm`}
                      onChange={organizationForm.handleChange}
                    />
                    {organizationForm.errors.reasone &&
                      organizationForm.touched.reasone && (
                        <span className="text-xs text-red-500">
                          {organizationForm.errors.reasone}
                        </span>
                      )}
                  </div>

                  <SimpleInput
                    label="First Name"
                    type="text"
                    placeholder="First name"
                    name="firstName"
                    className="w-full"
                    required
                    disabled={signInAs === 'myself'}
                    errorMessage={organizationForm.errors.firstName}
                    value={organizationForm.values.firstName}
                    isTouched={organizationForm.touched.firstName}
                    onChange={organizationForm.handleChange}
                    bottomPadding={false}
                  />
                  <SimpleInput
                    label="Last Name"
                    type="text"
                    placeholder="Last name"
                    name="lastName"
                    className="w-full"
                    required
                    disabled={signInAs === 'myself'}
                    errorMessage={organizationForm.errors.lastName}
                    value={organizationForm.values.lastName}
                    isTouched={organizationForm.touched.lastName}
                    onChange={organizationForm.handleChange}
                    bottomPadding={false}
                  />
                  <SimpleInput
                    label="Contact Phone"
                    type="text"
                    placeholder="Contact phone"
                    name="phone"
                    className="w-full"
                    disabled={signInAs === 'myself'}
                    errorMessage={organizationForm.errors.phone}
                    value={organizationForm.values.phone}
                    isTouched={organizationForm.touched.phone}
                    onChange={organizationForm.handleChange}
                    bottomPadding={false}
                  />
                  <SimpleInput
                    label="Email Address"
                    type="text"
                    placeholder="Email address"
                    name="email"
                    className="w-full"
                    required
                    disabled={signInAs === 'myself'}
                    errorMessage={organizationForm.errors.email}
                    value={organizationForm.values.email}
                    isTouched={organizationForm.touched.email}
                    onChange={organizationForm.handleChange}
                    bottomPadding={false}
                  />
                </div>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                  <CameraPageSR
                    selfieUploads={selfieUploads}
                  />
                </div>
              )}
            </div>
          </div>
        }
        customCancelHandler={() => {
          if (selectedSection == 'project') {
            handleClose();
          } else if (selectedSection == 'site') {
            setSection('project');
          } else if (selectedSection == 'details') {
            setSection('site');
          } else if (selectedSection == 'selfie') {
            setSection('details');
          }
        }}
        cancelButton={selectedSection == 'project' ? 'Cancel' : 'Back'}
        handleSubmit={() => {
          if (selectedSection == 'details') {
            organizationForm.submitForm();
          } else if (selectedSection == 'selfie') {
            handleSubmitForm();
          } else {
            setShowQRScanner(true);
          }
        }}
        submitValue={
          createMutation.isLoading
            ? 'Submitting...'
            : selectedSection == 'details'
              ? 'Next'
              : selectedSection == 'selfie'
                ? selectedSelfie
                  ? 'Submit'
                  : 'Skip'
                : 'Scan QR'
        }
        submitDisabled={
          selectedSection === 'details' ? !organizationForm.isValid : false
        }
        isLoading={createMutation.isLoading}
        size="md"
        cancelvariant="primaryOutLine"
        variant="primary"
      />

      {showAlreadySignedInModal && (
        <CustomModal
          isOpen={true}
          handleCancel={() => setShowAlreadySignedInModal(false)}
          header={<span>Already signed in</span>}
          body={
            <p className="text-[#616161]">
              You are already signed in to this site.
            </p>
          }
          showFooterSubmit={false}
          cancelButton="OK"
          customCancelHandler={() => setShowAlreadySignedInModal(false)}
          handleSubmit={() => {}}
          submitValue=""
        />
      )}

      <SignInQRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onSiteScanned={async (siteId) => {
          try {
            const site = await getSiteDetail({ axiosAuth, id: siteId });
            const projectId = (site?.projects ?? [])[0]?._id;
            if (projectId) {
              setProjectId(projectId);
              setSiteId(siteId);
              setSection('details');
            }
          } catch {
            // ignore
          }
          setShowQRScanner(false);
        }}
      />

      {selectedSection == 'sumbitted' && (
        <ShowSRDetail details={details} handleClose={handleClose} />
      )}
    </>
  );
};

export default SignInModel;

const SiteSection = ({
  setSection,
  projectId,
  setSiteId,
}: {
  setSection: any;
  projectId: string;
  setSiteId: any;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState('Recent');
  const [isOpen, setIsOpen] = useState(false);
  const handleOpenToggle = () => {
    setIsOpen(!isOpen);
  };
  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
  };
  const axiosAuth = useAxiosAuth();
  const { data: sites, isLoading } = useQuery({
    queryKey: `siteByProject${projectId}`,
    queryFn: () => getAllSitesByProjectId(axiosAuth, projectId),
  });

  return (
    <>
      <div className="flex items-center justify-start">
        <Search
          inputRounded={true}
          type="search"
          className="rounded-md bg-[#eeeeee] placeholder:text-[#616161]"
          name="search"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="DropDownn relative z-50 mx-3 inline-block text-left">
          <div>
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-1 rounded-md border border-gray-300 bg-[#E2F3FF] px-3 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-[#e1f0fa] focus:outline-none"
              id="options-menu"
              aria-expanded="true"
              aria-haspopup="true"
              onClick={handleOpenToggle}
            >
              {selected}
              <svg
                width="12"
                height="13"
                viewBox="0 0 12 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.50029 3.00166H10.5003C10.5914 3.00194 10.6807 3.02707 10.7586 3.07435C10.8365 3.12162 10.9001 3.18924 10.9424 3.26993C10.9847 3.35063 11.0042 3.44134 10.9988 3.5323C10.9934 3.62326 10.9634 3.71103 10.9118 3.78616L6.41179 10.2862C6.22529 10.5557 5.77629 10.5557 5.58929 10.2862L1.08929 3.78616C1.0372 3.71118 1.00665 3.62337 1.00097 3.53226C0.995285 3.44115 1.01468 3.35022 1.05704 3.26935C1.09941 3.18849 1.16312 3.12078 1.24127 3.07358C1.31941 3.02639 1.409 3.00151 1.50029 3.00166Z"
                  fill="#1E1E1E"
                />
              </svg>
            </button>
          </div>

          {isOpen && (
            <div
              className="absolute left-0 z-50 mt-2 w-56 origin-top-left rounded-md bg-[#E2F3FF] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              <div className="py-1" role="none">
                <button
                  onClick={() => handleSelect('Recent')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  Recent
                </button>
                <button
                  onClick={() => handleSelect('Address A-Z')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  Address A-Z
                </button>
                <button
                  onClick={() => handleSelect('Address Z-A')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  Address Z-A
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="h-full overflow-y-scroll px-1 py-4 scrollbar-hide">
        {sites?.length == 0 && <div> No sites! </div>}
        {(sites ?? []).map((item, index) => {
          return (
            <div
              key={item._id}
              className={`my-2 flex cursor-pointer items-center justify-between rounded-md border border-gray-50 px-3 py-2 shadow-small`}
              onClick={() => {
                setSection('details');
                setSiteId(item._id);
              }}
            >
              <div className="flex items-start justify-start gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.799 5.165L17.424 3.335C17.2626 3.23143 17.0871 3.15161 16.903 3.098C16.7197 3.03817 16.5287 3.00517 16.336 3H9.5L10.301 8H16.336C16.5 8 16.705 7.963 16.902 7.902C17.099 7.841 17.289 7.757 17.423 7.666L19.798 5.834C19.933 5.743 20 5.622 20 5.5C20 5.378 19.933 5.257 19.799 5.165ZM8.5 1H7.5C7.36739 1 7.24021 1.05268 7.14645 1.14645C7.05268 1.24021 7 1.36739 7 1.5V5H3.664C3.498 5 3.294 5.037 3.097 5.099C2.899 5.159 2.71 5.242 2.576 5.335L0.201 7.165C0.066 7.256 0 7.378 0 7.5C0 7.621 0.066 7.742 0.201 7.835L2.576 9.667C2.71 9.758 2.899 9.842 3.097 9.902C3.294 9.963 3.498 10 3.664 10H7V18.5C7 18.6326 7.05268 18.7598 7.14645 18.8536C7.24021 18.9473 7.36739 19 7.5 19H8.5C8.63261 19 8.75979 18.9473 8.85355 18.8536C8.94732 18.7598 9 18.6326 9 18.5V1.5C9 1.36739 8.94732 1.24021 8.85355 1.14645C8.75979 1.05268 8.63261 1 8.5 1Z"
                    fill="black"
                  />
                </svg>
                <div className="text-md flex flex-col font-semibold">
                  <span>{item.siteName}</span>
                  <span className="text-[#616161]">{item.addressLineOne}</span>
                </div>
              </div>

              <svg
                width="30"
                height="30"
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.5 21.25L18.75 15L12.5 8.75"
                  stroke="#1E1E1E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          );
        })}
      </div>
    </>
  );
};
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
