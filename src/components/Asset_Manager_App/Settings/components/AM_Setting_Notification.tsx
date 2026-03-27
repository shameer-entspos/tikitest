import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { toast } from 'react-hot-toast';
import {
  getAMAppSetting,
  updateAMSetting,
} from '@/app/(main)/(user-panel)/user/apps/am/api';
import {
  NotificationRecipients,
  Recipient,
} from '@/components/CommonComponents/NotificationRecipients';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';

export function AMNotifictionSettings() {
  const axiosAuth = useAxiosAuth();
  const [notifyMeWhenCheckIn, setCheckIn] = useState(false);
  const [notifyMeWhenCheckOut, setCheckOut] = useState(false);
  const [tikiAIAssistant, setTikiAIAssistant] = useState(false);
  const [emailNotification, setEmailNotification] = useState(false);

  const { data: notificationData, isLoading: detailLoading } = useQuery({
    queryKey: 'AMSetting',
    queryFn: () => getAMAppSetting(axiosAuth),
  });
  useEffect(() => {
    if (notificationData) {
      setCheckIn(notificationData.notifyMeWhenCheckIn);
      setCheckOut(notificationData.notifyMeWhenCheckOut);
      setTikiAIAssistant(notificationData.tikiAIAssistant ?? false);
      setEmailNotification(notificationData.emailNotification ?? false);
    }
  }, [notificationData]);

  const queryClient = useQueryClient();
  const updateSettingMutation = useMutation(updateAMSetting, {
    onSuccess: () => {
      toast.success('setting saved');
      queryClient.invalidateQueries('AMSetting');
    },
  });
  const handleSubmit = ({ data }: { data: any }) => {
    updateSettingMutation.mutate({
      axiosAuth,
      data,
      id: notificationData?._id!,
    });
  };

  const handleUpdateRecipients = (recipients: Recipient[]) => {
    handleSubmit({ data: { recipients } });
  };
  return (
    <>
      <div className="mx-4 my-4 mb-32 flex max-h-[668px] w-4/6 flex-col overflow-auto rounded-lg border-2 border-[#EEEEEE] p-6 shadow scrollbar-hide md:w-5/6">
        <div className="flex flex-col">
          <h2 className="mb-1 text-sm font-semibold md:text-xl">
            Notifications
          </h2>
          <p className="text-[10px] font-normal text-[#616161] md:text-sm">
            Manage Notification of this app.
          </p>
        </div>
        {/* Notification Methods  */}
        <div className="mt-8 flex flex-col">
          <h2 className="mb-1 text-sm font-semibold">Notification method</h2>
          <div className="mt-2 grid grid-cols-[auto,1fr] items-start gap-2">
            <CustomBlueCheckBox
              checked={tikiAIAssistant}
              onChange={() => {
                const newValue = !tikiAIAssistant;
                setTikiAIAssistant(newValue);
                handleSubmit({ data: { tikiAIAssistant: newValue } });
              }}
            />
            <div className="grid">
              <span className="text-gray-700">Tiki AI Assistant</span>
              <span className="grid grid-cols-2 text-sm text-gray-500">
                Receive a submission link to notification recipient's Tiki AI
                assistant chat.
              </span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-[auto,1fr] items-start gap-2">
            <CustomBlueCheckBox
              checked={emailNotification}
              onChange={() => {
                const newValue = !emailNotification;
                setEmailNotification(newValue);
                handleSubmit({ data: { emailNotification: newValue } });
              }}
            />
            <div className="grid">
              <span className="text-gray-700">Email Notification</span>
              <span className="grid grid-cols-2 text-sm text-gray-500">
                Receive a email notification with PDF attachment to recipient's
                email address.
              </span>
            </div>
          </div>
        </div>
        {/* Notify me when  */}
        <div className="mt-8 flex flex-col">
          <h2 className="mb-1 text-sm font-semibold">Notify me when</h2>
          {/* Timesheet has been created. */}
          <div className="mt-2 grid grid-cols-[auto,1fr] items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
              name="option"
              value="1"
              checked={notifyMeWhenCheckIn}
              onChange={() => {
                handleSubmit({
                  data: { notifyMeWhenCheckIn: !notifyMeWhenCheckIn },
                });
                setCheckIn(!notifyMeWhenCheckIn);
              }}
            />
            <span className="text-base text-gray-700">
              Check in order has been placed.
            </span>
          </div>
          <div className="mt-2 grid grid-cols-[auto,1fr] items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
              name="option"
              value="1"
              checked={notifyMeWhenCheckOut}
              onChange={() => {
                handleSubmit({
                  data: { notifyMeWhenCheckOut: !notifyMeWhenCheckOut },
                });
                setCheckOut(!notifyMeWhenCheckOut);
              }}
            />
            <span className="text-base text-gray-700">
              Check out order has been placed.
            </span>
          </div>
        </div>
        {/* Notification recipents  */}
        <div className="flex w-1/2">
          <NotificationRecipients
            recipients={(notificationData?.recipients ?? []) as Recipient[]}
            onUpdateRecipients={handleUpdateRecipients}
            queryKey="listofUsersForAMNotification"
            showMaxLabel={false}
            recipientDisplayFormat="email"
            className="mb-64"
            isLoading={updateSettingMutation.isLoading}
          />
        </div>
      </div>
    </>
  );
}
