'use client';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  AppStoreModel,
  deleteInstalledApp,
  getAllAppList,
  installAppInOrg,
} from '@/app/(main)/(org-panel)/organization/app-store/api';
import { Switch } from '@material-tailwind/react';
import Loader from '@/components/DottedLoader/loader';
import FilterButton from '@/components/TimeSheetApp/CommonComponents/FilterButton/FilterButton';
import { Search } from '@/components/Form/search';
import CustomModal from '@/components/Custom_Modal';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { UpdateAppStore } from '@/components/Update_App_Store';
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
export default function Page() {
  const axiosAuth = useAxiosAuth();
  const [showFilterModel, setShowFilterModel] = useState(false);
  const [addedApps, setAddedApps] = useState<boolean>(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string>('');
  const [filterByIndustry, setIndustry] = useState<string[]>([]);
  const [filterByCategory, setCategory] = useState<string[]>([]);
  const [filterByRegion, setRegion] = useState<string[]>([]);
  const [filterFree, setFree] = useState(false);
  const [filterPaid, setPaid] = useState(false);

  const [isApplyFilter, setApplyFilter] = useState(false);
  const [model, setModel] = useState<AppStoreModel | undefined>(undefined);
  const handleDropdown = (dropdownId: string) => {
    setOpenFilterDropdown(openFilterDropdown === dropdownId ? '' : dropdownId);
  };
  const clearFilters = () => {
    setIndustry([]);
    setCategory([]);
    setRegion([]);
    setApplyFilter(false);
    setOpenFilterDropdown('');
    setShowFilterModel(!showFilterModel);
  };
  const areFiltersApplied = () => {
    return (
      filterByIndustry.length > 0 ||
      filterByCategory.length > 0 ||
      filterByRegion.length > 0
    );
  };

  const handleApplyFilters = () => {
    setShowFilterModel(!showFilterModel);
    if (areFiltersApplied()) {
      setApplyFilter(true);
    }
  };
  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: 'allApps',
    queryFn: () => getAllAppList(axiosAuth),
  });
  const [searchApp, setSearchTerm] = useState('');
  const handleSwitch = () => {
    setAddedApps(!addedApps);
  };

  if (isLoading) {
    return (
      <div className="fixed flex h-screen w-full items-center justify-center">
        <Loader />
      </div>
    );
  }
  return (
    <>
      <UpdateAppStore
        model={model}
        setModel={setModel}
        isInstalled={model?.isInstalled ?? false}
      />
      <div className="flex min-h-full w-full max-w-[1360px] flex-1 flex-col">
        {/* {context.state.showAppModel && <AddAppModel />} */}
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
            <FilterButton
              isApplyFilter={isApplyFilter}
              setShowModel={setShowFilterModel}
              showModel={showFilterModel}
              setOpenDropdown={setOpenFilterDropdown}
              clearFilters={clearFilters}
            />
            <div className="team-actice w-full sm:w-[300px]">
              <Search
                key={'search'}
                inputRounded={true}
                type="text"
                className="bg-[#eeeeee] pt-1 placeholder:text-[#616161]"
                name="search"
                value={searchApp}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Apps"
              />
            </div>
          </div>
        </div>
        <div className="grid w-full grid-cols-1 gap-x-2 gap-y-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {(data ?? [])
            .filter((a) => {
              if (addedApps) {
                if (a.isInstalled) {
                  return a;
                } else {
                  return null;
                }
              }
              return a;
            })
            .filter((e) =>
              e.name.toLowerCase().includes(searchApp.toLowerCase())
            )
            .map((e: AppStoreModel) => {
              return (
                <div
                  key={e._id}
                  className="cursor-pointer"
                  onClick={() => setModel(e)}
                >
                  <div className="relative flex h-[120px] w-full items-start justify-between overflow-hidden rounded-[18px] bg-white p-[6px] shadow-primary-shadow hover:border-1 hover:border-primary-300/80 hover:shadow-primary-hover sm:max-w-[300px]">
                    <img
                      src={getAppLogo({ logoType: e.type })}
                      alt="logo"
                      className="h-full"
                    />
                    <div className="ml-2 h-full w-full">
                      <div className="flex h-full items-start justify-between pb-1 pr-1 pt-1">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-semibold text-black">
                            {e.name ?? ''}
                          </div>
                          <div className="text-xs font-normal text-[#616161]">
                            {e.description ?? ''}
                          </div>
                        </div>
                        <div className="self-end text-right text-white">
                          {e.isInstalled ? (
                            <>
                              <svg
                                width="25"
                                height="25"
                                viewBox="0 0 25 25"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g clipPath="url(#clip0_444_21227)">
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M0 12.5C0 9.18479 1.31696 6.00537 3.66117 3.66117C6.00537 1.31696 9.18479 0 12.5 0C15.8152 0 18.9946 1.31696 21.3388 3.66117C23.683 6.00537 25 9.18479 25 12.5C25 15.8152 23.683 18.9946 21.3388 21.3388C18.9946 23.683 15.8152 25 12.5 25C9.18479 25 6.00537 23.683 3.66117 21.3388C1.31696 18.9946 0 15.8152 0 12.5ZM11.7867 17.85L18.9833 8.85333L17.6833 7.81333L11.5467 15.4817L7.2 11.86L6.13333 13.14L11.7867 17.85Z"
                                    fill="#00993D"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_444_21227">
                                    <rect width="25" height="25" fill="white" />
                                  </clipPath>
                                </defs>
                              </svg>
                            </>
                          ) : (
                            <>
                              <svg
                                width="25"
                                height="25"
                                viewBox="0 0 25 25"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g clipPath="url(#clip0_444_21258)">
                                  <path
                                    d="M12.5004 0.347168C9.28942 0.386129 6.2209 1.67902 3.9502 3.94971C1.6795 6.22041 0.386617 9.28893 0.347656 12.4999C0.386617 15.711 1.6795 18.7795 3.9502 21.0502C6.2209 23.3209 9.28942 24.6138 12.5004 24.6527C15.7114 24.6138 18.78 23.3209 21.0507 21.0502C23.3214 18.7795 24.6143 15.711 24.6532 12.4999C24.6143 9.28893 23.3214 6.22041 21.0507 3.94971C18.78 1.67902 15.7114 0.386129 12.5004 0.347168ZM19.4449 13.368H13.3685V19.4444H11.6324V13.368H5.55599V11.6319H11.6324V5.5555H13.3685V11.6319H19.4449V13.368Z"
                                    fill="#0063F7"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_444_21258">
                                    <rect width="25" height="25" fill="white" />
                                  </clipPath>
                                </defs>
                              </svg>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
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
              <CustomSearchSelect
                label="Filter by Industry"
                data={[
                  {
                    label: 'All ',
                    value: 'all',
                  },
                  {
                    label: 'Construction & Manufacturing',
                    value: 'Construction & Manufacturing',
                  },
                  {
                    label: 'Finanace & Legal',
                    value: 'Finanace & Legal',
                  },
                  {
                    label: 'IT & Technology',
                    value: 'IT & Technology',
                  },
                  {
                    label: 'Corporate & Office',
                    value: 'Corporate & Office',
                  },
                  {
                    label: 'Retail',
                    value: 'Retail',
                  },
                  {
                    label: 'Healthcare',
                    value: 'Healthcare',
                  },
                ]}
                showImage={false}
                multiple={true}
                showSearch={true}
                isOpen={openFilterDropdown === 'dropdown1'}
                onToggle={() => handleDropdown('dropdown1')}
                onSelect={(selected: any) => {
                  setIndustry(selected);
                }}
                selected={filterByIndustry}
                bg="bg-white"
                searchPlaceholder="Search Industries"
                placeholder="-"
              />
            </div>
            <div className="my-4">
              <CustomSearchSelect
                label="Filter by Category"
                data={[
                  {
                    label: 'All',
                    value: 'all',
                  },
                  {
                    label: 'Accounting & Finance',
                    value: 'Accounting & Finance',
                  },
                  {
                    label: 'Heath & Safety',
                    value: 'Heath & Safety',
                  },
                  {
                    label: 'Compliance & Auditing',
                    value: 'Compliance & Auditing',
                  },
                ]}
                showImage={false}
                multiple={true}
                showSearch={true}
                isOpen={openFilterDropdown === 'dropdown2'}
                onToggle={() => handleDropdown('dropdown2')}
                onSelect={(selected: any) => {
                  setCategory(selected);
                }}
                selected={filterByCategory}
                bg="bg-white"
                searchPlaceholder="Search Categories"
                placeholder="-"
              />
            </div>
            <div className="my-4">
              <CustomSearchSelect
                label="Filter by Region"
                data={[
                  {
                    label: 'All',
                    value: 'all',
                  },
                  {
                    label: 'North America',
                    value: 'North America',
                  },
                  {
                    label: 'South America',
                    value: 'South America',
                  },
                  {
                    label: 'Europe',
                    value: 'Europe',
                  },
                  {
                    label: 'Africa',
                    value: 'Africa',
                  },
                  {
                    label: 'Asia',
                    value: 'Asia',
                  },
                  {
                    label: 'Oceania',
                    value: 'Oceania',
                  },
                ]}
                showImage={false}
                multiple={true}
                showSearch={true}
                isOpen={openFilterDropdown === 'dropdown3'}
                onToggle={() => handleDropdown('dropdown3')}
                onSelect={(selected: any) => {
                  setRegion(selected);
                }}
                selected={filterByRegion}
                bg="bg-white"
                searchPlaceholder="Search Regions"
                placeholder="-"
              />
            </div>
            <div className="flex flex-col gap-3 text-medium">
              <h1 className="mb-2 font-semibold">Free or Paid</h1>
              <div className="flex gap-2">
                <CustomBlueCheckBox
                  checked={filterFree}
                  onChange={() => {
                    setFree(!filterFree);
                  }}
                />
                <span className="">Free</span>
              </div>
              <div className="flex gap-2">
                <CustomBlueCheckBox
                  checked={filterPaid}
                  onChange={() => {
                    setPaid(!filterPaid);
                  }}
                />
                <span className="">Paid</span>
              </div>
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
