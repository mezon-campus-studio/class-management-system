import React, { useState, useEffect } from "react";
import type { ID } from "@shared/utils/common";
import type { FundStatus, FundTransaction } from "@features/fund/types";
import { fundAPI } from "@features/fund/api";

interface AdminApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaignId: ID;
    onVerify: (transactionId: ID, status: FundStatus) => Promise<boolean>;
}

export const AdminApprovalModal: React.FC<AdminApprovalModalProps> = ({ 
    isOpen, onClose, campaignId, onVerify 
}) => {
    const [transactions, setTransactions] = useState<FundTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && campaignId) {
            loadTransactions();
        }
    }, [isOpen, campaignId]);

    const loadTransactions = async () => {
        setIsLoading(true);
        const res = await fundAPI.getTransactions(campaignId);
        if (res.success) {
            setTransactions(res.data.filter(t => t.status === "PENDING"));
        }
        setIsLoading(false);
    };

    const handleVerify = async (id: ID, status: FundStatus) => {
        const success = await onVerify(id, status);
        if (success) {
            setTransactions(prev => prev.filter(t => t.id !== id));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-ink-1/40 backdrop-blur-sm">
            <div className="bg-surface w-full max-w-2xl rounded-xl shadow-xl overflow-hidden animate-scale-in max-h-[80vh] flex flex-col">
                <div className="px-6 py-4 border-b border-rule flex justify-between items-center bg-surface-2">
                    <h3 className="font-serif font-semibold text-xl text-ink-1">Duyệt giao dịch</h3>
                    <button onClick={onClose} className="text-ink-3 hover:text-ink-1">✕</button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => <div key={i} className="skeleton h-24 w-full rounded-lg" />)}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-10 text-ink-3 italic">Không có giao dịch nào đang chờ duyệt.</div>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map(t => (
                                <div key={t.id} className="p-4 border border-rule rounded-lg bg-surface-2 flex items-start gap-4">
                                    <div className="flex-1 space-y-1">
                                        <p className="font-bold text-ink-1">{t.userName}</p>
                                        <p className="text-sm text-ink-2">Số tiền: {t.amount.toLocaleString('vi-VN')}đ</p>
                                        <p className="text-xs text-ink-3">Ngày gửi: {new Date(t.createdAt).toLocaleDateString('vi-VN')}</p>
                                        {t.proofUrl && (
                                            <a 
                                                href={t.proofUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-block mt-2 text-xs font-bold text-warm-400 hover:underline"
                                            >
                                                [ Xem minh chứng ↗ ]
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button 
                                            onClick={() => handleVerify(t.id, "APPROVED")}
                                            className="btn btn-primary btn-sm"
                                        >
                                            Chấp nhận
                                        </button>
                                        <button 
                                            onClick={() => handleVerify(t.id, "REJECTED")}
                                            className="btn btn-danger btn-sm"
                                        >
                                            Từ chối
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
