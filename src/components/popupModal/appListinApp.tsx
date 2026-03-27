import {
  AppModel,
  getApps,
  updateAppRecentStatus,
  toggleAppFavorite,
} from '@/app/(main)/(user-panel)/user/apps/api';
import Loader from '../DottedLoader/loader';
import { useSession } from 'next-auth/react';
import { useAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/context';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { APPACTIONTYPE } from '@/app/helpers/user/enums';
import { AiFillStar } from 'react-icons/ai';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useRouter } from 'next/navigation';
export const getAppLogo = ({ logoType }: { logoType: string }) => {
  switch (logoType) {
    case 'SR':
      return '/svg/sr/logo.svg';

    case 'JSA':
      return '/svg/jsa/logo.svg';

    case 'TS':
      return '/svg/timesheet_app/logo.svg';

    case 'AM':
      return '/svg/asset_manager/logo.svg';

    case 'SH':
      return '/svg/sh/logo.svg';

    default:
      return '/task_logo.svg';
  }
};

interface AllAppsProps {
  searchQuery?: string;
}

export default function AllApps({ searchQuery = '' }: AllAppsProps) {
  const sessioin = useSession();
  const context = useAppsCotnext();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: 'apps',
    queryFn: () => getApps(axiosAuth),
  });
  const updateMutaion = useMutation(updateAppRecentStatus);
  const toggleFavoriteMutation = useMutation(toggleAppFavorite, {
    onSuccess: () => {
      // Refetch apps to update the favorite status
      queryClient.invalidateQueries('apps');
    },
  });

  // Filter function for case-insensitive search
  const filterApps = (apps: { app: AppModel; isFavorited?: boolean }[]) => {
    if (!searchQuery.trim()) {
      return apps;
    }
    const query = searchQuery.toLowerCase();
    return apps.filter((item) => {
      const appName = (item.app.name ?? '').toLowerCase();
      const appDescription = (item.app.description ?? '').toLowerCase();
      const appType = (item.app.type ?? '').toLowerCase();
      return (
        appName.includes(query) ||
        appDescription.includes(query) ||
        appType.includes(query)
      );
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isSuccess) {
    const sortedData = filterApps(
      (data ?? []).filter((a: any) => a.updatedAt !== undefined)
    )
      .slice()
      .sort(
        (
          a: { app: AppModel; updatedAt?: Date; isFavorited?: boolean },
          b: { app: AppModel; updatedAt?: Date; isFavorited?: boolean }
        ) => {
          // First, sort by isFavorited (favorited items first)
          if (a.isFavorited && !b.isFavorited) return -1;
          if (!a.isFavorited && b.isFavorited) return 1;
          // Then sort by date (newest first)
          const dateA = new Date(a.updatedAt ?? 0).getTime();
          const dateB = new Date(b.updatedAt ?? 0).getTime();
          return dateB - dateA;
        }
      );
    return (
      <>
        {/* recent apps */}
        <div className="mb-8 flex flex-col gap-2">
          <div className="mb-4 text-xl font-semibold text-black">
            Recent Apps
          </div>
          <div className="grid w-full grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {sortedData.map((e: { app: AppModel; isFavorited?: boolean }) => {
              return (
                <div
                  key={e.app._id}
                  className="cursor-pointer"
                  onClick={() =>
                    handleAppClick(e.app, axiosAuth, updateMutaion)
                  }
                >
                  <div className="relative flex h-[100px] w-full items-start justify-between overflow-hidden rounded-[18px] bg-white p-[6px] shadow-primary-shadow hover:border-1 hover:border-primary-300/80 hover:shadow-primary-hover sm:max-w-[300px]">
                    <img
                      src={getAppLogo({ logoType: e.app.type })}
                      alt="logo"
                      className="h-full"
                    />
                    <div className="ml-2 w-full py-1">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                          <div className="text-base font-semibold text-black">
                            {e.app.name ?? ''}
                          </div>
                          <div className="text-xs font-normal text-[#616161]">
                            {e.app.description ?? ''}
                          </div>
                        </div>
                        <div
                          className="text-right"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleFavoriteMutation.mutate({
                              axiosAuth,
                              appId: e.app._id,
                            });
                          }}
                        >
                          <AiFillStar
                            className={`h-[25px] w-[25px] ${e.isFavorited ? 'text-primary-500' : 'text-gray-400'}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="mb-4 text-xl font-semibold text-black">View All</div>
          <div className="grid w-full grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filterApps(data ?? [])
              .slice()
              .sort(
                (
                  a: { app: AppModel; isFavorited?: boolean },
                  b: { app: AppModel; isFavorited?: boolean }
                ) => {
                  // First, sort by isFavorited (favorited items first)
                  if (a.isFavorited && !b.isFavorited) return -1;
                  if (!a.isFavorited && b.isFavorited) return 1;
                  return 0;
                }
              )
              .map((e: { app: AppModel; isFavorited?: boolean }) => {
                return (
                  <div
                    key={e.app._id}
                    className="cursor-pointer"
                    onClick={() =>
                      handleAppClick(e.app, axiosAuth, updateMutaion)
                    }
                  >
                    <div className="relative flex h-[100px] w-full items-start justify-between overflow-hidden rounded-[18px] bg-white p-[6px] shadow-primary-shadow hover:border-1 hover:border-primary-300/80 hover:shadow-primary-hover sm:max-w-[300px]">
                      <img
                        src={getAppLogo({ logoType: e.app.type })}
                        alt="logo"
                        className="h-full"
                      />
                      <div className="ml-2 w-full py-1">
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col gap-1">
                            <div className="text-base font-semibold text-black">
                              {e.app.name ?? ''}
                            </div>
                            <div className="text-xs font-normal text-[#616161]">
                              {e.app.description ?? ''}
                            </div>
                          </div>
                          <div
                            className="text-right"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleFavoriteMutation.mutate({
                                axiosAuth,
                                appId: e.app._id,
                              });
                            }}
                          >
                            <AiFillStar
                              className={`h-[25px] w-[25px] ${e.isFavorited ? 'text-primary-500' : 'text-gray-400'}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </>
    );
  }

  if (isError) {
    return <>Error</>;
  }
  return <></>;
}

export const handleAppClick = (
  app: { type: string; _id?: string },
  axiosAuth: any,
  updateMutaion: any
) => {
  const { type, _id = '' } = app;

  // Trigger mutation for allowed types
  const typesToUpdate = ['JSA', 'TS', 'SR', 'AM', 'SH'];
  if (typesToUpdate.includes(type)) {
    updateMutaion.mutate({
      axiosAuth,
      appId: _id,
    });
  }

  // Navigate based on type
  const routes: Record<string, string> = {
    JSA: `/user/apps/jsa/${_id}`,
    TS: `/user/apps/timesheets/${_id}`,
    SR: `/user/apps/sr/${_id}`,
    AM: `/user/apps/am/${_id}`,
    SH: `/user/apps/sh/${_id}`,
  };

  const targetRoute = routes[type];
  if (targetRoute) {
    const fullUrl = window.location.origin + targetRoute;
    window.open(fullUrl, '_self');
  }
};
