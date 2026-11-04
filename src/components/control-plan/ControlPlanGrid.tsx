import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../api/userService';
import { getMeasurementUnits } from '../../services/measurementUnits';
import { toast } from 'sonner';
import {
  Save,
  Trash2,
  AlertCircle,
  Check,
  Loader2,
  Plus,
  HelpCircle,
} from 'lucide-react';
import {
  controlPlanService,
  type ControlPlan,
  type ControlPlanItem,
  type ControlPlanItemUpdate,
} from '../../api/controlPlanService';
import type { WorksheetRow } from '../../api/pfmeaService';
import { ControlPlanOperationBanner } from './ControlPlanOperationBanner';

const COLUMNS = [
  { key: 'characteristic', label: 'Característica', placeholder: 'Producto / proceso...' },
  { key: 'specification', label: 'Especificación', placeholder: 'Tolerancia / límite...' },
  { key: 'measurement_method', label: 'Método de evaluación', placeholder: 'Técnica / gage...' },
  { key: 'control_method', label: 'Método de control', placeholder: 'Poka-yoke / control...' },
  { key: 'sample_size_text', label: 'Muestra', placeholder: 'Tamaño (ej. 5 pzs)...' },
  { key: 'sample_frequency', label: 'Frecuencia', placeholder: 'Cada hora / lote...' },
  { key: 'reaction_plan', label: 'Plan de reacción', placeholder: 'Acción inmediata...' },
] as const;

interface EditableRowProps {
  item: ControlPlanItem;
  plan: ControlPlan;
  readOnly: boolean;
  canReview: boolean;
  onSaved: () => void;
  onDirtyChange: (id: number, dirty: boolean) => void;
  onDelete?: (id: number) => void;
}

