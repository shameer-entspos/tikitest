import { CHATTYPE } from '@/app/helpers/user/enums';

import useAxiosAuth from '@/hooks/AxiosAuth';
import { usePresignedUserPhoto } from '@/hooks/usePresignedUserPhoto';
import { Menu, Transition } from '@headlessui/react';
import { useCallback, useState } from 'react';

import { MiddleChatSidebar } from '../MiddleChatSidebar';
import { CheckCheck, Ellipsis } from 'lucide-react';
import { formatDateTime } from '@/utils';
import { ReceiveChatRequests } from '@/components/Chats/receiveChatRequestsList';
import { SentChatRequests } from '@/components/Chats/sentChatRequestLis';
import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import { Plus, X } from 'lucide-react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { Fragment } from 'react';
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from '@material-tailwind/react';
import { Search } from '@/components/Form/search';
import { FaAngleLeft, FaAngleRight, FaCheck, FaFilter } from 'react-icons/fa';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import { Dialog } from '@headlessui/react';
import CustomHr from '@/components/Ui/CustomHr';
import {
  addExternalUser,
  ChatRooms,
  getAllRooms,
  getContactList,
  removeFriend,
  searchFriendByEmail,
  sendRequestToUsers,
} from '@/app/(main)/(user-panel)/user/chats/api';
import { getUserPermission } from '@/app/(main)/(user-panel)/user/tasks/api';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import Loader from '@/components/DottedLoader/loader';
import { useSession } from 'next-auth/react';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import DateRangePicker from '@/components/JobSafetyAnalysis/CreateNewComponents/JSA_Calender';
import { Button } from '@/components/Buttons';
import FilterButton from '@/components/TimeSheetApp/CommonComponents/FilterButton/FilterButton';
import AddContactModal from '../AddContact';
import { IoCheckmark } from 'react-icons/io5';
import CustomInfoModal from '@/components/CustomDeleteModel';
import toast from 'react-hot-toast';
import CustomModal from '@/components/Custom_Modal';
import { SimpleInput } from '@/components/Form/simpleInput';
import AddCustomerModel from '../AddContact';
import { UserDetail } from '@/types/interfaces';
import { getAllOrgUsers } from '@/app/(main)/(user-panel)/user/apps/api';

function RoomPhotoImg({ photo }: { photo?: string }) {
  const src = usePresignedUserPhoto(photo);
  return (
    <img
      src={src}
      alt=""
      className="max-h-8 min-h-8 min-w-8 max-w-8 rounded-full object-cover"
    />
  );
}

