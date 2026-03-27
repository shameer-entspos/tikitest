import {
  getSizeofStorage,
  getStoragePlans,
  StoragePlan,
  upgradeStoragePlan,
} from '@/app/(main)/(org-panel)/organization/cloud-storage/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Button } from '../Buttons';
import Loader from '../DottedLoader/loader';
import DropdownComponent from '../DropDownMenu/Dropdown';
import { Input } from '../Form/Input';
import { Search } from '../Form/search';
import CustomHr from '../Ui/CustomHr';
import { X } from 'lucide-react';
import CustomModal from '../Custom_Modal';
import { useSession } from 'next-auth/react';
import { dateFormat } from '@/app/helpers/dateFormat';
import toast from 'react-hot-toast';
import { getCards } from '../Organization/Billing/Cards/api';
import AddNewCard from '../Organization/Billing/Cards/NewCard';
import { SelectOption } from '../Form/select';
import SavedCards from '../Organization/Billing/Cards/SavedCards';
import {
  getBillingDetails,
  BillingDetails,
} from '@/app/(main)/(org-panel)/organization/billing/api';

export default function CloudStorageModal({
  setCloudModal,
  storagePlan,
}: {
  setCloudModal: any;
  storagePlan?: StoragePlan | undefined;
}) {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const [section, setSection] = useState<'manage' | 'checkout'>('manage');
  const { data } = useQuery({
    queryKey: 'storagePlans',
    queryFn: () => getStoragePlans(axiosAuth),
  });
  const [addNewCard, setAddNewCard] = useState(false);

  // Fetch billing details instead of using session
  const { data: billingDetails } = useQuery<BillingDetails>({
    queryKey: 'billingDetails',
    queryFn: () => getBillingDetails(axiosAuth),
  });

  const updatePlanMutation = useMutation(upgradeStoragePlan, {
    onSuccess: () => {
      setCloudModal(false);
      setLoading(false);
      toast.success('Storage plan updated!');
      queryClient.invalidateQueries('billingDetails'); // Refresh billing details
    },
    onError: () => setLoading(false),
  });

  // Find matching storage plan from the list using billing details
  const currentStoragePlanFromBilling =
    billingDetails?.user.organization?.storagePlan?.storagePlan;
  const matchingPlan = currentStoragePlanFromBilling
    ? data?.find((plan) => plan._id === currentStoragePlanFromBilling._id)
    : undefined;

  const [selectedPlanId, setSelectedPlanId] = useState<StoragePlan | undefined>(
    storagePlan ?? matchingPlan
  );

  // Update selected plan when billing details or storage plans load
  useEffect(() => {
    if (!selectedPlanId && matchingPlan) {
      setSelectedPlanId(matchingPlan);
    }
  }, [matchingPlan, selectedPlanId]);
  const { data: cdata } = useQuery('cards', () => getCards(axiosAuth), {});
  // Removed separate payment step; update plan only on Confirm

  const handlePaymentWithCard = async () => {
    // On Confirm, actually update the storage plan
    setLoading(true);
    try {
      if (selectedPlanId?._id) {
        updatePlanMutation.mutate({
          axiosAuth,
          storagePlanId: selectedPlanId._id,
        });
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      setLoading(false);
    }
  };

  const [showSavedCards, setSavedCards] = useState(false);

  return (
    <>
      <CustomModal
        size="md"
        isOpen={true}
        header={
          <>
            <img src="/svg/cloud.svg" alt="" />
            <div>
              <h2 className="text-xl font-semibold text-[#1E1E1E]">
                {'Manage Storage'}
              </h2>
              <span className="mt-1 text-base font-normal text-[#616161]">
                {'Change your storage plan options below'}
              </span>
            </div>
          </>
        }
        body={
          <div className="flex h-[500px] flex-col overflow-auto px-3">
            {section === 'manage' && (
              <>
                {(data ?? []).map((plan) => {
                  return (
                    <div
                      key={plan._id}
                      className="flex items-center justify-between px-6 py-3"
                    >
                      <div
                        className={`${selectedPlanId?._id === plan._id ? 'bg-primary-500' : 'bg-gray-300'} flex h-9 w-24 items-center justify-center rounded-lg text-sm font-semibold text-white md:h-12 md:w-32 md:text-base`}
                      >
                        {plan.totalStorageInGB}GB
                      </div>
                      <div className="text-xs font-normal text-gray-700 md:text-base">
                        <p>${plan.price} USD</p>
                        <p>Billed {plan.planDuration}ly</p>
                      </div>
                      <div>
                        <input
                          type="radio"
                          name="Cloud"
                          value={plan._id}
                          checked={selectedPlanId?._id === plan._id}
                          onChange={(v: any) => {
                            if (
                              billingDetails?.user.organization
                                ?.accountPaymentStatus == 'active'
                            ) {
                              setSelectedPlanId(plan);
                            } else {
                              // show message here useer cannot update storage plan on trail period

                              toast.error(
                                " You can't change storage plan on trial period"
                              );
                            }
                          }}
                          className="h-5 w-5 border-[#616161] md:h-7 md:w-7"
                        />
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            {/* checkout form */}
            {section === 'checkout' && (
              <>
                <div className={'space-y-8 py-4 text-sm sm:text-base'}>
                  <div className={'space-y-2.5 sm:space-y-3'}>
                    <h4 className={'font-normal text-gray-800'}>
                      Total Due Today
                    </h4>
                    <p className={'font-medium text-black'}>
                      ${selectedPlanId?.price ?? 0}
                      USD{' '}
                    </p>
                  </div>
                </div>
                {/*  Card selction detail */}
                <div className={'space-y-8 py-4 text-sm sm:text-base'}>
                  <div className={'space-y-2.5 sm:space-y-3'}>
                    <label className={'flex justify-between font-normal'}>
                      <span>Select Payment Card</span>
                      <button
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
                {/* license details */}
                <div className="mb-6">
                  <div>
                    <h2 className="text-lg font-medium text-[#000000]">
                      {'Purchase Summary '}
                    </h2>
                    <p className="mt-2 text-xs text-[#616161]">
                      {'Product Name'}
                    </p>
                    <p className="mt-2 text-sm text-[#1E1E1E]">{`Cloud Storage: ${selectedPlanId?.totalStorageInGB}GB`}</p>
                  </div>
                  <div className="mt-2 space-y-2 font-normal text-gray-900">
                    <p className="text-xs">
                      {`$ `} {selectedPlanId?.price}
                      {` USD`}{' '}
                    </p>
                    <p className="text-sm text-[#616161]">
                      {'Monthly Billing'}
                    </p>
                    <p className="text-xs">
                      Next monthly renewal date:{' '}
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
                    {billingDetails?.user.organization?.accountPaymentStatus === 'active' && (
                      <p className="text-xs">
                        Prorated bill due today:{' '}
                        <span className="font-bold">
                          {`${
                            calculateProratedPrice(
                              selectedPlanId?.price ?? 0,
                              billingDetails?.user.organization
                                ?.currentActiveSubscription?.nextRenewalAt
                            ).chargeNow
                          }`}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        }
        handleCancel={() => {
          if (section == 'manage') {
            setCloudModal(false);
          } else {
            setSection('manage');
          }
        }}
        handleSubmit={() => {
          if (section === 'manage') {
            // Move to checkout; do not hit API yet
            setSection('checkout');
          } else {
            // Confirm: now hit the update API
            handlePaymentWithCard();
          }
        }}
        submitValue={section === 'manage' ? 'Next' : 'Confirm'}
        isLoading={updatePlanMutation.isLoading || isLoading}
        submitDisabled={
          selectedPlanId?._id ===
            billingDetails?.user.organization?.storagePlan?.storagePlan?._id ||
          !cdata
        }
      />
      {showSavedCards && <SavedCards onClose={setSavedCards} />}
    </>
  );
}
function calculateProratedPrice(
  totalPrice: number,
  nextRenewalDate?: string | null
): {
  chargeNow: number;
  renewalDate?: string;
} {
  const now = new Date();

  // First-time subscription: full price now, renewal in 1 month
  if (!nextRenewalDate) {
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    return {
      chargeNow: totalPrice,
      renewalDate: nextMonth.toISOString(),
    };
  }

  const renewalDate = new Date(nextRenewalDate);

  // If renewal date is in the past or today, don't charge again
  if (renewalDate <= now) {
    return {
      chargeNow: 0,
      renewalDate: renewalDate.toISOString(),
    };
  }

  const totalDaysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const remainingTime = renewalDate.getTime() - now.getTime();
  const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));

  const dailyRate = totalPrice / totalDaysInMonth;
  const proratedAmount = dailyRate * remainingDays;

  return {
    chargeNow: Math.round(proratedAmount * 100) / 100,
    renewalDate: renewalDate.toISOString(),
  };
}
