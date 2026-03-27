import { useFormik } from 'formik';
import { BottomButton } from './BottomButton';

import { WithSidebar } from './WithSideBar';
import * as Yup from 'yup';
import { SimpleInput } from '@/components/Form/simpleInput';
import { JSAAPPACTIONTYPE } from '@/app/helpers/user/enums';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { useMemo, useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';

import Loader from '@/components/DottedLoader/loader';
import { Button } from '@/components/Buttons';

import { CreatenewManagerForm } from './CreateNewManageForm';
import { SelectManagerAndSuperVisorList } from './Select_Manager_AND_Supervisor';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { getAllOrgUsers } from '@/app/(main)/(user-panel)/user/apps/api';
import { useQuery } from 'react-query';
import DateRangePicker from './JSA_Calender';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { getCustomersList } from '@/app/(main)/(user-panel)/user/apps/am/api';
import CustomModal from '@/components/Custom_Modal';

export function JSADetails({
  uploadPendingImages,
}: {
  uploadPendingImages?: () => Promise<string[]>;
}) {
  ////////////
  const [showModel, setShowModel] = useState(false);
  const [showNewCreateModel, setShowNewCreateModel] = useState(false);
  const [selectedUser, setSelectedUser] = useState<
    { firstName: string; lastName: string; phone: string; email: string }[]
  >([]);
  const handleShowCreate = () => setShowNewCreateModel(!showNewCreateModel);
  const context = useJSAAppsCotnext();
  const [query, setQuery] = useState('');
  const axiosAuth = useAxiosAuth();
  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: 'listofUsersForManagers',
    queryFn: () => getAllOrgUsers(axiosAuth),
  });

  const organizationFormValidator = Yup.object({
    reference: Yup.string().optional().nullable(),
    jsaName: Yup.string().required('Required '),
    description: Yup.string().required('Required'),
    customer: Yup.string().required('Required'),
    contactName: Yup.string().required('Required'),
    phone: Yup.string()
      .required('Required')
      .test(
        'phone-format',
        'Phone can only contain digits, spaces, parentheses, +, -, and letters',
        (value) => {
          if (value == null || value === '') return true;
          return /^[\d\s()\-+a-zA-Z]*$/.test(value);
        }
      ),
  });
  const organizationForm = useFormik({
    initialValues: {
      customer: context.state.jsaCreateDetailPayload?.customer ?? '',
      reference: context.state.jsaCreateDetailPayload?.reference ?? '',
      jsaName: context.state.jsaCreateDetailPayload?.jsaName ?? '',
      description: context.state.jsaCreateDetailPayload?.description ?? '',
      phone: context.state.jsaCreateDetailPayload?.phone ?? '',
      contactName: context.state.jsaCreateDetailPayload?.contactName ?? '',
    },
    validationSchema: organizationFormValidator,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  const handleSubmit = (values: {
    reference?: string;
    customer?: string;
    jsaName?: string;
    description?: string;
    phone?: string;
    contactName?: string;
  }) => {
    // Validate before proceeding
    // if (!values.jsaName || !values.description || !values.customer || !values.contactName || !values.phone) {
    //   organizationForm.setTouched({
    //     jsaName: true,
    //     description: true,
    //     customer: true,

    //   });
    //   return;
    // }

    context.dispatch({
      type: JSAAPPACTIONTYPE.JSA_CREATE_DETAIL,
      jsaCreateDetailPayload: {
        customer: values.customer ?? '',
        reference: values.reference ?? '',
        jsaName: values.jsaName ?? '',
        description: values.description ?? '',
        contactName: values.contactName ?? '',
        phone: values.phone ?? '',
      },
    });

    // Move to next step if validation passes
    context.dispatch({
      type: JSAAPPACTIONTYPE.CREATENEWSECTION,
      createNewSection: 'step',
    });
  };

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: 'customers',
    queryFn: () => getCustomersList(axiosAuth),
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };
  const hasManagersSelected =
    (context.state.jsaDetailSelectedManagers ?? []).length > 0;
  const isDetailsStepValid = useMemo(() => {
    return (
      !!organizationForm.values.customer?.trim() &&
      !!organizationForm.values.jsaName?.trim() &&
      !!organizationForm.values.description?.trim() &&
      !!organizationForm.values.contactName?.trim() &&
      !!organizationForm.values.phone?.trim() &&
      hasManagersSelected &&
      Object.keys(organizationForm.errors ?? {}).length === 0
    );
  }, [
    organizationForm.values.customer,
    organizationForm.values.jsaName,
    organizationForm.values.description,
    organizationForm.values.contactName,
    organizationForm.values.phone,
    organizationForm.errors,
    hasManagersSelected,
  ]);

  return (
    <>
      <WithSidebar>
        <div className="h-full w-11/12 overflow-auto scrollbar-hide lg:w-[83%]">
          <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
            {/* form top  */}
            <div className="mb-4 flex justify-between px-4 pt-5">
              <div className="flex flex-col">
                <h2 className="mb-1 text-xl font-semibold">JSA Details</h2>
                <p className="text-xs font-normal text-[#616161] md:text-sm">
                  You must fill this section out to save it.
                  {/* Please note a project must be assigned to select a Manager / Supervisor. */}
                </p>
              </div>
            </div>

            <div className="p-4">
              {/* form second part  */}
              <form onSubmit={organizationForm.handleSubmit}>
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                  <div className="w-full min-w-0">
                    <CustomSearchSelect
                      label="Select Customer"
                      data={[
                        {
                          label: 'My Organization',
                          value: 'My Organization',
                        },
                        ...(users ?? [])
                          .filter((c) => c.role == 4)
                          .flatMap((user) => {
                            return [
                              {
                                label: `${user.customerName ?? `${user.firstName} ${user.lastName}`} - ${user.userId}`,
                                value: `${user.customerName ?? `${user.firstName} ${user.lastName}`}`,
                                photo: user.photo,
                              },
                            ];
                          }),
                      ]}
                      onSelect={(values, item) => {
                        if (typeof values == 'string') {
                          organizationForm.setFieldValue('customer', values);
                        }
                      }}
                      selected={[organizationForm.values.customer]}
                      returnSingleValueWithLabel={true}
                      showImage={true}
                      multiple={false}
                      isRequired={true}
                      hasError={organizationForm.errors.customer}
                      isOpen={openDropdown === 'dropdown2'}
                      onToggle={() => handleToggle('dropdown2')}
                    />
                  </div>

                  {/* ////// */}
                  <SimpleInput
                    type="text"
                    label="Reference"
                    placeholder="Enter a reference here"
                    name="reference"
                    className="w-full"
                    errorMessage={organizationForm.errors.reference}
                    value={organizationForm.values.reference}
                    isTouched={organizationForm.touched.reference}
                    onChange={organizationForm.handleChange}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                  <SimpleInput
                    type="text"
                    label="JSA Name"
                    placeholder="Give it a unique identifiable title"
                    name="jsaName"
                    className="w-full"
                    required={true}
                    errorMessage={organizationForm.errors.jsaName}
                    value={organizationForm.values.jsaName}
                    isTouched={organizationForm.touched.jsaName}
                    onChange={organizationForm.handleChange}
                  />
                  <div className="relative">
                    <DateRangePicker
                      title="Date Range of Activities"
                      handleOnConfirm={(from: Date, to: Date) => {
                        context.dispatch({
                          type: JSAAPPACTIONTYPE.JSA_DETAIL_DATE,
                          jsaDetailDate: { from: from, to: to },
                        });
                      }}
                      selectedDate={context.state.jsaDetailDate}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="mb-2 block" htmlFor="description">
                    Scope of works taking place{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required={true}
                    rows={3}
                    id="description"
                    name="description"
                    placeholder="Describe activities and outcomes taking place"
                    className={` ${
                      organizationForm.errors.description &&
                      organizationForm.touched.description
                        ? 'border-red-500'
                        : 'border-[#EEEEEE]'
                    } w-full resize-none rounded-xl border-2 border-gray-300 p-2 shadow-sm`}
                    onChange={organizationForm.handleChange}
                    value={organizationForm.values.description}
                  />
                  {organizationForm.errors.description &&
                    organizationForm.touched.description && (
                      <span className="text-xs text-red-500">
                        {organizationForm.errors.description}
                      </span>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <SimpleInput
                    type="text"
                    label="Contact Name"
                    placeholder="Enter Contact Name"
                    name="contactName"
                    className="w-full"
                    required
                    errorMessage={organizationForm.errors.contactName}
                    value={organizationForm.values.contactName}
                    isTouched={organizationForm.touched.contactName}
                    onChange={organizationForm.handleChange}
                  />
                  <SimpleInput
                    type="text"
                    label="Phone Number"
                    placeholder="Enter Phone Number"
                    name="phone"
                    className="w-full"
                    required
                    errorMessage={organizationForm.errors.phone}
                    value={organizationForm.values.phone}
                    isTouched={organizationForm.touched.phone}
                    onChange={organizationForm.handleChange}
                  />
                  {/* <div className="mx-auto mt-6 max-w-md">
                    <label
                      htmlFor="phone"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      placeholder="+61 400 123 456, EXT 123, or 0800-CALLNOW"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      pattern="[A-Za-z0-9\s\+\-]*"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Alphanumeric values and spaces allowed (e.g., +61 400 123
                      456, EXT 123)
                    </p>
                  </div> */}
                </div>
                <div className="mb-5 flex flex-col sm:w-full lg:w-1/2">
                  <div className="mb-3 flex items-center gap-2 pr-10">
                    <label className="block font-light" htmlFor="description">
                      Managers & Supervisors
                    </label>
                    <div className="font-light text-gray-500">{`Max 3`}</div>
                  </div>
                  {!hasManagersSelected && (
                    <span className="text-xs text-red-500">
                      {'Add At least one manager'}
                    </span>
                  )}
                  {(context.state.jsaDetailSelectedManagers ?? []).map(
                    (user, index) => {
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-1"
                        >
                          <div
                            style={{
                              boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.1)',
                            }}
                            className="mt-1.5 flex h-12 w-full items-center truncate rounded-lg border border-gray-300 px-4"
                          >
                            <div className="font-Open-Sans text-xs font-normal md:text-base">
                              {`${user.firstName} ${user.lastName}`}
                            </div>

                            <div className="font-Open-Sans text-xs font-normal md:text-sm">
                              {` - ${user.email}`}
                            </div>
                          </div>
                          <div
                            className="cursor-pointer"
                            onClick={() => {
                              context.dispatch({
                                type: JSAAPPACTIONTYPE.TOGGLE_JSA_CREATE_DETAIL_MANAGER_SELECTION,
                                jsaDetailSelectedManagers: user,
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
                        </div>
                      );
                    }
                  )}

                  {(context.state.jsaDetailSelectedManagers ?? []).length <
                    3 && (
                    <div
                      className="ml-5 mt-5 cursor-pointer text-primary-500"
                      onClick={() => setShowModel(!showModel)}
                    >
                      {`+ Add`}
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </WithSidebar>
      <div className="h-16">
        <BottomButton
          uploadPendingImages={uploadPendingImages}
          isDisabled={!isDetailsStepValid}
          onCancel={() => {
            context.dispatch({
              type: JSAAPPACTIONTYPE.CREATENEWSECTION,
              createNewSection: 'project',
            });
          }}
          onSavAs={() => {}}
          onNextClick={() => {
            organizationForm.setTouched({
              jsaName: true,
              description: true,
              customer: true,
              contactName: true,
              phone: true,
              reference: true,
            });
            organizationForm.submitForm();
          }}
        />
      </div>
      {/* ///// add Supervisor */}
      <Modal
        isOpen={showModel}
        onOpenChange={() => setShowModel(!showModel)}
        size="xl"
        placement={`auto`}
      >
        <ModalContent className="max-w-[500px] overflow-auto rounded-3xl bg-white">
          {(onCloseModal) => (
            <>
              <ModalHeader className="w-full border-b-2 border-gray-200 px-5 py-5">
                <div className="flex w-full flex-row items-start justify-between">
                  <div className="flex flex-row items-start gap-3">
                    <img
                      src="/svg/jsa/select_manager_supervisor.svg"
                      alt="select_manager_supervisor"
                      className="h-12 w-12"
                    />

                    <div>
                      <h2 className="text-lg font-semibold">
                        Select Manager & Supervisors
                      </h2>
                      <p className="mt-1 text-xs font-normal text-[#616161]">
                        You can select up to 3 people assigned to this project.
                      </p>
                    </div>
                  </div>
                  <img
                    src="/svg/close.svg"
                    alt="close"
                    className="h-4 w-4 cursor-pointer"
                    onClick={onCloseModal}
                  />
                </div>
              </ModalHeader>
              <ModalBody>
                {showNewCreateModel ? (
                  <CreatenewManagerForm
                    handleShowCreate={handleShowCreate}
                    onAdded={(user) => {
                      context.dispatch({
                        type: JSAAPPACTIONTYPE.TOGGLE_JSA_CREATE_DETAIL_MANAGER_SELECTION,
                        jsaDetailSelectedManagers: user,
                      });
                    }}
                  />
                ) : (
                  <SelectManagerAndSuperVisorList
                    handleShowCreate={handleShowCreate}
                    data={(data ?? [])
                      .filter((user) => user.role !== 4 && user.role !== 5)
                      .map((user) => {
                        return {
                          firstName: user.firstName,
                          lastName: user.lastName,
                          phone: '',
                          email: user.email,
                        };
                      })}
                  />
                )}
              </ModalBody>
              {!showNewCreateModel && (
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
    </>
  );
}
