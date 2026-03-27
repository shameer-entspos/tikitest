import { SAFETYHUBTYPE, SR_APP_ACTION_TYPE } from '@/app/helpers/user/enums';
import Loader from '@/components/DottedLoader/loader';
import { Search } from '@/components/Form/search';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { useSRAppCotnext } from '@/app/(main)/(user-panel)/user/apps/sr/sr_context';

import { WithCreateSafetyMeetingSidebar } from './SM_Create_Sidebar';
import { SMBottomButton } from './SM_Create_Bottom_Button';
import { getDiscussionTopicList } from '@/app/(main)/(user-panel)/user/apps/sh/api';
import { useSafetyHubContext } from '@/app/(main)/(user-panel)/user/apps/sh/sh_context';
import { dateFormat } from '@/app/helpers/dateFormat';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';
import FilterButton from '@/components/TimeSheetApp/CommonComponents/FilterButton/FilterButton';
import CustomModal from '@/components/Custom_Modal';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import CustomDateRangePicker from '@/components/customDatePicker';
import DateRangePicker from '@/components/JobSafetyAnalysis/CreateNewComponents/JSA_Calender';
import { getAllOrgUsers } from '@/app/(main)/(user-panel)/user/apps/api';
import CustomCheckbox from '@/components/Ui/CustomCheckbox';
import { CustomWhiteCheckBox } from '@/components/Custom_Checkbox/Custom_White_Checkbox';
import UserCard from '@/components/UserCard';

