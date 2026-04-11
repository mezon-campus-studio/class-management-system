import React, { useState } from "react";
import { Home, MonitorPlay, Users, ChevronDown, ChevronUp } from "lucide-react";
import { useHome } from "@features/home/hooks/useHome"; // Đảm bảo đường dẫn alias đúng
import { Lock, Globe } from "lucide-react"; // Thêm icon để phân biệt Public/Private

// Nhận prop isOpen từ cha
interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar = ({ isOpen }: SidebarProps) => {
  const [isRegisteredOpen, setIsRegisteredOpen] = useState(true);
  const { classes, isLoading } = useHome();

  return (
    <aside
      className={`
        bg-gray-100 border-r border-gray-300 flex flex-col 
        /* fixed trên mobile để đè lên content, sticky/relative trên desktop */
        fixed md:sticky 
        /* 64px là chiều cao của Header, giúp Sidebar nằm ngay dưới */
        top-[64px] 
        z-20 h-[calc(100vh-64px)] w-64
        transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:-ml-64"}
      `}
    >
      <nav className="flex-1 py-2 overflow-y-auto">
        {/* Trang chủ - Mục active */}
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-400 text-white cursor-pointer transition-colors">
          <Home size={20} className="shrink-0" />
          <span className="font-medium">Trang chủ</span>
        </div>

        {/* Đã đăng ký - Mục xổ xuống */}
        <div>
          <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-200 border-b border-gray-300 transition-colors"
            onClick={() => setIsRegisteredOpen(!isRegisteredOpen)}
          >
            <div className="flex items-center gap-3 text-gray-800">
              <MonitorPlay size={20} className="shrink-0" />
              <span className="font-medium">Đã đăng ký</span>
            </div>
            {isRegisteredOpen ? (
              <ChevronUp size={16} className="shrink-0" />
            ) : (
              <ChevronDown size={16} className="shrink-0" />
            )}
          </div>

          {/* Danh sách lớp học (chỉ hiện khi mục cha mở) */}
          {isRegisteredOpen && (
            <ul className="py-1">
              {/* Trạng thái đang tải */}
              {isLoading ? (
                <li className="px-8 py-3 text-sm text-gray-400 animate-pulse">
                  Đang tải...
                </li>
              ) : classes.length > 0 ? (
                // Render danh sách từ mockData
                classes.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between px-8 py-3 hover:bg-gray-200 cursor-pointer text-gray-700 transition-colors group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Users
                        size={18}
                        className="text-gray-500 shrink-0 group-hover:text-indigo-600"
                      />
                      <span className="text-sm truncate leading-tight">
                        {item.className}
                      </span>
                    </div>

                    {/* Icon phân biệt trạng thái */}
                    {item.status === "public" ? (
                      <Globe
                        size={12}
                        className="text-green-500 shrink-0 opacity-70"
                      />
                    ) : (
                      <Lock
                        size={12}
                        className="text-amber-500 shrink-0 opacity-70"
                      />
                    )}
                  </li>
                ))
              ) : (
                // Nếu mảng rỗng
                <li className="px-8 py-3 text-sm text-gray-400 italic">
                  Chưa có lớp nào
                </li>
              )}
            </ul>
          )}
        </div>
      </nav>
    </aside>
  );
};
