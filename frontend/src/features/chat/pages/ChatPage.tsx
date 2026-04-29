import React, {
  useState, useEffect, useRef, useCallback, forwardRef, useMemo,
} from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  Send, Paperclip, Image as ImageIcon, Plus, BarChart3, Calendar, FileText, Download, X, Pin,
  Loader2, Info, CheckCircle, ArrowDown,
} from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { chatApi } from '../api';
import { classroomApi } from '@/features/classroom/api';
import { permissionsOf } from '@/features/classroom/permissions';
import type { MemberRole, ClassroomMember } from '@/features/classroom/types';
import { RoleBadges } from '@/features/classroom/components/RoleBadges';
import type { Conversation, Message, MessageType, PollPayload, EventPayload } from '../types';
import { eventApi } from '@/features/event/api';
import type { Poll, EventRsvp, RsvpResponse } from '@/features/event/types';
import { RSVP_LABELS, RSVP_COLOR } from '@/features/event/types';
import { ImageThumbnail } from '../components/ImageThumbnail';
import { ChatAttachmentPreview } from '../components/ChatAttachmentPreview';
import { CreatePollModal } from '../components/CreatePollModal';
import { CreateEventModal } from '../components/CreateEventModal';
import { MessageActions } from '../components/MessageActions';
import { QuotedMessage } from '../components/QuotedMessage';
import { ReactionRow } from '../components/ReactionRow';
import { ChatRightPanel } from '../components/ChatRightPanel';
import { useAuth } from '@/features/auth';
import { memToken, refreshAccessToken } from '@/services/api-client';
import { WS_BASE } from '@/shared/constants';

// ─── Utilities ─────────────────────────────────────────────────────────────────

const formatSize = (bytes: number | null) => {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const isImageType = (t: string | null) => !!t && t.toLowerCase().startsWith('image/');

const previewOfPending = (msg: Message): string => {
  switch (msg.messageType) {
    case 'TEXT':  return msg.content ?? '';
    case 'IMAGE': return `🖼 ${msg.attachmentName ?? 'Hình ảnh'}`;
    case 'FILE':  return `📎 ${msg.attachmentName ?? 'Tệp'}`;
    case 'POLL':  return '📊 Bình chọn';
    case 'EVENT': return '📅 Sự kiện';
  }
};

const formatTime = (s: string) =>
  new Date(s).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

function getDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Hôm nay';
  if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua';
  return date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
}

