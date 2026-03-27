import { getAllAppProjects } from '@/app/(main)/(user-panel)/user/apps/api';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { APPACTIONTYPE, JSAAPPACTIONTYPE } from '@/app/helpers/user/enums';
import Loader from '@/components/DottedLoader/loader';
import { Search } from '@/components/Form/search';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { BottomButton } from './BottomButton';
import { WithSidebar } from './WithSideBar';
import { motion } from 'framer-motion';
import CustomCheckbox from '@/components/Asset_Manager_App/Settings/components/CustomCheckBox';
const borderColors = [
  'border-pink-700/80',
  'border-gray-700/80',
  'border-green-700/80',
  'border-orange-700/80',
  'border-purple-700/80',
];
export function JSASelectProject({
  uploadPendingImages,
}: {
  uploadPendingImages?: () => Promise<string[]>;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<
    'Starred' | 'Recent' | 'All Projects' | 'Favourites' | 'AssignedToMe'
  >('All Projects');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectOption = (
    option:
      | 'Starred'
      | 'Recent'
      | 'All Projects'
      | 'Favourites'
      | 'AssignedToMe'
  ) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen((prevState) => !prevState);
  };

  const context = useJSAAppsCotnext();

  const axiosAuth = useAxiosAuth();
  const {
    data: allProjects,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: 'allUserAssignedProjects',
    queryFn: () => getAllAppProjects(axiosAuth),
  });

  var filterProjects = (allProjects ?? [])
    .filter(
      (e) =>
        `${e?.name}`.toLowerCase().includes(searchQuery.toLowerCase()) ?? []
    )
    .filter((projects) => {
      if (selectedOption == 'Recent') {
        // Get the createdAt date of the project
        const createdAtDate = new Date(projects?.createdAt);

        // Get the date 5 days ago
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        // Apply the "Recent" filter only if selectedOption is "Recent"
        return (
          (selectedOption === 'Recent' && createdAtDate >= fiveDaysAgo) ||
          selectedOption !== 'Recent'
        );
      } else if (
        selectedOption == 'Starred' ||
        selectedOption == 'Favourites'
      ) {
        return projects?.isFavorited ?? false;
      } else if (selectedOption == 'AssignedToMe') {
        return true;
      } else return true;
    });
  return (
    <>
      <WithSidebar>
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
              <div className="relative mx-3 inline-block text-left">
                <div>
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-[#E2F3FF] px-3 py-[5px] text-sm font-medium text-gray-700 shadow-sm hover:bg-[#e1f0fa] focus:outline-none"
                    id="options-menu"
                    aria-expanded="true"
                    aria-haspopup="true"
                    onClick={toggleMenu}
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
                        onClick={() => selectOption('AssignedToMe')}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        role="menuitem"
                      >
                        Assigned to me
                      </button>
                      <button
                        onClick={() => selectOption('All Projects')}
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
                  placeholder="Search Projects"
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
                {(filterProjects ?? []).map((project, index) => (
                  <div
                    key={project._id}
                    className={`${'my-1 flex h-11 items-center justify-between rounded-lg border border-l-[8px] border-b-gray-300 border-r-gray-300 border-t-gray-300 shadow-md'} ${
                      borderColors[index % borderColors.length]
                    }`}
                  >
                    <div className={`flex h-full w-1/2 items-center`}>
                      {/* project name */}
                      <div className="ml-2 truncate text-xs md:text-base">
                        {project.name}
                      </div>
                    </div>
                    <div className="flex w-1/2 items-center justify-end md:justify-between">
                      <span className="hidden p-4 text-gray-500 md:block">
                        {project.projectId}
                      </span>

                      <svg
                        onClick={() =>
                          context.dispatch({
                            type: JSAAPPACTIONTYPE.TOGGLE_JSA_PROJECT_SELECTION,
                            jsaSelectedProjects: {
                              id: project._id,
                              name: project.name,
                            },
                          })
                        }
                        className="z-21 absolute inset-0 m-auto h-4 w-4 cursor-pointer text-white"
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
                      <div className="relative mr-2 flex items-center">
                        <input
                          type="checkbox"
                          checked={(
                            context.state.jsaSelectedProjects ?? []
                          ).some(
                            (selectedProject) =>
                              selectedProject.id === project._id
                          )}
                          className={`h-5 w-5 cursor-pointer appearance-none rounded-md border-2 ${
                            (context.state.jsaSelectedProjects ?? []).some(
                              (selectedProject) =>
                                selectedProject.id === project._id
                            )
                              ? 'border-[#6990FF] bg-[#6990FF] checked:border-[#6990FF] checked:bg-[#6990FF]'
                              : 'border-[#9E9E9E] bg-white'
                          } transition-colors duration-200 ease-in-out`}
                          onChange={() =>
                            context.dispatch({
                              type: JSAAPPACTIONTYPE.TOGGLE_JSA_PROJECT_SELECTION,
                              jsaSelectedProjects: {
                                id: project._id,
                                name: project.name,
                              },
                            })
                          }
                        />
                        {(context.state.jsaSelectedProjects ?? []).some(
                          (selectedProject) =>
                            selectedProject.id === project._id
                        ) && (
                          <svg
                            onClick={() =>
                              context.dispatch({
                                type: JSAAPPACTIONTYPE.TOGGLE_JSA_PROJECT_SELECTION,
                                jsaSelectedProjects: {
                                  id: project._id,
                                  name: project.name,
                                },
                              })
                            }
                            className="z-21 absolute inset-0 m-auto h-4 w-4 cursor-pointer text-white"
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
                ))}
              </>
            )}
          </div>

          <div className="flex justify-between border-t-2 border-gray-300 px-3 py-2">
            <div className="font-Open-Sans text-sm font-normal text-[#616161]">
              Items per page: 0
            </div>
            <div></div>
            <div className="font-Open-Sans text-base font-semibold text-[#616161]">
              {`${(context.state.jsaSelectedProjects ?? []).length}`} Selected
            </div>
          </div>
        </div>
      </WithSidebar>
      <div className="h-16">
        <BottomButton
          uploadPendingImages={uploadPendingImages}
          isDisabled={(context.state.jsaSelectedProjects ?? []).length < 1}
          onCancel={() => {
            context.dispatch({
              type: JSAAPPACTIONTYPE.SHOWPAGES,
            });
          }}
          onSavAs={() => {}}
          onNextClick={() => {
            context.dispatch({
              type: JSAAPPACTIONTYPE.CREATENEWSECTION,
              createNewSection: 'jsaDetail',
            });
          }}
        />
      </div>
    </>
  );
}
