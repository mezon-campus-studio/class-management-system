import React, { useState, useEffect } from 'react';
// Đảm bảo đường dẫn alias đúng hoặc dùng tương đối
import { Header } from '@shared/components/layout/Header'; 
import { Sidebar } from '@shared/components/layout/Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  // 1. Khởi tạo state: màn hình > 768px (Desktop/Tablet) thì mở, nhỏ hơn (Mobile) thì đóng
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  // 2. useEffect: Tự động thu gọn/mở rộng khi đổi kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      // Khi kéo nhỏ < 768px, tự đóng menu
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        // Khi kéo rộng > 768px, tự mở menu
        setIsSidebarOpen(true);
      }
    };

    // Lắng nghe sự kiện resize
    window.addEventListener('resize', handleResize);
    
    // Clean up function: gỡ bỏ lắng nghe khi component bị hủy
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Chỉ chạy 1 lần khi component render lần đầu

  // 3. Hàm toggle để truyền xuống Header
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Truyền hàm toggleSidebar xuống Header */}
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Truyền state isSidebarOpen xuống Sidebar */}
        <Sidebar isOpen={isSidebarOpen} />
        
        {/* 4. Lớp phủ tối màu (Overlay) CHỈ HIỆN TRÊN MOBILE KHI MỞ MENU */}
        {/* Lớp phủ này nằm dưới Header (top-16) và đè lên Main Content (z-10) */}
        {isSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 top-16 bg-black/50 z-10"
            onClick={() => setIsSidebarOpen(false)} // Bấm vào lớp phủ -> đóng menu
          />
        )}

        {/* 5. Vùng nội dung chính */}
        <main className="flex-1 overflow-y-auto p-6 transition-all duration-300 ease-in-out relative z-0">
          {children}
        </main>
      </div>
    </div>
  );
};