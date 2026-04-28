import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BookOpen, Users, CalendarDays, ArrowLeftRight, Plus, Trash2, Edit2, Check,
  X, Loader2, RefreshCw, AlertTriangle, Zap, CheckCircle2,
  LayoutGrid, School,
} from 'lucide-react';
import { adminApi, type AdminUser } from '../api';
import { timetableApi, type Subject, type TeacherSubjectEntry, type TimetableEntry,
  type SwapRequest, type ClassroomSubjectConfig,
  DAY_ORDER, DAY_SHORT, DAY_LABELS, PERIOD_TIMES } from '@/features/schedule/api/timetableApi';
import { Modal } from '@/shared/components/Modal';
import { Badge } from '@/shared/components/Badge';
import { Spinner } from '@/shared/components/Spinner';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentAcademicYear(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  return m >= 9 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

function getAcademicYearOptions(): string[] {
  const now = new Date();
  const y = now.getFullYear();
  return [
    `${y - 1}-${y}`,
    `${y}-${y + 1}`,
    `${y + 1}-${y + 2}`,
  ];
}

const PRESET_COLORS = [
  '#4F81BD', '#C0504D', '#9BBB59', '#8064A2', '#4BACC6',
  '#F79646', '#2C4770', '#A0522D', '#2E8B57', '#8B008B',
];

// Shared style for bare <input>/<select> outside of .input-field wrapper
const CTRL: React.CSSProperties = {
  height: 32,
  fontSize: 13,
  padding: '0 8px',
  borderRadius: 6,
  border: '1px solid var(--rule-md)',
  background: 'var(--bg-surface)',
  color: 'var(--ink-1)',
  boxSizing: 'border-box',
};
// Compact variant for inline table cells
const CTRL_SM: React.CSSProperties = {
  height: 28,
  fontSize: 12,
  padding: '0 6px',
  borderRadius: 5,
  border: '1px solid var(--rule)',
  background: 'var(--bg-surface)',
  color: 'var(--ink-1)',
  boxSizing: 'border-box',
};

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

interface Classroom {
  id: string;
  name: string;
}

// ─── Tab: Subjects ─────────────────────────────────────────────────────────────

interface SubjectFormData {
  name: string;
  code: string;
  periodsPerWeek: number;
  colorHex: string;
}

function SubjectsTab() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SubjectFormData>({ name: '', code: '', periodsPerWeek: 4, colorHex: PRESET_COLORS[0] });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await timetableApi.listSubjects();
      setSubjects(data);
    } catch {
      setError('Không thể tải danh sách môn học.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSubjects(); }, [loadSubjects]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', code: '', periodsPerWeek: 4, colorHex: PRESET_COLORS[0] });
    setModalOpen(true);
  };

  const openEdit = (s: Subject) => {
    setEditingId(s.id);
    setForm({ name: s.name, code: s.code, periodsPerWeek: s.periodsPerWeek, colorHex: s.colorHex || PRESET_COLORS[0] });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await timetableApi.updateSubject(editingId, form);
      } else {
        await timetableApi.createSubject(form);
      }
      setModalOpen(false);
      loadSubjects();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: Subject) => {
    if (!confirm(`Xoá môn "${s.name}"? Thao tác này không thể hoàn tác.`)) return;
    setDeletingId(s.id);
    try {
      await timetableApi.deleteSubject(s.id);
      loadSubjects();
    } catch {
      alert('Không thể xoá môn học này.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink-1)', margin: 0 }}>Môn học</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>Quản lý danh sách môn học trong hệ thống</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary btn-sm gap-1">
          <Plus size={14} /> Thêm môn học
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--red-fill)', border: '1px solid var(--red-border)', color: 'var(--red-text)', fontSize: 13, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Màu</th>
              <th>Tên môn</th>
              <th>Mã môn</th>
              <th>Tiết/tuần</th>
              <th>Ngày tạo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--ink-3)' }}>
                <Spinner size={20} style={{ display: 'inline-block' }} />
              </td></tr>
            )}
            {!loading && subjects.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-3)' }}>
                Chưa có môn học nào
              </td></tr>
            )}
            {subjects.map(s => (
              <tr key={s.id}>
                <td>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      background: s.colorHex || '#ccc',
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}
                  />
                </td>
                <td style={{ fontWeight: 500, color: 'var(--ink-1)' }}>{s.name}</td>
                <td>
                  <code style={{ fontSize: 12 }}>{s.code}</code>
                </td>
                <td style={{ color: 'var(--ink-2)', fontSize: 13 }}>{s.periodsPerWeek} tiết</td>
                <td style={{ color: 'var(--ink-3)', fontSize: 12 }}>
                  {new Date(s.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => openEdit(s)} className="btn btn-ghost btn-sm" title="Sửa">
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(s)}
                      disabled={deletingId === s.id}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--red-text)' }}
                      title="Xoá"
                    >
                      {deletingId === s.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Sửa môn học' : 'Thêm môn học'}
        size="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label>Tên môn học *</label>
            <div className="input-field mt-1">
              <input
                required
                placeholder="Ví dụ: Toán học"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label>Mã môn *</label>
            <div className="input-field mt-1">
              <input
                required
                placeholder="Ví dụ: MATH"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              />
            </div>
          </div>
          <div>
            <label>Số tiết/tuần</label>
            <div className="input-field mt-1">
              <input
                type="number"
                min={1}
                max={10}
                value={form.periodsPerWeek}
                onChange={e => setForm(f => ({ ...f, periodsPerWeek: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>
          <div>
            <label>Màu hiển thị</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, colorHex: c }))}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    background: c,
                    border: form.colorHex === c ? '3px solid var(--ink-1)' : '2px solid transparent',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                  }}
                />
              ))}
              <input
                type="color"
                value={form.colorHex}
                onChange={e => setForm(f => ({ ...f, colorHex: e.target.value }))}
                title="Chọn màu tùy chỉnh"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  border: '2px solid var(--rule-md)',
                  cursor: 'pointer',
                  padding: 1,
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <div style={{ width: 16, height: 16, borderRadius: 3, background: form.colorHex }} />
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{form.colorHex}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm flex-1">Huỷ</button>
            <button type="submit" disabled={saving} className="btn btn-primary btn-sm flex-1 gap-1">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              {editingId ? 'Lưu thay đổi' : 'Tạo môn học'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Tab: Teacher Assignments ──────────────────────────────────────────────────

function TeacherAssignmentsTab() {
  const [teachers, setTeachers] = useState<AdminUser[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<TeacherSubjectEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ teacherId: '', subjectId: '' });
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [teacherPage, subjectList, assignList] = await Promise.all([
        adminApi.listUsers(undefined, 'TEACHER', 0, 200),
        timetableApi.listSubjects(),
        timetableApi.listTeacherSubjects(),
      ]);
      setTeachers(teacherPage.content ?? []);
      setSubjects(subjectList);
      setAssignments(assignList);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Group assignments by teacherId
  const byTeacher = useMemo(() => {
    const map = new Map<string, TeacherSubjectEntry[]>();
    assignments.forEach(a => {
      const arr = map.get(a.teacherId) ?? [];
      arr.push(a);
      map.set(a.teacherId, arr);
    });
    return map;
  }, [assignments]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.teacherId || !assignForm.subjectId) return;
    setSaving(true);
    try {
      await timetableApi.assignTeacherSubject(assignForm);
      setModalOpen(false);
      setAssignForm({ teacherId: '', subjectId: '' });
      loadAll();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Xoá phân công này?')) return;
    setRemovingId(id);
    try {
      await timetableApi.unassignTeacherSubject(id);
      loadAll();
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink-1)', margin: 0 }}>Phân công giáo viên</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>Gán môn học cho từng giáo viên</p>
        </div>
        <button onClick={() => { setAssignForm({ teacherId: '', subjectId: '' }); setModalOpen(true); }} className="btn btn-primary btn-sm gap-1">
          <Plus size={14} /> Phân công mới
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={24} /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Giáo viên</th>
                <th>Email</th>
                <th>Môn học được phân công</th>
                <th>Số môn</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--ink-3)' }}>Không có giáo viên</td></tr>
              )}
              {teachers.map(teacher => {
                const teacherAssignments = byTeacher.get(teacher.id) ?? [];
                return (
                  <tr key={teacher.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'var(--amber-fill)',
                            border: '1px solid var(--amber-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--amber-text)',
                            flexShrink: 0,
                          }}
                        >
                          {teacher.displayName.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500, color: 'var(--ink-1)', fontSize: 14 }}>{teacher.displayName}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--ink-3)' }}>{teacher.email}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                        {teacherAssignments.length === 0 ? (
                          <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>Chưa phân công</span>
                        ) : (
                          teacherAssignments.map(a => (
                            <div
                              key={a.id}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                background: 'var(--blue-fill)',
                                border: '1px solid var(--blue-border)',
                                color: 'var(--blue-text)',
                                borderRadius: 6,
                                padding: '2px 6px 2px 8px',
                                fontSize: 12,
                                fontWeight: 500,
                              }}
                            >
                              {a.subjectName}
                              <button
                                onClick={() => handleRemove(a.id)}
                                disabled={removingId === a.id}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: 'var(--blue-text)',
                                  opacity: 0.6,
                                  padding: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                title="Xoá phân công"
                              >
                                {removingId === a.id ? <Loader2 size={10} className="animate-spin" /> : <X size={10} />}
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                      {teacherAssignments.length} môn
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Phân công môn học cho giáo viên" size="sm">
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label>Giáo viên *</label>
            <div className="input-field mt-1">
              <select
                required
                value={assignForm.teacherId}
                onChange={e => setAssignForm(f => ({ ...f, teacherId: e.target.value }))}
                style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', color: 'var(--ink-1)', fontSize: 13 }}
              >
                <option value="">-- Chọn giáo viên --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.displayName} ({t.email})</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label>Môn học *</label>
            <div className="input-field mt-1">
              <select
                required
                value={assignForm.subjectId}
                onChange={e => setAssignForm(f => ({ ...f, subjectId: e.target.value }))}
                style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', color: 'var(--ink-1)', fontSize: 13 }}
              >
                <option value="">-- Chọn môn học --</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm flex-1">Huỷ</button>
            <button type="submit" disabled={saving} className="btn btn-primary btn-sm flex-1 gap-1">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              Phân công
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Quick-add entry form (inline) ────────────────────────────────────────────

