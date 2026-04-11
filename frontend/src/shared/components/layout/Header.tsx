import React, { useState } from "react";
import { Menu, Plus, User,  Hash, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header = ({ toggleSidebar }: HeaderProps) => {
  const navigate = useNavigate();
  const [classCode, setClassCode] = useState("");

  const handleLoginClick = () => {
    navigate("/auth/login");
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

      {/* CỤM Ở GIỮA: Thanh tìm lớp (Giữ lại nếu bạn muốn dùng song song) */}
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
        
        {/* NÚT THAM GIA MỚI THÊM */}
        <button 
          className="flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold transition-colors text-sm border border-transparent hover:border-indigo-100"
        >
          <LogIn size={18} />
          <span className="hidden sm:inline">Tham gia</span>
        </button>

        {/* Nút Tạo lớp */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-bold transition-all shadow-sm active:scale-95 text-sm">
          <Plus size={18} />
          <span className="hidden lg:inline">Tạo lớp</span>
        </button>

        {/* User Profile */}
        <div
          onClick={handleLoginClick}
          className="ml-1 w-9 h-9 bg-gradient-to-tr from-orange-100 to-orange-200 rounded-full flex items-center justify-center overflow-hidden border border-orange-300 cursor-pointer shrink-0 hover:ring-4 hover:ring-orange-50 transition-all"
        >
          <User size={20} className="text-orange-700" />
        </div>
      </div>
    </header>
  );
};