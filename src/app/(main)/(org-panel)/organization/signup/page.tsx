'use client';

import { OrganizationRegister } from '@/components/Form/Organization/register';

export default function Page() {
  return (
    <div className="h-auto max-h-[calc(var(--app-vh)_-_100px)] w-full max-w-[600px] overflow-auto py-6 scrollbar-hide">
      <OrganizationRegister />
    </div>
  );
}
