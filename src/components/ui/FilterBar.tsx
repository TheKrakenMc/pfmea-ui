import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FilterBarProps {
  children: React.ReactNode;
  onReset?: () => void;
  hasActiveFilters?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({ children, onReset, hasActiveFilters }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {children}
      
      {onReset && hasActiveFilters && (
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-steel-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
          title={t('common.resetFilters', 'Resetear Filtros')}
        >
          <RotateCcw size={14} />
          {t('common.reset', 'Resetear')}
        </button>
      )}
    </div>
  );
};
