import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api, { unwrap } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatarUrl?: string;
  coverUrl?: string;
  university: string;
  department?: string;
  bio?: string;
  skills: string[];
  coinBalance: number;
  isVerified: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  register: (payload: RegisterPayload) => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
  setError: (msg: string | null) => void;
  clearError: () => void;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  university: string;
  department?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────────────────────
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ── Actions ────────────────────────────────────────────────────────────

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/register', payload);
          const { user, token } = unwrap<{ user: User; token: string }>(res);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Registration failed.';
          set({ isLoading: false, error: msg });
          throw err;
        }
      },

      login: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/login', payload);
          const { user, token } = unwrap<{ user: User; token: string }>(res);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Login failed.';
          set({ isLoading: false, error: msg });
          throw err;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post('/auth/logout');
        } catch {
          // Proceed with logout even if request fails
        } finally {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
        }
      },

      fetchMe: async () => {
        if (!get().isAuthenticated) return;
        set({ isLoading: true });
        try {
          const res = await api.get('/auth/me');
          const { user } = unwrap<{ user: User }>(res);
          set({ user, isLoading: false });
        } catch {
          // Token expired or user gone — clear state
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },

      updateUser: (partial) => {
        const current = get().user;
        if (current) set({ user: { ...current, ...partial } });
      },

      setError: (msg) => set({ error: msg }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'campuscoin-auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist identity info — token lives in the HTTP-only cookie
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectUser = (s: AuthState) => s.user;
export const selectIsAuthenticated = (s: AuthState) => s.isAuthenticated;
export const selectIsLoading = (s: AuthState) => s.isLoading;
export const selectAuthError = (s: AuthState) => s.error;
