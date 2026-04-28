import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Pencil, Save, X, Users, CircleCheck, CircleAlert, CircleX, CircleHelp, Plus, Minus, FlipVertical2 } from 'lucide-react';
import { seatingApi } from '../api';
import { classroomApi } from '@/features/classroom/api';
import { type SeatingResponse, type SeatAssignment, type SeatStatus, STATUS_LABEL, STATUS_COLOR } from '../types';
import type { ClassroomMember } from '@/features/classroom/types';
import { useAuthStore } from '@/app/store';
import { permissionsOf } from '@/features/classroom/permissions';

const COLS_PER_DAK = 4;
const DEFAULT_ROWS = 7;
const DEFAULT_DAKS = 2;
const MAX_DAKS = 6;
const MAX_ROWS = 15;

/** seatKey: `D{dak}R{row}C{col}` — dak/row/col are 1-based; col is 1..4. */
const seatKeyOf = (dak: number, row: number, col: number) => `D${dak}R${row}C${col}`;

/** Light tint for seat background based on attendance status. */
const STATUS_BG: Record<SeatStatus, string> = {
  PRESENT: '#e3f5ec',
  PENDING: '#fcefda',
  ABSENT: '#fbe0e0',
  UNMARKED: '#f1f2f4',
};

/** Reusable assignment helper: place `userId` at `seatKey`, clearing user's prior seat. */
function assignUserToSeat(
  prev: Record<string, string | null>,
  seatKey: string,
  userId: string | null,
): Record<string, string | null> {
  const next: Record<string, string | null> = {};
  for (const [k, v] of Object.entries(prev)) {
    if (userId && v === userId) continue;
    next[k] = v;
  }
  next[seatKey] = userId;
  return next;
}

