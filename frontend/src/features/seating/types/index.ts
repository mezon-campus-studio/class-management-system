export type SeatStatus = 'PRESENT' | 'PENDING' | 'ABSENT' | 'UNMARKED';

export interface SeatAssignment {
  seatKey: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  attendanceStatus: SeatStatus;
}

export interface SeatingStats {
  total: number;
  present: number;
  excused: number; // PENDING (chờ duyệt = nghỉ phép)
  absent: number;
  unmarked: number;
}

export interface SeatingResponse {
  rowsCount: number;
  seatsPerSide: number;
  seats: SeatAssignment[];
  stats: SeatingStats;
}

export const STATUS_LABEL: Record<SeatStatus, string> = {
  PRESENT: 'Có mặt',
  PENDING: 'Nghỉ phép',
  ABSENT: 'Nghỉ không phép',
  UNMARKED: 'Chưa điểm danh',
};

export const STATUS_COLOR: Record<SeatStatus, string> = {
  PRESENT: '#22a06b',
  PENDING: '#e6a23c',
  ABSENT: '#cf5151',
  UNMARKED: '#9aa0a6',
};
