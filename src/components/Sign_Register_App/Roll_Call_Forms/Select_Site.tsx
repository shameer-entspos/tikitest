import { getAllAppProjects } from '@/app/(main)/(user-panel)/user/apps/api';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import {
  APPACTIONTYPE,
  JSAAPPACTIONTYPE,
  SR_APP_ACTION_TYPE,
} from '@/app/helpers/user/enums';
import Loader from '@/components/DottedLoader/loader';
import { Search } from '@/components/Form/search';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useState } from 'react';
import { useQuery } from 'react-query';

import { motion } from 'framer-motion';
import { WithRollCallSidebar } from './With_Roll_Call_Sidebar';
import { SRBottomButton } from './SR_Button_Bottom';
import { useSRAppCotnext } from '@/app/(main)/(user-panel)/user/apps/sr/sr_context';
import { getAllSitesByProjectIds } from '@/app/(main)/(user-panel)/user/apps/sr/api';

export function SRSelectSite() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>('Recent');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectOption = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
  };
  const context = useSRAppCotnext();

  const projectIds = (context.state.SRSelectedProjects ?? []).map((p) => p.id);
  const axiosAuth = useAxiosAuth();
  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['user/app/listofSites', projectIds],
    queryFn: () => getAllSitesByProjectIds(axiosAuth, projectIds),
    enabled: projectIds.length > 0,
  });

  var filterSites =
    (data ?? []).filter((e) =>
      `${e?.siteName}`.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? [];

  return (
    <>
      <WithRollCallSidebar>
        <div className="mx-2 my-4 flex max-h-[668px] w-11/12 flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2 lg:w-[83%]">
          <div className="flex flex-col sm:p-5 sm:pb-0 md:flex md:flex-row md:justify-between">
            <div className="flex flex-col">
              <h2 className="mb-1 text-sm font-semibold md:text-xl">
                Select Site (s)
              </h2>
              <p className="text-[10px] font-normal text-[#616161] md:text-sm">
                Select which site you want to do a roll call for.
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
                        onClick={() => selectOption('Address A-Z')}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        role="menuitem"
                      >
                        Address A-Z
                      </button>
                      <button
                        onClick={() => selectOption('Address Z-A')}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        role="menuitem"
                      >
                        Address Z-A
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
                {(filterSites ?? []).map((site) => (
                  <div
                    key={site._id}
                    className="my-1 flex h-10 items-center justify-between rounded-md border border-gray-200"
                  >
                    <div className="flex h-full w-1/2 items-center">
                      <div className={`h-full w-2 rounded-l-md bg-red-200`} />
                      <div className="ml-2 truncate text-xs md:text-base">
                        {site.siteName}
                      </div>
                    </div>
                    <div className="flex w-1/2 items-center justify-end md:justify-between">
                      <span className="hidden p-4 text-gray-500 md:block">
                        {site.addressLineOne}
                      </span>
                      <input
                        type="checkbox"
                        checked={(context.state.SRSelectedSites ?? []).some(
                          (SRSelectedSite) => SRSelectedSite.id === site._id
                        )}
                        onChange={() =>
                          context.dispatch({
                            type: SR_APP_ACTION_TYPE.SELECT_SITE,
                            SRSelectedSites: {
                              id: site._id,
                              siteName: site.siteName,
                            },
                          })
                        }
                        className="mr-2 h-4 w-4 cursor-pointer place-items-end"
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
              {`${(context.state.SRSelectedSites ?? []).length}`} Selected
            </div>
          </div>
        </div>
      </WithRollCallSidebar>
      <div className="h-16">
        <SRBottomButton
          isDisabled={(context.state.SRSelectedSites ?? []).length < 1}
          onCancel={() => {
            context.dispatch({
              type: SR_APP_ACTION_TYPE.CREATE_NEW_ROLL,
              createNewRollCall: 'project',
            });
          }}
          onNextClick={() => {
            context.dispatch({
              type: SR_APP_ACTION_TYPE.CREATE_NEW_ROLL,
              createNewRollCall: 'details',
            });
          }}
        />
      </div>
    </>
  );
}
