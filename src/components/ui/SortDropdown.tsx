import { ArrowUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
export interface SortOption { value: string; label: string }
export function SortDropdown({ options, value, onChange }: {
  options: SortOption[]; value: string; onChange: (value: string) => void;
}) {
  const { t } = useTranslation('workspace');
  return <label className="workspace-sort"><ArrowUpDown size={16} aria-hidden="true" />
    <select className="ui-select" aria-label={t('sort')} value={value} onChange={event => onChange(event.target.value)}>
      {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </label>;
}
