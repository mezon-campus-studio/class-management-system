import { apiClient } from "@services/api-client";
import type { ResponseDTO } from "@shared/types";
import type { LoginRequest, RegisterRequest, AuthResponse, RegisterResponse, SignOutRequest, SignOutResponse } from "@features/auth/types";

export const authApi = {
    signIn: async (data: LoginRequest): Promise<ResponseDTO<AuthResponse>> => {
        return apiClient.post<ResponseDTO<AuthResponse>>("/auth/signin", data);
    },

    signUp: async (data: RegisterRequest): Promise<ResponseDTO<RegisterResponse>> => {
        return apiClient.post<ResponseDTO<RegisterResponse>>("/auth/signup", data);
    },

    signOut: async (data: SignOutRequest): Promise<ResponseDTO<SignOutResponse>> => {
        return apiClient.post<ResponseDTO<SignOutResponse>>("/auth/signout", data);
    },
};
