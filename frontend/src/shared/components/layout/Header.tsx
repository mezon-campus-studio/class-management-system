import React, { useState } from "react";
import { Menu, Plus, User, Hash, LogIn, LogOut } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useHome } from "@features/home/hooks/useHome";
import { useAuth } from "@features/auth";
import { ChevronRight } from "lucide-react";
import { useUIStore } from "@app/store";
import { CreateClassModal } from "@features/home/pages/CreateClass";
import { JoinClassModal } from "@features/home/pages/JoinClass";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { classId } = useParams();
  const [classCode, setClassCode] = useState("");
  const { user, isAuthenticated, logout } = useAuth();
  const { toggleSidebar } = useUIStore();

  // 1. Lấy danh sách lớp từ useHome
  const { classes } = useHome();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // 2. Tìm lớp hiện tại dựa trên classId từ URL
  const currentClass = classes.find((item) => item.id === classId);
  const isClassPage = location.pathname.includes("/class/") && classId; // Kiểm tra xem có phải đang ở trang chi tiết lớp không /class/ABC-123
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
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Menu size={22} className="text-ink-2" />
        </button>

        {/* CỤM ĐIỀU HƯỚNG BREADCRUMBS */}
        <nav className="flex items-center gap-2 overflow-hidden">
          {/* Logo & Tên App */}
          <div
            className="flex items-center gap-2 cursor-pointer shrink-0"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">
              C
            </div>
            <h1 className="text-sm md:text-base font-bold text-gray-800 hidden sm:block tracking-tight">
              Class Management
            </h1>
          </div>

          {/* Tên lớp (Chỉ hiện khi isClassPage = true) */}
          {isClassPage && (
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <ChevronRight className="text-gray-300" />
              <div className="flex items-center">
                <span
                  className="text-sm md:text-base font-black text-gray-800 tracking-tight truncate 
                  /* Mobile: tối đa 80px | Tablet: 150px | Desktop: 300px */
                  max-w-[80px] xs:max-w-[120px] sm:max-w-[200px] md:max-w-[300px] lg:max-w-[400px]"
                >
                  {currentClass ? currentClass.className : "Đang tải..."}
                </span>
              </div>
            </div>
          )}
        </nav>
      </div>

      <div className="flex-[2] max-w-md mx-4 hidden sm:block">
        <form onSubmit={handleJoinClass} className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Hash
              size={16}
              className="text-gray-400 group-focus-within:text-indigo-500 transition-colors"
            />
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
        {isAuthenticated && (
          <>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold transition-colors text-sm border border-transparent hover:border-indigo-100"
            >
              <LogIn size={18} />
              Tham gia
            </button>

            <button
              className="btn btn-warm btn-sm"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus size={18} />
              <span className="hidden lg:inline">Tạo lớp</span>
            </button>
          </>
        )}

        <div className="relative">
          <div
            onClick={
              isAuthenticated
                ? () => setShowUserMenu(!showUserMenu)
                : handleLoginClick
            }
            className={`ml-1 w-9 h-9 ${isAuthenticated ? "bg-indigo-100 border-indigo-200" : "bg-gradient-to-tr from-orange-100 to-orange-200 border-orange-300"} rounded-full flex items-center justify-center overflow-hidden border cursor-pointer shrink-0 hover:ring-4 hover:ring-indigo-50 transition-all`}
          >
            {isAuthenticated ? (
              <span className="text-warm-text font-bold text-sm">
                {user?.displayName?.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User size={20} className="text-ink-3" />
            )}
          </div>

          {showUserMenu && isAuthenticated && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 animate-scale-in">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-800 truncate">
                  {user?.displayName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  @{user?.username}
                </p>
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

      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <JoinClassModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSuccess={() => {
          console.log("Tham gia lớp thành công, đang cập nhật dữ liệu...");
        }}
      />
    </header>
  );
};
