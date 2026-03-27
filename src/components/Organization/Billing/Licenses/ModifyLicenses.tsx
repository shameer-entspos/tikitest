import React, { useReducer, useState } from 'react';

import CustomHr from '@/components/Ui/CustomHr';
import CustomModal from '@/components/Custom_Modal';

import { useMutation, useQuery } from 'react-query';
import { getCards } from '../Cards/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import {
  updateLicenses,
  getBillingDetails,
  BillingDetails,
} from '@/app/(main)/(org-panel)/organization/billing/api';
import toast from 'react-hot-toast';

import {
  billingReducer,
  initialState,
} from '@/app/(main)/(org-panel)/organization/billing/context';
import { BILLINGTYPE } from '@/app/helpers/organization/enums';
import { dateFormat } from '@/app/helpers/dateFormat';
import { getUsers } from '@/app/(main)/(org-panel)/organization/users/api';
import { stripeExceptionHandler } from '@/app/helpers/errors/stripe_error_handler';
import SavedCards from '../Cards/SavedCards';

/** Matches backend UserRole.USER — seats counted against userLicense.quantity */
const ORG_USER_ROLE = 2;

const license = {
  name: 'Monthly Licenses',
  price: '$1.00 USD',
  type: 'month',
  billingCycle: 'Billed Monthly',
  renewalDate: '20 Nov 2023',
  proratedBill: '$2.10 USD',
  added: 1,
  newTotal: 4,
};

