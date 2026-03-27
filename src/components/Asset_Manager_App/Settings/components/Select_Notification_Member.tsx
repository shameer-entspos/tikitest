
import { useJSAAppsCotnext } from "@/app/(main)/(user-panel)/user/apps/jsa/jsaContext";
import { useTimeSheetAppsCotnext } from "@/app/(main)/(user-panel)/user/apps/timesheets/timesheet_context";
import { JSAAPPACTIONTYPE, TIMESHEETTYPE } from "@/app/helpers/user/enums";
import Loader from "@/components/DottedLoader/loader";
import { Search } from "@/components/Form/search";
import useAxiosAuth from "@/hooks/AxiosAuth";
import { useState } from "react";
import { useQuery } from "react-query";

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
  const [selectedOption, setSelectedOption] = useState<string>("Recent");
  const context = useTimeSheetAppsCotnext();
  const [selectedUsers, setAllSelectedUsers] = useState([...recipients]);
  const selectOption = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  const [searchQuery, setSearchQuery] = useState<string>("");

  if ((data ?? []).length < 1) {
    return (
      <div className="h-[150px] ">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-row items-center ">
        {/* SearchBox */}
        <div className="Search team-actice flex items-center justify-between ">
          <Search
            inputRounded={true}
            type="search"
            className="bg-[#eeeeee] placeholder:text-[#616161] text-xs md:text-sm rounded-md "
            name="search"
            placeholder="Search Requests"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* CustomDropdown */}
        <div className="z-50 DropDownn relative inline-block text-left mx-3">
          <div>
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-3 py-[5px] bg-[#E2F3FF] text-sm font-medium text-gray-700 hover:bg-[#e1f0fa] focus:outline-none"
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
              className="z-50 origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-[#E2F3FF] ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              <div className="py-1" role="none">
                <button
                  onClick={() => selectOption("Recent")}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                  role="menuitem"
                >
                  Recent
                </button>
                <button
                  onClick={() => selectOption("Starred")}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                  role="menuitem"
                >
                  Starred
                </button>
                <button
                  onClick={() => selectOption("Assigned to me")}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                  role="menuitem"
                >
                  Assigned to me
                </button>
                <button
                  onClick={() => selectOption("All projects")}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                  role="menuitem"
                >
                  All projects
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-[150px]   md:h-[350px] overflow-scroll scrollbar-hide">
        {(data ?? []).map((user, index) => {
          return (
            <div
              className="flex justify-between items-center text-xs py-2 border border-gray-300 my-2 px-2 rounded-lg"
              key={index}
            >
              <div className="flex items-center">
                <img src="/images/user.png" alt="" className="w-5 h-5 mr-2" />
                <div className="gap-2">
                  <span className="">{`${user.firstName} ${user.lastName}`}</span>
                  <span>{` - ${user.email}`}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 relative">
                {/* <input
                  type="checkbox"
                  name="user"
                  readOnly
                  disabled={(recipients ?? []).length == 3}
                  checked={selectedUsers.some((u) => u.email === user.email)}
                  id="some_id"
                  className={`appearance-none w-5 h-5 border-2 rounded-md 
      ${
        selectedUsers.some((u) => u.email === user.email)
          ? "bg-[#6990FF] border-[#6990FF] checked:bg-[#6990FF] checked:border-[#6990FF]"
          : "bg-white border-[#9E9E9E]"
      } 
      transition-colors duration-200 ease-in-out`}
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
                /> */}

                <div className="flex items-center justify-center gap-2 relative">
                  <div className="flex items-center justify-center gap-2 relative">
                    <input
                      type="checkbox"
                      name="user"
                      readOnly
                      disabled={(recipients ?? []).length == 3}
                      checked={selectedUsers.some(
                        (u) => u.email === user.email
                      )}
                      id="some_id"
                      className={`appearance-none w-5 h-5 border-2 rounded-md 
      ${
        selectedUsers.some((u) => u.email === user.email)
          ? "bg-[#6990FF] border-[#6990FF] checked:bg-[#6990FF] checked:border-[#6990FF]"
          : "bg-white border-[#9E9E9E]"
      } 
      transition-colors duration-200 ease-in-out`}
                      onChange={() => {
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
                        className="absolute inset-0 m-auto w-4 h-4 text-white z-21"
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
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
