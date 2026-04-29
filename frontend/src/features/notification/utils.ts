import type { NotificationType } from './types';

/**
 * Maps a notification's type + context to the route the user should land on
 * when they click the notification. Returns null for types with no specific
 * destination (e.g. GENERAL).
 */
export function getNotificationRoute(
  type: NotificationType,
  classroomId: string | null,
  referenceId: string | null,
): string | null {
  if (!classroomId) return null;
  const base = `/classrooms/${classroomId}`;

  switch (type) {
    case 'ATTENDANCE_PENDING':
    case 'ATTENDANCE_APPROVED':
    case 'ATTENDANCE_REJECTED':
    case 'ABSENCE_REQUEST_PENDING':
    case 'ABSENCE_REQUEST_REVIEWED':
      return referenceId ? `${base}/attendance/sessions/${referenceId}` : `${base}/attendance`;

    case 'DUTY_ASSIGNED':
    case 'DUTY_CONFIRMED':
    case 'DUTY_REMINDER':
      return `${base}/duty`;

    case 'EVENT_CREATED':
    case 'EVENT_REMINDER':
      return `${base}/events`;

    case 'MESSAGE_RECEIVED':
    case 'MESSAGE_MENTION':
    case 'MESSAGE_REACTION':
      return `${base}/chat`;

    case 'FUND_PAYMENT_INITIATED':
    case 'FUND_PAYMENT_CONFIRMED':
    case 'FUND_COLLECTION_CREATED':
      return `${base}/fund`;

    case 'EMULATION_ENTRY_ADDED':
    case 'EVALUATION_ADDED':
      return `${base}/emulation`;

    default:
      return null;
  }
}
