import { apiClient } from "@services/api-client";
import type { ResponseDTO } from "@shared/types";
import type { LoginRequest, RegisterRequest } from "@features/auth/types";

export const authApi = {
  signIn: async (data: LoginRequest): Promise<ResponseDTO<string>> => {
    return apiClient.post<ResponseDTO<string>>("/auth/signin", data);
  },

  signUp: async (data: RegisterRequest): Promise<ResponseDTO<string>> => {
    return apiClient.post<ResponseDTO<string>>("/auth/signup", data);
  },

  signOut: async (): Promise<ResponseDTO<string>> => {
    return apiClient.post<ResponseDTO<string>>("/auth/signout", {});
  },
};
