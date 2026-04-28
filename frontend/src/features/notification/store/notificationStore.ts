import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_BASE } from '@/shared/constants';
import { notificationApi } from '../api';
import type { Notification, ChatLevel } from '../types';

export interface ToastItem {
  id: number;
  notification: Notification;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isPanelOpen: boolean;
  toasts: ToastItem[];
  page: number;
  hasMore: boolean;
  globalChatLevel: ChatLevel;
  init: (userId: string, token: string) => void;
  disconnect: () => void;
  togglePanel: () => void;
  closePanel: () => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismissToast: (id: number) => void;
  loadMore: () => Promise<void>;
}

let stompClient: Client | null = null;
let toastSeq = 0;
const toastTimers = new Map<number, ReturnType<typeof setTimeout>>();

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isPanelOpen: false,
  toasts: [],
  page: 0,
  hasMore: false,
  globalChatLevel: 'ALL',

  init: (_userId: string, token: string) => {
    if (stompClient?.active) {
      stompClient.deactivate();
      stompClient = null;
    }

    notificationApi.unreadCount().then((count) => {
      set({ unreadCount: count });
    }).catch(() => {});

    notificationApi.list(0).then((res) => {
      set({
        notifications: res.content,
        page: 0,
        hasMore: res.number + 1 < res.totalPages,
      });
    }).catch(() => {});

    notificationApi.getPreferences().then((prefs) => {
      set({ globalChatLevel: prefs.global.chatLevel });
    }).catch(() => {});

    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_BASE}/ws`),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/user/queue/notifications`, (frame) => {
          const notification: Notification = JSON.parse(frame.body);
          const id = ++toastSeq;
          set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
            toasts: [...state.toasts, { id, notification }],
          }));
          const timer = setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
            toastTimers.delete(id);
          }, 5000);
          toastTimers.set(id, timer);
        });
      },
    });

    client.activate();
    stompClient = client;
  },

  disconnect: () => {
    stompClient?.deactivate();
    stompClient = null;
    toastTimers.forEach((t) => clearTimeout(t));
    toastTimers.clear();
    set({
      notifications: [],
      unreadCount: 0,
      isPanelOpen: false,
      toasts: [],
      page: 0,
      hasMore: false,
      globalChatLevel: 'ALL',
    });
  },

  togglePanel: () => {
    set((state) => ({ isPanelOpen: !state.isPanelOpen }));
  },

  closePanel: () => {
    set({ isPanelOpen: false });
  },

  markRead: async (id: string) => {
    await notificationApi.markRead(id);
    set((state) => ({
      notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
      unreadCount: Math.max(0, state.unreadCount - (state.notifications.find((n) => n.id === id && !n.read) ? 1 : 0)),
    }));
  },

  markAllRead: async () => {
    await notificationApi.markAllRead();
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  dismissToast: (id: number) => {
    const timer = toastTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.delete(id);
    }
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  loadMore: async () => {
    const { page, hasMore } = get();
    if (!hasMore) return;
    const nextPage = page + 1;
    const res = await notificationApi.list(nextPage);
    set((state) => ({
      notifications: [...state.notifications, ...res.content],
      page: nextPage,
      hasMore: res.number + 1 < res.totalPages,
    }));
  },
}));
