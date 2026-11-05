import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Copy, X, Loader2, Layers, AlertCircle, Building2, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cloneFlowchart, listProducts, type FlowchartRead, type ProductRead } from '../../services/flowchartService';
import { ProductSelect } from '../products/ProductSelect';
import { backdropVariants, modalCardVariants } from '../../utils/motion';

interface CloneFlowchartModalProps {
  sourceFlowchart: FlowchartRead;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newFlowchart: FlowchartRead) => void;
}

export const CloneFlowchartModal: React.FC<CloneFlowchartModalProps> = ({
  sourceFlowchart,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<ProductRead[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [targetTitle, setTargetTitle] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTargetTitle(`${sourceFlowchart.title} (Copia)`);
      setSelectedProductId('');
      setError(null);
      setLoadingProducts(true);

      listProducts()
        .then((data) => {
          setProducts(data);
        })
        .catch((err) => {
          console.error('Failed to load products for clone modal', err);
          setError(t('clone.errorLoadingProducts', 'No se pudieron cargar los productos disponibles.'));
        })
        .finally(() => {
          setLoadingProducts(false);
        });
    }
  }, [isOpen, sourceFlowchart, t]);

  const selectedProduct = products.find((p) => String(p.id) === selectedProductId);

  // Auto-suggest title when target product is selected
  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => String(p.id) === prodId);
    if (prod && prod.description) {
      setTargetTitle(`${prod.description} - PFD`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      setError(t('clone.selectProductRequired', 'Debes seleccionar el producto destino para el nuevo diagrama.'));
      return;
    }
    if (!targetTitle.trim()) {
      setError(t('clone.titleRequired', 'El título del diagrama de flujo es obligatorio.'));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const cloned = await cloneFlowchart(sourceFlowchart.id, {
        target_product_id: Number(selectedProductId),
        title: targetTitle.trim(),
      });

      toast.success(
        t('clone.success', `Diagrama clonado exitosamente con ${cloned.steps?.length || sourceFlowchart.steps?.length || 0} pasos.`)
      );
      onSuccess(cloned);
      onClose();
    } catch (err: unknown) {
      console.error('Cloning failed:', err);
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail || t('clone.error', 'Ocurrió un error al clonar el diagrama de flujo.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
          className="bg-white dark:bg-steel-900 border border-slate-200 dark:border-steel-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-steel-800 bg-slate-50 dark:bg-steel-950/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Copy size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('clone.modalTitle', 'Clonar Diagrama de Flujo')}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-steel-400">
                  {t('clone.modalSubtitle', 'Copia todos los pasos y parámetros del proceso a otro producto.')}
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

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error Notification */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Source Diagram Info Card */}
            <div className="bg-slate-50 dark:bg-steel-950/60 border border-slate-200 dark:border-steel-800/80 rounded-xl p-3.5 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-steel-400 tracking-wider flex items-center gap-1.5">
                <Layers size={13} className="text-blue-500" />
                {t('clone.sourceDiagram', 'Diagrama Origen (Plantilla de Pasos)')}
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {sourceFlowchart.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-steel-400 font-mono">
                    {sourceFlowchart.flowchart_code || `#${sourceFlowchart.id}`}
                    {sourceFlowchart.product?.customer_name ? ` · ${sourceFlowchart.product.customer_name}` : ''}
                    {sourceFlowchart.product?.part_number ? ` · ${sourceFlowchart.product.part_number}` : ''}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                  {sourceFlowchart.steps?.length || 0} {t('common.steps', 'pasos')}
                </span>
              </div>
            </div>

            {/* Target Product Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-steel-200 flex items-center gap-1.5">
                <Building2 size={13} className="text-indigo-500" />
                {t('clone.targetProduct', 'Producto Destino')}
                <span className="text-red-500">*</span>
              </label>

              {loadingProducts ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                  <Loader2 size={14} className="animate-spin text-blue-500" />
                  <span>{t('common.loadingProducts', 'Cargando productos disponibles...')}</span>
                </div>
              ) : (
                <ProductSelect
                  products={products}
                  value={selectedProductId}
                  onChange={handleProductSelect}
                />
              )}

              {selectedProduct && (
                <div className="p-2.5 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-lg text-xs space-y-0.5">
                  <div className="font-semibold text-indigo-900 dark:text-indigo-200">
                    {selectedProduct.part_number} — {selectedProduct.description || 'Sin descripción'}
                  </div>
                  <div className="text-[11px] text-indigo-700 dark:text-indigo-400">
                    Cliente: {selectedProduct.customer_name || 'Sin cliente'}
                  </div>
                </div>
              )}
            </div>

            {/* Target Flowchart Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-steel-200 flex items-center gap-1.5">
                <FileText size={13} className="text-amber-500" />
                {t('clone.targetTitle', 'Título del Nuevo Diagrama')}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={targetTitle}
                onChange={(e) => setTargetTitle(e.target.value)}
                placeholder={t('clone.titlePlaceholder', 'Ej. Dash Upper JX6B - PFD')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-steel-700 bg-white dark:bg-steel-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
              />
            </div>

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
                disabled={submitting || !selectedProductId || !targetTitle.trim()}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>{t('clone.cloning', 'Clonando pasos...')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>{t('clone.submit', 'Clonar y Abrir')}</span>
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

