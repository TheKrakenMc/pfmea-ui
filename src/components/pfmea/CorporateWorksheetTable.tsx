import {VirtualTableRows} from './VirtualTableRows';
import {nextDraftRowId} from '../../utils/draftRowId';
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import type { PfmeaHeader, WorksheetRow } from '../../api/pfmeaService';
import type { FlowchartStepRead } from '../../services/flowchartService';
import {
  AlertCircle,
  Plus,
  Loader2,
  Trash2,
  Copy} from 'lucide-react';
import { SeverityModal } from './SeverityModal';
import { OccurrenceModal } from './OccurrenceModal';
import { DetectionModal } from './DetectionModal';
import { ActionPriorityModal } from './ActionPriorityModal';
import { calculateActionPriority } from '../../utils/apCalculator';
import { calculateRpn, getApBadgeColor } from '../../adapters/fmeaCorporateAdapter';
import { CriticalFlag } from '../flowchart/CriticalFlag';
import { PFMEAOperationBanner } from './PFMEAOperationBanner';
import { usePFMEAValidation } from '../../hooks/usePFMEAValidation';
import { PFMEA_TABLE_CONFIG, PFMEA_TEXTAREA_CONFIG } from './pfmeaTableConfig';

interface CorporateWorksheetTableProps {
  pfmeaId: number;
  partNumber?: string;
  flowchartSteps: FlowchartStepRead[];
  rows: WorksheetRow[];
  onRowsChange?: (rows: WorksheetRow[]) => void;
  onSaveAll?: (rows: WorksheetRow[]) => void;
  isReadOnly: boolean;
  isSaving?: boolean;
  isHeaderDirty?: boolean;
  header: PfmeaHeader;
  productData?: unknown;
}

const EditableCell: React.FC<{
  value: string | number | undefined;
  type?: 'text' | 'number' | 'date' | 'textarea';
  isReadOnly: boolean;
  onSave: (val: string | number) => void;
  className?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  minHeightClass?: string;
}> = ({
  value,
  type = 'text',
  isReadOnly,
  onSave,
  className,
  placeholder,
  rows = PFMEA_TEXTAREA_CONFIG.defaultRows,
  maxLength = PFMEA_TEXTAREA_CONFIG.defaultMaxLength,
  minHeightClass = PFMEA_TEXTAREA_CONFIG.minHeightClass,
}) => {
  const [editing, setEditing] = useState<{source: string | number | null | undefined; draft: string | number}>(()=>({source:value,draft:value ?? ''}));
  const localVal = editing.source === value ? editing.draft : value ?? '';
  const setLocalVal = (draft: string | number) => {
    setEditing({source:value,draft});
    const parsed = type === 'number' ? parseInt(String(draft), 10) : draft;
    onSave(type === 'number' && Number.isNaN(parsed) ? 0 : parsed);
  };

  const handleBlur = () => {
    if (localVal !== (value ?? '')) {
      const parsed = type === 'number' ? parseInt(localVal as string, 10) : localVal;
      onSave(parsed || (type === 'number' ? 0 : ''));
    }
  };

  const baseClasses = `w-full bg-slate-50 dark:bg-steel-900/40 border border-slate-200 dark:border-steel-700/60 hover:border-slate-300 dark:hover:border-steel-600 focus:border-blue-500 focus:bg-white dark:focus:bg-steel-900 rounded p-1.5 text-[11px] text-slate-800 dark:text-steel-200 transition-all focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${className || ''}`;

  if (type === 'textarea') {
    return (
      <textarea
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={handleBlur}
        disabled={isReadOnly}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`${baseClasses} resize-y ${minHeightClass}`}
      />
    );
  }

  return (
    <input
      type={type}
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={handleBlur}
      disabled={isReadOnly}
      placeholder={placeholder}
      className={baseClasses}
    />
  );
};

