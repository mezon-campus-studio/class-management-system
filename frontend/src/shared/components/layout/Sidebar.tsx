import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  MonitorPlay,
  Users,
  ChevronDown,
  ChevronUp,
  Lock,
  Globe,
} from "lucide-react";
import { useHome } from "@features/home/hooks/useHome";

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar = ({ isOpen }: SidebarProps) => {
  const [isRegisteredOpen, setIsRegisteredOpen] = useState(true);
  const { classes, isLoading } = useHome();

  // Lọc lấy các lớp mà user đã join thành công
  const myClasses = classes.filter((item) => item.userJoinStatus === "joined");

  return (
    <aside
      className={`bg-gray-100 border-r border-gray-300 flex flex-col fixed md:sticky top-[64px] z-20 h-[calc(100vh-64px)] w-64 transition-all duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full md:-ml-64"
      }`}
    >
      <nav className="flex-1 py-2 overflow-y-auto">
        {/* --- TRANG CHỦ --- */}
        <NavLink to="/" end>
          {({ isActive }: { isActive: boolean }) => (
            <div
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                isActive
                  ? "bg-slate-400 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Home size={20} className="shrink-0" />
              <span className="font-medium">Trang chủ</span>
            </div>
          )}
        </NavLink>

        {/* --- MỤC ĐÃ ĐĂNG KÝ (DROPDOWN) --- */}
        <div className="mt-1">
          <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-200 border-b border-gray-300 transition-colors"
            onClick={() => setIsRegisteredOpen(!isRegisteredOpen)}
          >
            <div className="flex items-center gap-3 text-gray-800">
              <MonitorPlay size={20} className="shrink-0" />
              <span className="font-medium text-sm uppercase tracking-wider opacity-70">
                Đã đăng ký
              </span>
            </div>
            {isRegisteredOpen ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </div>

          {/* --- DANH SÁCH LỚP HỌC --- */}
          {isRegisteredOpen && (
            <ul className="py-1">
              {isLoading ? (
                <li className="px-8 py-3 text-sm text-gray-400 animate-pulse">
                  Đang tải dữ liệu...
                </li>
              ) : myClasses.length > 0 ? (
                myClasses.map((item) => (
                  <li key={item.id}>
                    <NavLink to={`/class/${item.id}`}>
                      {({ isActive }: { isActive: boolean }) => (
                        <div
                          className={`flex items-center justify-between px-8 py-3 cursor-pointer transition-all group border-r-4 ${
                            isActive
                              ? "bg-indigo-50 text-indigo-700 border-indigo-600 font-bold"
                              : "text-gray-600 hover:bg-gray-200 border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <Users
                              size={18}
                              className={`shrink-0 transition-colors ${
                                isActive
                                  ? "text-indigo-600"
                                  : "text-gray-400 group-hover:text-indigo-600"
                              }`}
                            />
                            <span className="text-sm truncate leading-tight">
                              {item.className}
                            </span>
                          </div>

                          {/* Icon trạng thái lớp */}
                          <div
                            title={
                              item.status === "public"
                                ? "Cộng đồng"
                                : "Nhóm kín"
                            }
                          >
                            {item.status === "public" ? (
                              <Globe
                                size={12}
                                className="text-green-500 opacity-60"
                              />
                            ) : (
                              <Lock
                                size={12}
                                className="text-amber-500 opacity-60"
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </NavLink>
                  </li>
                ))
              ) : (
                <li className="px-10 py-4 text-xs text-gray-400 italic bg-gray-50/50">
                  Bạn chưa tham gia lớp nào
                </li>
              )}
            </ul>
          )}
        </div>
      </nav>
    </aside>
  );
};
