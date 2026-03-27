import Loader from '@/components/DottedLoader/loader';
import { Search } from '@/components/Form/search';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { motion } from 'framer-motion';

import { useSRAppCotnext } from '@/app/(main)/(user-panel)/user/apps/sr/sr_context';
import { getAllSitesByProjectIds } from '@/app/(main)/(user-panel)/user/apps/sr/api';
import { GroupService } from '@/app/type/service_group';
import { Button } from '@/components/Buttons';
import {
  deleteServiceSchedule,
  getAllServiceSchedules,
  getAssetList,
} from '@/app/(main)/(user-panel)/user/apps/am/api';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import { AddGroupServiceScheduleModel } from './Add_Service_Schedule';
import { dateFormat } from '@/app/helpers/dateFormat';
import CustomInfoModal from '@/components/CustomDeleteModel';
import { ServiceSchedule } from '@/app/type/group_service_schedule';
import { ViewGroupServiceScheduleModel } from './View_Service_Schedule';
import { customSortFunction } from '@/app/helpers/re-use-func';
import { PaginationComponent } from '@/components/pagination';
import { useTikiPagination } from '@/hooks/usePagination';

export function GroupServiceSchedule({
  model,
}: {
  model: GroupService | undefined;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>('Recent');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('desc');
  const [showServiceScheduleModel, toggleShowServiceScheduleModel] = useState<
    'view' | 'add' | 'delete' | null
  >(null);
  const [serviceScheduleModel, toggleServiceScheduleModel] = useState<
    ServiceSchedule | undefined
  >(undefined);
  const selectOption = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
  };
  const context = useSRAppCotnext();

  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const deleteSeriveSchedule = useMutation(deleteServiceSchedule, {
    onSuccess: () => {
      toggleShowServiceScheduleModel(null);
      toggleServiceScheduleModel(undefined);
      queryClient.invalidateQueries('serviceSchedule');
    },
  });
  // const { data: assets } = useQuery({
  //   queryKey: 'groupAssetLists',
  //   queryFn: () => getAssetList({ axiosAuth, status: 'all' }),
  //   refetchOnWindowFocus: false,
  // });
  const { data, isLoading } = useQuery({
    queryKey: 'serviceSchedule',
    queryFn: () =>
      getAllServiceSchedules({
        axiosAuth,
        id: model?._id ?? '',
      }),
  });

  var filterservices =
    (data ?? [])
      .filter((e) =>
        `${e?.name}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        return customSortFunction({
          a: a.serviceDate.toString(),
          b: b.serviceDate.toString(),
          sortBy,
          type: 'date',
        });
      }) ?? [];

  const {
    currentPage,
    totalPages,
    paginatedItems,
    itemsPerPage,
    handlePageChange,
  } = useTikiPagination(filterservices ?? [], 10);

  return (
    <>
      <div className="my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
        <div className="flex flex-col sm:p-5 sm:pb-0 md:flex md:flex-row md:justify-between">
          <div className="flex flex-col">
            <h2 className="mb-1 text-sm font-semibold md:text-lg">
              Service Schedules
            </h2>
            <p className="text-sm font-normal text-[#616161]">
              Add service schedules for your selected assets.
            </p>
          </div>
          <div className="flex flex-row items-center">
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

        <div className="mx-3 h-[400px]">
          {isLoading ? (
            <>
              <Loader />
            </>
          ) : (
            <table className="mt-3 w-full border-collapse font-Open-Sans">
              <thead className="bg-[#F5F5F5] px-3 text-left text-sm font-semibold text-[#616161]">
                <tr>
                  <th className="px-2 py-3">Service Schedule Name</th>

                  <th className="px-2 py-3">Repeating</th>

                  <th className="px-2 py-3 md:flex md:justify-center">
                    Next Service
                    <img
                      src="/images/fluent_arrow-sort-24-regular.svg"
                      className="cursor-pointer px-1"
                      alt="image"
                      onClick={() => {
                        setSortBy(sortBy === 'asc' ? 'desc' : 'asc');
                      }}
                    />
                  </th>
                  <th className="px-2 py-3 text-end"></th>
                </tr>
              </thead>
              <tbody className="px-3 text-sm font-normal text-[#1E1E1E]">
                {(filterservices ?? []).map((item, index) => {
                  return (
                    <tr
                      key={item._id}
                      className="relative cursor-pointer border-b even:bg-[#F5F5F5]"
                    >
                      <td
                        className="w-fit px-4 py-2 text-primary-400"
                        onClick={() => {
                          toggleServiceScheduleModel(item);
                          toggleShowServiceScheduleModel('view');
                        }}
                      >
                        {item.name}
                      </td>

                      <td className="text-[#616161 w-24 px-2 py-2">
                        {item.repeat}
                      </td>
                      <td className="text-[#616161 w-[280] px-2 py-2 text-center">
                        {dateFormat(item.serviceDate.toString())}
                      </td>
                      <td className="flex w-8 cursor-pointer justify-end p-2">
                        <Dropdown placement="bottom-end">
                          <DropdownTrigger>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="24px"
                              viewBox="0 -960 960 960"
                              width="24px"
                              fill="#616161"
                              className="hover:fill-[#8d8d8d]"
                            >
                              <path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z" />
                            </svg>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Dynamic Actions">
                            <DropdownItem
                              key="edit"
                              onClick={() => {
                                toggleServiceScheduleModel(item);
                                toggleShowServiceScheduleModel('add');
                              }}
                            >
                              Edit
                            </DropdownItem>

                            <DropdownItem
                              key="delete"
                              onClick={() => {
                                toggleServiceScheduleModel(item);
                                toggleShowServiceScheduleModel('delete');
                              }}
                            >
                              Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between border-t-2 border-gray-200 px-3 py-2">
          <div className="font-Open-Sans text-sm font-normal text-[#616161]">
            Items per page: {itemsPerPage}
          </div>
          <div>
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          </div>
          <div className="font-Open-Sans text-base font-semibold text-[#616161]"></div>
        </div>
      </div>
      <div className="fixed bottom-24 right-[20%] z-10">
        <Button
          variant="primaryRounded"
          onClick={() => {
            toggleShowServiceScheduleModel('add');
          }}
        >
          {'+ Add'}
        </Button>
      </div>

      {showServiceScheduleModel == 'view' && (
        <ViewGroupServiceScheduleModel
          group={model}
          assets={model?.assets ?? []}
          model={serviceScheduleModel}
          handleClose={() => {
            toggleServiceScheduleModel(undefined);
            toggleShowServiceScheduleModel(null);
          }}
        />
      )}
      {showServiceScheduleModel == 'add' && (
        <AddGroupServiceScheduleModel
          groupId={model?._id ?? ''}
          assets={model?.assets ?? []}
          model={serviceScheduleModel}
          handleClose={() => {
            toggleServiceScheduleModel(undefined);
            toggleShowServiceScheduleModel(null);
          }}
        />
      )}
      {showServiceScheduleModel == 'delete' && (
        <CustomInfoModal
          title="Delete Service Schedule"
          subtitle="Are you sure you want to delete this service schedule?"
          onDeleteButton={() => {
            deleteSeriveSchedule.mutate({
              axiosAuth,
              id: serviceScheduleModel?._id,
            });
          }}
          doneValue={
            deleteSeriveSchedule.isLoading ? (
              <>
                <Loader />
              </>
            ) : (
              <>Delete</>
            )
          }
          handleClose={() => {
            toggleShowServiceScheduleModel(null);
            toggleServiceScheduleModel(undefined);
          }}
        />
      )}
    </>
  );
}
