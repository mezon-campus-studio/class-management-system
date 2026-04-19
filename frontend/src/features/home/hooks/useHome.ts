import { useState, useEffect } from "react";
import { homeAPI } from "@features/home/api";
import type { ClassItems } from "@features/home/types";
import { useAuth } from "@features/auth";

export const useHome = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await homeAPI.getClasses();
      setClasses(data);
    } catch {
      setError("Không thể tải danh sách lớp học");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createClassMutation = async (formData: {
    className: string;
    description: string;
    status: string;
  }) => {
    try {
      setIsCreating(true);
      const payload = {
        name: formData.className,    
        description: formData.description,
        privacy: formData.status,     
        code: `CL${Math.floor(1000 + Math.random() * 9000)}`,
        ownerUsername: user?.username || "hao_dang", 
        avatar_url: ""                 
      };

      const res = await homeAPI.createClass(payload);

      if (res.success) {
        console.log("Tạo lớp thành công!");
        await loadData(); // Tải lại danh sách để Sidebar cập nhật ngay
      } else {
        throw new Error(res.message || "Tạo lớp thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi tạo lớp:", err);
      throw err; // Ném lỗi để Modal hiển thị thông báo nếu cần
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    classes,
    isLoading,
    isCreating,
    error,
    refresh: loadData,
    createClassMutation,
  };
};