// Returns white or near-black text depending on background luminance
function getContrastColor(bg: string): string {
  if (!bg.startsWith('#')) return 'white';
  const r = parseInt(bg.slice(1, 3), 16);
  const g = parseInt(bg.slice(3, 5), 16);
  const b = parseInt(bg.slice(5, 7), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? '#111827' : 'white';
}

// ─── Grouping logic ────────────────────────────────────────────────────────────

type BubblePosition = 'single' | 'first' | 'middle' | 'last';

const MINUTE_MS = 60_000;

function getGroupPositions(messages: Message[]): BubblePosition[] {
  const positions: BubblePosition[] = new Array(messages.length).fill('single');
  for (let i = 0; i < messages.length; i++) {
    const cur = messages[i];
    const prev = i > 0 ? messages[i - 1] : null;
    const next = i < messages.length - 1 ? messages[i + 1] : null;

    const sameAsPrev = prev !== null
      && !prev.deleted && !cur.deleted
      && prev.senderId === cur.senderId
      && new Date(cur.createdAt).getTime() - new Date(prev.createdAt).getTime() <= MINUTE_MS;

    const sameAsNext = next !== null
      && !next.deleted && !cur.deleted
      && next.senderId === cur.senderId
      && new Date(next.createdAt).getTime() - new Date(cur.createdAt).getTime() <= MINUTE_MS;

    if (sameAsPrev && sameAsNext) positions[i] = 'middle';
    else if (sameAsPrev && !sameAsNext) positions[i] = 'last';
    else if (!sameAsPrev && sameAsNext) positions[i] = 'first';
    else positions[i] = 'single';
  }
  return positions;
}

function getBorderRadius(position: BubblePosition, isMine: boolean): string {
  if (position === 'single') return '18px 18px 18px 18px';
  if (isMine) {
    if (position === 'first')  return '18px 18px 4px 18px';
    if (position === 'middle') return '18px 4px 4px 18px';
    if (position === 'last')   return '18px 4px 18px 18px';
  } else {
    if (position === 'first')  return '18px 18px 18px 4px';
    if (position === 'middle') return '4px 18px 18px 4px';
    if (position === 'last')   return '4px 18px 18px 18px';
  }
  return '18px 18px 18px 18px';
}

// ─── Pending upload entry ──────────────────────────────────────────────────────

interface PendingUpload {
  id: string;
  file: File;
  asImage: boolean;
  objectUrl: string;
}

// ─── Date separator item ───────────────────────────────────────────────────────

type ListItem =
  | { type: 'date'; label: string; key: string }
  | { type: 'message'; msg: Message; position: BubblePosition; showTime: boolean; key: string };

function buildListItems(messages: Message[]): ListItem[] {
  const visible = messages.filter((m) => !m.deleted);
  const positions = getGroupPositions(visible);
  const items: ListItem[] = [];
  let lastDateStr = '';

  for (let i = 0; i < visible.length; i++) {
    const msg = visible[i];
    const prev = i > 0 ? visible[i - 1] : null;
    const date = new Date(msg.createdAt);
    const dateStr = date.toDateString();
    if (dateStr !== lastDateStr) {
      lastDateStr = dateStr;
      items.push({ type: 'date', label: getDateLabel(date), key: `date-${dateStr}` });
    }
    // Show time above the FIRST message in a group (time is now above the bubble).
    const showTime = !prev
      || prev.senderId !== msg.senderId
      || date.getTime() - new Date(prev.createdAt).getTime() > MINUTE_MS;
    items.push({ type: 'message', msg, position: positions[i], showTime, key: msg.id });
  }
  return items;
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export function ChatPage() {
  const { classroomId } = useParams<{ classroomId: string }>();
  const { user } = useAuth();
  const location = useLocation();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [myRole, setMyRole] = useState<MemberRole | null>(null);
  const [classroomName, setClassroomName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [pluginMenuOpen, setPluginMenuOpen] = useState(false);
  const [pollOpen, setPollOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [previewing, setPreviewing] = useState<{ url: string; name: string; contentType: string | null } | null>(null);
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasNewer, setHasNewer] = useState(false);
  const [loadingNewer, setLoadingNewer] = useState(false);
  const [isJumpContext, setIsJumpContext] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [members, setMembers] = useState<ClassroomMember[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [activePickerMsgId, setActivePickerMsgId] = useState<string | null>(null);
  // Panel open/close with slide animation
  const [panelVisible, setPanelVisible] = useState(false);
  const [panelEntered, setPanelEntered] = useState(false);
  const panelCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [bubbleColor, setBubbleColor] = useState(
    () => localStorage.getItem('chat-bubble-color') ?? 'var(--sidebar-accent)',
  );
  const [wallpaper, setWallpaper] = useState(
    () => localStorage.getItem('chat-wallpaper') ?? '',
  );
  const [wallpaperBlobUrl, setWallpaperBlobUrl] = useState<string | null>(null);
  const settingsSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextPageRef = useRef(1);   // next page index going backward (older)
  const newerPageRef = useRef(-1); // next page index going forward (newer, toward present)
  const isJumpContextRef = useRef(false); // synced ref so upsertMessage closure can read it
  const bottomRef = useRef<HTMLDivElement>(null);
  const newerSentinelRef = useRef<HTMLDivElement>(null); // triggers load-newer
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<Client | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isNearBottomRef = useRef(true);
  const initialLoadDone = useRef(false);

  const perms = myRole ? permissionsOf(myRole) : null;
  const canPin = perms ? perms.canManageEvents : false;
  const canDeleteOthers = perms ? perms.canApproveAbsence : false;

  // Keep ref in sync so upsertMessage (captured in a closure) can read current jump state
  useEffect(() => { isJumpContextRef.current = isJumpContext; }, [isJumpContext]);

  // ─── Wallpaper blob — fetch authenticated image for background ────────────

  useEffect(() => {
    const isApiUrl = wallpaper && (wallpaper.startsWith('/') || wallpaper.startsWith('http'));
    if (!isApiUrl) {
      setWallpaperBlobUrl(null);
      return;
    }
    let revoked = false;
    let objectUrl: string | null = null;
    chatApi.fetchAttachmentBlob(wallpaper).then((blob) => {
      if (revoked) return;
      objectUrl = URL.createObjectURL(blob);
      setWallpaperBlobUrl(objectUrl);
    }).catch(() => {});
    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [wallpaper]);

  // ─── Panel slide animation ─────────────────────────────────────────────────

  const openPanel = useCallback(() => {
    if (panelCloseTimer.current) clearTimeout(panelCloseTimer.current);
    setPanelVisible(true);
    // Two rAF frames so the initial translateX(100%) renders before we transition to 0
    requestAnimationFrame(() => requestAnimationFrame(() => setPanelEntered(true)));
  }, []);

  const closePanel = useCallback(() => {
    setPanelEntered(false);
    panelCloseTimer.current = setTimeout(() => setPanelVisible(false), 300);
  }, []);

  // ─── Bubble color / wallpaper persistence ─────────────────────────────────

  const persistSettings = useCallback((color: string, wp: string) => {
    if (!classroomId || !conversation) return;
    if (settingsSaveTimer.current) clearTimeout(settingsSaveTimer.current);
    settingsSaveTimer.current = setTimeout(() => {
      chatApi.saveSettings(classroomId, conversation.id, color, wp).catch(() => {});
    }, 800);
  }, [classroomId, conversation]);

  const handleBubbleColorChange = (c: string) => {
    setBubbleColor(c);
    localStorage.setItem('chat-bubble-color', c);
    persistSettings(c, wallpaper);
  };
  const handleWallpaperChange = (w: string) => {
    setWallpaper(w);
    localStorage.setItem('chat-wallpaper', w);
    persistSettings(bubbleColor, w);
  };
  const handleWallpaperImageUpload = async (file: File) => {
    if (!classroomId || !conversation) return;
    const att = await chatApi.uploadAttachment(classroomId, conversation.id, file);
    handleWallpaperChange(att.url);
  };

  // ─── Track near-bottom state ───────────────────────────────────────────────

  const checkNearBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distFromBottom <= 150;
  }, []);

  // ─── Scroll to bottom ──────────────────────────────────────────────────────

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  // ─── Upsert message ────────────────────────────────────────────────────────

  const upsertMessage = useCallback((m: Message, fromStomp = false, isMine = false) => {
    let isNew = false;
    setMessages((prev) => {
      const idx = prev.findIndex((x) => x.id === m.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = m;
        return next;
      }
      isNew = true;
      return [...prev, m];
    });
    setPinnedMessages((prev) => {
      const idx = prev.findIndex((x) => x.id === m.id);
      if (m.pinned && !m.deleted) {
        if (idx >= 0) { const next = [...prev]; next[idx] = m; return next; }
        return [m, ...prev];
      }
      return idx >= 0 ? prev.filter((x) => x.id !== m.id) : prev;
    });

    if (fromStomp && isMine && (m.messageType === 'IMAGE' || m.messageType === 'FILE')) {
      setPendingUploads((prev) => {
        if (prev.length === 0) return prev;
        const [first, ...rest] = prev;
        URL.revokeObjectURL(first.objectUrl);
        return rest;
      });
    }

    if (fromStomp && isNew) {
      // Don't auto-scroll when viewing an old batch via jump — let the user read
      if (!isJumpContextRef.current && (isMine || isNearBottomRef.current)) {
        setTimeout(() => scrollToBottom('smooth'), 50);
      }
    }
  }, [scrollToBottom]);

  // ─── Load initial data ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!classroomId) return;
    Promise.all([
      chatApi.getClassConversation(classroomId),
      classroomApi.get(classroomId),
      classroomApi.listMembers(classroomId),
    ])
      .then(async ([conv, classroom, mems]) => {
        setConversation(conv);
        setMyRole(classroom.myRole);
        setClassroomName(classroom.name ?? '');
        setMembers(mems ?? []);
        const [page, pinned, settings] = await Promise.all([
          chatApi.getMessages(classroomId, conv.id, 0),
          chatApi.listPinned(classroomId, conv.id),
          chatApi.getSettings(classroomId, conv.id),
        ]);
        setMessages([...page.content].reverse());
        setPinnedMessages(pinned);
        setHasOlder(page.totalPages > 1);
        nextPageRef.current = 1;
        if (settings.bubbleColor) {
          setBubbleColor(settings.bubbleColor);
          localStorage.setItem('chat-bubble-color', settings.bubbleColor);
        }
        if (settings.wallpaper != null) {
          setWallpaper(settings.wallpaper);
          localStorage.setItem('chat-wallpaper', settings.wallpaper);
        }
      })
      .finally(() => setLoading(false));
  }, [classroomId]);

  useEffect(() => {
    if (!loading && !initialLoadDone.current) {
      initialLoadDone.current = true;
      const scrollToId = (location.state as { scrollTo?: string } | null)?.scrollTo;
      if (scrollToId) {
        setTimeout(() => jumpToMessage(scrollToId), 300);
      } else {
        requestAnimationFrame(() => scrollToBottom('instant' as ScrollBehavior));
      }
    }
  // jumpToMessage and location.state intentionally read once on first load
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, scrollToBottom]);

  // ─── STOMP subscription ────────────────────────────────────────────────────

  useEffect(() => {
    if (!conversation) return;
    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_BASE}/ws`),
      reconnectDelay: 5000,
      beforeConnect: async () => {
        let tok = memToken.get();
        if (!tok) {
          try { tok = await refreshAccessToken(); } catch { /* server will reject gracefully */ }
        }
        client.connectHeaders = tok ? { Authorization: `Bearer ${tok}` } : {};
      },
      onConnect: () => {
        client.subscribe(`/topic/conversations/${conversation.id}`, (frame) => {
          const msg: Message = JSON.parse(frame.body);
          const isMine = msg.senderId === user?.id;
          upsertMessage(msg, true, isMine);
        });

        // Forward poll/RSVP realtime updates to PluginCards via window event.
        // A single subscription serves every visible card without each one
        // opening its own STOMP connection.
        if (classroomId) {
          client.subscribe(`/topic/classrooms/${classroomId}/events`, (frame) => {
            const detail = JSON.parse(frame.body);
            window.dispatchEvent(new CustomEvent('events-realtime', { detail }));
          });
        }
      },
    });
    client.activate();
    clientRef.current = client;
    return () => { client.deactivate(); };
  }, [conversation, upsertMessage, user?.id, classroomId]);

  // ─── IntersectionObserver: load older messages (scroll up) ───────────────

  useEffect(() => {
    if (!sentinelRef.current || !conversation || !classroomId) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0].isIntersecting) return;
        if (!hasOlder || loadingOlder) return;

        const container = scrollContainerRef.current;
        if (!container) return;

        const prevScrollHeight = container.scrollHeight;
        setLoadingOlder(true);
        try {
          const page = await chatApi.getMessages(classroomId, conversation.id, nextPageRef.current);
          const older = [...page.content].reverse();
          setMessages((prev) => [...older, ...prev]);
          nextPageRef.current += 1;
          setHasOlder(page.number + 1 < page.totalPages);

          requestAnimationFrame(() => {
            if (container) {
              container.scrollTop = container.scrollHeight - prevScrollHeight;
            }
          });
        } finally {
          setLoadingOlder(false);
        }
      },
      { root: scrollContainerRef.current, threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation, classroomId, hasOlder, loadingOlder]);

  // ─── IntersectionObserver: load newer messages (scroll down in jump context) ─

  useEffect(() => {
    if (!newerSentinelRef.current || !hasNewer || !conversation || !classroomId) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0].isIntersecting) return;
        if (!hasNewer || loadingNewer) return;
        if (newerPageRef.current < 0) return;

        setLoadingNewer(true);
        try {
          const page = await chatApi.getMessages(classroomId, conversation.id, newerPageRef.current);
          const newer = [...page.content].reverse();
          setMessages((prev) => [...prev, ...newer]);
          newerPageRef.current -= 1;
          const stillHasNewer = newerPageRef.current >= 0;
          setHasNewer(stillHasNewer);
          if (!stillHasNewer) setIsJumpContext(false);
        } finally {
          setLoadingNewer(false);
        }
      },
      { root: scrollContainerRef.current, threshold: 0.1 },
    );

    observer.observe(newerSentinelRef.current);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation, classroomId, hasNewer, loadingNewer]);

  useEffect(() => {
    if (replyTarget) inputRef.current?.focus();
  }, [replyTarget]);

  // ─── Send text ─────────────────────────────────────────────────────────────

  const sendText = useCallback(async () => {
    if (!classroomId || !conversation || !input.trim()) return;
    const trimmed = input.trim();
    const replyToId = replyTarget?.id;
    setInput('');
    setReplyTarget(null);
    try {
      await chatApi.sendMessage(classroomId, conversation.id, {
        content: trimmed,
        messageType: 'TEXT',
        replyToId,
      });
      setTimeout(() => scrollToBottom('smooth'), 100);
    } catch {
      setInput(trimmed);
    }
  }, [classroomId, conversation, input, replyTarget, scrollToBottom]);

  // ─── @mention helpers ──────────────────────────────────────────────────────

  const mentionCandidates = useMemo(
    () => mentionQuery !== null
      ? members.filter((m) =>
          m.displayName.toLowerCase().includes(mentionQuery.toLowerCase()),
        ).slice(0, 6)
      : [],
    [mentionQuery, members],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    const cursor = e.target.selectionStart ?? val.length;
    const textBefore = val.slice(0, cursor);
    const match = textBefore.match(/@(\S*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (displayName: string) => {
    const cursor = inputRef.current?.selectionStart ?? input.length;
    const textBefore = input.slice(0, cursor);
    const textAfter = input.slice(cursor);
    const replaced = textBefore.replace(/@(\S*)$/, `@${displayName} `);
    setInput(replaced + textAfter);
    setMentionQuery(null);
    setTimeout(() => {
      inputRef.current?.focus();
      const pos = replaced.length;
      inputRef.current?.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && mentionCandidates.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex((i) => (i + 1) % mentionCandidates.length); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setMentionIndex((i) => (i - 1 + mentionCandidates.length) % mentionCandidates.length); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(mentionCandidates[mentionIndex].displayName); return; }
      if (e.key === 'Escape') { setMentionQuery(null); return; }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText(); }
    if (e.key === 'Escape' && replyTarget) { setReplyTarget(null); }
  };

  // ─── Upload ────────────────────────────────────────────────────────────────

  const handleUpload = async (file: File, asImage: boolean) => {
    if (!classroomId || !conversation) return;
    const replyToId = replyTarget?.id;
    setReplyTarget(null);

    const pendingId = crypto.randomUUID();
    const objectUrl = URL.createObjectURL(file);
    setPendingUploads((prev) => [...prev, { id: pendingId, file, asImage, objectUrl }]);
    setUploading(true);

    setTimeout(() => scrollToBottom('smooth'), 50);

    try {
      const att = await chatApi.uploadAttachment(classroomId, conversation.id, file);
      const messageType: MessageType = asImage && isImageType(att.contentType) ? 'IMAGE' : 'FILE';
      await chatApi.sendMessage(classroomId, conversation.id, {
        messageType,
        attachmentUrl: att.url,
        attachmentName: att.name,
        attachmentType: att.contentType ?? undefined,
        attachmentSize: att.size,
        replyToId,
      });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? 'Tải lên thất bại');
      setPendingUploads((prev) => {
        const entry = prev.find((p) => p.id === pendingId);
        if (entry) URL.revokeObjectURL(entry.objectUrl);
        return prev.filter((p) => p.id !== pendingId);
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((it) => it.type.startsWith('image/'));
    if (!imageItem) return;
    e.preventDefault();
    const file = imageItem.getAsFile();
    if (file) handleUpload(file, true);
  };

  const handlePollCreated = async (poll: { id: string; question: string }) => {
    if (!classroomId || !conversation) return;
    setPollOpen(false);
    try {
      await chatApi.sendMessage(classroomId, conversation.id, {
        messageType: 'POLL',
        payload: { pollId: poll.id, question: poll.question },
      });
      setTimeout(() => scrollToBottom('smooth'), 100);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? 'Không gửi được bình chọn');
    }
  };

  const handleEventCreated = async (ev: { id: string; title: string; startTime: string }) => {
    if (!classroomId || !conversation) return;
    setEventOpen(false);
    try {
      await chatApi.sendMessage(classroomId, conversation.id, {
        messageType: 'EVENT',
        payload: { eventId: ev.id, title: ev.title, startTime: ev.startTime },
      });
      setTimeout(() => scrollToBottom('smooth'), 100);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? 'Không gửi được sự kiện');
    }
  };

  // ─── Message actions ───────────────────────────────────────────────────────

  const handleDelete = async (messageId: string) => {
    if (!classroomId || !conversation) return;
    if (!confirm('Xóa tin nhắn này?')) return;
    await chatApi.deleteMessage(classroomId, conversation.id, messageId);
  };

  const handleToggleReaction = async (messageId: string, emoji: string, currentlyReacted: boolean) => {
    if (!classroomId || !conversation) return;
    try {
      const next = currentlyReacted
        ? await chatApi.removeReaction(classroomId, conversation.id, messageId, emoji)
        : await chatApi.addReaction(classroomId, conversation.id, messageId, emoji);
      upsertMessage(next);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? 'Có lỗi xảy ra');
    }
  };

  const handleTogglePin = async (msg: Message) => {
    if (!classroomId || !conversation) return;
    try {
      const next = msg.pinned
        ? await chatApi.unpin(classroomId, conversation.id, msg.id)
        : await chatApi.pin(classroomId, conversation.id, msg.id);
      upsertMessage(next);
    } catch (e: unknown) {
      const m = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(m ?? 'Không thể ghim/bỏ ghim tin nhắn');
    }
  };

  const highlightMessage = (messageId: string) => {
    const el = messageRefs.current.get(messageId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const prev = el.style.boxShadow;
    el.style.boxShadow = '0 0 0 2px var(--warm-400)';
    el.style.transition = 'box-shadow 0.5s';
    setTimeout(() => { el.style.boxShadow = prev; }, 1500);
  };

  const jumpToMessage = useCallback(async (messageId: string) => {
    // Already in DOM — just scroll to it
    if (messageRefs.current.has(messageId)) {
      highlightMessage(messageId);
      return;
    }
    if (!classroomId || !conversation) return;
    try {
      // Find which page this message lives on
      const pageNum = await chatApi.getMessagePageNumber(classroomId, conversation.id, messageId);
      // Load that page, replacing the current window
      const page = await chatApi.getMessages(classroomId, conversation.id, pageNum);
      const msgs = [...page.content].reverse();
      setMessages(msgs);
      // Older direction (scrolling up)
      nextPageRef.current = pageNum + 1;
      setHasOlder(pageNum + 1 < page.totalPages);
      // Newer direction (scrolling down toward present)
      newerPageRef.current = pageNum - 1;
      const jumpCtx = pageNum > 0;
      setHasNewer(jumpCtx);
      setIsJumpContext(jumpCtx);
      // Scroll to target after render
      requestAnimationFrame(() => setTimeout(() => highlightMessage(messageId), 80));
    } catch {
      // Message gone or network error — silently ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId, conversation]);

  const returnToLatest = useCallback(async () => {
    if (!classroomId || !conversation) return;
    const page = await chatApi.getMessages(classroomId, conversation.id, 0);
    setMessages([...page.content].reverse());
    setHasOlder(page.totalPages > 1);
    nextPageRef.current = 1;
    setHasNewer(false);
    setIsJumpContext(false);
    newerPageRef.current = -1;
    setTimeout(() => scrollToBottom('instant' as ScrollBehavior), 50);
  }, [classroomId, conversation, scrollToBottom]);

  // ─── Render ────────────────────────────────────────────────────────────────

  const listItems = useMemo(() => buildListItems(messages), [messages]);

  if (loading) return <div className="animate-pulse text-center py-10 text-ink-3">Đang tải...</div>;

  const rightPanelProps = {
    pinnedMessages,
    messages,
    onJumpToMessage: jumpToMessage,
    bubbleColor,
    onBubbleColorChange: handleBubbleColorChange,
    wallpaper,
    onWallpaperChange: handleWallpaperChange,
    onWallpaperImageUpload: handleWallpaperImageUpload,
    onPreviewAttachment: (url: string, name: string, ct: string | null) =>
      setPreviewing({ url, name, contentType: ct }),
  };

  return (
    <div className="flex gap-3 max-w-[1100px] mx-auto px-4 py-6" style={{ height: 'calc(100vh - 120px)' }}>

      {/* ── Chat column ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 relative">

        {/* Header */}
        <div className="card mb-3 px-4 py-3 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ink-1 truncate">
              {classroomName || 'Trò chuyện lớp học'}
            </p>
            <p className="text-[11px] text-ink-3">Trò chuyện lớp học · Realtime</p>
          </div>
          <div className="flex items-center gap-1 lg:hidden">
            <button
              onClick={openPanel}
              className="btn btn-ghost btn-icon"
              title="Tin nhắn đã ghim"
            >
              <Pin size={16} />
            </button>
            <button
              onClick={openPanel}
              className="btn btn-ghost btn-icon"
              title="Thông tin & Tuỳ chỉnh"
            >
              <Info size={16} />
            </button>
          </div>
        </div>

        {/* Messages scroll area */}
        <div
          ref={scrollContainerRef}
          onScroll={checkNearBottom}
          className="card flex-1 overflow-y-auto p-4 min-h-0"
          style={
            wallpaperBlobUrl
              ? { backgroundImage: `url(${wallpaperBlobUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: wallpaper || undefined }
          }
        >
          <div ref={sentinelRef} className="h-1" />

          {loadingOlder && (
            <div className="flex justify-center py-2">
              <Loader2 size={16} className="animate-spin text-ink-3" />
            </div>
          )}

          {messages.length === 0 && (
            <div className="text-center py-10 text-ink-3">Chưa có tin nhắn nào</div>
          )}

          {listItems.map((item) => {
            if (item.type === 'date') {
              return (
                <div key={item.key} className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px" style={{ background: 'var(--rule)' }} />
                  <span className="text-[11px] text-ink-3 font-medium shrink-0">{item.label}</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--rule)' }} />
                </div>
              );
            }

            const { msg, position, showTime } = item;
            const isMine = msg.senderId === user?.id;
            const isLastInGroup = position === 'last' || position === 'single';
            const isFirstInGroup = position === 'first' || position === 'single';
            const marginBottom = position === 'last' || position === 'single' ? 'mb-1' : 'mb-0.5';
            const senderMember = members.find((m) => m.userId === msg.senderId);

            return (
              <MessageBubble
                key={item.key}
                ref={(el) => {
                  if (el) messageRefs.current.set(msg.id, el);
                  else messageRefs.current.delete(msg.id);
                }}
                msg={msg}
                isMine={isMine}
                classroomId={classroomId!}
                canPin={canPin || msg.senderId === user?.id}
                canDelete={canDeleteOthers}
                position={position}
                isLastInGroup={isLastInGroup}
                isFirstInGroup={isFirstInGroup}
                marginBottom={marginBottom}
                showTime={showTime}
                bubbleColor={bubbleColor}
                senderPrimaryRole={senderMember?.role}
                senderExtraRoles={senderMember?.extraRoles}
                resolveUserName={(uid) => members.find((m) => m.userId === uid)?.displayName}
                pickerOpen={activePickerMsgId === msg.id}
                onPickerChange={(open) => setActivePickerMsgId(open ? msg.id : null)}
                onPreviewAttachment={(url, name, ct) => setPreviewing({ url, name, contentType: ct })}
                onDelete={() => handleDelete(msg.id)}
                onReply={() => setReplyTarget(msg)}
                onReact={(emoji) => {
                  const cur = msg.reactions.find((r) => r.emoji === emoji);
                  handleToggleReaction(msg.id, emoji, cur?.reactedByMe ?? false);
                }}
                onTogglePin={() => handleTogglePin(msg)}
                onJumpToReply={(id) => jumpToMessage(id)}
              />
            );
          })}

          {pendingUploads.map((p) => (
            <PendingUploadBubble key={p.id} pending={p} />
          ))}

          {/* Newer-messages sentinel — triggers load when user scrolls near bottom in jump context */}
          {hasNewer && <div ref={newerSentinelRef} className="h-1" />}

          {loadingNewer && (
            <div className="flex justify-center py-2">
              <Loader2 size={16} className="animate-spin text-ink-3" />
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Back-to-latest button — shown when viewing an older batch */}
        {isJumpContext && (
          <button
            onClick={returnToLatest}
            className="absolute flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg transition-all"
            style={{
              bottom: '80px',
              right: '16px',
              background: 'var(--sidebar-accent)',
              color: '#fff',
              zIndex: 20,
            }}
          >
            <ArrowDown size={13} />
            Tin nhắn mới nhất
          </button>
        )}

        {/* Reply banner */}
        {replyTarget && (
          <div className="card mt-3 px-3 py-2 flex items-start gap-2">
            <div className="w-1 self-stretch rounded" style={{ background: 'var(--sidebar-accent)' }} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-ink-3">Đang trả lời</p>
              <p className="text-xs text-ink-2 truncate">
                <span className="font-medium">{replyTarget.senderName ?? 'Người dùng'}:</span>{' '}
                {previewOfPending(replyTarget)}
              </p>
            </div>
            <button onClick={() => setReplyTarget(null)} className="btn btn-ghost btn-icon">
              <X size={14} />
            </button>
          </div>
        )}

        {/* @mention dropdown */}
        {mentionQuery !== null && mentionCandidates.length > 0 && (
          <div className="card mt-2 overflow-hidden shadow-lg animate-scale-in" style={{ zIndex: 50 }}>
            {mentionCandidates.map((m, i) => (
              <button
                key={m.userId}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                  i === mentionIndex ? 'bg-surface-2' : 'hover:bg-surface-2'
                }`}
                onMouseDown={(e) => { e.preventDefault(); insertMention(m.displayName); }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
                     style={{ background: 'var(--sidebar-accent)' }}>
                  {m.displayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-ink-1 font-medium">{m.displayName}</span>
                <span className="ml-auto">
                  <RoleBadges primary={m.role} extras={m.extraRoles ?? []} short max={2} />
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="card mt-2 flex flex-col" style={{ overflow: 'visible' }}>
          <div className="flex items-center gap-2 px-3 py-2.5">
            <div className="relative" style={pluginMenuOpen ? { zIndex: 60 } : undefined}>
              <button
                onClick={() => setPluginMenuOpen((v) => !v)}
                className="btn btn-ghost btn-icon shrink-0"
                title="Đính kèm"
                disabled={uploading}
              >
                <Plus size={18} />
              </button>
              {pluginMenuOpen && (
                <>
                  <div className="fixed inset-0" style={{ zIndex: 59 }} onClick={() => setPluginMenuOpen(false)} />
                  <div className="absolute bottom-full left-0 mb-2 w-52 shadow-xl animate-scale-in"
                       style={{
                         zIndex: 60,
                         background: 'var(--bg-surface)',
                         border: '1px solid var(--rule)',
                         borderRadius: '10px',
                         overflow: 'hidden',
                       }}>
                    <PluginButton icon={<ImageIcon size={14} />} label="Ảnh" onClick={() => {
                      setPluginMenuOpen(false); imageInputRef.current?.click();
                    }} />
                    <PluginButton icon={<Paperclip size={14} />} label="Tệp đính kèm" onClick={() => {
                      setPluginMenuOpen(false); fileInputRef.current?.click();
                    }} />
                    <PluginButton icon={<BarChart3 size={14} />} label="Tạo bình chọn" onClick={() => {
                      setPluginMenuOpen(false); setPollOpen(true);
                    }} />
                    <PluginButton icon={<Calendar size={14} />} label="Tạo sự kiện" onClick={() => {
                      setPluginMenuOpen(false); setEventOpen(true);
                    }} />
                  </div>
                </>
              )}
            </div>

            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={uploading ? 'Đang tải lên...' : (replyTarget ? 'Trả lời...' : 'Nhắn tin... (@mention, Shift+Enter xuống dòng)')}
              rows={1}
              disabled={uploading}
              className="flex-1 resize-none bg-transparent outline-none text-sm text-ink-1 placeholder:text-ink-3 leading-5"
              style={{ maxHeight: '120px' }}
            />

            <button
              onClick={sendText}
              disabled={!input.trim() || uploading}
              className="btn btn-primary btn-sm shrink-0"
            >
              <Send size={14} />
            </button>
          </div>

          <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
                 onChange={(e) => {
                   const f = e.target.files?.[0]; if (f) handleUpload(f, true);
                   if (imageInputRef.current) imageInputRef.current.value = '';
                 }} />
          <input ref={fileInputRef} type="file" className="hidden"
                 onChange={(e) => {
                   const f = e.target.files?.[0]; if (f) handleUpload(f, false);
                   if (fileInputRef.current) fileInputRef.current.value = '';
                 }} />
        </div>
      </div>

      {/* ── Desktop right panel ──────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col w-72 shrink-0 rounded-lg overflow-hidden"
        style={{ background: 'var(--bg-surface-2)' }}
      >
        <ChatRightPanel className="flex-1" {...rightPanelProps} />
      </div>

      {/* ── Mobile / tablet panel drawer (slide from right) ─────────────────── */}
      {panelVisible && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 lg:hidden"
            style={{
              background: 'rgba(0,0,0,0.6)',
              opacity: panelEntered ? 1 : 0,
              transition: 'opacity 280ms ease',
            }}
            onClick={closePanel}
          />

          {/* Drawer — full width on phones, 320px on larger small screens */}
          <div
            className="fixed right-0 top-0 h-full z-50 lg:hidden flex flex-col w-full sm:w-80"
            style={{
              background: 'var(--bg-surface)',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.18)',
              transform: panelEntered ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 280ms ease',
            }}
          >
            {/* Drawer header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ borderBottom: '1px solid var(--rule)', background: 'var(--bg-surface)' }}
            >
              <div>
                <p className="font-semibold text-sm text-ink-1">Thông tin cuộc trò chuyện</p>
                {classroomName && (
                  <p className="text-[11px] text-ink-3 truncate">{classroomName}</p>
                )}
              </div>
              <button onClick={closePanel} className="btn btn-ghost btn-icon">
                <X size={16} />
              </button>
            </div>

            {/* Drawer content */}
            <div className="flex-1 overflow-hidden flex flex-col p-3" style={{ background: 'var(--bg-surface-2)' }}>
              <ChatRightPanel
                className="flex-1"
                {...rightPanelProps}
                onJumpToMessage={(id) => { jumpToMessage(id); closePanel(); }}
                onPreviewAttachment={(url, name, ct) => {
                  setPreviewing({ url, name, contentType: ct });
                  closePanel();
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      {pollOpen && classroomId && (
        <CreatePollModal classroomId={classroomId}
                         onClose={() => setPollOpen(false)}
                         onCreated={handlePollCreated} />
      )}
      {eventOpen && classroomId && (
        <CreateEventModal classroomId={classroomId}
                          onClose={() => setEventOpen(false)}
                          onCreated={handleEventCreated} />
      )}
      {previewing && (
        <ChatAttachmentPreview {...previewing} onClose={() => setPreviewing(null)} />
      )}
    </div>
  );
}

// ─── Pending upload bubble ─────────────────────────────────────────────────────

function PendingUploadBubble({ pending }: { pending: PendingUpload }) {
  return (
    <div className="flex flex-row-reverse gap-2 mb-3">
      <div className="max-w-[75%] flex flex-col items-end">
        <div
          className="flex items-center gap-2 px-3 py-2 text-sm text-white"
          style={{
            background: 'var(--sidebar-accent)',
            borderRadius: '18px 18px 18px 18px',
            opacity: 0.75,
          }}
        >
          <Loader2 size={14} className="animate-spin shrink-0" />
          <span className="text-xs truncate max-w-[160px]">
            {pending.file.name}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Message bubble ────────────────────────────────────────────────────────────

interface BubbleProps {
  msg: Message;
  isMine: boolean;
  classroomId: string;
  canPin: boolean;
  canDelete: boolean;
  position: BubblePosition;
  isLastInGroup: boolean;
  isFirstInGroup: boolean;
  marginBottom: string;
  showTime: boolean;
  bubbleColor: string;
  pickerOpen: boolean;
  senderPrimaryRole?: MemberRole;
  senderExtraRoles?: MemberRole[];
  resolveUserName?: (userId: string) => string | undefined;
  onPickerChange: (open: boolean) => void;
  onPreviewAttachment: (url: string, name: string, contentType: string | null) => void;
  onDelete: () => void;
  onReply: () => void;
  onReact: (emoji: string) => void;
  onTogglePin: () => void;
  onJumpToReply: (id: string) => void;
}

const MessageBubble = React.memo(forwardRef<HTMLDivElement, BubbleProps>(
  function MessageBubble(
    {
      msg, isMine, classroomId, canPin, canDelete, position,
      isLastInGroup, isFirstInGroup, marginBottom, showTime,
      bubbleColor, pickerOpen, senderPrimaryRole, senderExtraRoles, resolveUserName, onPickerChange,
      onPreviewAttachment, onDelete, onReply, onReact, onTogglePin, onJumpToReply,
    },
    ref,
  ) {
    const isMediaOrPlugin = msg.messageType !== 'TEXT';
    const borderRadius = getBorderRadius(position, isMine);
    const textColor = isMine ? getContrastColor(bubbleColor) : 'var(--ink-1)';

    return (
      <div
        ref={ref}
        className={`flex flex-col group relative ${marginBottom}`}
        // Reserve room below the bubble so the absolute-positioned reactions
        // chip (which floats outside the bubble's layout box) doesn't crash
        // into the next message.
        style={msg.reactions.length > 0 && !msg.deleted ? { paddingBottom: 14 } : undefined}
      >
        {/* Bubble row — items-end so avatar aligns with the bubble bottom. */}
        <div className={`flex gap-2 items-end ${isMine ? 'flex-row-reverse' : ''}`}>
          {!isMine && (
            isLastInGroup ? (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                style={{ background: 'var(--sidebar-accent)' }}
              >
                {msg.senderName?.charAt(0).toUpperCase() ?? '?'}
              </div>
            ) : (
              <div className="w-7 h-7 shrink-0" />
            )
          )}

          <div className={`max-w-[75%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>

          {/* Pin label — top row when pinned */}
          {msg.pinned && !msg.deleted && (
            <div
              className="flex items-center gap-1 text-[10px] mb-0.5 px-1"
              style={{ color: 'var(--sidebar-accent)' }}
            >
              <Pin size={9} />
              <span className="font-medium">Đã ghim</span>
            </div>
          )}

          {/* Header row: name + time on same row for received first-in-group */}
          {!msg.deleted && !isMine && isFirstInGroup && (
            <div className="flex items-center gap-1.5 mb-0.5 px-1 w-full">
              <p className="text-[11px] font-semibold text-ink-2 shrink-0">
                {msg.senderName ?? 'Người dùng'}
              </p>
              {senderPrimaryRole && senderPrimaryRole !== 'MEMBER' && (
                <RoleBadges
                  primary={senderPrimaryRole}
                  extras={senderExtraRoles ?? []}
                  short
                  max={2}
                />
              )}
              {showTime && (
                <p className="ml-auto text-[10px] text-ink-3 shrink-0 pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatTime(msg.createdAt)}
                </p>
              )}
            </div>
          )}

          {/* Time alone — for my messages or subsequent messages in group */}
          {!msg.deleted && showTime && (isMine || !isFirstInGroup) && (
            <p
              className={`text-[10px] text-ink-3 mb-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                isMine ? 'self-start' : 'self-end'
              }`}
            >
              {formatTime(msg.createdAt)}
            </p>
          )}

          {/* Bubble + actions wrapper — relative so MessageActions and the
              reactions overlay both anchor to the bubble. The wrapper's
              layout height stays exactly the bubble's height so the avatar
              (items-end on the bubble row) aligns with the bubble bottom
              regardless of any reactions overlay. */}
          <div className="relative">
            {!msg.deleted && (
              <MessageActions
                isMine={isMine}
                pinned={msg.pinned}
                canPin={canPin}
                canDelete={canDelete}
                pickerOpen={pickerOpen}
                onPickerChange={onPickerChange}
                onReply={onReply}
                onReact={onReact as (emoji: string) => void}
                onTogglePin={onTogglePin}
                onDelete={onDelete}
              />
            )}

          {/* Bubble content */}
          <div
            className={`text-sm ${msg.deleted ? 'opacity-40 italic' : ''} ${
              isMediaOrPlugin ? '' : 'px-3 py-2'
            }`}
            style={{
              borderRadius,
              background: isMediaOrPlugin
                ? 'transparent'
                : isMine
                  ? bubbleColor
                  : 'var(--bg-surface-2)',
              color: isMediaOrPlugin ? undefined : textColor,
            }}
          >
            {msg.deleted ? (
              <p style={{ color: 'var(--ink-2)' }}>Tin nhắn đã bị xóa</p>
            ) : (
              <>
                {msg.replyToPreview && (
                  <QuotedMessage
                    reply={msg.replyToPreview}
                    isMine={isMine}
                    onClick={() => onJumpToReply(msg.replyToPreview!.id)}
                  />
                )}

                {msg.messageType === 'TEXT' && msg.content && (
                  <p
                    className="whitespace-pre-wrap break-words"
                    style={{ color: textColor }}
                  >
                    {msg.content}
                  </p>
                )}

                {msg.messageType === 'IMAGE' && msg.attachmentUrl && (
                  <ImageThumbnail
                    url={msg.attachmentUrl}
                    alt={msg.attachmentName ?? ''}
                    onClick={() => onPreviewAttachment(msg.attachmentUrl!, msg.attachmentName ?? '', msg.attachmentType)}
                  />
                )}

                {msg.messageType === 'FILE' && msg.attachmentUrl && (
                  <FileCard
                    url={msg.attachmentUrl}
                    name={msg.attachmentName ?? 'tệp'}
                    contentType={msg.attachmentType}
                    size={msg.attachmentSize}
                    isMine={isMine}
                    onClick={() => onPreviewAttachment(msg.attachmentUrl!, msg.attachmentName ?? 'tệp', msg.attachmentType)}
                  />
                )}

                {msg.messageType === 'POLL' && msg.payloadJson && (
                  <PluginCard classroomId={classroomId} type="POLL"
                              payloadJson={msg.payloadJson} isMine={isMine} />
                )}

                {msg.messageType === 'EVENT' && msg.payloadJson && (
                  <PluginCard classroomId={classroomId} type="EVENT"
                              payloadJson={msg.payloadJson} isMine={isMine} />
                )}
              </>
            )}
          </div>
            {/* Reactions — absolute so they overlap the bubble's bottom
                edge without enlarging its layout box. Chips extend AWAY
                from the speaker (right for others, left for self) so they
                don't crash into the avatar or screen edge. The 12px
                overlap into the bubble keeps the visual bond. */}
            {!msg.deleted && msg.reactions.length > 0 && (
              <div
                className="absolute flex"
                style={{
                  bottom: -12,
                  ...(isMine ? { right: 0 } : { left: 0 }),
                  zIndex: 2,
                  whiteSpace: 'nowrap',
                }}
              >
                <ReactionRow
                  reactions={msg.reactions}
                  resolveUserName={resolveUserName}
                  align={isMine ? 'right' : 'left'}
                  onToggle={(emoji, reacted) => {
                    if (reacted) onReact(emoji);
                    else onReact(emoji);
                  }}
                />
              </div>
            )}
          </div>{/* end relative bubble+actions wrapper */}

          </div>{/* end inner message column */}
        </div>{/* end bubble row */}
      </div>
    );
  },
), (prev, next) =>
  prev.msg === next.msg &&
  prev.pickerOpen === next.pickerOpen &&
  prev.bubbleColor === next.bubbleColor &&
  prev.isLastInGroup === next.isLastInGroup &&
  prev.isFirstInGroup === next.isFirstInGroup &&
  prev.marginBottom === next.marginBottom &&
  prev.showTime === next.showTime,
);

// ─── File card ─────────────────────────────────────────────────────────────────

function FileCard({ url, name, contentType, size, onClick }: {
  url: string; name: string; contentType: string | null; size: number | null; isMine?: boolean; onClick: () => void;
}) {
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const dlUrl = url + (url.includes('?') ? '&inline=false' : '?inline=false');
      const blob = await chatApi.fetchAttachmentBlob(dlUrl);
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u; a.download = name; a.click();
      URL.revokeObjectURL(u);
    } catch { alert('Tải về thất bại'); }
  };

  return (
    <button onClick={onClick}
            className="flex items-center gap-3 px-3 py-2 rounded-md min-w-[200px] text-left"
            style={{
              background: '#ffffff',
              color: 'var(--ink-1)',
              border: '1px solid var(--rule)',
            }}>
      <FileText size={20} className="shrink-0" style={{ color: 'var(--sidebar-accent)' }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{name}</p>
        <p className="text-[10px] text-ink-3">
          {contentType ?? 'tệp'}{size != null ? ` · ${formatSize(size)}` : ''}
        </p>
      </div>
      <span onClick={handleDownload as unknown as React.MouseEventHandler<HTMLSpanElement>}
            className="opacity-70 hover:opacity-100 cursor-pointer p-1">
        <Download size={14} />
      </span>
    </button>
  );
}

// ─── Plugin card (Poll/Event) — interactive inline ─────────────────────────────

function PluginCard({ classroomId, type, payloadJson }: {
  classroomId: string; type: 'POLL' | 'EVENT'; payloadJson: string; isMine?: boolean;
}) {
  const { user } = useAuth();
  const userId = user?.id;

  const [poll, setPoll] = useState<Poll | null>(null);
  const [rsvps, setRsvps] = useState<EventRsvp[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const payload = useMemo<PollPayload | EventPayload | null>(() => {
    try { return JSON.parse(payloadJson); } catch { return null; }
  }, [payloadJson]);

  useEffect(() => {
    if (!payload) return;
    if (type === 'POLL') {
      eventApi.getPoll(classroomId, (payload as PollPayload).pollId)
        .then(setPoll)
        .catch(() => setNotFound(true));
    } else {
      eventApi.listRsvps(classroomId, (payload as EventPayload).eventId)
        .then(setRsvps)
        .catch(() => setNotFound(true));
    }
  }, [classroomId, type, payload]);

  // Realtime sync — apply poll vote / RSVP updates broadcast from any
  // surface (Events page or another chat client) without re-fetching.
  useEffect(() => {
    if (!payload) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { event: string; payload: unknown };
      if (type === 'POLL' && detail.event === 'POLL_VOTE_UPDATED') {
        const updated = detail.payload as Poll;
        if (updated.id === (payload as PollPayload).pollId) {
          // Preserve the local viewer's myOptionIds — the broadcast carries
          // the voter's perspective, not each subscriber's.
          setPoll((prev) => ({ ...updated, myOptionIds: prev?.myOptionIds ?? updated.myOptionIds }));
        }
      } else if (type === 'EVENT' && detail.event === 'RSVP_UPDATED') {
        const { eventId, rsvp } = detail.payload as { eventId: string; rsvp: EventRsvp };
        if (eventId === (payload as EventPayload).eventId) {
          setRsvps((prev) => {
            const list = [...(prev ?? [])];
            const i = list.findIndex((r) => r.userId === rsvp.userId);
            if (i >= 0) list[i] = rsvp; else list.push(rsvp);
            return list;
          });
        }
      }
    };
    window.addEventListener('events-realtime', handler);
    return () => window.removeEventListener('events-realtime', handler);
  }, [type, payload]);

  const cardStyle: React.CSSProperties = {
    background: '#ffffff',
    color: 'var(--ink-1)',
    border: '1px solid var(--rule)',
  };

  if (!payload || notFound) {
    const isPoll = type === 'POLL';
    const Icon = isPoll ? BarChart3 : Calendar;
    const label = isPoll ? 'BÌNH CHỌN' : 'SỰ KIỆN';
    const title = payload
      ? (isPoll ? (payload as PollPayload).question : (payload as EventPayload).title)
      : '—';
    return (
      <Link to={`/classrooms/${classroomId}/events`}
            className="flex items-start gap-3 px-3 py-2.5 rounded-md min-w-[260px] hover:opacity-90 transition-opacity"
            style={cardStyle}>
        <Icon size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--sidebar-accent)' }} />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">{label}</p>
          <p className="text-sm font-medium text-ink-1 line-clamp-2">{title}</p>
          {notFound && <p className="text-[10px] text-ink-3 mt-0.5 italic">Không còn tồn tại</p>}
        </div>
      </Link>
    );
  }

  // ── POLL card ──────────────────────────────────────────────────────────────
  if (type === 'POLL') {
    const handleVote = async (optionId: string) => {
      if (!poll || !poll.isOpen || busy || !userId) return;
      const current = poll.myOptionIds ?? [];
      const next = poll.multiChoice
        ? (current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId])
        : (current[0] === optionId ? [] : [optionId]);
      const optimistic: Poll = {
        ...poll,
        myOptionIds: next,
        options: poll.options.map((o) => {
          const was = current.includes(o.id);
          const will = next.includes(o.id);
          if (was === will) return o;
          return { ...o, voteCount: Math.max(0, o.voteCount + (will ? 1 : -1)) };
        }),
      };
      setPoll(optimistic);
      setBusy(true);
      try {
        const updated = await eventApi.vote(classroomId, poll.id, next);
        setPoll({ ...updated, myOptionIds: updated.myOptionIds ?? next });
      } catch { setPoll(poll); }
      finally { setBusy(false); }
    };

    const totalVotes = poll ? poll.options.reduce((s, o) => s + o.voteCount, 0) : 0;
    const selected = poll?.myOptionIds ?? [];

    return (
      <div className="rounded-md min-w-[260px] max-w-[340px]" style={cardStyle}>
        <div className="px-3 pt-2.5 pb-1 flex items-center gap-2">
          <BarChart3 size={15} style={{ color: 'var(--sidebar-accent)' }} />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">Bình chọn</p>
        </div>
        <p className="px-3 text-sm font-medium text-ink-1 line-clamp-2 mb-2">{poll?.question}</p>
        {poll && (
          <div className="px-3 pb-1 space-y-2">
            {poll.options.map((opt) => {
              const pct = totalVotes > 0 ? (opt.voteCount / totalVotes) * 100 : 0;
              const checked = selected.includes(opt.id);
              return (
                <div key={opt.id}>
                  <button
                    disabled={!poll.isOpen || busy}
                    onClick={() => handleVote(opt.id)}
                    className="w-full text-left flex items-center gap-2 text-xs mb-0.5"
                    style={{ color: checked ? 'var(--sidebar-accent)' : 'var(--ink-2)' }}
                  >
                    {checked
                      ? <CheckCircle size={12} style={{ color: 'var(--sidebar-accent)', flexShrink: 0 }} />
                      : <span className="w-3 h-3 rounded-full border border-current shrink-0 inline-block" />}
                    <span className="truncate flex-1">{opt.text}</span>
                    <span className="shrink-0 text-ink-3">{opt.voteCount}</span>
                  </button>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface-2)' }}>
                    <div className="h-full rounded-full transition-all"
                         style={{ width: `${pct}%`, background: checked ? 'var(--sidebar-accent)' : 'var(--warm-400)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="px-3 py-2 flex items-center justify-between border-t border-rule mt-1">
          <p className="text-[10px] text-ink-3">{totalVotes} lượt · {poll?.isOpen ? 'Đang mở' : 'Đã đóng'}</p>
          <Link to={`/classrooms/${classroomId}/events`}
                className="text-[10px] hover:underline"
                style={{ color: 'var(--sidebar-accent)' }}>
            Xem chi tiết →
          </Link>
        </div>
      </div>
    );
  }

  // ── EVENT card ─────────────────────────────────────────────────────────────
  const evPayload = payload as EventPayload;
  const myRsvp = userId ? rsvps?.find((r) => r.userId === userId)?.response : undefined;

  const handleRsvp = async (response: RsvpResponse) => {
    if (busy || !userId) return;
    setBusy(true);
    const optimistic: EventRsvp = { id: 'pending', eventId: evPayload.eventId, userId, response, note: null };
    setRsvps((prev) => {
      const list = [...(prev ?? [])];
      const i = list.findIndex((r) => r.userId === userId);
      if (i >= 0) list[i] = optimistic; else list.push(optimistic);
      return list;
    });
    try {
      const updated = await eventApi.rsvp(classroomId, evPayload.eventId, response);
      setRsvps((prev) => (prev ?? []).map((r) => (r.userId === userId ? updated : r)));
    } catch {
      setRsvps((prev) => (prev ?? []).filter((r) => r.id !== 'pending'));
    } finally { setBusy(false); }
  };

  return (
    <div className="rounded-md min-w-[260px] max-w-[340px]" style={cardStyle}>
      <div className="px-3 pt-2.5 pb-1 flex items-center gap-2">
        <Calendar size={15} style={{ color: 'var(--sidebar-accent)' }} />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">Sự kiện</p>
      </div>
      <p className="px-3 text-sm font-medium text-ink-1 line-clamp-2">{evPayload.title}</p>
      <p className="px-3 text-[10px] text-ink-3 mt-0.5 mb-2">
        {new Date(evPayload.startTime).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}
      </p>
      <div className="px-3 pb-2 flex flex-wrap gap-1.5">
        {(['ATTENDING', 'MAYBE', 'NOT_ATTENDING'] as RsvpResponse[]).map((r) => {
          const active = myRsvp === r;
          return (
            <button
              key={r}
              disabled={busy}
              onClick={() => handleRsvp(r)}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all"
              style={{
                background: active ? RSVP_COLOR[r] : 'var(--bg-surface-2)',
                color: active ? '#fff' : RSVP_COLOR[r],
                border: `1px solid ${RSVP_COLOR[r]}`,
                opacity: busy ? 0.6 : 1,
              }}
            >
              {active && <CheckCircle size={10} />}
              {RSVP_LABELS[r]}
            </button>
          );
        })}
      </div>
      <div className="px-3 py-2 border-t border-rule flex justify-end">
        <Link to={`/classrooms/${classroomId}/events`}
              className="text-[10px] hover:underline"
              style={{ color: 'var(--sidebar-accent)' }}>
          Xem chi tiết →
        </Link>
      </div>
    </div>
  );
}

// ─── Plugin menu button ────────────────────────────────────────────────────────

function PluginButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-surface-2 text-left">
      <span style={{ color: 'var(--sidebar-accent)' }}>{icon}</span>
      <span className="text-ink-1">{label}</span>
    </button>
  );
}
