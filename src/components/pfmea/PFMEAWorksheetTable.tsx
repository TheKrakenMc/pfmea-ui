import {VirtualTableRows} from './VirtualTableRows';
import {nextDraftRowId} from '../../utils/draftRowId';
import type { PfmeaHeader } from '../../api/pfmeaService';
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import type { WorksheetRow } from '../../api/pfmeaService';
import type { FlowchartStepRead } from '../../services/flowchartService';
import { AlertTriangle, Plus, Loader2, Layers, Trash2, X, Copy } from 'lucide-react';
import { SeverityModal } from './SeverityModal';
import { OccurrenceModal } from './OccurrenceModal';
import { DetectionModal } from './DetectionModal';
import { ActionPriorityModal } from './ActionPriorityModal';
import { calculateActionPriority } from '../../utils/apCalculator';
import { CriticalFlag } from '../flowchart/CriticalFlag';
import { PFMEAOperationBanner } from './PFMEAOperationBanner';
import { usePFMEAValidation } from '../../hooks/usePFMEAValidation';
import { PFMEA_TABLE_CONFIG, PFMEA_TEXTAREA_CONFIG } from './pfmeaTableConfig';

interface PFMEAWorksheetTableProps {
  pfmeaId: number;
  partNumber?: string;
  flowchartSteps: FlowchartStepRead[];
  rows: WorksheetRow[];
  onRowsChange?: (rows: WorksheetRow[]) => void;
  onSaveAll?: (rows: WorksheetRow[]) => void;
  isReadOnly: boolean;
  isSaving?: boolean;
  isHeaderDirty?: boolean;
  header?: PfmeaHeader;
  productData?: unknown;
}

const EditableCell: React.FC<{
  value: string | number | undefined;
  type?: 'text' | 'number' | 'date' | 'textarea';
  isReadOnly: boolean;
  onSave: (val: string | number) => void;
  className?: string;
  hasError?: boolean;
  maxLength?: number;
  rows?: number;
  minHeightClass?: string;
}> = ({
  value,
  type = 'text',
  isReadOnly,
  onSave,
  className,
  hasError,
  maxLength = PFMEA_TEXTAREA_CONFIG.defaultMaxLength,
  rows = PFMEA_TEXTAREA_CONFIG.defaultRows,
  minHeightClass = PFMEA_TEXTAREA_CONFIG.minHeightClass,
}) => {
  const [editing, setEditing] = useState<{source: string | number | null | undefined; draft: string | number}>(()=>({source:value,draft:value ?? ''}));
  const localVal = editing.source === value ? editing.draft : value ?? '';
  const setLocalVal = (draft: string | number) => {
    setEditing({source:value,draft});
    const parsed=type==='number' ? parseInt(String(draft),10) : draft;
    onSave(type==='number' && Number.isNaN(parsed) ? 0 : parsed);
  };

  const handleBlur = () => {
    if (localVal !== (value ?? '')) {
      const parsed = type === 'number' ? parseInt(localVal as string, 10) : localVal;
      onSave(parsed || (type === 'number' ? 0 : ''));
    }
  };

  const errorClass = hasError ? 'border-alert-red/80 bg-alert-red/10' : 'border-slate-200 dark:border-steel-700/60 bg-slate-50 dark:bg-steel-900/40';
  const baseClasses = `w-full ${errorClass} hover:border-slate-300 dark:hover:border-steel-600 focus:border-blue-500 focus:bg-white dark:focus:bg-steel-900 rounded p-1.5 text-xs text-slate-800 dark:text-steel-200 transition-all focus:outline-none disabled:opacity-50 ${className || ''}`;

  if (type === 'textarea') {
    return (
      <div className="relative w-full group">
        <textarea
          value={localVal}
          onChange={(e) => setLocalVal(e.target.value)}
          onBlur={handleBlur}
          disabled={isReadOnly}
          maxLength={maxLength}
          rows={rows}
          className={`${baseClasses} resize-y ${minHeightClass} pb-6`}
        />
        {maxLength && (
          <div className="absolute bottom-1 right-2 text-[10px] text-steel-500 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity pointer-events-none">
            {String(localVal).length}/{maxLength}
          </div>
        )}
      </div>
    );
  }

  return (
    <input
      type={type}
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={handleBlur}
      disabled={isReadOnly}
      maxLength={maxLength}
      className={baseClasses}
    />
  );
};

const WorkElementTags: React.FC<{
  value: string;
  onChange: (val: string) => void;
  isReadOnly: boolean;
  hasError: boolean;
}> = ({ value, onChange, isReadOnly, hasError }) => {
  const { t } = useTranslation();

  const main4M = [
    { id: 'Machine', label: t('pfmea.worksheet.options.4m.machine', 'Máquina') },
    { id: 'Manpower', label: t('pfmea.worksheet.options.4m.manpower', 'Mano de obra') },
    { id: 'Material', label: t('pfmea.worksheet.options.4m.material', 'Material') },
    { id: 'Environment', label: t('pfmea.worksheet.options.4m.environment', 'Medio ambiente') },
  ];
  const additional2M = [
    { id: 'Method', label: t('pfmea.worksheet.options.4m.method', 'Método') },
    { id: 'Measurement', label: t('pfmea.worksheet.options.4m.measurement', 'Medición') },
  ];

  const allTags = [...main4M, ...additional2M];

  // Helper to match existing values that might be stored in a specific language
  const getSelectedId = (val: string) => {
    if (!val) return '';
    if (allTags.some(t => t.id === val)) return val;

    const lowerVal = val.toLowerCase();
    if (lowerVal === 'máquina' || lowerVal === 'maquina') return 'Machine';
    if (lowerVal === 'mano de obra') return 'Manpower';
    if (lowerVal === 'material') return 'Material';
    if (lowerVal === 'medio ambiente') return 'Environment';
    if (lowerVal === 'método' || lowerVal === 'metodo') return 'Method';
    if (lowerVal === 'medición' || lowerVal === 'medicion') return 'Measurement';

    return val;
  };

  const selectedId = getSelectedId(value);

  if (isReadOnly) {
    const displayTag = allTags.find(t => t.id === selectedId);
    return <span className="text-sm text-black dark:text-white font-bold line-clamp-3">{displayTag ? displayTag.label : value}</span>;
  }

  const Tag = ({ id, label, isSelected }: { id: string, label: string, isSelected: boolean }) => (
    <button
      onClick={() => onChange(id)}
      type="button"
      className={`px-1.5 py-0.5 text-xs rounded transition-all border ${isSelected ? 'bg-slate-100/20 text-forge-400 border-forge-500/50 shadow-[0_0_8px_rgba(234,88,12,0.2)] font-bold' : 'bg-slate-100/40 text-steel-400 border-steel-700/50 hover:border-steel-500 hover:text-steel-200'}`}
    >
      {label}
    </button>
  );

  return (
    <div className={`flex flex-col gap-1 p-1 rounded ${hasError ? 'border border-alert-red/50 bg-alert-red/5' : ''}`}>
      <div className="flex items-start gap-1">
        <span className="text-[10px] font-bold text-steel-500 uppercase tracking-wider w-5 pt-0.5">4M</span>
        <div className="flex flex-wrap gap-1 flex-1">
          {main4M.map(m => <Tag key={m.id} id={m.id} label={m.label} isSelected={selectedId === m.id} />)}
        </div>
      </div>
      <div className="flex items-start gap-1">
        <span className="text-[10px] font-bold text-steel-500 uppercase tracking-wider w-5 pt-0.5">2M</span>
        <div className="flex flex-wrap gap-1 flex-1">
          {additional2M.map(m => <Tag key={m.id} id={m.id} label={m.label} isSelected={selectedId === m.id} />)}
        </div>
      </div>
    </div>
  );
};

