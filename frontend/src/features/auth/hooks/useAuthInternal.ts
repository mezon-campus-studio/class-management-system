import { useState, useCallback } from 'react';
import { authApi } from '@features/auth/api';
import type { LoginRequest, RegisterRequest } from '@features/auth/types';
import type { User } from '@shared/domain/user';
import { useAuthStore } from './useAuthStore';

/**
 * useAuthInternal: Chỉ dùng nội bộ trong feature auth (LoginPage, RegisterPage)
 * Chứa các logic xử lý form, loading state và error handling.
 */
export const useAuthInternal = () => {
    const { setUser, logout: storeLogout } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(async (data: LoginRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authApi.signIn(data);
            if (response.success) {
                const mockUser: User = {
                    id: 1,
                    username: data.username,
                    displayName: data.username,
                    type: 'INTERNAL',
                    avatarUrl: '',
                    joinedAt: new Date().toISOString(),
                };
                setUser(mockUser);
                return true;
            } else {
                setError(response.message);
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Lỗi đăng nhập');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [setUser]);

    const signup = useCallback(async (data: RegisterRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authApi.signUp(data);
            if (response.success) {
                const mockUser: User = {
                    id: 1,
                    username: data.username,
                    displayName: data.displayName,
                    type: 'INTERNAL',
                    avatarUrl: '',
                    joinedAt: new Date().toISOString(),
                };
                setUser(mockUser);
                return true;
            } else {
                setError(response.message);
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Lỗi đăng ký');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [setUser]);

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await authApi.signOut();
        } catch (err) {
            console.error('Lỗi đăng xuất:', err);
        } finally {
            storeLogout();
            setIsLoading(false);
        }
    }, [storeLogout]);

    return {
        isLoading,
        error,
        login,
        signup,
        logout,
    };
};
