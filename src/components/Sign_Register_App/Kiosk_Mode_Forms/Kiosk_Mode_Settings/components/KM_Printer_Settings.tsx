import { getTeams } from "@/app/(main)/(org-panel)/organization/teams/api";
import {
  getTimesheetAppSetting,
  updateTimesheetAppSetting,
} from "@/app/(main)/(user-panel)/user/apps/timesheets/api";
import { AddedTeamDetailModel } from "@/app/type/addedTeamDetailModel";
import { CustomSearchSelect } from "@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select";
import useAxiosAuth from "@/hooks/AxiosAuth";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function KMPrinterSettings({}: {}) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };
  const [timesheets, setTimesheet] = useState<String[]>([]);
  const [expenses, setExpanses] = useState<String[]>([]);
  const [reviewsubmission, setReviewsubmission] = useState<String[]>([]);
  const [reportExport, setreportExport] = useState<String[]>([]);

  const [search, setSearch] = useState("");

  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const updateSettingMutation = useMutation(updateTimesheetAppSetting, {
    onSuccess: () => {
      toast.success("setting saved");
      queryClient.invalidateQueries("SRSetting");
    },
  });
  const { data: notificationData, isLoading: detailLoading } = useQuery({
    queryKey: "SRSetting",
    queryFn: () => getTimesheetAppSetting(axiosAuth),
  });
  useEffect(() => {
    if (notificationData) {
      setTimesheet(notificationData.timeSheets ?? []);
      setExpanses(notificationData.expenses ?? []);
      setReviewsubmission(notificationData.reviewSubmission ?? []);
      setreportExport(notificationData.reportExport ?? []);
    }
  }, []);
  const handleSubmit = ({
    ts,
    ex,
    review,
    report,
  }: {
    ts?: String[];
    ex?: String[];
    review?: String[];
    report?: String[];
  }) => {
    const data = {
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
      <div className="w-4/6 md:w-5/6 flex flex-col max-h-[668px]   border-2 border-[#EEEEEE] rounded-lg p-6 shadow  mx-4 my-4 ">
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold mb-1 md:text-xl">
            Printer Settings
          </h2>
          <p className="text-[#616161] font-normal text-[10px] md:text-sm">
            These settings are specific for this user account / logged in device
            only.
          </p>
        </div>

        <div className="w-1/2 pt-6 mb-4">
          <div className="relative mb-8">
            <div className="flex flex-col gap-2">
              <label>Print Email Address</label>
              <input
                type="text"
                onChange={(e) => setSearch(e.target.value)}
                className={clsx(
                  `appearance-none border-1 rounded-md py-2.5 px-[15px] focus:outline-none focus:shadow-outline placeholder-text-black placeholder:font-normal font-normal leading-[22px] text-[#1E1E1E] text-xs h-10`
                )}
                placeholder="Enter Email Address"
              />
            </div>
          </div>
          <div className="relative mb-8">
            <h2 className="text-sm font-semibold mb-1">
              Enable Email to Print Label{" "}
            </h2>
            <div className="grid grid-cols-[auto,1fr] gap-2 mt-2 items-start">
              <input
                type="checkbox"
                className="h-4 w-4 mt-1 checked:bg-black checked:text-black border-black border-2"
                name="option"
                value="1"
                // checked={isChecked}
                // onChange={handleCheckboxChange}
              />
              <div className="grid">
                <span>Yes</span>
              </div>
            </div>
          </div>
          <div className="relative mb-8">
            <p className="text-[#616161] font-normal text-[10px] md:text-sm mb-4">
              To print badge labels please setup a email to print server. This
              will grab the PDF label attachment and print it to your label
              printer. We recommend using the free PaperCut Print Management
              software.
            </p>

            <p className="text-[#616161] font-normal text-[10px] md:text-sm mb-8">
              Label Size: 38 mm x 90.3 mm
            </p>
            <p className="text-[#0063F7] font-normal text-[10px] md:text-sm mb-8">
              View Full Setup Instructions{" "}
            </p>
            <p className="text-[#0063F7] font-normal text-[10px] md:text-sm mb-8">
              Download Label Example{" "}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
