'use client';

import Loader from '@/components/DottedLoader/loader';
import CloudStorageModal from '@/components/popupModal/cloudStorage';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { getBillingDetails, BillingDetails } from '../billing/api';
import {
  getAppsStorage,
  getSizeofStorage,
  purgeAppData,
  purgeProjectData,
} from './api';
import CustomModal from '@/components/Custom_Modal';
import CustomDateRangePicker from '@/components/customDatePicker';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { getAllAppList } from '../app-store/api';
import { getAppLogo } from '@/components/ProjectDetails/Apps';
import CustomCheckbox from '@/components/Ui/CustomCheckbox';

export default function Page() {
  const [cloudShowModal, setCloudModal] = useState(false);
  const axiosAuth = useAxiosAuth();

  const { data, isSuccess, isLoading } = useQuery({
    queryKey: 'selectedStorage',
    queryFn: () => getSizeofStorage(axiosAuth),
  });

  // Fetch billing details instead of using session
  const { data: billingDetails } = useQuery<BillingDetails>({
    queryKey: 'billingDetails',
    queryFn: () => getBillingDetails(axiosAuth),
  });
  return (
    <>
      <div className="flex min-h-full w-full flex-1 flex-col md:max-w-[1360px]">
        {/* header */}
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
                  width="40"
                  height="28"
                  viewBox="0 0 40 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M32.25 10.7332C31.6902 7.89603 30.1627 5.34127 27.9284 3.50525C25.6942 1.66923 22.8918 0.66585 20 0.666504C15.1833 0.666504 11 3.39984 8.91667 7.39984C6.46706 7.66456 4.20168 8.82518 2.55581 10.6587C0.909952 12.4922 -0.00028617 14.8693 6.74879e-08 17.3332C6.74879e-08 22.8498 4.48333 27.3332 10 27.3332H31.6667C36.2667 27.3332 40 23.5998 40 18.9998C40 14.5998 36.5833 11.0332 32.25 10.7332Z"
                    fill="#0063F7"
                  />
                </svg>
              </span>
              <h3 className="text-lg font-bold text-black md:text-xl lg:text-2xl">
                Cloud Storage
              </h3>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-4 md:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="text-lg font-normal text-gray-800 lg:text-xl">
              {data?.totalSizeMB.toFixed(2) ?? 0} MB of{' '}
              {billingDetails?.user.organization?.storagePlan?.storagePlan
                ?.totalStorageInGB ?? 0}{' '}
              GB Used
            </div>
            <button
              className="font-semibold text-primary-500"
              onClick={() => {
                setCloudModal(true);
              }}
            >
              <svg
                className=" "
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.20117 5.91211H13.6699V8.3457H8.20117V13.8691H5.76758V8.3457H0.3125V5.91211H5.76758V0.333984H8.20117V5.91211Z"
                  fill="white"
                />
              </svg>
              <span>Add / Change Storage Plan</span>
            </button>
          </div>
          <div className="mb-4 h-[42px] w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-[42px] rounded-2xl bg-[#6990FF]"
              style={{ width: `${6}%` }}
            ></div>
          </div>

          <AppsList />

          {cloudShowModal && (
            <CloudStorageModal setCloudModal={setCloudModal} />
          )}
        </div>
      </div>
    </>
  );
}

