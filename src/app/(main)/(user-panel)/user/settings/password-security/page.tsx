'use client';
import { useState } from 'react';
import { Button } from '@/components/Buttons';
import { Card } from '@/components/Cards';
import ChangePasswordModal from '@/components/popupModal/changePassword';

export default function Page() {
  const [PasswordModal, setPasswordModal] = useState(false);
  return (
    <>
      <div className="max-w-[880px]">
        <h3 className="8 text-lg font-bold text-black md:text-xl lg:text-2xl">
          Password & Security
        </h3>

        <ChangePasswordModal />
      </div>
    </>
  );
}
