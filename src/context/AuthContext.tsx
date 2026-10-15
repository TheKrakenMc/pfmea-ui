import { getErrorMessage } from '../utils/errors';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axiosClient from '../api/axiosClient';
import { setCsrfToken, setSelectedPlant, clearSessionState } from '../api/sessionState';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role_id: string;
  role_name: string | null;
  department: string | null;
  is_active: boolean;
  is_verified: boolean;
  must_change_password: boolean;
  plant_id: number | null;
  plant_ids: number[];
  csrf_token: string;
}

// ─── Context Definition ────────────────────────────────────────────────────────

import {AuthContext} from './authState';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session on mount
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        await axiosClient.get('/auth/csrf');
        const { data } = await axiosClient.get<UserProfile>('/auth/me');
        setCsrfToken(data.csrf_token);
        const saved = Number(sessionStorage.getItem(`plant_${data.id}`));
        const selected = data.plant_ids.includes(saved) ? saved : data.plant_id;
        setUser({ ...data, plant_id: selected });
        setSelectedPlant(selected);
      } catch {
        // Silent failing on start (user is just not logged in yet)
        setUser(null);
      clearSessionState();
      } finally {
        setIsLoading(false);
      }
    };
    checkActiveSession();
  }, []);

  const refreshUserProfile = async () => {
    try {
      const { data } = await axiosClient.get<UserProfile>('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
      clearSessionState();
    }
  };

  const loginPhase1 = async (email: string, password: string): Promise<{ otpRequired: boolean }> => {
    const { data } = await axiosClient.post<{ user: UserProfile }>('/auth/login', { email, password });
    setUser(data.user);
    setCsrfToken(data.user.csrf_token);
    setSelectedPlant(data.user.plant_id);
    return { otpRequired: false };
  };

  const selectPlant = (plantId: number) => {
    if (!user?.plant_ids.includes(plantId)) throw new Error('Planta no autorizada');
    sessionStorage.setItem(`plant_${user.id}`, String(plantId));
    setSelectedPlant(plantId);
    setUser({ ...user, plant_id: plantId });
    window.location.assign('/');
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await axiosClient.post('/auth/forgot-password', { email });
    } catch (error: unknown) {
      const errMsg = getErrorMessage(error) || 'Error al solicitar el restablecimiento de contraseña.';
      toast.error('Error', { description: errMsg });
      throw error;
    }
  };

  const resetPassword = async (email: string, otpCode: string, newPassword: string): Promise<void> => {
    try {
      await axiosClient.post('/auth/reset-password', {
        email,
        otp_code: otpCode,
        new_password: newPassword
      });
      toast.success('Contraseña actualizada', {
        description: 'Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión.'
      });
    } catch (error: unknown) {
      const errMsg = getErrorMessage(error) || 'El código ingresado no es válido o ya expiró.';
      toast.error('Error de restablecimiento', { description: errMsg });
      throw error;
    }
  };

  /**
   * Logs out by clearing cookies.
   */
  const logout = async () => {
    try {
      await axiosClient.post('/auth/logout');
      setUser(null);
      clearSessionState();
      toast.success('Sesión cerrada', {
        description: 'Has cerrado sesión correctamente de la bitácora industrial.'
      });
    } catch (error) {
      // Force clear in client even if api fails
      setUser(null);
      clearSessionState();
      logger.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginPhase1,
        selectPlant,
        forgotPassword,
        resetPassword,
        logout,
        refreshUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── useAuth Hook ─────────────────────────────────────────────────────────────

// Simple logger fallback
const logger = {
  error: (...args: unknown[]) => console.error('[AuthContext]', ...args)
};
