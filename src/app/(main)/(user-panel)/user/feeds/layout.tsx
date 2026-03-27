import type { Metadata } from 'next';
import { feedsMetadata } from '@/app/metadata';

export const metadata: Metadata = {
  ...feedsMetadata,
};

export default function FeedStoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-[118dvh] flex-1 flex-col justify-center bg-[#fff]">
      <div className="mx-auto flex min-h-0 w-full max-w-[1360px] flex-1 flex-col overflow-hidden bg-[#fff]">
        {children}
      </div>
    </section>
  );
}
