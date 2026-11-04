import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { usePFMEAValidation } from '../hooks/usePFMEAValidation';
import {
  groupFlowchartStepsByMaster,
  syncRowsFromFlowchartSteps,
} from '../utils/pfmeaRowSync';
import { PFMEAOperationBanner } from '../components/pfmea/PFMEAOperationBanner';
import type { FlowchartStepRead } from '../services/flowchartService';

const createStep = (
  id: number,
  step_number: number,
  sub_step: number,
  name: string,
  opts: Partial<FlowchartStepRead> = {}
): FlowchartStepRead => ({
  id,
  flowchart_id: 1,
  technology_id: id * 10,
  machinery_id: null,
  step_number,
  sub_step,
  custom_description: sub_step > 0 ? `Sub-op: ${name}` : name,
  responsible_department: 'Production',
  symbol_type: 'operation',
  critical_flag: 'none',
  product_characteristics: null,
  process_characteristics: null,
  target: null,
  technology: { id: id * 10, name },
  ...opts,
});

const referenceFlowchartSteps: FlowchartStepRead[] = [
  createStep(100, 10, 0, 'Receiving Inspection', {
    symbol_type: 'inspection',
    responsible_department: 'Logistics',
    product_characteristics: 'Certificado de calidad de lote',
    target: '100% conforme a especificación',
  }),
  createStep(101, 10, 1, 'Receiving Inspection', {
    product_characteristics: 'Espesor de rollo',
    target: '3.5 ± 0.2 mm',
  }),
  createStep(102, 10, 2, 'Receiving Inspection', {
    product_characteristics: 'Densidad superficial',
    target: '650 g/m²',
  }),
  createStep(200, 20, 0, 'Staging of raw materials', {
    symbol_type: 'storage',
    responsible_department: 'Logistics',
    product_characteristics: 'Condición de empaque',
    target: 'Sin humedad ni roturas',
  }),
  createStep(300, 30, 0, 'Molding', {
    critical_flag: 'CC',
    product_characteristics: 'Conformado general de alfombra',
    target: 'Sin pliegues ni deformaciones',
  }),
  createStep(301, 30, 1, 'Molding', {
    product_characteristics: 'Temperatura de precalentamiento',
    target: '185 ± 5 °C',
  }),
  createStep(302, 30, 2, 'Molding', {
    critical_flag: 'CC',
    product_characteristics: 'Geometría de cavidad crítica',
    target: '2.0 ± 0.1 mm',
  }),
  createStep(303, 30, 3, 'Molding', {
    product_characteristics: 'Tiempo de ciclo de prensado',
    target: '45 ± 2 s',
  }),
  createStep(400, 40, 0, 'Die Cutting', {
    product_characteristics: 'Perímetro de corte limpio',
    target: 'Rebaba máx 0.5 mm',
  }),
];

describe('PFMEA Master Operation Grouping & Independent Fields from Flowchart', () => {
  it('groups 9 flowchart steps (4 masters + 5 sub-ops) into strictly 4 master groups', () => {
    const groups = groupFlowchartStepsByMaster(referenceFlowchartSteps);
    expect(groups).toHaveLength(4);
    expect(groups.map((g) => g.stepNumber)).toEqual([10, 20, 30, 40]);

    expect(groups[0].subSteps).toHaveLength(2);
    expect(groups[1].subSteps).toHaveLength(0);
    expect(groups[2].subSteps).toHaveLength(3);
    expect(groups[3].subSteps).toHaveLength(0);
  });

  it('generates rows for master and sub-operations with independent text fields (does not clone Flowchart characteristics or target)', () => {
    const rows = syncRowsFromFlowchartSteps(referenceFlowchartSteps, 77, 'PN-9000', []);

    // OP 10 (1 master + 2 sub-ops = 3) + OP 20 (1 master) + OP 30 (1 master + 3 sub-ops = 4) + OP 40 (1 master) = 9 rows
    expect(rows).toHaveLength(9);

    // Check OP 10 rows (master 10 + sub-ops 10.1 & 10.2)
    const op10Rows = rows.filter((r) => r.station_operation === '[OP 10] Receiving Inspection');
    expect(op10Rows).toHaveLength(3);
    expect(op10Rows.map((r) => r.flowchart_step_id)).toEqual([100, 101, 102]);

    // Text fields must be independent (empty on creation, not cloned from Flowchart)
    for (const row of rows) {
      expect(row.function_process_step).toBe('');
      expect(row.product_characteristic).toBe('');
      expect(row.process_characteristic).toBe('');
      expect(row.special_characteristics).toBe('');
    }
  });

  it('preserves user-entered PFMEA text fields independently when syncing with Flowchart', () => {
    const initialRows = syncRowsFromFlowchartSteps(referenceFlowchartSteps, 77, 'PN-9000', []);
    initialRows[1] = {
      ...initialRows[1],
      function_process_step: 'Requisito propio del PFMEA',
      product_characteristic: 'Característica PFMEA independiente',
      process_characteristic: 'Parámetro PFMEA independiente',
      special_characteristics: 'SC',
    };

    const resynced = syncRowsFromFlowchartSteps(
      referenceFlowchartSteps,
      77,
      'PN-9000',
      initialRows
    );

    expect(resynced[1].function_process_step).toBe('Requisito propio del PFMEA');
    expect(resynced[1].product_characteristic).toBe('Característica PFMEA independiente');
    expect(resynced[1].process_characteristic).toBe('Parámetro PFMEA independiente');
    expect(resynced[1].special_characteristics).toBe('SC');
  });

  it('generates only 4 operation sections in usePFMEAValidation and links both master and sub-operation rows under their master operation', () => {
    const rows = syncRowsFromFlowchartSteps(referenceFlowchartSteps, 77, 'PN-9000', []);
    const { result } = renderHook(() =>
      usePFMEAValidation(rows, referenceFlowchartSteps, 'AIAG_APG')
    );

    expect(result.current.operations).toHaveLength(4);
    expect(result.current.operations.map((op) => op.stepNumber)).toEqual([10, 20, 30, 40]);

    // OP 10 has 3 rows (10, 10.1, 10.2)
    expect(result.current.operations[0].totalRows).toBe(3);
    // OP 20 has 1 row (20)
    expect(result.current.operations[1].totalRows).toBe(1);
    // OP 30 has 4 rows (30, 30.1, 30.2, 30.3)
    expect(result.current.operations[2].totalRows).toBe(4);
    // OP 40 has 1 row (40)
    expect(result.current.operations[3].totalRows).toBe(1);
  });

  it('renders PFMEAOperationBanner without duplicating [OP 10] prefix in the title', () => {
    const rows = syncRowsFromFlowchartSteps(referenceFlowchartSteps, 77, 'PN-9000', []);
    const { result } = renderHook(() =>
      usePFMEAValidation(rows, referenceFlowchartSteps, 'AIAG_APG')
    );

    render(
      <PFMEAOperationBanner
        operation={result.current.operations[0]}
        isCollapsed={true}
        onToggleCollapse={() => {}}
        onAddRow={() => {}}
        isTableRow={false}
      />
    );

    expect(screen.getByText('OP 10')).toBeTruthy();
    expect(screen.getByText('Receiving Inspection')).toBeTruthy();
    expect(screen.queryByText('[OP 10] Receiving Inspection')).toBeNull();
  });
});
