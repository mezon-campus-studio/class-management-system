import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, GraduationCap, Briefcase, Users, KeyRound } from 'lucide-react';
import { useAuthStore, type UserType } from '@/app/store';
import { Spinner } from '@/shared/components/Spinner';
import { landingPathFor } from '@/shared/components/RoleRoute';

type Tab = Exclude<UserType, 'SYSTEM_ADMIN'>;

const TABS: { value: Tab; label: string; icon: typeof User; hint: string }[] = [
  { value: 'STUDENT', label: 'Học sinh',  icon: GraduationCap, hint: 'Tham gia lớp học bằng mã mời, theo dõi điểm danh, thi đua, sự kiện.' },
  { value: 'TEACHER', label: 'Giáo viên', icon: Briefcase,     hint: 'Tạo và quản lý lớp học, điểm danh, thi đua, quỹ lớp.' },
  { value: 'PARENT',  label: 'Phụ huynh', icon: Users,         hint: 'Theo dõi tình hình con em qua mã học sinh.' },
];

export function RegisterPage() {
  const [tab, setTab] = useState<Tab>('STUDENT');
  const [form, setForm] = useState({
    email: '', password: '', displayName: '',
    studentCode: '', relationship: 'FATHER',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (tab === 'PARENT' && !form.studentCode.trim()) {
      setError('Vui lòng nhập mã học sinh của con bạn.');
      return;
    }
    setLoading(true);
    try {
      await register(form.email, form.password, form.displayName, tab,
        tab === 'PARENT'
          ? { studentCode: form.studentCode.trim().toUpperCase(), relationship: form.relationship }
          : undefined);
      const u = useAuthStore.getState().user;
      navigate(u ? landingPathFor(u.userType) : '/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const activeHint = TABS.find((t) => t.value === tab)!.hint;

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="card w-full max-w-[460px] shadow-lg animate-fade-up">
        <div className="card-header flex-col items-center py-6 border-none">
          <h1 className="text-3xl font-serif font-semibold text-ink-1 tracking-tightest">Tạo tài khoản</h1>
          <p className="text-sm text-ink-3 mt-2">Chọn loại tài khoản phù hợp với bạn</p>
        </div>

        <div className="px-8">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-surface-2)' }}>
            {TABS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className="flex flex-col items-center gap-1 py-2 px-2 rounded text-xs font-medium transition-all"
                style={{
                  background: tab === value ? 'var(--card)' : 'transparent',
                  color: tab === value ? 'var(--ink-1)' : 'var(--ink-3)',
                  boxShadow: tab === value ? '0 1px 2px rgba(0,0,0,.05)' : 'none',
                }}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-ink-3 mt-2 text-center">{activeHint}</p>
        </div>

        <form onSubmit={handleSubmit} className="card-body space-y-4 px-8 pb-8 pt-4">
          {error && (
            <div className="p-3 rounded text-xs font-medium"
                 style={{ background: 'var(--red-fill)', borderColor: 'var(--red-border)', color: 'var(--red-text)', border: '1px solid' }}>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="input-label">Họ và tên</label>
            <div className="input-field">
              <User size={16} style={{ color: 'var(--ink-3)' }} />
              <input type="text" placeholder="Nguyễn Văn An" value={form.displayName}
                     onChange={set('displayName')} required />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="input-label">Email</label>
            <div className="input-field">
              <Mail size={16} style={{ color: 'var(--ink-3)' }} />
              <input type="email" placeholder="name@example.com" value={form.email}
                     onChange={set('email')} required autoComplete="email" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="input-label">Mật khẩu</label>
            <div className="input-field">
              <Lock size={16} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
              <input type={showPassword ? 'text' : 'password'} placeholder="Tối thiểu 6 ký tự" value={form.password}
                     onChange={set('password')} required minLength={6} autoComplete="new-password" />
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

          {tab === 'PARENT' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="input-label">Mã học sinh của con</label>
                <div className="input-field">
                  <KeyRound size={16} style={{ color: 'var(--ink-3)' }} />
                  <input type="text" placeholder="VD: STU-A4B9C2" value={form.studentCode}
                         onChange={(e) => setForm((p) => ({ ...p, studentCode: e.target.value.toUpperCase() }))}
                         required style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                </div>
                <p className="text-[11px] text-ink-3">
                  Mã hiển thị trong trang cá nhân của con bạn. Hỏi con để lấy mã này.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="input-label">Quan hệ</label>
                <div className="input-field">
                  <Users size={16} style={{ color: 'var(--ink-3)' }} />
                  <select value={form.relationship} onChange={set('relationship')}
                          className="flex-1 bg-transparent border-none outline-none py-2 text-ink-1">
                    <option value="FATHER">Bố</option>
                    <option value="MOTHER">Mẹ</option>
                    <option value="GUARDIAN">Người giám hộ khác</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5 font-semibold mt-2">
            {loading ? <Spinner size={16} className="text-white" /> : 'Đăng ký tài khoản'}
          </button>

          <div className="text-center pt-4 border-t border-rule">
            <p className="text-sm text-ink-2">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-semibold" style={{ color: 'var(--warm-400)' }}>
                Đăng nhập
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
