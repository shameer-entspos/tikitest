import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import useAxiosAuth from '@/hooks/AxiosAuth';
import {
  getTimesheetAppSetting,
  updateTimesheetAppSetting,
} from '@/app/(main)/(user-panel)/user/apps/timesheets/api';
import { toast } from 'react-hot-toast';
import { CustomBlueCheckBox } from '@/components/Custom_Checkbox/Custom_Blue_Checkbox';
import {
  NotificationRecipients,
  Recipient,
} from '@/components/CommonComponents/NotificationRecipients';

export function TimeSheetNotifictionSettings() {
  const axiosAuth = useAxiosAuth();
  const [createdTimesheet, setTimesheetCreated] = useState(false);
  const [editedTimesheet, setTimesheetEdited] = useState(false);
  const [deletedTimesheet, setTimesheetDeleted] = useState(false);

  const [createdExpanse, setExpanseCreated] = useState(false);
  const [editedExpanse, setExpanseEdited] = useState(false);
  const [deletedExpanse, setExpanseDeleted] = useState(false);

  const [tikiAIAssistant, setTikiAIAssistant] = useState(false);
  const [emailNotification, setEmailNotification] = useState(false);
  const { data: notificationData, isLoading: detailLoading } = useQuery({
    queryKey: 'timesheetSetting',
    queryFn: () => getTimesheetAppSetting(axiosAuth),
  });
  useEffect(() => {
    if (notificationData) {
      setExpanseCreated(notificationData.notifyMeWhenExpenseCreated);
      setExpanseDeleted(notificationData.notifyMeWhenExpenseDelete);
      setExpanseEdited(notificationData.notifyMeWhenExpenseEdit);
      setTimesheetCreated(notificationData.notifyMeWhenTimesheetCreated);
      setTimesheetDeleted(notificationData.notifyMeWhenTimesheetDelete);
      setTimesheetEdited(notificationData.notifyMeWhenTimesheetEdit);
      // Set notification methods from data if available
      setTikiAIAssistant((notificationData as any).tikiAIAssistant ?? false);
      setEmailNotification(
        (notificationData as any).emailNotification ?? false
      );
    }
  }, [notificationData]);

  const queryClient = useQueryClient();
  const updateSettingMutation = useMutation(updateTimesheetAppSetting, {
    onSuccess: () => {
      toast.success('setting saved');
      queryClient.invalidateQueries('timesheetSetting');
    },
  });
  const handleSubmit = ({
    createExpanse,
    createTimesheet,
    editTimesheet,
    deleteTimesheet,
    editExpanse,
    deleteExpanse,
    tikiAI,
    email,
    updatedUsers,
  }: {
    createTimesheet?: boolean;
    createExpanse?: boolean;
    editTimesheet?: boolean;
    deleteTimesheet?: boolean;
    editExpanse?: boolean;
    deleteExpanse?: boolean;
    tikiAI?: boolean;
    email?: boolean;
    updatedUsers?: Recipient[];
  }) => {
    const data = {
      notificationData,
      notifyMeWhenTimesheetCreated: createTimesheet ?? createdTimesheet,
      notifyMeWhenTimesheetEdit: editTimesheet ?? editedTimesheet,
      notifyMeWhenTimesheetDelete: deleteTimesheet ?? deletedTimesheet,
      notifyMeWhenExpenseCreated: createExpanse ?? createdExpanse,
      notifyMeWhenExpenseDelete: deleteExpanse ?? deletedExpanse,
      notifyMeWhenExpenseEdit: editExpanse ?? editedExpanse,
      recipients: updatedUsers ?? notificationData?.recipients ?? [],
      tikiAIAssistant: tikiAI ?? tikiAIAssistant,
      emailNotification: email ?? emailNotification,
    };
    console.log(updatedUsers);
    updateSettingMutation.mutate({
      axiosAuth,
      data,
      id: notificationData?._id!,
    });
  };

  const handleUpdateRecipients = (recipients: Recipient[]) => {
    handleSubmit({ updatedUsers: recipients });
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
          queryKey="listofUsersForApp"
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
                handleSubmit({ tikiAI: newValue });
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
                handleSubmit({ email: newValue });
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
            <CustomBlueCheckBox
              checked={createdTimesheet}
              onChange={() => {
                handleSubmit({ createTimesheet: !createdTimesheet });

                setTimesheetCreated(!createdTimesheet);
              }}
            />
            <span className="text-gray-700">
              Timesheet has been created.{createdTimesheet}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-[auto,1fr] items-start gap-2">
            <CustomBlueCheckBox
              checked={editedTimesheet}
              onChange={() => {
                handleSubmit({ editTimesheet: !editedTimesheet });
                setTimesheetEdited(!editedTimesheet);
              }}
            />
            <span className="text-gray-700">Timesheet has been edited.</span>
          </div>
          <div className="mt-2 grid grid-cols-[auto,1fr] items-start gap-2">
            <CustomBlueCheckBox
              checked={deletedTimesheet}
              onChange={() => {
                handleSubmit({ deleteTimesheet: !deletedTimesheet });

                setTimesheetDeleted(!deletedTimesheet);
              }}
            />
            <span className="text-gray-700">Timesheet has been deleted.</span>
          </div>
          {/* Expense has been created. */}
          <div className="mt-2 grid grid-cols-[auto,1fr] items-start gap-2">
            <CustomBlueCheckBox
              checked={createdExpanse}
              onChange={() => {
                handleSubmit({ createExpanse: !createdExpanse });

                setExpanseCreated(!createdExpanse);
              }}
            />
            <span className="text-gray-700">Expense has been created.</span>
          </div>
          <div className="mt-2 grid grid-cols-[auto,1fr] items-start gap-2">
            <CustomBlueCheckBox
              checked={editedExpanse}
              onChange={() => {
                handleSubmit({ editExpanse: !editedExpanse });

                setExpanseEdited(!editedExpanse);
              }}
            />
            <span className="text-gray-700">Expense has been edited.</span>
          </div>
          <div className="mt-2 grid grid-cols-[auto,1fr] items-start gap-2">
            <CustomBlueCheckBox
              checked={deletedExpanse}
              onChange={() => {
                handleSubmit({ deleteExpanse: !deletedExpanse });

                setExpanseDeleted(!deletedExpanse);
              }}
            />
            <span className="text-gray-700">Expense has been deleted.</span>
          </div>
        </div>
      </div>
    </>
  );
}
