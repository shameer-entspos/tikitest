'use client';
import { BILLINGTYPE } from '@/app/helpers/organization/enums';
import { Button } from '@/components/Buttons';
import { Card } from '@/components/Cards';
import Loader from '@/components/DottedLoader/loader';

import useAxiosAuth from '@/hooks/AxiosAuth';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import dayjs from 'dayjs';
import { BiCheck } from 'react-icons/bi';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  getInstalledAppPaymentPending,
  getSubscriptionDetails,
  cancelSubscription,
  PaymentPendingApps,
  getInvoices,
  getSelectedStoragePlanPending,
  getBillingDetails,
  BillingDetails,
} from './api';
import PaymentForm from './chockout';
import {
  BillingContext,
  BillingContextProps,
  billingReducer,
  initialState,
  useBillingCotnext,
} from './context';
import SavedCards from '@/components/Organization/Billing/Cards/SavedCards';
import AddNewCard from '@/components/Organization/Billing/Cards/NewCard';
import BillingAddress from '@/components/Organization/Billing/Cards/EditBillingAddress';
import ModifyLicenses from '@/components/Organization/Billing/Licenses/ModifyLicenses';
import CloudStorageModal from '@/components/popupModal/cloudStorage';
import { UpdateAppStore } from '@/components/Update_App_Store';
import { getCards } from '@/components/Organization/Billing/Cards/api';
import { getSelectedStorage } from '../cloud-storage/api';

const getTotalBalance = ({
  apps,
  billingDetails,
}: {
  apps: PaymentPendingApps[];
  billingDetails?: BillingDetails;
}) => {
  let totalBalance = 0;
  if (apps.length > 0) {
    for (let i = 0; i < apps.length; i++) {
      const element = apps[i];
      if (element.paymentStatus == 'paid') {
        totalBalance = totalBalance + element.app.price;
      }
    }
  }
  if (billingDetails?.user.organization?.storagePlan?.storagePlan) {
    totalBalance =
      totalBalance +
      billingDetails.user.organization.storagePlan.storagePlan.price;
  }
  if (billingDetails?.user.organization?.userLicense) {
    totalBalance =
      totalBalance +
      billingDetails.user.organization.userLicense.pricePerLicense *
        billingDetails.user.organization.userLicense.quantity;
  }
  return totalBalance;
};

