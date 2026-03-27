import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { toast } from 'react-hot-toast';
import {
  getSRAppSetting,
  updateSRSetting,
} from '@/app/(main)/(user-panel)/user/apps/sr/api';
import {
  NotificationRecipients,
  Recipient,
} from '@/components/CommonComponents/NotificationRecipients';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';

export function SRNotifictionSettings() {
  const axiosAuth = useAxiosAuth();

  const [notifyWhenSignIn, setSignIn] = useState(false);
  const [notifyWhenSignOut, setSignOut] = useState(false);
  const [notifyWhenNewRollCall, setNewRollCall] = useState(false);
  const [tikiAIAssistant, setTikiAIAssistant] = useState(false);
  const [emailNotification, setEmailNotification] = useState(false);
  const { data: notificationData } = useQuery({
    queryKey: 'SRSetting',
    queryFn: () => getSRAppSetting(axiosAuth),
  });
  useEffect(() => {
    if (notificationData) {
      setSignIn(notificationData.notifyMeWhenSignIn);
      setSignOut(notificationData.notifyMeWhenSignOut);
      setNewRollCall(notificationData.notifyMeWhenNewRollCall);
      setTikiAIAssistant(notificationData.tikiAIAssistant ?? false);
      setEmailNotification(notificationData.emailNotification ?? false);
    }
  }, [notificationData]);

  const queryClient = useQueryClient();
  const updateSettingMutation = useMutation(updateSRSetting, {
    onSuccess: () => {
      toast.success('setting saved');
      queryClient.invalidateQueries('SRSetting');
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
      <div className="mx-4 my-4 flex max-h-[668px] w-4/6 flex-col overflow-auto rounded-lg border-2 border-[#EEEEEE] p-6 shadow scrollbar-hide md:w-5/6">
        <div className="flex flex-col">
          <h2 className="mb-1 text-sm font-semibold md:text-xl">
            Notifications
          </h2>
          <p className="text-[10px] font-normal text-[#616161] md:text-sm">
            Manage Notification of this app.
          </p>
        </div>

        {/* Notification recipents  */}
        <NotificationRecipients
          recipients={(notificationData?.recipients ?? []) as Recipient[]}
          onUpdateRecipients={handleUpdateRecipients}
          queryKey="listofUsersForAppSettings"
          showMaxLabel={true}
          recipientDisplayFormat="email"
          className="mb-5 sm:w-full lg:w-1/2"
          isLoading={updateSettingMutation.isLoading}
        />
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
              checked={notifyWhenSignIn}
              onChange={() => {
                handleSubmit({
                  data: { notifyMeWhenSignIn: !notifyWhenSignIn },
                });

                setSignIn(!notifyWhenSignIn);
              }}
            />
            <span className="text-base text-gray-700">Sign In</span>
          </div>
          <div className="mt-2 grid grid-cols-[auto,1fr] items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
              name="option"
              value="1"
              checked={notifyWhenSignOut}
              onChange={() => {
                handleSubmit({
                  data: { notifyMeWhenSignOut: !notifyWhenSignOut },
                });
                setSignOut(!notifyWhenSignOut);
              }}
            />
            <span className="text-base text-gray-700">Sign Out</span>
          </div>
          <div className="mt-2 grid grid-cols-[auto,1fr] items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
              name="option"
              value="1"
              checked={notifyWhenNewRollCall}
              onChange={() => {
                handleSubmit({
                  data: { notifyMeWhenNewRollCall: !notifyWhenNewRollCall },
                });

                setNewRollCall(!notifyWhenNewRollCall);
              }}
            />
            <span className="text-base text-gray-700">New Roll Call</span>
          </div>
          {/* Expense has been created. */}
          {/* <div className="grid grid-cols-[auto,1fr] gap-2 mt-2 items-start">
                        <input
                            type="checkbox"
                            className="h-4 w-4 mt-1 checked:bg-black checked:text-black border-black border-2"
                            name="option"
                            value="2"
                            checked={createdExpanse}
                            onChange={() => {
                                handleSubmit({ createExpanse: !createdExpanse });

                                setExpanseCreated(!createdExpanse);

                            }}
                        />
                        <span className="text-gray-700">Expense has been created.</span>
                    </div>
                    <div className="grid grid-cols-[auto,1fr] gap-2 mt-2 items-start">
                        <input
                            type="checkbox"
                            className="h-4 w-4 mt-1 checked:bg-black checked:text-black border-black border-2"
                            name="option"
                            value="2"
                            checked={editedExpanse}
                            onChange={() => {
                                handleSubmit({ editExpanse: !editedExpanse });

                                setExpanseEdited(!editedExpanse);

                            }}
                        />
                        <span className="text-gray-700">Expense has been edited.</span>
                    </div>
                    <div className="grid grid-cols-[auto,1fr] gap-2 mt-2 items-start">
                        <input
                            type="checkbox"
                            className="h-4 w-4 mt-1 checked:bg-black checked:text-black border-black border-2"
                            name="option"
                            value="2"
                            checked={deletedExpanse}
                            onChange={() => {
                                handleSubmit({ deleteExpanse: !deletedExpanse });

                                setExpanseDeleted(!deletedExpanse);

                            }}
                        />
                        <span className="text-gray-700">Expense has been deleted.</span>
                    </div> */}
        </div>
      </div>
    </>
  );
}
