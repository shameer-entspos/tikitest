import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/Buttons';
import Loader from '@/components/DottedLoader/loader';
import CustomModal from '@/components/Custom_Modal';
import { SelectNotificationMember } from './SelectNotificationMember';
import { CreateNotifictionRecipients } from './CreateNotifictionRecipients';
import { useQuery, useQueryClient } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { getAllOrgUsers } from '@/app/(main)/(user-panel)/user/apps/api';

export interface Recipient {
  email: string;
  firstName: string;
  lastName: string;
  _id?: string;
  photo?: string;
}

interface NotificationRecipientsProps {
  recipients: Recipient[];
  onUpdateRecipients: (recipients: Recipient[]) => void;
  maxRecipients?: number;
  queryKey?: string; // For updating query cache when creating new recipients (default: 'listofUsersForNotification')
  showMaxLabel?: boolean;
  recipientDisplayFormat?: 'email' | 'name-email' | 'name';
  className?: string;
  modalTitle?: string;
  modalDescription?: string;
  modalDescriptionForContacts?: string; // For Safety Hub which uses contacts
  isLoading?: boolean; // For showing loading state in the Add button
  useContacts?: boolean; // For Safety Hub which uses contacts instead of org users
  contactsData?: Recipient[]; // For Safety Hub contacts data
}

