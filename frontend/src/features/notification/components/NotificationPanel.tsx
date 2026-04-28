import { useState } from 'react';
import {
  Bell, Check, Settings, ChevronDown,
  CheckCircle, ClipboardList, MessageCircle, DollarSign, Star, X,
} from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import { NotificationSettings } from './NotificationSettings';
import type { NotificationType } from '../types';

function getIcon(type: NotificationType) {
  if (
    type === 'ATTENDANCE_PENDING' || type === 'ATTENDANCE_APPROVED' ||
    type === 'ATTENDANCE_REJECTED' || type === 'ABSENCE_REQUEST_REVIEWED' ||
    type === 'ABSENCE_REQUEST_PENDING'
  ) return <CheckCircle size={15} />;
  if (type === 'DUTY_ASSIGNED' || type === 'DUTY_CONFIRMED' || type === 'DUTY_REMINDER')
    return <ClipboardList size={15} />;
  if (type === 'MESSAGE_RECEIVED' || type === 'MESSAGE_MENTION') return <MessageCircle size={15} />;
  if (type === 'FUND_PAYMENT_CONFIRMED' || type === 'FUND_COLLECTION_CREATED')
    return <DollarSign size={15} />;
  if (type === 'EMULATION_ENTRY_ADDED' || type === 'EVALUATION_ADDED')
    return <Star size={15} />;
  return <Bell size={15} />;
}

function relativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} giờ trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

export function NotificationPanel() {
  const {
    notifications,
    isPanelOpen,
    hasMore,
    closePanel,
    markRead,
    markAllRead,
    loadMore,
  } = useNotificationStore();

  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[400]"
        style={{
          background: 'rgba(0,0,0,0.30)',
          opacity: isPanelOpen ? 1 : 0,
          pointerEvents: isPanelOpen ? 'auto' : 'none',
          transition: 'opacity 260ms ease',
        }}
        onClick={closePanel}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-[500] flex flex-col"
        style={{
          width: 'min(400px, 100vw)',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--rule-md)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.14), -2px 0 8px rgba(0,0,0,0.06)',
          transform: isPanelOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 280ms cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: isPanelOpen ? 'auto' : 'none',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--rule-md)',
          }}
        >
          <div className="flex items-center gap-2">
            <Bell size={15} className="text-ink-3" />
            <span className="font-semibold text-sm text-ink-1">Thông báo</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSettingsOpen(true)}
              className="btn btn-ghost btn-icon"
              title="Cài đặt thông báo"
            >
              <Settings size={14} />
            </button>
            <button
              onClick={markAllRead}
              className="btn btn-ghost btn-sm flex items-center gap-1"
              title="Đánh dấu tất cả đã đọc"
            >
              <Check size={12} />
              <span className="hidden sm:inline">Đọc tất cả</span>
            </button>
            <button
              onClick={closePanel}
              className="btn btn-ghost btn-icon"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto bg-surface-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'var(--bg-surface-3)' }}
              >
                <Bell size={22} className="text-ink-4" />
              </div>
              <p className="text-sm text-ink-3">Không có thông báo nào</p>
            </div>
          ) : (
            <div>
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => { if (!n.read) markRead(n.id); }}
                  className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-fast"
                  style={{
                    background: n.read ? 'var(--bg-surface)' : 'var(--warm-fill)',
                    borderBottom: '1px solid var(--rule)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface-2)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      n.read ? 'var(--bg-surface)' : 'var(--warm-fill)';
                  }}
                >
                  {/* Icon */}
                  <div
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
                    style={{
                      background: n.read ? 'var(--bg-surface-3)' : 'var(--warm-border)',
                      color: n.read ? 'var(--ink-3)' : 'var(--warm-text)',
                    }}
                  >
                    {getIcon(n.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${n.read ? 'text-ink-2' : 'text-ink-1 font-medium'}`}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-xs text-ink-3 mt-0.5 line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-[10px] text-ink-3 mt-1.5">{relativeTime(n.createdAt)}</p>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <div
                      className="w-2 h-2 rounded-full shrink-0 mt-2"
                      style={{ background: 'var(--warm-400)' }}
                    />
                  )}
                </button>
              ))}

              {hasMore && (
                <button
                  onClick={loadMore}
                  className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-fast"
                  style={{
                    background: 'var(--bg-surface)',
                    color: 'var(--warm-400)',
                    borderTop: '1px solid var(--rule)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface-2)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface)';
                  }}
                >
                  <ChevronDown size={14} />
                  Xem thêm
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {settingsOpen && (
        <NotificationSettings onClose={() => setSettingsOpen(false)} />
      )}
    </>
  );
}
