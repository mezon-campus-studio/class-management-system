import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2, X, ChevronDown, ChevronUp, Users, Star } from 'lucide-react';
import { classroomApi } from '@/features/classroom/api';
import { api } from '@/services/api-client';
import { useAuthStore } from '@/app/store';
import { isAtLeast } from '@/features/classroom/permissions';
import { Spinner } from '@/shared/components/Spinner';
import type { ClassroomMember, MemberRole } from '@/features/classroom/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Evaluation {
  id: string;
  studentId: string;
  teacherName: string;
  category: EvalCategory;
  score: number | null;
  title: string | null;
  content: string;
  period: string | null;
  createdAt: string;
}

type EvalCategory = 'ACADEMIC' | 'BEHAVIOR' | 'ACHIEVEMENT' | 'DISCIPLINE' | 'GENERAL';

const CATEGORY_OPTIONS: { value: EvalCategory; label: string }[] = [
  { value: 'ACADEMIC',    label: 'Học lực' },
  { value: 'BEHAVIOR',    label: 'Hạnh kiểm' },
  { value: 'ACHIEVEMENT', label: 'Thành tích' },
  { value: 'DISCIPLINE',  label: 'Kỷ luật' },
  { value: 'GENERAL',     label: 'Nhận xét chung' },
];

const CATEGORY_COLOR: Record<EvalCategory, string> = {
  ACADEMIC:    '#1e4fa8',
  BEHAVIOR:    '#166534',
  ACHIEVEMENT: '#c2714f',
  DISCIPLINE:  '#cf5151',
  GENERAL:     '#5b6470',
};

interface Wrap<T> { data: T }

// ─── Page ──────────────────────────────────────────────────────────────────────

