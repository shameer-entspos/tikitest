'use client';

import { useEffect } from 'react';

const SIGNUP_RED = '#fafafa'; // red-500, matches bg-red-500

/**
 * Sets body background to red on signup/verify OTP mount, clears on unmount.
 * Removes the white strip at bottom when scale wrapper causes sub-pixel gap.
 */
export function SignupBodyBackground() {
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = SIGNUP_RED;
    return () => {
      document.body.style.backgroundColor = prev;
    };
  }, []);
  return null;
}
