import React from 'react';
import { Cpu, X } from 'lucide-react';
import type { Technology } from '../../types/product.types';

interface TechnologyBadgeProps {
  technology: Technology;
  compact?: boolean;
  onRemove?: (id: number) => void;
}

export const TechnologyBadge: React.FC<TechnologyBadgeProps> = ({
  technology,
  compact = false,
  onRemove,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-[var(--ui-tint)] border border-[color-mix(in_srgb,var(--ui-accent)_25%,var(--ui-line))] text-[var(--ui-accent)] font-medium transition-colors ${
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
      title={technology.name || technology.operation_name}
    >
      <Cpu size={compact ? 12 : 14} />
      <span className="truncate max-w-[140px]">
        {technology.name || technology.operation_name}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(technology.id);
          }}
          className="hover:bg-[color-mix(in_srgb,var(--ui-accent)_18%,transparent)] active:scale-95 rounded-full p-0.5 ml-0.5 transition-all cursor-pointer"
        >
          <X size={compact ? 10 : 12} />
        </button>
      )}
    </span>
  );
};
