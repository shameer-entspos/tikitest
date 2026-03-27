import { useAssetManagerAppsContext } from '@/app/(main)/(user-panel)/user/apps/am/am_context';
import { WithCreateAssetSidebar } from './With_Create_Asset_Sidebar';
import { AM_Asset_Create_Bottom_Button } from './AM_Asset_Create_Bottom_Button';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { SimpleInput } from '@/components/Form/simpleInput';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import {
  getAllChildCategoriesList,
  getAllParentCategoriesList,
  getCustomersList,
} from '@/app/(main)/(user-panel)/user/apps/am/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { getAllOrgUsers } from '@/app/(main)/(user-panel)/user/apps/api';
import { AMAPPACTIONTYPE } from '@/app/helpers/user/enums';
import { getTeams } from '@/app/(main)/(org-panel)/organization/teams/api';
import DateRangePicker from '@/components/JobSafetyAnalysis/CreateNewComponents/JSA_Calender';
import CustomDateRangePicker from '@/components/customDatePicker';
import { OwnerShipStatus, RetirementMethod } from '../../Enum';

export default function CreateAssetSection({
  organizationForm,
}: {
  organizationForm: any;
}) {
  const { state, dispatch } = useAssetManagerAppsContext();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const { data: teams, isLoading: userLoading } = useQuery({
    queryKey: 'teams',
    queryFn: () => getTeams(axiosAuth),
  });

  const [selectedParentId, setSelectedParentId] = useState<string | null>(
    organizationForm.values.category.value
  );

  const [selectedChildId, setSelectedChildId] = useState<string | null>(
    organizationForm.values.subcategory.value
  );

  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    organizationForm.values.serviceProvider.value
  );

  const axiosAuth = useAxiosAuth();
  //   ParentCategories
  const { data: ParentCategories, isLoading } = useQuery({
    queryKey: 'pCategoreis',
    queryFn: () => getAllParentCategoriesList({ axiosAuth }),
    refetchOnWindowFocus: false,
  });
  //   ChildCategories
  const { data: ChildCategories, isLoading: childLoading } = useQuery(
    ['childCategories', selectedParentId], // Unique key tied to selectedParentId
    () => getAllChildCategoriesList({ axiosAuth, id: selectedParentId }),

    {
      refetchOnWindowFocus: false,
      enabled: !!selectedParentId, // Only fetch if a parent category is selected
    }
  );

  const { data: users } = useQuery({
    queryKey: 'listofUsersForApp',
    queryFn: () => getAllOrgUsers(axiosAuth),
    refetchOnWindowFocus: false,
  });

  const { data: suppliers } = useQuery({
    queryKey: 'suppliers',
    queryFn: () => getCustomersList(axiosAuth),
    refetchOnWindowFocus: false,
  });
  const ownerShipStatus = Object.entries(OwnerShipStatus).map(
    ([key, value]) => ({
      label: value, // Label from Enum value
      value: value, // Key as unique identifier
    })
  );

  const retirementMethod = Object.entries(RetirementMethod).map(
    ([key, value]) => ({
      label: value, // Label from Enum value
      value: value, // Key as unique identifier
    })
  );

  return (
    <>
      <WithCreateAssetSidebar>
        <div className="mx-2 my-4 flex w-11/12 flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2 lg:w-[83%]">
          <div className="mb-5 flex flex-col sm:p-5 sm:pb-0 md:flex md:flex-row md:justify-between">
            <div className="flex flex-col">
              <h2 className="mb-1 text-xl font-semibold md:text-xl">
                Asset Details
              </h2>
              <p className="text-sm text-[#616161]">
                Fill out Asset Details below.
              </p>
            </div>
          </div>
          <div className="flex-col overflow-y-scroll p-5 pt-2">
            <h3 className="mb-3 text-lg font-semibold text-black">
              Main Details
            </h3>
            <div className="flex gap-4 pt-2">
              <SimpleInput
                label="Asset Name"
                type="text"
                placeholder="Enter asset name"
                name="name"
                required
                className="w-full"
                errorMessage={organizationForm.errors.name}
                value={organizationForm.values.name}
                isTouched={organizationForm.touched.name}
                onChange={organizationForm.handleChange}
              />
              <SimpleInput
                label="Reference"
                type="text"
                placeholder="Enter asset reference number"
                name="reference"
                className="w-full"
                errorMessage={organizationForm.errors.reference}
                value={organizationForm.values.reference}
                isTouched={organizationForm.touched.reference}
                onChange={organizationForm.handleChange}
              />
            </div>
            <div className="pt-5">
              <label className="mb-2 block" htmlFor="reasone">
                Asset Description
              </label>
              <textarea
                rows={3}
                id="description"
                name="description"
                placeholder="provide the description of the asset"
                value={organizationForm.values.description}
                className={` ${
                  organizationForm.errors.description &&
                  organizationForm.touched.description
                    ? 'border-red-500'
                    : 'border-[#EEEEEE]'
                } w-full resize-none rounded-xl border-2 border-gray-300 p-2 shadow-sm`}
                onChange={organizationForm.handleChange}
              />
              {organizationForm.errors.description &&
                organizationForm.touched.description && (
                  <span className="text-xs text-red-500">
                    {organizationForm.errors.description}
                  </span>
                )}
            </div>
            <div className="flex w-full gap-4">
              {/* Parent Categories */}
              <div className="mb-4 w-full">
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
                      organizationForm.setFieldValue('category', {
                        label: item,
                        value: value,
                      });
                    }
                  }}
                  searchPlaceholder="Search Category"
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
              <div className="mb-4 w-full">
                <CustomSearchSelect
                  label="SubCategory"
                  data={(ChildCategories ?? []).map((child) => ({
                    label: child.name,
                    value: child._id,
                  }))}
                  onSelect={(value: string | any[], item: any) => {
                    if (typeof value === 'string') {
                      organizationForm.setFieldValue('subcategory', {
                        label: item,
                        value: value,
                      });
                      setSelectedChildId(value);
                    }
                  }}
                  returnSingleValueWithLabel={true}
                  searchPlaceholder="Search subcategory"
                  selected={[selectedChildId]}
                  hasError={false}
                  multiple={false}
                  showImage={false}
                  isOpen={openDropdown === 'dropdown2'}
                  onToggle={() => handleToggle('dropdown2')}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <SimpleInput
                label="Make"
                type="text"
                placeholder="Enter make of asset"
                name="make"
                className="w-full"
                errorMessage={organizationForm.errors.make}
                value={organizationForm.values.make}
                isTouched={organizationForm.touched.make}
                onChange={organizationForm.handleChange}
              />
              <SimpleInput
                label="Model"
                type="text"
                placeholder="Enter model of asset"
                name="model"
                className="w-full"
                errorMessage={organizationForm.errors.model}
                value={organizationForm.values.model}
                isTouched={organizationForm.touched.model}
                onChange={organizationForm.handleChange}
              />
            </div>
            <div className="flex w-1/2 justify-start gap-4 pr-2 pt-2">
              <SimpleInput
                label="Serial Number"
                type="text"
                placeholder="Enter serial number"
                name="serialNumber"
                className="w-full"
                errorMessage={organizationForm.errors.serialNumber}
                value={organizationForm.values.serialNumber}
                isTouched={organizationForm.touched.serialNumber}
                onChange={organizationForm.handleChange}
              />
            </div>
            <h3 className="my-3 text-lg font-semibold">Purchase Details</h3>
            <div className="flex w-full gap-4">
              {/* Vendor Selection */}
              <div className="relative mb-4 w-full">
                <CustomSearchSelect
                  label="Vendor / Supplier"
                  data={[
                    { label: 'My Organization', value: 'My Organization' },
                    ...(suppliers ?? [])
                      .filter((c) => c.role == 5)
                      .flatMap((user) => {
                        return [
                          {
                            label: `${user.customerName || user.firstName} ${user.lastName || ''} - ${user.userId || ''}`.trim(),
                            value: `${user.customerName || user.firstName} ${user.lastName || ''}`.trim(),
                            photo: user.photo,
                          },
                        ];
                      }),
                  ]}
                  onSelect={(value, item) => {
                    if (typeof value === 'string') {
                      organizationForm.setFieldValue('vendor', value);
                    }
                  }}
                  returnSingleValueWithLabel={true}
                  selected={
                    organizationForm.values.vendor
                      ? [organizationForm.values.vendor]
                      : []
                  }
                  hasError={false}
                  searchPlaceholder="Search Contacts, Users, Customers"
                  showImage={true}
                  placeholder="-Select Vendor-"
                  multiple={false}
                  isOpen={openDropdown === 'dropdown3'}
                  onToggle={() => handleToggle('dropdown3')}
                />
              </div>

              {/* OwnerShip Selection */}
              <div className="relative mb-4 w-full">
                <CustomSearchSelect
                  label="OwnerShip Status"
                  data={ownerShipStatus}
                  onSelect={(value) => {
                    if (typeof value === 'string') {
                      organizationForm.setFieldValue('ownerShipStatus', value);
                    }
                  }}
                  returnSingleValueWithLabel={true}
                  selected={
                    organizationForm.values.ownerShipStatus
                      ? [organizationForm.values.ownerShipStatus]
                      : []
                  }
                  hasError={false}
                  multiple={false}
                  showImage={false}
                  searchPlaceholder="Select OwnerShip Status"
                  placeholder="-Select OwnerShip Status-"
                  isOpen={openDropdown === 'dropdown4'}
                  onToggle={() => handleToggle('dropdown4')}
                />
              </div>
            </div>

            <div className="flex w-full gap-4">
              {/* Authorized by Selection */}
              <div className="relative mb-4 w-full">
                <CustomSearchSelect
                  label="Purchased / Authorized By"
                  data={[
                    { label: 'My Organization', value: 'My Organization' },
                    ...(users ?? [])
                      .filter((c) => c.role == 2 || c.role == 3)
                      .flatMap((user) => {
                        return [
                          {
                            label: `${user.firstName} ${user.lastName} - ${user.userId}`,
                            value: `${user.firstName} ${user.lastName}`,
                            photo: user.photo,
                          },
                        ];
                      }),
                  ]}
                  onSelect={(value, item) => {
                    if (typeof value === 'string') {
                      organizationForm.setFieldValue('authorizedBy', value);
                    }
                  }}
                  searchPlaceholder="Search Contacts, Users, Customers"
                  returnSingleValueWithLabel={true}
                  selected={
                    organizationForm.values.authorizedBy
                      ? [organizationForm.values.authorizedBy]
                      : []
                  }
                  hasError={false}
                  showImage={true}
                  multiple={false}
                  placeholder="-Select Purchased / Authorized By-"
                  isOpen={openDropdown === 'dropdown5'}
                  onToggle={() => handleToggle('dropdown5')}
                />
              </div>

              <SimpleInput
                label="Invoice / Purchase Number"
                type="text"
                placeholder="Enter invoice or purchase number"
                name="invoiceNumber"
                className="w-full"
                errorMessage={organizationForm.errors.invoiceNumber}
                value={organizationForm.values.invoiceNumber}
                isTouched={organizationForm.touched.invoiceNumber}
                onChange={organizationForm.handleChange}
              />
            </div>

            <div className="flex w-full gap-4">
              <div className="relative w-1/2">
                <CustomDateRangePicker
                  title="Purchase Date"
                  handleOnConfirm={(date: Date) => {
                    organizationForm.setFieldValue('purchaseDate', date);
                  }}
                  selectedDate={organizationForm.values.purchaseDate}
                />
              </div>
              <div className="relative w-1/2">
                <CustomDateRangePicker
                  title="Warranty Expiry Date"
                  handleOnConfirm={(date: Date) => {
                    organizationForm.setFieldValue('expireDate', date);
                  }}
                  selectedDate={organizationForm.values.expireDate}
                />
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <SimpleInput
                label="Purchase Price"
                type="number"
                placeholder="Enter purchase price"
                name="purchasePrice"
                className="w-full"
                errorMessage={organizationForm.errors.purchasePrice}
                value={organizationForm.values.purchasePrice}
                isTouched={organizationForm.touched.purchasePrice}
                onChange={organizationForm.handleChange}
              />
              <SimpleInput
                label="Purchase Note"
                type="text"
                placeholder="Enter purchase note"
                name="purchaseNote"
                className="w-full"
                errorMessage={organizationForm.errors.purchaseNote}
                value={organizationForm.values.purchaseNote}
                isTouched={organizationForm.touched.purchaseNote}
                onChange={organizationForm.handleChange}
              />
            </div>
            <h3 className="my-3 text-lg font-semibold text-black">
              Location & Maintainance
            </h3>
            <div className="flex gap-4 pt-2">
              <SimpleInput
                label="Asset Location"
                type="text"
                placeholder="Physical Location of asset (Building, Floor, Room)"
                name="assetLocation"
                className="w-full"
                errorMessage={organizationForm.errors.assetLocation}
                value={organizationForm.values.assetLocation}
                isTouched={organizationForm.touched.assetLocation}
                onChange={organizationForm.handleChange}
              />
            </div>
            <div className="flex w-full gap-4">
              {/* Vendor Selection */}
              <div className="relative w-1/2">
                <CustomDateRangePicker
                  title="Retirement Date"
                  handleOnConfirm={(date: Date) => {
                    organizationForm.setFieldValue('retirementDate', date);
                  }}
                  selectedDate={organizationForm.values.retirementDate}
                />
              </div>

              {/* OwnerShip Selection */}
              <div className="relative mb-4 w-1/2">
                <CustomSearchSelect
                  label="Retirement Method"
                  data={retirementMethod}
                  onSelect={(value, label) => {
                    if (typeof value === 'string') {
                      organizationForm.setFieldValue('retirementMethod', {
                        label: label,
                        value: value,
                      });
                    }
                  }}
                  returnSingleValueWithLabel={true}
                  selected={
                    organizationForm.values.retirementMethod.value
                      ? [organizationForm.values.retirementMethod.value]
                      : []
                  }
                  hasError={false}
                  placeholder="- Select Retirement Method -"
                  searchPlaceholder="Search Retirement Method"
                  multiple={false}
                  showImage={false}
                  isOpen={openDropdown === 'dropdown7'}
                  onToggle={() => handleToggle('dropdown7')}
                />
              </div>
            </div>
            <div className="flex w-1/2 justify-start gap-4">
              {/* Maintenance Service Provider Selection */}
              <div className="relative mb-4 w-full">
                <CustomSearchSelect
                  label="Maintenance Service Provider"
                  data={[
                    { label: 'My Organization', value: 'My Organization' },
                    ...(suppliers ?? [])
                      .filter((c) => c.role == 5)
                      .flatMap((user) => {
                        return [
                          {
                            label: `${user.customerName || user.firstName} ${user.lastName || ''} - ${user.userId || ''}`.trim(),
                            value: `${user.customerName || user.firstName} ${user.lastName || ''}`.trim(),
                            photo: user.photo,
                          },
                        ];
                      }),
                  ]}
                  onSelect={(value, label) => {
                    if (typeof value === 'string') {
                      organizationForm.setFieldValue('serviceProvider', value);
                    }
                  }}
                  returnSingleValueWithLabel={true}
                  placeholder="- Select Maintenance Service Provider -"
                  selected={[organizationForm.values.serviceProvider]}
                  hasError={false}
                  searchPlaceholder="Search Contacts, Users, Customers"
                  showImage={true}
                  multiple={false}
                  isOpen={openDropdown === 'dropdown8'}
                  onToggle={() => handleToggle('dropdown8')}
                />
              </div>
            </div>
            <div className="mb-32 pt-5">
              <h3 className="mb-1 text-sm font-medium md:text-xl">
                Check in / out permissions
              </h3>
              <div className="mb-8 flex flex-col space-y-4 p-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="option"
                    checked={organizationForm.values.checkInpermission == '0'}
                    onChange={() =>
                      organizationForm.setFieldValue('checkInpermission', '0')
                    }
                    className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                  />
                  <span className="ml-2">All Organization Users</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="option"
                    checked={organizationForm.values.checkInpermission == '1'}
                    onChange={() =>
                      organizationForm.setFieldValue('checkInpermission', '1')
                    }
                    className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                  />
                  <span className="ml-2">Selected Teams</span>
                </label>
              </div>

              {organizationForm.values.checkInpermission == '1' && (
                <div className="mb-4 w-1/2">
                  <CustomSearchSelect
                    label="Select Organization Team(s)"
                    data={[
                      {
                        label: 'Everyone',
                        value: 'all',
                      },
                      ...(teams ?? []).map((team) => ({
                        label: team.name ?? '',
                        value: team._id,
                      })),
                    ]}
                    onSelect={(values) => {
                      organizationForm.setFieldValue('teams', values);
                    }}
                    selected={organizationForm.values.teams}
                    hasError={false}
                    placeholder="- Select Teams -"
                    showImage={false}
                    multiple={true}
                    isOpen={openDropdown === 'dropdown9'}
                    onToggle={() => handleToggle('dropdown9')}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </WithCreateAssetSidebar>
      <div className="h-16">
        <AM_Asset_Create_Bottom_Button
          isDisabled={!organizationForm.isValid}
          onCancel={() => {
            dispatch({ type: AMAPPACTIONTYPE.SHOW_ASSET_CREATE_MODEL });
          }}
          onNextClick={() => {
            organizationForm.submitForm();
          }}
        />
      </div>
    </>
  );
}
