import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, ClipboardList, Copy, RefreshCw, LogOut, Star, Wrench, FolderOpen, Wallet, Calendar, MessageCircle, Armchair, GraduationCap, UserX, Settings2 } from 'lucide-react';
import { classroomApi } from '../api';
import { Badge } from '@/shared/components/Badge';
import { Spinner } from '@/shared/components/Spinner';
import { ROLE_LABELS, ASSIGNABLE_EXTRA_ROLES, type Classroom, type ClassroomMember, type MemberRole } from '../types';
import { permissionsOf, ROLE_VARIANT } from '../permissions';
import { RoleBadges } from '../components/RoleBadges';
import { MemberRolesModal } from '../components/MemberRolesModal';
import { useAuthStore } from '@/app/store';

export function ClassroomDetailPage() {
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [members, setMembers] = useState<ClassroomMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'members'>('overview');
  const [copied, setCopied] = useState(false);
  const [editingMember, setEditingMember] = useState<ClassroomMember | null>(null);

  useEffect(() => {
    if (!classroomId) return;
    Promise.all([classroomApi.get(classroomId), classroomApi.listMembers(classroomId)])
      .then(([c, m]) => { setClassroom(c); setMembers(m); })
      .finally(() => setLoading(false));
  }, [classroomId]);

  const copyCode = () => {
    if (!classroom) return;
    navigator.clipboard.writeText(classroom.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateCode = async () => {
    if (!classroomId) return;
    const code = await classroomApi.regenerateCode(classroomId);
    setClassroom((prev) => prev ? { ...prev, inviteCode: code } : prev);
  };

  const handleLeave = async () => {
    if (!classroomId || !confirm('Bạn có chắc muốn rời lớp này?')) return;
    await classroomApi.leave(classroomId);
    navigate('/');
  };

  const handleRemoveMember = async (m: ClassroomMember) => {
    if (!classroomId || !confirm(`Xoá "${m.displayName}" khỏi lớp?`)) return;
    await classroomApi.removeMember(classroomId, m.memberId);
    setMembers((prev) => prev.filter((x) => x.memberId !== m.memberId));
    setClassroom((prev) => prev ? { ...prev, memberCount: prev.memberCount - 1 } : prev);
  };

  const handleChangeRole = async (m: ClassroomMember, role: MemberRole) => {
    if (!classroomId || role === m.role) return;
    try {
      const updated = await classroomApi.updateMemberRole(classroomId, m.memberId, role);
      setMembers((prev) => prev.map((x) => (x.memberId === m.memberId ? updated : x)));
    } catch (err: unknown) {
      alert(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Có lỗi xảy ra',
      );
    }
  };

  if (loading) return (
    <div className="flex justify-center py-32"><Spinner size={32} /></div>
  );
  if (!classroom) return (
    <div className="text-center py-32 text-ink-3">Không tìm thấy lớp học</div>
  );

  const perms = permissionsOf(classroom.myRole);
  const canManage = perms.canManageInviteCode;

  const modules = [
    { icon: <Armchair size={22} />,      label: 'Sơ đồ lớp',  to: 'seating',   show: true },
    { icon: <ClipboardList size={22} />, label: 'Điểm danh', to: 'attendance', show: true },
    { icon: <MessageCircle size={22} />, label: 'Trò chuyện', to: 'chat', show: true },
    { icon: <Star size={22} />,          label: 'Thi đua',    to: 'emulation', show: true },
    { icon: <Wrench size={22} />,        label: 'Trực nhật',  to: 'duty',      show: true },
    { icon: <Wallet size={22} />,        label: 'Quỹ lớp',    to: 'fund',      show: true },
    { icon: <FolderOpen size={22} />,    label: 'Tài liệu',   to: 'documents', show: true },
    { icon: <Calendar size={22} />,      label: 'Sự kiện',    to: 'events',    show: true },
    { icon: <GraduationCap size={22} />, label: 'Học sinh',   to: 'students',  show: perms.canEditClassroom },
  ].filter((m) => m.show);

  return (
    <div className="w-full px-6 py-8">
      {/* Header */}
      <div className="card mb-6">
        <div className="h-32 relative overflow-hidden flex items-end p-5"
             style={{ background: 'linear-gradient(135deg, var(--sidebar-bg) 0%, #3D2C24 100%)' }}>
          <h1 className="text-white font-serif font-semibold text-2xl drop-shadow">{classroom.name}</h1>
        </div>
        <div className="card-body flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge variant={ROLE_VARIANT[classroom.myRole]}>{ROLE_LABELS[classroom.myRole]}</Badge>
            <span className="text-xs text-ink-3 flex items-center gap-1">
              <Users size={12} /> {classroom.memberCount}/{classroom.maxMembers} thành viên
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/classrooms/${classroomId}/attendance`}
                  className="btn btn-secondary btn-sm gap-1.5">
              <ClipboardList size={13} /> Điểm danh
            </Link>
            {classroom.myRole !== 'OWNER' && (
              <button onClick={handleLeave} className="btn btn-ghost btn-sm text-red-600 gap-1.5">
                <LogOut size={13} /> Rời lớp
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-rule pb-0">
        {(['overview', 'members'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'border-warm-400 text-ink-1'
                : 'border-transparent text-ink-3 hover:text-ink-2'
            }`}
            style={tab === t ? { borderColor: 'var(--warm-400)' } : {}}
          >
            {t === 'overview' ? 'Tổng quan' : `Thành viên (${members.length})`}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          {classroom.description && (
            <div className="card card-body">
              <p className="text-sm text-ink-2">{classroom.description}</p>
            </div>
          )}

          {/* Module navigation grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {modules.map(({ icon, label, to }) => (
              <Link
                key={to}
                to={`/classrooms/${classroomId}/${to}`}
                className="card card-body flex flex-col items-center gap-2 py-5 hover:shadow-md transition-shadow text-center"
                style={{ color: 'var(--ink-2)' }}
              >
                <span style={{ color: 'var(--sidebar-accent)' }}>{icon}</span>
                <span className="text-sm font-medium text-ink-1">{label}</span>
              </Link>
            ))}
          </div>

          {canManage && (
            <div className="card card-body">
              <p className="text-label mb-3">Mã mời lớp học</p>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-center text-xl font-mono tracking-[0.3em] font-semibold py-3 rounded-lg"
                      style={{ background: 'var(--bg-surface-2)', color: 'var(--ink-1)' }}>
                  {classroom.inviteCode}
                </code>
                <button onClick={copyCode} className="btn btn-secondary btn-sm gap-1.5">
                  <Copy size={13} /> {copied ? 'Đã sao chép!' : 'Sao chép'}
                </button>
                <button onClick={handleRegenerateCode} className="btn btn-ghost btn-sm" title="Tạo mã mới">
                  <RefreshCw size={14} />
                </button>
              </div>
              {classroom.inviteCodeExpiresAt && (
                <p className="text-xs text-ink-3 mt-2">
                  Hết hạn: {new Date(classroom.inviteCodeExpiresAt).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'members' && (() => {
        const TEACHER_ROLES = new Set<MemberRole>(['OWNER', 'TEACHER']);
        const teachers = members.filter((m) => TEACHER_ROLES.has(m.role));
        const students = members.filter((m) => !TEACHER_ROLES.has(m.role));

        const canRemove = perms.canDelete;
        const canManageRoles = perms.canEditClassroom;

        const MemberRow = ({ m }: { m: ClassroomMember }) => {
          const isStudent = !TEACHER_ROLES.has(m.role);
          return (
          <tr key={m.memberId}>
            <td>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
                     style={{ background: 'var(--sidebar-accent)' }}>
                  {m.displayName.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{m.displayName}</span>
              </div>
            </td>
            <td>
              {canManageRoles && isStudent ? (
                <div className="input-field w-auto inline-block">
                  <select
                    value={m.role}
                    onChange={(e) => handleChangeRole(m, e.target.value as MemberRole)}
                  >
                    <option value="MEMBER">{ROLE_LABELS.MEMBER}</option>
                    {ASSIGNABLE_EXTRA_ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <Badge variant={ROLE_VARIANT[m.role]}>{ROLE_LABELS[m.role]}</Badge>
              )}
            </td>
            <td>
              {m.extraRoles && m.extraRoles.length > 0 ? (
                <RoleBadges primary={m.extraRoles[0]} extras={m.extraRoles.slice(1)} short max={3} />
              ) : (
                <span className="text-ink-3 text-xs">—</span>
              )}
            </td>
            <td className="text-ink-3 text-xs">
              {new Date(m.joinedAt).toLocaleDateString('vi-VN')}
            </td>
            <td>
              <div className="flex items-center gap-1">
                {canManageRoles && isStudent && (
                  <button
                    onClick={() => setEditingMember(m)}
                    className="btn btn-ghost btn-sm"
                    title="Vai trò phụ & uỷ quyền"
                  >
                    <Settings2 size={13} />
                  </button>
                )}
                {canRemove && m.role !== 'OWNER' && m.userId !== currentUserId && (
                  <button
                    onClick={() => handleRemoveMember(m)}
                    className="btn btn-ghost btn-sm"
                    title="Xoá khỏi lớp"
                    style={{ color: 'var(--red-text)' }}
                  >
                    <UserX size={13} />
                  </button>
                )}
              </div>
            </td>
          </tr>
          );
        };

        return (
          <div className="space-y-4">
            {/* Teachers */}
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-rule flex items-center gap-2"
                   style={{ background: 'var(--bg-surface-2)' }}>
                <GraduationCap size={15} style={{ color: 'var(--warm-400)' }} />
                <span className="text-xs font-semibold text-ink-2 uppercase tracking-wide">
                  Giáo viên
                </span>
                <span className="ml-auto text-xs text-ink-3">{teachers.length} người</span>
              </div>
              {teachers.length === 0 ? (
                <p className="px-4 py-6 text-sm text-ink-3 text-center">Chưa có giáo viên</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tên</th>
                      <th>Vai trò chính</th>
                      <th>Vai trò phụ</th>
                      <th>Ngày tham gia</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((m) => <MemberRow key={m.memberId} m={m} />)}
                  </tbody>
                </table>
              )}
            </div>

            {/* Students */}
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-rule flex items-center gap-2"
                   style={{ background: 'var(--bg-surface-2)' }}>
                <Users size={15} style={{ color: 'var(--sidebar-accent)' }} />
                <span className="text-xs font-semibold text-ink-2 uppercase tracking-wide">
                  Học sinh
                </span>
                <span className="ml-auto text-xs text-ink-3">{students.length} người</span>
              </div>
              {students.length === 0 ? (
                <p className="px-4 py-6 text-sm text-ink-3 text-center">Chưa có học sinh</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tên</th>
                      <th>Vai trò chính</th>
                      <th>Vai trò phụ</th>
                      <th>Ngày tham gia</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((m) => <MemberRow key={m.memberId} m={m} />)}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      })()}

      {editingMember && classroomId && (
        <MemberRolesModal
          classroomId={classroomId}
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSaved={(updated) =>
            setMembers((prev) => prev.map((x) => (x.memberId === updated.memberId ? updated : x)))
          }
        />
      )}
    </div>
  );
}