export function SM_Select__Topic() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>('Recent');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectOption = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  const context = useSafetyHubContext();
  const [filterByCategory, setCategory] = useState<string[]>([]);
  const [filterByUser, setUser] = useState<string[]>([]);

  /////
  const [filterDates, setFilterDates] = useState<
    | {
        from?: Date;
        to?: Date;
      }
    | undefined
  >(undefined);
  const [isApplyFilter, setApplyFilter] = useState(false);
  const [showFilterModel, setShowFilterModel] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string>('');
  const handleDropdown = (dropdownId: string) => {
    setOpenFilterDropdown(openFilterDropdown === dropdownId ? '' : dropdownId);
  };
  const clearFilters = () => {
    setCategory([]);
    setUser([]);
    setFilterDates(undefined);
    setApplyFilter(false);
    setOpenFilterDropdown('');
    setShowFilterModel(false);
  };
  const areFiltersApplied = () => {
    return (
      filterByCategory.length > 0 ||
      filterByUser.length > 0 ||
      filterDates !== undefined
    );
  };

  const handleApplyFilters = () => {
    setShowFilterModel(!showFilterModel);
    if (areFiltersApplied()) {
      setApplyFilter(true);
    }
  };
  const axiosAuth = useAxiosAuth();
  const { data, isLoading } = useQuery({
    queryKey: 'discussionTopics',
    queryFn: () => getDiscussionTopicList({ axiosAuth }),
  });
  const { data: users } = useQuery({
    queryKey: 'listofUsersForApp',
    queryFn: () => getAllOrgUsers(axiosAuth),
    refetchOnWindowFocus: false,
  });

  // Get selected project IDs
  const selectedProjectIds = (context.state.SMSelectedProjects ?? []).map(
    (p) => p.id
  );

  var filterSites =
    (data ?? [])
      // Filter by status: only show 'Open' topics
      .filter((e) => e?.status?.toLowerCase() === 'open')
      // Filter by project: only show topics assigned to selected projects
      .filter((e) => {
        if (selectedProjectIds.length === 0) {
          return false; // No projects selected, don't show any topics
        }
        // Check if topic has at least one project that matches selected projects
        return (e?.projects ?? []).some((project) =>
          selectedProjectIds.includes(project._id)
        );
      })
      // Filter by search query
      .filter((e) =>
        `${e?.title}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
      // Apply additional filters if enabled
      .filter((e) => {
        if (isApplyFilter) {
          if (filterByCategory.length > 0) {
            return filterByCategory.some((cat) => cat === e?.category);
          }
          if (filterByUser.length > 0) {
            return filterByUser.some((user) => user === e?.submittedBy._id);
          }
          if (filterDates !== undefined) {
            return (
              e?.createdAt >= filterDates?.from! &&
              e?.createdAt <= filterDates?.to!
            );
          }
        }
        return true;
      }) ?? [];

  return (
    <>
      <WithCreateSafetyMeetingSidebar>
        <div className="mx-2 my-4 flex max-h-[668px] w-11/12 flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2 lg:w-[83%]">
          <div className="flex flex-col sm:p-5 sm:pb-0 md:flex md:flex-row md:justify-between">
            <div className="flex flex-col">
              <h2 className="mb-1 text-sm font-semibold md:text-xl">
                Discussion Topic
              </h2>
              <p className="text-[10px] font-normal text-[#616161] md:text-sm">
                Add open discussion topics assigned to this project (optional).
              </p>
            </div>
            <div className="flex flex-row items-center gap-3">
              <FilterButton
                isApplyFilter={isApplyFilter}
                setShowModel={setShowFilterModel}
                showModel={showFilterModel}
                setOpenDropdown={setOpenFilterDropdown}
                clearFilters={clearFilters}
              />
              {/* SearchBox */}
              <div className="Search team-actice flex items-center justify-between">
                <Search
                  inputRounded={true}
                  type="search"
                  className="rounded-md bg-[#eeeeee] text-xs placeholder:text-[#616161] md:text-sm"
                  name="search"
                  placeholder="Search"
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
              <table className="w-full border-collapse rounded-md">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left text-xs font-semibold text-gray-600 md:text-sm">
                      <span className="flex gap-1">
                        Title
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
                      Category
                    </th>
                    <th className="hidden p-2 text-left text-xs font-semibold text-gray-600 md:table-cell md:text-sm">
                      Submitted By
                    </th>
                    <th className="p-2 text-left text-xs font-semibold text-gray-600 md:text-sm">
                      <span className="flex gap-1">
                        {' '}
                        Date Added
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
                    <th className="p-2 text-center text-xs font-semibold text-gray-600 md:text-sm">
                      <CustomBlueCheckBox
                        onChange={() => {
                          // apply select all loogic on that
                          // already on selectin doing by that   context.dispatch({
                          //   type: SAFETYHUBTYPE.SELECT_TOPIC,
                          //   selected_topic: topic,
                          // });
                          // setSelectAll(!selectAll);
                        }}
                        checked={false}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(filterSites ?? []).map((topic, index) => (
                    <tr
                      key={topic._id}
                      className={`hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="truncate p-2 text-xs text-gray-700 md:text-sm">
                        {topic.title}
                      </td>
                      <td className="truncate p-2 text-xs text-gray-700 md:text-sm">
                        {topic.category}
                      </td>
                      <td className="hidden p-2 text-xs text-gray-500 md:table-cell md:text-sm">
                        <UserCard submittedBy={topic.submittedBy} index={0} />
                      </td>
                      <td className="hidden p-2 text-xs text-gray-500 md:table-cell md:text-sm">
                        {dateFormat(topic.createdAt.toString())}
                      </td>
                      <td className="p-2">
                        <CustomBlueCheckBox
                          onChange={() => {
                            context.dispatch({
                              type: SAFETYHUBTYPE.SELECT_TOPIC,
                              selected_topic: topic,
                            });
                          }}
                          checked={(context.state.selected_topic ?? []).some(
                            (u) => u._id === topic._id
                          )}
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
          isDisabled={(context.state.selected_topic ?? []).length < 1}
          onCancel={() => {
            context.dispatch({
              type: SAFETYHUBTYPE.SHOW_SAFETY_MEETING_CREATE_MODEL,
              show_safety_meeting_create_model: 'project',
            });
          }}
          onNextClick={() => {
            context.dispatch({
              type: SAFETYHUBTYPE.SHOW_SAFETY_MEETING_CREATE_MODEL,
              show_safety_meeting_create_model: 'attendence',
            });
          }}
        />
      </div>
      <CustomModal
        size="md"
        isOpen={showFilterModel}
        header={
          <>
            <div>
              <h2 className="text-xl font-semibold">Filter By</h2>
              <p className="mt-1 text-sm font-normal text-[#616161]">
                Filter by the following selections and options.
              </p>
            </div>
          </>
        }
        body={
          <div className="flex h-[500px] flex-col overflow-auto px-3">
            <div className="my-4">
              <div className="w-full">
                <DateRangePicker
                  title="Submitted Date Range"
                  handleOnConfirm={(from: Date, to: Date) => {
                    setFilterDates({ from, to });
                  }}
                  selectedDate={filterDates}
                />
              </div>
            </div>
            <div className="my-4">
              <CustomSearchSelect
                label="Submitted By"
                data={[
                  {
                    label: 'All Users',
                    value: 'all',
                  },
                  ...(users ?? []).map((user: any) => ({
                    label: `${user.firstName} ${user.lastName}`,
                    value: user._id,
                  })),
                ]}
                showImage={false}
                multiple={true}
                showSearch={true}
                isOpen={openFilterDropdown === 'dropdown2'}
                onToggle={() => handleDropdown('dropdown2')}
                onSelect={(selected: any) => {
                  setUser(selected);
                }}
                selected={filterByUser}
                bg="bg-white"
                searchPlaceholder="Search Categories"
                placeholder="-"
              />
            </div>

            <div className="flex flex-col gap-4 text-medium">
              <span className="text-medium font-medium">Category</span>
              {[
                'General Safety',
                'Hazard & Incident',
                'Training & Education',
                'Behaviour',
                'Environmental',
              ].map((item) => {
                return (
                  <div key={item} className="flex gap-2">
                    <CustomWhiteCheckBox
                      label={item}
                      checked={filterByCategory.includes(item)}
                      onChange={() => {
                        // add loogic here in previuos list
                        if (filterByCategory.includes(item)) {
                          setCategory(
                            filterByCategory.filter((i) => i !== item)
                          );
                        } else {
                          setCategory([...filterByCategory, item]);
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        }
        handleCancel={() => {
          setShowFilterModel(!showFilterModel);
        }}
        handleSubmit={handleApplyFilters}
        submitDisabled={!areFiltersApplied()}
        submitValue={'Apply'}
      />
    </>
  );
}
