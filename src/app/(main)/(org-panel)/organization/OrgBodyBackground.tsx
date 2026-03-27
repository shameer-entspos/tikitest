'use client';

import { useEffect } from 'react';

const ORG_BG = '#fafafa';

/**
 * Sets body background to org #fafafa on mount, clears on unmount.
 * Use on org admin routes (not signup) so any scale sub-pixel gap shows fafafa, not white.
 */
export function OrgBodyBackground() {
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = ORG_BG;
    return () => {
      document.body.style.backgroundColor = prev;
    };
  }, []);
  return null;
}
