import React, { useState, useMemo, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useLeave } from "../hooks/useLeave";
import { LeaveFormModal } from "../components/LeaveFormModal";
import type { LeaveStatus, LeaveRequest } from "../types";

const STATUS_LABELS: Record<LeaveStatus | "ALL", string> = {
    ALL: "Tất cả đơn",
    PENDING: "Đang chờ duyệt",
    APPROVED: "Đã phê duyệt",
    REJECTED: "Đã từ chối",
};

// --- Sub-components ---

/**
 * Item hiển thị thông tin một đơn xin nghỉ
 */
const LeaveItem: React.FC<{ leave: LeaveRequest; statusLabel: string }> = ({ leave, statusLabel }) => {
    const getStatusStyles = (status: LeaveStatus) => {
        switch (status) {
            case "PENDING": return "pill-amber";
            case "APPROVED": return "pill-green";
            case "REJECTED": return "pill-red";
            default: return "pill-blue";
        }
    };

    return (
        <div className="card group hover:border-warm-200 transition-all duration-300">
            <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-4">
                        <span className={`pill ${getStatusStyles(leave.status)}`}>
                            <span className="pill-dot" />
                            {statusLabel}
                        </span>
                        <span className="text-xs font-mono text-ink-3">
                            {new Date(leave.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <h4 className="text-lg font-serif font-bold text-ink-1 leading-snug group-hover:text-warm-600 transition-colors">
                        {leave.reason}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-ink-2 font-sans">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-surface-2 rounded-lg text-ink-3">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-ink-1 font-medium">
                                    {new Date(leave.fromDate).toLocaleDateString('vi-VN')} 
                                    <span className="mx-2 text-ink-4">→</span>
                                    {new Date(leave.toDate).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        </div>
                        
                        {leave.proofUrl && (
                            <a 
                                href={leave.proofUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-ghost btn-sm text-ink-blue-text font-bold px-0 hover:bg-transparent"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                Xem minh chứng
                            </a>
                        )}
                    </div>
                </div>
                <div className="md:text-right flex flex-row md:flex-col items-center md:items-end gap-3 border-t md:border-t-0 md:border-l border-rule pt-4 md:pt-0 md:pl-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-ink-3 uppercase tracking-widest mb-1">Người gửi</span>
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-ink-1 font-serif text-sm">{leave.userName}</span>
                            <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-ink-2 font-bold text-xs border border-white shadow-sm">
                                {leave.userName.charAt(0)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Danh sách hiển thị chính (bao gồm các trạng thái loading, trống)
 */
const LeaveList: React.FC<{ 
    leaves: LeaveRequest[]; 
    isLoading: boolean;
    onOpenModal: () => void;
}> = ({ leaves, isLoading, onOpenModal }) => {
    if (isLoading) {
        return (
            <div className="grid gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 skeleton rounded-xl border border-rule" />
                ))}
            </div>
        );
    }

    if (leaves.length === 0) {
        return (
            <div className="py-20 text-center space-y-5 bg-surface-2/50 rounded-2xl border-2 border-rule border-dashed">
                <div className="w-20 h-20 bg-surface-3 rounded-full flex items-center justify-center mx-auto text-ink-4">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <div className="space-y-1">
                    <p className="text-lg font-serif font-bold text-ink-1">Không tìm thấy đơn nào</p>
                    <p className="text-sm text-ink-3">Danh sách hiện đang trống.</p>
                </div>
                <button onClick={onOpenModal} className="btn btn-warm btn-sm font-bold">
                    Gửi đơn mới ngay
                </button>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {leaves.map((leave) => (
                <LeaveItem 
                    key={leave.id} 
                    leave={leave} 
                    statusLabel={STATUS_LABELS[leave.status]} 
                />
            ))}
        </div>
    );
};

// --- Main Page ---

export const LeavePage: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const { leaves, isLoading, isSubmitting, error, submitLeave, fetchLeaves } = useLeave(Number(classId));
    
    const [activeTab, setActiveTab] = useState<LeaveStatus | "ALL">("ALL");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Lọc danh sách theo Tab hiện tại
    const filteredLeaves = useMemo(() => {
        if (activeTab === "ALL") return leaves;
        return leaves.filter(l => l.status === activeTab);
    }, [leaves, activeTab]);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="space-y-6 animate-fade-in pb-24 relative">
            
            {/* Navigation Section */}
            <div className="flex items-center justify-between border-b border-rule pb-1">
                {/* Desktop Tabs */}
                <div className="hidden md:flex items-center gap-1">
                    {(Object.keys(STATUS_LABELS) as Array<LeaveStatus | "ALL">).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                                activeTab === tab
                                    ? "border-warm-400 text-warm-600 bg-warm-50/50"
                                    : "border-transparent text-ink-3 hover:text-ink-1 hover:bg-surface-2"
                            }`}
                        >
                            {STATUS_LABELS[tab]}
                            <span className="ml-2 text-[10px] text-ink-3 font-mono">
                                ({leaves.filter(l => tab === "ALL" || l.status === tab).length})
                            </span>
                        </button>
                    ))}
                </div>

                {/* Mobile Dropdown */}
                <div className="md:hidden relative w-full" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center justify-between px-4 py-4 bg-surface border border-rule rounded-xl text-ink-1 font-bold shadow-sm"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm">{STATUS_LABELS[activeTab]}</span>
                            <span className="text-[10px] text-ink-3 font-mono">
                                ({filteredLeaves.length})
                            </span>
                        </div>
                        <svg className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-rule rounded-xl shadow-xl z-dropdown overflow-hidden animate-scale-in">
                            {(Object.keys(STATUS_LABELS) as Array<LeaveStatus | "ALL">).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-5 py-4 text-sm font-medium transition-colors border-b last:border-0 border-rule/50 ${
                                        activeTab === tab ? "bg-warm-50 text-warm-600 font-bold" : "text-ink-2 hover:bg-surface-2"
                                    }`}
                                >
                                    {STATUS_LABELS[tab]}
                                    <span className="ml-2 opacity-50 font-mono">({leaves.filter(l => tab === "ALL" || l.status === tab).length})</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-ink-red-fill border border-ink-red-border text-ink-red-text rounded-lg text-sm flex items-center gap-3 animate-fade-up">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </div>
            )}

            {/* Content List */}
            <LeaveList 
                leaves={filteredLeaves} 
                isLoading={isLoading} 
                onOpenModal={() => setIsModalOpen(true)} 
            />

            {/* Modal */}
            <LeaveFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={submitLeave}
                isSubmitting={isSubmitting}
            />

            {/* Fixed Action Buttons (Corner) */}
            <div className="fixed bottom-8 right-6 md:right-10 flex flex-col gap-4 z-raised items-end">
                {/* Refresh Button */}
                <button 
                    onClick={fetchLeaves}
                    className="w-12 h-12 bg-surface text-ink-1 border border-rule shadow-lg rounded-full flex items-center justify-center hover:text-warm-600 transition-all hover:rotate-180 active:scale-90"
                    title="Tải lại dữ liệu"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>

                {/* Create Button (FAB) */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-warm btn-lg h-14 px-6 rounded-full shadow-2xl shadow-warm-400/40 active:scale-95 flex items-center gap-2 group"
                >
                    <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="font-bold">Xin nghỉ phép</span>
                </button>
            </div>
        </div>
    );
};