export function Contact() {
  const context = useChatCotnext();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  // Check if user is Root User from session (role 3 = Organization Admin)
  const isRootUser = (session?.user as any)?.role === 3;

  // Check if user has Contacts permission (can add/edit Customers/Suppliers)
  const { data: hasContactsPermission } = useQuery({
    queryKey: 'userContactsPermission',
    queryFn: () => getUserPermission(axiosAuth),
    refetchOnWindowFocus: true,
  });

  // User can add/edit Customers/Suppliers if Root User or has permission
  // Only teams explicitly in the permission array can add/edit/delete
  const canAddEditCustomers =
    isRootUser || hasContactsPermission?.contacts === true;

  // User can add External Friends if Root User or has permission
  // Default: all teams can add External Friends (empty array = all teams allowed)
  const canAddExternalFriends =
    isRootUser || hasContactsPermission?.externalFriends === true;

  const {
    data: contacts,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: 'contacts',
    queryFn: () => getContactList(axiosAuth),
  });
  const [resutlUser, setQueryResult] = useState<UserDetail | undefined>(
    undefined
  );

  const [isSearchApplied, setSearchStatus] = useState(false);

  const searchFriendByEmailMutation = useMutation(searchFriendByEmail, {
    onSuccess: (response) => {
      setSearchStatus(true);
      setQueryResult(response);
    },
  });
  const sendRequestToUsersMutation = useMutation(sendRequestToUsers, {
    onSuccess: () => {
      queryClient.invalidateQueries('searchPeopleRequest');
      queryClient.invalidateQueries('sentChatRequest');
      setFriendModel(undefined);
      // context.dispatch({ type: CHATTYPE.TOGGLE });
    },
  });
  const removeFriendsMutation = useMutation(removeFriend, {
    onSuccess: () => {
      queryClient.invalidateQueries('contacts');
    },
  });
  // const addUserMutation = useMutation(addExternalUser, {
  //   onSuccess: (response) => {
  //     if (response) {
  //       toast.success('Add User Successfully');
  //       queryClient.invalidateQueries('contacts');
  //     }
  //   },
  // });
  const [searchQuery, setQuery] = useState('');
  // accordion states
  const [openReceived, setOpenReceived] = useState(true);
  const [openSent, setOpenSent] = useState(true);
  const [showFilterModel, setShowFilterModel] = useState(false);
  const [isApplyFilter, setApplyFilter] = useState(false);
  const [showFriend, setFriendModel] = useState<
    'external' | 'customer' | undefined
  >(undefined);

  const handleReceivedToggle = () => setOpenReceived(!openReceived);
  const handleSentToggle = () => setOpenSent(!openSent);
  const [showOrganizationUsers, setOrgainzationUsers] = useState(false);
  const [showExternalUsers, setExternalUsers] = useState(false);
  const [showCustomers, setCustomers] = useState(false);
  const [showSuppliers, setSuppliers] = useState(false);
  const [showAddedBy, setAddedBy] = useState<string[]>([]);
  const [filterDates, showFilterDates] = useState<
    { from: Date; to: Date } | undefined
  >(undefined);
  //////
  const clearFilters = () => {
    setApplyFilter(false);
    setOpenFilterDropdown('');
    setOrgainzationUsers(false);
    setExternalUsers(false);
    setCustomers(false);
    setSuppliers(false);
    showFilterDates(undefined);
    setAddedBy([]);
  };
  const { data: users } = useQuery({
    queryKey: 'users',
    queryFn: () => getAllOrgUsers(axiosAuth),
  });

  const areFiltersApplied = () => {
    return (
      showOrganizationUsers ||
      showAddedBy.length > 0 ||
      showExternalUsers ||
      showCustomers ||
      showSuppliers ||
      filterDates
    );
  };

  const handleApplyFilters = () => {
    setShowFilterModel(!showFilterModel);
    if (areFiltersApplied()) {
      setApplyFilter(true);
    }
  };

  /////
  const [filterValue, setFilter] = useState('All Contacts');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string>('');
  const handleDropdown = (dropdownId: string) => {
    setOpenFilterDropdown(openFilterDropdown === dropdownId ? '' : dropdownId);
  };
  const [externalQuery, setExternalQuery] = useState('');
  // pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const tasksPerPage = 10;
  const totalPages = Math.ceil([].length / tasksPerPage);
  const paginatedTasks = [].slice(
    (currentPage - 1) * tasksPerPage,
    currentPage * tasksPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleClick = useCallback(() => {
    if (context.state.showChatRequest == 'receive') {
      context.dispatch({ type: CHATTYPE.SHOWREQUEST, showChatRequest: 'sent' });
    } else {
      context.dispatch({
        type: CHATTYPE.SHOWREQUEST,
        showChatRequest: 'receive',
      });
    }
  }, [context]);

  return (
    <div className="flex !w-full">
      <MiddleChatSidebar
        showAddButton={false}
        childrenTop={
          <>
            <div className="px-3 py-3 pt-8 lg:px-5">
              <h1 className="text-sm font-semibold lg:text-[20px]">
                Friend Requests
              </h1>
              <div className="mt-3 py-2">
                <Search
                  key={'search'}
                  inputRounded={true}
                  type="text"
                  name="search"
                  onChange={(e) => {}}
                  placeholder="Search"
                />
              </div>
            </div>
          </>
        }
        childrenBottom={
          <div className="hidden items-center space-y-4 px-2 lg:block">
            <Accordion open={openReceived}>
              <AccordionHeader
                className="border-none p-0"
                onClick={handleReceivedToggle}
              >
                <div className="ml-2 flex items-center gap-2 text-base font-normal text-gray-700">
                  <IoMdArrowDropdown
                    style={{
                      transition: 'transform 0.3s ease',
                      transform: openReceived
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                    }}
                    size={24}
                  />
                  Received
                </div>
              </AccordionHeader>
              <AccordionBody>
                <ReceiveChatRequests />
              </AccordionBody>
            </Accordion>

            <Accordion open={openSent}>
              <AccordionHeader
                className="border-none p-0"
                onClick={handleSentToggle}
              >
                <div className="ml-2 flex items-center gap-2 text-base font-normal text-gray-700">
                  <IoMdArrowDropdown
                    style={{
                      transition: 'transform 0.3s ease',
                      transform: openSent ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                    size={24}
                  />
                  Sent
                </div>
              </AccordionHeader>
              <AccordionBody>
                <SentChatRequests />
              </AccordionBody>
            </Accordion>
          </div>
        }
      />

      <section className="relative h-[calc(var(--app-vh)_-_72px)] w-[calc(100vw_-_64px)] flex-1 lg:w-auto">
        {/* header */}
        <div className="flex w-full items-center justify-between px-4 py-4 lg:px-8 xl:text-xl">
          <h2 className="text-xl font-semibold leading-7 text-black">
            All Contacts
          </h2>
          <div className="flex items-center gap-2">
            <Dropdown className="rounded-xl bg-primary-50 shadow-md">
              <DropdownTrigger>
                <button className="flex h-max rounded-lg border bg-primary-50 px-2 py-1 text-sm">
                  {filterValue}
                  <IoMdArrowDropdown className="text-xl shadow-none" />
                </button>
              </DropdownTrigger>

              <DropdownMenu aria-label="Static Actions">
                {[
                  'All Contacts',
                  'My Organization',
                  'My Teams',
                  'External Users',
                  'Customers',
                  'Suppliers',
                ].map((item, index) => (
                  <DropdownItem
                    key={index}
                    onPress={() => {
                      setFilter(item);
                    }}
                  >
                    {item}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            {/* filter button */}
            <FilterButton
              isApplyFilter={isApplyFilter}
              setShowModel={setShowFilterModel}
              showModel={showFilterModel}
              setOpenDropdown={setOpenFilterDropdown}
              clearFilters={clearFilters}
            />
            <div className="hidden max-w-[300px] lg:block">
              <Search
                key={'search'}
                inputRounded={true}
                type="text"
                name="search"
                value={searchQuery}
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
                placeholder="Search"
              />
            </div>
          </div>
        </div>

        <CustomHr />

        <div className="h-[80%] px-4 py-4 lg:px-8">
          {isLoading ? (
            <>
              <Loader />
            </>
          ) : (
            <div className="mt-4 flex h-full flex-col overflow-y-auto scrollbar-hide">
              <div className="h-full overflow-y-auto lg:px-0">
                <div className="w-[1024px] min-w-0 table-auto lg:w-full">
                  {/* Table Head */}
                  <div>
                    <div className="grid grid-cols-5 items-center gap-4 bg-gray-50 px-2 py-1 text-sm font-semibold text-gray-700">
                      <p className="py-2 text-left">Name</p>
                      <p className="py-2 text-left">Email</p>
                      <p className="py-2 text-left">Type</p>
                      <p className="py-2 text-left">Reference</p>
                      <p className="py-2 text-left">Date Added</p>
                    </div>
                  </div>
                  {/* Table Body */}
                  {[...(contacts ?? [])]
                    .filter((room) => {
                      if (filterValue === 'All Contacts') {
                        return room;
                      }
                      if (filterValue === 'My Organization') {
                        if (
                          room.organization?._id ===
                          session?.user.user.organization?._id
                        ) {
                          return room;
                        }
                      }
                      if (filterValue === 'Customers') {
                        if (room.role === 4) {
                          return room;
                        }
                      }
                      if (filterValue === 'Suppliers') {
                        if (room.role === 5) {
                          return room;
                        }
                      }
                      if (filterValue === 'External Users') {
                        if (
                          room.organization?._id !==
                          session?.user.user.organization?._id
                        ) {
                          return room;
                        }
                      }
                      if (filterValue === 'My Teams') {
                        return false;
                      }
                      return false;
                    })
                    .filter((room) => {
                      if (isApplyFilter) {
                        if (showOrganizationUsers) {
                          if (
                            room.organization?._id ===
                            session?.user.user.organization?._id
                          ) {
                            return room;
                          }
                        }
                        if (showExternalUsers) {
                          if (
                            room.organization?._id !==
                            session?.user.user.organization?._id
                          ) {
                            return room;
                          }
                        }
                        if (showCustomers) {
                          if (room.role === 4) {
                            return room;
                          }
                        }
                        if (showSuppliers) {
                          if (room.role === 5) {
                            return room;
                          }
                        }
                        if (filterDates) {
                          const startDate = new Date(filterDates.from ?? 0);
                          const endDate = new Date(filterDates.to ?? 0);
                          const userDate = new Date(room.createdAt ?? '0');
                          return userDate >= startDate && userDate <= endDate;
                        }
                      } else {
                        return room;
                      }
                    })
                    .filter((room) => {
                      // Filter by search query
                      if (!searchQuery.trim()) {
                        return true;
                      }
                      const searchLower = searchQuery.toLowerCase();
                      const fullName =
                        `${room.firstName ?? ''} ${room.lastName ?? ''}`.toLowerCase();
                      const email = (room.email ?? '').toLowerCase();
                      const reference = (room.reference ?? '').toLowerCase();

                      return (
                        fullName.includes(searchLower) ||
                        email.includes(searchLower) ||
                        reference.includes(searchLower)
                      );
                    })
                    .map((room, index: any) => (
                      <div
                        key={room._id}
                        className={`grid cursor-pointer grid-cols-5 items-center gap-4 border-b-2 border-gray-300 p-2 ${
                          index % 2 !== 0 ? 'bg-gray-100' : 'bg-white'
                        }`}
                      >
                        {/* User */}
                        <div
                          className={'flex items-center gap-2'}
                          onClick={() => {
                            // context.dispatch({
                            //   type: CHATTYPE.SHOWPROFILE,
                            //   roomViewProfile: {
                            //     room: room,
                            //     participant: room.participants[0],
                            //     showFrom: 'direct',
                            //   },
                            // });
                          }}
                        >
                          <RoomPhotoImg photo={room?.photo} />
                          <h1 className="truncate text-ellipsis text-sm font-medium text-black">
                            {room.role === 4 || room.role === 5
                              ? (room?.customerName ?? '')
                              : room?.firstName + ' ' + room?.lastName}
                          </h1>
                        </div>

                        {/* Organization */}
                        <p
                          onClick={() => {
                            // context.dispatch({
                            //   type: CHATTYPE.SHOWPROFILE,
                            //   roomViewProfile: {
                            //     room: room,
                            //     participant: room.participants[0],
                            //     showFrom: 'direct',
                            //   },
                            // });
                          }}
                          className="block truncate text-sm text-gray-800"
                        >
                          {room?.email}
                        </p>

                        <p
                          onClick={() => {
                            // context.dispatch({
                            //   type: CHATTYPE.SHOWPROFILE,
                            //   roomViewProfile: {
                            //     room: room,
                            //     participant: room.participants[0],
                            //     showFrom: 'direct',
                            //   },
                            // });
                          }}
                          className={`${(() => {
                            if (room.role === 5) {
                              return 'bg-[#FFD597]';
                            } else if (room.role === 4) {
                              return 'bg-[#97F1BB]';
                            } else if (
                              room.organization?._id ===
                              session?.user.user.organization?._id
                            ) {
                              return 'bg-[#96CDFF]';
                            } else {
                              return 'bg-[#F1C9FF]';
                            }
                          })()} block w-max rounded-lg px-2 py-1 text-sm capitalize`}
                        >
                          {room.role === 5
                            ? 'Supplier'
                            : room.role === 4
                              ? 'Customer'
                              : room.organization?._id ===
                                  session?.user.user.organization?._id
                                ? 'My Organization'
                                : 'External Friend'}
                        </p>

                        <p
                          onClick={() => {
                            // context.dispatch({
                            //   type: CHATTYPE.SHOWPROFILE,
                            //   roomViewProfile: {
                            //     room: room,
                            //     participant: room.participants[0],
                            //     showFrom: 'direct',
                            //   },
                            // });
                          }}
                          className="block text-sm text-gray-800"
                        >
                          {room.reference ?? '-'}
                        </p>

                        <p className="flex justify-between pr-4 text-sm text-gray-800">
                          {formatDateTime(room.createdAt.toString()).date}

                          <div className="relative">
                            <Menu
                              as="div"
                              className="relative inline-block text-left"
                            >
                              <Menu.Button>
                                <Ellipsis className="size-7" />
                              </Menu.Button>
                              <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                              >
                                <Menu.Items className="absolute right-0 z-10 mt-2 w-24 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                  <div className="py-1">
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          className={classNames(
                                            active
                                              ? 'bg-gray-100 text-gray-900'
                                              : 'text-gray-700',
                                            'flex w-full items-center px-4 py-2 text-sm'
                                          )}
                                          onClick={() => {
                                            if (
                                              room.role == 4 ||
                                              room.role == 5
                                            ) {
                                              context.dispatch({
                                                type: CHATTYPE.SHOW_CONTACT_DETAIL,
                                                showContactDetail: {
                                                  detail: room,
                                                  action: 'view',
                                                },
                                              });
                                            } else {
                                              context.dispatch({
                                                type: CHATTYPE.SHOWPROFILE,
                                                roomViewProfile: {
                                                  // room: room,
                                                  // participant:
                                                  //   room.participants[0],
                                                  participant: room,
                                                  showFrom: 'direct',
                                                },
                                              });
                                            }
                                          }}
                                        >
                                          View
                                        </button>
                                      )}
                                    </Menu.Item>
                                    {(room.role === 5 || room.role === 4) && (
                                      <Menu.Item
                                        disabled={!canAddEditCustomers}
                                      >
                                        <button
                                          onClick={() => {
                                            if (canAddEditCustomers) {
                                              context.dispatch({
                                                type: CHATTYPE.SHOW_CONTACT_DETAIL,
                                                showContactDetail: {
                                                  action: 'edit',
                                                  detail: room,
                                                },
                                              });
                                            }
                                          }}
                                          disabled={!canAddEditCustomers}
                                          className={
                                            canAddEditCustomers
                                              ? 'flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200'
                                              : 'flex w-full cursor-not-allowed items-center px-4 py-2 text-sm text-gray-400 opacity-50'
                                          }
                                        >
                                          Edit
                                        </button>
                                      </Menu.Item>
                                    )}
                                    {(room.organization?._id !==
                                      session?.user.user.organization?._id ||
                                      room.role === 5 ||
                                      room.role === 4) && (
                                      <Menu.Item
                                        disabled={
                                          (room.role === 4 ||
                                            room.role === 5) &&
                                          !canAddEditCustomers
                                        }
                                      >
                                        <button
                                          onClick={() => {
                                            if (
                                              room.role === 4 ||
                                              room.role === 5
                                            ) {
                                              if (canAddEditCustomers) {
                                                context.dispatch({
                                                  type: CHATTYPE.SHOW_CONTACT_DETAIL,
                                                  showContactDetail: {
                                                    detail: room,
                                                    action: 'customerDelete',
                                                  },
                                                });
                                              }
                                            } else {
                                              context.dispatch({
                                                type: CHATTYPE.SHOW_CONTACT_DETAIL,
                                                showContactDetail: {
                                                  detail: room,
                                                  action: 'removeFriend',
                                                },
                                              });
                                            }
                                          }}
                                          disabled={
                                            (room.role === 4 ||
                                              room.role === 5) &&
                                            !canAddEditCustomers
                                          }
                                          className={
                                            (room.role === 4 ||
                                              room.role === 5) &&
                                            !canAddEditCustomers
                                              ? 'flex w-full cursor-not-allowed items-center px-4 py-2 text-sm text-gray-400 opacity-50'
                                              : 'flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200'
                                          }
                                        >
                                          Remove
                                        </button>
                                      </Menu.Item>
                                    )}
                                  </div>
                                </Menu.Items>
                              </Transition>
                            </Menu>
                          </div>
                        </p>

                        {/* Actions */}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
          {/* <ListOfFriends /> */}
          {/* {context.state.showChatRequestDetail && <ShowChatRequestDetail />} */}
        </div>

        {/* footer */}
        <div className="absolute bottom-0 left-1/2 z-20 mx-2 flex w-[96%] max-w-[1280px] -translate-x-1/2 transform flex-col items-end gap-2">
          <Dropdown className="mb-4 rounded-xl bg-primary-50 shadow-md">
            <DropdownTrigger>
              <button
                className="mr-2 flex w-max items-center justify-center gap-1 !rounded-full bg-primary-500 px-4 py-2 text-sm font-bold text-white hover:bg-primary-600/80 sm:text-base"
                // onClick={() => {
                //   context.dispatch({ type: CHATTYPE.TOGGLE });
                // }}
              >
                <Plus />
                Add
              </button>
            </DropdownTrigger>

            <DropdownMenu aria-label="Static Actions">
              {[
                ...(canAddExternalFriends
                  ? [
                      {
                        key: 'external-friend',
                        label: 'External Friend',
                        onPress: () => setFriendModel('external'),
                      },
                    ]
                  : []),
                ...(canAddEditCustomers
                  ? [
                      {
                        key: 'customer-supplier',
                        label: 'Customer/Supplier',
                        onPress: () => {
                          context.dispatch({
                            type: CHATTYPE.SHOW_CONTACT_DETAIL,
                            showContactDetail: {
                              action: 'add',
                            },
                          });
                        },
                      },
                    ]
                  : []),
              ].map((item) => (
                <DropdownItem key={item.key} onPress={item.onPress}>
                  {item.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

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
            <div className="hidden w-1/3 md:block" />
          </div>
        </div>
      </section>
      {/* /// Add External Friend  */}
      <CustomModal
        size="md"
        isOpen={showFriend == 'external'}
        header={
          <>
            <svg
              width="50"
              height="50"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
              <path
                d="M25 21.6663C28.6819 21.6663 31.6667 18.6816 31.6667 14.9997C31.6667 11.3178 28.6819 8.33301 25 8.33301C21.3181 8.33301 18.3334 11.3178 18.3334 14.9997C18.3334 18.6816 21.3181 21.6663 25 21.6663Z"
                fill="#0063F7"
              />
              <path
                d="M38.3333 34.167C38.3333 38.3087 38.3333 41.667 25 41.667C11.6666 41.667 11.6666 38.3087 11.6666 34.167C11.6666 30.0253 17.6366 26.667 25 26.667C32.3633 26.667 38.3333 30.0253 38.3333 34.167Z"
                fill="#0063F7"
              />
            </svg>

            <div>
              <h2 className="text-xl font-semibold text-[#1E1E1E]">
                {'Add External Friend'}
              </h2>
              <span className="mt-1 text-base font-normal text-[#616161]">
                {
                  'Add an external friend from another organization. External friend must have an active Tiki account.'
                }
              </span>
            </div>
          </>
        }
        showTopBorder={false}
        body={
          <>
            <div className="-mt-5 flex h-[150px] flex-col items-start justify-start overflow-auto px-3">
              <SimpleInput
                type="text"
                label="Enter Email Address"
                placeholder="Enter External Friend's Email Address."
                name="email"
                required
                errorMessage={''}
                value={externalQuery} // Bind value to state
                onChange={(e) => setExternalQuery(e.target.value)} // Update state on change
              />
              {isSearchApplied && (
                <>
                  {resutlUser ? (
                    <span className="font-semibold">User Found</span>
                  ) : (
                    <span className="font-semibold text-red-300">
                      No user with that email is registered
                    </span>
                  )}
                </>
              )}
            </div>
          </>
        }
        justifyButton={'justify-end'}
        handleCancel={() => {
          setFriendModel(undefined);
          setQueryResult(undefined);
          setExternalQuery('');
          setSearchStatus(false);
        }}
        isLoading={
          searchFriendByEmailMutation.isLoading ||
          sendRequestToUsersMutation.isLoading
        }
        handleSubmit={() => {
          if (isSearchApplied && resutlUser) {
            sendRequestToUsersMutation.mutate({
              axiosAuth,
              id: resutlUser._id!,
            });
          } else if (externalQuery) {
            searchFriendByEmailMutation.mutate({
              axiosAuth,
              data: {
                email: externalQuery,
              },
            });
          }
        }}
        variant={'primary'}
        submitValue={isSearchApplied && resutlUser ? 'Add' : 'Search'}
      />

      {/* filter dialog */}
      <Modal
        isOpen={showFilterModel}
        onOpenChange={() => setShowFilterModel(!showFilterModel)}
        placement="auto"
        size="xl"
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
              <ModalBody className="flex flex-col justify-start gap-2 overflow-y-scroll pb-16 pt-4 scrollbar-hide">
                <div className="w-full">
                  <DateRangePicker
                    title="Next Due Date Range"
                    handleOnConfirm={(from: Date, to: Date) => {
                      showFilterDates({
                        from,
                        to,
                      });
                    }}
                    selectedDate={filterDates}
                  />
                </div>
                <div className="w-full">
                  <CustomSearchSelect
                    label="Added By"
                    data={[
                      {
                        label: 'All',
                        value: 'all',
                      },
                      ...(users ?? [])
                        .filter((user) => user.role == 2)
                        .map((item) => ({
                          label:
                            item.firstName +
                            ' ' +
                            item.lastName +
                            ' - ' +
                            item.userId,
                          value: item._id,
                          photo: item.photo,
                        })),
                    ]}
                    showImage={false}
                    multiple={true}
                    isOpen={openFilterDropdown === 'dropdown5'}
                    onToggle={() => handleDropdown('dropdown5')}
                    onSelect={(selected: string[]) => {
                      setAddedBy(selected);
                    }}
                    placeholder="-"
                    searchPlaceholder="Search Users"
                    selected={showAddedBy}
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-normal">Type</label>
                  <CustomCheckbox
                    label={'My Organization'}
                    checked={showOrganizationUsers}
                    onChange={() =>
                      setOrgainzationUsers(!showOrganizationUsers)
                    }
                  />
                  <CustomCheckbox
                    label={'External User'}
                    checked={showExternalUsers}
                    onChange={() => setExternalUsers(!showExternalUsers)}
                  />
                  <CustomCheckbox
                    label={'Customer'}
                    checked={showCustomers}
                    onChange={() => setCustomers(!showCustomers)}
                  />
                  <CustomCheckbox
                    label={'Supplier'}
                    checked={showSuppliers}
                    onChange={() => setSuppliers(!showSuppliers)}
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
    </div>
  );
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const CustomCheckbox = ({
  label,
  checked,
  onChange,
  disabled = false,
}: any) => {
  return (
    <label className="mt-2 flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="peer hidden"
      />
      <div className="flex h-6 w-6 items-center justify-center rounded-md border-2 border-gray-400 transition-all">
        {checked && <IoCheckmark className="size-4 fill-gray-400" />}
      </div>
      <span className="font-normal">{label}</span>
    </label>
  );
};
