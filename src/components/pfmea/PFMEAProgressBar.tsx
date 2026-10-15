import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { GlobalValidationResult } from '../../hooks/usePFMEAValidation';

interface PFMEAProgressBarProps {
  metrics: GlobalValidationResult;
}

export const PFMEAProgressBar: React.FC<PFMEAProgressBarProps> = ({ metrics }) => {
  const { t } = useTranslation();
  const { globalPercentage, totalRows, completedRows, incompleteOperations, operationsWithoutScCc, canRelease } = metrics;

  // Percentage color
  const getColor = (pct: number) => {
    if (pct === 100) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500';
    if (pct >= 50) return 'text-amber-600 dark:text-amber-400 bg-amber-500';
    return 'text-rose-600 dark:text-rose-400 bg-rose-500';
  };

  const barColor = getColor(globalPercentage).split(' ')[2];
  const textColor = getColor(globalPercentage).split(' ')[0];

  return (
    <div
      title={
        canRelease
          ? t('pfmea.progress.canReleaseTooltip', 'El documento cumple al 100% con todos los requisitos y características críticas para liberación.')
          : t('pfmea.progress.incompleteTooltip', '{{incomplete}} operaciones incompletas • {{noScCc}} operaciones sin SC/CC ({{completed}}/{{total}} filas)', {
              incomplete: incompleteOperations,
              noScCc: operationsWithoutScCc,
              completed: completedRows,
              total: totalRows,
            })
      }
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-steel-700/60 bg-white dark:bg-steel-900/80 shadow-2xs text-xs"
    >
      {canRelease ? (
        <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
      ) : (
        <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
      )}

      <span className="text-[10px] font-bold text-slate-500 dark:text-steel-400 uppercase tracking-wider hidden sm:inline">
        {t('pfmea.progress.short', 'Progreso')}:
      </span>

      <div className="w-12 h-1.5 bg-slate-200 dark:bg-steel-800 rounded-full overflow-hidden shrink-0">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${globalPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>

      <span className={`font-mono font-bold text-xs ${textColor}`}>
        {globalPercentage}%
      </span>
    </div>
  );
};
