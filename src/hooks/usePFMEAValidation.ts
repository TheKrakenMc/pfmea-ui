import { useMemo } from 'react';
import type { WorksheetRow } from '../api/pfmeaService';
import type { FlowchartStepRead } from '../services/flowchartService';

export interface RowValidationResult {
  rowId: number;
  requiredCount: number;
  filledCount: number;
  isComplete: boolean;
  hasScCc: boolean;
  isHighRisk: boolean;
  missingFields: string[];
}

export interface OperationValidationResult {
  opKey: string;
  stepNumber?: number;
  opTitle: string;
  step?: FlowchartStepRead;
  rows: WorksheetRow[];
  totalRows: number;
  completedRows: number;
  totalRequiredFields: number;
  totalFilledFields: number;
  percentage: number;
  requiresScCc: boolean;
  hasScCc: boolean;
  isComplete: boolean;
}

export interface GlobalValidationResult {
  totalOperations: number;
  totalRows: number;
  completedRows: number;
  incompleteOperations: number;
  operationsWithoutScCc: number;
  globalPercentage: number;
  canRelease: boolean;
  releaseBlockReason: string;
  operations: OperationValidationResult[];
}

export type PFMEALayoutType = 'AIAG_APG' | 'AIAG_VDA';

/**
 * Validates a single WorksheetRow based on the active layout (AIAG Corporate or AIAG & VDA 7-Step)
 */
