import axiosClient from '../../api/axiosClient';
import { revisions } from '../../api/sessionState';
import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Loader2,
  Save,
  GripVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useProductParameters } from '../../hooks/useProductParameters';
import type { ProductParameterCreatePayload } from '../../types/product.types';
import { getMeasurementUnits } from '../../services/measurementUnits';
import { toast } from 'sonner';
import { useRBAC } from '../../hooks/useRBAC';
import { MeasurementUnitSelect } from './MeasurementUnitSelect';
import { SPRING } from '../../utils/motion';

interface ProductParameterManagerProps {
  productId: number;
  readOnly?: boolean;
  technologies?: { id: number; name: string }[];
}

export const ProductParameterManager: React.FC<ProductParameterManagerProps> = ({
  productId,
  technologies = [],
  readOnly = false,
}) => {
  const { t } = useTranslation();
  const { canEditProduct: roleCanEdit } = useRBAC();
  const canEditProduct = roleCanEdit && !readOnly;
  const queryClient = useQueryClient();
  const [expectedVersion, setExpectedVersion] = useState(() =>
    revisions.get('products:' + productId),
  );
  const { data: existingParams, isLoading: isLoadingParams } = useProductParameters(productId);

  const { data: units = [], isLoading: isLoadingUnits } = useQuery({
    queryKey: ['measurementUnits'],
    queryFn: getMeasurementUnits,
  });

  const [params, rawSetParams] = useState<
    (ProductParameterCreatePayload & { id?: number; dragId: string; technology_id?: number | null })[]
  >([]);
  const [parametersDirty, setParametersDirty] = useState(false);
  const setParams: typeof rawSetParams = update => {
    setParametersDirty(true);
    rawSetParams(update);
  };
  const [deletedParamIds, setDeletedParamIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTechId, setActiveTechId] = useState<number | null>(null);
  const activeTechId = technologies.some(tech => tech.id === selectedTechId)
    ? selectedTechId
    : (technologies[0]?.id ?? null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [loadedParams, setLoadedParams] = useState<typeof existingParams>();
  if (existingParams !== loadedParams && !parametersDirty) {
    setLoadedParams(existingParams);
    if (existingParams) {
      const sortedParams = [...existingParams].sort(
        (a, b) => (a.order_index || 0) - (b.order_index || 0),
      );
      rawSetParams(
        sortedParams.map(p => ({
          id: p.id,
          dragId: `param-${p.id}`,
          name: p.name,
          measurement_unit_id: p.measurement_unit_id,
          technology_id: p.technology_id,
          target_value: p.target_value ?? null,
          min_value: p.min_value ?? null,
          max_value: p.max_value ?? null,
          is_critical: p.is_critical,
          order_index: p.order_index,
        })),
      );
    }
  }

  const addParam = () => {
    if (!canEditProduct || !activeTechId) return;

    // Calculate new order index for this technology
    const techParams = params.filter(p => p.technology_id === activeTechId);

    const newParam = {
      dragId: `new-${Date.now()}`,
      name: '',
      measurement_unit_id: null,
      technology_id: activeTechId,
      is_critical: false,
      target_value: null,
      min_value: null,
      max_value: null,
      order_index: techParams.length,
    };
    setParams(prev => [...prev, newParam]);
    // Auto navigate to last page
    const totalPages = Math.ceil((techParams.length + 1) / itemsPerPage);
    setCurrentPage(totalPages);
  };

  const removeParam = (dragId: string) => {
    if (!canEditProduct) return;
    const target = params.find(p => p.dragId === dragId);
    if (target && target.id) {
      setDeletedParamIds(prev => [...prev, target.id!]);
    }
    setParams(prev => prev.filter(p => p.dragId !== dragId));

    // Adjust pagination if needed
    const totalPages = Math.ceil((params.length - 1) / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  };

  const updateParam = (
    dragId: string,
    field: string,
    value: string | number | boolean | null,
  ) => {
    if (!canEditProduct) return;
    setParams(prev => prev.map(p => (p.dragId === dragId ? { ...p, [field]: value } : p)));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !canEditProduct || !activeTechId) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    // Calculate global indices based on pagination
    const globalSourceIndex = (currentPage - 1) * itemsPerPage + sourceIndex;
    const globalDestinationIndex = (currentPage - 1) * itemsPerPage + destinationIndex;

    const filteredParams = params.filter(p => p.technology_id === activeTechId);
    const otherParams = params.filter(p => p.technology_id !== activeTechId);

    const newFilteredParams = Array.from(filteredParams);
    const [reorderedItem] = newFilteredParams.splice(globalSourceIndex, 1);
    newFilteredParams.splice(globalDestinationIndex, 0, reorderedItem);

    // Update order_index
    const updatedFilteredParams = newFilteredParams.map((p, index) => ({
      ...p,
      order_index: index,
    }));

    setParams([...otherParams, ...updatedFilteredParams]);
  };

  const handleSave = async () => {
    if (!canEditProduct) return;
    setIsSaving(true);
    try {
      const { data: saved } = await axiosClient.put(`/products/${productId}/parameters/bulk`, {
        expected_version: expectedVersion,
        rows: params.map(row => ({
          id: row.id,
          name: row.name,
          measurement_unit_id: row.measurement_unit_id,
          technology_id: row.technology_id,
          target_value: row.target_value,
          min_value: row.min_value,
          max_value: row.max_value,
          is_critical: row.is_critical,
          order_index: row.order_index,
        })),
        deleted_row_ids: deletedParamIds,
      });
      setExpectedVersion(saved.lock_version);
      await queryClient.invalidateQueries({ queryKey: ['products', productId, 'parameters'] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      setParametersDirty(false);
      setDeletedParamIds([]);
      toast.success(t('products.parameters.saveSuccess', 'Parámetros guardados exitosamente'));
    } catch (err) {
      console.error('Error saving parameters:', err);
      toast.error(t('products.parameters.saveError', 'Error al guardar los parámetros'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingParams || isLoadingUnits) {
    return (
      <div className="flex items-center justify-center p-10 text-[var(--ui-muted)]">
        <Loader2 className="animate-spin text-[var(--ui-accent)]" size={22} />
      </div>
    );
  }

  // Filter params by active technology tab
  const activeParams = params.filter(p => p.technology_id === activeTechId);

  // Pagination logic
  const totalPages = Math.ceil(activeParams.length / itemsPerPage);
  const paginatedParams = activeParams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const hasTechnologies = technologies && technologies.length > 0;

  return (
    <div className="param-manager">
      <div className="param-header">
        <h3 className="param-title">
          {t('products.parameters.title', 'Gestión de Parámetros de Control')}
        </h3>
        {canEditProduct && (
          <div className="param-actions">
            <button
              type="button"
              onClick={addParam}
              disabled={!hasTechnologies}
              title={
                !hasTechnologies
                  ? t(
                      'products.parameters.requiresTechnology',
                      'Debe definir al menos una tecnología para agregar parámetros.',
                    )
                  : ''
              }
              className="ui-button"
            >
              <Plus size={16} />
              <span>{t('products.parameters.add', 'Añadir Parámetro')}</span>
            </button>
            <div className="workspace-primary">
              <button type="button" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{t('products.parameters.save', 'Guardar Cambios')}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {hasTechnologies && (
        <div className="param-tech-tabs" role="tablist">
          {technologies.map(tech => {
            const isActive = activeTechId === tech.id;
            return (
              <button
                key={tech.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                data-active={isActive || undefined}
                onClick={() => {
                  setActiveTechId(tech.id);
                  setCurrentPage(1);
                }}
                className="detail-tab"
              >
                <span>{tech.name}</span>
                {isActive && (
                  <motion.span
                    layoutId="param-tech-tab-indicator"
                    className="detail-tab-indicator"
                    transition={SPRING.snappy}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {activeParams.length === 0 ? (
        <div className="param-empty">
          <p>
            {t(
              'products.parameters.empty',
              'No hay parámetros definidos para este producto.',
            )}
          </p>
          {canEditProduct && (
            <button
              type="button"
              onClick={addParam}
              disabled={!hasTechnologies}
              title={
                !hasTechnologies
                  ? t(
                      'products.parameters.requiresTechnology',
                      'Debe definir al menos una tecnología para agregar parámetros.',
                    )
                  : ''
              }
              className="ui-button"
              data-active="true"
            >
              <Plus size={15} />
              <span>{t('products.parameters.startAdding', 'Comenzar a añadir parámetros')}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="param-table">
          <div className="param-table-head">
            <div className="col-span-1 text-center w-8" />
            <div className="col-span-4">{t('products.parameters.table.name', 'Nombre')}</div>
            <div className="col-span-3">{t('products.parameters.table.unit', 'Unidad')}</div>
            <div className="col-span-1">{t('products.parameters.table.min', 'Mínimo')}</div>
            <div className="col-span-1">{t('products.parameters.table.target', 'Objetivo')}</div>
            <div className="col-span-1">{t('products.parameters.table.max', 'Máximo')}</div>
            <div className="col-span-1 text-center" />
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="parameters-list">
              {provided => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="min-h-[100px]"
                >
                  {paginatedParams.map((p, index) => (
                    <Draggable
                      key={p.dragId}
                      draggableId={p.dragId}
                      index={index}
                      isDragDisabled={!canEditProduct}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          data-dragging={snapshot.isDragging || undefined}
                          className="param-row"
                        >
                          <div
                            className="col-span-1 param-drag-handle"
                            {...provided.dragHandleProps}
                          >
                            <GripVertical size={16} />
                          </div>

                          <div className="col-span-4">
                            <input
                              className="ui-input param-input-compact"
                              placeholder={t(
                                'products.parameters.table.namePlaceholder',
                                'Ej. Temperatura',
                              )}
                              value={p.name}
                              onChange={e => updateParam(p.dragId, 'name', e.target.value)}
                              disabled={!canEditProduct}
                            />
                            <label
                              className="param-critical-toggle"
                              data-critical={p.is_critical || undefined}
                            >
                              <input
                                type="checkbox"
                                checked={p.is_critical || false}
                                onChange={e =>
                                  updateParam(p.dragId, 'is_critical', e.target.checked)
                                }
                                disabled={!canEditProduct}
                              />
                              <span>{t('products.parameters.table.critical', 'Crítico')}</span>
                            </label>
                          </div>

                          <div className="col-span-3">
                            <MeasurementUnitSelect
                              units={units}
                              value={p.measurement_unit_id ?? null}
                              onChange={id =>
                                updateParam(p.dragId, 'measurement_unit_id', id)
                              }
                              disabled={!canEditProduct}
                            />
                          </div>

                          <div className="col-span-1">
                            <input
                              type="number"
                              step="any"
                              className="ui-input ui-input-mono param-input-compact"
                              placeholder={t(
                                'products.parameters.table.minPlaceholder',
                                'Mín',
                              )}
                              value={p.min_value ?? ''}
                              onChange={e =>
                                updateParam(
                                  p.dragId,
                                  'min_value',
                                  e.target.value === '' ? null : e.target.value,
                                )
                              }
                              disabled={!canEditProduct}
                            />
                          </div>

                          <div className="col-span-1">
                            <input
                              type="number"
                              step="any"
                              className="ui-input ui-input-mono param-input-compact"
                              placeholder={t(
                                'products.parameters.table.targetPlaceholder',
                                'Obj',
                              )}
                              value={p.target_value ?? ''}
                              onChange={e =>
                                updateParam(
                                  p.dragId,
                                  'target_value',
                                  e.target.value === '' ? null : e.target.value,
                                )
                              }
                              disabled={!canEditProduct}
                            />
                          </div>

                          <div className="col-span-1">
                            <input
                              type="number"
                              step="any"
                              className="ui-input ui-input-mono param-input-compact"
                              placeholder={t(
                                'products.parameters.table.maxPlaceholder',
                                'Máx',
                              )}
                              value={p.max_value ?? ''}
                              onChange={e =>
                                updateParam(
                                  p.dragId,
                                  'max_value',
                                  e.target.value === '' ? null : e.target.value,
                                )
                              }
                              disabled={!canEditProduct}
                            />
                          </div>

                          <div className="col-span-1 flex justify-center pt-0.5">
                            {canEditProduct && (
                              <button
                                type="button"
                                onClick={() => removeParam(p.dragId)}
                                className="ui-icon-button param-delete-btn"
                                title={t('common.delete', 'Eliminar')}
                                aria-label={t('common.delete', 'Eliminar')}
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
            <div className="param-pagination">
              <span>
                {t('common.showing', 'Mostrando')} {(currentPage - 1) * itemsPerPage + 1} -{' '}
                {Math.min(currentPage * itemsPerPage, activeParams.length)}{' '}
                {t('common.of', 'de')} {activeParams.length}
              </span>
              <div className="param-pagination-controls">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="ui-icon-button"
                  aria-label={t('workspace:previous', 'Anterior')}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="document-card-id">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="ui-icon-button"
                  aria-label={t('workspace:next', 'Siguiente')}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
