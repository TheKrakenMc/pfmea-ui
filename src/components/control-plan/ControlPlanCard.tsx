import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Settings, Hash, CheckSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ControlPlan } from '../../api/controlPlanService';
import { formatDate } from '../../utils/dateUtils';

interface ControlPlanCardProps {
  controlPlan: ControlPlan;
  projectName?: string;
  customerName?: string;
  onSelect: (pfmeaId: number) => void;
  onSync?: (cpId: number) => void;
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-500/20 border-slate-500/50 text-slate-400',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  'in review': 'bg-review-500/20 text-review-500 border-review-500/50',
  in_review: 'bg-review-500/20 text-review-500 border-review-500/50',
  archived: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
};

function getStatusStyle(status: string): string {
  return STATUS_STYLES[status.toLowerCase()] ?? STATUS_STYLES.draft;
}

export const ControlPlanCard: React.FC<ControlPlanCardProps> = ({
  controlPlan,
  projectName,
  customerName,
  onSelect,
  onSync,
}) => {
  const { t } = useTranslation();
  const currentStatus = controlPlan.status || 'Draft';
  const itemCount = controlPlan.items?.length || 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => onSelect(controlPlan.pfmea_project_id)}
      className="glass-card p-5 transition-industrial flex flex-col h-full rounded-xl group relative hover:border-indigo-500/50 cursor-pointer"
    >
      {/* Header: Icon + Status + Sync */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-indigo-500/10 text-indigo-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${getStatusStyle(currentStatus)}`}>
            {currentStatus}
          </span>

          {onSync && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSync(controlPlan.id);
              }}
              className="p-1.5 text-steel-400 hover:text-indigo-400 bg-steel-950/50 hover:bg-indigo-400/10 rounded-md transition-colors cursor-pointer"
              title={t('controlPlan.syncTooltip', 'Sincronizar Críticos de PFMEA')}
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Title & Customer */}
      <div className="mb-4">
        <h3 className="font-semibold text-lg leading-tight transition-colors line-clamp-2 text-steel-100 group-hover:text-indigo-400" title={controlPlan.title}>
          {controlPlan.title}
        </h3>
        <p className="text-sm font-mono mt-1.5 flex items-center gap-2 truncate text-steel-400" title={customerName}>
          {customerName || projectName || t('common.noCustomer', 'Cliente no especificado')}
        </p>
      </div>

      {/* Code & Item Stats */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-steel-400 text-xs">
          <Hash className="w-4 h-4 shrink-0 text-steel-500" />
          <span className="font-mono truncate" title={controlPlan.control_plan_code}>
            {controlPlan.control_plan_code}
          </span>
        </div>
        <div className="flex items-center gap-2 text-steel-400 text-xs">
          <CheckSquare className="w-4 h-4 shrink-0 text-forge-400" />
          <span>{itemCount} {itemCount === 1 ? 'característica crítica' : 'características críticas'}</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-4 flex flex-col gap-3 border-t border-steel-800/50">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-medium font-mono bg-steel-800 border border-steel-700 text-steel-400">
            #{controlPlan.id} • v{controlPlan.version || '1'}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold w-24 shrink-0 text-steel-500">
              Creado:
            </span>
            <span className="text-xs text-steel-400">
              {formatDate(controlPlan.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold w-24 shrink-0 text-steel-500">
              Modificado:
            </span>
            <span className="text-xs text-steel-400">
              {formatDate(controlPlan.updated_at)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
