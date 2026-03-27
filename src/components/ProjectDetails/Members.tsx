import { useProjectCotnext } from '@/app/(main)/(user-panel)/user/projects/context';
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Pagination,
} from '@nextui-org/react';
import Image from 'next/image';
import { color } from 'framer-motion';
import { useState, useEffect } from 'react';
import { AiOutlineBorderHorizontal } from 'react-icons/ai';
import { Button } from '../Buttons';
import { Search } from '../Form/search';
import Select, { SingleValue } from 'react-select';
import { useSession } from 'next-auth/react';
import { ChipDropDown } from '../ChipDropDown';
import { CustomBlueCheckBox } from '../Custom_Checkbox/Custom_Blue_Checkbox';
import { MdArrowDropDown } from 'react-icons/md';
import clsx from 'clsx';
import { FaAngleLeft, FaAngleRight, FaCaretDown } from 'react-icons/fa';
import { UserWithRole } from '@/app/helpers/user/states';
import { PROJECTACTIONTYPE } from '@/app/helpers/user/enums';
import CustomModal from '../Custom_Modal';
import CustomInfoModal from '../CustomDeleteModel';
import { updateProject } from '@/app/(main)/(user-panel)/user/projects/api';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { UserDetail } from '@/types/interfaces';
import { ProjectDetail, TeamTeam } from '@/app/type/projects';
import Loader from '../DottedLoader/loader';
import { Plus } from 'lucide-react';
import { getContactList } from '@/app/(main)/(user-panel)/user/chats/api';
import { UpdateProjectMembers } from './UpdateProjectMembers';
import { updateProjectMembers } from '@/app/(main)/(user-panel)/user/projects/api';

