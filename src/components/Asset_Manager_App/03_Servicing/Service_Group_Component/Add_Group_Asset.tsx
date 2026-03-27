import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';

import { SimpleInput } from '@/components/Form/simpleInput';
import { useFormik } from 'formik';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  getAllParentCategoriesList,
  getAllChildCategoriesList,
  getAssetList,
  getFilterAssetList,
  updateGroupService,
} from '@/app/(main)/(user-panel)/user/apps/am/api';
import { getAllOrgUsers } from '@/app/(main)/(user-panel)/user/apps/api';
import { GroupService } from '@/app/type/service_group';
import { Search } from '@/components/Form/search';
import Loader from '@/components/DottedLoader/loader';
import { SingleAsset } from '@/app/type/single_asset';
import { create } from 'domain';
import toast from 'react-hot-toast';

export const AddGroupAssetModel = ({
  model,
  handleClose,
}: {
  handleClose: any;
  model: GroupService | undefined;
}) => {
  const axiosAuth = useAxiosAuth();

  const queryClient = useQueryClient();
  const updateGroupServiceMutation = useMutation(updateGroupService, {
    onSuccess: () => {
      handleClose();
      toast.success('Group Service Updated');
      queryClient.invalidateQueries('groupServices');
    },
  });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [assets, setAssets] = useState<SingleAsset[]>([]);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };
  const [selectedassets, setSelectedAssets] = useState<string[]>([
    ...(model?.assets ?? []).map((item) => item._id),
  ]);
  function handleSelect(item: SingleAsset) {
    if (selectedassets.includes(item._id)) {
      setSelectedAssets(selectedassets.filter((id) => id !== item._id));
    } else {
      setSelectedAssets([...selectedassets, item._id]);
    }
  }

  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>('View All');

  const selectOption = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
  };
  const [section, setSection] = useState<'filter' | 'asset'>('filter');
  const { data: ParentCategories, isLoading } = useQuery({
    queryKey: 'pCategoreis',
    queryFn: () => getAllParentCategoriesList({ axiosAuth }),
  });
  //   ChildCategories
  const { data: ChildCategories, isLoading: childLoading } = useQuery(
    ['pCategories', selectedParentId], // Unique key tied to selectedParentId
    () => getAllChildCategoriesList({ axiosAuth, id: selectedParentId }),
    {
      enabled: !!selectedParentId, // Only fetch if a parent category is selected
    }
  );
  const { data } = useQuery({
    queryKey: 'listofUsersForApp',
    queryFn: () => getAllOrgUsers(axiosAuth),
    refetchOnWindowFocus: false,
  });

  const fetchAllAssets = useMutation(getFilterAssetList, {
    onSuccess: (data) => {
      if (data) {
        setAssets(data);
        setSection('asset');
      }
    },
  });
  const organizationForm = useFormik({
    initialValues: {
      status: '',
      make: '',
      model: '',
      submittedBy: [],
      subcategory: '',
      category: '',
      ownerShipStatus: '',
    },
    onSubmit: (values) => {
      console.log('Original Values:', values);

      // Remove keys with empty values ('', [], null)
      const filteredValues = Object.fromEntries(
        Object.entries(values).filter(
          ([_, value]) =>
            !(
              value === '' ||
              value === null ||
              (Array.isArray(value) && value.length === 0)
            )
        )
      );

      console.log('Filtered Values:', filteredValues);

      // Pass filtered values to the API
      fetchAllAssets.mutate({
        axiosAuth,
        data: filteredValues,
      });
    },
  });

  return (
    <Modal isOpen={true} onOpenChange={handleClose} placement="auto" size="lg">
      <ModalContent className="max-w-[600px] rounded-3xl bg-white">
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-row items-start gap-2 px-5 py-4">
              <div className="flex w-full flex-row items-start gap-4 py-2">
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                  <path
                    d="M23.125 35C23.125 35.4973 23.3225 35.9742 23.6742 36.3258C24.0258 36.6775 24.5027 36.875 25 36.875C25.4973 36.875 25.9742 36.6775 26.3258 36.3258C26.6775 35.9742 26.875 35.4973 26.875 35V26.875H35C35.4973 26.875 35.9742 26.6775 36.3258 26.3258C36.6775 25.9742 36.875 25.4973 36.875 25C36.875 24.5027 36.6775 24.0258 36.3258 23.6742C35.9742 23.3225 35.4973 23.125 35 23.125H26.875V15C26.875 14.5027 26.6775 14.0258 26.3258 13.6742C25.9742 13.3225 25.4973 13.125 25 13.125C24.5027 13.125 24.0258 13.3225 23.6742 13.6742C23.3225 14.0258 23.125 14.5027 23.125 15V23.125H15C14.5027 23.125 14.0258 23.3225 13.6742 23.6742C13.3225 24.0258 13.125 24.5027 13.125 25C13.125 25.4973 13.3225 25.9742 13.6742 26.3258C14.0258 26.6775 14.5027 26.875 15 26.875H23.125V35Z"
                    fill="#0063F7"
                  />
                </svg>

                <div>
                  <h1>{'Add Assets'}</h1>

                  <span className="text-base font-normal text-[#616161]">
                    {'Filter your current assets before selecting.'}
                  </span>
                </div>
                <div></div>
              </div>
            </ModalHeader>
            <ModalBody className="">
              <div className={`max-h-[480px] w-full`}>
                {section == 'filter' ? (
                  <div className="flex h-[480px] w-full flex-col overflow-y-scroll scrollbar-hide">
                    <div className="relative mb-4 w-full">
                      <CustomSearchSelect
                        label="Asset Status"
                        data={[
                          {
                            label: 'All Statuses',
                            value: 'all',
                          },
                          {
                            label: 'Healthy',
                            value: 'Healthy',
                          },
                          {
                            label: 'Out of Order',
                            value: 'Out of Order',
                          },
                          {
                            label: 'Maintainance / Repair',
                            value: 'Maintainance / Repair',
                          },
                          {
                            label: 'Lost / Stolen',
                            value: 'Lost / Stolen',
                          },
                          {
                            label: 'Retired',
                            value: 'Retired',
                          },
                        ].map((child) => ({
                          label: child.label,
                          value: child.value,
                        }))}
                        onSelect={(values) => {
                          if (values.length > 0) {
                            organizationForm.setFieldValue('status', values);
                          }
                        }}
                        selected={organizationForm.values.status}
                        hasError={false}
                        multiple={true}
                        showImage={false}
                        isOpen={openDropdown === 'dropdown4'}
                        onToggle={() => handleToggle('dropdown4')}
                      />
                    </div>
                    {/* Parent Categories */}
                    <div className="relative mb-4 w-full">
                      <CustomSearchSelect
                        label="Category"
                        data={[
                          ...(ParentCategories ?? []).map((user) => ({
                            label: user.name,
                            value: user._id,
                          })),
                        ]}
                        onSelect={(value: string | any[], item: any) => {
                          if (typeof value === 'string') {
                            setSelectedParentId(value);
                            organizationForm.setFieldValue('category', value);
                          }
                        }}
                        returnSingleValueWithLabel={true}
                        selected={[selectedParentId]}
                        hasError={false}
                        showImage={false}
                        multiple={false}
                        isOpen={openDropdown === 'dropdown1'}
                        onToggle={() => handleToggle('dropdown1')}
                      />
                    </div>

                    {/* Child Categories */}
                    <div className="relative mb-4 w-full">
                      <CustomSearchSelect
                        label="SubCategory"
                        data={(ChildCategories ?? []).map((child) => ({
                          label: child.name,
                          value: child._id,
                        }))}
                        onSelect={(value: string | any[], item: any) => {
                          if (typeof value === 'string') {
                            organizationForm.setFieldValue(
                              'subcategory',
                              value
                            );
                            setSelectedChildId(value);
                          }
                        }}
                        returnSingleValueWithLabel={true}
                        selected={[childLoading]}
                        hasError={false}
                        multiple={false}
                        showImage={false}
                        isOpen={openDropdown === 'dropdown2'}
                        onToggle={() => handleToggle('dropdown2')}
                      />
                    </div>
                    <div className="mb-2">
                      {/* Input for Category Name */}
                      <SimpleInput
                        type="text"
                        label="Make"
                        placeholder="Enter make of asset"
                        name="make"
                        errorMessage={organizationForm.errors.make}
                        value={organizationForm.values.make}
                        isTouched={organizationForm.touched.make}
                        onChange={organizationForm.handleChange}
                      />
                      <div className="mt-2">
                        {/* Input for Category Name */}
                        <SimpleInput
                          type="text"
                          label="Model"
                          placeholder="Enter model of asset"
                          name="model"
                          className="w-full"
                          errorMessage={organizationForm.errors.model}
                          value={organizationForm.values.model}
                          isTouched={organizationForm.touched.model}
                          onChange={organizationForm.handleChange}
                        />
                      </div>
                      <div className="relative mb-4 w-full">
                        <CustomSearchSelect
                          label="Asset Owner"
                          data={[
                            {
                              label: 'My Organization',
                              value: 'all',
                            },
                            ...(data ?? [])
                              .filter((user) => user.role == 3)
                              .map((user) => ({
                                label: `${user.firstName} ${user.lastName}`,
                                value: user._id,
                                photo: user.photo,
                              })),
                          ]}
                          onSelect={(values) => {
                            if (values.length > 0) {
                              organizationForm.setFieldValue(
                                'submittedBy',
                                values
                              );
                            }
                          }}
                          selected={organizationForm.values.submittedBy}
                          hasError={false}
                          showImage={true}
                          multiple={false}
                          isOpen={openDropdown === 'dropdown8'}
                          onToggle={() => handleToggle('dropdown8')}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="h-[40px] w-full">
                      <div className="flex flex-row items-center">
                        {/* SearchBox */}
                        <div className="Search team-actice flex items-center justify-between">
                          <Search
                            inputRounded={true}
                            type="search"
                            className="rounded-md bg-[#eeeeee] text-xs placeholder:text-[#616161] md:text-sm"
                            name="search"
                            placeholder="Search Requests"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        {/* CustomDropdown */}
                        <div className="DropDownn relative z-50 mx-3 inline-block text-left">
                          <div>
                            <button
                              type="button"
                              className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-[#E2F3FF] px-3 py-[5px] text-sm font-medium text-gray-700 shadow-sm hover:bg-[#e1f0fa] focus:outline-none"
                              id="options-menu"
                              aria-expanded="true"
                              aria-haspopup="true"
                              onClick={() => setIsOpen(true)}
                            >
                              {selectedOption}
                              <svg
                                className="-mr-1 ml-2 h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>

                          {isOpen && (
                            <div
                              className="absolute left-0 z-50 mt-2 w-56 origin-top-left rounded-md bg-[#E2F3FF] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                              role="menu"
                              aria-orientation="vertical"
                              aria-labelledby="options-menu"
                            >
                              <div className="py-1" role="none">
                                <button
                                  onClick={() => selectOption('View All')}
                                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                  role="menuitem"
                                >
                                  View All
                                </button>
                                <button
                                  onClick={() => selectOption('UnSelected')}
                                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                  role="menuitem"
                                >
                                  UnSelected
                                </button>
                                <button
                                  onClick={() => selectOption('Selected')}
                                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                  role="menuitem"
                                >
                                  Selected
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="h-[520px] overflow-y-scroll scrollbar-hide"></div>
                    </div>
                    <div className="h-[400px] w-full">
                      {fetchAllAssets.isLoading ? (
                        <>
                          <Loader />
                        </>
                      ) : (
                        <table className="mt-3 w-full border-collapse font-Open-Sans">
                          <thead className="bg-[#F5F5F5] text-left text-sm font-semibold text-[#616161]">
                            <tr>
                              <th className="px-2 py-3">Asset Tag No.</th>
                              <th className="px-2 py-3 md:flex">
                                Asset Name
                                <img
                                  src="/images/fluent_arrow-sort-24-regular.svg"
                                  className="cursor-pointer px-1"
                                  alt="image"
                                />
                              </th>

                              <th className="px-2 py-3 text-end">Select</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm font-normal text-[#1E1E1E]">
                            {(assets ?? []).map((item, index) => {
                              return (
                                <tr
                                  key={item._id}
                                  className="relative cursor-pointer border-b even:bg-[#F5F5F5]"
                                  onClick={() => {
                                    handleSelect(item);
                                  }}
                                >
                                  <td className="px-4 py-2 text-primary-400">
                                    {item.atnNum}
                                  </td>

                                  <td className="text-[#616161 px-2 py-2">
                                    {item.name}
                                  </td>
                                  <td className="text-[#616161 flex justify-end px-2 py-2 text-end">
                                    <div className="relative flex items-center justify-center gap-2">
                                      <input
                                        type="checkbox"
                                        name="user"
                                        checked={selectedassets.includes(
                                          item._id
                                        )}
                                        readOnly
                                        id="some_id"
                                        className="peer h-6 w-6 appearance-none rounded-md border-2 border-[#9E9E9E] bg-white checked:border-[#9E9E9E] checked:bg-white"
                                      />
                                      <svg
                                        className="absolute inset-0 m-auto hidden h-4 w-4 text-[#9E9E9E] peer-checked:block"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-end gap-2 border-t-2 border-gray-200">
              <Button
                className="border-2 border-[#0063F7] bg-white px-10 font-semibold text-[#0063F7]"
                onPress={onCloseModal}
              >
                Cancel
              </Button>
              <Button
                className="px-10 font-semibold text-white"
                color={`${organizationForm.isValid ? 'primary' : 'default'}`}
                onPress={() => {
                  if (section == 'filter') {
                    organizationForm.submitForm();
                  } else {
                    updateGroupServiceMutation.mutate({
                      axiosAuth,
                      id: model?._id,
                      data: {
                        assets: selectedassets,
                      },
                    });
                  }
                }}
              >
                {section == 'filter' ? (
                  <>{fetchAllAssets.isLoading ? <Loader /> : <>Next</>}</>
                ) : (
                  <>
                    {updateGroupServiceMutation.isLoading ? (
                      <Loader />
                    ) : (
                      <>Add</>
                    )}
                  </>
                )}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
