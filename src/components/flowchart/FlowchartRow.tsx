// ─────────────────────────────────────────────────────────────
//  FlowchartRow — Single draggable process step row
//  Contains inline-editable fields, operation select,
//  critical flag toggle, and CRUD action buttons.
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
  Timer,
} from 'lucide-react';
import { useFlowchart } from '../../hooks/useFlowchart';
import { OperationSelect } from './OperationSelect';
import { MachinerySelect } from './MachinerySelect';
import { MachineryLocationDisplay } from './MachineryLocationDisplay';
import { DepartmentSelect } from './DepartmentSelect';
import { CriticalFlag } from './CriticalFlag';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ProcessSymbol } from '../flowcharts/ProcessSymbols';

interface FlowchartRowProps {
  step: FlowchartStep;
  index: number;
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

export function FlowchartRow({ step, index }: FlowchartRowProps) {
  const { t } = useTranslation();
  const { state, updateStep, duplicateStep, deleteStep } = useFlowchart();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const disabledOperationIds = useMemo(() => {
    return state.steps.map(s => s.operationId).filter(Boolean);
  }, [state.steps]);

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
              className={`group border-b border-steel-700/40 transition-industrial ${
                snapshot.isDragging
                  ? 'bg-steel-700/95 shadow-2xl shadow-forge-500/10 ring-1 ring-forge-500/30'
                  : 'hover:bg-steel-800/60'
              }`}
              style={{
                ...provided.draggableProps.style,
                display: snapshot.isDragging ? 'table' : 'table-row',
                ...(snapshot.isDragging && {
                  tableLayout: 'fixed',
                }),
              }}
            >
              {/* Drag Handle */}
              <td className="w-10 px-2 py-3 text-center">
                <div
                  {...provided.dragHandleProps}
                  className="drag-handle inline-flex items-center justify-center rounded-lg p-1 text-steel-500 dark:text-steel-300 transition-industrial hover:bg-steel-700 hover:text-steel-300"
                  title={t('table.dragHandle')}
                >
                  <GripVertical size={16} />
                </div>
              </td>

              {/* Sequence */}
              <td className="w-16 px-2 py-3 text-center">
                <span className="inline-flex h-7 w-10 items-center justify-center rounded-lg bg-steel-700/50 text-xs font-mono font-semibold text-steel-300">
                  {step.sequence}
                </span>
              </td>

              {/* Operation */}
              <td className="w-[200px] px-2 py-3">
                <OperationSelect
                  value={step.operationId}
                  displayValue={step.operationName}
                  onChange={handleOperationChange}
                  disabledIds={disabledOperationIds}
                />
              </td>

              {/* Machinery */}
              <td className="w-[200px] px-2 py-3">
                <MachinerySelect
                  value={step.machineryId}
                  onChange={handleMachineryChange}
                />
              </td>

              {/* Location */}
              <td className="w-[150px] px-2 py-3">
                <MachineryLocationDisplay
                  machineryId={step.machineryId}
                />
              </td>

              {/* Responsible Department */}
              <td className="w-[180px] px-2 py-3">
                <DepartmentSelect
                  value={step.responsibleDepartment || 'Producción'}
                  onChange={(dept) => updateStep(step.id, 'responsibleDepartment', dept)}
                />
              </td>

              {/* Critical Flag */}
              <td className="w-24 px-2 py-3 text-center">
                <CriticalFlag
                  value={step.criticalFlag}
                  onChange={(flag) => updateStep(step.id, 'criticalFlag', flag)}
                />
              </td>

              {/* Symbol Type */}
              <td className="w-28 px-2 py-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      const idx = SYMBOL_OPTIONS.indexOf(step.symbolType);
                      const next = SYMBOL_OPTIONS[(idx + 1) % SYMBOL_OPTIONS.length];
                      handleSymbolChange(next);
                    }}
                    className="focus-ring flex items-center gap-2 rounded-lg border border-steel-600/50 bg-steel-800/50 px-3 py-1.5 text-xs text-steel-300 dark:text-steel-200 border-steel-600/50 dark:border-steel-500/50 transition-industrial hover:border-forge-500/30 cursor-pointer"
                    title={t(`symbols.${step.symbolType}`)}
                  >
                    {SYMBOL_ICONS[step.symbolType]}
                    <span>{t(`symbols.${step.symbolType}`)}</span>
                  </button>
                </div>
              </td>


              {/* Actions */}
              <td className="w-24 px-2 py-3">
                <div className="flex items-center justify-center gap-1 opacity-100 xl:opacity-0 transition-opacity xl:group-hover:opacity-100">
                  <motion.button
                    type="button"
                    onClick={() => duplicateStep(step.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="rounded-lg p-1.5 text-steel-400 dark:text-steel-300 transition-industrial hover:bg-forge-glow hover:text-forge-400 cursor-pointer"
                    title={t('actions.duplicate')}
                  >
                    <Copy size={15} />
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="rounded-lg p-1.5 text-steel-400 dark:text-steel-300 transition-industrial hover:bg-alert-red-glow hover:text-alert-red cursor-pointer"
                    title={t('actions.delete')}
                  >
                    <Trash2 size={15} />
                  </motion.button>
                </div>
              </td>
            </tr>
          );

          if (snapshot.isDragging) {
            return createPortal(child, document.body);
          }

          return child;
        }}
      </Draggable>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteConfirmModal
            stepName={step.operationName || ''}
            stepSequence={step.sequence}
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