const getDueBalance = ({
  apps,
  billingDetails,
}: {
  apps: PaymentPendingApps[];
  billingDetails?: BillingDetails;
}) => {
  let totalBalance = 0;
  if (apps.length > 0) {
    for (let i = 0; i < apps.length; i++) {
      const element = apps[i];
      if (element.paymentStatus == 'pending') {
        totalBalance = totalBalance + element.app.price;
      }
    }
  }
  if (
    billingDetails?.user.organization?.storagePlan?.paymentStatus === 'pending'
  ) {
    totalBalance =
      totalBalance +
      billingDetails.user.organization.storagePlan.storagePlan.price;
  }
  if (billingDetails?.user.organization?.userLicense) {
    totalBalance =
      totalBalance +
      billingDetails.user.organization.userLicense.pricePerLicense;
  }
  return totalBalance;
};
export default function Page() {
  const [state, dispatch] = useReducer(billingReducer, initialState);
  const contextValue: BillingContextProps = {
    state,
    dispatch,
  };
  const { data: session, update } = useSession() as any;
  const [showCheckout, setCheckout] = useState(false);
  const [showSavedCards, setSavedCards] = useState(false);
  // const [addNewCard, setNewCard] = useState(false);
  const [editBillingAddress, setBillingAddress] = useState(false);
  const [modifyModal, setModifyModal] = useState(false);

  const axiosAuth = useAxiosAuth();
  const { data: apps } = useQuery({
    queryKey: 'pendingPeymentApps',
    queryFn: () => getInstalledAppPaymentPending(axiosAuth),
    onSuccess: (_data) => {
      dispatch({ type: BILLINGTYPE.APPS, appIds: _data });
    },
  });
  const queryClient = useQueryClient();
  const { data: card } = useQuery('cards', () => getCards(axiosAuth));
  const { data: invoices } = useQuery('invoices', () => getInvoices(axiosAuth));

  // Fetch fresh billing details instead of using session
  const {
    data: billingDetails,
    refetch: refetchBillingDetails,
    isLoading: isLoadingBillingDetails,
  } = useQuery<BillingDetails>({
    queryKey: 'billingDetails',
    queryFn: () => getBillingDetails(axiosAuth),
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });

  // Show loader while billing details are being fetched
  if (isLoadingBillingDetails) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <BillingContext.Provider value={contextValue}>
      {showCheckout && <PaymentForm onClose={setCheckout} />}
      {showSavedCards && <SavedCards onClose={setSavedCards} />}
      {/* {addNewCard && <AddNewCard onClose={setNewCard} />} */}
      {/* {editBillingAddress && <BillingAddress onClose={setBillingAddress} />} */}
      {modifyModal && (
        <ModifyLicenses
          onClose={setModifyModal}
          onSubmit={async (newTotal?: number) => {
            try {
              if (typeof newTotal === 'number' && update) {
                await update({
                  user: {
                    ...(session?.user ?? {}),
                    user: {
                      ...(session?.user?.user ?? {}),
                      organization: {
                        ...(session?.user?.user?.organization ?? {}),
                        userLicense: {
                          ...(session?.user?.user?.organization?.userLicense ??
                            {}),
                          quantity: newTotal,
                        },
                      },
                    },
                  },
                });
              }
            } catch (_) {}
            // refresh any local billing queries if needed
            try {
              await Promise.all([
                queryClient.invalidateQueries('pendingPeymentApps'),
                queryClient.invalidateQueries('cards'),
                queryClient.invalidateQueries('invoices'),
              ]);
            } catch (_) {}
          }}
        />
      )}

      {state.showInvoice ? (
        <>
          <SubscriptionDetails dispatch={dispatch} />
        </>
      ) : (
        <>
          <div className="flex max-h-screen min-h-screen w-full max-w-[1360px] flex-1 flex-col space-y-5 overflow-auto">
            {/* header */}
            <div className="page-heading-edit flex flex-col justify-between gap-2 xl:flex-row xl:gap-0">
              {/* icon */}
              <div className="page-heading-edit flex flex-col items-center gap-4 md:flex-row xl:w-1/2">
                <div className="flex w-full items-center gap-4 md:w-max">
                  <span
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#e2f3ff] p-[5px] lg:h-[50px] lg:w-[50px]"
                    style={{
                      boxShadow: '0px 0px 2px 1.3px #0000001d',
                    }}
                  >
                    <svg
                      width="36"
                      height="26"
                      viewBox="0 0 36 26"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.75 0.5C5.0924 0.5 3.50269 1.15848 2.33058 2.33058C1.15848 3.50269 0.5 5.0924 0.5 6.75V8H35.5V6.75C35.5 5.0924 34.8415 3.50269 33.6694 2.33058C32.4973 1.15848 30.9076 0.5 29.25 0.5H6.75ZM35.5 10.5H0.5V19.25C0.5 20.9076 1.15848 22.4973 2.33058 23.6694C3.50269 24.8415 5.0924 25.5 6.75 25.5H29.25C30.9076 25.5 32.4973 24.8415 33.6694 23.6694C34.8415 22.4973 35.5 20.9076 35.5 19.25V10.5ZM24.25 18H29.25C29.5815 18 29.8995 18.1317 30.1339 18.3661C30.3683 18.6005 30.5 18.9185 30.5 19.25C30.5 19.5815 30.3683 19.8995 30.1339 20.1339C29.8995 20.3683 29.5815 20.5 29.25 20.5H24.25C23.9185 20.5 23.6005 20.3683 23.3661 20.1339C23.1317 19.8995 23 19.5815 23 19.25C23 18.9185 23.1317 18.6005 23.3661 18.3661C23.6005 18.1317 23.9185 18 24.25 18Z"
                        fill="#0063F7"
                      />
                    </svg>
                  </span>
                  <h2 className="text-lg font-semibold text-black md:text-2xl">
                    Billing & Licenses
                  </h2>
                </div>
              </div>
            </div>

            <div className="shadow-m rounded-xl bg-white px-5 py-4 lg:px-8 lg:py-6">
              <div className="flex flex-col flex-wrap items-start justify-between gap-6 md:flex-row">
                <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-6 xl:grid-cols-5 xl:gap-10">
                  <div className="">
                    <div className="text-xs text-[#616161]">Account Status</div>
                    <div className="text-xl font-semibold capitalize text-[#1E1E1E]">
                      {billingDetails?.user.organization
                        ?.accountPaymentStatus ?? 'pending'}
                    </div>
                  </div>
                  <div className="">
                    <div className="text-xs text-[#616161]">Balance Due</div>
                    <div className="text-xl font-semibold text-[#1E1E1E]">
                      ${getTotalBalance({ apps: apps ?? [], billingDetails })}{' '}
                      USD
                    </div>
                  </div>
                  <div className="">
                    <div className="text-xs text-[#616161]">
                      Available Credit
                    </div>
                    <div className="text-xl font-semibold text-[#1E1E1E]">
                      $0.00 USD
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[#616161]">Renewal Date</div>
                    <div className="text-xl font-semibold text-[#1E1E1E]">
                      {billingDetails?.user.organization
                        ?.currentActiveSubscription?.nextRenewalAt
                        ? dayjs(
                            billingDetails.user.organization
                              .currentActiveSubscription.nextRenewalAt
                          ).format('DD MMM YYYY')
                        : billingDetails?.user.organization?.storagePlan
                              ?.renewalAt
                          ? dayjs(
                              billingDetails.user.organization.storagePlan
                                .renewalAt
                            ).format('DD MMM YYYY')
                          : 'N/A'}
                    </div>
                  </div>
                  {/* <button
                    className="h-[60px] min-w-[115px] max-w-[155px] rounded-lg bg-[#0063F7] px-[20px] py-[10px] text-sm font-bold leading-[22px] text-white md:h-[47px]"
                    onClick={() => setCheckout(!showCheckout)}
                  >
                    Pay Balance
                  </button> */}
                  <div>
                    <button
                      className="cursor-pointer text-base font-semibold text-primary-500 sm:text-sm"
                      onClick={() => setSavedCards(true)}
                    >
                      Edit Payment Details
                    </button>
                    {(billingDetails?.card || card) && (
                      <div className="text-sm text-[#616161]">
                        {`**** **** **** ${(billingDetails?.card?.cardNumber || card?.cardNumber)?.slice(12)}`}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  className="ml-auto mt-2 flex-shrink-0 cursor-pointer text-base font-semibold text-primary-500 sm:ml-0"
                  onClick={() =>
                    dispatch({
                      type: BILLINGTYPE.INVOICE,
                      showInvoice: true,
                    })
                  }
                >
                  View Invoices
                </button>
              </div>
            </div>

            <div className="overflow-x-auto px-4 md:px-6 lg:px-10">
              <div className="min-w-[768px]">
                <UserLicense modifyModal={setModifyModal} />

                <PendingStoragePlan />

                <PendingAppsList apps={apps ?? []} />
              </div>
            </div>
          </div>
        </>
      )}
    </BillingContext.Provider>
  );
}

function UserLicense({ modifyModal }: { modifyModal: any }) {
  const axiosAuth = useAxiosAuth();
  const { data: billingDetails } = useQuery<BillingDetails>({
    queryKey: 'billingDetails',
    queryFn: () => getBillingDetails(axiosAuth),
  });

  return (
    <div className="flex flex-col justify-between py-8 first:pt-0 last:border-0 last:pb-0">
      <div className="mb-4 text-lg font-semibold text-black md:text-xl">
        User Licenses
      </div>

      {/* table */}
      <table className="spacing-y-2 min-w-full border-collapse">
        <thead className="border-b-2 border-gray-300 font-normal">
          <tr>
            <th className="px-1 py-2 text-start font-normal text-gray-700">
              License Type
            </th>
            <th className="px-1 py-2 text-start font-normal text-gray-700">
              Quantity
            </th>
            <th className="px-1 py-2 text-start font-normal text-gray-700">
              Cost per month
            </th>
            <th className="px-1 py-2 text-start font-normal text-gray-700">
              Billing Period
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b-2 border-gray-300">
            <td className="px-1 py-2">Monthly License</td>
            <td className="px-1 py-2">{`${billingDetails?.user.organization?.userLicense?.quantity ?? 0}`}</td>
            <td className="px-1 py-2">
              $
              {`${Number(billingDetails?.user.organization?.userLicense?.pricePerLicense ?? 0) * Number(billingDetails?.user.organization?.userLicense?.quantity ?? 0)}`}{' '}
              USD
            </td>
            <td className="px-1 py-2">Monthly</td>

            <td className="text-sm text-primary-400">
              <button type="button" onClick={() => modifyModal(true)}>
                Modify
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function PendingAppsList({ apps }: { apps: PaymentPendingApps[] }) {
  const [model, setModel] = useState<PaymentPendingApps | undefined>(undefined);

  return (
    <>
      <UpdateAppStore
        model={model?.app}
        setModel={setModel}
        isInstalled={model?.paymentStatus == 'paid'}
      />
      <div className="mb-4 pt-10 text-lg font-semibold text-black md:text-xl">
        Apps
      </div>
      <table className="spacing-y-3 min-w-full border-collapse">
        <thead className="border-b-2 border-gray-300 font-normal">
          <tr>
            <th className="px-1 py-2 text-start font-normal text-gray-700">
              App Name
            </th>
            <th className="px-1 py-2 text-start font-normal text-gray-700">
              App ID
            </th>
            <th className="px-1 py-2 text-start font-normal text-gray-700">
              Cost per user
            </th>
            <th className="px-1 py-2 text-start font-normal text-gray-700">
              Billing Period
            </th>
          </tr>
        </thead>
        <tbody>
          {(apps ?? []).map((p) => {
            return (
              <tr key={p._id} className="border-b-2 border-gray-300">
                <td className="px-1 py-2">{p.app.name ?? ''}</td>
                <td className="px-1 py-2">{p.app.appId}</td>
                <td className="px-1 py-2">${p.app.price} USD</td>

                <td className="px-1 py-2">Monthly</td>

                <td className="text-sm text-primary-400">
                  <button
                    type="button"
                    onClick={() => {
                      setModel(p);
                    }}
                  >
                    Modify
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

function PendingStoragePlan() {
  const [cloudShowModal, setCloudModal] = useState(false);

  const axiosAuth = useAxiosAuth();
  const { data, isSuccess, isLoading } = useQuery({
    queryKey: 'getSelectedStoragePlanPending',
    queryFn: () => getSelectedStoragePlanPending(axiosAuth),
  });
  if (!data) {
    return <></>;
  }
  return (
    <>
      <div className="mb-4 text-lg font-semibold text-black md:text-xl">
        Cloud Storage
      </div>
      {/* table */}
      <table className="spacing-y-2 min-w-full border-collapse">
        <thead className="border-b-2 border-gray-300 font-normal">
          <tr>
            <th className="px-1 py-2 text-start font-normal text-gray-700">
              Tier Type
            </th>
            <th></th>
            <th className="px-1 py-2 text-start font-normal text-gray-700">
              Cost per month
            </th>
            <th className="px-1 py-2 text-start font-normal text-gray-700">
              Billing Period
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b-2 border-gray-300">
            <td className="px-1 py-2">
              {data.storagePlan.totalStorageInGB ?? '0'} GB Storage Plan
            </td>
            <td className="px-6 py-2"></td>
            <td className="px-1 py-2">${data.storagePlan?.price ?? ''} USD</td>
            <td className="px-1 py-2">Monthly</td>

            <td className="text-sm text-primary-400">
              <button type="button" onClick={() => setCloudModal(true)}>
                Modify
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      {cloudShowModal && <CloudStorageModal setCloudModal={setCloudModal} />}
    </>
  );
}

function SubscriptionDetails({ dispatch }: { dispatch: any }) {
  const axiosAuth = useAxiosAuth();
  // const { data, isSuccess, isLoading, refetch } = useQuery({
  //   queryKey: '',
  //   queryFn: () => getSubscriptionDetails(axiosAuth),
  // });
  const navigateToInvoice = () => {
    dispatch({ type: BILLINGTYPE.INVOICE, showInvoice: false });
  };
  const { data, isSuccess, isLoading, refetch } = useQuery({
    queryKey: '',
    queryFn: () => getInvoices(axiosAuth),
  });
  const cancelSubscriptionMutation = useMutation(cancelSubscription, {
    onSuccess: () => {
      refetch();
    },
  });

  if (isLoading) {
    return <Loader />;
  }

  if (isSuccess) {
    return (
      <div className="w-full">
        <div className="mb-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <svg
              width="236"
              height="58"
              viewBox="0 0 236 58"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M89.5977 21.8672L83.7734 39H79.8125L74 21.8672H77.668L80.8906 32.0625C80.9453 32.2344 81.0352 32.5586 81.1602 33.0352C81.2852 33.5039 81.4102 34.0039 81.5352 34.5352C81.668 35.0586 81.7578 35.4922 81.8047 35.8359C81.8516 35.4922 81.9336 35.0586 82.0508 34.5352C82.1758 34.0117 82.2969 33.5156 82.4141 33.0469C82.5391 32.5703 82.6289 32.2422 82.6836 32.0625L85.9297 21.8672H89.5977ZM95.0586 25.8984V39H91.4844V25.8984H95.0586ZM93.2773 20.7656C93.8086 20.7656 94.2656 20.8906 94.6484 21.1406C95.0312 21.3828 95.2227 21.8398 95.2227 22.5117C95.2227 23.1758 95.0312 23.6367 94.6484 23.8945C94.2656 24.1445 93.8086 24.2695 93.2773 24.2695C92.7383 24.2695 92.2773 24.1445 91.8945 23.8945C91.5195 23.6367 91.332 23.1758 91.332 22.5117C91.332 21.8398 91.5195 21.3828 91.8945 21.1406C92.2773 20.8906 92.7383 20.7656 93.2773 20.7656ZM104.223 25.6523C105.434 25.6523 106.477 25.8867 107.352 26.3555C108.227 26.8164 108.902 27.4883 109.379 28.3711C109.855 29.2539 110.094 30.332 110.094 31.6055V33.3398H101.645C101.684 34.3477 101.984 35.1406 102.547 35.7188C103.117 36.2891 103.906 36.5742 104.914 36.5742C105.75 36.5742 106.516 36.4883 107.211 36.3164C107.906 36.1445 108.621 35.8867 109.355 35.543V38.3086C108.707 38.6289 108.027 38.8633 107.316 39.0117C106.613 39.1602 105.758 39.2344 104.75 39.2344C103.438 39.2344 102.273 38.9922 101.258 38.5078C100.25 38.0234 99.457 37.2852 98.8789 36.293C98.3086 35.3008 98.0234 34.0508 98.0234 32.543C98.0234 31.0117 98.2812 29.7383 98.7969 28.7227C99.3203 27.6992 100.047 26.9336 100.977 26.4258C101.906 25.9102 102.988 25.6523 104.223 25.6523ZM104.246 28.1953C103.551 28.1953 102.973 28.418 102.512 28.8633C102.059 29.3086 101.797 30.0078 101.727 30.9609H106.742C106.734 30.4297 106.637 29.957 106.449 29.543C106.27 29.1289 105.996 28.8008 105.629 28.5586C105.27 28.3164 104.809 28.1953 104.246 28.1953ZM123.77 39L122.762 34.418C122.707 34.1445 122.617 33.7422 122.492 33.2109C122.367 32.6719 122.23 32.0977 122.082 31.4883C121.941 30.8711 121.809 30.3008 121.684 29.7773C121.566 29.2539 121.48 28.8711 121.426 28.6289H121.32C121.266 28.8711 121.18 29.2539 121.062 29.7773C120.945 30.3008 120.812 30.8711 120.664 31.4883C120.523 32.1055 120.391 32.6875 120.266 33.2344C120.141 33.7734 120.047 34.1836 119.984 34.4648L118.93 39H115.086L111.359 25.8984H114.922L116.434 31.6992C116.535 32.1055 116.633 32.5898 116.727 33.1523C116.82 33.707 116.902 34.2461 116.973 34.7695C117.051 35.2852 117.109 35.6953 117.148 36H117.242C117.258 35.7734 117.289 35.4727 117.336 35.0977C117.391 34.7227 117.449 34.3359 117.512 33.9375C117.582 33.5312 117.645 33.168 117.699 32.8477C117.762 32.5195 117.809 32.2969 117.84 32.1797L119.457 25.8984H123.395L124.93 32.1797C124.984 32.4062 125.055 32.7656 125.141 33.2578C125.234 33.75 125.316 34.2578 125.387 34.7812C125.457 35.2969 125.496 35.7031 125.504 36H125.598C125.629 35.7344 125.684 35.3398 125.762 34.8164C125.84 34.293 125.93 33.7461 126.031 33.1758C126.141 32.5977 126.25 32.1055 126.359 31.6992L127.93 25.8984H131.434L127.66 39H123.77ZM140.07 39V21.8672H143.703V39H140.07ZM155.176 25.6523C156.574 25.6523 157.699 26.0352 158.551 26.8008C159.402 27.5586 159.828 28.7773 159.828 30.457V39H156.254V31.3477C156.254 30.4102 156.082 29.7031 155.738 29.2266C155.402 28.75 154.871 28.5117 154.145 28.5117C153.051 28.5117 152.305 28.8828 151.906 29.625C151.508 30.3672 151.309 31.4375 151.309 32.8359V39H147.734V25.8984H150.465L150.945 27.5742H151.145C151.426 27.1211 151.773 26.7539 152.188 26.4727C152.609 26.1914 153.074 25.9844 153.582 25.8516C154.098 25.7188 154.629 25.6523 155.176 25.6523ZM166.625 39L161.633 25.8984H165.371L167.902 33.3633C168.043 33.8008 168.152 34.2617 168.23 34.7461C168.316 35.2305 168.375 35.6641 168.406 36.0469H168.5C168.523 35.6328 168.578 35.1914 168.664 34.7227C168.758 34.2539 168.879 33.8008 169.027 33.3633L171.547 25.8984H175.285L170.293 39H166.625ZM189.078 32.4258C189.078 33.5195 188.93 34.4883 188.633 35.332C188.344 36.1758 187.918 36.8906 187.355 37.4766C186.801 38.0547 186.129 38.4922 185.34 38.7891C184.559 39.0859 183.676 39.2344 182.691 39.2344C181.77 39.2344 180.922 39.0859 180.148 38.7891C179.383 38.4922 178.715 38.0547 178.145 37.4766C177.582 36.8906 177.145 36.1758 176.832 35.332C176.527 34.4883 176.375 33.5195 176.375 32.4258C176.375 30.9727 176.633 29.7422 177.148 28.7344C177.664 27.7266 178.398 26.9609 179.352 26.4375C180.305 25.9141 181.441 25.6523 182.762 25.6523C183.988 25.6523 185.074 25.9141 186.02 26.4375C186.973 26.9609 187.719 27.7266 188.258 28.7344C188.805 29.7422 189.078 30.9727 189.078 32.4258ZM180.02 32.4258C180.02 33.2852 180.113 34.0078 180.301 34.5938C180.488 35.1797 180.781 35.6211 181.18 35.918C181.578 36.2148 182.098 36.3633 182.738 36.3633C183.371 36.3633 183.883 36.2148 184.273 35.918C184.672 35.6211 184.961 35.1797 185.141 34.5938C185.328 34.0078 185.422 33.2852 185.422 32.4258C185.422 31.5586 185.328 30.8398 185.141 30.2695C184.961 29.6914 184.672 29.2578 184.273 28.9688C183.875 28.6797 183.355 28.5352 182.715 28.5352C181.77 28.5352 181.082 28.8594 180.652 29.5078C180.23 30.1562 180.02 31.1289 180.02 32.4258ZM195.605 25.8984V39H192.031V25.8984H195.605ZM193.824 20.7656C194.355 20.7656 194.812 20.8906 195.195 21.1406C195.578 21.3828 195.77 21.8398 195.77 22.5117C195.77 23.1758 195.578 23.6367 195.195 23.8945C194.812 24.1445 194.355 24.2695 193.824 24.2695C193.285 24.2695 192.824 24.1445 192.441 23.8945C192.066 23.6367 191.879 23.1758 191.879 22.5117C191.879 21.8398 192.066 21.3828 192.441 21.1406C192.824 20.8906 193.285 20.7656 193.824 20.7656ZM204.688 39.2344C203.391 39.2344 202.285 39 201.371 38.5312C200.457 38.0547 199.762 37.3203 199.285 36.3281C198.809 35.3359 198.57 34.0664 198.57 32.5195C198.57 30.918 198.84 29.6133 199.379 28.6055C199.926 27.5898 200.68 26.8438 201.641 26.3672C202.609 25.8906 203.73 25.6523 205.004 25.6523C205.91 25.6523 206.691 25.7422 207.348 25.9219C208.012 26.0938 208.59 26.3008 209.082 26.543L208.027 29.3086C207.465 29.082 206.941 28.8984 206.457 28.7578C205.973 28.6094 205.488 28.5352 205.004 28.5352C204.379 28.5352 203.859 28.6836 203.445 28.9805C203.031 29.2695 202.723 29.707 202.52 30.293C202.316 30.8789 202.215 31.6133 202.215 32.4961C202.215 33.3633 202.324 34.082 202.543 34.6523C202.762 35.2227 203.078 35.6484 203.492 35.9297C203.906 36.2031 204.41 36.3398 205.004 36.3398C205.746 36.3398 206.406 36.2422 206.984 36.0469C207.562 35.8438 208.125 35.5625 208.672 35.2031V38.2617C208.125 38.6055 207.551 38.8516 206.949 39C206.355 39.1562 205.602 39.2344 204.688 39.2344ZM217.121 25.6523C218.332 25.6523 219.375 25.8867 220.25 26.3555C221.125 26.8164 221.801 27.4883 222.277 28.3711C222.754 29.2539 222.992 30.332 222.992 31.6055V33.3398H214.543C214.582 34.3477 214.883 35.1406 215.445 35.7188C216.016 36.2891 216.805 36.5742 217.812 36.5742C218.648 36.5742 219.414 36.4883 220.109 36.3164C220.805 36.1445 221.52 35.8867 222.254 35.543V38.3086C221.605 38.6289 220.926 38.8633 220.215 39.0117C219.512 39.1602 218.656 39.2344 217.648 39.2344C216.336 39.2344 215.172 38.9922 214.156 38.5078C213.148 38.0234 212.355 37.2852 211.777 36.293C211.207 35.3008 210.922 34.0508 210.922 32.543C210.922 31.0117 211.18 29.7383 211.695 28.7227C212.219 27.6992 212.945 26.9336 213.875 26.4258C214.805 25.9102 215.887 25.6523 217.121 25.6523ZM217.145 28.1953C216.449 28.1953 215.871 28.418 215.41 28.8633C214.957 29.3086 214.695 30.0078 214.625 30.9609H219.641C219.633 30.4297 219.535 29.957 219.348 29.543C219.168 29.1289 218.895 28.8008 218.527 28.5586C218.168 28.3164 217.707 28.1953 217.145 28.1953ZM235.039 35.1094C235.039 36 234.828 36.7539 234.406 37.3711C233.992 37.9805 233.371 38.4453 232.543 38.7656C231.715 39.0781 230.684 39.2344 229.449 39.2344C228.535 39.2344 227.75 39.1758 227.094 39.0586C226.445 38.9414 225.789 38.7461 225.125 38.4727V35.5195C225.836 35.8398 226.598 36.1055 227.41 36.3164C228.23 36.5195 228.949 36.6211 229.566 36.6211C230.262 36.6211 230.758 36.5195 231.055 36.3164C231.359 36.1055 231.512 35.832 231.512 35.4961C231.512 35.2773 231.449 35.082 231.324 34.9102C231.207 34.7305 230.949 34.5312 230.551 34.3125C230.152 34.0859 229.527 33.793 228.676 33.4336C227.855 33.0898 227.18 32.7422 226.648 32.3906C226.125 32.0391 225.734 31.625 225.477 31.1484C225.227 30.6641 225.102 30.0508 225.102 29.3086C225.102 28.0977 225.57 27.1875 226.508 26.5781C227.453 25.9609 228.715 25.6523 230.293 25.6523C231.105 25.6523 231.879 25.7344 232.613 25.8984C233.355 26.0625 234.117 26.3242 234.898 26.6836L233.82 29.2617C233.172 28.9805 232.559 28.75 231.98 28.5703C231.41 28.3906 230.828 28.3008 230.234 28.3008C229.711 28.3008 229.316 28.3711 229.051 28.5117C228.785 28.6523 228.652 28.8672 228.652 29.1562C228.652 29.3672 228.719 29.5547 228.852 29.7188C228.992 29.8828 229.258 30.0664 229.648 30.2695C230.047 30.4648 230.629 30.7188 231.395 31.0312C232.137 31.3359 232.781 31.6562 233.328 31.9922C233.875 32.3203 234.297 32.7305 234.594 33.2227C234.891 33.707 235.039 34.3359 235.039 35.1094Z"
                fill="#1E1E1E"
              />
              <g filter="url(#filter0_d_3352_30605)">
                <rect
                  x="4"
                  y="4"
                  width="50"
                  height="50"
                  rx="8"
                  fill="#E2F3FF"
                />
              </g>
              <path
                d="M17.75 16.5C16.0924 16.5 14.5027 17.1585 13.3306 18.3306C12.1585 19.5027 11.5 21.0924 11.5 22.75V24H46.5V22.75C46.5 21.0924 45.8415 19.5027 44.6694 18.3306C43.4973 17.1585 41.9076 16.5 40.25 16.5H17.75ZM46.5 26.5H11.5V35.25C11.5 36.9076 12.1585 38.4973 13.3306 39.6694C14.5027 40.8415 16.0924 41.5 17.75 41.5H40.25C41.9076 41.5 43.4973 40.8415 44.6694 39.6694C45.8415 38.4973 46.5 36.9076 46.5 35.25V26.5ZM35.25 34H40.25C40.5815 34 40.8995 34.1317 41.1339 34.3661C41.3683 34.6005 41.5 34.9185 41.5 35.25C41.5 35.5815 41.3683 35.8995 41.1339 36.1339C40.8995 36.3683 40.5815 36.5 40.25 36.5H35.25C34.9185 36.5 34.6005 36.3683 34.3661 36.1339C34.1317 35.8995 34 35.5815 34 35.25C34 34.9185 34.1317 34.6005 34.3661 34.3661C34.6005 34.1317 34.9185 34 35.25 34Z"
                fill="#0063F7"
              />
              <defs>
                <filter
                  id="filter0_d_3352_30605"
                  x="0"
                  y="0"
                  width="58"
                  height="58"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset />
                  <feGaussianBlur stdDeviation="2" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                  />
                  <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_3352_30605"
                  />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_3352_30605"
                    result="shape"
                  />
                </filter>
              </defs>
            </svg>
            <span className="text-sm text-[#616161]">
              showing last {(data ?? []).length}
            </span>
          </div>
          <div
            className="cursor-pointer text-base font-bold text-primary-500"
            onClick={() => navigateToInvoice()}
          >
            <svg
              width="80"
              height="24"
              viewBox="0 0 80 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M30.3457 11.5723H34.0781V16.5898C33.554 16.763 33.0117 16.8975 32.4512 16.9932C31.8906 17.0889 31.2617 17.1367 30.5645 17.1367C29.5482 17.1367 28.6868 16.9362 27.9805 16.5352C27.2786 16.1296 26.7454 15.5439 26.3809 14.7783C26.0163 14.0081 25.834 13.0807 25.834 11.9961C25.834 10.9525 26.0368 10.0479 26.4424 9.28223C26.848 8.51204 27.4382 7.91732 28.2129 7.49805C28.9876 7.07422 29.9264 6.8623 31.0293 6.8623C31.5716 6.8623 32.0957 6.91699 32.6016 7.02637C33.112 7.13118 33.5791 7.27702 34.0029 7.46387L33.4287 8.81738C33.0915 8.65788 32.7132 8.52344 32.2939 8.41406C31.8747 8.30469 31.4395 8.25 30.9883 8.25C30.2728 8.25 29.6553 8.40495 29.1357 8.71484C28.6208 9.02474 28.2243 9.46224 27.9463 10.0273C27.6683 10.5879 27.5293 11.251 27.5293 12.0166C27.5293 12.7594 27.641 13.4111 27.8643 13.9717C28.0876 14.5322 28.4362 14.9697 28.9102 15.2842C29.3887 15.5941 30.0062 15.749 30.7627 15.749C31.141 15.749 31.4622 15.7285 31.7266 15.6875C31.9909 15.6465 32.2347 15.6009 32.458 15.5508V12.9736H30.3457V11.5723ZM43.0059 13.1992C43.0059 13.8281 42.9238 14.3864 42.7598 14.874C42.5957 15.3617 42.3564 15.7741 42.042 16.1113C41.7275 16.444 41.3493 16.6992 40.9072 16.877C40.4652 17.0501 39.9661 17.1367 39.4102 17.1367C38.8906 17.1367 38.4144 17.0501 37.9814 16.877C37.5485 16.6992 37.1725 16.444 36.8535 16.1113C36.5391 15.7741 36.2952 15.3617 36.1221 14.874C35.9489 14.3864 35.8623 13.8281 35.8623 13.1992C35.8623 12.3652 36.0059 11.6589 36.293 11.0801C36.5846 10.4967 36.9993 10.0524 37.5371 9.74707C38.0749 9.44173 38.7152 9.28906 39.458 9.28906C40.1553 9.28906 40.7705 9.44173 41.3037 9.74707C41.8369 10.0524 42.2539 10.4967 42.5547 11.0801C42.8555 11.6634 43.0059 12.3698 43.0059 13.1992ZM37.5166 13.1992C37.5166 13.7507 37.5827 14.2223 37.7148 14.6143C37.8516 15.0062 38.0612 15.307 38.3438 15.5166C38.6263 15.7217 38.9909 15.8242 39.4375 15.8242C39.8841 15.8242 40.2487 15.7217 40.5312 15.5166C40.8138 15.307 41.0212 15.0062 41.1533 14.6143C41.2855 14.2223 41.3516 13.7507 41.3516 13.1992C41.3516 12.6478 41.2855 12.1807 41.1533 11.7979C41.0212 11.4105 40.8138 11.1165 40.5312 10.916C40.2487 10.7109 39.8818 10.6084 39.4307 10.6084C38.7653 10.6084 38.2799 10.8317 37.9746 11.2783C37.6693 11.7249 37.5166 12.3652 37.5166 13.1992ZM48.6523 7.00586H51.626C52.9157 7.00586 53.8887 7.19271 54.5449 7.56641C55.2012 7.9401 55.5293 8.58496 55.5293 9.50098C55.5293 9.88379 55.4609 10.2301 55.3242 10.54C55.1921 10.8454 54.9984 11.0983 54.7432 11.2988C54.488 11.4948 54.1735 11.627 53.7998 11.6953V11.7637C54.1872 11.832 54.5312 11.9528 54.832 12.126C55.1374 12.2992 55.3766 12.5475 55.5498 12.8711C55.7275 13.1947 55.8164 13.6139 55.8164 14.1289C55.8164 14.7396 55.6706 15.2591 55.3789 15.6875C55.0918 16.1159 54.6794 16.4417 54.1416 16.665C53.6084 16.8883 52.9749 17 52.2412 17H48.6523V7.00586ZM50.293 11.1279H51.8652C52.6081 11.1279 53.123 11.0072 53.4102 10.7656C53.6973 10.5241 53.8408 10.1709 53.8408 9.70605C53.8408 9.2321 53.6699 8.8903 53.3281 8.68066C52.9909 8.47103 52.4531 8.36621 51.7148 8.36621H50.293V11.1279ZM50.293 12.4541V15.626H52.0225C52.7881 15.626 53.3258 15.4779 53.6357 15.1816C53.9456 14.8854 54.1006 14.4844 54.1006 13.9785C54.1006 13.6686 54.0299 13.3997 53.8887 13.1719C53.752 12.944 53.5264 12.7686 53.2119 12.6455C52.8975 12.5179 52.4736 12.4541 51.9404 12.4541H50.293ZM60.6836 9.28906C61.6406 9.28906 62.363 9.50098 62.8506 9.9248C63.3428 10.3486 63.5889 11.0094 63.5889 11.9072V17H62.4473L62.1396 15.9268H62.085C61.8708 16.2002 61.6497 16.4258 61.4219 16.6035C61.194 16.7812 60.9297 16.9134 60.6289 17C60.3327 17.0911 59.9704 17.1367 59.542 17.1367C59.0908 17.1367 58.6875 17.0547 58.332 16.8906C57.9766 16.722 57.6963 16.4668 57.4912 16.125C57.2861 15.7832 57.1836 15.3503 57.1836 14.8262C57.1836 14.0469 57.473 13.4613 58.0518 13.0693C58.6351 12.6774 59.5146 12.4609 60.6904 12.4199L62.0029 12.3721V11.9756C62.0029 11.4515 61.8799 11.0778 61.6338 10.8545C61.3923 10.6312 61.0505 10.5195 60.6084 10.5195C60.2301 10.5195 59.8633 10.5742 59.5078 10.6836C59.1523 10.793 58.806 10.9274 58.4688 11.0869L57.9492 9.95215C58.3184 9.75618 58.7376 9.59668 59.207 9.47363C59.681 9.35059 60.1732 9.28906 60.6836 9.28906ZM61.9961 13.3838L61.0186 13.418C60.2165 13.4453 59.6536 13.582 59.3301 13.8281C59.0065 14.0742 58.8447 14.4115 58.8447 14.8398C58.8447 15.2135 58.9564 15.487 59.1797 15.6602C59.403 15.8288 59.6969 15.9131 60.0615 15.9131C60.6175 15.9131 61.0778 15.7559 61.4424 15.4414C61.8115 15.1224 61.9961 14.6553 61.9961 14.04V13.3838ZM68.8867 17.1367C68.1712 17.1367 67.5514 16.9977 67.0273 16.7197C66.5033 16.4417 66.0999 16.0156 65.8174 15.4414C65.5348 14.8672 65.3936 14.138 65.3936 13.2539C65.3936 12.3333 65.5485 11.5814 65.8584 10.998C66.1683 10.4147 66.5967 9.98405 67.1436 9.70605C67.695 9.42806 68.3262 9.28906 69.0371 9.28906C69.4883 9.28906 69.8962 9.33464 70.2607 9.42578C70.6299 9.51237 70.9421 9.61947 71.1973 9.74707L70.7188 11.0322C70.4408 10.9183 70.1559 10.8226 69.8643 10.7451C69.5726 10.6676 69.2923 10.6289 69.0234 10.6289C68.5814 10.6289 68.2122 10.7269 67.916 10.9229C67.6243 11.1188 67.4056 11.4105 67.2598 11.7979C67.1185 12.1852 67.0479 12.666 67.0479 13.2402C67.0479 13.7962 67.1208 14.2656 67.2666 14.6484C67.4124 15.0267 67.6289 15.3138 67.916 15.5098C68.2031 15.7012 68.5563 15.7969 68.9756 15.7969C69.3903 15.7969 69.7617 15.7467 70.0898 15.6465C70.418 15.5462 70.7279 15.4163 71.0195 15.2568V16.6514C70.7324 16.8154 70.4248 16.9362 70.0967 17.0137C69.7686 17.0957 69.3652 17.1367 68.8867 17.1367ZM74.4033 6.36328V11.5039C74.4033 11.7363 74.3942 11.9915 74.376 12.2695C74.3577 12.543 74.3395 12.8005 74.3213 13.042H74.3555C74.474 12.8825 74.6152 12.6956 74.7793 12.4814C74.9479 12.2673 75.1074 12.0804 75.2578 11.9209L77.5684 9.43262H79.4141L76.3857 12.6865L79.6123 17H77.7256L75.3057 13.6777L74.4033 14.4502V17H72.7969V6.36328H74.4033Z"
                fill="#0063F7"
              />
              <path
                d="M15 18L9 12L15 6"
                stroke="#0063F7"
                stroke-width="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div>
          <div className="flex flex-col">
            <div className="grid grid-cols-10 items-center justify-between rounded-lg bg-[#F5F5F5]">
              <div className="col-span-6 flex gap-2 p-4 text-sm font-semibold text-black">
                <span> Invoice No </span>
                <img
                  src="/svg/sort-arrow.svg"
                  alt="arrow"
                  className="h-5 w-5"
                />
              </div>
              <span>Amount</span>
              <div className="col-span-2 flex gap-2 p-4 text-sm font-semibold text-black">
                <span> Date </span>
                <img
                  src="/svg/sort-arrow.svg"
                  alt="arrow"
                  className="h-5 w-5"
                />
              </div>
              <div></div>
            </div>
            <div>
              {(data ?? []).map((invoice, index) => {
                return (
                  <div
                    key={index}
                    className="grid grid-cols-10 items-center justify-between rounded-lg bg-white even:bg-[#F5F5F5]"
                  >
                    <div className="col-span-6 flex gap-2 p-4 text-sm font-semibold text-black">
                      <span className="text-sm text-[#616161]">
                        {' '}
                        {invoice.id}{' '}
                      </span>
                    </div>
                    <span className="text-sm text-[#616161]">
                      ${invoice.total / 100}
                    </span>
                    <div className="col-span-2 flex gap-2 p-4 text-sm font-semibold text-black">
                      <span className="text-sm text-[#616161]">
                        {dayjs(Number(invoice.created) * 1000).format(
                          'DD MMM YYYY hh:mm A'
                        )}
                      </span>
                    </div>
                    <div
                      className="flex cursor-pointer justify-end pr-8"
                      onClick={() => {
                        // on hit donwload the invoice that have invoice.invoice_pdf
                        if (invoice.invoice_pdf) {
                          window.open(invoice.invoice_pdf, '_blank');
                        }
                      }}
                    >
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 30 30"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20.7375 11.25H18.75V5C18.75 4.3125 18.1875 3.75 17.5 3.75H12.5C11.8125 3.75 11.25 4.3125 11.25 5V11.25H9.2625C8.15 11.25 7.5875 12.6 8.375 13.3875L14.1125 19.125C14.6 19.6125 15.3875 19.6125 15.875 19.125L21.6125 13.3875C22.4 12.6 21.85 11.25 20.7375 11.25ZM6.25 23.75C6.25 24.4375 6.8125 25 7.5 25H22.5C23.1875 25 23.75 24.4375 23.75 23.75C23.75 23.0625 23.1875 22.5 22.5 22.5H7.5C6.8125 22.5 6.25 23.0625 6.25 23.75Z"
                          fill="#616161"
                        />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return <></>;
}
