import {
  Bell, CheckCircle, ClipboardList, MessageCircle, DollarSign, Star,
} from 'lucide-react';
import { useNotificationStore, type ToastItem } from '../store/notificationStore';
import type { NotificationType } from '../types';

function getIcon(type: NotificationType) {
  if (
    type === 'ATTENDANCE_PENDING' || type === 'ATTENDANCE_APPROVED' ||
    type === 'ATTENDANCE_REJECTED' || type === 'ABSENCE_REQUEST_REVIEWED' ||
    type === 'ABSENCE_REQUEST_PENDING'
  ) return <CheckCircle size={14} />;
  if (type === 'DUTY_ASSIGNED' || type === 'DUTY_CONFIRMED' || type === 'DUTY_REMINDER')
    return <ClipboardList size={14} />;
  if (type === 'MESSAGE_RECEIVED' || type === 'MESSAGE_MENTION') return <MessageCircle size={14} />;
  if (type === 'FUND_PAYMENT_CONFIRMED' || type === 'FUND_COLLECTION_CREATED')
    return <DollarSign size={14} />;
  if (type === 'EMULATION_ENTRY_ADDED' || type === 'EVALUATION_ADDED')
    return <Star size={14} />;
  return <Bell size={14} />;
}

function NotificationToastItem({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const { notification } = toast;

  return (
    <div
      className="pointer-events-auto relative flex items-start gap-3 px-4 py-3 rounded-lg overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--rule-md)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
        minWidth: '288px',
        maxWidth: '340px',
        animation: 'notifSlideIn 0.22s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}
    >
      {/* Icon */}
      <div
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
        style={{
          background: 'var(--warm-fill)',
          color: 'var(--warm-text)',
        }}
      >
        {getIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-ink-1 leading-snug">{notification.title}</p>
        {notification.body && (
          <p className="text-xs text-ink-3 mt-0.5 truncate">{notification.body}</p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 w-5 h-5 rounded flex items-center justify-center transition-fast"
        style={{
          color: 'var(--ink-3)',
          background: 'var(--bg-surface-2)',
          fontSize: '14px',
          lineHeight: 1,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface-3)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-1)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface-2)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-3)';
        }}
      >
        ×
      </button>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-0.5"
        style={{
          background: 'var(--warm-400)',
          animation: 'notifProgress 5s linear forwards',
        }}
      />

      <style>{`
        @keyframes notifSlideIn {
          from { transform: translateY(-12px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        @keyframes notifProgress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}

export function NotificationToastContainer() {
  const { toasts, dismissToast } = useNotificationStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-[600] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <NotificationToastItem key={t.id} toast={t} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