export function validateRow(
  row: WorksheetRow,
  layout: PFMEALayoutType = 'AIAG_APG'
): RowValidationResult {
  const missing: string[] = [];

  // Helper to check responsible person: ID (from DB/select), name, or string field
  const hasResponsible = Boolean(
    (typeof row.responsible_person_id === 'number' && row.responsible_person_id > 0) ||
    row.responsible_person_name?.trim() ||
    row.responsible_person_name?.trim()
  );
  const hasTargetDate = Boolean(row.target_completion_date?.trim());
  const hasRespAndDate = hasResponsible && hasTargetDate;

  // Check if High Risk (Severity >= 8 or AP == 'H')
  const isHighRisk = (typeof row.severity === 'number' && row.severity >= 9) || row.action_priority === 'H';

  let requiredCount: number;
  let filledCount: number;

  if (layout === 'AIAG_APG') {
    // =========================================================================
    // VISTA AIAG CORPORATIVA (4th Edition G-C1001 F-APQP)
    // =========================================================================

    // 1. Process Requirements / Requisitos de Proceso
    const hasReq = Boolean(row.function_process_step?.trim() || row.process_item_name?.trim());
    if (!hasReq) missing.push('Requisitos de Proceso');

    // 2. Potential Failure Mode / Modo Potencial de Falla
    const hasFailureMode = Boolean(row.failure_mode?.trim());
    if (!hasFailureMode) missing.push('Modo Potencial de Falla');

    // 3. Potential Effect(s) / Efectos Potenciales de Falla
    const hasEffects = Boolean(
      row.failure_effect_plant?.trim() ||
      row.failure_effect_customer?.trim() ||
      row.failure_effect_end_user?.trim()
    );
    if (!hasEffects) missing.push('Efectos de Falla');

    // 4. Severity (S: 1-10)
    const hasSev = typeof row.severity === 'number' && row.severity >= 1 && row.severity <= 10;
    if (!hasSev) missing.push('Severidad (S)');

    // 5. Potential Cause(s) / Causas Potenciales
    const hasCause = Boolean(row.failure_cause?.trim());
    if (!hasCause) missing.push('Causas de Falla');

    // 6. Occurrence (O: 1-10)
    const hasOcc = typeof row.occurrence === 'number' && row.occurrence >= 1 && row.occurrence <= 10;
    if (!hasOcc) missing.push('Ocurrencia (O)');

    // 7. Current Process Controls (Prevention or Detection) / Controles de Proceso
    const hasControls = Boolean(row.prevention_controls?.trim() || row.detection_controls?.trim());
    if (!hasControls) missing.push('Controles de Proceso (Prevención o Detección)');

    // 8. Detection (D: 1-10)
    const hasDet = typeof row.detection === 'number' && row.detection >= 1 && row.detection <= 10;
    if (!hasDet) missing.push('Detección (D)');

    requiredCount = 8;
    filledCount = [hasReq, hasFailureMode, hasEffects, hasSev, hasCause, hasOcc, hasControls, hasDet].filter(Boolean).length;

    // Mitigation Plan for High Risk (AP = 'H' or S >= 9)
    if (isHighRisk) {
      requiredCount += 2;

      // 9. Recommended Actions / Acciones Recomendadas
      const hasRecActions = Boolean(
        row.optimization_prevention_action?.trim() ||
        row.optimization_detection_action?.trim()
      );
      if (!hasRecActions) missing.push('Acciones Recomendadas');
      else filledCount++;

      // 10. Responsibility & Target Date / Responsable y Fecha Objetivo
      if (!hasRespAndDate) {
        if (!hasResponsible) missing.push('Responsable Asignado');
        if (!hasTargetDate) missing.push('Fecha Objetivo');
      } else {
        filledCount++;
      }
    }
  } else {
    // =========================================================================
    // VISTA AIAG & VDA ARMONIZADA (7 Pasos)
    // =========================================================================

    // Paso 2: Análisis de Estructura (Item, Operación, Elemento 4M)
    const hasStructureItem = Boolean(row.process_item_name?.trim());
    const hasStructureOp = Boolean(row.station_operation?.trim());
    const hasStructureWorkElement = Boolean(row.work_element_process?.trim());

    if (!hasStructureItem) missing.push('P2: Item de Proceso');
    if (!hasStructureOp) missing.push('P2: Operación/Estación');
    if (!hasStructureWorkElement) missing.push('P2: Elemento de Trabajo (4M)');

    // Paso 3: Análisis de Función (Item, Paso, Elemento)
    const hasItemFunction = Boolean(
      row.function_process_item_plant?.trim() ||
      row.function_process_item_customer?.trim() ||
      row.function_process_item_end_user?.trim()
    );
    const hasStepFunction = Boolean(row.function_process_step?.trim());
    const hasWorkElementFunction = Boolean(row.function_work_element?.trim());

    if (!hasItemFunction) missing.push('P3: Función de Item');
    if (!hasStepFunction) missing.push('P3: Función del Paso');
    if (!hasWorkElementFunction) missing.push('P3: Función de Elemento');

    // Paso 4: Análisis de Falla (Efecto, Modo, Causa)
    const hasEffects = Boolean(
      row.failure_effect_plant?.trim() ||
      row.failure_effect_customer?.trim() ||
      row.failure_effect_end_user?.trim()
    );
    const hasFailureMode = Boolean(row.failure_mode?.trim());
    const hasCause = Boolean(row.failure_cause?.trim());

    if (!hasEffects) missing.push('P4: Efecto(s) de Falla');
    if (!hasFailureMode) missing.push('P4: Modo de Falla');
    if (!hasCause) missing.push('P4: Causa de Falla');

    // Paso 5: Análisis de Riesgo (S, Prev, O, Det, D)
    const hasSev = typeof row.severity === 'number' && row.severity >= 1 && row.severity <= 10;
    const hasPrev = Boolean(row.prevention_controls?.trim());
    const hasOcc = typeof row.occurrence === 'number' && row.occurrence >= 1 && row.occurrence <= 10;
    const hasDetControls = Boolean(row.detection_controls?.trim());
    const hasDet = typeof row.detection === 'number' && row.detection >= 1 && row.detection <= 10;

    if (!hasSev) missing.push('P5: Severidad (S)');
    if (!hasPrev) missing.push('P5: Controles de Prevención');
    if (!hasOcc) missing.push('P5: Ocurrencia (O)');
    if (!hasDetControls) missing.push('P5: Controles de Detección');
    if (!hasDet) missing.push('P5: Detección (D)');

    const vdaBaseFields = [
      hasStructureItem, hasStructureOp, hasStructureWorkElement,
      hasItemFunction, hasStepFunction, hasWorkElementFunction,
      hasEffects, hasFailureMode, hasCause,
      hasSev, hasPrev, hasOcc, hasDetControls, hasDet,
    ];

    requiredCount = vdaBaseFields.length;
    filledCount = vdaBaseFields.filter(Boolean).length;

    // Paso 6: Optimización si Alto Riesgo (AP = 'H' o S >= 9)
    if (isHighRisk) {
      requiredCount += 2;

      const hasActions = Boolean(
        row.optimization_prevention_action?.trim() ||
        row.optimization_detection_action?.trim()
      );
      if (!hasActions) missing.push('P6: Acción de Optimización');
      else filledCount++;

      if (!hasRespAndDate) {
        if (!hasResponsible) missing.push('P6: Responsable Asignado');
        if (!hasTargetDate) missing.push('P6: Fecha Objetivo');
      } else {
        filledCount++;
      }
    }
  }

  // SC / CC Critical Characteristics check
  const hasScCc = (
    row.special_characteristics === 'SC' ||
    row.special_characteristics === 'CC' ||
    (typeof row.severity === 'number' && row.severity >= 9)
  );

  return {
    rowId: row.id,
    requiredCount,
    filledCount,
    isComplete: filledCount === requiredCount,
    hasScCc,
    isHighRisk,
    missingFields: missing,
  };
}

