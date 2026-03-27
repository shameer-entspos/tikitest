'use client';
import React, { useState } from 'react';
import { AddedUserDetailModel } from '@/app/type/addedUserDetailModel';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Search } from '../Form/search';
import { useSession } from 'next-auth/react';
import useAxiosAuth from '@/hooks/AxiosAuth';
import {
  createUser,
  deleteMultiUserPassword,
  deleteUser,
  editUser,
  getUsers,
  toggleUserActiveStatus,
  updateAddedUserPassword,
  updateMultiStatusPassword,
} from '@/app/(main)/(org-panel)/organization/users/api';
import { Button } from '../Buttons';
import { Plus } from 'lucide-react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { CustomBlueCheckBox } from '../Custom_Checkbox/Custom_Blue_Checkbox';
import { formatDateTime } from '@/utils';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import * as Yup from 'yup';
import FilterButton from '../TimeSheetApp/CommonComponents/FilterButton/FilterButton';
import { CustomSearchSelect } from '../TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';

import { SimpleInput } from '../Form/simpleInput';
import ModifyLicenses from '../Organization/Billing/Licenses/ModifyLicenses';
import CustomInfoModal from '../CustomDeleteModel';
import Loader from '../DottedLoader/loader';
import CustomModal from '../Custom_Modal';
import { useFormik } from 'formik';
import DateRangePicker from '../../components/JobSafetyAnalysis/CreateNewComponents/JSA_Calender';
import toast from 'react-hot-toast';

const permissionOptions = [
  "Global Apps 'Admin Mode'",
  "Organization Settings 'Manage Users'",
  "Organization Settings 'Manage Teams'",
  "Organization Settings 'App Store'",
  "Organization Settings 'Cloud Storage'",
  "Organization Settings 'Billing & Licenses'",
];

