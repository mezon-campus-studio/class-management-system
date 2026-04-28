import { api } from '@/services/api-client';
import type { UserType } from '@/app/store';
import type { Page } from '@/shared/types/pagination';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';
export type ClassroomStatus = 'ACTIVE' | 'ARCHIVED';

export interface AdminMetrics {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalAdmins: number;
  totalClassrooms: number;
  activeClassrooms: number;
  totalParentLinks: number;
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  userType: UserType;
  status: UserStatus;
  studentCode: string | null;
  createdAt: string;
}

export interface AdminClassroom {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  ownerName: string;
  memberCount: number;
  maxMembers: number;
  status: ClassroomStatus;
  createdAt: string;
}

interface Wrap<T> { data: T }

export const adminApi = {
  metrics: () =>
    api.get<Wrap<AdminMetrics>>('/admin/metrics').then((r) => r.data.data),
  listUsers: (q?: string, userType?: UserType, page = 0, size = 20) =>
    api.get<Wrap<Page<AdminUser>>>('/admin/users', { params: { q, userType, page, size } }).then((r) => r.data.data),
  setUserStatus: (userId: string, status: UserStatus) =>
    api.patch<Wrap<AdminUser>>(`/admin/users/${userId}/status`, { status }).then((r) => r.data.data),
  listClassrooms: (page = 0, size = 20) =>
    api.get<Wrap<Page<AdminClassroom>>>('/admin/classrooms', { params: { page, size } }).then((r) => r.data.data),
  archiveClassroom: (id: string) =>
    api.post(`/admin/classrooms/${id}/archive`),
};
