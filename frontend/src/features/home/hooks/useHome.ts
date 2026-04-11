import { useState, useEffect } from "react";
// import { homeAPI } from "@features/home/api"; bỏ cmt khi gọi api thật
import type { ClassItems } from "@features/home/types";

export const useHome = () => {
  const [classes, setClasses] = useState<ClassItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);

      /*dữ liệu chạy test */
      const mockData: ClassItems[] = [
        {
          id: "1",
          className: "Lập trình .NET nâng cao",
          owner: "Nguyễn Văn A",
          status: "public",
          classCode: "DOTNET123", // Chỉ cần mã
        },
        {
          id: "2",
          className: "Phát triển Web với React",
          owner: "Trần Thị B",
          status: "private",
          classCode: "REACT456",
          password: "123", // Nhóm kín có thêm pass
        },
      ];
      setClasses(mockData);

      /*bỏ cmt khi gọi api*/
      // const data = await homeAPI.getClasses();
      // setClasses(data);
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
