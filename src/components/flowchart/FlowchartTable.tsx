// ─────────────────────────────────────────────────────────────
//  FlowchartTable — DnD-wrapped table container
//  Manages drag-drop context, sticky header, grouping,
//  sub-step collapsibility, and empty state.
// ─────────────────────────────────────────────────────────────

import { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  DragDropContext,
  Droppable,
  type DropResult,
  type DragStart,
} from '@hello-pangea/dnd';
import { Plus, GitBranch, AlertTriangle, ChevronsUpDown } from 'lucide-react';
import { useFlowchart } from '../../hooks/useFlowchart';
import { useFlowchartLookups } from '../../hooks/useFlowchartLookups';
import { groupStepsByMaster } from '../../context/flowchartGroups';
import type { FlowchartStep } from '../../types/flowchart.types';
import { FlowchartRow } from './FlowchartRow';

export function FlowchartTable() {
  const { t } = useTranslation();
  const { state, reorderSteps, addStep, addSubStep } = useFlowchart();
  const { isLoading } = useFlowchartLookups();
  const tableRef = useRef<HTMLTableElement>(null);
  const [tableWidth, setTableWidth] = useState<number>(1200);
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);
  const [collapsedMasterIds, setCollapsedMasterIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const updateWidth = () => {
      if (tableRef.current) {
        setTableWidth(tableRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [state.steps.length]);

  const groups = useMemo(() => groupStepsByMaster(state.steps), [state.steps]);

  const totalMasters = groups.length;
  const totalSubSteps = useMemo(
    () => groups.reduce((acc, g) => acc + g.subSteps.length, 0),
    [groups]
  );

  const hasCollapsibleGroups = useMemo(
    () => groups.some((g) => g.subSteps.length > 0),
    [groups]
  );

  const allCollapsed = useMemo(() => {
    if (!hasCollapsibleGroups) return false;
    return groups.every((g) => g.subSteps.length === 0 || collapsedMasterIds.has(g.master.id));
  }, [hasCollapsibleGroups, groups, collapsedMasterIds]);

  const collapsedCount = useMemo(() => {
    return groups.filter((g) => g.subSteps.length > 0 && collapsedMasterIds.has(g.master.id)).length;
  }, [groups, collapsedMasterIds]);

  const visibleSteps = useMemo(() => {
    const result: FlowchartStep[] = [];
    for (const group of groups) {
      result.push(group.master);
      if (!collapsedMasterIds.has(group.master.id)) {
        for (const sub of group.subSteps) {
          result.push(sub);
        }
      }
    }
    return result;
  }, [groups, collapsedMasterIds]);

  const handleToggleCollapse = useCallback((masterId: string) => {
    setCollapsedMasterIds((prev) => {
      const next = new Set(prev);
      if (next.has(masterId)) {
        next.delete(masterId);
      } else {
        next.add(masterId);
      }
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    if (allCollapsed) {
      setCollapsedMasterIds(new Set());
    } else {
      const allWithSubs = groups
        .filter((g) => g.subSteps.length > 0)
        .map((g) => g.master.id);
      setCollapsedMasterIds(new Set(allWithSubs));
    }
  }, [allCollapsed, groups]);

  const handleAddSubStep = useCallback(
    (masterId: string) => {
      setCollapsedMasterIds((prev) => {
        if (!prev.has(masterId)) return prev;
        const next = new Set(prev);
        next.delete(masterId);
        return next;
      });
      addSubStep(masterId);
    },
    [addSubStep]
  );

  const handleDragStart = useCallback(
    (start: DragStart) => {
      setActiveDraggingId(start.draggableId);
      const draggedStep = state.steps.find((s) => s.id === start.draggableId);
      if (draggedStep && (!draggedStep.subStep || draggedStep.subStep === 0)) {
        const hasSubSteps = state.steps.some(
          (s) => s.sequence === draggedStep.sequence && s.subStep > 0
        );
        if (hasSubSteps) {
          setCollapsedMasterIds((prev) => {
            if (prev.has(draggedStep.id)) return prev;
            const next = new Set(prev);
            next.add(draggedStep.id);
            return next;
          });
        }
      }
    },
    [state.steps]
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      setActiveDraggingId(null);
      if (!result.destination) return;
      if (result.source.index === result.destination.index) return;

      const sourceStep = visibleSteps[result.source.index];
      const destStep = visibleSteps[result.destination.index];
      if (!sourceStep || !destStep) return;

      const actualSourceIndex = state.steps.findIndex((s) => s.id === sourceStep.id);
      const actualDestIndex = state.steps.findIndex((s) => s.id === destStep.id);
      if (actualSourceIndex === -1 || actualDestIndex === -1) return;

      reorderSteps(actualSourceIndex, actualDestIndex);
    },
    [visibleSteps, state.steps, reorderSteps]
  );

  const unfulfilledMasters = useMemo(() => {
    return state.steps.filter((master) => {
      const isMaster = !master.subStep || master.subStep === 0;
      if (!isMaster) return false;
      const hasSubSteps = state.steps.some(
        (s) => s.sequence === master.sequence && s.subStep > 0
      );
      if (!hasSubSteps) return false;
      const isFlaggedAt =
        master.criticalFlag === '@' ||
        master.criticalFlag === 'CC' ||
        master.criticalFlag === 'SC';
      if (!isFlaggedAt) return false;
      const hasSubCritical = state.steps.some(
        (s) =>
          s.sequence === master.sequence &&
          s.subStep > 0 &&
          (s.criticalFlag === 'CC' || s.criticalFlag === 'SC')
      );
      return !hasSubCritical;
    });
  }, [state.steps]);

  return (
    <div className="bg-white dark:bg-steel-950/90 border border-slate-200 dark:border-steel-800 rounded-xl shadow-lg overflow-hidden backdrop-blur-md relative">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-steel-950/60 backdrop-blur-[2px]"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 dark:border-steel-700 border-t-blue-600" />
              <span className="text-xs font-semibold text-slate-700 dark:text-steel-200">{t('common.loadingData', 'Cargando datos...')}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-steel-900/90 border-b border-slate-200 dark:border-steel-800/80 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <GitBranch size={16} className="text-blue-600 dark:text-sky-400" />
          <span className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
            {t('app.subtitle', 'Process Workspace')}
          </span>
          <span className="rounded-md bg-slate-200/80 dark:bg-steel-800/80 px-2.5 py-0.5 text-[11px] font-mono font-bold text-slate-700 dark:text-steel-300 border border-slate-300 dark:border-steel-700/60">
            {t('table.stepCount', { count: state.steps.length })}
          </span>

          {totalSubSteps > 0 && (
            <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
              {totalMasters} {totalMasters === 1 ? 'maestra' : 'maestras'} · {totalSubSteps} {totalSubSteps === 1 ? 'secundaria' : 'secundarias'}
            </span>
          )}

          {hasCollapsibleGroups && (
            <button
              type="button"
              onClick={handleToggleAll}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-steel-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-steel-800/80 dark:hover:bg-steel-700 border border-slate-300/80 dark:border-steel-700/60 transition-colors cursor-pointer shadow-2xs"
              title={
                allCollapsed
                  ? t('table.expandAll', 'Expandir todos los sub-grupos')
                  : t('table.collapseAll', 'Colapsar todos los sub-grupos')
              }
            >
              <ChevronsUpDown size={13} className="text-indigo-500 dark:text-indigo-400" />
              <span>
                {allCollapsed
                  ? t('table.expandAll', 'Expandir sub-grupos')
                  : t('table.collapseAll', 'Colapsar sub-grupos')}
              </span>
              {collapsedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-200/80 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-200">
                  {collapsedCount}
                </span>
              )}
            </button>
          )}
        </div>

        <motion.button
          type="button"
          onClick={addStep}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus size={14} />
          <span>{t('table.addStep', '+ Add Step')}</span>
        </motion.button>
      </div>

      {/* Critical Characteristic Requirement Warning Banner */}
      <AnimatePresence>
        {unfulfilledMasters.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-50 dark:bg-amber-950/70 border-b border-amber-300 dark:border-amber-700/80 px-4 py-2.5 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200 overflow-hidden"
          >
            <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="leading-tight">
              <span className="font-bold">
                {t('validation.criticalFlagRequirement', 'Requisito de Característica Crítica:')}{' '}
              </span>
              <span>
                {t(
                  'validation.criticalFlagNotice',
                  'La operación maestra {{ops}} tiene activa la bandera @. Debe indicar al menos una característica SC o CC en una de sus operaciones intermedias.',
                  {
                    ops: unfulfilledMasters.map((m) => `[Paso ${m.sequence}]`).join(', '),
                  }
                )}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto">
        {state.steps.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-4 py-20"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-steel-900 border border-slate-200 dark:border-steel-800 shadow-xs">
              <GitBranch size={28} className="text-slate-400 dark:text-steel-500" />
            </div>
            <p className="max-w-xs text-center text-sm text-slate-500 dark:text-steel-300 font-medium">
              {t('table.emptyState', 'No hay pasos definidos en el proceso.')}
            </p>
            <motion.button
              type="button"
              onClick={addStep}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <Plus size={16} />
              {t('table.addStep', '+ Add Step')}
            </motion.button>
          </motion.div>
        ) : (
          <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <table ref={tableRef} className="w-full border-collapse">
              {/* Sticky Header */}
              <thead>
                <tr className="border-b border-slate-200 dark:border-steel-800 bg-slate-100/90 dark:bg-steel-900/80 text-left">
                  <th className="sticky left-0 z-30 w-[44px] min-w-[44px] max-w-[44px] px-2 py-3 text-center bg-slate-200 dark:bg-steel-950 border-r border-slate-300/40 dark:border-steel-800" />
                  <th className="sticky left-[44px] z-30 w-[76px] min-w-[76px] max-w-[76px] px-2 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-700 dark:text-steel-200 bg-slate-200 dark:bg-steel-950 border-r border-slate-300/40 dark:border-steel-800">
                    {t('table.sequence', 'SEQ.')}
                  </th>
                  <th className="sticky left-[120px] z-30 w-[220px] min-w-[220px] max-w-[220px] px-2 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-700 dark:text-steel-200 bg-slate-200 dark:bg-steel-950 border-r border-slate-300 dark:border-steel-700 shadow-[4px_0_6px_-2px_rgba(0,0,0,0.08)]">
                    {t('table.operation', 'OPERATION / TECHNOLOGY')}
                  </th>
                  <th className="w-[200px] min-w-[200px] px-2 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-steel-300">
                    {t('table.machinery', 'MACHINERY')}
                  </th>
                  <th className="w-[150px] px-2 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-steel-300">
                    {t('table.location', 'LOCATION')}
                  </th>
                  <th className="w-[180px] px-2 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-steel-300">
                    {t('table.responsibleDepartment', 'RESPONSIBLE')}
                  </th>
                  <th className="w-24 px-2 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-steel-300">
                    {t('table.critical', 'CRITICAL CHAR.')}
                  </th>
                  <th className="w-28 px-2 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-steel-300">
                    {t('table.symbol', 'SYMBOL')}
                  </th>
                  <th className="min-w-[220px] px-2 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-steel-300">
                    {t('table.productCharacteristics', 'PRODUCT CHARACTERISTICS')}
                  </th>
                  <th className="min-w-[220px] px-2 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-steel-300">
                    {t('table.processCharacteristics', 'PROCESS CHARACTERISTICS')}
                  </th>
                  <th className="min-w-[200px] px-2 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-steel-300">
                    {t('table.target', 'TARGET')}
                  </th>
                  <th className="sticky right-0 z-30 w-28 px-2 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-700 dark:text-steel-200 bg-slate-200 dark:bg-steel-950 border-l border-slate-300 dark:border-steel-700 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)]">
                    {t('table.actions', 'ACTIONS')}
                  </th>
                </tr>
              </thead>

              <Droppable droppableId="flowchart-steps">
                {(provided) => (
                  <tbody ref={provided.innerRef} {...provided.droppableProps}>
                    {visibleSteps.map((step, idx) => (
                      <FlowchartRow
                        key={step.id}
                        step={step}
                        index={idx}
                        tableWidth={tableWidth}
                        activeDraggingStepId={activeDraggingId}
                        isCollapsed={collapsedMasterIds.has(step.id)}
                        onToggleCollapse={handleToggleCollapse}
                        onAddSubStep={handleAddSubStep}
                      />
                    ))}
                    {provided.placeholder}
                  </tbody>
                )}
              </Droppable>
            </table>
          </DragDropContext>
        )}
      </div>

      {/* Bottom Add Row */}
      {state.steps.length > 0 && (
        <div className="border-t border-slate-200 dark:border-steel-800/60 px-4 py-3 bg-slate-50/50 dark:bg-steel-900/40">
          <button
            type="button"
            onClick={addStep}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-steel-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-steel-800 transition-colors cursor-pointer"
          >
            <Plus size={14} />
            {t('table.addStep', '+ Add Step')}
          </button>
        </div>
      )}
    </div>
  );
}
