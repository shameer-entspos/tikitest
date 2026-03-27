'use client';

import { useEffect } from 'react';

const LOGIN_RED = '#fafafa'; // red-500, matches bg-red-500

/**
 * Sets body background to login red on mount, clears on unmount.
 * Removes the white strip at bottom when scale wrapper causes sub-pixel gap.
 */
export function LoginBodyBackground() {
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = LOGIN_RED;
    return () => {
      document.body.style.backgroundColor = prev;
    };
  }, []);
  return null;
}
