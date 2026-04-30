import { useState, useCallback } from "react";
import { authApi } from "@features/auth/api";
import type {
  LoginRequest,
  RegisterRequest,
  SignOutRequest,
} from "@features/auth/types";
import type { User } from "@shared/domain/user";
import { useAuthStore } from "./useAuthStore";
import { jwtDecode } from "jwt-decode";
import type { AccessTokenPayload } from "@features/auth/types/jwtpayload";
import { storage } from "@shared/storages";
import { AUTH_STORAGE_KEY } from "@features/auth/types/keyStorage";
import { UserType } from "@shared/domain/enums";

/**
 * useAuthInternal: Chỉ dùng nội bộ trong feature auth (LoginPage, RegisterPage)
 * Chứa các logic xử lý form, loading state và error handling.
 */
export const useAuthInternal = () => {
  const { setUser, logout: storeLogout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // đăng nhập
  // File: useAuthInternal.ts
  const login = useCallback(
    async (data: LoginRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authApi.signIn(data);
        if (response.success && response.data) {
          console.log("Dữ liệu thật từ Backend trả về:", response.data);

          const token = response.data;

          const accessToken = jwtDecode<AccessTokenPayload>(token.access_token);

          //  luu token vào localStorage thông qua storage abstraction
          storage.set(AUTH_STORAGE_KEY.TOKEN, token.access_token);
          storage.set(AUTH_STORAGE_KEY.REFRESH, token.refresh_token);

          // tạo đối tượng user từ payload của access token lưu vào Zustand store
          const userData: User = {
            id: accessToken.user_id || 0,
            username: data.username,
            type: "INTERNAL",
            avatarUrl: "",
            token: token.access_token, // them dong nay de bat token
          };

          setUser(userData); // Zustand sẽ tự lưu vào localStorage 'auth-storage'
          return true;
        } else {
          setError(response.message);
          return false;
        }
      } catch (err: any) {
        setError(err.message || "Lỗi đăng nhập");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [setUser],
  );

  // đăng kí
  const signup = useCallback(
    async (username: string, password: string, displayname: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const data: RegisterRequest = {
          username,
          password,
          display_name: displayname,
        };
        const response = await authApi.signUp(data);
        if (response.success && response.data) {
          const authData = response.data as any;

          const userData: User = {
            id: authData.id || 1,
            username: data.username,
            displayName: data.display_name,
            type: UserType.INTERNAL,
            avatarUrl: "",
            joinedAt: new Date().toISOString(),
            token: authData.accessToken,
          };

          setUser(userData);
          return true;
        } else {
          setError(response.message);
          return false;
        }
      } catch (err: any) {
        setError("Lỗi đăng ký, vui lòng thử lại");
        console.error("Lỗi đăng ký:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [setUser],
  );

  // đăng xuất
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const data: SignOutRequest = {
        accessToken: storage.get<string>(AUTH_STORAGE_KEY.TOKEN) || "",
      };
      await authApi.signOut(data);
    } catch (err) {
      console.error("Lỗi đăng xuất:", err);
      setError("Lỗi đăng xuất, vui lòng thử lại");
    } finally {
      storeLogout();
      setIsLoading(false);
    }
  }, [storeLogout]);

  const loginWithGoogle = useCallback(
    async (code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.callbackGoogle(code);
      if (response.success && response.data) {
        const token = response.data;
        const accessToken = jwtDecode<AccessTokenPayload>(token.access_token);

        storage.set(AUTH_STORAGE_KEY.TOKEN, token.access_token);
        storage.set(AUTH_STORAGE_KEY.REFRESH, token.refresh_token);

        const userData: User = {
          id: accessToken.user_id || 0,
          username: accessToken.sub || "",
          type: UserType.GOOGLE,
          avatarUrl: "",
          token: token.access_token,
        };

        setUser(userData);
        return true;
      } else {
        setError(response.message);
        return false;
      }
    } catch (err: any) {
      setError(err.message || "Lỗi xác thực Google");
      return false;
    } finally {
      setIsLoading(false);
    }
  },
  [setUser],
  );

  return {

    isLoading,
    error,
    login,
    signup,
    logout,
    loginWithGoogle,
  };
};
