import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import type { Machinery, MachineryCreatePayload, MachineryUpdatePayload } from '../../types/machinery.types';
import { listPlants } from '../../services/plantService';
import { listLocations } from '../../services/locationService';
import { useTranslation } from 'react-i18next';

interface MachineryFormProps {
  initialData?: Machinery | null;
  onSubmit: (data: MachineryCreatePayload | MachineryUpdatePayload) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const MachineryForm: React.FC<MachineryFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const { t } = useTranslation();
  const { data: plants = [], isLoading: isLoadingPlants } = useQuery({
    queryKey: ['plants'],
    queryFn: () => listPlants(),
  });

  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => listLocations(),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MachineryCreatePayload>({
    defaultValues: {
      plant_id: 1, // Defaulting to 1 for now
      location_id: undefined,
      machinery_code: '',
      machinery_name: '',
      is_active: true,
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        plant_id: initialData.plant_id,
        location_id: initialData.location_id,
        machinery_code: initialData.machinery_code,
        machinery_name: initialData.machinery_name,
        is_active: initialData.is_active,
      });
    } else {
      reset({
        plant_id: plants.length > 0 ? plants[0].id : 1,
        location_id: undefined,
        machinery_code: '',
        machinery_name: '',
        is_active: true,
      });
    }
  }, [initialData, reset, plants]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
            {t('machinery.form.assetCode', 'Código de Activo')} <span className="text-red-400">*</span>
          </label>
          <input
            {...register('machinery_code', { 
              required: t('machinery.form.errors.codeRequired', 'El código es requerido'),
              pattern: {
                value: /^[a-zA-Z0-9-]+$/,
                message: t('machinery.form.errors.codeInvalid', 'Formato inválido. Use letras, números y guiones.')
              }
            })}
            className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
            placeholder={t('machinery.form.assetCodePlaceholder', 'ej. INJ-04')}
          />
          {errors.machinery_code && (
            <p className="text-red-400 text-xs mt-1.5">{errors.machinery_code.message}</p>
          )}
        </div>
        
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
            {t('machinery.form.status', 'Estatus')}
          </label>
          <select
            {...register('is_active', { setValueAs: v => v === 'true' || v === true })}
            className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
          >
            <option value="true">{t('machinery.form.statusActive', 'Activo')}</option>
            <option value="false">{t('machinery.form.statusInactive', 'Inactivo')}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
          {t('machinery.form.name', 'Nombre de Maquinaria')} <span className="text-red-400">*</span>
        </label>
        <input
          {...register('machinery_name', { required: t('machinery.form.errors.nameRequired', 'El nombre es requerido') })}
          className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
          placeholder={t('machinery.form.namePlaceholder', 'ej. Inyectora 500T')}
        />
        {errors.machinery_name && (
          <p className="text-red-400 text-xs mt-1.5">{errors.machinery_name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
            {t('machinery.form.plant', 'Planta')} <span className="text-red-400">*</span>
          </label>
          <select
            {...register('plant_id', { required: t('machinery.form.errors.plantRequired', 'Planta es requerida'), valueAsNumber: true })}
            disabled={isLoadingPlants}
            className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
          >
            {plants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name} ({plant.code})
              </option>
            ))}
            {plants.length === 0 && !isLoadingPlants && (
              <option value={1}>{t('machinery.form.plantDefault', '1 - Default')}</option>
            )}
          </select>
          {errors.plant_id && (
            <p className="text-red-400 text-xs mt-1.5">{errors.plant_id.message}</p>
          )}
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
            {t('machinery.form.location', 'Ubicación (Opcional)')}
          </label>
          <select
            {...register('location_id', { valueAsNumber: true })}
            disabled={isLoadingLocations}
            className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
          >
            <option value="">{t('machinery.form.locationSelect', '-- Seleccionar ubicación --')}</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.location_name} ({loc.location_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2.5 rounded-lg text-sm text-steel-400 hover:bg-steel-850 transition-colors font-medium cursor-pointer disabled:opacity-50"
        >
          {t('machinery.form.cancel', 'Cancelar')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 cursor-pointer transition-all disabled:bg-indigo-900/60 disabled:text-indigo-200 text-sm font-medium"
        >
          {isSubmitting ? t('machinery.form.saving', 'Guardando...') : initialData ? t('machinery.form.submitUpdate', 'Actualizar Maquinaria') : t('machinery.form.submitCreate', 'Crear Maquinaria')}
        </button>
      </div>
    </form>
  );
};
