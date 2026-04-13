import { useAuthStore } from '@app/store';
import { useAuthInternal } from './hooks/useAuthInternal';

/**
 * useAuth (Public Facade Hook): Chỉ export những gì feature khác cần dùng.
 * Các feature khác chỉ được sử dụng hook này thông qua @features/auth
 */
export const useAuth = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuthInternal(); 

  return {
    user,
    isAuthenticated,
    logout,
  };
};

export * from './types';
