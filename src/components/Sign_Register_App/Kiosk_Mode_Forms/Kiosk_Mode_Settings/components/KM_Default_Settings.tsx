import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import { Button } from '@/components/Buttons';
import Loader from '@/components/DottedLoader/loader';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import {
  getAllAppProjects,
  getAllOrgUsers,
} from '@/app/(main)/(user-panel)/user/apps/api';

import {
  deleteTimeSheet,
  getTimesheetAppSetting,
  updateTimeSheet,
  updateTimesheetAppSetting,
} from '@/app/(main)/(user-panel)/user/apps/timesheets/api';
import { toast } from 'react-hot-toast';
import { useTimeSheetAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/timesheets/timesheet_context';
import { useSRAppCotnext } from '@/app/(main)/(user-panel)/user/apps/sr/sr_context';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Input } from '@/components/Form/Input';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { AddedTeamDetailModel } from '@/app/type/addedTeamDetailModel';
import { getTeams } from '@/app/(main)/(org-panel)/organization/teams/api';
import {
  getAllSitesByProjectIds,
  getKioskSetting,
  updateKioskSetting,
} from '@/app/(main)/(user-panel)/user/apps/sr/api';

export function KMDefaultSettings() {
  const axiosAuth = useAxiosAuth();

  const [selectedProject, setProject] = useState<string[]>([]);
  const [selectedSite, setSite] = useState<string[]>([]);
  const [notifyPeople, setPeople] = useState<string[]>([]);
  const [notifyMeWhenSignIn, setNotifyMeWhenSignIn] = useState(false);
  const [notifyMeWhenSignOut, setNotifyMeWhenSignOut] = useState(false);
  const [forceSelfie, setSelfie] = useState(false);

  const selectedProjectRef = useRef<string[]>(selectedProject);
  useEffect(() => {
    selectedProjectRef.current = selectedProject;
  }, [selectedProject]);

  const { data: allProjects } = useQuery({
    queryKey: 'allUserAssignedProjects',
    queryFn: () => getAllAppProjects(axiosAuth),
    refetchOnWindowFocus: false,
  });
  const { data: sites } = useQuery({
    queryKey: ['user/app/listofSites', selectedProject],
    queryFn: () =>
      getAllSitesByProjectIds(
        axiosAuth,
        (selectedProject ?? [])?.map((p) => p.toString())
      ),
    refetchOnWindowFocus: false,
    enabled: Array.isArray(selectedProject) && selectedProject.length > 0,
  });
  const { data: users } = useQuery({
    queryKey: 'listofUsersForSRKioskDefault',
    queryFn: () => getAllOrgUsers(axiosAuth),
    refetchOnWindowFocus: false,
  });
  const { data: setting, isLoading: detailLoading } = useQuery({
    queryKey: 'kioskSetting',
    queryFn: () => getKioskSetting(axiosAuth),
  });
  useEffect(() => {
    if (setting) {
      const toId = (v: any) =>
        typeof v === 'string' ? v : v?.toString?.() ?? v?._id?.toString?.() ?? '';
      const projectIds = Array.isArray(setting.selectedProject)
        ? setting.selectedProject.map(toId).filter(Boolean)
        : setting.selectedProject
          ? [toId(setting.selectedProject)]
          : [];
      const siteId = setting.selectedSite
        ? toId(setting.selectedSite)
        : '';
      setProject(projectIds);
      setSite(siteId ? [siteId] : []);
      setSelfie(setting.forceSelfie ?? false);
      setPeople(setting.notifyPeople ?? []);
      setNotifyMeWhenSignIn(setting.notifyMeWhenSignIn ?? false);
      setNotifyMeWhenSignOut(setting.notifyMeWhenSignOut ?? false);
    }
  }, [setting]);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const queryClient = useQueryClient();
  const updateSettingMutation = useMutation(updateKioskSetting, {
    onSuccess: () => {
      toast.success('setting saved');

      queryClient.invalidateQueries('kioskSetting');
    },
  });

  const handleSubmit = ({ data }: { data: any }) => {
    if (!setting?._id) return;
    updateSettingMutation.mutate({
      axiosAuth,
      data,
      id: setting._id,
    });
  };
  return (
    <>
      <div className="mx-4 my-4 flex max-h-[668px] w-4/6 flex-col overflow-auto rounded-lg border-2 border-[#EEEEEE] p-6 shadow scrollbar-hide md:w-5/6">
        <div className="flex flex-col">
          <h2 className="mb-1 text-sm font-semibold md:text-xl">
            Default Settings
          </h2>
          <p className="text-[10px] font-normal text-[#616161] md:text-sm">
            These settings are specific for this user account / logged in device
            only.
          </p>
        </div>

        {/* Notification recipents  */}
        <div className="mb-5 flex flex-col sm:w-full lg:w-1/2">
          <div className="mb-4 mt-8 flex flex-col justify-between pr-10">
            <h2 className="mb-1 text-sm font-semibold">Assigned Site</h2>

            <CustomSearchSelect
              label="1. Filter Site by Project"
              data={[
                {
                  label: 'All',
                  value: 'all',
                },
                ...(allProjects ?? []).flatMap((project) => {
                  return [
                    {
                      label: project.name ?? '',
                      value: project._id,
                    },
                  ];
                }),
              ]}
              onSelect={(values) => {
                setProject(values);
                if (setting?._id && (values ?? []).length > 0) {
                  handleSubmit({
                    data: {
                      selectedProject: Array.isArray(values) ? values : [values],
                    },
                  });
                }
              }}
              selected={selectedProject}
              hasError={false}
              showImage={false}
              isOpen={openDropdown === 'dropdown1'}
              onToggle={() => handleToggle('dropdown1')}
            />
          </div>
          <div className="mb-3 ml-8 mt-4 flex flex-col justify-between pr-10">
            <CustomSearchSelect
              label="2. Selected Site"
              data={[
                ...(sites ?? []).flatMap((site) => {
                  return [
                    {
                      label: site.siteName ?? '',
                      value: site._id,
                      photo: undefined,
                    },
                  ];
                }),
              ]}
              onSelect={(values) => {
                setSite(values);
                if ((values ?? []).length > 0 && setting?._id) {
                  const projectToSave = selectedProjectRef.current ?? selectedProject;
                  handleSubmit({
                    data: {
                      selectedProject: Array.isArray(projectToSave) ? projectToSave : [projectToSave],
                      selectedSite: values[0],
                    },
                  });
                }
              }}
              selected={selectedSite}
              hasError={false}
              showImage={false}
              multiple={false}
              isOpen={openDropdown === 'dropdown2'}
              onToggle={() => handleToggle('dropdown2')}
            />
          </div>
        </div>
        {/* Notification Methods  */}
        <div className="mt-4 flex flex-col">
          <h2 className="mb-1 text-sm font-semibold">Force ‘Selfie’ Photo</h2>
          <div className="mt-2 grid grid-cols-[auto,1fr] items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
              name="option"
              value="1"
              checked={forceSelfie}
              onChange={() => {
                handleSubmit({
                  data: {
                    forceSelfie: !forceSelfie,
                  },
                });
                setSelfie(!forceSelfie);
              }}
            />
            <div className="grid">
              <span>Yes</span>
            </div>
          </div>
        </div>

        {/* Notify People  */}
        <div className="mb-8 mt-4 flex flex-col">
          <div className="mb-2 flex flex-col sm:w-full lg:w-1/2">
            <div className="mt-8 flex flex-col justify-between pr-10">
              <h2 className="mb-4 text-sm font-semibold">Notify People</h2>
              <div className="">
                <CustomSearchSelect
                  label="Select People"
                  data={[
                    {
                      label: 'All',
                      value: 'all',
                      photo: undefined,
                    },
                    ...(users ?? []).flatMap((user) => {
                      return [
                        {
                          label: user.email ?? '',
                          value: user._id,
                          photo: undefined,
                        },
                      ];
                    }),
                  ]}
                  onSelect={(values) => {
                    setPeople(values);
                    if ((values ?? []).length > 0) {
                      handleSubmit({
                        data: {
                          notifyPeople: values,
                        },
                      });
                    }
                  }}
                  selected={setting?.notifyPeople}
                  hasError={false}
                  showImage={false}
                  isOpen={openDropdown === 'dropdown3'}
                  onToggle={() => handleToggle('dropdown3')}
                />
              </div>
            </div>
          </div>
          <p className="text-[10px] font-normal text-[#616161] md:text-sm">
            Selected people will be emailed and or notified via Tiki
            Notifications if they are a registered user.
          </p>
        </div>

        {/* Notify Me  */}
        <div className="mt-4 flex flex-col">
          <h2 className="mb-1 text-sm font-semibold">Notify when</h2>
          <div className="mt-2 grid grid-cols-[auto,1fr] items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
              name="option"
              value="1"
              checked={notifyMeWhenSignIn}
              onChange={() => {
                handleSubmit({
                  data: {
                    notifyMeWhenSignIn: !notifyMeWhenSignIn,
                  },
                });
                setNotifyMeWhenSignIn(!notifyMeWhenSignIn);
              }}
            />
            <div className="grid">
              <span>New ‘Sign in’ on site</span>
            </div>
          </div>
          <div className="mb-32 mt-2 grid grid-cols-[auto,1fr] items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
              name="option"
              value="1"
              checked={notifyMeWhenSignOut}
              onChange={() => {
                handleSubmit({
                  data: {
                    notifyMeWhenSignOut: !notifyMeWhenSignOut,
                  },
                });
                setNotifyMeWhenSignOut(!notifyMeWhenSignOut);
              }}
            />
            <div className="grid">
              <span>New ‘Sign out’ on site</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
