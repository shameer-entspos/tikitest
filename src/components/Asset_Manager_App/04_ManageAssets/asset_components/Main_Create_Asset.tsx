import { useAssetManagerAppsContext } from '@/app/(main)/(user-panel)/user/apps/am/am_context';
import { AMAPPACTIONTYPE } from '@/app/helpers/user/enums';
import { useCallback, useMemo } from 'react';
import CreateAssetSection from './Create_Asset_Section';
import CreateAssetPhotos from './Create_Asset_Photos_section';
import AssetReviewSetion from './Create_Asset_Review_Section';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { uploadImageToApp } from '@/components/apps/shared/appImageUpload';
import { useStagedImageUploads } from '@/components/apps/shared/useStagedImageUploads';
import useAxiosAuth from '@/hooks/AxiosAuth';

export default function CreateAsset() {
  const { state, dispatch } = useAssetManagerAppsContext();
  const axiosAuth = useAxiosAuth();
  const assetImageUploads = useStagedImageUploads({
    existingCount: state.assetsImages?.length ?? 0,
    maxFiles: 5,
  });
  const uploadPendingAssetImages = useCallback(async () => {
    if (!state.appId || !assetImageUploads.hasStagedFiles) {
      return [];
    }

    return assetImageUploads.uploadPending<string>({
      onUploaded: async (fileUrl) => {
        dispatch({
          type: AMAPPACTIONTYPE.ASSET_IMAGES,
          assetsImages: fileUrl,
        });
      },
      uploadFile: async (file, onProgress) =>
        uploadImageToApp({
          appId: state.appId!,
          axiosAuth,
          file,
          onProgress,
        }),
    });
  }, [assetImageUploads, axiosAuth, dispatch, state.appId]);
  const appFormValidatorSchema = Yup.object().shape({
    // Email validation
    name: Yup.string().required('title is required'),
  });
  const organizationForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: state.create_asset_payload?.name ?? '',
      reference: state.create_asset_payload?.reference ?? '',
      description: state.create_asset_payload?.description ?? '',
      make: state.create_asset_payload?.make ?? '',
      model: state.create_asset_payload?.model ?? '',
      invoiceNumber: state.create_asset_payload?.invoiceNumber ?? '',
      serialNumber: state.create_asset_payload?.serialNumber ?? '',
      purchaseNote: state.create_asset_payload?.purchaseNote ?? '',
      purchasePrice: state.create_asset_payload?.purchasePrice ?? '',
      assetLocation: state.create_asset_payload?.assetLocation ?? '',
      category: state.create_asset_payload?.category ?? {
        label: '',
        value: '',
      },
      subcategory: state.create_asset_payload?.subcategory ?? {
        label: '',
        value: '',
      },
      vendor: state.create_asset_payload?.vendor ?? 'My Organization',
      ownerShipStatus: state.create_asset_payload?.ownerShipStatus ?? 'Owned',
      authorizedBy: state.create_asset_payload?.authorizedBy ?? '',
      purchaseDate: state.create_asset_payload?.purchaseDate,
      expireDate: state.create_asset_payload?.expireDate,
      retirementDate: state.create_asset_payload?.retirementDate,
      retirementMethod: state.create_asset_payload?.retirementMethod ?? {
        label: 'Storage',
        value: 'Storage',
      },
      serviceProvider: state.create_asset_payload?.serviceProvider ?? '',
      checkInpermission: state.create_asset_payload?.checkInpermission ?? '0',
      teams: state.create_asset_payload?.teams ?? [],
    },

    validationSchema: appFormValidatorSchema,
    onSubmit: (values) => {
      dispatch({
        type: AMAPPACTIONTYPE.CREATE_ASSET_PAYLOAD,
        create_asset_payload: values,
      });
      dispatch({
        type: AMAPPACTIONTYPE.SHOW_ASSET_CREATE_MODEL,
        show_asset_create_model: 'photo',
      });
    },
  });
  const memoizedTopBar = useMemo(
    () => (
      <div className="breadCrumbs flex justify-between border-b-2 border-[#EEEEEE] p-2">
        <span className="flex items-center gap-2 text-xl font-bold">
          {' '}
          <img
            src="/svg/am/logo.svg"
            alt="show logo"
            className="h-[50px] w-[50px]"
          />
          {<>New Asset</>}
        </span>

        <button
          onClick={() => {
            dispatch({ type: AMAPPACTIONTYPE.SHOW_ASSET_CREATE_MODEL });
          }}
        >
          <img src="/svg/timesheet_app/go_back.svg" alt="show logo" />
        </button>
        {/* </Link> */}
      </div>
    ),
    [dispatch]
  );
  return (
    <>
      <div className="absolute inset-0 z-10 flex h-[calc(var(--app-vh)-70px)] w-full max-w-[1360px] flex-col bg-white px-4 pt-4 font-Open-Sans">
        {/* TopBar */}
        {memoizedTopBar}

        {/* Create Asset Section  */}

        {state.show_asset_create_model == 'detail' && (
          <CreateAssetSection organizationForm={organizationForm} />
        )}
        {/* CreateAssetPhotos  */}
        {state.show_asset_create_model == 'photo' && (
          <CreateAssetPhotos stagedUploads={assetImageUploads} />
        )}
        {/* AssetReviewSetion */}
        {state.show_asset_create_model == 'review' && (
          <AssetReviewSetion
            organizationForm={organizationForm}
            stagedUploads={assetImageUploads}
            uploadPendingImages={uploadPendingAssetImages}
          />
        )}
      </div>
    </>
  );
}