/**
 * Hook to validate and calculate completeness and SC/CC metrics across operations and the global PFMEA
 */
export function usePFMEAValidation(
  rows: WorksheetRow[],
  flowchartSteps: FlowchartStepRead[],
  layout: PFMEALayoutType = 'AIAG_APG'
): GlobalValidationResult {
  return useMemo(() => {
    // Sort flowchart steps by step_number ascending
    const sortedSteps = [...flowchartSteps].sort((a, b) => (a.step_number || 0) - (b.step_number || 0));

    // Map each step to an operation result
    const operations: OperationValidationResult[] = [];
    const processedRowIds = new Set<number>();

    // 1. Process DF steps first
    sortedSteps.forEach((step) => {
      const stepNumber = step.step_number;
      const opTitle = `[OP ${stepNumber}] ${step.technology?.name || step.custom_description || step.responsible_department || 'Operación'}`;
      const opKey = `step-${step.id}-${stepNumber}`;

      // Find matching rows
      const matchingRows = rows.filter((r) => {
        if (r.flowchart_step_id === step.id) return true;
        if (r.station_operation) {
          const norm = r.station_operation.trim().toLowerCase();
          const targetPrefix = `[op ${stepNumber}]`.toLowerCase();
          const techName = (step.technology?.name || '').trim().toLowerCase();
          return norm.startsWith(targetPrefix) || norm === opTitle.toLowerCase() || (techName && norm === techName);
        }
        return false;
      });

      matchingRows.forEach((r) => processedRowIds.add(r.id));

      const rowValidations = matchingRows.map((r) => validateRow(r, layout));
      const totalRows = matchingRows.length;
      const completedRows = rowValidations.filter((v) => v.isComplete).length;
      const totalRequiredFields = rowValidations.reduce((sum, v) => sum + v.requiredCount, 0);
      const totalFilledFields = rowValidations.reduce((sum, v) => sum + v.filledCount, 0);

      // If 0 rows, completion is 0%
      const percentage = totalRequiredFields > 0
        ? Math.round((totalFilledFields / totalRequiredFields) * 100)
        : 0;

      // SC/CC is only required if the operation was marked as critical (SC or CC) in the Flowchart
      const requiresScCc = step.critical_flag === 'SC' || step.critical_flag === 'CC';
      const hasRowScCc = rowValidations.some((v) => v.hasScCc);
      // Operation has SC/CC identified if at least one row in the PFMEA has an SC/CC assigned
      const hasScCc = hasRowScCc;

      operations.push({
        opKey,
        stepNumber,
        opTitle,
        step,
        rows: matchingRows,
        totalRows,
        completedRows,
        totalRequiredFields,
        totalFilledFields,
        percentage,
        requiresScCc,
        hasScCc,
        isComplete: totalRows > 0 && percentage === 100,
      });
    });

    // 2. Capture any remaining rows not linked to a DF step
    const remainingRows = rows.filter((r) => !processedRowIds.has(r.id));
    if (remainingRows.length > 0) {
      // Group by station_operation
      const groups = new Map<string, WorksheetRow[]>();
      remainingRows.forEach((r) => {
        const opName = r.station_operation || 'Sin Operación Asignada';
        if (!groups.has(opName)) groups.set(opName, []);
        groups.get(opName)!.push(r);
      });

      groups.forEach((opRows, opName) => {
        const rowValidations = opRows.map((r) => validateRow(r, layout));
        const totalRows = opRows.length;
        const completedRows = rowValidations.filter((v) => v.isComplete).length;
        const totalRequiredFields = rowValidations.reduce((sum, v) => sum + v.requiredCount, 0);
        const totalFilledFields = rowValidations.reduce((sum, v) => sum + v.filledCount, 0);
        const percentage = totalRequiredFields > 0
          ? Math.round((totalFilledFields / totalRequiredFields) * 100)
          : 0;
        const hasScCc = rowValidations.some((v) => v.hasScCc);

        operations.push({
          opKey: `custom-${opName}`,
          opTitle: opName,
          rows: opRows,
          totalRows,
          completedRows,
          totalRequiredFields,
          totalFilledFields,
          percentage,
          requiresScCc: false,
          hasScCc,
          isComplete: totalRows > 0 && percentage === 100,
        });
      });
    }

    // 3. Calculate Global Metrics
    const totalOperations = operations.length;
    const totalRows = rows.length;
    const completedRows = operations.reduce((sum, op) => sum + op.completedRows, 0);
    const incompleteOperations = operations.filter((op) => !op.isComplete).length;
    // Only block release if an operation was marked critical in the Flowchart but is missing SC/CC in the PFMEA
    const operationsWithoutScCc = operations.filter((op) => op.requiresScCc && !op.hasScCc).length;

    const globalTotalRequired = operations.reduce((sum, op) => sum + (op.totalRequiredFields || 8), 0);
    const globalTotalFilled = operations.reduce((sum, op) => sum + op.totalFilledFields, 0);
    const globalPercentage = globalTotalRequired > 0
      ? Math.round((globalTotalFilled / globalTotalRequired) * 100)
      : 0;

    const canRelease = totalOperations > 0 && incompleteOperations === 0 && operationsWithoutScCc === 0 && globalPercentage === 100;

    let releaseBlockReason = '';
    if (!canRelease) {
      const issues: string[] = [];
      if (incompleteOperations > 0) {
        issues.push(`${incompleteOperations} ${incompleteOperations === 1 ? 'operación incompleta' : 'operaciones incompletas'}`);
      }
      if (operationsWithoutScCc > 0) {
        issues.push(`${operationsWithoutScCc} ${operationsWithoutScCc === 1 ? 'operación crítica del diagrama de flujo sin característica (SC/CC) asignada' : 'operaciones críticas del diagrama de flujo sin característica (SC/CC) asignada'}`);
      }
      releaseBlockReason = `No es posible liberar el documento: Existen ${issues.join(' y ')}.`;
    }

    return {
      totalOperations,
      totalRows,
      completedRows,
      incompleteOperations,
      operationsWithoutScCc,
      globalPercentage,
      canRelease,
      releaseBlockReason,
      operations,
    };
  }, [rows, flowchartSteps, layout]);
}
