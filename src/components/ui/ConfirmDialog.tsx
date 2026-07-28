import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Loader2, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDestructive = false,
  isLoading = false,
  confirmText,
  cancelText,
}) => {
  const { t } = useTranslation();

  if (typeof window === 'undefined') return null;

  const resolvedConfirmText = confirmText || t('common.confirm', 'Confirm');
  const resolvedCancelText = cancelText || t('common.cancel', 'Cancel');

  const dialogContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-steel-900/60 backdrop-blur-md"
            onClick={() => !isLoading && onClose()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Card */}
          <motion.div
            className="glass-card bg-steel-950/80 relative z-10 w-full max-w-md overflow-hidden rounded-2xl p-6 shadow-2xl flex flex-col"
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Close Button */}
            {!isLoading && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 text-steel-400 transition-colors hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            )}

            {/* Icon */}
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${isDestructive ? 'bg-alert-red-glow text-alert-red' : 'bg-indigo-500/10 text-indigo-400'}`}>
              {isDestructive ? <AlertTriangle size={24} /> : <Info size={24} />}
            </div>

            {/* Title */}
            <h3 className="mb-2 text-lg font-semibold text-steel-50">
              {title}
            </h3>

            {/* Message */}
            <p className="mb-6 text-sm leading-relaxed text-steel-300 whitespace-pre-wrap">
              {message}
            </p>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="rounded-xl border border-steel-600 bg-steel-800 px-5 py-2.5 text-sm font-medium text-steel-200 transition-industrial hover:bg-steel-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resolvedCancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-industrial cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDestructive 
                    ? 'bg-alert-red hover:bg-red-600' 
                    : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                {isLoading ? t('common.processing', 'Processing...') : resolvedConfirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(dialogContent, document.body);
};
