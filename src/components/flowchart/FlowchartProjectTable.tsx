import { Archive, History, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DocumentStatus } from '../ui/DocumentStatus';
import { formatDate } from '../../utils/dateUtils';
import type { FlowchartRead } from '../../services/flowchartService';
interface Props {
  flowcharts: FlowchartRead[];
  onEdit: (id: number) => void;
  onArchive?: (id: number) => void;
  onViewHistory?: (id: number) => void;
  onClone?: (project: FlowchartRead) => void;
}
export function FlowchartProjectTable({ flowcharts, onEdit, onArchive, onViewHistory, onClone }: Props) {
  const { t } = useTranslation('workspace');
  return <table className="workspace-table"><thead><tr>
    {['title', 'status', 'version', 'created', 'updated', 'actions'].map(key => <th scope="col" key={key}>{t(key)}</th>)}
  </tr></thead><tbody>{flowcharts.map(project => {
    const archived = project.status?.toLowerCase() === 'archived';
    return <tr key={project.id}>
      <td>{archived ? project.title : <button className="workspace-table-title" onClick={() => onEdit(project.id)}>{project.title}</button>}</td>
      <td><DocumentStatus status={project.status} /></td><td>v{project.version}</td>
      <td>{formatDate(project.created_at)}</td><td>{formatDate(project.updated_at)}</td>
      <td><div className="workspace-table-actions">
        {onClone && <button className="ui-icon-button" aria-label={`Clonar: ${project.title}`} title="Clonar / Copiar pasos" onClick={() => onClone(project)}><Copy size={18} /></button>}
        {onViewHistory && <button className="ui-icon-button" aria-label={`${t('history')}: ${project.title}`} onClick={() => onViewHistory(project.id)}><History size={18} /></button>}
        {!archived && onArchive && <button className="ui-icon-button" aria-label={`${t('archive')}: ${project.title}`} onClick={() => onArchive(project.id)}><Archive size={18} /></button>}
      </div></td>
    </tr>;
  })}</tbody></table>;
}