export function StudentManagementPage() {
  const { classroomId } = useParams<{ classroomId: string }>();
  const user = useAuthStore((s) => s.user);

  const [members, setMembers] = useState<ClassroomMember[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState<MemberRole | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addingFor, setAddingFor] = useState<ClassroomMember | null>(null);

  const reload = async () => {
    if (!classroomId) return;
    setLoading(true);
    try {
      const [mbrs, evals] = await Promise.all([
        classroomApi.listMembers(classroomId),
        api.get<Wrap<Evaluation[]>>(`/classrooms/${classroomId}/evaluations`).then((r) => r.data.data),
      ]);
      setMembers(mbrs);
      setEvaluations(evals ?? []);
      const me = mbrs.find((m) => m.userId === user?.id);
      setMyRole(me?.role ?? null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [classroomId]);

  const canEvaluate = myRole ? isAtLeast(myRole, 'TEACHER') : false;
  const isHomeroom = myRole === 'OWNER';

  // Students only (no TEACHER/OWNER in the list)
  const students = useMemo(
    () => members.filter((m) => !isAtLeast(m.role, 'TEACHER')),
    [members],
  );

  const teachers = useMemo(
    () => members.filter((m) => isAtLeast(m.role, 'TEACHER')),
    [members],
  );

  const evalsByStudent = useMemo(() => {
    const map: Record<string, Evaluation[]> = {};
    for (const ev of evaluations) {
      (map[ev.studentId] ??= []).push(ev);
    }
    return map;
  }, [evaluations]);

  const handleDelete = async (evalId: string) => {
    if (!classroomId) return;
    await api.delete(`/classrooms/${classroomId}/evaluations/${evalId}`);
    setEvaluations((prev) => prev.filter((e) => e.id !== evalId));
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size={28} /></div>;

  return (
    <div className="w-full px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-ink-1">
            {isHomeroom ? 'Quản lý học sinh' : 'Danh sách lớp'}
          </h1>
          <p className="text-sm text-ink-3 mt-1">
            {isHomeroom
              ? 'Giáo viên chủ nhiệm — xem và đánh giá học sinh, ghi chú hạnh kiểm, học lực.'
              : 'Giáo viên bộ môn — xem danh sách và ghi đánh giá theo môn.'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-3">
          <Users size={14} />
          <span>{students.length} học sinh · {teachers.length} giáo viên</span>
        </div>
      </div>

      {/* Teachers row (homeroom only) */}
      {isHomeroom && teachers.length > 0 && (
        <div className="card card-body">
          <p className="text-label mb-3">Giáo viên trong lớp</p>
          <div className="flex flex-wrap gap-2">
            {teachers.map((t) => (
              <div key={t.memberId} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                   style={{ background: 'var(--bg-surface-2)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                     style={{ background: 'var(--sidebar-accent)' }}>
                  {t.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-1">{t.displayName}</p>
                  <p className="text-xs text-ink-3">{t.role === 'OWNER' ? 'Chủ nhiệm' : 'Giáo viên bộ môn'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student list */}
      <div className="space-y-3">
        {students.length === 0 && (
          <div className="card card-body text-center py-12 text-ink-3 text-sm">
            Chưa có học sinh nào trong lớp.
          </div>
        )}
        {students.map((student, idx) => {
          const evs = evalsByStudent[student.userId] ?? [];
          const expanded = expandedId === student.userId;
          return (
            <div key={student.memberId} className="card overflow-hidden">
              {/* Student row */}
              <div
                className="card-body flex items-center gap-3 cursor-pointer hover:bg-bg-surface-2 transition-colors"
                onClick={() => setExpandedId(expanded ? null : student.userId)}
              >
                <span className="text-xs text-ink-3 w-6 text-right shrink-0">{idx + 1}.</span>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                     style={{ background: 'var(--sidebar-accent)' }}>
                  {student.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-1 text-sm truncate">{student.displayName}</p>
                  <p className="text-xs text-ink-3">{student.role}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {evs.length > 0 && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--amber-fill)', color: 'var(--amber-text)' }}>
                      <Star size={10} /> {evs.length}
                    </span>
                  )}
                  {canEvaluate && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setAddingFor(student); }}
                      className="btn btn-secondary btn-sm gap-1"
                    >
                      <Plus size={12} /> Đánh giá
                    </button>
                  )}
                  {expanded ? <ChevronUp size={14} className="text-ink-3" /> : <ChevronDown size={14} className="text-ink-3" />}
                </div>
              </div>

              {/* Expanded evaluations */}
              {expanded && (
                <div className="border-t border-rule px-4 py-3 space-y-2"
                     style={{ background: 'var(--bg-surface-2)' }}>
                  {evs.length === 0 ? (
                    <p className="text-xs text-ink-3 py-2">Chưa có đánh giá nào.</p>
                  ) : (
                    evs.map((ev) => (
                      <div key={ev.id} className="card card-body py-3 flex items-start gap-3">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="px-2 py-0.5 rounded text-[11px] font-semibold text-white"
                              style={{ background: CATEGORY_COLOR[ev.category] }}
                            >
                              {CATEGORY_OPTIONS.find((o) => o.value === ev.category)?.label ?? ev.category}
                            </span>
                            {ev.period && <span className="text-xs text-ink-3">{ev.period}</span>}
                            {ev.score != null && (
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                                    style={{ background: 'var(--bg-surface-3, #edebe6)', color: 'var(--ink-1)' }}>
                                {ev.score}/10
                              </span>
                            )}
                            <span className="text-xs text-ink-3 ml-auto">
                              {new Date(ev.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          {ev.title && <p className="text-sm font-semibold text-ink-1">{ev.title}</p>}
                          <p className="text-sm text-ink-2 leading-relaxed">{ev.content}</p>
                          <p className="text-xs text-ink-3">— {ev.teacherName}</p>
                        </div>
                        {canEvaluate && (
                          <button
                            onClick={() => handleDelete(ev.id)}
                            className="btn btn-ghost btn-icon shrink-0"
                            style={{ color: 'var(--red-text)' }}
                            title="Xóa đánh giá"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add evaluation modal */}
      {addingFor && classroomId && (
        <AddEvaluationModal
          classroomId={classroomId}
          student={addingFor}
          onClose={() => setAddingFor(null)}
          onSaved={(ev) => {
            setEvaluations((prev) => [ev, ...prev]);
            setAddingFor(null);
            setExpandedId(addingFor.userId);
          }}
        />
      )}
    </div>
  );
}

// ─── AddEvaluationModal ────────────────────────────────────────────────────────

function AddEvaluationModal({ classroomId, student, onClose, onSaved }: {
  classroomId: string;
  student: ClassroomMember;
  onClose: () => void;
  onSaved: (ev: Evaluation) => void;
}) {
  const [category, setCategory] = useState<EvalCategory>('GENERAL');
  const [score, setScore] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [period, setPeriod] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post<Wrap<Evaluation>>(`/classrooms/${classroomId}/evaluations`, {
        studentId: student.userId,
        category,
        score: score !== '' ? Number(score) : undefined,
        title: title.trim() || undefined,
        content: content.trim(),
        period: period.trim() || undefined,
      });
      onSaved(res.data.data);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Thêm đánh giá thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="card w-full max-w-lg shadow-xl animate-scale-in">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold text-ink-1">
              Đánh giá — <span style={{ color: 'var(--sidebar-accent)' }}>{student.displayName}</span>
            </h2>
            <button onClick={onClose} className="btn btn-ghost btn-icon"><X size={16} /></button>
          </div>
          <div className="card-body space-y-4">
            {error && (
              <p className="text-xs p-2 rounded" style={{ background: 'var(--red-fill)', color: 'var(--red-text)' }}>
                {error}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="input-label">Phân loại</label>
                <div className="input-field" style={{ padding: '0 12px' }}>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EvalCategory)}
                    style={{ padding: '9px 0' }}
                  >
                    {CATEGORY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="input-label">Điểm (0–10)</label>
                <div className="input-field">
                  <input
                    type="number" min={0} max={10}
                    placeholder="Không bắt buộc"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="input-label">Học kỳ / Tháng</label>
              <div className="input-field">
                <input
                  type="text"
                  placeholder="VD: 2024-HK1, 2024-T10"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="input-label">Tiêu đề</label>
              <div className="input-field">
                <input
                  type="text"
                  placeholder="VD: Xuất sắc môn Toán HK1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="input-label">Nội dung nhận xét *</label>
              <div className="input-field" style={{ alignItems: 'flex-start', padding: '8px 12px' }}>
                <textarea
                  rows={4}
                  placeholder="Nhận xét chi tiết về học sinh..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ resize: 'none', paddingTop: 0, paddingBottom: 0 }}
                />
              </div>
            </div>
          </div>

          <div className="card-footer flex justify-end gap-2">
            <button onClick={onClose} className="btn btn-ghost btn-sm">Hủy</button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !content.trim()}
              className="btn btn-primary btn-sm"
            >
              {submitting ? <Spinner size={13} className="text-white" /> : 'Lưu đánh giá'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
