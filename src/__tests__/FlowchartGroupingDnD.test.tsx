import { describe, it, expect } from 'vitest';
import {
  groupStepsByMaster,
  flattenMasterGroups,
  recalculateSequences,
} from '../context/flowchartGroups';
import type { FlowchartStep } from '../types/flowchart.types';

const createMockStep = (
  id: string,
  seq: number,
  subStep: number = 0,
  opName: string = `Op ${seq}`
): FlowchartStep => ({
  id,
  sequence: seq,
  subStep,
  operationId: `op-${id}`,
  operationName: opName,
  machineryId: null,
  description: '',
  criticalFlag: 'none',
  symbolType: 'operation',
  responsibleDepartment: 'Producción',
  productCharacteristics: '',
  processCharacteristics: '',
  target: '',
});

describe('Flowchart Grouping & DnD Logic', () => {
  it('correctly groups master steps and their derived sub-steps', () => {
    const steps: FlowchartStep[] = [
      createMockStep('m1', 10, 0),
      createMockStep('s1-1', 10, 1),
      createMockStep('s1-2', 10, 2),
      createMockStep('m2', 20, 0),
      createMockStep('s2-1', 20, 1),
      createMockStep('m3', 30, 0),
    ];

    const groups = groupStepsByMaster(steps);
    expect(groups).toHaveLength(3);

    expect(groups[0].master.id).toBe('m1');
    expect(groups[0].subSteps).toHaveLength(2);
    expect(groups[0].subSteps[0].id).toBe('s1-1');
    expect(groups[0].subSteps[1].id).toBe('s1-2');

    expect(groups[1].master.id).toBe('m2');
    expect(groups[1].subSteps).toHaveLength(1);
    expect(groups[1].subSteps[0].id).toBe('s2-1');

    expect(groups[2].master.id).toBe('m3');
    expect(groups[2].subSteps).toHaveLength(0);
  });

  it('reorders master operations as whole groups', () => {
    const steps: FlowchartStep[] = [
      createMockStep('m1', 10, 0),
      createMockStep('s1-1', 10, 1),
      createMockStep('s1-2', 10, 2),
      createMockStep('m2', 20, 0),
      createMockStep('s2-1', 20, 1),
      createMockStep('m3', 30, 0),
    ];

    const groups = groupStepsByMaster(steps);
    // Move group 0 (m1 + s1-1 + s1-2) after group 1 (m2 + s2-1)
    const [movedGroup] = groups.splice(0, 1);
    groups.splice(1, 0, movedGroup);

    const reordered = flattenMasterGroups(groups);

    // New order should be m2, s2-1, m1, s1-1, s1-2, m3
    expect(reordered.map((s) => s.id)).toEqual(['m2', 's2-1', 'm1', 's1-1', 's1-2', 'm3']);

    // Sequences should be automatically updated:
    // m2 -> 10, s2-1 -> 10.1
    // m1 -> 20, s1-1 -> 20.1, s1-2 -> 20.2
    // m3 -> 30
    expect(reordered[0]).toMatchObject({ id: 'm2', sequence: 10, subStep: 0 });
    expect(reordered[1]).toMatchObject({ id: 's2-1', sequence: 10, subStep: 1 });
    expect(reordered[2]).toMatchObject({ id: 'm1', sequence: 20, subStep: 0 });
    expect(reordered[3]).toMatchObject({ id: 's1-1', sequence: 20, subStep: 1 });
    expect(reordered[4]).toMatchObject({ id: 's1-2', sequence: 20, subStep: 2 });
    expect(reordered[5]).toMatchObject({ id: 'm3', sequence: 30, subStep: 0 });
  });

  it('reorders intermediate sub-steps among themselves without leaving the parent master operation', () => {
    const steps: FlowchartStep[] = [
      createMockStep('m1', 10, 0),
      createMockStep('s1-1', 10, 1, 'Sub 1'),
      createMockStep('s1-2', 10, 2, 'Sub 2'),
      createMockStep('s1-3', 10, 3, 'Sub 3'),
      createMockStep('m2', 20, 0),
    ];

    const groups = groupStepsByMaster(steps);
    const parentGroup = groups[0];

    // Swap sub-step 2 ('s1-3') with sub-step 0 ('s1-1')
    const [movedSub] = parentGroup.subSteps.splice(2, 1);
    parentGroup.subSteps.splice(0, 0, movedSub);

    const reordered = flattenMasterGroups(groups);

    expect(reordered.map((s) => s.id)).toEqual(['m1', 's1-3', 's1-1', 's1-2', 'm2']);
    expect(reordered[1]).toMatchObject({ id: 's1-3', sequence: 10, subStep: 1 });
    expect(reordered[2]).toMatchObject({ id: 's1-1', sequence: 10, subStep: 2 });
    expect(reordered[3]).toMatchObject({ id: 's1-2', sequence: 10, subStep: 3 });
  });

  it('recalculateSequences guarantees master sequence increments by 10 and sub-steps index properly', () => {
    const steps: FlowchartStep[] = [
      createMockStep('m1', 0, 0),
      createMockStep('s1-1', 0, 1),
      createMockStep('m2', 0, 0),
      createMockStep('m3', 0, 0),
      createMockStep('s3-1', 0, 1),
      createMockStep('s3-2', 0, 2),
    ];

    const sequenced = recalculateSequences(steps);
    expect(sequenced.map((s) => `${s.sequence}${s.subStep > 0 ? `.${s.subStep}` : ''}`)).toEqual([
      '10',
      '10.1',
      '20',
      '30',
      '30.1',
      '30.2',
    ]);
  });

  it('validates that master operation with @ requires at least one child with CC/SC', () => {
    const steps: FlowchartStep[] = [
      { ...createMockStep('m1', 10, 0), criticalFlag: '@' },
      { ...createMockStep('s1-1', 10, 1), criticalFlag: 'none' },
      { ...createMockStep('s1-2', 10, 2), criticalFlag: 'none' },
    ];

    // Check if master needs critical characteristic assigned in sub-steps
    const invalidMasters = steps.filter((master) => {
      const isMaster = !master.subStep || master.subStep === 0;
      if (!isMaster) return false;
      const hasSubSteps = steps.some((s) => s.sequence === master.sequence && s.subStep > 0);
      if (!hasSubSteps) return false;
      const isFlaggedAt = master.criticalFlag === '@' || master.criticalFlag === 'CC' || master.criticalFlag === 'SC';
      if (!isFlaggedAt) return false;
      const hasSubCritical = steps.some(
        (s) => s.sequence === master.sequence && s.subStep > 0 && (s.criticalFlag === 'CC' || s.criticalFlag === 'SC')
      );
      return !hasSubCritical;
    });

    expect(invalidMasters).toHaveLength(1);
    expect(invalidMasters[0].id).toBe('m1');

    // Once a sub-step is assigned CC, the master is valid
    steps[1].criticalFlag = 'CC';
    const invalidAfter = steps.filter((master) => {
      const isMaster = !master.subStep || master.subStep === 0;
      if (!isMaster) return false;
      const hasSubSteps = steps.some((s) => s.sequence === master.sequence && s.subStep > 0);
      if (!hasSubSteps) return false;
      const isFlaggedAt = master.criticalFlag === '@' || master.criticalFlag === 'CC' || master.criticalFlag === 'SC';
      if (!isFlaggedAt) return false;
      const hasSubCritical = steps.some(
        (s) => s.sequence === master.sequence && s.subStep > 0 && (s.criticalFlag === 'CC' || s.criticalFlag === 'SC')
      );
      return !hasSubCritical;
    });

    expect(invalidAfter).toHaveLength(0);
  });
});
