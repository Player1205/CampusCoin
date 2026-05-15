import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * useAuth — thin wrapper over useAuthStore that also handles the
 * global `cc:unauthorized` event (fired by the Axios interceptor).
 */
export function useAuth() {
  const navigate = useNavigate();
  const store = useAuthStore();

  useEffect(() => {
    const handleUnauthorized = () => {
      store.logout().then(() => navigate('/login', { replace: true }));
    };

    window.addEventListener('cc:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('cc:unauthorized', handleUnauthorized);
  }, [navigate, store]);

  return store;
}
