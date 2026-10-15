export interface Draft<T> { schema: 1; expectedVersion: number; savedAt: string; data: T }
export function draftKey(userId: string, plantId: number | null, kind: string, documentId: number) {
  return ['pfmea-draft', userId, plantId ?? 'none', kind, documentId].join(':');
}
export function saveDraft<T>(key: string, expectedVersion: number, data: T) {
  try { localStorage.setItem(key, JSON.stringify({ schema: 1, expectedVersion, savedAt: new Date().toISOString(), data })); return true; }
  catch { return false; }
}
export function loadDraft<T>(key: string): Draft<T> | null {
  try { const draft = JSON.parse(localStorage.getItem(key) || 'null') as Draft<T> | null;
    return draft?.schema === 1 && Number.isInteger(draft.expectedVersion) ? draft : null;
  } catch { return null; }
}
export function discardDraft(key: string) { localStorage.removeItem(key); }
