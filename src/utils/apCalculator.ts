import table from '../data/actionPriority.json';
/** Provisional rules generated from Python; not independently certified against a handbook. */
export function calculateActionPriority(s?: number, o?: number, d?: number): 'H' | 'M' | 'L' | undefined {
  if (![s,o,d].every(v => Number.isInteger(v) && (v ?? 0) >= 1 && (v ?? 0) <= 10)) return undefined;
  return (table as Record<string, 'H' | 'M' | 'L'>)[[s,o,d].join(',')];
}
