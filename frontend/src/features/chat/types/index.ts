export type ConversationType = 'CLASS' | 'GROUP' | 'DIRECT';
export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'POLL' | 'EVENT';

export interface Conversation {
  id: string;
  classroomId: string;
  type: ConversationType;
  name: string | null;
  createdAt: string;
}

export interface ReactionAggregate {
  emoji: string;
  count: number;
  reactedByMe: boolean;
  userIds: string[];
}

export interface ReplyPreview {
  id: string;
  senderId: string;
  senderName: string | null;
  messageType: MessageType;
  preview: string;
  deleted: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string | null;
  senderAvatar: string | null;
  content: string | null;
  replyToId: string | null;
  replyToPreview: ReplyPreview | null;
  deleted: boolean;
  messageType: MessageType;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentType: string | null;
  attachmentSize: number | null;
  /** JSON string — parse on the FE for plugin payloads. */
  payloadJson: string | null;
  reactions: ReactionAggregate[];
  pinned: boolean;
  pinnedAt: string | null;
  pinnedBy: string | null;
  createdAt: string;
}

export interface ChatAttachment {
  url: string;
  name: string;
  contentType: string | null;
  size: number;
}

export interface PollPayload {
  pollId: string;
  question: string;
}

export interface EventPayload {
  eventId: string;
  title: string;
  startTime: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface ChatNotify {
  conversationId: string;
  classroomId: string;
  senderName: string;
  preview: string;
  mentionedUserIds: string[];
}
