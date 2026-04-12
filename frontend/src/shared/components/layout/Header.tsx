import React, { useState } from "react";
import { Menu, Plus, User, Hash, LogIn, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@features/auth";

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header = ({ toggleSidebar }: HeaderProps) => {
  const navigate = useNavigate();
  const [classCode, setClassCode] = useState("");
  const { user, isAuthenticated, logout } = useAuth();
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
    <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 shrink-0 relative z-30 shadow-sm">
      {/* CỤM BÊN TRÁI: Menu & Logo */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Thu/Phóng Menu"
        >
          <Menu size={22} className="text-gray-600" />
        </button>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0 shadow-indigo-200 shadow-lg">
            C
          </div>
          <h1 className="text-lg font-bold text-gray-800 hidden md:block tracking-tight">
            Class Management
          </h1>
        </div>
      </div>

      {/* CỤM Ở GIỮA: Thanh tìm lớp */}
      <div className="flex-[2] max-w-md mx-4 hidden sm:block">
        <form onSubmit={handleJoinClass} className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Hash size={16} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Tìm nhanh bằng mã..."
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 py-2 pl-10 pr-4 rounded-xl text-sm transition-all outline-none border"
          />
        </form>
      </div>

      {/* CỤM BÊN PHẢI: Actions & User */}
      <div className="flex items-center justify-end gap-2 sm:gap-3 flex-1">
        
        {isAuthenticated && (
          <>
            <button 
              className="flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold transition-colors text-sm border border-transparent hover:border-indigo-100"
            >
              <LogIn size={18} />
              <span className="hidden sm:inline">Tham gia</span>
            </button>

            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-bold transition-all shadow-sm active:scale-95 text-sm">
              <Plus size={18} />
              <span className="hidden lg:inline">Tạo lớp</span>
            </button>
          </>
        )}

        {/* User Profile */}
        <div className="relative">
          <div
            onClick={isAuthenticated ? () => setShowUserMenu(!showUserMenu) : handleLoginClick}
            className={`ml-1 w-9 h-9 ${isAuthenticated ? 'bg-indigo-100 border-indigo-200' : 'bg-gradient-to-tr from-orange-100 to-orange-200 border-orange-300'} rounded-full flex items-center justify-center overflow-hidden border cursor-pointer shrink-0 hover:ring-4 hover:ring-indigo-50 transition-all`}
          >
            {isAuthenticated ? (
              <span className="text-indigo-700 font-bold text-sm">
                {user?.displayName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User size={20} className="text-orange-700" />
            )}
          </div>

          {showUserMenu && isAuthenticated && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 animate-scale-in">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-800 truncate">{user?.displayName}</p>
                <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
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
