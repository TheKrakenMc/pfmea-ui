import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Zap } from 'lucide-react';
import TechnologyTable from '../../components/technologies/TechnologyTable';
import { TechnologyCard } from '../../components/technologies/TechnologyCard';
import TechnologyForm from '../../components/technologies/TechnologyForm';
import DeleteConfirmation from '../../components/technologies/DeleteConfirmation';
import TechnologyCategoryManager from '../../components/technologies/TechnologyCategoryManager';
import { useTechnology, useDeleteTechnology, useTechnologyCategories } from '../../hooks/useTechnology';
import { TechnologyParameterManager } from '../../components/technologies/TechnologyParameterManager';
import type { Technology } from '../../types/technology.types';
import { DataLayout } from '../../components/layout/DataLayout';
import { Pagination } from '../../components/ui/Pagination';
import { FilterBar } from '../../components/ui/FilterBar';
import { MultiSelectFilter } from '../../components/ui/MultiSelectFilter';
import { Settings, Layers } from 'lucide-react';

const TechnologiesPage: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useTechnology();
  const deleteMutation = useDeleteTechnology();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const { data: categories } = useTechnologyCategories();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Reset pagination on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategories]);
  const [editingTech, setEditingTech] = useState<Technology | Record<string, never> | null>(null);
  const [deletingTech, setDeletingTech] = useState<Technology | null>(null);
  const [managingParamsForTech, setManagingParamsForTech] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    let result = data.filter((tech) => {
      const matchesSearch = tech.name.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });

    if (selectedCategories.length > 0) {
      result = result.filter((tech) => selectedCategories.includes(tech.category));
    }

    return result;
  }, [data, search, selectedCategories]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const handleDelete = async (tech: Technology) => {
    try {
      await deleteMutation.mutateAsync(tech.id);
      setDeletingTech(null);
    } catch {
      // Error is handled globally
    }
  };

  const actionButton = (
    <button
      onClick={() => setEditingTech({})}
      className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all font-medium text-sm shadow-md shadow-indigo-900/20"
    >
      <Zap size={16} /> {t('technologies.form.createTitle')}
    </button>
  );

  const categoryOptions = useMemo(() => {
    return categories?.map(c => ({ value: c.name, label: c.name })) || [];
  }, [categories]);

  const hasActiveFilters = search !== '' || selectedCategories.length > 0;
  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategories([]);
  };

  const extraFilters = (
    <FilterBar onReset={handleResetFilters} hasActiveFilters={hasActiveFilters}>
      <MultiSelectFilter
        label={t('technologies.table.category', 'Categoría')}
        icon={Layers}
        options={categoryOptions}
        selectedValues={selectedCategories}
        onChange={setSelectedCategories}
      />
      <button
        onClick={() => setIsCategoryManagerOpen(true)}
        className="px-3 py-2 bg-steel-950/50 border border-steel-700 text-steel-300 hover:text-indigo-400 hover:bg-steel-800 rounded-lg transition-colors flex items-center justify-center font-medium text-sm gap-2"
        title={t('technologies.categories.manageTitle', 'Manage Categories')}
      >
        <Settings size={16} />
      </button>
    </FilterBar>
  );

  return (
    <>
      <DataLayout
        title={t('technologies.pageTitle')}
        isLoading={isLoading}
        actionButton={actionButton}
        searchPlaceholder={t('technologies.table.search')}
        searchValue={search}
        onSearchChange={setSearch}
        extraFilters={extraFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isEmpty={filtered.length === 0}
        gridContent={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map(tech => (
              <TechnologyCard
                key={tech.id}
                technology={tech}
                onEdit={setEditingTech}
                onDelete={setDeletingTech}
                onManageParams={() => setManagingParamsForTech(tech.id)}
              />
            ))}
          </div>
        }
        tableContent={
          <TechnologyTable
            technologies={paginated}
            onEdit={setEditingTech}
            onDelete={setDeletingTech}
            onManageParams={(id) => setManagingParamsForTech(id)}
          />
        }
        pagination={
          <Pagination
            currentPage={currentPage}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        }
      />

      {editingTech && (
        <TechnologyForm
          tech={editingTech as Technology}
          onClose={() => setEditingTech(null)}
        />
      )}

      {deletingTech && (
        <DeleteConfirmation
          techName={deletingTech.name}
          onConfirm={() => handleDelete(deletingTech)}
          onCancel={() => setDeletingTech(null)}
          isDeleting={deleteMutation.isPending}
        />
      )}

      <TechnologyCategoryManager
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
      />
      {managingParamsForTech && (
        <TechnologyParameterManager
          techId={managingParamsForTech}
          techName={data?.find(t => t.id === managingParamsForTech)?.name || ''}
          isOpen={true}
          onClose={() => setManagingParamsForTech(null)}
        />
      )}
    </>
  );
};

export default TechnologiesPage;
