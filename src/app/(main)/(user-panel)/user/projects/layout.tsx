import type { Metadata } from 'next';
import { projectsMetadata } from '@/app/metadata';

export const metadata: Metadata = {
  ...projectsMetadata,
};

export default function ProjectsLayout({
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
