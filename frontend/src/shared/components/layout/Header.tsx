import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, User, Camera, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/app/store';
import { NotificationBell } from '@/features/notification/components/NotificationBell';
import { memToken } from '@/services/api-client';

interface HeaderProps {
  toggleSidebar: () => void;
}

function useAuthenticatedImage(url: string | null | undefined) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url || !url.startsWith('/')) { setBlobUrl(null); return; }
    let revoked = false;
    let objectUrl: string | null = null;
    const token = memToken.get();
    fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : {})
      .then((r) => r.blob())
      .then((blob) => {
        if (revoked) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {});
    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return blobUrl;
}

function UserAvatar({ displayName, avatarUrl, size = 28 }: {
  displayName: string; avatarUrl: string | null | undefined; size?: number;
}) {
  const blobUrl = useAuthenticatedImage(avatarUrl);
  const src = blobUrl ?? (avatarUrl?.startsWith('http') ? avatarUrl : null);

  if (src) {
    return (
      <img
        src={src}
        alt={displayName}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white shrink-0"
      style={{ width: size, height: size, background: 'var(--sidebar-accent)', fontSize: size * 0.43 }}
    >
      {displayName.charAt(0).toUpperCase()}
    </div>
  );
}

export function Header({ toggleSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, uploadAvatar } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploading(true);
    try {
      await uploadAvatar(file);
    } catch {
      alert('Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
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
                <UserAvatar displayName={user?.displayName ?? ''} avatarUrl={user?.avatarUrl} />
                <span className="text-sm hidden sm:block">{user?.displayName}</span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 card shadow-lg z-50 animate-scale-in overflow-hidden">
                    {/* Profile section */}
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--rule)' }}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="relative group/avatar">
                          <UserAvatar displayName={user?.displayName ?? ''} avatarUrl={user?.avatarUrl} size={40} />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                            style={{ background: 'rgba(0,0,0,0.5)' }}
                            title="Đổi ảnh đại diện"
                          >
                            {uploading
                              ? <Loader2 size={14} className="animate-spin text-white" />
                              : <Camera size={14} className="text-white" />}
                          </button>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink-1 truncate">{user?.displayName}</p>
                          <p className="text-xs text-ink-3 truncate">{user?.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-colors hover:bg-surface-2"
                        style={{ color: 'var(--sidebar-accent)', border: '1px solid var(--sidebar-accent)' }}
                      >
                        {uploading
                          ? <><Loader2 size={11} className="animate-spin" /> Đang tải...</>
                          : <><Camera size={11} /> Đổi ảnh đại diện</>}
                      </button>
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />
    </header>
  );
}
