import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown, Network, ExternalLink } from 'lucide-react';
import type { ControlPlan } from '../../api/controlPlanService';
import type { WorksheetRow } from '../../api/pfmeaService';

export function TraceabilityMatrix({
  plan,
  rows,
}: {
  plan: ControlPlan;
  rows: WorksheetRow[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const byId = new Map(rows.map((row) => [row.id, row]));

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-950 overflow-hidden shadow-md">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50/80 dark:bg-steel-900/80 hover:bg-slate-100/70 dark:hover:bg-steel-850/80 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
            <Network size={16} />
          </div>
          <span className="font-bold text-xs md:text-sm text-slate-800 dark:text-steel-100 tracking-tight">
            Trazabilidad Digital: Diagrama de Flujo ↔ PFMEA ↔ Plan de Control
          </span>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-steel-800 text-slate-600 dark:text-steel-400">
            {plan.items.length} enlaces
          </span>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="text-slate-400 dark:text-steel-400"
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-slate-200 dark:border-steel-800"
          >
            <div className="overflow-x-auto max-h-[50vh] p-1">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-steel-900 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-steel-400 border-b border-slate-200 dark:border-steel-800">
                  <tr>
                    <th scope="col" className="p-3">Operación / Estación</th>
                    <th scope="col" className="p-3 text-center">Paso Flujo</th>
                    <th scope="col" className="p-3 text-center">Fila PFMEA</th>
                    <th scope="col" className="p-3 text-center">S / O / D → AP</th>
                    <th scope="col" className="p-3">Control / Característica</th>
                    <th scope="col" className="p-3">Estado y Validación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-steel-800/60 font-sans">
                  {plan.items.map((item) => {
                    const row = item.pfmea_worksheet_row_id
                      ? byId.get(item.pfmea_worksheet_row_id)
                      : undefined;
                    const apColor =
                      row?.action_priority === 'H'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : row?.action_priority === 'M'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-steel-900/60 transition-colors"
                      >
                        <td className="p-3 font-medium text-slate-800 dark:text-steel-200">
                          {row?.station_operation || (
                            <span className="italic text-slate-400 dark:text-steel-500">
                              Origen manual / Sin operación
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-slate-600 dark:text-steel-300 tabular-nums">
                          {row?.flowchart_step_id ? `OP ${row.flowchart_step_id}` : '—'}
                        </td>
                        <td className="p-3 text-center">
                          {item.pfmea_worksheet_row_id || item.source_row_id ? (
                            <Link
                              to={`/pfmea/${plan.pfmea_project_id}`}
                              className="inline-flex items-center gap-1 font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              <span>#{item.pfmea_worksheet_row_id || item.source_row_id}</span>
                              <ExternalLink size={10} />
                            </Link>
                          ) : (
                            <span className="text-slate-400">Manual</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {row ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold border tabular-nums ${apColor}`}
                            >
                              <span>
                                {row.severity ?? '—'}/{row.occurrence ?? '—'}/{row.detection ?? '—'}
                              </span>
                              <span>→</span>
                              <span>AP {row.action_priority ?? '—'}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">No aplica</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-900 dark:text-steel-100">
                            #{item.item_sequence}
                          </span>{' '}
                          <span className="text-slate-700 dark:text-steel-300">
                            {item.characteristic || item.item_name}
                          </span>
                          {item.classification && (
                            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 dark:bg-steel-800 text-slate-700 dark:text-steel-300 border border-slate-200 dark:border-steel-700">
                              {item.classification}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {item.is_active === false ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                              Retirado
                            </span>
                          ) : item.needs_review ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200">
                              Revisión pendiente
                            </span>
                          ) : item.source_reviewed ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200">
                              Decisión confirmada
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                              Sincronizado
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
