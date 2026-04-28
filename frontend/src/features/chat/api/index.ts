import { api } from '@/services/api-client';
import type { ChatAttachment, Conversation, Message, MessageType, PageResponse } from '../types';

const base = (classroomId: string) => `/classrooms/${classroomId}/chat`;

export interface SendMessageBody {
  content?: string;
  replyToId?: string;
  messageType?: MessageType;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  attachmentSize?: number;
  payload?: unknown;
}

export const chatApi = {
  getClassConversation: (classroomId: string) =>
    api.get<{ data: Conversation }>(`${base(classroomId)}/conversations/class`).then((r) => r.data.data),

  listConversations: (classroomId: string) =>
    api.get<{ data: Conversation[] }>(`${base(classroomId)}/conversations`).then((r) => r.data.data),

  getMessages: (classroomId: string, conversationId: string, page = 0) =>
    api.get<{ data: PageResponse<Message> }>(
      `${base(classroomId)}/conversations/${conversationId}/messages?page=${page}&size=100`,
    ).then((r) => r.data.data),

  sendMessage: (classroomId: string, conversationId: string, body: SendMessageBody) =>
    api.post<{ data: Message }>(
      `${base(classroomId)}/conversations/${conversationId}/messages`,
      body,
    ).then((r) => r.data.data),

  /** Convenience: plain text message. */
  sendText: (classroomId: string, conversationId: string, content: string, replyToId?: string) =>
    api.post<{ data: Message }>(
      `${base(classroomId)}/conversations/${conversationId}/messages`,
      { content, replyToId, messageType: 'TEXT' },
    ).then((r) => r.data.data),

  deleteMessage: (classroomId: string, conversationId: string, messageId: string) =>
    api.delete(`${base(classroomId)}/conversations/${conversationId}/messages/${messageId}`),

  uploadAttachment: (classroomId: string, conversationId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<{ data: ChatAttachment }>(
      `${base(classroomId)}/conversations/${conversationId}/attachments`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    ).then((r) => r.data.data);
  },

  /** Returns a Blob for inline preview/download of a chat attachment by URL.
   *  Backend returns absolute paths like "/api/v1/...". The axios instance has
   *  baseURL "/api/v1", so we strip the prefix before requesting. */
  fetchAttachmentBlob: (url: string) => {
    const path = url.startsWith('/api/v1') ? url.substring('/api/v1'.length) : url;
    return api.get(path, { responseType: 'blob' }).then((r) => r.data as Blob);
  },

  // ─── Pin / Unpin ──────────────────────────────────────────────────────────

  listPinned: (classroomId: string, conversationId: string) =>
    api.get<{ data: Message[] }>(
      `${base(classroomId)}/conversations/${conversationId}/pinned`,
    ).then((r) => r.data.data),

  pin: (classroomId: string, conversationId: string, messageId: string) =>
    api.post<{ data: Message }>(
      `${base(classroomId)}/conversations/${conversationId}/messages/${messageId}/pin`,
    ).then((r) => r.data.data),

  unpin: (classroomId: string, conversationId: string, messageId: string) =>
    api.delete<{ data: Message }>(
      `${base(classroomId)}/conversations/${conversationId}/messages/${messageId}/pin`,
    ).then((r) => r.data.data),

  // ─── Reactions ────────────────────────────────────────────────────────────

  addReaction: (classroomId: string, conversationId: string, messageId: string, emoji: string) =>
    api.post<{ data: Message }>(
      `${base(classroomId)}/conversations/${conversationId}/messages/${messageId}/reactions`,
      { emoji },
    ).then((r) => r.data.data),

  removeReaction: (classroomId: string, conversationId: string, messageId: string, emoji: string) =>
    api.delete<{ data: Message }>(
      `${base(classroomId)}/conversations/${conversationId}/messages/${messageId}/reactions`,
      { params: { emoji } },
    ).then((r) => r.data.data),

  // ─── Settings ────────────────────────────────────────────────────────────

  getSettings: (classroomId: string, conversationId: string) =>
    api.get<{ data: { bubbleColor: string | null; wallpaper: string | null } }>(
      `${base(classroomId)}/conversations/${conversationId}/settings`,
    ).then((r) => r.data.data),

  saveSettings: (classroomId: string, conversationId: string, bubbleColor: string, wallpaper: string) =>
    api.put(
      `${base(classroomId)}/conversations/${conversationId}/settings`,
      { bubbleColor, wallpaper },
    ),
};
