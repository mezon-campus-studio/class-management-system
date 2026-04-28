import { api } from '@/services/api-client';
import type { AttendanceSession, AttendanceRecord, RecordStatus } from '../types';

interface ApiResponse<T> { data: T; message?: string; }
interface PageResponse<T> { data: { content: T[]; totalElements: number; totalPages: number; number: number } }

const base = (classroomId: string) => `/classrooms/${classroomId}/attendance`;

export const attendanceApi = {
  listSessions: (classroomId: string, page = 0) =>
    api.get<PageResponse<AttendanceSession>>(`${base(classroomId)}/sessions?page=${page}&size=20`)
       .then((r) => r.data.data),

  /** Auto-generates today's sessions from the timetable then returns them. */
  listByDate: (classroomId: string, date?: string) =>
    api
      .get<ApiResponse<AttendanceSession[]>>(
        `${base(classroomId)}/daily${date ? `?date=${date}` : ''}`,
      )
      .then((r) => r.data.data),

  getSession: (classroomId: string, sessionId: string) =>
    api.get<ApiResponse<AttendanceSession>>(`${base(classroomId)}/sessions/${sessionId}`)
       .then((r) => r.data.data),

  createSession: (classroomId: string, body: { title: string; description?: string; closesAt?: string }) =>
    api.post<ApiResponse<AttendanceSession>>(`${base(classroomId)}/sessions`, body).then((r) => r.data.data),

  closeSession: (classroomId: string, sessionId: string) =>
    api.post<ApiResponse<AttendanceSession>>(`${base(classroomId)}/sessions/${sessionId}/close`, {}).then((r) => r.data.data),

  deleteSession: (classroomId: string, sessionId: string) =>
    api.delete(`${base(classroomId)}/sessions/${sessionId}`).then(() => undefined),

  /** Student self check-in. */
  checkIn: (classroomId: string, sessionId: string, note?: string) =>
    api
      .post<ApiResponse<AttendanceRecord>>(
        `${base(classroomId)}/sessions/${sessionId}/check-in`,
        note ? { note } : {},
      )
      .then((r) => r.data.data),

  listRecords: (classroomId: string, sessionId: string) =>
    api.get<ApiResponse<AttendanceRecord[]>>(`${base(classroomId)}/sessions/${sessionId}/records`).then((r) => r.data.data),

  markRecord: (classroomId: string, sessionId: string, recordId: string, status: RecordStatus, note?: string) =>
    api.patch<ApiResponse<AttendanceRecord>>(
      `${base(classroomId)}/sessions/${sessionId}/records/${recordId}`,
      { status, note: note ?? null },
    ).then((r) => r.data.data),
};
