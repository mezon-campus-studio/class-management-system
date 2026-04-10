import React, { useState } from 'react';
import { Home, MonitorPlay, Users, ChevronDown, ChevronUp } from 'lucide-react';

// Nhận prop isOpen từ cha
interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar = ({ isOpen }: SidebarProps) => {
  const [isRegisteredOpen, setIsRegisteredOpen] = useState(true);

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
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:-ml-64'}
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
            {isRegisteredOpen ? <ChevronUp size={16} className="shrink-0" /> : <ChevronDown size={16} className="shrink-0" />}
          </div>

          {/* Danh sách lớp học (chỉ hiện khi mục cha mở) */}
          {isRegisteredOpen && (
            <ul className="py-1">
              {[
                'Trao đổi tài liệu\n(cộng đồng)',
                'Java',
                'OOP',
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3 px-8 py-3 hover:bg-gray-200 cursor-pointer text-gray-700 transition-colors">
                  <Users size={18} className="text-gray-500 shrink-0" />
                  <span className="text-sm whitespace-pre-line">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>
    </aside>
  );
};