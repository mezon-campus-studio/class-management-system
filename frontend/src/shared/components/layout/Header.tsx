import { useState } from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/app/store';
import { NotificationBell } from '@/features/notification/components/NotificationBell';

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      className="shrink-0 flex items-center justify-between px-4 z-30 relative"
      style={{
        height: 'var(--topbar-h)',
        background: 'var(--sidebar-bg)',
        borderBottom: '1px solid var(--sidebar-border)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="btn btn-icon btn-ghost" style={{ color: 'var(--sidebar-text)' }}>
          <Menu size={18} />
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <img src="/icon-192.png" alt="ClassroomHub" className="w-7 h-7 rounded-lg object-cover" />
          <span className="font-semibold text-sm hidden sm:block" style={{ color: 'var(--sidebar-text-active)' }}>
            ClassroomHub
          </span>
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {isAuthenticated && <NotificationBell />}
      <div className="relative">
        {isAuthenticated ? (
          <>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg transition-colors"
              style={{ color: 'var(--sidebar-text)' }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                   style={{ background: 'var(--sidebar-accent)' }}>
                {user?.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm hidden sm:block">{user?.displayName}</span>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 card shadow-lg z-50 animate-scale-in overflow-hidden">
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--rule)' }}>
                    <p className="text-sm font-semibold text-ink-1 truncate">{user?.displayName}</p>
                    <p className="text-xs text-ink-3 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors hover:bg-surface-2"
                    style={{ color: 'var(--red-text)' }}
                  >
                    <LogOut size={14} /> Đăng xuất
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <button onClick={() => navigate('/login')} className="btn btn-secondary btn-sm gap-1.5">
            <User size={14} /> Đăng nhập
          </button>
        )}
      </div>
      </div>
    </header>
  );
}
