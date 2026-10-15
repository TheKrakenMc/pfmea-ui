// ─────────────────────────────────────────────────────────────
//  FlowchartRow — Single draggable process step row
//  Contains inline-editable fields, operation select,
//  critical flag toggle, product/process characteristics, target,
//  sub-step creation and CRUD action buttons.
// ─────────────────────────────────────────────────────────────

import { useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Draggable } from '@hello-pangea/dnd';
import {
  GripVertical,
  Copy,
  Trash2,
  CornerDownRight,
} from 'lucide-react';
import { useFlowchart } from '../../hooks/useFlowchart';
import { OperationSelect } from './OperationSelect';
import { MachinerySelect } from './MachinerySelect';
import { MachineryLocationDisplay } from './MachineryLocationDisplay';
import { DepartmentSelect } from './DepartmentSelect';
import { CriticalFlag } from './CriticalFlag';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ProcessSymbol } from '../flowcharts/ProcessSymbols';
import type { FlowchartStep, PlantOperation, SymbolType } from '../../types/flowchart.types';

interface FlowchartRowProps {
  step: FlowchartStep;
  index: number;
  tableWidth?: number;
  activeDraggingStepId?: string | null;
}

// ─── Symbol Icon Map ─────────────────────────────────────────

const SYMBOL_ICONS: Record<SymbolType, React.ReactNode> = {
  operation: <ProcessSymbol symbolType="operation" size={16} className="text-forge-400" />,
  inspection: <ProcessSymbol symbolType="inspection" size={16} className="text-emerald-400" />,
  transport: <ProcessSymbol symbolType="transport" size={16} className="text-sky-400" />,
  storage: <ProcessSymbol symbolType="storage" size={16} className="text-amber-400" />,
  delay: <ProcessSymbol symbolType="delay" size={16} className="text-purple-400" />,
  auto_control: <ProcessSymbol symbolType="auto_control" size={16} className="text-teal-400" />,
  pokayoke: <ProcessSymbol symbolType="pokayoke" size={16} className="text-rose-400" />,
};

const SYMBOL_OPTIONS: SymbolType[] = [
  'operation',
  'inspection',
  'transport',
  'storage',
  'delay',
  'auto_control',
  'pokayoke',
];

