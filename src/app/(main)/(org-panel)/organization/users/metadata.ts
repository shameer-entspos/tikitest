import type { Metadata } from 'next';
import { orgUsersMetadata } from '@/app/metadata';

export const metadata: Metadata = {
  ...orgUsersMetadata,
  robots: {
    index: false,
    follow: false,
  },
};