export function NotificationRecipients({
  recipients = [],
  onUpdateRecipients,
  maxRecipients = 3,
  queryKey = 'listofUsersForNotification',
  showMaxLabel = true,
  recipientDisplayFormat = 'email',
  className = '',
  modalTitle = 'Select Notification Recipients',
  modalDescription = 'You can select up to 3 people in your organization.',
  modalDescriptionForContacts,
  isLoading = false,
  useContacts = false,
  contactsData = [],
}: NotificationRecipientsProps) {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const [showModel, setShowModel] = useState(false);
  const [showNewCreateModel, setShowNewCreateModel] = useState(false);
  const [selectedUsers, setAllSelectedUsers] = useState<Recipient[]>([]);
  const [wasLoading, setWasLoading] = useState(false);

  // Fetch organization users (role 2 - managers)
  const { data: orgUsers } = useQuery({
    queryKey: queryKey,
    queryFn: () => getAllOrgUsers(axiosAuth),
    refetchOnWindowFocus: false,
    enabled: !useContacts, // Only fetch if not using contacts
  });

  // Filter users to show only role 2 (managers)
  const filteredUsers = useMemo(() => {
    if (useContacts) {
      // For contacts, check if we need to merge with query cache
      const contactsQueryData = queryClient.getQueryData(queryKey) as any;
      if (contactsQueryData?.data) {
        // Merge contacts from query cache with contactsData prop
        const cacheContacts = [
          ...(contactsQueryData.data.contacts ?? []).map((c: any) => ({
            email: c.email || '',
            firstName: c.firstName || '',
            lastName: c.lastName || '',
            _id: c._id,
            photo: c.photo,
          })),
          ...(contactsQueryData.data.externalFriends ?? []).map((f: any) => ({
            email: f.email || '',
            firstName: f.firstName || '',
            lastName: f.lastName || '',
            _id: f._id,
            photo: f.photo,
          })),
        ];
        // Merge with contactsData prop, avoiding duplicates by email
        const merged = [...contactsData];
        cacheContacts.forEach((cacheContact) => {
          if (
            !merged.some(
              (c) =>
                c.email?.toLowerCase() === cacheContact.email?.toLowerCase()
            )
          ) {
            merged.push(cacheContact);
          }
        });
        return merged;
      }
      return contactsData;
    }
    if (orgUsers) {
      return (orgUsers ?? [])
        .filter((user: any) => {
          if (!user.role) return false;
          const role =
            typeof user.role === 'string' ? parseInt(user.role) : user.role;
          return role === 2; // Only role 2 (managers)
        })
        .map((user: any) => ({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          _id: user._id,
          photo: user.photo,
        }));
    }
    return [];
  }, [orgUsers, useContacts, contactsData, queryKey, queryClient]);

  const handleShowCreate = () => setShowNewCreateModel(!showNewCreateModel);
  const handleShowModel = () => {
    setShowModel(!showModel);
    setAllSelectedUsers([...recipients]);
  };

  const handleRemoveRecipient = (recipientToRemove: Recipient) => {
    const updated = recipients.filter(
      (r) => r.email?.toLowerCase() !== recipientToRemove.email?.toLowerCase()
    );
    onUpdateRecipients(updated);
  };

  const handleAddRecipients = () => {
    if (selectedUsers.length <= maxRecipients) {
      setWasLoading(true);
      // Only send firstName, lastName, and email to match database schema
      const recipientsToAdd = selectedUsers.map((user) => ({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      }));
      onUpdateRecipients(recipientsToAdd);
      // Close modal immediately after calling API
      setShowModel(false);
      setAllSelectedUsers([]);
      setShowNewCreateModel(false);
    }
  };

  // Reset loading state when mutation completes
  useEffect(() => {
    if (wasLoading && !isLoading) {
      setWasLoading(false);
    }
    if (isLoading) {
      setWasLoading(true);
    }
  }, [isLoading, wasLoading]);

  const getRecipientDisplay = (recipient: Recipient) => {
    switch (recipientDisplayFormat) {
      case 'name-email':
        return `${recipient.firstName} ${recipient.lastName} - ${recipient.email}`;
      case 'name':
        return `${recipient.firstName} ${recipient.lastName}`;
      case 'email':
      default:
        return recipient.email;
    }
  };

  return (
    <>
      <div className={`mb-5 mt-8 flex flex-col ${className}`}>
        <div className="mb-3 flex items-end justify-between">
          <label className="mt-2 block" htmlFor="description">
            Notification Recipients
          </label>
          {showMaxLabel && (
            <div className="ml-2 text-gray-400">{`Max ${maxRecipients}`}</div>
          )}
        </div>

        {recipients.map((mem, index) => {
          return (
            <div
              key={index}
              className="flex w-full items-center justify-between gap-3 py-2"
            >
              <div
                className="flex min-h-[44px] w-full items-center rounded-lg bg-[#FFFFFF] px-4 py-2"
                style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}
              >
                <span className="truncate text-sm text-[#1E1E1E]">
                  {getRecipientDisplay(mem)}
                </span>
              </div>
              <div
                className="flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-[#EEEEEE]"
                onClick={() => handleRemoveRecipient(mem)}
              >
                <svg
                  width="24"
                  height="24"
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
        })}

        {recipients.length < maxRecipients && (
          <div
            className="ml-5 mt-5 cursor-pointer text-primary-500"
            onClick={handleShowModel}
          >
            {`+ Add`}
          </div>
        )}
      </div>

      <CustomModal
        isOpen={showModel}
        handleCancel={() => {
          setShowModel(false);
          setShowNewCreateModel(false);
          setAllSelectedUsers([]);
        }}
        handleSubmit={handleAddRecipients}
        submitDisabled={recipients.length >= maxRecipients || isLoading}
        isLoading={isLoading}
        submitValue="Add"
        cancelButton="Cancel"
        variant="primary"
        cancelvariant="primaryOutLine"
        showFooter={!showNewCreateModel}
        showFooterSubmit={!showNewCreateModel}
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
              <g clipPath="url(#clip0_3381_19261)">
                <path
                  d="M21.8398 31.4018C22.4746 31.7241 23.0459 32.1196 23.5537 32.5883C24.0615 33.0571 24.501 33.5844 24.8721 34.1704C25.2432 34.7563 25.5215 35.3813 25.707 36.0454C25.8926 36.7094 25.9902 37.4028 26 38.1255H24.125C24.125 37.354 23.9785 36.6264 23.6855 35.9428C23.3926 35.2592 22.9922 34.6635 22.4844 34.1557C21.9766 33.6479 21.376 33.2426 20.6826 32.9399C19.9893 32.6372 19.2617 32.4907 18.5 32.5005C17.7188 32.5005 16.9912 32.6469 16.3174 32.9399C15.6436 33.2329 15.0479 33.6333 14.5303 34.1411C14.0127 34.6489 13.6074 35.2495 13.3145 35.9428C13.0215 36.6362 12.875 37.3637 12.875 38.1255H11C11 37.4126 11.0977 36.7241 11.293 36.06C11.4883 35.396 11.7666 34.771 12.1279 34.185C12.4893 33.5991 12.9238 33.0717 13.4316 32.603C13.9395 32.1342 14.5156 31.7339 15.1602 31.4018C14.4375 30.8647 13.876 30.2007 13.4756 29.4096C13.0752 28.6186 12.875 27.7739 12.875 26.8755C12.875 26.104 13.0215 25.3764 13.3145 24.6928C13.6074 24.0092 14.0078 23.4135 14.5156 22.9057C15.0234 22.3979 15.6191 21.9926 16.3027 21.6899C16.9863 21.3872 17.7188 21.2407 18.5 21.2505C19.3984 21.2505 20.2432 21.4507 21.0342 21.851C21.8252 22.2514 22.4893 22.813 23.0264 23.5356C23.3975 22.8032 23.8711 22.1489 24.4473 21.5727C25.0234 20.9966 25.6777 20.5229 26.4102 20.1518C25.6875 19.6147 25.126 18.9507 24.7256 18.1596C24.3252 17.3686 24.125 16.5239 24.125 15.6255C24.125 14.854 24.2715 14.1264 24.5645 13.4428C24.8574 12.7592 25.2578 12.1635 25.7656 11.6557C26.2734 11.1479 26.8691 10.7426 27.5527 10.4399C28.2363 10.1372 28.9688 9.99069 29.75 10.0005C30.5215 10.0005 31.249 10.1469 31.9326 10.4399C32.6162 10.7329 33.2119 11.1333 33.7197 11.6411C34.2275 12.1489 34.6328 12.7495 34.9355 13.4428C35.2383 14.1362 35.3848 14.8637 35.375 15.6255C35.375 16.5239 35.1748 17.3686 34.7744 18.1596C34.374 18.9507 33.8125 19.6147 33.0898 20.1518C33.7246 20.4741 34.2959 20.8696 34.8037 21.3383C35.3115 21.8071 35.751 22.3344 36.1221 22.9204C36.4932 23.5063 36.7715 24.1313 36.957 24.7954C37.1426 25.4594 37.2402 26.1528 37.25 26.8755H35.375C35.375 26.104 35.2285 25.3764 34.9355 24.6928C34.6426 24.0092 34.2422 23.4135 33.7344 22.9057C33.2266 22.3979 32.626 21.9926 31.9326 21.6899C31.2393 21.3872 30.5117 21.2407 29.75 21.2505C28.9688 21.2505 28.2412 21.3969 27.5674 21.6899C26.8936 21.9829 26.2979 22.3833 25.7803 22.8911C25.2627 23.3989 24.8574 23.9995 24.5645 24.6928C24.2715 25.3862 24.125 26.1137 24.125 26.8755C24.125 27.7739 23.9248 28.6186 23.5244 29.4096C23.124 30.2007 22.5625 30.8647 21.8398 31.4018ZM26 15.6255C26 16.143 26.0977 16.6264 26.293 17.0757C26.4883 17.5249 26.7568 17.9253 27.0986 18.2768C27.4404 18.6284 27.8359 18.8969 28.2852 19.0825C28.7344 19.268 29.2227 19.3657 29.75 19.3755C30.2676 19.3755 30.751 19.2778 31.2002 19.0825C31.6494 18.8872 32.0498 18.6186 32.4014 18.2768C32.7529 17.935 33.0215 17.5395 33.207 17.0903C33.3926 16.6411 33.4902 16.1528 33.5 15.6255C33.5 15.1079 33.4023 14.6245 33.207 14.1753C33.0117 13.726 32.7432 13.3257 32.4014 12.9741C32.0596 12.6225 31.6641 12.354 31.2148 12.1684C30.7656 11.9829 30.2773 11.8852 29.75 11.8755C29.2324 11.8755 28.749 11.9731 28.2998 12.1684C27.8506 12.3637 27.4502 12.6323 27.0986 12.9741C26.7471 13.3159 26.4785 13.7114 26.293 14.1606C26.1074 14.6098 26.0098 15.0981 26 15.6255ZM14.75 26.8755C14.75 27.393 14.8477 27.8764 15.043 28.3257C15.2383 28.7749 15.5068 29.1753 15.8486 29.5268C16.1904 29.8784 16.5859 30.1469 17.0352 30.3325C17.4844 30.518 17.9727 30.6157 18.5 30.6255C19.0176 30.6255 19.501 30.5278 19.9502 30.3325C20.3994 30.1372 20.7998 29.8686 21.1514 29.5268C21.5029 29.185 21.7715 28.7895 21.957 28.3403C22.1426 27.8911 22.2402 27.4028 22.25 26.8755C22.25 26.3579 22.1523 25.8745 21.957 25.4253C21.7617 24.976 21.4932 24.5757 21.1514 24.2241C20.8096 23.8725 20.4141 23.604 19.9648 23.4184C19.5156 23.2329 19.0273 23.1352 18.5 23.1255C17.9824 23.1255 17.499 23.2231 17.0498 23.4184C16.6006 23.6137 16.2002 23.8823 15.8486 24.2241C15.4971 24.5659 15.2285 24.9614 15.043 25.4106C14.8574 25.8598 14.7598 26.3481 14.75 26.8755ZM36.7812 40.0005L32.5625 36.7046L28.3438 40.0005L30.043 34.727L26 31.563H31.0537L32.5625 26.8755L34.0713 31.563H39.125L35.082 34.727L36.7812 40.0005Z"
                  fill="#0063F7"
                />
              </g>
              <defs>
                <clipPath id="clip0_3381_19261">
                  <rect
                    width="30"
                    height="30"
                    fill="white"
                    transform="translate(10 10)"
                  />
                </clipPath>
              </defs>
            </svg>
            <div>
              <h2 className="text-xl font-semibold">{modalTitle}</h2>
              <p className="mt-1 text-sm font-normal text-[#616161]">
                {modalDescriptionForContacts || modalDescription}
              </p>
            </div>
          </>
        }
        body={
          showNewCreateModel ? (
            <CreateNotifictionRecipients
              handleShowCreate={handleShowCreate}
              queryKey={queryKey}
              recipients={recipients}
            />
          ) : (
            <>
              <SelectNotificationMember
                handleShowCreate={handleShowCreate}
                recipients={recipients}
                data={filteredUsers}
                onChange={setAllSelectedUsers}
                initialSelectedUsers={selectedUsers}
              />
              <div className="mt-4 flex justify-center">
                <Button
                  variant="simple"
                  className="cursor-pointer text-primary-600"
                  onClick={handleShowCreate}
                >
                  Not Listed
                </Button>
              </div>
            </>
          )
        }
      />
    </>
  );
}
