'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const KIOSK_LOCK_KEY = 'sr_kiosk_locked';
const KIOSK_LOCK_APP_ID_KEY = 'sr_kiosk_locked_app_id';

/**
 * When kiosk is locked, redirect any navigation outside the kiosk app back to the kiosk app.
 * Restricts entire SaaS to the kiosk screen while locked.
 */
export function KioskLockGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const locked = sessionStorage.getItem(KIOSK_LOCK_KEY);
    const appId = sessionStorage.getItem(KIOSK_LOCK_APP_ID_KEY);
    if (locked !== 'true' || !appId) return;
    const kioskPath = `/user/apps/sr/${appId}`;
    if (pathname && !pathname.startsWith(kioskPath)) {
      router.replace(kioskPath);
    }
  }, [pathname, router]);

  return null;
}
