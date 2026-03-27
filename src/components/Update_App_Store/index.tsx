import {
  AppStoreModel,
  deleteInstalledApp,
  installAppInOrg,
} from '@/app/(main)/(org-panel)/organization/app-store/api';
import CustomModal from '../Custom_Modal';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useEffect, useState } from 'react';
import { dateFormat } from '@/app/helpers/dateFormat';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { stripeExceptionHandler } from '@/app/helpers/errors/stripe_error_handler';
import { SelectOption } from '../Form/select';
import AddNewCard from '../Organization/Billing/Cards/NewCard';
import { Card, getCards } from '../Organization/Billing/Cards/api';
import { getUsers } from '@/app/(main)/(org-panel)/organization/users/api';
import SavedCards from '../Organization/Billing/Cards/SavedCards';
import { getBillingDetails, BillingDetails } from '@/app/(main)/(org-panel)/organization/billing/api';

const UpdateAppStore = ({
  model,
  setModel,
  isInstalled,
}: {
  model: AppStoreModel | undefined;
  setModel: any;
  isInstalled: boolean;
}) => {
  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth();

  const [section, setSection] = useState<'manage' | 'checkout'>('manage');
  const [addNewCard, setAddNewCard] = useState(false);
  const deleteAppMutation = useMutation(deleteInstalledApp, {
    onSuccess: () => {
      setModel(undefined);
      setSection('manage');
      queryClient.invalidateQueries('allApps');
      queryClient.invalidateQueries('pendingPeymentApps');
    },
  });
  const { data: users, isLoading } = useQuery({
    queryKey: 'users',
    queryFn: () => getUsers(axiosAuth),
  });
  const createProjectMutation = useMutation(installAppInOrg, {
    onSuccess: () => {
      setModel(undefined);
      setSection('manage');
      toast.success('App installed successfully!');
      queryClient.invalidateQueries('allApps');
      queryClient.invalidateQueries('pendingPeymentApps');
      queryClient.invalidateQueries('billingDetails'); // Refresh billing details
    },
  });

  // Fetch billing details instead of using session
  const { data: billingDetails } = useQuery<BillingDetails>({
    queryKey: 'billingDetails',
    queryFn: () => getBillingDetails(axiosAuth),
  });

  const { data: cdata } = useQuery('cards', () => getCards(axiosAuth));
  const [showSavedCards, setSavedCards] = useState(false);
  const handlePaymentWithCard = async () => {
    // Keep UI flow, but only install app on confirm. No separate payment API.
    try {
      if (model) {
        createProjectMutation.mutate({
          axiosAuth: axiosAuth,
          body: {
            app: model?._id!,
          },
        });
      }
    } catch (err: any) {
      stripeExceptionHandler(err);
    }
  };

  return (
    <>
      {showSavedCards && <SavedCards onClose={setSavedCards} />}
      <CustomModal
        size="md"
        isOpen={model !== undefined}
        header={
          <>
            {section == 'manage' ? (
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
                    d="M18.4375 13.125C19.1351 13.125 19.826 13.2624 20.4705 13.5294C21.1151 13.7964 21.7007 14.1877 22.194 14.681C22.6873 15.1743 23.0786 15.76 23.3456 16.4045C23.6126 17.049 23.75 17.7399 23.75 18.4375V23.75H18.4375C17.0285 23.75 15.6773 23.1903 14.681 22.194C13.6847 21.1977 13.125 19.8465 13.125 18.4375C13.125 17.0285 13.6847 15.6773 14.681 14.681C15.6773 13.6847 17.0285 13.125 18.4375 13.125ZM21.25 21.25V18.4375C21.25 17.8812 21.0851 17.3375 20.776 16.875C20.467 16.4124 20.0277 16.052 19.5138 15.8391C18.9999 15.6262 18.4344 15.5705 17.8888 15.679C17.3432 15.7876 16.8421 16.0554 16.4488 16.4488C16.0554 16.8421 15.7876 17.3432 15.679 17.8888C15.5705 18.4344 15.6262 18.9999 15.8391 19.5138C16.052 20.0277 16.4124 20.467 16.875 20.776C17.3375 21.085 17.8812 21.25 18.4375 21.25H21.25ZM18.4375 26.25H23.75V31.5625C23.75 32.6132 23.4384 33.6403 22.8547 34.514C22.2709 35.3876 21.4412 36.0685 20.4705 36.4706C19.4998 36.8727 18.4316 36.9779 17.4011 36.7729C16.3706 36.5679 15.424 36.062 14.681 35.319C13.938 34.576 13.4321 33.6294 13.2271 32.5989C13.0221 31.5684 13.1273 30.5002 13.5294 29.5295C13.9315 28.5588 14.6124 27.7291 15.486 27.1453C16.3597 26.5616 17.3868 26.25 18.4375 26.25ZM18.4375 28.75C17.8812 28.75 17.3375 28.915 16.875 29.224C16.4124 29.533 16.052 29.9723 15.8391 30.4862C15.6262 31.0001 15.5705 31.5656 15.679 32.1112C15.7876 32.6568 16.0554 33.1579 16.4488 33.5512C16.8421 33.9446 17.3432 34.2124 17.8888 34.321C18.4344 34.4295 18.9999 34.3738 19.5138 34.1609C20.0277 33.948 20.467 33.5876 20.776 33.125C21.0851 32.6625 21.25 32.1188 21.25 31.5625V28.75H18.4375ZM31.5625 13.125C32.9715 13.125 34.3227 13.6847 35.319 14.681C36.3153 15.6773 36.875 17.0285 36.875 18.4375C36.875 19.8465 36.3153 21.1977 35.319 22.194C34.3227 23.1903 32.9715 23.75 31.5625 23.75H26.25V18.4375C26.25 17.0285 26.8097 15.6773 27.806 14.681C28.8023 13.6847 30.1535 13.125 31.5625 13.125ZM31.5625 21.25C32.1188 21.25 32.6625 21.085 33.125 20.776C33.5876 20.467 33.948 20.0277 34.1609 19.5138C34.3738 18.9999 34.4295 18.4344 34.321 17.8888C34.2124 17.3432 33.9446 16.8421 33.5512 16.4488C33.1579 16.0554 32.6568 15.7876 32.1112 15.679C31.5656 15.5705 31.0001 15.6262 30.4862 15.8391C29.9723 16.052 29.533 16.4124 29.224 16.875C28.915 17.3375 28.75 17.8812 28.75 18.4375V21.25H31.5625ZM26.25 26.25H31.5625C32.6132 26.25 33.6403 26.5616 34.514 27.1453C35.3876 27.7291 36.0685 28.5588 36.4706 29.5295C36.8727 30.5002 36.9779 31.5684 36.7729 32.5989C36.5679 33.6294 36.062 34.576 35.319 35.319C34.576 36.062 33.6294 36.5679 32.5989 36.7729C31.5684 36.9779 30.5002 36.8727 29.5295 36.4706C28.5588 36.0685 27.7291 35.3876 27.1453 34.514C26.5616 33.6403 26.25 32.6132 26.25 31.5625V26.25ZM28.75 28.75V31.5625C28.75 32.1188 28.915 32.6625 29.224 33.125C29.533 33.5876 29.9723 33.948 30.4862 34.1609C31.0001 34.3738 31.5656 34.4295 32.1112 34.321C32.6568 34.2124 33.1579 33.9446 33.5512 33.5512C33.9446 33.1579 34.2124 32.6568 34.321 32.1112C34.4295 31.5656 34.3738 31.0001 34.1609 30.4862C33.948 29.9723 33.5876 29.533 33.125 29.224C32.6625 28.915 32.1188 28.75 31.5625 28.75H28.75Z"
                    fill="#0063F7"
                  />
                </svg>

                <div>
                  <h2 className="text-xl font-semibold">View App</h2>
                  <p className="mt-1 text-base font-normal text-[#616161]">
                    View app details below.
                  </p>
                </div>
              </div>
            ) : (
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
                    d="M16.5625 15.625C15.3193 15.625 14.127 16.1189 13.2479 16.9979C12.3689 17.877 11.875 19.0693 11.875 20.3125V21.25H38.125V20.3125C38.125 19.0693 37.6311 17.877 36.7521 16.9979C35.873 16.1189 34.6807 15.625 33.4375 15.625H16.5625ZM38.125 23.125H11.875V29.6875C11.875 30.9307 12.3689 32.123 13.2479 33.0021C14.127 33.8811 15.3193 34.375 16.5625 34.375H33.4375C34.6807 34.375 35.873 33.8811 36.7521 33.0021C37.6311 32.123 38.125 30.9307 38.125 29.6875V23.125ZM29.6875 28.75H33.4375C33.6861 28.75 33.9246 28.8488 34.1004 29.0246C34.2762 29.2004 34.375 29.4389 34.375 29.6875C34.375 29.9361 34.2762 30.1746 34.1004 30.3504C33.9246 30.5262 33.6861 30.625 33.4375 30.625H29.6875C29.4389 30.625 29.2004 30.5262 29.0246 30.3504C28.8488 30.1746 28.75 29.9361 28.75 29.6875C28.75 29.4389 28.8488 29.2004 29.0246 29.0246C29.2004 28.8488 29.4389 28.75 29.6875 28.75Z"
                    fill="#0063F7"
                  />
                </svg>

                <div>
                  <h2 className="text-xl font-semibold">Add App</h2>
                  <p className="mt-1 text-base font-normal text-[#616161]">
                    Add app to your organization
                  </p>
                </div>
              </div>
            )}
          </>
        }
        body={
          <div className="flex h-[500px] flex-col gap-4 overflow-auto px-3">
            {section == 'manage' && (
              <div>
                <div className="flex flex-col gap-2">
                  <span className="text-gray-500">App Name </span>
                  <span>{model?.name}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-gray-500">Monthly Cost </span>
                  <span>{`\$ ${model?.price} / User`}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-gray-500">App ID </span>
                  <span>{model?.appId}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-gray-500">Description </span>
                  <span>{model?.description}</span>
                </div>
              </div>
            )}

            {/* // Checkout section  */}
            {/* checkout form */}
            {section === 'checkout' && (
              <>
                <div className={'space-y-8 py-4 text-sm sm:text-base'}>
                  <div className={'space-y-2.5 sm:space-y-3'}>
                    <h4 className={'font-normal text-gray-800'}>
                      Total Due Today
                    </h4>
                    <p className={'font-medium text-black'}>
                      ${model?.price} USD{' '}
                    </p>
                  </div>
                </div>

                {/* // Card etail  */}
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
                  </div>{' '}
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
                    <p className="mt-2 text-sm text-[#1E1E1E]">{model?.name}</p>
                  </div>
                  <div className="mt-2 space-y-2 font-normal text-gray-900">
                    <p className="text-xs">
                      {`$${model?.price} USD x ${(users ?? [])?.length} Users = $${(model?.price ?? 0) * (users ?? [])?.length} USD / Month`}
                    </p>
                    <p className="text-xs">
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
                    {billingDetails?.user.organization?.accountPaymentStatus === 'active' && (
                      <p className="text-xs">
                        Prorated bill due today:
                        <span className="font-bold">
                          {calculateProratedPrice(
                            (users ?? [])?.length,
                            model?.price ?? 0,
                            billingDetails?.user.organization
                              ?.currentActiveSubscription?.nextRenewalAt
                          )}
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
            setModel(undefined);
          } else {
            setSection('manage');
          }
        }}
        handleSubmit={() => {
          if (section == 'manage') {
            if (isInstalled) {
              deleteAppMutation.mutate({
                axiosAuth: axiosAuth,
                id: model?._id!,
              });
            } else {
              // Move to checkout without installing yet
              setSection('checkout');
            }
          } else {
            // Confirm: install the app now
            handlePaymentWithCard();
          }
        }}
        isLoading={
          createProjectMutation.isLoading || deleteAppMutation.isLoading
        }
        variant={isInstalled ? 'danger' : 'primary'}
        cancelButton={section == 'manage' ? 'Cancel' : 'Back'}
        submitDisabled={section == 'checkout' && !cdata}
        submitValue={
          section == 'manage' ? (isInstalled ? 'Remove' : 'Add') : 'Confirm'
        }
      />
    </>
  );
};

export { UpdateAppStore };

function calculateProratedPrice(
  quantity: number,
  pricePerLicense: number,
  nextRenewalDate: any
): number {
  const now = new Date();
  const nextDate = new Date(nextRenewalDate);

  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Calculate number of days between today and next renewal
  const diffInMs = nextDate.getTime() - now.getTime();
  const daysBetween = Math.ceil(diffInMs / (1000 * 60 * 60 * 24)); // round up

  const dailyPrice = pricePerLicense / totalDays;

  const proratedPrice = quantity * dailyPrice * daysBetween;

  return Math.round(proratedPrice * 100) / 100;
}
