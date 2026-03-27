import {
  getSRAppSetting,
  updateSRSetting,
} from "@/app/(main)/(user-panel)/user/apps/sr/api";
import {
  getTimesheetAppSetting,
  updateTimesheetAppSetting,
} from "@/app/(main)/(user-panel)/user/apps/timesheets/api";
import { AddedTeamDetailModel } from "@/app/type/addedTeamDetailModel";
import { CustomSearchSelect } from "@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select";
import useAxiosAuth from "@/hooks/AxiosAuth";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function SRPermissionSetting({
  teams,
}: {
  teams: AddedTeamDetailModel[] | undefined;
}) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };
  const [adminMode, setAdminMode] = useState<String[]>([]);
  const [kioskMode, setKioskMode] = useState<String[]>([]);
  const [rollCall, setRollCall] = useState<String[]>([]);
  const [manageSites, setManageSites] = useState<String[]>([]);

  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const updateSettingMutation = useMutation(updateSRSetting, {
    onSuccess: () => {
      toast.success("setting saved");
      queryClient.invalidateQueries("SRSetting");
    },
  });
  const { data: notificationData, isLoading: detailLoading } = useQuery({
    queryKey: "SRSetting",
    queryFn: () => getSRAppSetting(axiosAuth),
  });
  useEffect(() => {
    if (notificationData) {
      setAdminMode(notificationData.adminMode ?? []);
      setKioskMode(notificationData.kioskMode ?? []);
      setRollCall(notificationData.rollCall ?? []);
      setManageSites(notificationData.manageSites ?? []);
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
      <div className="w-4/6 md:w-5/6 flex flex-col max-h-[668px]   border-2 border-[#EEEEEE] rounded-lg p-6 shadow  mx-4 my-4 ">
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold mb-1 md:text-xl">
            Manage Permissions for this app
          </h2>
          <p className="text-[#616161] font-normal text-[10px] md:text-sm">
            Manage permissions for this app.
          </p>
        </div>

        <div className="w-1/2 pt-6">
          <div className="relative mb-4">
            <CustomSearchSelect
              label="Admin Mode"
              data={[
                {
                  label: "All",
                  value: "all",
                  photo: undefined,
                },
                ...(teams ?? []).flatMap((user) => {
                  return [
                    {
                      label: user.name ?? "",
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
              isOpen={openDropdown === "dropdown1"}
              onToggle={() => handleToggle("dropdown1")}
            />
          </div>
          <div className="relative mb-4">
            <CustomSearchSelect
              label="Kiosk Mode"
              data={[
                {
                  label: "All",
                  value: "all",
                  photo: undefined,
                },
                ...(teams ?? []).flatMap((user) => {
                  return [
                    {
                      label: user.name ?? "",
                      value: user._id,
                      photo: undefined,
                    },
                  ];
                }),
              ]}
              onSelect={(values) => {
                setKioskMode(values);
                handleSubmit({ data: { kioskMode: values } });
              }}
              selected={notificationData?.kioskMode}
              hasError={false}
              showImage={false}
              isOpen={openDropdown === "dropdown2"}
              onToggle={() => handleToggle("dropdown2")}
            />
          </div>
          <div className="relative mb-4">
            <CustomSearchSelect
              label="Roll Call"
              data={[
                {
                  label: "All",
                  value: "all",
                  photo: undefined,
                },
                ...(teams ?? []).flatMap((user) => {
                  return [
                    {
                      label: user.name ?? "",
                      value: user._id,
                      photo: undefined,
                    },
                  ];
                }),
              ]}
              onSelect={(values) => {
                setRollCall(values);
                handleSubmit({ data: { rollCall: values } });
              }}
              selected={notificationData?.rollCall}
              hasError={false}
              showImage={false}
              isOpen={openDropdown === "dropdown3"}
              onToggle={() => handleToggle("dropdown3")}
            />
          </div>
          <div className="relative mb-4">
            <CustomSearchSelect
              label="Manage Sites"
              data={[
                {
                  label: "All",
                  value: "all",
                  photo: undefined,
                },
                ...(teams ?? []).flatMap((user) => {
                  return [
                    {
                      label: user.name ?? "",
                      value: user._id,
                      photo: undefined,
                    },
                  ];
                }),
              ]}
              onSelect={(values) => {
                setManageSites(values);
                handleSubmit({ data: { manageSites: values } });
              }}
              selected={notificationData?.manageSites}
              hasError={false}
              showImage={false}
              isOpen={openDropdown === "dropdown4"}
              onToggle={() => handleToggle("dropdown4")}
            />
          </div>
        </div>
      </div>
    </>
  );
}
