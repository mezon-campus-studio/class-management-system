import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Star, Send, X, ChevronRight } from 'lucide-react';
import { parentApi, type ParentClassroomDetail, type ParentEvaluation } from '../api';
import { Spinner } from '@/shared/components/Spinner';

const CATEGORY_LABEL: Record<string, string> = {
  ACADEMIC:    'Học lực',
  BEHAVIOR:    'Hạnh kiểm',
  ACHIEVEMENT: 'Thành tích',
  DISCIPLINE:  'Kỷ luật',
  GENERAL:     'Nhận xét chung',
};

const CATEGORY_COLOR: Record<string, string> = {
  ACADEMIC:    '#1e4fa8',
  BEHAVIOR:    '#166534',
  ACHIEVEMENT: '#c2714f',
  DISCIPLINE:  '#cf5151',
  GENERAL:     '#5b6470',
};

// ─── Main page ─────────────────────────────────────────────────────────────────

export function ParentClassroomViewPage() {
  const { classroomId } = useParams<{ classroomId: string }>();
  const [detail, setDetail] = useState<ParentClassroomDetail | null>(null);
  const [evaluations, setEvaluations] = useState<ParentEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'evaluations'>('overview');
  const [leaveOpen, setLeaveOpen] = useState(false);

  useEffect(() => {
    if (!classroomId) return;
    setLoading(true);
    parentApi.getClassroomDetail(classroomId)
      .then((d) => {
        setDetail(d);
        return parentApi.getChildEvaluations(classroomId);
      })
      .then((evs) => setEvaluations(evs))
      .catch(() => {/* detail stays null → error state shown */})
      .finally(() => setLoading(false));
  }, [classroomId]);

  if (loading) return <div className="text-center py-20 text-ink-3"><Spinner size={28} /></div>;
  if (!detail) return (
    <div className="text-center py-20 space-y-3">
      <p className="text-ink-1 font-medium">Không thể xem lớp này.</p>
      <p className="text-sm text-ink-3">Bạn không có quyền truy cập hoặc con bạn không tham gia lớp này.</p>
      <Link to="/parent" className="btn btn-secondary btn-sm inline-flex">← Quay lại</Link>
    </div>
  );

  return (
    <div className="w-full px-4 sm:px-6 py-8 space-y-6 max-w-3xl mx-auto">
      {/* Header card */}
      <div className="card overflow-hidden">
        <div className="h-32 relative overflow-hidden flex items-end p-5"
             style={{ background: detail.coverImageUrl
               ? `url(${detail.coverImageUrl}) center/cover`
               : 'linear-gradient(135deg, var(--sidebar-bg) 0%, #3D2C24 100%)' }}>
          <h1 className="text-white font-serif font-semibold text-2xl drop-shadow">{detail.name}</h1>
        </div>
        <div className="card-body flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-ink-3 mb-0.5">Học sinh được theo dõi</p>
            <p className="font-semibold text-ink-1">{detail.studentName}</p>
            <p className="text-xs font-mono text-ink-3">{detail.studentCode}</p>
          </div>
          <button
            onClick={() => setLeaveOpen(true)}
            className="btn btn-secondary btn-sm gap-1.5"
          >
            <FileText size={13} /> Gửi đơn xin nghỉ phép
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-rule">
        {(['overview', 'evaluations'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === t
                ? 'border-sidebar-accent text-ink-1'
                : 'border-transparent text-ink-3 hover:text-ink-2'
            }`}
            style={tab === t ? { borderColor: 'var(--sidebar-accent)' } : undefined}
          >
            {t === 'overview' ? 'Tổng quan' : `Đánh giá (${evaluations.length})`}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="card card-body">
            <h2 className="text-sm font-semibold text-ink-2 mb-2">Về lớp học</h2>
            <p className="text-sm text-ink-1">{detail.description ?? 'Chưa có mô tả.'}</p>
          </div>

          <div className="card card-body space-y-3">
            <h2 className="text-sm font-semibold text-ink-2">Tính năng dành cho phụ huynh</h2>
            <ActionRow
              icon={<FileText size={16} />}
              label="Gửi đơn xin nghỉ phép cho con"
              sub="Tạo đơn và gửi tới giáo viên chủ nhiệm"
              onClick={() => setLeaveOpen(true)}
            />
            <ActionRow
              icon={<Star size={16} />}
              label={`Xem đánh giá của con (${evaluations.length})`}
              sub="Nhận xét từ giáo viên về học lực, hạnh kiểm"
              onClick={() => setTab('evaluations')}
            />
          </div>

          <p className="text-xs text-ink-3 text-center">
            Phụ huynh có quyền xem thông tin và gửi đơn nghỉ phép — read-only.
          </p>
        </div>
      )}

      {tab === 'evaluations' && (
        <div className="space-y-3">
          {evaluations.length === 0 ? (
            <div className="card card-body text-center py-12 text-ink-3 text-sm">
              Chưa có đánh giá nào cho {detail.studentName} trong lớp này.
            </div>
          ) : (
            evaluations.map((ev) => (
              <div key={ev.id} className="card card-body space-y-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-semibold text-white"
                      style={{ background: CATEGORY_COLOR[ev.category] ?? '#5b6470' }}
                    >
                      {CATEGORY_LABEL[ev.category] ?? ev.category}
                    </span>
                    {ev.period && (
                      <span className="text-xs text-ink-3">{ev.period}</span>
                    )}
                    {ev.score != null && (
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
                            style={{ background: 'var(--bg-surface-2)', color: 'var(--ink-1)' }}>
                        {ev.score}/10
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-ink-3">
                    {new Date(ev.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                {ev.title && <p className="font-semibold text-ink-1 text-sm">{ev.title}</p>}
                <p className="text-sm text-ink-2 leading-relaxed">{ev.content}</p>
                <p className="text-xs text-ink-3">— {ev.teacherName}</p>
              </div>
            ))
          )}
        </div>
      )}

      {leaveOpen && classroomId && detail && (
        <LeaveRequestModal
          classroomId={classroomId}
          studentName={detail.studentName}
          onClose={() => setLeaveOpen(false)}
        />
      )}
    </div>
  );
}

// ─── ActionRow ─────────────────────────────────────────────────────────────────

function ActionRow({ icon, label, sub, onClick }: {
  icon: React.ReactNode; label: string; sub: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-bg-surface-2 transition-colors text-left"
      style={{ background: 'var(--bg-surface-2)' }}
    >
      <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'var(--sidebar-accent)', color: '#fff' }}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-1">{label}</p>
        <p className="text-xs text-ink-3">{sub}</p>
      </div>
      <ChevronRight size={14} style={{ color: 'var(--ink-3)' }} />
    </button>
  );
}

// ─── LeaveRequestModal ─────────────────────────────────────────────────────────

function LeaveRequestModal({ classroomId, studentName, onClose }: {
  classroomId: string;
  studentName: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reason.trim() || !date) return;
    setSubmitting(true);
    setError('');
    try {
      await parentApi.submitAbsence(classroomId, {
        date,
        reason: reason.trim(),
        note: note.trim() || undefined,
      });
      setDone(true);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Gửi đơn thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="card w-full max-w-md shadow-xl animate-scale-in">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold text-ink-1">Đơn xin nghỉ phép</h2>
            <button onClick={onClose} className="btn btn-ghost btn-icon"><X size={16} /></button>
          </div>

          {done ? (
            <div className="card-body text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                   style={{ background: 'var(--green-fill)' }}>
                <Send size={20} style={{ color: 'var(--green-text)' }} />
              </div>
              <p className="font-semibold text-ink-1">Đã gửi đơn thành công!</p>
              <p className="text-sm text-ink-3">Giáo viên sẽ xem xét và phản hồi sớm.</p>
              <button onClick={onClose} className="btn btn-primary btn-sm mt-2">Đóng</button>
            </div>
          ) : (
            <div className="card-body space-y-4">
              <p className="text-sm text-ink-3">
                Gửi đơn xin nghỉ phép thay cho <strong className="text-ink-1">{studentName}</strong>.
              </p>

              {error && (
                <p className="text-xs p-2 rounded" style={{ background: 'var(--red-fill)', color: 'var(--red-text)' }}>
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="input-label">Ngày xin nghỉ *</label>
                <div className="input-field">
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="input-label">Lý do *</label>
                <div className="input-field">
                  <input
                    type="text"
                    placeholder="VD: Bệnh, gia đình có việc..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="input-label">Ghi chú thêm</label>
                <div className="input-field" style={{ alignItems: 'flex-start', padding: '8px 12px' }}>
                  <textarea
                    rows={3}
                    placeholder="Thông tin thêm cho giáo viên..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    style={{ resize: 'none', paddingTop: 0, paddingBottom: 0 }}
                  />
                </div>
              </div>

              <div className="card-footer -mx-4 -mb-4 px-4 mt-2">
                <button onClick={onClose} className="btn btn-ghost btn-sm">Hủy</button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !reason.trim() || !date}
                  className="btn btn-primary btn-sm gap-1.5"
                >
                  {submitting ? <Spinner size={13} className="text-white" /> : <><Send size={13} /> Gửi đơn</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
