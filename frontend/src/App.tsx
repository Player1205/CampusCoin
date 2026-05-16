import { useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  type RouteObject,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from '@/store/useThemeStore';

import AppLayout    from '@/components/layout/AppLayout';
import LoginPage    from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import Home         from '@/pages/Home';
import Tasks        from '@/pages/Tasks';
import Flex         from '@/pages/Flex';
import Profile      from '@/pages/Profile';
import NotFoundPage from '@/pages/NotFoundPage';

import { useAuthStore } from '@/store/useAuthStore';

// ─── Auth guards ──────────────────────────────────────────────────────────────

function RequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RequireGuest() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/home" replace />;
  return <Outlet />;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

const routes: RouteObject[] = [
  {
    element: <RequireGuest />,
    children: [
      { path: '/login',    element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true,     element: <Navigate to="/home"  replace /> },
          { path: '/home',   element: <Home /> },
          { path: '/tasks',  element: <Tasks /> },
          { path: '/flex',   element: <Flex /> },
          { path: '/profile',element: <Profile /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
];

const router = createBrowserRouter(routes);

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const theme   = useThemeStore((s) => s.theme);

  // Hydrate user on every mount (handles page refresh)
  useEffect(() => { void fetchMe(); }, [fetchMe]);

  // Toast colours change with theme
  const isDark = theme === 'dark';

  return (
    <>
      <RouterProvider router={router} />

      <Toaster
        position="top-center"
        gutter={10}
        toastOptions={{
          duration: 3500,
          style: {
            background: isDark ? '#1E293B' : '#FFFFFF',
            color:      isDark ? '#F8FAFC' : '#1C1917',
            border:     `1px solid ${isDark ? '#334155' : '#E8E0D8'}`,
            borderRadius: '12px',
            fontFamily: '"DM Sans", sans-serif',
            fontSize:   '14px',
            padding:    '12px 16px',
            boxShadow:  isDark
              ? '0 8px 32px rgba(0,0,0,0.5)'
              : '0 4px 20px rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: {
              primary:   isDark ? '#39FF14' : '#16A34A',
              secondary: isDark ? '#0F172A' : '#FFFFFF',
            },
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: isDark ? '#0F172A' : '#FFFFFF' },
          },
        }}
      />
    </>
  );
}
