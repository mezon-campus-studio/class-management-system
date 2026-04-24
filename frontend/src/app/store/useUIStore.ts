import { create } from 'zustand';

interface UIState {
    isSidebarOpen: boolean;
    theme: 'light' | 'dark';
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
    toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    // Mặc định: màn hình desktop thì mở, mobile thì đóng
    isSidebarOpen: window.innerWidth >= 768,
    theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',

    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

    setSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),

    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        return { theme: newTheme };
    }),
}));
