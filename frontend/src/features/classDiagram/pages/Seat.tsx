import type { StudentSeat } from "@features/classDiagram/types";

export const Seat = ({ student }: { student?: StudentSeat }) => {
  if (!student) {
    return <div className="h-12 bg-gray-100/50 border border-dashed border-gray-200 rounded" />;
  }

  const statusColors = {
    present: "bg-green-50 border-green-200 text-green-700",
    absent_excused: "bg-yellow-100 border-yellow-300 text-yellow-800",
    absent_unexcused: "bg-red-500 border-red-600 text-white",
    empty: "bg-gray-100 border-gray-200 text-gray-400"
  };

  return (
    <div className={`h-12 border rounded flex items-center justify-center p-1 text-[10px] font-bold text-center leading-tight shadow-sm transition-all hover:scale-105 ${statusColors[student.status]}`}>
      {student.name}
    </div>
  );
};