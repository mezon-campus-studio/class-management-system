import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { User } from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    const success = await login({ username });
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="card w-full max-w-[400px] shadow-lg animate-fade-up">
        <div className="card-header flex-col items-center py-8 border-none">
          <div className="w-12 h-12 rounded-xl bg-sidebar-accent flex items-center justify-center font-serif font-semibold text-white text-2xl mb-4 shadow-sm">
            E
          </div>
          <h1 className="text-3xl font-serif font-semibold text-ink-1 tracking-tightest">
            Chào mừng trở lại
          </h1>
          <p className="text-sm text-ink-3 mt-2">
            Đăng nhập để tiếp tục quản lý lớp học
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-body space-y-5 px-8 pb-8 pt-0">
          {error && (
            <div className="p-3 bg-red-fill border border-red-border rounded text-red-text text-xs font-medium">
              {error}
            </div>
          )}

          <div className="input-wrap flex flex-col gap-1.5">
            <label className="input-label">Tên đăng nhập</label>
            <div className="input-field">
              <User size={16} className="text-ink-3" />
              <input
                type="text"
                placeholder="Ví dụ: nva_2024"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="focus:outline-none"
              />
            </div>
            <span className="input-helper">Nhập username của bạn</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`btn btn-primary w-full py-2.5 font-semibold ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>

          <div className="text-center pt-4 border-t border-rule">
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
