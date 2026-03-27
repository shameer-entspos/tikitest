import {
  removeAssetFromServiceGroup,
  updateGroupService,
} from '@/app/(main)/(user-panel)/user/apps/am/api';

import { GroupService } from '@/app/type/service_group';
import { Button } from '@/components/Buttons';
import Loader from '@/components/DottedLoader/loader';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { AddGroupAssetModel } from './Add_Group_Asset';
import toast from 'react-hot-toast';
import { PaginationComponent } from '@/components/pagination';
import { useTikiPagination } from '@/hooks/usePagination';
import { useSelectableRows } from '@/hooks/useSelectableRows';
import { SelectTableHead } from '@/components/Selectable_Input/SelectTableHead';
import { SelectTableCell } from '@/components/Selectable_Input/SelectTableCell';
import CustomInfoModal from '@/components/CustomDeleteModel';
import { Search } from '@/components/Form/search';
import { customSortFunction } from '@/app/helpers/re-use-func';

export default function GroupOverAssetSection({
  model,
  handleClose,
}: {
  model: GroupService | undefined;
  handleClose: any;
}) {
  const axiosAuth = useAxiosAuth();
  const [groupServiceModel, setGroupModel] = useState<GroupService | undefined>(
    model
  );

  // Sync local state with prop when it changes
  useEffect(() => {
    if (model) {
      setGroupModel(model);
    }
  }, [model]);

  const [showRemoveModel, toggleRemoveModel] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('desc');
  const queryClient = useQueryClient();
  const removeAssetFromServiceGroupMutation = useMutation(
    removeAssetFromServiceGroup,
    {
      onSuccess: () => {
        toast.success('Group Service Updated');
        toggleRemoveModel(false);
        cancelSelection();
        queryClient.invalidateQueries('groupServices');
      },
    }
  );

  //// select button

  const [showAddAssetModel, toggleAddAssetModel] = useState(false);
  const {
    currentPage,
    totalPages,
    paginatedItems,
    itemsPerPage,
    handlePageChange,
  } = useTikiPagination(groupServiceModel?.assets ?? [], 10);
  const filterData = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      return paginatedItems ?? [];
    }
    return (paginatedItems ?? []).filter((item: any) => {
      const searchLower = searchQuery.toLowerCase().trim();
      return (
        (item.name || '').toLowerCase().includes(searchLower) ||
        (item.atnNum || '').toLowerCase().includes(searchLower)
      );
    });
  }, [paginatedItems, searchQuery]);
  const {
    isSelectMode,
    toggleSelectMode,
    cancelSelection,
    selectedItems,
    toggleItemSelection,
    selectAllMine,
    isItemSelected,
    isAllMineSelected,
  } = useSelectableRows((filterData ?? []).map((item) => item._id));
  const handleAssetRemove = (assetIds: string[]) => {
    if (!groupServiceModel) return;

    // Avoid duplicates

    const updatedAssets = (groupServiceModel.assets ?? []).filter(
      (asset) => !assetIds.includes(asset._id)
    );

    setGroupModel({
      ...groupServiceModel,
      assets: updatedAssets,
    });
    removeAssetFromServiceGroupMutation.mutate({
      axiosAuth,
      data: {
        id: groupServiceModel?._id,
        assetIds: assetIds,
      },
    });
  };

  return (
    <>
      <div className="relative my-4">
        <div className="flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
          <div className="flex flex-col sm:p-5 sm:pb-0 md:flex md:flex-row md:justify-between">
            <div className="flex flex-col p-4">
              <div className="text-xl font-semibold">Assets</div>
              <span className="font-Open-Sans text-sm text-[#616161]">
                {'Select Group Service Assets'}
              </span>
            </div>
            <div className="Search team-actice flex items-center justify-between px-4">
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
          <div className="mx-4 h-[400px]">
            <table className="mt-3 w-full border-collapse font-Open-Sans">
              <thead className="rounded-lg bg-[#F5F5F5] text-left text-sm font-semibold text-[#616161]">
                <tr className="">
                  <th className="px-2 py-3">Asset Tag No.</th>
                  <th className="px-2 py-3 md:flex">
                    Asset Name
                    <img
                      src="/images/fluent_arrow-sort-24-regular.svg"
                      className="cursor-pointer px-1"
                      alt="image"
                      onClick={() => {
                        setSortBy(sortBy === 'asc' ? 'desc' : 'asc');
                      }}
                    />
                  </th>

                  <SelectTableHead
                    isSelectMode={isSelectMode}
                    toggleSelectMode={toggleSelectMode}
                    cancelSelection={cancelSelection}
                    selectAllMine={selectAllMine}
                    isAllSelected={isAllMineSelected}
                  />
                </tr>
              </thead>
              <tbody className="text-sm font-normal text-[#1E1E1E]">
                {(filterData ?? [])
                  .sort((a, b) => {
                    return customSortFunction({
                      a: a.name.toString(),
                      b: b.name.toString(),
                      sortBy,
                      type: 'text',
                    });
                  })
                  .map((item, index) => {
                    return (
                      <tr
                        key={item._id}
                        className="relative cursor-pointer border-b even:bg-[#F5F5F5]"
                      >
                        <td className="px-4 py-2 text-primary-400">
                          {item.atnNum}
                        </td>

                        <td className="text-[#616161 px-2 py-2">{item.name}</td>

                        <SelectTableCell
                          elsePart={
                            <button
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EA4E4E] text-center hover:bg-[#d43d3d]"
                              onClick={() => {
                                handleAssetRemove([item._id]);
                              }}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M4 8H12"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          }
                          isSelectMode={isSelectMode}
                          isSelected={isItemSelected(item._id)}
                          onToggle={() => toggleItemSelection(item._id)}
                          isDisabled={false}
                        />
                      </tr>
                    );
                  })}
              </tbody>
            </table>
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
            <div>
              {isSelectMode && (
                <div className="flex gap-6 font-Open-Sans text-base font-semibold text-[#616161]">
                  <Button variant="text" onClick={cancelSelection}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      toggleRemoveModel(true);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-32 right-[18%] z-10">
        <Button
          variant="primaryRounded"
          onClick={() => {
            toggleAddAssetModel(!showAddAssetModel);
          }}
        >
          {'+ Add'}
        </Button>
      </div>

      {showAddAssetModel && (
        <AddGroupAssetModel
          model={groupServiceModel}
          handleClose={() => {
            toggleAddAssetModel(!showAddAssetModel);
            // handleClose();
          }}
        />
      )}

      {showRemoveModel && (
        <CustomInfoModal
          handleClose={() => toggleRemoveModel(false)}
          svg={
            <svg
              width="60"
              height="60"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
              <path
                d="M37.7513 31.0419L27.5032 13.2446C27.2471 12.8086 26.8815 12.4471 26.4427 12.1959C26.0038 11.9446 25.5069 11.8125 25.0013 11.8125C24.4956 11.8125 23.9987 11.9446 23.5598 12.1959C23.121 12.4471 22.7554 12.8086 22.4993 13.2446L12.2513 31.0419C12.0049 31.4636 11.875 31.9433 11.875 32.4317C11.875 32.9202 12.0049 33.3998 12.2513 33.8216C12.5041 34.2602 12.869 34.6237 13.3087 34.8748C13.7484 35.1258 14.2469 35.2553 14.7532 35.2501H35.2493C35.7552 35.2549 36.2532 35.1252 36.6925 34.8742C37.1317 34.6231 37.4963 34.2599 37.7489 33.8216C37.9957 33.4 38.1259 32.9205 38.1263 32.432C38.1268 31.9436 37.9973 31.4638 37.7513 31.0419ZM36.1259 32.8829C36.0365 33.0353 35.9083 33.1612 35.7542 33.2477C35.6002 33.3342 35.4259 33.3781 35.2493 33.3751H14.7532C14.5766 33.3781 14.4023 33.3342 14.2483 33.2477C14.0942 33.1612 13.966 33.0353 13.8766 32.8829C13.7957 32.7459 13.753 32.5897 13.753 32.4305C13.753 32.2714 13.7957 32.1152 13.8766 31.9782L24.1247 14.1809C24.2158 14.0293 24.3447 13.9038 24.4987 13.8166C24.6527 13.7295 24.8266 13.6837 25.0036 13.6837C25.1806 13.6837 25.3545 13.7295 25.5085 13.8166C25.6625 13.9038 25.7914 14.0293 25.8825 14.1809L36.1306 31.9782C36.2108 32.1156 36.2526 32.2721 36.2518 32.4312C36.251 32.5903 36.2075 32.7463 36.1259 32.8829ZM24.0638 25.8751V21.1876C24.0638 20.9389 24.1625 20.7005 24.3383 20.5247C24.5142 20.3488 24.7526 20.2501 25.0013 20.2501C25.2499 20.2501 25.4884 20.3488 25.6642 20.5247C25.84 20.7005 25.9388 20.9389 25.9388 21.1876V25.8751C25.9388 26.1237 25.84 26.3622 25.6642 26.538C25.4884 26.7138 25.2499 26.8126 25.0013 26.8126C24.7526 26.8126 24.5142 26.7138 24.3383 26.538C24.1625 26.3622 24.0638 26.1237 24.0638 25.8751ZM26.4075 30.0938C26.4075 30.372 26.325 30.6438 26.1705 30.8751C26.016 31.1064 25.7964 31.2866 25.5394 31.393C25.2824 31.4995 24.9997 31.5273 24.7269 31.4731C24.4541 31.4188 24.2036 31.2849 24.0069 31.0882C23.8102 30.8915 23.6763 30.641 23.622 30.3682C23.5678 30.0954 23.5956 29.8126 23.7021 29.5557C23.8085 29.2987 23.9887 29.0791 24.22 28.9246C24.4512 28.7701 24.7231 28.6876 25.0013 28.6876C25.3742 28.6876 25.7319 28.8357 25.9956 29.0995C26.2593 29.3632 26.4075 29.7209 26.4075 30.0938Z"
                fill="#0063F7"
              />
            </svg>
          }
          title={'Remove Assets from Service Group?'}
          onDeleteButton={() => {
            handleAssetRemove(selectedItems);
          }}
          doneValue={'Confirm'}
          variant="primary"
          subtitle={
            'Removing these assets from the service group will also remove it from the assigned service schedule.'
          }
        />
      )}
    </>
  );
}
