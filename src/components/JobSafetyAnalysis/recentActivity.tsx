import { activitiesList } from "@/app/(main)/(user-panel)/user/apps/api";
import useAxiosAuth from "@/hooks/AxiosAuth";
import { useQuery } from "react-query";
import Loader from "../DottedLoader/loader";
import { useJSAAppsCotnext } from "@/app/(main)/(user-panel)/user/apps/jsa/jsaContext";
import { JSAAPPACTIONTYPE } from "@/app/helpers/user/enums";

const RecentActivity = () => {
  const axiosAuth = useAxiosAuth();
  const context = useJSAAppsCotnext();
  const { data, isLoading } = useQuery({
    queryFn: () => activitiesList({ axiosAuth, appType: "JSA" }),
    queryKey: ["activitiesList"],
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

        {/* <button onClick={() => context.dispatch({ type: JSAAPPACTIONTYPE.SHOWPAGES, showPages: 'activityLog' })}><svg width="53" height="19" viewBox="0 0 53 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.34668 5.00586L4.75781 15H3.58887L0 5.00586H1.2168L3.55469 11.5889C3.65039 11.8532 3.7347 12.1061 3.80762 12.3477C3.88509 12.5892 3.95345 12.8216 4.0127 13.0449C4.07194 13.2682 4.12435 13.4847 4.16992 13.6943C4.21549 13.4847 4.2679 13.2682 4.32715 13.0449C4.38639 12.8171 4.45475 12.5824 4.53223 12.3408C4.6097 12.0947 4.69629 11.8372 4.79199 11.5684L7.11621 5.00586H8.34668ZM10.6846 7.50781V15H9.5498V7.50781H10.6846ZM10.1309 4.70508C10.3177 4.70508 10.4772 4.7666 10.6094 4.88965C10.7461 5.00814 10.8145 5.19499 10.8145 5.4502C10.8145 5.70085 10.7461 5.8877 10.6094 6.01074C10.4772 6.13379 10.3177 6.19531 10.1309 6.19531C9.9349 6.19531 9.77083 6.13379 9.63867 6.01074C9.51107 5.8877 9.44727 5.70085 9.44727 5.4502C9.44727 5.19499 9.51107 5.00814 9.63867 4.88965C9.77083 4.7666 9.9349 4.70508 10.1309 4.70508ZM15.9756 7.37109C16.6136 7.37109 17.1605 7.51237 17.6162 7.79492C18.0719 8.07747 18.4206 8.47396 18.6621 8.98438C18.9036 9.49023 19.0244 10.0827 19.0244 10.7617V11.4658H13.8496C13.8633 12.3454 14.082 13.0153 14.5059 13.4756C14.9297 13.9359 15.5267 14.166 16.2969 14.166C16.7708 14.166 17.1901 14.1227 17.5547 14.0361C17.9193 13.9495 18.2975 13.8219 18.6895 13.6533V14.6514C18.3112 14.82 17.9352 14.943 17.5615 15.0205C17.1924 15.098 16.7549 15.1367 16.249 15.1367C15.529 15.1367 14.9001 14.9909 14.3623 14.6992C13.8291 14.403 13.4144 13.9701 13.1182 13.4004C12.8219 12.8307 12.6738 12.1335 12.6738 11.3086C12.6738 10.502 12.8083 9.80469 13.0771 9.2168C13.3506 8.62435 13.7334 8.16862 14.2256 7.84961C14.7223 7.5306 15.3057 7.37109 15.9756 7.37109ZM15.9619 8.30078C15.3558 8.30078 14.8727 8.49902 14.5127 8.89551C14.1527 9.29199 13.9385 9.8457 13.8701 10.5566H17.835C17.8304 10.11 17.7598 9.7181 17.623 9.38086C17.4909 9.03906 17.2881 8.77474 17.0146 8.58789C16.7412 8.39648 16.3903 8.30078 15.9619 8.30078ZM27.0498 14.9863L25.7168 10.625C25.6576 10.4382 25.6006 10.2559 25.5459 10.0781C25.4958 9.89583 25.4479 9.72266 25.4023 9.55859C25.3613 9.38997 25.3226 9.23503 25.2861 9.09375C25.2542 8.94792 25.2269 8.82259 25.2041 8.71777H25.1562C25.138 8.82259 25.113 8.94792 25.0811 9.09375C25.0492 9.23503 25.0104 9.38997 24.9648 9.55859C24.9238 9.72721 24.8783 9.90495 24.8281 10.0918C24.778 10.2741 24.721 10.4587 24.6572 10.6455L23.2627 14.9863H21.9844L19.9199 7.49414H21.0957L22.1758 11.6299C22.2487 11.9033 22.3171 12.1745 22.3809 12.4434C22.4492 12.7077 22.5062 12.9583 22.5518 13.1953C22.6019 13.4277 22.6383 13.6305 22.6611 13.8037H22.7158C22.7432 13.6898 22.7728 13.5531 22.8047 13.3936C22.8411 13.234 22.8799 13.0654 22.9209 12.8877C22.9665 12.7054 23.0143 12.5254 23.0645 12.3477C23.1146 12.1654 23.1647 11.9945 23.2148 11.835L24.5957 7.49414H25.8193L27.1523 11.8281C27.2207 12.0469 27.2868 12.2747 27.3506 12.5117C27.4189 12.7487 27.4805 12.9788 27.5352 13.2021C27.5898 13.4209 27.6286 13.6169 27.6514 13.79H27.7061C27.7243 13.6351 27.7585 13.4437 27.8086 13.2158C27.8587 12.988 27.9157 12.7373 27.9795 12.4639C28.0479 12.1904 28.1185 11.9124 28.1914 11.6299L29.2852 7.49414H30.4404L28.3691 14.9863H27.0498ZM41.8838 15L40.6533 11.8281H36.6475L35.4238 15H34.248L38.1582 4.96484H39.2041L43.0869 15H41.8838ZM40.3047 10.7959L39.1357 7.64453C39.1084 7.5625 39.0628 7.42806 38.999 7.24121C38.9398 7.05436 38.8783 6.86068 38.8145 6.66016C38.7507 6.45964 38.6982 6.29785 38.6572 6.1748C38.6117 6.36165 38.5615 6.5485 38.5068 6.73535C38.4567 6.91764 38.4066 7.08854 38.3564 7.24805C38.3063 7.40299 38.263 7.53516 38.2266 7.64453L37.0371 10.7959H40.3047ZM45.4453 15H44.3037V4.36328H45.4453V15ZM48.9863 15H47.8447V4.36328H48.9863V15Z" fill="#0063F7" />
        </svg>
        </button> */}
      </div>
      <ul className="space-y-5">
        {activities.map((activity: any, index: any) => (
          <li key={index} className="flex items-center">
            <span
              className={`rounded-md px-2.5 py-1.5 text-sm font-normal text-gray-900 ${getTypeColor(
                activity.entry,
              )}`}
            >
              {activity.entry}
            </span>
            {/* <span className="font-semibold">{activity.type}</span> */}
            <span className="ml-2 text-sm font-normal text-[#616161]">
              {activity.action}
            </span>
            <span className="px-1 text-sm font-normal text-[#616161]">-</span>
            <span className="text-sm font-normal text-[#616161]">
              {activity.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const getTypeColor = (type: string) => {
  switch (type) {
    case "Draft":
      return "bg-[#ffd597]";
    case "Template":
      return "bg-[#f1c9ff]";
    case "Submission":
      return "bg-[#97f1bb]";
    case "PPE & Safety Gear":
      return "bg-[#bcc7ff]";
    case "Hazards & Risks":
      return "bg-[#fbee7d]";
    default:
      return "bg-gray-200";
  }
};

export default RecentActivity;
