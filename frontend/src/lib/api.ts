import type { AxiosError} from 'axios';
import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

// ─── Instance ─────────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/v1`
    : '/api/v1',
  withCredentials: true,          // Send HTTP-only JWT cookie on every request
  timeout: 15_000,                // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error: AxiosError) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ status: string; message?: string; data?: any }>) => {
    const status = error.response?.status;

    // Token expired / invalid — redirect to login
    if (status === 401) {
      // Avoid redirect loops if already on auth pages
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register')) {
        // Clear local auth state and redirect
        window.dispatchEvent(new CustomEvent('cc:unauthorized'));
      }
    }

    // Bubble up the error with the server's message or validation data
    const resData = error.response?.data;
    if (resData) {
      if (resData.message) {
        error.message = resData.message;
      } else if (resData.data && typeof resData.data === 'object') {
        const firstError = Object.values(resData.data)[0];
        if (typeof firstError === 'string') {
          error.message = firstError;
        }
      }
    }

    return Promise.reject(error);
  }
);

// ─── Typed helpers ────────────────────────────────────────────────────────────

/** Extract data from a JSend success response, throw if fail/error */
export const unwrap = <T>(response: AxiosResponse<{ status: string; data?: T; message?: string }>): T => {
  if (response.data.status === 'fail' || response.data.status === 'error') {
    throw new Error(response.data.message || 'API request failed');
  }
  return response.data.data as T;
};

export default api;
