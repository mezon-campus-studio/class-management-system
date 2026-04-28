import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2, Pencil, Star, Trophy, ListChecks, Award } from 'lucide-react';
import { emulationApi } from '../api';
import { Badge } from '@/shared/components/Badge';
import { classroomApi } from '@/features/classroom/api';
import { permissionsOf } from '@/features/classroom/permissions';
import { RoleBadges } from '@/features/classroom/components/RoleBadges';
import type { ClassroomMember } from '@/features/classroom/types';
import { useAuthStore } from '@/app/store';
import type {
  EmulationCategory,
  EmulationEntry,
  MemberScoreSummary,
} from '../types';

type Tab = 'leaderboard' | 'entries' | 'categories';

function showError(err: unknown) {
  alert(
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      'Có lỗi xảy ra',
  );
}

export function EmulationPage() {
  const { classroomId } = useParams<{ classroomId: string }>();
  const userId = useAuthStore((s) => s.user?.id);
  const [activeTab, setActiveTab] = useState<Tab>('leaderboard');

  const [entries, setEntries] = useState<EmulationEntry[]>([]);
  const [categories, setCategories] = useState<EmulationCategory[]>([]);
  const [members, setMembers] = useState<ClassroomMember[]>([]);
  const [summary, setSummary] = useState<MemberScoreSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [showEntryForm, setShowEntryForm] = useState(false);
  const [entryForm, setEntryForm] = useState({
    categoryId: '',
    memberId: '',
    score: 0,
    note: '',
    occurredAt: '',
  });
  const [entrySubmitting, setEntrySubmitting] = useState(false);

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', defaultScore: 0 });
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  useEffect(() => {
    if (!classroomId) return;
    setLoading(true);
    Promise.all([
      emulationApi.listEntries(classroomId),
      emulationApi.listCategories(classroomId),
      emulationApi.getScoreSummary(classroomId),
      classroomApi.listMembers(classroomId),
    ])
      .then(([e, c, s, m]) => {
        setEntries(e);
        setCategories(c);
        setSummary(s);
        setMembers(m);
      })
      .catch(showError)
      .finally(() => setLoading(false));
  }, [classroomId]);

  // The emulation entry's `memberId` stores user_id (FK → users), so the
  // lookup map and leaderboard summary are keyed by userId, not memberId.
  const memberMap = useMemo(
    () => new Map(members.map((m) => [m.userId, m])),
    [members],
  );

  const me = useMemo(
    () => members.find((m) => m.userId === userId),
    [members, userId],
  );

  const perms = useMemo(
    () =>
      me
        ? permissionsOf(me.role, { extraRoles: me.extraRoles, delegatedPermissions: me.delegatedPermissions })
        : null,
    [me],
  );

  const canManageCategories = perms?.canManageEmulation ?? false;
  const canRecord = perms?.canRecordEmulation ?? false;

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classroomId) return;
    setEntrySubmitting(true);
    try {
      const created = await emulationApi.addEntry(classroomId, {
        categoryId: entryForm.categoryId,
        memberId: entryForm.memberId,
        score: entryForm.score,
        note: entryForm.note || undefined,
        occurredAt: entryForm.occurredAt || undefined,
      });
      setEntries((prev) => [created, ...prev]);
      // Optimistic update of leaderboard
      setSummary((prev) => {
        const next = [...prev];
        const idx = next.findIndex((s) => s.memberId === created.memberId);
        if (idx >= 0) next[idx] = { ...next[idx], totalScore: next[idx].totalScore + created.score };
        else next.push({ memberId: created.memberId, totalScore: created.score });
        return next;
      });
      setShowEntryForm(false);
      setEntryForm({ categoryId: '', memberId: '', score: 0, note: '', occurredAt: '' });
    } catch (err) {
      showError(err);
    } finally {
      setEntrySubmitting(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classroomId) return;
    setCategorySubmitting(true);
    try {
      const created = await emulationApi.createCategory(classroomId, {
        name: categoryForm.name,
        description: categoryForm.description || undefined,
        defaultScore: categoryForm.defaultScore,
      });
      setCategories((prev) => [...prev, created]);
      setShowCategoryForm(false);
      setCategoryForm({ name: '', description: '', defaultScore: 0 });
    } catch (err) {
      showError(err);
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!classroomId || !confirm('Xoá hạng mục này? Toàn bộ các bản ghi điểm thuộc hạng mục cũng có thể bị ảnh hưởng.')) return;
    try {
      await emulationApi.deleteCategory(classroomId, id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteEntry = async (entry: EmulationEntry) => {
    if (!classroomId || !confirm(`Xoá bản ghi điểm "${entry.categoryName}"?`)) return;
    try {
      await emulationApi.deleteEntry(classroomId, entry.id);
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
      // Decrement summary so leaderboard stays consistent
      setSummary((prev) => {
        const idx = prev.findIndex((s) => s.memberId === entry.memberId);
        if (idx < 0) return prev;
        const copy = [...prev];
        copy[idx] = { ...copy[idx], totalScore: copy[idx].totalScore - entry.score };
        return copy;
      });
    } catch (err) {
      showError(err);
    }
  };

  const handleEditEntryPrompt = async (entry: EmulationEntry) => {
    if (!classroomId) return;
    const raw = prompt(`Sửa điểm cho "${entry.categoryName}" (giá trị hiện tại: ${entry.score}). Nhập số điểm mới:`, String(entry.score));
    if (raw == null) return;
    const next = Number(raw);
    if (!Number.isFinite(next)) {
      alert('Số điểm không hợp lệ');
      return;
    }
    if (next === entry.score) return;
    try {
      const updated = await emulationApi.updateEntry(classroomId, entry.id, { score: next });
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, ...updated } : e)));
      const delta = next - entry.score;
      setSummary((prev) => {
        const idx = prev.findIndex((s) => s.memberId === entry.memberId);
        if (idx < 0) return prev;
        const copy = [...prev];
        copy[idx] = { ...copy[idx], totalScore: copy[idx].totalScore + delta };
        return copy;
      });
    } catch (err) {
      showError(err);
    }
  };

  const ranked = useMemo(() => {
    return [...summary]
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((s, i) => ({ ...s, rank: i + 1, member: memberMap.get(s.memberId) }));
  }, [summary, memberMap]);

  const renderMember = (memberId: string) => {
    const m = memberMap.get(memberId);
    if (!m) return <span className="font-mono text-xs text-ink-3">{memberId.slice(0, 8)}…</span>;
    return (
      <span className="inline-flex items-center gap-2">
        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
              style={{ background: 'var(--sidebar-accent)' }}>
          {m.displayName.charAt(0).toUpperCase()}
        </span>
        <span className="font-medium text-ink-1">{m.displayName}</span>
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-2 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Star size={22} className="text-ink-2" />
          <div>
            <h1 className="text-3xl font-serif font-semibold text-ink-1">Thi đua</h1>
            <p className="text-sm text-ink-3 mt-0.5">
              Theo dõi điểm thi đua và xếp hạng cá nhân trong lớp.
            </p>
          </div>
        </div>
        {me && (
          <div className="text-xs text-ink-3 flex items-center gap-2">
            <span>Quyền của bạn:</span>
            <RoleBadges primary={me.role} extras={me.extraRoles ?? []} short max={2} />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-rule mt-4">
        {([
          { key: 'leaderboard', label: 'Xếp hạng', icon: Trophy },
          { key: 'entries', label: 'Lịch sử ghi điểm', icon: ListChecks },
          { key: 'categories', label: 'Hạng mục', icon: Award },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === t.key
                ? 'text-ink-1 border-b-2 border-ink-1 -mb-px'
                : 'text-ink-3 hover:text-ink-2'
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse text-center py-10 text-ink-3">Đang tải...</div>
      ) : (
        <>
          {activeTab === 'leaderboard' && (
            <LeaderboardTab ranked={ranked} />
          )}

          {activeTab === 'entries' && (
            <div>
              <div className="flex justify-end mb-4">
                {canRecord ? (
                  <button
                    onClick={() => setShowEntryForm((v) => !v)}
                    className="btn btn-primary gap-2"
                    disabled={categories.length === 0 || members.length === 0}
                    title={categories.length === 0 ? 'Chưa có hạng mục' : ''}
                  >
                    <Plus size={15} /> Ghi điểm
                  </button>
                ) : (
                  <p className="text-xs text-ink-3">
                    Bạn chưa được uỷ quyền ghi điểm thi đua.
                  </p>
                )}
              </div>

              {showEntryForm && canRecord && (
                <div className="card mb-6">
                  <div className="card-body">
                    <h3 className="text-sm font-semibold text-ink-1 mb-4">Ghi điểm mới</h3>
                    <form onSubmit={handleAddEntry} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Hạng mục *">
                          <select
                            value={entryForm.categoryId}
                            onChange={(e) => {
                              const cat = categories.find((c) => c.id === e.target.value);
                              setEntryForm((p) => ({
                                ...p,
                                categoryId: e.target.value,
                                score: p.score === 0 && cat ? cat.defaultScore : p.score,
                              }));
                            }}
                            required
                          >
                            <option value="">Chọn hạng mục</option>
                            {categories
                              .filter((c) => c.active)
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name} ({c.defaultScore > 0 ? `+${c.defaultScore}` : c.defaultScore})
                                </option>
                              ))}
                          </select>
                        </Field>
                        <Field label="Thành viên *">
                          <select
                            value={entryForm.memberId}
                            onChange={(e) => setEntryForm((p) => ({ ...p, memberId: e.target.value }))}
                            required
                          >
                            <option value="">Chọn thành viên</option>
                            {members
                              .filter((m) => m.role !== 'OWNER' && m.role !== 'TEACHER')
                              .map((m) => (
                                <option key={m.memberId} value={m.userId}>
                                  {m.displayName}
                                </option>
                              ))}
                          </select>
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Điểm *">
                          <input
                            type="number"
                            value={entryForm.score}
                            onChange={(e) => setEntryForm((p) => ({ ...p, score: Number(e.target.value) }))}
                            required
                          />
                        </Field>
                        <Field label="Ngày xảy ra">
                          <input
                            type="date"
                            value={entryForm.occurredAt}
                            onChange={(e) => setEntryForm((p) => ({ ...p, occurredAt: e.target.value }))}
                          />
                        </Field>
                      </div>
                      <Field label="Ghi chú">
                        <input
                          type="text"
                          placeholder="Ghi chú (tùy chọn)"
                          value={entryForm.note}
                          onChange={(e) => setEntryForm((p) => ({ ...p, note: e.target.value }))}
                        />
                      </Field>
                      <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setShowEntryForm(false)} className="btn btn-secondary btn-sm">
                          Hủy
                        </button>
                        <button type="submit" disabled={entrySubmitting} className="btn btn-primary btn-sm">
                          {entrySubmitting ? 'Đang lưu...' : 'Lưu'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {entries.length === 0 ? (
                <EmptyState
                  icon={<ListChecks size={28} />}
                  title="Chưa ghi điểm nào"
                  hint={canRecord ? 'Nhấn "Ghi điểm" để bắt đầu.' : 'Người được uỷ quyền sẽ bắt đầu ghi điểm trong lớp.'}
                />
              ) : (
                <div className="card">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Hạng mục</th>
                        <th>Thành viên</th>
                        <th>Điểm</th>
                        <th>Ghi chú</th>
                        <th>Ngày</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => {
                        const canEdit =
                          canRecord || (me ? entry.recordedById === me.userId : false);
                        return (
                          <tr key={entry.id}>
                            <td>{entry.categoryName}</td>
                            <td>{renderMember(entry.memberId)}</td>
                            <td>
                              <ScoreCell value={entry.score} />
                            </td>
                            <td className="text-ink-3">{entry.note ?? '—'}</td>
                            <td className="text-ink-3 text-xs">
                              {new Date(entry.occurredAt).toLocaleDateString('vi-VN')}
                            </td>
                            <td>
                              {canEdit && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleEditEntryPrompt(entry)}
                                    className="btn btn-ghost btn-sm"
                                    title="Sửa điểm"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEntry(entry)}
                                    className="btn btn-ghost btn-sm"
                                    style={{ color: 'var(--red-text)' }}
                                    title="Xoá"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <div className="flex justify-end mb-4">
                {canManageCategories ? (
                  <button onClick={() => setShowCategoryForm((v) => !v)} className="btn btn-primary gap-2">
                    <Plus size={15} /> Thêm hạng mục
                  </button>
                ) : (
                  <p className="text-xs text-ink-3">
                    Chỉ giáo viên hoặc người được uỷ quyền mới có thể quản lý hạng mục.
                  </p>
                )}
              </div>

              {showCategoryForm && canManageCategories && (
                <div className="card mb-6">
                  <div className="card-body">
                    <h3 className="text-sm font-semibold text-ink-1 mb-4">Hạng mục mới</h3>
                    <form onSubmit={handleAddCategory} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Tên hạng mục *">
                          <input
                            type="text"
                            placeholder="VD: Đi học đúng giờ"
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))}
                            required
                          />
                        </Field>
                        <Field label="Điểm mặc định *">
                          <input
                            type="number"
                            value={categoryForm.defaultScore}
                            onChange={(e) =>
                              setCategoryForm((p) => ({ ...p, defaultScore: Number(e.target.value) }))
                            }
                            required
                          />
                        </Field>
                      </div>
                      <Field label="Mô tả">
                        <input
                          type="text"
                          placeholder="Mô tả (tùy chọn)"
                          value={categoryForm.description}
                          onChange={(e) =>
                            setCategoryForm((p) => ({ ...p, description: e.target.value }))
                          }
                        />
                      </Field>
                      <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setShowCategoryForm(false)} className="btn btn-secondary btn-sm">
                          Hủy
                        </button>
                        <button type="submit" disabled={categorySubmitting} className="btn btn-primary btn-sm">
                          {categorySubmitting ? 'Đang lưu...' : 'Thêm'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {categories.length === 0 ? (
                <EmptyState
                  icon={<Award size={28} />}
                  title="Chưa có hạng mục thi đua"
                  hint="Tạo hạng mục để bắt đầu chấm điểm thi đua."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <div key={cat.id} className="card card-body flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-ink-1">{cat.name}</h4>
                        <ScoreCell value={cat.defaultScore} />
                      </div>
                      {cat.description && (
                        <p className="text-xs text-ink-3 line-clamp-2">{cat.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-rule">
                        <Badge variant={cat.active ? 'green' : 'red'}>
                          {cat.active ? 'Đang hoạt động' : 'Đã tắt'}
                        </Badge>
                        {canManageCategories && (
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--red-text)' }}
                            title="Xoá"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
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

function ScoreCell({ value }: { value: number }) {
  const cls =
    value > 0 ? 'text-green-700' : value < 0 ? 'text-red-700' : 'text-ink-2';
  return (
    <span className={`font-semibold ${cls}`}>
      {value > 0 ? `+${value}` : value}
    </span>
  );
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

function LeaderboardTab({
  ranked,
}: {
  ranked: Array<{ memberId: string; totalScore: number; rank: number; member?: ClassroomMember }>;
}) {
  if (ranked.length === 0) {
    return (
      <EmptyState
        icon={<Trophy size={28} />}
        title="Chưa có dữ liệu xếp hạng"
        hint="Sau khi ghi điểm, bảng xếp hạng sẽ tự động cập nhật."
      />
    );
  }

  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="space-y-6">
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {podiumOrder.map((row) => {
            const medalColors = ['#C0C0C0', '#FFD700', '#CD7F32']; // silver, gold, bronze (matching podium order)
            const medal = medalColors[podiumOrder.indexOf(row)];
            const heights = ['h-32', 'h-40', 'h-28'];
            return (
              <div key={row.memberId} className="flex flex-col items-center justify-end">
                <div className="w-12 h-12 rounded-full mb-2 flex items-center justify-center text-white font-semibold text-base shrink-0"
                     style={{ background: 'var(--sidebar-accent)' }}>
                  {row.member?.displayName.charAt(0).toUpperCase() ?? '?'}
                </div>
                <p className="text-xs font-medium text-ink-1 text-center px-1 truncate max-w-full">
                  {row.member?.displayName ?? 'Ẩn danh'}
                </p>
                <ScoreCell value={row.totalScore} />
                <div
                  className={`${heights[podiumOrder.indexOf(row)]} w-full mt-2 rounded-t-md flex items-center justify-center text-white font-bold`}
                  style={{ background: medal }}
                >
                  #{row.rank}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rest.length > 0 && (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Hạng</th>
                <th>Thành viên</th>
                <th>Vai trò</th>
                <th>Tổng điểm</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((row) => (
                <tr key={row.memberId}>
                  <td className="font-semibold text-ink-2">#{row.rank}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                            style={{ background: 'var(--sidebar-accent)' }}>
                        {row.member?.displayName.charAt(0).toUpperCase() ?? '?'}
                      </span>
                      <span className="font-medium">{row.member?.displayName ?? 'Ẩn danh'}</span>
                    </div>
                  </td>
                  <td>
                    {row.member && (
                      <RoleBadges
                        primary={row.member.role}
                        extras={row.member.extraRoles ?? []}
                        short
                        max={2}
                      />
                    )}
                  </td>
                  <td><ScoreCell value={row.totalScore} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
