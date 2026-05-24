// @features/classDiagram/types.ts

export type AttendanceStatus = 
  | 'present' 
  | 'absent_excused' 
  | 'absent_unexcused' 
  | 'late'        
  | 'unmarked'    
  | 'empty';      

export interface StudentSeat {
  id: string;
  name: string;
  user_avatar_url?: string | null; 
  status: AttendanceStatus;
  
  // Lưu tọa độ thực tế từ Backend để dễ gọi API xếp chỗ
  groupId: number; 
  deskId: number;
  positionId: number;
}

// Định nghĩa cấu trúc Group -> Desk -> Position
export interface PositionData {
  positionId: number;
  student: StudentSeat | null; // null nếu ghế trống
}

export interface DeskData {
  deskId: number;
  positions: PositionData[];
}

export interface GroupData {
  groupId: number;
  name?: string;
  desks: DeskData[];
}

export interface ClassDiagramData {
  totalStudents: number;
  presentCount: number;
  excusedCount: number;
  unexcusedCount: number;
  lateCount?: number;
  groups: GroupData[]; // THAY ĐỔI LỚN NHẤT: Dùng mảng Group thay vì mảng seats
}