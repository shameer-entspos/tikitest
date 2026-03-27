'use client';

import { UserList } from '@/components/UserList';

export default function Page() {
  return (
    <div className="flex min-h-full w-full flex-1 flex-col">
      <UserList />
    </div>
  );
}
