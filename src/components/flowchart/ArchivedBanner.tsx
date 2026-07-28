// ─────────────────────────────────────────────────────────────
//  ArchivedBanner — Persistent top banner for archived documents.
//  Amber diagonal-stripe gradient with archive date/user info
//  and quick-access link to the history drawer.
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Archive, History, Lock, User } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

interface ArchivedBannerProps {
  archivedBy?: string;
  archivedOn?: string;
  onViewHistory: () => void;
}

export const ArchivedBanner: React.FC<ArchivedBannerProps> = ({
  archivedBy,
  archivedOn,
  onViewHistory,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative overflow-hidden"
    >
      {/* Diagonal stripe background pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            #f59e0b 0px,
            #f59e0b 10px,
            transparent 10px,
            transparent 20px
          )`,
        }}
      />

      {/* Main banner content */}
      <div className="relative bg-amber-500/10 border-b border-amber-500/30 px-4 py-3 flex items-center gap-4">
        {/* Status icon group */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40">
            <Archive size={16} className="text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-400 leading-none">
              {t('archive.banner.title')}
            </p>
            <p className="text-[10px] text-amber-400/70 font-medium mt-0.5">
              {t('archive.banner.subtitle')}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-amber-500/20 shrink-0" />

        {/* Archive info */}
        <div className="flex items-center gap-4 text-[11px] text-amber-300/70 flex-1 min-w-0">
          {archivedBy && (
            <span className="flex items-center gap-1.5 shrink-0">
              <User size={11} className="shrink-0" />
              <span className="text-amber-300/50">{t('archive.banner.archivedBy')}</span>
              <span className="font-semibold text-amber-300">{archivedBy}</span>
            </span>
          )}
          {archivedOn && (
            <span className="flex items-center gap-1.5 shrink-0">
              <span className="text-amber-300/50">{t('archive.banner.archivedOn')}</span>
              <span className="font-mono font-semibold text-amber-300">{formatDate(archivedOn)}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5 shrink-0">
            <Lock size={11} />
            <span>{t('archive.banner.readOnly')}</span>
          </span>
        </div>

        {/* View History Button */}
        <motion.button
          onClick={onViewHistory}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 hover:border-amber-500/60 rounded-lg text-xs font-semibold text-amber-300 transition-all shrink-0 cursor-pointer"
        >
          <History size={12} />
          {t('archive.banner.viewHistory')}
        </motion.button>
      </div>
    </motion.div>
  );
};
