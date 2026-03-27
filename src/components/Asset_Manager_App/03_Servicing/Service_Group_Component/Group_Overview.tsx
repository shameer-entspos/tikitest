import { useAssetManagerAppsContext } from '@/app/(main)/(user-panel)/user/apps/am/am_context';
import {
  getCustomersList,
  updateGroupService,
} from '@/app/(main)/(user-panel)/user/apps/am/api';
import { getAllOrgUsers } from '@/app/(main)/(user-panel)/user/apps/api';

import { GroupService } from '@/app/type/service_group';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export default function GroupOverViewSection({
  model,
}: {
  model: GroupService | undefined;
}) {
  const [selectedManagers, setSelectedManagers] = useState<string[]>([
    ...(model?.managers ?? []).map((manager) => manager._id),
  ]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };
  const { state, dispatch } = useAssetManagerAppsContext();
  const axiosAuth = useAxiosAuth();

  const queryClient = useQueryClient();
  const updateGroupServiceMutation = useMutation(updateGroupService, {
    onSuccess: () => {
      toast.success('Group Service Updated');
      queryClient.invalidateQueries('groupServices');
    },
  });

  const { data: users, isLoading: userLoading } = useQuery({
    queryKey: 'allOrgUsers',
    queryFn: () => getAllOrgUsers(axiosAuth),
    refetchOnWindowFocus: false,
  });
  const { data: customers } = useQuery({
    queryKey: 'customers',
    queryFn: () => getCustomersList(axiosAuth),
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <div className="my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
        <div className="flex flex-col p-4">
          <div className="mb-2 font-semibold">Service Group Details</div>
          <div className="flex flex-col justify-start py-6">
            <span className="font-Open-Sans text-sm text-[#616161]">
              {'Service Group Name'}
            </span>
            <span className="text-base">{model?.name}</span>
          </div>
          <div className="flex flex-col justify-start py-6">
            <span className="font-Open-Sans text-sm text-[#616161]">
              {'Service Group Description'}
            </span>
            <span className="text-base">{model?.description}</span>
          </div>
          <div className="flex w-full gap-4">
            {/* Parent Categories */}
            <div className="mb-4 w-full">
              <CustomSearchSelect
                label="Service Manager(s)"
                data={[
                  ...(users ?? []).map((user) => ({
                    label: `${user.firstName} ${user.lastName}`,
                    value: user._id,
                    photo: user.photo,
                  })),
                ]}
                onSelect={(values: any) => {
                  if (values.length > 0) {
                    updateGroupServiceMutation.mutate({
                      axiosAuth,
                      id: model?._id,
                      data: {
                        managers: values,
                      },
                    });
                    setSelectedManagers([...values]);
                  }
                }}
                selected={selectedManagers}
                hasError={false}
                showImage={true}
                isOpen={openDropdown === 'dropdown1'}
                onToggle={() => handleToggle('dropdown1')}
              />
            </div>

            {/* Child Categories */}
            <div className="mb-4 w-full">
              <CustomSearchSelect
                label="Selected Customer"
                data={[
                  { label: 'My Organization', value: 'My Organization' },
                  ...(customers ?? [])
                    .filter((c) => c.role == 4)
                    .flatMap((user) => {
                      return [
                        {
                          label: `${user.customerName ?? `${user.firstName} ${user.lastName}`} - ${user.userId}`,
                          value: `${user.customerName ?? `${user.firstName} ${user.lastName}`}`,
                          photo: user.photo,
                        },
                      ];
                    }),
                ]}
                onSelect={(value, item) => {
                  if (typeof value == 'string') {
                    updateGroupServiceMutation.mutate({
                      axiosAuth,
                      id: model?._id,
                      data: {
                        customer: value,
                      },
                    });
                  }
                }}
                returnSingleValueWithLabel={true}
                selected={model?.customer ? [model.customer] : []}
                hasError={false}
                multiple={false}
                showImage={true}
                isOpen={openDropdown === 'dropdown2'}
                onToggle={() => handleToggle('dropdown2')}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
