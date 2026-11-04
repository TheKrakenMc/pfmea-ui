import { Archive } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DocumentStatus } from '../ui/DocumentStatus';
import { formatDate } from '../../utils/dateUtils';
import type { PfmeaHeader } from '../../api/pfmeaService';
interface Props { pfmeas: PfmeaHeader[]; onEdit: (id: number) => void; onArchive?: (id: number) => void }
export function PFMEAProjectTable({ pfmeas, onEdit, onArchive }: Props) {
  const { t } = useTranslation('workspace');
  return <table className="workspace-table"><thead><tr>
    {['title', 'customer', 'part', 'status', 'updated', 'actions'].map(key => <th scope="col" key={key}>{t(key)}</th>)}
  </tr></thead><tbody>{pfmeas.map(project => {
    const status = project.moc_status || project.status;
    const archived = status?.toLowerCase() === 'archived';
    return <tr key={project.id}>
      <td>{archived ? project.project_name : <button className="workspace-table-title" onClick={() => onEdit(project.id)}>{project.project_name}</button>}</td>
      <td>{project.customer || '—'}</td><td>{project.part_number || '—'}</td><td><DocumentStatus status={status} /></td>
      <td>{formatDate(project.updated_at || project.created_at)}</td>
      <td>{!archived && onArchive && <button className="ui-icon-button" aria-label={`${t('archive')}: ${project.project_name}`} onClick={() => onArchive(project.id)}><Archive size={18} /></button>}</td>
    </tr>;
  })}</tbody></table>;
}
