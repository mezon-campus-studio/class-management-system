import { useState, useEffect, useRef } from 'react';
import { Pin, ChevronRight, Image as ImageIcon, Palette, FileText, Upload, Loader2 } from 'lucide-react';
import type { Message } from '../types';
import { chatApi } from '../api';

// ─── Constants ─────────────────────────────────────────────────────────────────

const WALLPAPERS = [
  { id: 'none',     label: 'Mặc định',   bg: '' },
  { id: 'warm',     label: 'Ấm',         bg: 'linear-gradient(135deg,#fff9f0,#fef3e2)' },
  { id: 'cool',     label: 'Mát',        bg: 'linear-gradient(135deg,#f0f7ff,#e3f2fd)' },
  { id: 'green',    label: 'Thiên nhiên',bg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)' },
  { id: 'lavender', label: 'Tím',        bg: 'linear-gradient(135deg,#fdf4ff,#f3e8ff)' },
  { id: 'rose',     label: 'Hồng',       bg: 'linear-gradient(135deg,#fff1f2,#ffe4e6)' },
];

const BUBBLE_COLORS = [
  { id: 'default', value: 'var(--sidebar-accent)', display: '#8B6F5E', label: 'Mặc định' },
  { id: 'blue',    value: '#3B82F6', display: '#3B82F6', label: 'Xanh dương' },
  { id: 'emerald', value: '#10B981', display: '#10B981', label: 'Xanh lá' },
  { id: 'violet',  value: '#7C3AED', display: '#7C3AED', label: 'Tím' },
  { id: 'rose',    value: '#E11D48', display: '#E11D48', label: 'Hồng' },
  { id: 'amber',   value: '#D97706', display: '#D97706', label: 'Cam' },
  { id: 'slate',   value: '#475569', display: '#475569', label: 'Xám tối' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────

function msgPreview(msg: Message): string {
  switch (msg.messageType) {
    case 'TEXT':  return msg.content ?? '';
    case 'IMAGE': return '🖼 Hình ảnh';
    case 'FILE':  return `📎 ${msg.attachmentName ?? 'Tệp'}`;
    case 'POLL':  return '📊 Bình chọn';
    case 'EVENT': return '📅 Sự kiện';
    default:      return '';
  }
}

function fmtTime(s: string) {
  return new Date(s).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

// ─── Media thumbnail ─────────────────────────────────────────────────────────

function MediaCell({ url, alt, onClick }: { url: string; alt: string; onClick: () => void }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let obj: string | null = null;
    chatApi.fetchAttachmentBlob(url).then((blob) => {
      obj = URL.createObjectURL(blob);
      setSrc(obj);
    }).catch(() => {});
    return () => { if (obj) URL.revokeObjectURL(obj); };
  }, [url]);

  return (
    <button onClick={onClick} className="aspect-square w-full rounded-lg overflow-hidden hover:opacity-90 transition-opacity">
      {src
        ? <img src={src} alt={alt} className="w-full h-full object-cover" />
        : <div className="w-full h-full animate-pulse bg-surface-2" />}
    </button>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  className?: string;
  pinnedMessages: Message[];
  messages: Message[];
  onJumpToMessage: (id: string) => void;
  bubbleColor: string;
  onBubbleColorChange: (c: string) => void;
  wallpaper: string;
  onWallpaperChange: (w: string) => void;
  onWallpaperImageUpload: (file: File) => Promise<void>;
  onPreviewAttachment: (url: string, name: string, contentType: string | null) => void;
}

export function ChatRightPanel({
  className = '',
  pinnedMessages,
  messages,
  onJumpToMessage,
  bubbleColor,
  onBubbleColorChange,
  wallpaper,
  onWallpaperChange,
  onWallpaperImageUpload,
  onPreviewAttachment,
}: Props) {
  const [tab, setTab] = useState<'media' | 'settings'>('settings');
  const [uploadingWallpaper, setUploadingWallpaper] = useState(false);
  const wallpaperInputRef = useRef<HTMLInputElement>(null);

  const handleWallpaperFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (wallpaperInputRef.current) wallpaperInputRef.current.value = '';
    setUploadingWallpaper(true);
    try {
      await onWallpaperImageUpload(file);
    } finally {
      setUploadingWallpaper(false);
    }
  };

  const imageMessages = messages.filter((m) => !m.deleted && m.messageType === 'IMAGE' && m.attachmentUrl);
  const fileMessages  = messages.filter((m) => !m.deleted && m.messageType === 'FILE'  && m.attachmentUrl);

  return (
    <div className={`flex flex-col gap-3 min-h-0 ${className}`}>

      {/* ── Media / Settings panel — TOP (50%, scrollable) ──────────────────── */}
      <div className="card flex flex-col flex-1 min-h-0 overflow-hidden" style={{ flexBasis: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        {/* Tab bar */}
        <div className="flex shrink-0" style={{ borderBottom: '1px solid var(--rule)' }}>
          {(['media', 'settings'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 text-xs font-semibold transition-colors"
              style={{
                color: tab === t ? 'var(--sidebar-accent)' : 'var(--ink-3)',
                borderBottom: `2px solid ${tab === t ? 'var(--sidebar-accent)' : 'transparent'}`,
              }}
            >
              {t === 'media' ? 'Media' : 'Tuỳ chỉnh'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">

          {/* Media tab */}
          {tab === 'media' && (
            <div className="p-3 space-y-4">
              {imageMessages.length === 0 && fileMessages.length === 0 ? (
                <div className="text-center py-10">
                  <ImageIcon size={28} className="mx-auto mb-2 opacity-20" />
                  <p className="text-xs text-ink-3">Chưa có media nào được gửi</p>
                </div>
              ) : (
                <>
                  {imageMessages.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-ink-3 uppercase tracking-wide mb-2">
                        Hình ảnh ({imageMessages.length})
                      </p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {imageMessages.map((msg) => (
                          <MediaCell
                            key={msg.id}
                            url={msg.attachmentUrl!}
                            alt={msg.attachmentName ?? ''}
                            onClick={() => onPreviewAttachment(msg.attachmentUrl!, msg.attachmentName ?? '', msg.attachmentType)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {fileMessages.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-ink-3 uppercase tracking-wide mb-2">
                        Tệp ({fileMessages.length})
                      </p>
                      <div className="space-y-1.5">
                        {fileMessages.map((msg) => (
                          <button
                            key={msg.id}
                            onClick={() => onPreviewAttachment(msg.attachmentUrl!, msg.attachmentName ?? 'tệp', msg.attachmentType)}
                            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left hover:bg-surface-2 transition-colors"
                            style={{ border: '1px solid var(--rule)' }}
                          >
                            <FileText size={14} style={{ color: 'var(--sidebar-accent)' }} className="shrink-0" />
                            <span className="text-xs text-ink-1 truncate">{msg.attachmentName ?? 'Tệp'}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Settings tab */}
          {tab === 'settings' && (
            <div className="p-4 space-y-6">

              {/* Wallpaper */}
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <ImageIcon size={12} style={{ color: 'var(--sidebar-accent)' }} />
                  <p className="text-[11px] font-semibold text-ink-3 uppercase tracking-wide">Hình nền</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {WALLPAPERS.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => onWallpaperChange(w.bg)}
                      title={w.label}
                      className="h-14 rounded-lg overflow-hidden transition-all flex items-center justify-center"
                      style={{
                        background: w.bg || 'white',
                        border: `2px solid ${wallpaper === w.bg ? 'var(--sidebar-accent)' : 'var(--rule)'}`,
                      }}
                    >
                      {!w.bg && (
                        <span className="text-[9px] text-ink-3 font-medium">Mặc định</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom image upload */}
                <input
                  ref={wallpaperInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleWallpaperFileSelect}
                />
                <button
                  onClick={() => wallpaperInputRef.current?.click()}
                  disabled={uploadingWallpaper}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs transition-colors"
                  style={{
                    border: `1.5px dashed ${wallpaper && !WALLPAPERS.some(w => w.bg === wallpaper) ? 'var(--sidebar-accent)' : 'var(--rule)'}`,
                    color: wallpaper && !WALLPAPERS.some(w => w.bg === wallpaper) ? 'var(--sidebar-accent)' : 'var(--ink-3)',
                    background: 'transparent',
                  }}
                >
                  {uploadingWallpaper
                    ? <><Loader2 size={12} className="animate-spin" /> Đang tải lên...</>
                    : <><Upload size={12} /> Ảnh từ máy</>}
                </button>
              </div>

              {/* Bubble color */}
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <Palette size={12} style={{ color: 'var(--sidebar-accent)' }} />
                  <p className="text-[11px] font-semibold text-ink-3 uppercase tracking-wide">Màu tin nhắn của bạn</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {BUBBLE_COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onBubbleColorChange(c.value)}
                      title={c.label}
                      className="w-8 h-8 rounded-full transition-all"
                      style={{
                        background: c.display,
                        outline: bubbleColor === c.value ? `2px solid ${c.display}` : 'none',
                        outlineOffset: '2px',
                        boxShadow: bubbleColor === c.value ? `0 0 0 4px rgba(0,0,0,0.06)` : 'none',
                      }}
                    />
                  ))}
                </div>
                {/* Preview */}
                <div className="mt-3 flex justify-end">
                  <div
                    className="px-3 py-1.5 rounded-2xl text-xs text-white"
                    style={{ background: bubbleColor === 'var(--sidebar-accent)' ? '#8B6F5E' : bubbleColor }}
                  >
                    Xin chào bạn! 👋
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* ── Pinned messages — BOTTOM (50%, scrollable, no item cap) ─────────── */}
      <div
        className="card flex flex-col flex-1 min-h-0 overflow-hidden"
        style={{ flexBasis: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
      >
        <div
          className="px-3 py-2.5 flex items-center gap-1.5 shrink-0"
          style={{ borderBottom: '1px solid var(--rule)', background: 'var(--bg-surface-2)' }}
        >
          <Pin size={12} style={{ color: 'var(--sidebar-accent)' }} />
          <span className="text-xs font-semibold text-ink-2 uppercase tracking-wide">Đã ghim</span>
          <span className="ml-auto text-xs text-ink-3">{pinnedMessages.length}</span>
        </div>

        <div className="overflow-y-auto flex-1">
          {pinnedMessages.length === 0 ? (
            <p className="text-xs text-ink-3 text-center py-5">Chưa có tin nhắn đã ghim</p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--rule)' }}>
              {pinnedMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => onJumpToMessage(msg.id)}
                  className="w-full px-3 py-2.5 text-left hover:bg-surface-2 transition-colors flex items-start gap-2 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-ink-2 truncate">
                      {msg.senderName ?? 'Người dùng'}
                    </p>
                    <p className="text-xs text-ink-1 truncate mt-0.5">{msgPreview(msg)}</p>
                    <p className="text-[10px] text-ink-3 mt-0.5">{fmtTime(msg.createdAt)}</p>
                  </div>
                  <ChevronRight size={12} className="text-ink-4 mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
