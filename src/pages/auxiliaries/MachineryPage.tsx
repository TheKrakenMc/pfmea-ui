import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Settings, Filter, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import { MachineryTable } from '../../components/machinery/MachineryTable';
import { MachineryCard } from '../../components/machinery/MachineryCard';
import { MachineryForm } from '../../components/machinery/MachineryForm';
import { DataLayout } from '../../components/layout/DataLayout';
import { Pagination } from '../../components/ui/Pagination';
import { listMachinery, createMachinery, updateMachinery, deleteMachinery } from '../../services/machineryService';
import { listPlants } from '../../services/plantService';
import { listLocations } from '../../services/locationService';
import type { Machinery } from '../../types/machinery.types';

const MachineryPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMachinery, setEditingMachinery] = useState<Machinery | null>(null);
  
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [selectedPlant, setSelectedPlant] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'nameAsc' | 'nameDesc'>('recent');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Reset pagination on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedPlant, selectedLocation, sortBy]);

  const { data: machinery = [], isLoading } = useQuery({
    queryKey: ['machinery'],
    queryFn: () => listMachinery(),
  });

  const { data: plants = [] } = useQuery({
    queryKey: ['plants'],
    queryFn: () => listPlants(),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => listLocations(),
  });

  const createMutation = useMutation({
    mutationFn: createMachinery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machinery'] });
      toast.success('Maquinaria creada exitosamente');
      handleCloseForm();
    },
    onError: (error) => {
      toast.error('Error al crear maquinaria');
      console.error(error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => updateMachinery(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machinery'] });
      toast.success('Maquinaria actualizada exitosamente');
      handleCloseForm();
    },
    onError: (error) => {
      toast.error('Error al actualizar maquinaria');
      console.error(error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMachinery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machinery'] });
      toast.success('Maquinaria eliminada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar maquinaria');
      console.error(error);
    }
  });

  const handleOpenForm = (item?: Machinery) => {
    if (item) {
      setEditingMachinery(item);
    } else {
      setEditingMachinery(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMachinery(null);
  };

  const handleSubmit = (data: any) => {
    if (editingMachinery) {
      updateMutation.mutate({ id: editingMachinery.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (item: Machinery) => {
    if (window.confirm(`¿Estás seguro que deseas eliminar ${item.machinery_name}? Si está en uso, considera solo desactivarla.`)) {
      deleteMutation.mutate(item.id);
    }
  };

  const filtered = machinery.filter((item) => {
    const term = search.toLowerCase();
    const matchesSearch = item.machinery_name.toLowerCase().includes(term) || item.machinery_code.toLowerCase().includes(term);
    const matchesPlant = selectedPlant ? item.plant_id.toString() === selectedPlant : true;
    const matchesLocation = selectedLocation ? item.location_id?.toString() === selectedLocation : true;
    
    return matchesSearch && matchesPlant && matchesLocation;
  }).sort((a, b) => {
    if (sortBy === 'nameAsc') {
      return a.machinery_name.localeCompare(b.machinery_name);
    } else if (sortBy === 'nameDesc') {
      return b.machinery_name.localeCompare(a.machinery_name);
    }
    // recent
    const dateA = new Date(a.created_at || '').getTime();
    const dateB = new Date(b.created_at || '').getTime();
    return dateB - dateA;
  });

  const paginated = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const extraFilters = (
    <div className="flex flex-wrap items-center gap-3 w-full">
      <div className="relative flex-1 min-w-[140px]">
        <select
          value={selectedPlant}
          onChange={(e) => {
            setSelectedPlant(e.target.value);
            setSelectedLocation(''); // Reset location when plant changes
          }}
          className="w-full appearance-none bg-steel-950 border border-steel-700 rounded-lg pl-3 pr-8 py-2 text-sm text-steel-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
        >
          <option value="">{t('common.allPlants', 'Todas las plantas')}</option>
          {plants.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-500 pointer-events-none" />
      </div>

      <div className="relative flex-1 min-w-[140px]">
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full appearance-none bg-steel-950 border border-steel-700 rounded-lg pl-3 pr-8 py-2 text-sm text-steel-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
        >
          <option value="">{t('common.allLocations', 'Todas las ubicaciones')}</option>
          {locations
            .filter(l => selectedPlant ? l.plant_id.toString() === selectedPlant : true)
            .map(l => (
            <option key={l.id} value={l.id}>{l.location_name}</option>
          ))}
        </select>
        <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-500 pointer-events-none" />
      </div>

      <div className="relative flex-1 min-w-[140px]">
        <select
          value={sortBy}
          onChange={(e: any) => setSortBy(e.target.value)}
          className="w-full appearance-none bg-steel-950 border border-steel-700 rounded-lg pl-3 pr-8 py-2 text-sm text-steel-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
        >
          <option value="recent">{t('sort.newest', 'Más recientes')}</option>
          <option value="nameAsc">{t('sort.aToZ', 'Nombre (A-Z)')}</option>
          <option value="nameDesc">{t('sort.zToA', 'Nombre (Z-A)')}</option>
        </select>
        <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-500 pointer-events-none" />
      </div>
    </div>
  );

  const actionButton = (
    <button
      onClick={() => handleOpenForm()}
      className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all font-medium text-sm shadow-lg shadow-indigo-900/20 cursor-pointer"
    >
      <Plus size={16} /> {t('machinery.actions.create', 'Nueva Maquinaria')}
    </button>
  );

  return (
    <>
      <DataLayout
        title={t('navbar.auxiliaries.machinery', 'Maquinaria y Herramentales')}
        subtitle={t('machinery.subtitle', 'Gestión de la maquinaria utilizada en las operaciones (vinculado al Diagrama de Flujo).')}
        isLoading={isLoading}
        actionButton={actionButton}
        searchValue={search}
        onSearchChange={setSearch}
        extraFilters={extraFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isEmpty={filtered.length === 0}
        gridContent={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map(item => (
              <MachineryCard
                key={item.id}
                item={item}
                plants={plants}
                locations={locations}
                onEdit={handleOpenForm}
                onDelete={handleDelete}
              />
            ))}
          </div>
        }
        tableContent={
          <MachineryTable
            machinery={paginated}
            plants={plants}
            locations={locations}
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-steel-900 border border-steel-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-steel-800/80 flex items-center justify-between bg-steel-950/50">
                <h2 className="text-lg font-semibold text-steel-100 flex items-center gap-2">
                  <Settings className="text-indigo-500" size={20} />
                  {editingMachinery ? t('machinery.modal.editTitle', 'Editar Maquinaria') : t('machinery.modal.createTitle', 'Registrar Maquinaria')}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-steel-400 hover:text-white hover:bg-steel-700 transition-colors p-1.5 rounded-lg cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <MachineryForm
                  initialData={editingMachinery}
                  onSubmit={handleSubmit}
                  onCancel={handleCloseForm}
                  isSubmitting={createMutation.isPending || updateMutation.isPending}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MachineryPage;
