import {
  getAllHazards,
  getAllPPEs,
  HazardModel,
  PPEModel,
} from '@/app/(main)/(user-panel)/user/apps/api';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { JSAAPPACTIONTYPE } from '@/app/helpers/user/enums';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';
import Loader from '@/components/DottedLoader/loader';
import { Search } from '@/components/Form/search';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useState } from 'react';
import { useQuery } from 'react-query';

export function SelectHazrdINSTEPS({
  handleShowCreate,
  handleHazardSelection,
  isHazardSelected,
}: {
  handleShowCreate: () => void;
  handleHazardSelection: ({
    hazard,
  }: {
    hazard: HazardModel;
  }) => void | PPEModel[];
  isHazardSelected: ({ hazard }: { hazard: HazardModel }) => boolean;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>('Recent');
  const selectOption = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
  };
  const [searchQuery, setSearchQuery] = useState<string>('');
  const context = useJSAAppsCotnext();
  const axiosAuth = useAxiosAuth();
  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['hazards'],
    queryFn: () => getAllHazards({ axiosAuth }),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 24,
  });

  var filterProjects =
    (data ?? []).filter((e) =>
      `${e?.name}`.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? [];
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
                  onClick={() => selectOption('View All')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  View All
                </button>
                <button
                  onClick={() => selectOption('My List')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  My List
                </button>
                <button
                  onClick={() => selectOption('Shared List')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  Shared List
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

      <div className="h-[500px] overflow-scroll scrollbar-hide">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            {(filterProjects ?? []).map((hazard) => {
              return (
                <div
                  className="my-2 flex items-center justify-between rounded-lg border border-gray-300 px-3 py-3"
                  key={hazard._id}
                >
                  <span className="">{hazard.name}</span>

                  <div className="flex items-center gap-3">
                    <span className="font-Open-Sans text-sm font-normal text-[#616161]">{`${
                      hazard.sharing == 1
                        ? 'My List'
                        : hazard.sharing == 2
                          ? 'Shared'
                          : 'One off'
                    }`}</span>

                    <CustomBlueCheckBox
                      label="Me"
                      checked={isHazardSelected({ hazard })}
                      onChange={() => {
                        handleHazardSelection({ hazard });
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </>
  );
}
