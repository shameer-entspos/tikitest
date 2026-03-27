import { handleSideBar } from "../handleSidebar";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Notifications",
  description: "Manage organization notifications and alerts",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  handleSideBar(true);
  return <section className="">{children}</section>;
}
