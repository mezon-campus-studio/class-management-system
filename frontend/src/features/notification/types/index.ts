export type NotificationType =
  | 'ATTENDANCE_PENDING' | 'ATTENDANCE_APPROVED' | 'ATTENDANCE_REJECTED'
  | 'DUTY_ASSIGNED' | 'DUTY_CONFIRMED'
  | 'EVENT_CREATED' | 'ABSENCE_REQUEST_REVIEWED'
  | 'FUND_PAYMENT_CONFIRMED' | 'FUND_COLLECTION_CREATED'
  | 'EMULATION_ENTRY_ADDED'
  | 'GENERAL'
  | 'MESSAGE_RECEIVED' | 'MESSAGE_MENTION'
  | 'DUTY_REMINDER'
  | 'EVENT_REMINDER'
  | 'EVALUATION_ADDED'
  | 'ABSENCE_REQUEST_PENDING';

export interface Notification {
  id: string;
  classroomId: string | null;
  type: NotificationType;
  title: string;
  body: string | null;
  referenceId: string | null;
  read: boolean;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export type ChatLevel = 'ALL' | 'MENTIONS_ONLY' | 'NOTHING';

export interface PreferenceEntry {
  classroomId: string | null;
  chatLevel: ChatLevel;
  dutyEnabled: boolean;
  eventEnabled: boolean;
  attendanceEnabled: boolean;
  fundEnabled: boolean;
  evaluationEnabled: boolean;
}

export interface NotificationPreferences {
  global: PreferenceEntry;
  classrooms: PreferenceEntry[];
}
