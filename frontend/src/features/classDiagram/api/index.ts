import type {
  ClassDiagramData,
  AttendanceStatus,
} from "@features/classDiagram/types";
import { homeAPI } from "@features/home/api";

// Dữ liệu giả mô phỏng đúng thiết kế Figma
const mockDiagramData: ClassDiagramData = {
  totalStudents: 40,
  presentCount: 35,
  excusedCount: 3,
  unexcusedCount: 3,
  seats: [
    // Dãy trái
    {
      id: "s1",
      name: "Phong Hào",
      row: 1,
      column: 1,
      side: "left",
      status: "present",
    },
    {
      id: "s2",
      name: "",
      row: 1,
      column: 3,
      side: "left",
      status: "absent_excused",
    }, // Ô vàng
    {
      id: "s3",
      name: "Trần Việt Tuấn",
      row: 2,
      column: 1,
      side: "left",
      status: "empty",
    }, // Ô xám
    {
      id: "s4",
      name: "Thiên Bảo",
      row: 3,
      column: 1,
      side: "left",
      status: "present",
    },
    { id: "s5", name: "", row: 3, column: 3, side: "left", status: "empty" },
    {
      id: "s6",
      name: "Thế Sơn",
      row: 4,
      column: 1,
      side: "left",
      status: "present",
    },
    {
      id: "s7",
      name: "",
      row: 4,
      column: 3,
      side: "left",
      status: "absent_unexcused",
    }, // Ô đỏ
    {
      id: "s8",
      name: "Gia Huy",
      row: 5,
      column: 1,
      side: "left",
      status: "present",
    },
    { id: "s9", name: "", row: 5, column: 2, side: "left", status: "empty" },
    { id: "s10", name: "", row: 6, column: 2, side: "left", status: "empty" },

    // Dãy phải
    { id: "s11", name: "", row: 2, column: 2, side: "right", status: "empty" },
    {
      id: "s12",
      name: "",
      row: 2,
      column: 3,
      side: "right",
      status: "absent_unexcused",
    },
    {
      id: "s13",
      name: "",
      row: 5,
      column: 2,
      side: "right",
      status: "absent_excused",
    },
    {
      id: "s14",
      name: "",
      row: 5,
      column: 4,
      side: "right",
      status: "absent_excused",
    },
    { id: "s15", name: "", row: 6, column: 3, side: "right", status: "empty" },
  ],
};

export const classDiagramAPI = {
  getDiagram: async (classId: string): Promise<ClassDiagramData> => {
    // KHI TEST: Trả về mock data
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockDiagramData), 500),
    );
    console.log("Đang lấy sơ đồ cho lớp có ID:", classId); //giả lập dùng vì kết nối api thật cần dùng classId

    // KHI NỐI THẬT:
    /*
    const response = await fetch(`/api/classes/${classId}/diagram`);
    if (!response.ok) throw new Error("Lỗi lấy sơ đồ lớp");
    return response.json();
    */
  },
  //cập nhật trang thái điểm danh
  updateAttendance: async (studentId: string, status: AttendanceStatus) => {
    console.log(`API: Cập nhật SV ${studentId} sang trạng thái ${status}`);
    return new Promise((resolve) => setTimeout(resolve, 300));
  },
  //xếp học sinh vào chỗ mới
  assignSeat: async (
    studentId: string,
    row: number,
    col: number,
    side: "left" | "right",
  ) => {
    console.log(
      `API: Xếp SV ${studentId} vào Hàng ${row}, Cột ${col}, Dãy ${side}`,
    );
    return new Promise((resolve) => setTimeout(resolve, 300));
  },
 
  getMembers: async (classId: string): Promise<{ id: string; name: string }[]> => {
    try {
      const res = await homeAPI.getClassMembers(Number(classId));
      
      if (res.success) {
        // 🚀 ĐÃ SỬA LẠI KHỚP 100% VỚI LOG CỦA BACKEND
        return res.data.map((m) => ({
          id: String(m.member_id),                   // Lấy ID học sinh
          name: m.member_display_name || "Vô danh", // Lấy tên học sinh
        }));
      }
      return [];
    } catch (error) {
      console.error("Lỗi lấy thành viên:", error);
      return [];
    }
  },
};
