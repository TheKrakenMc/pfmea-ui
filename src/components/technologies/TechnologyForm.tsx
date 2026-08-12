import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { Zap, X, Plus, Trash2, Loader2, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TechnologyCategoryManager from './TechnologyCategoryManager';
import {
  useCreateTechnology,
  useUpdateTechnology,
  useTechnologyCategories,
} from '../../hooks/useTechnology';
import type { Technology } from '../../types/technology.types';

interface TechnologyFormProps {
  tech: Technology | null;
  onClose: () => void;
  onSuccess?: () => void;
  isOpen?: boolean;
}

const schema = Yup.object().shape({
  name: Yup.string().required('Nombre es requerido'),
  category: Yup.string().required('Categoría es requerida'),
  description: Yup.string().optional(),
});

type FormValues = {
  name: string;
  category: string;
  description: string;
};

const TechnologyForm: React.FC<TechnologyFormProps> = ({ tech, onClose, onSuccess, isOpen = true }) => {
  const { t } = useTranslation();
  const isEdit = !!tech?.id;
  const { data: categories } = useTechnologyCategories();
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);


  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: tech?.name || '',
      category: tech?.category || '',
      description: tech?.description || '',
    },
  });

  useEffect(() => {
    reset({
      name: tech?.name || '',
      category: tech?.category || (categories?.[0]?.name ?? ''),
      description: tech?.description || '',
    });
  }, [tech, categories, reset]);

  const createMutation = useCreateTechnology();
  const updateMutation = useUpdateTechnology();

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: tech!.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess?.();
    } catch (err) {
      console.error('Error submitting technology form:', err);
    }
  };


  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-steel-950/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-steel-900 border border-steel-800 rounded-2xl w-full max-w-4xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-steel-800/80 flex items-center justify-between bg-steel-950/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-steel-100">{isEdit ? t('technologies.form.editTitle') : t('technologies.form.createTitle')}</h3>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-steel-400 hover:bg-steel-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="tech-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="tech-name" className="text-xs font-semibold text-steel-400 uppercase tracking-wider block flex items-center gap-1">
                        {t('technologies.form.name')} <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            id="tech-name"
                            className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3 py-2 text-sm placeholder-steel-500 text-steel-100 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                            aria-invalid={!!errors.name}
                          />
                        )}
                      />
                      {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="tech-category" className="text-xs font-semibold text-steel-400 uppercase tracking-wider block flex items-center gap-1">
                          {t('technologies.form.category')} <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsCategoryManagerOpen(true)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                          title={t('technologies.categories.manageTitle', 'Manage Categories')}
                        >
                          <Settings size={14} />
                          <span>{t('technologies.categories.manageTitle', 'Manage Categories')}</span>
                        </button>
                      </div>
                      <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            id="tech-category"
                            className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3 py-2 text-sm text-steel-100 focus:outline-none focus:border-indigo-500 transition-all"
                            aria-invalid={!!errors.category}
                          >
                            <option value="">{t('technologies.form.selectCategory')}</option>
                            {categories?.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="tech-desc" className="text-xs font-semibold text-steel-400 uppercase tracking-wider block flex items-center gap-1">
                      {t('technologies.form.description')}
                    </label>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          id="tech-desc"
                          rows={3}
                          className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3 py-2 text-sm placeholder-steel-500 text-steel-100 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                        />
                      )}
                    />
                  </div>


                </form>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-steel-800/80 bg-steel-950/50">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg text-sm text-steel-500 hover:text-steel-700 dark:text-steel-400 dark:hover:text-steel-200 hover:bg-steel-100 dark:hover:bg-steel-850 transition-colors font-medium cursor-pointer"
                  disabled={isSubmitting}
                >
                  {t('technologies.form.cancel')}
                </button>
                <button
                  type="submit"
                  form="tech-form"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-900/60 disabled:text-indigo-200 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-indigo-900/20 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                  {t('technologies.form.submit')}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
    <TechnologyCategoryManager
      isOpen={isCategoryManagerOpen}
      onClose={() => setIsCategoryManagerOpen(false)}
    />
    </>
  );
};

export default TechnologyForm;
