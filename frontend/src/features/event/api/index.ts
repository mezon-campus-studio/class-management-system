import { api } from '@/services/api-client';
import type { ClassEvent, EventRsvp, AbsenceRequest, AbsenceStatus, Poll, RsvpResponse } from '../types';
import type { Page } from '@/shared/types/pagination';

const base = (classroomId: string) => `/classrooms/${classroomId}/events`;

export const eventApi = {
  listEvents: (classroomId: string, page = 0, size = 10) =>
    api.get<{ data: Page<ClassEvent> }>(`${base(classroomId)}`, { params: { page, size } }).then((r) => r.data.data),

  createEvent: (
    classroomId: string,
    body: {
      title: string;
      description?: string;
      startTime: string;
      endTime?: string;
      location?: string;
      mandatory: boolean;
    },
  ) =>
    api.post<{ data: ClassEvent }>(`${base(classroomId)}`, body).then((r) => r.data.data),

  updateEvent: (
    classroomId: string,
    eventId: string,
    body: Partial<{
      title: string;
      description: string;
      startTime: string;
      endTime: string;
      location: string;
      mandatory: boolean;
    }>,
  ) =>
    api
      .put<{ data: ClassEvent }>(`${base(classroomId)}/${eventId}`, body)
      .then((r) => r.data.data),

  deleteEvent: (classroomId: string, eventId: string) =>
    api.delete(`${base(classroomId)}/${eventId}`).then(() => undefined),

  updatePoll: (
    classroomId: string,
    pollId: string,
    body: Partial<{ question: string; closesAt: string | null; closeNow: boolean }>,
  ) =>
    api.put<{ data: Poll }>(`${base(classroomId)}/polls/${pollId}`, body).then((r) => r.data.data),

  deletePoll: (classroomId: string, pollId: string) =>
    api.delete(`${base(classroomId)}/polls/${pollId}`).then(() => undefined),

  cancelAbsenceRequest: (classroomId: string, requestId: string) =>
    api.delete(`${base(classroomId)}/absence-requests/${requestId}`).then(() => undefined),

  rsvp: (classroomId: string, eventId: string, response: RsvpResponse, note?: string) =>
    api
      .post<{ data: EventRsvp }>(`${base(classroomId)}/${eventId}/rsvp`, { response, note })
      .then((r) => r.data.data),

  listRsvps: (classroomId: string, eventId: string) =>
    api
      .get<{ data: EventRsvp[] }>(`${base(classroomId)}/${eventId}/rsvps`)
      .then((r) => r.data.data),

  listAbsenceRequests: (classroomId: string) =>
    api
      .get<{ data: AbsenceRequest[] }>(`${base(classroomId)}/absence-requests`)
      .then((r) => r.data.data),

  createAbsenceRequest: (classroomId: string, body: { reason: string; eventId?: string }) =>
    api
      .post<{ data: AbsenceRequest }>(`${base(classroomId)}/absence-requests`, body)
      .then((r) => r.data.data),

  reviewAbsenceRequest: (
    classroomId: string,
    requestId: string,
    status: AbsenceStatus,
    reviewNote?: string,
  ) =>
    api
      .put<{ data: AbsenceRequest }>(
        `${base(classroomId)}/absence-requests/${requestId}/review`,
        { status, reviewNote },
      )
      .then((r) => r.data.data),

  listPolls: (classroomId: string) =>
    api.get<{ data: Poll[] }>(`${base(classroomId)}/polls`).then((r) => r.data.data),

  createPoll: (
    classroomId: string,
    body: {
      question: string;
      multiChoice: boolean;
      anonymous: boolean;
      closesAt?: string;
      options: string[];
    },
  ) =>
    api.post<{ data: Poll }>(`${base(classroomId)}/polls`, body).then((r) => r.data.data),

  vote: (classroomId: string, pollId: string, optionIds: string[]) =>
    api
      .post<{ data: Poll }>(`${base(classroomId)}/polls/${pollId}/vote`, { optionIds })
      .then((r) => r.data.data),
};
