import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Check,
  Wallet,
  Building2,
  Settings2,
  Calendar,
  AlertCircle,
  RefreshCw,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { fundApi } from '../api';
import { Badge } from '@/shared/components/Badge';
import { useAuthStore } from '@/app/store';
import {
  PAYMENT_METHOD_LABELS,
  STATUS_LABELS,
  STATUS_VARIANT,
  type CollectionStatus,
  type FundCapabilities,
  type FundCollection,
  type FundExpense,
  type FundPayment,
  type FundSummary,
} from '../types';
import { PayModal } from '../components/PayModal';
import { BankInfoModal } from '../components/BankInfoModal';

type Tab = 'collections' | 'expenses' | 'my-payments';

const fmt = (n: number | null | undefined) => (n ?? 0).toLocaleString('vi-VN') + ' ₫';

function showError(err: unknown) {
  alert(
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      'Có lỗi xảy ra',
  );
}

export function FundPage() {
  const { classroomId } = useParams<{ classroomId: string }>();
  const userId = useAuthStore((s) => s.user?.id);

  const [summary, setSummary] = useState<FundSummary | null>(null);
  const [capabilities, setCapabilities] = useState<FundCapabilities>({
    canManage: false,
    vnpayEnabled: false,
    momoEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [noFund, setNoFund] = useState(false);
  const [tab, setTab] = useState<Tab>('collections');

  const [showCreateFund, setShowCreateFund] = useState(false);
  const [createFundForm, setCreateFundForm] = useState({ name: '', description: '' });
  const [creatingFund, setCreatingFund] = useState(false);

  const [showAddCollection, setShowAddCollection] = useState(false);
  const [collectionForm, setCollectionForm] = useState({ title: '', amount: '', description: '', dueDate: '' });
  const [addingCollection, setAddingCollection] = useState(false);

  const [expandedCollection, setExpandedCollection] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, CollectionStatus>>({});

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ title: '', amount: '', description: '', expenseDate: '' });
  const [addingExpense, setAddingExpense] = useState(false);
  const [expenses, setExpenses] = useState<FundExpense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  const [myPayments, setMyPayments] = useState<FundPayment[]>([]);
  const [loadingMyPayments, setLoadingMyPayments] = useState(false);

  const [payingCollection, setPayingCollection] = useState<FundCollection | null>(null);
  const [showBankModal, setShowBankModal] = useState(false);

  // ─── Data loading ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!classroomId) return;
    Promise.all([
      fundApi.getFundSummary(classroomId).catch((err) => {
        if ((err as { response?: { status?: number } })?.response?.status === 404) {
          setNoFund(true);
          return null;
        }
        throw err;
      }),
      fundApi.getCapabilities(classroomId).catch(() => ({
        canManage: false,
        vnpayEnabled: false,
        momoEnabled: false,
      })),
    ])
      .then(([s, caps]) => {
        if (s) {
          setSummary(s);
          // Eager-load all collection statuses so the payment button
          // is visible without the user having to open each accordion first.
          s.collections.forEach((col) =>
            fundApi.getCollectionStatus(classroomId!, col.id)
              .then((st) => setStatuses((prev) => ({ ...prev, [col.id]: st })))
              .catch(() => undefined),
          );
        }
        setCapabilities(caps);
      })
      .catch(showError)
      .finally(() => setLoading(false));
  }, [classroomId]);

  useEffect(() => {
    if (!classroomId || !summary) return;
    if (tab === 'expenses' && expenses.length === 0) {
      setLoadingExpenses(true);
      fundApi.listExpenses(classroomId).then(setExpenses).catch(showError).finally(() => setLoadingExpenses(false));
    }
    if (tab === 'my-payments' && myPayments.length === 0) {
      setLoadingMyPayments(true);
      fundApi.listMyPayments(classroomId).then(setMyPayments).catch(showError).finally(() => setLoadingMyPayments(false));
    }
  }, [tab, classroomId, summary, expenses.length, myPayments.length]);

  const loadStatus = useCallback(async (collectionId: string) => {
    if (!classroomId) return;
    try {
      const st = await fundApi.getCollectionStatus(classroomId, collectionId);
      setStatuses((prev) => ({ ...prev, [collectionId]: st }));
    } catch (err) {
      showError(err);
    }
  }, [classroomId]);

  const refreshAll = async () => {
    if (!classroomId) return;
    setLoading(true);
    try {
      const s = await fundApi.getFundSummary(classroomId);
      setSummary(s);
      // Refresh any open status panels
      await Promise.all(Object.keys(statuses).map((cid) => loadStatus(cid)));
      if (tab === 'my-payments') {
        const my = await fundApi.listMyPayments(classroomId);
        setMyPayments(my);
      }
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Mutations ───────────────────────────────────────────────────────────

  const handleCreateFund = async () => {
    if (!classroomId || !createFundForm.name.trim()) return;
    setCreatingFund(true);
    try {
      await fundApi.createFund(classroomId, {
        name: createFundForm.name,
        description: createFundForm.description || undefined,
      });
      const [s, caps] = await Promise.all([
        fundApi.getFundSummary(classroomId),
        fundApi.getCapabilities(classroomId),
      ]);
      setSummary(s);
      setCapabilities(caps);
      setNoFund(false);
      setShowCreateFund(false);
      setCreateFundForm({ name: '', description: '' });
    } catch (err) {
      showError(err);
    } finally {
      setCreatingFund(false);
    }
  };

  const handleAddCollection = async () => {
    if (!classroomId || !collectionForm.title.trim() || !collectionForm.amount) return;
    setAddingCollection(true);
    try {
      const newCol = await fundApi.createCollection(classroomId, {
        title: collectionForm.title,
        amount: Number(collectionForm.amount),
        description: collectionForm.description || undefined,
        dueDate: collectionForm.dueDate || undefined,
      });
      setSummary((prev) => prev ? { ...prev, collections: [newCol, ...prev.collections] } : prev);
      setShowAddCollection(false);
      setCollectionForm({ title: '', amount: '', description: '', dueDate: '' });
    } catch (err) {
      showError(err);
    } finally {
      setAddingCollection(false);
    }
  };

  const handleToggleCollection = (col: FundCollection) => {
    if (expandedCollection === col.id) {
      setExpandedCollection(null);
      return;
    }
    setExpandedCollection(col.id);
    if (!statuses[col.id]) loadStatus(col.id);
  };

  const handleConfirmPayment = async (paymentId: string, collectionId: string) => {
    if (!classroomId) return;
    try {
      await fundApi.confirmPayment(classroomId, paymentId);
      await Promise.all([
        loadStatus(collectionId),
        fundApi.getFundSummary(classroomId).then(setSummary),
      ]);
    } catch (err) {
      showError(err);
    }
  };

  const handleRevertPayment = async (paymentId: string, collectionId: string) => {
    if (!classroomId || !confirm('Hoàn lại xác nhận này? Số dư quỹ sẽ trừ lại tương ứng.')) return;
    try {
      await fundApi.revertPayment(classroomId, paymentId);
      await Promise.all([
        loadStatus(collectionId),
        fundApi.getFundSummary(classroomId).then(setSummary),
      ]);
    } catch (err) {
      showError(err);
    }
  };

  const handleRejectPayment = async (paymentId: string, collectionId: string) => {
    if (!classroomId || !confirm('Từ chối thanh toán này? Học sinh sẽ cần nộp lại từ đầu.')) return;
    try {
      await fundApi.rejectPayment(classroomId, paymentId);
      await loadStatus(collectionId);
    } catch (err) {
      showError(err);
    }
  };

  const handleAddExpense = async () => {
    if (!classroomId || !expenseForm.title.trim() || !expenseForm.amount || !expenseForm.expenseDate) return;
    setAddingExpense(true);
    try {
      const newExp = await fundApi.addExpense(classroomId, {
        title: expenseForm.title,
        amount: Number(expenseForm.amount),
        description: expenseForm.description || undefined,
        expenseDate: new Date(expenseForm.expenseDate).toISOString(),
      });
      setExpenses((prev) => [newExp, ...prev]);
      // Re-fetch summary so balance reflects the new expense.
      const s = await fundApi.getFundSummary(classroomId);
      setSummary(s);
      setShowAddExpense(false);
      setExpenseForm({ title: '', amount: '', description: '', expenseDate: '' });
    } catch (err) {
      showError(err);
    } finally {
      setAddingExpense(false);
    }
  };

  const collectionById = useMemo(() => {
    const m = new Map<string, FundCollection>();
    for (const c of summary?.collections ?? []) m.set(c.id, c);
    return m;
  }, [summary]);

  if (loading && !summary) {
    return <div className="animate-pulse text-center py-10 text-ink-3">Đang tải...</div>;
  }

  if (noFund) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-serif font-semibold text-ink-1 mb-6">Quỹ lớp</h1>
        <div className="card card-body text-center py-16">
          <Wallet size={40} className="mx-auto mb-4 text-ink-3 opacity-40" />
          <p className="text-ink-2 mb-1">Chưa có quỹ lớp</p>
          <p className="text-xs text-ink-3 mb-6">
            Tạo quỹ để bắt đầu quản lý các đợt thu, chi tiêu và thanh toán online.
          </p>
          {!capabilities.canManage ? (
            <p className="text-xs text-ink-3 italic">
              Chỉ giáo viên / lớp trưởng / thủ quỹ (hoặc người được uỷ quyền) mới có thể tạo quỹ.
            </p>
          ) : !showCreateFund ? (
            <button onClick={() => setShowCreateFund(true)} className="btn btn-primary gap-2 mx-auto">
              <Plus size={15} /> Tạo quỹ
            </button>
          ) : (
            <div className="max-w-sm mx-auto text-left space-y-3">
              <Field label="Tên quỹ *">
                <input
                  type="text"
                  placeholder="VD: Quỹ lớp 12A1"
                  value={createFundForm.name}
                  onChange={(e) => setCreateFundForm((p) => ({ ...p, name: e.target.value }))}
                />
              </Field>
              <FieldMultiline label="Mô tả">
                <textarea
                  rows={3}
                  placeholder="Mô tả về quỹ lớp..."
                  value={createFundForm.description}
                  onChange={(e) => setCreateFundForm((p) => ({ ...p, description: e.target.value }))}
                />
              </FieldMultiline>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowCreateFund(false)} className="btn btn-secondary btn-sm">Hủy</button>
                <button
                  onClick={handleCreateFund}
                  disabled={creatingFund || !createFundForm.name.trim()}
                  className="btn btn-primary btn-sm"
                >
                  {creatingFund ? 'Đang tạo...' : 'Tạo quỹ'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!summary) return null;
  const fund = summary.fund;
  const bankConfigured = !!fund.bankBin && !!fund.bankAccountNumber;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-ink-1">{fund.name}</h1>
          {fund.description && (
            <p className="text-sm text-ink-3 mt-1">{fund.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refreshAll} className="btn btn-ghost btn-sm gap-1.5" title="Làm mới">
            <RefreshCw size={13} />
          </button>
          {capabilities.canManage && (
            <button onClick={() => setShowBankModal(true)} className="btn btn-secondary btn-sm gap-1.5">
              <Settings2 size={13} /> Tài khoản nhận
            </button>
          )}
        </div>
      </div>

      {/* Bank info banner */}
      {capabilities.canManage && !bankConfigured && (
        <div className="card card-body mb-4 flex items-start gap-3"
             style={{ background: 'rgba(255, 192, 100, 0.08)', borderColor: 'var(--amber-text)' }}>
          <AlertCircle size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--amber-text)' }} />
          <div className="flex-1">
            <p className="text-sm font-medium text-ink-1">Chưa cấu hình tài khoản ngân hàng</p>
            <p className="text-xs text-ink-3 mt-0.5">
              Học sinh sẽ chưa thể chuyển khoản qua VietQR. Cập nhật ngay để mở phương thức thanh toán này.
            </p>
          </div>
          <button onClick={() => setShowBankModal(true)} className="btn btn-primary btn-sm shrink-0">
            Cấu hình
          </button>
        </div>
      )}
      {bankConfigured && (
        <div className="card card-body mb-4 flex items-center gap-3">
          <Building2 size={18} className="text-ink-3" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-ink-3">Tài khoản nhận quỹ</p>
            <p className="text-sm text-ink-1">
              <span className="font-mono font-semibold">{fund.bankAccountNumber}</span>
              {' · '}
              {fund.bankShortName ?? fund.bankBin}
              {fund.bankAccountName && ` · ${fund.bankAccountName}`}
            </p>
          </div>
        </div>
      )}

      {/* Summary tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card card-body">
          <p className="text-label mb-1">Số dư hiện tại</p>
          <p className="text-2xl font-semibold" style={{ color: 'var(--green-text)' }}>
            {fmt(fund.balance)}
          </p>
        </div>
        <div className="card card-body">
          <p className="text-label mb-1">Tổng đã thu</p>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} style={{ color: 'var(--green-text)' }} />
            <p className="text-xl font-semibold text-ink-1">{fmt(summary.totalCollected)}</p>
          </div>
        </div>
        <div className="card card-body">
          <p className="text-label mb-1">Tổng đã chi</p>
          <div className="flex items-center gap-2">
            <TrendingDown size={16} style={{ color: 'var(--red-text)' }} />
            <p className="text-xl font-semibold text-ink-1">{fmt(summary.totalExpenses)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-rule">
        {([
          { key: 'collections', label: 'Đợt thu' },
          { key: 'expenses', label: 'Khoản chi' },
          { key: 'my-payments', label: 'Của tôi' },
        ] as const).map((t) => (
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

      {tab === 'collections' && (
        <div className="space-y-4">
          {capabilities.canManage && (
            <div className="flex justify-end">
              <button onClick={() => setShowAddCollection((v) => !v)} className="btn btn-primary btn-sm gap-1.5">
                <Plus size={14} /> Thêm đợt thu
              </button>
            </div>
          )}

          {showAddCollection && capabilities.canManage && (
            <div className="card card-body space-y-3">
              <p className="font-medium text-ink-1">Thêm đợt thu mới</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tiêu đề *">
                  <input
                    type="text"
                    placeholder="VD: Quỹ học kỳ 1"
                    value={collectionForm.title}
                    onChange={(e) => setCollectionForm((p) => ({ ...p, title: e.target.value }))}
                  />
                </Field>
                <Field label="Số tiền/người (₫) *">
                  <input
                    type="number"
                    placeholder="50000"
                    value={collectionForm.amount}
                    onChange={(e) => setCollectionForm((p) => ({ ...p, amount: e.target.value }))}
                  />
                </Field>
                <Field label="Mô tả">
                  <input
                    type="text"
                    placeholder="Mô tả..."
                    value={collectionForm.description}
                    onChange={(e) => setCollectionForm((p) => ({ ...p, description: e.target.value }))}
                  />
                </Field>
                <Field label="Hạn nộp">
                  <input
                    type="date"
                    value={collectionForm.dueDate}
                    onChange={(e) => setCollectionForm((p) => ({ ...p, dueDate: e.target.value }))}
                  />
                </Field>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAddCollection(false)} className="btn btn-secondary btn-sm">Hủy</button>
                <button
                  onClick={handleAddCollection}
                  disabled={addingCollection || !collectionForm.title.trim() || !collectionForm.amount}
                  className="btn btn-primary btn-sm"
                >
                  {addingCollection ? 'Đang thêm...' : 'Thêm'}
                </button>
              </div>
            </div>
          )}

          {summary.collections.length === 0 ? (
            <EmptyState
              icon={<Calendar size={28} />}
              title="Chưa có đợt thu"
              hint="Tạo đợt thu để bắt đầu thu tiền quỹ từ các thành viên."
            />
          ) : (
            summary.collections.map((col) => {
              const status = statuses[col.id];
              const myRow = status?.rows.find((r) => r.userId === userId);
              const isExpanded = expandedCollection === col.id;
              const progress = status
                ? Math.round((status.paidCount / Math.max(status.totalMembers, 1)) * 100)
                : 0;
              return (
                <div key={col.id} className="card overflow-hidden">
                  <div className="card-body">
                    <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className="font-semibold text-ink-1">{col.title}</p>
                          <Badge variant={col.active ? 'green' : 'sage'}>
                            {col.active ? 'Đang thu' : 'Đã đóng'}
                          </Badge>
                          {myRow && (
                            <Badge variant={STATUS_VARIANT[myRow.status]}>
                              {STATUS_LABELS[myRow.status]}
                            </Badge>
                          )}
                        </div>
                        <p className="text-lg font-semibold" style={{ color: 'var(--green-text)' }}>
                          {fmt(col.amount)}
                        </p>
                        {col.dueDate && (
                          <p className="text-xs text-ink-3 mt-0.5 flex items-center gap-1">
                            <Calendar size={11} />
                            Hạn: {new Date(col.dueDate).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                        {col.description && (
                          <p className="text-xs text-ink-3 mt-1">{col.description}</p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {col.active && (!myRow || myRow.status !== 'CONFIRMED') && (
                          <button
                            onClick={() => setPayingCollection(col)}
                            className="btn btn-primary btn-sm gap-1.5"
                          >
                            <Wallet size={13} />
                            {myRow?.status === 'PENDING' ? 'Thanh toán lại' : 'Thanh toán'}
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleCollection(col)}
                          className="btn btn-secondary btn-sm gap-1.5"
                        >
                          <Users size={13} />
                          {isExpanded ? 'Ẩn' : 'Xem ai đã đóng'}
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      </div>
                    </div>

                    {/* Inline progress bar */}
                    {status && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-ink-3 mb-1">
                          <span>
                            <span style={{ color: 'var(--green-text)' }}>● {status.paidCount} đã đóng</span>
                            {' · '}
                            <span style={{ color: 'var(--amber-text)' }}>● {status.pendingCount} chờ xác nhận</span>
                            {' · '}
                            <span style={{ color: 'var(--red-text)' }}>● {status.unpaidCount} chưa đóng</span>
                          </span>
                          <span className="font-medium text-ink-2">
                            {fmt(status.totalCollected)} / {fmt(col.amount * status.totalMembers)}
                          </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden flex"
                             style={{ background: 'var(--bg-surface-2)' }}>
                          <div
                            style={{ width: `${progress}%`, background: 'var(--green-text)' }}
                          />
                          {status.pendingCount > 0 && (
                            <div
                              style={{
                                width: `${(status.pendingCount / Math.max(status.totalMembers, 1)) * 100}%`,
                                background: 'var(--amber-text)',
                              }}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="border-t border-rule">
                      {!status ? (
                        <div className="animate-pulse text-center py-6 text-ink-3">Đang tải...</div>
                      ) : (
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Thành viên</th>
                              <th>Trạng thái</th>
                              <th>Số tiền</th>
                              <th>Phương thức</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {status.rows.map((row) => (
                              <tr key={row.userId}>
                                <td>
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                                          style={{ background: 'var(--sidebar-accent)' }}>
                                      {row.displayName.charAt(0).toUpperCase()}
                                    </span>
                                    <span className="font-medium">{row.displayName}</span>
                                    {row.userId === userId && (
                                      <Badge variant="blue">Bạn</Badge>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <Badge variant={STATUS_VARIANT[row.status]}>
                                    {STATUS_LABELS[row.status]}
                                  </Badge>
                                </td>
                                <td>
                                  {row.amountPaid != null ? fmt(row.amountPaid) : <span className="text-ink-3">—</span>}
                                </td>
                                <td className="text-ink-3 text-xs">
                                  {row.paymentMethod
                                    ? PAYMENT_METHOD_LABELS[row.paymentMethod]
                                    : '—'}
                                  {row.transactionRef && (
                                    <span className="block font-mono text-[11px] text-ink-3">
                                      {row.transactionRef}
                                    </span>
                                  )}
                                </td>
                                <td>
                                  {capabilities.canManage && row.status === 'PENDING' && row.paymentId && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleConfirmPayment(row.paymentId!, col.id)}
                                        className="btn btn-ghost btn-sm gap-1"
                                        style={{ color: 'var(--green-text)' }}
                                      >
                                        <Check size={13} /> Xác nhận
                                      </button>
                                      <button
                                        onClick={() => handleRejectPayment(row.paymentId!, col.id)}
                                        className="btn btn-ghost btn-sm text-xs"
                                        style={{ color: 'var(--red-text)' }}
                                      >
                                        Từ chối
                                      </button>
                                    </div>
                                  )}
                                  {capabilities.canManage && row.status === 'CONFIRMED' && row.paymentId && (
                                    <button
                                      onClick={() => handleRevertPayment(row.paymentId!, col.id)}
                                      className="btn btn-ghost btn-sm text-xs"
                                      style={{ color: 'var(--red-text)' }}
                                    >
                                      Hoàn lại
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === 'expenses' && (
        <div className="space-y-4">
          {capabilities.canManage && (
            <div className="flex justify-end">
              <button onClick={() => setShowAddExpense((v) => !v)} className="btn btn-primary btn-sm gap-1.5">
                <Plus size={14} /> Ghi chi phí
              </button>
            </div>
          )}

          {showAddExpense && capabilities.canManage && (
            <div className="card card-body space-y-3">
              <p className="font-medium text-ink-1">Ghi chi phí mới</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tiêu đề *">
                  <input
                    type="text"
                    placeholder="VD: Mua văn phòng phẩm"
                    value={expenseForm.title}
                    onChange={(e) => setExpenseForm((p) => ({ ...p, title: e.target.value }))}
                  />
                </Field>
                <Field label="Số tiền (₫) *">
                  <input
                    type="number"
                    placeholder="100000"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm((p) => ({ ...p, amount: e.target.value }))}
                  />
                </Field>
                <Field label="Ngày chi *">
                  <input
                    type="datetime-local"
                    value={expenseForm.expenseDate}
                    onChange={(e) => setExpenseForm((p) => ({ ...p, expenseDate: e.target.value }))}
                  />
                </Field>
                <Field label="Mô tả">
                  <input
                    type="text"
                    placeholder="Mô tả..."
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm((p) => ({ ...p, description: e.target.value }))}
                  />
                </Field>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAddExpense(false)} className="btn btn-secondary btn-sm">Hủy</button>
                <button
                  onClick={handleAddExpense}
                  disabled={addingExpense || !expenseForm.title.trim() || !expenseForm.amount || !expenseForm.expenseDate}
                  className="btn btn-primary btn-sm"
                >
                  {addingExpense ? 'Đang ghi...' : 'Ghi chi phí'}
                </button>
              </div>
            </div>
          )}

          {loadingExpenses ? (
            <div className="animate-pulse text-center py-10 text-ink-3">Đang tải...</div>
          ) : expenses.length === 0 ? (
            <EmptyState
              icon={<TrendingDown size={28} />}
              title="Chưa có khoản chi"
              hint="Khi quỹ chi tiêu cho hoạt động nào đó, hãy ghi lại tại đây để minh bạch."
            />
          ) : (
            <div className="card overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Số tiền</th>
                    <th>Ngày chi</th>
                    <th>Mô tả</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="font-medium text-ink-1">{exp.title}</td>
                      <td style={{ color: 'var(--red-text)' }} className="font-semibold">
                        -{fmt(exp.amount)}
                      </td>
                      <td className="text-ink-3 text-xs">
                        {new Date(exp.expenseDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="text-ink-3 text-xs">{exp.description ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'my-payments' && (
        <div>
          {loadingMyPayments ? (
            <div className="animate-pulse text-center py-10 text-ink-3">Đang tải...</div>
          ) : myPayments.length === 0 ? (
            <EmptyState
              icon={<Wallet size={28} />}
              title="Chưa có thanh toán"
              hint="Các khoản thanh toán quỹ của bạn sẽ hiện tại đây."
            />
          ) : (
            <div className="card overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Đợt thu</th>
                    <th>Số tiền</th>
                    <th>Phương thức</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Xác nhận</th>
                  </tr>
                </thead>
                <tbody>
                  {myPayments.map((p) => (
                    <tr key={p.id}>
                      <td className="text-ink-1 font-medium">
                        {collectionById.get(p.collectionId)?.title ?? '—'}
                      </td>
                      <td>{fmt(p.amount)}</td>
                      <td className="text-ink-3 text-xs">
                        {PAYMENT_METHOD_LABELS[p.paymentMethod]}
                        {p.transactionRef && (
                          <span className="block font-mono text-[11px]">{p.transactionRef}</span>
                        )}
                      </td>
                      <td>
                        <Badge variant={p.status === 'CONFIRMED' ? 'green' : p.status === 'REJECTED' ? 'red' : 'amber'}>
                          {p.status === 'CONFIRMED' ? 'Đã xác nhận' : p.status === 'REJECTED' ? 'Bị từ chối' : 'Chờ xác nhận'}
                        </Badge>
                      </td>
                      <td className="text-ink-3 text-xs">
                        {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="text-ink-3 text-xs">
                        {p.confirmedAt ? new Date(p.confirmedAt).toLocaleDateString('vi-VN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {payingCollection && classroomId && (
        <PayModal
          classroomId={classroomId}
          collection={payingCollection}
          fund={fund}
          capabilities={capabilities}
          onClose={() => {
            setPayingCollection(null);
            // Refresh status of just-paid collection
            loadStatus(payingCollection.id);
            if (tab === 'my-payments') {
              fundApi.listMyPayments(classroomId).then(setMyPayments).catch(() => undefined);
            }
          }}
          onPaid={() => undefined}
        />
      )}

      {showBankModal && classroomId && (
        <BankInfoModal
          classroomId={classroomId}
          fund={fund}
          onClose={() => setShowBankModal(false)}
          onSaved={(updated) =>
            setSummary((prev) => prev ? { ...prev, fund: updated } : prev)
          }
        />
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
