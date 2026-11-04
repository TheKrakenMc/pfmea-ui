import { Link } from 'react-router-dom';
import { DocumentStatus } from '../../components/ui/DocumentStatus';
import { useDocumentView } from '../../hooks/useDocumentView';
import { loadCatalog } from '../../utils/loadCatalog';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Plus, Users } from 'lucide-react';
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
  const requestVersion = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [search, rawSetSearch] = useState('');
  const setSearch = (value: Parameters<typeof rawSetSearch>[0]) => { rawSetSearch(value); setCurrentPage(1); };
  const [selectedStatuses, rawSetSelectedStatuses] = useState<string[]>([]);
  const setSelectedStatuses = (value: Parameters<typeof rawSetSelectedStatuses>[0]) => { rawSetSelectedStatuses(value); setCurrentPage(1); };
  const [selectedCustomers, rawSetSelectedCustomers] = useState<string[]>([]);
  const setSelectedCustomers = (value: Parameters<typeof rawSetSelectedCustomers>[0]) => { rawSetSelectedCustomers(value); setCurrentPage(1); };
  const [sortOrder, rawSetSortOrder] = useState<string>('date-desc');
  const setSortOrder = (value: Parameters<typeof rawSetSortOrder>[0]) => { rawSetSortOrder(value); setCurrentPage(1); };
  const [viewMode, setViewMode] = useDocumentView();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Reset to first page when search or filters change


  const fetchProducts = useCallback(async () => {
    const request = ++requestVersion.current;
    try {
      setIsLoading(true);
      setError(null);
      // We fetch all matching the search, then frontend filter the rest
      const data = await loadCatalog((skip, limit) => listProducts({ q: search, skip, limit }), () => request !== requestVersion.current);
      if (request === requestVersion.current) setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (request === requestVersion.current) setError(t('workspace:error'));
    } finally {
      if (request === requestVersion.current) setIsLoading(false);
    }
  }, [search, t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300); // Debounce
    return () => { clearTimeout(timer); requestVersion.current += 1; };
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
    const filtered = products.filter(p => {
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

  const safeCurrentPage = Math.min(currentPage, Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage)));

  const paginatedProducts = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, safeCurrentPage, itemsPerPage]);

  const hasActiveFilters = search.trim().length > 0 || selectedStatuses.length > 0 || selectedCustomers.length > 0 || sortOrder !== 'date-desc';
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
      className="workspace-create"
    >
      <Plus size={16} />
      {t('products.actions.create', 'Nuevo Producto')}
    </button>
  ) : undefined;

  return (
    <>
      <DataLayout
        resultCount={filteredProducts.length}
        error={error}
        onRetry={fetchProducts}
        hasActiveFilters={hasActiveFilters}
        onReset={handleResetFilters}
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
          <div className="workspace-grid">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        }
        tableContent={
          <table className="workspace-table"><thead><tr>
            {['part', 'customer', 'description', 'status'].map(key => <th scope="col" key={key}>{t(`workspace:${key}`)}</th>)}
          </tr></thead><tbody>{paginatedProducts.map(product => <tr key={product.id}>
            <td><Link className="workspace-table-title" to={`/products/${product.id}`}>{product.part_number || `#${product.id}`}</Link></td>
            <td>{product.customer?.company_name || '—'}</td><td>{product.description || '—'}</td>
            <td><DocumentStatus status={product.status} /></td>
          </tr>)}</tbody></table>
        }
        pagination={
          <Pagination
            currentPage={safeCurrentPage}
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
