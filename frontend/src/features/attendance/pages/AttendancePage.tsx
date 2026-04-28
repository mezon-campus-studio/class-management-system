import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Plus,
  ChevronRight,
  Clock,
  CheckCircle,
  Users,
  Calendar,
  ChevronLeft,
  Lock,
  Unlock,
  Sparkles,
  AlertCircle,
  Trash2,
  Timer,
} from 'lucide-react';
import { attendanceApi } from '../api';
import { classroomApi } from '@/features/classroom/api';
import { permissionsOf } from '@/features/classroom/permissions';
import { Modal } from '@/shared/components/Modal';
import { Badge } from '@/shared/components/Badge';
import { Spinner } from '@/shared/components/Spinner';
import { useAuthStore } from '@/app/store';
import {
  PERIOD_TIMES,
  RECORD_STATUS_LABELS,
  RECORD_STATUS_VARIANT,
  type AttendanceSession,
  type AttendanceRecord,
} from '../types';

const todayStr = () => {
  const d = new Date();
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return tz.toISOString().slice(0, 10);
};

const isoDate = (d: Date) => {
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return tz.toISOString().slice(0, 10);
};

const dayLabel = (iso: string) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

function showError(err: unknown) {
  alert(
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      'Có lỗi xảy ra',
  );
}

