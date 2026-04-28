export type DutyStatus = 'PENDING' | 'COMPLETED' | 'MISSED';

export interface DutyType {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
}

export interface DutyAssignment {
  id: string;
  dutyTypeId: string;
  dutyTypeName: string;
  assignedToId: string;
  dutyDate: string;
  status: DutyStatus;
  note: string | null;
  confirmedById: string | null;
  confirmedAt: string | null;
}

export const DUTY_STATUS_LABELS: Record<DutyStatus, string> = {
  PENDING: 'Chưa xác nhận',
  COMPLETED: 'Đã hoàn thành',
  MISSED: 'Bỏ lỡ',
};

export const DUTY_STATUS_VARIANT: Record<DutyStatus, 'amber' | 'green' | 'red'> = {
  PENDING: 'amber',
  COMPLETED: 'green',
  MISSED: 'red',
};
