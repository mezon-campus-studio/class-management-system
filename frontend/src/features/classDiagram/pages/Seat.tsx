// src/features/classDiagram/pages/Seat.tsx
import type { StudentSeat } from "@features/classDiagram/types";

interface SeatProps {
  student: StudentSeat | null;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  isTeacherView: boolean;
  isSelected?: boolean;
}

export const Seat = ({ student, onClick, isTeacherView, isSelected }: SeatProps) => {
  console.log("Dữ liệu của 1 học sinh truyền vào Seat:", student);
  const getStatusColor = () => {
    if (!student) return "bg-transparent";
    switch (student.status) {
      case "present": return "bg-[var(--green-text)]"; 
      case "absent_excused": return "bg-[var(--gold-text)]"; 
      case "absent_unexcused": return "bg-[var(--red-text)]";
      case "late": return "bg-[var(--sage-text)]"; // Dùng màu Sage cho đi trễ
      default: return "bg-[var(--ink-4)]";
    }
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(student?.name || "?")}&background=random`;

  return (
    <div
      onClick={onClick}
      className={`relative w-16 h-20 md:w-20 md:h-24 rounded-[var(--r-xl)] flex flex-col items-center justify-center p-1 cursor-pointer transition-all duration-[var(--t-base)]
        ${isTeacherView ? "rotate-180" : ""}
        
        ${isSelected
          // NẾU ĐƯỢC CHỌN: Dùng dải màu Warm (Blue), viền đậm, có vòng Glow và đổ bóng
          ? "scale-110 z-20 bg-[var(--warm-fill)] border-2 border-[var(--warm-600)] ring-4 ring-[var(--warm-border)] shadow-[var(--shadow-md)] animate-pulse"
          
          // NẾU BÌNH THƯỜNG: Dùng màu Surface và Rule
          : student 
            ? "border border-[var(--rule-lg)] bg-[var(--bg-surface)] hover:scale-105 shadow-[var(--shadow-sm)]" 
            : "border border-dashed border-[var(--rule-md)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] hover:scale-105 shadow-[var(--shadow-xs)]"
        }
      `}
    >
      {student ? (
        <>
          <div
            className={`absolute top-1 right-1 w-3 h-3 rounded-full border border-[var(--bg-surface)] shadow-[var(--shadow-xs)] z-10 ${getStatusColor()}`}
          />
          {/* Avatar dùng bg-surface-2 làm nền */}
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-[var(--r-full)] overflow-hidden border border-[var(--rule)] shadow-[var(--shadow-xs)] mb-1 bg-[var(--bg-surface-2)] shrink-0">
            <img
              src={student.user_avatar_url || defaultAvatar}
              alt={student.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-[9px] md:text-[10px] font-semibold text-[var(--ink-1)] text-center leading-tight line-clamp-2 w-full px-1">
            {student.name}
          </div>
        </>
      ) : (
        <div className="text-[var(--ink-4)] text-2xl font-light">+</div>
      )}
    </div>
  );
};