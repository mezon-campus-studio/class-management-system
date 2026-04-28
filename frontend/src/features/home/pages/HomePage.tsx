import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, ArrowRight, Link as LinkIcon, BookOpen } from 'lucide-react';
import { classroomApi } from '@/features/classroom/api';
import { Modal } from '@/shared/components/Modal';
import { Spinner } from '@/shared/components/Spinner';
import { Badge } from '@/shared/components/Badge';
import type { Classroom } from '@/features/classroom/types';
import { ROLE_LABELS } from '@/features/classroom/types';
import { useAuthStore } from '@/app/store';

export function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const canCreateClassroom = user?.userType === 'TEACHER' || user?.userType === 'STUDENT';
  const isStudent = user?.userType === 'STUDENT';
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '', maxMembers: 100 });
  const [joinCode, setJoinCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    classroomApi.list()
      .then(setClassrooms)
      .catch(() => setError('Không thể tải danh sách lớp học'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!createForm.name.trim()) return;
    setSubmitting(true);
    setFormError('');
    try {
      const c = await classroomApi.create(createForm);
      setClassrooms((prev) => [c, ...prev]);
      setCreateOpen(false);
      setCreateForm({ name: '', description: '', maxMembers: 100 });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg ?? 'Tạo lớp thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setSubmitting(true);
    setFormError('');
    try {
      const c = await classroomApi.join(joinCode.trim());
      setClassrooms((prev) => [c, ...prev]);
      setJoinOpen(false);
      setJoinCode('');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg ?? 'Mã mời không hợp lệ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size={32} style={{ color: 'var(--ink-blue-text)' }} />
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-8">
      {/* Header row */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-serif font-semibold text-ink-1">Lớp học của tôi</h1>
          <p className="text-sm text-ink-3 mt-1">{classrooms.length} lớp đang tham gia</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setJoinOpen(true); setFormError(''); }} className="btn btn-secondary gap-2">
            <LinkIcon size={15} /> Nhập mã mời
          </button>
          {canCreateClassroom && (
            <button onClick={() => { setCreateOpen(true); setFormError(''); }} className="btn btn-warm gap-2">
              <Plus size={15} /> Tạo lớp
            </button>
          )}
        </div>
      </div>

      {isStudent && user?.studentCode && (
        <div className="card card-body mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-label mb-1">Mã học sinh của bạn</p>
            <p className="text-xs text-ink-3">Chia sẻ mã này với phụ huynh để họ liên kết tài khoản theo dõi.</p>
          </div>
          <code className="text-base font-mono tracking-[0.2em] font-semibold px-3 py-2 rounded"
                style={{ background: 'var(--bg-surface-2)', color: 'var(--ink-1)' }}>
            {user.studentCode}
          </code>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg mb-6 text-sm" style={{ background: 'var(--red-fill)', color: 'var(--red-text)' }}>
          {error}
        </div>
      )}

      {classrooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'var(--bg-surface-2)' }}>
            <BookOpen size={36} style={{ color: 'var(--ink-3)' }} />
          </div>
          <h2 className="text-2xl font-serif font-semibold text-ink-1">Chưa có lớp nào</h2>
          <p className="text-ink-3 mt-2 max-w-sm text-sm">Tạo lớp mới hoặc tham gia bằng mã mời từ giáo viên của bạn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {classrooms.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/classrooms/${c.id}`)}
              className="card cursor-pointer hover:shadow-md transition-shadow group"
            >
              <div className="h-24 flex items-end p-4 relative overflow-hidden"
                   style={{ background: c.coverImageUrl ? `url(${c.coverImageUrl}) center/cover` : 'linear-gradient(135deg, var(--sidebar-bg) 0%, #3D2C24 100%)' }}>
                <span className="text-white font-serif font-semibold text-lg leading-tight line-clamp-2 drop-shadow-sm">
                  {c.name}
                </span>
              </div>
              <div className="card-body space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={c.myRole === 'OWNER' || c.myRole === 'TEACHER' ? 'amber' : 'blue'}>
                    {ROLE_LABELS[c.myRole]}
                  </Badge>
                  <span className="text-xs text-ink-3 flex items-center gap-1">
                    <Users size={12} /> {c.memberCount}/{c.maxMembers}
                  </span>
                </div>
                {c.description && (
                  <p className="text-xs text-ink-3 line-clamp-2">{c.description}</p>
                )}
                <div className="flex items-center justify-end pt-1">
                  <span className="text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                        style={{ color: 'var(--warm-400)' }}>
                    Vào lớp <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Tạo lớp học mới">
        <div className="space-y-4">
          {formError && (
            <p className="text-xs font-medium p-2 rounded" style={{ background: 'var(--red-fill)', color: 'var(--red-text)' }}>
              {formError}
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="input-label">Tên lớp *</label>
            <div className="input-field">
              <input type="text" placeholder="VD: Toán 12A1" value={createForm.name}
                     onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="input-label">Mô tả</label>
            <div className="input-field">
              <input type="text" placeholder="Mô tả ngắn về lớp học" value={createForm.description}
                     onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="input-label">Số thành viên tối đa</label>
            <div className="input-field">
              <input type="number" min={2} max={500} value={createForm.maxMembers}
                     onChange={(e) => setCreateForm((p) => ({ ...p, maxMembers: +e.target.value }))} />
            </div>
          </div>
          <div className="card-footer -mx-4 -mb-4 px-4 mt-4">
            <button onClick={() => setCreateOpen(false)} className="btn btn-secondary btn-sm">Hủy</button>
            <button onClick={handleCreate} disabled={submitting || !createForm.name.trim()} className="btn btn-warm btn-sm">
              {submitting ? <Spinner size={14} className="text-white" /> : 'Tạo lớp'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Join modal */}
      <Modal open={joinOpen} onClose={() => setJoinOpen(false)} title="Tham gia bằng mã mời" size="sm">
        <div className="space-y-4">
          {formError && (
            <p className="text-xs font-medium p-2 rounded" style={{ background: 'var(--red-fill)', color: 'var(--red-text)' }}>
              {formError}
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="input-label">Mã mời</label>
            <div className="input-field">
              <input type="text" placeholder="VD: AB3XY7QP" value={joinCode}
                     onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                     className="tracking-widest font-mono text-center text-lg uppercase" />
            </div>
          </div>
          <div className="card-footer -mx-4 -mb-4 px-4 mt-4">
            <button onClick={() => setJoinOpen(false)} className="btn btn-secondary btn-sm">Hủy</button>
            <button onClick={handleJoin} disabled={submitting || !joinCode.trim()} className="btn btn-primary btn-sm">
              {submitting ? <Spinner size={14} className="text-white" /> : 'Tham gia'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
