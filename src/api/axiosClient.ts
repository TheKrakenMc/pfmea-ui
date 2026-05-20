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

// ─── Response Interceptors ──────────────────────────────────

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 429) {
      // Rate limit exceeded (slowapi)
      toast.error('Demasiadas solicitudes', {
        description: 'Has excedido el límite de peticiones. Espera unos segundos antes de intentar de nuevo.',
        duration: 5000,
      });
    }

    if (status === 401 || status === 403) {
      // Session expired or unauthorized — redirect to login
      // Only redirect if not already on the login page
      if (!window.location.pathname.includes('/login')) {
        toast.error('Sesión expirada', {
          description: 'Tu sesión ha terminado. Redirigiendo al inicio de sesión...',
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
