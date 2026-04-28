import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Check, Calendar, ClipboardList, Trash2, Pencil, X } from 'lucide-react';
import { dutyApi } from '../api';
import { Badge } from '@/shared/components/Badge';
import { classroomApi } from '@/features/classroom/api';
import { permissionsOf } from '@/features/classroom/permissions';
import { RoleBadges } from '@/features/classroom/components/RoleBadges';
import type { ClassroomMember } from '@/features/classroom/types';
import { useAuthStore } from '@/app/store';
import {
  DUTY_STATUS_LABELS,
  DUTY_STATUS_VARIANT,
  type DutyAssignment,
  type DutyType,
} from '../types';

const todayDate = () => new Date().toISOString().slice(0, 10);

function showError(err: unknown) {
  alert(
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      'Có lỗi xảy ra',
  );
}

export function DutyPage() {
  const { classroomId } = useParams<{ classroomId: string }>();
  const userId = useAuthStore((s) => s.user?.id);
  const [activeTab, setActiveTab] = useState<'assignments' | 'types'>('assignments');

  const [assignments, setAssignments] = useState<DutyAssignment[]>([]);
  const [dutyTypes, setDutyTypes] = useState<DutyType[]>([]);
  const [members, setMembers] = useState<ClassroomMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(todayDate());

  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignForm, setAssignForm] = useState({
    dutyTypeId: '',
    assignedToId: '',
    dutyDate: todayDate(),
    note: '',
  });
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [showTypeForm, setShowTypeForm] = useState(false);
  const [typeForm, setTypeForm] = useState({ name: '', description: '' });
  const [typeSubmitting, setTypeSubmitting] = useState(false);

  useEffect(() => {
    if (!classroomId) return;
    setLoading(true);
    Promise.all([
      dutyApi.listAssignments(classroomId, dateFilter),
      dutyApi.listTypes(classroomId),
      classroomApi.listMembers(classroomId),
    ])
      .then(([a, t, m]) => {
        setAssignments(a);
        setDutyTypes(t);
        setMembers(m);
      })
      .catch(showError)
      .finally(() => setLoading(false));
  }, [classroomId, dateFilter]);

  const memberByUserId = useMemo(
    () => new Map(members.map((m) => [m.userId, m])),
    [members],
  );

  const me = useMemo(
    () => members.find((m) => m.userId === userId),
    [members, userId],
  );

  const perms = useMemo(
    () =>
      me
        ? permissionsOf(me.role, { extraRoles: me.extraRoles, delegatedPermissions: me.delegatedPermissions })
        : null,
    [me],
  );

  const canManageTypes = perms?.canManageDutyTypes ?? false;
  const canAssign = perms?.canAssignDuty ?? false;

  const handleConfirm = async (id: string) => {
    if (!classroomId) return;
    try {
      const updated = await dutyApi.confirmAssignment(classroomId, id);
      setAssignments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteAssignment = async (a: DutyAssignment) => {
    if (!classroomId || !confirm(`Xoá ca trực "${a.dutyTypeName}" ngày ${new Date(a.dutyDate).toLocaleDateString('vi-VN')}?`)) return;
    try {
      await dutyApi.deleteAssignment(classroomId, a.id);
      setAssignments((prev) => prev.filter((x) => x.id !== a.id));
    } catch (err) {
      showError(err);
    }
  };

  const handleRevertAssignment = async (a: DutyAssignment) => {
    if (!classroomId) return;
    try {
      const updated = await dutyApi.updateAssignment(classroomId, a.id, { status: 'PENDING' });
      setAssignments((prev) => prev.map((x) => (x.id === a.id ? updated : x)));
    } catch (err) {
      showError(err);
    }
  };

  const handleEditAssignment = async (a: DutyAssignment) => {
    if (!classroomId) return;
    const newDate = prompt('Sửa ngày trực (YYYY-MM-DD):', a.dutyDate);
    if (newDate == null || newDate === a.dutyDate) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      alert('Định dạng ngày không hợp lệ');
      return;
    }
    try {
      const updated = await dutyApi.updateAssignment(classroomId, a.id, { dutyDate: newDate });
      setAssignments((prev) => prev.map((x) => (x.id === a.id ? updated : x)));
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteType = async (t: DutyType) => {
    if (!classroomId || !confirm(`Xoá loại trực "${t.name}"? Mọi ca trực thuộc loại này có thể bị ảnh hưởng.`)) return;
    try {
      await dutyApi.deleteType(classroomId, t.id);
      setDutyTypes((prev) => prev.filter((x) => x.id !== t.id));
    } catch (err) {
      showError(err);
    }
  };

  const handleToggleType = async (t: DutyType) => {
    if (!classroomId) return;
    try {
      const updated = await dutyApi.updateType(classroomId, t.id, { active: !t.active });
      setDutyTypes((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
    } catch (err) {
      showError(err);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classroomId) return;
    setAssignSubmitting(true);
    try {
      const created = await dutyApi.createAssignment(classroomId, {
        dutyTypeId: assignForm.dutyTypeId,
        assignedToId: assignForm.assignedToId,
        dutyDate: assignForm.dutyDate,
        note: assignForm.note || undefined,
      });
      setAssignments((prev) => [created, ...prev]);
      setShowAssignForm(false);
      setAssignForm({ dutyTypeId: '', assignedToId: '', dutyDate: todayDate(), note: '' });
    } catch (err) {
      showError(err);
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classroomId) return;
    setTypeSubmitting(true);
    try {
      const created = await dutyApi.createType(classroomId, {
        name: typeForm.name,
        description: typeForm.description || undefined,
      });
      setDutyTypes((prev) => [...prev, created]);
      setShowTypeForm(false);
      setTypeForm({ name: '', description: '' });
    } catch (err) {
      showError(err);
    } finally {
      setTypeSubmitting(false);
    }
  };

  const renderMember = (uid: string) => {
    const m = memberByUserId.get(uid);
    if (!m) return <span className="font-mono text-xs text-ink-3">{uid.slice(0, 8)}…</span>;
    return (
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
              style={{ background: 'var(--sidebar-accent)' }}>
          {m.displayName.charAt(0).toUpperCase()}
        </span>
        <span className="font-medium text-ink-1">{m.displayName}</span>
        {m.extraRoles && m.extraRoles.length > 0 && (
          <RoleBadges primary={m.extraRoles[0]} short max={1} />
        )}
      </div>
    );
  };

  // Group assignments by date for nicer list when no specific date filter
  const groupedByDate = useMemo(() => {
    const map = new Map<string, DutyAssignment[]>();
    for (const a of assignments) {
      const list = map.get(a.dutyDate) ?? [];
      list.push(a);
      map.set(a.dutyDate, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [assignments]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-start justify-between mb-2 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Calendar size={22} className="text-ink-2" />
          <div>
            <h1 className="text-3xl font-serif font-semibold text-ink-1">Trực nhật</h1>
            <p className="text-sm text-ink-3 mt-0.5">
              Phân công và theo dõi tình hình trực nhật của lớp.
            </p>
          </div>
        </div>
        {me && (
          <div className="text-xs text-ink-3 flex items-center gap-2">
            <span>Vai trò:</span>
            <RoleBadges primary={me.role} extras={me.extraRoles ?? []} short max={2} />
          </div>
        )}
      </div>

      <div className="flex gap-1 mb-6 border-b border-rule mt-4">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'assignments'
              ? 'text-ink-1 border-b-2 border-ink-1 -mb-px'
              : 'text-ink-3 hover:text-ink-2'
          }`}
        >
          <ClipboardList size={14} /> Lịch trực
        </button>
        <button
          onClick={() => setActiveTab('types')}
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'types'
              ? 'text-ink-1 border-b-2 border-ink-1 -mb-px'
              : 'text-ink-3 hover:text-ink-2'
          }`}
        >
          <Calendar size={14} /> Loại trực
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse text-center py-10 text-ink-3">Đang tải...</div>
      ) : (
        <>
          {activeTab === 'assignments' && (
            <div>
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-3">Lọc theo ngày:</span>
                  <div className="input-field w-auto">
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => setDateFilter(todayDate())}
                    className="btn btn-ghost btn-sm"
                  >
                    Hôm nay
                  </button>
                </div>
                {canAssign ? (
                  <button
                    onClick={() => setShowAssignForm((v) => !v)}
                    className="btn btn-primary gap-2"
                    disabled={dutyTypes.length === 0 || members.length === 0}
                    title={dutyTypes.length === 0 ? 'Chưa có loại trực' : ''}
                  >
                    <Plus size={15} /> Phân công
                  </button>
                ) : (
                  <p className="text-xs text-ink-3">
                    Bạn chưa được uỷ quyền phân công trực nhật.
                  </p>
                )}
              </div>

              {showAssignForm && canAssign && (
                <div className="card mb-6">
                  <div className="card-body">
                    <h3 className="text-sm font-semibold text-ink-1 mb-4">Phân công trực nhật</h3>
                    <form onSubmit={handleCreateAssignment} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Loại trực *">
                          <select
                            value={assignForm.dutyTypeId}
                            onChange={(e) => setAssignForm((p) => ({ ...p, dutyTypeId: e.target.value }))}
                            required
                          >
                            <option value="">Chọn loại trực</option>
                            {dutyTypes.filter((t) => t.active).map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Phân công cho *">
                          <select
                            value={assignForm.assignedToId}
                            onChange={(e) => setAssignForm((p) => ({ ...p, assignedToId: e.target.value }))}
                            required
                          >
                            <option value="">Chọn thành viên</option>
                            {members
                              .filter((m) => m.role !== 'OWNER' && m.role !== 'TEACHER')
                              .map((m) => (
                                <option key={m.memberId} value={m.userId}>
                                  {m.displayName}
                                </option>
                              ))}
                          </select>
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Ngày trực *">
                          <input
                            type="date"
                            value={assignForm.dutyDate}
                            onChange={(e) => setAssignForm((p) => ({ ...p, dutyDate: e.target.value }))}
                            required
                          />
                        </Field>
                        <Field label="Ghi chú">
                          <input
                            type="text"
                            placeholder="Ghi chú (tùy chọn)"
                            value={assignForm.note}
                            onChange={(e) => setAssignForm((p) => ({ ...p, note: e.target.value }))}
                          />
                        </Field>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setShowAssignForm(false)} className="btn btn-secondary btn-sm">
                          Hủy
                        </button>
                        <button type="submit" disabled={assignSubmitting} className="btn btn-primary btn-sm">
                          {assignSubmitting ? 'Đang lưu...' : 'Phân công'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {assignments.length === 0 ? (
                <EmptyState
                  icon={<ClipboardList size={28} />}
                  title="Không có lịch trực"
                  hint={
                    canAssign
                      ? 'Nhấn "Phân công" để tạo lịch trực cho thành viên trong lớp.'
                      : 'Chưa có ai được phân công trực nhật trong ngày này.'
                  }
                />
              ) : (
                <div className="space-y-4">
                  {groupedByDate.map(([date, list]) => (
                    <div key={date} className="card overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-rule flex items-center gap-2"
                           style={{ background: 'var(--bg-surface-2)' }}>
                        <Calendar size={14} className="text-ink-3" />
                        <span className="text-sm font-semibold text-ink-1">
                          {new Date(date).toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="ml-auto text-xs text-ink-3">{list.length} ca trực</span>
                      </div>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Loại trực</th>
                            <th>Người trực</th>
                            <th>Trạng thái</th>
                            <th>Ghi chú</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {list.map((a) => (
                            <tr key={a.id}>
                              <td className="font-medium text-ink-1">{a.dutyTypeName}</td>
                              <td>{renderMember(a.assignedToId)}</td>
                              <td>
                                <Badge variant={DUTY_STATUS_VARIANT[a.status]}>
                                  {DUTY_STATUS_LABELS[a.status]}
                                </Badge>
                              </td>
                              <td className="text-ink-3 text-xs">{a.note ?? '—'}</td>
                              <td>
                                {canAssign && (
                                  <div className="flex items-center gap-1">
                                    {a.status === 'PENDING' && (
                                      <button
                                        onClick={() => handleConfirm(a.id)}
                                        className="btn btn-ghost btn-sm gap-1"
                                        style={{ color: 'var(--green-text)' }}
                                        title="Xác nhận hoàn thành"
                                      >
                                        <Check size={14} />
                                      </button>
                                    )}
                                    {a.status === 'COMPLETED' && (
                                      <button
                                        onClick={() => handleRevertAssignment(a)}
                                        className="btn btn-ghost btn-sm"
                                        title="Bỏ xác nhận"
                                      >
                                        <X size={14} />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleEditAssignment(a)}
                                      className="btn btn-ghost btn-sm"
                                      title="Sửa ngày trực"
                                    >
                                      <Pencil size={13} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAssignment(a)}
                                      className="btn btn-ghost btn-sm"
                                      style={{ color: 'var(--red-text)' }}
                                      title="Xoá"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'types' && (
            <div>
              <div className="flex justify-end mb-4">
                {canManageTypes ? (
                  <button onClick={() => setShowTypeForm((v) => !v)} className="btn btn-primary gap-2">
                    <Plus size={15} /> Thêm loại
                  </button>
                ) : (
                  <p className="text-xs text-ink-3">
                    Chỉ giáo viên hoặc người được uỷ quyền mới có thể quản lý loại trực.
                  </p>
                )}
              </div>

              {showTypeForm && canManageTypes && (
                <div className="card mb-6">
                  <div className="card-body">
                    <h3 className="text-sm font-semibold text-ink-1 mb-4">Loại trực mới</h3>
                    <form onSubmit={handleCreateType} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Tên loại trực *">
                          <input
                            type="text"
                            placeholder="VD: Trực nhật buổi sáng"
                            value={typeForm.name}
                            onChange={(e) => setTypeForm((p) => ({ ...p, name: e.target.value }))}
                            required
                          />
                        </Field>
                        <Field label="Mô tả">
                          <input
                            type="text"
                            placeholder="Mô tả (tùy chọn)"
                            value={typeForm.description}
                            onChange={(e) => setTypeForm((p) => ({ ...p, description: e.target.value }))}
                          />
                        </Field>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setShowTypeForm(false)} className="btn btn-secondary btn-sm">
                          Hủy
                        </button>
                        <button type="submit" disabled={typeSubmitting} className="btn btn-primary btn-sm">
                          {typeSubmitting ? 'Đang lưu...' : 'Thêm'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {dutyTypes.length === 0 ? (
                <EmptyState
                  icon={<Calendar size={28} />}
                  title="Chưa có loại trực"
                  hint="Thêm loại trực để bắt đầu phân công (VD: Trực lớp, Lau bảng, Tưới cây)."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dutyTypes.map((t) => (
                    <div key={t.id} className="card card-body flex flex-col gap-2">
                      <h4 className="font-medium text-ink-1">{t.name}</h4>
                      {t.description && (
                        <p className="text-xs text-ink-3 line-clamp-2">{t.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-rule">
                        <Badge variant={t.active ? 'green' : 'red'}>
                          {t.active ? 'Đang hoạt động' : 'Đã tắt'}
                        </Badge>
                        {canManageTypes && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleType(t)}
                              className="btn btn-ghost btn-sm text-xs"
                              title={t.active ? 'Tạm tắt' : 'Kích hoạt lại'}
                            >
                              {t.active ? 'Tắt' : 'Bật'}
                            </button>
                            <button
                              onClick={() => handleDeleteType(t)}
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--red-text)' }}
                              title="Xoá"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
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
      <p className="text-xs text-ink-3 max-w-xs">{hint}</p>
    </div>
  );
}
