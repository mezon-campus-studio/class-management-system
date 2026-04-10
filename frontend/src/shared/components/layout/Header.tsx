import React from "react";
import { Menu, Plus, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Thêm interface để nhận prop từ cha
interface HeaderProps {
  toggleSidebar: () => void;
}

// Nhận function toggleSidebar qua props
export const Header = ({ toggleSidebar }: HeaderProps) => {
  const navigate = useNavigate();
  const handleLoginClick = () => {
    navigate("/auth/login");
  };
  return (
    <header className="flex items-center justify-between h-16 px-4 bg-gray-100 border-b border-gray-300 shrink-0 relative z-30">
      <div className="flex items-center gap-4">
        {/* NÚT 3 GẠCH: Thêm sự kiện onClick để gọi hàm của cha */}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Thu/Phóng Menu"
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center gap-2">
          {/* Logo/Icon */}
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
            C
          </div>
          <h1 className="text-xl font-medium text-gray-800">
            Class Management
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Nút Tạo lớp: Chỉ hiện chữ trên màn hình lớn */}
        <button className="flex items-center gap-1 text-gray-700 hover:text-black font-medium transition-colors">
          <span className="hidden sm:inline">Tạo lớp</span>
          <Plus size={20} />
        </button>

        {/* Avatar/User */}
        <div
          onClick={handleLoginClick}
          className="w-9 h-9 bg-orange-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-300 cursor-pointer shrink-0"
        >
          <User size={20} className="text-gray-600" />
        </div>
      </div>
    </header>
  );
};
