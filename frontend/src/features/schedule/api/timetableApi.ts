import { api } from '@/services/api-client';

// Types
export interface Subject {
  id: string;
  name: string;
  code: string;
  periodsPerWeek: number;
  colorHex: string;
  createdAt: string;
}

export interface TeacherSubjectEntry {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
}

export interface TimetableEntry {
  id: string;
  classroomId: string;
  classroomName: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  subjectColor: string;
  teacherId: string | null;
  teacherName: string | null;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  period: number;
  academicYear: string;
  semester: number;
  createdAt: string;
}

export interface SwapRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEntry: TimetableEntry;
  targetTeacherId: string;
  targetTeacherName: string;
  targetEntry: TimetableEntry | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reason: string | null;
  reviewedById: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface GenerateTimetableRequest {
  academicYear: string;
  semester: number;
  clearExisting: boolean;
  classrooms: Array<{
    classroomId: string;
    assignments: Array<{
      subjectId: string;
      teacherId: string | null;
      periodsPerWeek: number;
    }>;
  }>;
}

export interface GenerateTimetableResponse {
  entries: TimetableEntry[];
  conflicts: string[];
}

export interface ClassroomSubjectConfig {
  id: string;
  classroomId: string;
  classroomName: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  subjectColor: string;
  teacherId: string | null;
  teacherName: string | null;
  periodsPerWeek: number;
  createdAt: string;
}

// Period time map (Vietnamese school schedule)
export const PERIOD_TIMES: Record<number, { start: string; end: string }> = {
  1:  { start: '07:00', end: '07:45' },
  2:  { start: '07:50', end: '08:35' },
  3:  { start: '08:40', end: '09:25' },
  4:  { start: '09:30', end: '10:15' },
  5:  { start: '10:20', end: '11:05' },
  6:  { start: '13:00', end: '13:45' },
  7:  { start: '13:50', end: '14:35' },
  8:  { start: '14:40', end: '15:25' },
  9:  { start: '15:30', end: '16:15' },
  10: { start: '16:20', end: '17:05' },
};

export const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Thứ Hai', TUESDAY: 'Thứ Ba', WEDNESDAY: 'Thứ Tư',
  THURSDAY: 'Thứ Năm', FRIDAY: 'Thứ Sáu', SATURDAY: 'Thứ Bảy', SUNDAY: 'Chủ Nhật',
};

export const DAY_SHORT: Record<string, string> = {
  MONDAY: 'T2', TUESDAY: 'T3', WEDNESDAY: 'T4',
  THURSDAY: 'T5', FRIDAY: 'T6', SATURDAY: 'T7', SUNDAY: 'CN',
};

export const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export const timetableApi = {
  // Subjects
  listSubjects: () =>
    api.get<{ data: Subject[] }>('/timetable/subjects').then(r => r.data.data),
  createSubject: (body: { name: string; code: string; periodsPerWeek: number; colorHex?: string }) =>
    api.post<{ data: Subject }>('/timetable/subjects', body).then(r => r.data.data),
  updateSubject: (id: string, body: Partial<{ name: string; code: string; periodsPerWeek: number; colorHex: string }>) =>
    api.put<{ data: Subject }>(`/timetable/subjects/${id}`, body).then(r => r.data.data),
  deleteSubject: (id: string) => api.delete(`/timetable/subjects/${id}`),

  // Teacher-subject assignments
  listTeacherSubjects: () =>
    api.get<{ data: TeacherSubjectEntry[] }>('/timetable/teacher-subjects').then(r => r.data.data),
  assignTeacherSubject: (body: { teacherId: string; subjectId: string }) =>
    api.post<{ data: TeacherSubjectEntry }>('/timetable/teacher-subjects', body).then(r => r.data.data),
  unassignTeacherSubject: (id: string) => api.delete(`/timetable/teacher-subjects/${id}`),

  // Timetable entries
  getEntries: (classroomId: string, academicYear: string, semester: number) =>
    api.get<{ data: TimetableEntry[] }>('/timetable/entries', { params: { classroomId, academicYear, semester } }).then(r => r.data.data),
  createEntry: (body: { classroomId: string; subjectId: string; teacherId?: string; dayOfWeek: string; period: number; academicYear: string; semester: number }) =>
    api.post<{ data: TimetableEntry }>('/timetable/entries', body).then(r => r.data.data),
  updateEntry: (id: string, body: Partial<{ subjectId: string; teacherId: string; dayOfWeek: string; period: number }>) =>
    api.put<{ data: TimetableEntry }>(`/timetable/entries/${id}`, body).then(r => r.data.data),
  deleteEntry: (id: string) => api.delete(`/timetable/entries/${id}`),
  generate: (body: GenerateTimetableRequest) =>
    api.post<{ data: GenerateTimetableResponse }>('/timetable/entries/generate', body).then(r => r.data.data),
  generateFromConfig: (body: { academicYear: string; semester: number; clearExisting: boolean; classroomIds?: string[] }) =>
    api.post<{ data: GenerateTimetableResponse }>('/timetable/entries/generate-from-config', body).then(r => r.data.data),

  // Classroom subject configs (curriculum setup)
  getConfigs: (classroomId?: string) =>
    api.get<{ data: ClassroomSubjectConfig[] }>('/timetable/configs', { params: classroomId ? { classroomId } : {} }).then(r => r.data.data),
  saveConfig: (body: { classroomId: string; subjectId: string; teacherId?: string | null; periodsPerWeek: number }) =>
    api.post<{ data: ClassroomSubjectConfig }>('/timetable/configs', body).then(r => r.data.data),
  deleteConfig: (id: string) => api.delete(`/timetable/configs/${id}`),

  // My schedule
  getMySchedule: (academicYear: string, semester: number) =>
    api.get<{ data: TimetableEntry[] }>('/timetable/me', { params: { academicYear, semester } }).then(r => r.data.data),

  // Swap requests
  getMySwaps: () =>
    api.get<{ data: SwapRequest[] }>('/timetable/swaps').then(r => r.data.data),
  createSwap: (body: { requesterEntryId: string; targetTeacherId: string; targetEntryId?: string; reason?: string }) =>
    api.post<{ data: SwapRequest }>('/timetable/swaps', body).then(r => r.data.data),
  approveSwap: (id: string) =>
    api.post<{ data: SwapRequest }>(`/timetable/swaps/${id}/approve`, {}).then(r => r.data.data),
  rejectSwap: (id: string, reviewNote?: string) =>
    api.post<{ data: SwapRequest }>(`/timetable/swaps/${id}/reject`, { reviewNote }).then(r => r.data.data),
  cancelSwap: (id: string) => api.delete(`/timetable/swaps/${id}`),
};
