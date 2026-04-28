import { api } from '@/services/api-client';
import type { EmulationCategory, EmulationEntry, MemberScoreSummary } from '../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

const base = (classroomId: string) => `/classrooms/${classroomId}/emulation`;

export const emulationApi = {
  listCategories: (classroomId: string) =>
    api
      .get<ApiResponse<EmulationCategory[]>>(`${base(classroomId)}/categories`)
      .then((r) => r.data.data),

  createCategory: (
    classroomId: string,
    body: { name: string; description?: string; defaultScore: number },
  ) =>
    api
      .post<ApiResponse<EmulationCategory>>(`${base(classroomId)}/categories`, body)
      .then((r) => r.data.data),

  updateCategory: (
    classroomId: string,
    id: string,
    body: Partial<{ name: string; description: string; defaultScore: number; active: boolean }>,
  ) =>
    api
      .put<ApiResponse<EmulationCategory>>(`${base(classroomId)}/categories/${id}`, body)
      .then((r) => r.data.data),

  deleteCategory: (classroomId: string, id: string) =>
    api.delete(`${base(classroomId)}/categories/${id}`).then(() => undefined),

  listEntries: (classroomId: string) =>
    api
      .get<ApiResponse<EmulationEntry[]>>(`${base(classroomId)}/entries`)
      .then((r) => r.data.data),

  addEntry: (
    classroomId: string,
    body: {
      categoryId: string;
      memberId: string;
      score: number;
      note?: string;
      occurredAt?: string;
    },
  ) =>
    api
      .post<ApiResponse<EmulationEntry>>(`${base(classroomId)}/entries`, body)
      .then((r) => r.data.data),

  updateEntry: (
    classroomId: string,
    entryId: string,
    body: Partial<{ categoryId: string; score: number; note: string; occurredAt: string }>,
  ) =>
    api
      .put<ApiResponse<EmulationEntry>>(`${base(classroomId)}/entries/${entryId}`, body)
      .then((r) => r.data.data),

  deleteEntry: (classroomId: string, entryId: string) =>
    api.delete(`${base(classroomId)}/entries/${entryId}`).then(() => undefined),

  getScoreSummary: (classroomId: string) =>
    api
      .get<ApiResponse<MemberScoreSummary[]>>(`${base(classroomId)}/summary`)
      .then((r) => r.data.data),
};