export function AttendancePage() {
  const { classroomId } = useParams<{ classroomId: string }>();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [date, setDate] = useState<string>(todayStr());
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [recordsBySession, setRecordsBySession] = useState<Record<string, AttendanceRecord[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadingByDate, setLoadingByDate] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archive, setArchive] = useState<AttendanceSession[]>([]);
  const [archivePage, setArchivePage] = useState(0);
  const [archiveTotalPages, setArchiveTotalPages] = useState(0);

  // ─── Initial load ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!classroomId) return;
    classroomApi
      .get(classroomId)
      .then((cl) => setCanManage(permissionsOf(cl.myRole).canDelete))
      .catch(() => undefined);
  }, [classroomId]);

  const loadByDate = useCallback(async (d: string) => {
    if (!classroomId) return;
    setLoadingByDate(true);
    try {
      const list = await attendanceApi.listByDate(classroomId, d);
      setSessions(list);
      // Pre-fetch the requester's own record for each session so the
      // "Báo danh / Đã có mặt" badge is correct without needing a click.
      const records = await Promise.all(
        list.map((s) =>
          attendanceApi.listRecords(classroomId, s.id).then((rs) => [s.id, rs] as const).catch(() => [s.id, []] as const),
        ),
      );
      setRecordsBySession(Object.fromEntries(records));
    } catch (err) {
      showError(err);
    } finally {
      setLoadingByDate(false);
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    if (!classroomId) return;
    loadByDate(date);
  }, [classroomId, date, loadByDate]);

  // Refresh every minute so an open session flips to "closed" once its
  // period ends, without the user having to refresh manually.
  useEffect(() => {
    const id = setInterval(() => {
      if (date === todayStr()) loadByDate(date);
    }, 60_000);
    return () => clearInterval(id);
  }, [date, loadByDate]);

  // ─── Date navigation ─────────────────────────────────────────────────────

  const shiftDate = (days: number) => {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + days);
    setDate(isoDate(d));
  };

  // ─── Mutations ───────────────────────────────────────────────────────────

  const handleCheckIn = async (s: AttendanceSession) => {
    if (!classroomId) return;
    try {
      const updated = await attendanceApi.checkIn(classroomId, s.id);
      setRecordsBySession((prev) => {
        const list = (prev[s.id] ?? []).map((r) => (r.userId === updated.userId ? updated : r));
        if (!list.some((r) => r.userId === updated.userId)) list.push(updated);
        return { ...prev, [s.id]: list };
      });
      // Roll up the new counts onto the session card.
      setSessions((prev) =>
        prev.map((x) => {
          if (x.id !== s.id) return x;
          const records = recordsBySession[s.id] ?? [];
          const next = records.map((r) => (r.userId === updated.userId ? updated : r));
          if (!next.some((r) => r.userId === updated.userId)) next.push(updated);
          return {
            ...x,
            presentCount: next.filter((r) => r.status === 'PRESENT').length,
            absentCount:  next.filter((r) => r.status === 'ABSENT').length,
            lateCount:    next.filter((r) => r.status === 'LATE').length,
            excusedCount: next.filter((r) => r.status === 'EXCUSED').length,
          };
        }),
      );
    } catch (err) {
      showError(err);
    }
  };

  const handleCloseSession = async (s: AttendanceSession) => {
    if (!classroomId || !confirm(`Đóng phiên "${s.title}" ngay bây giờ?`)) return;
    try {
      const updated = await attendanceApi.closeSession(classroomId, s.id);
      setSessions((prev) => prev.map((x) => (x.id === s.id ? updated : x)));
    } catch (err) {
      showError(err);
    }
  };

  const handleCreate = async () => {
    if (!classroomId || !form.title.trim()) return;
    setSubmitting(true);
    try {
      const s = await attendanceApi.createSession(classroomId, {
        title: form.title,
        description: form.description || undefined,
      });
      setSessions((p) => [s, ...p]);
      setCreateOpen(false);
      setForm({ title: '', description: '' });
    } catch (err) {
      showError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const openArchive = async () => {
    if (!classroomId) return;
    setArchiveOpen(true);
    if (archive.length === 0) {
      try {
        const res = await attendanceApi.listSessions(classroomId, 0);
        setArchive(res.content ?? []);
        setArchivePage(0);
        setArchiveTotalPages(res.totalPages ?? 0);
      } catch (err) {
        showError(err);
      }
    }
  };

  const handleDeleteSession = async (s: AttendanceSession, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!classroomId || !confirm(`Xoá phiên "${s.title}"? Toàn bộ điểm danh trong phiên cũng sẽ bị xoá.`)) return;
    try {
      await attendanceApi.deleteSession(classroomId, s.id);
      setArchive((prev) => prev.filter((x) => x.id !== s.id));
      setSessions((prev) => prev.filter((x) => x.id !== s.id));
    } catch (err) {
      showError(err);
    }
  };

  const loadMoreArchive = async () => {
    if (!classroomId) return;
    try {
      const res = await attendanceApi.listSessions(classroomId, archivePage + 1);
      setArchive((p) => [...p, ...(res.content ?? [])]);
      setArchivePage(res.number ?? archivePage + 1);
      setArchiveTotalPages(res.totalPages ?? 0);
    } catch (err) {
      showError(err);
    }
  };

  // ─── Aggregates ──────────────────────────────────────────────────────────

  const myRecordOf = (session: AttendanceSession): AttendanceRecord | undefined => {
    if (!currentUserId) return undefined;
    return (recordsBySession[session.id] ?? []).find((r) => r.userId === currentUserId);
  };

  const isToday = date === todayStr();
  const totals = useMemo(() => {
    const out = { sessions: sessions.length, present: 0, absent: 0, late: 0, excused: 0 };
    for (const s of sessions) {
      out.present += s.presentCount;
      out.absent += s.absentCount;
      out.late += s.lateCount;
      out.excused += s.excusedCount;
    }
    return out;
  }, [sessions]);

  if (loading) return <div className="flex justify-center py-32"><Spinner size={32} /></div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-ink-1 flex items-center gap-2">
            <CheckCircle size={24} /> Điểm danh
          </h1>
          <p className="text-sm text-ink-3 mt-1">
            Hệ thống tự tạo phiên điểm danh theo thời khoá biểu. Học sinh chỉ cần vào báo danh.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openArchive} className="btn btn-secondary btn-sm gap-1.5">
            <Calendar size={13} /> Lịch sử
          </button>
          {canManage && (
            <button
              onClick={() => { setCreateOpen(true); setForm({ title: '', description: '' }); }}
              className="btn btn-primary btn-sm gap-1.5"
              title="Tạo phiên thủ công khi hệ thống lỗi"
            >
              <Plus size={13} /> Tạo phiên thủ công
            </button>
          )}
        </div>
      </div>

      {/* Date picker bar */}
      <div className="card card-body flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={() => shiftDate(-1)} className="btn btn-ghost btn-sm" title="Ngày trước">
            <ChevronLeft size={14} />
          </button>
          <div className="input-field w-auto">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button onClick={() => shiftDate(1)} className="btn btn-ghost btn-sm" title="Ngày sau">
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => setDate(todayStr())}
            className="btn btn-ghost btn-sm"
            disabled={isToday}
          >
            Hôm nay
          </button>
        </div>
        <p className="text-sm text-ink-2">
          <span className="font-medium">{dayLabel(date)}</span>
          <span className="text-ink-3"> · {totals.sessions} tiết</span>
        </p>
      </div>

      {/* Today's summary tiles */}
      {totals.sessions > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-5">
          <SummaryTile label="Có mặt" value={totals.present} color="green" />
          <SummaryTile label="Vắng" value={totals.absent} color="red" />
          <SummaryTile label="Đi muộn" value={totals.late} color="amber" />
          <SummaryTile label="Có phép" value={totals.excused} color="blue" />
        </div>
      )}

      {/* Sessions list */}
      {loadingByDate ? (
        <div className="flex justify-center py-10"><Spinner size={20} /></div>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={28} />}
          title="Không có tiết học trong ngày này"
          hint={
            isToday
              ? 'Hôm nay không có tiết theo thời khoá biểu. Giáo viên có thể tạo phiên điểm danh thủ công nếu cần.'
              : 'Ngày này không có tiết học theo thời khoá biểu.'
          }
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <SessionCard
              key={s.id}
              classroomId={classroomId!}
              session={s}
              myRecord={myRecordOf(s)}
              canManage={canManage}
              onCheckIn={() => handleCheckIn(s)}
              onClose={() => handleCloseSession(s)}
            />
          ))}
        </div>
      )}

      {/* Manual create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Tạo phiên điểm danh thủ công" size="sm">
        <div className="space-y-4">
          <p className="text-xs text-ink-3 flex items-start gap-1.5">
            <AlertCircle size={12} className="mt-0.5 shrink-0" />
            Dùng khi hệ thống không tự tạo được phiên cho ngày hôm nay (ví dụ: thời khoá biểu chưa cấu hình).
          </p>
          <Field label="Tiêu đề *">
            <input
              type="text"
              placeholder="VD: Điểm danh đầu giờ thứ Hai"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </Field>
          <Field label="Mô tả">
            <input
              type="text"
              placeholder="VD: Tiết 1 môn Toán"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2 border-t border-rule">
            <button onClick={() => setCreateOpen(false)} className="btn btn-secondary btn-sm">Hủy</button>
            <button
              onClick={handleCreate}
              disabled={submitting || !form.title.trim()}
              className="btn btn-primary btn-sm"
            >
              {submitting ? 'Đang tạo...' : 'Tạo phiên'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Archive modal */}
      <Modal open={archiveOpen} onClose={() => setArchiveOpen(false)} title="Lịch sử điểm danh" size="lg">
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {archive.length === 0 ? (
            <p className="text-center text-ink-3 py-6">Chưa có phiên nào</p>
          ) : (
            archive.map((s) => (
              <Link
                key={s.id}
                to={`/classrooms/${classroomId}/attendance/sessions/${s.id}`}
                className="card card-body flex items-center justify-between gap-3 hover:shadow-sm transition-shadow"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-1 truncate">{s.title}</p>
                  <p className="text-xs text-ink-3">
                    {s.sessionDate
                      ? dayLabel(s.sessionDate)
                      : new Date(s.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-ink-3">
                    {s.presentCount}/{s.totalRecords}
                  </span>
                  <Badge variant={s.status === 'OPEN' ? 'green' : s.status === 'SCHEDULED' ? 'amber' : 'sage'}>
                    {s.status === 'OPEN' ? 'Đang mở' : s.status === 'SCHEDULED' ? 'Chưa bắt đầu' : 'Đã đóng'}
                  </Badge>
                  {canManage && (
                    <button
                      onClick={(e) => handleDeleteSession(s, e)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--red-text)' }}
                      title="Xoá phiên"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                  <ChevronRight size={14} className="text-ink-3" />
                </div>
              </Link>
            ))
          )}
          {archivePage + 1 < archiveTotalPages && (
            <button
              onClick={loadMoreArchive}
              className="w-full btn btn-ghost btn-sm"
            >
              Tải thêm
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}

function SessionCard({
  classroomId,
  session,
  myRecord,
  canManage,
  onCheckIn,
  onClose,
}: {
  classroomId: string;
  session: AttendanceSession;
  myRecord: AttendanceRecord | undefined;
  canManage: boolean;
  onCheckIn: () => void;
  onClose: () => void;
}) {
  const isOpen = session.status === 'OPEN';
  const isScheduled = session.status === 'SCHEDULED';
  const periodLabel = session.periodNumber != null
    ? `Tiết ${session.periodNumber} · ${PERIOD_TIMES[session.periodNumber]?.start ?? ''} – ${PERIOD_TIMES[session.periodNumber]?.end ?? ''}`
    : new Date(session.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const checkedIn = myRecord && myRecord.status !== 'ABSENT';
  const total = session.totalRecords || 1;
  const pct = Math.round((session.presentCount / total) * 100);

  return (
    <div className="card overflow-hidden">
      <div className="card-body">
        <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {session.subjectName && (
                <p className="font-semibold text-ink-1">{session.subjectName}</p>
              )}
              {!session.subjectName && (
                <p className="font-semibold text-ink-1">{session.title}</p>
              )}
              <Badge variant={isOpen ? 'green' : isScheduled ? 'amber' : 'sage'}>
                {isOpen ? 'Đang mở' : isScheduled ? 'Chưa bắt đầu' : 'Đã đóng'}
              </Badge>
              {session.autoGenerated ? (
                <span className="text-[10px] text-ink-3 inline-flex items-center gap-0.5">
                  <Sparkles size={10} /> Tự động
                </span>
              ) : (
                <span className="text-[10px] text-ink-3">Thủ công</span>
              )}
              {myRecord && (
                <Badge variant={RECORD_STATUS_VARIANT[myRecord.status]}>
                  {RECORD_STATUS_LABELS[myRecord.status]}
                </Badge>
              )}
            </div>
            <p className="text-xs text-ink-3 flex items-center gap-1.5">
              <Clock size={11} /> {periodLabel}
            </p>
            {session.description && (
              <p className="text-xs text-ink-3 mt-1">{session.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isOpen && (!checkedIn || myRecord?.status === 'ABSENT') && (
              <button onClick={onCheckIn} className="btn btn-primary btn-sm gap-1.5">
                <CheckCircle size={13} /> Báo danh
              </button>
            )}
            {isOpen && checkedIn && (
              <span className="text-xs text-ink-3 italic flex items-center gap-1">
                <CheckCircle size={12} style={{ color: 'var(--green-text)' }} />
                Đã báo danh
              </span>
            )}
            {isScheduled && (
              <span className="text-xs text-ink-3 italic flex items-center gap-1">
                <Timer size={12} /> Chưa bắt đầu
              </span>
            )}
            {!isOpen && !isScheduled && (
              <span className="text-xs text-ink-3 italic flex items-center gap-1">
                <Lock size={12} /> Đã đóng
              </span>
            )}
            <Link
              to={`/classrooms/${classroomId}/attendance/sessions/${session.id}`}
              className="btn btn-secondary btn-sm gap-1"
              title="Xem chi tiết"
            >
              <Users size={13} /> {session.totalRecords}
            </Link>
            {canManage && isOpen && (
              <button
                onClick={onClose}
                className="btn btn-ghost btn-sm"
                title="Đóng phiên"
              >
                <Unlock size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {session.totalRecords > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs text-ink-3 mb-1">
              <span>
                <span style={{ color: 'var(--green-text)' }}>● {session.presentCount} có mặt</span>
                {session.lateCount > 0 && (
                  <>
                    {' · '}
                    <span style={{ color: 'var(--blue-text, var(--ink-2))' }}>● {session.lateCount} muộn</span>
                  </>
                )}
                {session.excusedCount > 0 && (
                  <>
                    {' · '}
                    <span style={{ color: 'var(--amber-text)' }}>● {session.excusedCount} có phép</span>
                  </>
                )}
                {session.absentCount > 0 && (
                  <>
                    {' · '}
                    <span style={{ color: 'var(--red-text)' }}>● {session.absentCount} vắng</span>
                  </>
                )}
              </span>
              <span className="font-medium">{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden flex"
                 style={{ background: 'var(--bg-surface-2)' }}>
              <div style={{ width: `${pct}%`, background: 'var(--green-text)' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'green' | 'red' | 'amber' | 'blue';
}) {
  const colorMap = {
    green: 'var(--green-text)',
    red:   'var(--red-text)',
    amber: 'var(--amber-text)',
    blue:  'var(--ink-2)',
  };
  return (
    <div className="card card-body">
      <p className="text-label">{label}</p>
      <p className="text-2xl font-semibold mt-1" style={{ color: colorMap[color] }}>
        {value}
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-label">{label}</label>
      <div className="input-field">{children}</div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <div className="card card-body flex flex-col items-center text-center py-12 gap-2">
      <span className="text-ink-3">{icon}</span>
      <p className="text-sm font-medium text-ink-1">{title}</p>
      <p className="text-xs text-ink-3 max-w-md">{hint}</p>
    </div>
  );
}
