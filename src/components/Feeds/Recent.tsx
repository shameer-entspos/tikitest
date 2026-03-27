import {
  getAllProjectList,
  getRecentlyProjectList,
} from '@/app/(main)/(user-panel)/user/projects/api';
import {
  ProjectContext,
  ProjectContextProps,
  projectinitialState,
  projectReducer,
  useProjectCotnext,
} from '@/app/(main)/(user-panel)/user/projects/context';
import { PROJECTACTIONTYPE } from '@/app/helpers/user/enums';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { formatDistance, startOfDay, startOfToday } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useReducer } from 'react';

import { useQuery } from 'react-query';
import Loader from '../DottedLoader/loader';
import Link from 'next/link';

function Recent() {
  const router = useRouter();
  const axiosAuth = useAxiosAuth();
  const { data, isLoading } = useQuery({
    queryKey: 'projects',
    queryFn: () => getRecentlyProjectList(axiosAuth),
  });
  const [state, dispatch] = useReducer(projectReducer, projectinitialState);
  const contextValue: ProjectContextProps = {
    state,
    dispatch,
  };
  if (isLoading) {
    return (
      <div className="grid h-60 w-full place-content-center">
        <Loader />
      </div>
    );
  }

  return (
    <ProjectContext.Provider value={contextValue}>
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-center justify-between px-3">
          <h1 className="text-start text-[20px] font-semibold text-black">
            Recent Projects
          </h1>
          <span className="text-[14px] font-medium text-secondary-500">
            Due
          </span>
        </div>

        {(data?.projects ?? []).map((p) => {
          return (
            <Link href={'/user/projects/' + p._id} key={p._id} legacyBehavior>
              <div
                // onClick={() => {
                //   router.replace(`/user/projects`);
                // }}
                className="flex cursor-pointer justify-between rounded-lg bg-white px-3 py-5 xl:px-6 xl:py-4"
                style={{ boxShadow: '0px 2px 8px 0px #00000033' }}
              >
                <div className="flex flex-col justify-between gap-2">
                  <span className="text-sm font-medium text-black xl:text-[14px]">{`${p.name}`}</span>
                  <span className="truncate text-xs font-normal text-[#616161] xl:text-[14px]">
                    Ref:{`${p.reference}`}
                  </span>
                </div>
                <span className="mt-1 truncate text-xs font-normal text-[#616161]">
                  {`${formatDistance(new Date(), new Date(p.updatedAt ?? ''))}`}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </ProjectContext.Provider>
  );
}

export default Recent;
