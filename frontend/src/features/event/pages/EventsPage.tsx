import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  BarChart2,
  ChevronDown,
  ChevronUp,
  EyeOff,
  Trash2,
  Pencil,
  Lock,
  MessageSquare,
} from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { eventApi } from '../api';
import { chatApi } from '@/features/chat/api';
import { memToken, refreshAccessToken } from '@/services/api-client';
import { WS_BASE } from '@/shared/constants';
import { Badge } from '@/shared/components/Badge';
import { classroomApi } from '@/features/classroom/api';
import type { ClassroomMember } from '@/features/classroom/types';
import { useAuthStore } from '@/app/store';
import {
  RSVP_LABELS,
  RSVP_COLOR,
  ABSENCE_STATUS_LABELS,
  ABSENCE_STATUS_VARIANT,
  type ClassEvent,
  type AbsenceRequest,
  type Poll,
  type EventRsvp,
  type RsvpResponse,
  type AbsenceStatus,
} from '../types';

type Tab = 'events' | 'absence' | 'polls';

const formatDT = (s: string) =>
  new Date(s).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

function showError(err: unknown) {
  alert(
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      'Có lỗi xảy ra',
  );
}

export function EventsPage() {
  const { classroomId } = useParams<{ classroomId: string }>();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [tab, setTab] = useState<Tab>('events');

  const [members, setMembers] = useState<ClassroomMember[]>([]);

  const [events, setEvents] = useState<ClassEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsLoadingMore, setEventsLoadingMore] = useState(false);
  const [eventsPage, setEventsPage] = useState(0);
  const [eventsTotalPages, setEventsTotalPages] = useState(0);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    mandatory: false,
  });
  const [eventSubmitting, setEventSubmitting] = useState(false);

  // Per-event RSVP state: full attendee list + which event has its panel expanded.
  const [rsvpsByEvent, setRsvpsByEvent] = useState<Record<string, EventRsvp[]>>({});
  const [expandedRsvpEvent, setExpandedRsvpEvent] = useState<string | null>(null);

  const [absenceRequests, setAbsenceRequests] = useState<AbsenceRequest[]>([]);
  const [absenceLoading, setAbsenceLoading] = useState(true);
  const [showCreateAbsence, setShowCreateAbsence] = useState(false);
  const [absenceForm, setAbsenceForm] = useState({ reason: '', eventId: '' });
  const [absenceSubmitting, setAbsenceSubmitting] = useState(false);

  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollsLoading, setPollsLoading] = useState(true);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [pollForm, setPollForm] = useState({
    question: '',
    multiChoice: false,
    anonymous: false,
    closesAt: '',
    options: ['', ''],
  });
  const [pollSubmitting, setPollSubmitting] = useState(false);
  const [expandedPollVoters, setExpandedPollVoters] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);

  const stompClientRef = useRef<Client | null>(null);

  // ─── WebSocket subscription for realtime event/poll updates ──────────────
  useEffect(() => {
    if (!classroomId) return;
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
        client.subscribe(`/topic/classrooms/${classroomId}/events`, (frame) => {
          const msg = JSON.parse(frame.body) as { event: string; payload: unknown };
          if (msg.event === 'RSVP_UPDATED') {
            const { eventId, rsvp } = msg.payload as { eventId: string; rsvp: EventRsvp };
            setRsvpsByEvent((prev) => {
              const list = [...(prev[eventId] ?? [])];
              const i = list.findIndex((r) => r.userId === rsvp.userId);
              if (i >= 0) list[i] = rsvp; else list.push(rsvp);
              return { ...prev, [eventId]: list };
            });
          } else if (msg.event === 'POLL_VOTE_UPDATED') {
            const updated = msg.payload as Poll;
            setPolls((prev) => prev.map((p) => {
              if (p.id !== updated.id) return p;
              // Preserve current user's myOptionIds — server broadcasts for the voter,
              // not for each subscriber individually.
              return { ...updated, myOptionIds: p.myOptionIds };
            }));
          }
        });
      },
      reconnectDelay: 5000,
    });
    client.activate();
    stompClientRef.current = client;
    return () => { client.deactivate(); };
  }, [classroomId]);

  // ─── Share to chat ────────────────────────────────────────────────────────
  const shareEventToChat = async (event: ClassEvent) => {
    if (!classroomId || sharingId) return;
    setSharingId(event.id);
    try {
      const conv = await chatApi.getClassConversation(classroomId);
      await chatApi.sendMessage(classroomId, conv.id, {
        messageType: 'EVENT',
        payload: { eventId: event.id, title: event.title, startTime: event.startTime },
      });
    } catch (err) { showError(err); }
    finally { setSharingId(null); }
  };

  const sharePollToChat = async (poll: Poll) => {
    if (!classroomId || sharingId) return;
    setSharingId(poll.id);
    try {
      const conv = await chatApi.getClassConversation(classroomId);
      await chatApi.sendMessage(classroomId, conv.id, {
        messageType: 'POLL',
        payload: { pollId: poll.id, question: poll.question },
      });
    } catch (err) { showError(err); }
    finally { setSharingId(null); }
  };

  useEffect(() => {
    if (!classroomId) return;
    eventApi.listEvents(classroomId, 0).then((res) => {
      setEvents(res.content ?? []);
      setEventsPage(res.number ?? 0);
      setEventsTotalPages(res.totalPages ?? 0);
    }).catch(showError).finally(() => setEventsLoading(false));
    classroomApi.listMembers(classroomId).then(setMembers).catch(() => undefined);
  }, [classroomId]);

  useEffect(() => {
    if (!classroomId) return;
    eventApi
      .listAbsenceRequests(classroomId)
      .then(setAbsenceRequests)
      .catch(showError)
      .finally(() => setAbsenceLoading(false));
  }, [classroomId]);

  useEffect(() => {
    if (!classroomId) return;
    eventApi.listPolls(classroomId).then(setPolls).catch(showError).finally(() => setPollsLoading(false));
  }, [classroomId]);

  const memberByUserId = useMemo(
    () => new Map(members.map((m) => [m.userId, m])),
    [members],
  );

  const userLabel = (uid: string) =>
    memberByUserId.get(uid)?.displayName ?? `${uid.slice(0, 8)}…`;

  const loadMoreEvents = async () => {
    if (!classroomId) return;
    setEventsLoadingMore(true);
    try {
      const res = await eventApi.listEvents(classroomId, eventsPage + 1);
      setEvents((prev) => [...prev, ...(res.content ?? [])]);
      setEventsPage(res.number ?? eventsPage + 1);
      setEventsTotalPages(res.totalPages ?? 0);
    } catch (err) {
      showError(err);
    } finally {
      setEventsLoadingMore(false);
    }
  };

  // ─── RSVP ────────────────────────────────────────────────────────────────

  const myRsvpFor = (eventId: string): RsvpResponse | undefined => {
    const list = rsvpsByEvent[eventId];
    if (!list || !currentUserId) return undefined;
    return list.find((r) => r.userId === currentUserId)?.response;
  };

  // Eagerly load every event's RSVPs once events are fetched so each card
  // can show "tôi đã phản hồi gì" + the live attendee count without an extra click.
  useEffect(() => {
    if (!classroomId || events.length === 0) return;
    const missing = events.filter((e) => !rsvpsByEvent[e.id]);
    if (missing.length === 0) return;
    Promise.all(
      missing.map((e) =>
        eventApi.listRsvps(classroomId, e.id).then((rs) => [e.id, rs] as const).catch(() => [e.id, [] as EventRsvp[]] as const),
      ),
    ).then((entries) => {
      setRsvpsByEvent((prev) => {
        const next = { ...prev };
        for (const [id, list] of entries) next[id] = list;
        return next;
      });
    });
  }, [classroomId, events, rsvpsByEvent]);

  const handleRsvp = async (eventId: string, response: RsvpResponse) => {
    if (!classroomId || !currentUserId) return;
    // Optimistic update so the button highlights instantly.
    setRsvpsByEvent((prev) => {
      const list = prev[eventId] ? [...prev[eventId]] : [];
      const i = list.findIndex((r) => r.userId === currentUserId);
      const optimistic: EventRsvp = {
        id: i >= 0 ? list[i].id : 'pending',
        eventId,
        userId: currentUserId,
        response,
        note: null,
      };
      if (i >= 0) list[i] = optimistic;
      else list.push(optimistic);
      return { ...prev, [eventId]: list };
    });
    try {
      const updated = await eventApi.rsvp(classroomId, eventId, response);
      setRsvpsByEvent((prev) => {
        const list = (prev[eventId] ?? []).map((r) =>
          r.userId === currentUserId ? updated : r,
        );
        return { ...prev, [eventId]: list };
      });
    } catch (err) {
      // On failure, refetch the truth.
      try {
        const fresh = await eventApi.listRsvps(classroomId, eventId);
        setRsvpsByEvent((prev) => ({ ...prev, [eventId]: fresh }));
      } catch {
        /* swallow */
      }
      showError(err);
    }
  };

  // ─── Polls ───────────────────────────────────────────────────────────────

  /**
   * Optimistically updates the poll directly so the checkbox state is read
   * from a single source of truth (poll.myOptionIds + per-option voteCount).
   * Sends the full desired set to the server; falls back to the optimistic
   * state if the server response omits myOptionIds (older backend build).
   */
  const handleVoteToggle = async (poll: Poll, optionId: string) => {
    if (!classroomId || !poll.isOpen || !currentUserId) return;
    const current = poll.myOptionIds ?? [];
    let next: string[];
    if (poll.multiChoice) {
      next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
    } else {
      next = current[0] === optionId ? [] : [optionId];
    }

    const optimistic = applyMyVote(poll, next, currentUserId);
    setPolls((prev) => prev.map((p) => (p.id === poll.id ? optimistic : p)));

    try {
      const updated = await eventApi.vote(classroomId, poll.id, next);
      setPolls((prev) =>
        prev.map((p) => {
          if (p.id !== poll.id) return p;
          // Preserve our optimistic selection if the backend response
          // doesn't include myOptionIds (stale build before this change).
          return {
            ...updated,
            myOptionIds: updated.myOptionIds ?? next,
          };
        }),
      );
    } catch (err) {
      // Rollback to the pre-click poll snapshot.
      setPolls((prev) => prev.map((p) => (p.id === poll.id ? poll : p)));
      showError(err);
    }
  };

  // ─── Mutations ───────────────────────────────────────────────────────────

  const handleCreateEvent = async () => {
    if (!classroomId || !eventForm.title.trim() || !eventForm.startTime) return;
    setEventSubmitting(true);
    try {
      const created = await eventApi.createEvent(classroomId, {
        title: eventForm.title,
        description: eventForm.description || undefined,
        startTime: new Date(eventForm.startTime).toISOString(),
        endTime: eventForm.endTime ? new Date(eventForm.endTime).toISOString() : undefined,
        location: eventForm.location || undefined,
        mandatory: eventForm.mandatory,
      });
      setEvents((prev) => [created, ...prev]);
      setShowCreateEvent(false);
      setEventForm({ title: '', description: '', startTime: '', endTime: '', location: '', mandatory: false });
    } catch (err) {
      showError(err);
    } finally {
      setEventSubmitting(false);
    }
  };

  const handleCreateAbsence = async () => {
    if (!classroomId || !absenceForm.reason.trim()) return;
    setAbsenceSubmitting(true);
    try {
      const created = await eventApi.createAbsenceRequest(classroomId, {
        reason: absenceForm.reason,
        eventId: absenceForm.eventId || undefined,
      });
      setAbsenceRequests((prev) => [created, ...prev]);
      setShowCreateAbsence(false);
      setAbsenceForm({ reason: '', eventId: '' });
    } catch (err) {
      showError(err);
    } finally {
      setAbsenceSubmitting(false);
    }
  };

  const handleReviewAbsence = async (requestId: string, status: AbsenceStatus) => {
    if (!classroomId) return;
    try {
      const updated = await eventApi.reviewAbsenceRequest(classroomId, requestId, status);
      setAbsenceRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
    } catch (err) {
      showError(err);
    }
  };

  const handleCreatePoll = async () => {
    if (!classroomId || !pollForm.question.trim()) return;
    const validOptions = pollForm.options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      alert('Cần ít nhất 2 lựa chọn');
      return;
    }
    setPollSubmitting(true);
    try {
      const created = await eventApi.createPoll(classroomId, {
        question: pollForm.question,
        multiChoice: pollForm.multiChoice,
        anonymous: pollForm.anonymous,
        closesAt: pollForm.closesAt ? new Date(pollForm.closesAt).toISOString() : undefined,
        options: validOptions,
      });
      setPolls((prev) => [created, ...prev]);
      setShowCreatePoll(false);
      setPollForm({ question: '', multiChoice: false, anonymous: false, closesAt: '', options: ['', ''] });
    } catch (err) {
      showError(err);
    } finally {
      setPollSubmitting(false);
    }
  };

  // ─── Event/Poll/Absence delete & edit ───────────────────────────────────

  const handleDeleteEvent = async (event: ClassEvent) => {
    if (!classroomId || !confirm(`Xoá sự kiện "${event.title}"? Toàn bộ phản hồi RSVP cũng sẽ bị xoá.`)) return;
    try {
      await eventApi.deleteEvent(classroomId, event.id);
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
      setRsvpsByEvent((prev) => {
        const { [event.id]: _, ...rest } = prev;
        return rest;
      });
    } catch (err) {
      showError(err);
    }
  };

  const handleEditEventTitle = async (event: ClassEvent) => {
    if (!classroomId) return;
    const next = prompt('Tiêu đề mới:', event.title);
    if (next == null || next.trim() === '' || next === event.title) return;
    try {
      const updated = await eventApi.updateEvent(classroomId, event.id, { title: next });
      setEvents((prev) => prev.map((e) => (e.id === event.id ? updated : e)));
    } catch (err) {
      showError(err);
    }
  };

  const handleDeletePoll = async (poll: Poll) => {
    if (!classroomId || !confirm(`Xoá bình chọn "${poll.question}"? Toàn bộ phiếu bầu cũng sẽ bị xoá.`)) return;
    try {
      await eventApi.deletePoll(classroomId, poll.id);
      setPolls((prev) => prev.filter((p) => p.id !== poll.id));
    } catch (err) {
      showError(err);
    }
  };

  const handleClosePoll = async (poll: Poll) => {
    if (!classroomId || !confirm(`Đóng bình chọn "${poll.question}" ngay bây giờ?`)) return;
    try {
      const updated = await eventApi.updatePoll(classroomId, poll.id, { closeNow: true });
      setPolls((prev) => prev.map((p) => (p.id === poll.id ? updated : p)));
    } catch (err) {
      showError(err);
    }
  };

  const handleEditPollQuestion = async (poll: Poll) => {
    if (!classroomId) return;
    const next = prompt('Sửa câu hỏi:', poll.question);
    if (next == null || next.trim() === '' || next === poll.question) return;
    try {
      const updated = await eventApi.updatePoll(classroomId, poll.id, { question: next });
      setPolls((prev) => prev.map((p) => (p.id === poll.id ? updated : p)));
    } catch (err) {
      showError(err);
    }
  };

  const handleCancelAbsence = async (req: AbsenceRequest) => {
    if (!classroomId || !confirm('Huỷ đơn xin vắng này?')) return;
    try {
      await eventApi.cancelAbsenceRequest(classroomId, req.id);
      setAbsenceRequests((prev) => prev.filter((r) => r.id !== req.id));
    } catch (err) {
      showError(err);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'events', label: 'Sự kiện' },
    { key: 'polls', label: 'Bình chọn' },
    { key: 'absence', label: 'Đơn xin vắng' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-serif font-semibold text-ink-1">Sự kiện & Bình chọn</h1>
      </div>

      <div className="flex gap-1 mb-6 border-b border-rule pb-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'border-warm-400 text-ink-1'
                : 'border-transparent text-ink-3 hover:text-ink-2'
            }`}
            style={tab === t.key ? { borderColor: 'var(--warm-400)' } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'events' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowCreateEvent((v) => !v)}
              className="btn btn-primary gap-2"
            >
              <Plus size={15} /> Tạo sự kiện
            </button>
          </div>

          {showCreateEvent && (
            <div className="card mb-6">
              <div className="card-body space-y-4">
                <p className="font-medium text-ink-1">Tạo sự kiện mới</p>
                <Field label="Tiêu đề *">
                  <input
                    type="text"
                    placeholder="Tên sự kiện"
                    value={eventForm.title}
                    onChange={(e) => setEventForm((p) => ({ ...p, title: e.target.value }))}
                  />
                </Field>
                <FieldMultiline label="Mô tả">
                  <textarea
                    rows={3}
                    placeholder="Mô tả sự kiện"
                    value={eventForm.description}
                    onChange={(e) => setEventForm((p) => ({ ...p, description: e.target.value }))}
                  />
                </FieldMultiline>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Thời gian bắt đầu *">
                    <input
                      type="datetime-local"
                      value={eventForm.startTime}
                      onChange={(e) => setEventForm((p) => ({ ...p, startTime: e.target.value }))}
                    />
                  </Field>
                  <Field label="Thời gian kết thúc">
                    <input
                      type="datetime-local"
                      value={eventForm.endTime}
                      onChange={(e) => setEventForm((p) => ({ ...p, endTime: e.target.value }))}
                    />
                  </Field>
                </div>
                <Field label="Địa điểm">
                  <input
                    type="text"
                    placeholder="Địa điểm tổ chức"
                    value={eventForm.location}
                    onChange={(e) => setEventForm((p) => ({ ...p, location: e.target.value }))}
                  />
                </Field>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eventForm.mandatory}
                    onChange={(e) => setEventForm((p) => ({ ...p, mandatory: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-ink-2">Bắt buộc tham dự</span>
                </label>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowCreateEvent(false)} className="btn btn-secondary btn-sm">
                    Hủy
                  </button>
                  <button
                    onClick={handleCreateEvent}
                    disabled={eventSubmitting || !eventForm.title.trim() || !eventForm.startTime}
                    className="btn btn-primary btn-sm"
                  >
                    {eventSubmitting ? 'Đang tạo...' : 'Tạo sự kiện'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {eventsLoading ? (
            <div className="animate-pulse text-center py-10 text-ink-3">Đang tải...</div>
          ) : events.length === 0 ? (
            <EmptyState icon={<Calendar size={28} />} title="Chưa có sự kiện" hint="Tạo sự kiện đầu tiên để bắt đầu phối hợp với cả lớp." />
          ) : (
            <div className="space-y-4">
              {events.map((event) => {
                const myResp = myRsvpFor(event.id);
                const list = rsvpsByEvent[event.id] ?? [];
                const counts: Record<RsvpResponse, number> = {
                  ATTENDING: 0,
                  MAYBE: 0,
                  NOT_ATTENDING: 0,
                };
                for (const r of list) counts[r.response]++;
                const expanded = expandedRsvpEvent === event.id;
                const creator = memberByUserId.get(event.createdById);

                return (
                  <div key={event.id} className="card">
                    <div className="card-body">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3">
                          <Calendar size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--ink-3)' }} />
                          <div>
                            <p className="font-semibold text-ink-1">{event.title}</p>
                            {event.description && (
                              <p className="text-sm text-ink-3 mt-0.5 whitespace-pre-line">{event.description}</p>
                            )}
                            {creator && (
                              <p className="text-[11px] text-ink-3 mt-1">
                                Tạo bởi <span className="text-ink-2 font-medium">{creator.displayName}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {event.mandatory && <Badge variant="red">Bắt buộc</Badge>}
                          <button
                            onClick={() => shareEventToChat(event)}
                            disabled={sharingId === event.id}
                            className="btn btn-ghost btn-sm"
                            title="Chia sẻ vào chat"
                          >
                            <MessageSquare size={13} style={{ color: 'var(--sidebar-accent)' }} />
                          </button>
                          {event.createdById === currentUserId && (
                            <>
                              <button
                                onClick={() => handleEditEventTitle(event)}
                                className="btn btn-ghost btn-sm"
                                title="Sửa tiêu đề"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event)}
                                className="btn btn-ghost btn-sm"
                                style={{ color: 'var(--red-text)' }}
                                title="Xoá sự kiện"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-ink-3 mb-4">
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} />
                          {formatDT(event.startTime)}
                          {event.endTime && ` – ${formatDT(event.endTime)}`}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={13} />
                            {event.location}
                          </span>
                        )}
                      </div>

                      {/* RSVP buttons — highlight current selection */}
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <span className="text-xs text-ink-3 mr-1 flex items-center gap-1">
                          <Users size={12} /> Phản hồi của bạn:
                        </span>
                        {(['ATTENDING', 'MAYBE', 'NOT_ATTENDING'] as RsvpResponse[]).map((r) => {
                          const active = myResp === r;
                          return (
                            <button
                              key={r}
                              onClick={() => handleRsvp(event.id, r)}
                              className={`btn btn-sm text-xs gap-1 transition-all ${
                                active ? 'btn-primary' : 'btn-secondary'
                              }`}
                              style={
                                active
                                  ? {
                                      background: RSVP_COLOR[r],
                                      borderColor: RSVP_COLOR[r],
                                      color: 'white',
                                    }
                                  : { color: RSVP_COLOR[r] }
                              }
                            >
                              {active && <CheckCircle size={12} />}
                              {RSVP_LABELS[r]}
                            </button>
                          );
                        })}
                      </div>

                      {/* Counts + expandable attendee list */}
                      <button
                        onClick={() => setExpandedRsvpEvent(expanded ? null : event.id)}
                        className="text-xs text-ink-3 flex items-center gap-2 hover:text-ink-2 transition-colors mt-2"
                      >
                        <span>
                          <span style={{ color: 'var(--green-text)' }}>✔ {counts.ATTENDING}</span>
                          {' · '}
                          <span style={{ color: 'var(--amber-text)' }}>? {counts.MAYBE}</span>
                          {' · '}
                          <span style={{ color: 'var(--red-text)' }}>✘ {counts.NOT_ATTENDING}</span>
                        </span>
                        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        <span>{expanded ? 'Ẩn danh sách' : 'Xem ai đã phản hồi'}</span>
                      </button>

                      {expanded && (
                        <div className="mt-3 pt-3 border-t border-rule grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {(['ATTENDING', 'MAYBE', 'NOT_ATTENDING'] as RsvpResponse[]).map((r) => {
                            const people = list.filter((x) => x.response === r);
                            return (
                              <div key={r}>
                                <p className="text-[11px] uppercase tracking-wide text-ink-3 mb-1.5"
                                   style={{ color: RSVP_COLOR[r] }}>
                                  {RSVP_LABELS[r]} · {people.length}
                                </p>
                                {people.length === 0 ? (
                                  <p className="text-xs text-ink-3 italic">—</p>
                                ) : (
                                  <ul className="space-y-1">
                                    {people.map((p) => (
                                      <li key={p.id} className="text-xs text-ink-1 flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold text-white shrink-0"
                                              style={{ background: 'var(--sidebar-accent)' }}>
                                          {userLabel(p.userId).charAt(0).toUpperCase()}
                                        </span>
                                        <span className="truncate">{userLabel(p.userId)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {eventsPage + 1 < eventsTotalPages && (
                <button
                  onClick={loadMoreEvents}
                  disabled={eventsLoadingMore}
                  className="w-full btn btn-ghost btn-sm"
                >
                  {eventsLoadingMore ? 'Đang tải...' : 'Tải thêm sự kiện'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'absence' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowCreateAbsence((v) => !v)} className="btn btn-primary gap-2">
              <Plus size={15} /> Gửi đơn
            </button>
          </div>

          {showCreateAbsence && (
            <div className="card mb-6">
              <div className="card-body space-y-4">
                <p className="font-medium text-ink-1">Gửi đơn xin vắng</p>
                <FieldMultiline label="Lý do *">
                  <textarea
                    rows={3}
                    placeholder="Lý do xin vắng"
                    value={absenceForm.reason}
                    onChange={(e) => setAbsenceForm((p) => ({ ...p, reason: e.target.value }))}
                  />
                </FieldMultiline>
                <Field label="Sự kiện liên quan (tùy chọn)">
                  <select
                    value={absenceForm.eventId}
                    onChange={(e) => setAbsenceForm((p) => ({ ...p, eventId: e.target.value }))}
                  >
                    <option value="">— Không liên quan sự kiện cụ thể —</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({formatDT(ev.startTime)})
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowCreateAbsence(false)} className="btn btn-secondary btn-sm">
                    Hủy
                  </button>
                  <button
                    onClick={handleCreateAbsence}
                    disabled={absenceSubmitting || !absenceForm.reason.trim()}
                    className="btn btn-primary btn-sm"
                  >
                    {absenceSubmitting ? 'Đang gửi...' : 'Gửi đơn'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {absenceLoading ? (
            <div className="animate-pulse text-center py-10 text-ink-3">Đang tải...</div>
          ) : absenceRequests.length === 0 ? (
            <EmptyState icon={<Calendar size={28} />} title="Chưa có đơn xin vắng" hint="Đơn xin vắng của lớp sẽ hiện ở đây." />
          ) : (
            <div className="space-y-4">
              {absenceRequests.map((req) => {
                const author = memberByUserId.get(req.userId);
                const relatedEvent = req.eventId ? events.find((e) => e.id === req.eventId) : null;
                return (
                  <div key={req.id} className="card">
                    <div className="card-body">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {author && (
                            <p className="text-xs text-ink-3 mb-1">
                              Người gửi: <span className="text-ink-2 font-medium">{author.displayName}</span>
                            </p>
                          )}
                          <p className="text-ink-1 text-sm font-medium whitespace-pre-line">{req.reason}</p>
                          {relatedEvent && (
                            <p className="text-xs text-ink-3 mt-1">
                              Sự kiện: <span className="text-ink-2">{relatedEvent.title}</span>
                            </p>
                          )}
                          {req.reviewNote && (
                            <p className="text-xs text-ink-3 mt-1 italic">
                              Ghi chú duyệt: {req.reviewNote}
                            </p>
                          )}
                          <p className="text-xs text-ink-3 mt-1">{formatDT(req.createdAt)}</p>
                        </div>
                        <Badge variant={ABSENCE_STATUS_VARIANT[req.status]}>
                          {ABSENCE_STATUS_LABELS[req.status]}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {req.status === 'PENDING' && req.userId !== currentUserId && (
                          <>
                            <button
                              onClick={() => handleReviewAbsence(req.id, 'APPROVED')}
                              className="btn btn-ghost btn-sm gap-1 text-xs"
                              style={{ color: 'var(--green-text)' }}
                            >
                              <CheckCircle size={13} /> Duyệt
                            </button>
                            <button
                              onClick={() => handleReviewAbsence(req.id, 'REJECTED')}
                              className="btn btn-ghost btn-sm gap-1 text-xs"
                              style={{ color: 'var(--red-text)' }}
                            >
                              <XCircle size={13} /> Từ chối
                            </button>
                          </>
                        )}
                        {req.userId === currentUserId && req.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelAbsence(req)}
                            className="btn btn-ghost btn-sm gap-1 text-xs"
                            style={{ color: 'var(--red-text)' }}
                          >
                            <Trash2 size={13} /> Huỷ đơn
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'polls' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowCreatePoll((v) => !v)} className="btn btn-primary gap-2">
              <Plus size={15} /> Tạo bình chọn
            </button>
          </div>

          {showCreatePoll && (
            <div className="card mb-6">
              <div className="card-body space-y-4">
                <p className="font-medium text-ink-1">Tạo bình chọn mới</p>
                <Field label="Câu hỏi *">
                  <input
                    type="text"
                    placeholder="Nội dung câu hỏi"
                    value={pollForm.question}
                    onChange={(e) => setPollForm((p) => ({ ...p, question: e.target.value }))}
                  />
                </Field>
                <div className="flex gap-6 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pollForm.multiChoice}
                      onChange={(e) => setPollForm((p) => ({ ...p, multiChoice: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-ink-2">Cho phép chọn nhiều</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pollForm.anonymous}
                      onChange={(e) => setPollForm((p) => ({ ...p, anonymous: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-ink-2">Bỏ phiếu ẩn danh</span>
                  </label>
                </div>
                <Field label="Thời gian đóng (tùy chọn)">
                  <input
                    type="datetime-local"
                    value={pollForm.closesAt}
                    onChange={(e) => setPollForm((p) => ({ ...p, closesAt: e.target.value }))}
                  />
                </Field>
                <div className="flex flex-col gap-2">
                  <label className="text-label">Các lựa chọn</label>
                  {pollForm.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="input-field flex-1">
                        <input
                          type="text"
                          placeholder={`Lựa chọn ${idx + 1}`}
                          value={opt}
                          onChange={(e) =>
                            setPollForm((p) => {
                              const options = [...p.options];
                              options[idx] = e.target.value;
                              return { ...p, options };
                            })
                          }
                        />
                      </div>
                      {pollForm.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() =>
                            setPollForm((p) => ({
                              ...p,
                              options: p.options.filter((_, i) => i !== idx),
                            }))
                          }
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--red-text)' }}
                          title="Xoá lựa chọn"
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setPollForm((p) => ({ ...p, options: [...p.options, ''] }))}
                    className="btn btn-ghost btn-sm self-start gap-1 text-xs"
                  >
                    <Plus size={12} /> Thêm lựa chọn
                  </button>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowCreatePoll(false)} className="btn btn-secondary btn-sm">
                    Hủy
                  </button>
                  <button
                    onClick={handleCreatePoll}
                    disabled={pollSubmitting || !pollForm.question.trim()}
                    className="btn btn-primary btn-sm"
                  >
                    {pollSubmitting ? 'Đang tạo...' : 'Tạo bình chọn'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {pollsLoading ? (
            <div className="animate-pulse text-center py-10 text-ink-3">Đang tải...</div>
          ) : polls.length === 0 ? (
            <EmptyState icon={<BarChart2 size={28} />} title="Chưa có bình chọn" hint="Tạo bình chọn đầu tiên để hỏi ý kiến cả lớp." />
          ) : (
            <div className="space-y-4">
              {polls.map((poll) => {
                const totalVotes = poll.options.reduce((sum, o) => sum + o.voteCount, 0);
                const selected = poll.myOptionIds ?? [];
                const expanded = expandedPollVoters === poll.id;
                const creator = memberByUserId.get(poll.createdById);
                return (
                  <div key={poll.id} className="card">
                    <div className="card-body">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <BarChart2 size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--ink-3)' }} />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-ink-1">{poll.question}</p>
                            <div className="flex items-center gap-2 flex-wrap mt-1">
                              {creator && (
                                <span className="text-[11px] text-ink-3">
                                  bởi <span className="text-ink-2 font-medium">{creator.displayName}</span>
                                </span>
                              )}
                              {poll.multiChoice && (
                                <Badge variant="blue">Nhiều lựa chọn</Badge>
                              )}
                              {poll.anonymous && (
                                <span className="text-[11px] text-ink-3 inline-flex items-center gap-1">
                                  <EyeOff size={11} /> Ẩn danh
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge variant={poll.isOpen ? 'green' : 'sage'}>
                            {poll.isOpen ? 'Đang mở' : 'Đã đóng'}
                          </Badge>
                          <button
                            onClick={() => sharePollToChat(poll)}
                            disabled={sharingId === poll.id}
                            className="btn btn-ghost btn-sm"
                            title="Chia sẻ vào chat"
                          >
                            <MessageSquare size={13} style={{ color: 'var(--sidebar-accent)' }} />
                          </button>
                          {poll.createdById === currentUserId && (
                            <>
                              <button
                                onClick={() => handleEditPollQuestion(poll)}
                                className="btn btn-ghost btn-sm"
                                title="Sửa câu hỏi"
                              >
                                <Pencil size={13} />
                              </button>
                              {poll.isOpen && (
                                <button
                                  onClick={() => handleClosePoll(poll)}
                                  className="btn btn-ghost btn-sm"
                                  title="Đóng bình chọn"
                                >
                                  <Lock size={13} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeletePoll(poll)}
                                className="btn btn-ghost btn-sm"
                                style={{ color: 'var(--red-text)' }}
                                title="Xoá"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 mt-3">
                        {poll.options.map((option) => {
                          const pct = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;
                          const checked = selected.includes(option.id);
                          return (
                            <div key={option.id}>
                              <div className="flex items-center justify-between mb-1 gap-3">
                                <label className={`flex items-center gap-2 text-sm flex-1 min-w-0 ${
                                  poll.isOpen ? 'cursor-pointer' : 'cursor-default'
                                } ${checked ? 'text-ink-1 font-medium' : 'text-ink-2'}`}>
                                  <input
                                    type={poll.multiChoice ? 'checkbox' : 'radio'}
                                    name={`poll-${poll.id}`}
                                    checked={checked}
                                    disabled={!poll.isOpen}
                                    onChange={() => handleVoteToggle(poll, option.id)}
                                    className="w-4 h-4 shrink-0"
                                  />
                                  <span className="truncate">{option.text}</span>
                                </label>
                                <span className="text-xs text-ink-3 shrink-0">
                                  {option.voteCount} ({Math.round(pct)}%)
                                </span>
                              </div>
                              <div
                                className="h-1.5 rounded-full overflow-hidden"
                                style={{ background: 'var(--bg-surface-2)' }}
                              >
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${pct}%`,
                                    background: checked ? 'var(--sidebar-accent)' : 'var(--warm-400)',
                                  }}
                                />
                              </div>
                              {expanded && !poll.anonymous && option.voterIds.length > 0 && (
                                <div className="mt-2 ml-6 flex flex-wrap gap-1.5">
                                  {option.voterIds.map((uid) => (
                                    <span
                                      key={uid}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]"
                                      style={{ background: 'var(--bg-surface-2)', color: 'var(--ink-2)' }}
                                    >
                                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-semibold text-white"
                                            style={{ background: 'var(--sidebar-accent)' }}>
                                        {userLabel(uid).charAt(0).toUpperCase()}
                                      </span>
                                      {userLabel(uid)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between mt-4 gap-2 flex-wrap">
                        <p className="text-xs text-ink-3">
                          Tổng {totalVotes} lượt
                          {poll.closesAt && ` · Đóng lúc ${formatDT(poll.closesAt)}`}
                        </p>
                        {!poll.anonymous ? (
                          <button
                            onClick={() => setExpandedPollVoters(expanded ? null : poll.id)}
                            className="text-xs text-ink-3 flex items-center gap-1 hover:text-ink-2 transition-colors"
                          >
                            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            {expanded ? 'Ẩn người bình chọn' : 'Xem ai đã chọn'}
                          </button>
                        ) : (
                          <span className="text-xs text-ink-3 italic flex items-center gap-1">
                            <EyeOff size={11} /> Bình chọn ẩn danh
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-label">{label}</label>
      <div className="input-field">{children}</div>
    </div>
  );
}

function FieldMultiline({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-label">{label}</label>
      <div className="input-field input-field-multiline">{children}</div>
    </div>
  );
}

/**
 * Build the post-click poll snapshot: update myOptionIds + per-option
 * voteCount and (if not anonymous) voterIds, so the UI reflects the change
 * before the server responds.
 */
function applyMyVote(poll: Poll, nextIds: string[], userId: string): Poll {
  const wasSelected = (id: string) => (poll.myOptionIds ?? []).includes(id);
  const isSelected = (id: string) => nextIds.includes(id);
  return {
    ...poll,
    myOptionIds: nextIds,
    options: poll.options.map((o) => {
      const before = wasSelected(o.id);
      const after = isSelected(o.id);
      if (before === after) return o;
      const delta = after ? 1 : -1;
      const voterIds = poll.anonymous
        ? o.voterIds
        : after
          ? [...o.voterIds, userId]
          : o.voterIds.filter((u) => u !== userId);
      return { ...o, voteCount: Math.max(0, o.voteCount + delta), voterIds };
    }),
  };
}

function EmptyState({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <div className="card card-body flex flex-col items-center text-center py-12 gap-2">
      <span className="text-ink-3">{icon}</span>
      <p className="text-sm font-medium text-ink-1">{title}</p>
      <p className="text-xs text-ink-3 max-w-xs">{hint}</p>
    </div>
  );
}
