import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Users, Edit, UserX, UserCheck, Mail, Key } from 'lucide-react';
import { UserModal, type UserFormData } from '../../components/admin/UserModal';
import { departmentService, type Department } from '../../api/departmentService';

interface User {
  id: string;
  full_name: string;
  email: string;
  role_id: string | null;
  role_name: string;
  department_id: string | null;
  is_active: boolean;
  is_verified: boolean;
}

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // Check if current user is an Administrator
  const isAdmin = currentUser?.role_name?.toLowerCase() === 'administrator' || 
                  currentUser?.role_name?.toLowerCase() === 'admin';

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const [usersRes, deptsRes] = await Promise.all([
        axiosClient.get<User[]>('/users'),
        departmentService.list()
      ]);
      setUsers(usersRes.data);
      setDepartments(deptsRes);
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || t('admin.users.errors.loadFailedDesc', 'No se pudieron cargar los usuarios. Verifica tus permisos.');
      toast.error(t('admin.users.errors.loadFailed', 'Error al cargar datos'), { description: errMsg });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleRoleChange = async (userId: string, newRoleName: string) => {
    setIsUpdating(userId);
    try {
      await axiosClient.put(`/users/${userId}/role`, {
        role_name: newRoleName
      });
      toast.success(t('admin.users.success.roleUpdated', 'Rol actualizado'), {
        description: t('admin.users.success.roleUpdatedDesc', 'Se ha reasignado el rol técnico a {{role}} correctamente.', { role: newRoleName })
      });
      fetchUsers();
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || t('admin.users.errors.updateRole', 'Error al actualizar rol');
      toast.error(t('admin.users.errors.updateRole', 'Error al actualizar rol'), { description: errMsg });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean, fullName: string) => {
    if (userId === currentUser?.id) {
      toast.error(t('admin.users.errors.restrictedAccess', 'Acceso denegado'), { description: t('admin.users.errors.selfDeactivate', 'No puedes desactivar tu propia cuenta de administrador.') });
      return;
    }

    setIsUpdating(userId);
    const newStatus = !currentStatus;
    try {
      await axiosClient.put(`/users/${userId}/status`, {
        is_active: newStatus
      });
      
      const actionText = newStatus ? t('admin.users.actions.reactivate', 'reactivado') : t('admin.users.status.archived', 'archivado (desactivado)');
      toast.success(t('admin.users.success.statusUpdated', 'Usuario {{status}}', { status: newStatus ? t('admin.users.status.active', 'Activo') : t('admin.users.status.archived', 'Archivado') }), {
        description: t('admin.users.success.statusUpdatedDesc', 'El usuario se ha {{action}} con éxito.', { action: actionText })
      });
      fetchUsers();
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || t('admin.users.errors.updateStatus', 'Error de actualización');
      toast.error(t('admin.users.errors.updateStatus', 'Error de actualización'), { description: errMsg });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleResendVerification = async (userId: string) => {
    setIsUpdating(userId);
    try {
      await axiosClient.post(`/users/${userId}/resend-verification`);
      toast.success(t('admin.users.success.verificationResent', 'Enlace reenviado'), {
        description: t('admin.users.success.verificationResentDesc', 'Se ha enviado un nuevo enlace de verificación (válido por 24h).')
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || t('admin.users.errors.resendVerification', 'Error al reenviar el enlace');
      toast.error(t('admin.users.errors.resendVerification', 'Error al reenviar el enlace'), { description: errMsg });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleResetPassword = async (userId: string, userEmail: string) => {
    setIsUpdating(userId);
    try {
      await axiosClient.post('/users/reset-password-request', { email: userEmail });
      toast.success(t('admin.users.success.passwordReset', 'Contraseña restablecida'), {
        description: t('admin.users.success.passwordResetDesc', 'Se ha enviado un correo al usuario con la nueva contraseña temporal.')
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || t('admin.users.errors.passwordReset', 'Error al restablecer contraseña');
      toast.error(t('admin.users.errors.passwordReset', 'Error al restablecer contraseña'), { description: errMsg });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleSaveUser = async (data: UserFormData) => {
    try {
      if (userToEdit) {
        // Edit User
        await axiosClient.put(`/users/${userToEdit.id}`, data);
        toast.success(t('admin.users.success.userUpdated', 'Usuario Actualizado'), {
          description: t('admin.users.success.userUpdatedDesc', 'Los datos del usuario han sido actualizados con éxito.')
        });
      } else {
        // Create User
        await axiosClient.post('/users/admin', data);
        toast.success(t('admin.users.success.userCreated', 'Usuario Creado'), {
          description: t('admin.users.success.userCreatedDesc', 'El nuevo usuario se ha registrado correctamente.')
        });
      }
      fetchUsers();
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Error al procesar la solicitud.';
      toast.error('Error', { description: errMsg });
      throw err;
    }
  };

  const openCreateModal = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4 bg-transparent">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-alert-red-glow text-alert-red border border-alert-red/20">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-steel-50">{t('admin.users.errors.restrictedAccess', 'Acceso Restringido')}</h1>
        <p className="mt-2 text-sm text-steel-600 dark:text-steel-400 max-w-md">
          {t('admin.users.errors.restrictedDesc', 'Esta sección está reservada exclusivamente para los Administradores de planta de Adler Pelzer Group. Si consideras que esto es un error, por favor ponte en contacto con soporte técnico.')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-transparent p-6 md:p-8 min-h-screen text-steel-100 transition-colors max-w-7xl mx-auto w-full">
      
      {/* Dashboard Title Section */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-steel-50">
            <Users className="w-7 h-7 text-indigo-400" />
            {t('admin.users.title', 'Gestión de Usuarios')}
          </h1>
          <p className="mt-1 text-sm text-steel-600 dark:text-steel-400">
            {t('admin.users.subtitle', 'Administración de accesos, roles de trabajo y auditoría de personal de la planta APG Puebla.')}
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-500 px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-900/20 cursor-pointer whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t('admin.users.addUser', 'Añadir Usuario')}
          </button>
          
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-steel-300 bg-steel-900 border border-steel-700 hover:bg-steel-800 transition-colors whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            {t('admin.users.refresh', 'Actualizar')}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-steel-600 dark:text-steel-400">
          <svg className="animate-spin h-8 w-8 text-forge-400 mr-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>{t('admin.users.loading', 'Cargando directorio de personal...')}</span>
        </div>
      ) : (
        <div className="bg-steel-900 border border-steel-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-steel-300">
              <thead className="bg-steel-900/50 text-xs uppercase text-steel-400 border-b border-steel-800">
                <tr>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">{t('admin.users.table.staff', 'Personal')}</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">{t('admin.users.table.email', 'Correo')}</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">{t('admin.users.table.role', 'Rol Técnico')}</th>
                  <th className="px-6 py-4 font-semibold text-center whitespace-nowrap">{t('admin.users.table.verification', 'Verificación')}</th>
                  <th className="px-6 py-4 font-semibold text-center whitespace-nowrap">{t('admin.users.table.tisax', 'Estado TISAX')}</th>
                  <th className="px-6 py-4 font-semibold text-center whitespace-nowrap">{t('admin.users.table.actions', 'Acciones')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-800">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-steel-500 dark:text-steel-400">
                      {t('admin.users.noUsers', 'No se encontraron usuarios registrados.')}
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    const isArchived = !u.is_active;

                    return (
                      <tr 
                        key={u.id} 
                        className={`hover:bg-steel-800/30 transition-colors group ${
                          isArchived ? 'opacity-65' : ''
                        }`}
                      >
                        {/* Full Name & Archived indicator */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold border ${
                              isArchived 
                                ? 'bg-steel-800/50 text-steel-500 border-steel-700' 
                                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            }`}>
                              {u.full_name ? u.full_name.replace("ARCHIVED ", "").slice(0, 2).toUpperCase() : 'US'}
                            </div>
                            <div>
                              <div className="font-medium text-steel-200 flex items-center gap-2">
                                <span className={isArchived ? 'line-through text-steel-500 font-normal italic' : ''}>
                                  {u.full_name}
                                </span>
                                {isArchived && (
                                  <span className="rounded bg-slate-500/20 border border-slate-500/50 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                    {t('admin.users.status.archived', 'Archivado')}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-steel-500 dark:text-steel-400 mt-0.5">
                                {u.department_id 
                                  ? departments.find(d => d.id.toString() === u.department_id)?.name || t('admin.users.noDepartment', 'Sin departamento')
                                  : t('admin.users.noDepartment', 'Sin departamento')
                                }
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4 text-steel-400 font-medium whitespace-nowrap">
                          {u.email}
                        </td>

                        {/* Role Select Dropdown */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={u.role_name}
                            disabled={isSelf || isUpdating === u.id}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="bg-steel-950 border border-steel-700 rounded-lg px-3 py-1.5 text-xs text-steel-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium disabled:opacity-50"
                          >
                            <option value="Administrator">Administrator</option>
                            <option value="PFMEA Owner">PFMEA Owner</option>
                            <option value="Team Member">Team Member</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                        </td>

                        {/* Verification Badge */}
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${
                            u.is_verified 
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' 
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${u.is_verified ? 'bg-blue-400' : 'bg-amber-400'}`}></span>
                            {u.is_verified ? t('admin.users.status.verified', 'Verificada') : t('admin.users.status.unverified', 'No verificada')}
                          </span>
                        </td>

                        {/* Active Status Badge */}
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${
                            u.is_active 
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                              : 'bg-slate-500/20 text-slate-400 border-slate-500/50'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${u.is_active ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                            {u.is_active ? t('admin.users.status.active', 'Activo') : t('admin.users.status.inactive', 'Inactivo')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!isArchived && (
                              <button
                                onClick={() => handleEditUser(u)}
                                className="p-1.5 text-steel-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors cursor-pointer focus-ring"
                                title={t('admin.users.actions.edit', 'Editar perfil')}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            
                            {!isSelf && !isArchived && (
                              <button
                                onClick={() => handleOpenDeleteModal(u)}
                                className="p-1.5 text-steel-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer focus-ring"
                                title={t('admin.users.actions.archive', 'Archivar usuario')}
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            )}

                            {!isSelf && isArchived && (
                              <button
                                onClick={() => handleRestoreUser(u.id)}
                                className="p-1.5 text-steel-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors cursor-pointer focus-ring"
                                title={t('admin.users.actions.restore', 'Restaurar usuario')}
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                            
                            {isSelf && (
                              <span className="text-xs text-steel-500 italic px-2">
                                {t('admin.users.status.current', '(Tú)')}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        userToEdit={userToEdit}
      />
    </div>
  );
};
