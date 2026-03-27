import { Search } from '@/components/Form/search';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';
import CustomModal from '@/components/Custom_Modal';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { usePresignedUserPhoto } from '@/hooks/usePresignedUserPhoto';
import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery } from 'react-query';
import { getAllOrgUsers, sendSubmissionEmail } from '@/app/(main)/(user-panel)/user/apps/api';
import { useSession } from 'next-auth/react';

interface SubmissionMailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appType: 'timesheet' | 'safetyhub' | 'signregister' | 'jsa' | 'assetmanager' | 'rollcall' | 'safetymeeting' | 'orderitinerary';
  submissionId: string;
  message?: string;
}

function RecipientAvatar({ photo }: { photo?: string }) {
  const src = usePresignedUserPhoto(photo);
  return (
    <img
      src={src}
      className="h-10 w-10 rounded-full"
      alt="user img"
    />
  );
}

const SubmissionMailModal: React.FC<SubmissionMailModalProps> = ({
  isOpen,
  onClose,
  appType,
  submissionId,
  message: initialMessage = '',
}) => {
  const [description, setDescription] = useState<string>(initialMessage);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserMails, setSelectedUserIds] = useState<string[]>([]);
  const [includeSelf, setIncludeSelf] = useState(false);
  const [selectedSection, setSection] = useState<'contacts' | 'message'>(
    'contacts'
  );
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const sessionUser = (session?.user as any)?.user ?? (session?.user as any);
  const currentUserEmail = sessionUser?.email ?? '';
  const currentUserName = [sessionUser?.firstName, sessionUser?.lastName].filter(Boolean).join(' ') || 'Me';

  const { data: orgUsers, isLoading: isLoadingContacts } = useQuery({
    queryKey: ['listofUsersForEmailSubmission'],
    queryFn: () => getAllOrgUsers(axiosAuth),
    enabled: isOpen,
  });

  // Recipients: org users with role 2 (member) or 3 (admin), plus current user if not in list
  const filteredContacts = useMemo(() => {
    const list = (orgUsers ?? [])
      .filter((u: any) => u.role === 2 || u.role === 3)
      .filter(
        (u: any) =>
          `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (u.email ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((u: any) => ({
        _id: u._id,
        firstName: u.firstName ?? '',
        lastName: u.lastName ?? '',
        email: u.email ?? '',
        photo: u.photo,
      }));
    const hasSelf = currentUserEmail && list.some((u: any) => (u.email || '').toLowerCase() === currentUserEmail.toLowerCase());
    if (currentUserEmail && !hasSelf) {
      return [
        { _id: 'self', firstName: currentUserName || 'Me', lastName: '', email: currentUserEmail, photo: '' },
        ...list,
      ];
    }
    return list;
  }, [orgUsers, searchQuery, currentUserEmail, currentUserName]);

  const sendMailSubmissionMutation = useMutation(sendSubmissionEmail, {
    onSuccess: () => {
      toast.success('Email sent successfully!');
      // Reset form state
      setSelectedUserIds([]);
      setDescription(initialMessage);
      setSection('contacts');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send email');
    },
  });

  const handleCheckboxChange = (email: string) => {
    setSelectedUserIds((prevState) => {
      const isSelected = prevState.includes(email);
      if (isSelected) {
        return prevState.filter((id) => id !== email);
      }
      if (prevState.length < 3) {
        return [...prevState, email];
      }
      return prevState;
    });
  };

  const handleCancel = () => {
    if (selectedSection === 'message') {
      setSection('contacts');
    } else {
      onClose();
    }
  };

  const handleSubmit = () => {
    if (selectedSection === 'contacts') {
      if (selectedUserMails.length === 0 && !includeSelf) {
        toast.error('Please select at least one recipient or include yourself');
        return;
      }
      setSection('message');
    } else {
      submitMail();
    }
  };

  const submitMail = async () => {
    const recipients = [...selectedUserMails];
    if (includeSelf && currentUserEmail && !recipients.includes(currentUserEmail)) {
      recipients.push(currentUserEmail);
    }
    if (recipients.length === 0) {
      toast.error('Please select at least one recipient or include yourself');
      return;
    }

    sendMailSubmissionMutation.mutate({
      axiosAuth,
      data: {
        appType,
        submissionId,
        emails: recipients,
        message: description,
      },
    });
  };

  if (!isOpen) return null;

  return (
    <CustomModal
      isOpen={isOpen}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      submitValue={
        selectedSection === 'contacts'
          ? `Select ${
              selectedUserMails.length > 0
                ? `(${selectedUserMails.length})`
                : ''
            }`
          : sendMailSubmissionMutation.isLoading
            ? 'Sending...'
            : 'Send'
      }
      cancelButton={selectedSection === 'contacts' ? 'Cancel' : 'Back'}
      submitDisabled={
        selectedSection === 'contacts'
          ? selectedUserMails.length === 0 && !includeSelf
          : sendMailSubmissionMutation.isLoading
      }
      isLoading={
        sendMailSubmissionMutation.isLoading && selectedSection === 'message'
      }
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
              d="M41.6654 14.9974C41.6654 13.1641 40.1654 11.6641 38.332 11.6641H11.6654C9.83203 11.6641 8.33203 13.1641 8.33203 14.9974V34.9974C8.33203 36.8307 9.83203 38.3307 11.6654 38.3307H38.332C40.1654 38.3307 41.6654 36.8307 41.6654 34.9974V14.9974ZM38.332 14.9974L24.9987 23.3307L11.6654 14.9974H38.332ZM38.332 34.9974H11.6654V18.3307L24.9987 26.6641L38.332 18.3307V34.9974Z"
              fill="#0063F7"
            />
          </svg>

          <div>
            <h2 className="text-xl font-semibold text-[#1E1E1E]">
              {'Email Submission'}
            </h2>
            <span className="mt-1 text-base font-normal text-[#616161]">
              {selectedSection == 'contacts' ? (
                <>{'Send a PDF attachment to an email. 3 recipients max.'}</>
              ) : (
                <> {'Add a message (optional).'}</>
              )}
            </span>
          </div>
        </>
      }
      body={
        <div className="mx-6 mb-4 max-h-[500px]">
          {selectedSection == 'contacts' ? (
            <>
              <div className="mb-2 flex items-center gap-2">
                <CustomBlueCheckBox
                  checked={includeSelf}
                  onChange={() => setIncludeSelf((prev) => !prev)}
                />
                <span className="text-sm text-[#1E1E1E]">Include my email as recipient</span>
              </div>
              <div className="mb-4 flex max-w-[400px] items-center gap-2">
                <Search
                  inputRounded={true}
                  type="search"
                  className="rounded-md bg-[#eeeeee] placeholder:text-[#616161]"
                  name="search"
                  placeholder="Search Contacts"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="h-[350px] overflow-y-auto">
                {isLoadingContacts ? (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-gray-500">Loading contacts...</span>
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-gray-500">No contacts found</span>
                  </div>
                ) : (
                  filteredContacts.map((user) => {
                    const isSelected = selectedUserMails.includes(user.email);
                    const isDisabled =
                      selectedUserMails.length === 3 && !isSelected;
                    return (
                      <div
                        key={user._id}
                        className="mb-2 flex items-center justify-between rounded-xl border-2 border-gray-300/80 p-2"
                      >
                        <div className="flex items-center gap-2">
                          <RecipientAvatar photo={user.photo} />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-[#1E1E1E]">
                              {`${user.firstName} ${user.lastName}`}
                            </span>
                            <span className="text-xs text-[#616161]">
                              {user.email}
                            </span>
                          </div>
                        </div>
                        <CustomBlueCheckBox
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => handleCheckboxChange(user.email)}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            // Second Section - Message
            <>
              <div className="h-[350px]">
                {/* Show selected recipients */}
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">
                    Recipients:
                  </h3>
                  <div className="space-y-1">
                    {includeSelf && currentUserEmail && (
                      <div className="flex items-center gap-2">
                        <span className="text-base text-[#616161]">(You)</span>
                        <span className="text-xs text-[#616161]">{currentUserEmail}</span>
                      </div>
                    )}
                    {filteredContacts
                      .filter((user) => selectedUserMails.includes(user.email))
                      .map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center justify-start gap-2"
                        >
                          <span className="truncate text-base font-normal text-[#616161]">
                            {`${user.firstName} ${user.lastName}`}
                          </span>
                          <span className="truncate text-xs font-normal text-[#616161]">
                            {`- ${user.email}`}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="my-8">
                  <label className="mb-2 block" htmlFor="description">
                    Your Message
                  </label>
                  <textarea
                    rows={6}
                    id="description"
                    name="description"
                    placeholder="Enter a message"
                    className={` ${'border-[#EEEEEE]'} w-full resize-none rounded-xl border-1 border-gray-300 p-2 shadow-sm`}
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      }
    />
  );
};

export default SubmissionMailModal;
