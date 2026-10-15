let csrfToken = '';
let selectedPlant: number | null = null;
export const revisions = new Map<string, number>();
export function setCsrfToken(token: string) { csrfToken = token; }
export function getCsrfToken() {
  return csrfToken || decodeURIComponent(document.cookie.split('; ').find(v => v.startsWith('csrf_token='))?.slice(11) || '');
}
export function setSelectedPlant(id: number | null) { selectedPlant = id; revisions.clear(); }
export function getSelectedPlant() { return selectedPlant; }
export function clearSessionState() { csrfToken = ''; selectedPlant = null; revisions.clear(); }
