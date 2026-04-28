import { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useLocation, useParams, Link } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Breadcrumb } from './Breadcrumb';
import { classroomApi } from '@/features/classroom/api';
import { memToken } from '@/services/api-client';
import { WS_BASE } from '@/shared/constants';
import { useAuthStore } from '@/app/store';
import { useNotificationStore } from '@/features/notification/store/notificationStore';
import { NotificationPanel } from '@/features/notification/components/NotificationPanel';
import { NotificationToastContainer } from '@/features/notification/components/NotificationToast';
import type { ChatNotify } from '@/features/chat/types';

interface ChatToast {
  id: number;
  notify: ChatNotify;
}

let toastSeq = 0;

function ChatNotifyBanner({ toasts, onDismiss }: {
  toasts: ChatToast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-sm max-w-xs"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--rule)',
            color: 'var(--ink-1)',
          }}
        >
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs text-ink-3 mb-0.5">{t.notify.senderName}</p>
            <p className="truncate text-ink-1">{t.notify.preview}</p>
            <Link
              to={`/classrooms/${t.notify.classroomId}/chat`}
              className="text-xs font-medium mt-1 block"
              style={{ color: 'var(--sidebar-accent)' }}
              onClick={() => onDismiss(t.id)}
            >
              Xem
            </Link>
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="shrink-0 text-ink-3 hover:text-ink-1 leading-none"
            style={{ fontSize: '16px' }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// Inner component that has access to useParams (within the router context)
function MainLayoutInner({ sidebarOpen, setSidebarOpen }: {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const location = useLocation();
  const params = useParams<{ classroomId?: string }>();
  const classroomId = params.classroomId;
  const [toasts, setToasts] = useState<ChatToast[]>([]);
  const clientRef = useRef<Client | null>(null);
  const dismissTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const { user, isAuthenticated } = useAuthStore();
  const { init, disconnect, globalChatLevel } = useNotificationStore();

  const isOnChat = location.pathname.endsWith('/chat');

  const addToast = useCallback((notify: ChatNotify) => {
    const chatLevel = globalChatLevel;
    if (chatLevel === 'NOTHING') return;
    if (chatLevel === 'MENTIONS_ONLY') {
      if (!user?.id || !notify.mentionedUserIds?.includes(user.id)) return;
    }

    const id = ++toastSeq;
    setToasts((prev) => [...prev, { id, notify }]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      dismissTimers.current.delete(id);
    }, 4000);
    dismissTimers.current.set(id, timer);
  }, [globalChatLevel, user?.id]);

  const addToastRef = useRef(addToast);
  useEffect(() => { addToastRef.current = addToast; }, [addToast]);

  const dismissToast = useCallback((id: number) => {
    const timer = dismissTimers.current.get(id);
    if (timer) { clearTimeout(timer); dismissTimers.current.delete(id); }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Notification store init/disconnect based on auth state
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      disconnect();
      return;
    }
    const token = memToken.get();
    init(user.id, token ?? '');
    return () => {
      disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isAuthenticated]);

  // STOMP subscription to classroom chat notifications
  useEffect(() => {
    if (!classroomId) {
      clientRef.current?.deactivate();
      clientRef.current = null;
      return;
    }

    const token = memToken.get();
    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_BASE}/ws`),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
      onConnect: () => {
        client.subscribe(`/topic/classrooms/${classroomId}/chat`, (frame) => {
          const notify: ChatNotify = JSON.parse(frame.body);
          if (!location.pathname.endsWith('/chat')) {
            addToastRef.current(notify);
          }
        });
      },
    });
    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId]);

  // When navigating to /chat, dismiss all pending toasts
  useEffect(() => {
    if (isOnChat) {
      setToasts([]);
      dismissTimers.current.forEach((t) => clearTimeout(t));
      dismissTimers.current.clear();
    }
  }, [isOnChat]);

  const fetchClassroomName = useCallback(
    (id: string) => classroomApi.get(id).then((c) => c.name),
    [],
  );

  return (
    <>
      <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-paper)' }}>
        <Header toggleSidebar={() => setSidebarOpen((v) => !v)} />
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar isOpen={sidebarOpen} />
          {sidebarOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-10"
              style={{ top: 'var(--topbar-h)' }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <main className="flex-1 overflow-y-auto flex flex-col">
            <Breadcrumb fetchClassroomName={fetchClassroomName} />
            <div className="flex-1">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      {!isOnChat && toasts.length > 0 && (
        <ChatNotifyBanner toasts={toasts} onDismiss={dismissToast} />
      )}
      <NotificationPanel />
      <NotificationToastContainer />
    </>
  );
}

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const onResize = () => setSidebarOpen(window.innerWidth >= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return <MainLayoutInner sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
}
