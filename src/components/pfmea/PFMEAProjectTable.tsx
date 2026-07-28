import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Copy, Archive, History } from 'lucide-react';
import type { PfmeaHeader } from '../../api/pfmeaService';
import { formatDate } from '../../utils/dateUtils';

interface PFMEAProjectTableProps {
  pfmeas: PfmeaHeader[];
  onEdit: (id: number) => void;
  onArchive?: (id: number) => void;
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-500/20 border-slate-500/50 text-slate-400',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  'in review': 'bg-review-500/20 text-review-500 border-review-500/50',
  in_review: 'bg-review-500/20 text-review-500 border-review-500/50',
  'submitted for review': 'bg-review-500/20 text-review-500 border-review-500/50',
  archived: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/50',
};

function getStatusStyle(status: string): string {
  return STATUS_STYLES[status.toLowerCase()] ?? STATUS_STYLES.draft;
}


export const PFMEAProjectTable: React.FC<PFMEAProjectTableProps> = ({ pfmeas, onEdit, onArchive }) => {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left text-sm text-steel-300">
        <thead className="bg-steel-900/50 text-xs uppercase text-steel-400 border-b border-steel-800">
          <tr>
            <th className="px-6 py-4 font-semibold">{t('pfmea.dashboard.table.project')}</th>
            <th className="px-6 py-4 font-semibold">{t('pfmea.dashboard.table.customer')}</th>
            <th className="px-6 py-4 font-semibold">{t('pfmea.dashboard.table.partNumber')}</th>
            <th className="px-6 py-4 font-semibold">{t('pfmea.dashboard.table.status')}</th>
            <th className="px-6 py-4 font-semibold">{t('pfmea.dashboard.table.createdAt', 'Creado')}</th>
            <th className="px-6 py-4 font-semibold text-right w-24">{t('pfmea.dashboard.table.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-steel-800">
          {pfmeas.map((fc) => {
            const currentStatus = fc.moc_status || fc.status || 'Draft';
            const isArchived = currentStatus.toLowerCase() === 'archived';
            return (
            <tr
              key={fc.id}
              className={`${isArchived ? 'bg-amber-50/10 dark:bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-steel-800/30 cursor-pointer'} transition-colors group`}
              onClick={() => !isArchived && onEdit(fc.id)}
            >
              <td className="px-6 py-4 text-steel-200 font-medium">
                {fc.project_name}
              </td>
              <td className="px-6 py-4 text-steel-300">
                {fc.customer}
              </td>
              <td className="px-6 py-4 text-steel-300 font-mono">
                {fc.part_number || '-'}
              </td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(currentStatus)}`}>
                  {t(`pfmea.dashboard.filters.${currentStatus.toLowerCase()}`, currentStatus)}
                </span>
              </td>
              <td className="px-6 py-4 text-steel-400 text-xs whitespace-nowrap">
                {formatDate(fc.created_at)}
              </td>
              <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isArchived && (
                    <button
                      onClick={() => onEdit(fc.id)}
                      className="p-1.5 text-steel-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors focus-ring"
                      title={t('pfmea.dashboard.actions.edit')}
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  {!isArchived && (
                    <button
                      className="p-1.5 text-steel-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors focus-ring"
                      title={t('pfmea.dashboard.actions.duplicate')}
                    >
                      <Copy size={16} />
                    </button>
                  )}
                  {!isArchived && onArchive && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onArchive(fc.id); }}
                      className="p-1.5 text-steel-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors focus-ring"
                      title={t('pfmea.dashboard.actions.archive', 'Archivar')}
                    >
                      <Archive size={16} />
                    </button>
                  )}
                  <button
                    className="p-1.5 text-steel-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors focus-ring"
                    title={t('pfmea.dashboard.actions.history', 'Historial')}
                  >
                    <History size={16} />
                  </button>
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
