import type { Metadata } from 'next';
import { orgBillingMetadata } from '@/app/metadata';

export const metadata: Metadata = {
  ...orgBillingMetadata,
  robots: {
    index: false,
    follow: false,
  },
};
