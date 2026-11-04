// ─────────────────────────────────────────────────────────────
//  DraftRecoveryBanner — High-visibility alert banner
//  Notifies users when uncommitted local draft changes exist
//  with prominent actions to restore or discard them.
// ─────────────────────────────────────────────────────────────

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { RotateCcw, Trash2, Clock, Sparkles } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

interface DraftRecoveryBannerProps {
  savedAt?: string;
  onRestore: () => void;
  onDiscard: () => void;
}

export const DraftRecoveryBanner: React.FC<DraftRecoveryBannerProps> = ({
  savedAt,
  onRestore,
  onDiscard,
}) => {
  const { t } = useTranslation();

  const formattedDate = useMemo(() => {
    if (!savedAt) return null;
    return formatDate(savedAt);
  }, [savedAt]);

  const handleDiscard = () => {
    const confirmMessage = t(
      'draft.discardConfirm',
      '¿Estás seguro de descartar este borrador local? Se perderán las modificaciones no guardadas.'
    );
    if (window.confirm(confirmMessage)) {
      onDiscard();
    }
  };

  return (
    <div
      className="sticky top-0 z-50 w-full shrink-0 overflow-hidden shadow-lg backdrop-blur-md"
      role="alert"
      aria-live="assertive"
    >
      {/* Top pulsing energy line for immediate peripheral vision capture */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 animate-pulse" />

      {/* Subtle diagonal caution stripes pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            #d97706 0px,
            #d97706 12px,
            transparent 12px,
            transparent 24px
          )`,
        }}
      />

      {/* Main banner body with solid backdrop blur for sticky scrolling */}
      <div className="relative bg-amber-100/95 dark:bg-steel-900/95 bg-gradient-to-r from-amber-50/95 via-amber-100/90 to-orange-50/95 dark:from-steel-950/95 dark:via-amber-950/90 dark:to-steel-950/95 border-b-2 border-amber-500/80 px-4 py-3 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 max-w-7xl mx-auto">
          {/* Left: Icon, Pulsing Beacon and Message */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/25 dark:bg-amber-500/30 border border-amber-500/50 text-amber-700 dark:text-amber-300 shadow-xs shrink-0 mt-0.5 sm:mt-0">
              <Sparkles size={18} className="text-amber-600 dark:text-amber-300" />
              {/* Pulsing alert beacon */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 ring-2 ring-white dark:ring-steel-950" />
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-200">
                  {t('draft.bannerTitle', 'Borrador local disponible')}
                </span>
                {formattedDate && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 dark:bg-amber-500/30 text-amber-900 dark:text-amber-200 border border-amber-500/30 shadow-2xs">
                    <Clock size={11} className="text-amber-600 dark:text-amber-400" />
                    {t('draft.savedAt', 'Guardado el: {{date}}', { date: formattedDate })}
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-900/90 dark:text-amber-100/90 font-medium mt-0.5 leading-relaxed">
                {t(
                  'draft.bannerSubtitle',
                  'Se encontraron modificaciones locales sin guardar en el servidor. Puedes recuperar tu trabajo pendiente o descartar el borrador.'
                )}
              </p>
            </div>
          </div>

          {/* Right: Primary and Secondary Action Buttons */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0 pl-12 sm:pl-0">
            <motion.button
              type="button"
              onClick={onRestore}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-md shadow-amber-500/30 hover:shadow-amber-500/40 ring-1 ring-amber-400/60 transition-all cursor-pointer"
            >
              <RotateCcw size={14} className="stroke-[2.5]" />
              <span>{t('draft.restoreButton', 'Recuperar borrador')}</span>
            </motion.button>

            <motion.button
              type="button"
              onClick={handleDiscard}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-900 dark:text-amber-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-950/40 border border-amber-500/30 hover:border-red-500/40 transition-all cursor-pointer"
            >
              <Trash2 size={13} />
              <span>{t('draft.discardButton', 'Descartar borrador')}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
