import { api } from '@/services/api-client';

export interface LinkedStudent {
  linkId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentCode: string;
  avatarUrl: string | null;
  relationship: string | null;
  linkedAt: string;
}

export interface ChildClassroom {
  classroomId: string;
  classroomName: string;
  coverImageUrl: string | null;
  studentId: string;
  studentName: string;
  studentCode: string;
}

interface Wrap<T> { data: T }

export interface ParentClassroomDetail {
  classroomId: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  studentId: string;
  studentName: string;
  studentCode: string;
}

export interface ParentEvaluation {
  id: string;
  classroomId: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  category: string;
  score: number | null;
  title: string | null;
  content: string;
  period: string | null;
  createdAt: string;
}

export const parentApi = {
  listChildren: () =>
    api.get<Wrap<LinkedStudent[]>>('/parent/children').then((r) => r.data.data),
  listChildClassrooms: () =>
    api.get<Wrap<ChildClassroom[]>>('/parent/classrooms').then((r) => r.data.data),
  getClassroomDetail: (classroomId: string) =>
    api.get<Wrap<ParentClassroomDetail>>(`/parent/classrooms/${classroomId}`).then((r) => r.data.data),
  getChildEvaluations: (classroomId: string) =>
    api.get<Wrap<ParentEvaluation[]>>(`/parent/classrooms/${classroomId}/evaluations`).then((r) => r.data.data ?? []),
  submitAbsence: (classroomId: string, payload: { date: string; reason: string; note?: string }) =>
    api.post(`/parent/classrooms/${classroomId}/absence-requests`, payload),
  linkStudent: (studentCode: string, relationship?: string) =>
    api.post<Wrap<LinkedStudent>>('/parent/children', { studentCode, relationship })
      .then((r) => r.data.data),
  unlinkStudent: (linkId: string) =>
    api.delete(`/parent/children/${linkId}`),
};
