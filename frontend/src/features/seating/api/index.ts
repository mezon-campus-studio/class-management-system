import { api } from '@/services/api-client';
import type { SeatingResponse } from '../types';

interface Wrap<T> { data: T }

export const seatingApi = {
  get: (classroomId: string) =>
    api.get<Wrap<SeatingResponse>>(`/classrooms/${classroomId}/seating`).then((r) => r.data.data),

  update: (
    classroomId: string,
    body: { rowsCount?: number; seatsPerSide?: number; assignments?: Record<string, string | null> },
  ) =>
    api.put<Wrap<SeatingResponse>>(`/classrooms/${classroomId}/seating`, body).then((r) => r.data.data),
};
