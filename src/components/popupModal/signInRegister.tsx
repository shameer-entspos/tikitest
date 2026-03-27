import React, { ChangeEvent, useEffect, useState } from 'react';
import { Button } from '../Buttons';
import { useAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/context';
import { APPACTIONTYPE } from '@/app/helpers/user/enums';
import { Search } from '../Form/search';
import { useSession } from 'next-auth/react';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Input } from '../Form/Input';
import {
  getAllAppProjects,
  getAllOrgUsers,
  signOutApp,
  submitApp,
} from '@/app/(main)/(user-panel)/user/apps/api';

import { useMutation, useQuery, useQueryClient } from 'react-query';
import Loader from '../DottedLoader/loader';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { ShowSingleAppSubmission } from './singleAppSubbmission';

import { CameraPage } from './cmera';

export default function SignInRegisterModal() {
  const axiosAuth = useAxiosAuth();
  const context = useAppsCotnext();
  const { data: session } = useSession();

  //////// Form Data
  const initialValues = {
    firstName:
      context.state.showForm == 'user'
        ? (session?.user.user.firstName ?? '')
        : context.state.payload?.firstName,
    lastName:
      context.state.showForm == 'user'
        ? (session?.user.user.lastName ?? '')
        : context.state.payload?.lastName,
    email:
      context.state.showForm == 'user'
        ? (session?.user.user.email ?? '')
        : context.state.payload?.email,
    phone: context.state.payload?.phone,
    reason: context.state.payload?.reason,
    company: context.state.payload?.company,
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('first name is required'),
    lastName: Yup.string().required('last name is required'),
    email: Yup.string().email().required('email is required'),
    phone: Yup.number().required('contact is required'),
    reason: Yup.string().required('Reason of visit is required'),
    company:
      context.state.formType == 'contractor'
        ? Yup.string().required('company is required')
        : Yup.string().optional(),
  });
  const queryClient = useQueryClient();

  const createSubmitAppMutation = useMutation(submitApp, {
    onSuccess: () => {
      queryClient.invalidateQueries('submission');
    },
  });
  const signOutAppMutation = useMutation(signOutApp, {
    onSuccess: () => {
      queryClient.invalidateQueries('signOutApp');
    },
  });

  const handleSubmit = async (_values: any) => {
    context.dispatch({
      type: APPACTIONTYPE.PAYLOAD,
      showForm: 'selfie',
      payload: {
        firstName: _values?.firstName,
        lastName: _values?.lastName,
        email: _values?.email,
        phone: _values?.phone,
        reason: _values?.reason,
        company: _values?.company,
      },
    });
  };

  const sumbitApp = () => {
    const formData = new FormData();
    (context.state.userId ?? []).forEach((userId) => {
      formData.append('users[]', userId);
    });

    (context.state.projectId ?? []).forEach((projectId) => {
      formData.append('projects[]', projectId);
    });
    // Add the values to the FormData object
    formData.append('firstName', context.state.payload?.firstName ?? '');
    formData.append('lastName', context.state.payload?.lastName ?? '');
    formData.append('email', context.state.payload?.email ?? '');
    formData.append('type', context.state.formType ?? 'visitor');
    formData.append('user_id', session?.user.user._id ?? '');
    formData.append('app_id', context.state.appModel?._id ?? '');
    formData.append('company', context.state.payload?.company ?? '');
    formData.append('formType', context.state.signAs ?? '');
    formData.append('reason', context.state.payload?.reason ?? '');
    formData.append('phone', context.state.payload?.phone ?? '');
    if (context.state.selectedSelfie) {
      formData.append('photo', context.state.selectedSelfie);
    }

    createSubmitAppMutation.mutate({
      data: formData,
      axiosAuth: axiosAuth,
    });
  };

  useEffect(() => {
    if (createSubmitAppMutation.isSuccess || signOutAppMutation.isSuccess) {
      context.dispatch({ type: APPACTIONTYPE.TOGGLE });
    }
  });

  const handlesignOutApp = () => {
    signOutAppMutation.mutate({
      data: {
        signOutBy: session?.user.user._id,
        users: context.state.signoutUsers,
      },
      axiosAuth: axiosAuth,
    });
  };

  /////////////////////////////////
  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div
          className="fixed inset-0 h-full w-full bg-black opacity-40"
          onClick={() =>
            context.dispatch({
              type: APPACTIONTYPE.TOGGLE,
            })
          }
        ></div>
        {/* backdrop overlayer */}
        <div className="mt-12 flex min-h-screen items-center px-0 py-5 md:mt-10 md:px-11">
          <div className="relative mx-auto min-h-[755px] w-[90%] rounded-md bg-white shadow-lg md:max-w-[600px]">
            <div className="px-11 py-5 shadow">
              <button
                className="absolute right-8 top-8 z-10"
                onClick={() =>
                  context.dispatch({
                    type: APPACTIONTYPE.TOGGLE,
                  })
                }
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.00005 8.3998L2.10005 13.2998C1.91672 13.4831 1.68338 13.5748 1.40005 13.5748C1.11672 13.5748 0.883382 13.4831 0.700048 13.2998C0.516715 13.1165 0.425049 12.8831 0.425049 12.5998C0.425049 12.3165 0.516715 12.0831 0.700048 11.8998L5.60005 6.9998L0.700048 2.0998C0.516715 1.91647 0.425049 1.68314 0.425049 1.3998C0.425049 1.11647 0.516715 0.883138 0.700048 0.699804C0.883382 0.516471 1.11672 0.424805 1.40005 0.424805C1.68338 0.424805 1.91672 0.516471 2.10005 0.699804L7.00005 5.5998L11.9 0.699804C12.0834 0.516471 12.3167 0.424805 12.6 0.424805C12.8834 0.424805 13.1167 0.516471 13.3 0.699804C13.4834 0.883138 13.575 1.11647 13.575 1.3998C13.575 1.68314 13.4834 1.91647 13.3 2.0998L8.40005 6.9998L13.3 11.8998C13.4834 12.0831 13.575 12.3165 13.575 12.5998C13.575 12.8831 13.4834 13.1165 13.3 13.2998C13.1167 13.4831 12.8834 13.5748 12.6 13.5748C12.3167 13.5748 12.0834 13.4831 11.9 13.2998L7.00005 8.3998Z"
                    fill="#616161"
                  />
                </svg>
              </button>
              <div className="relative flex w-full items-center rounded-lg bg-white">
                <div className="absolute right-3 top-3 z-10 text-right text-primary-500"></div>
                <div className="inline-flex h-20 w-20 min-w-[80px] items-center justify-center rounded-xl bg-[#AD96EC] px-3 pb-5 pt-[19px] shadow">
                  <div className="text-center text-xl font-semibold text-black">
                    {context.state.appModel?.name.substring(0, 1)}
                  </div>
                </div>
                <div className="ml-3 mr-24 w-full text-center text-xl font-semibold text-black">
                  {context.state.appModel?.name}
                </div>
              </div>
            </div>
            {/* show detail section  */}
            {context.state.showForm == 'singleAppSubmission' ? (
              <ShowSingleAppSubmission />
            ) : (
              // sign in as user section
              <>
                {context.state.showForm == 'user' ||
                context.state.showForm == 'guest' ? (
                  <div className="mt-5 px-5 py-5 md:px-11">
                    <div className="mb-3 text-base font-normal text-black">
                      Why are you here?
                    </div>
                    <div className="mb-7 flex">
                      <button
                        className={`${
                          context.state.formType == 'contractor'
                            ? 'text-black'
                            : 'bg-primary-500 text-white'
                        } mr-2 h-[37px] min-w-[103] rounded-full px-[15px] py-[6px] text-sm font-bold leading-[22px] md:h-[47px] md:min-w-[139px] md:px-[20px] md:py-[12px] md:text-base`}
                        onClick={() => {
                          context.dispatch({
                            type: APPACTIONTYPE.CHAGNEFORMTYPE,
                          });
                        }}
                      >
                        Visitor
                      </button>
                      <button
                        className={`${
                          context.state.formType == undefined
                            ? 'border-2 border-[#616161] text-[#616161]'
                            : 'bg-primary-500 text-white'
                        } h-[37px] min-w-[103] rounded-full px-[15px] py-[6px] text-sm font-bold leading-[22px] md:h-[47px] md:min-w-[139px] md:px-[20px] md:py-[12px] md:text-base`}
                        onClick={() => {
                          context.dispatch({
                            type: APPACTIONTYPE.CHAGNEFORMTYPE,
                            formType: 'contractor',
                          });
                        }}
                      >
                        Contractor
                      </button>
                    </div>

                    <Formik
                      initialValues={initialValues}
                      validationSchema={validationSchema}
                      onSubmit={handleSubmit}
                    >
                      {({ errors, touched, handleSubmit }) => (
                        <>
                          <Form onSubmit={handleSubmit}>
                            <Input
                              type="text"
                              label="First Name"
                              placeholder="Enter first name"
                              name="firstName"
                              errorMessage={errors.firstName}
                              isTouched={touched.firstName}
                            />
                            <Input
                              type="text"
                              label="Last Name"
                              placeholder="Enter last name"
                              name="lastName"
                              errorMessage={errors.lastName}
                              isTouched={touched.lastName}
                            />
                            <Input
                              type="phone"
                              label="Phone"
                              placeholder="Enter phone"
                              name="phone"
                              errorMessage={errors.phone}
                              isTouched={touched.phone}
                            />
                            <Input
                              type="email"
                              label="Email"
                              placeholder="Enter email address"
                              name="email"
                              errorMessage={errors.email}
                              isTouched={touched.email}
                            />
                            {context.state.formType == 'contractor' ? (
                              <Input
                                type="text"
                                label="Compnay / Organization"
                                placeholder="Enter company / organization"
                                name="company"
                                errorMessage={errors.company}
                                isTouched={touched.company}
                              />
                            ) : (
                              <></>
                            )}
                            <Input
                              type="text"
                              label="Reason of Visit *"
                              placeholder="Enter reason of visit"
                              name="reason"
                              errorMessage={errors.reason}
                              isTouched={touched.reason}
                            />

                            <div className="mb-10 flex justify-center gap-5">
                              <button
                                className="mt-[24px] h-[47px] w-[120px] rounded-lg border-3 border-[#0063F7] px-[20px] py-[8px] text-xs font-bold leading-[22px] text-[#0063F7] md:min-w-[188px] md:text-sm"
                                onClick={() => {
                                  context.dispatch({
                                    type: APPACTIONTYPE.CHANGESHOWMODEL,
                                  });
                                }}
                              >
                                Back
                              </button>
                              <button
                                className="mt-[24px] h-[47px] w-[120px] rounded-lg bg-[#0063F7] px-[10px] py-[8px] text-[12px] font-bold leading-[22px] text-white md:min-w-[188px] md:px-[20px] md:text-sm"
                                type="submit"
                              >
                                Next
                              </button>
                            </div>
                          </Form>
                        </>
                      )}
                    </Formik>
                    {/* Selfie section */}
                  </div>
                ) : (
                  <>
                    {context.state.showForm == 'selfie' ? (
                      <CameraPage />
                    ) : (
                      // select user section
                      <>
                        {context.state.showForm == 'selectuser' ? (
                          <div className="px-5 py-5 md:px-11">
                            <div className="text-v mt-4 pb-2 text-base font-normal">
                              Who are you here to see?
                            </div>
                            <SelectUser />
                            <div className="mb-10 mt-[60px] flex justify-center gap-5">
                              <button
                                className="mt-[24px] h-[47px] w-[120px] rounded-lg border-3 border-[#0063F7] px-[20px] py-[8px] text-xs font-bold leading-[22px] text-[#0063F7] md:min-w-[188px] md:text-sm"
                                onClick={() => {
                                  context.dispatch({
                                    type: APPACTIONTYPE.CHANGESHOWMODEL,
                                    showForm: 'projects',
                                  });
                                }}
                              >
                                Back
                              </button>
                              <button
                                className="mt-[24px] h-[47px] w-[120px] rounded-lg bg-[#0063F7] px-[10px] py-[8px] text-[12px] font-bold leading-[22px] text-white md:min-w-[188px] md:px-[20px] md:text-sm"
                                onClick={() => sumbitApp()}
                              >
                                {createSubmitAppMutation.isLoading ? (
                                  <Loader />
                                ) : (
                                  'Submit'
                                )}{' '}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* select project section */}
                            {context.state.showForm == 'projects' ? (
                              <AppProjectList />
                            ) : (
                              <>
                                {context.state.showForm == 'signout' ? (
                                  <>
                                    <div className="h-auto px-5 py-5 md:px-11">
                                      <div className="pb-2 text-base font-normal text-black">
                                        Select people to sign out
                                      </div>
                                      <SignOutSection />

                                      <div className="mb-8 mt-8 flex justify-center gap-5">
                                        <button
                                          className="mt-[24px] h-[47px] w-[120px] rounded-lg border-3 border-[#0063F7] px-[20px] py-[8px] text-xs font-bold leading-[22px] text-[#0063F7] md:min-w-[188px] md:text-sm"
                                          onClick={() => {
                                            context.dispatch({
                                              type: APPACTIONTYPE.CHANGESHOWMODEL,
                                            });
                                          }}
                                        >
                                          Back
                                        </button>
                                        <button
                                          className="mt-[24px] h-[47px] w-[120px] rounded-lg bg-[#0063F7] px-[10px] py-[8px] text-[12px] font-bold leading-[22px] text-white md:min-w-[188px] md:px-[20px] md:text-sm"
                                          onClick={() => handlesignOutApp()}
                                          disabled={
                                            (context.state.signoutUsers ?? [])
                                              ?.length === 0
                                              ? true
                                              : false
                                          }
                                        >
                                          {signOutAppMutation.isLoading ? (
                                            <Loader />
                                          ) : (
                                            'Signout'
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  </> // show model section
                                ) : (
                                  <div className="mt-16 px-0 py-5 md:px-11">
                                    <div className="mb-28 px-11 py-5">
                                      <div className="border-neutral-200 mt-8 border-b-2 bg-white pb-8 text-center">
                                        <button
                                          className="w-[200px] rounded-xl bg-[#0063F7] py-3 font-semibold text-white"
                                          onClick={() => {
                                            context.dispatch({
                                              type: APPACTIONTYPE.CHANGESHOWMODEL,
                                              showForm: 'user',
                                            }),
                                              context.dispatch({
                                                type: APPACTIONTYPE.SIGNAS,
                                                signAs: 'user',
                                              });
                                          }}
                                        >
                                          Sign in as User
                                        </button>
                                      </div>
                                      <div className="border-neutral-200 mt-6 border-b-2 bg-white pb-8 text-center">
                                        <button
                                          className="w-[200px] rounded-xl bg-[#6990FF] py-3 font-semibold text-white"
                                          onClick={() => {
                                            context.dispatch({
                                              type: APPACTIONTYPE.CHANGESHOWMODEL,
                                              showForm: 'guest',
                                              signAs: 'guest',
                                            }),
                                              context.dispatch({
                                                type: APPACTIONTYPE.SIGNAS,
                                                signAs: 'guest',
                                              });
                                          }}
                                        >
                                          Sign in as Guest
                                        </button>
                                      </div>

                                      <div className="mt-5 bg-white text-center">
                                        <button
                                          className="w-[200px] rounded-xl bg-[#E0E0E0] py-3 font-semibold text-black"
                                          onClick={() => {
                                            context.dispatch({
                                              type: APPACTIONTYPE.CHANGESHOWMODEL,
                                              showForm: 'signout',
                                            });
                                          }}
                                        >
                                          Sign out
                                        </button>
                                      </div>
                                    </div>

                                    <div className="mb-28 text-center">
                                      <div
                                        className="text-center text-base font-semibold text-blue-600 hover:text-blue-500"
                                        onClick={() => {
                                          context.dispatch({
                                            type: APPACTIONTYPE.CHANGESHOWMODEL,
                                            showForm: 'singleAppSubmission',
                                          });
                                        }}
                                      >
                                        View Submissions
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function SignOutSection() {
  const axiosAuth = useAxiosAuth();
  const context = useAppsCotnext();

  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: 'appSignOut',
    queryFn: () => getAllOrgUsers(axiosAuth),
  });
  const [searchStarred, setSearchStarred] = useState('');
  ///////////////////////////////////
  const isUserSelected = (Id: string) =>
    context.state.signoutUsers?.some((id) => id == Id);
  const handleUserSelect = (id: string) => {
    if (
      (context.state.signoutUsers ?? []).findIndex((user) => user === id) !== -1
    ) {
      context.dispatch({
        type: APPACTIONTYPE.DESELECT_SIGNOUT_USER,
        signoutUsers: id,
      });
    } else {
      context.dispatch({
        type: APPACTIONTYPE.SELECT_SIGNOUT_USER,
        signoutUsers: id,
      });
    }
  };
  if (isLoading) {
    return (
      <div className="flex h-52 items-center justify-center">
        <Loader />
      </div>
    );
  }
  if (isSuccess) {
    const filteredData =
      data.filter((e) =>
        `${e.firstName} ${e.lastName}`
          .toLowerCase()
          .includes(searchStarred.toLowerCase())
      ) ?? [];
    return (
      <>
        <div className="mb-2">
          <Search
            className="h-9 rounded-lg border border-[#505050ed] bg-[#FAFAFA] text-sm"
            type="text"
            name="search"
            inputRounded={true}
            value={searchStarred}
            onChange={(event) => {
              setSearchStarred(event.target.value);
            }}
            placeholder="e.g. Jessica"
          />
        </div>
        <div className="h-96 overflow-y-auto">
          {filteredData?.map((e) => {
            return (
              <div
                className="mt-2 flex items-center rounded-lg bg-gray-200 px-3 py-2"
                key={e._id}
              >
                <input
                  type="checkbox"
                  name="user"
                  checked={isUserSelected(e._id)}
                  onChange={(ee) => {
                    handleUserSelect(e._id);
                  }}
                  className="mr-2 h-4 w-4 rounded-none border-[#616161]"
                />
                <div className="font-Open-Sans text-sm text-[#616161]">
                  {`${e.firstName} ${e.lastName} (${e.email})`}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  }
  return <></>;
}

function SelectUser() {
  const axiosAuth = useAxiosAuth();
  const context = useAppsCotnext();
  const sessioin = useSession();
  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: 'listofUsers',
    queryFn: () => getAllOrgUsers(axiosAuth),
  });
  const [searchStarred, setSearchStarred] = useState('');
  ///////////////////////////////////
  const isUserSelected = (Id: string) =>
    context.state.userId?.some((id) => id == Id);
  const handleUserSelect = (id: string) => {
    if ((context.state.userId ?? []).findIndex((user) => user === id) !== -1) {
      context.dispatch({ type: APPACTIONTYPE.DESELECT_USER, userid: id });
    } else {
      context.dispatch({ type: APPACTIONTYPE.SELECT_USER, userid: id });
    }
  };
  ///////////////////////////////////////////////////////
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader />
      </div>
    );
  }
  if (isSuccess) {
    const filteredData =
      data.filter((e) =>
        `${e.firstName} ${e.lastName}`
          .toLowerCase()
          .includes(searchStarred.toLowerCase())
      ) ?? [];
    return (
      <>
        <div className="mb-2 mt-5">
          <Search
            className="h-9 rounded-lg border border-[#505050ed] bg-[#FAFAFA] text-sm"
            type="text"
            name="search"
            inputRounded={true}
            value={searchStarred}
            onChange={(event) => {
              setSearchStarred(event.target.value);
            }}
            placeholder="e.g. Jessica"
          />
        </div>
        <div className="mb-2 mt-5 h-[320px] overflow-y-auto scrollbar-hide">
          {filteredData?.map((e) => {
            return (
              <div
                className="mt-2 flex items-center rounded-lg bg-[#F5F5F5] px-3 py-2"
                key={e._id}
              >
                <input
                  type="checkbox"
                  name="user"
                  checked={isUserSelected(e._id)}
                  onChange={(ee) => {
                    handleUserSelect(e._id);
                  }}
                  className="mr-2 h-4 w-4 rounded-none border-[#616161]"
                />
                <div className="font-Open-Sans text-sm text-[#616161]">
                  {`${e.firstName} ${e.lastName} (${e.email})`}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  }
  return <></>;
}
// Project list
function AppProjectList() {
  const axiosAuth = useAxiosAuth();
  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: 'allUserAssignedProjects',
    queryFn: () => getAllAppProjects(axiosAuth),
  });
  const context = useAppsCotnext();
  const [searchStarred, setSearchStarred] = useState('');
  const [searchProjects, setAllProjects] = useState('');
  const isProjectSelected = (Id: string) =>
    context.state.projectId?.some((id) => id == Id);
  const handleProjectSelect = (projectId: string) => {
    if (
      (context.state.projectId ?? []).findIndex(
        (project) => project === projectId
      ) !== -1
    ) {
      context.dispatch({
        type: APPACTIONTYPE.DESELECT_PROJECT,
        projectId: projectId,
      });
    } else {
      context.dispatch({
        type: APPACTIONTYPE.SELECT_PROJECT,
        projectId: projectId,
      });
    }
  };
  if (isLoading) {
    return (
      <div className="flex h-52 items-center justify-center">
        <Loader />
      </div>
    );
  }
  if (isSuccess) {
    const filteredStarred =
      data.filter((e) =>
        `${e.name}`.toLowerCase().includes(searchStarred.toLowerCase())
      ) ?? [];
    const filteredAll =
      data.filter((e) =>
        e?.name.toLowerCase().includes(searchProjects.toLowerCase())
      ) ?? [];
    return (
      <div className="px-5 py-5 md:px-11">
        <div className="flex">
          <div className="w-1/3">
            <h1 className="text-center">
              <span
                className={`inline-block cursor-pointer text-xs font-semibold text-gray-900 md:text-base ${
                  context.state.showProject === undefined &&
                  'w-20 border-b-2 border-[#0063f7] font-extrabold md:w-28'
                } pb-2`}
                onClick={() =>
                  context.dispatch({
                    type: APPACTIONTYPE.SHOW_PROJECT,
                    showProject: undefined,
                  })
                }
              >
                Starred
              </span>
            </h1>
          </div>
          <div className="w-1/3">
            <h1 className="text-center">
              <span
                className={`inline-bloc cursor-pointer text-xs font-semibold md:text-base ${
                  context.state.showProject === 'assign' &&
                  'w-20 border-b-2 border-[#0063f7] font-extrabold md:w-28'
                } pb-2`}
                onClick={() =>
                  context.dispatch({
                    type: APPACTIONTYPE.SHOW_PROJECT,
                    showProject: 'assign',
                  })
                }
              >
                {' '}
                Assign to me
              </span>
            </h1>
          </div>
          <div className="w-1/3">
            <h1 className="text-center">
              <span
                className={`inline-block cursor-pointer text-xs font-semibold md:text-base ${
                  context.state.showProject === 'all' &&
                  'w-20 border-b-2 border-[#0063f7] font-extrabold md:w-28'
                } pb-2`}
                onClick={() =>
                  context.dispatch({
                    type: APPACTIONTYPE.SHOW_PROJECT,
                    showProject: 'all',
                  })
                }
              >
                All Projects
              </span>
            </h1>
          </div>
        </div>
        {/* starred */}
        {context.state.showProject === undefined && (
          <div className="overflow-y-scrol mt-[30px] h-96 max-h-96">
            <div className="mb-5 text-base font-normal text-black">
              Search projects you want to assign this submission to.
            </div>
            <div className="mb-3">
              <Search
                className="h-9 rounded-lg border border-[#505050ed] bg-[#FAFAFA] text-sm"
                key={'search'}
                inputRounded={true}
                type="text"
                name="search"
                onChange={(e) => setSearchStarred(e.target.value)}
                placeholder="Project Name or ID or Reference"
              />
            </div>
            <div className="max-h-48 overflow-y-auto scrollbar-hide">
              {filteredStarred.map((e) => {
                if (e.isStarred) {
                  return (
                    <div
                      className="mb-3 flex items-center justify-between rounded-lg bg-gray-100 p-3"
                      key={e._id}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isProjectSelected(e._id!.toString())}
                          onChange={(ee) => {
                            handleProjectSelect(e._id);
                          }}
                          className="mr-2 h-4 w-4 rounded-none border-[#636363]"
                        />
                        <div className="text-sm font-normal text-[#212121]">
                          {e.name}
                        </div>
                      </div>
                    </div>
                  );
                }
              })}{' '}
            </div>
          </div>
        )}
        {/* ///// assign to me */}
        {context.state.showProject === 'assign' && (
          <div className="overflow-y-scrol mt-[32px] h-96 max-h-96">
            <div className="mb-5 text-base font-normal text-black">
              Search projects you want to assign this submission to.
            </div>
            <div className="mb-3">
              <Search
                className="h-9 rounded-lg border border-[#505050ed] bg-[#FAFAFA] text-sm"
                key={'search'}
                inputRounded={true}
                type="text"
                name="search"
                placeholder="Search User"
              />
            </div>
            {
              // <div
              //   className="flex items-center justify-between bg-gray-100 p-3 mb-3 "
              // >
              //   <div className="flex items-center">
              //     <input
              //       type="checkbox"
              //       className="mr-2 w-4 h-4 rounded-none border-[#616161]"
              //     />
              //     <div className="text-sm text-[#212121] font-normal">
              //       sadf
              //     </div>
              //   </div>
              // </div>
            }
          </div>
        )}
        {/* all projects */}
        {context.state.showProject === 'all' && (
          <div className="mt-[30px] h-96 max-h-96">
            <div className="mb-5 text-base font-normal text-black">
              Search projects you want to assign this submission to.
            </div>
            <div className="mb-3">
              <Search
                className="h-9 rounded-lg border border-[#505050ed] bg-[#FAFAFA] text-sm"
                key={'search'}
                inputRounded={true}
                type="text"
                name="search"
                onChange={(e) => setAllProjects(e.target.value)}
                placeholder="Search User"
              />
            </div>
            <div className="max-h-48 overflow-y-scroll scrollbar-hide">
              {filteredAll.map((e) => {
                return (
                  <div
                    className="mb-3 flex items-center justify-between rounded-lg bg-gray-100 p-3"
                    key={e._id}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isProjectSelected(e._id!.toString())}
                        onChange={(ee) => {
                          handleProjectSelect(e._id);
                        }}
                        className="mr-2 h-4 w-4 rounded-none border-[#616161]"
                      />
                      <div className="text-sm font-normal text-[#212121]">
                        {e.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-10 mt-[58px] flex justify-center gap-5">
          <button
            className="mt-[24px] h-[47px] w-[120px] rounded-lg border-3 border-[#0063F7] px-[20px] py-[8px] text-xs font-bold leading-[22px] text-[#0063F7] md:min-w-[188px] md:text-sm"
            onClick={() => {
              context.dispatch({
                type: APPACTIONTYPE.CHANGESHOWMODEL,
                showForm: 'selfie',
              });
            }}
          >
            Back
          </button>
          <button
            className="mt-[24px] h-[47px] w-[120px] rounded-lg bg-[#0063F7] px-[10px] py-[8px] text-[12px] font-bold leading-[22px] text-white md:min-w-[188px] md:px-[20px] md:text-sm"
            onClick={() => {
              context.dispatch({
                type: APPACTIONTYPE.CHANGESHOWMODEL,
                showForm: 'selectuser',
              });
            }}
          >
            Next
          </button>
        </div>
      </div>
    );
  }
  return <></>;
}
