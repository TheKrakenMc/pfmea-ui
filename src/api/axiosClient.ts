// ─────────────────────────────────────────────────────────────
//  Axios Client — Centralized HTTP client with interceptors
//  Handles: withCredentials, 429 rate-limit toasts,
//  401/403 session redirect to login.
// ─────────────────────────────────────────────────────────────

import axios from 'axios';
import { toast } from 'sonner';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // ¡CRÍTICO! Permite enviar y recibir las cookies HTTP-Only
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ─── Request Interceptor ────────────────────────────────────

axiosClient.interceptors.request.use((config) => {
  const lang = localStorage.getItem('i18nextLng') || 'es';
  // Optional chaining just in case, though headers should be defined
  if (config.headers) {
    config.headers['Accept-Language'] = lang;
  }
  return config;
});

// ─── Response Interceptors ──────────────────────────────────

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 429) {
      // Rate limit exceeded (slowapi)
      toast.error('Demasiadas solicitudes', {
        description: 'Has excedido el límite de peticiones. Espera unos segundos antes de intentar de nuevo.',
        duration: 5000,
      });
      return Promise.reject(error);
    }

    // Intercept 401 Unauthorized (Expired Token) and attempt Silent Refresh
    // Avoid infinite loop by ensuring we are not retrying already or trying to login/refresh
    if (
      status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes('/auth/login') && 
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Trigger silent refresh: reads the HTTP-Only cookie and gets new tokens
        await axiosClient.post('/auth/refresh');
        
        processQueue(null);
        isRefreshing = false;
        
        // Retry the original request with the renewed session
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Refresh failed (refresh token expired) -> redirect to login
        if (!window.location.pathname.includes('/login')) {
          toast.error('Sesión expirada', {
            description: 'Tu sesión ha terminado. Redirigiendo al inicio de sesión...',
            duration: 3000,
          });
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden or persistent 401
    if (
      (status === 401 || status === 403) && 
      !originalRequest.url?.includes('/auth/login') && 
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (!window.location.pathname.includes('/login')) {
        toast.error('Acceso no autorizado', {
          description: 'No tienes permisos para realizar esta acción o tu sesión expiró.',
          duration: 3000,
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
