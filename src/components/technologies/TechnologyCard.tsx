import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Trash2, Hash, Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Technology } from '../../types/technology.types';

interface TechnologyCardProps {
  technology: Technology;
  onEdit: (tech: Technology) => void;
  onDelete: (tech: Technology) => void;
  onManageParams: (id: number) => void;
}

export const TechnologyCard: React.FC<TechnologyCardProps> = ({ technology, onEdit, onDelete, onManageParams }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => onEdit(technology)}
      className="glass-card p-5 hover:border-indigo-500/50 transition-industrial flex flex-col h-full rounded-xl group relative cursor-pointer"
    >
      {/* Header: Icon + Actions */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(technology); }}
            className="p-1.5 text-steel-400 hover:text-red-400 bg-steel-950/50 hover:bg-steel-800 rounded-md transition-colors cursor-pointer"
            title={t('common.delete', 'Eliminar')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="mb-4">
        <h3 className="text-steel-100 font-semibold text-lg leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2" title={technology.name}>
          {technology.name}
        </h3>
        <p className="text-sm text-steel-400 font-mono mt-1.5 flex items-center gap-2 truncate" title={technology.category}>
          {technology.category || t('technologies.noCategory', 'Sin categoría')}
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-steel-400 text-xs mb-3">
          <Hash className="w-4 h-4 shrink-0 text-steel-500" />
          <span>{t('technologies.table.params', 'Parámetros')}: <span className="font-mono text-steel-200">{technology.parameters?.length || 0}</span></span>
        </div>
      </div>

      <div className="mt-auto pt-4 flex flex-col gap-3 border-t border-steel-800/50">
        <div className="flex items-center justify-between">
          <button
            onClick={(e) => { e.stopPropagation(); onManageParams(technology.id); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-steel-800/30 text-steel-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 hover:!bg-indigo-500/20 hover:!text-indigo-300 transition-colors text-xs font-semibold tracking-wide"
            title={t('technologies.parameters.manageTooltip', 'Gestionar Parámetros Maestros')}
          >
            <Settings2 size={14} />
            {t('technologies.parameters.manage', 'Parámetros Maestros')}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