export function MembersTab({
  projectDetail,
}: {
  projectDetail: ProjectDetail | undefined;
}) {
  const [search, setSearch] = useState('');
  const [selectedId, setId] = useState<string | undefined>(undefined);

  const { state, dispatch } = useProjectCotnext();
  const { data: session } = useSession();
  const [selectedStatus, setStatus] = useState<string>('Everyone');
  const [selectedSort, setSort] = useState<string>('Recently Added');
  const [selectedUsers, setUsers] = useState<string[]>([]);
  const [showBulkModel, setBulkModel] = useState(false);
  const [showAddModel, setShowAddModel] = useState(false);
  const [selectedMembersUsers, setSelectedMembersUsers] = useState<
    UserWithRole[]
  >([]);
  const [selectedAction, setAction] = useState<{
    action: 'Contributor' | 'Owner' | 'Remove';
    section: 'remove' | 'status' | undefined;
  }>({
    action: 'Contributor',
    section: undefined,
  });
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const orgId = session?.user?.user?.organization?._id;

  // Helper functions for role-based permissions
  const currentUserId = session?.user?.user?._id;
  const isGlobalAdmin = (session?.user as any)?.role === 3;

  // Check if current user is Owner in this project
  const isProjectOwner = () => {
    if (!projectDetail || !currentUserId) return false;
    // Check if user is the project creator (always an owner)
    if (projectDetail.userId?._id === currentUserId) return true;
    // Check if user has Owner role in project members (case-insensitive check)
    const userMember = projectDetail.users?.find(
      (u) => String(u.user._id) === String(currentUserId)
    );
    if (userMember) {
      const role = String(userMember.role || '').toLowerCase();
      return role === 'owner';
    }
    return false;
  };

  // Check if user can perform owner actions (Owner OR admin/global admin)
  // Global admin always has access, otherwise only Owners can perform these actions
  const canPerformOwnerActions = () => {
    if (isGlobalAdmin) return true;
    return isProjectOwner();
  };
  // const { data: addData, isLoading: addLoading } = useQuery({
  //   queryKey: ['getAllUsersAndTeams', orgId],
  //   queryFn: () => getAllUsersAndTeams(axiosAuth, orgId!),
  //   enabled: showAddModel && !!orgId,
  // });
  // AddProjectMembers component fetches its own data (users and teams)
  // No need to fetch here since the modal component handles its own data fetching
  const isLoading = false; // Placeholder - AddProjectMembers manages its own loading state

  const updateProjectMutation = useMutation(updateProject, {
    onSuccess: () => {
      setUsers([]);
      setAction({ action: 'Contributor', section: undefined });
      queryClient.invalidateQueries('projects');
      queryClient.invalidateQueries(`projectDetail${projectDetail?._id}`);
    },
  });

  // Separate mutation for updating project members only
  const updateMembersMutation = useMutation(updateProjectMembers, {
    onSuccess: () => {
      setSelectedMembersUsers([]);
      setShowAddModel(false);
      queryClient.invalidateQueries('projects');
      queryClient.invalidateQueries(`projectDetail${projectDetail?._id}`);
    },
  });

  // Don't modify global project context - AddProjectMembers will handle its own initialization
  // via the project prop when hideNavigation is true

  ///////////////////
  const isUserSelected = (userId: string) =>
    selectedUsers.some((user) => user == userId);
  // user role change
  // change roles
  const handleUserRoleChange = (
    userId: string,
    selectedRole: string,
    type: string
  ) => {
    setId(undefined);
    if (type == 'user') {
      dispatch({
        type: PROJECTACTIONTYPE.UPDATE_DETAIL,
        projectDetail: {
          ...projectDetail, // Spread the existing properties
          users: (projectDetail?.users ?? []).map((element) => {
            return element.user._id === userId
              ? { user: element.user, role: selectedRole }
              : { user: element.user, role: element.role };
          }),
        } as ProjectDetail,
      });
      updateProjectMutation.mutate({
        axiosAuth,
        data: {
          users: (projectDetail?.users ?? []).map((element) => {
            return element.user._id === userId
              ? { user: userId, role: selectedRole }
              : { user: element.user._id, role: element.role };
          }),
        },
        id: projectDetail?._id!,
      });
    }
    setId(undefined);
  };
  // add or delete seleted teams

  const handleUserSelect = (userId: string) => {
    if ((selectedUsers ?? []).some((user) => user === userId)) {
      setUsers(selectedUsers.filter((u) => u !== userId));
    } else {
      setUsers([...(selectedUsers ?? []), userId]);
    }
  };
  //////////////////

  const users = (projectDetail?.users ?? [])
    .filter((e) =>
      `${e?.user?.firstName} ${e.user?.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const nameA = a.user?.firstName?.toUpperCase() ?? ''; // Ignore case
      const nameB = b.user?.firstName?.toUpperCase() ?? '';
      if (selectedSort?.toUpperCase() === 'First Name A-Z'.toUpperCase()) {
        // Sort alphabetically A-Z
        return nameA.localeCompare(nameB);
      } else if (
        selectedSort?.toUpperCase() === 'First Name Z-A'.toUpperCase()
      ) {
        // Sort alphabetically Z-A
        return nameB.localeCompare(nameA);
      }
      return 0;
    });

  const mergeWithType = [
    ...users.map((user) => {
      return {
        name: `${user.user.firstName} ${user.user.lastName}`,
        _id: user.user._id,
        email: user.user.email,
        role: user.role,
        type: 'user',
      };
    }),
  ];

  // Apply status filter
  const statusFiltered = (mergeWithType ?? []).filter((m) => {
    if (selectedStatus === 'Everyone') return true;
    if (selectedStatus === 'Owners') return (m.role ?? '') === 'Owner';
    if (selectedStatus === 'Contributors')
      return (m.role ?? '') === 'Contributor';
    if (selectedStatus === 'Viewers') return (m.role ?? '') === 'Viewer';
    return true;
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const tasksPerPage = 5;
  const totalPages = Math.ceil((statusFiltered ?? []).length / tasksPerPage);
  const paginatedMembers = (statusFiltered ?? []).slice(
    (currentPage - 1) * tasksPerPage,
    currentPage * tasksPerPage
  );
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  // AddProjectMembers component handles its own filtering and selection logic
  // No need for local state management here

  return (
    <>
      <div className="mx-auto flex h-[calc(var(--app-vh)-200px)] w-full max-w-[1360px] flex-col rounded-xl bg-white py-4">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center justify-between md:flex-nowrap">
            <span className="text-lg font-semibold text-black">
              Current Project Members
            </span>
            <div className="flex items-center gap-2">
              <ChipDropDown
                options={['Recently Added', 'First Name A-Z', 'First Name Z-A']}
                selectedValue={selectedSort}
                onChange={(value) => {
                  setSort(value);
                }}
                bgColor="bg-[#E2F3FF]"
              />
              <ChipDropDown
                options={['Everyone', 'Owners', 'Contributors']}
                selectedValue={selectedStatus}
                onChange={(value) => {
                  setStatus(value);
                }}
                bgColor="bg-[#E2F3FF]"
              />

              <div>
                <Search
                  className="h-[44px] min-w-[241px] bg-[#EEEEEE] placeholder:text-[#616161]"
                  inputRounded={true}
                  type="search"
                  name="search"
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Member"
                />
              </div>
              <CustomBlueCheckBox
                checked={
                  selectedUsers.length === (paginatedMembers ?? []).length - 1
                }
                disabled={!canPerformOwnerActions()}
                onChange={() => {
                  if (!canPerformOwnerActions()) return;
                  if (
                    selectedUsers.length ===
                    (paginatedMembers ?? []).length - 1
                  ) {
                    setUsers([]);
                  } else {
                    setUsers(
                      paginatedMembers
                        .map((u) => u._id!)
                        .filter((u) => u != session?.user.user._id)
                    );
                  }
                }}
              />
            </div>
          </div>
          {/* {currentPage === 1 && (
            <div className="mb-2 flex cursor-not-allowed items-center justify-between rounded-xl border-2 border-gray-300/80 p-2 opacity-40">
              <div className="flex items-center">
                <div
                  className={clsx(
                    'flex items-center gap-2 text-xs font-normal text-[#212121]'
                  )}
                >
                  <Image
                    src={'/images/user.png'}
                    className={clsx('rounded-full border-2')}
                    alt={` pic`}
                    width={40}
                    height={40}
                  />

                  <div className="grid">
                    <span className="text-medium font-semibold">Me</span>
                  </div>
                </div>
              </div>

              <div className="flex">
                <div className="DropDownn relative px-4 text-left">
                  <button
                    type="button"
                    className={`inline-flex w-full cursor-not-allowed items-center justify-center rounded-md border border-gray-300 bg-[#EEEEEE] px-2 py-1 text-sm font-medium text-black shadow-sm hover:bg-[#EEEEEE] focus:outline-none`}
                    aria-haspopup="true"
                    onClick={() => {}}
                  >
                    {'Owner'}
                    <FaCaretDown className={`ml-2 transition-transform`} />
                  </button>
                </div>

                <CustomBlueCheckBox checked={true} onChange={() => {}} />
              </div>
            </div>
          )} */}
          {(paginatedMembers ?? []).map((user) => {
            const item = user;
            const isLoginUser = item._id == session?.user.user._id;
            return (
              <div
                key={item?._id}
                className="mb-2 flex items-center justify-between rounded-xl border-2 border-gray-300/80 p-2"
              >
                <div className="flex items-center">
                  <div
                    className={clsx(
                      `flex items-center gap-2 text-xs font-normal text-[#212121] ${isLoginUser ? 'cursor-not-allowed opacity-50' : ''}`
                    )}
                  >
                    <Image
                      src={'/images/user.png'}
                      className={clsx('rounded-full border-2')}
                      alt={` pic`}
                      width={40}
                      height={40}
                    />

                    <div className="grid">
                      <span className="font-semibold">
                        {item.type == 'team'
                          ? item.name
                          : `${item._id == session?.user.user._id ? 'Me' : item.name}`}
                      </span>
                      <span>{item.type == 'team' ? 'Team' : item.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex">
                  <div className="DropDownn relative px-4 text-left">
                    <button
                      type="button"
                      id="dropdown-button"
                      className={`inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-[#EEEEEE] px-2 py-1 text-sm font-medium text-black shadow-sm hover:bg-[#EEEEEE] focus:outline-none ${!canPerformOwnerActions() || isLoginUser ? 'cursor-not-allowed opacity-50' : ''}`}
                      aria-expanded={selectedId === item._id}
                      aria-haspopup="true"
                      disabled={!canPerformOwnerActions() || isLoginUser}
                      onClick={() => {
                        if (canPerformOwnerActions() && !isLoginUser) {
                          setId((prev) =>
                            prev === item._id ? undefined : item._id
                          );
                        }
                      }}
                    >
                      {user.role}
                      <FaCaretDown
                        className={`ml-2 transition-transform ${selectedId === item._id ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {selectedId == item._id &&
                      canPerformOwnerActions() &&
                      !isLoginUser && (
                        <div
                          className="absolute left-0 z-50 mt-2 w-32 origin-top-left rounded-md bg-[#EEEEEE] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby="options-menu"
                        >
                          <div className="py-1" role="none">
                            <button
                              onClick={() => {
                                handleUserRoleChange(
                                  item._id ?? '',
                                  'Contributor',
                                  item.type
                                );
                              }}
                              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              role="menuitem"
                            >
                              Contributor
                            </button>
                            <button
                              onClick={() => {
                                handleUserRoleChange(
                                  item._id ?? '',
                                  'Owner',
                                  item.type
                                );
                              }}
                              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              role="menuitem"
                            >
                              Owner
                            </button>
                          </div>
                        </div>
                      )}
                  </div>

                  <CustomBlueCheckBox
                    checked={isUserSelected(`${item?._id}`) || false}
                    disabled={!canPerformOwnerActions() || isLoginUser}
                    onChange={() => {
                      if (canPerformOwnerActions() && !isLoginUser) {
                        handleUserSelect(`${item._id}`);
                      }
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="fixed bottom-40 left-1/2 z-10 mx-auto flex w-full max-w-[1360px] -translate-x-1/2 transform items-center justify-end">
          {canPerformOwnerActions() && (
            <button
              className="flex items-center justify-end gap-1 rounded-full bg-primary-500 px-4 py-2 text-sm font-bold text-white hover:bg-primary-600/80 sm:text-base"
              type="button"
              onClick={() => {
                setShowAddModel(true);
              }}
            >
              <Plus className="w-5" />
              Add
            </button>
          )}
        </div>
        <div className="flex h-[72px] w-full items-center justify-between space-x-4 rounded-t-xl border-2 border-gray-300 border-b-transparent bg-white px-4">
          <span className="text-sm text-gray-700 md:w-1/3">
            Items per page: {tasksPerPage}
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
          <div className="flex w-1/3 justify-end">
            {selectedUsers.length > 0 && (
              <div className="flex w-fit justify-end gap-4 text-right">
                <Button
                  variant="text"
                  onClick={() => {
                    setUsers([]);
                  }}
                >
                  <div className="">Cancel</div>
                </Button>
                <Button
                  variant="primary"
                  disabled={(selectedUsers ?? []).length == 0}
                  onClick={() => {
                    setBulkModel(!showBulkModel);
                  }}
                >
                  <div>Select ({(selectedUsers ?? []).length})</div>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Show Bulk Model  */}
      <CustomModal
        isOpen={showBulkModel}
        header={
          <>
            <img src="/svg/sh/edit.svg" alt="" />
            <div>
              <h2 className="text-xl font-semibold text-[#1E1E1E]">
                {'Bulk Select Options'}
              </h2>
              <span className="mt-1 text-base font-normal text-[#616161]">
                {'Select an option below to change.'}
              </span>
            </div>
          </>
        }
        handleCancel={() => {
          setUsers([]);
          setBulkModel(!showBulkModel);
        }}
        body={
          <div className="h-[250px]">
            <ul>
              {['Contributor', 'Owner', 'Remove'].map((option, index) => (
                <li key={option} className="gap-2 px-4">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      id={option}
                      name="option"
                      checked={selectedAction.action === option}
                      onChange={(e) => {
                        setAction({
                          action: option as 'Contributor' | 'Owner' | 'Remove',
                          section: undefined,
                        });
                      }}
                      className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                    />
                    {index === 2 ? (
                      <>
                        <span className="flex font-normal">
                          Remove users from project.
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex font-normal">
                          Change role to
                          <span className="ml-2 font-semibold">{`'${option}'`}</span>
                        </span>
                      </>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        }
        handleSubmit={() => {
          //  section: index === 3 ? 'remove' : 'status',
          setBulkModel(!showBulkModel);
          if (selectedAction.action == 'Remove') {
            setAction({
              action: selectedAction.action,
              section: 'remove',
            });
          } else {
            setAction({
              action: selectedAction.action,
              section: 'status',
            });
          }
        }}
        submitValue={'Next'}
      />

      {/* Delete model  */}

      <CustomInfoModal
        isOpen={selectedAction.section == 'remove'}
        title={`Remove members (${selectedUsers.length}) from Project?`}
        handleClose={() => {
          setUsers([]);
          setAction({ action: 'Contributor', section: undefined });
        }}
        onDeleteButton={() => {
          updateProjectMutation.mutate({
            id: projectDetail?._id!,
            data: {
              memberUserIds:
                projectDetail?.users
                  ?.filter((user) => !selectedUsers.includes(user.user._id))
                  ?.map((u) => u.user._id) ?? [],
            },
            axiosAuth,
          });
        }}
        doneValue={updateProjectMutation.isLoading ? <Loader /> : 'Delete'}
        subtitle={
          'Removed members will no longer be able to view or access this project. A project owner can only add them back.'
        }
      />

      {/* Show Status  */}
      <CustomInfoModal
        isOpen={selectedAction.section == 'status'}
        title={`Change role (${selectedUsers.length}) to '${selectedAction.action}'`}
        handleClose={() => {
          setAction({ action: 'Contributor', section: undefined });
        }}
        imageValue="/svg/primary_warn.svg"
        onDeleteButton={() => {
          updateProjectMutation.mutate({
            id: projectDetail?._id!,
            data: {
              users:
                projectDetail?.users?.map((element) => ({
                  user: element.user._id,
                  role: selectedUsers.includes(element.user._id)
                    ? selectedAction.action
                    : element.role,
                })) ?? [],
            },
            axiosAuth,
          });
        }}
        doneValue={updateProjectMutation.isLoading ? <Loader /> : 'Confirm'}
        cancelButton="Back"
        cancelvariant="primaryOutLine"
        variant="primary"
        subtitle={`Selected members role will be changed to ‘${selectedAction.action}’. Owners can edit, delete this project and add/remove members.`}
      />

      {/* Add Members Modal */}
      <CustomModal
        isOpen={showAddModel}
        header={
          <>
            <img src="/svg/chats/project_channel.svg" alt="" />
            <div>
              <h2 className="text-xl font-semibold text-[#1E1E1E]">
                Add Members
              </h2>
              <span className="mt-1 text-base font-normal text-[#616161]">
                Select users or teams to add to this project.
              </span>
            </div>
          </>
        }
        handleCancel={() => {
          setShowAddModel(false);
          setSelectedMembersUsers([]);
        }}
        body={
          showAddModel && projectDetail ? (
            <UpdateProjectMembers
              project={projectDetail}
              selectedUsers={selectedMembersUsers}
              onUsersChange={setSelectedMembersUsers}
            />
          ) : null
        }
        handleSubmit={() => {
          if (!projectDetail?._id) return;
          // Prepare users array (exclude creator)
          // Teams are already expanded to individual users in UpdateProjectMembers component
          const usersWithRoles = selectedMembersUsers
            .filter((u) => u.user !== session?.user.user._id)
            .map((u) => ({
              user: u.user,
              role: u.role || 'Contributor',
            }));

          updateMembersMutation.mutate({
            axiosAuth,
            id: projectDetail._id,
            data: {
              users: usersWithRoles,
            },
          });
        }}
        submitValue={
          updateMembersMutation.isLoading ? <Loader /> : 'Add Selected'
        }
      />
    </>
  );
}
