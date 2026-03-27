import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { getContactsProjectChannels } from '@/app/(main)/(user-panel)/user/apps/api';
import { toast } from 'react-hot-toast';
import {
  getSHAppSetting,
  updateSHSetting,
} from '@/app/(main)/(user-panel)/user/apps/sh/api';
import {
  NotificationRecipients,
  Recipient,
} from '@/components/CommonComponents/NotificationRecipients';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';

export function SHNotifictionSettings() {
  const axiosAuth = useAxiosAuth();

  const [notifyMeWhenNewDiscussionPoint, setDiscussionPoint] = useState(false);
  const [notifyMeWhenNewHazard, setNewHazard] = useState(false);
  const [notifyMeWhenNewSafetyMeeting, setNewSafetyMeeting] = useState(false);
  const [tikiAIAssistant, setTikiAIAssistant] = useState(false);
  const [emailNotification, setEmailNotification] = useState(false);

  const { data } = useQuery({
    queryKey: 'contactsProjectChannels',
    queryFn: () => getContactsProjectChannels(axiosAuth),
    refetchOnWindowFocus: false,
  });

  // Combine contacts and external friends
  const allContacts = [
    ...(data?.data?.contacts ?? []).map((contact: any) => ({
      email: contact.email,
      firstName: contact.firstName,
      lastName: contact.lastName,
    })),
    ...(data?.data?.externalFriends ?? []).map((friend: any) => ({
      email: friend.email,
      firstName: friend.firstName,
      lastName: friend.lastName,
    })),
  ] as Recipient[];
  const { data: notificationData, isLoading: detailLoading } = useQuery({
    queryKey: 'SHSetting',
    queryFn: () => getSHAppSetting(axiosAuth),
  });
  useEffect(() => {
    if (notificationData) {
      setDiscussionPoint(notificationData.notifyMeWhenNewDiscussionPoint);
      setNewHazard(notificationData.notifyMeWhenNewHazard);
      setNewSafetyMeeting(notificationData.notifyMeWhenNewSafetyMeeting);
      setTikiAIAssistant(notificationData.tikiAIAssistant ?? false);
      setEmailNotification(notificationData.emailNotification ?? false);
    }
  }, [notificationData]);

  const queryClient = useQueryClient();
  const updateSettingMutation = useMutation(updateSHSetting, {
    onSuccess: () => {
      toast.success('setting saved');
      queryClient.invalidateQueries('SHSetting');
      queryClient.invalidateQueries('SHSettingPermission');
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
      <div className="mx-4 my-4 flex h-[668px] max-h-[668px] w-4/6 flex-col overflow-y-scroll rounded-lg border-2 border-[#EEEEEE] p-6 shadow scrollbar-hide md:w-5/6">
        <div className="flex flex-col">
          <h2 className="mb-1 text-sm font-semibold md:text-xl">
            Notifications
          </h2>
          <p className="text-[10px] font-normal text-[#616161] md:text-sm">
            Manage Notification of this app.
          </p>
        </div>

        {/* Notification recipents  */}
        <div className="flex w-1/2">
          <NotificationRecipients
            recipients={(notificationData?.recipients ?? []).map((r: any) => ({
              email: r.email || '',
              firstName: r.firstName || '',
              lastName: r.lastName || '',
            }))}
            onUpdateRecipients={handleUpdateRecipients}
            useContacts={true}
            contactsData={allContacts}
            queryKey="contactsProjectChannels"
            showMaxLabel={true}
            recipientDisplayFormat="email"
            className="mb-5"
            modalDescriptionForContacts="You can select up to 3 people from your contacts."
            isLoading={updateSettingMutation.isLoading}
          />
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
        <div className="mb-16 mt-8 flex flex-col">
          <h2 className="mb-1 text-sm font-semibold">Notification Trigger</h2>
          {/* Timesheet has been created. */}
          <div className="mt-2 grid grid-cols-[auto,1fr] items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
              name="option"
              value="1"
              checked={notifyMeWhenNewHazard}
              onChange={() => {
                handleSubmit({
                  data: { notifyMeWhenNewHazard: !notifyMeWhenNewHazard },
                });

                setNewHazard(!notifyMeWhenNewHazard);
              }}
            />
            <span className="text-base text-gray-700">
              New ‘Hazard & Incident’ has been created.
            </span>
          </div>
          <div className="mt-2 grid grid-cols-[auto,1fr] items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
              name="option"
              value="1"
              checked={notifyMeWhenNewSafetyMeeting}
              onChange={() => {
                handleSubmit({
                  data: {
                    notifyMeWhenNewSafetyMeeting: !notifyMeWhenNewSafetyMeeting,
                  },
                });

                setNewSafetyMeeting(!notifyMeWhenNewSafetyMeeting);
              }}
            />
            <span className="text-base text-gray-700">
              New ‘Safety Meeting’ has been created.
            </span>
          </div>
          <div className="mt-2 grid grid-cols-[auto,1fr] items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
              name="option"
              value="1"
              checked={notifyMeWhenNewDiscussionPoint}
              onChange={() => {
                handleSubmit({
                  data: {
                    notifyMeWhenNewDiscussionPoint:
                      !notifyMeWhenNewDiscussionPoint,
                  },
                });

                setDiscussionPoint(!notifyMeWhenNewDiscussionPoint);
              }}
            />
            <span className="mb-8 text-base text-gray-700">
              New ‘Discussion Point’ has been created.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
