import { useProjectCotnext } from '@/app/(main)/(user-panel)/user/projects/context';
import { Avatar } from '@nextui-org/react';
import { Button } from '../Buttons';
import { TasksTab } from './Tasks';
import Image from 'next/image';
import { dateFormat } from '@/app/helpers/dateFormat';
import clsx from 'clsx';
import { useMutation, useQuery } from 'react-query';
import { getAddedProjectApps } from '@/app/(main)/(user-panel)/user/projects/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { ProjectDetail } from '@/app/type/projects';
import { updateAppRecentStatus } from '@/app/(main)/(user-panel)/user/apps/api';
import { useRouter } from 'next/navigation';
const getAppLogo = ({ logoType }: { logoType: string }) => {
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
      break;
  }
};

export function OverView({
  projectDetail,
}: {
  projectDetail: ProjectDetail | undefined;
}) {
  const { state, dispatch } = useProjectCotnext();
  const updateMutaion = useMutation(updateAppRecentStatus);
  const router = useRouter();
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
  return (
    <div className="h-[calc(var(--app-vh)_-_232px)] overflow-y-scroll p-2 scrollbar-hide">
      <div className="flex w-full flex-wrap justify-between gap-4 lg:flex-nowrap">
        <div
          className="flex h-[280px] w-full flex-col justify-around rounded-2xl bg-white px-6 py-4 lg:w-2/3"
          style={{ boxShadow: '0px 2px 8px 0px #00000033' }}
        >
          <div>
            <p className="text-sm font-normal text-[#616161]">Project Name</p>

            <p className="max-w-full truncate text-xl font-semibold text-black">
              {projectDetail?.name}
            </p>
          </div>

          <div className="pb-1">
            <p className="max-w-full truncate text-sm font-normal text-[#616161]">
              Address
            </p>

            <p className="text-base font-normal text-[#212121]">
              {projectDetail?.address}
            </p>
          </div>
          <div>
            <p className="max-w-full truncate text-sm font-normal text-[#616161]">
              Short Description
            </p>

            <p className="max-w-full truncate text-base font-normal text-[#000000]">
              {projectDetail?.description}
            </p>
          </div>
        </div>

        <div
          className="flex h-[280px] w-full justify-between rounded-2xl bg-white px-6 py-4 lg:w-1/3"
          style={{ boxShadow: '0px 2px 8px 0px #00000033' }}
        >
          <div className="flex w-1/2 flex-col items-start justify-between">
            <div className=" ">
              <p className="text-sm font-normal text-[#616161]">Customer</p>
              <p className="mt-1 flex items-center gap-2 truncate pr-2 text-sm font-normal text-[#616161]">
                <Image
                  src={'/user.svg'}
                  className={clsx('rounded-full border-2')}
                  alt={` pic`}
                  width={40}
                  height={40}
                />
                {projectDetail?.customer}
              </p>
            </div>
            <div className=" ">
              <p className="text-sm font-normal text-[#616161]">Due Date</p>
              <p className="text-sm font-semibold text-[#1E1E1E]">
                {dateFormat(projectDetail?.date?.toString() ?? '')}
              </p>
            </div>
            <div className=" ">
              <p className="text-sm font-normal text-[#616161]">Project ID</p>
              <p className="text-sm font-semibold text-[#1E1E1E]">
                {projectDetail?.projectId}
              </p>
            </div>
            <div className=" ">
              <p className="text-sm font-normal text-[#616161]">Visibility</p>
              <p className="text-sm font-semibold text-[#1E1E1E]">
                {projectDetail?.projectType}
              </p>
            </div>
          </div>

          <div className="flex w-1/2 flex-col items-start justify-between">
            <div className=" ">
              <p className="text-sm font-normal text-[#616161]">Created By</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-normal text-[#616161] xl:text-base">
                <Image
                  src={'/user.svg'}
                  className={clsx('rounded-full border-2')}
                  alt={` pic`}
                  width={40}
                  height={40}
                />
                {'Me'}
              </p>
            </div>
            <div className=" ">
              <p className="text-sm font-normal text-[#616161]">Created</p>
              <p className="text-sm font-semibold text-[#1E1E1E]">
                {dateFormat(projectDetail?.createdAt?.toString() ?? '')}
              </p>
            </div>
            <div className=" ">
              <p className="text-sm font-normal text-[#616161]">Reference</p>
              <p className="text-sm font-semibold text-[#1E1E1E]">
                {projectDetail?.reference}
              </p>
            </div>
            <div className=" ">
              <p className="text-sm font-normal text-[#616161]">Members</p>
              <p className="text-sm font-semibold text-[#1E1E1E]">
                {(projectDetail?.users ?? []).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-between gap-4 md:flex-nowrap">
        <div className="w-full lg:w-2/3">
          <div className="w-full rounded-lg bg-white">
            <TasksTab overview={true} projectDetail={projectDetail} />
          </div>
        </div>

        <div
          className="w-full rounded-2xl px-4 py-4 lg:w-1/3 lg:px-8"
          style={{ boxShadow: '0px 2px 8px 0px #00000033' }}
        >
          <div className="">
            <div className="mt-3 flex justify-between">
              <h1 className="max-w-full truncate font-semibold">Pinned Apps</h1>
            </div>
            {(apps ?? []).map((e) => {
              return (
                <div
                  key={e._id}
                  className="mt-2 flex cursor-pointer flex-wrap items-center rounded-md border p-1 shadow-sm md:flex-nowrap"
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
                    if (e.type === 'JSA') {
                      router.push(`/user/apps/jsa/${e._id}`);
                    } else if (e.type == 'TS') {
                      router.push(`/user/apps/timesheets/${e._id}`);
                    } else if (e.type === 'SR') {
                      router.push(`/user/apps/sr/${e._id}`);
                    } else if (e.type === 'AM') {
                      router.push(`/user/apps/am/${e._id}`);
                    } else if (e.type === 'SH') {
                      router.push(`/user/apps/sh/${e._id}`);
                    }
                  }}
                >
                  <img
                    src={getAppLogo({ logoType: e.type ?? '' }) ?? ''}
                    alt="logo"
                    className="h-[50px] w-[50px]"
                  />
                  <h1 className="ml-6 text-base font-semibold">{e.name}</h1>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
