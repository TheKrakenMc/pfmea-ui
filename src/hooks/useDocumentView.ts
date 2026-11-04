import { useState } from 'react';
type ViewMode = 'grid' | 'table';
const key = 'apg.document-view';
export function useDocumentView() {
  const [view, setView] = useState<ViewMode>(() => {
    try { return localStorage.getItem(key) === 'table' ? 'table' : 'grid'; } catch { return 'grid'; }
  });
  const changeView = (next: ViewMode) => {
    setView(next);
    try { localStorage.setItem(key, next); } catch { /* Browsing remains available without storage. */ }
  };
  return [view, changeView] as const;
}
