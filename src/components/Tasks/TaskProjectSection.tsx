import React, { useState } from 'react';
import { Button } from '../Buttons';
import { Search } from '../Form/search';
import { getAllAppProjects } from '@/app/(main)/(user-panel)/user/apps/api';
import { useQuery } from 'react-query';
import Loader from '../DottedLoader/loader';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useTaskCotnext } from '@/app/(main)/(user-panel)/user/tasks/context';
import { TASKTYPE } from '@/app/helpers/user/enums';
import CustomHr from '../Ui/CustomHr';
import { CustomBlueCheckBox } from '../Custom_Checkbox/Custom_Blue_Checkbox';

export function TaskProjectList() {
  const axiosAuth = useAxiosAuth();
  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: 'allUserAssignedProjects',
    queryFn: () => getAllAppProjects(axiosAuth),
  });
  const context = useTaskCotnext();
  const [searchStarred, setSearchStarred] = useState('');
  const [searchProjects, setAllProjects] = useState('');
  const isProjectSelected = (Id: string) =>
    context.state.projectId?.some((id) => id == Id);
  const handleProjectSelect = (projectId: string) => {
    if (
      (context.state.projectId ?? []).findIndex(
        (project) => project === projectId
      ) !== -1
    ) {
      context.dispatch({
        type: TASKTYPE.DESELECT_TASK_PROJECT,
        projectId: projectId,
      });
    } else {
      context.dispatch({
        type: TASKTYPE.SELECT_TASK_PROJECT,
        projectId: projectId,
      });
    }
  };
  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader />
      </div>
    );
  }
  if (isSuccess) {
    const filteredStarred =
      (data ?? []).filter((e) =>
        `${e.name}`.toLowerCase().includes(searchStarred.toLowerCase())
      ) ?? [];
    const filteredAll =
      (data ?? []).filter((e) =>
        e?.name.toLowerCase().includes(searchProjects.toLowerCase())
      ) ?? [];
    return (
      <div className="flex h-full flex-col justify-between">
        <div className="flex">
          <div className="w-1/3">
            <h1 className="text-center">
              <span
                className={`inline-block cursor-pointer text-xs md:text-base ${
                  context.state.showProject === 'starred' &&
                  'w-20 border-b-2 border-blue-500 font-semibold md:w-28'
                } pb-2`}
                onClick={() =>
                  context.dispatch({
                    type: TASKTYPE.CHANGE_PROJECT_TAB,
                    showProject: 'starred',
                  })
                }
              >
                Starred
              </span>
            </h1>
          </div>
          <div className="w-1/3">
            <h1 className="text-center">
              <span
                className={`inline-block cursor-pointer text-xs md:text-base ${
                  context.state.showProject === 'assign' &&
                  'w-20 border-b-2 border-blue-500 font-semibold md:w-28'
                } pb-2`}
                onClick={() =>
                  context.dispatch({
                    type: TASKTYPE.CHANGE_PROJECT_TAB,
                    showProject: 'assign',
                  })
                }
              >
                Assign to me
              </span>
            </h1>
          </div>
          <div className="w-1/3">
            <h1 className="text-center">
              <span
                className={`inline-block cursor-pointer text-xs md:text-base ${
                  context.state.showProject === 'all' &&
                  'w-20 border-b-2 border-blue-500 font-semibold md:w-28'
                } pb-2`}
                onClick={() =>
                  context.dispatch({
                    type: TASKTYPE.CHANGE_PROJECT_TAB,
                    showProject: 'all',
                  })
                }
              >
                All Projects
              </span>
            </h1>
          </div>
        </div>

        <div className="h-full py-2">
          {/* starred */}
          {context.state.showProject === 'starred' && (
            <div className="overflow-y-scroll scrollbar-hide">
              <div className="mb-5 text-center text-sm text-black md:text-base">
                Search projects you want to assign this submission to.
              </div>
              <div className="mb-3">
                <Search
                  key={'search'}
                  className="h-[44px] rounded-lg border-2 border-gray-300 bg-gray-50 placeholder:text-[#616161]"
                  inputRounded={true}
                  type="text"
                  name="search"
                  onChange={(e) => setSearchStarred(e.target.value)}
                  placeholder="Project Name or ID or Reference"
                />
              </div>
              {filteredStarred.map((e) => {
                if (e.isStarred) {
                  return (
                    <div
                      className="mb-3 flex items-center justify-between bg-gray-100 p-3"
                      key={e._id}
                    >
                      <div className="flex items-center gap-5">
                        <CustomBlueCheckBox
                          checked={isProjectSelected(e._id!.toString())}
                          onChange={() => {
                            handleProjectSelect(e._id);
                          }}
                        />
                        <div className="text-sm font-normal text-[#212121]">
                          {e.name}
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}
          {/* ///// assign to me */}
          {context.state.showProject === 'assign' && (
            <div className="overflow-y-scroll scrollbar-hide">
              <div className="mb-5 text-center text-sm text-black md:text-base">
                Search projects you want to assign this submission to.
              </div>
              <div className="mb-3">
                <Search
                  className="h-[44px] rounded-lg border-2 border-gray-300 bg-gray-50 placeholder:text-[#616161]"
                  key={'search'}
                  inputRounded={true}
                  type="text"
                  name="search"
                  placeholder="Project Name or ID or Reference"
                />
              </div>
            </div>
          )}
          {/* all projects */}
          {context.state.showProject === 'all' && (
            <div>
              <div className="mb-5 text-center text-sm text-black md:text-base">
                Search projects you want to assign this submission to.
              </div>
              <div className="mb-3">
                <Search
                  className="h-[44px] rounded-lg border-2 border-gray-300 bg-gray-50 placeholder:text-[#616161]"
                  key={'search'}
                  inputRounded={true}
                  type="text"
                  name="search"
                  onChange={(e) => setAllProjects(e.target.value)}
                  placeholder="Project Name or ID or Reference"
                />
              </div>

              {filteredAll.map((e) => {
                return (
                  <div
                    className="mb-2 flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2"
                    key={e._id}
                  >
                    <div className="flex items-center gap-5">
                      <CustomBlueCheckBox
                        checked={isProjectSelected(e._id!.toString())}
                        onChange={() => {
                          handleProjectSelect(e._id);
                        }}
                      />
                      <div className="text-sm font-normal text-[#212121]">
                        {e.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <CustomHr className="my-4" />
          <div className="flex justify-center gap-6 py-4">
            <button
              className="h-11 w-1/2 rounded-lg border-2 border-primary-500 text-sm text-primary-500 sm:h-12 sm:w-36 sm:text-base"
              onClick={() => {
                context.dispatch({
                  type: TASKTYPE.SHOW_SIGN_IN_MODEL,
                  showSignIn: 'selfie',
                });
              }}
            >
              Back
            </button>
            <button
              className="h-11 w-1/2 rounded-lg bg-primary-500 text-sm font-semibold text-white hover:bg-primary-600/80 sm:h-12 sm:w-36 sm:text-base"
              onClick={() => {
                context.dispatch({
                  type: TASKTYPE.SHOW_SIGN_IN_MODEL,
                  showSignIn: 'selectUser',
                });
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }
  return <></>;
}
