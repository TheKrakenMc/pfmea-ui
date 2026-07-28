import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Package, Hash, FileText, Copy, Archive, History, Maximize2, Scale, Timer, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types/product.types';
import { TechnologyBadge } from './TechnologyBadge';
import { formatDate } from '../../utils/dateUtils';

const STATUS_STYLES = {
  active: 'bg-success-500/10 text-success-400 border-success-500/20',
  inactive: 'bg-steel-500/10 text-steel-400 border-steel-500/20',
  archived: 'bg-alert-500/10 text-alert-400 border-alert-500/20',
} as const;

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();


  const statusStyle = STATUS_STYLES[(product.status?.toLowerCase() as keyof typeof STATUS_STYLES)] || STATUS_STYLES.inactive;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/products/${product.id}`)}
      className="glass-card p-5 hover:border-indigo-500/50 transition-industrial flex flex-col h-full rounded-xl group relative cursor-pointer"
    >
      {/* Header: Icon + Actions */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
          <Package className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${statusStyle}`}>
            {product.status || 'Draft'}
          </span>

          <button
            onClick={(e) => { e.stopPropagation(); }}
            className="p-1.5 text-steel-400 hover:text-indigo-400 bg-steel-950/50 hover:bg-indigo-400/10 rounded-md transition-colors"
            title={t('common.duplicate', 'Duplicar')}
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); }}
            className="p-1.5 text-steel-400 hover:text-amber-400 bg-steel-950/50 hover:bg-amber-400/10 rounded-md transition-colors"
            title={t('common.archive', 'Archivar')}
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); }}
            className="p-1.5 text-steel-400 hover:text-indigo-400 bg-steel-950/50 hover:bg-indigo-400/10 rounded-md transition-colors"
            title={t('common.history', 'Historial')}
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="mb-4">
        <h3 className="text-steel-100 font-semibold text-lg leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2" title={product.part_number || ''}>
          {product.part_number}
        </h3>
        <p className="text-sm text-steel-400 font-mono mt-1.5 flex items-center gap-2 truncate" title={product.customer?.company_name}>
          {product.customer?.company_name || 'No Customer'}
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-start gap-2 text-steel-400 text-xs mb-3">
          <FileText className="w-4 h-4 shrink-0 mt-0.5 text-steel-500" />
          <p className="line-clamp-2 leading-relaxed" title={product.description || ''}>
            {product.description || 'No description provided.'}
          </p>
        </div>

        {product.customer_part_number && (
          <div className="flex items-center gap-2 text-steel-400 text-xs mb-3">
            <Hash className="w-4 h-4 shrink-0 text-steel-500" />
            <span className="font-mono truncate" title={product.customer_part_number}>
              {product.customer_part_number}
            </span>
          </div>
        )}
      </div>

      {(product.dimensions || product.weight || product.cycle_time || product.rate_per_hour) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {product.dimensions && (
            <span className="inline-flex items-center gap-1 text-[10px] bg-steel-900 border border-steel-700/50 text-steel-400 px-2 py-0.5 rounded uppercase tracking-wider font-semibold">
              <Maximize2 className="w-3 h-3 text-indigo-400" />
              {product.dimensions}
            </span>
          )}
          {product.weight && (
            <span className="inline-flex items-center gap-1 text-[10px] bg-steel-900 border border-steel-700/50 text-steel-400 px-2 py-0.5 rounded uppercase tracking-wider font-semibold">
              <Scale className="w-3 h-3 text-emerald-400" />
              {product.weight} kg
            </span>
          )}
          {product.cycle_time && (
            <span className="inline-flex items-center gap-1 text-[10px] bg-steel-900 border border-steel-700/50 text-steel-400 px-2 py-0.5 rounded uppercase tracking-wider font-semibold">
              <Timer className="w-3 h-3 text-amber-400" />
              {product.cycle_time}s
            </span>
          )}
          {product.rate_per_hour && (
            <span className="inline-flex items-center gap-1 text-[10px] bg-steel-900 border border-steel-700/50 text-steel-400 px-2 py-0.5 rounded uppercase tracking-wider font-semibold">
              <Zap className="w-3 h-3 text-rose-400" />
              {product.rate_per_hour} pz/hr
            </span>
          )}
        </div>
      )}

      <div className="mt-auto pt-4 flex flex-col gap-3 border-t border-steel-800/50">
        {product.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.technologies.slice(0, 3).map(tech => (
              <TechnologyBadge key={tech.id} technology={tech} compact />
            ))}
            {product.technologies.length > 3 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-steel-800 border border-steel-700 text-steel-400 text-[10px] font-medium">
                +{product.technologies.length - 3}
              </span>
            )}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-steel-500 uppercase tracking-wider font-semibold w-24 shrink-0">{t('common.created', 'Creado:')}</span>
            <span className="text-xs text-steel-400">
              {formatDate(product.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-steel-500 uppercase tracking-wider font-semibold w-24 shrink-0">{t('common.modified', 'Modificado:')}</span>
            <span className="text-xs text-steel-400">
              {formatDate(product.updated_at)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