function UserList() {
  const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  const [resetPasswrod, setPasswordValue] = useState('');
  const [selectedModel, setSelectedModel] = useState<
    | {
        action:
          | 'view'
          | 'delete'
          | 'status'
          | 'edit'
          | 'add'
          | 'reset'
          | 'bulk'
          | 'multi-delete'
          | 'multi-enable'
          | 'multi-disable'
          | 'reset-finish'
          | 'add-finish'
          | 'edit-finish';
        model?: AddedUserDetailModel;
      }
    | undefined
  >(undefined);
  const [noLicense, setNoLicense] = useState(false);
  const [bulkAction, setBulkAction] = useState(0);
  const { data: session, update } = useSession() as any;
  const [filterDates, setFilterDates] = useState<
    | {
        from?: Date;
        to?: Date;
      }
    | undefined
  >(undefined);
  //// API hanlding
  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth();
  const { data: users, isLoading } = useQuery({
    queryKey: 'users',
    queryFn: () => getUsers(axiosAuth),
  });
  const createMutation = useMutation(createUser, {
    onSuccess: (response) => {
      userUpdateForm.resetForm();
      setChecked(false);
      setSelectedModel({
        action: 'add-finish',
        model: response as AddedUserDetailModel,
      });
      queryClient.invalidateQueries('users');
    },
  });

  const updateMutation = useMutation(editUser, {
    onSuccess: () => {
      userUpdateForm.resetForm();
      setSelectedModel({
        action: 'edit-finish',
        model: selectedModel?.model,
      });
      queryClient.invalidateQueries('users');
    },
  });

  const toggleUserStatusMutation = useMutation(toggleUserActiveStatus, {
    onSuccess: () => {
      setBulkAction(0);
      setSelectedModel(undefined);
      queryClient.invalidateQueries('users');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user status');
    },
  });

  const singleDelteMutation = useMutation(deleteUser, {
    onSuccess: () => {
      setSelectedModel(undefined);
      queryClient.setQueryData('users', (oldData: any) => {
        if (oldData) {
          const updatedData = oldData.filter(
            (user: any) => user._id !== selectedModel?.model?._id
          );
          return updatedData;
        }
        return oldData;
      });
    },
  });

  const udpateUserPasswordMutation = useMutation(updateAddedUserPassword, {
    onSuccess: () => {
      setChecked(false);
      setSelectedModel({
        action: 'reset-finish',
        model: selectedModel?.model,
      });
    },
  });
  const udpateMultiStatusMutation = useMutation(updateMultiStatusPassword, {
    onSuccess: () => {
      setSelectedModel(undefined);
      setBulkAction(0);
      toggleBulkSelect();
      queryClient.invalidateQueries('users');
    },
  });
  const deleteMultiUsersMutation = useMutation(deleteMultiUserPassword, {
    onSuccess: () => {
      setSelectedModel(undefined);
      setBulkAction(0);
      toggleBulkSelect();
      queryClient.invalidateQueries('users');
    },
  });

  /// handle update user
  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('firstName is required'),
    lastName: Yup.string().required('lastName is required'),
    email: Yup.string().email().required('email is required'),
    password: Yup.lazy((value, context) =>
      selectedModel?.action === 'add'
        ? Yup.string()
            .required('Password is required')
            .matches(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
              {
                message:
                  'Password must contain 8 or more characters with at least one of each: uppercase, lowercase, number, and special character',
              }
            )
            .min(8, 'Password must be at least 8 characters')
        : Yup.string().notRequired()
    ),
  });
  const userUpdateForm = useFormik({
    initialValues: {
      firstName: selectedModel?.model?.firstName ?? '',
      lastName: selectedModel?.model?.lastName ?? '',
      email: selectedModel?.model?.email ?? '',
      phone: selectedModel?.model?.phone ?? '',
      password: '',
    },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (selectedModel?.action == 'add') {
        createMutation.mutate({
          axiosAuth,
          data: { ...values, mail: checked },
        });
      } else {
        updateMutation.mutate({
          axiosAuth,
          id: selectedModel?.model?._id!,
          data: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone,
          },
        });
      }
    },
  });

  /// add user handle
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [isApplyFilter, setApplyFilter] = useState(false);
  const [showFilterModel, setShowFilterModel] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkSelect, setIsBulkSelect] = useState(false);
  const [checked, setChecked] = useState<boolean>();
  const [filterActiveCheck, setFilterActiveChecked] = useState(false);
  const [filterDisableCheck, setFilterDisableChecked] = useState(false);

  const [showLicenseModal, setShowLicenseModal] = useState<boolean>(false);
  const [isOpenNew, setModelOpen] = useState(false);
  const [licencesInfo, setLicencesInfo] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDropdown = (dropdownId: string) => {
    setOpenFilterDropdown(openFilterDropdown === dropdownId ? '' : dropdownId);
  };
  const areFiltersApplied = () => {
    return filterActiveCheck || filterDisableCheck || filterDates;
  };
  const [checkedStates, setCheckedStates] = useState(
    permissionOptions.reduce((acc: any, option: any) => {
      acc[option] = false;
      return acc;
    }, {})
  );
  const toggleCheckbox = (option: any) => {
    setCheckedStates((prev: any) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };
  const clearFilters = () => {
    setFilterActiveChecked(false);
    setFilterDisableChecked(false);
    setFilterDates(undefined);
    setApplyFilter(false);
  };
  const handleApplyFilters = () => {
    setShowFilterModel(!showFilterModel);
    if (areFiltersApplied()) {
      setApplyFilter(true);
    }
  };
  const isItemSelected = (id: string) => selectedIds.includes(id);
  const toggleBulkSelect = () => {
    setSelectedIds([]);
    setIsBulkSelect(!isBulkSelect);
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  const filteredUsers = (users ?? [])
    .filter((user) => {
      if (isApplyFilter) {
        if (filterDisableCheck) {
          return !session?.user.user?.active;
        } else if (filterActiveCheck) {
          return session?.user.user?.active;
        } else if (filterDates) {
          const startDate = new Date(filterDates.from ?? 0);
          const endDate = new Date(filterDates.to ?? 0);
          const userDate = new Date(user.createdAt ?? '0');
          return userDate >= startDate && userDate <= endDate;
        } else {
          return user;
        }
      } else {
        return user;
      }
    })
    .filter(
      (user) =>
        `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      const validIds = filteredUsers
        .map((user) => user._id)
        .filter((id): id is string => Boolean(id));
      setSelectedIds(validIds);
    } else {
      setSelectedIds([]);
    }
  };

  const itemsPerPage = 50;
  // Get current page's data
  const currentPageData = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  return (
    <>
      <div className="flex min-h-full w-full flex-1 flex-col md:max-w-[1360px]">
        {/* header + table */}
        <div className="flex min-h-0 flex-1 flex-col overflow-auto">
          <div className="page-heading-edit mb-5 flex flex-col justify-between gap-2 xl:flex-row xl:gap-0 xl:pl-7">
            {/* icon */}
            <div className="page-heading-edit flex flex-col items-center gap-4 md:flex-row xl:w-1/2">
              <div className="flex w-full items-center gap-4 md:w-max">
                <span
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#e2f3ff] p-[5px] lg:h-[50px] lg:w-[50px]"
                  style={{
                    boxShadow: '0px 0px 2px 1.3px #0000001d',
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 34 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.334 0.666852C8.56587 0.666852 6.87018 1.36923 5.61994 2.61947C4.3697 3.86972 3.66732 5.56541 3.66732 7.33352C3.66732 9.10163 4.3697 10.7973 5.61994 12.0476C6.87018 13.2978 8.56587 14.0002 10.334 14.0002C12.1021 14.0002 13.7978 13.2978 15.048 12.0476C16.2983 10.7973 17.0007 9.10163 17.0007 7.33352C17.0007 5.56541 16.2983 3.86972 15.048 2.61947C13.7978 1.36923 12.1021 0.666852 10.334 0.666852ZM7.00065 15.6669C5.23254 15.6669 3.53685 16.3692 2.28661 17.6195C1.03636 18.8697 0.333984 20.5654 0.333984 22.3335V24.0002C0.333984 24.8842 0.685174 25.7321 1.31029 26.3572C1.93542 26.9823 2.78326 27.3335 3.66732 27.3335H17.0007C17.8847 27.3335 18.7326 26.9823 19.3577 26.3572C19.9828 25.7321 20.334 24.8842 20.334 24.0002V22.3335C20.334 20.5654 19.6316 18.8697 18.3814 17.6195C17.1311 16.3692 15.4354 15.6669 13.6673 15.6669H7.00065ZM19.084 12.1752C19.8807 10.7419 20.334 9.09185 20.334 7.33352C20.3343 5.63925 19.9042 3.97267 19.084 2.49019C20.0303 1.59473 21.2183 0.996205 22.5012 0.768567C23.784 0.54093 25.1054 0.694162 26.3021 1.20933C27.4987 1.72449 28.5182 2.57901 29.2346 3.66727C29.9509 4.75553 30.3326 6.02983 30.3326 7.33269C30.3326 8.63554 29.9509 9.90984 29.2346 10.9981C28.5182 12.0864 27.4987 12.9409 26.3021 13.456C25.1054 13.9712 23.784 14.1244 22.5012 13.8968C21.2183 13.6692 20.0303 13.0706 19.084 12.1752ZM22.7773 27.3335C23.344 26.3535 23.669 25.2152 23.669 24.0002V22.3335C23.6721 19.8731 22.765 17.4986 21.1223 15.6669H27.0007C28.7688 15.6669 30.4645 16.3692 31.7147 17.6195C32.9649 18.8697 33.6673 20.5654 33.6673 22.3335V24.0002C33.6673 24.8842 33.3161 25.7321 32.691 26.3572C32.0659 26.9823 31.218 27.3335 30.334 27.3335H22.7773Z"
                      fill="#0063F7"
                    />
                  </svg>
                </span>
                <h3 className="text-lg font-bold text-black md:text-xl lg:text-2xl">
                  Manage Users
                </h3>
              </div>

              <p className="ml-2 text-center text-sm font-normal text-gray-900 md:text-base">
                {(session?.user.user.organization?.userLicense?.quantity ?? 0) >
                0
                  ? (session?.user.user.organization?.userLicense?.quantity ??
                      0) - (users ?? []).length
                  : 0}
                {'/'}
                {session?.user.user.organization?.userLicense?.quantity ??
                  0}{' '}
                User Licenses Available
              </p>
            </div>

            {/* buttons and search */}
            <div className="page-heading-edit flex items-center justify-end gap-2 sm:gap-3 xl:w-1/2">
              <button
                onClick={() => setShowLicenseModal(true)}
                className="mr-3 hidden font-semibold text-primary-500 md:block"
              >
                Manage Licenses
              </button>
              <FilterButton
                isApplyFilter={isApplyFilter}
                setShowModel={setShowFilterModel}
                showModel={showFilterModel}
                setOpenDropdown={setOpenFilterDropdown}
                clearFilters={clearFilters}
              />
              <div className="team-actice w-full sm:w-[250px]">
                <Search
                  key={'search'}
                  inputRounded={true}
                  type="text"
                  name="search"
                  className="bg-[#eeeeee] pt-1 placeholder:text-[#616161]"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Users"
                />
              </div>
            </div>
          </div>
          {/* table */}
          <div className="overflow-x-scroll px-2 lg:overflow-x-visible lg:px-0">
            <div className="min-w-[800px] lg:w-full">
              {/* Table Head */}
              <div>
                <div className="grid grid-cols-8 items-center gap-4 rounded-lg bg-gray-200/70 px-2 py-2 text-sm font-semibold text-gray-700">
                  <p className="col-span-1 py-2 pl-4 text-left">User ID</p>
                  <p className="col-span-1 py-2 text-left">First Name</p>
                  <p className="col-span-1 py-2 text-left">Last Name</p>
                  <p className="col-span-2 py-2 text-left">Email Address</p>
                  <p className="col-span-1 py-2 text-center">Status</p>
                  <p className="col-span-1 py-2 text-center">Date Added</p>
                  <p className="col-span-1 flex justify-end py-2 pr-8">
                    {isBulkSelect ? (
                      <span className="flex items-center justify-end gap-2">
                        <button
                          className="text-sm text-[#0063F7]"
                          onClick={toggleBulkSelect}
                        >
                          Cancel
                        </button>
                        <CustomBlueCheckBox
                          checked={
                            filteredUsers.length > 0 &&
                            filteredUsers.every((user) =>
                              isItemSelected(user?._id || '')
                            )
                          }
                          onChange={(e: any) =>
                            handleSelectAll(e.target.checked)
                          }
                        />
                      </span>
                    ) : (
                      <button
                        className="text-sm text-[#0063F7]"
                        onClick={toggleBulkSelect}
                      >
                        Select
                      </button>
                    )}
                  </p>
                </div>
              </div>

              {/* Current User Row */}
              <div
                key={session?.user.user._id}
                className={`grid grid-cols-8 items-center gap-4 border-b-2 border-gray-300 bg-gray-50 px-2 py-1 opacity-50`}
              >
                <p className="col-span-1 truncate py-3 pl-4 text-sm text-gray-900">
                  {session?.user.user.userId}
                </p>
                <p className="col-span-1 truncate py-3 text-sm font-medium text-gray-800">
                  {session?.user.user.firstName}
                </p>
                <p className="col-span-1 truncate py-3 text-sm font-medium text-gray-800">
                  {session?.user.user.lastName}
                </p>
                <p className="col-span-2 truncate py-3 text-sm text-[#1E1E1E]">
                  {session?.user.user.email}
                </p>
                <p className="col-span-1 flex justify-center truncate py-3 text-sm text-gray-900">
                  <span
                    className={`${
                      !session?.user.user?.active
                        ? 'bg-[#FFA8A8]'
                        : 'bg-[#97F1BB]'
                    } rounded-lg px-2 py-1`}
                  >
                    {session?.user.user?.active ? 'Active' : 'Disable'}
                  </span>
                </p>
                <p className="col-span-1 flex justify-center truncate py-3 text-sm text-gray-700">
                  {
                    formatDateTime(
                      session?.user.user?.createdAt?.toString() ?? ''
                    ).date
                  }
                </p>
                {/* Empty placeholder to maintain grid alignment */}
                <div className="col-span-1" />
              </div>

              {/* Table Body */}
              {currentPageData.map(
                (e, index) =>
                  e._id !== session?.user.user._id && (
                    <div
                      key={e._id}
                      className={`grid grid-cols-8 items-center gap-4 border-b-2 border-gray-300 px-2 py-1 ${index % 2 !== 0 ? 'bg-gray-200/80' : 'bg-gray-50'}`}
                    >
                      <p className="col-span-1 truncate py-3 pl-4 text-sm text-gray-900">
                        {e.userId}
                      </p>
                      <p className="col-span-1 truncate py-3 text-sm font-medium text-gray-800">
                        {e.firstName}
                      </p>
                      <p className="col-span-1 truncate py-3 text-sm font-medium text-gray-800">
                        {e.lastName}
                      </p>
                      <p className="col-span-2 truncate py-3 text-sm text-gray-800">
                        {e.email}
                      </p>
                      <p className="col-span-1 flex justify-center truncate py-3 text-sm text-gray-900">
                        <span
                          className={`${
                            !e?.active ? 'bg-[#FFA8A8]' : 'bg-[#97F1BB]'
                          } rounded-lg px-2 py-1`}
                        >
                          {e?.active ? 'Active' : 'Disable'}
                        </span>
                      </p>
                      <p className="col-span-1 flex justify-center truncate py-3 text-sm text-gray-700">
                        {formatDateTime(e.createdAt ?? '').date}
                      </p>
                      <div className="col-span-1 flex items-center justify-end py-3 pr-8">
                        {isBulkSelect ? (
                          <CustomBlueCheckBox
                            checked={isItemSelected(e._id || '')}
                            onChange={() => handleSelect(e._id || '')}
                          />
                        ) : (
                          <Dropdown placement="bottom-end" className="">
                            <DropdownTrigger className="mr-2 cursor-pointer">
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
                            <DropdownMenu
                              className="!max-w-[160px] !rounded-xl bg-white"
                              aria-label="Dynamic Actions"
                            >
                              <DropdownItem
                                key="view"
                                onPress={() =>
                                  setSelectedModel({ action: 'view', model: e })
                                }
                              >
                                View
                              </DropdownItem>
                              <DropdownItem
                                key="edit"
                                onPress={() =>
                                  setSelectedModel({ action: 'edit', model: e })
                                }
                              >
                                Edit
                              </DropdownItem>
                              <DropdownItem
                                key="status"
                                onPress={() =>
                                  setSelectedModel({
                                    action: 'status',
                                    model: e,
                                  })
                                }
                              >
                                {e.active ? 'Disable User' : 'Enable User'}
                              </DropdownItem>
                              <DropdownItem
                                key="reset"
                                onPress={() =>
                                  setSelectedModel({
                                    action: 'reset',
                                    model: e,
                                  })
                                }
                              >
                                Reset Password
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                onPress={() =>
                                  setSelectedModel({
                                    action: 'delete',
                                    model: e,
                                  })
                                }
                              >
                                Delete
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        )}
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>{' '}
        </div>
        {/* footer - items per page at bottom */}
        <div className="z-20 mx-auto mt-auto flex w-full max-w-[1360px] shrink-0 flex-col items-end gap-2">
          <button
            className="mr-2 flex w-max items-center justify-center gap-1 rounded-full bg-primary-500 px-4 py-2 text-sm font-bold text-white hover:bg-primary-600/80 sm:text-base"
            onClick={() => {
              const quantity =
                session?.user.user.organization?.userLicense?.quantity ?? 0;
              const currentUsers = (users ?? []).length;
              const remainingLicense = quantity - currentUsers;
              if (quantity == 0 || remainingLicense <= 0) {
                setLicencesInfo(!licencesInfo);
              } else {
                setSelectedModel({ action: 'add' });
              }
            }}
          >
            <Plus />
            <span>Add </span>
          </button>

          <div className="flex h-[72px] w-full items-center justify-between space-x-4 rounded-t-xl border-2 border-gray-300 border-b-transparent bg-white px-4">
            <span className="text-sm text-gray-700 md:w-1/3">
              Items per page: {itemsPerPage}
            </span>
            <div className="flex items-center justify-center space-x-2 md:w-1/3">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-md px-2 py-1 text-lg text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaAngleLeft />
              </button>

              {/* Current Page */}
              <div className="rounded-lg border border-gray-700 px-3 py-1 text-gray-700">
                {currentPage}
              </div>

              {/* Total Pages */}
              <span className="text-sm text-gray-700">of {totalPages}</span>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-md px-2 py-1 text-lg text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaAngleRight />
              </button>
            </div>
            <div className="hidden w-1/3 md:block">
              {isBulkSelect && (
                <div className="flex items-center justify-end gap-2">
                  <button className="h-11 w-1/2 rounded-lg text-sm text-primary-500 sm:h-12 sm:w-36 sm:text-base"></button>
                  <Button
                    variant="text"
                    onClick={() => {
                      setSelectedModel(undefined);
                      toggleBulkSelect();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    disabled={selectedIds.length === 0}
                    onClick={() => setSelectedModel({ action: 'bulk' })}
                  >
                    Select ({selectedIds.length})
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* modify licenses modal */}
      {showLicenseModal && (
        <ModifyLicenses
          onClose={setShowLicenseModal}
          onSubmit={async (newTotal?: number) => {
            if (typeof newTotal === 'number' && update) {
              try {
                // Update session with full structure to preserve all token fields
                await update({
                  user: {
                    ...(session?.user ?? {}),
                    user: {
                      ...(session?.user?.user ?? {}),
                      organization: {
                        ...(session?.user?.user?.organization ?? {}),
                        userLicense: {
                          ...(session?.user?.user?.organization?.userLicense ??
                            {}),
                          quantity: newTotal,
                        },
                      },
                    },
                  },
                });
              } catch (_) {}
            }
            await queryClient.invalidateQueries('users');
            if (isOpenNew) setSelectedModel({ action: 'add' });
          }}
        />
      )}
      {/* filters modal */}
      <Modal
        isOpen={showFilterModel}
        onOpenChange={() => setShowFilterModel(!showFilterModel)}
        placement="auto"
        size="lg"
        className="absolute h-[700px] px-8 py-2"
      >
        <ModalContent className="max-w-[600px] rounded-3xl bg-white">
          {(onCloseModal) => (
            <>
              <ModalHeader className="flex flex-row items-center gap-2 border-b-2 border-gray-200 px-1 py-5">
                <div>
                  <h2 className="text-xl font-semibold">Filter By</h2>
                  <p className="mt-1 text-sm font-normal text-[#616161]">
                    Filter by the following selections and options.
                  </p>
                </div>
              </ModalHeader>
              <ModalBody className="flex flex-col justify-start gap-8 overflow-y-scroll p-0 pb-16 pt-8 scrollbar-hide">
                <div className="w-full">
                  <DateRangePicker
                    title="Created Date Range"
                    handleOnConfirm={(from: Date, to: Date) => {
                      setFilterDates({ from, to });
                    }}
                    selectedDate={filterDates}
                  />
                </div>

                {/* <div className="w-full">
                  <CustomSearchSelect
                    label="Customer"
                    data={[
                      {
                        label: 'All',
                        value: 'all',
                      },
                      ...(users ?? []).map((user) => ({
                        label: `${user.firstName} ${user.lastName}`,
                        value: user._id ?? '',
                      })),
                    ]}
                    showImage={false}
                    multiple={true}
                    isOpen={openFilterDropdown === 'dropdown2'}
                    onToggle={() => handleDropdown('dropdown2')}
                    onSelect={(selected: string[]) => {}}
                    placeholder="-"
                    searchPlaceholder="Search Users"
                    selected={[]}
                  />
                </div> */}

                <div className="w-full">
                  <label
                    htmlFor=""
                    className="cursor-pointer font-semibold text-[#1E1E1E]"
                  >
                    User Status
                  </label>

                  <ul className="flex w-full flex-col items-start gap-4 py-3">
                    <li className="flex items-center gap-3">
                      <CustomBlueCheckBox
                        checked={filterActiveCheck}
                        onChange={() => {
                          setFilterActiveChecked(!filterActiveCheck);
                        }}
                      />
                      <label
                        htmlFor="check"
                        className="cursor-pointer font-normal text-[#1E1E1E]"
                      >
                        Active
                      </label>
                    </li>

                    <li className="flex items-center gap-3">
                      <CustomBlueCheckBox
                        checked={filterDisableCheck}
                        onChange={() => {
                          setFilterDisableChecked(!filterDisableCheck);
                        }}
                      />
                      <label
                        htmlFor="check"
                        className="cursor-pointer font-normal text-[#1E1E1E]"
                      >
                        Disabled
                      </label>
                    </li>
                  </ul>
                </div>

                {/* <div className="w-full">
                  <label
                    htmlFor=""
                    className="cursor-pointer font-semibold text-[#1E1E1E]"
                  >
                    Filter by User Admin permissions
                  </label>

                  <ul className="flex w-full flex-col items-start gap-4 py-3">
                    {permissionOptions.map((item, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CustomBlueCheckBox
                          checked={checkedStates[item]}
                          onChange={() => toggleCheckbox(item)}
                        />
                        <label
                          htmlFor={`check-${index}`}
                          className="cursor-pointer font-normal text-[#1E1E1E]"
                        >
                          {item}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div> */}
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
      {/* no users info message modal */}
      <CustomInfoModal
        isOpen={licencesInfo}
        title={'No Licenses Available'}
        imageValue="/svg/org/disable_user.svg"
        handleClose={() => {
          setLicencesInfo(false);
        }}
        onDeleteButton={() => {}}
        doneValue={
          <span
            onClick={() => {
              setShowLicenseModal(true);
              setLicencesInfo(false);
              setModelOpen(true);
            }}
          >
            Add Now
          </span>
        }
        subtitle={`You do not have any available licenses. You will need to purchase additional licenses to add more users.`}
        variant="primary"
      />

      {/* /// view the detail  */}
      <CustomModal
        isOpen={selectedModel?.action == 'view'}
        size="md"
        header={
          <>
            <img src="/svg/org/user_view.svg" alt="" />
            <div>
              <h2 className="text-xl font-semibold text-[#1E1E1E]">
                View User Details
              </h2>
              <span className="mt-1 text-base font-normal text-[#616161]">
                View User Details below.
              </span>
            </div>
          </>
        }
        body={
          <div className="h-[500px] px-4 py-3">
            <ul className="flex flex-col gap-5">
              <li className="flex flex-col space-y-2">
                <label className="!font-light text-gray-700">User ID</label>
                <p className="font-semibold">{selectedModel?.model?.userId}</p>
              </li>

              <li className="flex flex-col space-y-2">
                <label className="!font-light text-gray-700">First Name</label>
                <p className="font-normal">{selectedModel?.model?.firstName}</p>
              </li>

              <li className="flex flex-col space-y-2">
                <label className="!font-light text-gray-700">Last Name</label>
                <p className="font-normal">{selectedModel?.model?.lastName}</p>
              </li>

              <li className="flex flex-col space-y-2">
                <label className="!font-light text-gray-700">
                  Contact Phone
                </label>
                <p className="font-normal">999 888 8777</p>
              </li>

              <li className="flex flex-col space-y-2">
                <label className="!font-light text-gray-700">
                  Email Address
                </label>
                <p className="font-normal">{selectedModel?.model?.email}</p>{' '}
              </li>
            </ul>
          </div>
        }
        handleCancel={() => {
          setSelectedModel(undefined);
        }}
        handleSubmit={() => {
          setSelectedModel({
            action: 'edit',
            model: selectedModel?.model,
          });
        }}
        variant="text"
        cancelvariant="text"
        submitValue={'Edit'}
        cancelButton="Close"
      />
      {/* { Delete user } */}
      <CustomInfoModal
        isOpen={
          selectedModel?.action == 'delete' ||
          selectedModel?.action == 'multi-delete'
        }
        cancelButton={
          selectedModel?.action == 'multi-delete' ? 'Back' : 'Cancel'
        }
        title={
          selectedModel?.action == 'delete'
            ? `Delete User`
            : `Delete Users (${selectedIds.length})`
        }
        handleClose={() => {
          if (selectedModel?.action == 'multi-delete') {
            setSelectedModel({ action: 'bulk' });
          } else {
            setSelectedModel(undefined);
          }
        }}
        onDeleteButton={() => {
          if (selectedModel?.action == 'delete') {
            singleDelteMutation.mutate({
              axiosAuth,
              id: selectedModel.model?._id!,
            });
          } else {
            deleteMultiUsersMutation.mutate({
              axiosAuth,
              data: { ids: selectedIds },
            });
          }
        }}
        doneValue={
          singleDelteMutation.isLoading ||
          deleteMultiUsersMutation.isLoading ? (
            <>
              <Loader />
            </>
          ) : (
            <>Delete</>
          )
        }
        subtitle={`Are you sure you want to delete user. All projects owned by the user will be transferred to the organization admin user`}
      />
      {/* { Change status of user } */}
      <CustomInfoModal
        isOpen={
          selectedModel?.action == 'status' ||
          selectedModel?.action == 'multi-disable' ||
          selectedModel?.action == 'multi-enable'
        }
        title={
          selectedModel?.action == 'status' ? (
            <>{selectedModel.model?.active ? 'Disable User' : 'Enable User'}</>
          ) : (
            <>
              {selectedModel?.action == 'multi-disable'
                ? `Disable Users (${selectedIds.length})`
                : `Enable Users (${selectedIds.length})`}
            </>
          )
        }
        imageValue="/svg/org/disable_user.svg"
        cancelButton={
          selectedModel?.action == 'multi-disable' ||
          selectedModel?.action == 'multi-enable'
            ? 'Back'
            : 'Cancel'
        }
        handleClose={() => {
          if (
            selectedModel?.action == 'multi-disable' ||
            selectedModel?.action == 'multi-enable'
          ) {
            setSelectedModel({ action: 'bulk' });
          } else {
            setSelectedModel(undefined);
          }
        }}
        onDeleteButton={() => {
          if (selectedModel?.action == 'status') {
            toggleUserStatusMutation.mutate({
              axiosAuth,
              id: selectedModel?.model?._id!,
              active: !selectedModel?.model?.active,
            });
          } else {
            udpateMultiStatusMutation.mutate({
              axiosAuth,
              data: {
                ids: selectedIds,
                status: selectedModel?.action == 'multi-disable' ? false : true,
              },
            });
          }
        }}
        doneValue={
          toggleUserStatusMutation.isLoading ||
          udpateMultiStatusMutation.isLoading ? (
            <>
              <Loader />
            </>
          ) : (
            <>Confirm</>
          )
        }
        subtitle={
          selectedModel?.model?.active
            ? `User will be logged out of all sessoins and will not be able to log back until enabled.`
            : 'User will be able to log back in and access the platform'
        }
        variant="primary"
      />
      {/*Add or Edit the user  */}
      <CustomModal
        size="md"
        isOpen={
          selectedModel?.action == 'edit' || selectedModel?.action == 'add'
        }
        header={
          <>
            <img src="/svg/org/user_view.svg" alt="" />
            <div>
              <h2 className="text-xl font-semibold text-[#1E1E1E]">
                {selectedModel?.action == 'add' ? 'Add User' : 'Edit User'}
              </h2>
              <span className="mt-1 text-base font-normal text-[#616161]">
                {selectedModel?.action == 'add'
                  ? 'Add user details below.'
                  : ' Edit user details below.'}
              </span>
            </div>
          </>
        }
        body={
          <div className="flex flex-col gap-4">
            <SimpleInput
              type="text"
              label="First Name"
              placeholder="Enter first name"
              name="firstName"
              className="w-full"
              required
              errorMessage={userUpdateForm.errors.firstName}
              value={userUpdateForm.values.firstName}
              isTouched={userUpdateForm.touched.firstName}
              onChange={userUpdateForm.handleChange}
            />

            <SimpleInput
              type="text"
              label="Last Name"
              placeholder="Enter last name"
              name="lastName"
              className="w-full"
              required
              errorMessage={userUpdateForm.errors.lastName}
              value={userUpdateForm.values.lastName}
              isTouched={userUpdateForm.touched.lastName}
              onChange={userUpdateForm.handleChange}
            />

            <SimpleInput
              type="text"
              label="Contact Phone"
              placeholder="Enter phone number"
              name="phone"
              className="w-full"
              errorMessage={userUpdateForm.errors.phone}
              value={userUpdateForm.values.phone}
              isTouched={userUpdateForm.touched.phone}
              onChange={userUpdateForm.handleChange}
            />

            <SimpleInput
              type="text"
              label="Email Address"
              placeholder="Enter user email address"
              name="email"
              className="w-full"
              required
              errorMessage={userUpdateForm.errors.email}
              value={userUpdateForm.values.email}
              isTouched={userUpdateForm.touched.email}
              onChange={userUpdateForm.handleChange}
            />

            {selectedModel?.action == 'add' && (
              <div>
                <SimpleInput
                  type={'text'}
                  label="Create Password"
                  placeholder="Enter password"
                  name="password"
                  className="relative"
                  isSuffixButton={true}
                  isSufficButtonClick={() => {
                    userUpdateForm.setFieldValue(
                      'password',
                      generateRandomPassword()
                    );
                  }}
                  required
                  errorMessage={userUpdateForm.errors.password}
                  value={userUpdateForm.values.password}
                  isTouched={userUpdateForm.touched.password}
                  onChange={userUpdateForm.handleChange}
                />

                <p className="px-1 text-sm font-normal text-gray-500">
                  Minimum 8 characters with a combination of uppercase,
                  lowercase letters and numbers
                </p>
                <div className="flex items-center gap-3 py-5">
                  <CustomBlueCheckBox
                    checked={checked}
                    onChange={() => setChecked(!checked)}
                  />
                  <label className={'block text-base font-normal text-black'}>
                    Send password and login details to user's email.
                  </label>
                </div>
              </div>
            )}
          </div>
        }
        handleCancel={() => {
          setSelectedModel(undefined);
        }}
        handleSubmit={() => {
          userUpdateForm.submitForm();
        }}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
        submitValue={
          selectedModel?.action == 'add' ? 'Add User' : 'Update User'
        }
      />
      {/* show bulk select action  */}

      <CustomModal
        size="md"
        isOpen={selectedModel?.action === 'bulk'}
        header={
          <>
            <img src="/svg/org/pencil.svg" alt="" />
            <div>
              <h2 className="text-xl font-semibold text-[#1E1E1E]">
                Bulk Select Options
              </h2>
              <span className="mt-1 text-base font-normal text-[#616161]">
                Select an option below.
              </span>
            </div>
          </>
        }
        body={
          <ul>
            {['Enable User', 'Disable User', 'Delete User'].map(
              (option, index) => (
                <li key={option} className="gap-3 px-4 py-1">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      id={option}
                      name="option"
                      checked={bulkAction === index}
                      onChange={(e) => setBulkAction(index)}
                      className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                </li>
              )
            )}
          </ul>
        }
        handleCancel={() => {
          setSelectedModel(undefined);
          setBulkAction(0);
        }}
        handleSubmit={() => {
          if (bulkAction === 0) {
            setSelectedModel({
              action: 'multi-enable',
            });
          }
          if (bulkAction === 1) {
            setSelectedModel({
              action: 'multi-disable',
            });
          }
          if (bulkAction === 2) {
            setSelectedModel({
              action: 'multi-delete',
            });
          }
        }}
        submitValue={'Confirm'}
      />

      {/* // Passwrod reset  */}
      <CustomModal
        size="md"
        isOpen={selectedModel?.action === 'reset'}
        header={
          <>
            <img src="/svg/org/user_view.svg" alt="" />
            <div>
              <h2 className="text-xl font-semibold text-[#1E1E1E]">
                Password Reset
              </h2>
              <span className="mt-1 text-base font-normal text-[#616161]">
                Reset user's password below.
              </span>
            </div>
          </>
        }
        body={
          <div className="h-[500px] overflow-auto px-4">
            <ul className="flex flex-col gap-2">
              <li className="flex flex-col space-y-1">
                <label className="font-light text-gray-700">User ID</label>
                <p className="font-semibold">{selectedModel?.model?.userId}</p>
              </li>

              <li className="flex flex-col space-y-1">
                <label className="font-light text-gray-700">First Name</label>
                <p className="font-normal">{selectedModel?.model?.firstName}</p>
              </li>

              <li className="flex flex-col space-y-1">
                <label className="font-light text-gray-700">Last Name</label>
                <p className="font-normal">{selectedModel?.model?.lastName}</p>
              </li>

              <li className="flex flex-col space-y-1">
                <label className="font-light text-gray-700">
                  Contact Phone
                </label>
                <p className="font-normal">999 888 8777</p>
              </li>

              <li className="flex flex-col space-y-2">
                <label className="font-light text-gray-700">
                  Email Address
                </label>
                <p className="font-normal">{selectedModel?.model?.email}</p>{' '}
              </li>

              <div className="mt-2">
                <SimpleInput
                  type={'text'}
                  label="Create Password"
                  placeholder="Enter password"
                  name="resetPasswrod"
                  className="relative"
                  isSuffixButton={true}
                  isSufficButtonClick={() => {
                    setPasswordValue(generateRandomPassword());
                  }}
                  required
                  onChange={(e) => {
                    setPasswordValue(e.target.value);
                  }}
                  value={resetPasswrod}
                />

                <p className="px-1 text-sm font-normal text-gray-500">
                  Minimum 8 characters with a combination of uppercase,
                  lowercase letters and numbers
                </p>
                <div className="flex items-center gap-3 py-5">
                  <CustomBlueCheckBox
                    checked={checked}
                    onChange={() => setChecked(!checked)}
                  />
                  <label className={'block text-base font-normal text-black'}>
                    Send password and login details to user's email.
                  </label>
                </div>
              </div>
            </ul>
          </div>
        }
        handleCancel={(val: boolean) => {
          setSelectedModel(undefined);
          setChecked(false);
        }}
        handleSubmit={() => {
          udpateUserPasswordMutation.mutate({
            axiosAuth,
            data: {
              password: resetPasswrod,
              id: selectedModel?.model?._id,
              mail: checked,
            },
          });
        }}
        isLoading={udpateUserPasswordMutation.isLoading}
        submitDisabled={!passwordPattern.test(resetPasswrod)}
        submitValue={'Confirm'}
      />
      {/* After submitting password  */}
      <CustomInfoModal
        isOpen={selectedModel?.action === 'reset-finish'}
        isCancelHide={true}
        title={'Password has been reset'}
        handleClose={(val: boolean) => {
          setSelectedModel(undefined);
        }}
        imageValue="/svg/org/smile.svg"
        onDeleteButton={() => {
          setSelectedModel(undefined);
        }}
        variant="primary"
        doneValue={
          false ? (
            <>
              <Loader />
            </>
          ) : (
            <>Finish</>
          )
        }
        subtitle={`Password has been reset for user ${selectedModel?.model?.email}. User will need to log back in with new password.`}
      />
      {/* After create user  */}
      <CustomInfoModal
        isOpen={selectedModel?.action === 'add-finish'}
        handleArrow={() => {
          setSelectedModel(undefined);
        }}
        title={'Successfully added user'}
        handleClose={(val: boolean) => {
          const quantity =
            session?.user.user.organization?.userLicense.quantity;
          const remainingLicense = (users ?? []).length;
          if (quantity == 0 || quantity === remainingLicense) {
            setLicencesInfo(!licencesInfo);
          } else {
            setSelectedModel({ action: 'add' });
          }
        }}
        imageValue="/svg/org/smile.svg"
        onDeleteButton={() => {
          setSelectedModel(undefined);
        }}
        cancelButton="Add another"
        cancelvariant="text"
        variant="primary"
        doneValue={
          false ? (
            <>
              <Loader />
            </>
          ) : (
            <>Finish</>
          )
        }
        subtitle={`User ‘${selectedModel?.model?.email}’ has been sucessfully added. Please click on the activation link sent to the user’s email to activate.`}
      />
      {/* After update user  */}
      <CustomInfoModal
        isOpen={selectedModel?.action === 'edit-finish'}
        isCancelHide={true}
        title={'Successfully updated user'}
        handleClose={(val: boolean) => {
          setSelectedModel(undefined);
        }}
        imageValue="/svg/org/smile.svg"
        onDeleteButton={() => {
          setSelectedModel(undefined);
        }}
        variant="primary"
        doneValue={
          false ? (
            <>
              <Loader />
            </>
          ) : (
            <>Finish</>
          )
        }
        subtitle={`User ‘${selectedModel?.model?.email}’ has been sucessfully updated. If you have changed the email address you will need to click on the activation link to confirm the new email.`}
      />

      {/* No license  */}
      <CustomInfoModal
        isOpen={noLicense}
        title={'No license available'}
        imageValue="/svg/org/disable_user.svg"
        handleClose={() => {
          setNoLicense(false);
        }}
        onDeleteButton={() => {}}
        doneValue={
          false ? (
            <>
              <Loader />
            </>
          ) : (
            <>Confirm</>
          )
        }
        subtitle={
          'You do not have any available licenses. You will need to purchase additional licenses to add more users.'
        }
        variant="primary"
      />
    </>
  );
}
const generateRandomPassword = () => {
  const length = 10;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialCharacters = '!@#$%^&*()_+-=[]{}|;:<>?';

  // Ensure at least one character from each category
  let password = '';
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += specialCharacters.charAt(
    Math.floor(Math.random() * specialCharacters.length)
  );

  // Fill the remaining length with random characters from all categories
  const allCharacters = uppercase + lowercase + numbers + specialCharacters;
  for (let i = 4; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allCharacters.length);
    password += allCharacters.charAt(randomIndex);
  }

  // Shuffle the password to avoid predictable patterns
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};

export { UserList };
