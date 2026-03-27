import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { useTimeSheetAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/timesheets/timesheet_context';
import { JSAAPPACTIONTYPE, TIMESHEETTYPE } from '@/app/helpers/user/enums';
import Loader from '@/components/DottedLoader/loader';
import { Search } from '@/components/Form/search';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useState } from 'react';
import { useQuery } from 'react-query';

export function SelectNotificationMember({
  handleShowCreate,
  recipients,
  onChange,
  data,
}: {
  handleShowCreate: () => void;
  recipients: { email: String; firstName: String; lastName: String }[];
  data: { email: String; firstName: String; lastName: String }[];
  onChange: (
    values: { email: String; firstName: String; lastName: String }[]
  ) => void;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>('Recent');
  const context = useTimeSheetAppsCotnext();
  const [selectedUsers, setAllSelectedUsers] = useState([...recipients]);
  const selectOption = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  const [searchQuery, setSearchQuery] = useState<string>('');

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
                <button
                  onClick={() => selectOption('Recent')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  Recent
                </button>
                <button
                  onClick={() => selectOption('Starred')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  Starred
                </button>
                <button
                  onClick={() => selectOption('Assigned to me')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  Assigned to me
                </button>
                <button
                  onClick={() => selectOption('All projects')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  All projects
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-[150px] overflow-scroll scrollbar-hide md:h-[350px]">
        {(data ?? [])
          .filter((user) => {
            if (!searchQuery) return true;
            const searchLower = searchQuery.toLowerCase();
            return (
              user.firstName.toLowerCase().includes(searchLower) ||
              user.lastName.toLowerCase().includes(searchLower) ||
              user.email.toLowerCase().includes(searchLower)
            );
          })
          .map((user, index) => {
            return (
              <div
                className="my-2 flex items-center justify-between rounded-lg border border-gray-300 px-2 py-2 text-xs"
                key={index}
              >
                <div className="flex items-center">
                  <img src="/images/user.png" alt="" className="mr-2 h-5 w-5" />
                  <div className="gap-2">
                    <span className="">{`${user.firstName} ${user.lastName}`}</span>
                    <span>{` - ${user.email}`}</span>
                  </div>
                </div>
                <div className="relative flex items-center justify-center gap-2">
                  <input
                    type="checkbox"
                    name="user"
                    readOnly
                    disabled={(recipients ?? []).length == 3}
                    checked={selectedUsers.some((u) => u.email === user.email)}
                    id="some_id"
                    className={`h-5 w-5 appearance-none rounded-md border-2 ${
                      selectedUsers.some((u) => u.email === user.email)
                        ? 'border-[#6990FF] bg-[#6990FF] checked:border-[#6990FF] checked:bg-[#6990FF]'
                        : 'border-[#9E9E9E] bg-white'
                    } transition-colors duration-200 ease-in-out`}
                    onChange={() => {
                      setAllSelectedUsers((prev) => {
                        const isSelected = prev.some(
                          (u) => u.email === user.email
                        );
                        if (isSelected) {
                          onChange(prev.filter((u) => u.email !== user.email));
                          return prev.filter((u) => u.email !== user.email);
                        } else {
                          onChange([
                            ...prev,
                            {
                              email: user.email,
                              firstName: user.firstName,
                              lastName: user.lastName,
                            },
                          ]);
                          return [
                            ...prev,
                            {
                              email: user.email,
                              firstName: user.firstName,
                              lastName: user.lastName,
                            },
                          ];
                        }
                      });
                    }}
                  />
                  {selectedUsers.some((u) => u.email === user.email) && (
                    <svg
                      onClick={() => {
                        setAllSelectedUsers((prev) => {
                          const isSelected = prev.some(
                            (u) => u.email === user.email
                          );
                          if (isSelected) {
                            onChange(
                              prev.filter((u) => u.email !== user.email)
                            );
                            return prev.filter((u) => u.email !== user.email);
                          } else {
                            onChange([
                              ...prev,
                              {
                                email: user.email,
                                firstName: user.firstName,
                                lastName: user.lastName,
                              },
                            ]);
                            return [
                              ...prev,
                              {
                                email: user.email,
                                firstName: user.firstName,
                                lastName: user.lastName,
                              },
                            ];
                          }
                        });
                      }}
                      className="z-21 absolute inset-0 m-auto h-4 w-4 text-white"
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
            );
          })}
      </div>
    </>
  );
}
