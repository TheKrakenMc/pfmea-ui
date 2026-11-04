import { useId } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
interface PaginationProps {
  currentPage: number; totalItems: number; itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void; itemsPerPageOptions?: number[];
}
export function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange,
  onItemsPerPageChange, itemsPerPageOptions = [12, 24, 48] }: PaginationProps) {
  const { t } = useTranslation('workspace');
  const id = useId();
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const page = Math.min(currentPage, totalPages);
  if (!totalItems) return null;
  return <nav className="workspace-pagination" aria-label={t('page', { current: page, total: totalPages })}>
    <p>{t('range', { start: (page - 1) * itemsPerPage + 1, end: Math.min(page * itemsPerPage, totalItems), total: totalItems })}</p>
    {onItemsPerPageChange && <label htmlFor={id} className="workspace-page-size">
      <span className="sr-only">{t('pageSize')}</span>
      <select id={id} className="ui-select" value={itemsPerPage} onChange={event => {
        onItemsPerPageChange(Number(event.target.value)); onPageChange(1);
      }}>{itemsPerPageOptions.map(size => <option key={size} value={size}>{size} / {t('pageSize')}</option>)}</select>
    </label>}
    <div className="workspace-pages">
      <button className="ui-icon-button" disabled={page <= 1} aria-label={t('previous')} onClick={() => onPageChange(page - 1)}><ChevronLeft size={20} /></button>
      <span>{t('page', { current: page, total: totalPages })}</span>
      <button className="ui-icon-button" disabled={page >= totalPages} aria-label={t('next')} onClick={() => onPageChange(page + 1)}><ChevronRight size={20} /></button>
    </div>
  </nav>;
}
