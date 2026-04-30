import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
    // Prevent scrolling on body when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop Overlay */}
            <div 
                className="absolute inset-0 bg-ink-1/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Container: Fixed dimensions */}
            <div 
                className="relative flex flex-col w-full max-w-lg h-[80vh] md:h-[600px] bg-paper rounded-xl shadow-xl overflow-hidden transform transition-all"
                role="dialog"
                aria-modal="true"
            >
                {/* Fixed Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-ink-1/10 shrink-0 bg-paper">
                    <div className="text-xl font-heading font-bold text-ink-1 truncate pr-4">
                        {title}
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-ink-1/5 text-ink-1/60 hover:text-ink-1 transition-colors focus:outline-none focus:ring-2 focus:ring-warm-accent shrink-0"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                    {children}
                </div>

                {/* Fixed Footer */}
                {footer && (
                    <div className="p-4 sm:p-5 border-t border-ink-1/10 shrink-0 bg-paper">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
