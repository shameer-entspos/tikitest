'use client';

import { AppDispatch, RootState } from '@/store';
import { setLoginType } from '@/store/authNavbarSlice';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
function AuthNavbar() {
  const reduxDispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const loginType = useSelector(
    (state: RootState) => state.authNavbar.loginType
  );
  // 3. Toggle handler with proper state management
  const handleToggleLoginType = useCallback(() => {
    const newLoginType = loginType === 'user' ? 'organization' : 'user';

    // Update Redux first
    reduxDispatch(setLoginType(newLoginType));

    // Then navigate
    router.push(newLoginType === 'user' ? '/user' : '/organization');
  }, [loginType, reduxDispatch, router]);
  return (
    <div>
      <nav className="w-full bg-primary-600 shadow">
        <div className="mx-auto flex max-w-7xl justify-between px-5 py-3 sm:px-6 sm:py-4 md:items-center md:px-8 md:py-5 lg:px-10 xl:px-12">
          <div className="flex items-center justify-between md:block">
            <a href="/auth/login">
              <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                Tiki
              </h1>
            </a>
          </div>

          <button
            type="button"
            className="cursor-pointer rounded-full bg-white px-6 py-2.5 text-base font-bold text-primary-500 sm:px-7 sm:py-3 sm:text-lg md:px-8 md:py-3"
            onClick={() => {
              const newLoginType = loginType === 'user' ? 'admin' : 'user';
              reduxDispatch(setLoginType(newLoginType));

              // Use router.push instead of replace to maintain history
              router.push(
                newLoginType === 'user'
                  ? `${process.env.NEXT_PUBLIC_APP_URL}/user`
                  : `${process.env.NEXT_PUBLIC_APP_URL}/organization`
              );
            }}
          >
            {loginType == 'user' ? 'Admin Portal' : 'User Portal'}
          </button>
        </div>
      </nav>
    </div>
  );
}

export { AuthNavbar };
