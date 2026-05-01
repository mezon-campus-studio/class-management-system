import type { ClassItems, ClassResponse, ClassIdResponse, ClassMember } from "@features/home/types";
import { apiClient } from "@services/api-client";
import type { ResponseDTO } from "@shared/types";

export const homeAPI = {
  createClass: async (
    data: Omit<ClassResponse, "id">,
  ): Promise<ResponseDTO<ClassResponse>> => {
    const authStorage = localStorage.getItem("auth-storage");
    let token = null;

    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        token = parsed.state.user?.token || parsed.state.user?.access_token;
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
      token = parsed.state.user?.token || parsed.state.user?.access_token;
    }

    // Gọi API tìm thông tin lớp bằng mã code
    return apiClient.get<ResponseDTO<ClassItems>>(`/classes/code/${code}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  joinClass: async (code: string): Promise<ResponseDTO<string>> => {
    const authStorage = localStorage.getItem("auth-storage");
    let token = null;

    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        token = parsed.state.user?.token || parsed.state.user?.access_token;
      } catch (e) {
        console.error("Lỗi parse JSON auth-storage", e);
      }
    }

    return apiClient.post<ResponseDTO<string>>(
      `/classes/join`,
      { class_code: code },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
  },

  getClasses: async (): Promise<ClassItems[]> => {
    const authStorage = localStorage.getItem("auth-storage");
    let token = null;
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      token = parsed.state.user?.token || parsed.state.user?.access_token;
    }

    // Gọi API thật tới Backend
    const response = await apiClient.get<ResponseDTO<ClassItems[]>>(
      "/classes",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  },

  // Rời khỏi lớp 
  leaveClass: async (classId: number): Promise<ResponseDTO<ClassIdResponse>> => {
    const authStorage = localStorage.getItem("auth-storage");
    let token = null;
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      token = parsed.state.user?.token || parsed.state.user?.access_token;
    }

    return apiClient.delete<ResponseDTO<ClassIdResponse>>(`/classes/${classId}/leave`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Xóa lớp 
  deleteClass: async (classId: number): Promise<ResponseDTO<ClassIdResponse>> => {
    const authStorage = localStorage.getItem("auth-storage");
    let token = null;
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      token = parsed.state.user?.token || parsed.state.user?.access_token;
    }

    return apiClient.delete<ResponseDTO<ClassIdResponse>>(`/classes/${classId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Cập nhật/Sửa lớp
  updateClass: async (
    classId: number,
    data: Partial<ClassResponse>, 
  ): Promise<ResponseDTO<ClassResponse>> => {
    const authStorage = localStorage.getItem("auth-storage");
    let token = null;
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      token = parsed.state.user?.token || parsed.state.user?.access_token;
    }

    return apiClient.patch<ResponseDTO<ClassResponse>>(
      `/classes/${classId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
  },

  getClassMembers: async (classId: number): Promise<ResponseDTO<ClassMember[]>> => {
    const authStorage = localStorage.getItem("auth-storage");
    let token = null;
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      token = parsed.state.user?.token || parsed.state.user?.access_token;
    }

    return apiClient.get<ResponseDTO<ClassMember[]>>(`/classes/${classId}/members`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
