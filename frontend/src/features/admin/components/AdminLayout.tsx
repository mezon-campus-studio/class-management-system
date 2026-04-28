import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Shield, LayoutDashboard, Users, BookOpen, CalendarDays } from 'lucide-react';
import { useAuthStore } from '@/app/store';
import { Breadcrumb } from '@/shared/components/layout/Breadcrumb';

const NAV = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Tổng quan',         end: true },
  { to: '/admin/users',      icon: Users,           label: 'Người dùng' },
  { to: '/admin/classrooms', icon: BookOpen,        label: 'Lớp học' },
  { to: '/admin/timetable',  icon: CalendarDays,    label: 'Thời khoá biểu' },
];

export function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-paper)' }}>
      <aside className="w-60 shrink-0 flex flex-col"
             style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}>
        <div className="px-5 py-4 flex items-center gap-2"
             style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background: 'var(--sidebar-accent)' }}>
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-semibold text-sm" style={{ color: 'var(--sidebar-text-active)' }}>
            Admin Panel
          </span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive ? 'font-semibold' : ''
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
              })}
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
          <p className="text-xs px-3 py-1 truncate" style={{ color: 'var(--sidebar-text)' }}>
            {user?.displayName}
          </p>
          <p className="text-[10px] px-3 truncate opacity-60" style={{ color: 'var(--sidebar-text)' }}>
            {user?.email}
          </p>
          <button onClick={handleLogout}
                  className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-md text-sm"
                  style={{ color: 'var(--sidebar-text)' }}>
            <LogOut size={14} /> Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto flex flex-col">
        <Breadcrumb rootLabel="Admin" rootPath="/admin" />
        <div className="flex-1"><Outlet /></div>
      </main>
    </div>
  );
}
