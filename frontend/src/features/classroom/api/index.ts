import { api } from '@/services/api-client';
import type {
  Classroom,
  ClassroomMember,
  DelegatedPermission,
  MemberRole,
} from '../types';

interface ApiResponse<T> { data: T; message?: string; }

export const classroomApi = {
  list: () =>
    api.get<ApiResponse<Classroom[]>>('/classrooms').then((r) => r.data.data),

  get: (id: string) =>
    api.get<ApiResponse<Classroom>>(`/classrooms/${id}`).then((r) => r.data.data),

  create: (body: { name: string; description?: string; maxMembers?: number }) =>
    api.post<ApiResponse<Classroom>>('/classrooms', body).then((r) => r.data.data),

  join: (code: string) =>
    api.post<ApiResponse<Classroom>>(`/classrooms/join?code=${code}`, {}).then((r) => r.data.data),

  leave: (id: string) =>
    api.delete(`/classrooms/${id}/leave`),

  regenerateCode: (id: string) =>
    api.post<ApiResponse<string>>(`/classrooms/${id}/invite-code/regenerate`, {}).then((r) => r.data.data),

  listMembers: (id: string) =>
    api.get<ApiResponse<ClassroomMember[]>>(`/classrooms/${id}/members`).then((r) => r.data.data),

  removeMember: (classroomId: string, memberId: string) =>
    api.delete(`/classrooms/${classroomId}/members/${memberId}`),

  updateMemberRole: (classroomId: string, memberId: string, role: MemberRole) =>
    api
      .patch<ApiResponse<ClassroomMember>>(
        `/classrooms/${classroomId}/members/${memberId}/role`,
        { role },
      )
      .then((r) => r.data.data),

  updateMemberExtras: (
    classroomId: string,
    memberId: string,
    body: { extraRoles?: MemberRole[]; delegatedPermissions?: DelegatedPermission[] },
  ) =>
    api
      .patch<ApiResponse<ClassroomMember>>(
        `/classrooms/${classroomId}/members/${memberId}/extras`,
        body,
      )
      .then((r) => r.data.data),
};
