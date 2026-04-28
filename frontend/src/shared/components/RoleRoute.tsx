import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/app/store';
import type { UserType } from '@/app/store';

interface Props {
  allow: UserType[];
}

/**
 * Đứng SAU PrivateRoute. Chỉ cho phép user thuộc các userType trong `allow` đi qua.
 * Các loại khác sẽ được redirect tới landing page tương ứng với role của họ.
 */
export function RoleRoute({ allow }: Props) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (allow.includes(user.userType)) return <Outlet />;

  switch (user.userType) {
    case 'SYSTEM_ADMIN': return <Navigate to="/admin" replace />;
    case 'PARENT':       return <Navigate to="/parent" replace />;
    default:             return <Navigate to="/" replace />;
  }
}

export function landingPathFor(userType: UserType): string {
  switch (userType) {
    case 'SYSTEM_ADMIN': return '/admin';
    case 'PARENT':       return '/parent';
    default:             return '/';
  }
}
