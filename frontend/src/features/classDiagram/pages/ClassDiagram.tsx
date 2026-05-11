import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useClassDiagram } from "@features/classDiagram/hooks/useClassDiagram";
import { Seat } from "@features/classDiagram/pages/Seat";
import type { AttendanceStatus } from "@features/classDiagram/types";
import { classDiagramAPI } from "@features/classDiagram/api";
import { useAuth } from "@features/auth";
import { ClassRole } from "@shared/domain/enums";
import { homeAPI } from "@features/home/api";

export const ClassDiagram = () => {
  const { classId } = useParams();
  const { data, isLoading, refresh } = useClassDiagram(classId!);
  const [mode, setMode] = useState<"view" | "attendance" | "setup">("view");
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );

  // --- THÊM STATE GÓC NHÌN ---
  const [perspective, setPerspective] = useState<"student" | "teacher">(
    "student",
  );
  const isTeacherView = perspective === "teacher";

  const { user } = useAuth();
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      if (!classId || !user?.id) return;
      try {
        const res = await homeAPI.getClassMembers(Number(classId));
        if (res.success) {
          const currentMember = res.data.find(
            (m) => String(m.user_id) === String(user.id),
          );
          if (currentMember && currentMember.role === ClassRole.CLASS_ADMIN) {
            setCanEdit(true);
          } else {
            setCanEdit(false);
          }
        }
      } catch (error) {
        console.error("Lỗi kiểm tra quyền:", error);
      }
    };
    checkPermission();
  }, [classId, user?.id]);

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
      try {
        // 1. TÌM CHỖ NGỒI HIỆN TẠI (SOURCE) CỦA HỌC SINH ĐANG ĐƯỢC CHỌN
        const currentSeat = data.seats.find((s) => s.id === selectedStudentId);

        await classDiagramAPI.assignSeat(
          selectedStudentId,
          row,
          col,
          side,
          classId!,
          currentSeat, // <--- Cực kỳ quan trọng để tạo ra payload source_...
        );
        setSelectedStudentId(null);
        refresh();
      } catch (error) {
        console.error("Lỗi khi gọi API xếp chỗ:", error);
        alert("Xếp chỗ thất bại, vui lòng thử lại!");
      }
    }
  };
  const firstRows = [1, 2, 3];
  const lastRows = [4, 5, 6];
  const cols = [1, 2, 3, 4];

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto p-2 md:p-4 bg-white min-h-screen">
      {/* 1. THANH CÔNG CỤ (Đã cấu trúc lại để không bị chồng lấp) */}
      <div className="flex flex-col gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
          {/* Nhóm chọn Chế độ */}
          {canEdit && (
            <div className="flex bg-slate-200/50 p-1 rounded-lg w-full sm:w-auto">
              {(["view", "attendance", "setup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 sm:flex-none px-3 py-2 rounded-md text-[11px] md:text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    mode === m
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <span className="hidden xs:inline">
                    {m === "view"
                      ? "Xem"
                      : m === "attendance"
                        ? "Điểm danh"
                        : "Xếp chỗ"}
                  </span>
                  <span className="xs:hidden">
                    {m === "view"
                      ? "Xem"
                      : m === "attendance"
                        ? "Điểm danh"
                        : "Xếp"}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Dải Thống kê */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar justify-start sm:justify-end">
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
      </div>

      {/* 2. KHU VỰC ĐIỀU KHIỂN RIÊNG (Khay chọn học sinh & Góc nhìn) */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-end gap-4 w-full">
        {/* Khay chọn học sinh (Cố định, không bị lộn ngược) */}
        <div className="w-full md:w-2/3">
          {mode === "setup" && (
            <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                {members.map((m) => {
                  const isAssigned = data.seats.some((s) => s.id === m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedStudentId(m.id)}
                      className={`px-3 py-1.5 rounded-md text-[10px] md:text-xs font-bold border transition-all ${
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
        </div>

        {/* Nút Góc nhìn (Dời xuống đây để không chèn ép thanh công cụ trên) */}
        <div className="flex justify-end w-full md:w-auto">
          <button
            onClick={() =>
              setPerspective(isTeacherView ? "student" : "teacher")
            }
            className="group flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[11px] md:text-xs font-bold bg-white text-indigo-700 border-2 border-indigo-100 hover:bg-indigo-50 transition-all shadow-sm w-full sm:w-auto"
          >
            <span className="text-sm">{isTeacherView ? "👨‍🏫" : "🎓"}</span>
            <span>Góc nhìn: {isTeacherView ? "Giáo viên" : "Học sinh"}</span>
          </button>
        </div>
      </div>

      {/* 3. CONTAINER SƠ ĐỒ LỚP HỌC (Tự động đảo ngược theo góc nhìn) */}
      <div
        className={`flex ${isTeacherView ? "flex-col-reverse" : "flex-col"} gap-8 transition-all duration-500 bg-slate-50/30 p-2 md:p-6 rounded-2xl`}
      >
        {/* KHU VỰC GIẢNG ĐƯỜNG / BẢNG ĐEN */}
        <div
          className={`flex items-end justify-between w-full pt-4 md:pt-8 pb-4 px-2 md:px-10 ${isTeacherView ? "flex-row-reverse" : ""}`}
        >
          <div className="flex flex-col items-start w-1/4">
            <div className="bg-yellow-400 px-4 md:px-8 py-3 rounded-xl font-bold text-slate-800 shadow-md border-b-4 border-yellow-600 text-[9px] md:text-xs whitespace-nowrap">
              BÀN GIÁO VIÊN
            </div>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className="w-full max-w-[130px] md:max-w-[450px] h-3 bg-slate-800 rounded-full flex items-center justify-center shadow-2xl border border-slate-600 relative">
              <span
                className={`absolute -top-6 text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] md:tracking-[0.6em] whitespace-nowrap ${isTeacherView ? "rotate-180" : ""}`}
              >
                Bảng Đen
              </span>
            </div>
          </div>
          <div className="hidden md:block w-1/4"></div>
        </div>

        {/* LƯỚI CHỖ NGỒI (Xoay 180 độ) */}
        <div
          style={{ transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
          className={`grid grid-cols-[1fr_auto_1fr] gap-4 md:gap-10 pt-4 ${mode !== "view" ? "cursor-crosshair" : ""} ${isTeacherView ? "rotate-180" : "rotate-0"}`}
        >
          {/* Dãy Trái */}
          <div className="flex flex-col gap-6 md:gap-8">
            {[firstRows, lastRows].map((rows, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2">
                {rows.map((r) =>
                  cols.map((c) => (
                    <div
                      key={`L-${r}-${c}`}
                      onClick={() => handleSeatClick("left", r, c)}
                      className={`transition-transform duration-500 ${isTeacherView ? "rotate-180" : ""}`}
                    >
                      <Seat
                        student={data.seats.find(
                          (s) =>
                            s.side === "left" && s.row === r && s.column === c,
                        )}
                      />
                    </div>
                  )),
                )}
              </div>
            ))}
          </div>

          {/* LỐI ĐI GIỮA */}
          <div className="flex flex-col items-center justify-center px-1 md:px-4 relative">
            <div className="h-full w-px bg-slate-200 border-l border-dashed border-slate-300 relative flex items-center justify-center">
              <span
                className={`absolute bg-white py-4 px-1 text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] [writing-mode:vertical-lr] ${isTeacherView ? "" : "rotate-180"}`}
              >
                Lối đi
              </span>
            </div>
          </div>

          {/* Dãy Phải */}
          <div className="flex flex-col gap-6 md:gap-8">
            {[firstRows, lastRows].map((rows, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2">
                {rows.map((r) =>
                  cols.map((c) => (
                    <div
                      key={`R-${r}-${c}`}
                      onClick={() => handleSeatClick("right", r, c)}
                      className={`transition-transform duration-500 ${isTeacherView ? "rotate-180" : ""}`}
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

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
    className={`px-2 py-1.5 rounded-lg text-[10px] md:text-[11px] font-bold shadow-sm border flex items-center gap-1.5 whitespace-nowrap ${color}`}
  >
    <span className="opacity-60">{label}:</span>
    <span className="font-black">{val}</span>
  </div>
);
