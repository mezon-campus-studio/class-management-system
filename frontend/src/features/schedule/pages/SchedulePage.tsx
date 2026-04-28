import { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays, ChevronDown, ArrowLeftRight, Clock, User, BookOpen,
  RefreshCw, X, XCircle, Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/app/store';
import { Spinner } from '@/shared/components/Spinner';
import { Modal } from '@/shared/components/Modal';
import { Badge } from '@/shared/components/Badge';
import {
  timetableApi,
  type TimetableEntry,
  type SwapRequest,
  DAY_ORDER,
  DAY_SHORT,
  DAY_LABELS,
  PERIOD_TIMES,
} from '../api/timetableApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentAcademicYear(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1; // 1-based
  return m >= 9 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

function getAcademicYearOptions(): string[] {
  const now = new Date();
  const y = now.getFullYear();
  return [
    `${y - 2}-${y - 1}`,
    `${y - 1}-${y}`,
    `${y}-${y + 1}`,
    `${y + 1}-${y + 2}`,
  ];
}

function getCurrentDayKey(): string {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return days[new Date().getDay()];
}

const SWAP_STATUS_LABEL: Record<SwapRequest['status'], string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  CANCELLED: 'Đã huỷ',
};

const SWAP_STATUS_VARIANT: Record<SwapRequest['status'], 'amber' | 'green' | 'red' | 'sage'> = {
  PENDING: 'amber',
  APPROVED: 'green',
  REJECTED: 'red',
  CANCELLED: 'sage',
};

// ─── SwapRequestModal ─────────────────────────────────────────────────────────

interface SwapModalProps {
  open: boolean;
  onClose: () => void;
  entry: TimetableEntry;
  onSubmit: (targetTeacherId: string, targetEntryId: string | undefined, reason: string) => Promise<void>;
}

