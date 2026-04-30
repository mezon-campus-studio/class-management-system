import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Shuffle, Share2, RotateCcw, Users, PenLine, Search, CheckSquare, Square } from 'lucide-react';

// CSS animation injected once
const STYLE_ID = 'ld-anim-css';
const ANIM_CSS = `
  @keyframes ldRollUp { 0% { opacity:0; transform:translateY(32px) scale(0.88); } 100% { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes ldPop { 0% { transform:scale(0.7); opacity:0; } 60% { transform:scale(1.12); } 100% { transform:scale(1); opacity:1; } }
  @keyframes ldConfetti { 0% { transform:translateY(0) rotate(0deg); opacity:1; } 100% { transform:translateY(-120px) rotate(360deg); opacity:0; } }
`;
function injectAnimCSS() {
  if (!document.getElementById(STYLE_ID)) {
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = ANIM_CSS;
    document.head.appendChild(s);
  }
}

// Spin schedule: gaps between each name switch (ms), fast → slow
const SPIN_GAPS = [
  45, 48, 51, 54, 58, 62, 67, 73, 80, 88,
  97, 108, 120, 134, 150, 168, 190, 215, 245, 280,
  320, 368, 425, 490, 565, 650, 750,
];

interface Member { displayName: string; userId?: string; }

interface Props {
  onClose: () => void;
  onShare: (winner: string, count: number) => void;
  members?: Member[];
}

type Tab = 'text' | 'members';

const CONFETTI_CHARS = ['🎉', '✨', '🎊', '⭐', '🌟'];

