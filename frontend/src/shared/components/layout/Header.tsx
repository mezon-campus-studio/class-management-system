import React, { useState } from "react";
import { Menu, Plus, User, Hash, LogIn, LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@features/auth";
import { useUIStore } from "@app/store";

export const Header = () => {
  const navigate = useNavigate();
  const [classCode, setClassCode] = useState("");
  const { user, isAuthenticated, logout } = useAuth();
  const { toggleSidebar, theme, toggleTheme } = useUIStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) return;
    console.log("Đang tìm lớp với mã:", classCode);
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 bg-surface border-b border-rule shrink-0 relative z-30 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-surface-2 rounded-full transition-colors"
          title="Thu/Phóng Menu"
        >
          <Menu size={22} className="text-ink-2" />
        </button>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 bg-sidebar-accent rounded-lg flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-warm-100/50">
            E
          </div>
          <h1 className="text-lg font-serif font-bold text-ink-1 hidden md:block tracking-tight">
            EduAdmin
          </h1>
        </div>
      </div>

      <div className="flex-[2] max-w-md mx-4 hidden sm:block">
        <form onSubmit={handleJoinClass} className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Hash size={16} className="text-ink-3 group-focus-within:text-warm-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Tìm nhanh bằng mã..."
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            className="input-field w-full py-2 pl-10 pr-4"
          />
        </form>
      </div>

      <div className="flex items-center justify-end gap-2 sm:gap-3 flex-1">
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-surface-2 rounded-full transition-colors text-ink-2"
          title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {isAuthenticated && (
          <>
            <button 
              className="btn btn-ghost btn-sm hidden sm:flex"
            >
              <LogIn size={18} />
              Tham gia
            </button>

            <button className="btn btn-warm btn-sm">
              <Plus size={18} />
              <span className="hidden lg:inline">Tạo lớp</span>
            </button>
          </>
        )}

        <div className="relative">
          <div
            onClick={isAuthenticated ? () => setShowUserMenu(!showUserMenu) : handleLoginClick}
            className={`ml-1 w-9 h-9 ${isAuthenticated ? 'bg-warm-fill border-warm-border' : 'bg-surface-2 border-rule-md'} rounded-full flex items-center justify-center overflow-hidden border cursor-pointer shrink-0 hover:ring-4 hover:ring-warm-50 transition-all`}
          >
            {isAuthenticated ? (
              <span className="text-warm-text font-bold text-sm">
                {user?.displayName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User size={20} className="text-ink-3" />
            )}
          </div>

          {showUserMenu && isAuthenticated && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-rule rounded-lg shadow-lg py-1 z-50 animate-scale-in">
              <div className="px-4 py-2 border-b border-rule">
                <p className="text-sm font-bold text-ink-1 truncate">{user?.displayName}</p>
                <p className="text-xs text-ink-3 truncate">@{user?.username}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-ink-red-text hover:bg-ink-red-fill flex items-center gap-2 transition-colors"
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