function AppsList() {
  const axiosAuth = useAxiosAuth();
  const [showAppCleanupModel, setShowAppCleanupModel] = useState(false);
  const [showProjectCleanupModel, setShowProjectCleanupModel] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string>('');
  const [selectedApps, setSelectedApp] = useState<string[]>([]);
  const [firstDate, setFirstDate] = useState<Date | null>(null);
  const [endDate, setendDate] = useState<Date | null>(null);
  const [projecttypes, setProjecttypes] = useState<string[]>([]);
  const handleToggleDropdown = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? '' : dropdownId);
  };
  const { data, isSuccess, isLoading, refetch } = useQuery({
    queryKey: 'appstorage',
    queryFn: () => getAppsStorage(axiosAuth),
  });
  const { data: apps } = useQuery({
    queryKey: 'allApps',
    queryFn: () => getAllAppList(axiosAuth),
    onSuccess: (data) => {
      setSelectedApp([...(data ?? []).map((a) => a?._id)]);
    },
  });

  const purgeAppDataMutataion = useMutation(purgeAppData, {
    onSuccess: () => {
      refetch();
    },
  });
  const purgeProjectDataMutataion = useMutation(purgeProjectData, {
    onSuccess: () => {
      refetch();
    },
  });

  if (isLoading) {
    return <Loader />;
  } else if (isSuccess) {
    return (
      <>
        <div className="flex flex-col">
          <div className="inline-block w-full overflow-auto p-1.5 align-middle">
            <table className="spacing-y-2 min-w-full border-collapse">
              <thead className="">
                <tr className="border-b-2 border-gray-300">
                  <th
                    scope="col"
                    className="px-6 py-2 text-left text-sm font-normal text-[#1E1E1E]"
                  >
                    Type
                  </th>

                  <th
                    scope="col"
                    className="truncate px-6 py-2 text-left text-sm font-normal text-[#1E1E1E]"
                  >
                    Storage Used
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="w-full border-b-2 border-gray-300">
                  <td className="mb-2 whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                    Project Data
                  </td>

                  <td className="mb-2 whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                    {bytesToGB(data.projects ?? 0).toFixed(2) + ' Mb'}
                    {/* {'User storage'} */}
                  </td>
                  <td
                    className="cursor-pointer text-end text-xs font-light text-primary-500 md:text-sm"
                    onClick={() => {
                      setShowProjectCleanupModel(true);
                    }}
                  >
                    Clean Up
                  </td>
                </tr>
                <tr className="w-full">
                  <td className="mb-2 whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                    App Data
                  </td>

                  <td className="mb-2 whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                    {bytesToGB(data.apps ?? 0).toFixed(2) + ' Mb'}
                    {/* {'User storage'} */}
                  </td>
                  <td
                    className="cursor-pointer text-end text-xs font-light text-primary-500 md:text-sm"
                    onClick={() => {
                      setShowAppCleanupModel(true);
                    }}
                  >
                    Clean Up
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <CustomModal
          isOpen={showAppCleanupModel}
          header={
            <>
              <svg
                width="50"
                height="50"
                viewBox="0 0 50 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                <path
                  d="M15 18.75H35M22.5 23.75V31.25M27.5 23.75V31.25M16.25 18.75L17.5 33.75C17.5 34.413 17.7634 35.0489 18.2322 35.5178C18.7011 35.9866 19.337 36.25 20 36.25H30C30.663 36.25 31.2989 35.9866 31.7678 35.5178C32.2366 35.0489 32.5 34.413 32.5 33.75L33.75 18.75M21.25 18.75V15C21.25 14.6685 21.3817 14.3505 21.6161 14.1161C21.8505 13.8817 22.1685 13.75 22.5 13.75H27.5C27.8315 13.75 28.1495 13.8817 28.3839 14.1161C28.6183 14.3505 28.75 14.6685 28.75 15V18.75"
                  stroke="#0063F7"
                  stroke-width="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <div>
                <h2 className="text-xl font-semibold text-[#1E1E1E]">
                  {'Select App Data to Purge'}
                </h2>
                <span className="mt-1 text-base font-normal text-[#616161]">
                  {'Select date range and app data to purge.'}
                </span>
              </div>
            </>
          }
          handleCancel={() => {
            setShowAppCleanupModel(false);
          }}
          body={
            <>
              <div className="flex h-[500px] max-h-[400px] flex-col overflow-y-scroll px-5">
                <div className="relative mb-6">
                  <CustomDateRangePicker
                    title="Start Date"
                    handleOnConfirm={(date: Date) => {
                      setFirstDate(date);
                    }}
                    selectedDate={firstDate}
                  />
                </div>
                <div className="relative mb-6">
                  <CustomDateRangePicker
                    title="End Date"
                    handleOnConfirm={(date: Date) => {
                      setendDate(date);
                    }}
                    selectedDate={endDate}
                  />
                </div>
                <div className="w-full">
                  <CustomSearchSelect
                    label="Select App"
                    data={[
                      {
                        label: 'All Apps',
                        value: 'all',
                        photo: '',
                      },
                      ...(apps ?? []).map((app) => ({
                        label: app.name ?? '',
                        value: app._id ?? '',
                        photo: getAppLogo({ logoType: app.type ?? '' }),
                      })),
                    ]}
                    showImage={true}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown3'}
                    onToggle={() => handleToggleDropdown('dropdown3')}
                    onSelect={(selected: string[]) => {}}
                    selected={[]}
                    searchPlaceholder="Search App"
                    placeholder="All"
                  />
                </div>
              </div>
            </>
          }
          handleSubmit={() => {
            purgeAppDataMutataion.mutate({
              axiosAuth,
              body: {
                start: firstDate,
                end: endDate,
                appIds: selectedApps,
              },
            });
          }}
          submitDisabled={
            !firstDate ||
            !endDate ||
            selectedApps.length == 0 ||
            purgeAppDataMutataion.isLoading
          }
          submitValue={purgeAppDataMutataion.isLoading ? <Loader /> : 'Purge'}
        />
        <CustomModal
          isOpen={showProjectCleanupModel}
          header={
            <>
              <svg
                width="50"
                height="50"
                viewBox="0 0 50 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                <path
                  d="M15 18.75H35M22.5 23.75V31.25M27.5 23.75V31.25M16.25 18.75L17.5 33.75C17.5 34.413 17.7634 35.0489 18.2322 35.5178C18.7011 35.9866 19.337 36.25 20 36.25H30C30.663 36.25 31.2989 35.9866 31.7678 35.5178C32.2366 35.0489 32.5 34.413 32.5 33.75L33.75 18.75M21.25 18.75V15C21.25 14.6685 21.3817 14.3505 21.6161 14.1161C21.8505 13.8817 22.1685 13.75 22.5 13.75H27.5C27.8315 13.75 28.1495 13.8817 28.3839 14.1161C28.6183 14.3505 28.75 14.6685 28.75 15V18.75"
                  stroke="#0063F7"
                  stroke-width="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <div>
                <h2 className="text-xl font-semibold text-[#1E1E1E]">
                  {'Select Project Data to Purge'}
                </h2>
                <span className="mt-1 text-base font-normal text-[#616161]">
                  {'Select date range and project type to purge.'}
                </span>
              </div>
            </>
          }
          handleCancel={() => {
            setShowProjectCleanupModel(false);
          }}
          body={
            <div className="flex h-[500px] max-h-[400px] flex-col overflow-y-scroll px-5">
              <div className="relative mb-6">
                <CustomDateRangePicker
                  title="Start Date"
                  handleOnConfirm={(date: Date) => {
                    setFirstDate(date);
                  }}
                  selectedDate={firstDate}
                />
              </div>
              <div className="relative mb-6">
                <CustomDateRangePicker
                  title="End Date"
                  handleOnConfirm={(date: Date) => {
                    setendDate(date);
                  }}
                  selectedDate={endDate}
                />
              </div>

              <div className="flex items-center gap-3">
                <CustomCheckbox
                  label={''}
                  checked={projecttypes.includes('open')}
                  onChange={function (): void {
                    if (projecttypes.includes('open')) {
                      setProjecttypes(
                        projecttypes.filter((type) => type !== 'open')
                      );
                    } else {
                      setProjecttypes([...projecttypes, 'open']);
                    }
                  }}
                />
                <span>Open Projects</span>
              </div>
              <div className="flex items-center gap-3">
                <CustomCheckbox
                  label={''}
                  checked={projecttypes.includes('closed')}
                  onChange={function (): void {
                    if (projecttypes.includes('closed')) {
                      setProjecttypes(
                        projecttypes.filter((type) => type !== 'closed')
                      );
                    } else {
                      setProjecttypes([...projecttypes, 'closed']);
                    }
                  }}
                />
                <span>Closed Projects</span>
              </div>
            </div>
          }
          submitDisabled={
            !firstDate ||
            !endDate ||
            purgeProjectDataMutataion.isLoading ||
            projecttypes.length === 0
          }
          handleSubmit={() => {
            purgeProjectDataMutataion.mutate({
              axiosAuth,
              body: {
                start: firstDate,
                end: endDate,
                type: projecttypes,
              },
            });
          }}
          submitValue={
            purgeProjectDataMutataion.isLoading ? <Loader /> : 'Purge'
          }
        />
      </>
    );
  } else {
    return <></>;
  }
}

function bytesToGB(bytes: number): number {
  // 1 GB = 1024^3 bytes
  return bytes / Math.pow(1024, 2);
}
