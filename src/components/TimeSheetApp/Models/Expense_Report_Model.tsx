import {
  getAllAppProjects,
  getAllOrgUsers,
} from '@/app/(main)/(user-panel)/user/apps/api';
import { getCustomersList } from '@/app/(main)/(user-panel)/user/apps/am/api';
import {
  createExpenseReport,
  createTimeSheetReport,
} from '@/app/(main)/(user-panel)/user/apps/timesheets/api';
import { useTimeSheetAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/timesheets/timesheet_context';
import { TIMESHEETTYPE } from '@/app/helpers/user/enums';
import Loader from '@/components/DottedLoader/loader';
import { SimpleInput } from '@/components/Form/simpleInput';
import DateRangePicker from '@/components/JobSafetyAnalysis/CreateNewComponents/JSA_Calender';
import useAxiosAuth from '@/hooks/AxiosAuth';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import { useFormik } from 'formik';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { CustomSearchSelect } from '../CommonComponents/Custom_Select/Custom_Search_Select';
import { Button } from '@/components/Buttons';

const ReportExportExpensesModel = () => {
  const usersData = [
    {
      label: 'All',
      value: 'all',
    },
    {
      label: 'Not Approved',
      value: 'not',
      // Replace with actual image URL
    },
    {
      label: 'Under Review',
      value: 'review',
    },
    {
      label: 'Approved',
      value: 'approved',
    },
  ];
  const { state, dispatch } = useTimeSheetAppsCotnext();

  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const createMutation = useMutation(createExpenseReport, {
    onSuccess: (response) => {
      dispatch({
        type: TIMESHEETTYPE.EXPENSE_REPORTS,
        expenseReports: response,
      });
      dispatch({ type: TIMESHEETTYPE.SHOWPAGES, showPages: 'report_expense' });
    },
  });
  const { data: users, isLoading: userLoading } = useQuery({
    queryKey: 'allOrgUsers',
    queryFn: () => getAllOrgUsers(axiosAuth),
  });
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: 'customers',
    queryFn: () => getCustomersList(axiosAuth),
  });
  const { data: projects, isLoading: projectLoading } = useQuery({
    queryKey: 'allUserAssignedProjects',
    queryFn: () => getAllAppProjects(axiosAuth),
  });
  const handleClose = () => {
    dispatch({ type: TIMESHEETTYPE.SHOWPAGES, showPages: 'report' });
  };
  const appFormValidator = (values: any) => {
    const errors: any = {};

    // // Reference validation
    // if (!values.reference) {
    //     errors.reference = 'Reference is required';
    // }

    // // Reference validation
    // if (!values.rangeDate) {
    //     errors.rangeDate = 'rangeDate is required';
    // }

    // Selected Project validation
    if (!values.selectedProject || values.selectedProject.length === 0) {
      errors.selectedProject = 'At least one project must be selected';
    }

    // // Submitted By validation
    // if (!values.submittedBy || values.submittedBy.length === 0) {
    //     errors.submittedBy = 'At least one user must be selected';
    // }

    // // customer By validation
    // if (!values.customer || values.customer.length === 0) {
    //     errors.customer = 'At least one customer must be selected';
    // }
    // // supplier By validation
    // if (!values.supplier || values.supplier.length === 0) {
    //     errors.supplier = 'At least one supplier must be selected';
    // }

    // // Submission Status validation
    // if (!values.submissionStatus || values.submissionStatus.length === 0) {
    //     errors.submissionStatus = 'At least one status must be selected';
    // }
    return errors;
  };

  const organizationForm = useFormik({
    initialValues: {
      reference: '',
      selectedProject: [], // Initialize with empty array
      submittedBy: [], // Initialize with empty array
      customer: '',
      supplier: '',
      submissionStatus: [], // Initialize with empty array
      rangeDate: undefined,
    },
    validate: appFormValidator,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  // Submitted by: only show users assigned to selected projects
  const submittedByUserOptions = useMemo(() => {
    const userList = users ?? [];
    const allUsers = userList.filter((u: any) => u.role !== 4 && u.role !== 5);
    const selectedProjectIds: string[] = organizationForm.values.selectedProject ?? [];
    const projectList: any[] = projects ?? [];
    if (!selectedProjectIds.length || !projectList.length) return allUsers;
    const projectIds = new Set<string>(selectedProjectIds);
    const userIds = new Set<string>();
    projectList.forEach((p: any) => {
      if (p._id && projectIds.has(p._id) && p.users?.length) {
        (p.users as any[]).forEach((ue: any) => {
          const id = ue?.user?._id;
          if (id) userIds.add(String(id));
        });
      }
    });
    if (userIds.size === 0) return allUsers;
    return allUsers.filter((u: any) => u._id && userIds.has(u._id));
  }, [users, projects, organizationForm.values.selectedProject]);

  const handleSubmit = (values: any) => {
    const data = {
      reference: values.reference ?? '',
      projects: values.selectedProject ?? [], // Initialize with empty array
      supplier: values.supplier.length > 0 ? values.supplier[0] : '',
      customer: values.customer.length > 0 ? values.customer[0] : '',
      submittedBy: values.submittedBy ?? [],
      status: values.submissionStatus ?? [],
      rangeDate: values.rangeDate ?? {},
    };
    createMutation.mutate({ data, axiosAuth });
  };

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  return (
    <Modal
      isOpen={true}
      onOpenChange={handleClose}
      backdrop={'blur'}
      placement="top-center"
      size="xl"
    >
      <ModalContent className="max-w-[600px] rounded-3xl bg-white">
        {(onCloseModal) => (
          <>
            <ModalHeader className="mt-2 flex flex-row items-start gap-2 px-5 py-4 lg:px-8">
              <svg
                width="50"
                height="50"
                viewBox="0 0 50 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                <path
                  d="M26.586 14.5856C26.9611 14.2106 27.4697 14 28 14C28.5303 14 29.0389 14.2106 29.414 14.5856L38.414 23.5856C38.7889 23.9606 38.9996 24.4692 38.9996 24.9996C38.9996 25.5299 38.7889 26.0385 38.414 26.4136L29.414 35.4136C29.0368 35.7779 28.5316 35.9795 28.0072 35.9749C27.4828 35.9704 26.9812 35.76 26.6104 35.3892C26.2395 35.0184 26.0292 34.5168 26.0247 33.9924C26.0201 33.468 26.2217 32.9628 26.586 32.5856L32 26.9996H13C12.4696 26.9996 11.9609 26.7889 11.5858 26.4138C11.2107 26.0387 11 25.53 11 24.9996C11 24.4691 11.2107 23.9604 11.5858 23.5854C11.9609 23.2103 12.4696 22.9996 13 22.9996H32L26.586 17.4136C26.2111 17.0385 26.0004 16.5299 26.0004 15.9996C26.0004 15.4692 26.2111 14.9606 26.586 14.5856Z"
                  fill="#0063F7"
                />
              </svg>
              <div>
                <h1 className="text-lg lg:text-xl">Report & Export Expenses</h1>
                <span className="text-base font-normal text-[#616161]">
                  Select the following options and filters to generate a report.
                </span>
              </div>
              <button
                onClick={handleClose}
                className="ml-auto cursor-pointer text-gray-500 hover:text-gray-700"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </ModalHeader>
            <ModalBody className="mt-4">
              <div className="h-[60vh] max-h-[520px] w-full overflow-y-scroll px-4">
                <div className="relative mb-6">
                  <DateRangePicker
                    title="Submitted Date Range"
                    handleOnConfirm={(from: Date, to: Date) => {
                      organizationForm.setFieldValue('rangeDate', {
                        from: from,
                        to: to,
                      });
                    }}
                    isForFilter={true}
                    selectedDate={organizationForm.values.rangeDate}
                  />
                </div>
                <div className="relative mb-8 overflow-visible">
                  <CustomSearchSelect
                    label="Assigned Project"
                    isRequired={true}
                    data={(projects ?? []).flatMap((pro) => {
                      return [
                        {
                          label: pro.name ?? '',
                          value: pro._id,
                        },
                      ];
                    })}
                    showImage={false}
                    onSelect={(values) => {
                      organizationForm.setFieldValue('selectedProject', values);
                    }}
                    isOpen={openDropdown === 'dropdown1'}
                    onToggle={() => handleToggle('dropdown1')}
                  />
                  {organizationForm.errors.selectedProject &&
                    organizationForm.touched.selectedProject && (
                      <span className="text-xs text-red-500">
                        {organizationForm.errors.selectedProject}
                      </span>
                    )}
                </div>

                <div className="relative mb-8">
                  <CustomSearchSelect
                    label="Assigned Customer"
                    data={(customers ?? [])
                      .filter((c) => c.role == 4)
                      .flatMap((user) => {
                        return [
                          {
                            label: `${user.customerName} - ${user.userId}`,
                            value: user.customerName,
                            photo: user.photo,
                          },
                        ];
                      })}
                    onSelect={(values) => {
                      organizationForm.setFieldValue('customer', values);
                    }}
                    multiple={false}
                    isOpen={openDropdown === 'dropdown2'}
                    onToggle={() => handleToggle('dropdown2')}
                  />
                </div>
                <div className="relative mb-8">
                  <CustomSearchSelect
                    label="Assigned Supplier"
                    data={(customers ?? [])
                      .filter((c) => c.role == 5)
                      .flatMap((user) => {
                        return [
                          {
                            label: `${user.customerName} - ${user.userId}`,
                            value: user.customerName,
                            photo: user.photo,
                          },
                        ];
                      })}
                    onSelect={(values) => {
                      organizationForm.setFieldValue('supplier', values);
                    }}
                    multiple={false}
                    isOpen={openDropdown === 'dropdown5'}
                    onToggle={() => handleToggle('dropdown5')}
                  />
                </div>
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
                <div className="relative mb-8 overflow-visible">
                  <CustomSearchSelect
                    label="Approval Status"
                    data={usersData}
                    onSelect={(values) => {
                      organizationForm.setFieldValue(
                        'submissionStatus',
                        values
                      );
                    }}
                    selected={organizationForm.values.submissionStatus}
                    showImage={false}
                    isOpen={openDropdown === 'dropdown3'}
                    onToggle={() => handleToggle('dropdown3')}
                  />
                </div>
                <div className="relative overflow-visible">
                  <CustomSearchSelect
                    label="Submitted by"
                    data={submittedByUserOptions.map((user: any) => ({
                      label:
                        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                        user.email ||
                        '',
                      value: user._id,
                      photo: user.photo,
                    }))}
                    selected={organizationForm.values.submittedBy}
                    onSelect={(values) => {
                      organizationForm.setFieldValue('submittedBy', values);
                    }}
                    multiple={true}
                    showImage={true}
                    isOpen={openDropdown === 'dropdown4'}
                    onToggle={() => handleToggle('dropdown4')}
                    placeholder={
                      (organizationForm.values.selectedProject ?? []).length > 0
                        ? 'Users in selected projects'
                        : 'All Users'
                    }
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-center gap-4 border-t-2 border-gray-200">
              <Button variant="primaryOutLine" onClick={onCloseModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  organizationForm.submitForm();
                }}
              >
                {createMutation.isLoading ? (
                  <>
                    <Loader />
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ReportExportExpensesModel;
