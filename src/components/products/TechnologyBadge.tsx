import React from 'react';
import { Cpu, X } from 'lucide-react';
import type { Technology } from '../../types/product.types';

interface TechnologyBadgeProps {
  technology: Technology;
  compact?: boolean;
  onRemove?: (id: number) => void;
}

export const TechnologyBadge: React.FC<TechnologyBadgeProps> = ({ technology, compact = false, onRemove }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-forge-500/10 border border-forge-500/20 text-forge-400 font-medium ${
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
      title={technology.name || technology.operation_name}
    >
      <Cpu size={compact ? 12 : 14} />
      <span className="truncate max-w-[120px]">{technology.name || technology.operation_name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(technology.id);
          }}
          className="hover:bg-forge-500/20 rounded-full p-0.5 ml-0.5 transition-colors cursor-pointer"
        >
          <X size={compact ? 10 : 12} />
        </button>
      )}
    </span>
  );
};
