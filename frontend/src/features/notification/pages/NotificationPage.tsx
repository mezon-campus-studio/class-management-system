import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { notificationApi } from '../api';
import type { Notification } from '../types';

export function NotificationPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = async (p = 0) => {
    setLoading(true);
    try {
      const res = await notificationApi.list(p);
      setItems(p === 0 ? res.content : (prev) => [...prev, ...res.content]);
      setTotalPages(res.totalPages);
      setPage(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(0); }, []);

  const handleMarkRead = async (id: string) => {
    await notificationApi.markRead(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await notificationApi.markAllRead();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const formatTime = (s: string) =>
    new Date(s).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-ink-2" />
          <h1 className="text-xl font-semibold text-ink-1">Thông báo</h1>
        </div>
        <button onClick={handleMarkAllRead} className="btn btn-ghost btn-sm gap-1.5">
          <Check size={13} /> Đánh dấu tất cả đã đọc
        </button>
      </div>

      {loading && items.length === 0 ? (
        <div className="animate-pulse text-center py-10 text-ink-3">Đang tải...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-10 text-ink-3">Không có thông báo nào</div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && handleMarkRead(n.id)}
              className={`card card-body cursor-pointer transition-colors ${
                n.read ? 'opacity-60' : 'border-l-4'
              }`}
              style={!n.read ? { borderLeftColor: 'var(--warm-400)' } : {}}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.read ? 'text-ink-2' : 'text-ink-1 font-medium'}`}>
                    {n.title}
                  </p>
                  {n.body && <p className="text-xs text-ink-3 mt-0.5 truncate">{n.body}</p>}
                </div>
                <span className="text-xs text-ink-3 whitespace-nowrap shrink-0">
                  {formatTime(n.createdAt)}
                </span>
              </div>
            </div>
          ))}

          {page + 1 < totalPages && (
            <button
              onClick={() => load(page + 1)}
              className="w-full btn btn-ghost btn-sm mt-2"
            >
              Tải thêm
            </button>
          )}
        </div>
      )}
    </div>
  );
}
