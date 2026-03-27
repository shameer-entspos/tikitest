'use client';

import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getTeams } from '../teams/api';
import { useFormik } from 'formik';
import { getGlobalPermission, updateGlobalPermission } from './api';
import toast from 'react-hot-toast';
import Loader from '@/components/DottedLoader/loader';

export default function Page() {
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string>('');
  const handleDropdown = (dropdownId: string) => {
    setOpenFilterDropdown(openFilterDropdown === dropdownId ? '' : dropdownId);
  };
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  // getGlobalPermission
  const { data: permission, isLoading } = useQuery({
    queryKey: 'gPermission',
    queryFn: () => getGlobalPermission(axiosAuth),
    refetchOnWindowFocus: false,
  });
  const { data: teams } = useQuery({
    queryKey: 'teams',
    queryFn: () => getTeams(axiosAuth),
    refetchOnWindowFocus: false,
  });

  // updateGlobalPermission
  const updateMutation = useMutation(updateGlobalPermission, {
    onSuccess: () => {
      toast.success('Global Permission Updated Successfully');
      queryClient.invalidateQueries('gPermission');
    },
  });
  const handleSave = (value: string, data: any) => {
    updateMutation.mutate({
      axiosAuth,
      id: permission?._id!,
      data: { [value]: data },
    });
  };

  if (isLoading) {
    return (
      <div className="fixed flex h-screen w-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      {/* Header  */}
      <div className="flex items-center justify-start gap-2">
        <img
          src="/svg/org/global_permission_logo.svg"
          alt="Global Permission"
        />
        <h1 className="text-xl font-bold text-[#1E1E1E]">
          Global Permissions & Access
        </h1>
      </div>
      {/* Subtitle  */}
      <span className="px-2 pt-2 text-sm text-[#616161]">
        Assign which teams have access to what functions.
      </span>

      {/* Model List  */}
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <div className="mb-96 flex max-w-[500px] flex-col">
          <div className="my-4">
            <CustomSearchSelect
              label="Global ‘Projects’ Admin Mode"
              data={[
                // {
                //   label: 'All Teams',
                //   value: 'all',
                // },
                ...(teams ?? []).map((team) => ({
                  label: team.name ?? '',
                  value: team._id,
                })),
              ]}
              showImage={false}
              multiple={true}
              showSearch={true}
              isOpen={openFilterDropdown === 'dropdown1'}
              onToggle={() => handleDropdown('dropdown1')}
              onSelect={(selected: any) => {
                handleSave('projects', selected);
              }}
              selected={permission?.projects ?? []}
              bg="bg-white"
              searchPlaceholder="Search Organization Teams"
              placeholder="Not Selected"
            />
          </div>
          <div className="my-4">
            <CustomSearchSelect
              label="Global ‘Tasks’ Admin Mode"
              data={[
                // {
                //   label: 'All Teams',
                //   value: 'all',
                // },
                ...(teams ?? []).map((team) => ({
                  label: team.name ?? '',
                  value: team._id,
                })),
              ]}
              showImage={false}
              multiple={true}
              showSearch={true}
              isOpen={openFilterDropdown === 'dropdown2'}
              onToggle={() => handleDropdown('dropdown2')}
              onSelect={(selected: any) => {
                handleSave('tasks', selected);
              }}
              selected={permission?.tasks ?? []}
              bg="bg-white"
              searchPlaceholder="Search Organization Teams"
              placeholder="Not Selected"
            />
          </div>
          <div className="my-4">
            <CustomSearchSelect
              label="Global ‘Apps’ Admin Mode"
              data={[
                // {
                //   label: 'All Teams',
                //   value: 'all',
                // },
                ...(teams ?? []).map((team) => ({
                  label: team.name ?? '',
                  value: team._id,
                })),
              ]}
              showImage={false}
              multiple={true}
              showSearch={true}
              isOpen={openFilterDropdown === 'dropdown3'}
              onToggle={() => handleDropdown('dropdown3')}
              onSelect={(selected: any) => {
                handleSave('apps', selected);
              }}
              selected={permission?.apps ?? []}
              bg="bg-white"
              searchPlaceholder="Search Organization Teams"
              placeholder="Not Selected"
            />
          </div>
          <div className="my-4">
            <CustomSearchSelect
              label="Contacts > Customer / Supplier (Add & Edit)"
              data={[
                // {
                //   label: 'All Teams',
                //   value: 'all',
                // },
                ...(teams ?? []).map((team) => ({
                  label: team.name ?? '',
                  value: team._id,
                })),
              ]}
              showImage={false}
              multiple={true}
              showSearch={true}
              isOpen={openFilterDropdown === 'dropdown4'}
              onToggle={() => handleDropdown('dropdown4')}
              onSelect={(selected: any) => {
                handleSave('contacts', selected);
              }}
              selected={permission?.contacts ?? []}
              bg="bg-white"
              searchPlaceholder="Search Organization Teams"
              placeholder="Not Selected"
            />
          </div>
          <div className="my-4">
            <CustomSearchSelect
              label="Contacts > Add External / Friend User"
              data={[
                // {
                //   label: 'All Teams',
                //   value: 'all',
                // },
                ...(teams ?? []).map((team) => ({
                  label: team.name ?? '',
                  value: team._id,
                })),
              ]}
              showImage={false}
              multiple={true}
              showSearch={true}
              isOpen={openFilterDropdown === 'dropdown5'}
              onToggle={() => handleDropdown('dropdown5')}
              onSelect={(selected: any) => {
                handleSave('externalFriends', selected);
              }}
              selected={permission?.externalFriends ?? []}
              bg="bg-white"
              searchPlaceholder="Search Organization Teams"
              placeholder="Not Selected"
            />
          </div>

          {/* <div className="my-4">
            <CustomSearchSelect
              label="Organization Settings > Manage Users"
              data={[
                {
                  label: 'All Teams',
                  value: 'all',
                },
                ...(teams ?? []).map((team) => ({
                  label: team.name ?? '',
                  value: team._id,
                })),
              ]}
              showImage={false}
              multiple={true}
              showSearch={true}
              isOpen={openFilterDropdown === 'dropdown5'}
              onToggle={() => handleDropdown('dropdown5')}
              onSelect={(selected: any) => {
                handleSave('manageusers', selected);
              }}
              selected={permission?.manageusers ?? []}
              bg="bg-white"
              searchPlaceholder="Search Organization Teams"
              placeholder="Not Selected"
            />
          </div> */}
          {/* <div className="my-4">
            <CustomSearchSelect
              label="Organization Settings > Manage Teams"
              data={[
                {
                  label: 'All Teams',
                  value: 'all',
                },
                ...(teams ?? []).map((team) => ({
                  label: team.name ?? '',
                  value: team._id,
                })),
              ]}
              showImage={false}
              multiple={true}
              showSearch={true}
              isOpen={openFilterDropdown === 'dropdown6'}
              onToggle={() => handleDropdown('dropdown6')}
              onSelect={(selected: any) => {
                handleSave('teams', selected);
              }}
              selected={permission?.teams ?? []}
              bg="bg-white"
              searchPlaceholder="Search Organization Teams"
              placeholder="Not Selected"
            />
          </div> */}
          {/* <div className="my-4">
            <CustomSearchSelect
              label="Organization Settings > App Store"
              data={[
                {
                  label: 'All Teams',
                  value: 'all',
                },
                ...(teams ?? []).map((team) => ({
                  label: team.name ?? '',
                  value: team._id,
                })),
              ]}
              showImage={false}
              multiple={true}
              showSearch={true}
              isOpen={openFilterDropdown === 'dropdown7'}
              onToggle={() => handleDropdown('dropdown7')}
              onSelect={(selected: any) => {
                handleSave('appstore', selected);
              }}
              selected={permission?.appstore ?? []}
              bg="bg-white"
              searchPlaceholder="Search Organization Teams"
              placeholder="Not Selected"
            />
          </div> */}
          {/* <div className="my-4">
            <CustomSearchSelect
              label="Organization Settings > Cloud Storage"
              bg="bg-white"
              data={[
                {
                  label: 'All Teams',
                  value: 'all',
                },
                ...(teams ?? []).map((team) => ({
                  label: team.name ?? '',
                  value: team._id,
                })),
              ]}
              showImage={false}
              multiple={true}
              showSearch={true}
              isOpen={openFilterDropdown === 'dropdown8'}
              onToggle={() => handleDropdown('dropdown8')}
              onSelect={(selected: any) => {
                handleSave('cloudstorage', selected);
              }}
              selected={permission?.cloudstorage ?? []}
              searchPlaceholder="Search Organization Teams"
              placeholder="Not Selected"
            />
          </div> */}
          {/* <div className="my-4">
            <CustomSearchSelect
              label="Organization Settings > Billing & Licenses"
              bg="bg-white"
              data={[
                {
                  label: 'All Teams',
                  value: 'all',
                },
                ...(teams ?? []).map((team) => ({
                  label: team.name ?? '',
                  value: team._id,
                })),
              ]}
              showImage={false}
              multiple={true}
              showSearch={true}
              isOpen={openFilterDropdown === 'dropdown9'}
              onToggle={() => handleDropdown('dropdown9')}
              onSelect={(selected: any) => {
                handleSave('billing', selected);
              }}
              selected={permission?.billing ?? []}
              searchPlaceholder="Search Organization Teams"
              placeholder="Not Selected"
            />
          </div> */}
        </div>
      </div>
    </div>
  );
}
