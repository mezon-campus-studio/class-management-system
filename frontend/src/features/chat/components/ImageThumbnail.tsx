import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { chatApi } from '../api';

interface Props {
  url: string;
  alt: string;
  onClick: () => void;
}

export function ImageThumbnail({ url, alt, onClick }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let revoke: string | null = null;
    setError(false);
    chatApi.fetchAttachmentBlob(url)
      .then((blob) => {
        const u = URL.createObjectURL(blob);
        revoke = u;
        setSrc(u);
      })
      .catch(() => setError(true));
    return () => { if (revoke) URL.revokeObjectURL(revoke); };
  }, [url]);

  if (error) {
    return (
      <div className="flex items-center justify-center w-48 h-32 rounded-md text-ink-3"
           style={{ background: 'var(--bg-surface-2)' }}>
        <ImageOff size={20} />
      </div>
    );
  }
  if (!src) {
    return (
      <div className="w-48 h-32 rounded-md animate-pulse"
           style={{ background: 'var(--bg-surface-2)' }} />
    );
  }
  return (
    <button onClick={onClick} className="block rounded-md overflow-hidden border"
            style={{ borderColor: 'var(--rule)' }}>
      <img src={src} alt={alt} className="max-w-[280px] max-h-[200px] object-cover" />
    </button>
  );
}
