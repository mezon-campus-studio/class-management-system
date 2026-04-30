import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthInternal } from '@features/auth/hooks/useAuthInternal';
import { User, Lock, Home } from 'lucide-react';
import { GoogleIcon, MezonIcon } from '@shared/components/icons';
import { BASE_URL } from '@services/api-client';

export const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error } = useAuthInternal();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;
        
        const success = await login({ username, password });
        if (success) {
            navigate('/');
        }
    };

    const handleGoogleLogin = () => {
        // Chuyển hướng trình duyệt tới endpoint của Backend để bắt đầu luồng OAuth2
        window.location.href = `${BASE_URL}/auth/google/signin`;
    };

    return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-6">
            <div className="card w-full max-w-[400px] shadow-sm animate-fade-up">
                <div className="card-header flex-col items-center py-8 border-none">
                    <div className="w-10 h-10 rounded-lg bg-sidebar-accent flex items-center justify-center font-serif font-semibold text-white text-xl mb-5 shadow-sm">
                        E
                    </div>
                    <h1 className="text-3xl font-serif font-semibold text-ink-1 tracking-tightest">
                        Chào mừng trở lại
                    </h1>
                    <p className="text-sm text-ink-3 mt-2 font-sans">
                        Đăng nhập để tiếp tục quản lý lớp học
                    </p>
                </div>

                <div className="px-8 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="btn btn-secondary flex items-center justify-center gap-2 py-2.5"
                        >
                            <span className="text-lg leading-none mt-0.5">
                                <GoogleIcon/>
                            </span>
                            <span className="text-sm font-medium">Google</span>
                        </button>
                        <button className="btn btn-secondary flex items-center justify-center gap-2 py-2.5">
                            <span className="text-lg leading-none mt-0.5">
                                <MezonIcon/>
                            </span>
                            <span className="text-sm font-medium">Mezon</span>
                        </button>
                    </div>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-rule"></div>
                        </div>
                        <div className="relative flex justify-center text-2xs uppercase tracking-label">
                            <span className="bg-surface px-3 text-ink-3 font-semibold">Hoặc tiếp tục với</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="card-body space-y-5 px-8 pb-10 pt-4">
                    {error && (
                        <div className="p-3 bg-ink-red-fill border border-ink-red-border rounded text-ink-red-text text-xs font-medium animate-pulse-dot">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="input-wrap flex flex-col gap-1.5">
                            <label className="input-label">Tên đăng nhập</label>
                            <div className="input-field">
                                <User size={16} className="text-ink-3" />
                                <input
                                    type="text"
                                    placeholder="abc"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="focus:outline-none w-full bg-transparent text-ink-1"
                                />
                            </div>
                        </div>

                        <div className="input-wrap flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                                <label className="input-label">Mật khẩu</label>
                                <button type="button" className="text-2xs font-semibold text-warm-400 hover:text-warm-600 transition-colors uppercase tracking-label">
                                    Quên mật khẩu?
                                </button>
                            </div>
                            <div className="input-field">
                                <Lock size={16} className="text-ink-3" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="focus:outline-none w-full bg-transparent text-ink-1"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`btn btn-primary w-full py-2.5 font-semibold transition-base ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>

                    <div className="text-center pt-6 border-t border-rule">
                        <p className="text-sm text-ink-2">
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="text-warm-400 font-semibold hover:text-warm-600 transition-colors">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};
