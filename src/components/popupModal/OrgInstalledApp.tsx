import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Search } from '../Form/search';
import useAxiosAuth from '@/hooks/AxiosAuth';
import {
  deleteInstalledApp,
  getInstalledApps,
} from '@/app/(main)/(org-panel)/organization/app-store/api';

import { useAppStoreCotnext } from '@/app/(main)/(org-panel)/organization/app-store/context';

import { Dialog } from '@headlessui/react';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import { AppModel } from '@/app/(main)/(user-panel)/user/apps/api';
import { AiFillStar } from 'react-icons/ai';
import { Plus, X } from 'lucide-react';
import { FaAngleLeft, FaAngleRight, FaFilter } from 'react-icons/fa';
import { Switch } from '@material-tailwind/react';
import CustomHr from '../Ui/CustomHr';
const getAppLogo = ({ logoType }: { logoType: string }) => {
  switch (logoType) {
    case 'SR':
      return '/svg/sr/logo.svg';

    case 'JSA':
      return '/svg/jsa/logo.svg';

    case 'TS':
      return '/svg/timesheet_app/logo.svg';

    case 'AM':
      return '/svg/asset_manager/logo.svg';

    case 'SH':
      return '/svg/sh/logo.svg';

    default:
      break;
  }
};

function OrgInstalledAppList() {
  const context = useAppStoreCotnext();
  const axiosAuth = useAxiosAuth();
  const [openFilter, toggleFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: 'installedApps',
    queryFn: () => getInstalledApps(axiosAuth),
  });
  const [addedApps, setAddedApps] = useState<boolean>(false);

  const [searchApp, setSearchTerm] = useState('');

  const queryClient = useQueryClient();

  const deleteAppMutation = useMutation(deleteInstalledApp, {
    onSuccess: () => {
      queryClient.invalidateQueries('installedApps');
    },
  });

  const handleDelete = ({ id }: { id: string }) => {
    deleteAppMutation.mutate({
      axiosAuth: axiosAuth,
      id: id,
    });
  };
  if (isLoading) {
    return <p>Loading...</p>;
  }
  const handleSwitch = () => {
    setAddedApps(!addedApps);
  };

  if (isError) {
    const errorMessage = (error as { message: string }).message;
    return <p>Error: {errorMessage}</p>;
  }
  if (isSuccess) {
    const filteredApps = (data ?? []).filter((app) =>
      app.app.name?.toLowerCase().includes(searchApp.toLowerCase())
    );

    const itemsPerPage = 50;
    // Get current page's data
    const currentPageData = filteredApps.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
    const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    };
    return (
      <>
        <div className="relative w-full md:max-w-[1360px]">
          {/* filter */}
          <Dialog
            open={openFilter}
            onClose={() => toggleFilter(false)}
            className="fixed inset-0 z-30 overflow-y-auto"
          >
            <div className="fixed inset-0 flex w-screen items-center justify-center bg-secondary-800/70">
              <Dialog.Panel className="w-[90%] rounded-3xl bg-white px-8 py-6 sm:w-11/12 md:w-[596px] lg:px-10 lg:py-6">
                <Dialog.Title className="flex w-full items-start justify-between">
                  <div className="ml-0 flex items-center gap-3">
                    <div>
                      <h2 className="leading-7text-[#000000] text-lg font-medium lg:text-xl">
                        Filter by
                      </h2>

                      <span className="text-xs text-gray-600 sm:text-sm">
                        Filter by the following selections and options.
                      </span>
                    </div>
                  </div>
                  <button
                    className="rounded-md p-1 outline-none hover:bg-gray-100"
                    onClick={() => {
                      toggleFilter(false);
                    }}
                  >
                    <X />
                  </button>
                </Dialog.Title>
                <CustomHr className="my-4" />
                {/* // filter */}
                filter
                <CustomHr className="my-5" />
                <div className="flex justify-center gap-5 pt-1 font-medium">
                  <button
                    className="h-11 w-1/2 rounded-lg border-2 border-primary-500 text-sm text-primary-500 sm:h-12 sm:w-36 sm:text-base"
                    onClick={() => toggleFilter(false)}
                  >
                    Reset
                  </button>
                  <button
                    className="h-11 w-1/2 rounded-lg bg-primary-500 text-sm font-semibold text-white hover:bg-primary-600/80 sm:h-12 sm:w-36 sm:text-base"
                    // onClick={handleDialogContinue}
                  >
                    Apply
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
          <div className="page-heading-edit mb-5 flex flex-col justify-between gap-2 xl:flex-row xl:gap-0 xl:pl-7">
            {/* icon */}
            <div className="page-heading-edit flex flex-col items-center gap-4 md:flex-row xl:w-1/2">
              <div className="flex w-full items-center gap-4 md:w-max">
                <span
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#e2f3ff] p-[5px] lg:h-[50px] lg:w-[50px]"
                  style={{
                    boxShadow: '0px 0px 2px 1.3px #0000001d',
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.24935 0.166748C8.17955 0.166748 9.10064 0.349964 9.96003 0.705935C10.8194 1.06191 11.6003 1.58366 12.258 2.24141C12.9158 2.89916 13.4375 3.68002 13.7935 4.53941C14.1495 5.3988 14.3327 6.31988 14.3327 7.25008V14.3334H7.24935C5.37074 14.3334 3.56906 13.5871 2.24068 12.2588C0.912296 10.9304 0.166019 9.1287 0.166019 7.25008C0.166019 5.37146 0.912296 3.56979 2.24068 2.24141C3.56906 0.913026 5.37074 0.166748 7.24935 0.166748ZM7.24935 17.6667H14.3327V24.7501C14.3327 26.151 13.9173 27.5205 13.1389 28.6854C12.3606 29.8502 11.2543 30.7581 9.96003 31.2942C8.66572 31.8303 7.24149 31.9706 5.86746 31.6973C4.49343 31.424 3.2313 30.7494 2.24068 29.7588C1.25006 28.7681 0.575435 27.506 0.302123 26.132C0.0288111 24.7579 0.169085 23.3337 0.705205 22.0394C1.24133 20.7451 2.14921 19.6388 3.31406 18.8605C4.47891 18.0822 5.8484 17.6667 7.24935 17.6667ZM24.7494 0.166748C26.628 0.166748 28.4296 0.913026 29.758 2.24141C31.0864 3.56979 31.8327 5.37146 31.8327 7.25008C31.8327 9.1287 31.0864 10.9304 29.758 12.2588C28.4296 13.5871 26.628 14.3334 24.7494 14.3334H17.666V7.25008C17.666 5.37146 18.4123 3.56979 19.7407 2.24141C21.0691 0.913026 22.8707 0.166748 24.7494 0.166748ZM17.666 17.6667H24.7494C26.1503 17.6667 27.5198 18.0822 28.6846 18.8605C29.8495 19.6388 30.7574 20.7451 31.2935 22.0394C31.8296 23.3337 31.9699 24.7579 31.6966 26.132C31.4233 27.506 30.7486 28.7681 29.758 29.7588C28.7674 30.7494 27.5053 31.424 26.1312 31.6973C24.7572 31.9706 23.333 31.8303 22.0387 31.2942C20.7444 30.7581 19.6381 29.8502 18.8598 28.6854C18.0814 27.5205 17.666 26.151 17.666 24.7501V17.6667Z"
                      fill="#0063F7"
                    />
                  </svg>
                </span>
                <h3 className="text-lg font-bold text-black md:text-xl lg:text-2xl">
                  Apps
                </h3>
                <label className="flex w-full place-content-end items-center gap-2 text-sm md:hidden">
                  <span>Added Apps</span>
                  <Switch
                    id="custom-switch-component"
                    checked={addedApps}
                    className="h-full w-full bg-red-300 checked:bg-green-300"
                    containerProps={{
                      className: 'w-11 h-6',
                    }}
                    circleProps={{
                      className: 'before:hidden left-0.5 border-none',
                    }}
                    onChange={handleSwitch}
                    crossOrigin={undefined}
                  />
                </label>
              </div>
            </div>

            {/* buttons and search */}
            <div className="page-heading-edit flex items-center justify-end gap-2 sm:gap-3 xl:w-1/2">
              <label className="hidden items-center gap-2 md:flex">
                <span>Added Apps</span>
                <Switch
                  id="custom-switch-component"
                  checked={addedApps}
                  className="h-full w-full bg-red-300 checked:bg-green-300"
                  containerProps={{
                    className: 'w-11 h-6',
                  }}
                  circleProps={{
                    className: 'before:hidden left-0.5 border-none',
                  }}
                  onChange={handleSwitch}
                  crossOrigin={undefined}
                />
              </label>
              <button
                onClick={() => toggleFilter(true)}
                className="h-[44px] w-[44px] cursor-pointer rounded-md bg-[#EEEEEE] p-3"
              >
                <FaFilter className={`w-full text-gray-700`} />
              </button>
              <div className="team-actice w-full sm:w-[300px]">
                <Search
                  key={'search'}
                  inputRounded={true}
                  type="text"
                  className="bg-[#eeeeee] pt-1 placeholder:text-[#616161]"
                  name="search"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Apps"
                />
              </div>
            </div>
          </div>
          <div className="grid w-full grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {(data ?? []).map((e) => {
              return (
                <div key={e.app._id} className="cursor-pointer">
                  <div className="relative flex h-[100px] w-full items-start justify-between overflow-hidden rounded-[18px] bg-white p-[6px] shadow-primary-shadow hover:border-1 hover:border-primary-300/80 hover:shadow-primary-hover sm:max-w-[300px]">
                    <img
                      src={getAppLogo({ logoType: e.app.type })}
                      alt="logo"
                      className="h-full"
                    />
                    <div className="ml-2 h-full w-full">
                      <div className="flex h-full items-start justify-between pb-1 pr-1 pt-1">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-semibold text-black">
                            {e.app.name ?? ''}
                          </div>
                          <div className="text-xs font-normal text-[#616161]">
                            {e.app.description ?? ''}
                          </div>
                        </div>
                        <div className="self-end text-right text-white">
                          <Plus className="h-5 w-5 rounded-full bg-primary-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* footer */}
          <div className="absolute bottom-0 left-1/2 z-20 mx-auto flex w-full max-w-[1360px] -translate-x-1/2 transform flex-col items-end gap-2">
            <div className="flex h-[72px] w-full items-center justify-between space-x-4 rounded-t-xl border-2 border-gray-300 border-b-transparent bg-white px-4">
              <span className="text-sm text-gray-700 md:w-1/3">
                Items per page: {itemsPerPage}
              </span>
              <div className="flex items-center justify-center space-x-2 md:w-1/3">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-md px-2 py-1 text-lg text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaAngleLeft />
                </button>

                {/* Current Page */}
                <div className="rounded-lg border border-gray-700 px-3 py-1 text-gray-700">
                  {currentPage}
                </div>

                {/* Total Pages */}
                <span className="text-sm text-gray-700">of {totalPages}</span>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-md px-2 py-1 text-lg text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaAngleRight />
                </button>
              </div>
              <div className="hidden w-1/3 md:block"></div>
            </div>
          </div>
        </div>
      </>
    );
  }
  return null;
}

export { OrgInstalledAppList };
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
