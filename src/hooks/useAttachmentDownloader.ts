'use client';

import { getPresignedFileUrl } from '@/app/(main)/(user-panel)/user/file/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useSession } from 'next-auth/react';
import { useCallback, useState } from 'react';

/**
 * Returns a function that fetches a fresh presigned URL and triggers the download.
 * Use for chat attachments (image, file, etc.) so download works even after the
 * display presigned URL has expired (403).
 */
export function useAttachmentDownloader() {
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const [downloading, setDownloading] = useState(false);

  const downloadAttachment = useCallback(
    async (rawUrl: string | null | undefined, filename?: string) => {
      if (!rawUrl?.trim()) return;
      const accessToken = session?.user?.accessToken;
      if (!accessToken?.trim()) return;

      setDownloading(true);
      try {
        const url = await getPresignedFileUrl(axiosAuth, rawUrl.trim(), accessToken);
        if (!url) return;

        const name =
          filename?.trim() ||
          rawUrl.split('/').pop()?.split('?')[0] ||
          'download';

        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } finally {
        setDownloading(false);
      }
    },
    [axiosAuth, session?.user?.accessToken]
  );

  return { downloadAttachment, downloading };
}
