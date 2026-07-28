/**
 * Formats a date string to a unified standard format for the application.
 * Used for project cards, tables, etc.
 * 
 * @param iso ISO date string
 * @returns Formatted string (e.g. "15 jul 2026, 2:51 p.m.") or "-" if invalid/missing
 */
export function formatDate(iso?: string | null): string {
  if (!iso) return '-';
  try {
    const date = new Date(iso);
    // Check if the date is valid
    if (isNaN(date.getTime())) return '-';
    
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return '-';
  }
}
