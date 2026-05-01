import { useState, useEffect } from "react";
import { homeAPI } from "@features/home/api";
import type { ClassMember } from "@features/home/types";

export const useClassMembers = (classId: number | null) => {
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMembers = async () => {
    if (!classId) return;
    try {
      setIsLoading(true);
      const res = await homeAPI.getClassMembers(classId);
      if (res.success) {
        setMembers(res.data);
      }
    } catch (err) {
      console.error("Lỗi lấy thành viên:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [classId]); // Chỉ gọi lại khi ID lớp thay đổi

  return { members, isLoading, refreshMembers: fetchMembers };
};