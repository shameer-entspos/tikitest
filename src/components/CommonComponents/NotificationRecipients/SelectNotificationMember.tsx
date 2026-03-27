'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Loader from '@/components/DottedLoader/loader';
import { Search } from '@/components/Form/search';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';
import { Recipient } from './NotificationRecipients';
import { PresignedUserAvatar } from '@/components/common/PresignedUserAvatar';

interface SelectNotificationMemberProps {
  handleShowCreate: () => void;
  recipients: Recipient[];
  data: Recipient[];
  onChange: (values: Recipient[]) => void;
  initialSelectedUsers?: Recipient[];
}

type SortOption =
  | 'Recent'
  | 'A-Z (First Name)'
  | 'Z-A (First Name)'
  | 'A-Z (Last Name)'
  | 'Z-A (Last Name)';

export function SelectNotificationMember({
  handleShowCreate,
  recipients,
  onChange,
  data,
  initialSelectedUsers,
}: SelectNotificationMemberProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<SortOption>('Recent');
  const [selectedUsers, setAllSelectedUsers] = useState<Recipient[]>(initialSelectedUsers || []);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync with initialSelectedUsers when it changes (when modal opens)
  useEffect(() => {
    if (initialSelectedUsers) {
      setAllSelectedUsers([...initialSelectedUsers]);
    }
  }, [initialSelectedUsers]);

  const selectOption = (option: SortOption) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const onOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  const filteredAndSortedUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const users = (data ?? [])
      .map((user, index) => ({ ...user, _originalIndex: index }))
      .filter((user) => {
        if (!query) return true;
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });

    const sorted = [...users].sort((a, b) => {
      if (selectedOption === 'Recent') {
        return a._originalIndex - b._originalIndex;
      }
      if (selectedOption === 'A-Z (First Name)') {
        return (a.firstName || '').localeCompare(b.firstName || '');
      }
      if (selectedOption === 'Z-A (First Name)') {
        return (b.firstName || '').localeCompare(a.firstName || '');
      }
      if (selectedOption === 'A-Z (Last Name)') {
        return (a.lastName || '').localeCompare(b.lastName || '');
      }
      return (b.lastName || '').localeCompare(a.lastName || '');
    });

    return sorted;
  }, [data, searchQuery, selectedOption]);

  if ((data ?? []).length < 1) {
    return (
      <div className="h-[150px]">
        <Loader />
      </div>
    );
  }

  return (
    <>
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
        <div
          className="DropDownn relative z-50 mx-3 inline-block text-left"
          ref={dropdownRef}
        >
          <div>
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-[#E2F3FF] px-3 py-[5px] text-sm font-medium text-gray-700 shadow-sm hover:bg-[#e1f0fa] focus:outline-none"
              id="options-menu"
              aria-expanded="true"
              aria-haspopup="true"
              onClick={() => setIsOpen((prev) => !prev)}
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
                <button
                  onClick={() => selectOption('Recent')}
                  className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  <span>Recent</span>
                  {selectedOption === 'Recent' && (
                    <span className="text-[#0063F7]">✓</span>
                  )}
                </button>
                <button
                  onClick={() => selectOption('A-Z (First Name)')}
                  className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  <span>A-Z (First Name)</span>
                  {selectedOption === 'A-Z (First Name)' && (
                    <span className="text-[#0063F7]">✓</span>
                  )}
                </button>
                <button
                  onClick={() => selectOption('Z-A (First Name)')}
                  className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  <span>Z-A (First Name)</span>
                  {selectedOption === 'Z-A (First Name)' && (
                    <span className="text-[#0063F7]">✓</span>
                  )}
                </button>
                <button
                  onClick={() => selectOption('A-Z (Last Name)')}
                  className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  <span>A-Z (Last Name)</span>
                  {selectedOption === 'A-Z (Last Name)' && (
                    <span className="text-[#0063F7]">✓</span>
                  )}
                </button>
                <button
                  onClick={() => selectOption('Z-A (Last Name)')}
                  className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  <span>Z-A (Last Name)</span>
                  {selectedOption === 'Z-A (Last Name)' && (
                    <span className="text-[#0063F7]">✓</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-[150px] overflow-scroll scrollbar-hide md:h-[350px]">
        {filteredAndSortedUsers.map((user, index) => {
            const userEmail = user.email?.toLowerCase() || '';
            const isSelected = selectedUsers.some(
              (u) => u.email?.toLowerCase() === userEmail
            );
            return (
              <div
                className="my-2 flex items-center justify-between rounded-lg border border-gray-300 px-2 py-2 text-xs"
                key={user._id || user.email || index}
              >
                <div className="flex items-center">
                  <PresignedUserAvatar
                    photo={user.photo}
                    fallback="/images/user.png"
                    alt=""
                    className="mr-2 h-5 w-5 rounded-full"
                  />
                  <div className="gap-2">
                    <span className="">{`${user.firstName} ${user.lastName}`}</span>
                    <span>{` - ${user.email}`}</span>
                  </div>
                </div>

                <CustomBlueCheckBox
                  checked={isSelected}
                  disabled={
                    recipients.length >= 3 && !isSelected
                  }
                  onChange={() => {
                    setAllSelectedUsers((prev) => {
                      const isCurrentlySelected = prev.some(
                        (u) => u.email?.toLowerCase() === userEmail
                      );
                      let updated: Recipient[];
                      if (isCurrentlySelected) {
                        updated = prev.filter(
                          (u) => u.email?.toLowerCase() !== userEmail
                        );
                      } else {
                        if (prev.length >= 3) return prev;
                        updated = [
                          ...prev,
                          {
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            _id: user._id,
                            photo: user.photo,
                          },
                        ];
                      }
                      // Always call onChange to keep parent state in sync
                      onChange(updated);
                      return updated;
                    });
                  }}
                />
              </div>
            );
          })}
      </div>
    </>
  );
}
