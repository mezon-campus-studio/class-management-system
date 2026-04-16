import { useCallback } from 'react';
import { useAuthStore } from './useAuthStore';
import type { LoginRequest, RegisterRequest } from '@features/auth/types';
import { useAuthInternal } from './useAuthInternal';

/**
 * useAuth: Public hook để sử dụng ở các component bên ngoài feature auth.
 * Cung cấp thông tin user hiện tại và các hàm login/logout cơ bản.
 */
export const useAuth = () => {
    const { user, isAuthenticated } = useAuthStore();
    const { login, signup, logout, isLoading, error } = useAuthInternal();

    const handleLogin = useCallback(async (data: LoginRequest) => {
        return await login(data);
    }, [login]);

    const handleSignup = useCallback(async (data: RegisterRequest) => {
        return await signup(data);
    }, [signup]);

    return {
        user,
        isAuthenticated,
        login: handleLogin,
        signup: handleSignup,
        logout,
        isLoading,
        error,
    };
};
