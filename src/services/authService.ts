// ─────────────────────────────────────────────────────────────
//  Auth Service — Login, session verification, and logout
//  Uses HTTP-Only cookies managed by the FastAPI backend.
//  The token is NEVER stored or read on the client side.
// ─────────────────────────────────────────────────────────────

import axiosClient from '../api/axiosClient';

// ─── Types ───────────────────────────────────────────────────

export interface LoginCredentials {
  email: string;
}

export interface CurrentUser {
  id: string;
  full_name: string | null;
  email: string | null;
  role_id: string;
  is_active: boolean;
}

// ─── Service Functions ───────────────────────────────────────

/**
 * Authenticate the user with the backend.
 * The server sets an HTTP-Only cookie with the JWT — we do NOT
 * capture or store any token on the client.
 */
export async function login(credentials: LoginCredentials): Promise<{ message: string }> {
  const { data } = await axiosClient.post<{ message: string }>('/auth/login', credentials);
  return data;
}

/**
 * Verify the active session by reading the HTTP-Only cookie on the server.
 * Call this on page reload to restore the authenticated state.
 * Returns the current user or `null` if the session is invalid.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const { data } = await axiosClient.get<CurrentUser>('/auth/me');
    return data;
  } catch {
    // 401/403 will be handled by the interceptor globally
    return null;
  }
}

/**
 * Log out the current user by clearing the HTTP-Only cookie on the server.
 */
export async function logout(): Promise<void> {
  await axiosClient.post('/auth/logout');
}
