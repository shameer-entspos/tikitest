import { useAssetManagerAppsContext } from '@/app/(main)/(user-panel)/user/apps/am/am_context';
import { AMAPPACTIONTYPE } from '@/app/helpers/user/enums';
import { useMemo, useState, useEffect } from 'react';
import { WithCreateAssetSidebar } from './With_Create_Asset_Sidebar';
import { AM_Asset_Create_Bottom_Button } from './AM_Asset_Create_Bottom_Button';
import { getLastSegment } from './Select_Asset_Images';
import { dateFormat } from '@/app/helpers/dateFormat';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getTeams } from '@/app/(main)/(org-panel)/organization/teams/api';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import toast from 'react-hot-toast';
import {
  createAsset,
  updateAsset,
} from '@/app/(main)/(user-panel)/user/apps/am/api';
import { getPresignedFileUrls } from '@/app/(main)/(user-panel)/user/file/api';
import { useSession } from 'next-auth/react';
import { UseStagedImageUploadsReturn } from '@/components/apps/shared/useStagedImageUploads';

export default function AssetReviewSetion({
  organizationForm,
  stagedUploads,
  uploadPendingImages,
}: {
  organizationForm: any;
  stagedUploads?: UseStagedImageUploadsReturn;
  uploadPendingImages?: () => Promise<string[]>;
}) {
  const { state, dispatch } = useAssetManagerAppsContext();
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [resolvedUrls, setResolvedUrls] = useState<string[] | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };
  const rawImages = useMemo(
    () => (state.assetsImages ?? []).filter(Boolean) as string[],
    [state.assetsImages]
  );
  useEffect(() => {
    if (!rawImages.length || !accessToken?.trim()) {
      setResolvedUrls(null);
      return;
    }
    let cancelled = false;
    getPresignedFileUrls(axiosAuth, rawImages, accessToken).then((urls) => {
      if (!cancelled && urls && urls.length === rawImages.length)
        setResolvedUrls(urls);
    });
    return () => {
      cancelled = true;
    };
  }, [rawImages, accessToken, axiosAuth]);
  const queryClient = useQueryClient();
  const createAssetMutation = useMutation(createAsset, {
    onSuccess: () => {
      toast.success('Asset Created Successfully');
      // Clear form state after successful submission
      dispatch({ type: AMAPPACTIONTYPE.CREATE_ASSET_PAYLOAD, create_asset_payload: undefined });
      dispatch({ type: AMAPPACTIONTYPE.ASSET_IMAGES, assetsImages: [] });
      dispatch({ type: AMAPPACTIONTYPE.SHOW_ASSET_CREATE_MODEL });
      queryClient.invalidateQueries('assetList');
    },
  });
  const updateAssetMutation = useMutation(updateAsset, {
    onSuccess: () => {
      toast.success('Asset Update Successfully');

      dispatch({ type: AMAPPACTIONTYPE.SHOW_ASSET_CREATE_MODEL });
      queryClient.invalidateQueries('assetList');
      queryClient.invalidateQueries('getSingleAsset');
    },
  });
  const handleSubmit = () => {
    handleSubmitWithUploads();
  };

  const handleSubmitWithUploads = async () => {
    let stagedImageUrls: string[] = [];

    try {
      stagedImageUrls = (await uploadPendingImages?.()) ?? [];
    } catch {
      return;
    }

    const payload = state.create_asset_payload;
    if (payload) {
      const data = {
        name: payload.name,
        reference: payload.reference,
        description: payload.description,
        category: payload.category?.value, // Replace with the actual category ObjectId
        subcategory: payload.subcategory?.value, // Replace with the actual subcategory ObjectId
        make: payload.make,
        model: payload.model,
        status: 'Healthy',
        serialNumber: payload.serialNumber,
        vendor: payload.vendor, // Replace with the vendor's User ObjectId
        ownerShipStatus: payload.ownerShipStatus, // Example: Owned, Leased, Rented, etc.
        authorizedBy: payload.authorizedBy, // Replace with the authorized user's User ObjectId
        invoiceNumber: payload.invoiceNumber,
        purchaseDate: payload.purchaseDate, // ISO date format
        expireDate: payload.expireDate, // ISO date format
        purchasePrice: payload.purchasePrice,
        purchaseNote: payload.purchaseNote,
        assetLocation: payload.assetLocation,
        retirementDate: payload.retirementDate, // ISO date format
        retirementMethod: payload.retirementMethod?.value, // Example: Sold, Recycled, Discarded
        serviceProvider: payload.serviceProvider, // Replace with the service provider's User ObjectId
        checkInpermission: payload.checkInpermission == '0' ? 0 : 1, // 0 = No, 1 = Yes
        photos: [...(state.assetsImages ?? []), ...stagedImageUrls],
        selectedTeams: payload.teams ?? [],
      };

      if (state.is_asset_edit) {
        updateAssetMutation.mutate({
          axiosAuth,
          data,
          id: state.is_asset_edit ?? '',
        });
      } else {
        createAssetMutation.mutate({
          axiosAuth,
          data,
        });
      }
    } else {
      toast('Please fill all the required fields');
    }
  };
  const { data: teams, isLoading: userLoading } = useQuery({
    queryKey: 'teams',
    queryFn: () => getTeams(axiosAuth),
  });
  return (
    <>
      <WithCreateAssetSidebar>
        <div className="h-full w-11/12 overflow-auto scrollbar-hide lg:w-[83%]">
          {/* First Container  */}
          <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
            {/* form top  */}
            <div className="mb-2 flex justify-between px-4 pt-5">
              <div className="flex flex-col">
                <div className="mb-2 text-xl font-semibold text-black">
                  <>Review & Submit</>
                </div>
                <p className="text-base text-[#616161]">
                  Take a look and review your Asset before you submit it.
                </p>
              </div>
            </div>
          </div>
          {/* Details section  */}
          <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
            {/* form top  */}
            <div className="mb-4 flex justify-between px-6 pt-5">
              <div className="flex flex-col">
                <h2 className="mb-1 text-xl font-semibold">Asset Details</h2>
              </div>
              <div
                className="cursor-pointer text-sm text-[#0063F7]"
                onClick={() => {
                  dispatch({
                    type: AMAPPACTIONTYPE.SHOW_ASSET_CREATE_MODEL,
                    show_asset_create_model: 'detail',
                  });
                }}
              >
                Edit Section
              </div>
            </div>
            <div className="mb-4 grid grid-cols-2 flex-wrap items-start px-6 pt-2">
              <h1 className="text-lg font-semibold text-black">Main Details</h1>
              <div></div>
              {showAssetDetailWithLabel({
                label: 'Asset Name',
                value: state.create_asset_payload?.name,
              })}
              {showAssetDetailWithLabel({
                label: 'Reference',
                value: state.create_asset_payload?.reference,
              })}
              {showAssetDetailWithLabel({
                label: 'Asset Description',
                value: state.create_asset_payload?.description,
              })}
              <div></div>
              {showAssetDetailWithLabel({
                label: 'Parent Category',
                value: state.create_asset_payload?.category?.label,
              })}
              {showAssetDetailWithLabel({
                label: 'Child Category',
                value: state.create_asset_payload?.subcategory?.label,
              })}
              {showAssetDetailWithLabel({
                label: 'Make',
                value: state.create_asset_payload?.make,
              })}
              {showAssetDetailWithLabel({
                label: 'Model',
                value: state.create_asset_payload?.model,
              })}
              {showAssetDetailWithLabel({
                label: 'Serial Number',
                value: state.create_asset_payload?.serialNumber,
              })}
              <div></div>
              <h1 className="text-lg font-semibold">Purchase Details</h1>
              <div></div>
              {showAssetDetailWithLabel({
                label: 'Vendor / Supplier',
                value: state.create_asset_payload?.vendor,
              })}
              {showAssetDetailWithLabel({
                label: 'OwnerShip Status',
                value: state.create_asset_payload?.ownerShipStatus,
              })}
              {showAssetDetailWithLabel({
                label: 'Purchase / Authorized By',
                value: state.create_asset_payload?.authorizedBy,
              })}
              {showAssetDetailWithLabel({
                label: 'Invoice / Purchase Number',
                value: state.create_asset_payload?.invoiceNumber,
              })}
              {showAssetDetailWithLabel({
                label: 'Purchase Date',
                value: dateFormat(
                  state.create_asset_payload?.purchaseDate?.toString() || ''
                ),
              })}
              {showAssetDetailWithLabel({
                label: 'Warranty / Expire Date',
                value: dateFormat(
                  state.create_asset_payload?.expireDate?.toString() || ''
                ),
              })}
              {showAssetDetailWithLabel({
                label: 'Purchase Price',
                value: state.create_asset_payload?.purchasePrice,
              })}
              {showAssetDetailWithLabel({
                label: 'Currency / Purchase Note',
                value: state.create_asset_payload?.purchaseNote,
              })}

              <h1 className="text-lg font-semibold">Location & Maintenance</h1>
              <div></div>
              {showAssetDetailWithLabel({
                label: 'Asset Location',
                value: state.create_asset_payload?.assetLocation,
              })}

              {showAssetDetailWithLabel({
                label: 'Retiretment Date',
                value: dateFormat(
                  state.create_asset_payload?.retirementDate?.toString() || ''
                ),
              })}
              {showAssetDetailWithLabel({
                label: 'Retiretment Method',
                value: state.create_asset_payload?.retirementMethod?.value,
              })}
              {showAssetDetailWithLabel({
                label: 'Maintenance Service Provider',
                value: state.create_asset_payload?.serviceProvider,
              })}
            </div>
            <div className="mb-32 px-6 pt-5">
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

          {/* last Container  */}

          <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
            {/* form top  */}
            <div className="mb-4 flex justify-between px-4 pt-5">
              <div className="flex flex-col">
                <h2 className="mb-1 text-xl font-semibold">Photos</h2>
              </div>
              <div
                className="cursor-pointer text-[#0063F7]"
                onClick={() => {
                  dispatch({
                    type: AMAPPACTIONTYPE.SHOW_ASSET_CREATE_MODEL,
                    show_asset_create_model: 'photo',
                  });
                }}
              >
                Edit Section
              </div>
            </div>
            <div className="mb-4 grid grid-cols-1 flex-wrap items-start px-4 pt-2">
              {[
                ...(state.assetsImages ?? []).map((val, index) => ({
                  label: getLastSegment(val),
                  src: resolvedUrls?.[index] ?? val,
                  value: val,
                })),
                ...((stagedUploads?.items ?? []).map((item) => ({
                  label: item.file.name,
                  src: item.previewUrl,
                  value: item.id,
                })) ?? []),
              ].map((val) => (
                <div className="pb-4 pt-2" key={val.value}>
                  <img src={val.src} alt="image" />
                  <span className="my-2 text-sm text-[#0063F7]">
                    {val.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </WithCreateAssetSidebar>
      <div className="h-16">
        <AM_Asset_Create_Bottom_Button
          onCancel={() => {
            dispatch({
              type: AMAPPACTIONTYPE.SHOW_ASSET_CREATE_MODEL,
              show_asset_create_model: 'photo',
            });
          }}
          loading={
            createAssetMutation.isLoading || updateAssetMutation.isLoading
          }
          onNextClick={handleSubmit}
        />
      </div>
    </>
  );
}

const showAssetDetailWithLabel = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => {
  return (
    <div className="flex flex-col justify-start py-3">
      <span className="text-sm text-[#616161]">{label}</span>
      <span>{value}</span>
    </div>
  );
};
