import { useProjectCotnext } from '@/app/(main)/(user-panel)/user/projects/context';
import {
  AppModel,
  getApps,
  updateAppRecentStatus,
} from '@/app/(main)/(user-panel)/user/apps/api';
import { Avatar } from '@nextui-org/react';
import { useState } from 'react';
import { Button } from '../Buttons';
import { Search } from '../Form/search';
import { AiFillStar } from 'react-icons/ai';
import { useMutation, useQuery } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useRouter } from 'next/navigation';
import { getAddedProjectApps } from '@/app/(main)/(user-panel)/user/projects/api';
import { ProjectDetail } from '@/app/type/projects';
export const getAppLogo = ({ logoType }: { logoType: string }): string => {
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
export function AppsTab({
  projectDetail,
}: {
  projectDetail: ProjectDetail | undefined;
}) {
  const { state, dispatch } = useProjectCotnext();
  const axiosAuth = useAxiosAuth();
  const { data: apps } = useQuery({
    queryKey: `projectapps${projectDetail?._id ?? ''}`,
    queryFn: () => {
      if (!projectDetail?._id) {
        throw new Error('Project ID is required');
      }
      return getAddedProjectApps(axiosAuth, projectDetail._id);
    },
    enabled: !!projectDetail?._id,
  });
  const [searchIndividual, setSearchIndividual] = useState('');
  var filteredApps =
    (apps ?? []).filter((e) =>
      `${e?.name}`.toLowerCase().includes(searchIndividual.toLowerCase())
    ) ?? [];
  const updateMutaion = useMutation(updateAppRecentStatus);
  const router = useRouter();
  return (
    <>
      <div
        className="h-full min-h-[500px] w-full max-w-[1360px] rounded-xl bg-white px-4 py-2 lg:px-8 lg:py-4"
        style={{ boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px' }}
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="flex w-full items-center lg:w-1/5">
              <div className="font-bold">Project Apps</div>
            </div>
            <div className="flex">
              <Search
                className="h-[44px] min-w-[241px] bg-[#EEEEEE] placeholder:text-[#616161]"
                inputRounded={true}
                type="search"
                name="search"
                onChange={(e) => setSearchIndividual(e.target.value)}
                placeholder="Search Apps"
              />
            </div>
          </div>

          <div className="mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
            {filteredApps.map((e: AppModel) => {
              return (
                <div
                  key={e._id}
                  className="cursor-pointer"
                  onClick={() => {
                    if (
                      e.type === 'JSA' ||
                      e.type === 'TS' ||
                      e.type === 'SR' ||
                      e.type === 'AM' ||
                      e.type === 'SH'
                    ) {
                      updateMutaion.mutate({
                        axiosAuth,
                        appId: e._id ?? '',
                      });
                    }
                    let url = '';
                    if (e.type === 'JSA') {
                      url = `/user/apps/jsa/${e._id}`;
                    } else if (e.type == 'TS') {
                      url = `/user/apps/timesheets/${e._id}`;
                    } else if (e.type === 'SR') {
                      url = `/user/apps/sr/${e._id}`;
                    } else if (e.type === 'AM') {
                      url = `/user/apps/am/${e._id}`;
                    } else if (e.type === 'SH') {
                      url = `/user/apps/sh/${e._id}`;
                    }
                    if (url) {
                      window.open(url, '_self', 'noopener,noreferrer');
                    }
                  }}
                >
                  <div
                    className="relative flex h-[100px] w-full items-start justify-between rounded-[18px] bg-white p-2 shadow md:max-w-[300px]"
                    style={{ boxShadow: '0px 2px 8px 0px #00000033' }}
                  >
                    <img
                      src={getAppLogo({ logoType: e.type })}
                      alt="logo"
                      className="h-full"
                    />
                    <div className="ml-2 w-full py-1">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                          <div className="text-base font-semibold text-black">
                            {e.name ?? ''}
                          </div>
                          <div className="text-xs font-normal text-[#616161]">
                            {e.description ?? ''}
                          </div>
                        </div>
                        <div className="text-right text-gray-500">
                          <AiFillStar className="h-[25px] w-[25px]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
