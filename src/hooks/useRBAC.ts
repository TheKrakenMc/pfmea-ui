import { useState, useEffect } from 'react';
import { getCurrentUser, type CurrentUser } from '../services/authService';

export interface RBACState {
  user: CurrentUser | null;
  role: string | null;
  canEditProduct: boolean;
  canDeleteProduct: boolean;
  canEditTechnology: boolean;
  isLoading: boolean;
}

export function useRBAC(): RBACState {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then((data) => {
        if (mounted) {
          setUser(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const roleName = user?.role_id ? String(user.role_id) : null;
  
  // Assuming roles: 1=Admin, 2=Owner, 3=Member, 4=Viewer
  const isViewer = roleName === 'Viewer' || roleName === '4';
  const isAdmin = roleName === 'Administrator' || roleName === 'Admin' || roleName === '1';

  return {
    user,
    role: roleName,
    canEditProduct: !isViewer,
    canDeleteProduct: isAdmin,
    canEditTechnology: !isViewer,
    isLoading,
  };
}
