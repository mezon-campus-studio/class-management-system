import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useFund } from "../hooks/useFund";
import { PaymentModal } from "../components/PaymentModal";
import { AdminApprovalModal } from "../components/AdminApprovalModal";
import { CreateCampaignModal } from "../components/CreateCampaignModal";
import { useAuth } from "@features/auth";
import type { FundCampaign } from "../types";
import type { ID } from "@shared/utils/common";

export const FundPage: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const { 
        overview, campaigns, isLoading, error, 
        createCampaign, submitProof, verifyTransaction, handleQRSuccess 
    } = useFund(Number(classId));
    const { user } = useAuth();

    // Giả lập phân quyền Admin: Cho phép hiện mọi nút để test.
    const isAdmin = true; 

    const [selectedCampaign, setSelectedCampaign] = useState<FundCampaign | null>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isApprovalOpen, setIsApprovalOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [activeCampaignId, setActiveCampaignId] = useState<ID | null>(null);

    const handleOpenPayment = (campaign: FundCampaign) => {
        setSelectedCampaign(campaign);
        setIsPaymentOpen(true);
    };

    const handleOpenApproval = (campaignId: ID) => {
        setActiveCampaignId(campaignId);
        setIsApprovalOpen(true);
    };

    if (isLoading && !overview) {
        return <div className="p-10 text-center animate-pulse">Đang tải thông tin quỹ...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card">
                    <div className="stat-label">Số dư hiện tại</div>
                    <div className="stat-value text-warm-400">
                        {overview?.balance.toLocaleString('vi-VN')}đ
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Tổng thu</div>
                    <div className="stat-value text-green-text text-2xl">
                        {overview?.totalCollected.toLocaleString('vi-VN')}đ
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Tổng chi</div>
                    <div className="stat-value text-ink-3 text-2xl">
                        {overview?.totalSpent.toLocaleString('vi-VN')}đ
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <h2 className="card-title">Các khoản thu đang mở</h2>
                        <p className="card-subtitle">Đóng góp để duy trì hoạt động lớp</p>
                    </div>
                    {isAdmin && (
                        <button onClick={() => setIsCreateOpen(true)} className="btn btn-warm btn-sm">
                            + Tạo khoản thu
                        </button>
                    )}
                </div>
                <div className="card-body p-0">
                    {campaigns.length === 0 ? (
                        <div className="p-10 text-center text-ink-3">Chưa có khoản thu nào.</div>
                    ) : (
                        <div className="divide-y divide-rule">
                            {campaigns.map(c => (
                                <div key={c.id} className="p-6 flex flex-col md:flex-row justify-between gap-4 hover:bg-surface-2 transition-colors">
                                    <div className="space-y-2">
                                        <h4 className="font-serif font-semibold text-lg text-ink-1">{c.title}</h4>
                                        <p className="text-sm text-ink-2 max-w-xl">{c.description}</p>
                                        <div className="flex items-center gap-4 text-xs font-mono text-ink-3">
                                            <span>Mục tiêu: {c.amount.toLocaleString('vi-VN')}đ / người</span>
                                            <span>Ngày tạo: {new Date(c.createdAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isAdmin && (
                                            <button 
                                                onClick={() => handleOpenApproval(c.id)}
                                                className="btn btn-secondary btn-sm"
                                            >
                                                Duyệt (Phase 1)
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleOpenPayment(c)}
                                            className="btn btn-primary"
                                        >
                                            Đóng tiền
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {selectedCampaign && (
                <PaymentModal 
                    isOpen={isPaymentOpen}
                    onClose={() => setIsPaymentOpen(false)}
                    campaign={selectedCampaign}
                    onQRSuccess={(amount) => handleQRSuccess(selectedCampaign.id, user?.id || 999, user?.displayName || "User", amount)}
                    onSubmitProof={(imageUrl) => submitProof(102, imageUrl)} // Mock ID giao dịch
                />
            )}

            {activeCampaignId && (
                <AdminApprovalModal 
                    isOpen={isApprovalOpen}
                    onClose={() => setIsApprovalOpen(false)}
                    campaignId={activeCampaignId}
                    onVerify={verifyTransaction}
                />
            )}

            <CreateCampaignModal 
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={createCampaign}
            />
        </div>
    );
};
