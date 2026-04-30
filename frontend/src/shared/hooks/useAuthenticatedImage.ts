import { useState, useEffect } from 'react';
import { api } from '@/services/api-client';

/**
 * Fetches an auth-protected image URL using axios and returns a local blob URL.
 * Falls back to null if the URL is empty or the fetch fails.
 */
export function useAuthenticatedImage(url: string | null | undefined): string | null {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url || !url.startsWith('/')) { setBlobUrl(null); return; }
    setBlobUrl(null);
    let revoked = false;
    let objectUrl: string | null = null;
    // Strip /api/v1 prefix — axios baseURL already includes it
    const path = url.startsWith('/api/v1') ? url.slice('/api/v1'.length) : url;
    api.get(path, { responseType: 'blob' })
      .then((r) => {
        if (revoked) return;
        objectUrl = URL.createObjectURL(r.data as Blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {});
    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return blobUrl;
}
