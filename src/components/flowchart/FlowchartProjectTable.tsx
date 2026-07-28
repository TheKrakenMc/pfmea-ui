import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Copy, Archive, History, Lock } from 'lucide-react';
import type { FlowchartRead } from '../../services/flowchartService';
import { formatDate } from '../../utils/dateUtils';

interface FlowchartProjectTableProps {
  flowcharts: FlowchartRead[];
  onEdit: (id: number) => void;
  onArchive?: (id: number) => void;
  onViewHistory?: (id: number) => void;
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-500/20 border-slate-500/50',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  'in review': 'bg-review-500/20 text-review-500 border-review-500/50',
  in_review: 'bg-review-500/20 text-review-500 border-review-500/50',
  archived: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
};

function getStatusStyle(status: string): string {
  return STATUS_STYLES[status.toLowerCase()] ?? STATUS_STYLES.draft;
}


export const FlowchartProjectTable: React.FC<FlowchartProjectTableProps> = ({ flowcharts, onEdit, onArchive, onViewHistory }) => {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left text-sm text-steel-300">
        <thead className="bg-steel-900/50 text-xs uppercase text-steel-400 border-b border-steel-800">
          <tr>
            <th className="px-6 py-4 font-semibold">{t('dashboard.table.description', 'Título')}</th>
            <th className="px-6 py-4 font-semibold">{t('dashboard.table.status')}</th>
            <th className="px-6 py-4 font-semibold">{t('dashboard.table.version')}</th>
            <th className="px-6 py-4 font-semibold">{t('dashboard.table.createdAt', 'Creado')}</th>
            <th className="px-6 py-4 font-semibold">{t('dashboard.table.updatedAt', 'Modificado')}</th>
            <th className="px-6 py-4 font-semibold text-right w-24">{t('dashboard.table.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-steel-800 text-sm">
          {flowcharts.map((fc) => {
            const isArchived = fc.status?.toLowerCase() === 'archived';
            return (
              <tr
                key={fc.id}
                className={`transition-colors group ${
                  isArchived
                    ? 'bg-amber-500/5 opacity-70 cursor-default'
                    : 'hover:bg-steel-800/30 cursor-pointer'
                }`}
                onClick={() => !isArchived && onEdit(fc.id)}
              >
                <td className="px-6 py-4 text-steel-200 font-medium">
                  <span className="flex items-center gap-1.5">
                    {isArchived && <Lock size={14} className="text-amber-400 shrink-0" />}
                    {fc.title}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(fc.status)}`}>
                    {t(`status.${fc.status.toLowerCase()}`, fc.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-steel-400 font-mono text-xs">
                  v{fc.version}
                </td>
                <td className="px-6 py-4 text-steel-400 text-xs whitespace-nowrap">
                  {formatDate(fc.created_at)}
                </td>
                <td className="px-6 py-4 text-steel-400 text-xs whitespace-nowrap">
                  {formatDate(fc.updated_at)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(fc.id); }}
                      className="p-1.5 text-steel-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors cursor-pointer"
                      title={t('dashboard.actions.edit', 'Editar')}
                      disabled={isArchived}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-steel-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors cursor-pointer"
                      title={t('dashboard.actions.duplicate', 'Duplicar')}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewHistory?.(fc.id); }}
                      className="p-1.5 text-steel-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors cursor-pointer"
                      title={t('dashboard.actions.history', 'Historial')}
                    >
                      <History className="w-4 h-4" />
                    </button>
                    {!isArchived && onArchive && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onArchive(fc.id); }}
                        className="p-1.5 text-steel-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors cursor-pointer"
                        title={t('dashboard.actions.archive', 'Archivar')}
                      >
                        <Archive className="w-4 h-4" />
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
