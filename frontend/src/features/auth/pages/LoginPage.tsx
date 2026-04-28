import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/app/store';
import { Spinner } from '@/shared/components/Spinner';
import { landingPathFor } from '@/shared/components/RoleRoute';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const u = useAuthStore.getState().user;
      navigate(u ? landingPathFor(u.userType) : '/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Email hoặc mật khẩu không đúng.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          18%       { transform: translateX(-6px); }
          36%       { transform: translateX(6px); }
          54%       { transform: translateX(-4px); }
          72%       { transform: translateX(4px); }
          90%       { transform: translateX(-2px); }
        }
      `}</style>
      {/* Outer wrapper owns animate-fade-up and never changes — prevents animation restart */}
      <div className="w-full max-w-[400px] animate-fade-up">
        <div
          className="card shadow-lg"
          style={shake ? { animation: 'shake 0.45s ease' } : undefined}
        >

        <div className="card-header flex-col items-center py-8 border-none">
          <img src="/icon-192.png" alt="ClassroomHub" className="w-16 h-16 rounded-2xl object-cover mb-4 shadow-sm" />
          <h1 className="text-3xl font-serif font-semibold text-ink-1 tracking-tightest">
            Chào mừng trở lại
          </h1>
          <p className="text-sm text-ink-3 mt-2">Đăng nhập để tiếp tục quản lý lớp học</p>
        </div>

        <form onSubmit={handleSubmit} className="card-body space-y-5 px-8 pb-8 pt-0">
          {error && (
            <div
              className="p-3 rounded text-xs font-medium"
              style={{ background: 'var(--red-fill)', borderColor: 'var(--red-border)', color: 'var(--red-text)', border: '1px solid var(--red-border)' }}
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="input-label">Email</label>
            <div className="input-field">
              <Mail size={16} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="input-label">Mật khẩu</label>
            <div className="input-field">
              <Lock size={16} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="shrink-0 p-0.5 rounded hover:bg-bg-surface-2 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                style={{ color: 'var(--ink-3)' }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-2.5 font-semibold"
          >
            {loading ? <Spinner size={16} className="text-white" /> : 'Đăng nhập'}
          </button>

          <div className="text-center pt-4 border-t border-rule space-y-2">
            <p className="text-sm text-ink-2">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-semibold" style={{ color: 'var(--warm-400)' }}>
                Đăng ký ngay
              </Link>
            </p>
            <p className="text-sm">
              <Link to="/forgot-password" className="text-ink-3 hover:text-ink-1 transition-colors">
                Quên mật khẩu?
              </Link>
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
