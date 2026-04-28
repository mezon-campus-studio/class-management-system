import { useState } from 'react';
import { Pin, ChevronDown, ChevronUp } from 'lucide-react';
import type { Message } from '../types';

interface Props {
  pinned: Message[];
  onJump: (messageId: string) => void;
}

const previewOf = (m: Message): string => {
  if (m.deleted) return 'Tin nhắn đã bị xóa';
  switch (m.messageType) {
    case 'TEXT':  return m.content ?? '';
    case 'IMAGE': return `🖼 ${m.attachmentName ?? 'Hình ảnh'}`;
    case 'FILE':  return `📎 ${m.attachmentName ?? 'Tệp đính kèm'}`;
    case 'POLL':  return '📊 Bình chọn';
    case 'EVENT': return '📅 Sự kiện';
  }
};

export function PinnedBar({ pinned, onJump }: Props) {
  const [open, setOpen] = useState(false);
  if (pinned.length === 0) return null;

  // Collapsed → show only the most recent; expanded → list all.
  const top = pinned[0];

  return (
    <div className="card mb-3 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-surface-2 text-left"
        title={pinned.length > 1 ? 'Bấm để mở rộng' : ''}
      >
        <Pin size={13} style={{ color: 'var(--warm-400)' }} className="shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">
            Đã ghim ({pinned.length})
          </p>
          <p className="text-xs text-ink-2 truncate">
            <span className="font-medium">{top.senderName ?? 'Người dùng'}:</span>{' '}
            {previewOf(top)}
          </p>
        </div>
        {pinned.length > 1 && (
          open ? <ChevronUp size={14} className="text-ink-3 shrink-0" />
               : <ChevronDown size={14} className="text-ink-3 shrink-0" />
        )}
      </button>

      {open && pinned.length > 1 && (
        <div className="border-t" style={{ borderColor: 'var(--rule)' }}>
          {pinned.slice(1).map((m) => (
            <button
              key={m.id}
              onClick={() => onJump(m.id)}
              className="w-full flex items-start gap-2 px-4 py-2 hover:bg-surface-2 text-left border-t"
              style={{ borderColor: 'var(--rule)' }}
            >
              <Pin size={11} style={{ color: 'var(--warm-400)' }} className="shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ink-2 truncate">
                  <span className="font-medium">{m.senderName ?? 'Người dùng'}:</span>{' '}
                  {previewOf(m)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
