import { getPresignedFileUrl } from '@/app/(main)/(user-panel)/user/file/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const DEFAULT_FALLBACK = '/images/user.png';

/**
 * Resolves a user photo (S3 key or URL) to a presigned URL for display.
 * Use for profile photos, avatars, etc. that may be stored in the private file bucket.
 * Returns the presigned URL when available, otherwise the raw photo or fallback.
 */
export function usePresignedUserPhoto(
  photo: string | null | undefined,
  fallback: string = DEFAULT_FALLBACK
): string {
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;
  const raw = typeof photo === 'string' ? photo.trim() : '';
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!raw || !accessToken?.trim()) {
      setResolvedUrl(null);
      return;
    }
    let cancelled = false;
    getPresignedFileUrl(axiosAuth, raw, accessToken).then((url) => {
      if (!cancelled && url) setResolvedUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [raw, accessToken, axiosAuth]);

  return resolvedUrl ?? (raw || fallback);
}
