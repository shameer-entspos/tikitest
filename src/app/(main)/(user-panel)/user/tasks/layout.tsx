import type { Metadata } from 'next';
import { tasksMetadata } from '@/app/metadata';

export const metadata: Metadata = {
  ...tasksMetadata,
};

export default function AppStoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
