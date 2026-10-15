import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Flag, Plus, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { OperationValidationResult } from '../../hooks/usePFMEAValidation';

interface PFMEAOperationBannerProps {
  operation: OperationValidationResult;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onAddRow: () => void;
  isReadOnly?: boolean;
  isTableRow?: boolean;
  colSpan?: number;
}

export const PFMEAOperationBanner: React.FC<PFMEAOperationBannerProps> = ({
  operation,
  isCollapsed,
  onToggleCollapse,
  onAddRow,
  isReadOnly = false,
  isTableRow = true,
  colSpan = 21,
}) => {
  const { t } = useTranslation();
  const { opTitle, totalRows, percentage, hasScCc, stepNumber } = operation;

  // Percentage color classes
  const getPercentageStyles = (pct: number) => {
    if (pct === 100) {
      return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60';
    }
    if (pct >= 50) {
      return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/60';
    }
    return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700/60';
  };

  const pctStyle = getPercentageStyles(percentage);

  const bannerContent = (
    <div className="flex items-center justify-between gap-3 flex-wrap w-full">
      {/* Left: Collapse Icon, OP badge, Title, SC/CC Audit Flag */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Animated Chevron */}
        <motion.div
          animate={{ rotate: isCollapsed ? -90 : 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="text-slate-500 dark:text-steel-400 p-0.5 rounded hover:bg-slate-300 dark:hover:bg-steel-800"
        >
          <ChevronDown size={16} />
        </motion.div>

        {/* OP Identifier Badge */}
        <span className="inline-flex items-center gap-1 bg-blue-600 dark:bg-blue-500/30 text-white dark:text-blue-300 border border-blue-700 dark:border-blue-400/40 rounded px-2 py-0.5 font-mono text-[10px] font-bold shadow-xs">
          <Layers size={10} />
          OP {stepNumber !== undefined ? stepNumber : ''}
        </span>

        {/* Operation Title */}
        <span className="font-bold text-xs tracking-wide text-slate-800 dark:text-steel-100">
          {opTitle}
        </span>

        {/* SC / CC Audit Flag Indicator */}
        {hasScCc ? (
          <div
            title={t('pfmea.worksheet.scCcCompliant', 'Cumple: Característica Especial (SC/CC) identificada')}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60 shadow-2xs"
          >
            <Flag size={11} className="fill-emerald-600 dark:fill-emerald-400 text-emerald-600 dark:text-emerald-400" />
            <span>{t('pfmea.worksheet.scCcIdentified', 'SC/CC Identificada')}</span>
          </div>
        ) : operation.requiresScCc ? (
          <div
            title={t('pfmea.worksheet.scCcPending', 'Atención de Calidad: Esta operación está marcada como crítica en el diagrama de flujo y requiere evaluar y marcar al menos una característica crítica (SC/CC) en esta operación')}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 shadow-2xs animate-pulse"
          >
            <Flag size={11} className="text-amber-600 dark:text-amber-400" />
            <span>{t('pfmea.worksheet.scCcPendingBadge', 'SC/CC Pendiente')}</span>
          </div>
        ) : null}
      </div>

      {/* Right: Metrics (Rows count, % Progress, + Add Row) */}
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {/* Row Counter Badge */}
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-slate-300 dark:border-steel-700 bg-white/80 dark:bg-steel-800/80 text-slate-700 dark:text-steel-300 shadow-2xs">
          {totalRows} {totalRows === 1 ? t('pfmea.progress.row', 'fila') : t('pfmea.progress.rows', 'filas')}
        </span>

        {/* Completeness Percentage Pill */}
        <span
          title={t('pfmea.progress.fieldsCompleted', 'Campos mandatorios completados: {{filled}} / {{total}}', {
            filled: operation.totalFilledFields,
            total: operation.totalRequiredFields,
          })}
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs ${pctStyle}`}
        >
          <span>{percentage}%</span>
          <span className="font-normal opacity-80">{t('pfmea.progress.complete', 'completo')}</span>
        </span>

        {/* Add Row Button */}
        {!isReadOnly && (
          <button
            type="button"
            onClick={onAddRow}
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 bg-white dark:bg-steel-900 border border-slate-300 dark:border-steel-700 px-2.5 py-1 rounded-lg shadow-2xs hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer ml-1"
            title={t('pfmea.worksheet.addRowToOp', 'Añadir Fila a esta Operación')}
          >
            <Plus size={12} />
            <span>{t('pfmea.worksheet.addRow', 'Fila')}</span>
          </button>
        )}
      </div>
    </div>
  );

  if (!isTableRow) {
    return (
      <div
        data-testid="operation-toggle"
        role="button" tabIndex={0} aria-expanded={!isCollapsed}
        onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onToggleCollapse();}}}
        onClick={onToggleCollapse}
        className="sticky left-0 z-20 bg-slate-200/90 dark:bg-steel-900 border-y border-slate-300 dark:border-steel-750 hover:bg-slate-250 dark:hover:bg-steel-850 px-4 py-2 text-slate-900 dark:text-white text-xs transition-colors cursor-pointer select-none shadow-xs"
      >
        {bannerContent}
      </div>
    );
  }

  return (
    <tr
      onClick={onToggleCollapse}
      className="bg-slate-200/90 dark:bg-steel-900 border-y border-slate-300 dark:border-steel-750 hover:bg-slate-250 dark:hover:bg-steel-850 transition-colors cursor-pointer select-none sticky left-0 z-20"
    >
      <td colSpan={colSpan} className="px-4 py-2 text-slate-900 dark:text-white text-xs">
        {bannerContent}
      </td>
    </tr>
  );
};
