import { useEffect, useState, useCallback, useRef } from 'react';
import { X, Download, FileText, AlertCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { chatApi } from '../api';

// ─── Shared types ──────────────────────────────────────────────────────────────

export interface GalleryItem {
  url: string;
  name: string;
  contentType: string | null;
}

interface Props extends GalleryItem {
  onClose: () => void;
  /** All images in the conversation for prev/next navigation */
  gallery?: GalleryItem[];
  /** Index of this image in gallery */
  galleryIndex?: number;
}

type Kind = 'image' | 'pdf' | 'video' | 'audio' | 'text' | 'unknown';

const detectKind = (ct: string | null, name: string): Kind => {
  const c = (ct ?? '').toLowerCase();
  const ext = name.toLowerCase().split('.').pop() ?? '';
  if (c.startsWith('image/')) return 'image';
  if (c === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (c.startsWith('video/')) return 'video';
  if (c.startsWith('audio/')) return 'audio';
  if (c.startsWith('text/') || ['txt','md','json','xml','csv','log'].includes(ext)) return 'text';
  return 'unknown';
};

// ─── Main export ───────────────────────────────────────────────────────────────

export function ChatAttachmentPreview({ url, name, contentType, onClose, gallery, galleryIndex = 0 }: Props) {
  const kind = detectKind(contentType, name);

  if (kind === 'image') {
    const items = gallery ?? [{ url, name, contentType }];
    const idx = gallery ? galleryIndex : 0;
    return <ImageGallery items={items} initialIndex={idx} onClose={onClose} />;
  }

  return <FilePreview url={url} name={name} contentType={contentType} kind={kind} onClose={onClose} />;
}

// ─── Image gallery (full-screen) ───────────────────────────────────────────────

interface GalleryProps {
  items: GalleryItem[];
  initialIndex: number;
  onClose: () => void;
}

function ImageGallery({ items, initialIndex, onClose }: GalleryProps) {
  const [idx, setIdx] = useState(Math.max(0, Math.min(initialIndex, items.length - 1)));
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const thumbScrollRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const current = items[idx];
  const hasPrev = idx > 0;
  const hasNext = idx < items.length - 1;

  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIdx((i) => Math.min(items.length - 1, i + 1)), [items.length]);

  // Load blob for current image
  useEffect(() => {
    let revoke: string | null = null;
    let cancelled = false;
    setLoading(true);
    setBlobUrl(null);
    chatApi.fetchAttachmentBlob(current.url)
      .then((blob) => {
        if (cancelled) return;
        const u = URL.createObjectURL(blob);
        revoke = u;
        setBlobUrl(u);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => {
      cancelled = true;
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [current.url]);

  // Scroll carousel to active thumb
  useEffect(() => {
    const btn = thumbRefs.current[idx];
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [idx]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  const handleDownload = async () => {
    try {
      const downloadUrl = current.url + (current.url.includes('?') ? '&inline=false' : '?inline=false');
      const blob = await chatApi.fetchAttachmentBlob(downloadUrl);
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u; a.download = current.name; a.click();
      URL.revokeObjectURL(u);
    } catch { alert('Tải về thất bại'); }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.88)', zIndex: 300 }}
      onClick={onClose}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm truncate mr-4" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 320 }}>
          {current.name}
        </p>
        <div className="flex items-center gap-3 shrink-0">
          {items.length > 1 && (
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {idx + 1} / {items.length}
            </span>
          )}
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)'; }}
            title="Tải về"
          >
            <Download size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)'; }}
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main image area */}
      <div
        className="flex-1 flex items-center justify-center relative min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev button */}
        {hasPrev && (
          <button
            onClick={prev}
            className="absolute left-3 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.12)', color: 'white' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.22)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)'; }}
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Image */}
        <div className="w-full h-full flex items-center justify-center px-16 py-4">
          {loading && <Loader2 size={32} className="animate-spin" style={{ color: 'rgba(255,255,255,0.4)' }} />}
          {blobUrl && !loading && (
            <img
              src={blobUrl}
              alt={current.name}
              className="max-w-full max-h-full object-contain select-none"
              style={{ borderRadius: 6, boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
              draggable={false}
            />
          )}
        </div>

        {/* Next button */}
        {hasNext && (
          <button
            onClick={next}
            className="absolute right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.12)', color: 'white' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.22)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)'; }}
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* Bottom carousel */}
      {items.length > 1 && (
        <div
          className="shrink-0 py-3 px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            ref={thumbScrollRef}
            className="flex items-center gap-1.5 overflow-x-auto justify-center"
            style={{ scrollbarWidth: 'none', paddingBottom: 2 }}
          >
            {items.map((item, i) => (
              <Thumb
                key={item.url + i}
                ref={(el) => { thumbRefs.current[i] = el; }}
                item={item}
                isActive={i === idx}
                onClick={() => setIdx(i)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Carousel thumbnail ─────────────────────────────────────────────────────────

import { forwardRef } from 'react';

interface ThumbProps {
  item: GalleryItem;
  isActive: boolean;
  onClick: () => void;
}

const Thumb = forwardRef<HTMLButtonElement, ThumbProps>(function Thumb({ item, isActive, onClick }, ref) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let revoke: string | null = null;
    chatApi.fetchAttachmentBlob(item.url)
      .then((blob) => {
        const u = URL.createObjectURL(blob);
        revoke = u;
        setSrc(u);
      })
      .catch(() => {});
    return () => { if (revoke) URL.revokeObjectURL(revoke); };
  }, [item.url]);

  return (
    <button
      ref={ref}
      onClick={onClick}
      style={{
        width: 52,
        height: 52,
        borderRadius: 6,
        border: `2px solid ${isActive ? 'white' : 'transparent'}`,
        opacity: isActive ? 1 : 0.5,
        overflow: 'hidden',
        flexShrink: 0,
        background: 'rgba(255,255,255,0.08)',
        padding: 0,
        transition: 'opacity 0.15s, border-color 0.15s',
        cursor: 'pointer',
      }}
    >
      {src && (
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      )}
    </button>
  );
});

// ─── File preview (non-image) ──────────────────────────────────────────────────

interface FilePreviewProps {
  url: string;
  name: string;
  contentType: string | null;
  kind: Kind;
  onClose: () => void;
}

function FilePreview({ url, name, contentType: _ct, kind, onClose }: FilePreviewProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let revoke: string | null = null;
    if (kind === 'unknown') { setLoading(false); return; }
    setLoading(true);
    chatApi.fetchAttachmentBlob(url)
      .then(async (blob) => {
        if (kind === 'text') {
          setTextContent(await blob.text());
        } else {
          const u = URL.createObjectURL(blob);
          revoke = u;
          setBlobUrl(u);
        }
      })
      .catch(() => setError('Không tải được tệp'))
      .finally(() => setLoading(false));
    return () => { if (revoke) URL.revokeObjectURL(revoke); };
  }, [url, kind]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  const handleDownload = async () => {
    try {
      const downloadUrl = url + (url.includes('?') ? '&inline=false' : '?inline=false');
      const blob = await chatApi.fetchAttachmentBlob(downloadUrl);
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u; a.download = name; a.click();
      URL.revokeObjectURL(u);
    } catch { alert('Tải về thất bại'); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="card w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--rule)' }}>
          <div className="min-w-0 flex-1 flex items-center gap-2">
            <FileText size={16} className="text-ink-3 shrink-0" />
            <p className="text-sm font-medium text-ink-1 truncate">{name}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={handleDownload} className="btn btn-ghost btn-sm gap-1.5">
              <Download size={14} /> Tải về
            </button>
            <button onClick={onClose} className="btn btn-ghost btn-icon"><X size={16} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto" style={{ background: 'var(--bg-surface-2)' }}>
          {loading && <div className="text-center py-20 text-ink-3">Đang tải...</div>}
          {error && (
            <div className="text-center py-20 text-ink-3 flex flex-col items-center gap-2">
              <AlertCircle size={32} className="opacity-40" />
              <p>{error}</p>
            </div>
          )}
          {!loading && !error && kind === 'pdf' && blobUrl && (
            <iframe src={blobUrl} title={name} className="w-full h-[80vh]" />
          )}
          {!loading && !error && kind === 'video' && blobUrl && (
            <div className="flex items-center justify-center p-4">
              <video src={blobUrl} controls className="max-w-full max-h-[80vh]" />
            </div>
          )}
          {!loading && !error && kind === 'audio' && blobUrl && (
            <div className="flex items-center justify-center py-16">
              <audio src={blobUrl} controls className="w-full max-w-md" />
            </div>
          )}
          {!loading && !error && kind === 'text' && textContent != null && (
            <pre className="text-xs p-5 font-mono whitespace-pre-wrap break-words text-ink-1">
              {textContent}
            </pre>
          )}
          {!loading && kind === 'unknown' && (
            <div className="text-center py-20 px-6">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm text-ink-2 mb-4">Không hỗ trợ xem trước định dạng này</p>
              <button onClick={handleDownload} className="btn btn-primary btn-sm gap-1.5">
                <Download size={14} /> Tải về
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
