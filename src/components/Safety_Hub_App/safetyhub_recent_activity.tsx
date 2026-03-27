import { activitiesList } from '@/app/(main)/(user-panel)/user/apps/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useQuery } from 'react-query';
import Loader from '../DottedLoader/loader';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { RecentAppActivity } from '@/app/type/recent_app_activity';

const SafetyHubRecentActivity = () => {
  const axiosAuth = useAxiosAuth();
  const context = useJSAAppsCotnext();
  const { data, isLoading } = useQuery({
    queryFn: () => activitiesList({ axiosAuth, appType: 'SH' }),
    queryKey: ['SHactivitiesList'],
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
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
      <ul className="space-y-[10px]">
        {activities.map((activity: RecentAppActivity, index: any) => (
          // eslint-disable-next-line react/jsx-key
          <li className="flex items-center space-x-5" key={index}>
            <span
              className={`rounded-md px-2 py-1.5 text-sm font-normal text-white ${getTypeColor(
                activity.entry
              )}`}
            >
              {activity.entry}
            </span>

            <div>
              <span className="text-sm font-normal text-[#616161]">
                {activity.action}
              </span>
              <span className="px-1 text-sm font-normal text-[#616161]">-</span>
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
    case 'Hazard & Incident':
      return 'bg-[#FF7918]';
    case 'Discussion Topic':
      return 'bg-[#6990FF]';
    case 'Comment':
      return 'bg-[#1C90FB]';
    case 'Safety Meeting':
      return 'bg-[#0063F7]';
    default:
      return 'bg-gray-200';
  }
};

export default SafetyHubRecentActivity;
