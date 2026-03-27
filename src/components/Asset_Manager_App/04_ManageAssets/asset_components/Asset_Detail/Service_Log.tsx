import { SingleAsset } from '@/app/type/single_asset';
import { Button } from '@/components/Buttons';

import * as Yup from 'yup';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';

import { useFormik } from 'formik';
import { useState, useEffect, useCallback, useMemo } from 'react';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getCustomersList } from '@/app/(main)/(user-panel)/user/apps/am/api';
import ServiceLogImageUpload from '@/components/Asset_Manager_App/03_Servicing/subpages/service_log_image_upload';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import CustomDateRangePicker from '@/components/customDatePicker';
import { SimpleInput } from '@/components/Form/simpleInput';
import { useAssetManagerAppsContext } from '@/app/(main)/(user-panel)/user/apps/am/am_context';
import { AMAPPACTIONTYPE } from '@/app/helpers/user/enums';
import {
  createAssetServiceLog,
  deleteAssetServiceLog,
  getAssetLogs,
  updateAssetServiceLog,
} from '@/app/(main)/(user-panel)/user/apps/am/api';
import Loader from '@/components/DottedLoader/loader';
import UserCard from '@/components/UserCard';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import { PaginationComponent } from '@/components/pagination';
import CustomModal from '@/components/Custom_Modal';
import { ServiceLog } from '@/app/type/service_log';
import CustomInfoModal from '@/components/CustomDeleteModel';
import { getLastSegment } from '../Select_Asset_Images';
import { MdFileDownload } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { getPresignedFileUrls } from '@/app/(main)/(user-panel)/user/file/api';
import { useSession } from 'next-auth/react';
import { uploadImageToApp } from '@/components/apps/shared/appImageUpload';
import { useStagedImageUploads } from '@/components/apps/shared/useStagedImageUploads';

