/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import {
  Avatar,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react';
import Stripe from 'stripe';
import React, { useEffect, useState } from 'react';
import { BiLock, BiLockAlt } from 'react-icons/bi';
import { MdPayment } from 'react-icons/md';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { processBilling, getBillingDetails, BillingDetails } from './api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useBillingCotnext } from './context';
import { Button } from '@/components/Buttons';
import Loader from '@/components/DottedLoader/loader';
import { useSession } from 'next-auth/react';
import { FolderMinus, X } from 'lucide-react';
import CustomHr from '@/components/Ui/CustomHr';
import { SelectOption } from '@/components/Form/select';
import { PROJECTACTIONTYPE, TASKTYPE } from '@/app/helpers/user/enums';
import toast from 'react-hot-toast';
import AddNewCard from '@/components/Organization/Billing/Cards/NewCard';
import { getCards } from '@/components/Organization/Billing/Cards/api';

const PaymentForm = ({ onClose }: { onClose: any }) => {
  const context = useBillingCotnext();
  const axiosAuth = useAxiosAuth();
  const { data, update } = useSession();
  const { onOpenChange } = useDisclosure();

  const [subTotal, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addNewCard, setAddNewCard] = useState(false);

  // Fetch billing details instead of using session
  const { data: billingDetails } = useQuery<BillingDetails>({
    queryKey: 'billingDetails',
    queryFn: () => getBillingDetails(axiosAuth),
  });

  useEffect(() => {
    const appTotal = (context.state.appIds ?? []).reduce(
      (acc, obj) => acc + (obj?.app?.price ?? 0),
      0
    );
    const storageTotal = Number(context.state.plan?.storagePlan?.price ?? 0);
    const licenseTotal = Number(
      billingDetails?.user.organization?.userLicense?.pricePerLicense ?? 0
    );

    setTotal(appTotal + storageTotal + licenseTotal);
  }, [context, billingDetails?.user.organization?.userLicense]);
  const queryClient = useQueryClient();
  const processBillingMutation = useMutation(processBilling, {
    onSuccess: () => {
      queryClient.invalidateQueries('pendingPeymentApps');
      queryClient.invalidateQueries('billingDetails'); // Refresh billing details

      setLoading(false);
      onClose(false);
    },
    onError: (error: any) => {
      toast.error('Payment failed: ' + error.message);
      setLoading(false);
    },
  });

  const { data: cdata, refetch } = useQuery({
    queryKey: 'cards',
    queryFn: () => getCards(axiosAuth),
  });
  const handlePaymentWithCard = async () => {
    if (!cdata) {
      return;
    }
    const card: any = cdata?._id;

    if (card) {
      try {
        setLoading(true);

        processBillingMutation.mutate({
          axiosAuth,
          body: {
            appIds: (context.state.appIds ?? [])
              .filter((e) => e.paymentStatus == 'pending')
              .map((v) => v.app?._id)
              .filter((id): id is string => !!id),
          },
        });
      } catch (err: any) {
        setLoading(false);
      }
    } else {
      toast.error('Please first select card.');
    }
  };

  return (
    <>
      <Modal
        onOpenChange={onOpenChange}
        onClose={() => onClose(false)}
        isOpen={true}
        backdrop="blur"
        placement="center"
        size="lg"
        className={'w-full md:min-w-[500px]'}
      >
        <ModalContent className="mx-auto w-[94%] rounded-3xl bg-white py-2">
          {() => (
            <div className="px-0 md:px-2">
              <ModalHeader className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2">
                  {/*icon*/}
                  <span className="grid h-11 w-11 place-content-center rounded-full bg-primary-100/70 p-3 text-primary-500 lg:h-[55px] lg:w-[55px]">
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

                  <div>
                    <h2 className="text-lg font-medium leading-7 text-[#1E1E1E]">
                      Pay Balance
                    </h2>

                    <span className="text-sm font-normal text-[#616161]">
                      Please Pay your unpaid balance below.
                    </span>
                  </div>
                </div>

                <button
                  className="rounded-md p-1 hover:bg-gray-100"
                  onClick={() => onClose(false)}
                >
                  <X />
                </button>
              </ModalHeader>

              <ModalBody className={'h-[450px] overflow-y-auto sm:h-[500px]'}>
                <CustomHr />
                <div className={'space-y-8 py-4 text-sm sm:text-base'}>
                  <div className={'space-y-2.5 sm:space-y-3'}>
                    <h4 className={'font-normal text-gray-800'}>
                      Total Due Today
                    </h4>
                    <p className={'font-medium text-black'}>${subTotal} USD </p>
                  </div>

                  <div className={'space-y-2.5 sm:space-y-3'}>
                    <label className={'flex justify-between font-normal'}>
                      <span>Select Payment Card</span>
                      <button
                        onClick={() => setAddNewCard(true)}
                        className={'text-sm text-primary-500 sm:text-base'}
                      >
                        Edit Card Details
                      </button>
                    </label>
                    <div className="cursor-pointer overflow-y-auto rounded-lg border border-gray-400 bg-gray-300">
                      {cdata?.cardNumber && (
                        <p className={'px-2 py-3 font-medium text-black'}>
                          {cdata?.cardNumber}
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
              </ModalBody>
              <ModalFooter className={'flex-col'}>
                <CustomHr />
                <div className="mt-2 flex justify-center gap-5">
                  <button
                    className="h-11 w-1/2 rounded-lg border-2 border-primary-500 text-sm text-primary-500 sm:w-36 sm:text-base"
                    type="button"
                    onClick={() => onClose(false)}
                  >
                    Back
                  </button>
                  <button
                    disabled={loading}
                    onClick={handlePaymentWithCard}
                    className="h-11 w-1/2 rounded-lg bg-primary-500 text-sm text-white hover:bg-primary-600/80 sm:w-36 sm:text-base"
                  >
                    {loading ? 'Submiting...' : 'Confirm'}
                  </button>
                </div>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default PaymentForm;
