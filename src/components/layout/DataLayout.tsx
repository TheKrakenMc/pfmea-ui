import React from 'react';
import { Search, LayoutGrid, List, X, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { badgeVariants, EASING } from '../../utils/motion';

interface DataLayoutProps {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  actionButton?: React.ReactNode;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  extraFilters?: React.ReactNode;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  disableViewToggle?: boolean;
  isEmpty: boolean;
  emptyStateIcon?: React.ElementType;
  emptyStateTitle?: string;
  gridContent: React.ReactNode;
  tableContent: React.ReactNode;
  pagination?: React.ReactNode;
  error?: string | null;
  onRetry?: () => void;
  resultCount?: number;
  hasActiveFilters?: boolean;
  onReset?: () => void;
}

export function DataLayout({
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
  pagination,
  error,
  onRetry,
  resultCount,
  hasActiveFilters,
  onReset,
}: DataLayoutProps) {
  const { t } = useTranslation('workspace');
  return (
    <section className="workspace-page" aria-label={title}>
      <header className="workspace-heading">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {actionButton && <div className="workspace-primary">{actionButton}</div>}
      </header>
      <div className="workspace-toolbar">
        <div className="workspace-toolbar-top">
          <div className="workspace-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              aria-label={searchPlaceholder || t('search')}
              placeholder={searchPlaceholder || t('search')}
              value={searchValue}
              onChange={event => onSearchChange(event.target.value)}
            />
            <AnimatePresence>
              {searchValue && (
                <motion.button
                  key="clear-search"
                  type="button"
                  className="ui-icon-button"
                  aria-label={t('clearSearch')}
                  onClick={() => onSearchChange('')}
                  variants={badgeVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <X size={16} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          {!disableViewToggle && (
            <div className="workspace-view" role="group" aria-label={t('view')}>
              {(['grid', 'table'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  aria-label={t(mode)}
                  aria-pressed={viewMode === mode}
                  onClick={() => onViewModeChange(mode)}
                >
                  {mode === 'grid' ? <LayoutGrid size={16} /> : <List size={17} />}
                  <span>{t(mode)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {extraFilters && <div className="workspace-filters">{extraFilters}</div>}
      </div>
      <div className="workspace-results" role="status" aria-live="polite">
        {isLoading
          ? t('loading')
          : !error && resultCount !== undefined
            ? t('results', { count: resultCount })
            : null}
      </div>
      <div aria-busy={isLoading}>
        {error ? (
          <div className="workspace-empty" role="alert">
            <AlertCircle size={28} />
            <h2>{t('error')}</h2>
            {error !== t('error') && <p>{error}</p>}
            {onRetry && (
              <button type="button" className="ui-button" onClick={onRetry}>
                {t('retry')}
              </button>
            )}
          </div>
        ) : isLoading && isEmpty ? (
          <div className="workspace-grid" aria-hidden="true">
            {[0, 1, 2].map(item => (
              <div key={item} className="workspace-skeleton">
                <span />
                <span />
                <span />
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <div className="workspace-empty">
            <EmptyIcon size={28} />
            <h2>{emptyStateTitle || t('empty')}</h2>
            <p>{t(hasActiveFilters ? 'emptyHint' : 'emptyCatalog')}</p>
            {hasActiveFilters && onReset && (
              <button type="button" className="ui-button" onClick={onReset}>
                {t('reset')}
              </button>
            )}
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                className="workspace-content"
                initial={{ opacity: 0, y: 4 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.2, ease: EASING.out },
                }}
                exit={{
                  opacity: 0,
                  y: -3,
                  transition: { duration: 0.14, ease: EASING.in },
                }}
              >
                {viewMode === 'grid' ? (
                  gridContent
                ) : (
                  <>
                    <p className="workspace-table-hint">{t('tableHint')}</p>
                    <div
                      className="workspace-table-region"
                      role="region"
                      tabIndex={0}
                      aria-label={`${title} · ${t('table')}`}
                    >
                      {tableContent}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
            {pagination}
          </>
        )}
      </div>
    </section>
  );
}
