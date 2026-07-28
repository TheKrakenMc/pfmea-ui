import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Copy, Archive, GitBranch, History, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { FlowchartRead } from '../../services/flowchartService';
import { formatDate } from '../../utils/dateUtils';

interface FlowchartProjectCardProps {
  project: FlowchartRead;
  onEdit: (id: number) => void;
  onArchive?: (id: number) => void;
  onViewHistory?: (id: number) => void;
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-500/20 border-slate-500/50',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  'in review': 'bg-review-500/20 text-review-500 border-review-500/50',
  in_review: 'bg-review-500/20 text-review-500 border-review-500/50',
  archived: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/50',
};

function getStatusStyle(status: string): string {
  return STATUS_STYLES[status.toLowerCase()] ?? STATUS_STYLES.draft;
}


export const FlowchartProjectCard: React.FC<FlowchartProjectCardProps> = ({ project, onEdit, onArchive, onViewHistory }) => {
  const { t } = useTranslation();
  const isArchived = project.status?.toLowerCase() === 'archived';

  return (
    <motion.div
      whileHover={isArchived ? {} : { y: -4 }}
      onClick={() => !isArchived && onEdit(project.id)}
      className={`glass-card p-5 transition-industrial flex flex-col h-full rounded-xl group relative ${
        isArchived
          ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 cursor-default shadow-sm shadow-amber-900/5'
          : 'hover:border-indigo-500/50 cursor-pointer'
      }`}
    >

      {/* Header: Icon + Actions */}
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          isArchived ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'
        }`}>
          {isArchived ? <Archive className="w-5 h-5" /> : <GitBranch className="w-5 h-5" />}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${getStatusStyle(project.status)}`}>
            {t(`status.${project.status.toLowerCase()}`, project.status)}
          </span>
          {!isArchived && (
            <>

              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 text-steel-400 hover:text-indigo-400 bg-steel-950/50 hover:bg-indigo-400/10 rounded-md transition-colors cursor-pointer"
                title={t('dashboard.actions.duplicate', 'Duplicar')}
              >
                <Copy className="w-4 h-4" />
              </button>
              {onArchive && (
                <button
                  onClick={(e) => { e.stopPropagation(); onArchive(project.id); }}
                  className="p-1.5 text-steel-400 hover:text-amber-400 bg-steel-950/50 hover:bg-amber-400/10 rounded-md transition-colors cursor-pointer"
                  title={t('dashboard.actions.archive', 'Archivar')}
                >
                  <Archive className="w-4 h-4" />
                </button>
              )}
            </>
          )}
          {onViewHistory && (
            <button
              onClick={(e) => { e.stopPropagation(); onViewHistory(project.id); }}
              className="p-1.5 text-steel-400 hover:text-indigo-400 bg-steel-950/50 hover:bg-indigo-400/10 rounded-md transition-colors cursor-pointer"
              title={t('archive.banner.viewHistory', 'Historial')}
            >
              <History className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="mb-4">
        <h3 className={`font-semibold text-lg leading-tight transition-colors line-clamp-2 ${isArchived ? 'text-amber-900 dark:text-amber-100' : 'text-steel-100 group-hover:text-indigo-400'}`} title={project.title}>
          {project.title}
        </h3>
        <p className={`text-sm font-mono mt-1.5 flex items-center gap-2 truncate ${isArchived ? 'text-amber-700/80 dark:text-amber-400/80' : 'text-steel-400'}`} title={project.type}>
          {project.type}
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Placeholder for future description or extra fields */}
      </div>

      <div className={`mt-auto pt-4 flex flex-col gap-3 border-t ${isArchived ? 'border-amber-200 dark:border-amber-500/30' : 'border-steel-800/50'}`}>
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-medium font-mono ${
            isArchived 
              ? 'bg-amber-100/80 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300' 
              : 'bg-steel-800 border border-steel-700 text-steel-400'
          }`}>
            #{project.id} • v{project.version}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] uppercase tracking-wider font-semibold w-24 shrink-0 ${isArchived ? 'text-amber-700 dark:text-amber-500' : 'text-steel-500'}`}>{t('common.created', 'Creado:')}</span>
            <span className={`text-xs ${isArchived ? 'text-amber-900/80 dark:text-amber-200' : 'text-steel-400'}`}>
              {formatDate(project.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] uppercase tracking-wider font-semibold w-24 shrink-0 ${isArchived ? 'text-amber-700 dark:text-amber-500' : 'text-steel-500'}`}>{t('common.modified', 'Modificado:')}</span>
            <span className={`text-xs ${isArchived ? 'text-amber-900/80 dark:text-amber-200' : 'text-steel-400'}`}>
              {formatDate(project.updated_at)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
