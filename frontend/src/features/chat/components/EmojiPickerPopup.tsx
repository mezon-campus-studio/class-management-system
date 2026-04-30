import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

const CATEGORIES = [
  {
    label: 'Cảm xúc',
    emojis: [
      '😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','🥰','😘',
      '😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥',
      '😮','🤐','😯','😪','😫','🥱','😴','😛','😜','😝','🤤','😒','😓','😔','😕',
      '🙃','🤑','😲','☹️','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩',
      '🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','🥴','😠','😡','🤬','😷','🤒',
      '🤕','🤧','🥺','🥳','🤠','🤡','🤥','🤫','🤭','🧐','🤓','😈','👿','👻','💀',
    ],
  },
  {
    label: 'Cử chỉ',
    emojis: [
      '👍','👎','👊','✊','🤛','🤜','🤞','✌️','🤟','🤘','👌','🤌','🤏','👈','👉',
      '👆','👇','☝️','🫵','✋','🤚','🖐️','🖖','🫱','🫲','🫳','🫴','👋','🤙','💪',
      '🦾','🖕','✍️','🤝','🙏','🫶','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎',
      '💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☯️','🕊️','🏳️',
    ],
  },
  {
    label: 'Biểu tượng',
    emojis: [
      '⭐','🌟','💫','✨','⚡','🔥','💥','🌈','☀️','🌤️','⛅','🌦️','🌧️','⛈️','🌩️',
      '🌨️','❄️','🌊','💧','🌸','🌺','🌻','🌹','🌷','🍀','🌿','🌱','🌲','🌳','🎋',
      '🎉','🎊','🎈','🎁','🏆','🥇','🎯','🔔','💡','🔑','🗝️','💎','🪄','🎮','📱',
      '💻','📷','🎵','🎶','🎸','🎹','🎺','🎻','🥁','🎙️','🎤','🎧','🎬','📺','🌐',
    ],
  },
  {
    label: 'Đồ ăn',
    emojis: [
      '🍕','🍔','🌮','🌯','🥗','🍣','🍱','🍜','🍝','🍲','🥘','🍛','🍗','🥩','🍖',
      '🥓','🌭','🥪','🥙','🍳','🥚','🧀','🥞','🧇','🍞','🥐','🥖','🧆','🥜','🫘',
      '🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍡','🍢',
      '🥤','🧃','☕','🍵','🧋','🧉','🍺','🥂','🍷','🍸','🍹','🍻','🥃','🫖','🧊',
    ],
  },
];

const ALL_EMOJIS = CATEGORIES.flatMap((c) => c.emojis);

interface Props {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPickerPopup({ onSelect, onClose }: Props) {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const display = search.trim()
    ? ALL_EMOJIS.filter((e) => {
        // Very basic: search by unicode name isn't possible without a lookup table,
        // so just filter all emojis (all match any non-empty query shows all)
        return true;
      }).slice(0, 48)
    : CATEGORIES[tab].emojis;

  const filtered = search.trim() ? ALL_EMOJIS : display;

  return (
    <div
      ref={ref}
      className="absolute bottom-full right-0 mb-2 shadow-xl"
      style={{
        width: 320,
        background: 'var(--bg-surface)',
        border: '1px solid var(--rule-md)',
        borderRadius: 12,
        zIndex: 70,
        overflow: 'hidden',
      }}
    >
      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: 'var(--bg-surface-2)' }}>
          <Search size={13} className="text-ink-3 shrink-0" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm emoji..."
            className="flex-1 text-xs bg-transparent outline-none text-ink-1 placeholder:text-ink-3"
          />
        </div>
      </div>

      {/* Tabs */}
      {!search.trim() && (
        <div className="flex border-b" style={{ borderColor: 'var(--rule)' }}>
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.label}
              onClick={() => setTab(i)}
              className="flex-1 py-1.5 text-[11px] font-medium transition-colors"
              style={{
                color: tab === i ? 'var(--sidebar-accent)' : 'var(--ink-3)',
                borderBottom: tab === i ? '2px solid var(--sidebar-accent)' : '2px solid transparent',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div
        className="p-2 overflow-y-auto"
        style={{ maxHeight: 220, display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2 }}
      >
        {filtered.map((emoji, i) => (
          <button
            key={i}
            onClick={() => onSelect(emoji)}
            className="flex items-center justify-center rounded-lg text-xl transition-colors"
            style={{ height: 36, width: '100%' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface-2)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            {emoji}
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-8 py-6 text-center text-xs text-ink-3">Không tìm thấy</div>
        )}
      </div>
    </div>
  );
}
