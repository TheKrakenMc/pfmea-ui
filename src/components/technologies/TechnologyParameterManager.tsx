import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Save, GripVertical, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useQuery } from '@tanstack/react-query';
import {
  useTechnologyParameters,
  useCreateTechnologyParameter,
  useUpdateTechnologyParameter,
  useDeleteTechnologyParameter,
} from '../../hooks/useTechnology';
import type { TechnologyParameterCreatePayload } from '../../services/technologyService';
import { getMeasurementUnits } from '../../services/measurementUnits';
import { toast } from 'sonner';
import { useRBAC } from '../../hooks/useRBAC';
import { MeasurementUnitSelect } from '../products/MeasurementUnitSelect';
import { motion, AnimatePresence } from 'framer-motion';

interface TechnologyParameterManagerProps {
  techId: number;
  techName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TechnologyParameterManager: React.FC<TechnologyParameterManagerProps> = ({ techId, techName, isOpen, onClose }) => {
  const { t } = useTranslation();
  const { canEditTechnology } = useRBAC();
  const { data: existingParams, isLoading: isLoadingParams } = useTechnologyParameters(techId);
  
  const { data: units = [], isLoading: isLoadingUnits } = useQuery({
    queryKey: ['measurementUnits'],
    queryFn: getMeasurementUnits,
  });

  const [params, setParams] = useState<(TechnologyParameterCreatePayload & { id?: number; dragId: string })[]>([]);
  const [deletedParamIds, setDeletedParamIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const createParamMutation = useCreateTechnologyParameter(techId);
  const updateParamMutation = useUpdateTechnologyParameter(techId);
  const deleteParamMutation = useDeleteTechnologyParameter(techId);

  useEffect(() => {
    if (existingParams) {
      setParams(
        existingParams.map((p) => ({
          id: p.id,
          dragId: `param-${p.id}`,
          name: p.name,
          measurement_unit_id: p.measurement_unit_id,
          target_value: p.target_value ?? null,
          min_value: p.min_value ?? null,
          max_value: p.max_value ?? null,
          is_critical: p.is_critical,
        }))
      );
    }
  }, [existingParams]);

  const addParam = () => {
    if (!canEditTechnology) return;
    
    const newParam = { 
      dragId: `new-${Date.now()}`,
      name: '', 
      measurement_unit_id: null, 
      is_critical: false, 
      target_value: null, 
      min_value: null, 
      max_value: null,
    };
    setParams((prev) => [...prev, newParam]);
    
    // Auto navigate to last page
    const totalPages = Math.ceil((params.length + 1) / itemsPerPage);
    setCurrentPage(totalPages);
  };
  
  const removeParam = (dragId: string) => {
    if (!canEditTechnology) return;
    const target = params.find(p => p.dragId === dragId);
    if (target && target.id) {
      setDeletedParamIds((prev) => [...prev, target.id!]);
    }
    setParams((prev) => prev.filter((p) => p.dragId !== dragId));
    
    // Adjust pagination if needed
    const totalPages = Math.ceil((params.length - 1) / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  };
  
  const updateParam = (dragId: string, field: string, value: any) => {
    if (!canEditTechnology) return;
    setParams((prev) => prev.map((p) => (p.dragId === dragId ? { ...p, [field]: value } : p)));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !canEditTechnology) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    // Calculate global indices based on pagination
    const globalSourceIndex = (currentPage - 1) * itemsPerPage + sourceIndex;
    const globalDestinationIndex = (currentPage - 1) * itemsPerPage + destinationIndex;

    const newParams = Array.from(params);
    const [reorderedItem] = newParams.splice(globalSourceIndex, 1);
    newParams.splice(globalDestinationIndex, 0, reorderedItem);

    setParams(newParams);
  };

  const handleSave = async () => {
    if (!canEditTechnology) return;
    setIsSaving(true);
    try {
      const deletePromises = deletedParamIds.map((id) =>
        deleteParamMutation.mutateAsync(id)
      );

      const upsertPromises = params.map((p) => {
        const payload = {
          name: p.name,
          measurement_unit_id: p.measurement_unit_id || null,
          target_value: p.target_value !== undefined && p.target_value !== '' && p.target_value !== null ? Number(p.target_value) : null,
          min_value: p.min_value !== undefined && p.min_value !== '' && p.min_value !== null ? Number(p.min_value) : null,
          max_value: p.max_value !== undefined && p.max_value !== '' && p.max_value !== null ? Number(p.max_value) : null,
          is_critical: !!p.is_critical,
        };

        if (p.id) {
          return updateParamMutation.mutateAsync({
            paramId: p.id,
            ...payload,
          });
        } else {
          return createParamMutation.mutateAsync(payload);
        }
      });

      await Promise.all([...deletePromises, ...upsertPromises]);
      setDeletedParamIds([]);
      toast.success(t('technologies.parameters.saveSuccess', 'Parámetros guardados exitosamente'));
      onClose();
    } catch (err) {
      console.error('Error saving parameters:', err);
      toast.error(t('technologies.parameters.saveError', 'Error al guardar los parámetros'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // Pagination logic
  const totalPages = Math.ceil(params.length / itemsPerPage);
  const paginatedParams = params.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-steel-950/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-steel-900 border border-steel-800 rounded-2xl w-full max-w-5xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-steel-800/80 flex items-center justify-between bg-steel-950/50">
                <div className="flex items-center gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-steel-100">
                      {t('technologies.parameters.manage', 'Gestión de Parámetros Maestros')} {techName ? ` - ${techName}` : ''}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-steel-400 hover:bg-steel-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {isLoadingParams || isLoadingUnits ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-500" /></div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-end">
                      {canEditTechnology && (
                        <div className="flex gap-3">
                          <button
                            onClick={addParam}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-steel-400 hover:text-steel-200 transition-colors text-sm font-medium focus-ring rounded-lg border border-transparent hover:bg-steel-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          >
                            <Plus size={16} /> {t('products.parameters.add', 'Añadir Parámetro')}
                          </button>
                        </div>
                      )}
                    </div>

                    {params.length === 0 ? (
                      <div className="p-8 border border-dashed border-steel-800 rounded-xl text-center bg-steel-950/30">
                        <p className="text-steel-500 text-sm">{t('technologies.parameters.empty', 'No hay parámetros definidos para esta tecnología.')}</p>
                        {canEditTechnology && (
                          <button 
                            onClick={addParam} 
                            className="mt-2 text-indigo-400 text-sm hover:text-indigo-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-indigo-400"
                          >
                            {t('products.parameters.startAdding', 'Comenzar a añadir parámetros')}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="bg-steel-950 border border-steel-800 rounded-xl overflow-hidden flex flex-col">
                        <div className="grid grid-cols-12 gap-3 p-3 border-b border-steel-800 bg-steel-900/50 text-xs font-semibold text-steel-400 uppercase tracking-wider items-center">
                          <div className="col-span-1 text-center w-8"></div>
                          <div className="col-span-4">{t('products.parameters.table.name', 'Nombre')}</div>
                          <div className="col-span-3">{t('products.parameters.table.unit', 'Unidad')}</div>
                          <div className="col-span-1">{t('products.parameters.table.min', 'Mínimo')}</div>
                          <div className="col-span-1">{t('products.parameters.table.target', 'Objetivo')}</div>
                          <div className="col-span-1">{t('products.parameters.table.max', 'Máximo')}</div>
                          <div className="col-span-1 text-center"></div>
                        </div>
                        
                        <DragDropContext onDragEnd={handleDragEnd}>
                          <Droppable droppableId="parameters-list">
                            {(provided) => (
                              <div 
                                {...provided.droppableProps} 
                                ref={provided.innerRef}
                                className="divide-y divide-steel-800 min-h-[100px]"
                              >
                                {paginatedParams.map((p, index) => (
                                  <Draggable 
                                    key={p.dragId} 
                                    draggableId={p.dragId} 
                                    index={index} 
                                    isDragDisabled={!canEditTechnology}
                                  >
                                    {(provided, snapshot) => (
                                      <div 
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`grid grid-cols-12 gap-3 p-3 items-start group transition-colors ${
                                          snapshot.isDragging ? 'bg-steel-800/80 shadow-lg ring-1 ring-indigo-500/50 z-10' : 'hover:bg-steel-900/30'
                                        }`}
                                      >
                                        <div 
                                          className="col-span-1 flex justify-center pt-2 text-steel-600 hover:text-steel-400 cursor-grab active:cursor-grabbing w-8"
                                          {...provided.dragHandleProps}
                                        >
                                          <GripVertical size={16} />
                                        </div>
                                        
                                        <div className="col-span-4">
                                          <input
                                            className="w-full bg-steel-900 border border-steel-700 rounded-lg px-2.5 py-1.5 text-sm text-steel-100 placeholder-steel-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                                            placeholder={t('products.parameters.table.namePlaceholder', 'Ej. Temperatura')}
                                            value={p.name}
                                            onChange={(e) => updateParam(p.dragId, 'name', e.target.value)}
                                            disabled={!canEditTechnology}
                                          />
                                          <label className="flex items-center gap-1.5 mt-2 text-xs text-steel-400 cursor-pointer w-fit">
                                            <input
                                              type="checkbox"
                                              checked={p.is_critical || false}
                                              onChange={(e) => updateParam(p.dragId, 'is_critical', e.target.checked)}
                                              disabled={!canEditTechnology}
                                              className="rounded border-steel-700 text-amber-500 focus:ring-amber-500/20 bg-steel-900"
                                            />
                                            <span className="font-medium text-amber-500/80">{t('products.parameters.table.critical', 'Crítico')}</span>
                                          </label>
                                        </div>
                                        
                                        <div className="col-span-3">
                                          <MeasurementUnitSelect
                                            units={units}
                                            value={p.measurement_unit_id}
                                            onChange={(id) => updateParam(p.dragId, 'measurement_unit_id', id)}
                                            disabled={!canEditTechnology}
                                          />
                                        </div>
                                        
                                        <div className="col-span-1">
                                          <input
                                            type="number"
                                            step="any"
                                            className="w-full bg-steel-900 border border-steel-700 rounded-lg px-2.5 py-1.5 text-sm text-steel-100 placeholder-steel-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors font-mono"
                                            placeholder={t('products.parameters.table.minPlaceholder', 'Mín')}
                                            value={p.min_value ?? ''}
                                            onChange={(e) => updateParam(p.dragId, 'min_value', e.target.value === '' ? null : e.target.value)}
                                            disabled={!canEditTechnology}
                                          />
                                        </div>
                                        
                                        <div className="col-span-1">
                                          <input
                                            type="number"
                                            step="any"
                                            className="w-full bg-steel-900 border border-steel-700 rounded-lg px-2.5 py-1.5 text-sm text-steel-100 placeholder-steel-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors font-mono"
                                            placeholder={t('products.parameters.table.targetPlaceholder', 'Obj')}
                                            value={p.target_value ?? ''}
                                            onChange={(e) => updateParam(p.dragId, 'target_value', e.target.value === '' ? null : e.target.value)}
                                            disabled={!canEditTechnology}
                                          />
                                        </div>
                                        
                                        <div className="col-span-1">
                                          <input
                                            type="number"
                                            step="any"
                                            className="w-full bg-steel-900 border border-steel-700 rounded-lg px-2.5 py-1.5 text-sm text-steel-100 placeholder-steel-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors font-mono"
                                            placeholder={t('products.parameters.table.maxPlaceholder', 'Máx')}
                                            value={p.max_value ?? ''}
                                            onChange={(e) => updateParam(p.dragId, 'max_value', e.target.value === '' ? null : e.target.value)}
                                            disabled={!canEditTechnology}
                                          />
                                        </div>
                                        
                                        <div className="col-span-1 flex justify-center pt-1.5">
                                          {canEditTechnology && (
                                            <button
                                              onClick={() => removeParam(p.dragId)}
                                              className="p-1.5 text-steel-500 hover:text-alert-400 hover:bg-alert-500/10 rounded-lg transition-colors focus-ring opacity-0 group-hover:opacity-100 focus:opacity-100"
                                              title={t('common.delete', 'Eliminar')}
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                        
                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between p-3 border-t border-steel-800 bg-steel-900/30">
                            <span className="text-xs text-steel-400 font-medium">
                              {t('common.showing', 'Mostrando')} {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, params.length)} {t('common.of', 'de')} {params.length}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1 text-steel-400 hover:text-steel-200 hover:bg-steel-800 rounded transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                              >
                                <ChevronLeft size={16} />
                              </button>
                              <span className="text-xs font-medium text-steel-300 px-2 py-1 bg-steel-800 rounded">
                                {currentPage} / {totalPages}
                              </span>
                              <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1 text-steel-400 hover:text-steel-200 hover:bg-steel-800 rounded transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-steel-800/80 bg-steel-950/50">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg text-sm text-steel-500 hover:text-steel-700 dark:text-steel-400 dark:hover:text-steel-200 hover:bg-steel-100 dark:hover:bg-steel-850 transition-colors font-medium cursor-pointer"
                  disabled={isSaving}
                >
                  {t('common.cancel', 'Cancelar')}
                </button>
                {canEditTechnology && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-900/60 disabled:text-indigo-200 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-indigo-900/20 cursor-pointer"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {t('common.save', 'Guardar')}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
