import { getTeams } from '@/app/(main)/(org-panel)/organization/teams/api';
import {
  getTimesheetAppSetting,
  updateTimesheetAppSetting,
} from '@/app/(main)/(user-panel)/user/apps/timesheets/api';
import { AddedTeamDetailModel } from '@/app/type/addedTeamDetailModel';
import useAxiosAuth from '@/hooks/AxiosAuth';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { CustomSearchSelect } from '../CommonComponents/Custom_Select/Custom_Search_Select';

export function TimeSheetAutoApprovedSettings({
  teams,
}: {
  teams: AddedTeamDetailModel[] | undefined;
}) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [timesheets, setTimesheet] = useState<String[]>([]);
  const [expenses, setExpanses] = useState<String[]>([]);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const updateSettingMutation = useMutation(updateTimesheetAppSetting, {
    onSuccess: () => {
      toast.success('setting saved');
      queryClient.invalidateQueries('timesheetSetting');
    },
  });
  const { data: notificationData, isLoading: detailLoading } = useQuery({
    queryKey: 'timesheetSetting',
    queryFn: () => getTimesheetAppSetting(axiosAuth),
  });
  useEffect(() => {
    if (notificationData) {
      setTimesheet(notificationData.approvedtimeSheets ?? []);
      setExpanses(notificationData.approvedexpenses ?? []);
    }
  }, [notificationData]);
  const handleSubmit = ({ ts, ex }: { ts?: String[]; ex?: String[] }) => {
    const data = {
      notificationData,
      approvedtimeSheets: ts ?? timesheets,
      approvedexpenses: ex ?? expenses,
    };

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
            Auto Approve Submissions
          </h2>
          <p className="text-[10px] font-normal text-[#616161] md:text-sm">
            Select which teams to auto approve submissions for.
          </p>
        </div>

        <div className="mt-2 w-1/2">
          <div className="relative mb-8">
            <CustomSearchSelect
              label="Timesheets"
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
                setTimesheet(values);
                handleSubmit({ ts: values });
              }}
              selected={notificationData?.approvedtimeSheets}
              hasError={false}
              showImage={false}
              isOpen={openDropdown === 'dropdown1'}
              onToggle={() => handleToggle('dropdown1')}
            />
          </div>{' '}
          <div className="relative mb-8">
            <CustomSearchSelect
              label="Expenses"
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
                setExpanses(values);
                handleSubmit({ ex: values });
              }}
              selected={notificationData?.approvedexpenses}
              hasError={false}
              showImage={false}
              isOpen={openDropdown === 'dropdown2'}
              onToggle={() => handleToggle('dropdown2')}
            />
          </div>
        </div>
      </div>
    </>
  );
}
