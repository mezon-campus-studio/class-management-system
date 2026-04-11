export type AttendanceStatus = 'present' | 'absent_excused' | 'absent_unexcused' | 'empty';

export interface StudentSeat {
  id: string;
  name: string;
  row: number;    // Hàng 1, 2, 3...
  column: number; // Cột 1, 2, 3, 4
  side: 'left' | 'right';
  status: AttendanceStatus;
}

export interface ClassDiagramData {
  totalStudents: number;
  presentCount: number;
  excusedCount: number;
  unexcusedCount: number;
  seats: StudentSeat[];
}