// ─────────────────────────────────────────────────────────────
//  ArchiveConfirmModal — Animated confirmation for document archiving
//  Amber color system, distinct from the red delete modal.
//  Includes metadata panel, ECO field, reason textarea, and confirm checkbox.
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Archive,
  X,
  AlertTriangle,
  FileText,
  Hash,
  Calendar,
  GitBranch,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import type { FlowchartRead } from '../../services/flowchartService';
import { formatDate } from '../../utils/dateUtils';

interface ArchiveConfirmModalProps {
  flowchart: FlowchartRead;
  onConfirm: (payload: { change_reason: string; eco_number?: string }) => Promise<void>;
  onCancel: () => void;
}

export function ArchiveConfirmModal({
  flowchart,
  onConfirm,
  onCancel,
}: ArchiveConfirmModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [eco, setEco] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = reason.trim().length >= 10 && confirmed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setSubmitting(true);
    setError(null);
    try {
      await onConfirm({
        change_reason: reason.trim(),
        eco_number: eco.trim() || undefined,
      });
    } catch (err: any) {
      setError(err.message || t('archive.errors.archiveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

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
        className="absolute inset-0 bg-steel-900/70 backdrop-blur-md"
        onClick={onCancel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal Card */}
      <motion.div
        className="relative z-10 w-full max-w-lg bg-white dark:bg-steel-900 border border-amber-200 dark:border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-900/20 overflow-hidden flex flex-col max-h-[90vh]"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-200 dark:border-amber-500/20 flex items-center justify-between bg-amber-50/50 dark:bg-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-500/15 rounded-xl">
              <Archive size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-amber-900 dark:text-amber-100">
                {t('archive.modal.title')}
              </h3>
              <p className="text-xs text-steel-500 dark:text-steel-400 mt-0.5">{t('archive.modal.subtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-steel-400 hover:text-steel-700 dark:hover:text-steel-200 hover:bg-steel-100 dark:hover:bg-steel-800 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-start gap-2">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Warning Banner */}
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 rounded-xl p-4 flex items-start gap-3">
              <ShieldAlert size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  {t('archive.modal.warningTitle')}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-1 leading-relaxed">
                  {t('archive.modal.warningDesc')}
                </p>
              </div>
            </div>

            {/* Document Metadata */}
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 line-clamp-1" title={flowchart.title}>
                    {flowchart.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-amber-700/80 dark:text-amber-400/80">
                    <span className="font-mono text-amber-800 dark:text-amber-300">#{flowchart.id}</span>
                    <span className="text-amber-400 dark:text-amber-600/50">•</span>
                    <span className="font-mono text-amber-800 dark:text-amber-300">v{flowchart.version}</span>
                    <span className="text-amber-400 dark:text-amber-600/50">•</span>
                    <span>{new Date(flowchart.created_at).toLocaleDateString(undefined, { dateStyle: 'short' })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {t(`status.${flowchart.status.toLowerCase()}`, flowchart.status)}
                </div>
              </div>
            </div>

            {/* Reason Textarea */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-500 dark:text-steel-400">
                <AlertTriangle size={10} className="text-amber-500 dark:text-amber-400" />
                {t('archive.modal.reasonLabel')}
                <span className="text-red-400">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('archive.modal.reasonPlaceholder')}
                rows={3}
                className="w-full bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/25 hover:border-amber-400 dark:hover:border-amber-500/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 rounded-xl px-3.5 py-2.5 text-sm placeholder-amber-700/50 dark:placeholder-amber-500/50 transition-all resize-none outline-none text-amber-900 dark:text-amber-100"
              />
              <div className="flex justify-between items-center">
                {reason.trim().length > 0 && reason.trim().length < 10 && (
                  <p className="text-xs text-red-500 dark:text-red-400">{t('archive.errors.reasonRequired')}</p>
                )}
                <span className={`text-xs ml-auto ${reason.trim().length >= 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-steel-400 dark:text-steel-500'}`}>
                  {reason.trim().length}/1000
                </span>
              </div>
            </div>

            {/* ECO Number (optional) */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                <Hash size={10} className="text-amber-600 dark:text-amber-400" />
                {t('archive.modal.ecoLabel')}
                <span className="text-amber-600/60 dark:text-amber-500/60 ml-1 text-[9px] normal-case font-normal tracking-normal">
                  ({t('archive.modal.ecoOptional')})
                </span>
              </label>
              <input
                type="text"
                value={eco}
                onChange={(e) => setEco(e.target.value)}
                placeholder={t('archive.modal.ecoPlaceholder')}
                className="w-full bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/25 hover:border-amber-400 dark:hover:border-amber-500/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 rounded-xl px-3.5 py-2.5 text-sm placeholder-amber-700/50 dark:placeholder-amber-500/50 font-mono transition-all outline-none text-amber-900 dark:text-amber-100"
              />
            </div>

            {/* Confirmation Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    confirmed
                      ? 'bg-amber-500 border-amber-500'
                      : 'border-amber-300 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-500/10 group-hover:border-amber-500 dark:group-hover:border-amber-400'
                  }`}
                >
                  {confirmed && (
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                      <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <p className="text-xs text-amber-800/80 dark:text-amber-400/80 leading-relaxed group-hover:text-amber-900 dark:group-hover:text-amber-300 transition-colors">
                {t('archive.modal.confirmCheck')}
              </p>
            </label>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex items-center justify-end gap-3 border-t border-amber-200 dark:border-amber-500/20 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-sm text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors font-medium cursor-pointer"
            >
              {t('archive.modal.cancelBtn')}
            </button>
            <motion.button
              type="submit"
              disabled={!isValid || submitting}
              whileHover={isValid && !submitting ? { scale: 1.02 } : {}}
              whileTap={isValid && !submitting ? { scale: 0.97 } : {}}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer bg-amber-600 text-white hover:bg-amber-500 shadow-lg shadow-amber-900/20 disabled:bg-amber-900/40 disabled:text-amber-200/50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Archive size={16} />
              )}
              {t('archive.modal.archiveBtn')}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
