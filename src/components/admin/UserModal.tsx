import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Mail, Lock, Briefcase, Building, Building2, Wand2 } from 'lucide-react';
import { departmentService, type Department } from '../../api/departmentService';
import { DepartmentCatalogModal } from './DepartmentCatalogModal';

export interface UserFormData {
  full_name: string;
  email: string;
  password?: string;
  role_name: string;
  department_id?: string;
  employment_position?: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => Promise<void>;
  userToEdit?: { id: string, full_name: string, email: string, role_name: string, department_id?: string | null } | null;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
  const { t } = useTranslation();
  
  const schema = yup.object().shape({
    full_name: yup.string().required('El nombre es requerido'),
    email: yup.string().email('Correo inválido').required('El correo es requerido'),
    password: yup.string().when('$isEditing', (isEditing, schema) => {
      return isEditing ? schema.notRequired() : schema.required('La contraseña es requerida').min(6, 'Mínimo 6 caracteres');
    }),
    role_name: yup.string().required('El rol es requerido'),
    department_id: yup.string().optional(),
    employment_position: yup.string().optional(),
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting, dirtyFields } } = useForm<UserFormData>({
    resolver: yupResolver(schema) as any,
    context: { isEditing: !!userToEdit }
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

  const fullNameValue = watch('full_name');

  useEffect(() => {
    if (fullNameValue && !dirtyFields.email && !userToEdit) {
      const parts = fullNameValue.trim().toLowerCase().split(/\s+/);
      if (parts.length >= 2) {
        // remove accents and special chars
        const cleanName = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
        const emailPrefix = `${cleanName(parts[0])}.${cleanName(parts[1])}`;
        setValue('email', `${emailPrefix}@adlerpelzer.com`, { shouldValidate: true });
      } else if (parts.length === 1 && parts[0] !== '') {
        const cleanName = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
        const emailPrefix = cleanName(parts[0]);
        setValue('email', `${emailPrefix}@adlerpelzer.com`, { shouldValidate: true });
      }
    }
  }, [fullNameValue, dirtyFields.email, userToEdit, setValue]);

  const loadDepartments = async () => {
    try {
      const data = await departmentService.list();
      setDepartments(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
    }
  }, [isOpen, isDeptModalOpen]);

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        reset({
          full_name: userToEdit.full_name,
          email: userToEdit.email,
          role_name: userToEdit.role_name,
          department_id: userToEdit.department_id || '',
          password: '',
        });
      } else {
        reset({
          full_name: '',
          email: '',
          password: '',
          role_name: 'Viewer',
          department_id: '',
        });
      }
    }
  }, [isOpen, userToEdit, reset]);

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue('password', pass, { shouldValidate: true, shouldDirty: true });
  };

  if (!isOpen) return null;

  const onSubmit = async (data: UserFormData) => {
    try {
      await onSave(data);
      onClose();
    } catch (err) {
      // Error handling is managed by the parent
    }
  };

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-steel-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-steel-900 border border-steel-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-steel-800/80 flex items-center justify-between bg-steel-950/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {userToEdit ? t('admin.users.modal.editTitle', 'Editar Usuario') : t('admin.users.modal.createTitle', 'Registrar Nuevo Usuario')}
                </h3>
                <p className="text-xs text-steel-500 dark:text-steel-400">
                  {userToEdit ? t('admin.users.modal.editSubtitle', 'Modifica los datos del usuario') : t('admin.users.modal.createSubtitle', 'Crea un nuevo perfil')}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-steel-400 hover:bg-steel-800 rounded-lg transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-5">
            <div>
              <label className="text-xs font-semibold text-steel-300 uppercase tracking-wider block mb-1.5">
                {t('admin.users.modal.fullName', 'Nombre Completo')}
              </label>
              <div className="relative">
                <input
                  {...register('full_name')}
                  type="text"
                  className="w-full bg-steel-950 border border-steel-700 rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  placeholder={t('admin.users.modal.fullNamePlaceholder', 'Ej. Juan Pérez')}
                />
                <UserPlus className="absolute left-3 top-3 w-4 h-4 text-steel-400" />
              </div>
              {errors.full_name && <p className="text-alert-red text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-steel-300 uppercase tracking-wider block mb-1.5">
                {t('admin.users.modal.email', 'Correo Electrónico')}
              </label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  disabled={!!userToEdit}
                  className="w-full bg-steel-950 border border-steel-700 rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium disabled:opacity-50"
                  placeholder={t('admin.users.modal.emailPlaceholder', 'usuario@adlerpelzer.com')}
                />
                <Mail className="absolute left-3 top-3 w-4 h-4 text-steel-400" />
              </div>
              {errors.email && <p className="text-alert-red text-xs mt-1">{errors.email.message}</p>}
            </div>

            {!userToEdit && (
              <div>
                <label className="block text-xs font-semibold text-steel-600 dark:text-steel-300 uppercase tracking-wider mb-1.5">
                  {t('admin.users.modal.password', 'Contraseña Provisional')}
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type="password"
                    className="w-full bg-steel-950 border border-steel-700 rounded-lg pl-10 pr-12 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                    placeholder={t('admin.users.modal.passwordPlaceholder', 'Min. 6 caracteres')}
                  />
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-steel-400" />
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="absolute right-2 top-2 p-1 text-steel-400 hover:text-indigo-400 bg-steel-900 rounded-md transition-colors"
                    title={t('admin.users.modal.generatePassword', 'Generar Automáticamente')}
                  >
                    <Wand2 className="w-4 h-4" />
                  </button>
                </div>
                {errors.password && <p className="text-alert-red text-xs mt-1">{errors.password.message}</p>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-steel-600 dark:text-steel-300 uppercase tracking-wider mb-1.5">
                  {t('admin.users.modal.role', 'Rol en Sistema')}
                </label>
                <select
                  {...register('role_name')}
                  className="w-full bg-steel-950 border border-steel-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="PFMEA Owner">PFMEA Owner</option>
                  <option value="Team Member">Team Member</option>
                  <option value="Viewer">Viewer</option>
                </select>
                {errors.role_name && <p className="text-alert-red text-xs mt-1">{errors.role_name.message}</p>}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-steel-300 uppercase tracking-widest block">
                    {t('admin.users.modal.department', 'Departamento')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsDeptModalOpen(true)}
                    className="text-[10px] text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
                  >
                    {t('admin.users.modal.editCatalog', 'Edit Catalog')}
                  </button>
                </div>
                <div className="relative">
                  <select
                    {...register('department_id')}
                    className="w-full bg-steel-950 border border-steel-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  >
                    <option value="">{t('admin.users.modal.selectDepartment', 'Seleccionar...')}</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                  <Building2 className="absolute left-3 top-3 w-4 h-4 text-steel-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-steel-800/80 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg text-sm text-steel-400 hover:bg-steel-850 transition-colors font-medium cursor-pointer"
              >
                {t('admin.users.modal.cancel', 'Cancelar')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-900/60 disabled:text-indigo-200 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-indigo-900/20 cursor-pointer"
              >
                {isSubmitting && (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {t('admin.users.modal.save', 'Guardar Usuario')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
      <DepartmentCatalogModal 
        isOpen={isDeptModalOpen} 
        onClose={() => setIsDeptModalOpen(false)} 
      />
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
