import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertTriangle } from 'lucide-react';
import { useTechnologyImpact } from '../../hooks/useTechnology';
import type { Technology } from '../../types/technology.types';

interface DeleteConfirmationProps {
  tech: Technology;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ tech, onClose, onConfirm }) => {
  const { t } = useTranslation();
  const { data: impact, isLoading } = useTechnologyImpact(tech.id);

  const hasBlockingDeps = (impact?.flowcharts_count ?? 0) > 0 || (impact?.products_count ?? 0) > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
    >
      <div className="glass-card w-full max-w-md p-6 rounded-xl border border-red-700/60">
        <div className="flex items-center justify-between mb-4">
          <h2 id="delete-confirm-title" className="text-xl font-semibold text-red-300">
            {t('technologies.deleteModal.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-steel-400 hover:text-steel-200 transition-colors"
            aria-label={t('technologies.form.cancel')}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-start gap-3">
          <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={24} />
          <div>
            {isLoading ? (
              <p className="text-steel-300">{t('technologies.deleteModal.loading')}</p>
            ) : (
              <p className="text-steel-200">
                {t('technologies.deleteModal.message', {
                  name: tech.name,
                  flowcharts: impact?.flowcharts_count ?? 0,
                  products: impact?.products_count ?? 0,
                })}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-5 gap-2">
          <button
            className="px-4 py-2 bg-steel-700 text-steel-200 rounded-lg hover:bg-steel-600 transition-colors text-sm"
            onClick={onClose}
          >
            {t('technologies.form.cancel')}
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            onClick={onConfirm}
            disabled={isLoading || hasBlockingDeps}
            aria-label={t('technologies.deleteModal.confirm')}
          >
            {t('technologies.deleteModal.confirm')}
          </button>
        </div>

        {hasBlockingDeps && !isLoading && (
          <p className="mt-3 text-xs text-red-400 italic">
            {t('technologies.deleteModal.blocked')}
          </p>
        )}
      </div>
    </div>
  );
};

export default DeleteConfirmation;