function SwapRequestModal({ open, onClose, entry, onSubmit }: SwapModalProps) {
  const [targetTeacherId, setTargetTeacherId] = useState('');
  const [targetEntryId, setTargetEntryId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTeacherId.trim()) return;
    setLoading(true);
    try {
      await onSubmit(targetTeacherId.trim(), targetEntryId.trim() || undefined, reason.trim());
      onClose();
      setTargetTeacherId('');
      setTargetEntryId('');
      setReason('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Yêu cầu đổi lịch dạy" size="md">
      <div className="space-y-4">
        <div className="p-3 rounded-lg" style={{ background: 'var(--warm-fill)', border: '1px solid var(--warm-border)' }}>
          <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--warm-text)' }}>Tiết cần đổi</p>
          <p className="text-sm font-medium" style={{ color: 'var(--ink-1)' }}>
            {entry.subjectName} — {DAY_LABELS[entry.dayOfWeek]}, Tiết {entry.period}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--ink-3)' }}>
            {PERIOD_TIMES[entry.period]?.start} – {PERIOD_TIMES[entry.period]?.end}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label>ID giáo viên đổi lịch *</label>
            <div className="input-field mt-1">
              <User size={14} style={{ color: 'var(--ink-3)' }} />
              <input
                required
                placeholder="Nhập ID giáo viên..."
                value={targetTeacherId}
                onChange={e => setTargetTeacherId(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label>ID tiết dạy muốn đổi (tuỳ chọn)</label>
            <div className="input-field mt-1">
              <CalendarDays size={14} style={{ color: 'var(--ink-3)' }} />
              <input
                placeholder="Để trống nếu không chọn tiết cụ thể..."
                value={targetEntryId}
                onChange={e => setTargetEntryId(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label>Lý do</label>
            <textarea
              className="mt-1 w-full rounded-lg px-3 py-2 text-sm resize-none"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--rule-md)',
                color: 'var(--ink-1)',
                minHeight: 72,
              }}
              placeholder="Nhập lý do đổi lịch..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm flex-1">
              Huỷ
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary btn-sm flex-1 gap-1">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowLeftRight size={14} />}
              Gửi yêu cầu
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

// ─── TimetableGrid ────────────────────────────────────────────────────────────

interface TimetableGridProps {
  entries: TimetableEntry[];
  isTeacher: boolean;
  onSwapRequest: (entry: TimetableEntry) => void;
}

function TimetableGrid({ entries, isTeacher, onSwapRequest }: TimetableGridProps) {
  const today = getCurrentDayKey();

  const entryMap = useMemo(() => {
    const map = new Map<string, TimetableEntry>();
    entries.forEach(e => map.set(`${e.dayOfWeek}-${e.period}`, e));
    return map;
  }, [entries]);

  const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="card overflow-hidden" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: 700 }}>
        <colgroup>
          <col style={{ width: 80 }} />
          {DAY_ORDER.map(d => (
            <col key={d} style={{ width: `${100 / DAY_ORDER.length}%` }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th
              style={{
                padding: '10px 8px',
                background: 'var(--bg-surface-2)',
                borderBottom: '1px solid var(--rule)',
                borderRight: '1px solid var(--rule)',
                textAlign: 'center',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--ink-3)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Tiết
            </th>
            {DAY_ORDER.map(day => {
              const isToday = day === today;
              return (
                <th
                  key={day}
                  style={{
                    padding: '10px 8px',
                    background: isToday ? 'var(--warm-fill)' : 'var(--bg-surface-2)',
                    borderBottom: '1px solid var(--rule)',
                    borderRight: '1px solid var(--rule)',
                    textAlign: 'center',
                    fontSize: 12,
                    fontWeight: isToday ? 700 : 600,
                    color: isToday ? 'var(--warm-text)' : 'var(--ink-2)',
                  }}
                >
                  <div>{DAY_SHORT[day]}</div>
                  <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.8 }}>{DAY_LABELS[day]}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {periods.map((period, periodIdx) => {
            const time = PERIOD_TIMES[period];
            const isBreakAfter = period === 5; // break between period 5 and 6 (lunch)

            return (
              <>
                <tr key={period} style={{ borderBottom: isBreakAfter ? '2px solid var(--rule-md)' : '1px solid var(--rule)' }}>
                  {/* Period label column */}
                  <td
                    style={{
                      padding: '6px 8px',
                      background: 'var(--bg-surface-2)',
                      borderRight: '1px solid var(--rule)',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>
                      Tiết {period}
                    </div>
                    {time && (
                      <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 1 }}>
                        {time.start}
                      </div>
                    )}
                  </td>

                  {/* Day cells */}
                  {DAY_ORDER.map(day => {
                    const isToday = day === today;
                    const entry = entryMap.get(`${day}-${period}`);

                    return (
                      <td
                        key={day}
                        style={{
                          padding: 4,
                          verticalAlign: 'top',
                          background: isToday
                            ? periodIdx % 2 === 0 ? 'rgba(168,90,56,0.04)' : 'rgba(168,90,56,0.02)'
                            : periodIdx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-paper)',
                          borderRight: '1px solid var(--rule)',
                          minHeight: 72,
                        }}
                      >
                        {entry ? (
                          <TimetableCell
                            entry={entry}
                            isTeacher={isTeacher}
                            onSwapRequest={onSwapRequest}
                          />
                        ) : (
                          <div
                            style={{
                              height: 68,
                              borderRadius: 6,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <span style={{ fontSize: 18, color: 'var(--ink-4)' }}>—</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
                {isBreakAfter && (
                  <tr key="lunch-break">
                    <td
                      colSpan={DAY_ORDER.length + 1}
                      style={{
                        padding: '4px 12px',
                        background: 'var(--bg-surface-3)',
                        textAlign: 'center',
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'var(--ink-3)',
                        borderBottom: '1px solid var(--rule)',
                      }}
                    >
                      Nghỉ trưa · 11:05 – 13:00
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface TimetableCellProps {
  entry: TimetableEntry;
  isTeacher: boolean;
  onSwapRequest: (entry: TimetableEntry) => void;
}

function TimetableCell({ entry, isTeacher, onSwapRequest }: TimetableCellProps) {
  const [hovered, setHovered] = useState(false);

  const bgColor = entry.subjectColor
    ? `${entry.subjectColor}22`
    : 'var(--blue-fill)';
  const borderColor = entry.subjectColor
    ? `${entry.subjectColor}55`
    : 'var(--blue-border)';
  const textColor = entry.subjectColor || 'var(--blue-text)';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 6,
        padding: '6px 8px',
        minHeight: 68,
        position: 'relative',
        transition: 'box-shadow 150ms ease',
        boxShadow: hovered ? 'var(--shadow-sm)' : 'none',
        cursor: isTeacher ? 'pointer' : 'default',
      }}
    >
      {/* Subject name */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: textColor,
          lineHeight: 1.3,
          marginBottom: 2,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {entry.subjectName}
      </div>

      {/* Teacher name */}
      {entry.teacherName && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 1 }}>
          <User size={9} style={{ color: textColor, opacity: 0.7, flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: textColor, opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.teacherName}
          </span>
        </div>
      )}

      {/* Classroom for teachers */}
      {isTeacher && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <BookOpen size={9} style={{ color: textColor, opacity: 0.7, flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: textColor, opacity: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.classroomName}
          </span>
        </div>
      )}

      {/* Swap button for teachers */}
      {isTeacher && hovered && (
        <button
          onClick={e => { e.stopPropagation(); onSwapRequest(entry); }}
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            background: 'var(--bg-surface)',
            border: '1px solid var(--rule-md)',
            borderRadius: 4,
            padding: '2px 5px',
            fontSize: 9,
            fontWeight: 600,
            color: 'var(--warm-text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: 'var(--shadow-xs)',
          }}
          title="Yêu cầu đổi lịch"
        >
          <ArrowLeftRight size={8} />
          Đổi
        </button>
      )}
    </div>
  );
}

// ─── SwapRequestsPanel ────────────────────────────────────────────────────────

interface SwapRequestsPanelProps {
  swaps: SwapRequest[];
  loading: boolean;
  onCancel: (id: string) => Promise<void>;
  onRefresh: () => void;
}

function SwapRequestsPanel({ swaps, loading, onCancel, onRefresh }: SwapRequestsPanelProps) {
  const [cancelling, setCancelling] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    if (!confirm('Huỷ yêu cầu đổi lịch này?')) return;
    setCancelling(id);
    try {
      await onCancel(id);
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="card" style={{ marginTop: 24 }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ArrowLeftRight size={16} style={{ color: 'var(--warm-text)' }} />
          <span className="card-title">Yêu cầu đổi lịch của tôi</span>
        </div>
        <button onClick={onRefresh} className="btn btn-ghost btn-sm" title="Làm mới">
          <RefreshCw size={14} />
        </button>
      </div>

      {loading ? (
        <div className="card-body flex justify-center py-8">
          <Spinner size={24} />
        </div>
      ) : swaps.length === 0 ? (
        <div className="card-body text-center py-10" style={{ color: 'var(--ink-3)' }}>
          <ArrowLeftRight size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Chưa có yêu cầu đổi lịch nào</p>
        </div>
      ) : (
        <div className="card-body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tiết cần đổi</th>
                <th>Giáo viên đổi</th>
                <th>Tiết đổi sang</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
                <th>Ngày gửi</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {swaps.map(swap => (
                <tr key={swap.id}>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-1)' }}>
                      {swap.requesterEntry.subjectName}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                      {DAY_LABELS[swap.requesterEntry.dayOfWeek]}, Tiết {swap.requesterEntry.period}
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                    {swap.targetTeacherName}
                  </td>
                  <td>
                    {swap.targetEntry ? (
                      <>
                        <div style={{ fontSize: 13, color: 'var(--ink-1)' }}>
                          {swap.targetEntry.subjectName}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                          {DAY_LABELS[swap.targetEntry.dayOfWeek]}, Tiết {swap.targetEntry.period}
                        </div>
                      </>
                    ) : (
                      <span style={{ color: 'var(--ink-4)', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--ink-3)', maxWidth: 160 }}>
                    <span style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {swap.reason || '—'}
                    </span>
                  </td>
                  <td>
                    <Badge variant={SWAP_STATUS_VARIANT[swap.status]}>
                      {SWAP_STATUS_LABEL[swap.status]}
                    </Badge>
                    {swap.reviewNote && (
                      <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>
                        {swap.reviewNote}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                    {new Date(swap.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    {swap.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancel(swap.id)}
                        disabled={cancelling === swap.id}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--red-text)' }}
                        title="Huỷ yêu cầu"
                      >
                        {cancelling === swap.id
                          ? <Loader2 size={12} className="animate-spin" />
                          : <X size={12} />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── SchedulePage ─────────────────────────────────────────────────────────────

export function SchedulePage() {
  const { user } = useAuthStore();
  const isTeacher = user?.userType === 'TEACHER';

  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear);
  const [semester, setSemester] = useState(1);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [swapsLoading, setSwapsLoading] = useState(false);

  const [swapModal, setSwapModal] = useState<{ open: boolean; entry: TimetableEntry | null }>({
    open: false, entry: null,
  });

  const yearOptions = useMemo(getAcademicYearOptions, []);

  // Load schedule
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setEntries([]);

    timetableApi.getMySchedule(academicYear, semester)
      .then(data => { if (!cancelled) setEntries(data); })
      .catch(() => { if (!cancelled) setError('Không thể tải thời khoá biểu. Vui lòng thử lại.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [academicYear, semester]);

  // Load swaps (teacher only)
  const loadSwaps = () => {
    if (!isTeacher) return;
    setSwapsLoading(true);
    timetableApi.getMySwaps()
      .then(data => setSwaps(data))
      .catch(() => setSwaps([]))
      .finally(() => setSwapsLoading(false));
  };

  useEffect(() => {
    loadSwaps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTeacher]);

  const handleSwapRequest = async (targetTeacherId: string, targetEntryId: string | undefined, reason: string) => {
    if (!swapModal.entry) return;
    await timetableApi.createSwap({
      requesterEntryId: swapModal.entry.id,
      targetTeacherId,
      targetEntryId,
      reason,
    });
    loadSwaps();
  };

  const handleCancelSwap = async (id: string) => {
    await timetableApi.cancelSwap(id);
    loadSwaps();
  };

  const totalEntries = entries.length;

  return (
    <div className="w-full px-6 py-8" style={{ maxWidth: 1200 }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--warm-fill)',
              color: 'var(--warm-text)',
              flexShrink: 0,
            }}
          >
            <CalendarDays size={18} />
          </div>
          <div>
            <h1 className="font-serif font-semibold text-xl" style={{ color: 'var(--ink-1)', margin: 0 }}>
              {isTeacher ? 'Lịch dạy của tôi' : 'Thời khoá biểu'}
            </h1>
            <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>
              {isTeacher
                ? 'Lịch giảng dạy theo tuần cố định'
                : 'Thời khoá biểu học tập của bạn'}
            </p>
          </div>
        </div>

        {/* Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <select
              value={academicYear}
              onChange={e => setAcademicYear(e.target.value)}
              style={{
                appearance: 'none',
                background: 'var(--bg-surface)',
                border: '1px solid var(--rule-md)',
                borderRadius: 8,
                padding: '6px 32px 6px 12px',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--ink-1)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>Năm học {y}</option>
              ))}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <select
              value={semester}
              onChange={e => setSemester(Number(e.target.value))}
              style={{
                appearance: 'none',
                background: 'var(--bg-surface)',
                border: '1px solid var(--rule-md)',
                borderRadius: 8,
                padding: '6px 32px 6px 12px',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--ink-1)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <option value={1}>Học kỳ 1</option>
              <option value={2}>Học kỳ 2</option>
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {!loading && !error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '10px 16px',
            borderRadius: 10,
            background: 'var(--bg-surface)',
            border: '1px solid var(--rule)',
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} style={{ color: 'var(--warm-text)' }} />
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
              <strong style={{ color: 'var(--ink-1)' }}>{totalEntries}</strong> tiết / tuần
            </span>
          </div>
          <span style={{ color: 'var(--rule-md)', fontSize: 18 }}>|</span>
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            Năm học {academicYear} · Học kỳ {semester}
          </span>
          {isTeacher && (
            <>
              <span style={{ color: 'var(--rule-md)', fontSize: 18 }}>|</span>
              <button
                onClick={() => {
                  // Find first entry to open swap with
                  if (entries.length > 0) setSwapModal({ open: true, entry: entries[0] });
                }}
                className="btn btn-ghost btn-sm gap-1"
                style={{ color: 'var(--warm-text)', fontSize: 12 }}
                disabled={entries.length === 0}
              >
                <ArrowLeftRight size={12} /> Yêu cầu đổi lịch
              </button>
            </>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 64, paddingBottom: 64 }}>
          <Spinner size={32} />
        </div>
      ) : error ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            borderRadius: 12,
            border: '1px dashed var(--red-border)',
            background: 'var(--red-fill)',
            color: 'var(--red-text)',
          }}
        >
          <XCircle size={28} className="mx-auto mb-3 opacity-60" />
          <p style={{ fontSize: 14, fontWeight: 500 }}>{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              timetableApi.getMySchedule(academicYear, semester)
                .then(data => setEntries(data))
                .catch(() => setError('Không thể tải thời khoá biểu. Vui lòng thử lại.'))
                .finally(() => setLoading(false));
            }}
            className="btn btn-secondary btn-sm mt-3"
          >
            Thử lại
          </button>
        </div>
      ) : entries.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            borderRadius: 12,
            border: '1px dashed var(--rule)',
            color: 'var(--ink-3)',
          }}
        >
          <CalendarDays size={36} className="mx-auto mb-3 opacity-25" />
          <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink-2)', marginBottom: 4 }}>
            Chưa có thời khoá biểu
          </p>
          <p style={{ fontSize: 13 }}>
            Năm học {academicYear} · Học kỳ {semester} chưa được xếp lịch
          </p>
        </div>
      ) : (
        <TimetableGrid
          entries={entries}
          isTeacher={isTeacher}
          onSwapRequest={entry => setSwapModal({ open: true, entry })}
        />
      )}

      {/* Swap requests panel (teachers only) */}
      {isTeacher && (
        <SwapRequestsPanel
          swaps={swaps}
          loading={swapsLoading}
          onCancel={handleCancelSwap}
          onRefresh={loadSwaps}
        />
      )}

      {/* Swap request modal */}
      {swapModal.entry && (
        <SwapRequestModal
          open={swapModal.open}
          onClose={() => setSwapModal({ open: false, entry: null })}
          entry={swapModal.entry}
          onSubmit={handleSwapRequest}
        />
      )}
    </div>
  );
}