interface QuickAddFormProps {
  dayOfWeek: string;
  period: number;
  classroomId: string;
  academicYear: string;
  semester: number;
  subjects: Subject[];
  teachers: AdminUser[];
  onSave: () => void;
  onCancel: () => void;
}

function QuickAddForm({ dayOfWeek, period, classroomId, academicYear, semester, subjects, teachers, onSave, onCancel }: QuickAddFormProps) {
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return;
    setSaving(true);
    try {
      await timetableApi.createEntry({ classroomId, subjectId, teacherId: teacherId || undefined, dayOfWeek, period, academicYear, semester });
      onSave();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 8, minWidth: 180 }}>
      <div style={{ marginBottom: 6 }}>
        <select
          required
          value={subjectId}
          onChange={e => setSubjectId(e.target.value)}
          style={{ ...CTRL_SM, width: '100%' }}
        >
          <option value="">-- Chọn môn --</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 8 }}>
        <select
          value={teacherId}
          onChange={e => setTeacherId(e.target.value)}
          style={{ ...CTRL_SM, width: '100%' }}
        >
          <option value="">-- Chọn GV (tuỳ chọn) --</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.displayName}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: 11 }}>Huỷ</button>
        <button type="submit" disabled={saving} className="btn btn-primary btn-sm" style={{ flex: 1, fontSize: 11 }}>
          {saving ? <Loader2 size={11} className="animate-spin" /> : 'Thêm'}
        </button>
      </div>
    </form>
  );
}

