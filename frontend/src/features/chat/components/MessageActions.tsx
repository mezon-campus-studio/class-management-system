import { Reply, SmilePlus, Pin, PinOff, Trash2 } from 'lucide-react';
import { useState } from 'react';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

interface Props {
  isMine: boolean;
  pinned: boolean;
  canPin: boolean;
  canDelete: boolean;
  pickerOpen: boolean;
  onPickerChange: (open: boolean) => void;
  onReply: () => void;
  onReact: (emoji: string) => void;
  onTogglePin: () => void;
  onDelete: () => void;
}

function ActionBtn({
  onClick, title, danger, children,
}: {
  onClick: () => void;
  title: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="p-1.5 rounded-md transition-colors"
      style={{
        color: danger ? 'var(--red-text)' : 'var(--ink-2)',
        background: hovered
          ? danger ? 'var(--red-fill)' : 'var(--bg-surface-2)'
          : 'transparent',
      }}
    >
      {children}
    </button>
  );
}

export function MessageActions({
  isMine, pinned, canPin, canDelete, pickerOpen, onPickerChange,
  onReply, onReact, onTogglePin, onDelete,
}: Props) {
  return (
    /* Outer — absolute positioning, vertically centered to the bubble */
    <div
      className={`
        absolute top-1/2 -translate-y-1/2
        ${isMine ? 'right-full mr-2' : 'left-full ml-2'}
        z-20
        ${pickerOpen ? 'pointer-events-auto' : 'pointer-events-none group-hover:pointer-events-auto'}
      `}
    >
    {/* Inner — opacity-only animation, no transform conflict */}
    <div
      className={`
        transition-opacity duration-200 ease-out
        ${pickerOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
      `}
    >
      {/* Action bar — fixed position, never moves */}
      <div
        className="relative flex items-center gap-0.5 px-1.5 py-1 rounded-lg"
        style={{
          background: 'white',
          border: '1px solid var(--rule)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        }}
      >
        {/* Emoji picker — absolute above action bar, centered, slides up on mount */}
        {pickerOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => onPickerChange(false)} />
            {/* outer: centering only — no transform animation here */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-40">
              {/* inner: animation only — translateX already handled by outer */}
              <div
                className="animate-fade-up flex gap-1 px-3 py-2"
                style={{
                  background: 'white',
                  border: '1px solid var(--rule)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  borderRadius: '14px',
                  whiteSpace: 'nowrap',
                }}
              >
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => { onReact(e); onPickerChange(false); }}
                    className="text-lg hover:scale-125 transition-transform px-0.5"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <ActionBtn onClick={() => onPickerChange(!pickerOpen)} title="Cảm xúc">
          <SmilePlus size={14} />
        </ActionBtn>
        <ActionBtn onClick={onReply} title="Trả lời">
          <Reply size={14} />
        </ActionBtn>
        {canPin && (
          <ActionBtn onClick={onTogglePin} title={pinned ? 'Bỏ ghim' : 'Ghim'}>
            {pinned ? <PinOff size={14} /> : <Pin size={14} />}
          </ActionBtn>
        )}
        {(isMine || canDelete) && (
          <ActionBtn onClick={onDelete} title="Xóa" danger>
            <Trash2 size={14} />
          </ActionBtn>
        )}
      </div>
    </div>
    </div>
  );
}
