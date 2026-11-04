import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { createInstance } from 'i18next';
import { Pagination } from '../components/ui/Pagination';
import { MultiSelectFilter } from '../components/ui/MultiSelectFilter';
import { workspaceCopy } from '../i18n/workspace';
import { loadCatalog } from '../utils/loadCatalog';
const i18n = createInstance();
void i18n.init({ lng: 'es', resources: { es: { workspace: workspaceCopy.es } }, initAsync: false });
afterEach(cleanup);

describe('catalog navigation', () => {
  it('loads beyond the API page limit and stops on a partial page', async () => {
    const records = Array.from({ length: 205 }, (_, id) => ({ id }));
    const fetchPage = vi.fn(async (skip: number, limit: number) => records.slice(skip, skip + limit));
    expect(await loadCatalog(fetchPage)).toEqual(records);
    expect(fetchPage.mock.calls).toEqual([[0, 200], [200, 200]]);
  });
  it('does not request another page after cancellation', async () => {
    let cancelled = false;
    const fetchPage = vi.fn(async () => { cancelled = true; return Array(200).fill(1); });
    await loadCatalog(fetchPage, () => cancelled);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });
  it('surfaces an API failure instead of returning an incomplete successful catalog', async () => {
    const fetchPage = vi.fn().mockResolvedValueOnce(Array(200).fill(1)).mockRejectedValueOnce(new Error('offline'));
    await expect(loadCatalog(fetchPage)).rejects.toThrow('offline');
  });
  it('resets the page when changing page size and keeps the control on a single page', () => {
    const onPageChange = vi.fn(), onItemsPerPageChange = vi.fn();
    render(<I18nextProvider i18n={i18n}><Pagination currentPage={2} totalItems={30} itemsPerPage={12}
      onPageChange={onPageChange} onItemsPerPageChange={onItemsPerPageChange} /></I18nextProvider>);
    fireEvent.change(screen.getByLabelText('Resultados por página'), { target: { value: '48' } });
    expect(onItemsPerPageChange).toHaveBeenCalledWith(48);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
  it('exposes checked state and restores filter trigger focus on Escape', async () => {
    const onChange = vi.fn();
    render(<I18nextProvider i18n={i18n}><MultiSelectFilter label="Cliente" options={[{ value: 'Audi', label: 'Audi' }]}
      selectedValues={[]} onChange={onChange} /></I18nextProvider>);
    const trigger = screen.getByRole('button', { name: 'Cliente' });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Audi' }));
    expect(onChange).toHaveBeenCalledWith(['Audi']);
    fireEvent.keyDown(screen.getByRole('checkbox'), { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(screen.queryByRole('checkbox')).toBeNull());
    expect(trigger).toHaveFocus();
  });
});
