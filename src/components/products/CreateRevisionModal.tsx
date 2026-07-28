import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createProductRevision } from '../../services/productService';

interface CreateRevisionModalProps {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentEngineeringLevel?: string | null;
}

export const CreateRevisionModal: React.FC<CreateRevisionModalProps> = ({
  productId,
  isOpen,
  onClose,
  onSuccess,
  currentEngineeringLevel,
}) => {
  const { t } = useTranslation();
  const [changeReason, setChangeReason] = useState('');
  const [engineeringLevel, setEngineeringLevel] = useState(currentEngineeringLevel || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeReason.trim() || !engineeringLevel.trim()) {
      setError(t('productVersioning.errorRequiredFields', 'Todos los campos son obligatorios.'));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createProductRevision(productId, {
        change_reason: changeReason.trim(),
        engineering_level: engineeringLevel.trim(),
      });
      onSuccess();
    } catch (err: any) {
      console.error('Error creating revision:', err);
      setError(t('productVersioning.errorCreatingRevision', 'Error al crear la nueva versión.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">
              {t('productVersioning.createRevisionTitle', 'Crear Nueva Revisión')}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('productVersioning.changeReason', 'Motivo del Cambio')} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none h-24"
                placeholder={t('productVersioning.changeReasonPlaceholder', 'Describe brevemente los cambios')}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('productVersioning.engineeringLevel', 'Nivel de Ingeniería')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={engineeringLevel}
                onChange={(e) => setEngineeringLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder={t('productVersioning.engineeringLevelPlaceholder', 'Ej. Rev B')}
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50"
            >
              {t('common.cancel', 'Cancelar')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-50"
            >
              {submitting ? t('common.saving', 'Guardando...') : t('productVersioning.createRevisionBtn', 'Crear Revisión')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
