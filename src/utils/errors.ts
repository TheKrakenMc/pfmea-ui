import { isAxiosError } from 'axios';
export function getErrorMessage(error: unknown, fallback = ''): string {
  if (isAxiosError<{ detail?: unknown; message?: unknown }>(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
  }
  return fallback;
}
