/* eslint-disable @next/next/no-img-element */
'use client';
import { BsFillBellFill, BsQuestionCircle } from 'react-icons/bs';
// @ts-ignore
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
  Avatar,
  Badge,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  useDisclosure,
} from '@nextui-org/react';

import { usePathname } from 'next/navigation';
import { socket } from '@/app/helpers/user/socket.helper';
import { AppDispatch } from '@/store';
import { useDispatch } from 'react-redux';
import { setSection } from '@/store/contactSlice';
import { useRouter } from 'next/navigation';
import useSocketSeenCount from '@/app/(main)/(user-panel)/user/chats/useSocketSeenCount';
import { X } from 'lucide-react';
import { useQuery } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import {
  getAssistantNotification,
  markNotificationAsRead,
} from '@/app/(main)/(user-panel)/user/chats/api';
import { dateFormat } from '@/app/helpers/dateFormat';
import { useMutation, useQueryClient } from 'react-query';
import { usePresignedUserPhoto } from '@/hooks/usePresignedUserPhoto';

function UserNavbar() {
  const { data: session } = useSession();
  const userPhotoDisplay = usePresignedUserPhoto(session?.user?.user?.photo);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [navbar, setNavbar] = useState(false);
  const reduxDispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const router = useRouter();

  const seenCount = useSocketSeenCount(socket, {
    userId: session?.user?.user?._id ?? '',
    organizationId: session?.user?.user?.organization?._id ?? '',
  });

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
    setNavbar(!navbar);
  };
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  // Assuming you have session

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    socket.emit('login', session?.user.user._id);
  }, [session?.user.user._id]);
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['assitant'],
    queryFn: () => getAssistantNotification(axiosAuth),
  });

  const markAsReadMutation = useMutation(
    (notificationId: string) =>
      markNotificationAsRead(axiosAuth, notificationId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['assitant']);
      },
    }
  );

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.notifications ?? [];

  const handleNotificationClick = (item: any) => {
    const { redirectType, appType, link } = item;

    // Navigate based on redirectType and appType
    if (link) {
      router.push(link);
      return;
    }

    switch (appType) {
      case 'timesheet':
        if (redirectType === 'timesheet') {
          router.push('/user/apps/timesheets');
        } else if (redirectType === 'expense') {
          router.push('/user/apps/timesheets?tab=expenses');
        }
        break;
      case 'safetyhub':
        if (redirectType === 'hazard') {
          router.push('/user/apps/sh');
        } else if (redirectType === 'safetyMeeting') {
          router.push('/user/apps/sh?tab=safetyMeetings');
        } else if (redirectType === 'discussionTopic') {
          router.push('/user/apps/sh?tab=discussionTopics');
        }
        break;
      case 'signregister':
        if (redirectType === 'signIn' || redirectType === 'signOut') {
          router.push('/user/apps/sr');
        } else if (redirectType === 'rollCall') {
          router.push('/user/apps/sr?tab=rollCall');
        }
        break;
      case 'jsa':
        if (redirectType === 'jsaSubmission') {
          router.push('/user/apps/jsa');
        }
        break;
      case 'assetmanager':
        if (redirectType === 'checkIn' || redirectType === 'checkOut') {
          router.push('/user/apps/am');
        }
        break;
      default:
        router.push('/user/apps');
    }
  };

  const getActionText = (redirectType?: string) => {
    const actionMap: Record<string, string> = {
      timesheet: 'View Timesheet',
      expense: 'View Expense',
      hazard: 'View Hazard',
      safetyMeeting: 'View Safety Meeting',
      discussionTopic: 'View Discussion',
      signIn: 'View Sign In',
      signOut: 'View Sign Out',
      rollCall: 'View Roll Call',
      jsaSubmission: 'View JSA',
      checkIn: 'View Check In',
      checkOut: 'View Check Out',
    };
    return actionMap[redirectType || ''] || 'View Details';
  };

  return (
    <>
      <div className="inset-0 z-10 flex items-center justify-center bg-[#0063F7] shadow">
        <div className="w-full max-w-[1380px] bg-[#0063F7]">
          <Navbar
            maxWidth="2xl"
            onMenuOpenChange={setIsMenuOpen}
            className="flex h-full items-center justify-center bg-[#0063F7]"
          >
            {/* Navbar Content */}
            <NavbarContent className="flex justify-center md:w-1/5">
              <NavbarMenuToggle
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                className="text-white md:hidden"
              />
              <NavbarBrand>
                <a href="/user">
                  <img src="/svg/logo.svg" alt="Logo" />
                </a>
              </NavbarBrand>
            </NavbarContent>

            {/* Navigation Links */}
            <NavbarContent
              className="hidden justify-center gap-8 md:flex md:w-3/5 xl:gap-[90px]"
              justify="center"
            >
              {[
                { label: 'Feed', href: '/user/feeds' },
                { label: 'Tasks', href: '/user/tasks' },
                { label: 'Projects', href: '/user/projects', isBold: true },
                { label: 'Apps', href: '/user/apps' },
                { label: 'Contacts', href: '/user/chats' },
              ].map((item, index) => (
                <NavbarItem
                  key={index}
                  className={` ${
                    item.href == pathname
                      ? 'font-bold text-white'
                      : 'border-none font-normal text-white'
                  } text-lg`}
                  onClick={() => {
                    reduxDispatch(setSection('contact'));
                  }}
                >
                  {item.href && (
                    <Badge
                      content={false}
                      size="sm"
                      shape="circle"
                      className="border-none bg-primary-400 text-xs"
                    >
                      <div className={`relative flex flex-col items-center`}>
                        <a href={item.href} className="mx-auto">
                          {item.label}
                        </a>

                        <span className="absolute top-[155%]">
                          <div
                            className={`${
                              item.href == pathname
                                ? 'h-1 w-20 rounded-xl bg-white shadow xl:w-24'
                                : 'mt-0 h-0 w-0 bg-transparent'
                            }`}
                          ></div>
                        </span>
                      </div>
                    </Badge>
                  )}
                </NavbarItem>
              ))}
            </NavbarContent>

            {/* Navbar Content (End) */}
            <NavbarContent
              className="flex justify-end md:w-1/5"
              as="div"
              justify="end"
            >
              <div className="flex items-center justify-end gap-5">
                {/* <BsFillBellFill className="h-5 w-5 text-white" /> */}
                <div
                  className="relative cursor-pointer"
                  onClick={() => {
                    router.push('/user/chats');
                    reduxDispatch(setSection('direct'));
                  }}
                >
                  <img src="/contact.svg" alt="Chats" />
                  {seenCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border-1 border-primary-500 bg-white text-xs font-normal text-primary-500">
                      {seenCount > 9 ? '9+' : seenCount}
                    </span>
                  )}
                </div>

                <Dropdown
                  placement="bottom-end"
                  className="w-[400px] rounded-2xl bg-white px-0 py-2 shadow-lg"
                >
                  <DropdownTrigger>
                    <div className="relative cursor-pointer">
                      <svg
                        width="32"
                        height="31"
                        viewBox="0 0 32 31"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M15.8175 29.7088C15.3021 29.7088 14.7642 29.6698 14.2037 29.5918C13.6422 29.5129 12.9656 29.3884 12.1738 29.2185C10.3954 30.6384 8.36031 31.2096 6.06846 30.9319C3.77757 30.6533 2.0894 29.6108 1.00393 27.8045C0.0720296 26.2824 -0.211093 24.6553 0.154567 22.9232C0.519267 21.1903 1.43342 19.7401 2.89701 18.5727C2.87782 18.3712 2.86822 18.139 2.86822 17.8762V17.1824C1.49196 16.1088 0.61476 14.6963 0.236624 12.9447C-0.141512 11.1932 0.0931437 9.59259 0.940591 8.14288C1.79092 6.73403 3.00018 5.75936 4.56839 5.21885C6.13756 4.67834 7.73072 4.64026 9.34788 5.10462C9.7836 3.72828 10.5931 2.60919 11.7765 1.74735C12.9598 0.885509 14.3068 0.45459 15.8175 0.45459C17.3281 0.45459 18.6751 0.885509 19.8584 1.74735C21.0418 2.60919 21.8513 3.72828 22.287 5.10462C23.9042 4.64026 25.5017 4.67834 27.0795 5.21885C28.6573 5.75936 29.8627 6.7345 30.6958 8.14427C31.5423 9.57633 31.7764 11.1677 31.3983 12.9183C31.0202 14.6689 30.1425 16.0898 28.7653 17.181V17.8776C28.7653 18.1395 28.7561 18.3712 28.7379 18.5727C30.2015 19.741 31.1161 21.1865 31.4818 22.9093C31.8475 24.632 31.5643 26.2638 30.6324 27.8045C29.546 29.6118 27.8574 30.6542 25.5665 30.9319C23.2756 31.2096 21.2405 30.6384 19.4611 29.2185C18.6693 29.3884 17.9927 29.5129 17.4313 29.5918C16.8698 29.6698 16.3319 29.7088 15.8175 29.7088ZM15.8175 28.3158C19.0326 28.3158 21.7558 27.2361 23.9872 25.0769C26.2186 22.9177 27.3343 20.2824 27.3343 17.1713C27.3343 16.3912 27.2575 15.6352 27.104 14.9034C26.9494 14.1716 26.7181 13.4709 26.4101 12.8013C25.769 13.248 25.0612 13.5948 24.2867 13.8419C23.5112 14.088 22.6676 14.211 21.7558 14.211C19.511 14.211 17.6002 13.4481 16.0233 11.9222C14.4465 10.3964 13.6581 8.54733 13.6581 6.37509V6.21489C10.9785 6.71081 8.749 7.97943 6.96965 10.0207C5.1903 12.062 4.30063 14.4455 4.30063 17.1713C4.30063 20.2824 5.41632 22.9177 7.64771 25.0769C9.87909 27.2361 12.6023 28.3158 15.8175 28.3158ZM11.4986 20.3057C10.9948 20.3057 10.5687 20.1371 10.2203 19.8C9.8719 19.4629 9.69818 19.051 9.69914 18.5643C9.7001 18.0777 9.8743 17.6654 10.2217 17.3273C10.5691 16.9893 10.9948 16.8212 11.4986 16.823C12.0025 16.8249 12.4286 16.9934 12.777 17.3287C13.1254 17.664 13.2991 18.0758 13.2982 18.5643C13.2972 19.0528 13.123 19.4652 12.7756 19.8014C12.4282 20.1376 12.0025 20.3057 11.4986 20.3057ZM20.1363 20.3057C19.6324 20.3057 19.2063 20.1371 18.8579 19.8C18.5095 19.4629 18.3358 19.051 18.3368 18.5643C18.3377 18.0777 18.5119 17.6654 18.8593 17.3273C19.2068 16.9893 19.6324 16.8212 20.1363 16.823C20.6401 16.8249 21.0663 16.9934 21.4146 17.3287C21.763 17.664 21.9367 18.0758 21.9358 18.5643C21.9348 19.0528 21.7606 19.4652 21.4132 19.8014C21.0658 20.1376 20.6401 20.3057 20.1363 20.3057Z"
                          fill="white"
                        />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border-1 border-primary-500 bg-white text-xs font-normal text-primary-500">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Profile Actions"
                    className="px-0"
                    variant="light"
                  >
                    <DropdownItem
                      key={'title'}
                      className="relative px-0"
                      textValue="Tiki Assistant"
                    >
                      <p className="flex justify-between px-3 pb-4 text-center text-lg font-semibold">
                        <svg
                          width="26"
                          height="25"
                          viewBox="0 0 26 25"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12.8539 23.4034C12.4416 23.4034 12.0113 23.3722 11.5629 23.3098C11.1137 23.2466 10.5724 23.1471 9.93901 23.0111C8.5163 24.1471 6.8882 24.604 5.05472 24.3819C3.22201 24.159 1.87147 23.325 1.0031 21.8799C0.257575 20.6622 0.0310771 19.3605 0.323605 17.9749C0.615364 16.5885 1.34668 15.4284 2.51756 14.4945C2.50221 14.3333 2.49453 14.1475 2.49453 13.9373V13.3823C1.39352 12.5234 0.69176 11.3934 0.389251 9.99213C0.0867418 8.5909 0.274466 7.3104 0.952424 6.15063C1.63268 5.02355 2.6001 4.24381 3.85467 3.81141C5.11 3.379 6.38453 3.34854 7.67826 3.72002C8.02683 2.61895 8.67446 1.72368 9.62115 1.03421C10.5678 0.344735 11.6454 0 12.8539 0C14.0624 0 15.14 0.344735 16.0867 1.03421C17.0334 1.72368 17.681 2.61895 18.0296 3.72002C19.3233 3.34854 20.6013 3.379 21.8635 3.81141C23.1258 4.24381 24.0901 5.02392 24.7566 6.15174C25.4338 7.2974 25.6211 8.57046 25.3186 9.97095C25.0161 11.3714 24.3139 12.5082 23.2122 13.3812V13.9384C23.2122 14.1479 23.2049 14.3333 23.1903 14.4945C24.3612 15.4291 25.0929 16.5856 25.3854 17.9638C25.6779 19.342 25.4514 20.6473 24.7059 21.8799C23.8368 23.3257 22.4858 24.1597 20.6531 24.3819C18.8204 24.604 17.1923 24.1471 15.7688 23.0111C15.1354 23.1471 14.5941 23.2466 14.145 23.3098C13.6958 23.3722 13.2655 23.4034 12.8539 23.4034ZM12.8539 22.2889C15.426 22.2889 17.6046 21.4252 19.3897 19.6978C21.1748 17.9704 22.0674 15.8623 22.0674 13.3734C22.0674 12.7493 22.006 12.1445 21.8831 11.559C21.7595 10.9736 21.5745 10.413 21.328 9.87734C20.8151 10.2347 20.2489 10.5122 19.6293 10.7098C19.0089 10.9067 18.334 11.0052 17.6046 11.0052C15.8088 11.0052 14.2801 10.3948 13.0186 9.17412C11.7571 7.95343 11.1264 6.47419 11.1264 4.7364V4.60824C8.98273 5.00498 7.19915 6.01987 5.77567 7.6529C4.35219 9.28594 3.64045 11.1928 3.64045 13.3734C3.64045 15.8623 4.53301 17.9704 6.31812 19.6978C8.10323 21.4252 10.2818 22.2889 12.8539 22.2889ZM9.39887 15.8809C8.99578 15.8809 8.65488 15.746 8.37618 15.4763C8.09747 15.2066 7.9585 14.8771 7.95927 14.4878C7.96003 14.0985 8.09939 13.7686 8.37733 13.4982C8.65527 13.2277 8.99578 13.0933 9.39887 13.0947C9.80196 13.0962 10.1429 13.2311 10.4216 13.4993C10.7003 13.7675 10.8392 14.097 10.8385 14.4878C10.8377 14.8786 10.6984 15.2085 10.4204 15.4774C10.1425 15.7464 9.80196 15.8809 9.39887 15.8809ZM16.309 15.8809C15.9059 15.8809 15.565 15.746 15.2863 15.4763C15.0076 15.2066 14.8686 14.8771 14.8694 14.4878C14.8701 14.0985 15.0095 13.7686 15.2874 13.4982C15.5654 13.2277 15.9059 13.0933 16.309 13.0947C16.7121 13.0962 17.053 13.2311 17.3317 13.4993C17.6104 13.7675 17.7493 14.097 17.7486 14.4878C17.7478 14.8786 17.6085 15.2085 17.3305 15.4774C17.0526 15.7464 16.7121 15.8809 16.309 15.8809Z"
                            fill="#0063F7"
                          />
                        </svg>
                        <span>Tiki Assistant</span>
                        <button className="text-gray-700">
                          <X />
                        </button>
                      </p>

                      <div className="border-b-2 border-gray-300/80" />
                    </DropdownItem>
                    <DropdownItem
                      key={'profile-pic'}
                      className="flex h-[400px] flex-col items-center overflow-y-auto px-0"
                      textValue="Tiki Assistant notifications"
                    >
                      {notifications.map((item, index) => (
                        <div
                          key={index}
                          className={`flex flex-col border-b-2 border-gray-300/80 p-2 ${
                            !item.isRead ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => {
                            if (!item.isRead) {
                              markAsReadMutation.mutate(item._id);
                            }
                            // Handle navigation based on redirectType
                            if (item.redirectType) {
                              handleNotificationClick(item);
                            }
                          }}
                        >
                          <HighlightQuotedText text={item.subtitle ?? ''} />
                          <div className="mt-2 flex items-center justify-between px-1">
                            {item.type == 'request' ? (
                              <div className="flex gap-8">
                                <span className="font-semibold text-primary-500">
                                  Decline
                                </span>
                                <span className="font-semibold text-primary-500">
                                  Accept
                                </span>
                              </div>
                            ) : (
                              <span className="font-semibold text-primary-500">
                                {getActionText(item.redirectType)}
                              </span>
                            )}
                            <span>{dateFormat(item.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </DropdownItem>
                    <DropdownItem
                      key={'profile-pic'}
                      className="px-0"
                      textValue="View All"
                    >
                      <div className="border-t-2 border-gray-300/80" />
                      <h3
                        className="flex items-center justify-center pt-2 text-center font-semibold text-primary-500"
                        onClick={() => {
                          reduxDispatch(setSection('contact'));
                          router.push('/user/chats?tab=activity&assistant=1');
                        }}
                      >
                        View All
                      </h3>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <Dropdown
                  placement="bottom-end"
                  className="min-w-0 max-w-[min(350px,95vw)] rounded-2xl bg-white px-0 py-2 shadow-lg"
                >
                  <DropdownTrigger>
                    <Avatar
                      isBordered
                      as="button"
                      className="border-2 transition-transform"
                      color="secondary"
                      name="name"
                      size="sm"
                      src={userPhotoDisplay}
                    />
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Profile Actions"
                    className="max-h-[min(85vh,600px)] min-w-[min(350px,95vw)] overflow-y-auto px-0"
                    variant="light"
                  >
                    <DropdownItem
                      key={'title'}
                      className="relative px-0"
                      textValue="My Account"
                    >
                      <h3 className="pb-3 text-center text-base font-semibold sm:pb-4 sm:text-lg">
                        My Account
                      </h3>
                      <div className="border-b-2 border-gray-300/80" />
                      <button className="absolute right-3 top-2 text-gray-700 sm:right-5 sm:top-2.5">
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </DropdownItem>
                    <DropdownItem
                      key={'profile-pic'}
                      className="flex flex-col items-center py-2"
                      textValue={`User profile: ${session?.user.user.firstName ?? ''} ${session?.user.user.lastName ?? ''}`}
                    >
                      <div className="relative mx-auto flex w-16 flex-col rounded-full sm:w-20">
                        <div className="flex flex-col items-center">
                          <img
                            src={userPhotoDisplay}
                            alt={`image `}
                            style={{ boxShadow: '0 0 10px #0000002d' }}
                            className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
                            onClick={() => {}}
                          />
                        </div>
                      </div>

                      <p className="mt-1.5 text-center text-base text-[#616161] sm:mt-2 sm:text-lg">
                        Hi, {session?.user.user.firstName ?? ''}{' '}
                        {session?.user.user.lastName ?? ''}
                      </p>
                      <p className="mt-1.5 text-center text-sm font-semibold text-[#1E1E1E] sm:mt-2 sm:text-base">
                        {session?.user.user.userId ?? ''}
                      </p>
                      <p className="mt-1 truncate px-2 text-center text-xs text-[#1E1E1E] underline sm:text-sm">
                        {session?.user.user.email ?? ''}
                      </p>

                      {session?.user.user.role == 3 && (
                        <>
                          <div className="mt-3 flex flex-col text-center text-xs text-[#616161] sm:mt-4 sm:text-sm">
                            <span className="my-0.5 sm:my-1">
                              Your organization admin contact is
                            </span>
                            <span className="truncate px-2">
                              {session?.user.user.organization?.email}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 p-3 font-semibold sm:mt-4 sm:gap-6 sm:p-4">
                        <button
                          className="rounded-full bg-gray-700 px-2.5 py-1 text-sm text-white sm:px-3 sm:text-base"
                          onClick={() => {
                            router.replace('/user/settings');
                          }}
                        >
                          My Settings
                        </button>
                        <button
                          key="logout"
                          color="danger"
                          className="text-sm text-primary-500 sm:text-base"
                          onClick={() => {
                            signOut({
                              callbackUrl: `/user`,
                            });
                          }}
                        >
                          Sign Out
                        </button>
                      </div>
                      {session?.user.user.role == 3 && (
                        <span
                          className="mt-3 flex w-full cursor-pointer justify-center text-center text-xs font-semibold text-primary-500 sm:mt-4 sm:text-sm"
                          onClick={() => {
                            router.replace('/organization');
                          }}
                        >
                          Admin Portal
                        </span>
                      )}
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </NavbarContent>

            {/* Navbar Menu */}
            <NavbarMenu>
              {[
                { label: 'Feed', href: '/user/feeds' },
                { label: 'Tasks', href: '/user/tasks' },
                { label: 'Projects', href: '/user/projects' },
                { label: 'Apps', href: '/user/apps' },
                { label: 'Messages', href: '/user/chats' },
                { label: '', icon: <BsFillBellFill /> },
                { label: '', icon: <BsQuestionCircle /> },
              ].map((item, index) => (
                <NavbarMenuItem
                  key={index}
                  className={` ${
                    item.href == pathname
                      ? 'font-bold text-black'
                      : 'font-normal text-gray-900'
                  } text-lg`}
                >
                  {item.href ? (
                    <Link href={item.href}>{item.label}</Link>
                  ) : (
                    <Link href="#">{item.icon}</Link>
                  )}
                </NavbarMenuItem>
              ))}
            </NavbarMenu>
          </Navbar>
        </div>
      </div>
      {/* 
      {isOpen && (
        <TikiUserProfile
          isOpen={isOpen}
          onOpen={onOpen}
          onOpenChange={onOpenChange}
        />
      )} */}
    </>
  );
}

export { UserNavbar };

export function HighlightQuotedText({ text }: { text: string }) {
  // Split on single quotes, keeping the quotes in the result
  const parts = text.split(/('.*?')/);

  return (
    <span className="text-base font-normal text-[#1E1E1E]">
      {parts.map((part, index) =>
        part.startsWith("'") && part.endsWith("'") ? (
          <strong
            className="text-base font-semibold text-[#1E1E1E]"
            key={index}
          >
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </span>
  );
}
