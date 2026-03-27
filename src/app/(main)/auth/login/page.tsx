'use client';
import { FromHeading } from '@/components/FormHeading';
import { LoginForm } from '@/components/loginForm';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Head from 'next/head';
import LoginLayout from './layout';
import { useSession } from 'next-auth/react';

export default function Page() {
  const search = useSearchParams();
  const [stringValue, setStringValue] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Access the current URL
    // const currentUrl = window.location.href;
    // Access query parameters
    const queryParams = new URLSearchParams(window?.location.search);
    const callbackUrlParam = queryParams.get('callbackUrl');

    // console.log("callbackUrl", callbackUrlParam);
    if (callbackUrlParam?.includes('/organization')) {
      setStringValue('organization');
    } else if (
      callbackUrlParam?.endsWith('/') ||
      (callbackUrlParam?.includes('/user') &&
        !callbackUrlParam?.includes('organization'))
    ) {
      setStringValue('user');
    }

    setLoading(false);
  }, [search, stringValue]);

  if (loading) {
    return <>Loading....</>;
  }

  return (
    <div className="m-auto h-auto max-h-[calc(var(--app-vh)_-_100px)] w-full max-w-[600px] overflow-auto rounded-2xl bg-white p-6 scrollbar-hide">
      <LoginForm />
    </div>
  );
}
