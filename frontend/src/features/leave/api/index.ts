import type { ApiResponse, ID } from "@shared/utils/common";
import type { LeaveRequest, CreateLeaveRequestDTO, UpdateLeaveStatusDTO } from "../types";

// Mock data lưu trữ cục bộ trong memory để test luồng
let mockLeaves: LeaveRequest[] = [
    {
        id: 1,
        classId: 1,
        userId: 101,
        userName: "Nguyễn Văn A",
        reason: "Em bị sốt xuất huyết cần nghỉ điều trị",
        fromDate: "2026-04-18",
        toDate: "2026-04-20",
        status: "PENDING",
        createdAt: new Date().toISOString(),
    },
    {
        id: 2,
        classId: 1,
        userId: 102,
        userName: "Trần Thị B",
        reason: "Gia đình có việc hiếu",
        fromDate: "2026-04-15",
        toDate: "2026-04-16",
        status: "APPROVED",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
        id: 3,
        classId: 1,
        userId: 101,
        userName: "Nguyễn Văn A",
        reason: "Đi khám răng định kỳ",
        fromDate: "2026-04-10",
        toDate: "2026-04-10",
        status: "REJECTED",
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    }
];

/**
 * Service thao tác với dữ liệu nghỉ phép (Mocked)
 */
export const leaveAPI = {
    /**
     * Lấy danh sách đơn nghỉ phép theo lớp
     */
    getLeavesByClass: async (classId: ID): Promise<ApiResponse<LeaveRequest[]>> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const leaves = mockLeaves.filter(leave => String(leave.classId) === String(classId));
                resolve({
                    success: true,
                    message: "Lấy danh sách thành công",
                    data: leaves,
                    time: new Date().toISOString()
                });
            }, 600);
        });
    },

    /**
     * Tạo mới đơn xin nghỉ phép
     */
    createLeave: async (data: CreateLeaveRequestDTO): Promise<ApiResponse<LeaveRequest>> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newLeave: LeaveRequest = {
                    id: Math.floor(Math.random() * 10000) + 100,
                    ...data,
                    userId: 999, // Mock current user
                    userName: "Người dùng hiện tại",
                    status: "PENDING",
                    createdAt: new Date().toISOString()
                };
                mockLeaves = [newLeave, ...mockLeaves]; // Thêm vào đầu danh sách
                resolve({
                    success: true,
                    message: "Gửi đơn xin nghỉ thành công",
                    data: newLeave,
                    time: new Date().toISOString()
                });
            }, 800);
        });
    },

    /**
     * Cập nhật trạng thái đơn (Mock Admin)
     */
    updateLeaveStatus: async (id: ID, data: UpdateLeaveStatusDTO): Promise<ApiResponse<LeaveRequest>> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockLeaves.findIndex(l => l.id === id);
                if (index === -1) {
                    reject(new Error("Không tìm thấy đơn nghỉ phép"));
                    return;
                }
                
                mockLeaves[index] = { ...mockLeaves[index], status: data.status };
                resolve({
                    success: true,
                    message: "Cập nhật trạng thái thành công",
                    data: mockLeaves[index],
                    time: new Date().toISOString()
                });
            }, 500);
        });
    }
};
