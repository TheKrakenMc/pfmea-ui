import { getErrorMessage } from '../utils/errors';
// ─────────────────────────────────────────────────────────────
//  Axios Client — Centralized HTTP client with interceptors
//  Handles: withCredentials, 429 rate-limit toasts,
//  401/403 session redirect to login.
// ─────────────────────────────────────────────────────────────

import axios, { type AxiosError } from 'axios';
declare module 'axios' { interface InternalAxiosRequestConfig { _retry?: boolean } }
import { getCsrfToken, getSelectedPlant, setCsrfToken, revisions } from './sessionState';
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
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
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
    const csrf = getCsrfToken();
    if (csrf) config.headers['X-CSRF-Token'] = csrf;
    const plant = getSelectedPlant();
    if (plant !== null) config.headers['X-Plant-Id'] = String(plant);
    if (!['get', 'head', 'options'].includes(config.method || 'get')) {
      const path = config.url || '';
      const match = path.match(/\/(pfmea-project|flowcharts|control-plans|products)\/(\d+)/);
      if (match) {
        const table = { 'pfmea-project': 'pfmea_headers', flowcharts: 'flowcharts', 'control-plans': 'control_plans', products:'products' }[match[1]];
        const revision = revisions.get(table + ':' + match[2]);
        if (revision !== undefined && !config.headers['If-Match']) config.headers['If-Match'] = String(revision);
      }
    }
  }
  return config;
});

// ─── Response Interceptors ──────────────────────────────────

axiosClient.interceptors.response.use(
  (response) => {
    const key = response.headers['x-document-key'];
    const version = response.headers['x-document-version'];
    if (key && version && (!revisions.has(String(key)) || response.config.method !== 'get')) revisions.set(String(key), Number(version));
    const documents = Array.isArray(response.data) ? response.data : response.data?.items || [response.data];
    for (const document of documents) {
      if (!document?.lock_version || !document?.id) continue;
      const table = document.control_plan_code ? 'control_plans' : document.pfmea_id_number ? 'pfmea_headers' : document.flowchart_code ? 'flowcharts' : document.part_number ? 'products' : null;
      if (table && !revisions.has(table + ':' + document.id)) revisions.set(table + ':' + document.id, document.lock_version);
    }
    const data = response.data;
    if (data?.csrf_token) setCsrfToken(data.csrf_token);
    return response;
  },
  async (error: AxiosError<{detail?: string}>) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);
    const status = error.response?.status;

    if (status === 409 || status === 428) {
      toast.error('El documento cambió', { description: 'Conserva tu borrador y recarga antes de volver a guardar.' });
    }
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
      !originalRequest.url?.includes('/auth/login') && !originalRequest.url?.includes('/auth/csrf') &&
      !originalRequest.url?.includes('/auth/refresh') && !originalRequest.url?.includes('/auth/reset-password') && !originalRequest.url?.includes('/auth/forgot-password')
    ) {
      if (isRefreshing) {
        originalRequest._retry = true;
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

    // Handle persistent 401 (session expired / unauthenticated)
    if (
      status === 401 &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (!window.location.pathname.includes('/login')) {
        toast.error('Sesión expirada', {
          description: 'Tu sesión no es válida o ha expirado. Redirigiendo...',
          duration: 3000,
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    }

    // Handle 403 Forbidden (insufficient permissions or gate rules)
    if (status === 403) {
      const detail = getErrorMessage(error);
      const msg = typeof detail === 'string' ? detail : 'Acción no permitida o permisos insuficientes.';
      toast.error('Acceso denegado', {
        description: msg,
        duration: 5000,
      });
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
