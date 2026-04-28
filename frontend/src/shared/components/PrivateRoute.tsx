import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/app/store';

export function PrivateRoute() {
  const { isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ink-blue-text border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
