import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { WorksheetRow } from '../api/pfmeaService';
import { pfmeaService } from '../api/pfmeaService';
import { PFMEAEditorPage } from '../pages/pfmea/PFMEAEditorPage';
import { draftKey, loadDraft, saveDraft } from '../services/drafts';

vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({
  user: { id: '1', plant_id: 1, role_name: 'PFMEA Owner' },
}) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, fallback?: string) => fallback || key }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../api/pfmeaService', () => ({ pfmeaService: {
  getAnalysis: vi.fn(), getMyTasks: async () => [], getAuditLog: async () => [], saveDocument: vi.fn(),
} }));
vi.mock('../services/flowchartService', () => ({ getFlowchartById: vi.fn() }));
vi.mock('../components/pfmea/ActionConfirmationTray', () => ({ ActionConfirmationTray: () => null }));
vi.mock('../components/pfmea/PFMEAMasterHeader', () => ({ PFMEAMasterHeader: () => null }));
vi.mock('../components/pfmea/FormatSelectorToolbar', () => ({ FormatSelectorToolbar: () => null }));
vi.mock('../components/pfmea/CorporateWorksheetTable', () => ({
  CorporateWorksheetTable: ({ rows, onRowsChange, isReadOnly }: {
    rows: WorksheetRow[]; onRowsChange: (rows: WorksheetRow[]) => void; isReadOnly: boolean;
  }) => <div>{rows.map(row => <input key={row.id} aria-label="Failure" value={row.failure_mode || ''}
    disabled={isReadOnly} onChange={event => onRowsChange(rows.map(current =>
      current.id === row.id ? { ...current, failure_mode: event.target.value } : current))} />)}</div>,
}));

const header = {
  id: 77, project_name: 'Draft regression', part_number: 'TEST', pfmea_id_number: 'TEST-77',
  flowchart_id: 1, moc_status: 'Draft', owner_id: 1, lock_version: 7,
  team_members: [], worksheet_rows: [],
};
const flow = { id: 1, steps: [{ id: 100, step_number: 10, sub_step: 0,
  custom_description: 'Inspection', product_characteristics: 'Dimension', target: '10 mm' }] };
const key = draftKey('1', 1, 'pfmea', 77);

function mount(status = 'Draft') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  client.setQueryData(['pfmea', 77], { ...header, moc_status: status });
  client.setQueryData(['flowchart', 1], flow);
  render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/pfmea/77']}>
    <Routes><Route path="/pfmea/:id" element={<PFMEAEditorPage />} /></Routes>
  </MemoryRouter></QueryClientProvider>);
  return client;
}

afterEach(() => { cleanup(); localStorage.clear(); vi.clearAllMocks(); });

describe('PFMEA editor derived FLOW rows and drafts', () => {
  it('derives editable rows and keeps manual changes and their original revision across query refreshes', async () => {
    const client = mount();
    expect(screen.getByLabelText('Failure')).toHaveValue('');
    fireEvent.change(screen.getByLabelText('Failure'), { target: { value: 'Manual analysis' } });
    await act(async () => { client.setQueryData(['pfmea', 77], { ...header, lock_version: 8 }); });
    expect(screen.getByLabelText('Failure')).toHaveValue('Manual analysis');
    vi.mocked(pfmeaService.saveDocument).mockRejectedValueOnce(new Error('stale'));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Cambios' }));
    await waitFor(() => expect(pfmeaService.saveDocument).toHaveBeenCalledWith(77,
      expect.objectContaining({ expected_version: 7, rows: [expect.objectContaining({ failure_mode: 'Manual analysis' })] })));
    expect(screen.getByLabelText('Failure')).toHaveValue('Manual analysis');
  });

  it('does not overwrite an existing pending draft and restores it ahead of FLOW data', async () => {
    saveDraft(key, 3, { rows: [{ id: 9, pfmea_id: 77, failure_mode: 'Recovered analysis' }], header: null });
    mount();
    expect(screen.queryByLabelText('Failure')).toBeNull();
    // Wait past the real autosave debounce: pending drafts must remain untouched.
    await new Promise(resolve => setTimeout(resolve, 1100));
    expect(loadDraft(key)?.expectedVersion).toBe(3);
    fireEvent.click(screen.getByRole('button', { name: 'Recuperar' }));
    expect(screen.getByLabelText('Failure')).toHaveValue('Recovered analysis');
    vi.mocked(pfmeaService.saveDocument).mockRejectedValueOnce(new Error('stale'));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Cambios' }));
    await waitFor(() => expect(pfmeaService.saveDocument).toHaveBeenCalledWith(77,
      expect.objectContaining({ expected_version: 3 })));
  });

  it('never generates missing FLOW rows on an approved document', () => {
    mount('Approved');
    expect(screen.queryByLabelText('Failure')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Guardar Cambios' })).toBeNull();
    expect(localStorage.getItem(key)).toBeNull();
  });
});
