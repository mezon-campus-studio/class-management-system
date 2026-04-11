import { useState, useEffect } from "react";
import { homeAPI } from "@features/home/api";
import type { ClassItems } from "@features/home/types";

export const useHome = () => {
  const [classes, setClasses] = useState<ClassItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  return { classes, isLoading, error, refresh: loadData };
};
