import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Settings, ShieldCheck } from 'lucide-react';
import type { ControlPlan } from '../../api/controlPlanService';
import { formatDate } from '../../utils/dateUtils';

interface ControlPlanTableProps {
  controlPlans: ControlPlan[];
  projectNameMap?: Record<number, { title: string; customer: string }>;
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

export const ControlPlanTable: React.FC<ControlPlanTableProps> = ({
  controlPlans,
  projectNameMap = {},
  onSelect,
  onSync,
}) => {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left text-sm text-steel-300">
        <thead className="bg-steel-900/50 text-xs uppercase text-steel-400 border-b border-steel-800">
          <tr>
            <th className="px-6 py-4 font-semibold">{t('controlPlan.table.title', 'Título del Plan')}</th>
            <th className="px-6 py-4 font-semibold">{t('controlPlan.table.code', 'Código CP')}</th>
            <th className="px-6 py-4 font-semibold">{t('controlPlan.table.customer', 'Cliente')}</th>
            <th className="px-6 py-4 font-semibold">{t('controlPlan.table.status', 'Estado')}</th>
            <th className="px-6 py-4 font-semibold">{t('controlPlan.table.items', 'Características')}</th>
            <th className="px-6 py-4 font-semibold">{t('common.created', 'Creado')}</th>
            <th className="px-6 py-4 font-semibold text-right w-24">{t('common.actions', 'Acciones')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-steel-800">
          {controlPlans.map((cp) => {
            const currentStatus = cp.status || 'Draft';
            const projInfo = projectNameMap[cp.pfmea_project_id];
            const itemCount = cp.items?.length || 0;

            return (
              <tr
                key={cp.id}
                className="hover:bg-steel-800/30 cursor-pointer transition-colors group"
                onClick={() => onSelect(cp.pfmea_project_id)}
              >
                <td className="px-6 py-4 text-steel-200 font-medium">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{cp.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-steel-300 font-mono text-xs">
                  {cp.control_plan_code}
                </td>
                <td className="px-6 py-4 text-steel-300">
                  {projInfo?.customer || '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(currentStatus)}`}>
                    {currentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-steel-300 font-mono text-xs">
                  <span className="px-2 py-0.5 rounded bg-steel-800 border border-steel-700 text-forge-400 font-semibold">
                    {itemCount}
                  </span>
                </td>
                <td className="px-6 py-4 text-steel-400 text-xs whitespace-nowrap">
                  {formatDate(cp.created_at)}
                </td>
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onSelect(cp.pfmea_project_id)}
                      className="p-1.5 text-steel-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors focus-ring"
                      title={t('common.view', 'Ver / Editar')}
                    >
                      <Eye size={16} />
                    </button>
                    {onSync && (
                      <button
                        onClick={() => onSync(cp.id)}
                        className="p-1.5 text-steel-400 hover:text-forge-400 hover:bg-forge-400/10 rounded-lg transition-colors focus-ring"
                        title={t('controlPlan.syncTooltip', 'Sincronizar Críticos')}
                      >
                        <Settings size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
