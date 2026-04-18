import React, { useState } from "react";

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
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-ink-1/40 backdrop-blur-sm transition-all duration-base">
            <div className="bg-surface w-full max-w-lg rounded-xl shadow-xl overflow-hidden animate-scale-in">
                <div className="px-6 py-5 border-b border-rule flex justify-between items-center bg-surface-2">
                    <h3 className="text-xl font-serif font-bold text-ink-1 tracking-tight">Tạo đơn xin nghỉ phép</h3>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-surface-3 rounded-full transition-colors text-ink-3 hover:text-ink-1"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
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
            </div>
        </div>
    );
};
