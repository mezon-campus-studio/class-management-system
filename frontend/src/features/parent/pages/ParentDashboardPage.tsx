import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Plus, Trash2, KeyRound } from 'lucide-react';
import { parentApi, type LinkedStudent, type ChildClassroom } from '../api';

const RELATIONSHIP_LABEL: Record<string, string> = {
  FATHER: 'Bố',
  MOTHER: 'Mẹ',
  GUARDIAN: 'Người giám hộ',
};

export function ParentDashboardPage() {
  const [children, setChildren] = useState<LinkedStudent[]>([]);
  const [classrooms, setClassrooms] = useState<ChildClassroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLink, setShowLink] = useState(false);
  const [linkForm, setLinkForm] = useState({ studentCode: '', relationship: 'FATHER' });
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState('');

  const reload = async () => {
    setLoading(true);
    try {
      const [c, r] = await Promise.all([parentApi.listChildren(), parentApi.listChildClassrooms()]);
      setChildren(c);
      setClassrooms(r);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const handleLink = async () => {
    if (!linkForm.studentCode.trim()) return;
    setLinking(true); setError('');
    try {
      await parentApi.linkStudent(linkForm.studentCode.trim().toUpperCase(), linkForm.relationship);
      setShowLink(false);
      setLinkForm({ studentCode: '', relationship: 'FATHER' });
      await reload();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Không thể liên kết. Kiểm tra lại mã học sinh.');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async (linkId: string) => {
    if (!confirm('Hủy liên kết với học sinh này?')) return;
    await parentApi.unlinkStudent(linkId);
    await reload();
  };

  if (loading) return <div className="text-center py-20 text-ink-3">Đang tải...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-semibold text-ink-1 mb-1">Cổng Phụ huynh</h1>
        <p className="text-sm text-ink-3">Theo dõi tình hình học tập của con em qua các lớp đang tham gia.</p>
      </div>

      {/* Children */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-semibold text-ink-1">Con của tôi</h2>
          <button onClick={() => setShowLink((v) => !v)} className="btn btn-secondary btn-sm gap-1.5">
            <Plus size={14} /> Liên kết thêm
          </button>
        </div>

        {showLink && (
          <div className="card card-body mb-4 space-y-3">
            {error && (
              <div className="p-2 rounded text-xs"
                   style={{ background: 'var(--red-fill)', color: 'var(--red-text)' }}>{error}</div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="input-field flex-1">
                <KeyRound size={14} style={{ color: 'var(--ink-3)' }} />
                <input
                  placeholder="Mã học sinh (VD: STU-A4B9C2)"
                  value={linkForm.studentCode}
                  onChange={(e) => setLinkForm((p) => ({ ...p, studentCode: e.target.value.toUpperCase() }))}
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
              </div>
              <select value={linkForm.relationship}
                      onChange={(e) => setLinkForm((p) => ({ ...p, relationship: e.target.value }))}
                      className="input-field bg-transparent">
                <option value="FATHER">Bố</option>
                <option value="MOTHER">Mẹ</option>
                <option value="GUARDIAN">Người giám hộ</option>
              </select>
              <button onClick={handleLink} disabled={linking || !linkForm.studentCode.trim()}
                      className="btn btn-primary btn-sm">
                {linking ? 'Đang liên kết...' : 'Liên kết'}
              </button>
            </div>
          </div>
        )}

        {children.length === 0 ? (
          <div className="card card-body text-center py-10 text-ink-3">
            <GraduationCap size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Chưa có con nào được liên kết.</p>
            <p className="text-xs mt-1">Nhấn "Liên kết thêm" và nhập mã học sinh để bắt đầu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {children.map((c) => (
              <div key={c.linkId} className="card card-body flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                     style={{ background: 'var(--sidebar-accent)' }}>
                  {c.studentName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-1 truncate">{c.studentName}</p>
                  <p className="text-xs text-ink-3 truncate">
                    {c.studentCode} · {RELATIONSHIP_LABEL[c.relationship ?? ''] ?? 'Phụ huynh'}
                  </p>
                </div>
                <button onClick={() => handleUnlink(c.linkId)}
                        className="btn btn-ghost btn-icon" title="Hủy liên kết"
                        style={{ color: 'var(--red-text)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Classrooms */}
      <section>
        <h2 className="text-xl font-serif font-semibold text-ink-1 mb-4">Lớp học của con</h2>
        {classrooms.length === 0 ? (
          <div className="card card-body text-center py-10 text-ink-3">
            <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Chưa có lớp nào.</p>
            <p className="text-xs mt-1">
              Lớp sẽ tự động hiện ở đây khi con bạn tham gia một lớp học.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {classrooms.map((c) => (
              <Link
                key={`${c.classroomId}-${c.studentId}`}
                to={`/parent/classrooms/${c.classroomId}?studentId=${c.studentId}`}
                className="card card-body hover:shadow-md transition-shadow flex flex-col gap-2"
              >
                <div className="h-20 rounded-md -m-5 mb-2"
                     style={{ background: 'linear-gradient(135deg, var(--sidebar-bg) 0%, #3D2C24 100%)' }} />
                <p className="font-semibold text-ink-1 truncate">{c.classroomName}</p>
                <p className="text-xs text-ink-3">
                  Con: <span className="font-medium text-ink-2">{c.studentName}</span>
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
