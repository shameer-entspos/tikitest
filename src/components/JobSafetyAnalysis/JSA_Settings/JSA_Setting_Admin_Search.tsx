import {
  updateJSAAppSetting,
  getAllTeamsForJSA,
  getJSAAppSetting,
} from "@/app/(main)/(user-panel)/user/apps/api";
import Loader from "@/components/DottedLoader/loader";
import { CustomSearchSelect } from "@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select";
import useAxiosAuth from "@/hooks/AxiosAuth";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MultiSelect } from "react-multi-select-component";
import { useMutation, useQuery, useQueryClient } from "react-query";

const JSASelectAdminSearch = () => {
  const [status, setStatus] = useState("no");

  const axiosAuth = useAxiosAuth();

  const queryClient = useQueryClient();
  const createMutation = useMutation(updateJSAAppSetting, {
    onSuccess: () => {
      toast.success("setting saved");
      queryClient.invalidateQueries("jsaSetting");
    },
  });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };
  const { data: teams, isLoading } = useQuery({
    queryKey: "listOfJSATeams",
    queryFn: () => getAllTeamsForJSA(axiosAuth),
  });
  const { data: notificationData, isLoading: DetailLoading } = useQuery({
    queryKey: "jsaSetting",
    queryFn: () => getJSAAppSetting(axiosAuth),
  });

  useEffect(() => {
    if (notificationData) {
      setStatus(notificationData.forceSubmission);
    }
  }, [notificationData]);

  const handleSubmit = async ({ data }: { data: any }) => {
    createMutation.mutate({
      axiosAuth,
      data,
      id: notificationData?._id!,
    });
  };

  const uniqueAppIds = new Set<string>();
  if (DetailLoading) {
    return <Loader />;
  }
  return (
    <div className="w-1/2 ">
      <div className="py-3 mb-6">
        <h2 className="text-sm font-semibold  mb-3 ">
          Force Public / Private Submissions
        </h2>
        <div className="my-1">
          <input
            type="radio"
            className=" h-4 w-4  checked:bg-black checked:text-black border-black border-2"
            name="option"
            value="1"
            checked={status == "no"}
            onChange={() => {
              setStatus("no"),
                handleSubmit({ data: { forceSubmission: "no" } });
            }}
          />
          <span className="ml-2 text-gray-700">No Restrictions</span>
        </div>
        <div className="my-1">
          <input
            type="radio"
            className=" h-4 w-4  checked:bg-black checked:text-black border-black border-2"
            name="option"
            value="2"
            checked={status == "public"}
            onChange={() => {
              setStatus("public");
              handleSubmit({ data: { forceSubmission: "public" } });
            }}
          />
          <span className="ml-2 text-gray-700">Force Public Submissions</span>
        </div>
        <div className="my-1">
          <input
            type="radio"
            className=" h-4 w-4  checked:bg-black checked:text-black border-black border-2"
            name="option"
            value="3"
            checked={status == "private"}
            onChange={() => {
              setStatus("private");
              handleSubmit({ data: { forceSubmission: "private" } });
            }}
          />
          <span className="ml-2 text-gray-700">Force Private Submissions</span>
        </div>
      </div>
      <div className="relative mb-4">
        <CustomSearchSelect
          label=" Admin Mode (view and edit all user submissions)"
          data={[
            {
              label: "All",
              value: "all",
              photo: undefined,
            },
            ...(teams ?? []).flatMap((team) => {
              if (!uniqueAppIds.has(team._id!)) {
                uniqueAppIds.add(team._id!);
                return [
                  {
                    label: team.name!,
                    value: team._id!,
                  },
                ];
              }
              return [];
            }),
          ]}
          onSelect={(selectedItem) => {
            handleSubmit({ data: { adminTeams: selectedItem } });
          }}
          selected={[...(notificationData?.adminTeams ?? [])]}
          hasError={false}
          showImage={false}
          isOpen={openDropdown === "dropdown3"}
          onToggle={() => handleToggle("dropdown3")}
        />
      </div>
    
    </div>
  );
};

export { JSASelectAdminSearch };