function EditableRow({
  item,
  plan,
  readOnly,
  canReview,
  onSaved,
  onDirtyChange,
  onDelete,
}: EditableRowProps) {
  const [draft, setDraft] = useState<ControlPlanItemUpdate>({});
  const [revision, setRevision] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const dirty = Object.keys(draft).length > 0;

  const { data: people = [] } = useQuery({
    queryKey: ['users', 'lookup'],
    queryFn: userService.lookup,
  });
  const { data: units = [] } = useQuery({
    queryKey: ['measurement-units'],
    queryFn: getMeasurementUnits,
  });

  const change = (patch: ControlPlanItemUpdate) => {
    setRevision((previous) => previous ?? plan.lock_version);
    setDraft((previous) => ({ ...previous, ...patch }));
    onDirtyChange(item.id, true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dirty || saving) return;
    setSaving(true);
    try {
      await controlPlanService.updateItem(
        item.id,
        draft,
        revision ?? plan.lock_version
      );
      setDraft({});
      setRevision(null);
      onDirtyChange(item.id, false);
      onSaved();
      toast.success(`Control #${item.item_sequence} guardado correctamente`);
    } catch {
      toast.error('No se pudo guardar la fila. Revisa los datos y la versión.');
    } finally {
      setSaving(false);
    }
  };

  const formId = `cp-item-form-${item.id}`;
  const classification = draft.classification !== undefined ? draft.classification : item.classification;

  return (
    <tr
      className={`group border-b border-slate-200/80 dark:border-steel-800/80 align-top transition-colors duration-150 ${
        dirty
          ? 'bg-amber-50/40 dark:bg-amber-950/20'
          : 'hover:bg-slate-50/70 dark:hover:bg-steel-800/40'
      }`}
    >
      {/* Col 1: Sequence & Item Name */}
      <td className="p-3 w-44 min-w-36">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center h-5 px-1.5 rounded bg-slate-100 dark:bg-steel-800 text-[10px] font-mono font-bold tabular-nums text-slate-700 dark:text-steel-300 border border-slate-200 dark:border-steel-700">
              #{item.item_sequence}
            </span>
            {item.origin === 'manual' && (
              <span className="text-[9px] font-semibold tracking-wide uppercase px-1.5 py-0.2 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                Manual
              </span>
            )}
          </div>
          <input
            form={formId}
            aria-label={`Nombre de control ${item.item_sequence}`}
            disabled={readOnly || saving}
            value={draft.item_name !== undefined ? draft.item_name : item.item_name || ''}
            onChange={(e) => change({ item_name: e.target.value })}
            placeholder="Descripción del control..."
            className="w-full text-xs font-semibold text-slate-900 dark:text-steel-100 bg-transparent rounded p-1.5 border border-transparent hover:border-slate-300 dark:hover:border-steel-700 focus:border-blue-500 focus:bg-white dark:focus:bg-steel-900 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-steel-500 disabled:opacity-60"
          />
        </div>
      </td>

      {/* Cols 2-8: Dynamic text fields */}
      {COLUMNS.map(({ key, label, placeholder }) => {
        const val = draft[key] !== undefined
          ? draft[key] ?? ''
          : key === 'sample_size_text'
          ? item.sample_size_text ?? item.sample_size ?? ''
          : item[key] ?? '';

        return (
          <td key={key} className="p-2 min-w-36 max-w-xs">
            <textarea
              form={formId}
              aria-label={label}
              rows={2}
              disabled={readOnly || saving}
              value={String(val)}
              onChange={(e) => change({ [key]: e.target.value })}
              placeholder={placeholder}
              className="w-full resize-none rounded-lg p-2 text-xs leading-relaxed text-slate-800 dark:text-steel-100 bg-transparent hover:bg-white/80 dark:hover:bg-steel-900/60 focus:bg-white dark:focus:bg-steel-900 border border-transparent hover:border-slate-300 dark:hover:border-steel-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 focus:outline-none transition-all duration-140 placeholder:text-slate-400 dark:placeholder:text-steel-500 disabled:opacity-60"
            />
          </td>
        );
      })}

      {/* Col 9: Special Classification (SC / CC) */}
      <td className="p-2.5 w-24 text-center">
        <select
          form={formId}
          aria-label={`Clasificación Especial · Control #${item.item_sequence}`}
          disabled={readOnly || saving}
          value={classification ?? ''}
          onChange={(e) =>
            change({
              classification:
                e.target.value === 'SC'
                  ? 'SC'
                  : e.target.value === 'CC'
                  ? 'CC'
                  : null,
            })
          }
          className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
            classification === 'CC'
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
              : classification === 'SC'
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
              : 'bg-transparent hover:bg-slate-100 dark:hover:bg-steel-800 text-slate-500 dark:text-steel-400 border-slate-300 dark:border-steel-700'
          }`}
        >
          <option value="">—</option>
          <option value="SC">SC</option>
          <option value="CC">CC</option>
        </select>
      </td>

      {/* Col 10: Responsible Person */}
      <td className="p-2 w-36">
        <div className="relative">
          <select
            form={formId}
            aria-label={`Responsable · Control #${item.item_sequence}`}
            disabled={readOnly || saving}
            value={
              draft.responsible_person_id !== undefined
                ? draft.responsible_person_id ?? ''
                : item.responsible_person_id ?? ''
            }
            onChange={(e) =>
              change({
                responsible_person_id: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="w-full truncate rounded-lg border border-slate-200 dark:border-steel-700 bg-transparent py-1.5 pl-2 pr-6 text-xs text-slate-800 dark:text-steel-200 hover:border-slate-400 dark:hover:border-steel-600 focus:border-blue-500 focus:bg-white dark:focus:bg-steel-900 focus:outline-none transition-all cursor-pointer disabled:opacity-60"
          >
            <option value="">Sin asignar</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.full_name || person.email}
              </option>
            ))}
          </select>
        </div>
      </td>

      {/* Col 11: Unit of Measurement */}
      <td className="p-2 w-28">
        <div className="relative">
          <select
            form={formId}
            aria-label={`Unidad de medida · Control #${item.item_sequence}`}
            disabled={readOnly || saving}
            value={
              draft.unit_id !== undefined
                ? draft.unit_id ?? ''
                : item.unit_id ?? ''
            }
            onChange={(e) =>
              change({
                unit_id: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="w-full truncate rounded-lg border border-slate-200 dark:border-steel-700 bg-transparent py-1.5 pl-2 pr-5 text-xs font-mono text-slate-800 dark:text-steel-200 hover:border-slate-400 dark:hover:border-steel-600 focus:border-blue-500 focus:bg-white dark:focus:bg-steel-900 focus:outline-none transition-all cursor-pointer disabled:opacity-60"
          >
            <option value="">Sin unidad</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.symbology}
              </option>
            ))}
          </select>
        </div>
      </td>

      {/* Col 12: Actions (Sticky right column) */}
      <td className="p-2.5 sticky right-0 z-10 bg-white/95 dark:bg-steel-900/95 backdrop-blur-sm border-l border-slate-200/80 dark:border-steel-800/80">
        <div className="flex flex-col gap-1.5 items-end justify-center">
          {/* Save button */}
          <form id={formId} onSubmit={handleSave}>
            <button
              type="submit"
              disabled={readOnly || saving || !dirty}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-[0.98] ${
                dirty
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 cursor-pointer animate-pulse'
                  : 'bg-slate-100 dark:bg-steel-800 text-slate-400 dark:text-steel-500 border border-slate-200 dark:border-steel-700 cursor-default opacity-60'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 size={12} className="animate-spin text-white" />
                  <span>Guardando…</span>
                </>
              ) : dirty ? (
                <>
                  <Save size={12} />
                  <span>Guardar</span>
                </>
              ) : (
                <>
                  <Check size={12} className="text-emerald-500" />
                  <span>Al día</span>
                </>
              )}
            </button>
          </form>

          {/* Delete manual control button */}
          {!readOnly && (item.origin === 'manual' || onDelete) && (
            <button
              type="button"
              onClick={() => onDelete?.(item.id)}
              disabled={readOnly || saving}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 dark:text-steel-500 dark:hover:text-rose-400 transition-colors p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
              title="Eliminar este control manual"
            >
              <Trash2 size={12} />
              <span>Eliminar</span>
            </button>
          )}

          {/* Source review requirement badge & action */}
          {item.needs_review && (
            <div className="flex flex-col items-end gap-1 mt-1">
              <span
                role="status"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700/60"
              >
                <AlertCircle size={10} />
                Revisar origen
              </span>
              {canReview && !readOnly && !dirty && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <button
                    type="button"
                    onClick={async () => {
                      const reason = window.prompt(
                        'Justificación de revisión del origen (mínimo 5 caracteres):'
                      );
                      if (!reason || reason.trim().length < 5) return;
                      try {
                        await controlPlanService.reviewSource(
                          item.id,
                          true,
                          reason,
                          plan.lock_version
                        );
                        onSaved();
                        toast.success('Origen confirmado');
                      } catch {
                        toast.error('No se pudo confirmar el origen');
                      }
                    }}
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Conservar
                  </button>
                  <span className="text-slate-300 dark:text-steel-700">·</span>
                  <button
                    type="button"
                    onClick={async () => {
                      const reason = window.prompt(
                        'Motivo de retiro del control (mínimo 5 caracteres):'
                      );
                      if (!reason || reason.trim().length < 5) return;
                      try {
                        await controlPlanService.reviewSource(
                          item.id,
                          false,
                          reason,
                          plan.lock_version
                        );
                        onSaved();
                        toast.success('Control retirado');
                      } catch {
                        toast.error('No se pudo retirar el control');
                      }
                    }}
                    className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    Retirar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export function ControlPlanGrid({
  plan,
  rows,
  readOnly,
  onSaved,
  onDirtyChange,
  canReview = false,
}: {
  canReview?: boolean;
  plan: ControlPlan;
  rows: WorksheetRow[];
  readOnly: boolean;
  onSaved: () => void;
  onDirtyChange: (id: number, dirty: boolean) => void;
}) {
  const [collapsedOps, setCollapsedOps] = useState<Record<string, boolean>>({});

  const toggleCollapse = (opKey: string) => {
    setCollapsedOps((prev) => ({
      ...prev,
      [opKey]: !prev[opKey],
    }));
  };

  // Group items by operation, linking with PFMEA rows
  const byId = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows]);

  // Discover all operations from both PFMEA rows and existing CP items
  const { allOperations } = useMemo(() => {
    const groups = new Map<
      string,
      {
        operationName: string;
        stepNumber?: number | string;
        items: ControlPlanItem[];
        risks: Map<number, WorksheetRow>;
      }
    >();

    // 1. Seed operations from PFMEA rows
    for (const r of rows) {
      const op = r.station_operation?.trim();
      if (op && !groups.has(op)) {
        // Extract step number if available from [OP XX]
        const match = op.match(/\[OP\s*(\d+)\]/i);
        groups.set(op, {
          operationName: op,
          stepNumber: match ? match[1] : undefined,
          items: [],
          risks: new Map(),
        });
      }
      if (op && groups.has(op)) {
        groups.get(op)!.risks.set(r.id, r);
      }
    }

    // 2. Map Control Plan items into operations
    const defaultOpName = 'Controles generales / manuales';
    for (const item of plan.items) {
      if (item.is_active === false) continue; // Skip retired items

      const linked = (item as ControlPlanItem & {
        risk_links?: { source_row_id: number }[];
      }).risk_links;
      const ids = linked?.length
        ? linked.map((link) => link.source_row_id)
        : [item.pfmea_worksheet_row_id ?? item.source_row_id];

      const risks = ids.flatMap((id) => (id && byId.has(id) ? [byId.get(id)!] : []));
      let operation = risks[0]?.station_operation?.trim();

      // If no linked risk, try matching item_name prefix e.g. "[OP 10]"
      if (!operation && item.item_name) {
        for (const [knownOp] of groups) {
          if (item.item_name.toLowerCase().includes(knownOp.toLowerCase())) {
            operation = knownOp;
            break;
          }
        }
      }

      const finalOp = operation || defaultOpName;
      if (!groups.has(finalOp)) {
        const match = finalOp.match(/\[OP\s*(\d+)\]/i);
        groups.set(finalOp, {
          operationName: finalOp,
          stepNumber: match ? match[1] : undefined,
          items: [],
          risks: new Map(),
        });
      }

      const grp = groups.get(finalOp)!;
      grp.items.push(item);
      risks.forEach((r) => grp.risks.set(r.id, r));
    }

    return {
      allOperations: Array.from(groups.values()),
    };
  }, [plan.items, rows, byId]);

  // Handle adding a manual row for a specific operation
  const handleAddManualRow = async (opName: string, stepNum?: number | string) => {
    if (readOnly) return;
    const maxSeq = plan.items.reduce(
      (max, i) => Math.max(max, i.item_sequence || 0),
      0
    );
    const nextSeq = maxSeq + 10;
    const cleanOp = stepNum !== undefined ? `[OP ${stepNum}] Control manual` : `${opName} - Control`;

    try {
      await controlPlanService.addManualItem(plan.id, {
        item_name: cleanOp,
        item_sequence: nextSeq,
        characteristic: '',
        specification: '',
        measurement_method: '',
        control_method: '',
        sample_size_text: '',
        sample_frequency: '',
        reaction_plan: '',
      });
      onSaved();
      toast.success(`Fila manual añadida a ${opName}`);
      // Ensure the operation is expanded
      if (collapsedOps[opName]) {
        setCollapsedOps((prev) => ({ ...prev, [opName]: false }));
      }
    } catch {
      toast.error('No se pudo añadir el control manual. Verifica tus permisos.');
    }
  };

  // Handle deleting a manual row
  const handleDeleteRow = async (itemId: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este control manual?')) return;
    try {
      await controlPlanService.deleteItem(itemId);
      onSaved();
      toast.success('Control eliminado');
    } catch {
      toast.error('No se pudo eliminar el control.');
    }
  };

  return (
    <section
      className="rounded-2xl border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-950 overflow-hidden shadow-lg"
      aria-label="Tabla editable del plan de control"
    >
      <div className="overflow-x-auto max-h-[75vh]">
        <table className="w-full text-left border-collapse text-xs">
          {/* Sticky table header */}
          <thead className="sticky top-0 z-20 bg-slate-100/95 dark:bg-steel-900/95 backdrop-blur-md border-b border-slate-200 dark:border-steel-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-steel-400">
            <tr>
              <th scope="col" className="p-3 w-44">Control / Operación</th>
              {COLUMNS.map(({ label }) => (
                <th key={label} scope="col" className="p-3 min-w-36">
                  {label}
                </th>
              ))}
              <th scope="col" className="p-3 w-24 text-center">SC / CC</th>
              <th scope="col" className="p-3 w-36">Responsable</th>
              <th scope="col" className="p-3 w-28">Unidad</th>
              <th
                scope="col"
                className="p-3 w-32 sticky right-0 z-30 bg-slate-100/95 dark:bg-steel-900/95 border-l border-slate-200 dark:border-steel-800 text-right"
              >
                Acciones
              </th>
            </tr>
          </thead>

          {/* Operation Groups */}
          {allOperations.map((grp) => {
            const isCollapsed = !!collapsedOps[grp.operationName];
            const hasScCc = grp.items.some(
              (i) => i.classification === 'SC' || i.classification === 'CC'
            );

            return (
              <tbody key={grp.operationName} className="border-b border-slate-200 dark:border-steel-800">
                {/* Operation Group Header Banner */}
                <tr>
                  <td colSpan={12} className="p-0">
                    <ControlPlanOperationBanner
                      operationTitle={grp.operationName}
                      stepNumber={grp.stepNumber}
                      isCollapsed={isCollapsed}
                      onToggleCollapse={() => toggleCollapse(grp.operationName)}
                      onAddRow={() =>
                        handleAddManualRow(grp.operationName, grp.stepNumber)
                      }
                      itemsCount={grp.items.length}
                      hasScCc={hasScCc}
                      risks={Array.from(grp.risks.values())}
                      pfmeaProjectId={plan.pfmea_project_id}
                      isReadOnly={readOnly}
                    />
                  </td>
                </tr>

                {/* Operation Group Rows (when expanded) */}
                {!isCollapsed && (
                  <>
                    {grp.items.length > 0 ? (
                      grp.items.map((item) => (
                        <EditableRow
                          key={item.id}
                          item={item}
                          plan={plan}
                          readOnly={readOnly}
                          canReview={canReview}
                          onSaved={onSaved}
                          onDirtyChange={onDirtyChange}
                          onDelete={handleDeleteRow}
                        />
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={12}
                          className="px-6 py-6 text-center text-slate-400 dark:text-steel-500 bg-slate-50/40 dark:bg-steel-900/30 border-b border-slate-100 dark:border-steel-800/60"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span className="text-xs">
                              No hay controles registrados para esta operación.
                            </span>
                            {!readOnly && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleAddManualRow(grp.operationName, grp.stepNumber)
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/60 transition-colors cursor-pointer"
                              >
                                <Plus size={13} />
                                <span>Añadir primer control manual</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            );
          })}
        </table>
      </div>

      {!allOperations.length && (
        <div className="p-12 text-center text-slate-400 dark:text-steel-500">
          <HelpCircle size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold">No se encontraron operaciones ni controles</p>
          <p className="text-xs mt-1">Sincroniza los críticos desde el análisis PFMEA para comenzar.</p>
        </div>
      )}
    </section>
  );
}
