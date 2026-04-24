import { useState, useEffect, useCallback } from "react";
import type { ID } from "@shared/utils/common";
import { leaveAPI } from "../api";
import type { LeaveRequest, CreateLeaveRequestDTO } from "../types";

/**
 * Hook nội bộ xử lý logic nghiệp vụ cho module Nghỉ phép
 * @param classId ID của lớp học hiện tại
 */
export const useLeaveInternal = (classId: ID) => {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Tải danh sách đơn nghỉ phép
     */
    const fetchLeaves = useCallback(async () => {
        if (!classId) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const response = await leaveAPI.getLeavesByClass(classId);
            if (response.success) {
                setLeaves(response.data);
            } else {
                setError(response.message);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Không thể kết nối đến máy chủ";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [classId]);

    /**
     * Gửi đơn xin nghỉ phép mới
     */
    const submitLeave = async (data: Omit<CreateLeaveRequestDTO, "classId">) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await leaveAPI.createLeave({ ...data, classId });
            if (response.success) {
                // Cập nhật state cục bộ để UI phản hồi ngay lập tức
                setLeaves(prev => [response.data, ...prev]);
                return true;
            } else {
                setError(response.message);
                return false;
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Lỗi khi gửi đơn xin nghỉ";
            setError(message);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    // Tự động tải dữ liệu khi hook được mount hoặc classId thay đổi
    useEffect(() => {
        fetchLeaves();
    }, [fetchLeaves]);

    return {
        leaves,
        isLoading,
        isSubmitting,
        error,
        fetchLeaves,
        submitLeave
    };
};
