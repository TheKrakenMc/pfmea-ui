import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { Customer, CustomerCreatePayload, CustomerUpdatePayload } from '../../types/customer.types';

interface CustomerFormProps {
  initialData?: Customer | null;
  onSubmit: (data: CustomerCreatePayload | CustomerUpdatePayload) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CustomerCreatePayload>({
    defaultValues: {
      plant_id: 1, // Defaulting to 1
      customer_code: '',
      company_name: '',
      contact_email: '',
      status: 'active',
      safety_characteristic: 'D',
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        plant_id: initialData.plant_id,
        customer_code: initialData.customer_code,
        company_name: initialData.company_name,
        contact_email: initialData.contact_email || '',
        status: initialData.status || 'active',
        safety_characteristic: initialData.safety_characteristic || 'D',
      });
    } else {
      reset({
        plant_id: 1,
        customer_code: '',
        company_name: '',
        contact_email: '',
        status: 'active',
        safety_characteristic: 'D',
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
            Customer Code <span className="text-red-400">*</span>
          </label>
          <input
            {...register('customer_code', { required: 'Customer code is required' })}
            className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
            placeholder="e.g. CUST-001"
          />
          {errors.customer_code && (
            <p className="text-red-400 text-xs mt-1.5">{errors.customer_code.message}</p>
          )}
        </div>
        
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
            Status
          </label>
          <select
            {...register('status')}
            className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
          Company Name <span className="text-red-400">*</span>
        </label>
        <input
          {...register('company_name', { required: 'Company name is required' })}
          className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
          placeholder="e.g. Acme Corp"
        />
        {errors.company_name && (
          <p className="text-red-400 text-xs mt-1.5">{errors.company_name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
            Contact Email
          </label>
          <input
            {...register('contact_email')}
            type="email"
            className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
            placeholder="contact@example.com"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-steel-800">
        <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
          {t('customers.safety.title')} <span className="text-red-400">*</span>
        </label>
        <p className="text-xs text-steel-500 mb-4">
          {t('customers.safety.description')}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { value: 'S', label: '<S>', key: 'daimler' },
            { value: 'S/C', label: '<S/C>', key: 'critical' },
            { value: 'DZ', label: '<DZ>', key: 'certification' },
            { value: 'D', label: '<D>', key: 'vw' },
            { value: 'L', label: '<L>', key: 'legal' },
            { value: '▽', label: '▽', key: 'ford' },
          ].map((opt) => (
            <label
              key={opt.value}
              className="flex items-start gap-3 cursor-pointer rounded-lg border border-steel-700 bg-steel-900/50 p-3 hover:border-indigo-500 transition-all has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-900/20"
            >
              <input
                type="radio"
                value={opt.value}
                {...register('safety_characteristic', { required: t('customers.safety.required') })}
                className="mt-0.5 h-4 w-4 border-steel-600 text-indigo-500 focus:ring-indigo-500 bg-steel-950 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-steel-100">{opt.label}</span>
                <span className="text-[10px] text-steel-400 leading-tight mt-0.5">{t(`customers.safety.options.${opt.key}`)}</span>
              </div>
            </label>
          ))}
        </div>
        {errors.safety_characteristic && (
          <p className="text-red-400 text-xs mt-2">{errors.safety_characteristic.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6 mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2.5 rounded-lg text-sm text-steel-400 hover:bg-steel-850 transition-colors font-medium cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 cursor-pointer transition-all disabled:bg-indigo-900/60 disabled:text-indigo-200 text-sm font-medium"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Customer' : 'Create Customer'}
        </button>
      </div>
    </form>
  );
};
