import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Users } from 'lucide-react';
import { pfmeaService, type TeamMemberCreate } from '../../api/pfmeaService';
import { userService, type UserLookup } from '../../api/userService';
import { toast } from 'sonner';

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  pfmeaId: number;
  onSuccess: () => void;
}

const schema = yup.object().shape({
  user_id: yup.number().required('Usuario es requerido').positive('Usuario inválido').integer('Usuario inválido'),
  role_in_team: yup.string().required('Rol es requerido'),
  department: yup.string().required('Departamento es requerido'),
});

const DEPARTMENTS = [
  'Ingeniería',
  'Calidad',
  'Producción',
  'Logística',
  'Mantenimiento',
  'Dirección',
  'Otro',
];

export const TeamMemberModal: React.FC<TeamMemberModalProps> = ({ isOpen, onClose, pfmeaId, onSuccess }) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserLookup[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<TeamMemberCreate>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      user_id: 0,
      role_in_team: 'Team Member',
      department: 'Ingeniería'
    }
  });

  const selectedUserId = watch('user_id');
  const currentDepartment = watch('department');
  const currentRole = watch('role_in_team');

  useEffect(() => {
    if (selectedUserId && selectedUserId !== 0) {
      const user = users.find(u => Number(u.id) === Number(selectedUserId));
      if (user && user.department) {
        setValue('department', user.department, { shouldValidate: true });
      }
      if (user && user.role_name) {
        setValue('role_in_team', user.role_name, { shouldValidate: true });
      }
    }
  }, [selectedUserId, users, setValue]);

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const data = await userService.lookup();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      reset({ user_id: 0, role_in_team: 'Team Member', department: 'Ingeniería' });
    }
  }, [isOpen]);

  const onSubmit = async (data: TeamMemberCreate) => {
    try {
      await pfmeaService.addTeamMember(pfmeaId, data);
      toast.success(t('pfmea.team.addSuccess', 'Miembro agregado exitosamente'));
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to add team member", error);
      const detail = error.response?.data?.detail;
      
      if (detail === "User is already a team member for this PFMEA.") {
        const selectedUser = users.find(u => Number(u.id) === Number(data.user_id));
        const userName = selectedUser ? (selectedUser.full_name || selectedUser.email) : 'Usuario';
        toast.error(t('pfmea.team.userAlreadyInTeam', `El usuario {{userName}} ya pertenece al equipo en el departamento de {{department}}.`, {
          userName,
          department: data.department
        }));
      } else {
        toast.error(detail || t('pfmea.team.addError', "Error al agregar miembro al equipo."));
      }
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-steel-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-card w-full max-w-md overflow-hidden rounded-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-steel-700/50 bg-steel-900/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forge-glow text-forge-400">
                <UserPlus size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-steel-100">
                  {t('pfmea.team.addMember', 'Agregar Miembro al Equipo')}
                </h2>
                <p className="text-xs text-steel-400">
                  {t('pfmea.team.addMemberDesc', 'Asigna usuarios al equipo multidisciplinario')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-steel-400 hover:text-steel-100 hover:bg-steel-800 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {/* User Selection */}
              <div className="flex flex-col gap-1.5 group">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400 transition-colors group-focus-within:text-sky-400">
                  <Users size={12} className="text-sky-400" />
                  {t('pfmea.team.selectUser', 'Seleccionar Usuario')}
                </label>
                <select
                  {...register('user_id')}
                  disabled={isLoadingUsers}
                  className="w-full bg-steel-950/40 dark:bg-steel-950/30 border border-steel-700/50 hover:border-steel-600 focus:border-forge-500 rounded-xl px-4 py-2.5 text-sm text-steel-100 transition-all font-medium focus:outline-none focus:ring-1 focus:ring-forge-500"
                >
                  <option value={0} disabled>{isLoadingUsers ? t('pfmea.team.loadingUsers', 'Cargando usuarios...') : t('common.select', 'Seleccionar...')}</option>
                  {users.map(u => (
                    <option key={u.id} value={Number(u.id)}>{u.full_name || u.email}</option>
                  ))}
                </select>
                {errors.user_id && <span className="text-xs text-red-400">{errors.user_id.message}</span>}
              </div>

              {/* Role and Department Selection */}
              {selectedUserId && selectedUserId !== 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {/* Role Selection (Read-only) */}
                  <div className="flex flex-col gap-1.5 group">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 transition-colors group-focus-within:text-forge-400">
                      {t('pfmea.team.role', 'Rol en el Equipo')}
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        readOnly 
                        value={currentRole || ''} 
                        className="w-full bg-steel-900/50 dark:bg-steel-900/40 border border-steel-700/50 rounded-xl px-4 py-2.5 text-sm text-steel-400 font-medium cursor-not-allowed focus:outline-none" 
                        title={t('pfmea.team.roleFromProfile', 'El rol se asigna desde el perfil del usuario')}
                      />
                      <input type="hidden" {...register('role_in_team')} />
                    </div>
                    {errors.role_in_team && <span className="text-xs text-red-400">{errors.role_in_team.message}</span>}
                  </div>

                  {/* Department Selection (Read-only) */}
                  <div className="flex flex-col gap-1.5 group">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 transition-colors group-focus-within:text-purple-400">
                      {t('pfmea.team.department', 'Departamento')}
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        readOnly 
                        value={currentDepartment || ''} 
                        className="w-full bg-steel-900/50 dark:bg-steel-900/40 border border-steel-700/50 rounded-xl px-4 py-2.5 text-sm text-steel-400 font-medium cursor-not-allowed focus:outline-none" 
                        title={t('pfmea.team.deptFromProfile', 'El departamento se asigna desde el perfil del usuario')}
                      />
                      <input type="hidden" {...register('department')} />
                    </div>
                    {errors.department && <span className="text-xs text-red-400">{errors.department.message}</span>}
                  </div>
                </div>
              ) : null}

              <div className="flex justify-end gap-3 pt-4 border-t border-steel-700/50 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-steel-300 hover:text-steel-100 transition-colors cursor-pointer"
                >
                  {t('common.cancel', 'Cancelar')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-forge-600 hover:bg-forge-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? t('common.saving', 'Guardando...') : t('common.save', 'Guardar')}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
