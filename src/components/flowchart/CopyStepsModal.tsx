import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Loader2, AlertCircle, CheckCircle2, ChevronRight, Layers, ArrowDownCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  getDocumentHeaders,
  getFlowchartById,
  copyStepsFromFlowchart,
  type FlowchartRead,
} from '../../services/flowchartService';
import { backdropVariants, modalCardVariants } from '../../utils/motion';

interface CopyStepsModalProps {
  targetFlowchartId: number;
  targetFlowchartTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedFlowchart: FlowchartRead) => void;
}

export const CopyStepsModal: React.FC<CopyStepsModalProps> = ({
  targetFlowchartId,
  targetFlowchartTitle,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [flowcharts, setFlowcharts] = useState<FlowchartRead[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const [sourceDetail, setSourceDetail] = useState<FlowchartRead | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedSourceId(null);
      setSourceDetail(null);
      setError(null);
      setSearch('');
      setLoadingList(true);

      getDocumentHeaders()
        .then((data) => {
          // Filter out current flowchart
          setFlowcharts(data.filter((f) => f.id !== targetFlowchartId));
        })
        .catch((err) => {
          console.error('Failed to load flowcharts for copy steps modal', err);
          setError(t('copySteps.errorLoading', 'No se pudieron cargar los diagramas existentes.'));
        })
        .finally(() => {
          setLoadingList(false);
        });
    }
  }, [isOpen, targetFlowchartId, t]);

  const handleSelectSource = async (sourceId: number) => {
    setSelectedSourceId(sourceId);
    setError(null);
    setLoadingDetail(true);

    try {
      const detail = await getFlowchartById(sourceId);
      setSourceDetail(detail);
    } catch (err) {
      console.error('Failed to load source diagram detail', err);
      setError(t('copySteps.errorDetail', 'No se pudieron cargar los detalles del diagrama seleccionado.'));
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSourceId) {
      setError(t('copySteps.selectSourceRequired', 'Selecciona un diagrama de flujo de origen.'));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const updated = await copyStepsFromFlowchart(targetFlowchartId, selectedSourceId);
      toast.success(
        t('copySteps.success', `Se copiaron ${updated.steps?.length || sourceDetail?.steps?.length || 0} pasos exitosamente al diagrama actual.`)
      );
      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      console.error('Copying steps failed:', err);
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail || t('copySteps.error', 'Ocurrió un error al copiar los pasos del diagrama.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredFlowcharts = flowcharts.filter((fc) => {
    const q = search.toLowerCase();
    return (
      fc.title?.toLowerCase().includes(q) ||
      fc.flowchart_code?.toLowerCase().includes(q) ||
      fc.product?.customer_name?.toLowerCase().includes(q) ||
      fc.product?.part_number?.toLowerCase().includes(q)
    );
  });

  return (
    <AnimatePresence>
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      >
        <motion.div
          variants={modalCardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white dark:bg-steel-900 border border-slate-200 dark:border-steel-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-steel-800 bg-slate-50 dark:bg-steel-950/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <ArrowDownCircle size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('copySteps.modalTitle', 'Copiar Pasos desde Otro Diagrama / Producto')}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-steel-400">
                  {targetFlowchartTitle ? `Destino: ${targetFlowchartTitle}` : 'Agiliza el llenado importando la secuencia de operaciones'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-steel-800 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Warning / Error */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                {t(
                  'copySteps.warningReplace',
                  'Atención: Al copiar los pasos, la secuencia de operaciones del diagrama actual será reemplazada por los pasos del producto seleccionado.'
                )}
              </span>
            </div>

            {/* Source Flowchart Selection List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-steel-200">
                  {t('copySteps.selectSource', 'Seleccionar Diagrama de Origen:')}
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('common.search', 'Buscar por título, código o parte...')}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-steel-700 bg-slate-50 dark:bg-steel-950 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 w-56"
                />
              </div>

              {loadingList ? (
                <div className="flex items-center justify-center p-8 text-xs text-slate-500 gap-2">
                  <Loader2 size={16} className="animate-spin text-indigo-500" />
                  <span>{t('common.loading', 'Cargando diagramas de flujo...')}</span>
                </div>
              ) : filteredFlowcharts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-steel-800 rounded-xl">
                  {t('copySteps.noSources', 'No se encontraron otros diagramas de flujo disponibles.')}
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-steel-800 rounded-xl p-2 bg-slate-50/50 dark:bg-steel-950/40">
                  {filteredFlowcharts.map((fc) => {
                    const isSelected = selectedSourceId === fc.id;
                    return (
                      <button
                        key={fc.id}
                        type="button"
                        onClick={() => handleSelectSource(fc.id)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-400 dark:border-indigo-600 shadow-xs'
                            : 'bg-white dark:bg-steel-900 border-slate-200 dark:border-steel-800/80 hover:border-slate-300 dark:hover:border-steel-700'
                        }`}
                      >
                        <div className="space-y-0.5 truncate">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {fc.title}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-steel-400 font-mono">
                            {fc.flowchart_code || `#${fc.id}`}
                            {fc.product?.customer_name ? ` · ${fc.product.customer_name}` : ''}
                            {fc.product?.part_number ? ` · ${fc.product.part_number}` : ''}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-steel-800 text-slate-700 dark:text-steel-300">
                            {fc.steps?.length || 0} pasos
                          </span>
                          <ChevronRight
                            size={15}
                            className={isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Source Steps Preview */}
            {loadingDetail && (
              <div className="flex items-center justify-center p-6 text-xs text-slate-500 gap-2">
                <Loader2 size={16} className="animate-spin text-indigo-500" />
                <span>{t('copySteps.loadingPreview', 'Cargando previsualización de pasos...')}</span>
              </div>
            )}

            {sourceDetail && !loadingDetail && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-steel-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-steel-200">
                  <span className="flex items-center gap-1.5">
                    <Layers size={13} className="text-emerald-500" />
                    {t('copySteps.previewTitle', 'Pasos a copiar:')} ({sourceDetail.steps?.length || 0})
                  </span>
                </div>

                <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-steel-800 rounded-xl p-2 bg-slate-50 dark:bg-steel-950/60 divide-y divide-slate-200 dark:divide-steel-800/60 text-xs">
                  {sourceDetail.steps?.length === 0 ? (
                    <div className="p-3 text-center text-slate-400">
                      Este diagrama de flujo no contiene pasos registrados.
                    </div>
                  ) : (
                    sourceDetail.steps.map((st) => (
                      <div key={st.id || `${st.step_number}-${st.sub_step}`} className="py-1.5 px-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 w-12 shrink-0">
                            {st.sub_step ? `${st.step_number}.${st.sub_step}` : st.step_number}
                          </span>
                          <span className="text-slate-800 dark:text-steel-200 font-medium truncate">
                            {st.custom_description || st.technology?.name || 'Operación'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 text-[10px] text-slate-500 dark:text-steel-400">
                          {st.critical_flag && st.critical_flag !== 'none' && (
                            <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 font-bold border border-red-200 dark:border-red-800/40">
                              {st.critical_flag}
                            </span>
                          )}
                          <span>{st.responsible_department || 'Producción'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-steel-800">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-steel-300 hover:bg-slate-100 dark:hover:bg-steel-800 rounded-xl transition-all cursor-pointer"
              >
                {t('common.cancel', 'Cancelar')}
              </button>
              <button
                type="submit"
                disabled={Boolean(submitting || !selectedSourceId || (sourceDetail && sourceDetail.steps?.length === 0))}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>{t('copySteps.copying', 'Copiando pasos...')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>{t('copySteps.submit', 'Confirmar y Copiar Pasos')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

