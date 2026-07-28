// ─────────────────────────────────────────────────────────────
//  DeleteConfirmModal — Animated confirmation dialog
//  Uses Framer Motion for backdrop fade + card scale entrance.
// ─────────────────────────────────────────────────────────────

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  stepName: string;
  stepSequence: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  stepName,
  stepSequence,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-steel-900/60 backdrop-blur-md"
        onClick={onCancel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Card */}
      <motion.div
        className="glass-card bg-steel-950/80 relative z-10 w-full max-w-md overflow-hidden rounded-2xl p-6 shadow-2xl"
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 text-steel-400 transition-colors hover:text-steel-200 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-alert-red-glow">
          <AlertTriangle size={24} className="text-alert-red" />
        </div>

        {/* Title */}
        <h3 className="mb-2 text-lg font-semibold text-steel-50">
          {t('deleteModal.title')}
        </h3>

        {/* Message */}
        <p className="mb-6 text-sm leading-relaxed text-steel-300">
          {t('deleteModal.message', {
            name: stepName || 'Sin nombre',
            sequence: stepSequence,
          })}
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-steel-600 bg-steel-800 px-5 py-2.5 text-sm font-medium text-steel-200 transition-industrial hover:bg-steel-700 cursor-pointer"
          >
            {t('deleteModal.cancel')}
          </button>
          <motion.button
            type="button"
            onClick={onConfirm}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-xl bg-alert-red px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-industrial hover:bg-red-600 cursor-pointer"
          >
            {t('deleteModal.confirm')}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
