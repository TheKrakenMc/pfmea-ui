// ─────────────────────────────────────────────────────────────
//  FlowchartRow — Single draggable process step row
//  Contains inline-editable fields, operation select,
//  critical flag toggle, and CRUD action buttons.
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Draggable } from '@hello-pangea/dnd';
import {
  GripVertical,
  Copy,
  Trash2,
  Circle,
  Search,
  Truck,
  Package,
  Timer,
} from 'lucide-react';
import type { FlowchartStep, SymbolType, PlantOperation } from '../../types/flowchart.types';
import { useFlowchart } from '../../hooks/useFlowchart';
import { OperationSelect } from './OperationSelect';
import { CriticalFlag } from './CriticalFlag';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface FlowchartRowProps {
  step: FlowchartStep;
  index: number;
}

// ─── Symbol Icon Map ─────────────────────────────────────────

const SYMBOL_ICONS: Record<SymbolType, React.ReactNode> = {
  operation: <Circle size={16} className="text-forge-400" />,
  inspection: <Search size={16} className="text-emerald-400" />,
  transport: <Truck size={16} className="text-sky-400" />,
  storage: <Package size={16} className="text-amber-400" />,
  delay: <Timer size={16} className="text-purple-400" />,
};

const SYMBOL_OPTIONS: SymbolType[] = [
  'operation',
  'inspection',
  'transport',
  'storage',
  'delay',
];

export function FlowchartRow({ step, index }: FlowchartRowProps) {
  const { t } = useTranslation();
  const { updateStep, duplicateStep, deleteStep } = useFlowchart();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleOperationChange = useCallback(
    (op: PlantOperation) => {
      updateStep(step.id, 'operationId', op.id);
      updateStep(step.id, 'operationName', op.name);
    },
    [step.id, updateStep]
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateStep(step.id, 'description', e.target.value);
    },
    [step.id, updateStep]
  );

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateStep(step.id, 'notes', e.target.value);
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
        {(provided, snapshot) => (
          <motion.tr
            ref={provided.innerRef}
            {...provided.draggableProps}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`group border-b border-steel-700/40 transition-industrial ${
              snapshot.isDragging
                ? 'bg-steel-700/60 shadow-2xl shadow-forge-500/10 ring-1 ring-forge-500/30'
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
            <td className="min-w-[200px] px-2 py-3">
              <OperationSelect
                value={step.operationId}
                displayValue={step.operationName}
                onChange={handleOperationChange}
              />
            </td>

            {/* Description */}
            <td className="min-w-[240px] px-2 py-3">
              <input
                type="text"
                value={step.description}
                onChange={handleDescriptionChange}
                placeholder={t('table.description')}
                className="focus-ring w-full rounded-lg border border-transparent bg-transparent px-3 py-2 text-sm text-steel-100 dark:text-steel-100 placeholder-steel-500 dark:placeholder-steel-300 transition-industrial hover:border-steel-600 focus:border-forge-500/50 focus:bg-steel-800"
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

            {/* Notes */}
            <td className="min-w-[180px] px-2 py-3">
              <input
                type="text"
                value={step.notes}
                onChange={handleNotesChange}
                placeholder={t('table.notes')}
                className="focus-ring w-full rounded-lg border border-transparent bg-transparent px-3 py-2 text-sm text-steel-300 dark:text-steel-200 placeholder-steel-600 dark:placeholder-steel-300 transition-industrial hover:border-steel-600 focus:border-forge-500/50 focus:bg-steel-800"
              />
            </td>

            {/* Actions */}
            <td className="w-24 px-2 py-3">
              <div className="flex items-center justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
          </motion.tr>
        )}
      </Draggable>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteConfirmModal
            stepName={step.operationName || step.description}
            stepSequence={step.sequence}
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
