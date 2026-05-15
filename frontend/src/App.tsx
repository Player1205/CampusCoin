import { useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  type RouteObject,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import AppLayout from '@/components/layout/AppLayout';

// Pages
import LoginPage    from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import Home         from '@/pages/Home';
import Swap         from '@/pages/Swap';
import Flex         from '@/pages/Flex';
import Profile      from '@/pages/Profile';
import NotFoundPage from '@/pages/NotFoundPage';

// State
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
  // Public
  {
    element: <RequireGuest />,
    children: [
      { path: '/login',    element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  // Protected
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true,     element: <Navigate to="/home" replace /> },
          { path: '/home',    element: <Home /> },
          { path: '/swap',    element: <Swap /> },
          { path: '/flex',    element: <Flex /> },
          { path: '/profile', element: <Profile /> },
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

  useEffect(() => {
    void fetchMe();
  }, [fetchMe]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        gutter={10}
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1E293B',
            color: '#F8FAFC',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '14px',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          },
          success: { iconTheme: { primary: '#39FF14', secondary: '#0F172A' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#0F172A' } },
        }}
      />
    </>
  );
}
