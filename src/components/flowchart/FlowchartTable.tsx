// ─────────────────────────────────────────────────────────────
//  FlowchartTable — DnD-wrapped table container
//  Manages drag-drop context, sticky header, and empty state.
// ─────────────────────────────────────────────────────────────

import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  DragDropContext,
  Droppable,
  type DropResult,
} from '@hello-pangea/dnd';
import { Plus, GitBranch } from 'lucide-react';
import { useFlowchart } from '../../hooks/useFlowchart';
import { FlowchartRow } from './FlowchartRow';

export function FlowchartTable() {
  const { t } = useTranslation();
  const { state, reorderSteps, addStep } = useFlowchart();

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      if (result.source.index === result.destination.index) return;
      reorderSteps(result.source.index, result.destination.index);
    },
    [reorderSteps]
  );

  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      {/* Table Header Bar */}
      <div className="flex items-center justify-between border-b border-steel-700/50 px-6 py-3">
        <div className="flex items-center gap-2">
          <GitBranch size={16} className="text-forge-400" />
          <span className="text-sm font-semibold text-steel-100">
            {t('app.subtitle')}
          </span>
          <span className="rounded-full bg-steel-700/60 px-2.5 py-0.5 text-[10px] font-mono text-steel-400">
            {t('table.stepCount', { count: state.steps.length })}
          </span>
        </div>

        <motion.button
          type="button"
          onClick={addStep}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 rounded-xl bg-forge-600/90 px-4 py-2 text-xs font-semibold text-white transition-industrial hover:bg-forge-500 cursor-pointer"
        >
          <Plus size={14} />
          {t('table.addStep')}
        </motion.button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {state.steps.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-4 py-20"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-steel-800 dark:bg-steel-900 ring-1 ring-steel-700">
              <GitBranch size={28} className="text-steel-500" />
            </div>
            <p className="max-w-xs text-center text-sm text-steel-400 dark:text-steel-300">
              {t('table.emptyState')}
            </p>
            <motion.button
              type="button"
              onClick={addStep}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-xl bg-forge-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-forge-600/20 cursor-pointer"
            >
              <Plus size={16} />
              {t('table.addStep')}
            </motion.button>
          </motion.div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <table className="w-full border-collapse">
              {/* Sticky Header */}
              <thead>
                <tr className="border-b border-steel-700/50 bg-steel-850/80 text-left">
                  <th className="w-10 px-2 py-3" />
                  <th className="w-16 px-2 py-3 text-center text-[10px] font-semibold uppercase tracking-widest text-steel-500 dark:text-steel-300">
                    {t('table.sequence')}
                  </th>
                  <th className="min-w-[200px] px-2 py-3 text-[10px] font-semibold uppercase tracking-widest text-steel-500 dark:text-steel-300">
                    {t('table.operation')}
                  </th>
                  <th className="min-w-[240px] px-2 py-3 text-[10px] font-semibold uppercase tracking-widest text-steel-500 dark:text-steel-300">
                    {t('table.description')}
                  </th>
                  <th className="w-24 px-2 py-3 text-center text-[10px] font-semibold uppercase tracking-widest text-steel-500">
                    {t('table.critical')}
                  </th>
                  <th className="w-28 px-2 py-3 text-[10px] font-semibold uppercase tracking-widest text-steel-500 dark:text-steel-300">
                    {t('table.symbol')}
                  </th>
                  <th className="min-w-[180px] px-2 py-3 text-[10px] font-semibold uppercase tracking-widest text-steel-500 dark:text-steel-300">
                    {t('table.notes')}
                  </th>
                  <th className="w-24 px-2 py-3 text-center text-[10px] font-semibold uppercase tracking-widest text-steel-500">
                    {t('table.actions')}
                  </th>
                </tr>
              </thead>

              <Droppable droppableId="flowchart-steps">
                {(provided) => (
                  <tbody ref={provided.innerRef} {...provided.droppableProps}>
                    <AnimatePresence>
                      {state.steps.map((step, idx) => (
                        <FlowchartRow key={step.id} step={step} index={idx} />
                      ))}
                    </AnimatePresence>
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
        <div className="border-t border-steel-700/30 px-6 py-3">
          <button
            type="button"
            onClick={addStep}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-steel-400 dark:text-steel-300 transition-industrial hover:bg-steel-800 dark:hover:bg-steel-700 hover:text-forge-400 dark:hover:text-forge-300 cursor-pointer"
          >
            <Plus size={14} />
            {t('table.addStep')}
          </button>
        </div>
      )}
    </div>
  );
}
