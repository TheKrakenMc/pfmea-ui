import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ControlPlanItemEditor } from '../components/control-plan/ControlPlanItemEditor';
import { controlPlanService, type ControlPlanItem } from '../api/controlPlanService';

vi.mock('../api/controlPlanService', () => ({ controlPlanService: { updateItem: vi.fn().mockResolvedValue({}) } }));
vi.mock('../api/userService', () => ({ userService: { lookup: async () => [] } }));
vi.mock('../services/measurementUnits', () => ({ getMeasurementUnits: async () => [] }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

const item: ControlPlanItem = { id: 1, control_plan_id: 1, item_name: 'Inspection', item_sequence: 10,
  needs_review: false, sample_size: 5 };

function mount(readOnly = false) {
  const onSaved = vi.fn();
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <ControlPlanItemEditor item={item} version={7} readOnly={readOnly} canReview={false}
      allowedResponsibleIds={[]} onSaved={onSaved} />
  </QueryClientProvider>);
  return onSaved;
}

describe('Control Plan textual sampling editor', () => {
  it('shows legacy numeric sampling and saves a textual instruction with its document revision', async () => {
    const onSaved = mount();
    expect(screen.getByLabelText('Tamaño de muestra')).toHaveValue('5');
    fireEvent.change(screen.getByLabelText('Tamaño de muestra'), { target: { value: '100%' } });
    fireEvent.change(screen.getByLabelText('Método de control'), { target: { value: 'SPC + registro' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar control' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(controlPlanService.updateItem).toHaveBeenCalledWith(1,
      expect.objectContaining({ sample_size_text: '100%', control_method: 'SPC + registro' }), 7);
    const payload = vi.mocked(controlPlanService.updateItem).mock.calls[0][1];
    expect(payload).not.toHaveProperty('sample_size');
  });

  it('protects approved controls from editing both new fields', () => {
    mount(true);
    expect(screen.getByLabelText('Tamaño de muestra')).toBeDisabled();
    expect(screen.getByLabelText('Método de control')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Guardar control' })).toBeNull();
  });
});
