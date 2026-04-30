import React, { useState } from "react";
import { Modal } from "@shared/components/ui/Modal";
interface LeaveFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { reason: string; fromDate: string; toDate: string; proofUrl?: string }) => Promise<boolean>;
    isSubmitting: boolean;
}

export const LeaveFormModal: React.FC<LeaveFormModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
    const [reason, setReason] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [proofUrl, setProofUrl] = useState("");

    if (!isOpen) return null;

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await onSubmit({ reason, fromDate, toDate, proofUrl });
        if (success) {
            setReason("");
            setFromDate("");
            setToDate("");
            setProofUrl("");
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tạo đơn xin nghỉ phép">
            <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="input-label">Lý do nghỉ phép <span className="text-ink-red-text">*</span></label>
                        <div className="input-field min-h-[120px] items-start">
                            <textarea
                                required
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Nhập lý do chi tiết (ví dụ: bị ốm, việc gia đình...)"
                                className="w-full resize-none min-h-[100px] leading-relaxed"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="input-label">Từ ngày <span className="text-ink-red-text">*</span></label>
                            <div className="input-field">
                                <input
                                    type="date"
                                    required
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="input-label">Đến ngày <span className="text-ink-red-text">*</span></label>
                            <div className="input-field">
                                <input
                                    type="date"
                                    required
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="input-label">Link minh chứng (nếu có)</label>
                        <div className="input-field">
                            <input
                                type="url"
                                value={proofUrl}
                                onChange={(e) => setProofUrl(e.target.value)}
                                placeholder="https://drive.google.com/..."
                            />
                        </div>
                        <p className="input-helper italic">* Ví dụ: ảnh giấy khám bệnh, giấy mời, ảnh minh chứng...</p>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary flex-1 font-bold"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`btn btn-warm flex-1 shadow-lg shadow-warm-400/20 font-bold ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Đang gửi...
                                </>
                            ) : (
                                "Gửi đơn xin nghỉ"
                            )}
                        </button>
                    </div>
            </form>
        </Modal>
    );
};
