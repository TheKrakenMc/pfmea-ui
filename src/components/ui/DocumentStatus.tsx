import { useTranslation } from 'react-i18next';

export function DocumentStatus({ status = 'Draft' }: { status?: string | null }) {
  const { t } = useTranslation('workspace');
  const normalized = (status || 'Draft').toLowerCase().replaceAll('_', ' ');
  const key = normalized.includes('review') ? 'review' : normalized;
  const tone = ['approved', 'released', 'active'].includes(key)
    ? 'success'
    : key === 'review'
      ? 'warning'
      : key === 'archived' || key === 'obsolete' || key === 'rejected'
        ? 'danger'
        : 'neutral';

  return (
    <span className="document-status" data-tone={tone}>
      <span className="document-status-dot" aria-hidden="true" />
      {t(key, { defaultValue: status || 'Draft' })}
    </span>
  );
}
