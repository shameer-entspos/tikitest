import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  createTeam,
  deleteTeam,
  editTeam,
  getTeams,
} from '@/app/(main)/(org-panel)/organization/teams/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AddedTeamDetailModel } from '@/app/type/addedTeamDetailModel';
import { Search } from '../Form/search';
import { SelectOption } from '../Form/select';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { FaAngleLeft, FaAngleRight, FaFilter } from 'react-icons/fa';
import { Plus } from 'lucide-react';
import Loader from '../DottedLoader/loader';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import CustomInfoModal from '../CustomDeleteModel';
import { SimpleInput } from '../Form/simpleInput';
import CustomModal from '../Custom_Modal';
import { useSession } from 'next-auth/react';
import { getAllOrgUsers } from '@/app/(main)/(user-panel)/user/apps/api';
import { CustomBlueCheckBox } from '../Custom_Checkbox/Custom_Blue_Checkbox';

function TeamList() {
  const options = [
    'Recent Added',
    'First Name A-Z',
    'First Name Z-A',
    'Last Name  A-Z',
    'Last Name Z-A',
  ];
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const [selectedModel, setSelectedModel] = useState<
    | {
        action: 'delete' | 'members' | 'edit' | 'add';
        model?: AddedTeamDetailModel;
      }
    | undefined
  >(undefined);
  const [sortValue, setSortValue] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>('Recent Added');
  const selectOption = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
  };
  const [searchQuery, setSearchQuery] = useState<string>('');

  const deleteTeamMutation = useMutation(deleteTeam, {
    onSuccess: () => {
      setSelectedModel(undefined);
      // fetchA nd Delete selected Model
      queryClient.setQueryData('teams', (oldData: any) => {
        if (oldData) {
          const updatedData = oldData.filter(
            (team: any) => team._id !== selectedModel?.model?._id
          );
          return updatedData;
        }
        return oldData;
      });
    },
  });
  const createTeamMutation = useMutation(createTeam, {
    onSuccess: () => {
      setSelectedModel(undefined);
      organizationForm.resetForm();
      queryClient.invalidateQueries('teams');
    },
  });

  const updateTeamMutation = useMutation(editTeam, {
    onSuccess: () => {
      setSelectedModel(undefined);
      organizationForm.resetForm();
      queryClient.invalidateQueries('teams');
    },
  });
  const { data: users } = useQuery({
    queryKey: 'listofUsersForApp',
    queryFn: () => getAllOrgUsers(axiosAuth),
    refetchOnWindowFocus: false,
  });
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('name is required'),
  });
  const organizationForm = useFormik({
    initialValues: {
      name: selectedModel?.model?.name ?? '',
      description: selectedModel?.model?.description ?? '',
      color: selectedModel?.model?.color ?? '#EB8357',
      members:
        selectedModel?.model?.members?.map((user: any) => user._id) ?? [],
    },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      setSelectedModel({
        action: 'members',
      });
    },
  });

  // pagination
  const itemsPerPage = 50;
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data, isLoading } = useQuery({
    queryKey: 'teams',
    queryFn: () => getTeams(axiosAuth),
  });

  const [searchTerm, setSearchTerm] = useState('');
  if (isLoading) {
    return <Loader />;
  }

  const filteredTeams = (data ?? [])
    .filter((team) =>
      team?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a.name === 'Everyone') return -1; // "Everyone" always first
      if (b.name === 'Everyone') return 1;

      // Alphabetical sort for other teams
      if (a.name && b.name) {
        return !sortValue
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }

      return 0;
    });

  // Get current page's data
  const currentPageData = filteredTeams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  //----------------

  return (
    <>
      <div className="flex min-h-full w-full max-w-[1360px] flex-1 flex-col">
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
                    width="30"
                    height="30"
                    viewBox="0 0 30 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.4425 12.5C19.65 12.5 20.63 13.48 20.63 14.6875V20.6238C20.63 22.1159 20.0372 23.547 18.9821 24.6021C17.927 25.6572 16.4959 26.25 15.0037 26.25C13.5116 26.25 12.0805 25.6572 11.0254 24.6021C9.97026 23.547 9.3775 22.1159 9.3775 20.6238V14.6875C9.3775 13.48 10.3562 12.5 11.565 12.5H18.4425ZM8.91375 12.5C8.46208 13.041 8.19108 13.7097 8.13875 14.4125L8.12625 14.6875V20.6238C8.12625 21.6825 8.36625 22.685 8.79375 23.58C8.38042 23.6925 7.94917 23.7492 7.5 23.75C6.84329 23.75 6.193 23.6206 5.58629 23.3693C4.97958 23.1179 4.42833 22.7495 3.96402 22.2851C3.49972 21.8207 3.13144 21.2693 2.88024 20.6626C2.62904 20.0558 2.49984 19.4055 2.5 18.7487V14.6875C2.50002 14.1385 2.70646 13.6096 3.07835 13.2058C3.45024 12.8019 3.96037 12.5527 4.5075 12.5075L4.6875 12.5H8.91375ZM21.0938 12.5H25.3125C26.52 12.5 27.5 13.48 27.5 14.6875V18.75C27.5002 19.5165 27.3241 20.2727 26.9855 20.9603C26.6468 21.6479 26.1547 22.2484 25.547 22.7155C24.9393 23.1825 24.2323 23.5036 23.4807 23.654C22.7292 23.8043 21.9531 23.7799 21.2125 23.5825C21.5875 22.7975 21.8175 21.9325 21.8688 21.0175L21.88 20.6238V14.6875C21.88 13.8562 21.5863 13.0938 21.0938 12.5ZM15 3.75C15.9946 3.75 16.9484 4.14509 17.6517 4.84835C18.3549 5.55161 18.75 6.50544 18.75 7.5C18.75 8.49456 18.3549 9.44839 17.6517 10.1517C16.9484 10.8549 15.9946 11.25 15 11.25C14.0054 11.25 13.0516 10.8549 12.3483 10.1517C11.6451 9.44839 11.25 8.49456 11.25 7.5C11.25 6.50544 11.6451 5.55161 12.3483 4.84835C13.0516 4.14509 14.0054 3.75 15 3.75ZM23.125 5C23.9538 5 24.7487 5.32924 25.3347 5.91529C25.9208 6.50134 26.25 7.2962 26.25 8.125C26.25 8.9538 25.9208 9.74866 25.3347 10.3347C24.7487 10.9208 23.9538 11.25 23.125 11.25C22.2962 11.25 21.5013 10.9208 20.9153 10.3347C20.3292 9.74866 20 8.9538 20 8.125C20 7.2962 20.3292 6.50134 20.9153 5.91529C21.5013 5.32924 22.2962 5 23.125 5ZM6.875 5C7.7038 5 8.49866 5.32924 9.08471 5.91529C9.67076 6.50134 10 7.2962 10 8.125C10 8.9538 9.67076 9.74866 9.08471 10.3347C8.49866 10.9208 7.7038 11.25 6.875 11.25C6.0462 11.25 5.25134 10.9208 4.66529 10.3347C4.07924 9.74866 3.75 8.9538 3.75 8.125C3.75 7.2962 4.07924 6.50134 4.66529 5.91529C5.25134 5.32924 6.0462 5 6.875 5Z"
                      fill="#0063F7"
                    />
                  </svg>
                </span>
                <h3 className="text-lg font-bold text-black md:text-xl lg:text-2xl">
                  Manage Teams
                </h3>
              </div>

              <p className="ml-2 text-center text-sm font-normal text-gray-900 md:text-base">
                {(filteredTeams ?? []).length} Teams Active
              </p>
            </div>

            {/* buttons and search */}
            <div className="page-heading-edit flex items-center justify-end gap-2 sm:gap-3 xl:w-1/2">
              <div className="team-actice w-full sm:w-[300px]">
                <Search
                  key={'search'}
                  inputRounded={true}
                  type="text"
                  className="bg-[#eeeeee] pt-1 placeholder:text-[#616161]"
                  name="search"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Teams"
                />
              </div>
            </div>
          </div>
          {/* table */}
          <div className="overflow-x-scroll px-2 lg:overflow-x-visible lg:px-0">
            <div className="w-[800px] table-auto lg:w-full">
              {/* Table Head */}
              <div>
                <div className="grid grid-cols-6 items-center gap-4 bg-gray-200/70 px-2 py-1 text-sm font-semibold text-gray-700">
                  <p className="px-4 py-2 text-left">Team ID</p>

                  {/* Team Name takes up 2 columns */}
                  <div
                    className="col-span-3 flex"
                    onClick={() => setSortValue(!sortValue)}
                  >
                    <p className="px-1 py-2 text-left">Team Name</p>
                    <img src="/svg/double_arrow.svg" alt="double_arrow" />
                  </div>

                  <p className="px-4 py-2 text-end">Members</p>
                  <p className="px-4 py-2 text-center"></p>
                </div>
              </div>

              {/* Table Body */}
              {currentPageData.map((e, index) => (
                <div
                  key={index}
                  className={`grid w-full cursor-pointer grid-cols-6 items-center gap-4 rounded-l-xl border-b-2 border-l-[10px] border-b-gray-300 px-4 py-1.5 md:grid-cols-6 ${index % 2 !== 0 ? 'bg-gray-100' : 'bg-white'} my-1 w-full`}
                  style={{
                    borderLeftColor: `${e.color?.toString() ?? '0063F7'}`, // Dynamic color
                  }}
                >
                  <span className="truncate px-4 text-sm font-medium text-gray-800">
                    {e.teamId}
                  </span>

                  {/* Team Name */}
                  <span className="col-span-3 flex w-full justify-start truncate px-4 text-sm font-medium text-gray-800 md:col-span-3">
                    {e.name}
                  </span>

                  {/* Members */}
                  <span className="truncate px-4 text-end text-sm text-gray-700">
                    {e.members?.length}
                  </span>

                  {/* Actions */}
                  <div
                    className={`flex items-center justify-end px-4 ${e.name !== 'Everyone' ? 'py-2' : 'py-5'}`}
                  >
                    {e.name !== 'Everyone' && (
                      <Dropdown placement="bottom-end" className="">
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
                        <DropdownMenu
                          aria-label="Dynamic Actions"
                          className="!max-w-[100px] !rounded-xl bg-white"
                        >
                          <DropdownItem
                            key="members"
                            onPress={() => {
                              setSelectedModel({
                                action: 'members',
                                model: e,
                              });
                            }}
                          >
                            Members
                          </DropdownItem>

                          <DropdownItem
                            key="edit"
                            onPress={() => {
                              setSelectedModel({
                                action: 'edit',
                                model: e,
                              });
                            }}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            onPress={() => {
                              setSelectedModel({
                                action: 'delete',
                                model: e,
                              });
                            }}
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* footer - items per page at bottom */}
        <div className="z-20 mx-auto mt-auto flex w-full max-w-[1360px] shrink-0 flex-col items-end gap-2">
          <button
            className="mr-2 flex w-max items-center justify-center gap-1 rounded-full bg-primary-500 px-4 py-2 text-sm font-bold text-white hover:bg-primary-600/80 sm:text-base"
            onClick={() => {
              setSelectedModel({
                action: 'add',
              });
            }}
          >
            <Plus />
            <span>Add Team</span>
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
            <div className="hidden w-1/3 md:block"></div>
          </div>
        </div>
      </div>
      {/* //Delete Team */}
      {selectedModel?.action == 'delete' && (
        <CustomInfoModal
          title={'Delete Team'}
          subtitle={
            <>
              <div className="">
                Are you sure you want to delete this team
                <span className="font-bold">{` ‘${selectedModel.model?.name}’ `}</span>
                {`. Members from this team will be removed from assigned projects.`}
              </div>
            </>
          }
          doneValue={deleteTeamMutation.isLoading ? <Loader /> : 'Delete'}
          handleClose={() => {
            setSelectedModel(undefined);
          }}
          onDeleteButton={() => {
            deleteTeamMutation.mutate({
              axiosAuth,
              id: selectedModel.model?._id!,
            });
          }}
        />
      )}
      {/* // add team  */}
      <CustomModal
        isOpen={
          selectedModel?.action === 'add' || selectedModel?.action === 'edit'
        }
        header={
          <>
            <img src="/svg/org/add_team.svg" alt="add_team" />
            <div>
              <h2 className="text-xl font-semibold text-[#1E1E1E]">
                {'Add Team'}
              </h2>
              <span className="mt-1 text-base font-normal text-[#616161]">
                {'Add team details below.'}
              </span>
            </div>
          </>
        }
        body={
          <div className="flex h-[500px] flex-col overflow-auto px-6">
            <div className="mb-4">
              <SimpleInput
                type="text"
                label="Team Name"
                placeholder="Enter team name"
                name="name"
                className="w-full"
                required
                errorMessage={organizationForm.errors.name}
                value={organizationForm.values.name}
                isTouched={organizationForm.touched.name}
                onChange={organizationForm.handleChange}
              />
            </div>
            <div className="mb-6">
              <label className="mb-2 block" htmlFor="description">
                Team Description
              </label>
              <textarea
                rows={4}
                id="description"
                name="description"
                placeholder="Describe the team"
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
            <SelectOption
              variant="simpleSlectColor"
              label="Team Color"
              showColorFromTeam={true}
              name="Organisation_name"
              selectedOption={organizationForm.values.color}
              handleSelectedOption={(color: any) => {
                organizationForm.setFieldValue('color', color);
              }}
            />
          </div>
        }
        handleCancel={() => {
          setSelectedModel(undefined);
        }}
        handleSubmit={() => {
          if (selectedModel?.model) {
            updateTeamMutation.mutate({
              axiosAuth,
              id: selectedModel.model._id!,
              data: organizationForm.values,
            });
          } else {
            organizationForm.submitForm();
          }
        }}
        isLoading={updateTeamMutation.isLoading}
        submitValue={selectedModel?.model?._id ? 'Save' : 'Next'}
      />
      <CustomModal
        size="md"
        isOpen={selectedModel?.action === 'members'}
        header={
          <>
            <img src="/svg/org/add_team.svg" alt="add_team" />
            <div>
              <h2 className="text-xl font-semibold text-[#1E1E1E]">
                {'Add Team Members'}
              </h2>
              <span className="mt-1 text-base font-normal text-[#616161]">
                {'Add team members below.'}
              </span>
            </div>
          </>
        }
        body={
          <div className="flex h-[500px] flex-col overflow-auto px-3">
            <div className="flex flex-row items-center">
              {/* SearchBox */}
              <div className="Search team-actice flex items-center justify-between">
                <Search
                  inputRounded={true}
                  type="search"
                  className="rounded-md bg-[#eeeeee] text-xs placeholder:text-[#616161] md:text-sm"
                  name="search"
                  placeholder="Search Requests"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {/* CustomDropdown */}
              <div className="DropDownn relative z-50 mx-3 inline-block text-left">
                <div>
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-[#E2F3FF] px-3 py-[5px] text-sm font-medium text-gray-700 shadow-sm hover:bg-[#e1f0fa] focus:outline-none"
                    id="options-menu"
                    aria-expanded="true"
                    aria-haspopup="true"
                    onClick={() => setIsOpen(true)}
                  >
                    {selectedOption}
                    <svg
                      className="-mr-1 ml-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
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
                      {options.map((option) => (
                        <button
                          key={option}
                          onClick={() => selectOption(option)}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mb-1 mt-4 flex items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-xs">
              <div className="flex items-center">
                <img src="/user.svg" alt="" className="mr-2 h-10 w-10" />
                <span className="text-medium">{`Me`}</span>
              </div>
              <CustomBlueCheckBox
                checked={organizationForm.values.members.includes(
                  session?.user.user._id
                )}
                onChange={() => {
                  organizationForm.setFieldValue(
                    'members',
                    organizationForm.values.members.includes(
                      session?.user.user._id
                    )
                      ? organizationForm.values.members.filter(
                          (item) => item !== session?.user.user._id
                        )
                      : [
                          ...organizationForm.values.members,
                          session?.user.user._id,
                        ]
                  );
                }}
              />
            </div>
            {(users ?? [])
              .filter((user) => user.role == 2)
              .map((user, index) => {
                return (
                  <>
                    {user._id !== session?.user.user._id && (
                      <div
                        className="my-1 flex items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-xs"
                        key={index}
                      >
                        <div className="flex items-center">
                          <img
                            src="/user.svg"
                            alt=""
                            className="mr-2 h-10 w-10"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm text-[#1E1E1E]">{`${user.firstName} ${user.lastName}`}</span>
                            <span className="text-xs text-[#616161]">{`${user.email}`}</span>
                          </div>
                        </div>
                        <CustomBlueCheckBox
                          onChange={() => {
                            organizationForm.setFieldValue(
                              'members',
                              organizationForm.values.members.some(
                                (u) => u === user._id
                              )
                                ? organizationForm.values.members.filter(
                                    (u) => u !== user._id
                                  )
                                : [...organizationForm.values.members, user._id]
                            );
                          }}
                          checked={organizationForm.values.members.some(
                            (u) => u === user._id
                          )}
                        />
                      </div>
                    )}
                  </>
                );
              })}
          </div>
        }
        handleCancel={() => {
          selectedModel?.model
            ? setSelectedModel(undefined)
            : setSelectedModel({
                action: 'add',
              });
        }}
        cancelButton={selectedModel?.model ? 'Cancel' : 'Back'}
        handleSubmit={() => {
          if (selectedModel?.model) {
            updateTeamMutation.mutate({
              axiosAuth,
              id: selectedModel.model._id!,
              data: organizationForm.values,
            });
          } else {
            createTeamMutation.mutate({
              axiosAuth,
              data: organizationForm.values,
            });
          }
        }}
        isLoading={createTeamMutation.isLoading || updateTeamMutation.isLoading}
        submitValue={`Add (${organizationForm.values.members.length})`}
      />
    </>
  );
}

export { TeamList };
