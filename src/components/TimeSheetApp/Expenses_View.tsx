import {
  checkTSPermission,
  deleteExpanse,
  getAllExpanses,
  updateMultipleTimeSheets,
} from '@/app/(main)/(user-panel)/user/apps/timesheets/api';
import { useTimeSheetAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/timesheets/timesheet_context';
import { TIMESHEETTYPE } from '@/app/helpers/user/enums';
import { Expanse } from '@/app/type/expanse';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { Switch } from '@material-tailwind/react';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Button } from '../Buttons';
import Loader from '../DottedLoader/loader';
import { Search } from '../Form/search';
import CreateExpenseModel from './Models/Create_Expense_Model';
import ShowExpanseDetail from './Models/Show_Expanse_Detail';
import TimeSheetDeleteModal from './Models/TimeSheet_Delete_Model';
import { TimeSheetTopBar } from './TimeSheet_Top_Bar';
import { DateRange } from '@/app/type/timesheet';
import { SimpleInput } from '../Form/simpleInput';
import { CustomSearchSelect } from './CommonComponents/Custom_Select/Custom_Search_Select';
import { dateFormat } from '@/app/helpers/dateFormat';
import {
  getAllAppProjects,
  getAllOrgUsers,
} from '@/app/(main)/(user-panel)/user/apps/api';
import { getCustomersList } from '@/app/(main)/(user-panel)/user/apps/am/api';
import DateRangePicker from './CommonComponents/Calender/Timesheet_View_Calander';
import ExpenseMultiSelectModal from './Models/MultiSelectModels/ExpenseMultiSelectModel';
import { useSession } from 'next-auth/react';
import AdminSwitch from '../AdminSwitch/AdminSwitch';
import FilterButton from './CommonComponents/FilterButton/FilterButton';
import UserCard from '../UserCard';

