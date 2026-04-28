import { useCallback } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, Heart } from 'lucide-react';
import { useAuthStore } from '@/app/store';
import { Breadcrumb } from '@/shared/components/layout/Breadcrumb';
import { parentApi } from '../api';

export function ParentLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const fetchClassroomName = useCallback(
    (id: string) => parentApi.getClassroomDetail(id).then((d) => d.name),
    [],
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-paper)' }}>
      <header
        className="shrink-0 flex items-center justify-between px-6 z-30"
        style={{
          height: 'var(--topbar-h)',
          background: 'var(--sidebar-bg)',
          borderBottom: '1px solid var(--sidebar-border)',
        }}
      >
        <Link to="/parent" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background: 'var(--sidebar-accent)' }}>
            <Heart size={16} className="text-white" />
          </div>
          <span className="font-semibold text-sm" style={{ color: 'var(--sidebar-text-active)' }}>
            Cổng Phụ huynh
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: 'var(--sidebar-text)' }}>
            {user?.displayName}
          </span>
          <button onClick={handleLogout} className="btn btn-icon btn-ghost"
                  style={{ color: 'var(--sidebar-text)' }} title="Đăng xuất">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto flex flex-col">
        <Breadcrumb
          fetchClassroomName={fetchClassroomName}
          rootLabel="Cổng phụ huynh"
          rootPath="/parent"
        />
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