export const CorporateWorksheetTable: React.FC<CorporateWorksheetTableProps> = ({
  pfmeaId,
  partNumber,
  flowchartSteps,
  rows,
  onRowsChange,
  isReadOnly,
  isSaving = false,
  header,
}) => {
  const { t } = useTranslation();
  const rowIndex=React.useMemo(()=>new Map(rows.map((row,index)=>[row.id,index])),[rows]);

  const [rowToDelete, setRowToDelete] = useState<number | null>(null);

  // Modals for Step 5
  const [severityModalRowId, setSeverityModalRowId] = useState<number | null>(null);
  const [occurrenceModalRowId, setOccurrenceModalRowId] = useState<number | null>(null);
  const [detectionModalRowId, setDetectionModalRowId] = useState<number | null>(null);
  const [apModalRowId, setApModalRowId] = useState<number | null>(null);

  // Modals for Step 6 (Optimization / Action Results)
  const [newSeverityModalRowId, setNewSeverityModalRowId] = useState<number | null>(null);
  const [newOccurrenceModalRowId, setNewOccurrenceModalRowId] = useState<number | null>(null);
  const [newDetectionModalRowId, setNewDetectionModalRowId] = useState<number | null>(null);
  const [newApModalRowId, setNewApModalRowId] = useState<number | null>(null);

  const handleRowUpdate = useCallback((rowId: number | string, field: keyof WorksheetRow, value: WorksheetRow[keyof WorksheetRow]) => {
    const updated = rows.map(r => {
      if (r.id.toString() !== rowId.toString()) return r;

      const upd = { ...r, [field]: value };

      // Calculate AP if S, O, or D change
      if (field === 'severity' || field === 'occurrence' || field === 'detection') {
        upd.action_priority = calculateActionPriority(
          upd.severity,
          upd.occurrence,
          upd.detection
        );
      }

      // Calculate new AP if new S, O, or D change
      if (field === 'new_severity' || field === 'new_occurrence' || field === 'new_detection') {
        upd.new_action_priority = calculateActionPriority(
          upd.new_severity,
          upd.new_occurrence,
          upd.new_detection
        );
      }

      // If actions_taken has content or new ratings are provided, mark action_status as Completed
      if (upd.actions_taken?.trim() || (upd.new_severity && upd.new_occurrence && upd.new_detection)) {
        upd.action_status = 'Completed';
      }

      return upd;
    });
    onRowsChange?.(updated);
  }, [rows, onRowsChange]);

  const handleUpdateResponsible = useCallback((rowId: number | string, userId: number | null, userName: string) => {
    const updated = rows.map(r => {
      if (r.id.toString() !== rowId.toString()) return r;
      return {
        ...r,
        responsible_person_id: userId ?? undefined,
        responsible_person_name: userName,
      };
    });
    onRowsChange?.(updated);
  }, [rows, onRowsChange]);

  const handleAddRow = () => {
    const lastRow = rows[rows.length - 1];
    const newRow: WorksheetRow = {
      id: nextDraftRowId(rows),
      pfmea_id: pfmeaId,
      flowchart_step_id: lastRow?.flowchart_step_id,
      process_item_name: lastRow?.process_item_name || partNumber || '',
      station_operation: lastRow?.station_operation || (flowchartSteps[0] ? `[OP ${flowchartSteps[0].step_number}] ${flowchartSteps[0].technology?.name || 'Assembly'}` : ''),
      work_element_process: '',
      function_process_item_plant: '',
      function_process_item_customer: '',
      function_process_item_end_user: '',
      function_process_step: '',
      function_work_element: '',
      failure_mode: '',
      failure_effect_plant: '',
      failure_effect_customer: '',
      failure_effect_end_user: '',
      severity: undefined,
      failure_cause: '',
      occurrence: undefined,
      prevention_controls: '',
      detection_controls: '',
      detection: undefined,
      action_status: 'Open',
      sequence_order: (lastRow?.sequence_order || 0) + 10,
    };
    onRowsChange?.([...rows, newRow]);
  };

  const handleAddRowForOperation = (stationName: string, stepId?: number) => {
    // Find index of last row belonging to this operation
    const lastOpRowIndex = rows
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => (stepId && r.flowchart_step_id === stepId) || r.station_operation === stationName)
      .pop()?.i;

    const newRow: WorksheetRow = {
      id: nextDraftRowId(rows),
      pfmea_id: pfmeaId,
      flowchart_step_id: stepId,
      process_item_name: partNumber || '',
      station_operation: stationName,
      work_element_process: '',
      function_process_item_plant: '',
      function_process_item_customer: '',
      function_process_item_end_user: '',
      function_process_step: '',
      function_work_element: '',
      failure_mode: '',
      failure_effect_plant: '',
      failure_effect_customer: '',
      failure_effect_end_user: '',
      severity: undefined,
      failure_cause: '',
      occurrence: undefined,
      prevention_controls: '',
      detection_controls: '',
      detection: undefined,
      action_status: 'Open',
      sequence_order: (rows.length > 0 ? (rows[rows.length - 1].sequence_order || 0) + 5 : 10),
    };

    if (lastOpRowIndex !== undefined) {
      const copy = [...rows];
      copy.splice(lastOpRowIndex + 1, 0, newRow);
      onRowsChange?.(copy);
    } else {
      onRowsChange?.([...rows, newRow]);
    }
  };

  const handleInsertRow = (index: number) => {
    const target = rows[index];
    const newRow: WorksheetRow = {
      id: nextDraftRowId(rows),
      pfmea_id: target?.pfmea_id || pfmeaId,
      flowchart_step_id: target?.flowchart_step_id,
      process_item_name: target?.process_item_name || partNumber || '',
      station_operation: target?.station_operation || '',
      work_element_process: '',
      function_process_item_plant: '',
      function_process_item_customer: '',
      function_process_item_end_user: '',
      function_process_step: '',
      function_work_element: '',
      failure_mode: '',
      failure_effect_plant: '',
      failure_effect_customer: '',
      failure_effect_end_user: '',
      severity: undefined,
      failure_cause: '',
      occurrence: undefined,
      prevention_controls: '',
      detection_controls: '',
      detection: undefined,
      action_priority: 'L',
      special_characteristics: '',
      optimization_prevention_action: '',
      optimization_detection_action: '',
      responsible_person_id: undefined,
      target_completion_date: '',
      action_status: 'Open',
      actions_taken: '',
      completion_date: '',
      new_severity: undefined,
      new_occurrence: undefined,
      new_detection: undefined,
      new_action_priority: undefined,
      sequence_order: (target?.sequence_order || 0) + 1,
    };
    const copy = [...rows];
    copy.splice(index + 1, 0, newRow);
    onRowsChange?.(copy);
  };

  const handleDuplicateRow = (index: number) => {
    const target = rows[index];
    const newRow: WorksheetRow = {
      ...target,
      id: nextDraftRowId(rows),
      sequence_order: (target.sequence_order || 0) + 1,
    };
    const copy = [...rows];
    copy.splice(index + 1, 0, newRow);
    onRowsChange?.(copy);
  };

  const handleDeleteRow = (id: number) => {
    setRowToDelete(id);
  };

  const confirmDelete = () => {
    if (rowToDelete !== null) {
      onRowsChange?.(rows.filter(r => r.id !== rowToDelete));
      setRowToDelete(null);
    }
  };

  // Local storage collapsed state per operation
  const storageKey = `pfmea_collapsed_ops_${pfmeaId}`;
  const [collapsedOps, setCollapsedOps] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleOpCollapse = (opKey: string) => {
    setCollapsedOps(prev => {
      const current = prev[opKey] !== undefined ? prev[opKey] : true;
      const updated = { ...prev, [opKey]: !current };
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch { console.warn('Clipboard operation unavailable'); }
      return updated;
    });
  };

  // Synchronized operations & validation metrics from DF steps and rows
  const validation = usePFMEAValidation(rows, flowchartSteps, 'AIAG_APG');

  const activeRow = rows.find(r => r.id === (severityModalRowId || occurrenceModalRowId || detectionModalRowId || apModalRowId || newSeverityModalRowId || newOccurrenceModalRowId || newDetectionModalRowId || newApModalRowId));

  const renderCorporateHeaders = () => (
    <thead className="sticky top-0 z-30 shadow-xs bg-slate-100 dark:bg-steel-900 border-b border-slate-300 dark:border-steel-700">
      {/* Super-Header Row */}
      <tr className="bg-slate-200 dark:bg-steel-950 text-[11px] font-bold uppercase tracking-wider border-b border-slate-300 dark:border-steel-800">
        <th className={`${PFMEA_TABLE_CONFIG.firstColumnWidth} px-1 py-2 text-center border-r border-slate-300 dark:border-steel-800 sticky left-0 z-40 bg-slate-200 dark:bg-steel-950 font-extrabold text-xs text-slate-600 dark:text-steel-300 shadow-2xs`} style={{ width: '84px', minWidth: '84px', maxWidth: '84px' }}>#</th>
        <th colSpan={12} className="px-3 py-2 border-r border-slate-300 dark:border-steel-800 text-slate-800 dark:text-steel-200">
          {t('pfmea.corporate.initialAnalysis', 'Análisis Inicial de Proceso y Evaluación de Riesgo (AIAG 4ta Ed. + IATF 16949)')}
        </th>
        <th colSpan={2} className="px-3 py-2 border-r border-slate-300 dark:border-steel-800 text-center bg-slate-200/90 dark:bg-steel-900/80 text-slate-800 dark:text-steel-200">
          {t('pfmea.corporate.mitigationPlan', 'Plan de Mitigación')}
        </th>
        <th colSpan={6} className="px-3 py-2 text-center bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 font-extrabold border-l border-blue-200 dark:border-blue-800">
          {t('pfmea.corporate.actionResults', 'Resultados de Acción (Action Results)')}
        </th>
      </tr>
      {/* Column Headers */}
      <tr className="text-[11px] font-bold bg-slate-100 dark:bg-steel-900 border-b border-slate-300 dark:border-steel-750 text-slate-800 dark:text-steel-100">
        <th className={`${PFMEA_TABLE_CONFIG.firstColumnWidth} px-1 py-2.5 text-center border-r border-slate-300 dark:border-steel-800 sticky left-0 z-40 bg-slate-100 dark:bg-steel-900 font-extrabold text-xs text-slate-600 dark:text-steel-300 shadow-2xs`} style={{ width: '84px', minWidth: '84px', maxWidth: '84px' }}>#</th>
        <th className="px-3 py-2.5 min-w-[180px] border-r border-slate-300 dark:border-steel-800">
          {t('pfmea.corporate.cols.requirements', 'Process Function / Requirements')}
        </th>
        <th className="px-3 py-2.5 min-w-[160px] border-r border-slate-300 dark:border-steel-800">
          {t('pfmea.corporate.cols.failureMode', 'Potential Failure Mode')}
        </th>
        <th className="px-3 py-2.5 min-w-[180px] border-r border-slate-300 dark:border-steel-800">
          {t('pfmea.corporate.cols.effects', 'Potential Effect(s) of Failure')}
        </th>
        <th className="px-2 py-2.5 w-10 text-center border-r border-slate-300 dark:border-steel-800 text-amber-800 dark:text-amber-400 font-extrabold" title="Severidad">
          {t('pfmea.corporate.cols.sev', 'Sev (S)')}
        </th>
        <th className="px-2 py-2.5 w-12 text-center border-r border-slate-300 dark:border-steel-800 text-purple-800 dark:text-purple-400 font-extrabold" title="Clasificación Especial">
          {t('pfmea.corporate.cols.class', 'Class')}
        </th>
        <th className="px-3 py-2.5 min-w-[180px] border-r border-slate-300 dark:border-steel-800">
          {t('pfmea.corporate.cols.causes', 'Potential Cause(s) / Mechanism(s)')}
        </th>
        <th className="px-2 py-2.5 w-10 text-center border-r border-slate-300 dark:border-steel-800 text-amber-800 dark:text-amber-400 font-extrabold" title="Ocurrencia">
          {t('pfmea.corporate.cols.occ', 'Occ (O)')}
        </th>
        <th className="px-3 py-2.5 min-w-[160px] border-r border-slate-300 dark:border-steel-800">
          {t('pfmea.corporate.cols.prevention', 'Current Process Controls (Prevention)')}
        </th>
        <th className="px-3 py-2.5 min-w-[160px] border-r border-slate-300 dark:border-steel-800">
          {t('pfmea.corporate.cols.detection', 'Current Process Controls (Detection)')}
        </th>
        <th className="px-2 py-2.5 w-10 text-center border-r border-slate-300 dark:border-steel-800 text-amber-800 dark:text-amber-400 font-extrabold" title="Detección">
          {t('pfmea.corporate.cols.det', 'Det (D)')}
        </th>
        <th className="px-2 py-2.5 w-14 text-center border-r border-slate-300 dark:border-steel-800 text-slate-900 dark:text-white font-extrabold" title="Action Priority AIAG & VDA">
          {t('pfmea.corporate.cols.ap', 'AP')}
        </th>
        <th className="px-2 py-2.5 w-14 text-center border-r border-slate-300 dark:border-steel-800 text-sky-800 dark:text-sky-400 font-extrabold" title="RPN = S x O x D">
          {t('pfmea.corporate.cols.rpn', 'RPN')}
        </th>
        <th className="px-3 py-2.5 min-w-[160px] border-r border-slate-300 dark:border-steel-800">
          {t('pfmea.corporate.cols.recommendedActions', 'Recommend Actions')}
        </th>
        <th className="px-3 py-2.5 min-w-[140px] border-r border-slate-300 dark:border-steel-800">
          {t('pfmea.corporate.cols.respAndDate', 'Responsibility & Target Date')}
        </th>
        <th className="px-3 py-2.5 min-w-[160px] border-r border-slate-300 dark:border-steel-800 bg-blue-50/90 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200">
          {t('pfmea.corporate.cols.actionTaken', 'Action Taken')}
        </th>
        <th className="px-2 py-2.5 w-10 text-center border-r border-slate-300 dark:border-steel-800 bg-blue-50/90 dark:bg-blue-950/40 text-amber-800 dark:text-amber-400 font-extrabold">
          {t('pfmea.corporate.cols.newSev', 'Sev')}
        </th>
        <th className="px-2 py-2.5 w-10 text-center border-r border-slate-300 dark:border-steel-800 bg-blue-50/90 dark:bg-blue-950/40 text-amber-800 dark:text-amber-400 font-extrabold">
          {t('pfmea.corporate.cols.newOcc', 'Occ')}
        </th>
        <th className="px-2 py-2.5 w-10 text-center border-r border-slate-300 dark:border-steel-800 bg-blue-50/90 dark:bg-blue-950/40 text-amber-800 dark:text-amber-400 font-extrabold">
          {t('pfmea.corporate.cols.newDet', 'Det')}
        </th>
        <th className="px-2 py-2.5 w-14 text-center border-r border-slate-300 dark:border-steel-800 bg-blue-50/90 dark:bg-blue-950/40 text-sky-800 dark:text-sky-400 font-extrabold">
          {t('pfmea.corporate.cols.newRpn', 'RPN')}
        </th>
        <th className="px-2 py-2.5 w-14 text-center bg-blue-50/90 dark:bg-blue-950/40 text-slate-900 dark:text-white font-extrabold">
          {t('pfmea.corporate.cols.newAp', 'AP')}
        </th>
      </tr>
    </thead>
  );

  return (
    <div className="flex flex-col w-full min-h-[500px] bg-white dark:bg-steel-950/80 rounded-xl border border-slate-200 dark:border-steel-800 shadow-xl overflow-hidden backdrop-blur-md relative">
      {/* Loading Overlay */}
      {isSaving && (
        <div className="absolute inset-0 z-50 bg-white/60 dark:bg-steel-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center">
          <div className="bg-white dark:bg-steel-900 border border-slate-200 dark:border-steel-700 shadow-2xl rounded-2xl px-8 py-6 flex flex-col items-center gap-3">
            <Loader2 className="w-9 h-9 text-blue-600 animate-spin" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {t('common.savingChanges', 'Guardando cambios...')}
            </span>
          </div>
        </div>
      )}

      {/* Corporate Operations List with Dedicated Lateral Scroll inside each Collapsible */}
      <div className="flex-1 flex flex-col divide-y divide-slate-200 dark:divide-steel-800">
        {validation.operations.length === 0 ? (
          <div className="py-16 text-center text-slate-500 dark:text-steel-400">
            <AlertCircle size={28} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">
              {t('pfmea.corporate.emptyRows', 'No hay registros cargados en este PFMEA ni operaciones en el diagrama de flujo.')}
            </p>
            {!isReadOnly && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  + {t('common.addRow', 'Añadir Fila')}
                </button>
              </div>
            )}
          </div>
        ) : (
          validation.operations.map((op) => {
            const isCollapsed = collapsedOps[op.opKey] !== undefined ? collapsedOps[op.opKey] : true;

            return (
              <div key={op.opKey} className="flex flex-col">
                {/* Operation Collapsible Banner (full-width) */}
                <PFMEAOperationBanner
                  operation={op}
                  isCollapsed={isCollapsed}
                  onToggleCollapse={() => toggleOpCollapse(op.opKey)}
                  onAddRow={() => handleAddRowForOperation(op.opTitle, op.step?.id)}
                  isReadOnly={isReadOnly}
                  isTableRow={false}
                />

                {/* Operation Collapsible Body with dedicated Lateral Scroll */}
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      key={`content-${op.opKey}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] }}
                      className="overflow-hidden"
                    >
                      {/* Lateral Scrollable Container for this Operation */}
                      <div data-worksheet-scroll className="max-h-[70vh] overflow-auto custom-scrollbar border-t border-slate-200 dark:border-steel-800 bg-slate-50/20 dark:bg-steel-950/20">
                        <table className="min-w-[2100px] w-full border-collapse text-left text-xs whitespace-normal">
                          <colgroup>
                            <col className={PFMEA_TABLE_CONFIG.firstColumnWidth} style={{ width: '84px', minWidth: '84px', maxWidth: '84px' }} />
                          </colgroup>
                          {renderCorporateHeaders()}
                          <tbody className="divide-y divide-slate-200 dark:divide-steel-800">
                            {op.rows.length === 0 ? (
                              <tr>
                                <td colSpan={21} className="py-6 text-center text-slate-500 dark:text-steel-400">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <p className="text-xs font-medium text-slate-600 dark:text-steel-400">
                                      {t('pfmea.corporate.noRowsForOp', 'No hay modos de falla registrados para esta operación.')}
                                    </p>
                                    {!isReadOnly && (
                                      <button
                                        type="button"
                                        onClick={() => handleAddRowForOperation(op.opTitle, op.step?.id)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-white dark:bg-steel-900 border border-blue-200 dark:border-blue-800 rounded-lg shadow-xs hover:border-blue-400 transition-all cursor-pointer"
                                      >
                                        <Plus size={13} />
                                        <span>{t('pfmea.worksheet.addRowToOpNamed', 'Añadir Fila a {{op}}', { op: op.opTitle })}</span>
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ) : (
                          <VirtualTableRows rows={op.rows} columns={21} renderRow={(row,virtualIndex,measure) => {
                            const globalIndex = rowIndex.get(row.id) ?? -1;
                            const rpn = calculateRpn(row.severity, row.occurrence, row.detection);
                            const newRpn = calculateRpn(row.new_severity, row.new_occurrence, row.new_detection);
                            const apStyle = getApBadgeColor(row.action_priority);
                            const newApStyle = getApBadgeColor(row.new_action_priority);

                            return (
                              <tr
                                ref={measure} data-index={virtualIndex}
                                key={`row-${row.id}`}
                                className="group/row hover:bg-blue-50/40 dark:hover:bg-steel-900/60 transition-colors text-slate-800 dark:text-steel-200 border-b border-slate-200 dark:border-steel-800/60 relative min-h-[48px]"
                              >
                                {/* Dedicated Sticky Left Row Index & Actions Column */}
                                <td
                                  className={`${PFMEA_TABLE_CONFIG.firstColumnWidth} px-1 py-1.5 text-center border-r border-slate-300 dark:border-steel-800 sticky left-0 z-40 bg-slate-100/90 dark:bg-steel-900/90 group-hover/row:bg-blue-100/90 dark:group-hover/row:bg-steel-800 transition-colors shadow-2xs overflow-hidden`}
                                  style={{ width: '84px', minWidth: '84px', maxWidth: '84px' }}
                                >
                                  <div className="flex items-center justify-center w-full min-w-0">
                                    <span className="text-[11px] font-mono font-extrabold text-slate-500 dark:text-steel-400 group-hover/row:hidden">
                                      #{globalIndex + 1}
                                    </span>
                                    {!isReadOnly && (
                                      <div className="hidden group-hover/row:flex items-center justify-center gap-0.5">
                                        <button
                                          type="button"
                                          onClick={() => handleInsertRow(globalIndex >= 0 ? globalIndex : 0)}
                                          title={t('common.insertRowBelow', 'Agregar Fila Debajo')}
                                          className="p-1 text-slate-600 dark:text-steel-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded transition-colors cursor-pointer"
                                        >
                                          <Plus size={13} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDuplicateRow(globalIndex >= 0 ? globalIndex : 0)}
                                          title={t('common.duplicateRow', 'Duplicar Fila')}
                                          className="p-1 text-slate-600 dark:text-steel-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded transition-colors cursor-pointer"
                                        >
                                          <Copy size={13} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteRow(row.id)}
                                          title={t('common.deleteRow', 'Eliminar Fila')}
                                          className="p-1 text-slate-600 dark:text-steel-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 rounded transition-colors cursor-pointer"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>

                    {/* Process Requirements */}
                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-steel-800/70 align-top">
                      <EditableCell
                        type="textarea"
                        value={row.function_process_step}
                        onSave={(val) => handleRowUpdate(row.id, 'function_process_step', String(val))}
                        isReadOnly={isReadOnly}
                        placeholder={t('pfmea.corporate.placeholders.requirements', 'Requisitos de función...')}
                      />
                    </td>

                    {/* Potential Failure Mode */}
                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-steel-800/70 align-top">
                      <EditableCell
                        type="textarea"
                        value={row.failure_mode}
                        onSave={(val) => handleRowUpdate(row.id, 'failure_mode', String(val))}
                        isReadOnly={isReadOnly}
                        placeholder={t('pfmea.corporate.placeholders.failureMode', 'Modo potencial de falla...')}
                      />
                    </td>

                    {/* Potential Effects */}
                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-steel-800/70 align-top">
                      <EditableCell
                        type="textarea"
                        value={row.failure_effect_plant}
                        onSave={(val) => handleRowUpdate(row.id, 'failure_effect_plant', String(val))}
                        isReadOnly={isReadOnly}
                        placeholder={t('pfmea.corporate.placeholders.effects', 'Efectos de falla...')}
                      />
                    </td>

                    {/* Severity (S) */}
                    <td className="px-1 py-1 border-r border-slate-200 dark:border-steel-800/70 text-center align-middle">
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => setSeverityModalRowId(row.id)}
                        className={`w-full py-2 font-bold rounded text-xs transition-colors cursor-pointer ${
                          row.severity ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 hover:bg-amber-200' : 'text-slate-400 bg-slate-50 dark:bg-steel-900/40 hover:bg-slate-100'
                        }`}
                      >
                        {row.severity || '-'}
                      </button>
                    </td>

                    {/* Special Characteristic (Class) */}
                    <td className="px-1 py-1 border-r border-slate-200 dark:border-steel-800/70 text-center align-middle">
                      <CriticalFlag
                        value={(row.special_characteristics === 'CC' || row.special_characteristics === 'SC') ? row.special_characteristics : 'none'}
                        onChange={(v) => handleRowUpdate(row.id, 'special_characteristics', v === 'none' ? '' : v)}
                        disabled={isReadOnly}
                      />
                    </td>

                    {/* Potential Causes */}
                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-steel-800/70 align-top">
                      <EditableCell
                        type="textarea"
                        value={row.failure_cause}
                        onSave={(val) => handleRowUpdate(row.id, 'failure_cause', String(val))}
                        isReadOnly={isReadOnly}
                        placeholder={t('pfmea.corporate.placeholders.causes', 'Causas de falla...')}
                      />
                    </td>

                    {/* Occurrence (O) */}
                    <td className="px-1 py-1 border-r border-slate-200 dark:border-steel-800/70 text-center align-middle">
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => setOccurrenceModalRowId(row.id)}
                        className={`w-full py-2 font-bold rounded text-xs transition-colors cursor-pointer ${
                          row.occurrence ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 hover:bg-amber-200' : 'text-slate-400 bg-slate-50 dark:bg-steel-900/40 hover:bg-slate-100'
                        }`}
                      >
                        {row.occurrence || '-'}
                      </button>
                    </td>

                    {/* Prevention Controls */}
                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-steel-800/70 align-top">
                      <EditableCell
                        type="textarea"
                        value={row.prevention_controls}
                        onSave={(val) => handleRowUpdate(row.id, 'prevention_controls', String(val))}
                        isReadOnly={isReadOnly}
                        placeholder={t('pfmea.corporate.placeholders.prevention', 'Controles de prevención...')}
                      />
                    </td>

                    {/* Detection Controls */}
                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-steel-800/70 align-top">
                      <EditableCell
                        type="textarea"
                        value={row.detection_controls}
                        onSave={(val) => handleRowUpdate(row.id, 'detection_controls', String(val))}
                        isReadOnly={isReadOnly}
                        placeholder={t('pfmea.corporate.placeholders.detection', 'Controles de detección...')}
                      />
                    </td>

                    {/* Detection (D) */}
                    <td className="px-1 py-1 border-r border-slate-200 dark:border-steel-800/70 text-center align-middle">
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => setDetectionModalRowId(row.id)}
                        className={`w-full py-2 font-bold rounded text-xs transition-colors cursor-pointer ${
                          row.detection ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 hover:bg-amber-200' : 'text-slate-400 bg-slate-50 dark:bg-steel-900/40 hover:bg-slate-100'
                        }`}
                      >
                        {row.detection || '-'}
                      </button>
                    </td>

                    {/* Action Priority (AP) */}
                    <td className="px-1 py-1 border-r border-slate-200 dark:border-steel-800/70 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => setApModalRowId(row.id)}
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-black border transition-all cursor-pointer ${apStyle.bg} ${apStyle.text} ${apStyle.border}`}
                      >
                        {row.action_priority || '-'}
                      </button>
                    </td>

                    {/* RPN = S x O x D */}
                    <td className="px-2 py-2 border-r border-slate-200 dark:border-steel-800/70 text-center font-mono font-bold text-sky-700 dark:text-sky-400 align-middle">
                      {rpn || '-'}
                    </td>

                    {/* Recommended Actions */}
                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-steel-800/70 align-top">
                      <EditableCell
                        type="textarea"
                        value={row.optimization_prevention_action}
                        onSave={(val) => handleRowUpdate(row.id, 'optimization_prevention_action', String(val))}
                        isReadOnly={isReadOnly}
                        placeholder={t('pfmea.corporate.placeholders.recommendedActions', 'Acciones recomendadas...')}
                      />
                    </td>

                    {/* Responsibility & Target Date */}
                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-steel-800/70 align-top space-y-1">
                      <select
                        value={row.responsible_person_id || ''}
                        disabled={isReadOnly}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            handleUpdateResponsible(row.id, null, '');
                          } else {
                            const numId = Number(val);
                            const member = header?.team_members?.find(m => m.user_id === numId);
                            handleUpdateResponsible(row.id, numId, member?.user_full_name || '');
                          }
                        }}
                        className="w-full bg-slate-50 dark:bg-steel-900/40 border border-slate-200 dark:border-steel-700/60 hover:border-slate-300 dark:hover:border-steel-600 focus:border-blue-500 focus:bg-white dark:focus:bg-steel-900 rounded p-1.5 text-[11px] text-slate-800 dark:text-steel-200 transition-all focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <option value="">{t('pfmea.corporate.placeholders.selectResponsible', '-- Seleccionar Responsable --')}</option>
                        {header?.team_members?.map((member) => (
                          <option key={member.user_id} value={member.user_id}>
                            {member.user_full_name || `Usuario #${member.user_id}`}{member.role_in_team ? ` (${member.role_in_team})` : ''} {member.is_active === false ? `[${t('common.archived', 'Archivado')}]` : ''}
                          </option>
                        ))}
                        {row.responsible_person_id && !header?.team_members?.some(m => m.user_id === row.responsible_person_id) && (
                          <option value={row.responsible_person_id}>
                            {row.responsible_person_name || `Usuario #${row.responsible_person_id}`}
                          </option>
                        )}
                      </select>
                      <EditableCell
                        type="date"
                        value={row.target_completion_date}
                        onSave={(val) => handleRowUpdate(row.id, 'target_completion_date', String(val))}
                        isReadOnly={isReadOnly}
                      />
                    </td>

                    {/* Action Taken */}
                    <td className="px-2 py-1.5 border-r border-slate-200 dark:border-steel-800/70 align-top bg-blue-50/30 dark:bg-blue-950/20">
                      <EditableCell
                        type="textarea"
                        value={row.actions_taken}
                        onSave={(val) => handleRowUpdate(row.id, 'actions_taken', String(val))}
                        isReadOnly={isReadOnly}
                        placeholder={t('pfmea.corporate.placeholders.actionsTaken', 'Acciones tomadas...')}
                      />
                    </td>

                    {/* New Sev */}
                    <td className="px-1 py-1 border-r border-slate-200 dark:border-steel-800/70 text-center align-middle bg-blue-50/30 dark:bg-blue-950/20">
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => setNewSeverityModalRowId(row.id)}
                        className={`w-full py-2 font-bold rounded text-xs transition-colors cursor-pointer ${
                          row.new_severity ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60' : 'text-slate-400 bg-white/60 dark:bg-steel-900/40'
                        }`}
                      >
                        {row.new_severity || '-'}
                      </button>
                    </td>

                    {/* New Occ */}
                    <td className="px-1 py-1 border-r border-slate-200 dark:border-steel-800/70 text-center align-middle bg-blue-50/30 dark:bg-blue-950/20">
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => setNewOccurrenceModalRowId(row.id)}
                        className={`w-full py-2 font-bold rounded text-xs transition-colors cursor-pointer ${
                          row.new_occurrence ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60' : 'text-slate-400 bg-white/60 dark:bg-steel-900/40'
                        }`}
                      >
                        {row.new_occurrence || '-'}
                      </button>
                    </td>

                    {/* New Det */}
                    <td className="px-1 py-1 border-r border-slate-200 dark:border-steel-800/70 text-center align-middle bg-blue-50/30 dark:bg-blue-950/20">
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => setNewDetectionModalRowId(row.id)}
                        className={`w-full py-2 font-bold rounded text-xs transition-colors cursor-pointer ${
                          row.new_detection ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60' : 'text-slate-400 bg-white/60 dark:bg-steel-900/40'
                        }`}
                      >
                        {row.new_detection || '-'}
                      </button>
                    </td>

                    {/* New RPN */}
                    <td className="px-2 py-2 border-r border-slate-200 dark:border-steel-800/70 text-center font-mono font-bold text-sky-700 dark:text-sky-400 align-middle bg-blue-50/30 dark:bg-blue-950/20">
                      {newRpn || '-'}
                    </td>

                    {/* New AP */}
                    <td className="px-1 py-1 text-center align-middle bg-blue-50/30 dark:bg-blue-950/20">
                      <button
                        type="button"
                        onClick={() => setNewApModalRowId(row.id)}
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-black border transition-all cursor-pointer ${newApStyle.bg} ${newApStyle.text} ${newApStyle.border}`}
                      >
                        {row.new_action_priority || '-'}
                      </button>
                    </td>
                  </tr>
                );
              }} />
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })
    )}
  </div>

      {/* Delete Confirmation Modal */}
      {rowToDelete !== null && (
        <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-steel-900 rounded-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-steel-700 shadow-2xl flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('common.deleteRowConfirm', '¿Eliminar fila de análisis?')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-steel-400">
              {t('common.deleteRowWarning', 'Esta acción eliminará permanentemente la fila y sus evaluaciones asociadas.')}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRowToDelete(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-steel-300 hover:bg-slate-100 dark:hover:bg-steel-800 transition-colors"
              >
                {t('common.cancel', 'Cancelar')}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors"
              >
                {t('common.delete', 'Eliminar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* S, O, D, AP Modals */}
      {activeRow && (
        <>
          <SeverityModal
            isOpen={severityModalRowId !== null}
            onClose={() => setSeverityModalRowId(null)}
            currentValue={activeRow.severity}
            onSelect={(val) => {
              if (severityModalRowId) handleRowUpdate(severityModalRowId, 'severity', val);
            }}
          />
          <OccurrenceModal
            isOpen={occurrenceModalRowId !== null}
            onClose={() => setOccurrenceModalRowId(null)}
            currentValue={activeRow.occurrence}
            onSelect={(val) => {
              if (occurrenceModalRowId) handleRowUpdate(occurrenceModalRowId, 'occurrence', val);
            }}
          />
          <DetectionModal
            isOpen={detectionModalRowId !== null}
            onClose={() => setDetectionModalRowId(null)}
            currentValue={activeRow.detection}
            onSelect={(val) => {
              if (detectionModalRowId) handleRowUpdate(detectionModalRowId, 'detection', val);
            }}
          />
          <ActionPriorityModal
            isOpen={apModalRowId !== null}
            onClose={() => setApModalRowId(null)}
            currentS={activeRow.severity}
            currentO={activeRow.occurrence}
            currentD={activeRow.detection}
          />

          <SeverityModal
            isOpen={newSeverityModalRowId !== null}
            onClose={() => setNewSeverityModalRowId(null)}
            currentValue={activeRow.new_severity}
            onSelect={(val) => {
              if (newSeverityModalRowId) handleRowUpdate(newSeverityModalRowId, 'new_severity', val);
            }}
          />
          <OccurrenceModal
            isOpen={newOccurrenceModalRowId !== null}
            onClose={() => setNewOccurrenceModalRowId(null)}
            currentValue={activeRow.new_occurrence}
            onSelect={(val) => {
              if (newOccurrenceModalRowId) handleRowUpdate(newOccurrenceModalRowId, 'new_occurrence', val);
            }}
          />
          <DetectionModal
            isOpen={newDetectionModalRowId !== null}
            onClose={() => setNewDetectionModalRowId(null)}
            currentValue={activeRow.new_detection}
            onSelect={(val) => {
              if (newDetectionModalRowId) handleRowUpdate(newDetectionModalRowId, 'new_detection', val);
            }}
          />
          <ActionPriorityModal
            isOpen={newApModalRowId !== null}
            onClose={() => setNewApModalRowId(null)}
            currentS={activeRow.new_severity}
            currentO={activeRow.new_occurrence}
            currentD={activeRow.new_detection}
          />
        </>
      )}
    </div>
  );
};
