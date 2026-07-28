import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutGrid, List as ListIcon, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DataLayoutProps {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  actionButton?: React.ReactNode;
  
  // Search & Filter
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (val: string) => void;
  extraFilters?: React.ReactNode;
  
  // View Toggle
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  disableViewToggle?: boolean;
  
  // Content
  isEmpty: boolean;
  emptyStateIcon?: React.ElementType;
  emptyStateTitle?: string;
  gridContent: React.ReactNode;
  tableContent: React.ReactNode;
  pagination?: React.ReactNode;
}

export const DataLayout: React.FC<DataLayoutProps> = ({
  title,
  subtitle,
  isLoading = false,
  actionButton,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  extraFilters,
  viewMode,
  onViewModeChange,
  disableViewToggle = false,
  isEmpty,
  emptyStateIcon: EmptyIcon = Search,
  emptyStateTitle,
  gridContent,
  tableContent,
  pagination
}) => {
  const { t } = useTranslation();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 md:p-8 w-full max-w-7xl mx-auto min-h-screen"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-steel-100 tracking-tight flex items-center gap-3">
            {title}
            {isLoading && <RefreshCw className="w-5 h-5 text-steel-500 animate-spin" />}
          </h1>
          {subtitle && <p className="text-steel-400 mt-2">{subtitle}</p>}
        </div>
        
        {actionButton && (
          <div className="shrink-0">
            {actionButton}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="w-full glass-card p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 relative z-30">
        <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4 w-full flex-1">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-500" />
            <input
              type="text"
              placeholder={searchPlaceholder || t('common.search', 'Buscar...')}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-steel-950 border border-steel-700 rounded-lg pl-9 pr-4 py-2 text-sm text-steel-100 placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
          <div className="flex-1 w-full min-w-0">
            {extraFilters}
          </div>
        </div>
        
        {!disableViewToggle && (
          <div className="flex items-center gap-3 w-full md:w-auto justify-end shrink-0">
            <div className="flex bg-steel-950 border border-steel-700 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-steel-800 text-indigo-400' : 'text-steel-400 hover:text-steel-200'} focus-ring cursor-pointer`}
                title="Vista de cuadrícula"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => onViewModeChange('table')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-steel-800 text-indigo-400' : 'text-steel-400 hover:text-steel-200'} focus-ring cursor-pointer`}
                title="Vista de tabla"
              >
                <ListIcon size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {isEmpty && !isLoading ? (
        <div className="glass-card p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-steel-800/50 flex items-center justify-center mb-4 text-steel-500">
            <EmptyIcon size={32} />
          </div>
          <h3 className="text-steel-300 font-medium">
            {emptyStateTitle || t('common.noResults', 'No se encontraron resultados')}
          </h3>
        </div>
      ) : (
        <div>
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {gridContent}
              </motion.div>
            ) : (
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="glass-card overflow-hidden"
              >
                {tableContent}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {!isEmpty && pagination && (
            <div className="mt-6 border-t border-steel-800/50 pt-6">
              {pagination}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
