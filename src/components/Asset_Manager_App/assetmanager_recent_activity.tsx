import { activitiesList } from "@/app/(main)/(user-panel)/user/apps/api";
import useAxiosAuth from "@/hooks/AxiosAuth";
import { useQuery } from "react-query";
import Loader from "../DottedLoader/loader";
import { useJSAAppsCotnext } from "@/app/(main)/(user-panel)/user/apps/jsa/jsaContext";
import { JSAAPPACTIONTYPE } from "@/app/helpers/user/enums";
import { useAssetManagerAppsContext } from "@/app/(main)/(user-panel)/user/apps/am/am_context";

const AssetManagerRecentActivity = () => {
  const axiosAuth = useAxiosAuth();
  const context = useAssetManagerAppsContext();
  const { data, isLoading } = useQuery({
    queryFn: () => activitiesList({ axiosAuth, appType: "AM" }),
    queryKey: ["AMactivitiesList"],
  });
  if (isLoading) {
    return (
      <div className="flex items-center justify-center pt-56">
        <Loader />
      </div>
    );
  }
  const activities = (data ?? [])
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 20);
  return (
    <div className="w-full px-4 text-sm">
      <div className="mb-[10px] flex items-center justify-between">
        <div className="inline-flex items-end justify-start gap-5 bg-gradient-to-b from-white via-white to-white py-[15px]">
          <div className="font-['Open Sans'] text-base font-semibold text-[#1e1e1e]">
            Recent Activity
          </div>
          <div className="font-['Open Sans'] text-sm font-normal text-[#616161]">
            Showing Last 20
          </div>
        </div>
      </div>
      <ul className="space-y-5">
        {activities.map((activity: any, index: any) => (
          // eslint-disable-next-line react/jsx-key
          <li className="flex items-center">
            <span
              className={`rounded-md px-2 py-1.5 text-center text-sm font-normal ${getTypeColor(
                activity.entry,
              )}`}
            >
              {activity.entry}
            </span>
            {/* <span className="font-semibold">{activity.type}</span> */}
            <div className="ml-2">
              {/* <span className="text-[#616161] text-sm font-normal">
                {activity.action}
              </span>
              <span className="text-[#616161] text-sm font-normal px-1">-</span> */}
              <span className="text-sm font-normal text-[#616161]">
                {activity.title}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const getTypeColor = (type: string) => {
  switch (type) {
    case "Asset Manager":
      return "bg-[#00B93F] text-white";
    case "Checked in":
      return "border-2 text-[#0074DF] border-[#0074DF]";
    case "Checked Out":
      return "border-2 text-[#EA4E4B] border-[#EA4E4E]  ";
    default:
      return "bg-gray-200";
  }
};

export default AssetManagerRecentActivity;
