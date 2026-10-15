import type {FlowchartStep} from '../types/flowchart.types';
export interface MasterGroup {
  master: FlowchartStep;
  subSteps: FlowchartStep[];
}

export function groupStepsByMaster(steps: FlowchartStep[]): MasterGroup[] {
  const groups: MasterGroup[] = [];
  let currentGroup: MasterGroup | null = null;

  for (const step of steps) {
    if (!step.subStep || step.subStep === 0) {
      currentGroup = {
        master: { ...step, subStep: 0 },
        subSteps: [],
      };
      groups.push(currentGroup);
    } else {
      if (!currentGroup) {
        // Fallback: If an orphaned sub-step appears first, promote it to master
        currentGroup = {
          master: { ...step, subStep: 0 },
          subSteps: [],
        };
        groups.push(currentGroup);
      } else {
        currentGroup.subSteps.push(step);
      }
    }
  }

  return groups;
}

export function recalculateSequences(steps: FlowchartStep[]): FlowchartStep[] {
  let currentMasterSeq = 0;
  let currentSubStep = 0;
  return steps.map((step) => {
    if (!step.subStep || step.subStep === 0) {
      currentMasterSeq += 10;
      currentSubStep = 0;
      return {
        ...step,
        sequence: currentMasterSeq,
        subStep: 0,
      };
    } else {
      currentSubStep += 1;
      return {
        ...step,
        sequence: currentMasterSeq || 10,
        subStep: currentSubStep,
      };
    }
  });
}

export function flattenMasterGroups(groups: MasterGroup[]): FlowchartStep[] {
  const flat: FlowchartStep[] = [];
  for (const g of groups) {
    flat.push(g.master);
    for (const sub of g.subSteps) {
      flat.push(sub);
    }
  }
  return recalculateSequences(flat);
}