export function SeatingChartPage() {
  const { classroomId } = useParams<{ classroomId: string }>();
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<SeatingResponse | null>(null);
  const [members, setMembers] = useState<ClassroomMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [draftAssignments, setDraftAssignments] = useState<Record<string, string | null>>({});
  const [draftRows, setDraftRows] = useState(DEFAULT_ROWS);
  const [draftDaks, setDraftDaks] = useState(DEFAULT_DAKS);

  const [teacherView, setTeacherView] = useState(false);
  const viewInitialized = useRef(false);

  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [popover, setPopover] = useState<{ seat: SeatAssignment; x: number; y: number } | null>(null);

  const reload = async () => {
    if (!classroomId) return;
    setLoading(true);
    try {
      const [s, m] = await Promise.all([
        seatingApi.get(classroomId),
        classroomApi.listMembers(classroomId),
      ]);
      setData(s);
      setMembers(m);
      setDraftRows(s.rowsCount > 0 ? s.rowsCount : DEFAULT_ROWS);
      setDraftDaks(s.seatsPerSide > 0 ? s.seatsPerSide : DEFAULT_DAKS);
      const map: Record<string, string | null> = {};
      s.seats.forEach((seat) => { map[seat.seatKey] = seat.userId; });
      setDraftAssignments(map);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [classroomId]);

  const myRole = useMemo(() => {
    if (!user) return undefined;
    const me = members.find((m) => m.userId === user.id);
    return me?.role;
  }, [members, user]);
  const canEdit = myRole ? permissionsOf(myRole).canEditClassroom : false;

  // Set default view based on role once, on first load
  useEffect(() => {
    if (!viewInitialized.current && myRole !== undefined) {
      viewInitialized.current = true;
      setTeacherView(canEdit);
    }
  }, [myRole, canEdit]);

  const seatByKey = useMemo(() => {
    const map = new Map<string, SeatAssignment>();
    data?.seats.forEach((s) => map.set(s.seatKey, s));
    return map;
  }, [data]);

  const rowsToRender = editMode ? draftRows : (data?.rowsCount ?? DEFAULT_ROWS);
  const daksToRender = editMode ? draftDaks : (data?.seatsPerSide ?? DEFAULT_DAKS);

  const handleSeatClick = (seatKey: string, e: React.MouseEvent) => {
    if (editMode) {
      setSelectedSeat(selectedSeat === seatKey ? null : seatKey);
      return;
    }
    const seat = seatByKey.get(seatKey);
    if (!seat) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopover({ seat, x: rect.left + rect.width / 2, y: rect.top });
  };

  const handleAssign = (userId: string | null) => {
    if (!selectedSeat) return;
    setDraftAssignments((prev) => assignUserToSeat(prev, selectedSeat, userId));
    setSelectedSeat(null);
  };

  const handleSeatDrop = (targetSeat: string, payload: { fromSeat?: string; userId?: string }) => {
    setDraftAssignments((prev) => {
      if (payload.userId && !payload.fromSeat) {
        return assignUserToSeat(prev, targetSeat, payload.userId);
      }
      if (payload.fromSeat) {
        if (payload.fromSeat === targetSeat) return prev;
        const movingUser = prev[payload.fromSeat];
        if (!movingUser) return prev;
        const occupant = prev[targetSeat] ?? null;
        const next = { ...prev };
        next[targetSeat] = movingUser;
        if (occupant) next[payload.fromSeat] = occupant;
        else delete next[payload.fromSeat];
        return next;
      }
      return prev;
    });
  };

  const handleSave = async () => {
    if (!classroomId) return;
    setLoading(true);
    try {
      const result = await seatingApi.update(classroomId, {
        rowsCount: draftRows,
        seatsPerSide: draftDaks,
        assignments: draftAssignments,
      });
      setData(result);
      setEditMode(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setSelectedSeat(null);
    if (data) {
      const map: Record<string, string | null> = {};
      data.seats.forEach((s) => { map[s.seatKey] = s.userId; });
      setDraftAssignments(map);
      setDraftRows(data.rowsCount > 0 ? data.rowsCount : DEFAULT_ROWS);
      setDraftDaks(data.seatsPerSide > 0 ? data.seatsPerSide : DEFAULT_DAKS);
    }
  };

  const unassignedMembers = useMemo(() => {
    const taken = new Set(Object.values(draftAssignments).filter(Boolean) as string[]);
    return members.filter((m) => !taken.has(m.userId));
  }, [members, draftAssignments]);

  if (loading && !data) return <div className="text-center py-20 text-ink-3">Đang tải...</div>;
  if (!data) return null;

  const stats = data.stats;

  return (
    <div className="w-full px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-end gap-2">
        {canEdit && !editMode && (
          <>
            <button
              onClick={() => setTeacherView((v) => !v)}
              className={`btn btn-sm gap-1.5 ${teacherView ? 'btn-secondary' : 'btn-ghost'}`}
              title={teacherView ? 'Đang xem góc giáo viên' : 'Chuyển sang góc giáo viên'}
            >
              <FlipVertical2 size={13} />
              {teacherView ? 'Góc giáo viên' : 'Góc sinh viên'}
            </button>
            <button onClick={() => setEditMode(true)} className="btn btn-secondary btn-sm gap-1.5">
              <Pencil size={13} /> Sửa sơ đồ
            </button>
          </>
        )}
        {editMode && (
          <div className="flex gap-2">
            <button onClick={handleCancel} className="btn btn-ghost btn-sm gap-1.5">
              <X size={13} /> Hủy
            </button>
            <button onClick={handleSave} disabled={loading} className="btn btn-primary btn-sm gap-1.5">
              <Save size={13} /> Lưu
            </button>
          </div>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-serif font-semibold text-ink-1 mb-1">Sơ đồ lớp</h1>
        <p className="text-sm text-ink-3">
          {editMode
            ? 'Bấm vào ghế trống để chọn học sinh, hoặc bấm vào ghế đã có để bỏ gán.'
            : 'Bấm vào học sinh để xem nhanh thông tin và trạng thái điểm danh hôm nay.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard icon={<Users size={14} />} label="Tổng ghế đã gán" value={stats.total} color="#5b6470" />
        <StatCard icon={<CircleCheck size={14} />} label="Có mặt" value={stats.present} color={STATUS_COLOR.PRESENT} />
        <StatCard icon={<CircleAlert size={14} />} label="Nghỉ phép" value={stats.excused} color={STATUS_COLOR.PENDING} />
        <StatCard icon={<CircleX size={14} />} label="Vắng" value={stats.absent} color={STATUS_COLOR.ABSENT} />
        <StatCard icon={<CircleHelp size={14} />} label="Chưa điểm danh" value={stats.unmarked} color={STATUS_COLOR.UNMARKED} />
      </div>

      {/* Edit-mode size controls */}
      {editMode && (
        <div className="card card-body flex flex-wrap items-center gap-3">
          <Stepper
            label="Số dãy"
            value={draftDaks}
            min={1}
            max={MAX_DAKS}
            onChange={setDraftDaks}
          />
          <Stepper
            label="Số hàng / dãy"
            value={draftRows}
            min={1}
            max={MAX_ROWS}
            onChange={setDraftRows}
          />
          <span className="text-xs text-ink-3 ml-auto">
            Mỗi dãy cố định {COLS_PER_DAK} cột · Tổng: {draftDaks * draftRows * COLS_PER_DAK} ghế
          </span>
        </div>
      )}

      {/* Classroom layout */}
      <div className="card card-body">
        <ClassroomLayout
          rows={rowsToRender}
          daks={daksToRender}
          seatByKey={seatByKey}
          assignments={draftAssignments}
          membersById={new Map(members.map((m) => [m.userId, m]))}
          editMode={editMode}
          selectedSeat={selectedSeat}
          teacherView={teacherView}
          onSeatClick={handleSeatClick}
          onSeatDrop={handleSeatDrop}
        />
      </div>

      {/* Edit picker */}
      {editMode && (
        <div className="card card-body">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-ink-1">
              {selectedSeat
                ? <>Gán ghế <span className="font-mono">{selectedSeat}</span></>
                : 'Thành viên chưa có ghế'}
            </p>
            {selectedSeat && (
              <button onClick={() => handleAssign(null)} className="btn btn-ghost btn-sm text-xs"
                      style={{ color: 'var(--red-text)' }}>
                Bỏ trống ghế đang chọn
              </button>
            )}
          </div>
          {unassignedMembers.length === 0 ? (
            <p className="text-sm text-ink-3">Tất cả thành viên đã có ghế.</p>
          ) : (
            <>
              <p className="text-xs text-ink-3 mb-2">
                Bấm để gán vào ghế đang chọn, hoặc kéo-thả trực tiếp vào ghế bất kỳ.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {unassignedMembers.map((m) => (
                  <button
                    key={m.memberId}
                    onClick={() => handleAssign(m.userId)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/x-user-id', m.userId);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    className="card card-body py-2 px-3 hover:shadow-md transition-shadow text-left flex items-center gap-2"
                    style={{ cursor: 'grab' }}
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                         style={{ background: 'var(--sidebar-accent)' }}>
                      {m.displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-ink-1 truncate">{m.displayName}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {popover && !editMode && (
        <SeatPopover seat={popover.seat} x={popover.x} y={popover.y} onClose={() => setPopover(null)} />
      )}
    </div>
  );
}

// ─── Layout ────────────────────────────────────────────────────────────────────

interface LayoutProps {
  rows: number;
  daks: number;
  seatByKey: Map<string, SeatAssignment>;
  assignments: Record<string, string | null>;
  membersById: Map<string, ClassroomMember>;
  editMode: boolean;
  selectedSeat: string | null;
  teacherView?: boolean;
  onSeatClick: (seatKey: string, e: React.MouseEvent) => void;
  onSeatDrop: (targetSeat: string, payload: { fromSeat?: string; userId?: string }) => void;
}

function ClassroomLayout({
  rows, daks, seatByKey, assignments, membersById, editMode, selectedSeat, teacherView = false, onSeatClick, onSeatDrop,
}: LayoutProps) {
  const dakIndices = Array.from({ length: daks }, (_, i) => i + 1);
  const rowIndices = Array.from({ length: rows }, (_, i) => i + 1);
  const colIndices = Array.from({ length: COLS_PER_DAK }, (_, i) => i + 1);

  // Teacher view: flip rows (farthest row at top), daks left-right mirror, columns left-right mirror
  const orderedDaks = teacherView ? [...dakIndices].reverse() : dakIndices;
  const orderedRows = teacherView ? [...rowIndices].reverse() : rowIndices;
  const orderedCols = teacherView ? [...colIndices].reverse() : colIndices;

  const board = (
    <div className="w-full max-w-md text-center px-6 py-3 rounded-md font-serif tracking-wider text-sm shadow-md"
         style={{ background: '#1f3b2c', color: '#e8f2eb', border: '4px solid #6b4f3c' }}>
      BẢNG ĐEN
    </div>
  );
  const teacherDesk = (
    <div className="px-5 py-2 rounded text-xs text-ink-2 font-medium border"
         style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--rule)' }}>
      Bàn giáo viên
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* In student view: board + desk at top; in teacher view: moved to bottom */}
      {!teacherView && <>{board}{teacherDesk}</>}

      {/* Dãy bàn — overflow-x scroll without losing left side (justify-center breaks left-scroll) */}
      <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-start gap-6 sm:gap-10 mt-2 mx-auto w-max">
        {orderedDaks.map((d) => (
          <div
            key={d}
            className="rounded-lg p-3 sm:p-4 shadow-sm shrink-0"
            style={{ background: '#ffffff', border: '1px solid var(--rule)' }}
          >
            <div className="text-[11px] font-semibold text-ink-3 mb-2 text-center tracking-wider">
              DÃY {d}
            </div>
            <div className="flex flex-col gap-2">
              {orderedRows.map((r) => (
                <div key={r} className="flex items-center gap-1.5">
                  <span className="text-[10px] text-ink-3 w-5 text-right shrink-0">{r}.</span>
                  <div className="flex gap-1.5">
                    {orderedCols.map((c) => {
                      const key = seatKeyOf(d, r, c);
                      return (
                        <Seat
                          key={key}
                          seatKey={key}
                          seat={seatByKey.get(key)}
                          draftUserId={assignments[key] ?? null}
                          member={assignments[key] ? membersById.get(assignments[key]!) : undefined}
                          editMode={editMode}
                          selected={selectedSeat === key}
                          onClick={onSeatClick}
                          onDrop={onSeatDrop}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      </div>

      {/* In teacher view: board + desk at bottom (teacher's standing position) */}
      {teacherView && <>{teacherDesk}{board}</>}

      {/* Legend */}
      {!editMode && (
        <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs">
          {(['PRESENT', 'PENDING', 'ABSENT', 'UNMARKED'] as SeatStatus[]).map((s) => (
            <div key={s} className="flex items-center gap-1.5 text-ink-3">
              <span
                className="w-4 h-4 rounded-sm inline-block border"
                style={{ background: STATUS_BG[s], borderColor: STATUS_COLOR[s] }}
              />
              {STATUS_LABEL[s]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Seat ──────────────────────────────────────────────────────────────────────

interface SeatProps {
  seatKey: string;
  seat: SeatAssignment | undefined;
  draftUserId: string | null;
  member?: ClassroomMember;
  editMode: boolean;
  selected: boolean;
  onClick: (seatKey: string, e: React.MouseEvent) => void;
  onDrop: (targetSeat: string, payload: { fromSeat?: string; userId?: string }) => void;
}

function Seat({ seatKey, seat, draftUserId, member, editMode, selected, onClick, onDrop }: SeatProps) {
  const [dragOver, setDragOver] = useState(false);
  const occupied = editMode ? !!draftUserId : !!seat;
  const displayName = editMode
    ? (member?.displayName ?? '')
    : (seat?.displayName ?? '');
  const status: SeatStatus = seat?.attendanceStatus ?? 'UNMARKED';

  const draggable = editMode && occupied;
  const droppable = editMode;

  // In edit mode, occupied seats show a neutral surface (status colors are for the live view).
  const seatBg = !occupied
    ? 'var(--bg-surface-2)'
    : editMode
      ? 'var(--card)'
      : STATUS_BG[status];
  const accentColor = occupied && !editMode ? STATUS_COLOR[status] : 'transparent';

  return (
    <button
      type="button"
      onClick={(e) => onClick(seatKey, e)}
      title={editMode ? `Ghế ${seatKey} (kéo để di chuyển)` : (displayName || `Ghế ${seatKey} (trống)`)}
      draggable={draggable}
      onDragStart={draggable ? (e) => {
        e.dataTransfer.setData('application/x-seat-from', seatKey);
        e.dataTransfer.effectAllowed = 'move';
      } : undefined}
      onDragOver={droppable ? (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!dragOver) setDragOver(true);
      } : undefined}
      onDragLeave={droppable ? () => setDragOver(false) : undefined}
      onDrop={droppable ? (e) => {
        e.preventDefault();
        setDragOver(false);
        const fromSeat = e.dataTransfer.getData('application/x-seat-from') || undefined;
        const userId = e.dataTransfer.getData('application/x-user-id') || undefined;
        if (fromSeat || userId) onDrop(seatKey, { fromSeat, userId });
      } : undefined}
      className="relative w-[72px] sm:w-[84px] h-[52px] sm:h-[56px] rounded-md flex items-center justify-center px-1.5 text-[11px] font-medium transition-all overflow-hidden"
      style={{
        background: dragOver ? 'var(--warm-100, #f5e9d4)' : seatBg,
        border: selected
          ? '2px solid var(--warm-400)'
          : (dragOver ? '2px dashed var(--warm-400)' : '1px solid var(--rule)'),
        color: occupied ? 'var(--ink-1)' : 'var(--ink-3)',
        cursor: draggable ? 'grab' : 'pointer',
      }}
    >
      {occupied ? (
        <>
          {!editMode && (
            <span
              aria-hidden
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ background: accentColor }}
            />
          )}
          <span
            className="block w-full text-center leading-tight whitespace-normal break-words"
            style={{ fontSize: displayName.length > 14 ? '10px' : '11px' }}
          >
            {displayName}
          </span>
        </>
      ) : (
        <span className="text-[10px] opacity-60">{seatKey}</span>
      )}
    </button>
  );
}

// ─── Stepper ───────────────────────────────────────────────────────────────────

function Stepper({
  label, value, min, max, onChange,
}: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div className="flex items-center gap-2 text-sm text-ink-2">
      <span>{label}:</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={dec}
          disabled={value <= min}
          className="w-7 h-7 rounded border border-rule flex items-center justify-center hover:bg-bg-surface-2 disabled:opacity-40"
        >
          <Minus size={12} />
        </button>
        <span className="min-w-[28px] text-center font-semibold text-ink-1">{value}</span>
        <button
          type="button"
          onClick={inc}
          disabled={value >= max}
          className="w-7 h-7 rounded border border-rule flex items-center justify-center hover:bg-bg-surface-2 disabled:opacity-40"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Popover ───────────────────────────────────────────────────────────────────

function SeatPopover({ seat, x, y, onClose }: { seat: SeatAssignment; x: number; y: number; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 card shadow-lg p-4 min-w-[220px] animate-scale-in"
        style={{ top: Math.max(80, y - 100), left: Math.max(8, Math.min(window.innerWidth - 240, x - 110)) }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
               style={{ background: 'var(--sidebar-accent)' }}>
            {seat.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ink-1 truncate">{seat.displayName}</p>
            <p className="text-[10px] text-ink-3 font-mono">Ghế {seat.seatKey}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded"
             style={{ background: STATUS_BG[seat.attendanceStatus], border: `1px solid ${STATUS_COLOR[seat.attendanceStatus]}` }}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLOR[seat.attendanceStatus] }} />
          <span className="text-sm text-ink-1 font-medium">{STATUS_LABEL[seat.attendanceStatus]}</span>
        </div>
      </div>
    </>
  );
}

// ─── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="card card-body py-3">
      <div className="flex items-center gap-1.5 mb-1" style={{ color }}>
        {icon}
        <p className="text-[11px] text-ink-3">{label}</p>
      </div>
      <p className="text-2xl font-semibold text-ink-1">{value}</p>
    </div>
  );
}
