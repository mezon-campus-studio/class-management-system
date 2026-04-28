import { CornerDownRight } from 'lucide-react';
import type { ReplyPreview } from '../types';

interface Props {
  reply: ReplyPreview;
  isMine: boolean;
  onClick?: () => void;
}

export function QuotedMessage({ reply, isMine, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start gap-1.5 px-2 py-1.5 rounded text-left max-w-full mb-1.5"
      style={{
        background: isMine ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.05)',
        borderLeft: `3px solid ${isMine ? 'rgba(255,255,255,0.5)' : 'var(--sidebar-accent)'}`,
        color: isMine ? 'rgba(255,255,255,0.92)' : 'var(--ink-2)',
      }}
    >
      <CornerDownRight size={11} className="shrink-0 mt-0.5 opacity-60" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold opacity-80 truncate">
          {reply.senderName ?? 'Người dùng'}
        </p>
        <p className="text-[12px] opacity-80 truncate">
          {reply.deleted ? <span className="italic">Tin nhắn đã bị xóa</span> : reply.preview}
        </p>
      </div>
    </button>
  );
}
