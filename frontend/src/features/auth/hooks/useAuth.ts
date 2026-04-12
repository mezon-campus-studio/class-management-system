import { useState, useCallback } from 'react';
import { authApi } from '@features/auth/api';
import type { User, LoginRequest, RegisterRequest } from '@features/auth/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
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
          type: 'STUDENT',
          avatarUrl: '',
          joinedAt: new Date().toISOString(),
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
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
  }, []);

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
          type: data.type,
          avatarUrl: '',
          joinedAt: new Date().toISOString(),
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
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
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.signOut();
    } catch (err) {
      console.error('Lỗi đăng xuất:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    signup,
    logout,
  };
};
