import { api } from '@/services/api-client';
import type { DutyType, DutyAssignment } from '../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

const base = (classroomId: string) => `/classrooms/${classroomId}/duty`;

export const dutyApi = {
  listTypes: (classroomId: string) =>
    api
      .get<ApiResponse<DutyType[]>>(`${base(classroomId)}/types`)
      .then((r) => r.data.data),

  createType: (classroomId: string, body: { name: string; description?: string }) =>
    api
      .post<ApiResponse<DutyType>>(`${base(classroomId)}/types`, body)
      .then((r) => r.data.data),

  listAssignments: (classroomId: string, date?: string) =>
    api
      .get<ApiResponse<DutyAssignment[]>>(
        `${base(classroomId)}/assignments${date ? `?date=${date}` : ''}`,
      )
      .then((r) => r.data.data),

  listMyAssignments: (classroomId: string) =>
    api
      .get<ApiResponse<DutyAssignment[]>>(`${base(classroomId)}/assignments/me`)
      .then((r) => r.data.data),

  createAssignment: (
    classroomId: string,
    body: {
      dutyTypeId: string;
      assignedToId: string;
      dutyDate: string;
      note?: string;
    },
  ) =>
    api
      .post<ApiResponse<DutyAssignment>>(`${base(classroomId)}/assignments`, body)
      .then((r) => r.data.data),

  confirmAssignment: (classroomId: string, id: string) =>
    api
      .post<ApiResponse<DutyAssignment>>(`${base(classroomId)}/assignments/${id}/confirm`, {})
      .then((r) => r.data.data),

  updateAssignment: (
    classroomId: string,
    id: string,
    body: Partial<{
      dutyTypeId: string;
      assignedToId: string;
      dutyDate: string;
      status: 'PENDING' | 'COMPLETED' | 'MISSED';
      note: string;
    }>,
  ) =>
    api
      .put<ApiResponse<DutyAssignment>>(`${base(classroomId)}/assignments/${id}`, body)
      .then((r) => r.data.data),

  deleteAssignment: (classroomId: string, id: string) =>
    api.delete(`${base(classroomId)}/assignments/${id}`).then(() => undefined),

  updateType: (
    classroomId: string,
    id: string,
    body: Partial<{ name: string; description: string; active: boolean }>,
  ) =>
    api
      .put<ApiResponse<DutyType>>(`${base(classroomId)}/types/${id}`, body)
      .then((r) => r.data.data),

  deleteType: (classroomId: string, id: string) =>
    api.delete(`${base(classroomId)}/types/${id}`).then(() => undefined),
};
