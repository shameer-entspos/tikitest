import { getTeams } from '@/app/(main)/(org-panel)/organization/teams/api';
import {
  getSHAppSetting,
  updateSHSetting,
} from '@/app/(main)/(user-panel)/user/apps/sh/api';
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

export function SHPermissionSetting({
  teams,
}: {
  teams: AddedTeamDetailModel[] | undefined;
}) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };
  const [adminMode, setAdminMode] = useState<String[]>([]);
  const [liveBoard, setLiveBoard] = useState<String[]>([]);
  const [hazards, setHazards] = useState<String[]>([]);
  const [safetyMeetings, setSafetyMeetings] = useState<String[]>([]);

  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const updateSettingMutation = useMutation(updateSHSetting, {
    onSuccess: () => {
      toast.success('setting saved');
      queryClient.invalidateQueries('SHSetting');
      queryClient.invalidateQueries('SHSettingPermission');
    },
  });
  const { data: notificationData, isLoading: detailLoading } = useQuery({
    queryKey: 'SHSetting',
    queryFn: () => getSHAppSetting(axiosAuth),
  });
  useEffect(() => {
    if (notificationData) {
      setAdminMode(notificationData.adminMode ?? []);
      setLiveBoard(notificationData.liveBoard ?? []);
      setHazards(notificationData.hazards ?? []);
      setSafetyMeetings(notificationData.safetyMeetings ?? []);
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
            Manage permissions and access for this app.
          </p>
        </div>

        <div className="w-1/2 pt-6">
          <div className="relative mb-4">
            <CustomSearchSelect
              label="Admin Mode"
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
                setAdminMode(values);
                handleSubmit({ data: { adminMode: values } });
              }}
              selected={notificationData?.adminMode}
              hasError={false}
              showImage={false}
              isOpen={openDropdown === 'dropdown1'}
              onToggle={() => handleToggle('dropdown1')}
            />
          </div>
          <div className="relative mb-4">
            <CustomSearchSelect
              label="Live Board"
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
                setLiveBoard(values);
                handleSubmit({ data: { liveBoard: values } });
              }}
              selected={notificationData?.liveBoard}
              hasError={false}
              showImage={false}
              isOpen={openDropdown === 'dropdown2'}
              onToggle={() => handleToggle('dropdown2')}
            />
          </div>
          <div className="relative mb-4">
            <CustomSearchSelect
              label="Hazards & Incidents"
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
                setHazards(values);
                handleSubmit({ data: { hazards: values } });
              }}
              selected={notificationData?.hazards}
              hasError={false}
              showImage={false}
              isOpen={openDropdown === 'dropdown3'}
              onToggle={() => handleToggle('dropdown3')}
            />
          </div>
          <div className="relative mb-4">
            <CustomSearchSelect
              label="Safety Meetings"
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
                setSafetyMeetings(values);
                handleSubmit({ data: { safetyMeetings: values } });
              }}
              selected={notificationData?.safetyMeetings}
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
