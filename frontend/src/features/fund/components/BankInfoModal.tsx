import { useState } from 'react';
import { Modal } from '@/shared/components/Modal';
import { fundApi } from '../api';
import { COMMON_BANKS, type Fund } from '../types';

interface BankInfoModalProps {
  classroomId: string;
  fund: Fund;
  onClose: () => void;
  onSaved: (fund: Fund) => void;
}

/**
 * Treasurer / teacher form that configures the receiving bank account used
 * by VietQR. Pick a bank from the dropdown — that auto-fills the BIN and
 * short name — then enter the account number + holder name.
 */
export function BankInfoModal({ classroomId, fund, onClose, onSaved }: BankInfoModalProps) {
  const [bin, setBin] = useState(fund.bankBin ?? '');
  const [shortName, setShortName] = useState(fund.bankShortName ?? '');
  const [accountNumber, setAccountNumber] = useState(fund.bankAccountNumber ?? '');
  const [accountName, setAccountName] = useState(fund.bankAccountName ?? '');
  const [saving, setSaving] = useState(false);

  const onPickBank = (selectedBin: string) => {
    setBin(selectedBin);
    const found = COMMON_BANKS.find((b) => b.bin === selectedBin);
    if (found) setShortName(found.shortName);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await fundApi.updateBankInfo(classroomId, {
        bankBin: bin || null,
        bankShortName: shortName || null,
        bankAccountNumber: accountNumber || null,
        bankAccountName: accountName || null,
      });
      onSaved(updated);
      onClose();
    } catch (err: unknown) {
      alert(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Không lưu được thông tin ngân hàng',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Xoá thông tin ngân hàng? Học sinh sẽ không thể chuyển khoản qua VietQR.')) return;
    setSaving(true);
    try {
      const updated = await fundApi.updateBankInfo(classroomId, {
        bankBin: null,
        bankShortName: null,
        bankAccountNumber: null,
        bankAccountName: null,
      });
      onSaved(updated);
      onClose();
    } catch (err: unknown) {
      alert(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Có lỗi xảy ra',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Thông tin tài khoản nhận quỹ">
      <div className="space-y-3">
        <p className="text-xs text-ink-3">
          Tài khoản này dùng để tạo mã VietQR cho học sinh chuyển khoản. Có thể bỏ qua nếu chỉ thu tiền mặt.
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-label">Ngân hàng</label>
          <div className="input-field">
            <select value={bin} onChange={(e) => onPickBank(e.target.value)}>
              <option value="">— Chọn ngân hàng —</option>
              {COMMON_BANKS.map((b) => (
                <option key={b.bin} value={b.bin}>
                  {b.shortName} · {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-label">Mã BIN</label>
            <div className="input-field">
              <input
                type="text"
                placeholder="970436"
                value={bin}
                onChange={(e) => setBin(e.target.value.trim())}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-label">Tên viết tắt</label>
            <div className="input-field">
              <input
                type="text"
                placeholder="VCB"
                value={shortName}
                onChange={(e) => setShortName(e.target.value.trim())}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-label">Số tài khoản *</label>
          <div className="input-field">
            <input
              type="text"
              inputMode="numeric"
              placeholder="0123456789"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.trim())}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-label">Chủ tài khoản *</label>
          <div className="input-field">
            <input
              type="text"
              placeholder="NGUYEN VAN A"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between gap-2 pt-3 border-t border-rule">
          {fund.bankAccountNumber ? (
            <button
              onClick={handleClear}
              disabled={saving}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--red-text)' }}
            >
              Xoá thông tin
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="btn btn-secondary btn-sm">Hủy</button>
            <button
              onClick={handleSave}
              disabled={saving || !bin || !accountNumber || !accountName}
              className="btn btn-primary btn-sm"
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
