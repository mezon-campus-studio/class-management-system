import { useState, useEffect } from "react";
import { homeAPI } from "@features/home/api";
import type { ClassItems, ClassResponse } from "@features/home/types";
import { useAuth } from "@features/auth";
import { ClassPrivacy } from "@shared/domain/enums";

export const useHome = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

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
      const payload : Omit<ClassResponse, "id"> = {
        name: formData.className,
        description: formData.description,
        privacy: formData.status as ClassPrivacy,
        owner_username: user?.username || "alice",
        avatar_url: "",
      };
      console.log("Dữ liệu thực tế bọc lên Frontend:", payload);
      const res = await homeAPI.createClass(payload);

      if (res.success) {
        console.log("Tạo lớp thành công!");
        await loadData();
      } else {
        throw new Error(res.message || "Tạo lớp thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi tạo lớp:", err);
      throw err; 
    } finally {
      setIsCreating(false);
    }
  };

  //goi API join class
  const joinClassMutation = async (code: string) => {
    try {
      setIsJoining(true);
      setError(null);
      
      const res = await homeAPI.joinClass(code);

      if (res.success) {
        console.log("Tham gia lớp thành công!");
        await loadData(); // Tự động load lại danh sách lớp mới
        return res.data;  // Trả về data (JoinClassDto) để Component dùng nếu cần
      } else {
        throw new Error(res.message || "Không thể tham gia lớp học");
      }
    } catch (err: unknown) {
      console.error("Lỗi khi tham gia lớp:", err);
      // Ném lỗi ra để Modal/Component hứng và hiển thị cho người dùng
      throw err; 
    } finally {
      setIsJoining(false);
    }
  };

  return {
    classes,
    isLoading,
    isCreating,
    isJoining,
    error,
    refresh: loadData,
    createClassMutation,
    joinClassMutation,
  };
};
