import { SAFETYHUBTYPE } from '@/app/helpers/user/enums';
import Loader from '@/components/DottedLoader/loader';
import { Search } from '@/components/Form/search';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useState } from 'react';
import { useQuery } from 'react-query';

import { WithCreateSafetyMeetingSidebar } from './SM_Create_Sidebar';
import { SMBottomButton } from './SM_Create_Bottom_Button';
import { useSafetyHubContext } from '@/app/(main)/(user-panel)/user/apps/sh/sh_context';
import { getAllOrgUsers } from '@/app/(main)/(user-panel)/user/apps/api';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';
import UserCard from '@/components/UserCard';

export function SM_Select__Attendance() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] =
    useState<string>('Project Members');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectOption = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
  };
  const context = useSafetyHubContext();

  const axiosAuth = useAxiosAuth();

  const { data, isLoading } = useQuery({
    queryKey: 'listofUsersForApp',
    queryFn: () => getAllOrgUsers(axiosAuth),
    refetchOnWindowFocus: false,
  });

  // Build project member list from selected projects in context
  const projectMembers = (context.state.SMSelectedProjects ?? []).flatMap(
    (project) => project.members ?? []
  );

  // Ensure unique members by _id to avoid duplicates across projects
  const uniqueProjectMembersMap = new Map<string, any>();
  projectMembers.forEach((member: any) => {
    if (member?._id && !uniqueProjectMembersMap.has(member._id)) {
      uniqueProjectMembersMap.set(member._id, member);
    }
  });
  const uniqueProjectMembers = Array.from(uniqueProjectMembersMap.values());

  // Decide base list based on dropdown selection
  const baseUsers =
    selectedOption === 'Project Members'
      ? uniqueProjectMembers
      : (data ?? []);

  const filterSites =
    baseUsers
      // Exclude specific roles
      .filter((e: any) => e?.role !== 4 && e?.role !== 5)
      // Search by full name
      .filter((e: any) =>
        `${e?.firstName} ${e?.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ) ?? [];

  return (
    <>
      <WithCreateSafetyMeetingSidebar>
        <div className="mx-2 my-4 flex max-h-[668px] w-11/12 flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2 lg:w-[83%]">
          <div className="flex flex-col sm:p-5 sm:pb-0 md:flex md:flex-row md:justify-between">
            <div className="flex flex-col">
              <h2 className="mb-1 text-sm font-semibold md:text-xl">
                Attendance
              </h2>
              <p className="text-[10px] font-normal text-[#616161] md:text-sm">
                Select people who are in attendance
              </p>
            </div>
            <div className="flex flex-row items-center">
              {/* CustomDropdown */}
              <div className="DropDownn relative mx-3 inline-block text-left">
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
                        onClick={() => selectOption('Project Members')}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        role="menuitem"
                      >
                        Project Members
                      </button>
                      <button
                        onClick={() => selectOption('All Users')}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        role="menuitem"
                      >
                        All Users
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
            </div>
          </div>

          <div className="flex-1 overflow-y-scroll p-5 pt-2">
            {isLoading ? (
              <div className="mt-12">
                <Loader />
              </div>
            ) : (
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left text-xs font-semibold text-gray-600 md:text-sm">
                      <span className="flex gap-1">
                        Full Name
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12.9373 3L12.8623 3.00525C12.7274 3.0234 12.6036 3.08988 12.5139 3.19236C12.4243 3.29483 12.3749 3.42635 12.3748 3.5625V13.0815L9.9598 10.668L9.8968 10.614C9.78265 10.5292 9.64059 10.4907 9.49922 10.5064C9.35786 10.5221 9.22768 10.5907 9.1349 10.6985C9.04212 10.8063 8.99362 10.9453 8.99917 11.0874C9.00471 11.2295 9.0639 11.3643 9.1648 11.4645L12.5428 14.8395L12.6058 14.8935C12.7142 14.9735 12.8476 15.012 12.982 15.002C13.1163 14.9919 13.2426 14.934 13.3378 14.8387L16.7106 11.4637L16.7646 11.4008C16.8448 11.2923 16.8834 11.1587 16.8734 11.0242C16.8633 10.8897 16.8053 10.7633 16.7098 10.668L16.6468 10.614C16.5384 10.5338 16.4048 10.4951 16.2703 10.5052C16.1357 10.5152 16.0093 10.5733 15.9141 10.6688L13.4998 13.0845V3.5625L13.4953 3.486C13.4768 3.35133 13.4102 3.22792 13.3077 3.13858C13.2053 3.04923 13.0732 3.00001 12.9373 3ZM4.66105 3.165L1.2898 6.53625L1.23505 6.59925C1.15501 6.7076 1.11652 6.84108 1.12657 6.97541C1.13661 7.10974 1.19454 7.23601 1.2898 7.33125L1.3528 7.386C1.46115 7.46603 1.59463 7.50453 1.72896 7.49448C1.86329 7.48443 1.98956 7.42651 2.0848 7.33125L4.49755 4.91775V14.4412L4.50355 14.5177C4.52204 14.6524 4.58866 14.7758 4.6911 14.8652C4.79354 14.9545 4.92487 15.0037 5.0608 15.0037L5.13655 14.9985C5.27135 14.9802 5.39495 14.9136 5.48444 14.8112C5.57394 14.7087 5.62327 14.5773 5.6233 14.4412L5.62255 4.91925L8.0398 7.332L8.1028 7.386C8.21703 7.46979 8.35867 7.50739 8.49942 7.49128C8.64016 7.47518 8.76965 7.40657 8.86201 7.29915C8.95437 7.19173 9.00279 7.05342 8.99761 6.91185C8.99243 6.77028 8.93402 6.63588 8.83405 6.5355L5.45605 3.165L5.3923 3.111C5.28395 3.03096 5.15047 2.99247 5.01614 3.00252C4.88181 3.01257 4.75554 3.07049 4.6603 3.16575"
                            fill="#0063F7"
                          />
                        </svg>
                      </span>
                    </th>
                    <th className="p-2 text-left text-xs font-semibold text-gray-600 md:text-sm">
                      Email Address
                    </th>
                    <th className="hidden p-2 text-left text-xs font-semibold text-gray-600 md:table-cell md:text-sm">
                      Organization
                    </th>

                    <th className="p-2 text-center text-xs font-semibold text-gray-600 md:text-sm">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => {}}
                        className="h-4 w-4 cursor-pointer"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(filterSites ?? []).map((topic, index) => (
                    <tr
                      key={topic._id}
                      className={`border-b border-gray-200 hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="truncate p-2 text-xs text-gray-700 md:text-sm">
                        <UserCard
                          submittedBy={topic}
                          index={0}
                          showHoverModel={false}
                        />
                      </td>
                      <td className="truncate p-2 text-xs text-gray-700 md:text-sm">
                        {topic.email}
                      </td>
                      <td className="hidden p-2 text-xs text-gray-500 md:table-cell md:text-sm">
                        {topic?.organization?.name}
                      </td>

                      <td className="p-2">
                        <CustomBlueCheckBox
                          onChange={() => {
                            context.dispatch({
                              type: SAFETYHUBTYPE.SELECT_ATTENDENCE,
                              selected_attendence: topic,
                            });
                          }}
                          checked={(
                            context.state.selected_attendence ?? []
                          ).some((u) => u._id === topic._id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex justify-between border-t-2 border-gray-200 px-3 py-2">
            <div className="font-Open-Sans text-sm font-normal text-[#616161]">
              Items per page: 0
            </div>
            <div></div>
            <div className="font-Open-Sans text-base font-semibold text-[#616161]">
              {`${(context.state.selected_topic ?? []).length}`} Selected
            </div>
          </div>
        </div>
      </WithCreateSafetyMeetingSidebar>
      <div className="h-16">
        <SMBottomButton
          isDisabled={(context.state.selected_attendence ?? []).length < 1}
          onCancel={() => {
            context.dispatch({
              type: SAFETYHUBTYPE.SHOW_SAFETY_MEETING_CREATE_MODEL,
              show_safety_meeting_create_model: 'topic',
            });
          }}
          onNextClick={() => {
            context.dispatch({
              type: SAFETYHUBTYPE.SHOW_SAFETY_MEETING_CREATE_MODEL,
              show_safety_meeting_create_model: 'meeting',
            });
          }}
        />
      </div>
    </>
  );
}
