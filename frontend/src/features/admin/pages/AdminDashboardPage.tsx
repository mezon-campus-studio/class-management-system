import { useEffect, useState } from 'react';
import { Users, GraduationCap, Briefcase, Heart, Shield, BookOpen, Activity, Link2 } from 'lucide-react';
import { adminApi, type AdminMetrics } from '../api';

const STATS = [
  { key: 'totalUsers',       label: 'Tổng người dùng',  icon: Users },
  { key: 'totalStudents',    label: 'Học sinh',         icon: GraduationCap },
  { key: 'totalTeachers',    label: 'Giáo viên',        icon: Briefcase },
  { key: 'totalParents',     label: 'Phụ huynh',        icon: Heart },
  { key: 'totalAdmins',      label: 'Admin',            icon: Shield },
  { key: 'totalClassrooms',  label: 'Tổng lớp',         icon: BookOpen },
  { key: 'activeClassrooms', label: 'Lớp đang hoạt động', icon: Activity },
  { key: 'totalParentLinks', label: 'Liên kết PH↔HS',   icon: Link2 },
] as const;

export function AdminDashboardPage() {
  const [m, setM] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.metrics().then(setM).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-serif font-semibold text-ink-1 mb-1">Tổng quan hệ thống</h1>
      <p className="text-sm text-ink-3 mb-8">Số liệu tổng hợp toàn bộ ClassroomHub.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {STATS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="card card-body">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} style={{ color: 'var(--sidebar-accent)' }} />
              <p className="text-xs text-ink-3">{label}</p>
            </div>
            <p className="text-2xl font-semibold text-ink-1">
              {loading ? '—' : (m?.[key] ?? 0).toLocaleString('vi-VN')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
