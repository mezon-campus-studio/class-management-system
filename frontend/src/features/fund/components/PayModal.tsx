import { useState } from 'react';
import { Building2, CreditCard, Wallet, Banknote, Copy, Check, ExternalLink } from 'lucide-react';
import { Modal } from '@/shared/components/Modal';
import { fundApi } from '../api';
import {
  PAYMENT_METHOD_LABELS,
  type Fund,
  type FundCapabilities,
  type FundCollection,
  type InitiatePaymentResult,
  type PaymentMethod,
} from '../types';

interface PayModalProps {
  classroomId: string;
  collection: FundCollection;
  fund: Fund;
  capabilities: FundCapabilities;
  onClose: () => void;
  onPaid: (result: InitiatePaymentResult) => void;
}

const fmt = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

const METHOD_META: Record<PaymentMethod, { icon: React.ReactNode; description: string }> = {
  BANK_TRANSFER: {
    icon: <Building2 size={18} />,
    description: 'Quét VietQR bằng ứng dụng ngân hàng. Khuyên dùng — không mất phí.',
  },
  VNPAY: {
    icon: <CreditCard size={18} />,
    description: 'Thanh toán qua VNPay (ATM/Visa/QR ngân hàng).',
  },
  MOMO: {
    icon: <Wallet size={18} />,
    description: 'Thanh toán qua ví điện tử MoMo.',
  },
  CASH: {
    icon: <Banknote size={18} />,
    description: 'Đóng tiền mặt cho thủ quỹ. Trạng thái sẽ chuyển sang "Đã đóng" sau khi thủ quỹ xác nhận.',
  },
};

/**
 * Two-step modal: choose method → see instructions (QR / redirect / "đã ghi nhận").
 */
