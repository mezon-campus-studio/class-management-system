// src/features/classDiagram/pages/Group.tsx
import type { GroupData } from "@features/classDiagram/types";
import { Seat } from "@features/classDiagram/pages/Seat";

interface GroupProps {
  groupData: GroupData;
  isTeacherView: boolean;
  onSeatClick: (groupId: number, deskId: number, positionId: number) => void;
  selectedStudentId: string | null;
}

export const Group = ({
  groupData,
  isTeacherView,
  onSeatClick,
  selectedStudentId,
}: GroupProps) => {
  return (
    <div className="bg-[var(--bg-surface-2)] p-3 rounded-2xl border border-[var(--rule-md)] shadow-[var(--shadow-sm)] flex flex-col items-center gap-3 w-fit">
      <div
        className={`px-4 py-1 bg-[var(--bg-surface)] border border-[var(--rule-md)] rounded-full text-[10px] md:text-xs font-bold text-[var(--ink-2)] shadow-[var(--shadow-xs)] uppercase ${isTeacherView ? "rotate-180" : ""}`}
      >
        {groupData.name || `Tổ ${groupData.groupId}`}
      </div>

      <div className="flex flex-col gap-3">
        {groupData.desks.map((desk) => (
          <div
            key={`desk-${desk.deskId}`}
            className="grid grid-cols-4 gap-2 p-1.5 bg-[var(--bg-surface-3)] rounded-xl"
          >
            {desk.positions.map((pos) => (
              <Seat
                key={`pos-${pos.positionId}`}
                student={pos.student}
                isSelected={selectedStudentId === pos.student?.id}
                isTeacherView={isTeacherView}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeatClick(groupData.groupId, desk.deskId, pos.positionId);
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};