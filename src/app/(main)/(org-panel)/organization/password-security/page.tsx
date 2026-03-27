'use client';
import { useState } from 'react';
import { Button } from '@/components/Buttons';
import { Card } from '@/components/Cards';
import ChangePasswordModal from '@/components/popupModal/changePassword';

export default function Page() {
  const [PasswordModal, setPasswordModal] = useState(false);
  return (
    <>
      <div className="flex min-h-full w-full max-w-[880px] flex-1 flex-col">
        <h3 className="8 text-lg font-bold text-black md:text-xl lg:text-2xl">
          Password & Security
        </h3>

        <ChangePasswordModal />
      </div>
    </>
  );
}
