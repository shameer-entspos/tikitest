import { AxiosInstance } from 'axios';

/**
 * Get presigned URLs for multiple S3 attachments in one request (batch).
 * keys can be full S3 URLs or object keys; one key = same as batch of one.
 * Returns urls in the same order as keys. Pass accessToken for auth.
 */
export async function getPresignedFileUrls(
  axiosAuth: AxiosInstance,
  keys: string[],
  accessToken: string | null | undefined
): Promise<string[] | null> {
  if (!keys?.length || !accessToken?.trim()) return null;
  const trimmed = keys.map((k) => (typeof k === 'string' ? k.trim() : '')).filter(Boolean);
  if (!trimmed.length) return null;
  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken!.trim()}`,
    };
    const res = await axiosAuth.post<{ urls: string[]; expiresIn: number }>(
      `user/file/presigned-urls`,
      { keys: trimmed },
      { headers }
    );
    return res.data?.urls ?? null;
  } catch {
    return null;
  }
}

/**
 * Get a short-lived presigned URL for one S3 attachment (private bucket).
 * Use for single-image or download links. For multiple images prefer getPresignedFileUrls.
 */
export async function getPresignedFileUrl(
  axiosAuth: AxiosInstance,
  keyOrFullUrl: string | null | undefined,
  accessToken?: string | null
): Promise<string | null> {
  if (!keyOrFullUrl?.trim()) return null;
  try {
    const headers: Record<string, string> = {};
    if (accessToken?.trim()) {
      headers['Authorization'] = `Bearer ${accessToken.trim()}`;
    }
    const res = await axiosAuth.get<{ url: string; expiresIn: number }>(
      `user/file/presigned-url`,
      { params: { key: keyOrFullUrl.trim() }, headers }
    );
    return res.data?.url ?? null;
  } catch {
    return null;
  }
}
