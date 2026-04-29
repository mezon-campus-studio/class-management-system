export type NotificationType =
  | 'ATTENDANCE_PENDING' | 'ATTENDANCE_APPROVED' | 'ATTENDANCE_REJECTED'
  | 'DUTY_ASSIGNED' | 'DUTY_CONFIRMED' | 'DUTY_REMINDER'
  | 'EVENT_CREATED' | 'EVENT_REMINDER'
  | 'ABSENCE_REQUEST_REVIEWED' | 'ABSENCE_REQUEST_PENDING'
  | 'FUND_PAYMENT_INITIATED' | 'FUND_PAYMENT_CONFIRMED' | 'FUND_PAYMENT_REJECTED' | 'FUND_COLLECTION_CREATED'
  | 'EMULATION_ENTRY_ADDED' | 'EVALUATION_ADDED'
  | 'MESSAGE_RECEIVED' | 'MESSAGE_MENTION'
  | 'GENERAL';

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
