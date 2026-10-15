import type { Resolver } from 'react-hook-form';
import { getErrorMessage } from '../../utils/errors';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Users, Trash2 } from 'lucide-react';
import { pfmeaService, type TeamMember, type TeamMemberCreate } from '../../api/pfmeaService';
import { userService, type UserLookup } from '../../api/userService';
import { toast } from 'sonner';

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  pfmeaId: number;
  teamMembers?: TeamMember[];
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

const FMEA_ROLES = [
  'PFMEA Owner',
  'Ingeniería de Procesos',
  'Aseguramiento de Calidad',
  'Ingeniería de Producto',
  'Producción / Operaciones',
  'Mantenimiento',
  'Logística',
  'Facilitador PFMEA',
  'Miembro del Equipo',
];

export const TeamMemberModal: React.FC<TeamMemberModalProps> = ({
  isOpen,
  onClose,
  pfmeaId,
  teamMembers = [],
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserLookup[]>([]);
  const [isLoadingUsers] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const { register, handleSubmit, reset, control, setValue, formState: { errors, isSubmitting } } = useForm<TeamMemberCreate>({
    resolver: yupResolver(schema) as Resolver<TeamMemberCreate>,
    defaultValues: {
      user_id: 0,
      role_in_team: 'PFMEA Owner',
      department: 'Ingeniería',
    },
  });

  const selectedUserId = useWatch({control,name:'user_id'});

  useEffect(() => {
    if (selectedUserId && selectedUserId !== 0) {
      const user = users.find((u) => Number(u.id) === Number(selectedUserId));
      if (user && user.department) {
        setValue('department', user.department, { shouldValidate: true });
      }
      if (user && user.role_name) {
        setValue('role_in_team', user.role_name, { shouldValidate: true });
      }
    }
  }, [selectedUserId, users, setValue]);


  useEffect(() => {
    if (isOpen) {
      userService.lookup().then(setUsers).catch(console.error);
      reset({ user_id: 0, role_in_team: 'PFMEA Owner', department: 'Ingeniería' });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: TeamMemberCreate) => {
    try {
      await pfmeaService.addTeamMember(pfmeaId, data);
      toast.success(t('pfmea.team.addSuccess', 'Miembro agregado exitosamente'));
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('Failed to add team member', error);
      const detail = getErrorMessage(error);

      if (detail === 'User is already a team member for this PFMEA.') {
        const selectedUser = users.find((u) => Number(u.id) === Number(data.user_id));
        const userName = selectedUser ? selectedUser.full_name || selectedUser.email : 'Usuario';
        toast.error(
          t('pfmea.team.userAlreadyInTeam', `El usuario {{userName}} ya pertenece al equipo en el departamento de {{department}}.`, {
            userName,
            department: data.department,
          })
        );
      } else {
        toast.error(detail || t('pfmea.team.addError', 'Error al agregar miembro al equipo.'));
      }
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    try {
      setIsDeleting(memberId);
      await pfmeaService.removeTeamMember(pfmeaId, memberId);
      toast.success(t('pfmea.team.removeSuccess', 'Miembro eliminado del equipo'));
      onSuccess();
    } catch (error: unknown) {
      console.error('Failed to remove team member', error);
      toast.error(t('pfmea.team.removeError', 'Error al eliminar miembro del equipo'));
    } finally {
      setIsDeleting(null);
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
          className="glass-card w-full max-w-lg overflow-hidden rounded-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-steel-700/50 bg-steel-900/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forge-glow text-forge-400">
                <Users size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-steel-100">
                  {t('pfmea.team.title', 'Equipo Multidisciplinario')}
                </h2>
                <p className="text-xs text-steel-400">
                  {t('pfmea.team.subtitle', 'Gestión de miembros y roles asignados al proyecto')}
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

          <div className="p-6 overflow-y-auto space-y-6">
            {/* Existing Team Members List */}
            {teamMembers.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-steel-400 flex items-center gap-1.5">
                  <Users size={12} className="text-emerald-400" />
                  {t('pfmea.team.currentMembers', 'Miembros Actuales')} ({teamMembers.length})
                </span>
                <div className="divide-y divide-steel-800/60 border border-steel-700/50 rounded-xl overflow-hidden bg-steel-950/30">
                  {teamMembers.map((m) => (
                    <div key={m.id || m.user_id} className="flex items-center justify-between px-3.5 py-2.5 hover:bg-steel-900/40 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-steel-100">
                          {m.user_full_name || `Usuario #${m.user_id}`}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                            {m.role_in_team}
                          </span>
                          {m.department && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                              • {m.department}
                            </span>
                          )}
                        </div>
                      </div>
                      {m.id && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m.id!)}
                          disabled={isDeleting === m.id}
                          className="p-1.5 text-steel-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title={t('common.delete', 'Eliminar')}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Member Section */}
            <div className="space-y-4 pt-2 border-t border-steel-700/40">
              <span className="text-[10px] font-bold uppercase tracking-widest text-steel-400 flex items-center gap-1.5">
                <UserPlus size={12} className="text-forge-400" />
                {t('pfmea.team.addMember', 'Agregar Nuevo Miembro')}
              </span>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* User Selection */}
                <div className="flex flex-col gap-1.5 group">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400">
                    {t('pfmea.team.selectUser', 'Seleccionar Usuario')}
                  </label>
                  <select
                    {...register('user_id')}
                    disabled={isLoadingUsers}
                    className="w-full bg-steel-950/40 border border-steel-700/50 hover:border-steel-600 focus:border-forge-500 rounded-xl px-3.5 py-2 text-xs text-steel-100 transition-all font-medium focus:outline-none"
                  >
                    <option value={0} disabled>
                      {isLoadingUsers ? t('pfmea.team.loadingUsers', 'Cargando...') : t('common.select', 'Seleccionar usuario...')}
                    </option>
                    {users.map((u) => (
                      <option key={u.id} value={Number(u.id)} className="bg-steel-900 text-steel-100">
                        {u.full_name || u.email}
                      </option>
                    ))}
                  </select>
                  {errors.user_id && <span className="text-xs text-red-400">{errors.user_id.message}</span>}
                </div>

                {/* Role and Department Selection */}
                {selectedUserId && selectedUserId !== 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Role Selection */}
                    <div className="flex flex-col gap-1.5 group">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400">
                        {t('pfmea.team.role', 'Rol en el Equipo')}
                      </label>
                      <select
                        {...register('role_in_team')}
                        className="w-full bg-steel-950/40 border border-steel-700/50 hover:border-steel-600 focus:border-forge-500 rounded-xl px-3 py-2 text-xs text-steel-100 font-medium focus:outline-none"
                      >
                        {FMEA_ROLES.map((r) => (
                          <option key={r} value={r} className="bg-steel-900 text-steel-100">
                            {r}
                          </option>
                        ))}
                      </select>
                      {errors.role_in_team && <span className="text-xs text-red-400">{errors.role_in_team.message}</span>}
                    </div>

                    {/* Department Selection */}
                    <div className="flex flex-col gap-1.5 group">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400">
                        {t('pfmea.team.department', 'Departamento')}
                      </label>
                      <select
                        {...register('department')}
                        className="w-full bg-steel-950/40 border border-steel-700/50 hover:border-steel-600 focus:border-forge-500 rounded-xl px-3 py-2 text-xs text-steel-100 font-medium focus:outline-none"
                      >
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d} className="bg-steel-900 text-steel-100">
                            {d}
                          </option>
                        ))}
                      </select>
                      {errors.department && <span className="text-xs text-red-400">{errors.department.message}</span>}
                    </div>
                  </div>
                ) : null}

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-1.5 text-xs font-medium text-steel-300 hover:text-steel-100 transition-colors cursor-pointer"
                  >
                    {t('common.cancel', 'Cancelar')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedUserId || selectedUserId === 0}
                    className="flex items-center gap-2 px-4 py-1.5 bg-forge-600 hover:bg-forge-500 text-white text-xs font-medium rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isSubmitting ? t('common.saving', 'Guardando...') : t('common.save', 'Agregar al Equipo')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