// ─── Curriculum Tab ────────────────────────────────────────────────────────────

function CurriculumTab() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<AdminUser[]>([]);
  const [configs, setConfigs] = useState<ClassroomSubjectConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ subjectId: '', teacherId: '', periodsPerWeek: 4 });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cr, sub, tc, cfg] = await Promise.all([
        adminApi.listClassrooms(0, 500).then(r => r.content),
        timetableApi.listSubjects(),
        adminApi.listUsers(undefined, 'TEACHER', 0, 200).then(r => r.content),
        timetableApi.getConfigs(),
      ]);
      setClassrooms(cr);
      setSubjects(sub);
      setTeachers(tc);
      setConfigs(cfg);
      if (cr.length > 0 && !selectedClassroomId) setSelectedClassroomId(cr[0].id);
    } finally {
      setLoading(false);
    }
  }, [selectedClassroomId]);

  useEffect(() => { loadAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const classroomConfigs = useMemo(
    () => configs.filter(c => c.classroomId === selectedClassroomId),
    [configs, selectedClassroomId],
  );

  const usedSubjectIds = useMemo(
    () => new Set(classroomConfigs.map(c => c.subjectId)),
    [classroomConfigs],
  );

  const availableSubjects = subjects.filter(s => !usedSubjectIds.has(s.id));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassroomId || !addForm.subjectId) return;
    setSaving(true);
    try {
      const cfg = await timetableApi.saveConfig({
        classroomId: selectedClassroomId,
        subjectId: addForm.subjectId,
        teacherId: addForm.teacherId || null,
        periodsPerWeek: addForm.periodsPerWeek,
      });
      setConfigs(prev => [...prev.filter(c => !(c.classroomId === cfg.classroomId && c.subjectId === cfg.subjectId)), cfg]);
      setAddForm({ subjectId: '', teacherId: '', periodsPerWeek: 4 });
      setShowAddForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá cấu hình môn học này?')) return;
    setDeletingId(id);
    try {
      await timetableApi.deleteConfig(id);
      setConfigs(prev => prev.filter(c => c.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdatePeriodsOrTeacher = async (cfg: ClassroomSubjectConfig, field: 'teacherId' | 'periodsPerWeek', value: string | number) => {
    const updated = await timetableApi.saveConfig({
      classroomId: cfg.classroomId,
      subjectId: cfg.subjectId,
      teacherId: field === 'teacherId' ? (value as string) || null : cfg.teacherId,
      periodsPerWeek: field === 'periodsPerWeek' ? Number(value) : cfg.periodsPerWeek,
    });
    setConfigs(prev => prev.map(c => c.id === cfg.id ? updated : c));
  };

  const configCountByClassroom = useMemo(() => {
    const m: Record<string, number> = {};
    configs.forEach(c => { m[c.classroomId] = (m[c.classroomId] ?? 0) + 1; });
    return m;
  }, [configs]);

  if (loading) return <div className="flex justify-center py-24"><Spinner size={28} /></div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, minHeight: 480 }}>
      {/* Left: classroom list */}
      <div className="card overflow-hidden" style={{ alignSelf: 'start' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--rule)', background: 'var(--bg-surface-2)' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
            Danh sách lớp
          </p>
        </div>
        {classrooms.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--ink-3)', padding: '16px 14px', margin: 0 }}>Chưa có lớp học</p>
        ) : (
          classrooms.map(c => {
            const count = configCountByClassroom[c.id] ?? 0;
            const isSelected = c.id === selectedClassroomId;
            return (
              <button
                key={c.id}
                onClick={() => { setSelectedClassroomId(c.id); setShowAddForm(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '9px 14px',
                  border: 'none',
                  background: isSelected ? 'var(--warm-fill)' : 'transparent',
                  borderLeft: isSelected ? '2px solid var(--warm-400)' : '2px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 120ms',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: isSelected ? 600 : 400, color: isSelected ? 'var(--warm-text)' : 'var(--ink-2)' }}>
                  {c.name}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: count > 0 ? 'var(--green-text)' : 'var(--ink-4)',
                  background: count > 0 ? 'var(--green-fill)' : 'var(--bg-surface-2)',
                  border: `1px solid ${count > 0 ? 'var(--green-border)' : 'var(--rule)'}`,
                  borderRadius: 20,
                  padding: '1px 7px',
                  minWidth: 22,
                  textAlign: 'center',
                }}>
                  {count}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Right: subject configs for selected classroom */}
      <div>
        {!selectedClassroomId ? (
          <div className="card card-body" style={{ textAlign: 'center', color: 'var(--ink-3)', padding: 40 }}>
            Chọn một lớp học ở bên trái
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderBottom: '1px solid var(--rule)',
              background: 'var(--bg-surface-2)',
            }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-1)', margin: 0 }}>
                  {classrooms.find(c => c.id === selectedClassroomId)?.name}
                </p>
                <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>
                  {classroomConfigs.length} môn học được cấu hình
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(v => !v)}
                className="btn btn-primary btn-sm"
                style={{ gap: 6, display: 'flex', alignItems: 'center' }}
              >
                <Plus size={13} /> Thêm môn học
              </button>
            </div>

            {/* Add form */}
            {showAddForm && (
              <form onSubmit={handleAdd} style={{
                padding: '12px 16px', borderBottom: '1px solid var(--rule)',
                background: 'var(--warm-fill)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end',
              }}>
                <div style={{ flex: '1 1 160px' }}>
                  <label style={{ fontSize: 11, color: 'var(--ink-3)', display: 'block', marginBottom: 4 }}>Môn học *</label>
                  <select
                    required
                    value={addForm.subjectId}
                    onChange={e => setAddForm(f => ({ ...f, subjectId: e.target.value }))}
                    style={{ ...CTRL, width: '100%' }}
                  >
                    <option value="">-- Chọn môn --</option>
                    {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div style={{ flex: '1 1 160px' }}>
                  <label style={{ fontSize: 11, color: 'var(--ink-3)', display: 'block', marginBottom: 4 }}>Giáo viên</label>
                  <select
                    value={addForm.teacherId}
                    onChange={e => setAddForm(f => ({ ...f, teacherId: e.target.value }))}
                    style={{ ...CTRL, width: '100%' }}
                  >
                    <option value="">-- Chưa phân công --</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.displayName}</option>)}
                  </select>
                </div>
                <div style={{ flex: '0 0 90px' }}>
                  <label style={{ fontSize: 11, color: 'var(--ink-3)', display: 'block', marginBottom: 4 }}>Số tiết/tuần</label>
                  <input
                    type="number" min={1} max={20} required
                    value={addForm.periodsPerWeek}
                    onChange={e => setAddForm(f => ({ ...f, periodsPerWeek: Number(e.target.value) }))}
                    style={{ ...CTRL, width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-ghost btn-sm">Huỷ</button>
                  <button type="submit" disabled={saving} className="btn btn-primary btn-sm" style={{ gap: 4 }}>
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Lưu
                  </button>
                </div>
              </form>
            )}

            {/* Config table */}
            {classroomConfigs.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}>
                <School size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                <p style={{ fontSize: 13, margin: 0 }}>Chưa có môn học nào. Nhấn "+ Thêm môn học" để bắt đầu.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Môn học</th>
                    <th>Giáo viên</th>
                    <th style={{ width: 110 }}>Số tiết/tuần</th>
                    <th style={{ width: 48 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {classroomConfigs.map(cfg => (
                    <tr key={cfg.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.subjectColor || '#ccc', flexShrink: 0 }} />
                          <span style={{ fontWeight: 500 }}>{cfg.subjectName}</span>
                          <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{cfg.subjectCode}</span>
                        </div>
                      </td>
                      <td>
                        <select
                          value={cfg.teacherId ?? ''}
                          onChange={e => handleUpdatePeriodsOrTeacher(cfg, 'teacherId', e.target.value)}
                          style={{ ...CTRL_SM, maxWidth: 180 }}
                        >
                          <option value="">-- Chưa phân công --</option>
                          {teachers.map(t => <option key={t.id} value={t.id}>{t.displayName}</option>)}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number" min={1} max={20}
                          value={cfg.periodsPerWeek}
                          onChange={e => handleUpdatePeriodsOrTeacher(cfg, 'periodsPerWeek', e.target.value)}
                          style={{ ...CTRL_SM, width: 60, textAlign: 'center' }}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(cfg.id)}
                          disabled={deletingId === cfg.id}
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--red-text)', padding: '4px 6px' }}
                        >
                          {deletingId === cfg.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Generate Modal ────────────────────────────────────────────────────────────

interface GenerateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function GenerateModal({ open, onClose, onSuccess }: GenerateModalProps) {
  const yearOptions = getAcademicYearOptions();
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear);
  const [semester, setSemester] = useState(1);
  const [clearExisting, setClearExisting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ entries: number; conflicts: string[] } | null>(null);

  // Loaded from DB configs
  const [configuredClassrooms, setConfiguredClassrooms] = useState<
    Array<{ classroomId: string; classroomName: string; subjectCount: number }>
  >([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingConfigs, setLoadingConfigs] = useState(false);

  // Load configs when modal opens
  useEffect(() => {
    if (!open) return;
    setResult(null);
    setLoadingConfigs(true);
    timetableApi.getConfigs().then(configs => {
      // Group by classroom
      const byClassroom = new Map<string, { name: string; count: number }>();
      configs.forEach(cfg => {
        const prev = byClassroom.get(cfg.classroomId);
        byClassroom.set(cfg.classroomId, {
          name: cfg.classroomName,
          count: (prev?.count ?? 0) + 1,
        });
      });
      const list = Array.from(byClassroom.entries()).map(([classroomId, v]) => ({
        classroomId,
        classroomName: v.name,
        subjectCount: v.count,
      }));
      setConfiguredClassrooms(list);
      setSelectedIds(new Set(list.map(c => c.classroomId)));
    }).finally(() => setLoadingConfigs(false));
  }, [open]);

  const toggleId = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleGenerate = async () => {
    if (selectedIds.size === 0) {
      alert('Vui lòng chọn ít nhất một lớp học.');
      return;
    }
    setGenerating(true);
    try {
      const res = await timetableApi.generateFromConfig({
        academicYear,
        semester,
        clearExisting,
        classroomIds: Array.from(selectedIds),
      });
      setResult({ entries: res.entries.length, conflicts: res.conflicts });
      onSuccess();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Có lỗi khi tạo thời khoá biểu');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Tự động xếp thời khoá biểu" size="md">
      {result ? (
        /* Result view */
        <div className="space-y-4">
          <div
            style={{
              padding: 16,
              borderRadius: 10,
              background: result.conflicts.length === 0 ? 'var(--green-fill)' : 'var(--amber-fill)',
              border: `1px solid ${result.conflicts.length === 0 ? 'var(--green-border)' : 'var(--amber-border)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <CheckCircle2 size={18} style={{ color: result.conflicts.length === 0 ? 'var(--green-text)' : 'var(--amber-text)' }} />
              <span style={{ fontWeight: 600, color: result.conflicts.length === 0 ? 'var(--green-text)' : 'var(--amber-text)' }}>
                Đã tạo {result.entries} tiết học
              </span>
            </div>
            {result.conflicts.length > 0 && (
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber-text)', marginBottom: 6, marginTop: 8 }}>
                  {result.conflicts.length} xung đột:
                </p>
                <ul style={{ listStyle: 'disc', paddingLeft: 20, margin: 0 }}>
                  {result.conflicts.map((c, i) => (
                    <li key={i} style={{ fontSize: 12, color: 'var(--amber-text)', marginBottom: 2 }}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setResult(null)} className="btn btn-secondary btn-sm flex-1">
              Tạo lại
            </button>
            <button onClick={onClose} className="btn btn-primary btn-sm flex-1">
              Đóng
            </button>
          </div>
        </div>
      ) : (
        /* Config view */
        <div className="space-y-4">
          {/* Basic settings */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Năm học</label>
              <div className="input-field mt-1">
                <select
                  value={academicYear}
                  onChange={e => setAcademicYear(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', color: 'var(--ink-1)', fontSize: 13 }}
                >
                  {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label>Học kỳ</label>
              <div className="input-field mt-1">
                <select
                  value={semester}
                  onChange={e => setSemester(Number(e.target.value))}
                  style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', color: 'var(--ink-1)', fontSize: 13 }}
                >
                  <option value={1}>Học kỳ 1</option>
                  <option value={2}>Học kỳ 2</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clear existing toggle */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 8,
              background: clearExisting ? 'var(--red-fill)' : 'var(--bg-surface-2)',
              border: `1px solid ${clearExisting ? 'var(--red-border)' : 'var(--rule)'}`,
              cursor: 'pointer',
              userSelect: 'none',
              fontSize: 14,
            }}
          >
            <input
              type="checkbox"
              checked={clearExisting}
              onChange={e => setClearExisting(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--red-text)' }}
            />
            <div>
              <span style={{ fontWeight: 500, color: clearExisting ? 'var(--red-text)' : 'var(--ink-1)' }}>
                Xoá lịch hiện tại trước khi tạo mới
              </span>
              {clearExisting && (
                <p style={{ fontSize: 11, color: 'var(--red-text)', margin: 0, marginTop: 1, opacity: 0.8 }}>
                  Tất cả tiết học hiện có sẽ bị xoá
                </p>
              )}
            </div>
          </label>

          {/* Classroom list from configs */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', margin: 0 }}>
                Lớp học ({configuredClassrooms.length})
              </p>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set(configuredClassrooms.map(c => c.classroomId)))}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 11 }}
                >
                  Chọn tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 11 }}
                  disabled={selectedIds.size === 0}
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            {loadingConfigs ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                <Spinner size={20} />
              </div>
            ) : configuredClassrooms.length === 0 ? (
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 8,
                  background: 'var(--amber-fill)',
                  border: '1px solid var(--amber-border)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <AlertTriangle size={15} style={{ color: 'var(--amber-text)', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber-text)', margin: '0 0 2px' }}>
                    Chưa có cấu hình chương trình học
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--amber-text)', margin: 0, opacity: 0.85 }}>
                    Vào tab <strong>Chương trình học</strong> để thiết lập môn học cho từng lớp trước khi xếp lịch.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
                {configuredClassrooms.map(cls => {
                  const selected = selectedIds.has(cls.classroomId);
                  return (
                    <label
                      key={cls.classroomId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 12px',
                        borderRadius: 7,
                        border: `1px solid ${selected ? 'var(--warm-border)' : 'var(--rule)'}`,
                        background: selected ? 'var(--warm-fill)' : 'var(--bg-surface)',
                        cursor: 'pointer',
                        userSelect: 'none',
                        transition: 'all 100ms',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleId(cls.classroomId)}
                        style={{ width: 14, height: 14, cursor: 'pointer', accentColor: 'var(--warm-400)', flexShrink: 0 }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 500, color: selected ? 'var(--warm-text)' : 'var(--ink-1)', flex: 1 }}>
                        {cls.classroomName}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: selected ? 'var(--warm-text)' : 'var(--ink-3)',
                          background: selected ? 'var(--warm-border)' : 'var(--bg-surface-2)',
                          borderRadius: 10,
                          padding: '1px 7px',
                          fontWeight: 600,
                        }}
                      >
                        {cls.subjectCount} môn
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, paddingTop: 4, borderTop: '1px solid var(--rule)', marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm flex-1">Huỷ</button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || selectedIds.size === 0 || loadingConfigs}
              className="btn btn-primary btn-sm flex-1 gap-1"
            >
              {generating ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
              Xếp lịch {selectedIds.size > 0 ? `(${selectedIds.size} lớp)` : ''}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── Tab: Timetable ────────────────────────────────────────────────────────────

function TimetableTab() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear);
  const [semester, setSemester] = useState(1);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [addingCell, setAddingCell] = useState<{ day: string; period: number } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);

  const yearOptions = getAcademicYearOptions();

  // Load classrooms, subjects, teachers once
  useEffect(() => {
    (async () => {
      setLoadingMeta(true);
      try {
        const [clsRes, subjList, teacherPage] = await Promise.all([
          adminApi.listClassrooms(0, 500).then(r => r.content),
          timetableApi.listSubjects(),
          adminApi.listUsers(undefined, 'TEACHER', 0, 200),
        ]);
        setClassrooms(clsRes ?? []);
        if (clsRes?.length > 0) setSelectedClassroomId(clsRes[0].id);
        setSubjects(subjList);
        setTeachers(teacherPage.content ?? []);
      } finally {
        setLoadingMeta(false);
      }
    })();
  }, []);

  // Load entries when selection changes
  useEffect(() => {
    if (!selectedClassroomId) return;
    let cancelled = false;
    setLoading(true);
    setEntries([]);
    timetableApi.getEntries(selectedClassroomId, academicYear, semester)
      .then(data => { if (!cancelled) setEntries(data); })
      .catch(() => { if (!cancelled) setEntries([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedClassroomId, academicYear, semester]);

  const entryMap = useMemo(() => {
    const map = new Map<string, TimetableEntry>();
    entries.forEach(e => map.set(`${e.dayOfWeek}-${e.period}`, e));
    return map;
  }, [entries]);

  const reloadEntries = () => {
    if (!selectedClassroomId) return;
    setLoading(true);
    timetableApi.getEntries(selectedClassroomId, academicYear, semester)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá tiết học này?')) return;
    setDeletingId(id);
    try {
      await timetableApi.deleteEntry(id);
      reloadEntries();
    } finally {
      setDeletingId(null);
    }
  };

  const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink-1)', margin: 0 }}>Thời khoá biểu lớp học</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>Xem và chỉnh sửa lịch học theo lớp</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Classroom select */}
          <div className="input-field" style={{ minWidth: 160 }}>
            <BookOpen size={13} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
            <select
              value={selectedClassroomId}
              onChange={e => setSelectedClassroomId(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--ink-1)' }}
            >
              <option value="">-- Chọn lớp --</option>
              {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {/* Year */}
          <div className="input-field">
            <select
              value={academicYear}
              onChange={e => setAcademicYear(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--ink-1)' }}
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {/* Semester */}
          <div className="input-field">
            <select
              value={semester}
              onChange={e => setSemester(Number(e.target.value))}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--ink-1)' }}
            >
              <option value={1}>HK 1</option>
              <option value={2}>HK 2</option>
            </select>
          </div>
          <button onClick={reloadEntries} className="btn btn-ghost btn-sm" title="Làm mới">
            <RefreshCw size={14} />
          </button>
          <button onClick={() => setGenerateOpen(true)} className="btn btn-primary btn-sm gap-1">
            <Zap size={14} /> Tự động xếp lịch
          </button>
        </div>
      </div>

      {/* Timetable grid */}
      {loadingMeta ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={24} /></div>
      ) : !selectedClassroomId ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--ink-3)' }}>
          <CalendarDays size={32} style={{ marginBottom: 8, opacity: 0.3 }} className="mx-auto" />
          <p style={{ fontSize: 14 }}>Chọn lớp học để xem thời khoá biểu</p>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 24 }}><Spinner size={20} /></div>
          )}
          {!loading && (
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: 700 }}>
              <colgroup>
                <col style={{ width: 80 }} />
                {DAY_ORDER.map(d => <col key={d} style={{ width: `${100 / DAY_ORDER.length}%` }} />)}
              </colgroup>
              <thead>
                <tr>
                  <th style={{
                    padding: '10px 8px',
                    background: 'var(--bg-surface-2)',
                    borderBottom: '1px solid var(--rule)',
                    borderRight: '1px solid var(--rule)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--ink-3)',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>Tiết</th>
                  {DAY_ORDER.map(day => (
                    <th key={day} style={{
                      padding: '10px 8px',
                      background: 'var(--bg-surface-2)',
                      borderBottom: '1px solid var(--rule)',
                      borderRight: '1px solid var(--rule)',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--ink-2)',
                      textAlign: 'center',
                    }}>
                      <div>{DAY_SHORT[day]}</div>
                      <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.75 }}>{DAY_LABELS[day]}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((period, periodIdx) => (
                  <>
                    <tr key={period} style={{ borderBottom: period === 5 ? '2px solid var(--rule-md)' : '1px solid var(--rule)' }}>
                      <td style={{
                        padding: '6px 8px',
                        background: 'var(--bg-surface-2)',
                        borderRight: '1px solid var(--rule)',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>Tiết {period}</div>
                        {PERIOD_TIMES[period] && (
                          <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 1 }}>
                            {PERIOD_TIMES[period].start}
                          </div>
                        )}
                      </td>
                      {DAY_ORDER.map(day => {
                        const entry = entryMap.get(`${day}-${period}`);
                        const isAdding = addingCell?.day === day && addingCell?.period === period;

                        return (
                          <td
                            key={day}
                            style={{
                              padding: 4,
                              verticalAlign: 'top',
                              background: periodIdx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-paper)',
                              borderRight: '1px solid var(--rule)',
                              minHeight: 72,
                            }}
                          >
                            {isAdding ? (
                              <QuickAddForm
                                dayOfWeek={day}
                                period={period}
                                classroomId={selectedClassroomId}
                                academicYear={academicYear}
                                semester={semester}
                                subjects={subjects}
                                teachers={teachers}
                                onSave={() => { setAddingCell(null); reloadEntries(); }}
                                onCancel={() => setAddingCell(null)}
                              />
                            ) : entry ? (
                              <AdminEntryCell
                                entry={entry}
                                deleting={deletingId === entry.id}
                                onDelete={() => handleDelete(entry.id)}
                              />
                            ) : (
                              <button
                                onClick={() => setAddingCell({ day, period })}
                                style={{
                                  width: '100%',
                                  height: 68,
                                  background: 'transparent',
                                  border: '1px dashed var(--rule)',
                                  borderRadius: 6,
                                  cursor: 'pointer',
                                  color: 'var(--ink-4)',
                                  fontSize: 18,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 150ms',
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.borderColor = 'var(--warm-border)';
                                  e.currentTarget.style.color = 'var(--warm-text)';
                                  e.currentTarget.style.background = 'var(--warm-fill)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.borderColor = 'var(--rule)';
                                  e.currentTarget.style.color = 'var(--ink-4)';
                                  e.currentTarget.style.background = 'transparent';
                                }}
                                title="Thêm tiết học"
                              >
                                <Plus size={14} />
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    {period === 5 && (
                      <tr key="lunch">
                        <td colSpan={DAY_ORDER.length + 1} style={{
                          padding: '4px 12px',
                          background: 'var(--bg-surface-3)',
                          textAlign: 'center',
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: 'var(--ink-3)',
                          borderBottom: '1px solid var(--rule)',
                        }}>
                          Nghỉ trưa · 11:05 – 13:00
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Generate Modal */}
      <GenerateModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onSuccess={reloadEntries}
      />
    </div>
  );
}

interface AdminEntryCellProps {
  entry: TimetableEntry;
  deleting: boolean;
  onDelete: () => void;
}

function AdminEntryCell({ entry, deleting, onDelete }: AdminEntryCellProps) {
  const [hovered, setHovered] = useState(false);
  const bgColor = entry.subjectColor ? `${entry.subjectColor}22` : 'var(--blue-fill)';
  const borderColor = entry.subjectColor ? `${entry.subjectColor}55` : 'var(--blue-border)';
  const textColor = entry.subjectColor || 'var(--blue-text)';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 6,
        padding: '5px 7px',
        minHeight: 68,
        position: 'relative',
        transition: 'box-shadow 150ms',
        boxShadow: hovered ? 'var(--shadow-sm)' : 'none',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: textColor, lineHeight: 1.3, marginBottom: 2 }}>
        {entry.subjectName}
      </div>
      {entry.teacherName && (
        <div style={{ fontSize: 10, color: textColor, opacity: 0.8 }}>
          {entry.teacherName}
        </div>
      )}
      <div style={{ fontSize: 10, color: textColor, opacity: 0.6 }}>
        {entry.subjectCode}
      </div>

      {hovered && (
        <button
          onClick={onDelete}
          disabled={deleting}
          style={{
            position: 'absolute',
            top: 3,
            right: 3,
            background: 'var(--red-fill)',
            border: '1px solid var(--red-border)',
            borderRadius: 4,
            padding: '2px 4px',
            cursor: 'pointer',
            color: 'var(--red-text)',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Xoá tiết"
        >
          {deleting ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
        </button>
      )}
    </div>
  );
}

// ─── Tab: Swap Requests ────────────────────────────────────────────────────────

function SwapRequestsTab() {
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<SwapRequest['status'] | ''>('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);

  const loadSwaps = useCallback(async () => {
    setLoading(true);
    try {
      const data = await timetableApi.getMySwaps();
      setSwaps(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSwaps(); }, [loadSwaps]);

  const filtered = useMemo(() =>
    filterStatus ? swaps.filter(s => s.status === filterStatus) : swaps,
    [swaps, filterStatus]
  );

  const handleApprove = async (id: string) => {
    if (!confirm('Duyệt yêu cầu đổi lịch này?')) return;
    setProcessing(id);
    try {
      await timetableApi.approveSwap(id);
      loadSwaps();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Có lỗi xảy ra');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModalId) return;
    setProcessing(rejectModalId);
    try {
      await timetableApi.rejectSwap(rejectModalId, reviewNote || undefined);
      setRejectModalId(null);
      setReviewNote('');
      loadSwaps();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Có lỗi xảy ra');
    } finally {
      setProcessing(null);
    }
  };

  const pendingCount = swaps.filter(s => s.status === 'PENDING').length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink-1)', margin: 0 }}>Yêu cầu đổi lịch</h2>
            {pendingCount > 0 && (
              <span style={{
                background: 'var(--amber-fill)',
                border: '1px solid var(--amber-border)',
                color: 'var(--amber-text)',
                borderRadius: 12,
                padding: '1px 8px',
                fontSize: 11,
                fontWeight: 700,
              }}>
                {pendingCount} chờ duyệt
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>Duyệt hoặc từ chối các yêu cầu đổi lịch dạy</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="input-field">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as SwapRequest['status'] | '')}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--ink-1)' }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Từ chối</option>
              <option value="CANCELLED">Đã huỷ</option>
            </select>
          </div>
          <button onClick={loadSwaps} className="btn btn-ghost btn-sm" title="Làm mới">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={24} /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Người yêu cầu</th>
                <th>Tiết cần đổi</th>
                <th>Đổi với GV</th>
                <th>Tiết đổi sang</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
                <th>Ngày gửi</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--ink-3)' }}>
                    Không có yêu cầu nào
                  </td>
                </tr>
              )}
              {filtered.map(swap => (
                <tr key={swap.id}>
                  <td style={{ fontWeight: 500, color: 'var(--ink-1)', fontSize: 13 }}>
                    {swap.requesterName}
                  </td>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-1)' }}>{swap.requesterEntry.subjectName}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                      {DAY_LABELS[swap.requesterEntry.dayOfWeek]}, Tiết {swap.requesterEntry.period}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>
                      {swap.requesterEntry.classroomName}
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--ink-2)' }}>{swap.targetTeacherName}</td>
                  <td>
                    {swap.targetEntry ? (
                      <>
                        <div style={{ fontSize: 13, color: 'var(--ink-1)' }}>{swap.targetEntry.subjectName}</div>
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
                      <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2, maxWidth: 120 }}>{swap.reviewNote}</div>
                    )}
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                    {new Date(swap.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    {swap.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => handleApprove(swap.id)}
                          disabled={processing === swap.id}
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--green-text)' }}
                          title="Duyệt"
                        >
                          {processing === swap.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                        </button>
                        <button
                          onClick={() => setRejectModalId(swap.id)}
                          disabled={processing === swap.id}
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--red-text)' }}
                          title="Từ chối"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject with note modal */}
      <Modal
        open={!!rejectModalId}
        onClose={() => { setRejectModalId(null); setReviewNote(''); }}
        title="Từ chối yêu cầu đổi lịch"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label>Lý do từ chối (tuỳ chọn)</label>
            <textarea
              className="mt-1 w-full rounded-lg px-3 py-2 text-sm resize-none"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--rule-md)',
                color: 'var(--ink-1)',
                minHeight: 80,
                fontFamily: 'var(--font-sans)',
              }}
              placeholder="Nhập lý do từ chối..."
              value={reviewNote}
              onChange={e => setReviewNote(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { setRejectModalId(null); setReviewNote(''); }}
              className="btn btn-secondary btn-sm flex-1"
            >
              Huỷ
            </button>
            <button
              onClick={handleReject}
              disabled={!!processing}
              className="btn btn-sm flex-1 gap-1"
              style={{ background: 'var(--red-text)', color: '#fff', border: 'none', borderRadius: 6 }}
            >
              {processing ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
              Từ chối
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── AdminTimetablePage ────────────────────────────────────────────────────────

type TabKey = 'subjects' | 'teachers' | 'curriculum' | 'timetable' | 'swaps';

const TABS: Array<{ key: TabKey; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { key: 'subjects',   label: 'Môn học',            icon: BookOpen },
  { key: 'teachers',   label: 'Phân công GV',       icon: Users },
  { key: 'curriculum', label: 'Chương trình học',   icon: LayoutGrid },
  { key: 'timetable',  label: 'Thời khoá biểu',     icon: CalendarDays },
  { key: 'swaps',      label: 'Yêu cầu đổi lịch',  icon: ArrowLeftRight },
];

export function AdminTimetablePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('subjects');

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div
          style={{
            width: 38,
            height: 38,
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
          <h1 className="font-serif" style={{ fontSize: 24, fontWeight: 600, color: 'var(--ink-1)', margin: 0 }}>
            Quản lý thời khoá biểu
          </h1>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
            Môn học, phân công giáo viên và lịch học toàn trường
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 2,
          background: 'var(--bg-surface-2)',
          borderRadius: 10,
          padding: 4,
          marginBottom: 24,
          width: 'fit-content',
        }}
      >
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 7,
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--ink-1)' : 'var(--ink-3)',
                background: isActive ? 'var(--bg-surface)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                transition: 'all 150ms ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'subjects'   && <SubjectsTab />}
      {activeTab === 'teachers'   && <TeacherAssignmentsTab />}
      {activeTab === 'curriculum' && <CurriculumTab />}
      {activeTab === 'timetable'  && <TimetableTab />}
      {activeTab === 'swaps'      && <SwapRequestsTab />}
    </div>
  );
}
