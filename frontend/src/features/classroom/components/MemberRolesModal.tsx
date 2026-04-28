import { useState } from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { Modal } from '@/shared/components/Modal';
import { classroomApi } from '../api';
import {
  ALL_DELEGATED_PERMISSIONS,
  ASSIGNABLE_EXTRA_ROLES,
  PERMISSION_LABELS,
  ROLE_LABELS,
  type ClassroomMember,
  type DelegatedPermission,
  type MemberRole,
} from '../types';

interface MemberRolesModalProps {
  classroomId: string;
  member: ClassroomMember;
  onClose: () => void;
  onSaved: (updated: ClassroomMember) => void;
}

/**
 * Lets a teacher (or above) configure the secondary roles and explicitly
 * delegated permissions of a single member. Primary role is shown read-only;
 * change it via the role-promotion dropdown elsewhere.
 */
export function MemberRolesModal({ classroomId, member, onClose, onSaved }: MemberRolesModalProps) {
  const [extraRoles, setExtraRoles] = useState<MemberRole[]>(member.extraRoles ?? []);
  const [permissions, setPermissions] = useState<DelegatedPermission[]>(
    member.delegatedPermissions ?? [],
  );
  const [saving, setSaving] = useState(false);

  const toggleRole = (role: MemberRole) => {
    setExtraRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const togglePermission = (p: DelegatedPermission) => {
    setPermissions((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await classroomApi.updateMemberExtras(
        classroomId,
        member.memberId,
        { extraRoles, delegatedPermissions: permissions },
      );
      onSaved(updated);
      onClose();
    } catch (err: unknown) {
      alert(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Có lỗi xảy ra',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={`Phân vai trò: ${member.displayName}`}>
      <div className="space-y-5">
        <div>
          <p className="text-label flex items-center gap-1.5 mb-2">
            <Shield size={13} /> Vai trò chính
          </p>
          <p className="text-sm text-ink-2">
            {ROLE_LABELS[member.role]}{' '}
            <span className="text-ink-3 text-xs">(sửa ở danh sách thành viên)</span>
          </p>
        </div>

        <div>
          <p className="text-label flex items-center gap-1.5 mb-2">
            <Sparkles size={13} /> Vai trò phụ
          </p>
          <p className="text-xs text-ink-3 mb-3">
            Học sinh có thể giữ nhiều vai trò cùng lúc (ví dụ vừa lớp phó học tập vừa tổ trưởng).
          </p>
          <div className="flex flex-wrap gap-2">
            {ASSIGNABLE_EXTRA_ROLES.filter((r) => r !== member.role).map((role) => {
              const active = extraRoles.includes(role);
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    active
                      ? 'bg-warm-400 text-white border-warm-400'
                      : 'bg-transparent text-ink-2 border-rule hover:border-warm-400'
                  }`}
                  style={
                    active
                      ? { background: 'var(--warm-400)', borderColor: 'var(--warm-400)' }
                      : {}
                  }
                >
                  {ROLE_LABELS[role]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-label mb-2">Quyền được uỷ quyền</p>
          <p className="text-xs text-ink-3 mb-3">
            Cho phép học sinh trực tiếp quản lý dù không giữ vai trò mặc định.
          </p>
          <div className="space-y-2">
            {ALL_DELEGATED_PERMISSIONS.map((p) => {
              const active = permissions.includes(p);
              return (
                <label
                  key={p}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-md border border-rule cursor-pointer hover:bg-bg-surface-2"
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => togglePermission(p)}
                  />
                  <span className="text-sm text-ink-1">{PERMISSION_LABELS[p]}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-rule">
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary btn-sm"
          >
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
