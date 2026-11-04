import { describe, expect, it, vi } from 'vitest';
import { autoTable } from 'jspdf-autotable';
import type { ControlPlan } from '../api/controlPlanService';
import { generateControlPlanPdf } from './controlPlanPdf';

vi.mock('jspdf-autotable', () => ({ autoTable: vi.fn() }));

describe('Control Plan PDF sampling contract', () => {
  it('exports textual sampling and control method while supporting numeric historical items', async () => {
    const plan: ControlPlan = { id: 1, title: 'Contract', control_plan_code: 'CP-1',
      pfmea_project_id: 1, flowchart_id: 1, owner_id: 1, version: 1, lock_version: 1,
      status: 'Draft', needs_review: false, start_date: '2026-10-29', created_at: '', updated_at: '',
      items: [
        { id: 1, control_plan_id: 1, item_sequence: 10, item_name: 'Text', needs_review: false,
          sample_size: 5, sample_size_text: '100%', control_method: 'SPC' },
        { id: 2, control_plan_id: 1, item_sequence: 20, item_name: 'Legacy', needs_review: false,
          sample_size: 3 },
      ] };
    const blob = await generateControlPlanPdf(plan, { plant: '', customer: '', part: '', responsible: {}, units: {} });
    expect(blob.type).toBe('application/pdf');
    const options = vi.mocked(autoTable).mock.calls[0][1];
    expect(options.head?.[0]).toContain('Metodo de control');
    expect(options.body?.[0]).toContain('100%');
    expect(options.body?.[0]).toContain('SPC');
    expect(options.body?.[0]).not.toContain('5');
    expect(options.body?.[1]).toContain('3');
  });
});
