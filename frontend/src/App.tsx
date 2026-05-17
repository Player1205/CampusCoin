import { useEffect } from 'react';
import {
  createBrowserRouter, RouterProvider,
  Navigate, Outlet, type RouteObject,
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
import ChatPage     from '@/pages/ChatPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { useAuthStore } from '@/store/useAuthStore';

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
    children: [{
      element: <AppLayout />,
      children: [
        { index: true,      element: <Navigate to="/home"  replace /> },
        { path: '/home',    element: <Home /> },
        { path: '/tasks',   element: <Tasks /> },
        { path: '/flex',    element: <Flex /> },
        { path: '/chats',   element: <ChatPage /> },
        { path: '/profile', element: <Profile /> },
      ],
    }],
  },
  { path: '*', element: <NotFoundPage /> },
];

const router = createBrowserRouter(routes);

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const theme   = useThemeStore((s) => s.theme);
  const isDark  = theme === 'dark';

  useEffect(() => { void fetchMe(); }, [fetchMe]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            background:   isDark ? '#161B22' : '#FFFFFF',
            color:        isDark ? '#E6EDF3' : '#2D1B0E',
            border:       `1px solid ${isDark ? '#30363D' : '#E8D5C4'}`,
            borderRadius: '12px',
            fontFamily:   '"DM Sans", sans-serif',
            fontSize:     '14px',
            padding:      '12px 16px',
            boxShadow:    isDark
              ? '0 8px 32px rgba(0,0,0,0.55)'
              : '0 4px 20px rgba(120,70,30,0.12)',
          },
          success: { iconTheme: { primary: isDark ? '#39FF14' : '#16A34A', secondary: isDark ? '#0D1117' : '#FFF' } },
          error:   { iconTheme: { primary: '#F85149', secondary: isDark ? '#0D1117' : '#FFF' } },
        }}
      />
    </>
  );
}
