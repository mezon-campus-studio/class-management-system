import React, { useState } from "react";
import type { FundCampaign } from "@features/fund/types"

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign: FundCampaign;
    onQRSuccess: (amount: number) => Promise<boolean>;
    onSubmitProof: (imageUrl: string) => Promise<boolean>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
    isOpen, onClose, campaign, onQRSuccess, onSubmitProof 
}) => {
    const [step, setStep] = useState<'CHOICE' | 'QR' | 'PROOF'>('CHOICE');
    const [proofUrl, setProofUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    // VietQR format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>
    const qrUrl = `https://img.vietqr.io/image/MB-999922226666-compact2.png?amount=${campaign.amount}&addInfo=Dong%20tien%20${campaign.title.replace(/ /g, '%20')}&accountName=NGUYEN%20VAN%20ADMIN`;

    const handleFakeQRSuccess = async () => {
        setIsSubmitting(true);
        const success = await onQRSuccess(campaign.amount);
        if (success) {
            alert("Thanh toán QR thành công (Giả lập Webhook)");
            onClose();
        }
        setIsSubmitting(false);
    };

    const handleProofSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!proofUrl) return;
        setIsSubmitting(true);
        const success = await onSubmitProof(proofUrl);
        if (success) {
            alert("Đã gửi minh chứng, vui lòng chờ Admin duyệt.");
            onClose();
        }
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-ink-1/40 backdrop-blur-sm">
            <div className="bg-surface w-full max-w-md rounded-xl shadow-xl overflow-hidden animate-scale-in">
                <div className="px-6 py-4 border-b border-rule flex justify-between items-center bg-surface-2">
                    <h3 className="font-serif font-semibold text-xl text-ink-1">Đóng tiền quỹ</h3>
                    <button onClick={onClose} className="text-ink-3 hover:text-ink-1">✕</button>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <p className="text-2xs font-semibold tracking-label uppercase text-ink-3 mb-1">Khoản thu</p>
                        <p className="font-serif font-semibold text-lg text-ink-1">{campaign.title}</p>
                        <p className="text-sm text-ink-2 mt-1">Số tiền: <span className="font-bold text-warm-400">{campaign.amount.toLocaleString('vi-VN')}đ</span></p>
                    </div>

                    {step === 'CHOICE' && (
                        <div className="space-y-3">
                            <button 
                                onClick={() => setStep('QR')}
                                className="w-full btn btn-warm py-4 flex flex-col items-center gap-1"
                            >
                                <span className="text-lg">▣ Quét mã QR</span>
                                <span className="text-2xs opacity-80 uppercase tracking-widest">Tự động xác nhận (Phase 2)</span>
                            </button>
                            <button 
                                onClick={() => setStep('PROOF')}
                                className="w-full btn btn-secondary py-4 flex flex-col items-center gap-1"
                            >
                                <span className="text-lg">◈ Tải minh chứng</span>
                                <span className="text-2xs opacity-80 uppercase tracking-widest">Duyệt thủ công (Phase 1)</span>
                            </button>
                        </div>
                    )}

                    {step === 'QR' && (
                        <div className="text-center space-y-4">
                            <div className="bg-surface p-4 border border-rule rounded-lg inline-block">
                                <img src={qrUrl} alt="QR Code" className="w-64 h-64 object-contain" />
                            </div>
                            <div className="text-xs text-ink-2">
                                <p>Chủ TK: <strong>{campaign.bankAccount.accountHolder}</strong></p>
                                <p>Số TK: <strong>{campaign.bankAccount.accountNumber}</strong> ({campaign.bankAccount.bankName})</p>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button onClick={() => setStep('CHOICE')} className="btn btn-ghost flex-1">Quay lại</button>
                                <button 
                                    onClick={handleFakeQRSuccess} 
                                    disabled={isSubmitting}
                                    className="btn btn-primary flex-1"
                                >
                                    {isSubmitting ? "Đang xử lý..." : "Giả lập QR Thành công"}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'PROOF' && (
                        <form onSubmit={handleProofSubmit} className="space-y-4">
                            <div className="input-wrap">
                                <label className="input-label">Link ảnh minh chứng / Hóa đơn</label>
                                <div className="input-field">
                                    <input 
                                        type="url" 
                                        required 
                                        placeholder="https://drive.google.com/..." 
                                        value={proofUrl}
                                        onChange={(e) => setProofUrl(e.target.value)}
                                    />
                                </div>
                                <p className="input-helper italic">Dùng link ảnh từ Mezon, Drive, hoặc Imgur...</p>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setStep('CHOICE')} className="btn btn-ghost flex-1">Quay lại</button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="btn btn-warm flex-1"
                                >
                                    {isSubmitting ? "Đang gửi..." : "Gửi minh chứng"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
