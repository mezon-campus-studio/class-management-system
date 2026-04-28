import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Clock, UserCheck, BookOpen } from 'lucide-react';
import { attendanceApi } from '../api';
import { classroomApi } from '@/features/classroom/api';
import { Badge } from '@/shared/components/Badge';
import { Spinner } from '@/shared/components/Spinner';
import { useAuthStore } from '@/app/store';
import {
  RECORD_STATUS_LABELS,
  RECORD_STATUS_VARIANT,
  type AttendanceRecord,
  type AttendanceSession,
  type RecordStatus,
} from '../types';

// ─── Status button config ────────────────────────────────────────────────────

const STATUS_OPTIONS: {
  status: RecordStatus;
  label: string;
  activeBg: string;
  activeText: string;
  activeBorder: string;
}[] = [
  {
    status: 'PRESENT',
    label: 'Có mặt',
    activeBg: 'var(--green-fill)',
    activeText: 'var(--green-text)',
    activeBorder: 'var(--green-border)',
  },
  {
    status: 'LATE',
    label: 'Đi muộn',
    activeBg: 'var(--blue-fill)',
    activeText: 'var(--blue-text)',
    activeBorder: 'var(--blue-border)',
  },
  {
    status: 'EXCUSED',
    label: 'Có phép',
    activeBg: 'var(--amber-fill)',
    activeText: 'var(--amber-text)',
    activeBorder: 'var(--amber-border)',
  },
  {
    status: 'ABSENT',
    label: 'Vắng',
    activeBg: 'var(--red-fill)',
    activeText: 'var(--red-text)',
    activeBorder: 'var(--red-border)',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function AttendanceSessionPage() {
  const { classroomId, sessionId } = useParams<{ classroomId: string; sessionId: string }>();
  useAuthStore((s) => s.user);

  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [canMark, setCanMark] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null); // recordId being edited
  const [noteDraft, setNoteDraft] = useState('');
  const [closingSession, setClosingSession] = useState(false);

  useEffect(() => {
    if (!classroomId || !sessionId) return;
    Promise.all([
      classroomApi.get(classroomId),
      attendanceApi.getSession(classroomId, sessionId),
      attendanceApi.listRecords(classroomId, sessionId),
    ]).then(([classroom, s, r]) => {
      setSession(s);
      setRecords(r ?? []);
      const role = classroom.myRole;
      setCanMark(role === 'OWNER' || role === 'TEACHER');
    }).finally(() => setLoading(false));
  }, [classroomId, sessionId]);

  // Derived stats from local records state (always in sync after marking)
  const stats = useMemo(() => ({
    total:   records.length,
    present: records.filter((r) => r.status === 'PRESENT').length,
    late:    records.filter((r) => r.status === 'LATE').length,
    excused: records.filter((r) => r.status === 'EXCUSED').length,
    absent:  records.filter((r) => r.status === 'ABSENT').length,
  }), [records]);

  const handleMark = async (record: AttendanceRecord, status: RecordStatus) => {
    if (!classroomId || !sessionId || markingId || record.status === status) return;
    setMarkingId(record.id);
    try {
      const updated = await attendanceApi.markRecord(
        classroomId, sessionId, record.id, status, record.note ?? undefined,
      );
      setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } finally {
      setMarkingId(null);
    }
  };

  const handleNoteEdit = (record: AttendanceRecord) => {
    setEditingNote(record.id);
    setNoteDraft(record.note ?? '');
  };

  const handleNoteSave = async (record: AttendanceRecord) => {
    if (!classroomId || !sessionId) return;
    setEditingNote(null);
    if (noteDraft === (record.note ?? '')) return; // no change
    const updated = await attendanceApi.markRecord(
      classroomId, sessionId, record.id, record.status, noteDraft || undefined,
    );
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleCloseSession = async () => {
    if (!classroomId || !sessionId || !confirm('Đóng phiên điểm danh? Vẫn có thể chỉnh sửa sau.')) return;
    setClosingSession(true);
    try {
      const updated = await attendanceApi.closeSession(classroomId, sessionId);
      setSession(updated);
    } finally {
      setClosingSession(false);
    }
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner size={32} /></div>;
  if (!session) return <div className="text-center py-32 text-ink-3">Không tìm thấy phiên điểm danh</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">

      {/* Session header */}
      <div className="card mb-5">
        <div className="card-body">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={session.status === 'OPEN' ? 'green' : 'blue'}>
                  {session.status === 'OPEN' ? 'Đang mở' : 'Đã đóng'}
                </Badge>
                {session.description && (
                  <span className="text-xs text-ink-3">{session.description}</span>
                )}
              </div>
              <h2 className="text-xl font-serif font-semibold text-ink-1">{session.title}</h2>
              <p className="text-xs text-ink-3 mt-1">
                {new Date(session.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
            {canMark && session.status === 'OPEN' && (
              <button
                onClick={handleCloseSession}
                disabled={closingSession}
                className="btn btn-secondary btn-sm shrink-0"
              >
                {closingSession ? <Spinner size={13} /> : 'Đóng phiên'}
              </button>
            )}
          </div>

          {/* Stats bar */}
          {stats.total > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--rule)' }}>
              {[
                { label: 'Có mặt', value: stats.present, color: 'var(--green-text)', icon: <CheckCircle2 size={13} /> },
                { label: 'Đi muộn', value: stats.late,    color: 'var(--blue-text)',  icon: <Clock size={13} /> },
                { label: 'Có phép', value: stats.excused, color: 'var(--amber-text)', icon: <BookOpen size={13} /> },
                { label: 'Vắng',    value: stats.absent,  color: 'var(--red-text)',   icon: <UserCheck size={13} /> },
              ].map(({ label, value, color, icon }) => (
                <div key={label} className="text-center py-1">
                  <div className="text-2xl font-serif font-semibold text-ink-1">{value}</div>
                  <div className="text-xs flex items-center justify-center gap-1 mt-0.5" style={{ color }}>
                    {icon}{label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Teacher hint */}
      {canMark && session.status === 'OPEN' && records.length > 0 && (
        <p className="text-xs text-ink-3 mb-3 px-1">
          Nhấn vào trạng thái để thay đổi. Mặc định tất cả học sinh là <strong>Vắng</strong>.
        </p>
      )}

      {/* Records */}
      {records.length === 0 ? (
        <div className="text-center py-16 text-ink-3 text-sm">
          <p>Không có học sinh nào trong lớp</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="px-4 py-2.5 border-b border-rule flex items-center justify-between"
               style={{ background: 'var(--bg-surface-2)' }}>
            <span className="text-xs font-semibold text-ink-2 uppercase tracking-wide">
              Danh sách học sinh
            </span>
            <span className="text-xs text-ink-3">{stats.total} học sinh</span>
          </div>

          <div className="divide-y" style={{ '--divide-color': 'var(--rule)' } as React.CSSProperties}>
            {records.map((r) => (
              <div key={r.id} className="px-4 py-3">
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">

                  {/* Avatar + Name */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
                         style={{ background: 'var(--sidebar-accent)' }}>
                      {r.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-ink-1 text-sm truncate">{r.displayName}</p>
                      {/* Note area */}
                      {canMark ? (
                        editingNote === r.id ? (
                          <input
                            autoFocus
                            className="text-xs w-full mt-0.5 bg-transparent outline-none border-b text-ink-2"
                            style={{ borderColor: 'var(--warm-400)' }}
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            onBlur={() => handleNoteSave(r)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                              if (e.key === 'Escape') setEditingNote(null);
                            }}
                            placeholder="Ghi chú..."
                          />
                        ) : (
                          <button
                            className="text-xs text-ink-3 hover:text-ink-2 mt-0.5 text-left truncate max-w-xs"
                            onClick={() => handleNoteEdit(r)}
                          >
                            {r.note ? r.note : <span className="opacity-50">+ Ghi chú</span>}
                          </button>
                        )
                      ) : (
                        r.note && <p className="text-xs text-ink-3 mt-0.5">{r.note}</p>
                      )}
                    </div>
                  </div>

                  {/* Status buttons (teacher) or badge (viewer) */}
                  {canMark ? (
                    <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                      {STATUS_OPTIONS.map((opt) => {
                        const isActive = r.status === opt.status;
                        const isLoading = markingId === r.id;
                        return (
                          <button
                            key={opt.status}
                            onClick={() => handleMark(r, opt.status)}
                            disabled={isLoading}
                            className="px-2.5 py-1 rounded text-xs font-medium transition-all border"
                            style={isActive ? {
                              background: opt.activeBg,
                              color: opt.activeText,
                              borderColor: opt.activeBorder,
                            } : {
                              background: 'transparent',
                              color: 'var(--ink-3)',
                              borderColor: 'var(--rule)',
                            }}
                          >
                            {isLoading && isActive ? <Spinner size={10} /> : opt.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <Badge variant={RECORD_STATUS_VARIANT[r.status]}>
                      {RECORD_STATUS_LABELS[r.status]}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
