import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Loader2, AlertCircle } from 'lucide-react';
import { getProductHistory } from '../../services/productService';
import { backdropVariants, modalCardVariants } from '../../utils/motion';

interface ProductHistoryModalProps {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductHistoryModal: React.FC<ProductHistoryModalProps> = ({
  productId,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const {
    data: history = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ['product-history', productId],
    queryFn: () => getProductHistory(productId),
    enabled: isOpen,
  });
  const error = queryError
    ? t('productVersioning.errorFetchingHistory', 'Error al cargar el historial.')
    : null;

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
            className="relative z-10 w-full max-w-2xl overflow-hidden flex flex-col max-h-[88vh] bg-[var(--ui-surface)] text-[var(--ui-ink)] border border-[var(--ui-line)] rounded-[var(--ui-panel-radius)] shadow-[var(--ui-shadow-popover)]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--ui-line)] flex items-center justify-between bg-[var(--ui-surface-subtle)]">
              <div className="flex items-center gap-3">
                <div className="detail-spec-icon" style={{ width: 36, height: 36 }}>
                  <History size={18} />
                </div>
                <h3 className="text-base font-semibold text-[var(--ui-ink)]">
                  {t('productVersioning.historyTitle', 'Historial de Cambios')}
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
            <div className="p-6 overflow-y-auto flex-1">
              {loading && (
                <div className="flex items-center justify-center gap-2.5 py-10 text-[var(--ui-muted)] text-sm">
                  <Loader2 size={18} className="animate-spin text-[var(--ui-accent)]" />
                  <span>{t('common.loading', 'Cargando...')}</span>
                </div>
              )}

              {error && (
                <div className="detail-banner" data-tone="warning">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {!loading && !error && history.length === 0 && (
                <div className="text-center text-[var(--ui-muted)] py-10 text-sm">
                  {t('productVersioning.noHistory', 'No hay historial de cambios disponible.')}
                </div>
              )}

              {!loading && !error && history.length > 0 && (
                <div className="space-y-5">
                  {history.map(version => (
                    <div
                      key={version.id}
                      className="relative pl-6 border-l-2 border-[var(--ui-line-strong)] last:border-0 pb-5 last:pb-0"
                    >
                      <div className="absolute w-3 h-3 bg-[var(--ui-accent)] rounded-full -left-[7px] top-1.5 ring-4 ring-[var(--ui-surface)]" />

                      <div className="p-4 rounded-[var(--ui-radius)] bg-[var(--ui-surface-subtle)] border border-[var(--ui-line)]">
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <div>
                            <span className="document-card-id inline-block mb-2">
                              V{version.revision_number}
                            </span>
                            <h4 className="text-sm font-semibold text-[var(--ui-ink)]">
                              {version.change_reason}
                            </h4>
                          </div>
                          <span className="text-xs text-[var(--ui-muted)] tabular-nums shrink-0">
                            {new Date(version.created_at).toLocaleString()}
                          </span>
                        </div>

                        {version.snapshot_data?.engineering_level && (
                          <div className="mt-2 text-xs text-[var(--ui-muted)]">
                            <span className="font-medium text-[var(--ui-ink)]">
                              {t('productVersioning.engineeringLevel', 'Nivel de Ingeniería')}:
                            </span>{' '}
                            <span className="tabular-nums">
                              {version.snapshot_data.engineering_level}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[var(--ui-line)] bg-[var(--ui-surface-subtle)] flex justify-end">
              <button type="button" onClick={onClose} className="ui-button">
                {t('common.close', 'Cerrar')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
