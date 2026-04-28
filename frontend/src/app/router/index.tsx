import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PrivateRoute } from '@/shared/components/PrivateRoute';
import { RoleRoute } from '@/shared/components/RoleRoute';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { AdminLayout } from '@/features/admin/components/AdminLayout';
import { ParentLayout } from '@/features/parent/components/ParentLayout';

import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';

const cr = (path: string) => `classrooms/:classroomId/${path}`;
const lazy = <T extends Record<string, React.ComponentType>>(
  fn: () => Promise<T>,
  key: keyof T,
) => () => fn().then((m) => ({ Component: m[key] as React.ComponentType }));

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  {
    element: <PrivateRoute />,
    children: [
      // ─── Admin ─────────────────────────────────────────
      {
        element: <RoleRoute allow={['SYSTEM_ADMIN']} />,
        children: [
          {
            path: '/admin',
            element: <AdminLayout />,
            children: [
              { index: true, lazy: lazy(() => import('@/features/admin/pages/AdminDashboardPage'), 'AdminDashboardPage') },
              { path: 'users', lazy: lazy(() => import('@/features/admin/pages/AdminUsersPage'), 'AdminUsersPage') },
              { path: 'classrooms', lazy: lazy(() => import('@/features/admin/pages/AdminClassroomsPage'), 'AdminClassroomsPage') },
              { path: 'timetable', lazy: lazy(() => import('@/features/admin/pages/AdminTimetablePage'), 'AdminTimetablePage') },
            ],
          },
        ],
      },

      // ─── Parent ────────────────────────────────────────
      {
        element: <RoleRoute allow={['PARENT']} />,
        children: [
          {
            path: '/parent',
            element: <ParentLayout />,
            children: [
              { index: true, lazy: lazy(() => import('@/features/parent/pages/ParentDashboardPage'), 'ParentDashboardPage') },
              { path: 'classrooms/:classroomId', lazy: lazy(() => import('@/features/parent/pages/ParentClassroomViewPage'), 'ParentClassroomViewPage') },
            ],
          },
        ],
      },

      // ─── Student / Teacher (default) ───────────────────
      {
        element: <RoleRoute allow={['STUDENT', 'TEACHER']} />,
        children: [
          {
            element: <MainLayout />,
            children: [
              { index: true, lazy: lazy(() => import('@/features/home/pages/HomePage'), 'HomePage') },
              { path: 'notifications', lazy: lazy(() => import('@/features/notification/pages/NotificationPage'), 'NotificationPage') },
              { path: 'schedule', lazy: lazy(() => import('@/features/schedule/pages/SchedulePage'), 'SchedulePage') },

              { path: 'classrooms/:classroomId', lazy: lazy(() => import('@/features/classroom/pages/ClassroomDetailPage'), 'ClassroomDetailPage') },
              { path: cr('attendance'), lazy: lazy(() => import('@/features/attendance/pages/AttendancePage'), 'AttendancePage') },
              { path: cr('attendance/sessions/:sessionId'), lazy: lazy(() => import('@/features/attendance/pages/AttendanceSessionPage'), 'AttendanceSessionPage') },
              { path: cr('chat'), lazy: lazy(() => import('@/features/chat/pages/ChatPage'), 'ChatPage') },
              { path: cr('seating'), lazy: lazy(() => import('@/features/seating/pages/SeatingChartPage'), 'SeatingChartPage') },
              { path: cr('emulation'), lazy: lazy(() => import('@/features/emulation/pages/EmulationPage'), 'EmulationPage') },
              { path: cr('duty'), lazy: lazy(() => import('@/features/duty/pages/DutyPage'), 'DutyPage') },
              { path: cr('fund'), lazy: lazy(() => import('@/features/fund/pages/FundPage'), 'FundPage') },
              { path: cr('documents'), lazy: lazy(() => import('@/features/document/pages/DocumentPage'), 'DocumentPage') },
              { path: cr('events'), lazy: lazy(() => import('@/features/event/pages/EventsPage'), 'EventsPage') },
              { path: cr('students'), lazy: lazy(() => import('@/features/evaluation/pages/StudentManagementPage'), 'StudentManagementPage') },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
