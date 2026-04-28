import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import type { ReactionAggregate } from '../types';

interface Props {
  reactions: ReactionAggregate[];
  /** Resolves a userId to a display name; falls back to "Người dùng" if missing. */
  resolveUserName?: (userId: string) => string | undefined;
  onToggle: (emoji: string, currentlyReacted: boolean) => void;
  /** Cap on inline-rendered chips before collapsing into a "+N" pill. */
  maxVisible?: number;
  /** Which edge to anchor the popover to. */
  align?: 'left' | 'right';
}

/**
 * Compact reactions chip strip. Renders up to {@link Props.maxVisible}
 * emoji chips inline; the rest collapse into a "+N" badge that opens a
 * popover listing every voter grouped by emoji.
 */
export function ReactionRow({ reactions, resolveUserName, onToggle, maxVisible = 3, align = 'left' }: Props) {
  const [openPopover, setOpenPopover] = useState<'overflow' | string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click / escape.
  useEffect(() => {
    if (!openPopover) return;
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpenPopover(null);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenPopover(null); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [openPopover]);

  if (!reactions || reactions.length === 0) return null;

  const visible = reactions.slice(0, maxVisible);
  const hidden = reactions.slice(maxVisible);
  const hiddenTotal = hidden.reduce((sum, r) => sum + r.count, 0);

  const popoverGroups = openPopover === 'overflow' ? hidden : reactions.filter((r) => r.emoji === openPopover);

  return (
    <div ref={containerRef} className="relative inline-flex items-center gap-1">
      {visible.map((r) => (
        <button
          key={r.emoji}
          onClick={(e) => {
            // Plain click toggles the reaction. Right-click / long-press
            // (handled via contextmenu) opens the voter list. We also open
            // the list when shift-clicking.
            if (e.shiftKey) {
              e.preventDefault();
              setOpenPopover(openPopover === r.emoji ? null : r.emoji);
              return;
            }
            onToggle(r.emoji, r.reactedByMe);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setOpenPopover(openPopover === r.emoji ? null : r.emoji);
          }}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] transition-colors"
          style={{
            background: 'white',
            border: `1.5px solid ${r.reactedByMe ? 'var(--warm-400)' : 'var(--rule)'}`,
            color: 'var(--ink-1)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
          title="Bấm để bỏ/thả · Chuột phải để xem ai đã thả"
        >
          <span>{r.emoji}</span>
          <span className="font-medium">{r.count}</span>
        </button>
      ))}

      {hidden.length > 0 && (
        <button
          onClick={(e) => {
            e.preventDefault();
            setOpenPopover(openPopover === 'overflow' ? null : 'overflow');
          }}
          className="flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium transition-colors"
          style={{
            background: 'white',
            border: '1.5px solid var(--rule)',
            color: 'var(--ink-2)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
          title="Xem tất cả lượt thả cảm xúc"
        >
          +{hiddenTotal}
        </button>
      )}

      {openPopover && popoverGroups.length > 0 && (
        <div
          className="absolute z-50 animate-scale-in"
          style={{
            bottom: 'calc(100% + 6px)',
            ...(align === 'right' ? { right: 0, transformOrigin: 'bottom right' } : { left: 0, transformOrigin: 'bottom left' }),
          }}
        >
          <div
            className="rounded-lg overflow-hidden"
            style={{
              background: 'white',
              border: '1px solid var(--rule)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
              minWidth: 180,
              maxWidth: 260,
            }}
          >
            <div
              className="flex items-center justify-between px-3 py-2"
              style={{ borderBottom: '1px solid var(--rule)', background: 'var(--bg-surface-2)' }}
            >
              <span className="text-[11px] font-semibold text-ink-2 uppercase tracking-wide">
                Đã thả cảm xúc
              </span>
              <button
                onClick={() => setOpenPopover(null)}
                className="text-ink-3 hover:text-ink-1 transition-colors"
                title="Đóng"
              >
                <X size={12} />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {popoverGroups.map((g) => (
                <div key={g.emoji} className="px-3 py-1.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{g.emoji}</span>
                    <span className="text-[11px] text-ink-3">{g.count}</span>
                  </div>
                  <ul className="space-y-0.5 pl-1">
                    {g.userIds.map((uid) => (
                      <li key={uid} className="text-xs text-ink-1 flex items-center gap-1.5">
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-semibold text-white shrink-0"
                          style={{ background: 'var(--sidebar-accent)' }}
                        >
                          {(resolveUserName?.(uid) ?? '?').charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate">{resolveUserName?.(uid) ?? 'Người dùng'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
