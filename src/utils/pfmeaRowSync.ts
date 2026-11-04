import type { WorksheetRow } from '../api/pfmeaService';
import type { FlowchartStepRead } from '../services/flowchartService';
import { nextDraftRowId } from './draftRowId';

export interface FlowchartMasterGroup {
  stepNumber: number;
  master: FlowchartStepRead;
  subSteps: FlowchartStepRead[];
  allStepIds: Set<number>;
  opName: string;
  opTitle: string;
  requiresScCc: boolean;
}

/**
 * Helper kept for backwards compatibility; PFMEA text fields are independent
 * from Flowchart text fields.
 */
export function formatStepRequirements(_step?: FlowchartStepRead): string {
  return '';
}

/**
 * Groups flat FlowchartStepRead[] into Master Operations (sub_step === 0)
 * and their child Sub-Operations (sub_step > 0).
 */
export function groupFlowchartStepsByMaster(steps: FlowchartStepRead[]): FlowchartMasterGroup[] {
  const sorted = [...steps].sort((a, b) => {
    const stepDiff = (a.step_number || 0) - (b.step_number || 0);
    if (stepDiff !== 0) return stepDiff;
    return (a.sub_step || 0) - (b.sub_step || 0);
  });

  const groupsMap = new Map<number, { master?: FlowchartStepRead; subSteps: FlowchartStepRead[] }>();

  for (const step of sorted) {
    const stepNum = step.step_number || 0;
    if (!groupsMap.has(stepNum)) {
      groupsMap.set(stepNum, { subSteps: [] });
    }
    const entry = groupsMap.get(stepNum)!;
    if (!step.sub_step || step.sub_step === 0) {
      if (!entry.master) {
        entry.master = step;
      } else {
        entry.subSteps.push(step);
      }
    } else {
      entry.subSteps.push(step);
    }
  }

  const result: FlowchartMasterGroup[] = [];

  for (const [stepNumber, entry] of groupsMap.entries()) {
    const master = entry.master || entry.subSteps[0];
    if (!master) continue;

    const subSteps = entry.master ? entry.subSteps : entry.subSteps.slice(1);
    const allStepIds = new Set<number>([master.id, ...subSteps.map((s) => s.id)]);
    const opName =
      master.technology?.name?.trim() ||
      master.custom_description?.trim() ||
      master.responsible_department?.trim() ||
      'Operación';
    const opTitle = `[OP ${stepNumber}] ${opName}`;

    const isCritical = (flag?: string | null) => flag === 'SC' || flag === 'CC';
    const requiresScCc =
      isCritical(master.critical_flag) || subSteps.some((s) => isCritical(s.critical_flag));

    result.push({
      stepNumber,
      master,
      subSteps,
      allStepIds,
      opName,
      opTitle,
      requiresScCc,
    });
  }

  return result;
}

/**
 * Synchronizes PFMEA WorksheetRows structure from FlowchartStepRead[].
 * - Each Master Operation section contains a row for the master operation itself
 *   plus a row for each of its sub-operations.
 * - All text fields, columns, and values (Process Function / Requirements,
 *   Product/Process Characteristics, Special Characteristics, etc.) remain
 *   completely independent between the Flowchart and the PFMEA.
 */
export function syncRowsFromFlowchartSteps(
  flowchartSteps: FlowchartStepRead[],
  pfmeaId: number,
  partNumber: string,
  existingRows: WorksheetRow[] = []
): WorksheetRow[] {
  if (!flowchartSteps || flowchartSteps.length === 0) {
    return existingRows;
  }

  const masterGroups = groupFlowchartStepsByMaster(flowchartSteps);
  const resultRows: WorksheetRow[] = [...existingRows];
  const usedRowIds = new Set<number>();

  // Map existing rows by flowchart_step_id
  const rowsByStepId = new Map<number, WorksheetRow[]>();
  for (const row of existingRows) {
    if (row.flowchart_step_id) {
      const list = rowsByStepId.get(row.flowchart_step_id) || [];
      list.push(row);
      rowsByStepId.set(row.flowchart_step_id, list);
    }
  }

  const finalRows: WorksheetRow[] = [];
  let seqCounter = 10;

  for (const group of masterGroups) {
    const targetSteps = [group.master, ...group.subSteps];

    for (const step of targetSteps) {
      const existingForStep = rowsByStepId.get(step.id) || [];

      if (existingForStep.length > 0) {
        for (const existingRow of existingForStep) {
          usedRowIds.add(existingRow.id);
          finalRows.push({
            ...existingRow,
            process_item_name: existingRow.process_item_name?.trim() || partNumber || '',
            station_operation: group.opTitle,
            operation_type: existingRow.operation_type || step.symbol_type,
            sequence_order: seqCounter,
          });
          seqCounter += 10;
        }
      } else {
        const draftId = nextDraftRowId(resultRows);
        const newRow: WorksheetRow = {
          id: draftId,
          pfmea_id: pfmeaId,
          flowchart_step_id: step.id,
          process_item_name: partNumber || '',
          station_operation: group.opTitle,
          work_element_process: '',
          operation_type: step.symbol_type || group.master.symbol_type || 'operation',
          function_process_item_plant: '',
          function_process_item_customer: '',
          function_process_item_end_user: '',
          function_process_step: '',
          product_characteristic: '',
          function_work_element: '',
          process_characteristic: '',
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
          action_priority: undefined,
          special_characteristics: '',
          optimization_prevention_action: '',
          optimization_detection_action: '',
          responsible_person_id: undefined,
          target_completion_date: '',
          action_status: 'Open',
          sequence_order: seqCounter,
        };
        resultRows.push(newRow);
        finalRows.push(newRow);
        seqCounter += 10;
      }
    }
  }

  // Keep any remaining custom rows that weren't linked to a known step_id
  for (const row of existingRows) {
    if (!usedRowIds.has(row.id)) {
      finalRows.push({
        ...row,
        sequence_order: seqCounter,
      });
      seqCounter += 10;
    }
  }

  return finalRows;
}