export function FlowchartRow({
  step,
  index,
  tableWidth,
  activeDraggingStepId,
}: FlowchartRowProps) {
  const { t } = useTranslation();
  const { state, updateStep, duplicateStep, deleteStep, addSubStep } = useFlowchart();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isSubStep = (step.subStep || 0) > 0;

  const subStepsCount = useMemo(() => {
    if (isSubStep) return 0;
    return state.steps.filter((s) => s.sequence === step.sequence && s.subStep > 0).length;
  }, [state.steps, step.sequence, isSubStep]);

  const isAnotherDragging = Boolean(
    activeDraggingStepId && activeDraggingStepId !== step.id
  );
  const activeDraggingStep = useMemo(() => {
    if (!activeDraggingStepId) return null;
    return state.steps.find((s) => s.id === activeDraggingStepId) || null;
  }, [state.steps, activeDraggingStepId]);

  // If a sub-step is dragging, dim rows belonging to other master operations
  const isDimmed = Boolean(
    isAnotherDragging &&
      activeDraggingStep &&
      activeDraggingStep.subStep > 0 &&
      activeDraggingStep.sequence !== step.sequence
  );

  // If a master step is dragging, highlight its child sub-steps
  const isChildOfDraggingMaster = Boolean(
    isAnotherDragging &&
      activeDraggingStep &&
      (!activeDraggingStep.subStep || activeDraggingStep.subStep === 0) &&
      activeDraggingStep.sequence === step.sequence &&
      isSubStep
  );

  const isMasterWithSubSteps = !isSubStep && subStepsCount > 0;

  // Check if any child sub-step of this master has CC or SC
  const hasCriticalInSubSteps = useMemo(() => {
    return state.steps.some(
      (s) =>
        s.sequence === step.sequence &&
        s.subStep > 0 &&
        (s.criticalFlag === 'CC' || s.criticalFlag === 'SC')
    );
  }, [state.steps, step.sequence]);

  // Master is flagged with @ if explicitly marked or if any child sub-step has CC or SC
  const isMasterFlaggedAt =
    step.criticalFlag === '@' ||
    (isMasterWithSubSteps && hasCriticalInSubSteps) ||
    step.criticalFlag === 'CC' ||
    step.criticalFlag === 'SC';

  // Master is marked with @ but no sub-step has CC/SC yet -> must obligate user to indicate SC/CC
  const needsSubStepCritical = isMasterWithSubSteps && isMasterFlaggedAt && !hasCriticalInSubSteps;

  // Child sub-steps check if their parent master needs critical characteristic assigned
  const isParentMasterNeedingCritical = useMemo(() => {
    if (!isSubStep) return false;
    const parentMaster = state.steps.find(
      (s) => s.sequence === step.sequence && (!s.subStep || s.subStep === 0)
    );
    if (!parentMaster) return false;
    const parentHasSubCritical = state.steps.some(
      (s) =>
        s.sequence === step.sequence &&
        s.subStep > 0 &&
        (s.criticalFlag === 'CC' || s.criticalFlag === 'SC')
    );
    return (parentMaster.criticalFlag === '@' || parentHasSubCritical) && !parentHasSubCritical;
  }, [state.steps, step.sequence, isSubStep]);

  // Check if this sub-step is the last sub-step of its master group
  const isLastSubStep = useMemo(() => {
    if (!isSubStep) return false;
    const nextStep = state.steps[index + 1];
    return !nextStep || !nextStep.subStep || nextStep.subStep === 0;
  }, [state.steps, index, isSubStep]);

  const disabledOperationIds = useMemo(() => {
    return state.steps.filter((s) => s.id !== step.id).map((s) => s.operationId).filter(Boolean);
  }, [state.steps, step.id]);

  const handleOperationChange = useCallback(
    (op: PlantOperation) => {
      updateStep(step.id, 'operationId', op.id);
      updateStep(step.id, 'operationName', op.name);
    },
    [step.id, updateStep]
  );

  const handleMachineryChange = useCallback(
    (machineryId: number | null) => {
      updateStep(step.id, 'machineryId', machineryId);
    },
    [step.id, updateStep]
  );

  const handleSymbolChange = useCallback(
    (sym: SymbolType) => {
      updateStep(step.id, 'symbolType', sym);
    },
    [step.id, updateStep]
  );

  const handleConfirmDelete = () => {
    deleteStep(step.id);
    setShowDeleteModal(false);
  };

  return (
    <>
      <Draggable draggableId={step.id} index={index}>
        {(provided, snapshot) => {
          const child = (
            <tr
              ref={provided.innerRef}
              {...provided.draggableProps}
              className={`group border-b border-slate-200 dark:border-steel-800/60 transition-colors ${
                snapshot.isDragging
                  ? 'bg-blue-50 dark:bg-steel-800/95 shadow-2xl ring-2 ring-blue-500/50'
                  : isChildOfDraggingMaster
                  ? 'bg-blue-50/70 dark:bg-steel-800/60 border-l-4 border-l-blue-400'
                  : isSubStep
                  ? 'bg-slate-100/90 dark:bg-steel-950/80 hover:bg-slate-200/70 dark:hover:bg-steel-900 border-l-4 border-l-indigo-400 dark:border-l-indigo-500 shadow-2xs'
                  : 'bg-white dark:bg-steel-900/40 hover:bg-slate-50 dark:hover:bg-steel-800/60 border-l-4 border-l-transparent'
              } ${isDimmed ? 'opacity-35 pointer-events-none transition-opacity' : 'opacity-100'}`}
              style={{
                ...provided.draggableProps.style,
                display: 'table-row',
              }}
            >
              {/* Drag Handle */}
              <td
                className={`${
                  snapshot.isDragging ? 'relative' : 'sticky left-0 z-10'
                } w-[44px] min-w-[44px] max-w-[44px] px-2 py-3 text-center align-top transition-colors ${
                  snapshot.isDragging
                    ? 'bg-blue-50 dark:bg-steel-800'
                    : isChildOfDraggingMaster
                    ? 'bg-blue-50 dark:bg-steel-800'
                    : isSubStep
                    ? 'bg-slate-100 dark:bg-steel-950 group-hover:bg-slate-200/80 dark:group-hover:bg-steel-900'
                    : 'bg-white dark:bg-steel-900 group-hover:bg-slate-50 dark:group-hover:bg-steel-800'
                }`}
              >
                <div
                  {...provided.dragHandleProps}
                  className={`drag-handle inline-flex items-center justify-center rounded-lg p-1 text-slate-400 dark:text-steel-400 hover:bg-slate-100 dark:hover:bg-steel-700 hover:text-slate-800 dark:hover:text-steel-200 transition-colors ${
                    snapshot.isDragging ? 'cursor-grabbing text-blue-600 dark:text-blue-400' : 'cursor-grab'
                  } mt-1`}
                  title={t('table.dragHandle', 'Arrastrar para reordenar')}
                >
                  <GripVertical size={16} />
                </div>
              </td>

              {/* Sequence */}
              <td
                className={`${
                  snapshot.isDragging ? 'relative' : 'sticky left-[44px] z-10'
                } w-[76px] min-w-[76px] max-w-[76px] px-1 py-3 text-center align-top transition-colors ${
                  snapshot.isDragging
                    ? 'bg-blue-50 dark:bg-steel-800'
                    : isChildOfDraggingMaster
                    ? 'bg-blue-50 dark:bg-steel-800'
                    : isSubStep
                    ? 'bg-slate-100 dark:bg-steel-950 group-hover:bg-slate-200/80 dark:group-hover:bg-steel-900'
                    : 'bg-white dark:bg-steel-900 group-hover:bg-slate-50 dark:group-hover:bg-steel-800'
                }`}
              >
                {isSubStep ? (
                  <div className="flex items-center justify-center pl-0.5 mt-1">
                    {/* Tree connector branch */}
                    <div className="relative w-3.5 h-7 flex-shrink-0 flex items-center justify-center mr-1">
                      {/* Vertical line from top to center */}
                      <div className="absolute top-0 left-1.5 w-[2px] h-3.5 bg-indigo-400 dark:bg-indigo-500" />
                      {/* Vertical line from center to bottom if not last */}
                      {!isLastSubStep && (
                        <div className="absolute top-3.5 left-1.5 w-[2px] h-3.5 bg-indigo-400 dark:bg-indigo-500" />
                      )}
                      {/* Horizontal line to the badge */}
                      <div className="absolute top-3.5 left-1.5 w-2 h-[2px] bg-indigo-400 dark:bg-indigo-500" />
                    </div>

                    {/* Indented Sequence Badge */}
                    <span className="inline-flex h-7 px-2 items-center justify-center rounded-lg bg-indigo-100/90 dark:bg-indigo-950/90 text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 shadow-2xs">
                      {step.sequence}.{step.subStep}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="inline-flex h-7 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-steel-800/80 text-xs font-mono font-bold text-slate-700 dark:text-steel-300 border border-slate-200 dark:border-steel-700/60 shadow-2xs mt-1">
                      {step.sequence}
                    </span>
                    {snapshot.isDragging && !isSubStep && subStepsCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100/90 dark:bg-blue-900/60 rounded border border-blue-300 dark:border-blue-700/60 mt-1 shadow-xs whitespace-nowrap">
                        +{subStepsCount} sub-pasos
                      </span>
                    )}
                  </div>
                )}
              </td>

              {/* Operation */}
              <td
                className={`${
                  snapshot.isDragging ? 'relative' : 'sticky left-[120px] z-10'
                } w-[220px] min-w-[220px] max-w-[220px] px-2 py-3 align-top border-r border-slate-200 dark:border-steel-800 shadow-[4px_0_6px_-2px_rgba(0,0,0,0.06)] transition-colors ${
                  snapshot.isDragging
                    ? 'bg-blue-50 dark:bg-steel-800'
                    : isChildOfDraggingMaster
                    ? 'bg-blue-50 dark:bg-steel-800'
                    : isSubStep
                    ? 'bg-slate-100 dark:bg-steel-950 group-hover:bg-slate-200/80 dark:group-hover:bg-steel-900'
                    : 'bg-white dark:bg-steel-900 group-hover:bg-slate-50 dark:group-hover:bg-steel-800'
                }`}
              >
                {isSubStep ? (
                  <div className="h-9 flex items-center pl-2.5 pr-2 rounded-lg bg-white/90 dark:bg-steel-900/90 border border-indigo-200/90 dark:border-indigo-800/70 text-xs text-slate-700 dark:text-steel-200 font-medium mt-0.5 select-none shadow-2xs gap-1.5 truncate">
                    <span className="text-indigo-500 dark:text-indigo-400 font-mono text-[11px] font-bold shrink-0 select-none">
                      └──
                    </span>
                    <span className="italic truncate text-slate-700 dark:text-steel-200 font-medium">
                      {step.operationName || t('table.subStepLinked', 'Paso vinculado')}
                    </span>
                  </div>
                ) : (
                  <OperationSelect
                    value={step.operationId}
                    displayValue={step.operationName}
                    onChange={handleOperationChange}
                    disabledIds={disabledOperationIds}
                  />
                )}
              </td>

              {/* Machinery */}
              <td className="w-[180px] min-w-[180px] px-2 py-3 align-top">
                {isSubStep ? (
                  <div className="h-9 flex items-center justify-center px-2 rounded-lg text-slate-300 dark:text-steel-600 text-xs">
                    —
                  </div>
                ) : (
                  <MachinerySelect
                    value={step.machineryId}
                    onChange={handleMachineryChange}
                  />
                )}
              </td>

              {/* Location */}
              <td className="w-[140px] min-w-[140px] px-2 py-3 align-top">
                {isSubStep ? (
                  <div className="h-9 flex items-center justify-center px-2 rounded-lg text-slate-300 dark:text-steel-600 text-xs">
                    —
                  </div>
                ) : (
                  <MachineryLocationDisplay
                    machineryId={step.machineryId}
                  />
                )}
              </td>

              {/* Responsible Department */}
              <td className="w-[170px] min-w-[170px] px-2 py-3 align-top">
                {isSubStep ? (
                  <div className="h-9 flex items-center justify-center px-2 rounded-lg text-slate-300 dark:text-steel-600 text-xs">
                    —
                  </div>
                ) : (
                  <DepartmentSelect
                    value={step.responsibleDepartment || 'Producción'}
                    onChange={(dept) => updateStep(step.id, 'responsibleDepartment', dept)}
                  />
                )}
              </td>

              {/* Critical Flag */}
              <td className="w-24 px-2 py-3 text-center align-top">
                <div className="flex flex-col items-center mt-1">
                  <CriticalFlag
                    value={
                      isMasterWithSubSteps
                        ? isMasterFlaggedAt
                          ? '@'
                          : 'none'
                        : step.criticalFlag
                    }
                    onChange={(flag) => {
                      if (isMasterWithSubSteps) {
                        updateStep(step.id, 'criticalFlag', flag === '@' ? '@' : 'none');
                      } else {
                        updateStep(step.id, 'criticalFlag', flag);
                      }
                    }}
                    isMasterWithSubSteps={isMasterWithSubSteps}
                    needsSubStepCritical={needsSubStepCritical}
                    isSubStepPrompted={isParentMasterNeedingCritical}
                  />
                  {needsSubStepCritical && (
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 animate-pulse mt-1 leading-tight text-center max-w-[80px]">
                      Requiere SC/CC en sub-paso
                    </span>
                  )}
                </div>
              </td>

              {/* Symbol Type */}
              <td className="w-28 px-2 py-3 align-top">
                <div className="relative mt-0.5">
                  {isSubStep ? (
                    <div className="h-9 flex items-center justify-center text-slate-400 dark:text-steel-600 text-sm font-mono font-medium select-none">
                      —
                    </div>
                  ) : isMasterFlaggedAt ? (
                    /* Red @ replacing symbol in master operation */
                    <button
                      type="button"
                      onClick={() => {
                        const idx = SYMBOL_OPTIONS.indexOf(step.symbolType);
                        const next = SYMBOL_OPTIONS[(idx + 1) % SYMBOL_OPTIONS.length];
                        handleSymbolChange(next);
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-lg border-2 border-red-500/80 dark:border-red-500/70 bg-red-100/90 dark:bg-red-950/80 px-2.5 py-1.5 text-xs font-bold text-red-700 dark:text-red-300 hover:bg-red-200/90 dark:hover:bg-red-900/60 shadow-xs transition-colors cursor-pointer w-full"
                      title={t(
                        'symbols.criticalSymbolTooltip',
                        'Operación con Característica Crítica (@). Simbología representada por @ roja.'
                      )}
                    >
                      <span className="text-base font-black text-red-600 dark:text-red-400 leading-none">@</span>
                      <span className="text-[11px] font-black text-red-700 dark:text-red-300 uppercase tracking-wide truncate">
                        {t(`symbols.${step.symbolType}`)}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const idx = SYMBOL_OPTIONS.indexOf(step.symbolType);
                        const next = SYMBOL_OPTIONS[(idx + 1) % SYMBOL_OPTIONS.length];
                        handleSymbolChange(next);
                      }}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-steel-700/60 bg-slate-50 dark:bg-steel-800/60 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-steel-200 hover:border-slate-300 dark:hover:border-steel-600 transition-colors cursor-pointer shadow-2xs w-full"
                      title={t(`symbols.${step.symbolType}`)}
                    >
                      {SYMBOL_ICONS[step.symbolType]}
                      <span className="truncate">{t(`symbols.${step.symbolType}`)}</span>
                    </button>
                  )}
                </div>
              </td>

              {/* Product Characteristics */}
              <td className="min-w-[220px] px-2 py-2.5 align-top">
                <textarea
                  rows={3}
                  value={step.productCharacteristics || ''}
                  onChange={(e) => updateStep(step.id, 'productCharacteristics', e.target.value)}
                  placeholder={t('table.productCharPlaceholder', 'Product characteristics (e.g. dimensions, spec)...')}
                  className="w-full rounded-lg border border-slate-200 dark:border-steel-700/70 bg-white dark:bg-steel-800/60 px-2.5 py-1.5 text-xs text-slate-800 dark:text-steel-100 placeholder:text-slate-400 dark:placeholder:text-steel-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 resize-y min-h-[68px] transition-colors leading-relaxed shadow-2xs"
                />
              </td>

              {/* Process Characteristics */}
              <td className="min-w-[220px] px-2 py-2.5 align-top">
                <textarea
                  rows={3}
                  value={step.processCharacteristics || ''}
                  onChange={(e) => updateStep(step.id, 'processCharacteristics', e.target.value)}
                  placeholder={t('table.processCharPlaceholder', 'Process characteristics (e.g. temp, speed, pressure)...')}
                  className="w-full rounded-lg border border-slate-200 dark:border-steel-700/70 bg-white dark:bg-steel-800/60 px-2.5 py-1.5 text-xs text-slate-800 dark:text-steel-100 placeholder:text-slate-400 dark:placeholder:text-steel-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 resize-y min-h-[68px] transition-colors leading-relaxed shadow-2xs"
                />
              </td>

              {/* Target */}
              <td className="min-w-[200px] px-2 py-2.5 align-top">
                <textarea
                  rows={3}
                  value={step.target || ''}
                  onChange={(e) => updateStep(step.id, 'target', e.target.value)}
                  placeholder={t('table.targetPlaceholder', 'Target / Spec requirement...')}
                  className="w-full rounded-lg border border-slate-200 dark:border-steel-700/70 bg-white dark:bg-steel-800/60 px-2.5 py-1.5 text-xs text-slate-800 dark:text-steel-100 placeholder:text-slate-400 dark:placeholder:text-steel-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 resize-y min-h-[68px] transition-colors leading-relaxed shadow-2xs"
                />
              </td>

              {/* Actions */}
              <td
                className={`${
                  snapshot.isDragging ? 'relative' : 'sticky right-0 z-10'
                } w-28 px-2 py-3 align-top border-l border-slate-200 dark:border-steel-800 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] transition-colors ${
                  snapshot.isDragging
                    ? 'bg-blue-50 dark:bg-steel-800'
                    : isSubStep
                    ? 'bg-slate-50 dark:bg-steel-950 group-hover:bg-slate-100 dark:group-hover:bg-steel-900'
                    : 'bg-white dark:bg-steel-900 group-hover:bg-slate-50 dark:group-hover:bg-steel-800'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 opacity-100 mt-1">
                  {!isSubStep && (
                    <motion.button
                      type="button"
                      onClick={() => addSubStep(step.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="rounded-lg p-1.5 text-slate-500 dark:text-steel-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                      title={t('actions.addSubStep', 'Añadir sub-paso (ej. 10.1)')}
                    >
                      <CornerDownRight size={15} />
                    </motion.button>
                  )}
                  {!isSubStep && (
                    <motion.button
                      type="button"
                      onClick={() => duplicateStep(step.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="rounded-lg p-1.5 text-slate-400 dark:text-steel-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
                      title={t('actions.duplicate', 'Duplicar paso')}
                    >
                      <Copy size={15} />
                    </motion.button>
                  )}
                  <motion.button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="rounded-lg p-1.5 text-slate-400 dark:text-steel-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors cursor-pointer"
                    title={isSubStep ? t('actions.deleteSubStep', 'Eliminar sub-paso') : t('actions.delete', 'Eliminar paso')}
                  >
                    <Trash2 size={15} />
                  </motion.button>
                </div>
              </td>
            </tr>
          );

          if (snapshot.isDragging) {
            return createPortal(
              <table
                className="border-collapse bg-white dark:bg-steel-900 shadow-2xl rounded-xl ring-2 ring-blue-500/50 overflow-hidden pointer-events-none z-99999"
                style={{
                  ...provided.draggableProps.style,
                  width: tableWidth || 1200,
                  tableLayout: 'fixed',
                }}
              >
                <tbody>{child}</tbody>
              </table>,
              document.body
            );
          }

          return child;
        }}
      </Draggable>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteConfirmModal
            stepName={step.operationName || (isSubStep ? `Sub-paso ${step.sequence}.${step.subStep}` : '')}
            stepSequence={isSubStep ? `${step.sequence}.${step.subStep}` : step.sequence}
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
