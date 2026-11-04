import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Flag, Plus, Layers, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { WorksheetRow } from '../../api/pfmeaService';

export interface ControlPlanOperationBannerProps {
  operationTitle: string;
  stepNumber?: number | string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onAddRow: () => void;
  itemsCount: number;
  hasScCc: boolean;
  risks: WorksheetRow[];
  pfmeaProjectId: number;
  isReadOnly?: boolean;
}

export const ControlPlanOperationBanner: React.FC<ControlPlanOperationBannerProps> = ({
  operationTitle,
  stepNumber,
  isCollapsed,
  onToggleCollapse,
  onAddRow,
  itemsCount,
  hasScCc,
  risks,
  pfmeaProjectId,
  isReadOnly = false,
}) => {
  const { t } = useTranslation();

  // Extract clean operation title if it begins with [OP XX]
  const cleanTitle = stepNumber !== undefined
    ? operationTitle.replace(new RegExp(`^\\[OP\\s*${stepNumber}\\]\\s*`, 'i'), '')
    : operationTitle;

  return (
    <div
      onClick={onToggleCollapse}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggleCollapse();
        }
      }}
      className="group w-full flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-3 bg-slate-50/90 dark:bg-steel-900/90 border-y border-slate-200 dark:border-steel-800 hover:bg-slate-100/80 dark:hover:bg-steel-850/80 transition-colors duration-150 cursor-pointer select-none"
    >
      {/* Left: Chevron, OP Badge, Title, SC/CC flag, and Risk links */}
      <div className="flex flex-wrap items-center gap-2.5 min-w-0">
        {/* Animated Chevron */}
        <motion.div
          animate={{ rotate: isCollapsed ? -90 : 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="text-slate-400 dark:text-steel-400 group-hover:text-slate-700 dark:group-hover:text-steel-200 p-0.5 rounded transition-colors"
        >
          <ChevronDown size={18} />
        </motion.div>

        {/* OP Identifier Badge */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono tracking-tight bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 shadow-2xs tabular-nums">
          <Layers size={12} className="text-blue-600 dark:text-blue-400" />
          {stepNumber !== undefined && stepNumber !== '' ? `OP ${stepNumber}` : 'PROCESO'}
        </span>

        {/* Operation Title */}
        <h3 className="text-xs md:text-sm font-bold text-slate-800 dark:text-steel-100 tracking-tight truncate max-w-md">
          {cleanTitle || operationTitle}
        </h3>

        {/* SC / CC Audit Indicator */}
        {hasScCc && (
          <span
            title={t('controlPlan.scCcBadgeTooltip', 'Operación con Características Críticas / Especiales (SC/CC) registradas')}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs"
          >
            <Flag size={11} className="fill-emerald-600 dark:fill-emerald-400 text-emerald-600 dark:text-emerald-400" />
            <span>SC/CC</span>
          </span>
        )}

        {/* Linked Risks Chips */}
        {risks.length > 0 && (
          <div
            className="flex items-center flex-wrap gap-1.5 ml-1"
            onClick={(e) => e.stopPropagation()}
          >
            {risks.map((row) => {
              const isHigh = row.action_priority === 'H' || (row.severity && row.severity >= 9);
              return (
                <Link
                  key={row.id}
                  to={`/pfmea/${pfmeaProjectId}`}
                  title={`Modo de falla: ${row.failure_mode || 'Sin descripción'} — Severidad: ${row.severity ?? '—'}, AP: ${row.action_priority ?? '—'}`}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium font-mono tabular-nums border transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    isHigh
                      ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/40'
                      : 'bg-slate-100 dark:bg-steel-800/80 text-slate-600 dark:text-steel-400 border-slate-200 dark:border-steel-700 hover:text-slate-900 dark:hover:text-steel-200'
                  }`}
                >
                  <span>#{row.id}</span>
                  <span className="font-bold">AP {row.action_priority || '—'}</span>
                  <ExternalLink size={9} className="opacity-60" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Items counter badge & Add Row button */}
      <div
        className="flex items-center gap-2.5 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controls Count Pill */}
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold font-mono tabular-nums bg-white dark:bg-steel-800 text-slate-600 dark:text-steel-300 border border-slate-200 dark:border-steel-700 shadow-2xs">
          {itemsCount} {itemsCount === 1 ? t('controlPlan.controlSingular', 'control') : t('controlPlan.controlPlural', 'controles')}
        </span>

        {/* Add Row Button */}
        {!isReadOnly && (
          <button
            type="button"
            onClick={onAddRow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs hover:shadow-sm active:scale-[0.98] transition-all duration-150 cursor-pointer"
            title={t('controlPlan.addManualRowTooltip', 'Añadir nueva fila manual de control a esta operación')}
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>{t('controlPlan.addControlBtn', 'Añadir Control')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

