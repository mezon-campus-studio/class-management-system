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

  createClass: async (data: {
    name: string;
    description: string;
    privacy: string;
    ownerUsername: string;
    code: string;
    avatar_url: string;
  }): Promise<ResponseDTO<ClassResponse>> => {
    
    // 1. Lấy token ra (Hào kiểm tra xem team lưu tên là 'token' hay 'access_token')
    const token = localStorage.getItem("auth-storage"); 

    console.log("Token hiện tại:", token);

    // 2. Gửi POST kèm theo cấu hình Header
    return apiClient.post<ResponseDTO<ClassResponse>>("/classes", data, {
      headers: {
        Authorization: `Bearer ${token}`, // Gửi "chìa khóa" cho Backend
      },
    });
  },
};
