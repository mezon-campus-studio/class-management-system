import { useEffect, useState } from 'react';
import { X, Download, FileText, AlertCircle } from 'lucide-react';
import { chatApi } from '../api';

interface Props {
  url: string;
  name: string;
  contentType: string | null;
  onClose: () => void;
}

type Kind = 'image' | 'pdf' | 'video' | 'audio' | 'text' | 'unknown';

const detectKind = (contentType: string | null, name: string): Kind => {
  const ct = (contentType ?? '').toLowerCase();
  const ext = name.toLowerCase().split('.').pop() ?? '';
  if (ct.startsWith('image/')) return 'image';
  if (ct === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (ct.startsWith('video/')) return 'video';
  if (ct.startsWith('audio/')) return 'audio';
  if (ct.startsWith('text/') || ['txt','md','json','xml','csv','log'].includes(ext)) return 'text';
  return 'unknown';
};

export function ChatAttachmentPreview({ url, name, contentType, onClose }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const kind = detectKind(contentType, name);

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
      // Backend supports ?inline=false to force attachment disposition
      const downloadUrl = url + (url.includes('?') ? '&inline=false' : '?inline=false');
      const blob = await chatApi.fetchAttachmentBlob(downloadUrl);
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u; a.download = name; a.click();
      URL.revokeObjectURL(u);
    } catch { alert('Tải về thất bại'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
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
          {!loading && !error && kind === 'image' && blobUrl && (
            <div className="flex items-center justify-center p-4">
              <img src={blobUrl} alt={name} className="max-w-full max-h-[80vh] object-contain" />
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
