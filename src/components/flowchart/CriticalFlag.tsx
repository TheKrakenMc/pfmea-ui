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
}

const CYCLE: CriticalFlagType[] = ['none', 'CC', 'SC'];

export function CriticalFlag({ value, onChange, disabled }: CriticalFlagProps) {
  const { t } = useTranslation();

  const handleClick = () => {
    if (disabled) return;
    const currentIndex = CYCLE.indexOf(value);
    const nextIndex = (currentIndex + 1) % CYCLE.length;
    onChange(CYCLE[nextIndex]);
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={t('flags.tooltip')}
      whileTap={disabled ? {} : { scale: 0.9 }}
      className={`focus-ring relative flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-industrial select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      style={getStyle(value)}
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

function getStyle(flag: CriticalFlagType): React.CSSProperties {
  switch (flag) {
    case 'CC':
      return {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        color: '#f87171',
        border: '1px solid rgba(239, 68, 68, 0.3)',
      };
    case 'SC':
      return {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        color: '#fbbf24',
        border: '1px solid rgba(245, 158, 11, 0.3)',
      };
    default:
      return {
        backgroundColor: 'rgba(90, 101, 128, 0.15)',
        color: '#8892a8',
        border: '1px solid rgba(90, 101, 128, 0.3)',
      };
  }
}
