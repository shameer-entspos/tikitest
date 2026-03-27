import { getTeams } from '@/app/(main)/(org-panel)/organization/teams/api';
import {
  getAMAppSetting,
  updateAMSetting,
} from '@/app/(main)/(user-panel)/user/apps/am/api';
import {
  getTimesheetAppSetting,
  updateTimesheetAppSetting,
} from '@/app/(main)/(user-panel)/user/apps/timesheets/api';
import { AddedTeamDetailModel } from '@/app/type/addedTeamDetailModel';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import useAxiosAuth from '@/hooks/AxiosAuth';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export function AMPermissionSetting({
  teams,
}: {
  teams: AddedTeamDetailModel[] | undefined;
}) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };
  const [checkInOut, setCheckInOut] = useState<String[]>([]);
  const [manageServices, setManageServices] = useState<String[]>([]);
  const [manageAssets, setManageAssets] = useState<String[]>([]);
  const [categories, setCategories] = useState<String[]>([]);

  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const updateSettingMutation = useMutation(updateAMSetting, {
    onSuccess: () => {
      toast.success('setting saved');
      queryClient.invalidateQueries('AMSetting');
      queryClient.invalidateQueries('AMSettingPermission');
    },
  });
  const { data: notificationData, isLoading: detailLoading } = useQuery({
    queryKey: 'AMSetting',
    queryFn: () => getAMAppSetting(axiosAuth),
  });
  useEffect(() => {
    if (notificationData) {
      setCheckInOut(notificationData.checkInOut ?? []);
      setManageServices(notificationData.manageServices ?? []);
      setManageAssets(notificationData.manageAssets ?? []);
      setCategories(notificationData.categories ?? []);
    }
  }, []);
  const handleSubmit = ({ data }: { data: any }) => {
    updateSettingMutation.mutate({
      axiosAuth,
      data,
      id: notificationData?._id!,
    });
  };
  return (
    <>
      <div className="mx-4 my-4 flex max-h-[668px] w-4/6 flex-col rounded-lg border-2 border-[#EEEEEE] p-6 shadow md:w-5/6">
        <div className="flex flex-col">
          <h2 className="mb-1 text-sm font-semibold md:text-xl">
            Manage Permissions for this app
          </h2>
          <p className="text-[10px] font-normal text-[#616161] md:text-sm">
            Manage permissions for this app.
          </p>
        </div>

        <div className="w-1/2 pt-6">
          <div className="relative mb-4">
            <CustomSearchSelect
              label="Check in / out"
              data={[
                {
                  label: 'All',
                  value: 'all',
                  photo: undefined,
                },
                ...(teams ?? []).flatMap((user) => {
                  return [
                    {
                      label: user.name ?? '',
                      value: user._id,
                      photo: undefined,
                    },
                  ];
                }),
              ]}
              onSelect={(values) => {
                setCheckInOut(values);
                handleSubmit({ data: { checkInOut: values } });
              }}
              selected={notificationData?.checkInOut}
              hasError={false}
              showImage={false}
              isOpen={openDropdown === 'dropdown1'}
              onToggle={() => handleToggle('dropdown1')}
            />
          </div>
          <div className="relative mb-4">
            <CustomSearchSelect
              label="Manage Service Groups"
              data={[
                {
                  label: 'All',
                  value: 'all',
                  photo: undefined,
                },
                ...(teams ?? []).flatMap((user) => {
                  return [
                    {
                      label: user.name ?? '',
                      value: user._id,
                      photo: undefined,
                    },
                  ];
                }),
              ]}
              onSelect={(values) => {
                setManageServices(values);
                handleSubmit({ data: { manageServices: values } });
              }}
              selected={notificationData?.manageServices}
              hasError={false}
              showImage={false}
              isOpen={openDropdown === 'dropdown2'}
              onToggle={() => handleToggle('dropdown2')}
            />
          </div>
          <div className="relative mb-4">
            <CustomSearchSelect
              label="Manage Assets"
              data={[
                {
                  label: 'All',
                  value: 'all',
                  photo: undefined,
                },
                ...(teams ?? []).flatMap((user) => {
                  return [
                    {
                      label: user.name ?? '',
                      value: user._id,
                      photo: undefined,
                    },
                  ];
                }),
              ]}
              onSelect={(values) => {
                setManageAssets(values);
                handleSubmit({ data: { manageAssets: values } });
              }}
              selected={notificationData?.manageAssets}
              hasError={false}
              showImage={false}
              isOpen={openDropdown === 'dropdown3'}
              onToggle={() => handleToggle('dropdown3')}
            />
          </div>
          <div className="relative mb-4">
            <CustomSearchSelect
              label="Categories"
              data={[
                {
                  label: 'All',
                  value: 'all',
                  photo: undefined,
                },
                ...(teams ?? []).flatMap((user) => {
                  return [
                    {
                      label: user.name ?? '',
                      value: user._id,
                      photo: undefined,
                    },
                  ];
                }),
              ]}
              onSelect={(values) => {
                setCategories(values);
                handleSubmit({ data: { categories: values } });
              }}
              selected={notificationData?.categories}
              hasError={false}
              showImage={false}
              isOpen={openDropdown === 'dropdown4'}
              onToggle={() => handleToggle('dropdown4')}
            />
          </div>
        </div>
      </div>
    </>
  );
}
