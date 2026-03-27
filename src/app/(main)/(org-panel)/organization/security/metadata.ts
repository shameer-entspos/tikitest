import type { Metadata } from 'next';
import { orgSecurityMetadata } from '@/app/metadata';

export const metadata: Metadata = {
  ...orgSecurityMetadata,
  robots: {
    index: false,
    follow: false,
  },
};