const ModifyLicenses = ({
  onClose,
  onSubmit,
}: {
  onClose: any;
  onSubmit?: (newTotal?: number) => void;
}) => {
  const [state, dispatch] = useReducer(billingReducer, initialState);
  const [showSavedCards, setSavedCards] = useState(false);
  const [pendingLicenseDelta, setPendingLicenseDelta] = useState<number>(0);
  const [lastSubmittedTotal, setLastSubmittedTotal] = useState<
    number | undefined
  >(undefined);
  const axiosAuth = useAxiosAuth();

  // Fetch billing details instead of using session
  const { data: billingDetails } = useQuery<BillingDetails>({
    queryKey: 'billingDetails',
    queryFn: () => getBillingDetails(axiosAuth),
  });

  const { data: users } = useQuery({
    queryKey: 'users',
    queryFn: () => getUsers(axiosAuth),
  });

  // Calculate the displayed value: currentQuantity + delta
  const currentQuantity = Number(
    billingDetails?.user.organization?.userLicense?.quantity ?? 0
  );
  const displayedValue = currentQuantity + (state.license ?? 0);

  const licenseSeatsUsed = (users ?? []).filter(
    (u) => u.role === ORG_USER_ROLE && u.active !== false
  ).length;
  const minLicenses = Math.max(1, licenseSeatsUsed);

  const incrementMonthly = () => {
    const newValue = (state.license ?? 0) + 1;
    dispatch({
      type: BILLINGTYPE.LICENSE,
      license: newValue,
    });
  };
  const decrementMonthly = () => {
    const newValue = (state.license ?? 0) - 1;
    const nextTotal = currentQuantity + newValue;
    // Must be >= 1 and >= active users (licenses in use cannot be removed)
    if (nextTotal >= minLicenses) {
      dispatch({
        type: BILLINGTYPE.LICENSE,
        license: newValue,
      });
    }
  };
  const [loading, setLoading] = useState(false);

  const updateUserLicenseMutation = useMutation(updateLicenses, {
    onSuccess: async (_resp, variables: any) => {
      const newTotalFromRequest = Number(
        variables?.count ?? lastSubmittedTotal ?? 0
      );
      dispatch({
        type: BILLINGTYPE.LICENSE,
        license: 0,
      });

      // Don't update session directly here to avoid logout; parent onSubmit will handle UI refresh
      if (onSubmit) {
        onSubmit(newTotalFromRequest);
      }
      setPendingLicenseDelta(0);
      onClose(false);
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update licenses.';
      toast.error(msg);
    },
  });

  const { data: cdata } = useQuery('cards', () => getCards(axiosAuth));

  const handlePaymentWithCard = async (
    targetTotal: number,
    options?: { requireCard?: boolean }
  ) => {
    const requireCard = options?.requireCard !== false;
    const card: any = cdata;
    if (requireCard && !card) {
      toast.error('Please first select card.');
      return;
    }
    try {
      setLoading(true);

      setLastSubmittedTotal(targetTotal);

      updateUserLicenseMutation.mutate({
        axiosAuth,
        count: String(targetTotal),
      });
    } catch (err: any) {
      stripeExceptionHandler(err);
      setLoading(false);
    }
  };

  const dismissModal = () => {
    setPendingLicenseDelta(0);
    dispatch({ type: BILLINGTYPE.LICENSE, license: 0 });
    dispatch({ type: BILLINGTYPE.UPDATE_SECTION, section: 'manage' });
    onClose(false);
  };

  const handlePrimaryAction = () => {
    if (state.section === 'checkout') {
      const currentQuantityForPayment = Number(
        billingDetails?.user.organization?.userLicense?.quantity ?? 0
      );
      const newTotal = currentQuantityForPayment + pendingLicenseDelta;
      handlePaymentWithCard(newTotal, { requireCard: true });
      return;
    }
    if (state.section === 'manage') {
      const delta = state.license ?? 0;
      const newTotal = displayedValue;
      if (delta < 0) {
        if (newTotal < 1) {
          toast.error(
            'You must have at least one license. You cannot remove the last license.'
          );
          return;
        }
        if (newTotal < licenseSeatsUsed) {
          toast.error(
            `Cannot reduce below ${licenseSeatsUsed} license(s): ${licenseSeatsUsed} active user(s) are using licenses. Disable some users first.`
          );
          return;
        }
        handlePaymentWithCard(newTotal, { requireCard: false });
      } else if (delta > 0) {
        setPendingLicenseDelta(delta);
        dispatch({
          type: BILLINGTYPE.UPDATE_SECTION,
          section: 'checkout',
        });
      }
    }
  };

  return (
    <>
      <CustomModal
        isOpen={true}
        justifyButton="justify-center"
        handleCancel={(open: boolean) => {
          if (open === false) dismissModal();
        }}
        customCancelHandler={() => {
          if (state.section === 'checkout') {
            dispatch({
              type: BILLINGTYPE.UPDATE_SECTION,
              section: 'manage',
            });
          } else {
            dismissModal();
          }
        }}
        handleSubmit={handlePrimaryAction}
        submitValue={
          state.section === 'manage'
            ? (state.license ?? 0) < 0
              ? 'Save'
              : 'Next'
            : 'Confirm'
        }
        isLoading={loading || updateUserLicenseMutation.isLoading}
        submitDisabled={state.section === 'checkout' && !cdata}
        cancelButton={state.section === 'manage' ? 'Cancel' : 'Back'}
        cancelvariant="primaryOutLine"
        header={
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-content-center rounded-full bg-primary-100/70 p-3 text-primary-500 lg:h-[55px] lg:w-[55px]">
              <svg
                width="28"
                height="20"
                viewBox="0 0 28 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.5625 0.625C4.3193 0.625 3.12701 1.11886 2.24794 1.99794C1.36886 2.87701 0.875 4.0693 0.875 5.3125V6.25H27.125V5.3125C27.125 4.0693 26.6311 2.87701 25.7521 1.99794C24.873 1.11886 23.6807 0.625 22.4375 0.625H5.5625ZM27.125 8.125H0.875V14.6875C0.875 15.9307 1.36886 17.123 2.24794 18.0021C3.12701 18.8811 4.3193 19.375 5.5625 19.375H22.4375C23.6807 19.375 24.873 18.8811 25.7521 18.0021C26.6311 17.123 27.125 15.9307 27.125 14.6875V8.125ZM18.6875 13.75H22.4375C22.6861 13.75 22.9246 13.8488 23.1004 14.0246C23.2762 14.2004 23.375 14.4389 23.375 14.6875C23.375 14.9361 23.2762 15.1746 23.1004 15.3504C22.9246 15.5262 22.6861 15.625 22.4375 15.625H18.6875C18.4389 15.625 18.2004 15.5262 18.0246 15.3504C17.8488 15.1746 17.75 14.9361 17.75 14.6875C17.75 14.4389 17.8488 14.2004 18.0246 14.0246C18.2004 13.8488 18.4389 13.75 18.6875 13.75Z"
                  fill="#0063F7"
                />
              </svg>
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold leading-7 text-[#1E1E1E] md:text-xl">
                Manage User Licenses
              </h2>
              <span className="text-xs font-normal text-[#616161] sm:text-sm">
                Total users cannot exceed total licenses
              </span>
            </div>
          </div>
        }
        body={
          <div className="px-0 md:px-1 lg:h-[500px]">
            {state.section === 'manage' && (
              <div className="space-y-4 px-1 pt-2 sm:px-2">
                <div>
                  <p className="text-left text-sm font-normal text-gray-900 md:text-base">
                    {`${Math.max(
                      0,
                      (billingDetails?.user.organization?.userLicense
                        ?.quantity ?? 0) - licenseSeatsUsed
                    )}`}
                    /
                    {`${billingDetails?.user.organization?.userLicense?.quantity ?? 0} `}
                    User Licenses Available
                  </p>
                  <p className="text-sm text-gray-600">
                    {licenseSeatsUsed} licensed users · {(users ?? []).length}{' '}
                    in organization
                  </p>
                </div>

                <div className="flex items-center justify-between pb-4">
                  <div>
                    <h5 className="text-base font-medium">Monthly Licenses</h5>
                    <p className="text-sm text-gray-600">
                      $
                      {(
                        Number(
                          billingDetails?.user.organization?.userLicense
                            ?.pricePerLicense ?? 0
                        ) * Number(displayedValue ?? 0)
                      ).toFixed(2)}{' '}
                      USD
                    </p>
                    <p className="text-sm text-gray-600">Billed Monthly</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={decrementMonthly}
                      disabled={displayedValue <= minLicenses}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      −
                    </button>
                    <input
                      type="text"
                      value={String(displayedValue)}
                      readOnly
                      className="h-9 w-16 rounded-md border-2 border-gray-300 text-center text-sm"
                    />
                    <button
                      type="button"
                      onClick={incrementMonthly}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {state.section === 'checkout' &&
              (() => {
                const currentQuantity = Number(
                  billingDetails?.user.organization?.userLicense?.quantity ?? 0
                );
                const newTotal = currentQuantity + pendingLicenseDelta;
                const pricePerLicense = Number(
                  billingDetails?.user.organization?.userLicense
                    ?.pricePerLicense ?? 0
                );

                return (
                  <div className="px-1 pt-2 sm:px-2">
                    <div className={'space-y-8 py-4 text-sm sm:text-base'}>
                      {billingDetails?.user.organization
                        ?.accountPaymentStatus === 'active' && (
                        <div className={'space-y-2.5 sm:space-y-3'}>
                          <h4 className={'font-normal text-gray-800'}>
                            Total Due Today
                          </h4>
                          <p className={'font-medium text-black'}>
                            {' '}
                            {license.type == 'month' ? (
                              <>
                                {'$'}
                                {calculateProratedPrice(
                                  pendingLicenseDelta,
                                  pricePerLicense,
                                  billingDetails?.user.organization
                                    ?.currentActiveSubscription?.nextRenewalAt
                                )}
                                {' USD'}
                              </>
                            ) : (
                              <> {license.proratedBill}</>
                            )}{' '}
                          </p>
                        </div>
                      )}

                      <div className={'space-y-2.5 sm:space-y-3'}>
                        <label className={'flex justify-between font-normal'}>
                          <span>Select Payment Card</span>
                          <button
                            type="button"
                            className={'text-sm text-primary-500 sm:text-base'}
                            onClick={() => setSavedCards(true)}
                          >
                            Edit Card Details
                          </button>
                        </label>
                        <div className="cursor-pointer overflow-y-auto rounded-lg border border-gray-400 bg-gray-300">
                          {cdata?.cardNumber ? (
                            <p className={'px-2 py-3 font-medium text-black'}>
                              {cdata?.cardNumber}
                            </p>
                          ) : (
                            <p
                              className={'px-2 py-3 font-medium text-black'}
                              onClick={() => setSavedCards(true)}
                            >
                              No Card Selected
                            </p>
                          )}
                        </div>
                      </div>

                      <div className={'space-y-2'}>
                        <h4 className={'font-normal text-gray-900'}>
                          Credit Available: $0 USD
                        </h4>
                        <p className={'text-xs text-primary-500 sm:text-sm'}>
                          Apply credit to balance
                        </p>
                      </div>
                    </div>
                    <CustomHr />
                    <div className="mb-6">
                      <div className="flex justify-between">
                        <div>
                          <h2 className="text-lg font-medium">
                            {license.name}
                          </h2>
                          <p className="text-sm">
                            {'$'}
                            {newTotal * pricePerLicense}
                          </p>
                        </div>
                        <div className="flex justify-between gap-4 text-sm">
                          <div className="text-center">
                            <p>Added</p>
                            <p className="mt-2 font-bold">{currentQuantity}</p>
                          </div>
                          <div className="text-center">
                            <p>New Total</p>
                            <p className="mt-2 font-bold">{newTotal}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 font-normal text-gray-900">
                        <p className="text-sm">{license.billingCycle}</p>

                        <p className="text-sm">
                          Next renewal date:{' '}
                          <span className="font-bold">
                            {dateFormat(
                              new Date(
                                billingDetails?.user.organization
                                  ?.currentActiveSubscription?.nextRenewalAt ??
                                  new Date()
                              ).toString()
                            )}
                          </span>
                        </p>
                        {billingDetails?.user.organization
                          ?.accountPaymentStatus === 'active' && (
                          <p className="text-sm">
                            Prorated bill due today:
                            <span className="font-bold">
                              {'$'}
                              {calculateProratedPrice(
                                pendingLicenseDelta,
                                pricePerLicense,
                                billingDetails?.user.organization
                                  ?.currentActiveSubscription?.nextRenewalAt
                              )}
                              {' USD'}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
          </div>
        }
      />
      {showSavedCards && <SavedCards onClose={setSavedCards} />}
    </>
  );
};

export default ModifyLicenses;

function calculateProratedPrice(
  quantity: number,
  pricePerLicense: number,
  nextRenewalDate: any
): number {
  if (!nextRenewalDate) {
    return quantity * pricePerLicense;
  }
  const now = new Date();
  const nextDate = nextRenewalDate ? new Date(nextRenewalDate) : new Date();

  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Calculate number of days between today and next renewal
  const diffInMs = nextDate.getTime() - now.getTime();
  let daysBetween = Math.ceil(diffInMs / (1000 * 60 * 60 * 24)); // round up

  const dailyPrice = pricePerLicense / totalDays;

  const proratedPrice = quantity * dailyPrice * daysBetween;
  // toast.success(
  //   `Prorated bill due today: $${quantity} ${dailyPrice} * ${daysBetween} USD`
  // );
  return Math.round(proratedPrice * 100) / 100;
}
