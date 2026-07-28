import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Loader2, X, Scale } from 'lucide-react';
import { toast } from 'sonner';
import { useForm as useHookForm } from "react-hook-form";

import { getMeasurementUnits, createMeasurementUnit, updateMeasurementUnit, deleteMeasurementUnit } from '../../services/measurementUnits';
import type { MeasurementUnit } from '../../types/product.types';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataLayout } from '../../components/layout/DataLayout';
import { Pagination } from '../../components/ui/Pagination';
import { FilterBar } from '../../components/ui/FilterBar';
import { SortDropdown } from '../../components/ui/SortDropdown';
import { MultiSelectFilter } from '../../components/ui/MultiSelectFilter';

export const MeasurementUnitsPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<MeasurementUnit | null>(null);
  
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean; unit: MeasurementUnit | null}>({
    isOpen: false,
    unit: null
  });

  const [isCustomMagnitude, setIsCustomMagnitude] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [selectedMagnitudes, setSelectedMagnitudes] = useState<string[]>([]);

  const { data: units = [], isLoading } = useQuery({
    queryKey: ['measurementUnits'],
    queryFn: getMeasurementUnits,
  });

  const createMutation = useMutation({
    mutationFn: createMeasurementUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurementUnits'] });
      toast.success(t('measurementUnits.toast.createSuccess', 'Unit created successfully'));
      closeModal();
    },
    onError: () => toast.error(t('measurementUnits.toast.createError', 'Error creating unit')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MeasurementUnit> }) => updateMeasurementUnit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurementUnits'] });
      toast.success(t('measurementUnits.toast.updateSuccess', 'Unit updated successfully'));
      closeModal();
    },
    onError: () => toast.error(t('measurementUnits.toast.updateError', 'Error updating unit')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMeasurementUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurementUnits'] });
      toast.success(t('measurementUnits.toast.deleteSuccess', 'Unit deleted successfully'));
      setDeleteDialog({ isOpen: false, unit: null });
    },
    onError: () => toast.error(t('measurementUnits.toast.deleteError', 'Error deleting unit')),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useHookForm<MeasurementUnit>();

  const uniqueMagnitudes = useMemo(() => {
    const magnitudes = new Set(units.map(u => u.magnitude).filter(Boolean));
    return Array.from(magnitudes).sort();
  }, [units]);

  const openCreateModal = () => {
    setEditingUnit(null);
    reset({ description: '', symbology: '', magnitude: '' });
    setIsCustomMagnitude(uniqueMagnitudes.length === 0);
    setIsModalOpen(true);
  };

  const openEditModal = (unit: MeasurementUnit) => {
    setEditingUnit(unit);
    reset(unit);
    setIsCustomMagnitude(!uniqueMagnitudes.includes(unit.magnitude));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const onSubmit = (data: MeasurementUnit) => {
    if (editingUnit) {
      updateMutation.mutate({ id: editingUnit.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Reset page to 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder, selectedMagnitudes]);

  const filteredUnits = useMemo(() => {
    let filtered = units.filter(u => 
      u.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.symbology.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.magnitude.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedMagnitudes.length > 0) {
      filtered = filtered.filter(u => selectedMagnitudes.includes(u.magnitude));
    }

    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'desc':
          return b.id - a.id;
        case 'asc':
          return a.id - b.id;
        case 'name-asc':
          return (a.description || '').localeCompare(b.description || '');
        case 'name-desc':
          return (b.description || '').localeCompare(a.description || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [units, searchTerm, sortOrder, selectedMagnitudes]);

  const paginatedUnits = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUnits.slice(start, start + itemsPerPage);
  }, [filteredUnits, currentPage, itemsPerPage]);

  const hasActiveFilters = sortOrder !== 'desc' || searchTerm !== '' || selectedMagnitudes.length > 0;
  const handleResetFilters = () => {
    setSortOrder('desc');
    setSearchTerm('');
    setSelectedMagnitudes([]);
  };

  const magnitudeOptions = useMemo(() => {
    return uniqueMagnitudes.map(mag => ({ value: mag, label: mag }));
  }, [uniqueMagnitudes]);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const actionButton = (
    <button
      onClick={openCreateModal}
      className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all font-medium text-sm shadow-lg shadow-indigo-900/20 cursor-pointer focus-ring"
    >
      <Plus size={16} />
      {t('measurementUnits.newButton', 'New Unit')}
    </button>
  );

  const filterSelect = (
    <FilterBar onReset={handleResetFilters} hasActiveFilters={hasActiveFilters}>
      <MultiSelectFilter
        label={t('measurementUnits.form.magnitude', 'Magnitude')}
        icon={Scale}
        options={magnitudeOptions}
        selectedValues={selectedMagnitudes}
        onChange={setSelectedMagnitudes}
      />
      <SortDropdown
        options={[
          { value: 'desc', label: t('sort.newest', 'Newest') },
          { value: 'asc', label: t('sort.oldest', 'Oldest') },
          { value: 'name-asc', label: t('sort.aToZ', 'Name (A-Z)') },
          { value: 'name-desc', label: t('sort.zToA', 'Name (Z-A)') },
        ]}
        value={sortOrder}
        onChange={setSortOrder}
      />
    </FilterBar>
  );

  const tableContent = (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left text-sm text-steel-300">
        <thead className="bg-steel-900/50 text-xs uppercase text-steel-400 border-b border-steel-800">
          <tr>
            <th className="px-6 py-4 font-medium">
              {t('measurementUnits.table.description', 'DESCRIPTION')}
            </th>
            <th className="px-6 py-4 font-medium">
              {t('measurementUnits.table.symbology', 'SYMBOL')}
            </th>
            <th className="px-6 py-4 font-medium">
              {t('measurementUnits.table.magnitude', 'MAGNITUDE')}
            </th>
            <th className="px-6 py-4 font-medium text-right w-24">
              {t('measurementUnits.table.actions', 'ACTIONS')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-steel-800">
          {paginatedUnits.map((unit) => (
            <tr key={unit.id} className="hover:bg-steel-800/30 transition-colors group">
              <td className="px-6 py-4 font-medium text-steel-200">
                {unit.description}
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-steel-800/50 border border-steel-700 text-xs font-mono text-steel-300">
                  {unit.symbology}
                </span>
              </td>
              <td className="px-6 py-4 text-steel-400">
                {unit.magnitude}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(unit)}
                    className="p-1.5 text-steel-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors focus-ring"
                    title={t('measurementUnits.actions.edit', 'Edit')}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteDialog({ isOpen: true, unit })}
                    className="p-1.5 text-steel-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors focus-ring"
                    title={t('measurementUnits.actions.delete', 'Delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <DataLayout
        title={t('measurementUnits.pageTitle', 'Measurement Units')}
        subtitle={t('measurementUnits.subtitle', 'Catalog of measurement units')}
        isLoading={isLoading}
        actionButton={actionButton}
        searchPlaceholder={t('common.search', 'Search...')}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode="table"
        onViewModeChange={() => {}}
        disableViewToggle={true}
        isEmpty={filteredUnits.length === 0}
        extraFilters={filterSelect}
        gridContent={null}
        tableContent={tableContent}
        pagination={
          <Pagination
            currentPage={currentPage}
            totalItems={filteredUnits.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        }
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUnit ? t('measurementUnits.form.editTitle', 'Edit Unit') : t('measurementUnits.form.createTitle', 'New Measurement Unit')}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-steel-300 uppercase tracking-wider block mb-1.5">{t('measurementUnits.form.description', 'Description')}</label>
            <input
              {...register('description', { required: true })}
              placeholder={t('measurementUnits.form.descriptionPlaceholder', 'e.g. Kilogram')}
              className="w-full bg-steel-950 border border-steel-700 rounded-lg px-4 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-steel-300 uppercase tracking-wider block mb-1.5">{t('measurementUnits.form.symbology', 'Symbol')}</label>
            <input
              {...register('symbology', { required: true })}
              placeholder={t('measurementUnits.form.symbologyPlaceholder', 'e.g. kg')}
              className="w-full bg-steel-950 border border-steel-700 rounded-lg px-4 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-steel-300 uppercase tracking-wider block mb-1.5">{t('measurementUnits.form.magnitude', 'Magnitude')}</label>
            {!isCustomMagnitude ? (
              <select
                {...register('magnitude', { 
                  required: true,
                  onChange: (e) => {
                    if (e.target.value === 'other') {
                      setIsCustomMagnitude(true);
                      setValue('magnitude', '');
                    }
                  }
                })}
                className="w-full bg-steel-950 border border-steel-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
              >
                <option value="">{t('common.select', 'Select...')}</option>
                {uniqueMagnitudes.map(mag => (
                  <option key={mag} value={mag}>{mag}</option>
                ))}
                <option value="other">{t('common.other', 'Other')}</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  {...register('magnitude', { required: true })}
                  placeholder={t('measurementUnits.form.magnitudePlaceholder', 'e.g. Mass')}
                  autoFocus
                  className="w-full bg-steel-950 border border-steel-700 rounded-lg px-4 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                />
                {uniqueMagnitudes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomMagnitude(false);
                      setValue('magnitude', '');
                    }}
                    className="px-3 py-2.5 bg-steel-800 text-steel-400 hover:bg-steel-700 hover:text-white rounded-lg transition-colors border border-steel-700 flex items-center justify-center shrink-0"
                    title={t('common.cancel', 'Cancel')}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-steel-800 mt-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2.5 rounded-lg text-sm text-steel-400 hover:bg-steel-850 transition-colors font-medium cursor-pointer"
            >
              {t('measurementUnits.form.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-900/60 disabled:text-indigo-200 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-indigo-900/20 cursor-pointer"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              {isSaving ? t('measurementUnits.form.saving', 'Saving...') : t('measurementUnits.form.save', 'Save Unit')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, unit: null })}
        onConfirm={() => deleteDialog.unit && deleteMutation.mutate(deleteDialog.unit.id)}
        title={t('measurementUnits.actions.delete', 'Delete')}
        message={t('measurementUnits.confirmDelete', 'Are you sure you want to delete unit {{name}}?', { name: deleteDialog.unit?.description })}
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};
