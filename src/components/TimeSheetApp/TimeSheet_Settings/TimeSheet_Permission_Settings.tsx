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

export function TimeSheetPermissionSetting({
  teams,
}: {
  teams: AddedTeamDetailModel[] | undefined;
}) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };
  const [timesheets, setTimesheet] = useState<String[]>([]);
  const [adminMode, setAdminMode] = useState<String[]>([]);

  const [expenses, setExpanses] = useState<String[]>([]);
  const [reviewsubmission, setReviewsubmission] = useState<String[]>([]);
  const [reportExport, setreportExport] = useState<String[]>([]);

  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const updateSettingMutation = useMutation(updateTimesheetAppSetting, {
    onSuccess: () => {
      toast.success('setting saved');
      queryClient.invalidateQueries('timesheetSetting');
      queryClient.invalidateQueries('TSSettingPermission');
    },
  });
  const { data: notificationData, isLoading: detailLoading } = useQuery({
    queryKey: 'timesheetSetting',
    queryFn: () => getTimesheetAppSetting(axiosAuth),
  });
  useEffect(() => {
    if (notificationData) {
      setTimesheet(notificationData.timeSheets ?? []);
      setExpanses(notificationData.expenses ?? []);
      setAdminMode(notificationData.adminMode ?? []);
      setReviewsubmission(notificationData.reviewSubmission ?? []);
      setreportExport(notificationData.reportExport ?? []);
    }
  }, []);
  const handleSubmit = ({
    ts,
    ex,
    review,
    report,
    admin,
  }: {
    ts?: String[];
    ex?: String[];
    review?: String[];
    report?: String[];
    admin?: String[];
  }) => {
    const data = {
      adminMode: admin ?? adminMode,
      notificationData,
      timeSheets: ts ?? timesheets,
      expenses: ex ?? expenses,
      reviewSubmission: review ?? reviewsubmission,
      reportExport: report ?? reportExport,
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
            Manage Permissions for this app
          </h2>
          <p className="text-[10px] font-normal text-[#616161] md:text-sm">
            Manage permissions for this app.
          </p>
        </div>

        <div className="w-1/2">
          <div className="relative my-4">
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
                handleSubmit({ admin: values });
              }}
              selected={notificationData?.adminMode}
              hasError={false}
              showImage={false}
              isOpen={openDropdown === 'dropdown5'}
              onToggle={() => handleToggle('dropdown5')}
            />
          </div>
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
              selected={notificationData?.timeSheets}
              hasError={false}
              showImage={false}
              isOpen={openDropdown === 'dropdown1'}
              onToggle={() => handleToggle('dropdown1')}
            />
          </div>
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
              selected={notificationData?.expenses}
              hasError={false}
              showImage={false}
              isOpen={openDropdown === 'dropdown2'}
              onToggle={() => handleToggle('dropdown2')}
            />
          </div>
          <div className="relative mb-8">
            <CustomSearchSelect
              label="Review Submissions"
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
                setReviewsubmission(values);
                handleSubmit({ review: values });
              }}
              selected={notificationData?.reviewSubmission}
              hasError={false}
              showImage={false}
              isOpen={openDropdown === 'dropdown3'}
              onToggle={() => handleToggle('dropdown3')}
            />
          </div>
          <div className="relative mb-8">
            <CustomSearchSelect
              label="Report & Export"
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
                setreportExport(values);
                handleSubmit({ report: values });
              }}
              selected={notificationData?.reportExport}
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
