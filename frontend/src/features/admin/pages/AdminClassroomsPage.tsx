import { useEffect, useState } from 'react';
import { Archive } from 'lucide-react';
import { adminApi, type AdminClassroom } from '../api';
import { Badge } from '@/shared/components/Badge';
import { PaginationBar } from '@/shared/components/PaginationBar';

const PAGE_SIZE = 20;

export function AdminClassroomsPage() {
  const [classrooms, setClassrooms] = useState<AdminClassroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const reload = async (p = page) => {
    setLoading(true);
    try {
      const res = await adminApi.listClassrooms(p, PAGE_SIZE);
      setClassrooms(res.content ?? []);
      setPage(res.number ?? 0);
      setTotalPages(res.totalPages ?? 0);
      setTotalElements(res.totalElements ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(0); }, []);

  const handlePageChange = (p: number) => {
    setPage(p);
    reload(p);
  };

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Lưu trữ lớp "${name}"? Lớp sẽ bị ẩn khỏi user.`)) return;
    await adminApi.archiveClassroom(id);
    reload(page);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-serif font-semibold text-ink-1 mb-6">Lớp học</h1>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tên lớp</th>
              <th>Chủ sở hữu</th>
              <th>Sĩ số</th>
              <th>Trạng thái</th>
              <th>Tạo lúc</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="text-center py-6 text-ink-3">Đang tải...</td></tr>
            )}
            {!loading && classrooms.length === 0 && (
              <tr><td colSpan={6} className="text-center py-6 text-ink-3">Không có dữ liệu</td></tr>
            )}
            {classrooms.map((c) => (
              <tr key={c.id}>
                <td>
                  <p className="font-medium text-ink-1">{c.name}</p>
                  {c.description && (
                    <p className="text-xs text-ink-3 truncate max-w-xs">{c.description}</p>
                  )}
                </td>
                <td className="text-ink-2 text-sm">{c.ownerName}</td>
                <td className="text-ink-3 text-sm">{c.memberCount}/{c.maxMembers}</td>
                <td>
                  <Badge variant={c.status === 'ACTIVE' ? 'sage' : 'red'}>
                    {c.status === 'ACTIVE' ? 'Hoạt động' : 'Đã lưu trữ'}
                  </Badge>
                </td>
                <td className="text-ink-3 text-xs">
                  {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td>
                  {c.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleArchive(c.id, c.name)}
                      className="btn btn-ghost btn-sm gap-1 text-xs"
                      style={{ color: 'var(--red-text)' }}
                    >
                      <Archive size={12} /> Lưu trữ
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
