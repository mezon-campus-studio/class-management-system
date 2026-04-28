export type ClassroomStatus = 'ACTIVE' | 'ARCHIVED';

export type MemberRole =
  | 'OWNER'
  | 'TEACHER'
  | 'MONITOR'
  | 'VICE_MONITOR'
  | 'STUDY_VICE_MONITOR'
  | 'ARTS_VICE_MONITOR'
  | 'LABOR_VICE_MONITOR'
  | 'DISCIPLINE_OFFICER'
  | 'GROUP_LEADER'
  | 'TREASURER'
  | 'SECRETARY'
  | 'MEMBER';

export type DelegatedPermission =
  | 'MANAGE_EMULATION_CATEGORIES'
  | 'MANAGE_EMULATION_ENTRIES'
  | 'MANAGE_DUTY_TYPES'
  | 'MANAGE_DUTY_ASSIGNMENTS';

export interface Classroom {
  id: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  inviteCode: string;
  inviteCodeExpiresAt: string | null;
  ownerId: string;
  maxMembers: number;
  memberCount: number;
  status: ClassroomStatus;
  myRole: MemberRole;
  createdAt: string;
}

export interface ClassroomMember {
  memberId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: MemberRole;
  extraRoles: MemberRole[];
  delegatedPermissions: DelegatedPermission[];
  joinedAt: string;
}

export const ROLE_LABELS: Record<MemberRole, string> = {
  OWNER: 'Chủ lớp',
  TEACHER: 'Giáo viên',
  MONITOR: 'Lớp trưởng',
  VICE_MONITOR: 'Lớp phó',
  STUDY_VICE_MONITOR: 'Lớp phó học tập',
  ARTS_VICE_MONITOR: 'Lớp phó văn thể mỹ',
  LABOR_VICE_MONITOR: 'Lớp phó lao động',
  DISCIPLINE_OFFICER: 'Sao đỏ',
  GROUP_LEADER: 'Tổ trưởng',
  TREASURER: 'Thủ quỹ',
  SECRETARY: 'Thư ký',
  MEMBER: 'Thành viên',
};

/** Short-form labels suitable for badges next to a name in chat / lists. */
export const ROLE_SHORT_LABELS: Record<MemberRole, string> = {
  OWNER: 'Chủ lớp',
  TEACHER: 'GV',
  MONITOR: 'Lớp trưởng',
  VICE_MONITOR: 'Lớp phó',
  STUDY_VICE_MONITOR: 'LP học tập',
  ARTS_VICE_MONITOR: 'LP văn thể mỹ',
  LABOR_VICE_MONITOR: 'LP lao động',
  DISCIPLINE_OFFICER: 'Sao đỏ',
  GROUP_LEADER: 'Tổ trưởng',
  TREASURER: 'Thủ quỹ',
  SECRETARY: 'Thư ký',
  MEMBER: 'Thành viên',
};

export const PERMISSION_LABELS: Record<DelegatedPermission, string> = {
  MANAGE_EMULATION_CATEGORIES: 'Quản lý hạng mục thi đua',
  MANAGE_EMULATION_ENTRIES: 'Ghi điểm thi đua',
  MANAGE_DUTY_TYPES: 'Quản lý loại trực nhật',
  MANAGE_DUTY_ASSIGNMENTS: 'Phân công trực nhật',
};

/** Roles a teacher can grant as an extra role to a student member. */
export const ASSIGNABLE_EXTRA_ROLES: MemberRole[] = [
  'MONITOR',
  'VICE_MONITOR',
  'STUDY_VICE_MONITOR',
  'ARTS_VICE_MONITOR',
  'LABOR_VICE_MONITOR',
  'DISCIPLINE_OFFICER',
  'GROUP_LEADER',
  'TREASURER',
  'SECRETARY',
];

export const ALL_DELEGATED_PERMISSIONS: DelegatedPermission[] = [
  'MANAGE_EMULATION_CATEGORIES',
  'MANAGE_EMULATION_ENTRIES',
  'MANAGE_DUTY_TYPES',
  'MANAGE_DUTY_ASSIGNMENTS',
];
