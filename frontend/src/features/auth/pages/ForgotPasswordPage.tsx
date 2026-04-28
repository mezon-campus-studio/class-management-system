import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { api } from '@/services/api-client';
import { Spinner } from '@/shared/components/Spinner';

type Step = 'email' | 'otp';

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');

  // Step 1
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Step 2
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep('otp');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setEmailError(msg ?? 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setResetError(msg ?? 'Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setResetLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <div className="w-full max-w-[400px] animate-fade-up">
          <div className="card shadow-lg">
            <div className="card-body px-8 py-10 flex flex-col items-center gap-4 text-center">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                style={{ background: 'var(--green-fill)', color: 'var(--green-text)' }}
              >
                ✓
              </div>
              <h2 className="text-xl font-serif font-semibold text-ink-1">Đặt lại mật khẩu thành công</h2>
              <p className="text-sm text-ink-3">Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập ngay bây giờ.</p>
              <Link
                to="/login"
                className="btn btn-primary w-full py-2.5 font-semibold text-center"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] animate-fade-up">
        <div className="card shadow-lg">

          <div className="card-header flex-col items-center py-8 border-none">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-serif font-semibold text-white text-2xl mb-4 shadow-sm"
              style={{ background: 'var(--sidebar-accent)' }}
            >
              {step === 'email' ? <Mail size={22} /> : <KeyRound size={22} />}
            </div>
            <h1 className="text-2xl font-serif font-semibold text-ink-1 tracking-tightest">
              {step === 'email' ? 'Quên mật khẩu' : 'Nhập mã xác thực'}
            </h1>
            <p className="text-sm text-ink-3 mt-2 text-center">
              {step === 'email'
                ? 'Nhập email để nhận mã OTP đặt lại mật khẩu'
                : `Mã OTP đã được gửi đến ${email}`}
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="card-body space-y-5 px-8 pb-8 pt-0">
              {emailError && (
                <div
                  className="p-3 rounded text-xs font-medium"
                  style={{ background: 'var(--red-fill)', border: '1px solid var(--red-border)', color: 'var(--red-text)' }}
                >
                  {emailError}
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
              <button
                type="submit"
                disabled={emailLoading}
                className="btn btn-primary w-full py-2.5 font-semibold"
              >
                {emailLoading ? <Spinner size={16} className="text-white" /> : 'Gửi mã OTP'}
              </button>
              <div className="text-center pt-4 border-t border-rule">
                <Link to="/login" className="text-sm text-ink-3 flex items-center justify-center gap-1.5 hover:text-ink-1 transition-colors">
                  <ArrowLeft size={14} />
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="card-body space-y-5 px-8 pb-8 pt-0">
              {resetError && (
                <div
                  className="p-3 rounded text-xs font-medium"
                  style={{ background: 'var(--red-fill)', border: '1px solid var(--red-border)', color: 'var(--red-text)' }}
                >
                  {resetError}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="input-label">Mã OTP (6 chữ số)</label>
                <div className="input-field">
                  <KeyRound size={16} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="input-label">Mật khẩu mới</label>
                <div className="input-field">
                  <Lock size={16} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tối thiểu 8 ký tự"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
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
                disabled={resetLoading || otp.length !== 6 || newPassword.length < 8}
                className="btn btn-primary w-full py-2.5 font-semibold"
              >
                {resetLoading ? <Spinner size={16} className="text-white" /> : 'Đặt lại mật khẩu'}
              </button>
              <div className="text-center pt-4 border-t border-rule">
                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtp(''); setNewPassword(''); setResetError(''); }}
                  className="text-sm text-ink-3 flex items-center justify-center gap-1.5 hover:text-ink-1 transition-colors w-full"
                >
                  <ArrowLeft size={14} />
                  Gửi lại mã
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
