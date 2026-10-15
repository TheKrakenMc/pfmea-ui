import {createContext} from 'react';
import type {UserProfile} from './AuthContext';
export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginPhase1: (email: string, password: string) => Promise<{ otpRequired: boolean }>;
  selectPlant: (plantId: number) => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otpCode: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}


export const AuthContext = createContext<AuthContextType | undefined>(undefined);
