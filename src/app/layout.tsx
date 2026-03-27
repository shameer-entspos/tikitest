'use client';
import './globals.css';
import { Open_Sans } from 'next/font/google';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { NextUIProvider } from '@nextui-org/react';
import { Provider } from 'react-redux';
import store from '@/store';
import { useEffect, useState } from 'react';

const queryClient = new QueryClient();

const OpenSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  preload: false,
});

const scaleStyle: React.CSSProperties = {
  transform: 'scale(0.85)',
  transformOrigin: '0 0',
  width: '117.647%',
  minHeight: '117.647vh',
};

const mobileScaleStyle: React.CSSProperties = {
  transform: 'none',
  transformOrigin: '0 0',
  width: '100%',
  minHeight: '118dvh',
};
// const scaleStyle: React.CSSProperties = {
//   transform: 'scale(0.90)',
//   transformOrigin: '0 0',
//   width: '112%', // Adjust this value to control the overall width of the viewport
//   minHeight: '112dvh', // Adjust this value to control the overall height of the viewport
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [disableRootScale, setDisableRootScale] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = window.navigator.userAgent || '';
    const platform = window.navigator.platform || '';
    const maxTouchPoints = window.navigator.maxTouchPoints || 0;

    const isIOSUA = /iPhone|iPad|iPod/i.test(ua);
    const isIPadOS = platform === 'MacIntel' && maxTouchPoints > 1;

    setDisableRootScale(isIOSUA || isIPadOS);
  }, []);

  const rootWrapperStyle = {
    ...(disableRootScale ? mobileScaleStyle : scaleStyle),
    // Shared viewport variable to use in Tailwind arbitrary values:
    // h-[var(--app-vh)] or h-[calc(var(--app-vh)-144px)]
    ['--app-vh' as string]: disableRootScale ? '118dvh' : '118dvh',
  } as React.CSSProperties;

  const content = (
    <Provider store={store}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <NextUIProvider>{children}</NextUIProvider>
        </QueryClientProvider>
      </SessionProvider>
      <Toaster position="top-right" reverseOrder={true} />
    </Provider>
  );

  return (
    <html
      lang="en"
      className={`${OpenSans.className} ${disableRootScale ? 'overflow-auto' : 'overflow-hidden'}`}
    >
      <body
        className={`${OpenSans.className} ${disableRootScale ? 'overflow-auto' : 'overflow-hidden'}`}
        suppressHydrationWarning={true}
      >
        <div style={rootWrapperStyle}>{content}</div>
      </body>
    </html>
  );
}
