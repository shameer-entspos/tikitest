// hooks/useShowNotification.ts
import { useEffect } from 'react';

const useShowNotification = () => {
  const checkPermissionAndSendnotification = ({
    title,
    body,
    icon,
  }: {
    title: string;
    body: string;
    icon: string;
  }) => {
    if (Notification.permission === 'granted') {
      showNotification({ title, body, icon });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          showNotification({ title, body, icon });
        }
      });
    }
  };
  const showNotification = ({
    title,
    body,
    icon,
  }: {
    title: string;
    body: string;
    icon: string;
  }) => {
    const notificationOptions: NotificationOptions = {
      body,
      icon, // Specify the path to an image for the notification icon
      // image: "images/user.png",
    };

    const notification = new Notification(title, notificationOptions);

    // Handle click events on the notification
    // notification.onclick = () => {
    //   alert("Notification clicked");
    // };
    notification.onclick = () =>
      window.open(`${process.env.NEXT_PUBLIC_APP_URL}/user/chats`);
  };

  return { checkPermissionAndSendnotification };
};

export default useShowNotification;
