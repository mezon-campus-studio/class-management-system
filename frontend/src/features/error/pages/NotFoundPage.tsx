import React from "react";
import { useNavigate } from "react-router-dom";

export const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-8 animate-fade-up">
                {/* 404 Visual */}
                <div className="relative">
                    <h1 className="text-[12rem] font-serif font-bold text-surface-3 leading-none select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-warm-50 px-6 py-2 rounded-full border border-warm-100 shadow-sm">
                            <span className="text-warm-600 font-bold font-mono tracking-widest uppercase text-xs">
                                Page Not Found
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                    <h2 className="text-3xl font-serif font-bold text-ink-1 tracking-tight">
                        Trang này không tồn tại
                    </h2>
                    <p className="text-ink-2 font-sans leading-relaxed">
                        Có vẻ như đường dẫn bạn đang truy cập đã bị thay đổi hoặc không còn tồn tại trong hệ thống EduAdmin.
                    </p>
                </div>

                {/* Actions */}
                <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-secondary px-8 font-bold"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Quay lại
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="btn btn-warm px-8 font-bold shadow-lg shadow-warm-400/20"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Trang chủ
                    </button>
                </div>

                {/* Footer Decor */}
                <div className="pt-12">
                    <div className="h-px bg-rule max-w-[60px] mx-auto" />
                    <p className="mt-6 text-[10px] font-bold text-ink-3 uppercase tracking-[0.2em] font-sans">
                        EduAdmin &copy; 2026 — J97CLUB
                    </p>
                </div>
            </div>
        </div>
    );
};
