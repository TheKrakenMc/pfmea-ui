import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertTriangle } from 'lucide-react';
import type { Customer } from '../../types/customer.types';

interface DeleteCustomerConfirmationProps {
  customer: Customer;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteCustomerConfirmation: React.FC<DeleteCustomerConfirmationProps> = ({ 
  customer, 
  onClose, 
  onConfirm,
  isDeleting = false
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
    >
      <div className="bg-steel-900 w-full max-w-md p-6 rounded-2xl border border-red-700/60 shadow-2xl">
        <div className="flex items-center justify-between mb-4 border-b border-steel-800/80 pb-4">
          <h2 id="delete-confirm-title" className="text-xl font-semibold text-red-400">
            {t('customers.deleteModal.title', 'Eliminar cliente')}
          </h2>
          <button
            onClick={onClose}
            className="text-steel-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-steel-700 cursor-pointer"
            aria-label={t('common.cancel', 'Cancelar')}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-start gap-4 mb-6">
          <div className="bg-red-500/10 p-3 rounded-full flex-shrink-0 mt-1">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <div>
            <p className="text-steel-200">
              {t('customers.deleteModal.message', '¿Estás seguro de que deseas eliminar este cliente?')}
            </p>
            <p className="text-white font-semibold mt-2">
              {customer.company_name}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="px-5 py-2.5 bg-steel-800 text-steel-200 rounded-xl hover:bg-steel-700 transition-colors text-sm font-medium cursor-pointer"
            onClick={onClose}
            disabled={isDeleting}
          >
            {t('common.cancel', 'Cancelar')}
          </button>
          <button
            className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium cursor-pointer"
            onClick={onConfirm}
            disabled={isDeleting}
            aria-label={t('customers.deleteModal.confirm', 'Sí, eliminar')}
          >
            {isDeleting ? t('common.deleting', 'Eliminando...') : t('customers.deleteModal.confirm', 'Sí, eliminar')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCustomerConfirmation;
