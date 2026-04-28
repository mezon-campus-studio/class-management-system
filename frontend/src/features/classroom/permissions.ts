import type { ClassroomMember, DelegatedPermission, MemberRole } from './types';

const RANK: Record<MemberRole, number> = {
  OWNER: 100,
  TEACHER: 90,
  MONITOR: 70,
  VICE_MONITOR: 60,
  STUDY_VICE_MONITOR: 60,
  ARTS_VICE_MONITOR: 60,
  LABOR_VICE_MONITOR: 60,
  DISCIPLINE_OFFICER: 45,
  GROUP_LEADER: 40,
  SECRETARY: 40,
  TREASURER: 40,
  MEMBER: 10,
};

export function rankOf(role: MemberRole): number {
  return RANK[role] ?? 0;
}

export function isAtLeast(role: MemberRole, min: MemberRole): boolean {
  return rankOf(role) >= rankOf(min);
}

/** Default permissions implied by holding a given role (mirrors backend). */
const ROLE_PERMISSIONS: Record<MemberRole, DelegatedPermission[]> = {
  OWNER: ['MANAGE_EMULATION_CATEGORIES', 'MANAGE_EMULATION_ENTRIES', 'MANAGE_DUTY_TYPES', 'MANAGE_DUTY_ASSIGNMENTS'],
  TEACHER: ['MANAGE_EMULATION_CATEGORIES', 'MANAGE_EMULATION_ENTRIES', 'MANAGE_DUTY_TYPES', 'MANAGE_DUTY_ASSIGNMENTS'],
  MONITOR: ['MANAGE_EMULATION_CATEGORIES', 'MANAGE_EMULATION_ENTRIES', 'MANAGE_DUTY_TYPES', 'MANAGE_DUTY_ASSIGNMENTS'],
  VICE_MONITOR: ['MANAGE_EMULATION_ENTRIES', 'MANAGE_DUTY_ASSIGNMENTS'],
  STUDY_VICE_MONITOR: ['MANAGE_EMULATION_CATEGORIES', 'MANAGE_EMULATION_ENTRIES'],
  ARTS_VICE_MONITOR: [],
  LABOR_VICE_MONITOR: ['MANAGE_DUTY_TYPES', 'MANAGE_DUTY_ASSIGNMENTS'],
  DISCIPLINE_OFFICER: ['MANAGE_EMULATION_ENTRIES'],
  GROUP_LEADER: ['MANAGE_EMULATION_ENTRIES', 'MANAGE_DUTY_ASSIGNMENTS'],
  SECRETARY: [],
  TREASURER: [],
  MEMBER: [],
};

/**
 * Given the viewer's primary role + any extra roles + explicit delegations,
 * compute whether they hold a specific delegated permission.
 */
export function hasPermission(
  primaryRole: MemberRole,
  extraRoles: MemberRole[] | undefined,
  delegated: DelegatedPermission[] | undefined,
  permission: DelegatedPermission,
): boolean {
  if (delegated?.includes(permission)) return true;
  if (ROLE_PERMISSIONS[primaryRole]?.includes(permission)) return true;
  return extraRoles?.some((r) => ROLE_PERMISSIONS[r]?.includes(permission)) ?? false;
}

/**
 * Convenience flags for the current viewer. `member` is optional because
 * not every page has the full membership record loaded — when missing we
 * fall back to role-only defaults.
 */
export function permissionsOf(role: MemberRole, member?: Pick<ClassroomMember, 'extraRoles' | 'delegatedPermissions'>) {
  const extras = member?.extraRoles ?? [];
  const delegated = member?.delegatedPermissions ?? [];
  const allRoles: MemberRole[] = [role, ...extras];
  const topRank = Math.max(...allRoles.map(rankOf));
  const atLeast = (min: MemberRole) => topRank >= rankOf(min);

  return {
    canEditClassroom:    atLeast('TEACHER'),
    canManageInviteCode: atLeast('TEACHER'),
    canManageMembers:    atLeast('MONITOR'),
    canCreateAttendance: atLeast('VICE_MONITOR'),
    canManageEmulation:  hasPermission(role, extras, delegated, 'MANAGE_EMULATION_CATEGORIES'),
    canRecordEmulation:  hasPermission(role, extras, delegated, 'MANAGE_EMULATION_ENTRIES'),
    canApproveAbsence:   atLeast('MONITOR'),
    canManageEvents:     atLeast('VICE_MONITOR'),
    canManageDutyTypes:  hasPermission(role, extras, delegated, 'MANAGE_DUTY_TYPES'),
    canAssignDuty:       hasPermission(role, extras, delegated, 'MANAGE_DUTY_ASSIGNMENTS'),
    canManageFund:       allRoles.includes('TREASURER') || atLeast('MONITOR'),
    canUploadShared:     atLeast('GROUP_LEADER'),
    canDelete:           atLeast('TEACHER'),
    canTransferOwnership: role === 'OWNER',
  };
}

export const ROLE_VARIANT: Record<MemberRole, 'amber' | 'blue' | 'sage' | 'green' | 'warm' | 'red'> = {
  OWNER:              'warm',
  TEACHER:            'amber',
  MONITOR:            'amber',
  VICE_MONITOR:       'amber',
  STUDY_VICE_MONITOR: 'sage',
  ARTS_VICE_MONITOR:  'sage',
  LABOR_VICE_MONITOR: 'sage',
  DISCIPLINE_OFFICER: 'red',
  GROUP_LEADER:       'sage',
  SECRETARY:          'blue',
  TREASURER:          'green',
  MEMBER:             'blue',
};
