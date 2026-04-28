import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

// ─── Segment → label map ───────────────────────────────────────────────────────

const SEGMENT_LABELS: Record<string, string | null> = {
  // null  = skip this segment entirely (it's consumed alongside the previous one)
  classrooms:    null,
  attendance:    'Điểm danh',
  sessions:      'Phiên điểm danh',
  chat:          'Trò chuyện',
  seating:       'Sơ đồ lớp',
  emulation:     'Thi đua',
  duty:          'Trực nhật',
  fund:          'Quỹ lớp',
  documents:     'Tài liệu',
  events:        'Sự kiện',
  students:      'Học sinh',
  notifications: 'Thông báo',
  // Parent
  parent:        'Cổng phụ huynh',
  // Admin
  admin:         'Admin',
  users:         'Người dùng',
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s: string) => UUID_RE.test(s);

// ─── Module-level cache to avoid re-fetching classroom names ──────────────────

const nameCache = new Map<string, string>();
type NameFetcher = (id: string) => Promise<string>;

// ─── Main component ───────────────────────────────────────────────────────────

interface BreadcrumbProps {
  /** Optional async function to resolve a classroomId → display name. */
  fetchClassroomName?: NameFetcher;
  /** Root label (default: "Trang chủ"). */
  rootLabel?: string;
  /** Root path (default: "/"). */
  rootPath?: string;
}

export function Breadcrumb({
  fetchClassroomName,
  rootLabel = 'Trang chủ',
  rootPath = '/',
}: BreadcrumbProps) {
  const location = useLocation();

  // Find first classroomId in the URL
  const classroomIdMatch = location.pathname.match(
    /\/classrooms\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
  );
  const classroomId = classroomIdMatch?.[1] ?? null;

  const [classroomName, setClassroomName] = useState<string>(
    classroomId ? (nameCache.get(classroomId) ?? '') : '',
  );

  useEffect(() => {
    if (!classroomId || !fetchClassroomName) return;
    if (nameCache.has(classroomId)) {
      setClassroomName(nameCache.get(classroomId)!);
      return;
    }
    fetchClassroomName(classroomId)
      .then((name) => {
        nameCache.set(classroomId, name);
        setClassroomName(name);
      })
      .catch(() => {/* keep previous */});
  }, [classroomId, fetchClassroomName]);

  const crumbs = useMemo(() => {
    const raw = location.pathname.split('/').filter(Boolean);
    const items: { label: string; to?: string }[] = [
      { label: rootLabel, to: rootPath },
    ];

    let builtPath = '';
    let i = 0;

    while (i < raw.length) {
      const seg = raw[i];
      builtPath += `/${seg}`;

      if (seg === 'classrooms' && i + 1 < raw.length) {
        // Consume classroomId next
        builtPath += `/${raw[i + 1]}`;
        i += 2;
        items.push({ label: classroomName || '…', to: builtPath });
        continue;
      }

      // Skip UUID-like segments (session IDs, etc.)
      if (isUuid(seg)) {
        i++;
        continue;
      }

      const label = SEGMENT_LABELS[seg];
      if (label === null || label === undefined) {
        // null: explicitly skip; undefined: unknown segment
        i++;
        continue;
      }

      items.push({ label, to: builtPath });
      i++;
    }

    // Last item is always current page — remove its link
    if (items.length > 0) {
      items[items.length - 1].to = undefined;
    }

    return items;
  }, [location.pathname, classroomName, rootLabel, rootPath]);

  // Hide on root page (only "Trang chủ" with no children)
  if (crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="sticky top-0 z-10 flex items-center gap-0.5 px-4 sm:px-6 py-2 text-xs overflow-x-auto no-scrollbar shrink-0"
      style={{
        background: 'var(--bg-paper)',
        borderBottom: '1px solid var(--rule)',
        minHeight: '34px',
      }}
    >
      {crumbs.map((crumb, idx) => (
        <span key={`${crumb.label}-${idx}`} className="flex items-center gap-0.5 shrink-0">
          {idx === 0 ? (
            <Home size={11} className="mr-1" style={{ color: 'var(--ink-3)' }} />
          ) : (
            <ChevronRight size={12} style={{ color: 'var(--ink-4)' }} />
          )}
          {crumb.to ? (
            <Link
              to={crumb.to}
              className="px-1 py-0.5 rounded hover:underline transition-colors truncate max-w-[160px]"
              style={{ color: 'var(--ink-3)' }}
              title={crumb.label}
            >
              {crumb.label}
            </Link>
          ) : (
            <span
              className="px-1 py-0.5 font-semibold truncate max-w-[200px]"
              style={{ color: 'var(--ink-1)' }}
              title={crumb.label}
            >
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
