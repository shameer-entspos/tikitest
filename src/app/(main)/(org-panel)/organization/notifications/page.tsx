'use client';

import { Card } from '@/components/Cards';
import Switch from '@/components/Form/switch';

export default function Page() {
  return (
    <>
      <div className="flex min-h-full w-full max-w-[880px] flex-1 flex-col">
        <div className="mb-14 text-lg font-semibold text-black md:text-2xl">
          Notifications
        </div>
        <div className="mb-5 text-base font-semibold text-black">
          Set what notifications you get
        </div>

        <Card>
          <div className="mb-10 flex items-center justify-between last:mb-0">
            <div className="text-base font-normal text-black">
              Force Multi Factor Authentication
            </div>
            <div>
              <Switch></Switch>
            </div>
          </div>
          <div className="mb-10 flex items-center justify-between last:mb-0">
            <div className="text-base font-normal text-black">
              Allow user to reset password
            </div>
            <div>
              <Switch></Switch>
            </div>
          </div>
          <div className="mb-10 flex items-center justify-between last:mb-0">
            <div className="text-base font-normal text-black">
              Allow organisation & users to be found in external directory
            </div>
            <div>
              <Switch></Switch>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
