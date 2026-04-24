import React, { useState } from "react";
import type { FundCampaign } from "@features/fund/types"

interface CreateCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<FundCampaign, "id" | "classId" | "createdAt">) => Promise<boolean>;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ 
    isOpen, onClose, onSubmit 
}) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        amount: "",
        bankName: "MB Bank",
        accountNumber: "",
        accountHolder: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const success = await onSubmit({
            title: formData.title,
            description: formData.description,
            amount: Number(formData.amount),
            bankAccount: {
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                accountHolder: formData.accountHolder
            },
            status: "OPEN"
        });
        if (success) {
            onClose();
        }
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-ink-1/40 backdrop-blur-sm">
            <div className="bg-surface w-full max-w-lg rounded-xl shadow-xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-rule flex justify-between items-center bg-surface-2">
                    <h3 className="font-serif font-semibold text-xl text-ink-1">Tạo khoản thu mới</h3>
                    <button onClick={onClose} className="text-ink-3 hover:text-ink-1">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                    <div className="input-wrap">
                        <label className="input-label">Tên khoản thu</label>
                        <div className="input-field">
                            <input 
                                required 
                                value={formData.title} 
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                placeholder="VD: Quỹ lớp học kỳ 2" 
                            />
                        </div>
                    </div>

                    <div className="input-wrap">
                        <label className="input-label">Mô tả</label>
                        <div className="input-field">
                            <textarea 
                                value={formData.description} 
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                placeholder="Mục đích sử dụng quỹ..." 
                                className="min-h-[80px]"
                            />
                        </div>
                    </div>

                    <div className="input-wrap">
                        <label className="input-label">Số tiền mỗi thành viên (đ)</label>
                        <div className="input-field">
                            <input 
                                type="number" 
                                required 
                                value={formData.amount} 
                                onChange={e => setFormData({...formData, amount: e.target.value})}
                                placeholder="200000" 
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-rule">
                        <p className="text-2xs font-semibold tracking-label uppercase text-ink-3 mb-4">Thông tin nhận tiền (Để sinh mã QR)</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="input-wrap">
                                <label className="input-label">Ngân hàng</label>
                                <div className="input-field">
                                    <select 
                                        value={formData.bankName} 
                                        onChange={e => setFormData({...formData, bankName: e.target.value})}
                                    >
                                        <option value="MB Bank">MB Bank</option>
                                        <option value="Vietcombank">Vietcombank</option>
                                        <option value="Techcombank">Techcombank</option>
                                        <option value="Agribank">Agribank</option>
                                    </select>
                                </div>
                            </div>
                            <div className="input-wrap">
                                <label className="input-label">Số tài khoản</label>
                                <div className="input-field">
                                    <input 
                                        required 
                                        value={formData.accountNumber} 
                                        onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="input-wrap mt-4">
                            <label className="input-label">Tên chủ tài khoản (Viết hoa không dấu)</label>
                            <div className="input-field">
                                <input 
                                    required 
                                    value={formData.accountHolder} 
                                    onChange={e => setFormData({...formData, accountHolder: e.target.value.toUpperCase()})}
                                    placeholder="NGUYEN VAN A"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex gap-3">
                        <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Hủy</button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="btn btn-warm flex-1"
                        >
                            {isSubmitting ? "Đang tạo..." : "Tạo ngay"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
