import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { WorksheetRow } from '../../api/pfmeaService';
import type { FlowchartStepRead } from '../../services/flowchartService';
import { Save, AlertTriangle, AlertCircle, CheckCircle2, Plus, Loader2, Layers, Trash2, X, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { SeverityModal } from './SeverityModal';
import { OccurrenceModal } from './OccurrenceModal';
import { DetectionModal } from './DetectionModal';
import { ActionPriorityModal } from './ActionPriorityModal';
import { calculateActionPriority } from '../../utils/apCalculator';
import { ExportPfmeaButton } from './ExportPfmeaButton';
import { CriticalFlag } from '../flowchart/CriticalFlag';

interface PFMEAWorksheetTableProps {
  pfmeaId: number;
  partNumber?: string;
  flowchartSteps: FlowchartStepRead[];
  rows: WorksheetRow[];
  onSaveAll: (rows: WorksheetRow[]) => void;
  isReadOnly: boolean;
  isSaving?: boolean;
  isHeaderDirty?: boolean;
  header?: any;
  productData?: any;
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
}> = ({ value, type = 'text', isReadOnly, onSave, className, hasError, maxLength, rows = 3 }) => {
  const [localVal, setLocalVal] = useState(value ?? '');

  useEffect(() => {
    setLocalVal(value ?? '');
  }, [value]);

  const handleBlur = () => {
    if (localVal !== (value ?? '')) {
      const parsed = type === 'number' ? parseInt(localVal as string, 10) : localVal;
      onSave(parsed || (type === 'number' ? 0 : ''));
    }
  };

  const errorClass = hasError ? 'border-alert-red/80 bg-alert-red/10' : 'border-steel-700/50 bg-steel-950/40 dark:bg-steel-950/30';
  const baseClasses = `w-full ${errorClass} hover:border-steel-500 focus:border-forge-500 focus:ring-1 focus:ring-forge-500 rounded px-2 py-1 text-sm text-steel-100 transition-all focus:outline-none disabled:opacity-50 ${className || ''}`;

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
          className={`${baseClasses} resize-y min-h-[40px] pb-6`}
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
      className={`px-1.5 py-0.5 text-xs rounded transition-all border ${isSelected ? 'bg-forge-500/20 text-forge-400 border-forge-500/50 shadow-[0_0_8px_rgba(234,88,12,0.2)] font-bold' : 'bg-steel-950/40 text-steel-400 border-steel-700/50 hover:border-steel-500 hover:text-steel-200'}`}
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
  onSaveAll, 
  isReadOnly, 
  isSaving = false, 
  isHeaderDirty = false,
  header,
  productData,
}) => {
  const { t } = useTranslation();
  
  const [localRows, setLocalRows] = useState<WorksheetRow[]>([]);
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

  const tableScrollRef = React.useRef<HTMLDivElement>(null);
  const stickyHeaderRef = React.useRef<HTMLDivElement>(null);
  const mainHeaderRef = React.useRef<HTMLDivElement>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  // Drag to scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    if (mainHeaderRef.current) {
      observer.observe(mainHeaderRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleTableScroll = () => {
    if (tableScrollRef.current && stickyHeaderRef.current) {
      stickyHeaderRef.current.scrollLeft = tableScrollRef.current.scrollLeft;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tableScrollRef.current) return;
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'input' || 
        target.tagName.toLowerCase() === 'select' || 
        target.tagName.toLowerCase() === 'button' ||
        target.closest('button')) {
      return;
    }
    setIsDragging(true);
    setStartX(e.pageX - tableScrollRef.current.offsetLeft);
    setStartY(e.pageY - tableScrollRef.current.offsetTop);
    setScrollLeft(tableScrollRef.current.scrollLeft);
    setScrollTop(tableScrollRef.current.scrollTop);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tableScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - tableScrollRef.current.offsetLeft;
    const y = e.pageY - tableScrollRef.current.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    tableScrollRef.current.scrollLeft = scrollLeft - walkX;
    tableScrollRef.current.scrollTop = scrollTop - walkY;
  };

  // Initialize from props or session storage
  useEffect(() => {
    const draft = sessionStorage.getItem('pfmea_worksheet_draft');
    if (draft && rows.length > 0) {
      // Basic check to see if draft belongs to same PFMEA
      try {
        const parsedDraft = JSON.parse(draft);
        if (parsedDraft.length > 0 && parsedDraft[0].pfmea_id === rows[0]?.pfmea_id) {
          setLocalRows(parsedDraft);
          return;
        }
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
    setLocalRows(rows);
  }, [rows]);

  // Persist to session storage on change
  useEffect(() => {
    if (localRows.length > 0) {
      sessionStorage.setItem('pfmea_worksheet_draft', JSON.stringify(localRows));
    }
  }, [localRows]);

  const uniqueStations = Array.from(new Set(rows.map(r => r.station_operation).filter(Boolean))) as string[];

  const handleRowUpdate = useCallback((rowId: number | string, field: keyof WorksheetRow, value: any) => {
    setLocalRows(prev => prev.map(r => {
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
    }));
    // Clear error for this field if it existed
    setValidationErrors(prev => {
      const next = new Set(prev);
      next.delete(`${rowId}-${field}`);
      return next;
    });
  }, []);

  const handleAddRow = () => {
    let newRow: WorksheetRow;
    
    if (localRows.length === 0) {
      newRow = {
        id: Date.now() * -1,
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
        id: Date.now() * -1,
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
    
    setLocalRows([...localRows, newRow]);
  };

  const handleInsertRow = (index: number) => {
    const rowToClone = localRows[index];
    const newRow: WorksheetRow = {
      ...rowToClone,
      id: Date.now() * -1,
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
      sequence_order: rowToClone.sequence_order + 1
    };
    
    setLocalRows(prev => {
      const copy = [...prev];
      copy.splice(index + 1, 0, newRow);
      return copy;
    });
  };

  const handleDuplicateRow = (index: number) => {
    const rowToClone = localRows[index];
    const newRow: WorksheetRow = {
      ...rowToClone,
      id: Date.now() * -1,
      sequence_order: rowToClone.sequence_order + 1
    };
    
    setLocalRows(prev => {
      const copy = [...prev];
      copy.splice(index + 1, 0, newRow);
      return copy;
    });
  };

  const handleDeleteRow = (id: number) => {
    setRowToDelete(id);
  };

  const confirmDeleteRow = () => {
    if (rowToDelete !== null) {
      setLocalRows(prev => prev.filter(r => r.id !== rowToDelete));
      setRowToDelete(null);
    }
  };

  const validateAndSave = () => {
    const errors = new Set<string>();
    
    // Required fields from Step 2 to Step 5
    const requiredFields: (keyof WorksheetRow)[] = [
      'process_item_name', 'station_operation', 'work_element_process',
      'function_process_item_plant', 'function_process_item_customer', 'function_process_item_end_user',
      'function_process_step', 'function_work_element',
      'failure_mode', 'failure_effect_plant', 'failure_effect_customer', 'failure_effect_end_user', 'severity',
      'failure_cause', 'occurrence', 'prevention_controls', 'detection_controls', 'detection'
    ];

    localRows.forEach(row => {
      requiredFields.forEach(field => {
        if (row[field] === undefined || row[field] === null || row[field] === '') {
          errors.add(`${row.id}-${field}`);
        }
      });
    });

    if (errors.size > 0) {
      setValidationErrors(errors);
      toast.error(t('pfmea.worksheet.validationError', 'Por favor completa todos los campos requeridos (Pasos 2 al 5).'));
      return;
    }

    // Pass validation, trigger save
    onSaveAll(localRows);
    sessionStorage.removeItem('pfmea_worksheet_draft');
  };

  const getValidStepRange = (currentIndex: number) => {
    let minStep = 0;
    let maxStep = Infinity;

    for (let i = 0; i < currentIndex; i++) {
      const r = localRows[i];
      if (r.flowchart_step_id) {
        const step = flowchartSteps.find(s => s.id === r.flowchart_step_id);
        if (step && step.step_number > minStep) {
          minStep = step.step_number;
        }
      }
    }

    for (let i = currentIndex + 1; i < localRows.length; i++) {
      const r = localRows[i];
      if (r.flowchart_step_id) {
        const step = flowchartSteps.find(s => s.id === r.flowchart_step_id);
        if (step && step.step_number < maxStep) {
          maxStep = step.step_number;
        }
      }
    }

    return { minStep, maxStep };
  };

  const getTrafficLightBg = (value: number | undefined) => {
    if (!value) return 'text-green-700 dark:text-green-300 hover:bg-black/5 dark:hover:bg-white/5';
    if (value >= 7) return 'bg-alert-red text-white hover:bg-red-600';
    if (value >= 4) return 'bg-[#FBBF24] text-slate-900 hover:bg-[#F59E0B]';
    return 'bg-[#22C55E] text-white hover:bg-[#16A34A]';
  };

  const getAPTrafficLightBg = (ap: string | undefined) => {
    if (!ap) return 'text-green-700 dark:text-green-300 hover:bg-black/5 dark:hover:bg-white/5';
    if (ap === 'H') return 'bg-alert-red text-white hover:bg-red-600';
    if (ap === 'M') return 'bg-[#FBBF24] text-slate-900 hover:bg-[#F59E0B]';
    if (ap === 'L') return 'bg-[#22C55E] text-white hover:bg-[#16A34A]';
    return 'text-green-700 dark:text-green-300 hover:bg-black/5 dark:hover:bg-white/5';
  };

  const minimalistColumns = [
    // Step 2
    { text: t('pfmea.worksheet.abbr.processItem', 'P. Item'), className: 'bg-[#DDDDDD] dark:bg-steel-700/30', stepClass: 'border-t-[3px] border-t-blue-500' },
    { text: t('pfmea.worksheet.abbr.station', 'Estación'), className: 'bg-[#9FD1FF] dark:bg-blue-900/40', stepClass: 'border-t-[3px] border-t-blue-500' },
    { text: t('pfmea.worksheet.abbr.workElement', '4M'), className: 'bg-[#CEB4FF] dark:bg-purple-900/40', stepClass: 'border-t-[3px] border-t-blue-500' },
    // Step 3
    { text: t('pfmea.worksheet.abbr.functionItemPlant', 'Fn. Item'), className: 'bg-[#DDDDDD] dark:bg-steel-700/30', stepClass: 'border-t-[3px] border-t-emerald-500' },
    { text: t('pfmea.worksheet.abbr.functionStepProduct', '2.a Fn. Paso'), className: 'bg-[#9FD1FF] dark:bg-blue-900/40', stepClass: 'border-t-[3px] border-t-emerald-500' },
    { text: t('pfmea.worksheet.abbr.productCharacteristic', '2.b Carac. Prod.'), className: 'bg-[#82C3FF] dark:bg-blue-800/40', stepClass: 'border-t-[3px] border-t-emerald-500' },
    { text: t('pfmea.worksheet.abbr.functionWorkElementChar', '3.a Fn. Trab.'), className: 'bg-[#CEB4FF] dark:bg-purple-900/40', stepClass: 'border-t-[3px] border-t-emerald-500' },
    { text: t('pfmea.worksheet.abbr.processCharacteristic', '3.b Carac. Proc.'), className: 'bg-[#BC99FF] dark:bg-purple-800/40', stepClass: 'border-t-[3px] border-t-emerald-500' },
    // Step 4
    { text: t('pfmea.worksheet.abbr.failureEffectCol', 'Ef. Falla'), className: 'bg-[#DDDDDD] dark:bg-steel-700/30', stepClass: 'border-t-[3px] border-t-rose-500' },
    { text: t('pfmea.worksheet.abbr.severity', 'S'), className: 'bg-[#7FD164] dark:bg-green-900/40', stepClass: 'border-t-[3px] border-t-rose-500' },
    { text: t('pfmea.worksheet.abbr.failureModeCol', 'Modo F.'), className: 'bg-[#9FD1FF] dark:bg-blue-900/40', stepClass: 'border-t-[3px] border-t-rose-500' },
    { text: t('pfmea.worksheet.abbr.failureCauseCol', 'Causa F.'), className: 'bg-[#CEB4FF] dark:bg-purple-900/40', stepClass: 'border-t-[3px] border-t-rose-500' },
    // Step 5
    { text: t('pfmea.worksheet.abbr.prevention', 'Prev.'), className: 'bg-[#7FD164] dark:bg-green-900/40', stepClass: 'border-t-[3px] border-t-amber-500' },
    { text: t('pfmea.worksheet.abbr.occurrence', 'O'), className: 'bg-[#7FD164] dark:bg-green-900/40', stepClass: 'border-t-[3px] border-t-amber-500' },
    { text: t('pfmea.worksheet.abbr.detectionCtrl', 'Detec.'), className: 'bg-[#7FD164] dark:bg-green-900/40', stepClass: 'border-t-[3px] border-t-amber-500' },
    { text: t('pfmea.worksheet.abbr.detection', 'D'), className: 'bg-[#7FD164] dark:bg-green-900/40', stepClass: 'border-t-[3px] border-t-amber-500' },
    { text: t('pfmea.worksheet.abbr.ap', 'AP'), className: 'bg-[#7FD164] dark:bg-green-900/40', stepClass: 'border-t-[3px] border-t-amber-500' },
    { text: t('pfmea.worksheet.abbr.specialCharacteristics', 'C. Esp.'), className: 'bg-[#A3D5FF] dark:bg-sky-900/40', stepClass: 'border-t-[3px] border-t-amber-500' },
    // Step 6
    { text: t('pfmea.worksheet.abbr.optPrevention', 'Acc. Prev.'), className: 'bg-[#7FD164] dark:bg-green-900/40', stepClass: 'border-t-[3px] border-t-teal-500' },
    { text: t('pfmea.worksheet.abbr.optDetection', 'Acc. Detec.'), className: 'bg-[#7FD164] dark:bg-green-900/40', stepClass: 'border-t-[3px] border-t-teal-500' },
    { text: t('pfmea.worksheet.abbr.optResponsible', 'Resp.'), className: 'bg-slate-50 dark:bg-steel-950/80', stepClass: 'border-t-[3px] border-t-teal-500' },
    { text: t('pfmea.worksheet.abbr.optTargetDate', 'Fecha'), className: 'bg-slate-50 dark:bg-steel-950/80', stepClass: 'border-t-[3px] border-t-teal-500' },
    { text: t('pfmea.worksheet.abbr.optStatus', 'Est.'), className: 'bg-slate-50 dark:bg-steel-950/80', stepClass: 'border-t-[3px] border-t-teal-500' },
    { text: t('pfmea.worksheet.abbr.optActionsTaken', 'Evid.'), className: 'bg-slate-50 dark:bg-steel-950/80', stepClass: 'border-t-[3px] border-t-teal-500' },
    { text: t('pfmea.worksheet.abbr.optCompletionDate', 'Fin'), className: 'bg-slate-50 dark:bg-steel-950/80', stepClass: 'border-t-[3px] border-t-teal-500' },
    { text: t('pfmea.worksheet.abbr.optSeverity', 'S'), className: 'bg-[#7FD164] dark:bg-green-900/40', stepClass: 'border-t-[3px] border-t-teal-500' },
    { text: t('pfmea.worksheet.abbr.optOccurrence', 'O'), className: 'bg-[#7FD164] dark:bg-green-900/40', stepClass: 'border-t-[3px] border-t-teal-500' },
    { text: t('pfmea.worksheet.abbr.optDetectionVal', 'D'), className: 'bg-[#7FD164] dark:bg-green-900/40', stepClass: 'border-t-[3px] border-t-teal-500' },
    { text: t('pfmea.worksheet.abbr.optSpecialCharacteristics', 'C.E.'), className: 'bg-[#A3D5FF] dark:bg-sky-900/40', stepClass: 'border-t-[3px] border-t-teal-500' },
    { text: t('pfmea.worksheet.abbr.optAP', 'AP'), className: 'bg-[#7FD164] dark:bg-green-900/40', stepClass: 'border-t-[3px] border-t-teal-500' },
    { text: t('pfmea.worksheet.abbr.optObservations', 'Obs.'), className: 'bg-[#7FD164] dark:bg-green-900/40', stepClass: 'border-t-[3px] border-t-teal-500' },
  ];

  return (
    <div className="flex flex-col gap-4 relative h-full min-h-0">
      {/* Loading Overlay */}
      {isSaving && (
        <div className="absolute inset-0 z-[100] bg-steel-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-xl pointer-events-auto">
          <div className="bg-steel-900 border border-steel-700 shadow-2xl rounded-2xl px-8 py-6 flex flex-col items-center gap-4 sticky top-[30vh]">
            <Loader2 className="w-10 h-10 text-forge-500 animate-spin" />
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-1">{t('common.savingChanges', 'Guardando cambios...')}</h3>
              <p className="text-sm text-steel-400">{t('common.pleaseWait', 'Por favor, espera mientras el servidor responde.')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Minimalist Sticky Header */}
      <div className={`sticky top-[0px] z-40 w-full transition-opacity duration-300 ${!isHeaderVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute top-0 left-0 w-full shadow-lg rounded-b-xl border-b border-steel-700 overflow-hidden backdrop-blur-xl bg-steel-50/95 dark:bg-steel-900/95">
          <div ref={stickyHeaderRef} className="overflow-hidden min-w-full">
            <div className="min-w-[5480px] grid grid-cols-[250px_250px_250px_250px_250px_250px_250px_250px_250px_80px_250px_250px_250px_80px_250px_80px_80px_80px_250px_250px_200px_140px_120px_250px_140px_80px_80px_80px_80px_80px_80px]">
              {minimalistColumns.map((col, i) => (
                <div key={i} className={`px-2 py-1.5 border-r border-steel-400 dark:border-steel-600 text-[11px] font-bold text-center flex items-center justify-center text-black dark:text-white truncate ${col.className} ${col.stepClass}`}>
                  <span className="truncate">{col.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div 
        ref={tableScrollRef} 
        onScroll={handleTableScroll} 
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`glass-card overflow-auto rounded-xl border border-steel-700/50 flex-1 min-h-0 ${isDragging ? 'cursor-grabbing select-none' : ''}`}
      >
        {localRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-steel-950/20">
            <div className="w-16 h-16 bg-steel-800/50 rounded-full flex items-center justify-center mb-5 border border-steel-700">
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
                className="flex items-center gap-2 px-5 py-2.5 bg-forge-600 hover:bg-forge-500 text-white rounded-xl shadow-lg shadow-forge-900/20 font-medium transition-all"
              >
                <Plus size={18} />
                {t('common.addRow', 'Añadir Fila')}
              </button>
            )}
          </div>
        ) : (
          <div className="min-w-[5480px]">
            {/* Table Headers */}
            <div ref={mainHeaderRef} className="sticky top-0 z-30 grid grid-cols-[250px_250px_250px_250px_250px_250px_250px_250px_250px_80px_250px_250px_250px_80px_250px_80px_80px_80px_250px_250px_200px_140px_120px_250px_140px_80px_80px_80px_80px_80px_80px] bg-steel-50 dark:bg-steel-900/80 border-b border-steel-400 dark:border-steel-600">
            {/* AIAG&VDA Steps & Header Groups */}
            <div className="col-span-3 border-r border-steel-400 dark:border-steel-600 bg-blue-50 dark:bg-blue-900/20 flex flex-col">
              <div className="px-3 py-1.5 border-b border-blue-200 dark:border-blue-500/30 text-center bg-blue-100 dark:bg-blue-900/40">
                <div className="text-sm font-bold tracking-widest text-blue-700 dark:text-blue-400 uppercase">{t('pfmea.worksheet.steps.step2', 'Paso 2')}</div>
                <div className="text-xs text-blue-600 dark:text-blue-300/70 truncate mt-0.5">{t('pfmea.worksheet.steps.step2Desc', 'Análisis de Estructura')}</div>
              </div>
            </div>

            <div className="col-span-5 border-r border-steel-400 dark:border-steel-600 bg-emerald-50 dark:bg-emerald-900/20 flex flex-col">
              <div className="px-3 py-1.5 border-b border-emerald-200 dark:border-emerald-500/30 text-center bg-emerald-100 dark:bg-emerald-900/40">
                <div className="text-sm font-bold tracking-widest text-emerald-700 dark:text-emerald-400 uppercase">{t('pfmea.worksheet.steps.step3', 'Paso 3')}</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-300/70 truncate mt-0.5">{t('pfmea.worksheet.steps.step3Desc', 'Análisis de Función')}</div>
              </div>
            </div>

            <div className="col-span-4 border-r border-steel-400 dark:border-steel-600 bg-rose-50 dark:bg-rose-900/20 flex flex-col">
              <div className="px-3 py-1.5 border-b border-rose-200 dark:border-rose-500/30 text-center bg-rose-100 dark:bg-rose-900/40">
                <div className="text-sm font-bold tracking-widest text-rose-700 dark:text-rose-400 uppercase">{t('pfmea.worksheet.steps.step4', 'Paso 4')}</div>
                <div className="text-xs text-rose-600 dark:text-rose-300/70 truncate mt-0.5">{t('pfmea.worksheet.steps.step4Desc', 'Análisis de Falla')}</div>
              </div>
            </div>

            <div className="col-span-6 border-r border-steel-400 dark:border-steel-600 bg-amber-50 dark:bg-amber-900/20 flex flex-col">
              <div className="px-3 py-1.5 border-b border-amber-200 dark:border-amber-500/30 text-center bg-amber-100 dark:bg-amber-900/40">
                <div className="text-sm font-bold tracking-widest text-amber-800 dark:text-amber-400 uppercase">{t('pfmea.worksheet.steps.step5', 'Paso 5')}</div>
                <div className="text-xs text-amber-700 dark:text-amber-300/70 truncate mt-0.5">{t('pfmea.worksheet.steps.step5Desc', 'Análisis de Riesgo')}</div>
              </div>
            </div>

            <div className="col-span-13 bg-teal-50 dark:bg-teal-900/20 flex flex-col border-r border-steel-400 dark:border-steel-600">
              <div className="px-3 py-1.5 border-b border-teal-200 dark:border-teal-500/30 text-center bg-teal-100 dark:bg-teal-900/40">
                <div className="text-sm font-bold tracking-widest text-teal-800 dark:text-teal-400 uppercase">{t('pfmea.worksheet.steps.step6', 'Paso 6')}</div>
                <div className="text-xs text-teal-700 dark:text-teal-300/70 truncate mt-0.5">{t('pfmea.worksheet.steps.step6Desc', 'Optimización')}</div>
              </div>
            </div>

            {/* Sub Headers */}
            {[
              { text: t('pfmea.worksheet.columns.processItem', '1. Elemento de Proceso'), className: 'bg-[#DDDDDD] dark:bg-steel-700/30 text-black dark:text-white font-bold' },
              { text: t('pfmea.worksheet.columns.station', '2. Estación'), className: 'bg-[#9FD1FF] dark:bg-blue-900/40 text-black dark:text-white font-bold' },
              { text: t('pfmea.worksheet.columns.workElement', '3. Elemento de Trabajo (4M)'), className: 'bg-[#CEB4FF] dark:bg-purple-900/40 text-black dark:text-white font-bold' },
              { text: t('pfmea.worksheet.columns.functionItemPlant', '1. Función del elemento del proceso, función del sistema, elemento de la parte'), className: 'bg-[#DDDDDD] dark:bg-steel-700/30 text-black dark:text-white font-bold' },
              { text: t('pfmea.worksheet.columns.functionStepProduct', '2.a Función del paso del proceso'), className: 'bg-[#9FD1FF] dark:bg-blue-900/40 text-black dark:text-white font-bold' },
              { text: t('pfmea.worksheet.columns.productCharacteristic', '2.b Características del producto (Si aplica)'), className: 'bg-[#82C3FF] dark:bg-blue-800/40 text-black dark:text-white font-bold' },
              { text: t('pfmea.worksheet.columns.functionWorkElementChar', '3.a Función del elemento de trabajo del proceso'), className: 'bg-[#CEB4FF] dark:bg-purple-900/40 text-black dark:text-white font-bold' },
              { text: t('pfmea.worksheet.columns.processCharacteristic', '3.b Características del proceso (Si aplica)'), className: 'bg-[#BC99FF] dark:bg-purple-800/40 text-black dark:text-white font-bold' },
              { text: t('pfmea.worksheet.columns.failureEffectCol', '1. Efectos de falla (FE) en el elemento del siguiente nivel superior y/o usuario final'), className: 'bg-[#DDDDDD] dark:bg-steel-700/30 text-black dark:text-white font-bold' },
              { text: t('pfmea.worksheet.columns.severity', '(S)'), className: 'bg-[#7FD164] dark:bg-green-900/40 text-black dark:text-white font-bold', rotate: true },
              { text: t('pfmea.worksheet.columns.failureModeCol', '2. Modo de falla (FM) del elemento de enfoque'), className: 'bg-[#9FD1FF] dark:bg-blue-900/40 text-black dark:text-white font-bold' },
              { text: t('pfmea.worksheet.columns.failureCauseCol', '3. Causa de la falla (FC) del elemento de trabajo'), className: 'bg-[#CEB4FF] dark:bg-purple-900/40 text-black dark:text-white font-bold' },
              { text: t('pfmea.worksheet.columns.prevention', 'Control actual de prevención (PC) de FC'), className: 'bg-[#7FD164] dark:bg-green-900/40 text-black dark:text-white font-bold' },
              { text: t('pfmea.worksheet.columns.occurrence', 'Ocurrencia (O) de FC'), className: 'bg-[#7FD164] dark:bg-green-900/40 text-black dark:text-white font-bold', rotate: true },
              { text: t('pfmea.worksheet.columns.detectionCtrl', 'Controles actuales de detección (DC) de FC o FM'), className: 'bg-[#7FD164] dark:bg-green-900/40 text-black dark:text-white font-bold' },
              { text: t('pfmea.worksheet.columns.detection', 'Detección (D) de FC/FM'), className: 'bg-[#7FD164] dark:bg-green-900/40 text-black dark:text-white font-bold', rotate: true },
              { text: t('pfmea.worksheet.columns.ap', 'PFMEA AP'), className: 'bg-[#7FD164] dark:bg-green-900/40 text-black dark:text-white font-bold', rotate: true },
              { text: t('pfmea.worksheet.columns.specialCharacteristics', 'Características especiales'), className: 'bg-[#A3D5FF] dark:bg-sky-900/40 text-black dark:text-white font-bold', rotate: true },
              { text: t('pfmea.worksheet.columns.optPrevention', 'Acción de prevención'), className: 'bg-[#7FD164] dark:bg-green-900/40 text-black dark:text-white font-bold' },
              { text: t('pfmea.worksheet.columns.optDetection', 'Acción de detección'), className: 'bg-[#7FD164] dark:bg-green-900/40 text-black dark:text-white font-bold' },
              { text: t('pfmea.worksheet.columns.optResponsible', 'Nombre de la persona responsable'), className: 'bg-slate-50 dark:bg-steel-950/80 text-black dark:text-white font-bold' },
              { text: t('pfmea.worksheet.columns.optTargetDate', 'Fecha límite de finalización'), className: 'bg-slate-50 dark:bg-steel-950/80 text-black dark:text-white font-bold' },
              { text: t('pfmea.worksheet.columns.optStatus', 'Estatus'), className: 'bg-slate-50 dark:bg-steel-950/80 text-black dark:text-white font-bold' },
              { text: t('pfmea.worksheet.columns.optActionsTaken', 'Acción tomada con prueba de evidencia'), className: 'bg-slate-50 dark:bg-steel-950/80 text-black dark:text-white font-bold' },
              { text: t('pfmea.worksheet.columns.optCompletionDate', 'Fecha de termino'), className: 'bg-slate-50 dark:bg-steel-950/80 text-black dark:text-white font-bold' },
              { text: t('pfmea.worksheet.columns.optSeverity', '(S)'), className: 'bg-[#7FD164] dark:bg-green-900/40 text-black dark:text-white font-bold', rotate: true },
              { text: t('pfmea.worksheet.columns.optOccurrence', '(O)'), className: 'bg-[#7FD164] dark:bg-green-900/40 text-black dark:text-white font-bold', rotate: true },
              { text: t('pfmea.worksheet.columns.optDetectionVal', '(D)'), className: 'bg-[#7FD164] dark:bg-green-900/40 text-black dark:text-white font-bold', rotate: true },
              { text: t('pfmea.worksheet.columns.optSpecialCharacteristics', 'Características especiales'), className: 'bg-[#A3D5FF] dark:bg-sky-900/40 text-black dark:text-white font-bold', rotate: true },
              { text: t('pfmea.worksheet.columns.optAP', 'PFMEA AP'), className: 'bg-[#7FD164] dark:bg-green-900/40 text-black dark:text-white font-bold', rotate: true },
              { text: t('pfmea.worksheet.columns.optObservations', 'Observaciones'), className: 'bg-[#7FD164] dark:bg-green-900/40 text-black dark:text-white font-bold', rotate: true },
            ].map((col, i) => (
              <div key={i} className={`px-3 py-2 border-r border-t border-steel-400 dark:border-steel-600 text-xs flex items-center justify-center text-center ${col.className || 'font-semibold'}`}>
                {col.text}
              </div>
            ))}
          </div>

          {/* Table Body */}
          <div className="divide-y divide-steel-400 dark:divide-steel-700">
            {localRows.map((row, index) => {
              const { minStep, maxStep } = getValidStepRange(index);
              return (
              <div key={row.id} className="group relative flex transition-colors bg-steel-900/20">
                {/* Hover Highlight Overlay */}
                <div className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 bg-steel-800/10 dark:bg-black/20 ring-2 ring-inset ring-forge-500/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] transition-all duration-200" />
                
                {/* Row Actions (Sticky & Floating) */}
                {!isReadOnly && (
                  <div className="sticky left-2 z-20 w-0 h-0 flex-none overflow-visible opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute top-2 flex flex-col gap-1 bg-steel-950 shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-steel-700 rounded-md p-1 backdrop-blur-md">
                      <button onClick={() => handleInsertRow(index)} title="Agregar Fila Debajo" className="p-1.5 text-steel-400 hover:text-success-400 hover:bg-steel-800 rounded transition-colors cursor-pointer"><Plus size={14}/></button>
                      <button onClick={() => handleDuplicateRow(index)} title="Duplicar Fila" className="p-1.5 text-steel-400 hover:text-blue-400 hover:bg-steel-800 rounded transition-colors cursor-pointer"><Copy size={14}/></button>
                      <button onClick={() => handleDeleteRow(row.id)} title="Eliminar Fila" className="p-1.5 text-steel-400 hover:text-alert-red hover:bg-steel-800 rounded transition-colors cursor-pointer"><Trash2 size={14}/></button>
                    </div>
                  </div>
                )}
                
                <div className="flex-1 grid grid-cols-[250px_250px_250px_250px_250px_250px_250px_250px_250px_80px_250px_250px_250px_80px_250px_80px_80px_80px_250px_250px_200px_140px_120px_250px_140px_80px_80px_80px_80px_80px_80px]">
                  {/* Structure Analysis */}
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-[#DDDDDD]/30 dark:bg-steel-800/20 flex items-center">
                    <span className="text-sm text-black dark:text-white font-bold line-clamp-3 ml-8">{row.process_item_name}</span>
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-[#9FD1FF]/30 dark:bg-blue-900/20 flex items-center">
                    {(() => {
                      const matchedStep = row.flowchart_step_id 
                        ? flowchartSteps.find(s => s.id === row.flowchart_step_id)
                        : flowchartSteps.find(s => `[OP ${s.step_number}] ${s.technology?.name || s.responsible_department || 'Assembly'}` === row.station_operation);
                      
                      const currentValue = matchedStep ? matchedStep.id : '';
                      const displayLabel = matchedStep 
                        ? `[OP ${matchedStep.step_number}] ${matchedStep.technology?.name || matchedStep.responsible_department || 'Assembly'}`
                        : row.station_operation;

                      return !isReadOnly ? (
                        <select
                          value={currentValue}
                          onChange={(e) => {
                            const stepId = Number(e.target.value);
                            const step = flowchartSteps.find(s => s.id === stepId);
                            
                            setLocalRows(prev => prev.map(r => {
                              if (r.id === row.id) {
                                const techName = step?.technology?.name;
                                const dept = step?.responsible_department || 'Assembly';
                                const stationName = step ? `[OP ${step.step_number}] ${techName || dept}` : '';
                                
                                return {
                                  ...r,
                                  flowchart_step_id: stepId,
                                  station_operation: stationName,
                                  operation_type: step?.symbol_type || '',
                                };
                              }
                              return r;
                            }));
                            
                            setValidationErrors(prev => {
                              const next = new Set(prev);
                              next.delete(`${row.id}-station_operation`);
                              return next;
                            });
                          }}
                          className={`w-full bg-steel-950/40 dark:bg-steel-950/30 border ${validationErrors.has(`${row.id}-station_operation`) ? 'border-alert-red' : 'border-steel-700/50'} hover:border-steel-500 focus:border-forge-500 rounded px-1 py-1 text-sm text-steel-100 font-bold focus:outline-none`}
                        >
                          <option value="">{t('common.select', 'Seleccionar...')}</option>
                          {flowchartSteps.map(step => {
                            const techName = step.technology?.name;
                            const dept = step.responsible_department || 'Assembly';
                            const label = `[OP ${step.step_number}] ${techName || dept}`;
                            const isDisabled = step.step_number < minStep || step.step_number > maxStep;
                            return (
                              <option key={step.id} value={step.id} disabled={isDisabled}>
                                {label} {isDisabled ? t('pfmea.worksheet.outOfSequence', '(Fuera de secuencia)') : ''}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <span className="text-sm text-black dark:text-white font-bold line-clamp-3">{displayLabel}</span>
                      );
                    })()}
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-[#CEB4FF]/30 dark:bg-purple-900/20">
                    <WorkElementTags 
                      value={row.work_element_process || ''}
                      onChange={(val) => handleRowUpdate(row.id, 'work_element_process', val)}
                      isReadOnly={isReadOnly}
                      hasError={validationErrors.has(`${row.id}-work_element_process`)}
                    />
                  </div>

                  {/* Function Analysis */}
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-[#DDDDDD]/30 dark:bg-steel-800/20 flex flex-col gap-2">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[9px] font-bold text-steel-400 dark:text-steel-400 uppercase tracking-wider">{t('pfmea.worksheet.labels.plantInternal', 'Planta (Interno)')}</label>
                      <EditableCell 
                        type="textarea"
                        maxLength={250}
                        rows={2}
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
                        maxLength={250}
                        rows={2}
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
                        maxLength={250}
                        rows={2}
                        value={row.function_process_item_end_user} 
                        onSave={(v) => handleRowUpdate(row.id, 'function_process_item_end_user', String(v))} 
                        isReadOnly={isReadOnly} 
                        hasError={validationErrors.has(`${row.id}-function_process_item_end_user`)}
                      />
                    </div>
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-[#9FD1FF]/30 dark:bg-blue-900/20">
                    <EditableCell 
                      type="textarea"
                      maxLength={500}
                      value={row.function_process_step} 
                      onSave={(v) => handleRowUpdate(row.id, 'function_process_step', String(v))} 
                      isReadOnly={isReadOnly} 
                      hasError={validationErrors.has(`${row.id}-function_process_step`)}
                    />
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-[#82C3FF]/30 dark:bg-blue-800/20">
                    <EditableCell 
                      type="textarea"
                      maxLength={500}
                      value={row.product_characteristic} 
                      onSave={(v) => handleRowUpdate(row.id, 'product_characteristic', String(v))} 
                      isReadOnly={isReadOnly} 
                      hasError={validationErrors.has(`${row.id}-product_characteristic`)}
                    />
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-[#CEB4FF]/30 dark:bg-purple-900/20">
                    <EditableCell 
                      type="textarea"
                      maxLength={500}
                      value={row.function_work_element} 
                      onSave={(v) => handleRowUpdate(row.id, 'function_work_element', String(v))} 
                      isReadOnly={isReadOnly} 
                      hasError={validationErrors.has(`${row.id}-function_work_element`)}
                    />
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-[#BC99FF]/30 dark:bg-purple-800/20">
                    <EditableCell 
                      type="textarea"
                      maxLength={500}
                      value={row.process_characteristic} 
                      onSave={(v) => handleRowUpdate(row.id, 'process_characteristic', String(v))} 
                      isReadOnly={isReadOnly} 
                      hasError={validationErrors.has(`${row.id}-process_characteristic`)}
                    />
                  </div>

                  {/* Failure Analysis */}
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-[#DDDDDD]/30 dark:bg-steel-800/20 flex flex-col gap-2">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[9px] font-bold text-steel-400 dark:text-steel-400 uppercase tracking-wider">{t('pfmea.worksheet.labels.plantInternal', 'Planta (Interno)')}</label>
                      <EditableCell 
                        type="textarea"
                        maxLength={250}
                        rows={2}
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
                        maxLength={250}
                        rows={2}
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
                        maxLength={250}
                        rows={2}
                        value={row.failure_effect_end_user} 
                        onSave={(v) => handleRowUpdate(row.id, 'failure_effect_end_user', String(v))} 
                        isReadOnly={isReadOnly} 
                        hasError={validationErrors.has(`${row.id}-failure_effect_end_user`)}
                      />
                    </div>
                  </div>
                  <div className="px-0 py-0 border-r border-steel-400 dark:border-steel-700 bg-[#7FD164]/30 dark:bg-green-900/20 text-center flex items-center justify-center relative">
                    <button
                      onClick={() => !isReadOnly && setSeverityModalRowId(row.id)}
                      disabled={isReadOnly}
                      type="button"
                      className={`relative w-full h-full min-h-[40px] flex items-center justify-center font-bold transition-colors group/sev ${getTrafficLightBg(row.severity)} ${validationErrors.has(`${row.id}-severity`) ? 'border-2 border-alert-red/80' : ''}`}
                    >
                      {row.severity || '-'}
                      {!isReadOnly && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/sev:opacity-100 bg-black/10 dark:bg-white/10 text-black dark:text-white backdrop-blur-[1px] transition-opacity">
                          <span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-steel-800 rounded shadow-sm border border-steel-200 dark:border-steel-600">
                            {t('common.select', 'Seleccionar')}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-[#9FD1FF]/30 dark:bg-blue-900/20">
                    <EditableCell 
                      type="textarea"
                      maxLength={500}
                      value={row.failure_mode} 
                      onSave={(v) => handleRowUpdate(row.id, 'failure_mode', String(v))} 
                      isReadOnly={isReadOnly} 
                      hasError={validationErrors.has(`${row.id}-failure_mode`)}
                    />
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-[#CEB4FF]/30 dark:bg-purple-900/20">
                    <EditableCell 
                      type="textarea"
                      maxLength={500}
                      value={row.failure_cause} 
                      onSave={(v) => handleRowUpdate(row.id, 'failure_cause', String(v))} 
                      isReadOnly={isReadOnly} 
                      hasError={validationErrors.has(`${row.id}-failure_cause`)}
                    />
                  </div>

                  {/* Risk Analysis */}
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-[#7FD164]/30 dark:bg-green-900/10">
                    <EditableCell 
                      type="textarea"
                      maxLength={500}
                      value={row.prevention_controls} 
                      onSave={(v) => handleRowUpdate(row.id, 'prevention_controls', String(v))} 
                      isReadOnly={isReadOnly} 
                      hasError={validationErrors.has(`${row.id}-prevention_controls`)}
                    />
                  </div>
                  <div className="px-0 py-0 border-r border-steel-400 dark:border-steel-700 bg-[#7FD164]/30 dark:bg-green-900/20 text-center flex items-center justify-center relative">
                    <button
                      onClick={() => !isReadOnly && setOccurrenceModalRowId(row.id)}
                      disabled={isReadOnly}
                      type="button"
                      className={`relative w-full h-full min-h-[40px] flex items-center justify-center font-bold transition-colors group/occ ${getTrafficLightBg(row.occurrence)} ${validationErrors.has(`${row.id}-occurrence`) ? 'border-2 border-alert-red/80' : ''}`}
                    >
                      {row.occurrence || '-'}
                      {!isReadOnly && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/occ:opacity-100 bg-black/10 dark:bg-white/10 text-black dark:text-white backdrop-blur-[1px] transition-opacity">
                          <span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-steel-800 rounded shadow-sm border border-steel-200 dark:border-steel-600">
                            {t('common.select', 'Seleccionar')}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-[#7FD164]/30 dark:bg-green-900/10">
                    <EditableCell 
                      type="textarea"
                      maxLength={500}
                      value={row.detection_controls} 
                      onSave={(v) => handleRowUpdate(row.id, 'detection_controls', String(v))} 
                      isReadOnly={isReadOnly} 
                      hasError={validationErrors.has(`${row.id}-detection_controls`)}
                    />
                  </div>
                  <div className="px-0 py-0 border-r border-steel-400 dark:border-steel-700 bg-[#7FD164]/30 dark:bg-green-900/20 text-center flex items-center justify-center relative">
                    <button
                      onClick={() => !isReadOnly && setDetectionModalRowId(row.id)}
                      disabled={isReadOnly}
                      type="button"
                      className={`relative w-full h-full min-h-[40px] flex items-center justify-center font-bold transition-colors group/det ${getTrafficLightBg(row.detection)} ${validationErrors.has(`${row.id}-detection`) ? 'border-2 border-alert-red/80' : ''}`}
                    >
                      {row.detection || '-'}
                      {!isReadOnly && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/det:opacity-100 bg-black/10 dark:bg-white/10 text-black dark:text-white backdrop-blur-[1px] transition-opacity">
                          <span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-steel-800 rounded shadow-sm border border-steel-200 dark:border-steel-600">
                            {t('common.select', 'Seleccionar')}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="px-0 py-0 border-r border-steel-400 dark:border-steel-700 bg-[#7FD164]/30 dark:bg-green-900/20 text-center flex items-center justify-center relative">
                    <button
                      onClick={() => !isReadOnly && setApModalRowId(row.id)}
                      disabled={isReadOnly}
                      type="button"
                      className={`relative w-full h-full min-h-[40px] flex items-center justify-center font-black text-lg transition-colors group/ap ${getAPTrafficLightBg(row.action_priority)}`}
                    >
                      {row.action_priority || '-'}
                      {!isReadOnly && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/ap:opacity-100 bg-black/10 dark:bg-white/10 text-black dark:text-white backdrop-blur-[1px] transition-opacity">
                          <span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-steel-800 rounded shadow-sm border border-steel-200 dark:border-steel-600">
                            {t('common.view', 'Ver')}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-[#A3D5FF]/30 dark:bg-sky-900/20 flex flex-col items-center justify-center">
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
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-[#7FD164]/30 dark:bg-green-900/10">
                    <EditableCell type="textarea" maxLength={500} value={row.optimization_prevention_action} onSave={(v) => handleRowUpdate(row.id, 'optimization_prevention_action', String(v))} isReadOnly={isReadOnly} hasError={validationErrors.has(`${row.id}-optimization_prevention_action`)} />
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-[#7FD164]/30 dark:bg-green-900/10">
                    <EditableCell type="textarea" maxLength={500} value={row.optimization_detection_action} onSave={(v) => handleRowUpdate(row.id, 'optimization_detection_action', String(v))} isReadOnly={isReadOnly} hasError={validationErrors.has(`${row.id}-optimization_detection_action`)} />
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-white/50 dark:bg-steel-900/40 flex items-center">
                    <select
                      value={row.responsible_person_id || ''}
                      disabled={isReadOnly}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) {
                          handleRowUpdate(row.id, 'responsible_person_id', null);
                          handleRowUpdate(row.id, 'responsible_person_name', '');
                        } else {
                          const numId = Number(val);
                          const member = header.team_members?.find(m => m.user_id === numId);
                          handleRowUpdate(row.id, 'responsible_person_id', numId);
                          if (member) {
                            handleRowUpdate(row.id, 'responsible_person_name', member.user_full_name || '');
                          }
                        }
                      }}
                      className={`w-full bg-steel-950/40 dark:bg-steel-950/30 border ${validationErrors.has(`${row.id}-responsible_person_name`) ? 'border-red-500' : 'border-steel-700/50 hover:border-steel-500'} focus:border-forge-500 focus:ring-1 focus:ring-forge-500 rounded px-1 py-1 text-sm text-steel-100 focus:outline-none disabled:opacity-50`}
                    >
                      <option value="">{t('common.select', 'Seleccionar...')}</option>
                      {header.team_members?.map((member) => (
                        <option key={member.user_id} value={member.user_id}>
                          {member.user_full_name} {member.is_active === false ? `[${t('common.archived', 'Archivado')}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-white/50 dark:bg-steel-900/40">
                    <EditableCell type="date" value={row.target_completion_date} onSave={(v) => handleRowUpdate(row.id, 'target_completion_date', String(v))} isReadOnly={isReadOnly} hasError={validationErrors.has(`${row.id}-target_completion_date`)} />
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-white/50 dark:bg-steel-900/40 flex items-center">
                    <select
                      value={row.action_status || 'Open'}
                      disabled={isReadOnly}
                      onChange={(e) => handleRowUpdate(row.id, 'action_status', e.target.value)}
                      className="w-full bg-steel-950/40 dark:bg-steel-950/30 border border-steel-700/50 hover:border-steel-500 focus:border-forge-500 focus:ring-1 focus:ring-forge-500 rounded px-1 py-1 text-sm text-steel-100 focus:outline-none disabled:opacity-50"
                    >
                      <option value="Open">{t('pfmea.worksheet.status.open', 'Abierto')}</option>
                      <option value="In Progress">{t('pfmea.worksheet.status.inProgress', 'En Progreso')}</option>
                      <option value="Completed">{t('pfmea.worksheet.status.completed', 'Completado')}</option>
                    </select>
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-white/50 dark:bg-steel-900/40">
                    <EditableCell type="textarea" maxLength={500} value={row.actions_taken} onSave={(v) => handleRowUpdate(row.id, 'actions_taken', String(v))} isReadOnly={isReadOnly} hasError={validationErrors.has(`${row.id}-actions_taken`)} />
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-white/50 dark:bg-steel-900/40">
                    <EditableCell type="date" value={row.completion_date} onSave={(v) => handleRowUpdate(row.id, 'completion_date', String(v))} isReadOnly={isReadOnly} hasError={validationErrors.has(`${row.id}-completion_date`)} />
                  </div>
                  <div className="px-0 py-0 border-r border-steel-400 dark:border-steel-700 bg-[#7FD164]/30 dark:bg-green-900/20 text-center flex items-center justify-center relative">
                    <button
                      onClick={() => !isReadOnly && setNewSeverityModalRowId(row.id)}
                      disabled={isReadOnly}
                      type="button"
                      className={`relative w-full h-full min-h-[40px] flex items-center justify-center font-bold transition-colors group/newSev ${getTrafficLightBg(row.new_severity)} ${validationErrors.has(`${row.id}-new_severity`) ? 'border-2 border-alert-red/80' : ''}`}
                    >
                      {row.new_severity || '-'}
                      {!isReadOnly && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/newSev:opacity-100 bg-black/10 dark:bg-white/10 text-black dark:text-white backdrop-blur-[1px] transition-opacity">
                          <span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-steel-800 rounded shadow-sm border border-steel-200 dark:border-steel-600">
                            {t('common.select', 'Seleccionar')}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="px-0 py-0 border-r border-steel-400 dark:border-steel-700 bg-[#7FD164]/30 dark:bg-green-900/20 text-center flex items-center justify-center relative">
                    <button
                      onClick={() => !isReadOnly && setNewOccurrenceModalRowId(row.id)}
                      disabled={isReadOnly}
                      type="button"
                      className={`relative w-full h-full min-h-[40px] flex items-center justify-center font-bold transition-colors group/newOcc ${getTrafficLightBg(row.new_occurrence)} ${validationErrors.has(`${row.id}-new_occurrence`) ? 'border-2 border-alert-red/80' : ''}`}
                    >
                      {row.new_occurrence || '-'}
                      {!isReadOnly && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/newOcc:opacity-100 bg-black/10 dark:bg-white/10 text-black dark:text-white backdrop-blur-[1px] transition-opacity">
                          <span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-steel-800 rounded shadow-sm border border-steel-200 dark:border-steel-600">
                            {t('common.select', 'Seleccionar')}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="px-0 py-0 border-r border-steel-400 dark:border-steel-700 bg-[#7FD164]/30 dark:bg-green-900/20 text-center flex items-center justify-center relative">
                    <button
                      onClick={() => !isReadOnly && setNewDetectionModalRowId(row.id)}
                      disabled={isReadOnly}
                      type="button"
                      className={`relative w-full h-full min-h-[40px] flex items-center justify-center font-bold transition-colors group/newDet ${getTrafficLightBg(row.new_detection)} ${validationErrors.has(`${row.id}-new_detection`) ? 'border-2 border-alert-red/80' : ''}`}
                    >
                      {row.new_detection || '-'}
                      {!isReadOnly && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/newDet:opacity-100 bg-black/10 dark:bg-white/10 text-black dark:text-white backdrop-blur-[1px] transition-opacity">
                          <span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-steel-800 rounded shadow-sm border border-steel-200 dark:border-steel-600">
                            {t('common.select', 'Seleccionar')}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="px-2 py-1.5 border-r border-steel-400 dark:border-steel-700 bg-[#A3D5FF]/30 dark:bg-sky-900/20 flex flex-col items-center justify-center">
                    <CriticalFlag 
                      value={(row.new_special_characteristics === 'CC' || row.new_special_characteristics === 'SC') ? row.new_special_characteristics : 'none'} 
                      onChange={(v) => handleRowUpdate(row.id, 'new_special_characteristics', v === 'none' ? '' : v)}
                      disabled={isReadOnly}
                    />
                    {validationErrors.has(`${row.id}-new_special_characteristics`) && (
                      <span className="text-[10px] text-red-500 mt-1">{t('common.required', 'Requerido')}</span>
                    )}
                  </div>
                  <div className="px-0 py-0 border-r border-steel-400 dark:border-steel-700 bg-[#7FD164]/30 dark:bg-green-900/20 text-center flex items-center justify-center relative">
                    <button
                      onClick={() => !isReadOnly && setNewApModalRowId(row.id)}
                      disabled={isReadOnly}
                      type="button"
                      className={`relative w-full h-full min-h-[40px] flex items-center justify-center font-black text-lg transition-colors group/newAp ${getAPTrafficLightBg(row.new_action_priority)}`}
                    >
                      {row.new_action_priority || '-'}
                      {!isReadOnly && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/newAp:opacity-100 bg-black/10 dark:bg-white/10 text-black dark:text-white backdrop-blur-[1px] transition-opacity">
                          <span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-steel-800 rounded shadow-sm border border-steel-200 dark:border-steel-600">
                            {t('common.view', 'Ver')}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="px-2 py-1.5 bg-[#7FD164]/30 dark:bg-green-900/20">
                    <EditableCell type="textarea" maxLength={500} value={row.observations} onSave={(v) => handleRowUpdate(row.id, 'observations', String(v))} isReadOnly={isReadOnly} hasError={validationErrors.has(`${row.id}-observations`)} />
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      {!isReadOnly && (
        <motion.div
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {/* Unsaved Changes Indicator */}
          {JSON.stringify(localRows) !== JSON.stringify(rows) && (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="flex items-center gap-2 rounded-full border border-alert-amber/30 bg-alert-amber/10 px-4 py-1.5 text-xs backdrop-blur-md shadow-lg"
            >
              <AlertCircle size={14} className="text-alert-amber" />
              <span className="text-alert-amber font-medium">{t('actions.unsavedChanges', 'Cambios sin guardar en base de datos')}</span>
            </motion.div>
          )}
          
          {/* Export PFMEA Button */}
          {header && (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.9 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
               <ExportPfmeaButton 
                 header={header} 
                 productData={productData}
                 rows={localRows} 
               />
            </motion.div>
          )}

          {/* Add Row Button */}
          <motion.button
            onClick={handleAddRow}
            type="button"
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.9 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center gap-2.5 rounded-2xl border border-steel-600 bg-steel-800/90 px-5 py-3 text-sm font-medium text-steel-200 shadow-xl backdrop-blur-md transition-industrial hover:border-forge-500/40 hover:text-forge-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-forge-500"
          >
            <Plus size={18} />
            <span>{t('common.addRow', 'Añadir Fila')}</span>
          </motion.button>

          {/* Save Changes Button */}
          <motion.button
            onClick={validateAndSave}
            disabled={isSaving || (!isHeaderDirty && JSON.stringify(localRows) === JSON.stringify(rows))}
            type="button"
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.9 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center gap-2.5 rounded-2xl bg-forge-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-forge-600/25 transition-industrial hover:bg-forge-500 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer focus:outline-none focus:ring-2 focus:ring-forge-500"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (!isHeaderDirty && JSON.stringify(localRows) === JSON.stringify(rows)) ? (
              <CheckCircle2 size={18} />
            ) : (
              <Save size={18} />
            )}
            <span>
              {isSaving
                ? t('common.saving', 'Guardando...')
                : (!isHeaderDirty && JSON.stringify(localRows) === JSON.stringify(rows))
                  ? t('common.saved', 'Guardado')
                  : t('common.saveChanges', 'Guardar Cambios')}
            </span>
          </motion.button>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {rowToDelete !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRowToDelete(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-steel-900 border border-steel-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="px-6 py-4 border-b border-steel-800/80 flex items-center justify-between bg-steel-950/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-alert-red" size={20} />
                <h3 className="text-lg font-bold text-steel-100">Eliminar Fila</h3>
              </div>
              <button onClick={() => setRowToDelete(null)} className="text-steel-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-steel-300">
                ¿Estás seguro de que deseas eliminar permanentemente esta fila del análisis PFMEA? 
                Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-steel-800/80 bg-steel-950/30 flex justify-end gap-3">
              <button 
                onClick={() => setRowToDelete(null)}
                className="px-4 py-2.5 rounded-lg text-sm text-steel-400 hover:bg-steel-800 transition-colors font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDeleteRow}
                className="px-4 py-2.5 rounded-lg text-sm bg-alert-red text-white hover:bg-red-600 transition-colors font-medium shadow-lg shadow-alert-red/20 cursor-pointer"
              >
                Sí, eliminar
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
