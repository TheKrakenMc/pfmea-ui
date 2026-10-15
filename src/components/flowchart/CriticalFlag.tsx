// ─────────────────────────────────────────────────────────────
//  CriticalFlag — Tri-state toggle for CC / SC classification
//  Cycles: none → CC → SC → none
// ─────────────────────────────────────────────────────────────

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, ShieldCheck, CircleDot } from 'lucide-react';
import type { CriticalFlag as CriticalFlagType } from '../../types/flowchart.types';

interface CriticalFlagProps {
  value: CriticalFlagType;
  onChange: (next: CriticalFlagType) => void;
  disabled?: boolean;
  isMasterWithSubSteps?: boolean;
  needsSubStepCritical?: boolean;
  isSubStepPrompted?: boolean;
}

const CYCLE: CriticalFlagType[] = ['none', 'CC', 'SC'];

export function CriticalFlag({
  value,
  onChange,
  disabled,
  isMasterWithSubSteps = false,
  needsSubStepCritical = false,
  isSubStepPrompted = false,
}: CriticalFlagProps) {
  const { t } = useTranslation();

  const handleClick = () => {
    if (disabled) return;
    if (isMasterWithSubSteps) {
      // For master operations with sub-steps, toggles between '@' and 'none'
      onChange(value === '@' ? 'none' : '@');
      return;
    }
    const currentIndex = CYCLE.indexOf(value as CriticalFlagType);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % CYCLE.length;
    onChange(CYCLE[nextIndex]);
  };

  const getStyleClass = (flag: CriticalFlagType): string => {
    switch (flag) {
      case '@':
        return 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800/80 shadow-2xs font-bold';
      case 'CC':
        return 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/60 shadow-2xs font-bold';
      case 'SC':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60 shadow-2xs font-bold';
      default:
        return 'bg-slate-100 dark:bg-steel-800/60 text-slate-500 dark:text-steel-400 border-slate-200 dark:border-steel-700/60 font-semibold';
    }
  };

  const tooltipTitle = isMasterWithSubSteps
    ? t('flags.masterTooltip', 'Marcar o desmarcar característica crítica global (@)')
    : t('flags.tooltip', 'Alternar característica crítica (CC / SC)');

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={tooltipTitle}
      whileTap={disabled ? {} : { scale: 0.9 }}
      className={`relative inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs uppercase tracking-wider transition-all select-none ${getStyleClass(
        value
      )} ${
        needsSubStepCritical
          ? 'ring-2 ring-amber-400 dark:ring-amber-500 animate-pulse'
          : isSubStepPrompted
          ? 'ring-2 ring-amber-300 dark:ring-amber-600/70'
          : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <motion.span
        key={value}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className="flex items-center gap-1.5"
      >
        {value === 'none' && (
          <>
            <CircleDot size={14} />
            <span>—</span>
          </>
        )}
        {value === '@' && (
          <>
            <ShieldAlert size={14} className="text-red-600 dark:text-red-400" />
            <span className="font-black text-red-600 dark:text-red-400 text-sm">@</span>
          </>
        )}
        {value === 'CC' && (
          <>
            <ShieldAlert size={14} />
            <span>CC</span>
          </>
        )}
        {value === 'SC' && (
          <>
            <ShieldCheck size={14} />
            <span>SC</span>
          </>
        )}
      </motion.span>
    </motion.button>
  );
}