export function PayModal({ classroomId, collection, fund, capabilities, onClose, onPaid }: PayModalProps) {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<InitiatePaymentResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const bankConfigured = !!fund.bankBin && !!fund.bankAccountNumber;

  const methods: PaymentMethod[] = [
    ...(bankConfigured ? (['BANK_TRANSFER'] as PaymentMethod[]) : []),
    ...(capabilities.vnpayEnabled ? (['VNPAY'] as PaymentMethod[]) : []),
    ...(capabilities.momoEnabled ? (['MOMO'] as PaymentMethod[]) : []),
    'CASH',
  ];

  const initiate = async () => {
    if (!method) return;
    setSubmitting(true);
    try {
      const res = await fundApi.initiatePayment(classroomId, {
        collectionId: collection.id,
        method,
      });
      setResult(res);
      onPaid(res);
      if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
      }
    } catch (err: unknown) {
      alert(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Không khởi tạo được thanh toán',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <Modal open onClose={onClose} title="Thanh toán quỹ lớp" size="lg">
      <div className="space-y-4">
        <div className="card card-body" style={{ background: 'var(--bg-surface-2)' }}>
          <p className="text-xs text-ink-3">Đợt thu</p>
          <p className="font-medium text-ink-1">{collection.title}</p>
          <p className="text-2xl font-semibold mt-1" style={{ color: 'var(--green-text)' }}>
            {fmt(collection.amount)}
          </p>
          {collection.description && (
            <p className="text-xs text-ink-3 mt-1">{collection.description}</p>
          )}
        </div>

        {!result ? (
          <>
            <div>
              <p className="text-label mb-2">Chọn phương thức</p>
              <div className="space-y-2">
                {methods.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`w-full text-left p-3 rounded-md border transition-colors flex items-start gap-3 ${
                      method === m ? 'border-warm-400' : 'border-rule hover:border-warm-400'
                    }`}
                    style={
                      method === m
                        ? { borderColor: 'var(--warm-400)', background: 'var(--bg-surface-2)' }
                        : {}
                    }
                  >
                    <span className="mt-0.5 text-ink-2">{METHOD_META[m].icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-1">{PAYMENT_METHOD_LABELS[m]}</p>
                      <p className="text-xs text-ink-3 mt-0.5">{METHOD_META[m].description}</p>
                    </div>
                  </button>
                ))}
              </div>
              {!bankConfigured && (
                <p className="text-xs text-ink-3 italic mt-2">
                  ⓘ Thủ quỹ chưa cấu hình tài khoản ngân hàng nên VietQR tạm chưa khả dụng.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-rule">
              <button onClick={onClose} className="btn btn-secondary btn-sm">Hủy</button>
              <button
                onClick={initiate}
                disabled={!method || submitting}
                className="btn btn-primary btn-sm"
              >
                {submitting ? 'Đang xử lý...' : 'Tiếp tục'}
              </button>
            </div>
          </>
        ) : (
          <ResultPanel
            result={result}
            fund={fund}
            onCopy={copy}
            copied={copied}
            onClose={onClose}
          />
        )}
      </div>
    </Modal>
  );
}

function ResultPanel({
  result,
  fund,
  onCopy,
  copied,
  onClose,
}: {
  result: InitiatePaymentResult;
  fund: Fund;
  onCopy: (label: string, value: string) => void;
  copied: string | null;
  onClose: () => void;
}) {
  if (result.method === 'BANK_TRANSFER' && result.qrImageUrl) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-ink-1 font-medium">Quét VietQR để chuyển khoản</p>
        <div className="flex justify-center">
          <img
            src={result.qrImageUrl}
            alt="VietQR"
            className="rounded-lg border border-rule"
            style={{ maxWidth: 320 }}
          />
        </div>
        <div className="card card-body" style={{ background: 'var(--bg-surface-2)' }}>
          <CopyRow
            label="Ngân hàng"
            value={`${fund.bankShortName ?? ''}${fund.bankShortName ? ' · ' : ''}${fund.bankBin ?? ''}`}
            onCopy={onCopy}
            copied={copied}
          />
          <CopyRow label="Số tài khoản" value={result.bankAccountNumber ?? ''} onCopy={onCopy} copied={copied} />
          <CopyRow label="Chủ tài khoản" value={result.bankAccountName ?? ''} onCopy={onCopy} copied={copied} />
          <CopyRow label="Số tiền" value={String(result.amount)} formatted={result.amount.toLocaleString('vi-VN') + ' ₫'} onCopy={onCopy} copied={copied} />
          <CopyRow
            label="Nội dung chuyển khoản"
            value={result.transferContent}
            onCopy={onCopy}
            copied={copied}
            highlight
          />
        </div>
        <p className="text-xs text-ink-3">
          Sau khi chuyển khoản thành công, vui lòng đợi thủ quỹ xác nhận. Trạng thái sẽ chuyển từ
          <span className="font-medium"> "Chờ xác nhận" → "Đã đóng"</span>.
        </p>
        <div className="flex justify-end pt-2 border-t border-rule">
          <button onClick={onClose} className="btn btn-primary btn-sm">Tôi đã chuyển khoản</button>
        </div>
      </div>
    );
  }

  if ((result.method === 'VNPAY' || result.method === 'MOMO') && result.redirectUrl) {
    return (
      <div className="space-y-3 text-center py-8">
        <ExternalLink size={32} className="mx-auto text-ink-3" />
        <p className="text-sm text-ink-1">Đang chuyển hướng tới cổng thanh toán...</p>
        <a href={result.redirectUrl} className="btn btn-primary btn-sm">Đi tới {result.method}</a>
      </div>
    );
  }

  // Cash or fallback
  return (
    <div className="space-y-3 text-center py-6">
      <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
           style={{ background: 'var(--bg-surface-2)' }}>
        <Banknote size={28} style={{ color: 'var(--green-text)' }} />
      </div>
      <p className="text-sm font-medium text-ink-1">Đã ghi nhận yêu cầu thanh toán tiền mặt</p>
      <p className="text-xs text-ink-3 max-w-sm mx-auto">
        Vui lòng đóng tiền cho thủ quỹ. Sau khi nhận tiền, thủ quỹ sẽ xác nhận và trạng thái của bạn
        sẽ chuyển sang "Đã đóng".
      </p>
      <div className="flex justify-end pt-2 border-t border-rule">
        <button onClick={onClose} className="btn btn-primary btn-sm">Đóng</button>
      </div>
    </div>
  );
}

function CopyRow({
  label,
  value,
  formatted,
  onCopy,
  copied,
  highlight,
}: {
  label: string;
  value: string;
  formatted?: string;
  onCopy: (label: string, value: string) => void;
  copied: string | null;
  highlight?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-rule last:border-b-0">
      <p className="text-xs text-ink-3">{label}</p>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-sm truncate ${highlight ? 'font-mono font-semibold text-ink-1' : 'text-ink-1'}`}>
          {formatted ?? value}
        </span>
        <button
          type="button"
          onClick={() => onCopy(label, value)}
          className="btn btn-ghost btn-sm shrink-0"
          title="Sao chép"
        >
          {copied === label ? <Check size={13} style={{ color: 'var(--green-text)' }} /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  );
}
