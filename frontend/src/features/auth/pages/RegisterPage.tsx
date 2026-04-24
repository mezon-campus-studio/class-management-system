import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthInternal } from '@features/auth/hooks/useAuthInternal';
import { User, AtSign } from 'lucide-react';

export const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        displayName: '',
        password: ''
    });
    const { signup, isLoading, error } = useAuthInternal();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.username.trim() || !formData.displayName.trim()) return;
        
        const success = await signup(formData.username, formData.password, formData.displayName);
        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-6">
            <div className="card w-full max-w-[440px] shadow-sm animate-fade-up">
                <div className="card-header flex-col items-center py-10 border-none">
                    <h1 className="text-3xl font-serif font-semibold text-ink-1 tracking-tightest">
                        Tạo tài khoản
                    </h1>
                    <p className="text-sm text-ink-3 mt-2 font-sans">
                        Bắt đầu hành trình giáo dục hiện đại cùng EduAdmin
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="card-body space-y-5 px-8 pb-10 pt-0">
                    {error && (
                        <div className="p-3 bg-ink-red-fill border border-ink-red-border rounded text-ink-red-text text-xs font-medium animate-pulse-dot">
                            {error}
                        </div>
                    )}

                    <div className="input-wrap flex flex-col gap-1.5">
                        <label className="input-label">Họ và tên</label>
                        <div className="input-field">
                            <User size={16} className="text-ink-3" />
                            <input
                                type="text"
                                placeholder="Ví dụ: Nguyễn Văn An"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                required
                                className="focus:outline-none w-full bg-transparent text-ink-1"
                            />
                        </div>
                    </div>

                    <div className="input-wrap flex flex-col gap-1.5">
                        <label className="input-label">Tên đăng nhập</label>
                        <div className="input-field">
                            <AtSign size={16} className="text-ink-3" />
                            <input
                                type="text"
                                placeholder="Ví dụ: nva_2024"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                className="focus:outline-none w-full bg-transparent text-ink-1"
                            />
                        </div>
                    </div>

                    <div className="input-wrap flex flex-col gap-1.5">
                        <label className="input-label">Mật khẩu</label>
                        <div className="input-field">
                            <AtSign size={16} className="text-ink-3" />
                            <input
                                type="password"
                                placeholder="zxhb102_"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="focus:outline-none w-full bg-transparent text-ink-1"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`btn btn-primary w-full py-2.5 font-semibold transition-base mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
                    </button>

                    <div className="text-center pt-6 border-t border-rule">
                        <p className="text-sm text-ink-2">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="text-warm-400 font-semibold hover:text-warm-600 transition-colors">
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};
