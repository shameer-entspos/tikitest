import { getAllAppProjects } from '@/app/(main)/(user-panel)/user/apps/api';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import {
  APPACTIONTYPE,
  JSAAPPACTIONTYPE,
  SAFETYHUBTYPE,
  SR_APP_ACTION_TYPE,
} from '@/app/helpers/user/enums';
import Loader from '@/components/DottedLoader/loader';
import { Search } from '@/components/Form/search';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useState } from 'react';
import { useQuery } from 'react-query';

import { useSafetyHubContext } from '@/app/(main)/(user-panel)/user/apps/sh/sh_context';
import { WithCreateSafetyMeetingSidebar } from './SM_Create_Sidebar';
import { SMBottomButton } from './SM_Create_Bottom_Button';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';
import { useSession } from 'next-auth/react';

export function SMSelectProject() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>('Recent');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectOption = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
  };
  const context = useSafetyHubContext();
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const {
    data: allProjects,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: 'allUserAssignedProjects',
    queryFn: () => getAllAppProjects(axiosAuth),
  });
  // add filter here accoording to the selected option
  var filterProjects =
    (allProjects ?? [])
      .filter((e) => {
        return `${e?.name}`.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .filter((e) => {
        if (selectedOption == 'Recent') {
          return e;
        } else if (selectedOption == 'Starred') {
          return e.isStarred == true;
        } else if (selectedOption == 'Assigned to me') {
          return (
            e.users.some(
              (user) => user.user._id == session?.user.user._id!.toString()
            ) && e.userId._id !== session?.user.user._id!.toString()
          );
        } else {
          return e;
        }
      }) ?? [];

  return (
    <>
      <WithCreateSafetyMeetingSidebar>
        <div className="mx-2 my-4 flex max-h-[668px] w-11/12 flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2 lg:w-[83%]">
          <div className="flex flex-col sm:p-5 sm:pb-0 md:flex md:flex-row md:justify-between">
            <div className="flex flex-col">
              <h2 className="mb-1 text-sm font-semibold md:text-xl">
                Assign to Project
              </h2>
              <p className="text-[10px] font-normal text-[#616161] md:text-sm">
                You must assign this entry to a project.
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
              <>
                {(filterProjects ?? []).map((project) => (
                  <div
                    key={project._id}
                    className="my-1 flex h-10 items-center justify-between rounded-md border border-gray-200"
                  >
                    <div className="flex h-full w-1/2 items-center">
                      <div
                        className={`h-full w-2 rounded-l-md`}
                        style={{ backgroundColor: project.color ?? '#EB4357' }}
                      />
                      <div className="ml-2 truncate text-xs md:text-base">
                        {project.name}
                      </div>
                    </div>
                    <div className="flex w-1/2 items-center justify-end pr-2 md:justify-between">
                      <span className="hidden p-4 text-gray-500 md:block">
                        {project.projectId}
                      </span>
                      <CustomBlueCheckBox
                        onChange={() =>
                          context.dispatch({
                            type: SAFETYHUBTYPE.SELECT_PROJECT,
                            SMSelectedProjects: {
                              id: project._id,
                              name: project.name,
                              members: project.users.map((user) => user.user),
                            },
                          })
                        }
                        checked={(context.state.SMSelectedProjects ?? []).some(
                          (selectedProject) =>
                            selectedProject.id === project._id
                        )}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="flex justify-between border-t-2 border-gray-200 px-3 py-2">
            <div className="font-Open-Sans text-sm font-normal text-[#616161]">
              Items per page: 0
            </div>
            <div></div>
            <div className="font-Open-Sans text-base font-semibold text-[#616161]">
              {`${(context.state.SMSelectedProjects ?? []).length}`} Selected
            </div>
          </div>
        </div>
      </WithCreateSafetyMeetingSidebar>
      <div className="h-16">
        <SMBottomButton
          isDisabled={(context.state.SMSelectedProjects ?? []).length < 1}
          onCancel={() => {
            context.dispatch({
              type: SAFETYHUBTYPE.SHOW_SAFETY_MEETING_CREATE_MODEL,
            });
          }}
          onNextClick={() => {
            context.dispatch({
              type: SAFETYHUBTYPE.SHOW_SAFETY_MEETING_CREATE_MODEL,
              show_safety_meeting_create_model: 'topic',
            });
          }}
        />
      </div>
    </>
  );
}
