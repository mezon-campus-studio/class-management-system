import React, { useEffect } from 'react';
import { Header } from '@shared/components/layout/Header'; 
import { Sidebar } from '@shared/components/layout/Sidebar';
import { useUIStore } from '@app/store';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  return (
    <div className="h-screen flex flex-col bg-paper overflow-hidden">
      <Header />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        
        {isSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 top-16 bg-black/50 z-10"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto p-0 transition-all duration-300 ease-in-out relative z-0">
          {children}
        </main>
      </div>
    </div>
  );
};
