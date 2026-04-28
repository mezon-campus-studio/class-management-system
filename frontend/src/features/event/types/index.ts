export type RsvpResponse = 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE';
export type AbsenceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ClassEvent {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  location: string | null;
  mandatory: boolean;
  createdById: string;
  createdAt: string;
}

export interface EventRsvp {
  id: string;
  eventId: string;
  userId: string;
  response: RsvpResponse;
  note: string | null;
}

export interface AbsenceRequest {
  id: string;
  userId: string;
  eventId: string | null;
  reason: string;
  status: AbsenceStatus;
  reviewedById: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  /** User IDs of voters; empty when poll.anonymous is true. */
  voterIds: string[];
}

export interface Poll {
  id: string;
  question: string;
  multiChoice: boolean;
  anonymous: boolean;
  closesAt: string | null;
  isOpen: boolean;
  options: PollOption[];
  createdById: string;
  /** Option IDs the current user has voted for. */
  myOptionIds: string[];
}

export const RSVP_LABELS: Record<RsvpResponse, string> = {
  ATTENDING: 'Tham dự',
  NOT_ATTENDING: 'Không tham dự',
  MAYBE: 'Có thể',
};

export const RSVP_COLOR: Record<RsvpResponse, string> = {
  ATTENDING: 'var(--green-text)',
  MAYBE: 'var(--amber-text)',
  NOT_ATTENDING: 'var(--red-text)',
};

export const ABSENCE_STATUS_LABELS: Record<AbsenceStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

export const ABSENCE_STATUS_VARIANT: Record<AbsenceStatus, 'amber' | 'green' | 'red'> = {
  PENDING: 'amber',
  APPROVED: 'green',
  REJECTED: 'red',
};
