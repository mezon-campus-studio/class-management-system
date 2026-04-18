import type { ID, Timestamp } from "@shared/utils/common";

/**
 * Các trạng thái của một đơn xin nghỉ phép
 */
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

/**
 * Model đại diện cho một bản ghi đơn xin nghỉ phép
 */
export interface LeaveRequest {
    id: ID;
    classId: ID;
    userId: ID;
    userName: string;
    reason: string;
    fromDate: string; // Định dạng YYYY-MM-DD
    toDate: string;   // Định dạng YYYY-MM-DD
    proofUrl?: string;
    status: LeaveStatus;
    createdAt: Timestamp;
}

/**
 * DTO dùng để tạo đơn xin nghỉ phép mới
 */
export interface CreateLeaveRequestDTO {
    classId: ID;
    reason: string;
    fromDate: string;
    toDate: string;
    proofUrl?: string;
}

/**
 * DTO dùng để cập nhật trạng thái đơn (dành cho Admin)
 */
export interface UpdateLeaveStatusDTO {
    status: LeaveStatus;
}
