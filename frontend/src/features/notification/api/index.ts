import { api } from '@/services/api-client';
import type { Notification, PageResponse, NotificationPreferences } from '../types';

export const notificationApi = {
  list: (page = 0) =>
    api.get<{ data: PageResponse<Notification> }>(`/notifications?page=${page}&size=20`).then((r) => r.data.data),

  unreadCount: () =>
    api.get<{ data: { count: number } }>('/notifications/unread-count').then((r) => r.data.data.count),

  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    api.post('/notifications/read-all', {}),

  getPreferences: () =>
    api.get<{ data: NotificationPreferences }>('/notifications/preferences').then((r) => r.data.data),

  updatePreferences: (data: NotificationPreferences) =>
    api.put<{ data: NotificationPreferences }>('/notifications/preferences', data).then((r) => r.data.data),
};
