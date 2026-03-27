import {
  checkInAsset,
  checkOutAsset,
  getCustomersList,
} from '@/app/(main)/(user-panel)/user/apps/am/api';
import {
  getAllAppProjects,
  getAllOrgUsers,
} from '@/app/(main)/(user-panel)/user/apps/api';
import { SingleAsset } from '@/app/type/single_asset';
import Loader from '@/components/DottedLoader/loader';
import { SimpleInput } from '@/components/Form/simpleInput';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import useAxiosAuth from '@/hooks/AxiosAuth';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import { useFormik } from 'formik';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getPresignedFileUrls } from '@/app/(main)/(user-panel)/user/file/api';
import * as Yup from 'yup';
import { AssetStatus } from '../../Enum';

import { Button } from '@/components/Buttons';
export const ViewAssetCart = ({
  selectedAsset,
  from,
  onAdd,
  handleClose,
}: {
  handleClose: () => void;
  onAdd?: any;
  selectedAsset: SingleAsset[];
  from: 'checkout' | 'checkin';
}) => {
  //TODO combine detail
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };
  const [section, setSection] = useState<'cart' | 'other'>(
    onAdd ? 'cart' : 'other'
  );
  //TODO check in dettail
  const [status, setStatus] = useState('Healthy');
  const checkInMutation = useMutation(checkInAsset, {
    onSuccess: () => {
      handleClose();
      setProjects([]);
      setUsers([]);
      queryClient.invalidateQueries('checkInAssetList');
    },
  });
  const handleCheckinSubmit = async () => {
    const data = {
      assetIds: selectedAsset.map((as) => as._id),
      condition: status,
    };
    checkInMutation.mutate({
      axiosAuth,
      data,
    });
  };

  //TODO checkout Detail
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;
  const [projects, setProjects] = useState<any>([]);
  const [users, setUsers] = useState<any>([]);
  const [selectedOption, setSelectedOption] = useState<
    'me' | 'contacts' | 'custom'
  >('me');
  const cartPhotoKeys = (selectedAsset ?? [])
    .map((i) => (i.photos ?? [])[0])
    .filter(Boolean) as string[];
  const [resolvedCartPhotos, setResolvedCartPhotos] = useState<
    string[] | null
  >(null);

  useEffect(() => {
    if (!cartPhotoKeys.length || !accessToken?.trim()) {
      setResolvedCartPhotos(null);
      return;
    }
    let cancelled = false;
    getPresignedFileUrls(axiosAuth, cartPhotoKeys, accessToken).then((urls) => {
      if (!cancelled && urls && urls.length === cartPhotoKeys.length)
        setResolvedCartPhotos(urls);
    });
    return () => {
      cancelled = true;
    };
  }, [cartPhotoKeys.join('|'), accessToken, axiosAuth]);
  const checkOutMutation = useMutation(checkOutAsset, {
    onSuccess: () => {
      handleClose();
      setProjects([]);
      setUsers([]);
      queryClient.invalidateQueries('checkOutAssetList');
    },
  });

  const appFormValidatorSchema = Yup.object().shape({
    // Email validation
    organizationName: Yup.string().required('organizationName is required'),
    firstName: Yup.string().required('firstName is required'),

    lastName: Yup.string().required('lastName is required'),

    email: Yup.string().email().required('email is required'),
  });
  const organizationForm = useFormik({
    initialValues: {
      organizationName: '',
      firstName: '',
      lastName: '',
      email: '',
    },

    validationSchema: appFormValidatorSchema,
    onSubmit: (values) => {
      handleCheckOutSubmit();
    },
  });

  const handleCheckOutSubmit = async () => {
    var data;
    if (selectedOption == 'custom') {
      data = {
        assetIds: selectedAsset.map((as) => as._id),
        userIds: users,
        projectIds: projects,
        checkoutAs: selectedOption, // me , custom ,contact,
        customUser: {
          firstName: organizationForm.values.firstName,
          lastName: organizationForm.values.lastName,
          organizationName: organizationForm.values.organizationName,
          email: organizationForm.values.email,
        },
      };
    } else {
      data = {
        assetIds: selectedAsset.map((as) => as._id),
        userIds: selectedOption == 'me' ? [session?.user.user._id] : users,
        projectIds: projects,
        checkoutAs: selectedOption, // me , custom ,contact,
      };
    }
    console.log(data);
    checkOutMutation.mutate({
      axiosAuth,
      data,
    });
  };
  const { data: allProjects } = useQuery({
    queryKey: 'allUserAssignedProjects',
    queryFn: () => getAllAppProjects(axiosAuth),
  });
  const { data: allUsers } = useQuery({
    queryKey: 'listofUsersForApp',
    queryFn: () => getAllOrgUsers(axiosAuth),
    refetchOnWindowFocus: false,
  });
  const { data: customers } = useQuery({
    queryKey: 'customersList',
    queryFn: () => getCustomersList(axiosAuth),
    refetchOnWindowFocus: false,
  });
  const assetStatuses = Object.entries(AssetStatus).map(([key, value]) => ({
    label: value, // Label from Enum value
    value: value, // Key as unique identifier
  }));
  //TODO UI Section
  return (
    <>
      <Modal
        isOpen={true}
        onOpenChange={handleClose}
        placement="auto"
        backdrop="blur"
        size="lg"
      >
        <ModalContent className="max-w-[600px] rounded-3xl bg-white">
          {(onCloseModal) => (
            <>
              <ModalHeader className="flex flex-row items-start justify-between gap-2 px-5 py-4">
                <div className="flex w-full flex-row items-start gap-4 border-b-2 border-gray-200 py-2">
                  {section == 'cart' ? (
                    <>
                      <svg
                        width="50"
                        height="50"
                        viewBox="0 0 50 50"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                        <g clipPath="url(#clip0_2869_3571)">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M39.115 15.5746C39.376 15.6787 39.5999 15.8587 39.7576 16.0913C39.9154 16.324 39.9998 16.5985 40 16.8796V33.1208C39.9998 33.4019 39.9154 33.6764 39.7576 33.909C39.5999 34.1416 39.376 34.3216 39.115 34.4258L25.5212 39.8633C25.186 39.9974 24.8121 39.9974 24.4769 39.8633L10.8831 34.4258C10.6224 34.3213 10.399 34.1412 10.2416 33.9086C10.0842 33.676 10.0001 33.4016 10 33.1208V16.8796C10.0001 16.5987 10.0842 16.3243 10.2416 16.0917C10.399 15.8592 10.6224 15.679 10.8831 15.5746L23.9556 10.3452L23.9631 10.3433L24.4769 10.1371C24.8126 10.0025 25.1874 10.0025 25.5231 10.1371L26.0369 10.3433L26.0444 10.3452L39.115 15.5746ZM36.5387 16.5627L25 21.1789L13.4612 16.5627L11.875 17.1983V17.9483L24.0625 22.8233V37.6771L25 38.0521L25.9375 37.6771V22.8252L38.125 17.9502V17.2002L36.5387 16.5627Z"
                            fill="#0063F7"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_2869_3571">
                            <rect
                              width="30"
                              height="30"
                              fill="white"
                              transform="translate(10 10)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                    </>
                  ) : from == 'checkin' ? (
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
                          d="M23.414 35.4144C23.0389 35.7894 22.5303 36 22 36C21.4697 36 20.9611 35.7894 20.586 35.4144L11.586 26.4144C11.2111 26.0394 11.0004 25.5308 11.0004 25.0004C11.0004 24.4701 11.2111 23.9615 11.586 23.5864L20.586 14.5864C20.9632 14.2221 21.4684 14.0205 21.9928 14.0251C22.5172 14.0296 23.0188 14.24 23.3896 14.6108C23.7605 14.9816 23.9708 15.4832 23.9753 16.0076C23.9799 16.532 23.7783 17.0372 23.414 17.4144L18 23.0004L37 23.0004C37.5304 23.0004 38.0391 23.2111 38.4142 23.5862C38.7893 23.9613 39 24.47 39 25.0004C39 25.5309 38.7893 26.0396 38.4142 26.4146C38.0391 26.7897 37.5304 27.0004 37 27.0004L18 27.0004L23.414 32.5864C23.7889 32.9615 23.9996 33.4701 23.9996 34.0004C23.9996 34.5308 23.7889 35.0394 23.414 35.4144Z"
                          fill="#0063F7"
                        />
                      </svg>
                    </>
                  ) : (
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
                          d="M26.586 14.5856C26.9611 14.2106 27.4697 14 28 14C28.5303 14 29.0389 14.2106 29.414 14.5856L38.414 23.5856C38.7889 23.9606 38.9996 24.4692 38.9996 24.9996C38.9996 25.5299 38.7889 26.0385 38.414 26.4136L29.414 35.4136C29.0368 35.7779 28.5316 35.9795 28.0072 35.9749C27.4828 35.9704 26.9812 35.76 26.6104 35.3892C26.2395 35.0184 26.0292 34.5168 26.0247 33.9924C26.0201 33.468 26.2217 32.9628 26.586 32.5856L32 26.9996H13C12.4696 26.9996 11.9609 26.7889 11.5858 26.4138C11.2107 26.0387 11 25.53 11 24.9996C11 24.4691 11.2107 23.9604 11.5858 23.5854C11.9609 23.2103 12.4696 22.9996 13 22.9996H32L26.586 17.4136C26.2111 17.0385 26.0004 16.5299 26.0004 15.9996C26.0004 15.4692 26.2111 14.9606 26.586 14.5856Z"
                          fill="#0063F7"
                        />
                      </svg>
                    </>
                  )}
                  <div>
                    <h1>
                      {section == 'cart' ? (
                        <>View Cart</>
                      ) : from == 'checkin' ? (
                        <>Check in Asset</>
                      ) : (
                        <>Check out Asset</>
                      )}
                    </h1>

                    <span className="text-sm font-normal text-[#616161]">
                      {section == 'cart' ? (
                        <>{'View added assets in your cart below.'}</>
                      ) : from == 'checkin' ? (
                        <>
                          Review the asset status options below before checking
                          in.
                        </>
                      ) : (
                        <>Check out this asset and assign it to a contact.</>
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <svg
                    onClick={onCloseModal}
                    className="cursor-pointer"
                    width="18"
                    height="18"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.5875 0.423757C14.4834 0.319466 14.3598 0.236725 14.2237 0.180271C14.0876 0.123817 13.9417 0.0947577 13.7944 0.0947577C13.647 0.0947577 13.5011 0.123817 13.365 0.180271C13.229 0.236725 13.1053 0.319466 13.0012 0.423757L7.5 5.91376L1.99875 0.412507C1.8946 0.308353 1.77095 0.225733 1.63486 0.169364C1.49878 0.112996 1.35292 0.0839844 1.20563 0.0839844C1.05833 0.0839844 0.912473 0.112996 0.776388 0.169364C0.640304 0.225733 0.516654 0.308353 0.4125 0.412507C0.308345 0.516662 0.225725 0.640311 0.169357 0.776396C0.112989 0.912481 0.0839767 1.05834 0.0839767 1.20563C0.0839767 1.35293 0.112989 1.49878 0.169357 1.63487C0.225725 1.77095 0.308345 1.8946 0.4125 1.99876L5.91375 7.50001L0.4125 13.0013C0.308345 13.1054 0.225725 13.2291 0.169357 13.3651C0.112989 13.5012 0.0839767 13.6471 0.0839767 13.7944C0.0839767 13.9417 0.112989 14.0875 0.169357 14.2236C0.225725 14.3597 0.308345 14.4834 0.4125 14.5875C0.516654 14.6917 0.640304 14.7743 0.776388 14.8306C0.912473 14.887 1.05833 14.916 1.20563 14.916C1.35292 14.916 1.49878 14.887 1.63486 14.8306C1.77095 14.7743 1.8946 14.6917 1.99875 14.5875L7.5 9.08626L13.0012 14.5875C13.1054 14.6917 13.2291 14.7743 13.3651 14.8306C13.5012 14.887 13.6471 14.916 13.7944 14.916C13.9417 14.916 14.0875 14.887 14.2236 14.8306C14.3597 14.7743 14.4833 14.6917 14.5875 14.5875C14.6917 14.4834 14.7743 14.3597 14.8306 14.2236C14.887 14.0875 14.916 13.9417 14.916 13.7944C14.916 13.6471 14.887 13.5012 14.8306 13.3651C14.7743 13.2291 14.6917 13.1054 14.5875 13.0013L9.08625 7.50001L14.5875 1.99876C15.015 1.57126 15.015 0.851258 14.5875 0.423757Z"
                      fill="#616161"
                    />
                  </svg>
                </div>
              </ModalHeader>
              <ModalBody className="">
                {section == 'cart' && onAdd ? (
                  <div className={`max-h-[480px] w-full`}>
                    <div className="flex h-[480px] w-full flex-col gap-2 overflow-y-scroll px-2 scrollbar-hide">
                      {
                        <>
                          {selectedAsset.map((item, index) => {
                            return (
                              <div
                                key={item._id}
                                className="flex items-center justify-between rounded-md border border-gray-300 pr-2"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="h-20 w-20 overflow-hidden rounded-md p-1">
                                    <img
                                      src={
                                        (item.photos ?? [])?.length > 0
                                          ? (resolvedCartPhotos?.[index] ??
                                              item.photos![0])
                                          : '/svg/no-image.svg'
                                      }
                                      alt="avatar"
                                      className="h-full w-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                          '/svg/no-image.svg';
                                      }}
                                    />
                                  </div>
                                  <div className="flex flex-col justify-start py-2">
                                    <span className="text-sm">{item.name}</span>
                                    <span className="text-sm">
                                      {item.atnNum}
                                    </span>
                                  </div>
                                </div>
                                <div
                                  className="cursor-pointer"
                                  onClick={() => {
                                    onAdd(item);
                                  }}
                                >
                                  <svg
                                    width="25"
                                    height="25"
                                    viewBox="0 0 25 25"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M12.5 1.5625C6.40625 1.5625 1.5625 6.40625 1.5625 12.5C1.5625 18.5938 6.40625 23.4375 12.5 23.4375C18.5938 23.4375 23.4375 18.5938 23.4375 12.5C23.4375 6.40625 18.5938 1.5625 12.5 1.5625ZM16.7188 17.9688L12.5 13.75L8.28125 17.9688L7.03125 16.7188L11.25 12.5L7.03125 8.28125L8.28125 7.03125L12.5 11.25L16.7188 7.03125L17.9688 8.28125L13.75 12.5L17.9688 16.7188L16.7188 17.9688Z"
                                      fill="#6990FF"
                                    />
                                  </svg>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      }
                    </div>
                  </div>
                ) : from == 'checkout' ? (
                  <>
                    <div className="h-[500px] w-full overflow-auto px-4">
                      <div className="mb-4 flex flex-col space-y-4 p-2">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="option"
                            checked={selectedOption == 'me'}
                            onClick={() => setSelectedOption('me')}
                            className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                          />
                          <span className="ml-2">Check out to me</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="option"
                            checked={selectedOption == 'contacts'}
                            onClick={() => setSelectedOption('contacts')}
                            className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                          />
                          <span className="ml-2">Select from contacts</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="option"
                            checked={selectedOption == 'custom'}
                            onClick={() => setSelectedOption('custom')}
                            className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                          />
                          <span className="ml-2">Custom</span>
                        </label>
                      </div>
                      {/* /// contact section  */}

                      {selectedOption == 'contacts' && (
                        <div className="mb-8 w-full">
                          <CustomSearchSelect
                            label="Select contact "
                            data={[
                              // All organization users (role 2, 3)
                              ...(allUsers ?? [])
                                .filter((u) => u.role === 2 || u.role === 3)
                                .map((p) => {
                                  return {
                                    label: `${p.firstName} ${p.lastName}`,
                                    value: p._id,
                                    photo: p.photo,
                                  };
                                }),
                              // All customers (role 4)
                              ...(customers ?? [])
                                .filter((c) => c.role === 4)
                                .map((c) => {
                                  return {
                                    label: c.customerName
                                      ? `${c.customerName} - ${c.userId}`
                                      : `${c.firstName} ${c.lastName}`,
                                    value: c._id,
                                    photo: c.photo,
                                  };
                                }),
                              // All suppliers (role 5)
                              ...(customers ?? [])
                                .filter((c) => c.role === 5)
                                .map((c) => {
                                  return {
                                    label: c.customerName
                                      ? `${c.customerName} - ${c.userId}`
                                      : `${c.firstName} ${c.lastName}`,
                                    value: c._id,
                                    photo: c.photo,
                                  };
                                }),
                            ]}
                            onSelect={(values) => {
                              if (values.length > 0) {
                                setUsers(values);
                              }
                            }}
                            selected={users}
                            hasError={false}
                            showImage={true}
                            multiple={true}
                            isRequired={true}
                            isOpen={openDropdown === 'dropdown1'}
                            onToggle={() => handleToggle('dropdown1')}
                          />
                        </div>
                      )}
                      {/* //// custom section  */}
                      {selectedOption == 'custom' && (
                        <>
                          <div className="w-full">
                            <SimpleInput
                              label="Organization"
                              type="text"
                              placeholder="Enter model of asset"
                              name="organizationName"
                              className="w-full"
                              required
                              errorMessage={
                                organizationForm.errors.organizationName
                              }
                              value={organizationForm.values.organizationName}
                              isTouched={
                                organizationForm.touched.organizationName
                              }
                              onChange={organizationForm.handleChange}
                            />
                          </div>
                          <div className="w-full">
                            <SimpleInput
                              label="First Name"
                              type="text"
                              placeholder="Enter model of asset"
                              name="firstName"
                              className="w-full"
                              required
                              errorMessage={organizationForm.errors.firstName}
                              value={organizationForm.values.firstName}
                              isTouched={organizationForm.touched.firstName}
                              onChange={organizationForm.handleChange}
                            />
                          </div>
                          <div className="w-full">
                            <SimpleInput
                              label="Last Name"
                              type="text"
                              placeholder="Enter model of asset"
                              name="lastName"
                              className="w-full"
                              required
                              errorMessage={organizationForm.errors.lastName}
                              value={organizationForm.values.lastName}
                              isTouched={organizationForm.touched.lastName}
                              onChange={organizationForm.handleChange}
                            />
                          </div>
                          <div className="w-full">
                            <SimpleInput
                              label="Email"
                              type="text"
                              placeholder="Enter model of asset"
                              name="email"
                              className="w-full"
                              required
                              errorMessage={organizationForm.errors.email}
                              value={organizationForm.values.email}
                              isTouched={organizationForm.touched.email}
                              onChange={organizationForm.handleChange}
                            />
                          </div>
                        </>
                      )}
                      {/* //// project section  */}
                      <div className="mb-8 w-full">
                        <CustomSearchSelect
                          label="Assign to Project "
                          data={(allProjects ?? []).map((p) => {
                            return {
                              label: p.name,
                              value: p._id,
                            };
                          })}
                          onSelect={(values) => {
                            setProjects(values);
                          }}
                          selected={projects}
                          hasError={false}
                          showImage={false}
                          multiple={true}
                          isRequired={false}
                          isOpen={openDropdown === 'dropdown2'}
                          onToggle={() => handleToggle('dropdown2')}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-[100px] px-4">
                    <div className="mb-8 w-full">
                      <CustomSearchSelect
                        label="Select Asset Status"
                        data={assetStatuses}
                        onSelect={(value, item) => {
                          if (typeof value == 'string') {
                            setStatus(value);
                          }
                        }}
                        returnSingleValueWithLabel={true}
                        searchPlaceholder="Select Asset Status"
                        selected={[status]}
                        hasError={false}
                        showImage={false}
                        multiple={false}
                        isOpen={openDropdown === 'dropdown1'}
                        onToggle={() => handleToggle('dropdown1')}
                      />
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="flex items-center justify-between gap-10 border-t-2 border-gray-200">
                {section == 'cart' ? (
                  <div> {selectedAsset.length} Items</div>
                ) : (
                  <div></div>
                )}

                <div className="flex justify-center gap-2">
                  <Button variant="primaryOutLine" onClick={onCloseModal}>
                    Cancel
                  </Button>
                  <Button
                    variant={`primary`}
                    onClick={() => {
                      if (section == 'other') {
                        if (from == 'checkout') {
                          if (selectedOption == 'custom') {
                            organizationForm.submitForm();
                          } else {
                            handleCheckOutSubmit();
                          }
                        } else {
                          handleCheckinSubmit();
                        }
                      } else {
                        setSection('other');
                      }
                    }}
                  >
                    {from == 'checkout' ? (
                      <>
                        {checkOutMutation.isLoading ? <Loader /> : 'Check out'}
                      </>
                    ) : (
                      <>{checkInMutation.isLoading ? <Loader /> : 'Check in'}</>
                    )}
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
