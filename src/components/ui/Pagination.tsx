import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
  itemsPerPageOptions?: number[];
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [12, 24, 48]
}) => {
  const { t } = useTranslation();
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalItems === 0 || totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-sm text-steel-400 mt-4">
      <div className="flex items-center gap-4">
        <span>
          {t('common.showing', 'Mostrando')} <span className="font-medium text-steel-200">{startItem}</span> {t('common.to', 'a')} <span className="font-medium text-steel-200">{endItem}</span> {t('common.of', 'de')} <span className="font-medium text-steel-200">{totalItems}</span> {t('common.results', 'resultados')}
        </span>
        
        {onItemsPerPageChange && (
          <div className="flex items-center gap-2 border-l border-steel-800 pl-4 hidden sm:flex">
            <label htmlFor="itemsPerPage" className="sr-only">Items per page</label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="bg-steel-900 border border-steel-700 text-steel-300 text-xs rounded focus:ring-indigo-500 focus:border-indigo-500 block p-1 outline-none transition-colors"
            >
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>{option} / {t('common.page', 'página')}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 rounded-md text-steel-400 hover:text-steel-200 hover:bg-steel-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={t('common.previous', 'Anterior')}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1 hidden sm:flex">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2 py-1 text-steel-500">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                    currentPage === page
                      ? 'bg-indigo-500/20 text-indigo-400 font-medium'
                      : 'text-steel-400 hover:text-steel-200 hover:bg-steel-800'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 rounded-md text-steel-400 hover:text-steel-200 hover:bg-steel-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={t('common.next', 'Siguiente')}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
