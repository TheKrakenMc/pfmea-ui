import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Edit2, Trash2, MapPin, Building } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import {
  listLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  type ManufacturingLocation
} from '../../services/locationService';
import { LocationTable } from '../../components/locations/LocationTable';
import { LocationCard } from '../../components/locations/LocationCard';
import { DataLayout } from '../../components/layout/DataLayout';
import { Pagination } from '../../components/ui/Pagination';

const LocationsPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<ManufacturingLocation | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ManufacturingLocation>>({
    location_code: '',
    location_name: '',
    location_type: '',
    description: '',
  });

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Reset pagination on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => listLocations(),
  });

  const createMutation = useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success(t('locations.toast.createSuccess'));
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(t('locations.toast.createError'));
      console.error(error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success(t('locations.toast.updateSuccess'));
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(t('locations.toast.updateError'));
      console.error(error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success(t('locations.toast.deleteSuccess'));
    },
    onError: (error) => {
      toast.error(t('locations.toast.deleteError'));
      console.error(error);
    }
  });

  const handleOpenForm = (loc?: ManufacturingLocation) => {
    if (loc) {
      setEditingLocation(loc);
      setFormData({
        location_code: loc.location_code,
        location_name: loc.location_name,
        location_type: loc.location_type || '',
        description: loc.description || '',
      });
    } else {
      setEditingLocation(null);
      setFormData({
        location_code: '',
        location_name: '',
        location_type: '',
        description: '',
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingLocation(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLocation) {
      updateMutation.mutate({ id: editingLocation.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (loc: ManufacturingLocation) => {
    if (window.confirm(t('locations.confirmDelete', { name: loc.location_name }))) {
      deleteMutation.mutate(loc.id);
    }
  };

  const filtered = locations.filter((loc) => {
    const term = search.toLowerCase();
    return loc.location_name.toLowerCase().includes(term) || loc.location_code.toLowerCase().includes(term);
  });

  const paginated = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const actionButton = (
    <button
      onClick={() => handleOpenForm()}
      className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all font-medium text-sm shadow-lg shadow-indigo-900/20 cursor-pointer"
    >
      <Plus size={16} /> {t('locations.newButton')}
    </button>
  );

  return (
    <>
      <DataLayout
        title={t('locations.pageTitle')}
        subtitle={t('locations.subtitle')}
        isLoading={isLoading}
        actionButton={actionButton}
        searchValue={search}
        onSearchChange={setSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isEmpty={filtered.length === 0}
        gridContent={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map(loc => (
              <LocationCard
                key={loc.id}
                location={loc}
                onEdit={handleOpenForm}
                onDelete={handleDelete}
              />
            ))}
          </div>
        }
        tableContent={
          <LocationTable
            locations={paginated}
            onEdit={handleOpenForm}
            onDelete={handleDelete}
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

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-steel-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-steel-900 border border-steel-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-steel-800/80 flex items-center justify-between bg-steel-950/50">
                <h2 className="text-lg font-semibold text-steel-100 flex items-center gap-2">
                  <MapPin className="text-indigo-500" size={20} />
                  {editingLocation ? t('locations.form.editTitle') : t('locations.form.createTitle')}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-steel-400 hover:text-white hover:bg-steel-700 transition-colors p-1.5 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">{t('locations.form.code')}</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
                      placeholder={t('locations.form.codePlaceholder')}
                      value={formData.location_code}
                      onChange={(e) => setFormData({ ...formData, location_code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">{t('locations.form.type')}</label>
                    <input
                      type="text"
                      className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
                      placeholder={t('locations.form.typePlaceholder')}
                      value={formData.location_type}
                      onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">{t('locations.form.name')}</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
                    placeholder={t('locations.form.namePlaceholder')}
                    value={formData.location_name}
                    onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">{t('locations.form.description')}</label>
                  <textarea
                    rows={3}
                    className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100 resize-none"
                    placeholder={t('locations.form.descriptionPlaceholder')}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2.5 rounded-lg text-sm text-steel-400 hover:bg-steel-850 transition-colors font-medium cursor-pointer"
                  >
                    {t('locations.form.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-indigo-900/20 disabled:bg-indigo-900/60 disabled:text-indigo-200 cursor-pointer"
                  >
                    {createMutation.isPending || updateMutation.isPending 
                      ? t('locations.form.saving') 
                      : t('locations.form.save')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LocationsPage;
