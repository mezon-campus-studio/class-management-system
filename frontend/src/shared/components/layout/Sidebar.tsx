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
import { useUIStore } from "@app/store"; // Import store mới

export const Sidebar = () => { // Không dùng Props isOpen nữa
  const [isRegisteredOpen, setIsRegisteredOpen] = useState(true);
  const { classes, isLoading } = useHome();
  const { isSidebarOpen } = useUIStore(); // Lấy trạng thái từ Store

  // Logic lọc lấy các lớp mà user đã join thành công
  const myClasses = classes.filter((item) => item.userJoinStatus === "joined");

  return (
    <aside
      className={`bg-gray-100 border-r border-gray-300 flex flex-col fixed md:sticky top-[64px] z-20 h-[calc(100vh-64px)] w-64 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:-ml-64"
      }`}
    >
      <nav className="flex-1 py-2 overflow-y-auto p-2.5">
        <NavLink to="/" end>
          {({ isActive }: { isActive: boolean }) => (
            <div
              className={`sidebar-item ${isActive ? "active" : ""}`}
            >
              <Home size={20} className="shrink-0" />
              <span className="font-medium">Trang chủ</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-accent"></span>}
            </div>
          )}
        </NavLink>

        <div className="mt-2">
          <div
            className="flex items-center justify-between px-3 py-2 cursor-pointer text-sidebar-text hover:text-sidebar-text-active transition-colors"
            onClick={() => setIsRegisteredOpen(!isRegisteredOpen)}
          >
            <div className="flex items-center gap-3">
              <MonitorPlay size={20} className="shrink-0" />
              <span className="text-2xs font-semibold tracking-label uppercase">
                Đã đăng ký
              </span>
            </div>
            {isRegisteredOpen ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </div>

          {isRegisteredOpen && (
            <ul className="mt-1 flex flex-col gap-0.5">
              {isLoading ? (
                <li className="px-10 py-3">
                  <div className="skeleton h-4 w-full opacity-20"></div>
                </li>
              ) : myClasses.length > 0 ? (
                myClasses.map((item) => (
                  <li key={item.id}>
                    <NavLink to={`/class/${item.id}`}>
                      {({ isActive }: { isActive: boolean }) => (
                        <div
                          className={`sidebar-item ${isActive ? "active" : ""}`}
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

                          <div
                            title={
                              item.status === "PUBLIC"
                                ? "Cộng đồng"
                                : "Nhóm kín"
                            }
                          >
                            {item.status === "PUBLIC" ? (
                              <Globe
                                size={12}
                                className="text-green-500 opacity-60"
                              />
                            ) : (
                              <Lock
                                size={12}
                                className="text-amber-text opacity-80"
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </NavLink>
                  </li>
                ))
              ) : (
                <li className="px-10 py-4 text-2xs text-sidebar-text opacity-50 italic">
                  Chưa tham gia lớp nào
                </li>
              )}
            </ul>
          )}
        </div>
      </nav>
    </aside>
  );
};