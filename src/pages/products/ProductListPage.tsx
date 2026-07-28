import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, LayoutGrid, List as ListIcon, RefreshCw, Users, Edit, Copy, Archive, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { listProducts } from '../../services/productService';
import { useRBAC } from '../../hooks/useRBAC';
import { ProductCard } from '../../components/products/ProductCard';
import { ProductCreateModal } from '../../components/products/ProductCreateModal';
import { DataLayout } from '../../components/layout/DataLayout';
import { Pagination } from '../../components/ui/Pagination';
import { FilterBar } from '../../components/ui/FilterBar';
import { MultiSelectFilter } from '../../components/ui/MultiSelectFilter';
import { SortDropdown } from '../../components/ui/SortDropdown';
import type { Product } from '../../types/product.types';

export const ProductListPage: React.FC = () => {
  const { t } = useTranslation();
  const { canEditProduct } = useRBAC();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<string>('date-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStatuses, selectedCustomers, sortOrder]);
  
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      // We fetch all matching the search, then frontend filter the rest
      const data = await listProducts({ q: search });
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300); // Debounce
    return () => clearTimeout(timer);
  }, [search, fetchProducts]);

  // Extract unique options for filters
  const filterOptions = useMemo(() => {
    const statuses = new Set<string>();
    const customers = new Set<string>();
    
    products.forEach(p => {
      if (p.status) statuses.add(p.status);
      if (p.customer?.company_name) customers.add(p.customer.company_name);
    });
    
    return {
      statuses: Array.from(statuses).map(s => ({ value: s, label: t(`status.${s.toLowerCase()}`, s) })),
      customers: Array.from(customers).map(c => ({ value: c, label: c }))
    };
  }, [products, t]);

  // Filters & Sort
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchesStatus = selectedStatuses.length === 0 || (p.status && selectedStatuses.includes(p.status));
      const customerName = p.customer?.company_name || '';
      const matchesCustomer = selectedCustomers.length === 0 || (customerName && selectedCustomers.includes(customerName));
      return matchesStatus && matchesCustomer;
    });

    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title-asc':
          return (a.part_number || '').localeCompare(b.part_number || '');
        case 'title-desc':
          return (b.part_number || '').localeCompare(a.part_number || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, selectedStatuses, selectedCustomers, sortOrder]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const hasActiveFilters = selectedStatuses.length > 0 || selectedCustomers.length > 0 || sortOrder !== 'date-desc';
  const handleResetFilters = () => {
    setSelectedStatuses([]);
    setSelectedCustomers([]);
    setSortOrder('date-desc');
    setSearch(''); // We can reset search too if needed, but it triggers API fetch. I'll reset it anyway.
  };

  const filterSelect = (
    <FilterBar onReset={handleResetFilters} hasActiveFilters={hasActiveFilters}>
      <MultiSelectFilter
        label={t('common.customer', 'Cliente')}
        icon={Users}
        options={filterOptions.customers}
        selectedValues={selectedCustomers}
        onChange={setSelectedCustomers}
      />
      <MultiSelectFilter
        label={t('common.status', 'Estado')}
        options={filterOptions.statuses}
        selectedValues={selectedStatuses}
        onChange={setSelectedStatuses}
      />
      <SortDropdown
        options={[
          { value: 'date-desc', label: t('sort.newest', 'Más recientes') },
          { value: 'date-asc', label: t('sort.oldest', 'Más antiguos') },
          { value: 'title-asc', label: t('sort.aToZ', 'Nombre (A-Z)') },
          { value: 'title-desc', label: t('sort.zToA', 'Nombre (Z-A)') },
        ]}
        value={sortOrder}
        onChange={setSortOrder}
      />
    </FilterBar>
  );

  const actionButton = canEditProduct ? (
    <button 
      onClick={() => setIsCreateModalOpen(true)}
      className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all font-medium text-sm shadow-lg shadow-indigo-900/20 cursor-pointer focus-ring"
    >
      <Plus size={16} />
      {t('products.actions.create', 'Nuevo Producto')}
    </button>
  ) : undefined;

  return (
    <>
      <DataLayout
        title={t('products.title')}
        subtitle={t('products.subtitle')}
        isLoading={isLoading}
        actionButton={actionButton}
        searchPlaceholder={t('products.searchPlaceholder')}
        searchValue={search}
        onSearchChange={setSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isEmpty={filteredProducts.length === 0}
        extraFilters={filterSelect}
        gridContent={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        }
        tableContent={
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-steel-300">
              <thead className="bg-steel-900/50 text-xs uppercase text-steel-400 border-b border-steel-800">
                <tr>
                  <th className="px-6 py-4 font-medium">{t('products.form.partNumber')}</th>
                  <th className="px-6 py-4 font-medium">{t('products.form.customer')}</th>
                  <th className="px-6 py-4 font-medium">{t('products.form.description')}</th>
                  <th className="px-6 py-4 font-medium">{t('products.form.status')}</th>
                  <th className="px-6 py-4 font-medium text-right w-24">{t('products.table.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-800">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-steel-800/30 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 font-mono font-medium text-steel-200">
                      {product.part_number}
                    </td>
                    <td className="px-6 py-4">
                      {product.customer?.company_name || '-'}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      {product.description || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-steel-800 text-steel-300">
                        {product.status || 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1.5 text-steel-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors focus-ring"
                          title={t('common.edit', 'Editar')}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="p-1.5 text-steel-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors focus-ring"
                          title={t('common.duplicate', 'Duplicar')}
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          className="p-1.5 text-steel-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors focus-ring"
                          title={t('common.archive', 'Archivar')}
                        >
                          <Archive size={16} />
                        </button>
                        <button
                          className="p-1.5 text-steel-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors focus-ring"
                          title={t('common.history', 'Historial')}
                        >
                          <History size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
        pagination={
          <Pagination
            currentPage={currentPage}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        }
      />
      <ProductCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => fetchProducts()}
      />
    </>
  );
};

export default ProductListPage;
