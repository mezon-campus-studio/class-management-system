import { Bell } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';

export function NotificationBell() {
  const { unreadCount, togglePanel } = useNotificationStore();

  return (
    <button
      onClick={togglePanel}
      className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
    >
      <Bell size={18} className="text-white/70" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center bg-red-500 text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
