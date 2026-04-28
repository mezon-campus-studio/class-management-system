import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

export function PaginationBar({ page, totalPages, totalElements, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = buildPageWindow(page, totalPages);

  return (
    <div className="flex items-center justify-between px-1 py-3 text-sm">
      <span className="text-xs text-ink-3">{totalElements} kết quả</span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="btn btn-ghost btn-sm px-1.5 disabled:opacity-30"
          aria-label="Trang trước"
        >
          <ChevronLeft size={15} />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-ink-3 select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`btn btn-sm min-w-[32px] px-2 ${
                p === page ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              {(p as number) + 1}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="btn btn-ghost btn-sm px-1.5 disabled:opacity-30"
          aria-label="Trang sau"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

function buildPageWindow(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);

  const pages: (number | '...')[] = [];
  const addRange = (from: number, to: number) => {
    for (let i = from; i <= to; i++) pages.push(i);
  };

  pages.push(0);
  if (current > 3) pages.push('...');
  addRange(Math.max(1, current - 1), Math.min(total - 2, current + 1));
  if (current < total - 4) pages.push('...');
  pages.push(total - 1);

  return pages;
}