export function LuckyDrawModal({ onClose, onShare, members = [] }: Props) {
  injectAnimCSS();

  const [tab, setTab] = useState<Tab>('text');
  const [names, setNames] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [spinning, setSpinning] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [confetti, setConfetti] = useState<{ id: number; char: string; x: number }[]>([]);
  const [participantCount, setParticipantCount] = useState(0);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const confettiIdRef = useRef(0);

  const filteredMembers = members.filter((m) =>
    m.displayName.toLowerCase().includes(memberSearch.toLowerCase()),
  );

  const getList = useCallback((): string[] => {
    if (tab === 'members') {
      return Array.from(selected);
    }
    return names.split('\n').map((n) => n.trim()).filter(Boolean);
  }, [tab, selected, names]);

  const toggleMember = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleAll = () => {
    const allNames = filteredMembers.map((m) => m.displayName);
    const allSelected = allNames.every((n) => selected.has(n));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) allNames.forEach((n) => next.delete(n));
      else allNames.forEach((n) => next.add(n));
      return next;
    });
  };

  const handleSpin = () => {
    const list = getList();
    if (list.length < 2) {
      alert('Cần ít nhất 2 người tham gia');
      return;
    }

    // Clear previous
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setWinner(null);
    setConfetti([]);
    setSpinning(true);
    setParticipantCount(list.length);

    const result = list[Math.floor(Math.random() * list.length)];

    let elapsed = 0;
    SPIN_GAPS.forEach((gap, i) => {
      elapsed += gap;
      const isLast = i === SPIN_GAPS.length - 1;
      const t = setTimeout(() => {
        if (isLast) {
          setDisplayName(result);
          setAnimKey((k) => k + 1);
          setWinner(result);
          setSpinning(false);
          // Trigger confetti
          const pieces = Array.from({ length: 8 }, (_, ci) => ({
            id: ++confettiIdRef.current,
            char: CONFETTI_CHARS[ci % CONFETTI_CHARS.length],
            x: 10 + Math.random() * 80,
          }));
          setConfetti(pieces);
          setTimeout(() => setConfetti([]), 1200);
        } else {
          setDisplayName(list[Math.floor(Math.random() * list.length)]);
          setAnimKey((k) => k + 1);
        }
      }, elapsed);
      timeoutsRef.current.push(t);
    });
  };

  const handleReset = () => {
    timeoutsRef.current.forEach(clearTimeout);
    setSpinning(false);
    setDisplayName(null);
    setWinner(null);
    setConfetti([]);
  };

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  const list = getList();
  const canSpin = list.length >= 2 && !spinning;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', zIndex: 200 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm mx-4 flex flex-col"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--rule-md)',
          borderRadius: 18,
          overflow: 'hidden',
          height: 580,
          maxHeight: '92vh',
          boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--rule)' }}
        >
          <div className="flex items-center gap-2">
            <Shuffle size={16} className="text-ink-3" />
            <span className="font-semibold text-sm text-ink-1">Lucky Draw</span>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={14} />
          </button>
        </div>

        {/* Spin display */}
        <div
          className="relative flex flex-col items-center justify-center shrink-0 overflow-hidden"
          style={{ height: 152, background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--rule)' }}
        >
          {/* Confetti particles */}
          {confetti.map((p) => (
            <span
              key={p.id}
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: '50%',
                fontSize: 20,
                animation: 'ldConfetti 1s ease-out forwards',
                pointerEvents: 'none',
              }}
            >
              {p.char}
            </span>
          ))}

          {displayName ? (
            <div className="flex flex-col items-center gap-2 px-6 text-center">
              {/* Slot machine window */}
              <div
                style={{
                  height: 60,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                <div
                  key={animKey}
                  style={{
                    animation: winner
                      ? 'ldPop 0.45s cubic-bezier(0.175,0.885,0.32,1.275) forwards'
                      : 'ldRollUp 0.12s ease-out forwards',
                    fontSize: winner ? 22 : 18,
                    fontWeight: 700,
                    color: winner ? 'var(--sidebar-accent)' : 'var(--ink-1)',
                    maxWidth: 280,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {displayName}
                </div>
              </div>
              {winner && (
                <p className="text-xs font-medium" style={{ color: 'var(--ink-3)' }}>
                  🎉 Chúc mừng người chiến thắng!
                </p>
              )}
              {spinning && (
                <p className="text-[11px]" style={{ color: 'var(--ink-4)' }}>Đang quay...</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'var(--bg-surface-3)' }}
              >
                <Shuffle size={22} className="text-ink-3" />
              </div>
              <p className="text-sm text-ink-3">Nhấn &ldquo;Quay!&rdquo; để bắt đầu</p>
            </div>
          )}

          {/* Spin count badge */}
          {list.length >= 2 && (
            <div
              className="absolute top-2 right-3 text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'var(--bg-surface-3)', color: 'var(--ink-3)' }}
            >
              {list.length} người
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex shrink-0" style={{ borderBottom: '1px solid var(--rule)' }}>
          <button
            onClick={() => setTab('text')}
            className="flex-1 py-2 flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
            style={{
              color: tab === 'text' ? 'var(--sidebar-accent)' : 'var(--ink-3)',
              borderBottom: tab === 'text' ? '2px solid var(--sidebar-accent)' : '2px solid transparent',
            }}
          >
            <PenLine size={13} /> Nhập tên
          </button>
          {members.length > 0 && (
            <button
              onClick={() => setTab('members')}
              className="flex-1 py-2 flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
              style={{
                color: tab === 'members' ? 'var(--sidebar-accent)' : 'var(--ink-3)',
                borderBottom: tab === 'members' ? '2px solid var(--sidebar-accent)' : '2px solid transparent',
              }}
            >
              <Users size={13} /> Thành viên lớp
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          {tab === 'text' ? (
            <div className="p-4">
              <label className="block text-xs font-medium text-ink-2 mb-1.5">
                Danh sách người tham gia <span className="font-normal text-ink-3">(mỗi người một dòng)</span>
              </label>
              <textarea
                value={names}
                onChange={(e) => setNames(e.target.value)}
                placeholder={"Nguyễn Văn A\nTrần Thị B\nLê Văn C"}
                rows={9}
                disabled={spinning}
                className="w-full resize-none text-sm text-ink-1 placeholder:text-ink-3 outline-none"
                style={{
                  background: 'var(--bg-surface-2)',
                  border: '1px solid var(--rule)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  lineHeight: 1.6,
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Search + toggle all */}
              <div className="px-3 pt-3 pb-2 shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                    style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--rule)' }}
                  >
                    <Search size={12} className="text-ink-3 shrink-0" />
                    <input
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      placeholder="Tìm thành viên..."
                      className="flex-1 text-xs bg-transparent outline-none text-ink-1 placeholder:text-ink-3"
                    />
                  </div>
                  <button
                    onClick={toggleAll}
                    className="text-xs font-medium shrink-0 px-2 py-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--sidebar-accent)', background: 'var(--bg-surface-2)', border: '1px solid var(--rule)' }}
                  >
                    {filteredMembers.every((m) => selected.has(m.displayName)) ? 'Bỏ chọn' : 'Chọn tất cả'}
                  </button>
                </div>
                <p className="text-[11px] text-ink-3">
                  Đã chọn {selected.size}/{members.length} người
                </p>
              </div>

              {/* Member list */}
              <div className="flex-1 overflow-y-auto px-3 pb-3">
                {filteredMembers.map((m) => {
                  const isSelected = selected.has(m.displayName);
                  return (
                    <button
                      key={m.userId ?? m.displayName}
                      onClick={() => toggleMember(m.displayName)}
                      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-colors mb-0.5"
                      style={{ background: isSelected ? 'var(--warm-fill)' : 'transparent' }}
                      onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface-2)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = isSelected ? 'var(--warm-fill)' : 'transparent'; }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: isSelected ? 'var(--sidebar-accent)' : 'var(--bg-surface-3)', color: isSelected ? 'white' : 'var(--ink-3)' }}
                      >
                        {m.displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="flex-1 text-sm text-ink-1 truncate">{m.displayName}</span>
                      {isSelected
                        ? <CheckSquare size={16} style={{ color: 'var(--sidebar-accent)', flexShrink: 0 }} />
                        : <Square size={16} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
                      }
                    </button>
                  );
                })}
                {filteredMembers.length === 0 && (
                  <p className="text-xs text-ink-3 text-center py-6">Không tìm thấy thành viên</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 flex items-center gap-2 shrink-0"
          style={{ borderTop: '1px solid var(--rule)' }}
        >
          {(winner || (displayName && !spinning)) && (
            <button
              onClick={handleReset}
              className="btn btn-ghost btn-sm flex items-center gap-1.5"
            >
              <RotateCcw size={13} />
              Làm lại
            </button>
          )}
          <div className="flex-1" />
          {winner && (
            <button
              onClick={() => { onShare(winner, participantCount); onClose(); }}
              className="btn btn-ghost btn-sm flex items-center gap-1.5"
              style={{ color: 'var(--sidebar-accent)' }}
            >
              <Share2 size={13} />
              Chia sẻ
            </button>
          )}
          <button
            onClick={handleSpin}
            disabled={!canSpin}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
          >
            <Shuffle size={13} />
            {spinning ? 'Đang quay...' : 'Quay!'}
          </button>
        </div>
      </div>
    </div>
  );
}
