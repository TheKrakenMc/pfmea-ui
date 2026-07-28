import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Edit2, Building2, Search } from 'lucide-react';
import { departmentService, type Department, type DepartmentCreate } from '../../api/departmentService';

interface DepartmentCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const schema = yup.object().shape({
  name: yup.string().required('Requerido'),
  is_active: yup.boolean()
});

export const DepartmentCatalogModal: React.FC<DepartmentCatalogModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setValue } = useForm<DepartmentCreate & { is_active?: boolean }>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: '',
      is_active: true
    }
  });

  const loadDepartments = async () => {
    try {
      setIsLoading(true);
      const data = await departmentService.list();
      setDepartments(data);
    } catch (error) {
      console.error("Failed to load departments", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
      reset({ name: '', is_active: true });
      setEditingId(null);
    }
  }, [isOpen]);

  const onSubmit = async (data: DepartmentCreate & { is_active?: boolean }) => {
    try {
      if (editingId) {
        await departmentService.update(editingId, data);
      } else {
        await departmentService.create({ name: data.name });
      }
      reset({ name: '', is_active: true });
      setEditingId(null);
      await loadDepartments();
    } catch (error) {
      console.error("Failed to save department", error);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingId(department.id);
    setValue('name', department.name);
    setValue('is_active', department.is_active);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('common.confirmDelete', '¿Estás seguro de eliminar este elemento?'))) {
      try {
        await departmentService.delete(id);
        await loadDepartments();
      } catch (error) {
        console.error("Failed to delete department", error);
      }
    }
  };

  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-steel-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-card w-full max-w-2xl overflow-hidden rounded-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-steel-700/50 bg-steel-900/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forge-glow text-forge-400">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-steel-100">
                  {t('admin.catalog.department.title', 'Catálogo de Departamentos')}
                </h2>
                <p className="text-xs text-steel-400">
                  {t('admin.catalog.department.subtitle', 'Gestiona las opciones de departamentos disponibles')}
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

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Form */}
            <div className="bg-steel-900/30 border border-steel-700/30 rounded-xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-steel-400 mb-4 flex items-center gap-2">
                {editingId ? <Edit2 size={14} className="text-amber-400" /> : <Plus size={14} className="text-forge-400" />}
                {editingId ? t('common.edit', 'Editar') : t('common.add', 'Agregar Nuevo')}
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 group">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 transition-colors group-focus-within:text-forge-400">
                      {t('admin.catalog.department.name', 'Nombre del Departamento')}
                    </label>
                    <input
                      {...register('name')}
                      className="w-full bg-steel-950 border border-steel-700 hover:border-steel-600 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-steel-100 transition-all font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder={t('admin.catalog.department.placeholder', 'Ej. Ingeniería')}
                    />
                    {errors.name && <span className="text-xs text-red-400">{errors.name.message}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    {...register('is_active')}
                    className="rounded border-steel-700 bg-steel-900 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="is_active" className="text-sm text-steel-300 cursor-pointer">
                    {t('common.active', 'Activo')}
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        reset({ name: '', is_active: true });
                      }}
                      className="px-4 py-2 text-sm font-medium text-steel-300 hover:text-steel-100 transition-colors cursor-pointer"
                    >
                      {t('common.cancel', 'Cancelar')}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? t('common.saving', 'Guardando...') : t('common.save', 'Guardar')}
                  </button>
                </div>
              </form>
            </div>

            {/* List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-steel-400">
                  {t('admin.catalog.department.list', 'Departamentos Registrados')}
                </h3>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-500" />
                  <input 
                    type="text"
                    placeholder={t('common.search', 'Buscar...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-steel-950 border border-steel-800 hover:border-steel-700 focus:border-indigo-500 rounded-lg pl-9 pr-4 py-1.5 text-sm text-steel-200 transition-all font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-64"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-8 text-steel-400 text-sm">{t('common.loading', 'Cargando...')}</div>
              ) : departments.length === 0 ? (
                <div className="text-center py-8 text-steel-500 text-sm bg-steel-900/20 rounded-xl border border-dashed border-steel-800/50">
                  {t('common.noData', 'No hay registros')}
                </div>
              ) : filteredDepartments.length === 0 ? (
                <div className="text-center py-8 text-steel-500 text-sm bg-steel-900/20 rounded-xl border border-dashed border-steel-800/50">
                  {t('common.noResults', 'No se encontraron resultados')}
                </div>
              ) : (
                <div className="bg-steel-900 border border-steel-800 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-steel-950/50 text-steel-400 text-[10px] uppercase tracking-wider border-b border-steel-800">
                        <th className="px-4 py-3 font-semibold">{t('admin.catalog.department.name', 'Nombre del Departamento')}</th>
                        <th className="px-4 py-3 font-semibold w-24 text-center">{t('common.status', 'Estado')}</th>
                        <th className="px-4 py-3 font-semibold w-24 text-right">{t('common.actions', 'Acciones')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-steel-800/50 text-sm">
                      {filteredDepartments.map((dept) => (
                        <tr
                          key={dept.id}
                          className="hover:bg-steel-800/50 transition-colors group"
                        >
                          <td className="px-4 py-3 text-steel-200 font-medium">
                            {dept.name}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {dept.is_active ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {t('common.active', 'Activo')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                {t('common.inactive', 'Inactivo')}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEdit(dept)}
                                className="p-1.5 text-steel-400 hover:text-indigo-400 bg-steel-950 hover:bg-steel-800 rounded-md transition-colors cursor-pointer border border-transparent hover:border-steel-700/50"
                                title={t('common.edit', 'Editar')}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(dept.id)}
                                className="p-1.5 text-steel-400 hover:text-red-400 bg-steel-950 hover:bg-steel-800 rounded-md transition-colors cursor-pointer border border-transparent hover:border-steel-700/50"
                                title={t('common.delete', 'Eliminar')}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