export default function AssetServiceLog({
  data,
}: {
  data: SingleAsset | undefined;
}) {
  const [model, setModel] = useState<
    | {
        model?: ServiceLog;
        action: 'view' | 'delete' | 'edit' | 'add';
      }
    | undefined
  >(undefined);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;
  const { state, dispatch } = useAssetManagerAppsContext();
  const stagedUploads = useStagedImageUploads({
    existingCount: state.logImages?.length ?? 0,
    maxFiles: 5,
  });
  const rawLogImages = useMemo(
    () => (model?.model?.images ?? []).filter(Boolean) as string[],
    [model?.model?.images]
  );
  const [resolvedLogImages, setResolvedLogImages] = useState<string[] | null>(
    null
  );

  useEffect(() => {
    if (!rawLogImages.length || !accessToken?.trim()) {
      setResolvedLogImages(null);
      return;
    }
    let cancelled = false;
    getPresignedFileUrls(axiosAuth, rawLogImages, accessToken).then((urls) => {
      if (!cancelled && urls && urls.length === rawLogImages.length)
        setResolvedLogImages(urls);
    });
    return () => {
      cancelled = true;
    };
  }, [rawLogImages, accessToken, axiosAuth]);

  const displayLogImages = (resolvedLogImages ?? rawLogImages) as string[];

  // Query for service logs - always enabled when asset ID exists
  const {
    data: logs,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['assetLogs', data?._id],
    queryFn: () =>
      getAssetLogs({
        id: data?._id ?? '',
        axiosAuth,
      }),
    enabled: !!data?._id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale to ensure fresh data
  });

  // Query for suppliers
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => getCustomersList(axiosAuth),
    refetchOnWindowFocus: false,
  });

  // Validation schema
  const appFormValidatorSchema = Yup.object().shape({
    vendor: Yup.string().required('Vendor is required'),
    serviceDate: Yup.date().nullable().required('Service date is required'),
  });

  // Formik configuration
  const organizationForm = useFormik({
    initialValues: {
      serviceCost: '',
      description: '',
      purchaseNote: '',
      vendor: '',
      serviceDate: null as Date | null,
    },
    enableReinitialize: false,
    validationSchema: appFormValidatorSchema,
    onSubmit: async (values) => {
      let stagedImageUrls: string[] = [];

      try {
        stagedImageUrls = await stagedUploads.uploadPending<string>({
          onUploaded: async (fileUrl) => {
            dispatch({ type: AMAPPACTIONTYPE.SELECT_IMAGE, logImages: fileUrl });
          },
          uploadFile: async (file, onProgress) =>
            uploadImageToApp({
              appId: state.appId!,
              axiosAuth,
              file,
              onProgress,
            }),
        });
      } catch {
        return;
      }

      const _data = {
        ...values,
        assets: [data?._id],
        images: [...(state.logImages ?? []), ...stagedImageUrls],
      };

      if (model?.action === 'edit') {
        updateSeriveMutation.mutate({
          axiosAuth,
          data: _data,
          id: model?.model?._id ?? '',
        });
      } else {
        createSeriveSchedule.mutate({
          axiosAuth,
          data: _data,
        });
      }
    },
  });

  // Create mutation
  const createSeriveSchedule = useMutation(createAssetServiceLog, {
    onSuccess: (response) => {
      toast.success('Service log created successfully');
      setModel(undefined);
      organizationForm.resetForm();
      stagedUploads.clearStaged();
      dispatch({ type: AMAPPACTIONTYPE.SELECT_IMAGE, logImages: null });
      // Invalidate and refetch
      // queryClient.invalidateQueries(['assetLogs', data?._id]);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create service log');
    },
  });

  // Update mutation
  const updateSeriveMutation = useMutation(updateAssetServiceLog, {
    onSuccess: (response) => {
      toast.success('Service log updated successfully');
      setModel(undefined);
      organizationForm.resetForm();
      stagedUploads.clearStaged();
      dispatch({ type: AMAPPACTIONTYPE.SELECT_IMAGE, logImages: null });
      // Invalidate and refetch
      // queryClient.invalidateQueries(['assetLogs', data?._id]);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update service log');
    },
  });

  // Delete mutation
  const deleteSeriveMutation = useMutation(deleteAssetServiceLog, {
    onSuccess: () => {
      toast.success('Service log deleted successfully');
      setModel(undefined);
      // Invalidate and refetch
      // queryClient.invalidateQueries(['assetLogs', data?._id]);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete service log');
    },
  });

  // Handle edit - set model and initialize form
  const handleEdit = useCallback((item: ServiceLog) => {
    setModel({
      action: 'edit',
      model: item,
    });
  }, []);

  // Clear form and images when opening add modal, initialize form when editing
  useEffect(() => {
    if (!model) {
      // Clear form when modal is closed
      organizationForm.resetForm();
      stagedUploads.clearStaged();
      dispatch({ type: AMAPPACTIONTYPE.SELECT_IMAGE, logImages: null });
      return;
    }

    if (model.action === 'add') {
      // Clear form and images for new entry
      organizationForm.resetForm();
      stagedUploads.clearStaged();
      dispatch({ type: AMAPPACTIONTYPE.SELECT_IMAGE, logImages: null });
    } else if (model.action === 'edit' && model.model) {
      // Initialize form with edit data
      const item = model.model;
      // Clear images first
      stagedUploads.clearStaged();
      dispatch({ type: AMAPPACTIONTYPE.SELECT_IMAGE, logImages: null });
      // Set form values
      setTimeout(() => {
        organizationForm.setFieldValue('serviceCost', item.serviceCost || '');
        organizationForm.setFieldValue('description', item.description || '');
        organizationForm.setFieldValue('purchaseNote', item.purchaseNote || '');
        organizationForm.setFieldValue('vendor', item.vendor?._id || '');
        organizationForm.setFieldValue(
          'serviceDate',
          item.serviceDate ? new Date(item.serviceDate) : null
        );
        // Set existing images from the item
        if (item.images && item.images.length > 0) {
          setTimeout(() => {
            item.images.forEach((img) => {
              dispatch({ type: AMAPPACTIONTYPE.SELECT_IMAGE, logImages: img });
            });
          }, 50);
        }
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model?.action, model?.model?._id]);

  // Refetch when component mounts or data._id changes
  useEffect(() => {
    if (data?._id) {
      refetch();
    }
  }, [data?._id, refetch]);

  // Pagination logic
  const allDocs = logs ?? [];
  const projectsPerPage = 5;
  const totalPages = Math.ceil(allDocs.length / projectsPerPage);
  const sortedDocs = [...allDocs].sort((a, b) => {
    if (sortBy === 'asc') {
      return (
        new Date(a.serviceDate ?? 0).getTime() -
        new Date(b.serviceDate ?? 0).getTime()
      );
    } else {
      return (
        new Date(b.serviceDate ?? 0).getTime() -
        new Date(a.serviceDate ?? 0).getTime()
      );
    }
  });
  const paginatedDocs = sortedDocs.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [logs?.length]);

  const handleCloseModal = () => {
    setModel(undefined);
    organizationForm.resetForm();
    stagedUploads.clearStaged();
    dispatch({ type: AMAPPACTIONTYPE.SELECT_IMAGE, logImages: null });
  };

  return (
    <>
      <div className="mx-2 my-2 flex flex-col rounded-lg border-2 bg-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
        <div className="grid grid-cols-12 flex-wrap items-start px-4 py-2 text-sm font-semibold text-[#616161]">
          <span className="col-span-2 px-2">LOG ID</span>
          <span className="col-span-3 px-2 md:col-span-5">
            Vendor / Supplier Name
          </span>
          <span className="col-span-2 px-2">Service Cost</span>
          <span className="col-span-2 flex items-center gap-1">
            Service Date
            <svg
              onClick={() => {
                setSortBy(sortBy === 'asc' ? 'desc' : 'asc');
              }}
              className="cursor-pointer"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.9373 3L12.8623 3.00525C12.7274 3.0234 12.6036 3.08988 12.5139 3.19236C12.4243 3.29483 12.3749 3.42635 12.3748 3.5625V13.0815L9.9598 10.668L9.8968 10.614C9.78265 10.5292 9.64059 10.4907 9.49922 10.5064C9.35786 10.5221 9.22768 10.5907 9.1349 10.6985C9.04212 10.8063 8.99362 10.9453 8.99917 11.0874C9.00471 11.2295 9.0639 11.3643 9.1648 11.4645L12.5428 14.8395L12.6058 14.8935C12.7142 14.9735 12.8476 15.012 12.982 15.002C13.1163 14.9919 13.2426 14.934 13.3378 14.8387L16.7106 11.4637L16.7646 11.4008C16.8448 11.2923 16.8834 11.1587 16.8734 11.0242C16.8633 10.8897 16.8053 10.7633 16.7098 10.668L16.6468 10.614C16.5384 10.5338 16.4048 10.4951 16.2703 10.5052C16.1357 10.5152 16.0093 10.5733 15.9141 10.6688L13.4998 13.0845V3.5625L13.4953 3.486C13.4768 3.35133 13.4102 3.22792 13.3077 3.13858C13.2053 3.04923 13.0732 3.00001 12.9373 3ZM4.66105 3.165L1.2898 6.53625L1.23505 6.59925C1.15501 6.7076 1.11652 6.84108 1.12657 6.97541C1.13661 7.10974 1.19454 7.23601 1.2898 7.33125L1.3528 7.386C1.46115 7.46603 1.59463 7.50453 1.72896 7.49448C1.86329 7.48443 1.98956 7.42651 2.0848 7.33125L4.49755 4.91775V14.4412L4.50355 14.5177C4.52204 14.6524 4.58866 14.7758 4.6911 14.8652C4.79354 14.9545 4.92487 15.0037 5.0608 15.0037L5.13655 14.9985C5.27135 14.9802 5.39495 14.9136 5.48444 14.8112C5.57394 14.7087 5.62327 14.5773 5.6233 14.4412L5.62255 4.91925L8.0398 7.332L8.1028 7.386C8.21703 7.46979 8.35867 7.50739 8.49942 7.49128C8.64016 7.47518 8.76965 7.40657 8.86201 7.29915C8.95437 7.19173 9.00279 7.05342 8.99761 6.91185C8.99243 6.77028 8.93402 6.63588 8.83405 6.5355L5.45605 3.165L5.3923 3.111C5.28395 3.03096 5.15047 2.99247 5.01614 3.00252C4.88181 3.01257 4.75554 3.07049 4.6603 3.16575"
                fill="#0063F7"
              />
            </svg>
          </span>
        </div>
      </div>
      <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
        <div className="h-[500px] overflow-y-auto">
          {isLoading || isRefetching ? (
            <Loader />
          ) : (
            <>
              {paginatedDocs.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500">No service logs found</p>
                </div>
              ) : (
                paginatedDocs.map((item, index) => {
                  return (
                    <div
                      key={item._id || index}
                      className="grid w-full cursor-pointer grid-cols-12 flex-row items-center justify-between border-b text-sm font-normal text-[#1E1E1E] even:bg-[#F5F5F5]"
                    >
                      <span className="col-span-2 w-64 px-2 py-2 text-primary-500">
                        {item.logId}
                      </span>

                      <span className="col-span-3 flex cursor-pointer items-center px-2 py-2 md:col-span-5">
                        <UserCard submittedBy={item.vendor} index={0} />
                      </span>
                      <span className="col-span-2 flex cursor-pointer items-center px-2 py-2">
                        <span>{item.serviceCost}</span>
                      </span>
                      <span className="col-span-2 px-2 py-2">
                        <div>
                          {dateFormat(item.serviceDate?.toString() ?? '')}
                        </div>
                      </span>
                      <span className="col-span-1 flex cursor-pointer justify-start p-2">
                        <Dropdown placement="bottom-end">
                          <DropdownTrigger>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="24px"
                              viewBox="0 -960 960 960"
                              width="24px"
                              fill="#616161"
                              className="hover:fill-[#8d8d8d]"
                            >
                              <path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z" />
                            </svg>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Dynamic Actions">
                            <DropdownItem
                              key="View"
                              onPress={() => {
                                setModel({
                                  action: 'view',
                                  model: item,
                                });
                              }}
                            >
                              View
                            </DropdownItem>
                            <DropdownItem
                              key="edit"
                              onPress={() => {
                                handleEdit(item);
                              }}
                            >
                              Edit
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              onPress={() => {
                                setModel({
                                  action: 'delete',
                                  model: item,
                                });
                              }}
                            >
                              Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </span>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        <div className="flex justify-between border-t-2 border-gray-200 px-3 py-2">
          <div className="font-Open-Sans text-sm font-normal text-[#616161]">
            Items per page: {projectsPerPage}
          </div>
          <div>
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          </div>
          <div></div>
        </div>
        <div className="relative flex-1">
          <div className="absolute bottom-6 right-6">
            <Button
              variant="primaryRounded"
              onClick={() => {
                setModel({
                  action: 'add',
                });
              }}
            >
              {'+ Add'}
            </Button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <CustomModal
        isOpen={model?.action === 'add' || model?.action === 'edit'}
        handleCancel={handleCloseModal}
        handleSubmit={() => {
          organizationForm.submitForm();
        }}
        header={
          <>
            <svg
              width="50"
              height="50"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
              <path
                d="M17.5 23.125H23.125V25H17.5V23.125ZM17.5 15.625H28.75V17.5H17.5V15.625ZM17.5 19.375H28.75V21.25H17.5V19.375ZM17.5 32.5H23.125V34.375H17.5V32.5ZM38.125 32.5V30.625H36.1553C36.0337 30.0384 35.8007 29.4805 35.4691 28.9816L36.8659 27.5847L35.5403 26.2591L34.1434 27.6559C33.6445 27.3243 33.0866 27.0913 32.5 26.9697V25H30.625V26.9697C30.0384 27.0913 29.4805 27.3243 28.9816 27.6559L27.5847 26.2591L26.2591 27.5847L27.6559 28.9816C27.3243 29.4805 27.0913 30.0384 26.9697 30.625H25V32.5H26.9697C27.0913 33.0866 27.3243 33.6445 27.6559 34.1434L26.2591 35.5403L27.5847 36.8659L28.9816 35.4691C29.4805 35.8007 30.0384 36.0337 30.625 36.1553V38.125H32.5V36.1553C33.0866 36.0337 33.6445 35.8007 34.1434 35.4691L35.5403 36.8659L36.8659 35.5403L35.4691 34.1434C35.8007 33.6445 36.0337 33.0866 36.1553 32.5H38.125ZM31.5625 34.375C31.0062 34.375 30.4625 34.2101 30 33.901C29.5374 33.592 29.177 33.1527 28.9641 32.6388C28.7512 32.1249 28.6955 31.5594 28.804 31.0138C28.9126 30.4682 29.1804 29.9671 29.5738 29.5738C29.9671 29.1804 30.4682 28.9126 31.0138 28.804C31.5594 28.6955 32.1249 28.7512 32.6388 28.9641C33.1527 29.177 33.592 29.5374 33.901 30C34.2101 30.4625 34.375 31.0062 34.375 31.5625C34.3743 32.3082 34.0777 33.0231 33.5504 33.5504C33.0231 34.0777 32.3082 34.3743 31.5625 34.375Z"
                fill="#0063F7"
              />
              <path
                d="M23.125 38.125H15.625C15.1277 38.125 14.6508 37.9275 14.2992 37.5758C13.9475 37.2242 13.75 36.7473 13.75 36.25V13.75C13.75 13.2527 13.9475 12.7758 14.2992 12.4242C14.6508 12.0725 15.1277 11.875 15.625 11.875H30.625C31.1223 11.875 31.5992 12.0725 31.9508 12.4242C32.3025 12.7758 32.5 13.2527 32.5 13.75V23.125H30.625V13.75H15.625V36.25H23.125V38.125Z"
                fill="#0063F7"
              />
            </svg>

            <div>
              <h2 className="text-xl font-semibold text-[#1E1E1E]">
                {model?.action === 'edit'
                  ? 'Edit Service Log'
                  : 'Add Service Log'}
              </h2>
              <span className="mt-1 text-base font-normal text-[#616161]">
                {model?.action === 'edit'
                  ? 'Edit service log details below.'
                  : 'Add service log details below.'}
              </span>
            </div>
          </>
        }
        body={
          <div className="my-4">
            <div className="flex h-[520px] flex-col overflow-y-scroll px-4">
              <div className="relative mb-4 w-full">
                <CustomSearchSelect
                  label="Supplier"
                  data={[
                    ...(suppliers ?? [])
                      .filter((supplier) => supplier.role === 5)
                      .map((supplier) => ({
                        label: supplier.customerName
                          ? `${supplier.customerName} - ${supplier.userId}`
                          : `${supplier.firstName} ${supplier.lastName}`,
                        value: supplier._id,
                        photo: supplier.photo,
                      })),
                  ]}
                  onSelect={(values, item) => {
                    if (typeof values === 'string') {
                      organizationForm.setFieldValue('vendor', values);
                      organizationForm.setFieldTouched('vendor', true);
                    } else if (Array.isArray(values) && values.length > 0) {
                      organizationForm.setFieldValue('vendor', values[0]);
                      organizationForm.setFieldTouched('vendor', true);
                    } else {
                      organizationForm.setFieldValue('vendor', '');
                      organizationForm.setFieldTouched('vendor', true);
                    }
                  }}
                  selected={
                    organizationForm.values.vendor
                      ? [organizationForm.values.vendor]
                      : []
                  }
                  hasError={
                    !!organizationForm.errors.vendor &&
                    organizationForm.touched.vendor
                  }
                  showImage={true}
                  isRequired={true}
                  multiple={false}
                  returnSingleValueWithLabel={true}
                  isOpen={openDropdown === 'dropdown3'}
                  onToggle={() => handleToggle('dropdown3')}
                />
                {organizationForm.errors.vendor &&
                  organizationForm.touched.vendor && (
                    <span className="text-xs text-red-500">
                      {organizationForm.errors.vendor.toString()}
                    </span>
                  )}
              </div>
              <div className="relative mb-4 w-full">
                <CustomDateRangePicker
                  title="Service Date"
                  isRequired={true}
                  handleOnConfirm={(date: Date) => {
                    organizationForm.setFieldValue('serviceDate', date);
                    organizationForm.setFieldTouched('serviceDate', true);
                  }}
                  selectedDate={organizationForm.values.serviceDate}
                />
                {organizationForm.errors.serviceDate &&
                  organizationForm.touched.serviceDate && (
                    <span className="text-xs text-red-500">
                      {organizationForm.errors.serviceDate.toString()}
                    </span>
                  )}
              </div>
              <div className="pb-3">
                <SimpleInput
                  label="Serviced Cost"
                  type="text"
                  placeholder="Enter Service Cost"
                  name="serviceCost"
                  className="w-full"
                  errorMessage={organizationForm.errors.serviceCost}
                  value={organizationForm.values.serviceCost}
                  isTouched={organizationForm.touched.serviceCost}
                  onChange={organizationForm.handleChange}
                />
              </div>
              <div className="pb-3">
                <SimpleInput
                  label="Currency / Purchase Note"
                  type="text"
                  placeholder="Enter Currency / Purchase Note"
                  name="purchaseNote"
                  className="w-full"
                  errorMessage={organizationForm.errors.purchaseNote}
                  value={organizationForm.values.purchaseNote}
                  isTouched={organizationForm.touched.purchaseNote}
                  onChange={organizationForm.handleChange}
                />
              </div>
              <div className="pb-3">
                <label className="mb-2 block px-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  rows={6}
                  id="description"
                  name="description"
                  placeholder="Describe the service description"
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
                <ServiceLogImageUpload
                  stagedUploads={stagedUploads}
                  uploadedImages={state.logImages ?? []}
                />
              </div>
            </div>
          </div>
        }
        submitValue={model?.action === 'edit' ? 'Update' : 'Add'}
        cancelButton="Cancel"
        isLoading={
          createSeriveSchedule.isLoading || updateSeriveMutation.isLoading
        }
        submitDisabled={
          !organizationForm.isValid ||
          createSeriveSchedule.isLoading ||
          updateSeriveMutation.isLoading
        }
        variant="primary"
        cancelvariant="primaryOutLine"
        size="xl"
        showTopBorder={true}
        justifyButton="justify-center"
      />

      {/* View Modal */}
      <CustomModal
        isOpen={model?.action === 'view'}
        header={
          <div className="flex gap-3">
            <svg
              width="50"
              height="50"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
              <path
                d="M17.5 23.125H23.125V25H17.5V23.125ZM17.5 15.625H28.75V17.5H17.5V15.625ZM17.5 19.375H28.75V21.25H17.5V19.375ZM17.5 32.5H23.125V34.375H17.5V32.5ZM38.125 32.5V30.625H36.1553C36.0337 30.0384 35.8007 29.4805 35.4691 28.9816L36.8659 27.5847L35.5403 26.2591L34.1434 27.6559C33.6445 27.3243 33.0866 27.0913 32.5 26.9697V25H30.625V26.9697C30.0384 27.0913 29.4805 27.3243 28.9816 27.6559L27.5847 26.2591L26.2591 27.5847L27.6559 28.9816C27.3243 29.4805 27.0913 30.0384 26.9697 30.625H25V32.5H26.9697C27.0913 33.0866 27.3243 33.6445 27.6559 34.1434L26.2591 35.5403L27.5847 36.8659L28.9816 35.4691C29.4805 35.8007 30.0384 36.0337 30.625 36.1553V38.125H32.5V36.1553C33.0866 36.0337 33.6445 35.8007 34.1434 35.4691L35.5403 36.8659L36.8659 35.5403L35.4691 34.1434C35.8007 33.6445 36.0337 33.0866 36.1553 32.5H38.125ZM31.5625 34.375C31.0062 34.375 30.4625 34.2101 30 33.901C29.5374 33.592 29.177 33.1527 28.9641 32.6388C28.7512 32.1249 28.6955 31.5594 28.804 31.0138C28.9126 30.4682 29.1804 29.9671 29.5738 29.5738C29.9671 29.1804 30.4682 28.9126 31.0138 28.804C31.5594 28.6955 32.1249 28.7512 32.6388 28.9641C33.1527 29.177 33.592 29.5374 33.901 30C34.2101 30.4625 34.375 31.0062 34.375 31.5625C34.3743 32.3082 34.0777 33.0231 33.5504 33.5504C33.0231 34.0777 32.3082 34.3743 31.5625 34.375Z"
                fill="#0063F7"
              />
              <path
                d="M23.125 38.125H15.625C15.1277 38.125 14.6508 37.9275 14.2992 37.5758C13.9475 37.2242 13.75 36.7473 13.75 36.25V13.75C13.75 13.2527 13.9475 12.7758 14.2992 12.4242C14.6508 12.0725 15.1277 11.875 15.625 11.875H30.625C31.1223 11.875 31.5992 12.0725 31.9508 12.4242C32.3025 12.7758 32.5 13.2527 32.5 13.75V23.125H30.625V13.75H15.625V36.25H23.125V38.125Z"
                fill="#0063F7"
              />
            </svg>

            <div className="w-[calc(100%_-_55px)]">
              <h2 className="text-xl font-semibold">View Service Log</h2>
              <p className="mt-1 pr-1 text-base font-normal text-[#616161]">
                View service log details below
              </p>
            </div>
          </div>
        }
        handleCancel={() => {
          setModel(undefined);
        }}
        body={
          <div className="flex h-[550px] flex-col overflow-auto px-6">
            {showAssetDetailWithLabel({
              label: 'Supplier',
              value: `${model?.model?.vendor?.firstName ?? ''} ${model?.model?.vendor?.lastName ?? ''}`,
            })}
            {showAssetDetailWithLabel({
              label: 'Contact Email',
              value: model?.model?.vendor?.email ?? '',
            })}
            {showAssetDetailWithLabel({
              label: 'Contact Phone ',
              value: model?.model?.vendor?.phone ?? '',
            })}
            {showAssetDetailWithLabel({
              label: 'Service Cost',
              value: model?.model?.serviceCost ?? '',
            })}
            {showAssetDetailWithLabel({
              label: 'Currency / Purchase Note',
              value: model?.model?.purchaseNote ?? '',
            })}
            {showAssetDetailWithLabel({
              label: 'Description',
              value: model?.model?.description ?? '',
            })}
            {(model?.model?.images ?? []).length > 0 && (
              <div className="flex flex-col">
                <span className="text-sm text-[#616161]">{'Attachments'}</span>

                <div className="flex flex-col gap-2">
                  {(model?.model?.images ?? []).map((image, idx) => (
                    <div
                      className="m-2 flex items-center justify-between"
                      key={idx}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={displayLogImages[idx] ?? image}
                          className="h-[50px] w-[50px] object-cover"
                          alt=""
                        />
                        <span className="text-xs font-semibold text-primary-500">
                          {getLastSegment(image)}
                        </span>
                      </div>
                      <div
                        className="cursor-pointer text-lg font-bold text-primary-500"
                        onClick={() => {
                          window.open(
                            displayLogImages[idx] ?? image,
                            '_blank'
                          );
                        }}
                      >
                        <MdFileDownload />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col justify-start gap-2 py-6">
              <span className="text-sm text-[#616161]">{'Logged By'}</span>
              <UserCard submittedBy={model?.model?.createdBy} index={0} />

              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_3381_22010)">
                      <path
                        d="M17.9151 3.336H15.6929V5.00267C15.6929 5.16317 15.6612 5.32211 15.5998 5.47039C15.5384 5.61868 15.4484 5.75342 15.3349 5.86691C15.2214 5.9804 15.0866 6.07043 14.9384 6.13185C14.7901 6.19328 14.6311 6.22489 14.4706 6.22489C14.3101 6.22489 14.1512 6.19328 14.0029 6.13185C13.8546 6.07043 13.7199 5.9804 13.6064 5.86691C13.4929 5.75342 13.4029 5.61868 13.3414 5.47039C13.28 5.32211 13.2484 5.16317 13.2484 5.00267V3.336H6.77619V5.00267C6.77619 5.32682 6.64742 5.6377 6.4182 5.86691C6.18899 6.09612 5.87812 6.22489 5.55396 6.22489C5.22981 6.22489 4.91893 6.09612 4.68972 5.86691C4.46051 5.6377 4.33174 5.32682 4.33174 5.00267V3.336H2.10952C1.97731 3.3345 1.84614 3.35952 1.72377 3.40959C1.6014 3.45966 1.49031 3.53377 1.39708 3.62752C1.30385 3.72127 1.23036 3.83276 1.18097 3.95541C1.13158 4.07805 1.10728 4.20936 1.10952 4.34156V16.7749C1.10731 16.9048 1.13071 17.0338 1.17838 17.1546C1.22604 17.2754 1.29705 17.3857 1.38733 17.4791C1.47761 17.5724 1.58541 17.6471 1.70455 17.6988C1.8237 17.7505 1.95187 17.7783 2.08174 17.7804H17.9151C18.0449 17.7783 18.1731 17.7505 18.2923 17.6988C18.4114 17.6471 18.5192 17.5724 18.6095 17.4791C18.6998 17.3857 18.7708 17.2754 18.8184 17.1546C18.8661 17.0338 18.8895 16.9048 18.8873 16.7749V4.34156C18.8895 4.21169 18.8661 4.08266 18.8184 3.96184C18.7708 3.84101 18.6998 3.73076 18.6095 3.63739C18.5192 3.54401 18.4114 3.46933 18.2923 3.41762C18.1731 3.3659 18.0449 3.33817 17.9151 3.336ZM5.55396 14.4471H4.44285V13.336H5.55396V14.4471ZM5.55396 11.6693H4.44285V10.5582H5.55396V11.6693ZM5.55396 8.89156H4.44285V7.78045H5.55396V8.89156ZM8.8873 14.4471H7.77619V13.336H8.8873V14.4471ZM8.8873 11.6693H7.77619V10.5582H8.8873V11.6693ZM8.8873 8.89156H7.77619V7.78045H8.8873V8.89156ZM12.2206 14.4471H11.1095V13.336H12.2206V14.4471ZM12.2206 11.6693H11.1095V10.5582H12.2206V11.6693ZM12.2206 8.89156H11.1095V7.78045H12.2206V8.89156ZM15.554 14.4471H14.4429V13.336H15.554V14.4471ZM15.554 11.6693H14.4429V10.5582H15.554V11.6693ZM15.554 8.89156H14.4429V7.78045H15.554V8.89156Z"
                        fill="#616161"
                      />
                      <path
                        d="M5.55556 5.55382C5.7029 5.55382 5.84421 5.49529 5.94839 5.3911C6.05258 5.28691 6.11111 5.14561 6.11111 4.99826V1.66493C6.11111 1.51759 6.05258 1.37628 5.94839 1.27209C5.84421 1.16791 5.7029 1.10938 5.55556 1.10938C5.40821 1.10938 5.26691 1.16791 5.16272 1.27209C5.05853 1.37628 5 1.51759 5 1.66493V4.99826C5 5.14561 5.05853 5.28691 5.16272 5.3911C5.26691 5.49529 5.40821 5.55382 5.55556 5.55382Z"
                        fill="#616161"
                      />
                      <path
                        d="M14.4462 5.55382C14.5935 5.55382 14.7348 5.49529 14.839 5.3911C14.9432 5.28691 15.0017 5.14561 15.0017 4.99826V1.66493C15.0017 1.51759 14.9432 1.37628 14.839 1.27209C14.7348 1.16791 14.5935 1.10938 14.4462 1.10938C14.2988 1.10938 14.1575 1.16791 14.0533 1.27209C13.9492 1.37628 13.8906 1.51759 13.8906 1.66493V4.99826C13.8906 5.14561 13.9492 5.28691 14.0533 5.3911C14.1575 5.49529 14.2988 5.55382 14.4462 5.55382Z"
                        fill="#616161"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_3381_22010">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  <span>
                    {dateFormat(
                      model?.model?.createdAt?.toString() ??
                        new Date().toString()
                    )}
                  </span>
                </div>
                <div className="flex gap-1">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 1.875C8.39303 1.875 6.82214 2.35152 5.486 3.24431C4.14985 4.1371 3.10844 5.40605 2.49348 6.8907C1.87852 8.37535 1.71762 10.009 2.03112 11.5851C2.34463 13.1612 3.11846 14.6089 4.25476 15.7452C5.39106 16.8815 6.8388 17.6554 8.4149 17.9689C9.99099 18.2824 11.6247 18.1215 13.1093 17.5065C14.594 16.8916 15.8629 15.8502 16.7557 14.514C17.6485 13.1779 18.125 11.607 18.125 10C18.1227 7.84581 17.266 5.78051 15.7427 4.25727C14.2195 2.73403 12.1542 1.87727 10 1.875ZM14.375 10.625H10C9.83424 10.625 9.67527 10.5592 9.55806 10.4419C9.44085 10.3247 9.375 10.1658 9.375 10V5.625C9.375 5.45924 9.44085 5.30027 9.55806 5.18306C9.67527 5.06585 9.83424 5 10 5C10.1658 5 10.3247 5.06585 10.4419 5.18306C10.5592 5.30027 10.625 5.45924 10.625 5.625V9.375H14.375C14.5408 9.375 14.6997 9.44085 14.8169 9.55806C14.9342 9.67527 15 9.83424 15 10C15 10.1658 14.9342 10.3247 14.8169 10.4419C14.6997 10.5592 14.5408 10.625 14.375 10.625Z"
                      fill="#616161"
                    />
                  </svg>

                  <span>
                    {timeFormat(
                      model?.model?.createdAt?.toString() ??
                        new Date().toString()
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        }
        handleSubmit={() => {
          if (model?.model) {
            handleEdit(model.model);
          }
        }}
        submitValue={'Edit'}
        variant="text"
        cancelButton="Close"
        cancelvariant="text"
      />

      {/* Delete Modal */}
      <CustomInfoModal
        isOpen={model?.action === 'delete'}
        title={'Delete Service Log'}
        handleClose={() => {
          setModel(undefined);
        }}
        onDeleteButton={() => {
          deleteSeriveMutation.mutate({
            axiosAuth,
            id: model?.model?._id ?? '',
          });
        }}
        doneValue={deleteSeriveMutation.isLoading ? <Loader /> : 'Delete'}
        subtitle={
          'Are you sure you want to delete this service log? This action cannot be undone.'
        }
      />
    </>
  );
}

const showAssetDetailWithLabel = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div className="flex flex-col justify-start py-4">
      <span className="text-sm text-[#616161]">{label}</span>
      <span>{value}</span>
    </div>
  );
};
