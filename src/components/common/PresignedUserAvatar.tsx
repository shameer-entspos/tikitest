'use client';

import { usePresignedUserPhoto } from '@/hooks/usePresignedUserPhoto';

/**
 * Avatar for user photos that may be S3 keys — resolves via presigned URL.
 */
export function PresignedUserAvatar({
  photo,
  alt = 'avatar',
  className,
  fallback = '/images/user.png',
}: {
  photo?: string | null;
  alt?: string;
  className?: string;
  fallback?: string;
}) {
  const src = usePresignedUserPhoto(photo ?? undefined, fallback);
  return <img src={src} alt={alt} className={className} />;
}
