import {useAuth} from './useAuth';
export function useRBAC(){
 const {user,isLoading}=useAuth();const role=user?.role_name || null;
 const canEdit=!!role && ['Administrator','PFMEA Owner','Team Member'].includes(role);
 return {user,role,isLoading,canEditProduct:canEdit,canDeleteProduct:role==='Administrator',canEditTechnology:canEdit};
}