function ExpensesView() {
  const { data: session } = useSession();
  const context = useTimeSheetAppsCotnext();
  const memoizedTopBar = useMemo(() => <TimeSheetTopBar />, []);

  const [hoveredUser, setHoveredUser] = useState<number | null>(null);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [hoveredVendor, setHoveredVendor] = useState<number | null>(null);
  const axiosAuth = useAxiosAuth();
  const [adminMode, setAdminMode] = useState(false);
  const queryClient = useQueryClient();
  const { data, isLoading, isSuccess, refetch } = useQuery({
    queryFn: () => getAllExpanses({ axiosAuth, isAdmin: adminMode }),
    queryKey: ['expenses', adminMode],
    enabled: true,
  });

  useEffect(() => {
    refetch();
  }, [adminMode, refetch]);
  const { data: projects, isLoading: projectLoading } = useQuery({
    queryKey: 'allUserAssignedProjects',
    queryFn: () => getAllAppProjects(axiosAuth),
  });
  const { data: users, isLoading: userLoading } = useQuery({
    queryKey: 'allOrgUsers',
    queryFn: () => getAllOrgUsers(axiosAuth),
  });
  const { data: suppliers, isLoading: suppliersLoading } = useQuery({
    queryKey: 'suppliers',
    queryFn: () => getCustomersList(axiosAuth),
  });
  const deleteMutation = useMutation(deleteExpanse, {
    onSuccess: () => {
      queryClient.invalidateQueries('expenses');
      context.dispatch({ type: TIMESHEETTYPE.SELECTED_EXPANSE });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete expense');
    },
  });

  const [showModel, setShowModel] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string>('');
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? '' : dropdownId);
  };

  const [isApplyFilter, setApplyFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string[]>([]);
  const [referenceQuery, setReferenceQuery] = useState<string>('');

  const filterData = (data ?? [])
    .filter((forSearch) => {
      if (searchQuery == '') {
        return true;
      }
      return forSearch.referenceId
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    })
    .filter((byRange) => {
      if (!isApplyFilter) {
        return true;
      }
      const isDateRangeApplied =
        context.state.timesheetDetailDate?.from &&
        context.state.timesheetDetailDate?.to;
      if (!isDateRangeApplied) {
        return true;
      }
      const createdAtDate = new Date(byRange.createdAt);
      const fromDate = context.state.timesheetDetailDate?.from || new Date(0);
      const toDate = context.state.timesheetDetailDate?.to || new Date();
      const isWithinDateRange =
        isDateRangeApplied &&
        createdAtDate >= fromDate &&
        createdAtDate <= toDate;

      if (isWithinDateRange) {
        return true;
      } else {
        return false;
      }
    })
    .filter((forProjects) => {
      if (!isApplyFilter) {
        return true;
      }
      if (selectedProjects.length == 0) {
        return true;
      }
      return forProjects.projects.some(
        (project) => project._id && selectedProjects.includes(project._id)
      );
    })
    .filter((forCustomer) => {
      if (!isApplyFilter) {
        return true;
      }
      if (selectedCustomers.length === 0) {
        return true;
      }
      return selectedCustomers.includes(forCustomer.customer);
    })
    .filter((forSupplier) => {
      if (!isApplyFilter) {
        return true;
      }
      if (selectedSupplier.length === 0) {
        return true;
      }
      return selectedSupplier.includes(forSupplier.supplier);
    })
    .filter((forReference) => {
      if (!isApplyFilter) {
        return true;
      }
      if (referenceQuery === '') {
        return true;
      }
      return forReference.referenceId
        .toLowerCase()
        .includes(referenceQuery.toLowerCase());
    });

  const handleApplyFilters = () => {
    setShowModel(!showModel);
    if (areFiltersApplied()) {
      setApplyFilter(true);
    }
  };

  const clearFilters = () => {
    setSelectedProjects([]);
    setSelectedCustomers([]);
    setSelectedSupplier([]);
    context.dispatch({
      type: TIMESHEETTYPE.TS_DETAIL_DATE,
      timesheetDetailDate: { from: undefined, to: undefined },
    });
    setApplyFilter(false);
    setReferenceQuery('');
  };

  const areFiltersApplied = () => {
    return (
      selectedProjects.length > 0 ||
      selectedCustomers.length > 0 ||
      selectedSupplier.length > 0 ||
      (context.state.timesheetDetailDate?.from != null &&
        context.state.timesheetDetailDate?.to != null) ||
      referenceQuery.trim() !== ''
    );
  };

  // CHECKBOX FUNCTIONALITY
  const [selectedExpenses, setSelectedExpenses] = useState<Expanse[]>([]);

  // Filter items that user can select (only their own and status = Not Approved)
  const selectableItems = (filterData ?? []).filter(
    (item) =>
      session?.user.user._id === item.createdBy?._id && item.status === 'not'
  );

  // Handle "Select All" checkbox change - only select items created by user
  const handleSelectAllChange = () => {
    const allSelectableSelected =
      selectableItems.length > 0 &&
      selectableItems.length ===
        selectedExpenses.filter(
          (ex) => session?.user.user._id === ex.createdBy?._id
        ).length;
    if (allSelectableSelected) {
      handleCancel();
    } else {
      setSelectedExpenses([...selectableItems]);
    }
  };

  const handleCheckboxChange = (ts: Expanse) => {
    // Only allow selection if user created this expense and status is Not Approved
    if (session?.user.user._id !== ts.createdBy?._id || ts.status !== 'not') {
      return;
    }
    // Check if the current expense is already selected by checking the _id in selectedExpenses
    if (selectedExpenses.some((selectedEs) => selectedEs._id === ts._id)) {
      // If it's already selected, remove it from the selected list
      setSelectedExpenses([
        ...(selectedExpenses ?? []).filter(
          (selectedEs) => selectedEs._id !== ts._id
        ),
      ]);
    } else {
      // Otherwise, add it to the selected list
      setSelectedExpenses([...(selectedExpenses ?? []), ts]);
    }
  };
  // Handle Cancel button click (uncheck all checkboxes)
  const handleCancel = () => {
    setSelectedExpenses([]);
    setIsSelectMode(false); // Exit select mode
  };

  const [isSelectMode, setIsSelectMode] = useState(false);

  //------------------------------------------

  const [showSelectedItemsModal, setShowSelectedItemsModal] = useState(false);

  const openSelectedItemsModal = () => {
    handleBackToOptions();
    setShowSelectedItemsModal(true);
  };

  const [selectedOption, setSelectedOption] = useState<
    'csv' | 'edit' | 'delete'
  >('csv');

  // Reset to initial state
  const handleBackToOptions = () => {
    setSelectedOption('csv');
  };

  const [sortColumn, setSortColumn] = useState<'expense_id' | 'expense_date'>(
    'expense_date'
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Sorting function based on column and direction
  const sortedData = [...(filterData ?? [])].sort((a, b) => {
    const fieldA =
      sortColumn === 'expense_id'
        ? a.referenceId.toLowerCase()
        : new Date(a.createdAt);
    const fieldB =
      sortColumn === 'expense_id'
        ? b.referenceId.toLowerCase()
        : new Date(b.createdAt);

    if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Check if user is Root User from session (role 3 = Organization Admin)
  const isRootUser = (session?.user as any)?.role === 3;

  // Check app-level permission (backend already checks global apps permission and returns adminMode: true if user has it)
  const { data: permission } = useQuery('TSSettingPermission', () =>
    checkTSPermission(axiosAuth)
  );

  // User can use Admin Mode if Root User or has permission (which includes global apps permission)
  const canUseAdminMode = isRootUser || permission?.adminMode === true;

  const handleSort = (column: 'expense_id' | 'expense_date') => {
    if (sortColumn === column) {
      // Toggle sort direction if the same column is clicked
      setSortDirection((prevDirection) =>
        prevDirection === 'asc' ? 'desc' : 'asc'
      );
    } else {
      // Change sort column and reset to ascending direction
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <>
      <div className="absolute inset-0 z-10 flex h-[calc(var(--app-vh)-70px)] w-full max-w-[1360px] flex-col bg-white px-4 pt-4 font-Open-Sans">
        {/* TopBar */}

        {/* ///////////////// Middle content ////////////////////// */}

        <div className="flex h-full flex-1 flex-col justify-start overflow-auto scrollbar-hide">
          <div className="sticky top-0 z-20 bg-white pb-2">
            {memoizedTopBar}

            <div className="mt-4 flex flex-col justify-between gap-2 lg:flex-row">
              <div className="flex items-center gap-2 text-2xl font-bold text-[#1E1E1E]">
                <img
                  src="/svg/timesheet_app/logo.svg"
                  alt="show logo"
                  className="h-12 w-12"
                />
                Expenses
              </div>

              <div className="flex items-center gap-4">
                {/* switch */}
                {canUseAdminMode && (
                  <div className="hidden md:flex">
                    <AdminSwitch
                      adminMode={adminMode}
                      setAdminMode={setAdminMode}
                    />
                  </div>
                )}

                {/* search & filter */}
                <div className="flex flex-grow gap-4">
                  {/* filter Button */}
                  <FilterButton
                    isApplyFilter={isApplyFilter}
                    setShowModel={setShowModel}
                    showModel={showModel}
                    setOpenDropdown={setOpenDropdown}
                    clearFilters={clearFilters}
                  />

                  {/* search bar */}
                  <div className="Search team-actice flex w-full items-center justify-between">
                    <Search
                      inputRounded={true}
                      type="search"
                      className="rounded-md bg-[#eeeeee] placeholder:text-[#616161]"
                      name="search"
                      placeholder="Search"
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* /// table section  */}
            </div>
          </div>

          {isLoading ? (
            <Loader />
          ) : (
            <table className="mt-3 w-full border-collapse font-Open-Sans">
              <thead className="w-full text-[#616161]">
                <tr className="max-h-[40px] w-full text-left">
                  <th className="flex flex-nowrap text-nowrap rounded-l-lg bg-[#F5F5F5] px-4 py-3 text-[14px] text-sm font-normal">
                    Expense ID
                    <img
                      src="/images/fluent_arrow-sort-24-regular.svg"
                      className={`transform cursor-pointer px-1 ${
                        sortColumn === 'expense_id' && sortDirection === 'desc'
                          ? 'rotate-180'
                          : ''
                      }`}
                      onClick={() => handleSort('expense_id')}
                      alt="image"
                    />
                  </th>
                  <th className="hidden bg-[#F5F5F5] px-2 py-3 text-left text-sm font-normal sm:table-cell">
                    Supplier
                  </th>
                  <th className="hidden whitespace-nowrap bg-[#F5F5F5] px-2 py-3 text-left text-sm font-normal sm:table-cell">
                    Assigned Project
                  </th>
                  <th className="bg-[#F5F5F5] px-2 py-3 text-left text-sm font-normal">
                    Cost
                  </th>

                  <th className="hidden bg-[#F5F5F5] px-2 py-3 text-left text-sm font-normal lg:table-cell">
                    Submitted By
                  </th>
                  <th className="hidden bg-[#F5F5F5] px-2 py-3 text-left text-sm font-normal md:flex">
                    Date
                    <img
                      src="/images/fluent_arrow-sort-24-regular.svg"
                      className={`transform cursor-pointer px-1 ${
                        sortColumn === 'expense_date' &&
                        sortDirection === 'desc'
                          ? 'rotate-180'
                          : ''
                      }`}
                      onClick={() => handleSort('expense_date')}
                      alt="Sort Icon"
                    />
                  </th>
                  <th className="w-[100px] rounded-r-lg bg-[#F5F5F5] px-4 py-3 text-right text-sm font-normal text-[#0063F7]">
                    {isSelectMode ? (
                      <div className="flex items-center justify-end gap-2">
                        <div className="cursor-pointer" onClick={handleCancel}>
                          Cancel
                        </div>
                        <div className="relative flex items-center justify-center gap-2">
                          <input
                            type="checkbox"
                            className={`h-5 w-5 cursor-pointer appearance-none rounded-md border-2 ${
                              selectableItems.length > 0 &&
                              selectableItems.length ===
                                selectedExpenses.filter(
                                  (ex) =>
                                    session?.user.user._id === ex.createdBy?._id
                                ).length
                                ? 'border-[#6990FF] bg-[#6990FF] checked:border-[#6990FF] checked:bg-[#6990FF]'
                                : 'border-[#9E9E9E] bg-white'
                            } transition-colors duration-200 ease-in-out`}
                            // checked={allCheck}
                            onChange={handleSelectAllChange}
                          />
                          {selectableItems.length > 0 &&
                            selectableItems.length ===
                              selectedExpenses.filter(
                                (ex) =>
                                  session?.user.user._id === ex.createdBy?._id
                              ).length && (
                              <svg
                                onClick={handleSelectAllChange}
                                className="z-21 absolute inset-0 m-auto h-4 w-4 cursor-pointer text-white"
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
                            )}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer"
                        onClick={() => setIsSelectMode(!isSelectMode)}
                      >
                        Select
                      </div>
                    )}
                  </th>
                </tr>
              </thead>
              {isSuccess && (
                <tbody className="text-sm font-normal text-[#1E1E1E]">
                  {(sortedData ?? []).map((item: Expanse, index: number) => (
                    <tr
                      key={item._id}
                      className="relative cursor-pointer border-b even:bg-[#F5F5F5]"
                      onClick={() => {
                        context.dispatch({
                          type: TIMESHEETTYPE.SELECTED_EXPANSE,
                          selectedExpanse: {
                            model: item,
                            showAs: 'detail',
                          },
                        });
                      }}
                    >
                      <td className="px-4 text-primary-400">
                        {item.referenceId}
                      </td>
                      <td
                        className="hidden max-w-[160px] items-center text-nowrap px-2 py-3 sm:flex"
                        onMouseEnter={() => setHoveredVendor(index)}
                        onMouseLeave={() => setHoveredVendor(null)}
                      >
                        <img
                          src={'/user.svg'}
                          alt="avatar"
                          className="mr-2 h-8 w-8 rounded-full border border-gray-500 text-[#616161]"
                        />
                        <>{`${item.supplier}`}</>
                      </td>
                      <td
                        className="hidden p-2 px-2 sm:table-cell"
                        onMouseEnter={() => setHoveredProject(index)}
                        onMouseLeave={() => setHoveredProject(null)}
                      >
                        <div
                          className={
                            'flex w-fit items-center gap-1 rounded-md bg-[#97F1BB] px-2 py-1'
                          }
                        >
                          {item.projects[0]?.name}
                          {item.projects.length > 1
                            ? ` +${item.projects.length - 1}`
                            : null}
                        </div>
                        {(item.projects ?? []).length > 0 && (
                          <div>
                            {hoveredProject === index && (
                              <div className="pointer-events-none absolute top-2 z-20 w-[300px] rounded-lg border bg-[#97F1BB] p-2 text-xs text-[#616161] shadow-lg">
                                <div className="flex items-start">
                                  <div className="space-y-2">
                                    {(item.projects ?? []).map((project) => {
                                      return (
                                        <div
                                          className="flex items-center gap-1"
                                          key={project._id}
                                        >
                                          <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 18 18"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M11.0569 3.375H15.5366C15.8493 3.37497 16.1585 3.4401 16.4446 3.56624C16.7307 3.69238 16.9873 3.87676 17.1982 4.10762C17.409 4.33848 17.5695 4.61076 17.6692 4.90707C17.769 5.20339 17.8059 5.51725 17.7776 5.82863L17.061 13.7036C17.0102 14.2627 16.7523 14.7825 16.3378 15.1611C15.9234 15.5397 15.3824 15.7498 14.8211 15.75H3.17849C2.61715 15.7498 2.07618 15.5397 1.66176 15.1611C1.24734 14.7825 0.989411 14.2627 0.938611 13.7036L0.221986 5.82863C0.175003 5.30758 0.311053 4.78646 0.606736 4.35488L0.562861 3.375C0.562861 2.77826 0.799914 2.20597 1.22187 1.78401C1.64383 1.36205 2.21612 1.125 2.81286 1.125H6.94386C7.54055 1.12513 8.11275 1.36226 8.53461 1.78425L9.46611 2.71575C9.88797 3.13774 10.4602 3.37487 11.0569 3.375ZM1.69461 3.51C1.93611 3.42075 2.19261 3.37575 2.46411 3.375H8.53461L7.73924 2.57963C7.52831 2.36863 7.24221 2.25006 6.94386 2.25H2.81286C2.51816 2.24995 2.2352 2.36553 2.02483 2.57191C1.81445 2.77829 1.69346 3.05898 1.68786 3.35362L1.69461 3.51Z"
                                              fill="#616161"
                                            />
                                          </svg>
                                          <p className="text-sm">
                                            {project.name}
                                          </p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-2">{`${item.invoiceValue}`}</td>

                      <td className="hidden max-w-[160px] items-center p-2 lg:flex">
                        <UserCard submittedBy={item.createdBy} index={0} />
                      </td>
                      <td className="hidden whitespace-nowrap p-2 text-start md:table-cell">{`${dateFormat(
                        item.createdAt.toString()
                      )}`}</td>

                      <td
                        className={`flex justify-end ${
                          isSelectMode ? 'px-4' : 'px-5'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {isSelectMode ? (
                          <div
                            key={item._id}
                            className="relative flex items-center"
                          >
                            <input
                              type="checkbox"
                              disabled={
                                session?.user.user._id !==
                                  item.createdBy?._id || item.status !== 'not'
                              }
                              className={`h-5 w-5 appearance-none rounded-md border-2 ${
                                session?.user.user._id !==
                                  item.createdBy?._id || item.status !== 'not'
                                  ? 'cursor-not-allowed border-gray-300 bg-gray-100 opacity-50'
                                  : 'cursor-pointer transition-colors duration-200 ease-in-out'
                              } ${
                                selectedExpenses.some(
                                  (ex) => item._id == ex._id
                                )
                                  ? 'border-[#6990FF] bg-[#6990FF] checked:border-[#6990FF] checked:bg-[#6990FF]'
                                  : 'border-[#9E9E9E] bg-white'
                              }`}
                              checked={selectedExpenses.some(
                                (ex) => item._id == ex._id
                              )}
                              onChange={() => handleCheckboxChange(item)}
                            />
                            {selectedExpenses.some(
                              (ex) => item._id == ex._id
                            ) && (
                              <svg
                                onClick={() => handleCheckboxChange(item)}
                                className="z-21 absolute inset-0 m-auto h-4 w-4 cursor-pointer text-white"
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
                            )}
                          </div>
                        ) : (
                          <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="24px"
                                viewBox="0 -960 960 960"
                                width="24px"
                                fill="#616161"
                                className="hover:fill-[#8d8d8d]"
                              >
                                <path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z" />
                              </svg>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Dynamic Actions">
                              <DropdownItem
                                key="View"
                                onPress={() => {
                                  context.dispatch({
                                    type: TIMESHEETTYPE.SELECTED_EXPANSE,
                                    selectedExpanse: {
                                      model: item,
                                      showAs: 'detail',
                                    },
                                  });
                                }}
                              >
                                {' '}
                                View
                              </DropdownItem>
                              <DropdownItem key="emil">
                                Email Entry
                              </DropdownItem>
                              <DropdownItem
                                key="Edit"
                                isDisabled={
                                  session?.user.user._id !==
                                    item.createdBy?._id || item.status !== 'not'
                                }
                                className={
                                  session?.user.user._id !==
                                    item.createdBy?._id || item.status !== 'not'
                                    ? 'cursor-not-allowed opacity-50'
                                    : ''
                                }
                                onClick={() => {
                                  if (
                                    session?.user.user._id ===
                                      item.createdBy?._id &&
                                    item.status === 'not'
                                  ) {
                                    context.dispatch({
                                      type: TIMESHEETTYPE.SELECTED_EXPANSE,
                                      selectedExpanse: {
                                        model: item,
                                        showAs: 'edit',
                                      },
                                    });
                                  }
                                }}
                              >
                                {' '}
                                Edit
                              </DropdownItem>
                              <DropdownItem
                                key="Delete"
                                color="danger"
                                isDisabled={
                                  session?.user.user._id !==
                                    item.createdBy?._id || item.status !== 'not'
                                }
                                className={
                                  session?.user.user._id !==
                                    item.createdBy?._id || item.status !== 'not'
                                    ? 'cursor-not-allowed opacity-50'
                                    : ''
                                }
                                onClick={() => {
                                  if (
                                    session?.user.user._id ===
                                      item.createdBy?._id &&
                                    item.status === 'not'
                                  ) {
                                    context.dispatch({
                                      type: TIMESHEETTYPE.SELECTED_EXPANSE,
                                      selectedExpanse: {
                                        model: item,
                                        showAs: 'delete',
                                      },
                                    });
                                  }
                                }}
                              >
                                Delete
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          )}
        </div>
        {/* Bottom bar with Add Button */}
        <div>
          {/* Add Expense Button */}
          {!isSelectMode && (
            <div className="mb-8 mr-2 flex justify-end">
              <Button
                variant="primaryRounded"
                onClick={() => {
                  context.dispatch({
                    type: TIMESHEETTYPE.SELECTED_EXPANSE,
                    selectedExpanse: {
                      showAs: 'edit',
                    },
                  });
                }}
              >
                {'+ Add'}
              </Button>
            </div>
          )}

          <div className="h-16">
            <div className="flex h-full w-full items-center justify-between border-2 border-[#EEEEEE] p-2">
              <div className="flex-1 text-left text-sm font-normal text-[#616161]">
                Items per page: 50
              </div>
              <div className="absolute left-1/2 flex -translate-x-1/2 transform items-center gap-2">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.0364 13.4677C10.2121 13.2919 10.3108 13.0535 10.3108 12.8049C10.3108 12.5563 10.2121 12.3179 10.0364 12.1421L5.39574 7.50145L10.0364 2.86082C10.2071 2.68401 10.3016 2.4472 10.2995 2.20139C10.2974 1.95558 10.1988 1.72044 10.0249 1.54662C9.85112 1.3728 9.61598 1.2742 9.37018 1.27207C9.12437 1.26993 8.88755 1.36443 8.71074 1.5352L3.4073 6.83864C3.23155 7.01445 3.13281 7.25286 3.13281 7.50145C3.13281 7.75004 3.23155 7.98846 3.4073 8.16426L8.71074 13.4677C8.88654 13.6435 9.12496 13.7422 9.37355 13.7422C9.62214 13.7422 9.86055 13.6435 10.0364 13.4677Z"
                    fill="#616161"
                  />
                </svg>
                <div className="flex items-center justify-center rounded-lg border-1 border-[#616161] px-3 py-1 text-[14px] text-[#1E1E1E]">
                  1
                </div>
                <div className="text-[#616161]">of 1</div>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.96364 1.54011C4.78788 1.71592 4.68915 1.95433 4.68915 2.20292C4.68915 2.45152 4.78788 2.68993 4.96364 2.86574L9.60426 7.50636L4.96364 12.147C4.79286 12.3238 4.69837 12.5606 4.70051 12.8064C4.70264 13.0522 4.80124 13.2874 4.97506 13.4612C5.14888 13.635 5.38401 13.7336 5.62982 13.7357C5.87563 13.7379 6.11245 13.6434 6.28926 13.4726L11.5927 8.16918C11.7685 7.99337 11.8672 7.75495 11.8672 7.50636C11.8672 7.25777 11.7685 7.01936 11.5927 6.84355L6.28926 1.54011C6.11346 1.36436 5.87504 1.26563 5.62645 1.26563C5.37786 1.26563 5.13944 1.36436 4.96364 1.54011Z"
                    fill="#616161"
                  />
                </svg>
              </div>
              {isSelectMode && (
                <div className="flex w-fit justify-end gap-4 text-right">
                  <Button variant="text" onClick={handleCancel}>
                    <div className="">Cancel</div>
                  </Button>
                  <Button
                    variant="tertiary"
                    onClick={() => {
                      openSelectedItemsModal();
                    }}
                    disabled={(selectedExpenses ?? []).length == 0}
                  >
                    <div>Select ({(selectedExpenses ?? []).length})</div>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {context.state.selectedExpanse &&
        context.state.selectedExpanse.showAs == 'edit' && (
          <CreateExpenseModel expanse={context.state.selectedExpanse?.model} />
        )}
      {context.state.selectedExpanse &&
        context.state.selectedExpanse.showAs == 'detail' && (
          <ShowExpanseDetail />
        )}
      {context.state.selectedExpanse &&
        context.state.selectedExpanse.showAs == 'delete' && (
          <TimeSheetDeleteModal
            doneValue={deleteMutation.isLoading ? <Loader /> : <>Delete</>}
            handleClose={() => {
              context.dispatch({ type: TIMESHEETTYPE.SELECTED_EXPANSE });
            }}
            onDeleteButton={() => {
              deleteMutation.mutate({
                id: context.state.selectedExpanse?.model?._id ?? '',
                axiosAuth,
              });
            }}
            subtitle={
              'Are you sure you want to delete this expanse. This action cannot be undone.'
            }
            title={'Delete Expanse'}
          />
        )}

      {/* filter model */}
      <Modal
        isOpen={showModel}
        onOpenChange={() => setShowModel(!showModel)}
        placement="auto"
        backdrop="blur"
        size="xl"
        className="absolute h-[700px] px-5 py-2"
      >
        <ModalContent className="max-w-[600px] rounded-3xl bg-white">
          {(onCloseModal) => (
            <>
              <ModalHeader className="flex flex-row items-center justify-between gap-2 border-b-2 border-gray-200 px-5 py-5">
                <div>
                  <h2 className="text-xl font-semibold">Filter By</h2>
                  <p className="mt-1 text-sm font-normal text-[#616161]">
                    Filter by the following selections and options.
                  </p>
                </div>
                <button
                  onClick={onCloseModal}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
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
                      stroke="#616161"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </ModalHeader>
              <ModalBody className="mt-4 flex flex-col justify-start overflow-y-scroll p-0 pl-2 pr-6 pt-4 scrollbar-hide">
                <div className="w-full" onClick={() => setOpenDropdown('')}>
                  <DateRangePicker
                    title="Submitted Date Range"
                    handleOnConfirm={(from: Date, to: Date) => {
                      context.dispatch({
                        type: TIMESHEETTYPE.TS_DETAIL_DATE,
                        timesheetDetailDate: { from: from, to: to },
                      });
                    }}
                    selectedDate={
                      context.state.timesheetDetailDate ?? undefined
                    }
                  />
                </div>

                <div className="mb-4 w-full">
                  <CustomSearchSelect
                    label="Assigned Project"
                    data={(projects ?? []).map((project) => ({
                      label: project.name ?? '',
                      value: project._id ?? '',
                    }))}
                    selected={selectedProjects}
                    showImage={false}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown1'}
                    onToggle={() => handleToggle('dropdown1')}
                    onSelect={(selected: string[]) =>
                      setSelectedProjects(selected)
                    }
                    placeholder="All Current Projects"
                  />
                </div>

                <div className="mb-4 w-full">
                  <CustomSearchSelect
                    label="Assigned Customer"
                    data={(suppliers ?? [])
                      .filter((c: any) => c.role == 4)
                      .flatMap((user: any) => [
                        {
                          label: `${user.customerName} - ${user.userId}`,
                          value: user.customerName,
                          photo: user.photo,
                        },
                      ])}
                    selected={selectedCustomers}
                    showImage={true}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown2'}
                    onToggle={() => handleToggle('dropdown2')}
                    onSelect={(selected: string[]) =>
                      setSelectedCustomers(selected)
                    }
                    placeholder="All Customers"
                  />
                </div>

                <div className="mb-4 w-full">
                  <CustomSearchSelect
                    label="Assigned Supplier"
                    data={(suppliers ?? [])
                      .filter((c: any) => c.role == 5)
                      .flatMap((user: any) => [
                        {
                          label: `${user.customerName} - ${user.userId}`,
                          value: user.customerName,
                          photo: user.photo,
                        },
                      ])}
                    selected={selectedSupplier}
                    showImage={true}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown3'}
                    onToggle={() => handleToggle('dropdown3')}
                    onSelect={(selected: string[]) =>
                      setSelectedSupplier(selected)
                    }
                    placeholder="All Suppliers"
                  />
                </div>

                <div className="mb-16 w-full">
                  <SimpleInput
                    label="Reference"
                    type="text"
                    placeholder="Enter Reference"
                    name="reference"
                    className="w-full"
                    value={referenceQuery}
                    onChange={(e) => setReferenceQuery(e.target.value)}
                  />
                </div>
              </ModalBody>
              <ModalFooter className="pt-0">
                <div className="flex w-full justify-center border-t-1 pt-8">
                  <Button
                    variant="primaryOutLine"
                    className="mr-4 rounded-lg border-2 border-[#0063F7] bg-transparent px-8 py-1 text-[#0063F7] duration-200"
                    onClick={clearFilters}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="primary"
                    className="rounded-lg bg-[#0063F7] px-8 py-1 text-[#FFFFFF] duration-200"
                    onClick={handleApplyFilters}
                    disabled={!areFiltersApplied()}
                  >
                    Apply
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* Selected Items Model */}

      {showSelectedItemsModal && (
        <ExpenseMultiSelectModal
          handleShowModel={() => {
            setShowSelectedItemsModal(!showSelectedItemsModal);
            handleCancel();
          }}
          selectedExpenses={selectedExpenses}
        />
      )}
    </>
  );
}

export default ExpensesView;
