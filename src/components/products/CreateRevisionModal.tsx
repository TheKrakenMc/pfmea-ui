import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Loader2, AlertCircle } from 'lucide-react';
import { createProductRevision } from '../../services/productService';
import { backdropVariants, modalCardVariants } from '../../utils/motion';

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
    } catch (err: unknown) {
      console.error('Error creating revision:', err);
      setError(t('productVersioning.errorCreatingRevision', 'Error al crear la nueva versión.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            variants={backdropVariants}
            onClick={onClose}
            className="absolute inset-0 bg-steel-950/70 backdrop-blur-sm"
          />

          <motion.div
            variants={modalCardVariants}
            className="relative z-10 w-full max-w-md overflow-hidden flex flex-col bg-[var(--ui-surface)] text-[var(--ui-ink)] border border-[var(--ui-line)] rounded-[var(--ui-panel-radius)] shadow-[var(--ui-shadow-popover)]"
          >
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="px-6 py-4 border-b border-[var(--ui-line)] flex items-center justify-between bg-[var(--ui-surface-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="detail-spec-icon" style={{ width: 36, height: 36 }}>
                    <FileText size={18} />
                  </div>
                  <h3 className="text-base font-semibold text-[var(--ui-ink)]">
                    {t('productVersioning.createRevisionTitle', 'Crear Nueva Revisión')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="ui-icon-button"
                  aria-label={t('common.close', 'Cerrar')}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {error && (
                  <div className="detail-banner" data-tone="warning">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="detail-field">
                  <label htmlFor="change_reason" className="detail-label">
                    {t('productVersioning.changeReason', 'Motivo del Cambio')}{' '}
                    <span className="text-[var(--ui-danger)]">*</span>
                  </label>
                  <textarea
                    id="change_reason"
                    value={changeReason}
                    onChange={e => setChangeReason(e.target.value)}
                    className="ui-textarea resize-none"
                    rows={3}
                    placeholder={t(
                      'productVersioning.changeReasonPlaceholder',
                      'Describe brevemente los cambios',
                    )}
                    required
                  />
                </div>

                <div className="detail-field">
                  <label htmlFor="revision_eng_level" className="detail-label">
                    {t('productVersioning.engineeringLevel', 'Nivel de Ingeniería')}{' '}
                    <span className="text-[var(--ui-danger)]">*</span>
                  </label>
                  <input
                    id="revision_eng_level"
                    type="text"
                    value={engineeringLevel}
                    onChange={e => setEngineeringLevel(e.target.value)}
                    className="ui-input ui-input-mono"
                    placeholder={t('productVersioning.engineeringLevelPlaceholder', 'Ej. Rev B')}
                    required
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[var(--ui-line)] bg-[var(--ui-surface-subtle)] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="ui-button"
                >
                  {t('common.cancel', 'Cancelar')}
                </button>
                <div className="workspace-primary">
                  <button type="submit" disabled={submitting}>
                    {submitting && <Loader2 size={15} className="animate-spin" />}
                    <span>
                      {submitting
                        ? t('common.saving', 'Guardando...')
                        : t('productVersioning.createRevisionBtn', 'Crear Revisión')}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
