import type { Metadata } from 'next';
import { orgTeamsMetadata } from '@/app/metadata';

export const metadata: Metadata = {
  ...orgTeamsMetadata,
  robots: {
    index: false,
    follow: false,
  },
};