export const PFMEAWorksheetTable: React.FC<PFMEAWorksheetTableProps> = ({
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

  const localRows = React.useMemo(() => rows || [], [rows]);
  const rowIndex=React.useMemo(()=>new Map(localRows.map((row,index)=>[row.id,index])),[localRows]);
  const setLocalRows = useCallback((update: WorksheetRow[] | ((previous: WorksheetRow[])=>WorksheetRow[])) => {
    const next = typeof update === 'function' ? update(localRows) : update;
    onRowsChange?.(next);
  }, [localRows, onRowsChange]);
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());
  const [rowToDelete, setRowToDelete] = useState<number | null>(null);
  const [severityModalRowId, setSeverityModalRowId] = useState<number | null>(null);
  const [occurrenceModalRowId, setOccurrenceModalRowId] = useState<number | null>(null);
  const [detectionModalRowId, setDetectionModalRowId] = useState<number | null>(null);
  const [apModalRowId, setApModalRowId] = useState<number | null>(null);

  const [newSeverityModalRowId, setNewSeverityModalRowId] = useState<number | null>(null);
  const [newOccurrenceModalRowId, setNewOccurrenceModalRowId] = useState<number | null>(null);
  const [newDetectionModalRowId, setNewDetectionModalRowId] = useState<number | null>(null);
  const [newApModalRowId, setNewApModalRowId] = useState<number | null>(null);



  const handleRowUpdate = useCallback((rowId: number | string, field: keyof WorksheetRow, value: WorksheetRow[keyof WorksheetRow]) => {
    setLocalRows(prev => {
      const next = prev.map(r => {
        if (r.id.toString() !== rowId.toString()) return r;

        const updatedRow = { ...r, [field]: value };

        // Auto-calculate AP if S, O, or D changes
        if (field === 'severity' || field === 'occurrence' || field === 'detection') {
          const newAP = calculateActionPriority(
            updatedRow.severity,
            updatedRow.occurrence,
            updatedRow.detection
          );
          updatedRow.action_priority = newAP;
        }

        // Auto-calculate new_AP if new_S, new_O, or new_D changes
        if (field === 'new_severity' || field === 'new_occurrence' || field === 'new_detection') {
          const newAP = calculateActionPriority(
            updatedRow.new_severity,
            updatedRow.new_occurrence,
            updatedRow.new_detection
          );
          updatedRow.new_action_priority = newAP;
        }

        return updatedRow;
      });

      return next;
    });
    // Clear error for this field if it existed
    setValidationErrors(prev => {
      const next = new Set(prev);
      next.delete(`${rowId}-${field}`);
      return next;
    });
  }, [setLocalRows]);

  const handleUpdateResponsible = useCallback((rowId: number | string, userId: number | null, userName: string) => {
    setLocalRows(prev => {
      const next = prev.map(r => {
        if (r.id.toString() !== rowId.toString()) return r;
        return {
          ...r,
          responsible_person_id: userId ?? undefined,
          responsible_person_name: userName,
        };
      });
      return next;
    });
    setValidationErrors(prev => {
      const next = new Set(prev);
      next.delete(`${rowId}-responsible_person_name`);
      return next;
    });
  }, [setLocalRows]);

  const handleAddRow = () => {
    let newRow: WorksheetRow;

    if (localRows.length === 0) {
      newRow = {
        id: nextDraftRowId(localRows),
        pfmea_id: pfmeaId,
        flowchart_step_id: undefined,
        process_item_name: partNumber || '',
        station_operation: '',
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
        sequence_order: 10
      };
    } else {
      const lastRow = localRows[localRows.length - 1];
      newRow = {
        id: nextDraftRowId(localRows),
        pfmea_id: lastRow.pfmea_id,
        flowchart_step_id: lastRow.flowchart_step_id,
        process_item_name: lastRow.process_item_name,
        station_operation: lastRow.station_operation,
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
        sequence_order: (lastRow.sequence_order || 0) + 5
      };
    }

    const nextRows = [...localRows, newRow];
    setLocalRows(nextRows);

  };

  const handleAddRowForOperation = (stationName: string, stepId?: number) => {
    // Find index of last row belonging to this operation
    const lastOpRowIndex = localRows
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => (stepId && r.flowchart_step_id === stepId) || r.station_operation === stationName)
      .pop()?.i;

    const newRow: WorksheetRow = {
      id: nextDraftRowId(localRows),
      pfmea_id: pfmeaId,
      flowchart_step_id: stepId,
      process_item_name: partNumber || localRows[0]?.process_item_name || '',
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
      sequence_order: (localRows.length > 0 ? (localRows[localRows.length - 1].sequence_order || 0) + 5 : 10)
    };

    let nextRows: WorksheetRow[];
    if (lastOpRowIndex !== undefined) {
      nextRows = [...localRows];
      nextRows.splice(lastOpRowIndex + 1, 0, newRow);
    } else {
      nextRows = [...localRows, newRow];
    }
    setLocalRows(nextRows);
  };

  // Local storage collapsed state per operation (default collapsed: true)
  const storageKey = `pfmea_vda_collapsed_ops_${pfmeaId}`;
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

  const validation = usePFMEAValidation(localRows, flowchartSteps, 'AIAG_VDA');

  const handleInsertRow = (index: number) => {
    const target = localRows[index];
    const newRow: WorksheetRow = {
      id: nextDraftRowId(localRows),
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

    setLocalRows(prev => {
      const copy = [...prev];
      copy.splice(index + 1, 0, newRow);
      onRowsChange?.(copy);
      return copy;
    });
  };

  const handleDuplicateRow = (index: number) => {
    const rowToClone = localRows[index];
    const newRow: WorksheetRow = {
      ...rowToClone,
      id: nextDraftRowId(localRows),
      sequence_order: (rowToClone.sequence_order || 0) + 1
    };

    setLocalRows(prev => {
      const copy = [...prev];
      copy.splice(index + 1, 0, newRow);
      onRowsChange?.(copy);
      return copy;
    });
  };

  const handleDeleteRow = (id: number) => {
    setRowToDelete(id);
  };

  const confirmDeleteRow = () => {
    if (rowToDelete !== null) {
      setLocalRows(prev => {
        const next = prev.filter(r => r.id !== rowToDelete);
        onRowsChange?.(next);
        return next;
      });
      setRowToDelete(null);
    }
  };



  const getTrafficLightBg = (value: number | undefined) => {
    if (!value) return 'text-green-700 dark:text-green-300 hover:bg-black/5 dark:hover:bg-white/5';
    if (value >= 7) return 'bg-alert-red text-white hover:bg-slate-100';
    if (value >= 4) return 'bg-slate-100 text-slate-900 hover:bg-slate-100';
    return 'bg-slate-100 text-white hover:bg-slate-100';
  };

  const getAPTrafficLightBg = (ap: string | undefined) => {
    if (!ap) return 'text-green-700 dark:text-green-300 hover:bg-black/5 dark:hover:bg-white/5';
    if (ap === 'H') return 'bg-alert-red text-white hover:bg-slate-100';
    if (ap === 'M') return 'bg-slate-100 text-slate-900 hover:bg-slate-100';
    if (ap === 'L') return 'bg-slate-100 text-white hover:bg-slate-100';
    return 'text-green-700 dark:text-green-300 hover:bg-black/5 dark:hover:bg-white/5';
  };

  const renderVdaHeaders = () => (
    <div className="sticky top-0 z-30 grid grid-cols-[84px_250px_250px_250px_250px_250px_250px_250px_250px_250px_80px_250px_250px_250px_80px_250px_80px_80px_80px_250px_250px_200px_140px_120px_250px_140px_80px_80px_80px_80px_80px_80px] bg-slate-100 dark:bg-slate-100/80 border-b border-steel-400 dark:border-steel-600">
      {/* Sticky Row Index Header */}
      <div className={`sticky left-0 z-40 ${PFMEA_TABLE_CONFIG.firstColumnWidth} bg-slate-200 dark:bg-steel-800 border-r border-slate-300 dark:border-steel-700 flex items-center justify-center font-extrabold text-slate-600 dark:text-steel-300 text-xs shadow-2xs`}>#</div>

      {/* AIAG&VDA Steps & Header Groups */}
      <div className="col-span-3 border-r border-steel-400 dark:border-steel-600 bg-slate-100 dark:bg-slate-100/20 flex flex-col">
        <div className="px-3 py-1.5 border-b border-blue-200 dark:border-blue-500/30 text-center bg-slate-100 dark:bg-slate-100/40">
          <div className="text-sm font-bold tracking-widest text-blue-700 dark:text-blue-400 uppercase">{t('pfmea.worksheet.steps.step2', 'Paso 2')}</div>
          <div className="text-xs text-blue-600 dark:text-blue-300/70 truncate mt-0.5">{t('pfmea.worksheet.steps.step2Desc', 'Análisis de Estructura')}</div>
        </div>
      </div>

      <div className="col-span-5 border-r border-steel-400 dark:border-steel-600 bg-slate-100 dark:bg-slate-100/20 flex flex-col">
        <div className="px-3 py-1.5 border-b border-emerald-200 dark:border-emerald-500/30 text-center bg-slate-100 dark:bg-slate-100/40">
          <div className="text-sm font-bold tracking-widest text-emerald-700 dark:text-emerald-400 uppercase">{t('pfmea.worksheet.steps.step3', 'Paso 3')}</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-300/70 truncate mt-0.5">{t('pfmea.worksheet.steps.step3Desc', 'Análisis de Función')}</div>
        </div>
      </div>

      <div className="col-span-4 border-r border-steel-400 dark:border-steel-600 bg-slate-100 dark:bg-slate-100/20 flex flex-col">
        <div className="px-3 py-1.5 border-b border-rose-200 dark:border-rose-500/30 text-center bg-slate-100 dark:bg-slate-100/40">
          <div className="text-sm font-bold tracking-widest text-rose-700 dark:text-rose-400 uppercase">{t('pfmea.worksheet.steps.step4', 'Paso 4')}</div>
          <div className="text-xs text-rose-600 dark:text-rose-300/70 truncate mt-0.5">{t('pfmea.worksheet.steps.step4Desc', 'Análisis de Falla')}</div>
        </div>
      </div>

      <div className="col-span-6 border-r border-steel-400 dark:border-steel-600 bg-slate-100 dark:bg-slate-100/20 flex flex-col">
        <div className="px-3 py-1.5 border-b border-amber-200 dark:border-amber-500/30 text-center bg-slate-100 dark:bg-slate-100/40">
          <div className="text-sm font-bold tracking-widest text-amber-800 dark:text-amber-400 uppercase">{t('pfmea.worksheet.steps.step5', 'Paso 5')}</div>
          <div className="text-xs text-amber-700 dark:text-amber-300/70 truncate mt-0.5">{t('pfmea.worksheet.steps.step5Desc', 'Análisis de Riesgo')}</div>
        </div>
      </div>

      <div className="col-span-13 bg-slate-100 dark:bg-slate-100/20 flex flex-col border-r border-steel-400 dark:border-steel-600">
        <div className="px-3 py-1.5 border-b border-teal-200 dark:border-teal-500/30 text-center bg-slate-100 dark:bg-slate-100/40">
          <div className="text-sm font-bold tracking-widest text-teal-800 dark:text-teal-400 uppercase">{t('pfmea.worksheet.steps.step6', 'Paso 6')}</div>
          <div className="text-xs text-teal-700 dark:text-teal-300/70 truncate mt-0.5">{t('pfmea.worksheet.steps.step6Desc', 'Optimización')}</div>
        </div>
      </div>

      {/* Sub Headers */}
      {[
        { text: '#', className: `sticky left-0 z-40 ${PFMEA_TABLE_CONFIG.firstColumnWidth} bg-slate-200 dark:bg-steel-800 text-slate-700 dark:text-steel-200 font-extrabold text-center border-r border-steel-400 dark:border-steel-600` },
        { text: t('pfmea.worksheet.columns.processItem', '1. Elemento de Proceso'), className: 'bg-slate-100 dark:bg-slate-100/30 text-black dark:text-white font-bold' },
        { text: t('pfmea.worksheet.columns.station', '2. Estación'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold' },
        { text: t('pfmea.worksheet.columns.workElement', '3. Elemento de Trabajo (4M)'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold' },
        { text: t('pfmea.worksheet.columns.functionItemPlant', '1. Función del elemento del proceso, función del sistema, elemento de la parte'), className: 'bg-slate-100 dark:bg-slate-100/30 text-black dark:text-white font-bold' },
        { text: t('pfmea.worksheet.columns.functionStepProduct', '2.a Función del paso del proceso'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold' },
        { text: t('pfmea.worksheet.columns.productCharacteristic', '2.b Características del producto (Si aplica)'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold' },
        { text: t('pfmea.worksheet.columns.functionWorkElementChar', '3.a Función del elemento de trabajo del proceso'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold' },
        { text: t('pfmea.worksheet.columns.processCharacteristic', '3.b Características del proceso (Si aplica)'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold' },
        { text: t('pfmea.worksheet.columns.failureEffectCol', '1. Efectos de falla (FE) en el elemento del siguiente nivel superior y/o usuario final'), className: 'bg-slate-100 dark:bg-slate-100/30 text-black dark:text-white font-bold' },
        { text: t('pfmea.worksheet.columns.severity', '(S)'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold', rotate: true },
        { text: t('pfmea.worksheet.columns.failureModeCol', '2. Modo de falla (FM) del elemento de enfoque'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold' },
        { text: t('pfmea.worksheet.columns.failureCauseCol', '3. Causa de la falla (FC) del elemento de trabajo'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold' },
        { text: t('pfmea.worksheet.columns.prevention', 'Control actual de prevención (PC) de FC'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold' },
        { text: t('pfmea.worksheet.columns.occurrence', 'Ocurrencia (O) de FC'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold', rotate: true },
        { text: t('pfmea.worksheet.columns.detectionCtrl', 'Controles actuales de detección (DC) de FC o FM'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold' },
        { text: t('pfmea.worksheet.columns.detection', 'Detección (D) de FC/FM'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold', rotate: true },
        { text: t('pfmea.worksheet.columns.ap', 'PFMEA AP'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold', rotate: true },
        { text: t('pfmea.worksheet.columns.specialCharacteristics', 'Características especiales'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold', rotate: true },
        { text: t('pfmea.worksheet.columns.optPrevention', 'Acción de prevención'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold' },
        { text: t('pfmea.worksheet.columns.optDetection', 'Acción de detección'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold' },
        { text: t('pfmea.worksheet.columns.optResponsible', 'Nombre de la persona responsable'), className: 'bg-slate-100 dark:bg-slate-100/80 text-black dark:text-white font-bold' },
        { text: t('pfmea.worksheet.columns.optTargetDate', 'Fecha límite de finalización'), className: 'bg-slate-100 dark:bg-slate-100/80 text-black dark:text-white font-bold' },
        { text: t('pfmea.worksheet.columns.optStatus', 'Estatus'), className: 'bg-slate-100 dark:bg-slate-100/80 text-black dark:text-white font-bold' },
        { text: t('pfmea.worksheet.columns.optActionsTaken', 'Acción tomada con prueba de evidencia'), className: 'bg-slate-100 dark:bg-slate-100/80 text-black dark:text-white font-bold' },
        { text: t('pfmea.worksheet.columns.optCompletionDate', 'Fecha de termino'), className: 'bg-slate-100 dark:bg-slate-100/80 text-black dark:text-white font-bold' },
        { text: t('pfmea.worksheet.columns.optSeverity', '(S)'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold', rotate: true },
        { text: t('pfmea.worksheet.columns.optOccurrence', '(O)'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold', rotate: true },
        { text: t('pfmea.worksheet.columns.optDetectionVal', '(D)'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold', rotate: true },
        { text: t('pfmea.worksheet.columns.optSpecialCharacteristics', 'Características especiales'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold', rotate: true },
        { text: t('pfmea.worksheet.columns.optAP', 'PFMEA AP'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold', rotate: true },
        { text: t('pfmea.worksheet.columns.optObservations', 'Observaciones'), className: 'bg-slate-100 dark:bg-slate-100/40 text-black dark:text-white font-bold', rotate: true },
      ].map((col, i) => (
        <div key={i} className={`px-3 py-2 border-r border-t border-steel-400 dark:border-steel-600 text-xs flex items-center justify-center text-center ${col.className || 'font-semibold'}`}>
          {col.text}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-4 relative w-full">
      {/* Loading Overlay */}
      {isSaving && (
        <div className="absolute inset-0 z-[100] bg-slate-100/40 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-xl pointer-events-auto">
          <div className="bg-slate-100 border border-steel-700 shadow-2xl rounded-2xl px-8 py-6 flex flex-col items-center gap-4 sticky top-[30vh]">
            <Loader2 className="w-10 h-10 text-forge-500 animate-spin" />
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-1">{t('common.savingChanges', 'Guardando cambios...')}</h3>
              <p className="text-sm text-steel-400">{t('common.pleaseWait', 'Por favor, espera mientras el servidor responde.')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white dark:bg-steel-950/80 rounded-xl border border-slate-200 dark:border-steel-800 shadow-xl overflow-hidden min-h-[500px] backdrop-blur-md flex flex-col w-full">
        {validation.operations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-slate-100/20">
            <div className="w-16 h-16 bg-slate-100/50 rounded-full flex items-center justify-center mb-5 border border-steel-700">
              <Layers className="w-8 h-8 text-steel-400" />
            </div>
            <h3 className="text-lg font-bold text-steel-200 mb-2">
              {t('pfmea.worksheet.emptySyncTitle', 'Aún no hay pasos de análisis')}
            </h3>
            <p className="text-sm text-steel-400 max-w-md leading-relaxed mb-6">
              {t('pfmea.worksheet.emptySyncDesc', 'El documento está vacío. Comienza a crearlo añadiendo una nueva fila de análisis.')}
            </p>
            {!isReadOnly && (
              <button
                onClick={handleAddRow}
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg font-medium transition-all cursor-pointer"
              >
                <Plus size={18} />
                {t('common.addRow', 'Añadir Fila')}
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col divide-y divide-slate-200 dark:divide-steel-800">
            {validation.operations.map((op) => {
              const isCollapsed = collapsedOps[op.opKey] !== undefined ? collapsedOps[op.opKey] : true;

              return (
                <div key={op.opKey} className="flex flex-col">
                  {/* Collapsible Banner with unified design (full width) */}
                  <PFMEAOperationBanner
                    operation={op}
                    isCollapsed={isCollapsed}
                    onToggleCollapse={() => toggleOpCollapse(op.opKey)}
                    onAddRow={() => handleAddRowForOperation(op.opTitle, op.step?.id)}
                    isReadOnly={isReadOnly}
                    isTableRow={false}
                  />

                  {/* Animated Collapsible Container with dedicated Lateral Scroll */}
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
                        {/* Dedicated Lateral Scroll for this Operation */}
                        <div data-worksheet-scroll className="max-h-[70vh] overflow-auto custom-scrollbar border-t border-slate-200 dark:border-steel-800 bg-slate-50/20 dark:bg-steel-950/20 pb-3 pr-8">
                          <div className="min-w-[5718px]">
                            {renderVdaHeaders()}
                            {op.rows.length === 0 ? (
                              <div className="py-6 px-4 bg-slate-50/50 dark:bg-steel-900/30 flex flex-col items-center justify-center gap-2">
                                <p className="text-xs font-medium text-slate-600 dark:text-steel-400">
                                  {t('pfmea.worksheet.noRowsForOp', 'No hay modos de falla registrados para esta operación.')}
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
                            ) : (
                              <div className="divide-y divide-slate-200 dark:divide-steel-800">
                                <VirtualTableRows mode="div" columns={32} rows={op.rows} renderRow={(row,rowIdxInOp,measure) => {
                              const index = rowIndex.get(row.id) ?? -1;
                              return (

                    <div key={row.id} ref={measure} data-index={rowIdxInOp} className="group relative flex transition-colors hover:bg-blue-50/40 dark:hover:bg-steel-900/60 bg-white dark:bg-steel-950/40 border-b border-slate-200 dark:border-steel-800/60 min-h-[48px]">
                      {/* Hover Highlight Overlay */}
                      <div className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 bg-blue-500/5 dark:bg-blue-400/5 ring-1 ring-inset ring-blue-500/30 transition-all duration-200" />

                      <div className="flex-1 grid grid-cols-[84px_250px_250px_250px_250px_250px_250px_250px_250px_250px_80px_250px_250px_250px_80px_250px_80px_80px_80px_250px_250px_200px_140px_120px_250px_140px_80px_80px_80px_80px_80px_250px]">
                        {/* Dedicated Sticky Left Row Index & Actions Column */}
                        <div className={`sticky left-0 z-40 ${PFMEA_TABLE_CONFIG.firstColumnWidth} bg-slate-100/90 dark:bg-steel-900/90 border-r border-steel-300 dark:border-steel-700 flex items-center justify-center group-hover:bg-blue-100/90 dark:group-hover:bg-steel-800 transition-colors shadow-2xs overflow-hidden`}>
                          <span className="text-[11px] font-mono font-extrabold text-slate-500 dark:text-steel-400 group-hover:hidden">
                            #{rowIdxInOp + 1}
                          </span>
                          {!isReadOnly && (
                            <div className="hidden group-hover:flex items-center justify-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => handleInsertRow(index)}
                                title="Agregar Fila Debajo"
                                className="p-1 text-slate-600 dark:text-steel-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded transition-colors cursor-pointer"
                              >
                                <Plus size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicateRow(index)}
                                title="Duplicar Fila"
                                className="p-1 text-slate-600 dark:text-steel-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded transition-colors cursor-pointer"
                              >
                                <Copy size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(row.id)}
                                title="Eliminar Fila"
                                className="p-1 text-slate-600 dark:text-steel-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Structure Analysis */}
                        <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/20 flex items-center">
                          <span className="text-sm text-black dark:text-white font-bold line-clamp-3">{row.process_item_name}</span>
                        </div>
                  <div className="px-3 py-2 border-r border-slate-200 dark:border-steel-800 bg-slate-50/60 dark:bg-steel-900/30 flex items-center">
                    {(() => {
                      const matchedStep = row.flowchart_step_id
                        ? flowchartSteps.find(s => s.id === row.flowchart_step_id)
                        : flowchartSteps.find(s => `[OP ${s.step_number}] ${s.technology?.name || s.responsible_department || 'Assembly'}` === row.station_operation);

                      const displayLabel = matchedStep
                        ? `[OP ${matchedStep.step_number}] ${matchedStep.technology?.name || matchedStep.responsible_department || 'Assembly'}`
                        : (row.station_operation || '-');

                      return (
                        <span className="text-xs font-bold text-slate-800 dark:text-steel-200 line-clamp-2">
                          {displayLabel}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/20">
                    <WorkElementTags
                      value={row.work_element_process || ''}
                      onChange={(val) => handleRowUpdate(row.id, 'work_element_process', val)}
                      isReadOnly={isReadOnly}
                      hasError={validationErrors.has(`${row.id}-work_element_process`)}
                    />
                  </div>

                  {/* Function Analysis */}
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/20 flex flex-col gap-2">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[9px] font-bold text-steel-400 dark:text-steel-400 uppercase tracking-wider">{t('pfmea.worksheet.labels.plantInternal', 'Planta (Interno)')}</label>
                      <EditableCell
                        type="textarea"
                        maxLength={PFMEA_TEXTAREA_CONFIG.compactMaxLength}
                        rows={PFMEA_TEXTAREA_CONFIG.stackedRows}
                        minHeightClass={PFMEA_TEXTAREA_CONFIG.stackedMinHeightClass}
                        value={row.function_process_item_plant}
                        onSave={(v) => handleRowUpdate(row.id, 'function_process_item_plant', String(v))}
                        isReadOnly={isReadOnly}
                        hasError={validationErrors.has(`${row.id}-function_process_item_plant`)}
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[9px] font-bold text-steel-400 dark:text-steel-400 uppercase tracking-wider">{t('pfmea.worksheet.labels.customerPlant', 'Planta de cliente')}</label>
                      <EditableCell
                        type="textarea"
                        maxLength={PFMEA_TEXTAREA_CONFIG.compactMaxLength}
                        rows={PFMEA_TEXTAREA_CONFIG.stackedRows}
                        minHeightClass={PFMEA_TEXTAREA_CONFIG.stackedMinHeightClass}
                        value={row.function_process_item_customer}
                        onSave={(v) => handleRowUpdate(row.id, 'function_process_item_customer', String(v))}
                        isReadOnly={isReadOnly}
                        hasError={validationErrors.has(`${row.id}-function_process_item_customer`)}
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[9px] font-bold text-steel-400 dark:text-steel-400 uppercase tracking-wider">{t('pfmea.worksheet.labels.endUser', 'Usuario final')}</label>
                      <EditableCell
                        type="textarea"
                        maxLength={PFMEA_TEXTAREA_CONFIG.compactMaxLength}
                        rows={PFMEA_TEXTAREA_CONFIG.stackedRows}
                        minHeightClass={PFMEA_TEXTAREA_CONFIG.stackedMinHeightClass}
                        value={row.function_process_item_end_user}
                        onSave={(v) => handleRowUpdate(row.id, 'function_process_item_end_user', String(v))}
                        isReadOnly={isReadOnly}
                        hasError={validationErrors.has(`${row.id}-function_process_item_end_user`)}
                      />
                    </div>
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/20">
                    <EditableCell
                      type="textarea"
                      rows={PFMEA_TEXTAREA_CONFIG.defaultRows}
                      maxLength={PFMEA_TEXTAREA_CONFIG.defaultMaxLength}
                      value={row.function_process_step}
                      onSave={(v) => handleRowUpdate(row.id, 'function_process_step', String(v))}
                      isReadOnly={isReadOnly}
                      hasError={validationErrors.has(`${row.id}-function_process_step`)}
                    />
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/20">
                    <EditableCell
                      type="textarea"
                      rows={PFMEA_TEXTAREA_CONFIG.defaultRows}
                      maxLength={PFMEA_TEXTAREA_CONFIG.defaultMaxLength}
                      value={row.product_characteristic}
                      onSave={(v) => handleRowUpdate(row.id, 'product_characteristic', String(v))}
                      isReadOnly={isReadOnly}
                      hasError={validationErrors.has(`${row.id}-product_characteristic`)}
                    />
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/20">
                    <EditableCell
                      type="textarea"
                      rows={PFMEA_TEXTAREA_CONFIG.defaultRows}
                      maxLength={PFMEA_TEXTAREA_CONFIG.defaultMaxLength}
                      value={row.function_work_element}
                      onSave={(v) => handleRowUpdate(row.id, 'function_work_element', String(v))}
                      isReadOnly={isReadOnly}
                      hasError={validationErrors.has(`${row.id}-function_work_element`)}
                    />
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/20">
                    <EditableCell
                      type="textarea"
                      rows={PFMEA_TEXTAREA_CONFIG.defaultRows}
                      maxLength={PFMEA_TEXTAREA_CONFIG.defaultMaxLength}
                      value={row.process_characteristic}
                      onSave={(v) => handleRowUpdate(row.id, 'process_characteristic', String(v))}
                      isReadOnly={isReadOnly}
                      hasError={validationErrors.has(`${row.id}-process_characteristic`)}
                    />
                  </div>

                  {/* Failure Analysis */}
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/20 flex flex-col gap-2">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[9px] font-bold text-steel-400 dark:text-steel-400 uppercase tracking-wider">{t('pfmea.worksheet.labels.plantInternal', 'Planta (Interno)')}</label>
                      <EditableCell
                        type="textarea"
                        maxLength={PFMEA_TEXTAREA_CONFIG.compactMaxLength}
                        rows={PFMEA_TEXTAREA_CONFIG.stackedRows}
                        minHeightClass={PFMEA_TEXTAREA_CONFIG.stackedMinHeightClass}
                        value={row.failure_effect_plant}
                        onSave={(v) => handleRowUpdate(row.id, 'failure_effect_plant', String(v))}
                        isReadOnly={isReadOnly}
                        hasError={validationErrors.has(`${row.id}-failure_effect_plant`)}
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[9px] font-bold text-steel-400 dark:text-steel-400 uppercase tracking-wider">{t('pfmea.worksheet.labels.customerPlant', 'Planta de cliente')}</label>
                      <EditableCell
                        type="textarea"
                        maxLength={PFMEA_TEXTAREA_CONFIG.compactMaxLength}
                        rows={PFMEA_TEXTAREA_CONFIG.stackedRows}
                        minHeightClass={PFMEA_TEXTAREA_CONFIG.stackedMinHeightClass}
                        value={row.failure_effect_customer}
                        onSave={(v) => handleRowUpdate(row.id, 'failure_effect_customer', String(v))}
                        isReadOnly={isReadOnly}
                        hasError={validationErrors.has(`${row.id}-failure_effect_customer`)}
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[9px] font-bold text-steel-400 dark:text-steel-400 uppercase tracking-wider">{t('pfmea.worksheet.labels.endUser', 'Usuario final')}</label>
                      <EditableCell
                        type="textarea"
                        maxLength={PFMEA_TEXTAREA_CONFIG.compactMaxLength}
                        rows={PFMEA_TEXTAREA_CONFIG.stackedRows}
                        minHeightClass={PFMEA_TEXTAREA_CONFIG.stackedMinHeightClass}
                        value={row.failure_effect_end_user}
                        onSave={(v) => handleRowUpdate(row.id, 'failure_effect_end_user', String(v))}
                        isReadOnly={isReadOnly}
                        hasError={validationErrors.has(`${row.id}-failure_effect_end_user`)}
                      />
                    </div>
                  </div>
                  <div className="px-0 py-0 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/20 text-center flex items-center justify-center relative">
                    <button
                      onClick={() => !isReadOnly && setSeverityModalRowId(row.id)}
                      disabled={isReadOnly}
                      type="button"
                      className={`relative w-full h-full min-h-[40px] flex items-center justify-center font-bold transition-colors group/sev ${getTrafficLightBg(row.severity)} ${validationErrors.has(`${row.id}-severity`) ? 'border-2 border-alert-red/80' : ''}`}
                    >
                      {row.severity || '-'}
                      {!isReadOnly && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/sev:opacity-100 bg-black/10 dark:bg-white/10 text-black dark:text-white backdrop-blur-[1px] transition-opacity">
                          <span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-100 rounded shadow-sm border border-steel-200 dark:border-steel-600">
                            {t('common.select', 'Seleccionar')}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/20">
                    <EditableCell
                      type="textarea"
                      rows={PFMEA_TEXTAREA_CONFIG.defaultRows}
                      maxLength={PFMEA_TEXTAREA_CONFIG.defaultMaxLength}
                      value={row.failure_mode}
                      onSave={(v) => handleRowUpdate(row.id, 'failure_mode', String(v))}
                      isReadOnly={isReadOnly}
                      hasError={validationErrors.has(`${row.id}-failure_mode`)}
                    />
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/20">
                    <EditableCell
                      type="textarea"
                      rows={PFMEA_TEXTAREA_CONFIG.defaultRows}
                      maxLength={PFMEA_TEXTAREA_CONFIG.defaultMaxLength}
                      value={row.failure_cause}
                      onSave={(v) => handleRowUpdate(row.id, 'failure_cause', String(v))}
                      isReadOnly={isReadOnly}
                      hasError={validationErrors.has(`${row.id}-failure_cause`)}
                    />
                  </div>

                  {/* Risk Analysis */}
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/10">
                    <EditableCell
                      type="textarea"
                      rows={PFMEA_TEXTAREA_CONFIG.defaultRows}
                      maxLength={PFMEA_TEXTAREA_CONFIG.defaultMaxLength}
                      value={row.prevention_controls}
                      onSave={(v) => handleRowUpdate(row.id, 'prevention_controls', String(v))}
                      isReadOnly={isReadOnly}
                      hasError={validationErrors.has(`${row.id}-prevention_controls`)}
                    />
                  </div>
                  <div className="px-0 py-0 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/20 text-center flex items-center justify-center relative">
                    <button
                      onClick={() => !isReadOnly && setOccurrenceModalRowId(row.id)}
                      disabled={isReadOnly}
                      type="button"
                      className={`relative w-full h-full min-h-[40px] flex items-center justify-center font-bold transition-colors group/occ ${getTrafficLightBg(row.occurrence)} ${validationErrors.has(`${row.id}-occurrence`) ? 'border-2 border-alert-red/80' : ''}`}
                    >
                      {row.occurrence || '-'}
                      {!isReadOnly && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/occ:opacity-100 bg-black/10 dark:bg-white/10 text-black dark:text-white backdrop-blur-[1px] transition-opacity">
                          <span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-100 rounded shadow-sm border border-steel-200 dark:border-steel-600">
                            {t('common.select', 'Seleccionar')}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/10">
                    <EditableCell
                      type="textarea"
                      rows={PFMEA_TEXTAREA_CONFIG.defaultRows}
                      maxLength={PFMEA_TEXTAREA_CONFIG.defaultMaxLength}
                      value={row.detection_controls}
                      onSave={(v) => handleRowUpdate(row.id, 'detection_controls', String(v))}
                      isReadOnly={isReadOnly}
                      hasError={validationErrors.has(`${row.id}-detection_controls`)}
                    />
                  </div>
                  <div className="px-0 py-0 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/20 text-center flex items-center justify-center relative">
                    <button
                      onClick={() => !isReadOnly && setDetectionModalRowId(row.id)}
                      disabled={isReadOnly}
                      type="button"
                      className={`relative w-full h-full min-h-[40px] flex items-center justify-center font-bold transition-colors group/det ${getTrafficLightBg(row.detection)} ${validationErrors.has(`${row.id}-detection`) ? 'border-2 border-alert-red/80' : ''}`}
                    >
                      {row.detection || '-'}
                      {!isReadOnly && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/det:opacity-100 bg-black/10 dark:bg-white/10 text-black dark:text-white backdrop-blur-[1px] transition-opacity">
                          <span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-100 rounded shadow-sm border border-steel-200 dark:border-steel-600">
                            {t('common.select', 'Seleccionar')}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="px-0 py-0 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/20 text-center flex items-center justify-center relative">
                    <button
                      onClick={() => !isReadOnly && setApModalRowId(row.id)}
                      disabled={isReadOnly}
                      type="button"
                      className={`relative w-full h-full min-h-[40px] flex items-center justify-center font-black text-lg transition-colors group/ap ${getAPTrafficLightBg(row.action_priority)}`}
                    >
                      {row.action_priority || '-'}
                      {!isReadOnly && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/ap:opacity-100 bg-black/10 dark:bg-white/10 text-black dark:text-white backdrop-blur-[1px] transition-opacity">
                          <span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-100 rounded shadow-sm border border-steel-200 dark:border-steel-600">
                            {t('common.view', 'Ver')}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/20 flex flex-col items-center justify-center">
                    <CriticalFlag
                      value={(row.special_characteristics === 'CC' || row.special_characteristics === 'SC') ? row.special_characteristics : 'none'}
                      onChange={(v) => handleRowUpdate(row.id, 'special_characteristics', v === 'none' ? '' : v)}
                      disabled={isReadOnly}
                    />
                    {validationErrors.has(`${row.id}-special_characteristics`) && (
                      <span className="text-[10px] text-red-500 mt-1">{t('common.required', 'Requerido')}</span>
                    )}
                  </div>

                  {/* Optimization (Step 6) */}
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/10">
                    <EditableCell rows={PFMEA_TEXTAREA_CONFIG.defaultRows} minHeightClass={PFMEA_TEXTAREA_CONFIG.minHeightClass} type="textarea" maxLength={PFMEA_TEXTAREA_CONFIG.defaultMaxLength} value={row.optimization_prevention_action} onSave={(v) => handleRowUpdate(row.id, 'optimization_prevention_action', String(v))} isReadOnly={isReadOnly} hasError={validationErrors.has(`${row.id}-optimization_prevention_action`)} />
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/10">
                    <EditableCell rows={PFMEA_TEXTAREA_CONFIG.defaultRows} minHeightClass={PFMEA_TEXTAREA_CONFIG.minHeightClass} type="textarea" maxLength={PFMEA_TEXTAREA_CONFIG.defaultMaxLength} value={row.optimization_detection_action} onSave={(v) => handleRowUpdate(row.id, 'optimization_detection_action', String(v))} isReadOnly={isReadOnly} hasError={validationErrors.has(`${row.id}-optimization_detection_action`)} />
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-white/50 dark:bg-slate-100/40 flex items-center">
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
                      className={`w-full bg-slate-100/40 dark:bg-slate-100/30 border ${validationErrors.has(`${row.id}-responsible_person_name`) ? 'border-red-500' : 'border-steel-700/50 hover:border-steel-500'} focus:border-forge-500 focus:ring-1 focus:ring-forge-500 rounded px-1 py-1 text-sm text-steel-100 focus:outline-none disabled:opacity-50`}
                    >
                      <option value="">{t('common.select', 'Seleccionar...')}</option>
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
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-white/50 dark:bg-slate-100/40">
                    <EditableCell type="date" value={row.target_completion_date} onSave={(v) => handleRowUpdate(row.id, 'target_completion_date', String(v))} isReadOnly={isReadOnly} hasError={validationErrors.has(`${row.id}-target_completion_date`)} />
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-white/50 dark:bg-slate-100/40 flex items-center">
                    <select
                      value={row.action_status || 'Open'}
                      disabled={isReadOnly}
                      onChange={(e) => handleRowUpdate(row.id, 'action_status', e.target.value)}
                      className="w-full bg-slate-100/40 dark:bg-slate-100/30 border border-steel-700/50 hover:border-steel-500 focus:border-forge-500 focus:ring-1 focus:ring-forge-500 rounded px-1 py-1 text-sm text-steel-100 focus:outline-none disabled:opacity-50"
                    >
                      <option value="Open">{t('pfmea.worksheet.status.open', 'Abierto')}</option>
                      <option value="In Progress">{t('pfmea.worksheet.status.inProgress', 'En Progreso')}</option>
                      <option value="Completed">{t('pfmea.worksheet.status.completed', 'Completado')}</option>
                    </select>
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-white/50 dark:bg-slate-100/40">
                    <EditableCell rows={PFMEA_TEXTAREA_CONFIG.defaultRows} minHeightClass={PFMEA_TEXTAREA_CONFIG.minHeightClass} type="textarea" maxLength={PFMEA_TEXTAREA_CONFIG.defaultMaxLength} value={row.actions_taken} onSave={(v) => handleRowUpdate(row.id, 'actions_taken', String(v))} isReadOnly={isReadOnly} hasError={validationErrors.has(`${row.id}-actions_taken`)} />
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-white/50 dark:bg-slate-100/40">
                    <EditableCell type="date" value={row.completion_date} onSave={(v) => handleRowUpdate(row.id, 'completion_date', String(v))} isReadOnly={isReadOnly} hasError={validationErrors.has(`${row.id}-completion_date`)} />
                  </div>
                  <div className="px-0 py-0 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/20 text-center flex items-center justify-center relative">
                    <button
                      onClick={() => !isReadOnly && setNewSeverityModalRowId(row.id)}
                      disabled={isReadOnly}
                      type="button"
                      className={`relative w-full h-full min-h-[40px] flex items-center justify-center font-bold transition-colors group/newSev ${getTrafficLightBg(row.new_severity)} ${validationErrors.has(`${row.id}-new_severity`) ? 'border-2 border-alert-red/80' : ''}`}
                    >
                      {row.new_severity || '-'}
                      {!isReadOnly && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/newSev:opacity-100 bg-black/10 dark:bg-white/10 text-black dark:text-white backdrop-blur-[1px] transition-opacity">
                          <span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-100 rounded shadow-sm border border-steel-200 dark:border-steel-600">
                            {t('common.select', 'Seleccionar')}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="px-0 py-0 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/20 text-center flex items-center justify-center relative">
                    <button
                      onClick={() => !isReadOnly && setNewOccurrenceModalRowId(row.id)}
                      disabled={isReadOnly}
                      type="button"
                      className={`relative w-full h-full min-h-[40px] flex items-center justify-center font-bold transition-colors group/newOcc ${getTrafficLightBg(row.new_occurrence)} ${validationErrors.has(`${row.id}-new_occurrence`) ? 'border-2 border-alert-red/80' : ''}`}
                    >
                      {row.new_occurrence || '-'}
                      {!isReadOnly && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/newOcc:opacity-100 bg-black/10 dark:bg-white/10 text-black dark:text-white backdrop-blur-[1px] transition-opacity">
                          <span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-100 rounded shadow-sm border border-steel-200 dark:border-steel-600">
                            {t('common.select', 'Seleccionar')}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="px-0 py-0 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/20 text-center flex items-center justify-center relative">
                    <button
                      onClick={() => !isReadOnly && setNewDetectionModalRowId(row.id)}
                      disabled={isReadOnly}
                      type="button"
                      className={`relative w-full h-full min-h-[40px] flex items-center justify-center font-bold transition-colors group/newDet ${getTrafficLightBg(row.new_detection)} ${validationErrors.has(`${row.id}-new_detection`) ? 'border-2 border-alert-red/80' : ''}`}
                    >
                      {row.new_detection || '-'}
                      {!isReadOnly && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/newDet:opacity-100 bg-black/10 dark:bg-white/10 text-black dark:text-white backdrop-blur-[1px] transition-opacity">
                          <span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-100 rounded shadow-sm border border-steel-200 dark:border-steel-600">
                            {t('common.select', 'Seleccionar')}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/20 flex flex-col items-center justify-center">
                    <CriticalFlag
                      value={(row.new_special_characteristics === 'CC' || row.new_special_characteristics === 'SC') ? row.new_special_characteristics : 'none'}
                      onChange={(v) => handleRowUpdate(row.id, 'new_special_characteristics', v === 'none' ? '' : v)}
                      disabled={isReadOnly}
                    />
                    {validationErrors.has(`${row.id}-new_special_characteristics`) && (
                      <span className="text-[10px] text-red-500 mt-1">{t('common.required', 'Requerido')}</span>
                    )}
                  </div>
                  <div className="px-0 py-0 border-r border-steel-400 dark:border-steel-700 bg-slate-100/30 dark:bg-slate-100/20 text-center flex items-center justify-center relative">
                    <button
                      onClick={() => !isReadOnly && setNewApModalRowId(row.id)}
                      disabled={isReadOnly}
                      type="button"
                      className={`relative w-full h-full min-h-[40px] flex items-center justify-center font-black text-lg transition-colors group/newAp ${getAPTrafficLightBg(row.new_action_priority)}`}
                    >
                      {row.new_action_priority || '-'}
                      {!isReadOnly && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/newAp:opacity-100 bg-black/10 dark:bg-white/10 text-black dark:text-white backdrop-blur-[1px] transition-opacity">
                          <span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-100 rounded shadow-sm border border-steel-200 dark:border-steel-600">
                            {t('common.view', 'Ver')}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="px-2 py-1.5 bg-slate-100/30 dark:bg-slate-100/20">
                    <EditableCell rows={PFMEA_TEXTAREA_CONFIG.defaultRows} minHeightClass={PFMEA_TEXTAREA_CONFIG.minHeightClass} type="textarea" maxLength={PFMEA_TEXTAREA_CONFIG.defaultMaxLength} value={row.observations} onSave={(v) => handleRowUpdate(row.id, 'observations', String(v))} isReadOnly={isReadOnly} hasError={validationErrors.has(`${row.id}-observations`)} />
                  </div>
                </div>
              </div>
            );
          }} />
          </div>
        )}
      </div>
    </div>
  </motion.div>
)}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {/* Delete Confirmation Modal */}
      {rowToDelete !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRowToDelete(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-slate-100 border border-steel-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="px-6 py-4 border-b border-steel-800/80 flex items-center justify-between bg-slate-100/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-alert-red" size={20} />
                <h3 className="text-lg font-bold text-steel-100">{t('common.deleteRowTitle', 'Eliminar Fila')}</h3>
              </div>
              <button onClick={() => setRowToDelete(null)} className="text-steel-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-steel-300">
                {t('common.deleteRowDesc', '¿Estás seguro de que deseas eliminar permanentemente esta fila del análisis PFMEA? Esta acción no se puede deshacer.')}
              </p>
            </div>

            <div className="px-6 py-4 border-t border-steel-800/80 bg-slate-100/30 flex justify-end gap-3">
              <button
                onClick={() => setRowToDelete(null)}
                className="px-4 py-2.5 rounded-lg text-sm text-steel-400 hover:bg-slate-100 transition-colors font-medium cursor-pointer"
              >
                {t('common.cancel', 'Cancelar')}
              </button>
              <button
                onClick={confirmDeleteRow}
                className="px-4 py-2.5 rounded-lg text-sm bg-alert-red text-white hover:bg-slate-100 transition-colors font-medium shadow-lg shadow-alert-red/20 cursor-pointer"
              >
                {t('common.confirmDelete', 'Sí, eliminar')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <SeverityModal
        isOpen={severityModalRowId !== null}
        onClose={() => setSeverityModalRowId(null)}
        currentValue={localRows.find(r => r.id === severityModalRowId)?.severity}
        onSelect={(val) => {
          if (severityModalRowId) {
            handleRowUpdate(severityModalRowId, 'severity', val);
          }
        }}
      />

      <OccurrenceModal
        isOpen={occurrenceModalRowId !== null}
        onClose={() => setOccurrenceModalRowId(null)}
        currentValue={localRows.find(r => r.id === occurrenceModalRowId)?.occurrence}
        onSelect={(val) => {
          if (occurrenceModalRowId) {
            handleRowUpdate(occurrenceModalRowId, 'occurrence', val);
          }
        }}
      />

      <DetectionModal
        isOpen={detectionModalRowId !== null}
        onClose={() => setDetectionModalRowId(null)}
        currentValue={localRows.find(r => r.id === detectionModalRowId)?.detection}
        onSelect={(val) => {
          if (detectionModalRowId) {
            handleRowUpdate(detectionModalRowId, 'detection', val);
          }
        }}
      />

      <ActionPriorityModal
        isOpen={apModalRowId !== null}
        onClose={() => setApModalRowId(null)}
        currentS={localRows.find(r => r.id === apModalRowId)?.severity}
        currentO={localRows.find(r => r.id === apModalRowId)?.occurrence}
        currentD={localRows.find(r => r.id === apModalRowId)?.detection}
      />

      <SeverityModal
        isOpen={newSeverityModalRowId !== null}
        onClose={() => setNewSeverityModalRowId(null)}
        currentValue={localRows.find(r => r.id === newSeverityModalRowId)?.new_severity}
        onSelect={(val) => {
          if (newSeverityModalRowId) {
            handleRowUpdate(newSeverityModalRowId, 'new_severity', val);
          }
        }}
      />

      <OccurrenceModal
        isOpen={newOccurrenceModalRowId !== null}
        onClose={() => setNewOccurrenceModalRowId(null)}
        currentValue={localRows.find(r => r.id === newOccurrenceModalRowId)?.new_occurrence}
        onSelect={(val) => {
          if (newOccurrenceModalRowId) {
            handleRowUpdate(newOccurrenceModalRowId, 'new_occurrence', val);
          }
        }}
      />

      <DetectionModal
        isOpen={newDetectionModalRowId !== null}
        onClose={() => setNewDetectionModalRowId(null)}
        currentValue={localRows.find(r => r.id === newDetectionModalRowId)?.new_detection}
        onSelect={(val) => {
          if (newDetectionModalRowId) {
            handleRowUpdate(newDetectionModalRowId, 'new_detection', val);
          }
        }}
      />

      <ActionPriorityModal
        isOpen={newApModalRowId !== null}
        onClose={() => setNewApModalRowId(null)}
        currentS={localRows.find(r => r.id === newApModalRowId)?.new_severity}
        currentO={localRows.find(r => r.id === newApModalRowId)?.new_occurrence}
        currentD={localRows.find(r => r.id === newApModalRowId)?.new_detection}
      />
    </div>
  );
};
