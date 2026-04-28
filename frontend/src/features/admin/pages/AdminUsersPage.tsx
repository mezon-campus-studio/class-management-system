import { useEffect, useState } from 'react';
import { Search, Lock, Unlock } from 'lucide-react';
import { adminApi, type AdminUser, type UserStatus } from '../api';
import { Badge } from '@/shared/components/Badge';
import { PaginationBar } from '@/shared/components/PaginationBar';
import type { UserType } from '@/app/store';

const TYPE_LABEL: Record<UserType, string> = {
  STUDENT: 'Học sinh',
  TEACHER: 'Giáo viên',
  PARENT: 'Phụ huynh',
  SYSTEM_ADMIN: 'Admin',
};

const TYPE_VARIANT: Record<UserType, 'blue' | 'amber' | 'sage' | 'warm'> = {
  STUDENT: 'blue',
  TEACHER: 'amber',
  PARENT: 'sage',
  SYSTEM_ADMIN: 'warm',
};

const STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Tạm khóa',
  BANNED: 'Cấm',
};

const PAGE_SIZE = 20;

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [q, setQ] = useState('');
  const [filterType, setFilterType] = useState<UserType | ''>('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const reload = async (p = page) => {
    setLoading(true);
    try {
      const res = await adminApi.listUsers(q || undefined, filterType || undefined, p, PAGE_SIZE);
      setUsers(res.content ?? []);
      setPage(res.number ?? 0);
      setTotalPages(res.totalPages ?? 0);
      setTotalElements(res.totalElements ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload(0);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [filterType]);

  const handleSearch = () => {
    setPage(0);
    reload(0);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    reload(p);
  };

  const handleToggleStatus = async (u: AdminUser) => {
    const next: UserStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminApi.setUserStatus(u.id, next);
      reload(page);
    } catch (e: unknown) {
      alert((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Có lỗi');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-serif font-semibold text-ink-1 mb-6">Người dùng</h1>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="input-field flex-1 max-w-md">
          <Search size={14} style={{ color: 'var(--ink-3)' }} />
          <input
            placeholder="Tìm theo email, tên, mã học sinh..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value as UserType | ''); setPage(0); }}
          className="input-field bg-transparent"
        >
          <option value="">Tất cả vai trò</option>
          <option value="STUDENT">Học sinh</option>
          <option value="TEACHER">Giáo viên</option>
          <option value="PARENT">Phụ huynh</option>
          <option value="SYSTEM_ADMIN">Admin</option>
        </select>
        <button onClick={handleSearch} className="btn btn-primary btn-sm">Tìm</button>
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Mã HS</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="text-center py-6 text-ink-3">Đang tải...</td></tr>
            )}
            {!loading && users.length === 0 && (
              <tr><td colSpan={6} className="text-center py-6 text-ink-3">Không có dữ liệu</td></tr>
            )}
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                         style={{ background: 'var(--sidebar-accent)' }}>
                      {u.displayName.charAt(0).toUpperCase()}
                    </div>
                    <span>{u.displayName}</span>
                  </div>
                </td>
                <td className="text-ink-3 text-xs">{u.email}</td>
                <td><Badge variant={TYPE_VARIANT[u.userType]}>{TYPE_LABEL[u.userType]}</Badge></td>
                <td className="font-mono text-xs">{u.studentCode ?? '—'}</td>
                <td>
                  <Badge variant={u.status === 'ACTIVE' ? 'sage' : 'red'}>
                    {STATUS_LABEL[u.status]}
                  </Badge>
                </td>
                <td>
                  {u.userType !== 'SYSTEM_ADMIN' && (
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className="btn btn-ghost btn-sm gap-1"
                      title={u.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
                    >
                      {u.status === 'ACTIVE' ? <Lock size={12} /> : <Unlock size={12} />}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationBar
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
