import React, { useEffect } from 'react';
import { NavLink, useLocation, useParams, Link } from 'react-router-dom';
import {
  Home,
  CalendarDays,
  ChevronLeft,
  Armchair,
  ClipboardList,
  MessageCircle,
  Star,
  Wrench,
  Wallet,
  FolderOpen,
  Calendar,
  GraduationCap,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/app/store';
import { useClassroomStore } from '@/app/store/classroomStore';
import { permissionsOf } from '@/features/classroom/permissions';

type Module = { icon: React.FC<{ size?: number; className?: string }>; label: string; path: string; teacherOnly?: boolean };

const MODULES: Module[] = [
  { icon: Armchair,      label: 'Sơ đồ lớp',  path: 'seating' },
  { icon: ClipboardList, label: 'Điểm danh',   path: 'attendance' },
  { icon: MessageCircle, label: 'Trò chuyện',  path: 'chat' },
  { icon: Star,          label: 'Thi đua',     path: 'emulation' },
  { icon: Wrench,        label: 'Trực nhật',   path: 'duty' },
  { icon: Wallet,        label: 'Quỹ lớp',    path: 'fund' },
  { icon: FolderOpen,    label: 'Tài liệu',   path: 'documents' },
  { icon: Calendar,      label: 'Sự kiện',    path: 'events' },
  { icon: GraduationCap, label: 'Học sinh',   path: 'students', teacherOnly: true },
];

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();
  const { classroomId } = useParams<{ classroomId?: string }>();
  const { user } = useAuthStore();
  const { classrooms, loading, loaded, fetch } = useClassroomStore();

  const isClassroomRoot = !!classroomId && location.pathname === `/classrooms/${classroomId}`;
  const isClassroomChild = !!classroomId && !isClassroomRoot;
  const isClassroomContext = isClassroomRoot || isClassroomChild;

  useEffect(() => {
    if (isClassroomContext && !loaded) fetch();
  }, [isClassroomContext, loaded, fetch]);

  const currentClassroom = classrooms.find((c) => c.id === classroomId);

  const scheduleLabel = user?.userType === 'TEACHER' ? 'Lịch dạy' : 'Thời khoá biểu';

  const visibleModules = currentClassroom
    ? MODULES.filter((m) =>
        m.teacherOnly ? permissionsOf(currentClassroom.myRole).canEditClassroom : true,
      )
    : MODULES.filter((m) => !m.teacherOnly);

  return (
    <aside
      className={`sidebar fixed md:sticky top-topbar-h z-20 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-0 md:hidden'
      }`}
      style={{ height: 'calc(100vh - var(--topbar-h))', top: 'var(--topbar-h)' }}
    >
      <nav className="flex-1 overflow-y-auto p-2">

        {/* ── Always-visible: schedule link ────────────── */}
        <NavLink to="/schedule">
          {({ isActive }) => (
            <div className={`sidebar-item ${isActive ? 'active' : ''}`}>
              <CalendarDays size={16} />
              <span>{scheduleLabel}</span>
            </div>
          )}
        </NavLink>

        <div className="my-2 mx-2" style={{ borderTop: '1px solid var(--sidebar-border, rgba(255,255,255,0.08))' }} />

        {/* ── Home context ─────────────────────────────── */}
        {!isClassroomContext && (
          <>
            <NavLink to="/" end>
              {({ isActive }) => (
                <div className={`sidebar-item ${isActive ? 'active' : ''}`}>
                  <Home size={16} />
                  <span>Trang chủ</span>
                </div>
              )}
            </NavLink>
          </>
        )}

        {/* ── Classroom overview – show classroom list ── */}
        {isClassroomRoot && (
          <>
            <Link to="/" className="sidebar-item">
              <ChevronLeft size={16} />
              <span>Trang chủ</span>
            </Link>

            <div className="mt-4 mb-1 px-2">
              <span
                className="text-label"
                style={{ color: 'var(--sidebar-text)', opacity: 0.5, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}
              >
                Lớp học của tôi
              </span>
            </div>

            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 size={16} className="animate-spin" style={{ color: 'var(--sidebar-text)' }} />
              </div>
            )}

            {classrooms.map((c) => (
              <Link key={c.id} to={`/classrooms/${c.id}`}>
                <div className={`sidebar-item ${c.id === classroomId ? 'active' : ''}`}>
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ background: 'var(--sidebar-accent)', color: '#fff' }}
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{c.name}</span>
                </div>
              </Link>
            ))}
          </>
        )}

        {/* ── Classroom sub-page – show module menu ──── */}
        {isClassroomChild && (
          <>
            <Link to={`/classrooms/${classroomId}`} className="sidebar-item">
              <ChevronLeft size={16} />
              <span className="truncate">{currentClassroom?.name ?? 'Lớp học'}</span>
            </Link>

            <div className="mt-4 mb-1 px-2">
              <span
                className="text-label"
                style={{ color: 'var(--sidebar-text)', opacity: 0.5, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}
              >
                Menu lớp học
              </span>
            </div>

            {loading && !currentClassroom && (
              <div className="flex justify-center py-4">
                <Loader2 size={16} className="animate-spin" style={{ color: 'var(--sidebar-text)' }} />
              </div>
            )}

            {visibleModules.map(({ icon: Icon, label, path }) => {
              const to = `/classrooms/${classroomId}/${path}`;
              const isActive = location.pathname.startsWith(to);
              return (
                <Link key={path} to={to}>
                  <div className={`sidebar-item ${isActive ? 'active' : ''}`}>
                    <Icon size={16} />
                    <span>{label}</span>
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </nav>
    </aside>
  );
}
