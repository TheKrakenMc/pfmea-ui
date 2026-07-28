import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import axiosClient from '../api/axiosClient';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role_id: string;
  role_name: string | null;
  department: string | null;
  is_active: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginPhase1: (email: string, password: string) => Promise<{ otpRequired: boolean }>;
  verifyOtpPhase2: (email: string, otpCode: string) => Promise<UserProfile>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otpCode: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

// ─── Context Definition ────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session on mount
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const { data } = await axiosClient.get<UserProfile>('/auth/me');
        setUser(data);
      } catch (error) {
        // Silent failing on start (user is just not logged in yet)
        setUser(null);
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
    }
  };

  /**
   * Phase 1: Validate email & password, triggers SMTP OTP sending.
   */
  const loginPhase1 = async (email: string, password: string): Promise<{ otpRequired: boolean }> => {
    try {
      const { data } = await axiosClient.post<{ otp_required: boolean }>('/auth/login', {
        email,
        password
      });
      return { otpRequired: !!data.otp_required };
    } catch (error: any) {
      const errMsg = error.response?.data?.detail || 'Error en las credenciales. Revisa tu correo y contraseña.';
      toast.error('Error de autenticación', { description: errMsg });
      throw error;
    }
  };

  /**
   * Phase 2: Verifies OTP code, establishes HTTP-Only cookies.
   */
  const verifyOtpPhase2 = async (email: string, otpCode: string): Promise<UserProfile> => {
    try {
      const { data } = await axiosClient.post<{ user: UserProfile }>('/auth/verify-otp', {
        email,
        otp_code: otpCode
      });
      
      const userProfile = data.user;
      setUser(userProfile);
      toast.success('Acceso concedido', {
        description: `Bienvenido de nuevo, ${userProfile.full_name || 'Usuario'}`
      });
      return userProfile;
    } catch (error: any) {
      const errMsg = error.response?.data?.detail || 'El código ingresado no es válido o ya expiró.';
      toast.error('Código OTP Inválido', { description: errMsg });
      throw error;
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await axiosClient.post('/auth/forgot-password', { email });
    } catch (error: any) {
      const errMsg = error.response?.data?.detail || 'Error al solicitar el restablecimiento de contraseña.';
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
    } catch (error: any) {
      const errMsg = error.response?.data?.detail || 'El código ingresado no es válido o ya expiró.';
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
      toast.success('Sesión cerrada', {
        description: 'Has cerrado sesión correctamente de la bitácora industrial.'
      });
    } catch (error) {
      // Force clear in client even if api fails
      setUser(null);
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
        verifyOtpPhase2,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Simple logger fallback
const logger = {
  error: (...args: any[]) => console.error('[AuthContext]', ...args)
};
