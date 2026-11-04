import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { controlPlanService, type ControlPlan } from '../api/controlPlanService';
import { ControlPlanPage } from '../pages/control-plan/ControlPlanPage';

vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ user: {id: '1', plant_id: 1, role_name: 'PFMEA Owner'} }) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, fallback?: string) => typeof fallback === 'string' ? fallback : key }) }));
vi.mock('sonner', () => ({ toast: {success: vi.fn(), error: vi.fn()} }));
vi.mock('../services/plantService', () => ({listPlants: async () => []}));
vi.mock('../services/measurementUnits', () => ({getMeasurementUnits: async () => []}));
vi.mock('../api/userService', () => ({userService: {lookup: async () => []}}));
vi.mock('../api/pfmeaService', () => ({pfmeaService: {
  listAnalyses: async () => [{id: 1, owner_id: 1, project_name: 'Project', customer: 'Customer', moc_status: 'Approved', team_members: []}],
  getAnalysis: async () => ({worksheet_rows: []}),
}}));
vi.mock('../components/control-plan/TraceabilityMatrix', () => ({TraceabilityMatrix: () => null}));
vi.mock('../api/controlPlanService', async importOriginal => {
  const original = await importOriginal<typeof import('../api/controlPlanService')>();
  return {...original, controlPlanService: {list: vi.fn(), getById: vi.fn(), revisions: vi.fn(), reopen: vi.fn(),
    createControlPlan: vi.fn(), transition: vi.fn(), updateItem: vi.fn(), syncFromPfmea: vi.fn()}};
});

const production: ControlPlan = {id: 2, pfmea_project_id: 1, flowchart_id: 1, title: 'Production Plan',
  control_plan_code: 'CP-PR', phase: 'Production', root_plan_id: 2, version: 1, lock_version: 7,
  owner_id: 1, status: 'Approved', needs_review: false, created_at: '', updated_at: '', start_date: '',
  items: [{id: 20, control_plan_id: 2, item_name: 'Manual control', item_sequence: 10, needs_review: false,
    characteristic: 'Original characteristic', sample_size_text: '100%'}]};
const draft: ControlPlan = {...production, id: 3, title: 'Production revision', control_plan_code: 'CP-PR-R2',
  version: 2, lock_version: 1, previous_revision_id: 2, status: 'Draft',
  items: [{...production.items[0], id: 30, control_plan_id: 3}]};
const prototype: ControlPlan = {...production, id: 1, title: 'Prototype Plan', phase: 'Prototype', root_plan_id: 1, items: []};

function mount() {
  vi.mocked(controlPlanService.list).mockResolvedValue({items: [prototype, draft], total: 2});
  vi.mocked(controlPlanService.getById).mockImplementation(async id => id === 2 ? production : id === 1 ? prototype : draft);
  vi.mocked(controlPlanService.revisions).mockResolvedValue([draft, production]);
  render(<QueryClientProvider client={new QueryClient({defaultOptions: {queries: {retry: false}}})}>
    <MemoryRouter><ControlPlanPage /></MemoryRouter>
  </QueryClientProvider>);
}

afterEach(() => {cleanup(); vi.clearAllMocks(); vi.restoreAllMocks();});

describe('Control Plan revision selection', () => {
  it('opens the exact plan in a project with multiple phases and protects unsaved controls when switching revision', async () => {
    mount();
    fireEvent.click(await screen.findByText('Production revision'));
    await waitFor(() => expect(controlPlanService.getById).toHaveBeenCalledWith(3));
    expect(await screen.findByLabelText('Revisión documental')).toHaveValue('3');
    fireEvent.change(screen.getByLabelText('Característica'), {target: {value: 'Unsaved change'}});
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    fireEvent.change(screen.getByLabelText('Revisión documental'), {target: {value: '2'}});
    expect(confirm).toHaveBeenCalledOnce();
    expect(screen.getByLabelText('Característica')).toHaveValue('Unsaved change');
    expect(controlPlanService.getById).not.toHaveBeenCalledWith(2);
    confirm.mockReturnValue(true);
    fireEvent.change(screen.getByLabelText('Revisión documental'), {target: {value: '2'}});
    await waitFor(() => expect(controlPlanService.getById).toHaveBeenCalledWith(2));
    expect(await screen.findByLabelText('Característica')).toBeDisabled();
    expect(screen.getByLabelText('Característica')).toHaveValue('Original characteristic');
    vi.spyOn(window, 'prompt').mockReturnValue('Engineering change');
    vi.mocked(controlPlanService.reopen).mockResolvedValue(draft);
    fireEvent.click(screen.getByRole('button', {name: 'Crear revisión editable'}));
    await waitFor(() => expect(controlPlanService.reopen).toHaveBeenCalledWith(2, 'Engineering change', 7));
    await waitFor(() => expect(screen.getByLabelText('Revisión documental')).toHaveValue('3'));
  });

  it('sends the selected phase when creating a plan', async () => {
    mount();
    const create = await screen.findByRole('button', {name: /Nuevo Plan/});
    fireEvent.click(create);
    fireEvent.change(await screen.findByLabelText(/Seleccionar PFMEA Liberado/), {target: {value: '1'}});
    fireEvent.change(screen.getByLabelText('Fase documental'), {target: {value: 'Pre-launch'}});
    vi.mocked(controlPlanService.createControlPlan).mockResolvedValue({...draft, phase: 'Pre-launch'});
    fireEvent.click(screen.getByRole('button', {name: 'Crear Plan de Control'}));
    await waitFor(() => expect(controlPlanService.createControlPlan).toHaveBeenCalledWith(1,
      expect.objectContaining({phase: 'Pre-launch', status: 'Draft'})));
  });
});
