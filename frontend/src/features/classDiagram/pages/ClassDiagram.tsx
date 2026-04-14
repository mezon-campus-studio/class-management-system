import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useClassDiagram } from "@features/classDiagram/hooks/useClassDiagram";
import { Seat } from "@features/classDiagram/pages/Seat";
import type { AttendanceStatus } from "@features/classDiagram/types";
import { classDiagramAPI } from "@features/classDiagram/api";
import { useAuth } from "@features/auth";

export const ClassDiagram = () => {
  const { classId } = useParams();
  const { data, isLoading, refresh } = useClassDiagram(classId!);
  const [mode, setMode] = useState<"view" | "attendance" | "setup">("view");
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );

  // Kiểm tra quyền chỉnh sửa (Ví dụ: role là 'teacher' hoặc 'admin')
  const { user } = useAuth();
  const canEdit = user?.type === "TEACHER" || user?.type === "ADMIN";

  useEffect(() => {
    let isMounted = true;
    const loadMembers = async () => {
      if (mode === "setup" && classId) {
        try {
          const memberList = await classDiagramAPI.getMembers(classId);
          if (isMounted) setMembers(memberList);
        } catch (error) {
          console.error(error);
        }
      } else {
        setMembers([]);
        setSelectedStudentId(null);
      }
    };
    loadMembers();
    return () => {
      isMounted = false;
    };
  }, [mode, classId]);

  if (isLoading || !data)
    return (
      <div className="p-10 text-center animate-pulse text-slate-400 font-medium">
        Đang tải dữ liệu...
      </div>
    );

  const handleSeatClick = async (
    side: "left" | "right",
    row: number,
    col: number,
  ) => {
    const studentAtSeat = data.seats.find(
      (s) => s.side === side && s.row === row && s.column === col,
    );

    if (mode === "attendance" && studentAtSeat?.id) {
      const nextStatus: Record<string, AttendanceStatus> = {
        present: "absent_excused",
        absent_excused: "absent_unexcused",
        absent_unexcused: "present",
      };
      await classDiagramAPI.updateAttendance(
        studentAtSeat.id,
        nextStatus[studentAtSeat.status] || "present",
      );
      refresh();
    }

    if (mode === "setup" && selectedStudentId) {
      await classDiagramAPI.assignSeat(selectedStudentId, row, col, side);
      refresh();
    }
  };

  // Chia hàng thành 2 nhóm: 3 hàng đầu và 3 hàng cuối
  const firstRows = [1, 2, 3];
  const lastRows = [4, 5, 6];
  const cols = [1, 2, 3, 4];

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto p-2 md:p-4 bg-white min-h-screen">
      {/* 1. THANH CÔNG CỤ (1 HÀNG, ĐẦY ĐỦ NHÃN CHỮ) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
        {canEdit && (
          <div className="flex bg-slate-200/50 p-1 rounded-lg shrink-0">
            {(["view", "attendance", "setup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-md text-[10px] md:text-xs font-bold transition-all ${
                  mode === m
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {m === "view"
                  ? "Xem"
                  : m === "attendance"
                    ? "Điểm danh"
                    : "Xếp chỗ"}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-1 justify-end gap-2 overflow-x-auto no-scrollbar py-1 ">
          <Badge
            color="bg-slate-100 text-slate-600 border-slate-200"
            label="Sĩ số"
            val={data.totalStudents}
          />
          <Badge
            color="bg-green-50 text-green-700 border-green-200"
            label="Có mặt"
            val={data.presentCount}
          />
          <Badge
            color="bg-yellow-50 text-yellow-700 border-yellow-200"
            label="Vắng phép"
            val={data.excusedCount}
          />
          <Badge
            color="bg-red-50 text-red-600 border-red-200"
            label="Không phép"
            val={data.unexcusedCount}
          />
        </div>
      </div>

      {/* 2. KHU VỰC GIẢNG ĐƯỜNG (Bàn sát trái, Bảng cân giữa lối đi) */}
      <div className="flex items-end justify-between w-full pt-8 pb-4 px-4 md:px-10">
        {/* Bàn giáo viên: Ép sát lề trái */}
        <div className="flex flex-col items-start w-1/4">
          <div className="bg-yellow-400 px-4 md:px-8 py-3 rounded-xl font-bold text-slate-800 shadow-md border-b-4 border-yellow-600 text-[9px] md:text-xs whitespace-nowrap transition-transform hover:scale-105">
            BÀN GIÁO VIÊN
          </div>
        </div>

        {/* Bảng đen: Căn giữa theo trục lối đi */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-full max-w-[130px] md:max-w-[450px] h-3 bg-slate-800 rounded-full flex items-center justify-center shadow-2xl border border-slate-600 relative">
            <span className="absolute -top-6 text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] md:tracking-[0.6em] whitespace-nowrap">
              Bảng Đen
            </span>
          </div>
        </div>

        {/* Khoảng trống bên phải để cân bằng layout (w-1/4 giống bàn GV) */}
        <div className="hidden md:block w-1/4"></div>
      </div>
      {/* 3. KHAY CHỌN HỌC SINH (Setup Mode) */}
      {mode === "setup" && (
        <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
            {members.map((m) => {
              const isAssigned = data.seats.some((s) => s.id === m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedStudentId(m.id)}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold border transition-all ${
                    selectedStudentId === m.id
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : isAssigned
                        ? "bg-slate-100 text-slate-400 border-slate-200"
                        : "bg-white text-slate-600 border-slate-300"
                  }`}
                >
                  {m.name} {isAssigned && "✓"}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SƠ ĐỒ CHỖ NGỒI (CHIA KHOẢNG CÁCH GIỮA HÀNG 3-4) */}
      <div
        className={`grid grid-cols-[1fr_auto_1fr] gap-4 md:gap-10 pt-4 ${mode !== "view" ? "cursor-crosshair" : ""}`}
      >
        {/* Dãy Trái */}
        <div className="flex flex-col gap-6 md:gap-8">
          <div className="grid grid-cols-4 gap-2">
            {firstRows.map((r) =>
              cols.map((c) => (
                <div
                  key={`L-${r}-${c}`}
                  onClick={() => handleSeatClick("left", r, c)}
                >
                  <Seat
                    student={data.seats.find(
                      (s) => s.side === "left" && s.row === r && s.column === c,
                    )}
                  />
                </div>
              )),
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {lastRows.map((r) =>
              cols.map((c) => (
                <div
                  key={`L-${r}-${c}`}
                  onClick={() => handleSeatClick("left", r, c)}
                >
                  <Seat
                    student={data.seats.find(
                      (s) => s.side === "left" && s.row === r && s.column === c,
                    )}
                  />
                </div>
              )),
            )}
          </div>
        </div>

        {/* LỐI ĐI GIỮA */}
        <div className="flex flex-col items-center justify-center px-1 md:px-4 relative">
          <div className="h-full w-px bg-slate-200 border-l border-dashed border-slate-300 relative flex items-center justify-center">
            <span className="absolute bg-white py-4 px-1 text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] [writing-mode:vertical-lr] rotate-180">
              Lối đi
            </span>
          </div>
        </div>

        {/* Dãy Phải */}
        <div className="flex flex-col gap-6 md:gap-8">
          <div className="grid grid-cols-4 gap-2">
            {firstRows.map((r) =>
              cols.map((c) => (
                <div
                  key={`R-${r}-${c}`}
                  onClick={() => handleSeatClick("right", r, c)}
                >
                  <Seat
                    student={data.seats.find(
                      (s) =>
                        s.side === "right" && s.row === r && s.column === c,
                    )}
                  />
                </div>
              )),
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {lastRows.map((r) =>
              cols.map((c) => (
                <div
                  key={`R-${r}-${c}`}
                  onClick={() => handleSeatClick("right", r, c)}
                >
                  <Seat
                    student={data.seats.find(
                      (s) =>
                        s.side === "right" && s.row === r && s.column === c,
                    )}
                  />
                </div>
              )),
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Badge component với đầy đủ nhãn chữ
const Badge = ({
  color,
  label,
  val,
}: {
  color: string;
  label: string;
  val: number;
}) => (
  <div
    className={`px-2 py-1.5 rounded-lg text-[9px] md:text-[10px] font-bold shadow-sm border flex items-center gap-1.5 whitespace-nowrap ${color}`}
  >
    <span className="opacity-60">{label}:</span>
    <span className="font-black">{val}</span>
  </div>
);
