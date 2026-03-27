'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './index';

/**
 * Renders Org Navbar on all org routes except signup, so signup can use
 * full-screen red bg with AuthNavbar (same as login).
 */
export function ConditionalOrgNavbar() {
  const pathname = usePathname();
  if (pathname === '/organization/signup') return null;
  return <Navbar />;
}
