import { AppModel, getApps } from '@/app/(main)/(user-panel)/user/apps/api';
import {
  createProject,
  updateProject,
} from '@/app/(main)/(user-panel)/user/projects/api';
import { useProjectCotnext } from '@/app/(main)/(user-panel)/user/projects/context';
import { PROJECTACTIONTYPE } from '@/app/helpers/user/enums';
import { AppWithRole } from '@/app/helpers/user/states';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';
import Loader from '@/components/DottedLoader/loader';
import { Search } from '@/components/Form/search';
import CustomHr from '@/components/Ui/CustomHr';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
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

import { MdArrowDropDown } from 'react-icons/md';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const PinAppModal = ({
  projectId,
  hideNavigation = false,
  onSyncNavigation,
}: {
  projectId: string | undefined;
  hideNavigation?: boolean;
  onSyncNavigation?: (payload: {
    onSubmit: () => void;
    isSubmitting: boolean;
    submitLabel: string;
  }) => void;
}) => {
  const context = useProjectCotnext();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const router = useRouter();
  const [searchIndividual, setSearchIndividual] = useState('');
  const axiosAuth = useAxiosAuth();

  // Get projectId from prop, context projectDetail, or fallback to empty string
  const currentProjectId = projectId || context.state.projectDetail?._id || '';

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: 'apps',
    queryFn: () => getApps(axiosAuth),
  });

  const createProjectMutation = useMutation(createProject, {
    onSuccess: () => {
      queryClient.invalidateQueries('projects');
      queryClient.invalidateQueries('assitant');
    },
  });
  const updateProjectMutation = useMutation(updateProject, {
    onSuccess: () => {
      queryClient.invalidateQueries('projects');
      if (currentProjectId) {
        queryClient.invalidateQueries(`projectDetail${currentProjectId}`);
      }
      queryClient.invalidateQueries('assitant');
    },
  });

  const handleSubmit = () => {
    if (context.state.isProjectEditing) {
      if (!currentProjectId) {
        console.error('Project ID is required for updating project');
        return;
      }

      // Send users with roles from frontend (user can set Owner/Contributor via dropdown)
      const users = (context.state.users ?? [])
        .filter((u) => u.user !== session?.user.user._id) // Creator is handled by backend
        .map((u) => ({
          user: u.user,
          role: u.role || 'Contributor',
        }));

      const appIds = context.state.app ?? [];

      const dueDateMode =
        context.state.dueDateMode ||
        (context.state.date ? 'CUSTOM' : 'NO_DUE_DATE');

      updateProjectMutation.mutate({
        id: currentProjectId,
        data: {
          name: context.state.payload?.name ?? '',
          reference: context.state.payload?.reference,
          customer: context.state.payload?.customer?.value ?? '',
          description: context.state.payload?.description,
          address: context.state.payload?.address,
          color: context.state.color ?? '#EB8357',
          dueDateMode: dueDateMode,
          dueDate:
            dueDateMode === 'CUSTOM' && context.state.date
              ? context.state.date.toISOString()
              : undefined,
          visibility: context.state.projectType ?? 'private',
          users,
          appIds: appIds,
        },
        axiosAuth: axiosAuth,
      });
    } else {
      // Send users with roles from frontend (user can set Owner/Contributor via dropdown)
      const users = (context.state.users ?? [])
        .filter((u) => u.user !== session?.user.user._id) // Creator is handled by backend
        .map((u) => ({
          user: u.user,
          role: u.role || 'Contributor',
        }));

      const appIds = context.state.app ?? [];

      const dueDateMode =
        context.state.dueDateMode ||
        (context.state.date ? 'CUSTOM' : 'NO_DUE_DATE');

      const payload = {
        name: context.state.payload?.name ?? '',
        reference: context.state.payload?.reference,
        customer: context.state.payload?.customer?.value ?? '',
        description: context.state.payload?.description,
        address: context.state.payload?.address,
        color: context.state.color ?? '#EB8357',
        dueDateMode: dueDateMode,
        dueDate:
          dueDateMode === 'CUSTOM' && context.state.date
            ? context.state.date.toISOString()
            : undefined,
        visibility: context.state.projectType ?? 'private',
        users,
        appIds: appIds,
      };
      console.log('payload', payload);
      createProjectMutation.mutate({
        data: payload,
        axiosAuth: axiosAuth,
      });
    }
  };
  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;

  useEffect(() => {
    onSyncNavigation?.({
      onSubmit: () => handleSubmitRef.current(),
      isSubmitting:
        createProjectMutation.isLoading || updateProjectMutation.isLoading,
      submitLabel: context.state.isProjectEditing
        ? 'Update Project'
        : 'Create Project',
    });
  }, [
    onSyncNavigation,
    context.state.isProjectEditing,
    createProjectMutation.isLoading,
    updateProjectMutation.isLoading,
  ]);

  // add or remove pin apps

  const handlePinAppSelect = (appId: string) => {
    if ((context.state.app ?? []).findIndex((app) => app === appId) !== -1) {
      context.dispatch({ type: PROJECTACTIONTYPE.DESELECT_APP, app: appId });
    } else {
      context.dispatch({ type: PROJECTACTIONTYPE.SELECT_APP, app: appId });
    }
  };

  const isAppSelected = (Id: string) =>
    context.state.app?.some((app) => app == Id);

  useEffect(() => {
    if (createProjectMutation.isSuccess && createProjectMutation.data) {
      const response = createProjectMutation.data;

      // Show warning if present
      if (response.warning) {
        toast.warning(response.warning);
      }

      // Close modal
      context.dispatch({ type: PROJECTACTIONTYPE.TOGGLE });

      // Redirect to project view page
      if (response.project?._id) {
        router.push(`/user/projects/${response.project._id}`);
      }
    }
    if (updateProjectMutation.isSuccess) {
      context.dispatch({ type: PROJECTACTIONTYPE.EDITTOGGLE });
    }
  }, [
    createProjectMutation.isSuccess,
    createProjectMutation.data,
    updateProjectMutation.isSuccess,
    context,
    router,
  ]);

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader />
      </div>
    );
  }

  const filteredUsers = isSuccess
    ? ((data ?? []).filter((e: { app: AppModel }) =>
        `${e?.app.name}`.toLowerCase().includes(searchIndividual.toLowerCase())
      ) ?? [])
    : [];

  // Check if all filtered apps are selected
  const allSelected =
    filteredUsers && filteredUsers.length > 0
      ? filteredUsers.every((e: { app: AppModel }) => isAppSelected(e.app._id))
      : false;

  // Handle select all toggle
  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all filtered apps
      filteredUsers.forEach((e: { app: AppModel }) => {
        if (isAppSelected(e.app._id)) {
          context.dispatch({
            type: PROJECTACTIONTYPE.DESELECT_APP,
            app: e.app._id,
          });
        }
      });
    } else {
      // Select all filtered apps
      filteredUsers.forEach((e: { app: AppModel }) => {
        if (!isAppSelected(e.app._id)) {
          context.dispatch({
            type: PROJECTACTIONTYPE.SELECT_APP,
            app: e.app._id,
          });
        }
      });
    }
  };

  if (isSuccess) {
    return (
      <>
        <div>
          <div className="max-h-[500px] space-y-4 overflow-y-auto">
            <div className="mr-6 flex items-center justify-between">
              <div className="w-[250px]">
                <Search
                  inputRounded={true}
                  type="search"
                  className="rounded-md bg-[#eeeeee] placeholder:text-[#616161]"
                  name="search"
                  placeholder="Search Apps"
                  onChange={(e) => setSearchIndividual(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <CustomBlueCheckBox
                  checked={allSelected}
                  onChange={handleSelectAll}
                />
              </div>
            </div>
            <div className="h-[462px] overflow-y-auto">
              {filteredUsers.map((e: { app: AppModel }) => {
                return (
                  <div key={e.app._id}>
                    <div className="mx-2 mb-2 flex items-center justify-between rounded-xl border-2 border-gray-300/80 p-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={getAppLogo({ logoType: e.app.type })}
                          alt="logo"
                          className="h-11 w-11 sm:h-12 sm:w-12"
                        />
                        <h2 className="text-sm font-normal text-[#212121] sm:text-base">
                          {e.app.name}
                        </h2>
                      </div>

                      <div className="pr-2">
                        <CustomBlueCheckBox
                          checked={isAppSelected(e.app._id) || false}
                          onChange={() => {
                            handlePinAppSelect(e.app._id);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {!hideNavigation && (
            <>
              <CustomHr />
              <div className="my-4 flex justify-center gap-3 text-center">
                <button
                  className="h-11 w-1/2 rounded-lg border-2 border-primary-500 text-sm text-primary-500 sm:w-36 sm:text-base"
                  type="button"
                  onClick={() =>
                    context.dispatch({
                      type: PROJECTACTIONTYPE.CURRENTMODAL,
                      currentSection: 'members',
                    })
                  }
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="h-11 w-1/2 rounded-lg bg-primary-500 text-sm text-white hover:bg-primary-600/80 sm:w-36 sm:text-base"
                  onClick={() => handleSubmit()}
                >
                  {context.state.isProjectEditing ? (
                    <>
                      {updateProjectMutation.isLoading ? <Loader /> : <> Update Project</>}
                    </>
                  ) : (
                    <>
                      {createProjectMutation.isLoading ? <Loader /> : <> Create Project</>}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </>
    );
  }
  return <></>;
};
export { PinAppModal };
