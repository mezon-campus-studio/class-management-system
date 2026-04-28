import React, { useState } from 'react';
import type { ClassItems } from '@features/home/types';
import { useHome } from '@features/home/hooks/useHome';

interface JoinClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const JoinClassModal = ({ isOpen, onClose, onSuccess }: JoinClassModalProps) => {
    const {joinClassMutation} = useHome(); //lay ham join class tuwf useHome
    const [step, setStep] = useState<'INPUT' | 'PENDING' | 'SUCCESS'>('INPUT');
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [foundClass] = useState<ClassItems | null>(null);

    if (!isOpen) return null;

    const handleClose = () => {
        setTimeout(() => {
            setStep('INPUT');
            setCode("");
            setError("");
        }, 300);
        onClose();
    }

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setError("");

        try {
            await joinClassMutation(code);
            setStep('SUCCESS');
            setTimeout(() => { onSuccess(); handleClose(); }, 1500);

        } catch (err: any) {
            setError(err.message || "Lỗi: Không thể tham gia lớp lúc này");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-surface rounded-2xl p-6 w-full max-w-[380px] shadow-2xl animate-in fade-in zoom-in duration-200">
                
                {step === 'INPUT' && (
                    <>
                        <h2 className="text-xl font-black text-ink-1 mb-2">Tham gia lớp học</h2>
                        <p className="text-sm text-ink-2 mb-6">Nhập mã lớp học để tham gia ngay.</p>
                        <form onSubmit={handleJoin} className="space-y-4">
                            <input 
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="MÃ LỚP (VÍ DỤ: DOTNET123)"
                                className="w-full border-2 border-rule rounded-xl p-4 focus:border-ink-blue-text outline-none font-bold text-lg text-center tracking-widest"
                                autoFocus
                            />
                            {error && <p className="text-ink-red-text text-xs font-bold italic">⚠️ {error}</p>}
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={onClose} className="flex-1 py-3 text-ink-2 font-bold hover:bg-surface-2 rounded-xl">Hủy</button>
                                <button type="submit" disabled={loading} className="flex-[2] py-3 bg-ink-blue-text text-white font-bold rounded-xl shadow-lg disabled:opacity-50">
                                    {loading ? "ĐANG KIỂM TRA..." : "THAM GIA"}
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {step === 'PENDING' && (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-ink-amber-fill text-ink-amber-text rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⏳</div>
                        <h2 className="text-xl font-bold text-ink-1 mb-2">Đã gửi yêu cầu</h2>
                        <p className="text-sm text-ink-2 mb-6">Bạn đã yêu cầu tham gia lớp <b>{foundClass?.name}</b>. Vui lòng chờ duyệt.</p>
                        <button onClick={onClose} className="w-full py-3 bg-ink-1 text-white font-bold rounded-xl">Đóng</button>
                    </div>
                )}

                {step === 'SUCCESS' && (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-ink-green-fill text-ink-green-text rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✅</div>
                        <h2 className="text-xl font-bold text-ink-1 mb-2">Thành công!</h2>
                        <p className="text-sm text-ink-2">Bạn đã tham gia lớp <b>{foundClass?.name}</b>.</p>
                    </div>
                )}
            </div>
        </div>
    );
};