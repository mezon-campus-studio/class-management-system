import type { ClassItems, ClassResponse } from "@features/home/types";
import { apiClient } from "@services/api-client";
import type { ResponseDTO } from "@shared/types";

const mockData: ClassItems[] = [
  {
    id: "1",
    className: "Lập trình .NET nâng cao",
    owner: "Nguyễn Văn A",
    status: "PUBLIC",
    classCode: "DOTNET123",
    userJoinStatus: "joined",
  },
  {
    id: "2",
    className: "Phát triển Web với React",
    owner: "Trần Thị B",
    status: "PRIVATE",
    classCode: "REACT456",
    userJoinStatus: "pending",
  },
];

export const homeAPI = {
  getClasses: async (): Promise<ClassItems[]> => {
    // KHI MUỐN DÙNG MOCK:
    return new Promise((resolve) => setTimeout(() => resolve(mockData), 500));

    // KHI MUỐN DÙNG THẬT (Bỏ cmt phía dưới):
    /*
    const response = await fetch('url');
    if(!response.ok) throw new Error('Lỗi kết nối');
    return response.json();
    */
  },

  createClass: async (
    data: Omit<ClassResponse, "id">,
  ): Promise<ResponseDTO<ClassResponse>> => {
    const authStorage = localStorage.getItem("auth-storage");
    let token = null;

    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        token = parsed.state.user?.token || parsed.state.user?.accessToken;
      } catch (e) {
        console.error("Lỗi parse JSON auth-storage", e);
      }
    }

    console.log("Token thực sự gửi đi:", token); // Nếu cái này hiện null là do bước Login chưa lưu token vào User

    return apiClient.post<ResponseDTO<ClassResponse>>("/classes", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  },

  getClassByCode: async (code: string): Promise<ResponseDTO<ClassItems>> => {
    const authStorage = localStorage.getItem("auth-storage");
    let token = null;
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      token = parsed.state.user?.token || parsed.state.user?.accessToken;
    }

    // Gọi API tìm thông tin lớp bằng mã code
    return apiClient.get<ResponseDTO<ClassItems>>(`/classes/code/${code}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  joinClass: async (
    classId: string,
    code?: string,
  ): Promise<ResponseDTO<string>> => {
    const authStorage = localStorage.getItem("auth-storage");
    let token = null;

    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        token = parsed.state.user?.token || parsed.state.user?.accessToken;
      } catch (e) {
        console.error("Lỗi parse JSON auth-storage", e);
      }
    }

    return apiClient.post<ResponseDTO<string>>(
      `/classes/${classId}/join`,
      { code: code },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
  },
};
